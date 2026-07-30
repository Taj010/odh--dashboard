---
name: review-pr
description: Performs a comprehensive code review of a pull request in opendatahub-io/odh-dashboard following team standards, the Gkrumbach07 review persona, and established PR patterns. Use when the user shares a PR URL or number and asks for a review, or says "review this PR".
disable-model-invocation: true
---
NOTE: DO NOT COMMENT ANY REVIEW DIRECTLY TO THE PR NEVER -- WHEN GIVING REVIEW FEEDBACK USE THE COMMON COMMENTS BELOW AND IN SIMILAR TONE SAY WHICH LINE AND WHAT THE SUGGESTED REPLY IS 

# PR Review

Review a PR using team standards, established patterns, and a collaborative, educational tone.

## Step 1 – Understand the PR

Fetch context in parallel:

```bash
# PR metadata, description, changed files
gh pr view <PR> --repo opendatahub-io/odh-dashboard \
  --json title,body,files,additions,deletions,labels,author

# Existing review comments (to understand what reviewers already flagged)
gh api "repos/opendatahub-io/odh-dashboard/pulls/<PR>/comments?per_page=100" \
  | jq '[.[] | {user: .user.login, body: .body, path: .path}]'

# Diff
gh pr diff <PR> --repo opendatahub-io/odh-dashboard
```

Read all output before forming opinions.

---

## Step 2 – Review approach

**Start high-level, work down.** A high-level architectural issue invalidates many low-level comments. Ask:
- What is this PR trying to accomplish?
- Does the approach make sense, or is there a simpler way?
- Does it follow existing patterns in the codebase?
- What is the user-experience impact?

Only then move to code-level details.

**Scope discipline:** only review lines the PR touches. If surrounding unchanged code has issues, mark them `(out of scope – optional)`. Do not request changes outside the PR's scope.

**Limit repeated pattern callouts:** flag a pattern once or twice clearly; don't repeat the same comment for every instance.

---

## Step 3 – Checklist

### Architecture & patterns
- [ ] Uses existing components/utilities instead of duplicating logic — search before creating new
- [ ] Business logic extracted to utility functions, not embedded in components
- [ ] Complex logic moved to hooks or utils, not inline in JSX
- [ ] No hardcoded values — use constants, enums, config, or environment variables
- [ ] Enums used for string literals that could change (not bare string literals)
- [ ] Pure functions are testable and side-effect free
- [ ] `Record<K,V>` over index signatures; `type` over `interface`
- [ ] No `any` — missing TypeScript types must be added

