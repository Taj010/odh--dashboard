---
name: review-bff-pr
description: Reviews a BFF (Backend-for-Frontend) pull request in the opendatahub-io/odh-dashboard repo by fetching the diff and comments, then auditing it against the team's established BFF review patterns. Use when the user shares a BFF PR URL or PR number and asks for a review.
disable-model-invocation: true
---

# BFF PR Review

Fetch, analyse, and report on a BFF PR using the patterns from the BFF review rules.

## Step 1 – Get the PR number

Extract the PR number from what the user provided (URL or bare number).

## Step 2 – Fetch PR data

Run all three commands in parallel:

```bash
# Inline review comments
gh api "repos/opendatahub-io/odh-dashboard/pulls/<PR>/comments?per_page=100" \
  | jq '[.[] | {user: .user.login, body: .body, path: .path}]' > /tmp/bff_review_comments.json

# Issue-level (top-level) comments
gh api "repos/opendatahub-io/odh-dashboard/issues/<PR>/comments?per_page=100" \
  | jq '[.[] | {user: .user.login, body: .body}]' > /tmp/bff_review_issue_comments.json

# PR metadata + diff summary
gh pr view <PR> --repo opendatahub-io/odh-dashboard --json title,body,files,additions,deletions
```

Read both JSON files after fetching.

## Step 3 – Audit against the BFF review checklist

Go through each category below and report **findings only** — skip categories with no issues.

### 🔐 Auth & Security
- [ ] Routes default-secure? Public paths explicitly wrapped in `publicRoute()`, not an opt-in allowlist
- [ ] Correct HTTP status: 401 for missing/invalid token, **403** for authenticated-but-not-admin
- [ ] SAR error (`err != nil`) logged at Warn + returns ErrForbidden separately from `!allowed`
- [ ] Single-namespace path runs a SAR check using caller identity (not BFF SA credentials)
- [ ] `kubernetesClientFactory` nil-checked inside handler (not just in middleware)
- [ ] Dev-mode fallback logged at Warn level (not Debug)
- [ ] `unauthorizedResponse` does NOT log `err.Error()` verbatim (token fragments leak)
- [ ] Audit log: `ErrAlreadyExists` / conflicts logged at Warn; SSAR failure adds `adminCheckError` field
- [ ] No duplicate `timestamp` field in audit logs (`slog` already emits `time`)

### ✅ Input Validation
- [ ] Namespace validated: `^[a-z0-9]([-a-z0-9]*[a-z0-9])?$`, max 63 chars, returns 400 if invalid
- [ ] Duplicate singular query params rejected (e.g., `?namespace=a&namespace=b` → 400)
- [ ] Array params (e.g., `sources`) accept repeated params AND comma-separated values
- [ ] String fields trimmed before empty-check (e.g., `strings.TrimSpace(subscription)`)
- [ ] `envVars[].name`, `servicePorts[].name`, `servicePorts[].protocol` validated at handler boundary
- [ ] All request body fields forwarded (nothing silently dropped like `expiresIn`)

### 📡 HTTP Status Codes
- [ ] K8s client / repository failures → 5xx (not 400)
- [ ] RBAC/SAR denied → 403
- [ ] Name conflict → 409
- [ ] Backend completely down when caller asked for it exclusively → non-200 (not silent empty 200)

### 📄 OpenAPI Spec
- [ ] New endpoints added to the spec in the same PR
- [ ] Required params marked `required: true` in spec
- [ ] No duplicate parameter definitions (YAML duplicate keys = undefined behaviour)
- [ ] Array params have `maxItems` + `uniqueItems`
- [ ] All error responses the handler can return are documented (e.g., 404, 503)
- [ ] `pageSize` type is `integer` with `minimum: 1`, not `string`

### 🔗 Inter-BFF Communication
- [ ] No `InsecureSkipVerify` in any TLS config
- [ ] `TLSEnabled: true` for targets that forward `x-forwarded-access-token`
- [ ] Query strings built with `url.Values{}` + `q.Encode()`, never string concatenation
- [ ] `io.ReadAll(resp.Body)` wrapped in `io.LimitReader` (1 MiB cap)
- [ ] Path allowlist uses canonical path comparison, not `strings.Contains`
- [ ] Every env var declared in manifests is read in `environment.go` and wired in `cmd/main.go`
- [ ] `AuthMethod` validated at startup with an allowlist

### ☸️ Kubernetes Resources
- [ ] Child resources (SA, Deployment, Service, Route) have `OwnerReferences` pointing to the CR
- [ ] Rollback only deletes resources the BFF **created** (not pre-existing ones)
- [ ] OpenShift Route `targetPort` uses numeric port, not `fmt.Sprintf("%d", port)` (string = port name lookup)
- [ ] `ServiceAccount` `AlreadyExists` is rejected (not silently reused — privilege escalation risk)
- [ ] NetworkPolicy pod selectors verified against actual pod labels

### 🧪 Testing
- [ ] SAR deny (`allowed=false`) AND SAR error (`err!=nil`) tested separately
- [ ] Mock records which namespace was passed to SAR and test asserts it
- [ ] Invalid-namespace 400 test case exists
- [ ] Rollback test: partial cleanup on mid-deploy failure
- [ ] Idempotency test: pre-existing resource not mutated
- [ ] Mock `DeployAgent` populates `Details` so follow-up `GetAgent` succeeds
- [ ] RBAC denial test (mock returns `false`, assert 403)
- [ ] Positive-path tests assert `response.Data` is non-empty (not just iterate over `[]`)
- [ ] Test helpers that set `RequestIdentity` in context also set the matching auth header

### 🏗️ Go Patterns
- [ ] No `context.Background()` for rollback/cleanup — use `context.WithTimeout`
- [ ] Map iteration over Kubernetes manifests uses sorted/stable order
- [ ] Helper functions with narrow scope have a comment explaining actual scope
- [ ] Makefile recipe variables quoted: `"$(MY_VAR)"`
- [ ] Error return values that are always `nil` removed from function signatures
- [ ] New unexported helpers in scaffolding have `// TODO: wire into X` comment
- [ ] Platform probe ambiguous errors default to XKS (least privilege), not OpenShift

### 🔄 Fastify Parity
- [ ] Intentional divergence from Fastify is documented in a comment or PR description
- [ ] Raw K8s error in `MutationResponse.Error` is intentional (established contract) — do not flag as CWE-209

## Step 4 – Output the review

Format the report as:

```
## BFF PR Review – PR #<number>: <title>

### Summary
<1-3 sentence overview>

### 🔴 Critical (must fix)
<issue> | File: `path/to/file.go` | <brief explanation + fix>

### 🟡 Major (should fix)
<issue> | File: `path/to/file.go` | <brief explanation>

### 🔵 Minor / Nitpick
<issue> | File: `path/to/file.go` | <brief explanation>

### ✅ Looks good
<list things done well — auth structure, spec sync, test coverage, etc.>

### ⏭️ Out of scope / acknowledged patterns
<items that look like issues but are intentional — cite the BFF rules>
```

Only include sections that have content. Be specific — name the file and line pattern where possible.
