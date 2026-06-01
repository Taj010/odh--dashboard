# E2E Cluster Preflight — Problem, Evidence, and Proposed Fix

> **TL;DR** — CI fails late (after 3–10 min of Cypress) with vague errors that are not test or product bugs. The fix is two small additions: extend the existing cluster health check by ~20 lines, and add a guard in `getDashboardConfig`. Together they make the job fail in **< 60 seconds** with a clear "cluster not ready" message instead of burying the real cause inside a Cypress `retryableBeforeEach` hook failure.

---

## Contents

1. [The Pattern](#1-the-pattern)
2. [Evidence — Failing Runs](#2-evidence--failing-runs)
3. [Root Cause](#3-root-cause)
4. [What Already Exists](#4-what-already-exists)
5. [Proposed Changes](#5-proposed-changes)
6. [How to Test a Draft PR](#6-how-to-test-a-draft-pr)
7. [What This Does Not Change](#7-what-this-does-not-change)
8. [Next Steps After This Lands](#8-next-steps-after-this-lands)

---

## 1. The Pattern

Recurring Cypress E2E failures in this repo share **one fingerprint**: they happen inside setup hooks, not inside test assertions, and the errors point to the **cluster** not being ready — not the dashboard code.

The two error classes seen most often:

| Error | Where it appears | What it means |
|---|---|---|
| `SyntaxError: Unexpected end of JSON input` | `retryableBeforeEach` in `testClusterStorageCreation`, `testAdminClusterSettings`, `testProjectCreation` | `oc get OdhDashboardConfig … \| jq` returned **empty stdout** — the CR is missing or the user has no access |
| `Error from server (NotFound): namespaces "…" not found` | `retryableBeforeEach` in almost every spec | `oc new-project` silently failed (user cannot create projects), then cleanup also fails because the project was never created |

Both errors cause **`retryableBefore` to throw**, which Cypress then reports as *"because this error occurred during a `before each` hook we are skipping the remaining tests"*, making it look like a Cypress or dashboard regression.

---

## 2. Evidence — Failing Runs

All runs below are against `main` on `opendatahub-io/odh-dashboard`.

### Jun 1, 2026 — worst so far: 6 of 7 specs failed

- **Run:** [26773206218](https://github.com/opendatahub-io/odh-dashboard/actions/runs/26773206218)
- **Job:** `e2e-tests (@ci-dashboard-regression-tags)`
- **Failed specs:** `testProjectCreation`, `pipelines`, `testClusterStorageCreation`, `testConnectionCreation`, `workbenches`, `testAdminClusterSettings`
- **Error pattern:**
  ```
  SyntaxError: Unexpected end of JSON input           ← getDashboardConfig on empty oc output
  Error from server (NotFound): namespaces "cypress-test-***" not found   ← oc new-project silently failed
  Error from server (NotFound): namespaces "test-pipelines-prj-***" not found
  retryableBeforeEach (failed) (attempt 3)
  ```
- **Note:** 1 spec passed (login). Login works; cluster operations do not. Classic "DSC looks Ready, but RBAC/state is broken."

### Jun 1, 2026 — AutoRAG

- **Run:** [26773377365](https://github.com/opendatahub-io/odh-dashboard/actions/runs/26773377365)
- **Job:** `e2e-tests (@AutoRAGCI)`
- **Failed specs:** `testAutoragOptimization` — `retryableBeforeEach (failed) (attempt 3)`

### May 26, 2026

- **Run:** [26462608303](https://github.com/opendatahub-io/odh-dashboard/actions/runs/26462608303)
- **Job:** `e2e-tests (@AgentOpsCI @AutoMLCI @AutoRAGCI @EvalHubCI @GenAICI @MLflowCI @MaaSCI @ModelRegistryCI)`
- **Failed specs:** `automl/testAutomlBinaryClassification`, `modelRegistry/testRegisterModel` — 2 of 2 (100%)
- `@ci-dashboard-regression-tags` passed in the same run → confirms it is not a code regression

### May 20, 2026

- **Run:** [26166986644](https://github.com/opendatahub-io/odh-dashboard/actions/runs/26166986644/job/76973948615)
- **Job:** `e2e-tests (@ci-dashboard-regression-tags)`
- **Failed specs:** `pipelines/pipelines.cy.ts` (setup `Forbidden`), `testClusterStorageCreation.cy.ts` (`SyntaxError: Unexpected end of JSON input`)
- **Key log lines:**
  ```
  Error from server (Forbidden): projects.project.openshift.io "test-pipelines-prj-95136" is forbidden
  SyntaxError: Unexpected end of JSON input
  2 of 7 failed (29%)
  ```

**Aggregate signal across these runs:** every failure happens in a setup hook; no failed run shows a real UI assertion error. The same feature specs pass in runs where the cluster is in a good state.

---

## 3. Root Cause

### 3a. The existing health check is not enough

The `select-cluster` job in `.github/workflows/cypress-e2e-test.yml` (lines 95–215) checks **DataScienceCluster phase only**:

```bash
# Current check — what it verifies
PHASE=$(oc get datasciencecluster -o json | jq -r '.items[0].status.phase')
# Returns "Ready" → cluster selected → Cypress starts
```

DSC `Ready` means the operator stack is up. It does **not** mean:
- `OdhDashboardConfig` CR exists and is parseable
- The test admin user can create namespaces
- Old test namespaces from a previous crashed run have been cleaned up

So the workflow says "cluster is healthy", then Cypress spends minutes failing in hooks.

### 3b. `getDashboardConfig` has no guard for empty stdout

`packages/cypress/cypress/utils/oc_commands/project.ts` lines 175–191:

```ts
export const getDashboardConfig = (key?: string): Cypress.Chainable<unknown> => {
  const command = `oc get OdhDashboardConfig -A -o json | jq '.items[].spec'`;

  return cy.exec(command).then((result) => {
    if (result.exitCode !== 0) {          // ← only checks exit code
      throw new Error(`Failed to get DashboardConfig: …`);
    }
    const config = JSON.parse(result.stdout) as DashboardConfig;  // ← THROWS when stdout is ""
```

When `OdhDashboardConfig` has no items, `jq '.items[].spec'` outputs nothing (`stdout = ""`), `exit code = 0`, so the `exitCode !== 0` guard is skipped and `JSON.parse("")` throws `SyntaxError: Unexpected end of JSON input`. That unhandled throw crashes the `retryableBefore` hook for every spec that calls `getDashboardConfig`.

---

## 4. What Already Exists

Understanding what is already in place helps scope the change correctly — we are **extending**, not replacing.

| What | Where | What it does |
|---|---|---|
| `select-cluster` job | `.github/workflows/cypress-e2e-test.yml` L95–215 | Logs into each cluster, reads DSC JSON, checks phase / conditions; fails the job early if both clusters are unhealthy. Has primary/secondary failover. |
| `getDashboardConfig()` | `packages/cypress/cypress/utils/oc_commands/project.ts` L175–191 | Runs `oc get OdhDashboardConfig -A -o json \| jq '.items[].spec'`; used by `testClusterStorageCreation` and others via `cy.getDashboardConfig()` |
| `retryableBefore` | `packages/cypress/cypress/utils/retryableHooks.ts` | Wraps `beforeEach` so setup re-runs on retry. When setup itself throws, Cypress skips the whole suite. |
| `@Bug` / `@Maintain` skip tags | `cypress-e2e-test.yml` L1282 (skipTags) | Known-broken tests are tagged `@Bug` or `@Maintain` and skipped. Infra failures are currently not tagged at all. |
| Cluster failover | `cypress-e2e-test.yml` L197–210 | If primary cluster fails DSC check, secondary is tried. The new preflight checks should live in the same `check_dsc_health` function so failover still works. |

---

## 5. Proposed Changes

Two small, independent changes. Each can be its own PR; they do not depend on each other.

---

### Change 1 — Extend `check_dsc_health` in the workflow (infra-side fix)

**File:** `.github/workflows/cypress-e2e-test.yml`

**Where:** inside the `check_dsc_health()` shell function, after the existing DSC phase check passes (after line ~194).

Add these two checks before `return 0`:

```bash
# --- NEW: Preflight check 1 — OdhDashboardConfig exists and has parseable spec ---
echo "  🔍 Checking OdhDashboardConfig..."
ODC_JSON=$(oc get OdhDashboardConfig -A -o json 2>&1)
ODC_COUNT=$(echo "$ODC_JSON" | jq '.items | length' 2>/dev/null || echo "0")
if [[ "$ODC_COUNT" == "0" || -z "$ODC_COUNT" ]]; then
  echo "  ❌ OdhDashboardConfig missing or empty on $cluster_name (got count=$ODC_COUNT)"
  echo "  📝 This would cause SyntaxError: Unexpected end of JSON input in test hooks"
  return 1
fi
ODC_SPEC=$(echo "$ODC_JSON" | jq -e '.items[0].spec' 2>/dev/null)
if [[ $? -ne 0 || -z "$ODC_SPEC" ]]; then
  echo "  ❌ OdhDashboardConfig .spec is empty or unreadable on $cluster_name"
  return 1
fi
echo "  ✅ OdhDashboardConfig is present and has a readable spec"

# --- NEW: Preflight check 2 — admin user can create projects ---
echo "  🔍 Checking test-user RBAC (create projects)..."
if ! oc auth can-i create projects --all-namespaces > /dev/null 2>&1; then
  echo "  ❌ Test user cannot create projects on $cluster_name"
  echo "  📝 This would cause Forbidden errors in test setup hooks"
  return 1
fi
echo "  ✅ Test user can create projects"
```

**Effect:** If either check fails, the cluster is marked unhealthy and the secondary is tried (existing failover). If both clusters fail, the job exits in < 60 seconds with a clear reason instead of running Cypress for 10 minutes.

---

### Change 2 — Guard empty stdout in `getDashboardConfig` (Cypress-side fix)

**File:** `packages/cypress/cypress/utils/oc_commands/project.ts`

**Where:** `getDashboardConfig`, line 183 (before `JSON.parse`).

Current code:
```ts
const config = JSON.parse(result.stdout) as DashboardConfig;
```

Replace with:
```ts
if (!result.stdout || result.stdout.trim() === '') {
  throw new Error(
    'Cluster preflight: OdhDashboardConfig returned empty output. ' +
    'The CR may be missing or the test user lacks read access. ' +
    `stderr: ${maskSensitiveInfo(result.stderr || '(none)')}`,
  );
}
const config = JSON.parse(result.stdout) as DashboardConfig;
```

**Effect:** Instead of `SyntaxError: Unexpected end of JSON input` (which looks like a code bug), the test hook now throws a message that clearly says "cluster config is missing" — actionable for both QE and platform when investigating a failed run. This change helps regardless of whether Change 1 is merged, because it also improves Jenkins run diagnostics.

---

## 6. How to Test a Draft PR

You do **not** need cluster access to open the PR. Testing works like this:

### Step 1 — Open a draft PR with the changes

```bash
git checkout -b e2e-cluster-preflight-checks
# make changes to .github/workflows/cypress-e2e-test.yml
# make changes to packages/cypress/cypress/utils/oc_commands/project.ts
git add .
git commit -m "ci: extend cluster preflight checks and improve getDashboardConfig error message"
gh pr create --draft --title "ci: add OdhDashboardConfig and RBAC preflight checks to E2E workflow"
```

### Step 2 — Trigger the workflow manually

The Cypress E2E workflow supports `workflow_dispatch` (manual trigger). Go to:

> **Actions → Cypress e2e Test → Run workflow**

Select your branch, leave `additional_tags` empty, click **Run workflow**. This runs the full `@ci-dashboard-regression-tags` suite on your branch.

### Step 3 — What to look for in the logs

**If the cluster is healthy when you run it:**
- The two new `echo` lines appear in the `select-cluster` job logs: `✅ OdhDashboardConfig is present`, `✅ Test user can create projects`
- Tests run normally — no behaviour change

**If the cluster is in a bad state (the interesting case):**
- The `select-cluster` job fails in < 60 seconds with: `❌ OdhDashboardConfig missing or empty on dash-e2e-int`
- Secondary cluster is tried; if that also fails, job exits early with a clear reason
- No Cypress process starts, so there are no misleading test failures to `/retest`

### Step 4 — Verify Change 2 locally (no cluster needed)

You can unit-test the `getDashboardConfig` guard by running the existing Cypress mock suite (no cluster required):

```bash
npm run test:frontend   # or cd frontend && npm test
```

The function itself is in `oc_commands/project.ts` and is pure enough that you can add a Jest test for the empty-stdout branch if needed (see `packages/cypress/cypress/utils/__tests__` for the pattern).

### Step 5 — Review the diff

The entire diff should be:
- ~20 lines added to `cypress-e2e-test.yml` (inside one shell function, no new jobs)
- ~7 lines changed in `project.ts` (replace one line with a guard + clearer message)

That is easy to review and easy to revert if anything unexpected happens.

---

## 7. What This Does Not Change

- No new jobs or runners
- No change to test logic, selectors, or fixtures
- No change to the failover strategy (primary → secondary still works the same)
- No change to which tests run or how they are tagged
- Does not fix underlying cluster state — it surfaces the problem earlier and more clearly

---

## 8. Next Steps After This Lands

These are meeting/discussion topics, not week-one code:

| Topic | Why |
|---|---|
| **Who owns "cluster not ready" failures?** | With a clear preflight failure message, QE and platform need a process: who files the ticket, who remedies the cluster? |
| **Orphaned namespace cleanup** | Many `NotFound` errors come from prior crashed runs leaving no project to clean up. A periodic cleanup job (cron or `after:run` hook) would reduce these. |
| **Rethink E2E scope on PRs** | Running the full regression suite on every PR to `main` under shared runner pressure is expensive. Consider only running mock tests on PRs and E2E on merge-to-main or nightly. |
| **Track fail type over time** | Add a label `e2e-infra-failure` vs `e2e-test-failure` to issues so QE can see the ratio trend without manually reading logs. |