### React & component quality
- [ ] Functional components only (no class components)
- [ ] Hooks follow rules of hooks (no conditional calls)
- [ ] No unnecessary `useEffect` — prefer derived state or event handlers
- [ ] `useMemo` / `useCallback` used where referential equality matters (not everywhere)
- [ ] `useRef` for imperative DOM access or non-render values
- [ ] Prefer `useFetchState` over raw `useState + useEffect` for async data
- [ ] Fallback guards handle blank strings: `value.trim() || fallback`, not just `value || fallback`
- [ ] No mixing controlled and uncontrolled in the same form section
- [ ] Hidden form fields cleared when hidden (don't submit stale state)

### PatternFly & styling
- [ ] PF components used instead of raw HTML + custom CSS
- [ ] No inline `style={{...}}` on PF components — use PF layout props or CSS variables
- [ ] `Flex` / `FlexItem` instead of utility className strings (`pf-v6-u-display-flex …`)
- [ ] PF CSS tokens from `@patternfly/react-tokens` — no hardcoded hex/px that PF already exposes
- [ ] CSS overrides scoped to component `.scss`, not global `App.scss`
- [ ] When a PF upstream issue requires an override: add `// FIXME: remove once <issue url>` in the `.scss`
- [ ] SVGs use PF icon components or existing imports — no inline raw `<svg>` in JSX

### Performance
- [ ] No redundant API calls — fetch only when needed; don't fetch in loops per-item
- [ ] Use `FAST_POLL_INTERVAL` — don't create new polling intervals
- [ ] Lazy-load data until the user actually needs it (e.g., wait for modal open)
- [ ] Consider WebSockets / watch over polling for real-time updates
- [ ] No new `AbortController` patterns missing — fetch cleanup must cancel in-flight requests

### Error handling & UX
- [ ] Errors surfaced to user via `useNotification` — no silent swallowing
- [ ] Meaningful error messages (not generic "Something went wrong")
- [ ] Loading states shown for every async operation
- [ ] Empty state handled — `EmptyState` component when list is empty
- [ ] `NotReadyError` used (not generic `Error`) when a resource isn't configured yet

### Forms & validation
- [ ] Zod schemas for all form validation
- [ ] Validation logic centralized, not scattered across components
- [ ] Required fields validated before submission; clear user feedback on failure
- [ ] `SupportedArea` entries registered in `frontend/src/concepts/areas/const.ts`

### Accessibility & DOM
- [ ] All interactive elements have accessible labels (`aria-label` or visible text)
- [ ] Icon-only buttons have `aria-label`
- [ ] Semantic HTML used (`<button>`, `<nav>`, `<main>`) — not `<div onClick>`
- [ ] `data-testid` attributes on interactive elements for Cypress

### package.json / dependencies
- [ ] Workspace deps use wildcard: `"@odh-dashboard/k8s-core": "*"`
- [ ] `mod-arch-shared` packages in `peerDependencies` where appropriate
- [ ] No new deps when an existing shared utility covers the need
- [ ] Deps sorted alphabetically within each section

### Shared code / DRY
- [ ] `translateDisplayNameForK8s` used for K8s name sanitisation — not re-implemented
- [ ] Types/schemas imported from source package — not redeclared locally
- [ ] Genuinely reusable code promoted to `mod-arch-shared`, local copy removed in same PR

### Tests
- [ ] Every new utility function has a unit test
- [ ] Every new hook has tests (`renderHook` + `act`)
- [ ] No `cy.wait(<number>)` — use `cy.intercept` aliases + `cy.wait('@alias')`
- [ ] Cypress uses page object methods, not raw `cy.get('[data-testid=...]')` inline in specs
- [ ] Negative assertions use `.should('not.exist')`, not count === 0
- [ ] Cancel actions assert no side effects (network call not fired, state unchanged)
- [ ] Tests cover behaviour, not brittle UI strings — avoid asserting exact copy
- [ ] Removed functionality → adjust or remove corresponding tests
- [ ] Code coverage not reduced

### BFF / Go (if the PR touches `packages/*/bff/` or `distributions/core-bff/`)
For BFF changes, also apply the **review-bff-pr** skill checklist:
- Auth middleware structure, 401 vs 403, SAR checks
- Input validation at handler boundary, namespace format, duplicate query param rejection
- OpenAPI spec sync, correct status codes
- No `InsecureSkipVerify`, inter-BFF TLS, `io.LimitReader`
- K8s `OwnerReferences`, rollback scope, OpenShift Route `targetPort`
- Testing: SAR deny + error paths, mock state consistency

### PR process
- [ ] PR description explains *why*, not just *what*; links the Jira/GitHub issue
- [ ] No leftover `console.log` / debug code
- [ ] Prettier + ESLint clean (no `eslint-disable` without explanation comment)
- [ ] Import order consistent (external → internal absolute → relative)
- [ ] Rebased on latest main; no unnecessary merge commits
- [ ] Naming/text/color verified against Slack threads or design docs when relevant

---

## Step 4 – Write the review

### Tone rules
- **Never write "you"** — use "we", omit the subject, passive voice, or a question:
  - ❌ "You should rename this variable"
  - ✅ "Can we rename this to `secondsRemaining` to make the intent clearer?"
  - ✅ "This variable could be renamed to `secondsRemaining`."
- **Frame as requests**: "Can we…" not "Change this to…"
- **Explain why**: state both the suggested change and the reason
- **Offer praise sincerely**: "This is an elegant solution — never would have thought of that." / "Really useful API — wasn't aware of this."
- **Be educational**: link to PF docs, codebase examples, or patterns
- **Be collaborative**: "We should revisit this next sprint" not "This is wrong"

### Severity labels
| Label | Meaning |
|---|---|
| 🔴 **Critical** | Must fix before merge — correctness, security, data loss |
| 🟡 **Major** | Should fix — maintainability, patterns, performance |
| 🔵 **Minor** | Nice to have — style, nitpick, optional improvement |
| ✅ **Praise** | Genuinely good — call it out |
| ⏭️ **Out of scope** | Worth noting but not in this PR's scope (optional) |

### Output format

```
## PR Review – #<number>: <title>

### Summary
<2-3 sentences: what the PR does, overall impression, one headline concern if any>

### 🔴 Critical
- **[File path, line pattern]** — <issue>. <why it matters>. Can we <suggested fix>?

### 🟡 Major
- **[File path]** — <issue>. <why>. <suggestion with code example if helpful>

### 🔵 Minor / Nitpick
- **[File path]** — <issue>. <suggestion>

### ✅ Looks great
- <genuine praise — specific, not generic>

### ⏭️ Out of scope (optional)
- <thing worth noting but not blocking>

### Overall
<approval status: approve / approve with minor fixes / request changes + one-line rationale>
```

---

## Quick-reference patterns (common comments)

```
// Enum over string literal
Can we use the `SomeEnum` here instead of the raw string? Easier to maintain if values change.

// Component reuse
There's a component that handles this — `<ExistingComponent>`. Can we reuse that instead?

// PatternFly flex
Can we use PF's `<Flex>` component here? The utility classNames are tied to PF6; when we upgrade, every instance needs manual fixing.

// Poll interval
Can we use `FAST_POLL_INTERVAL` here instead of a new interval? Keeps polling behaviour consistent across the app.

// Notification
Can we use `useNotification` to surface this error to the user instead of handling it locally?

// useFetchState
Can we swap this `useState + useEffect` pair for `useFetchState`? It handles the loading/error states for us.

// K8s name util
`translateDisplayNameForK8s` in `~/app/shared/components/utils.ts` handles this sanitisation — can we use that?

// Empty state
What happens when this list is empty? Can we add an `<EmptyState>` so users know nothing is here yet?

// Test scope
Can we also add a test for the case where <X happens>? The happy path is covered but this edge case could silently regress.
```
