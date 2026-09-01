# Teaching Notes

## User Preferences

- New web developer, first time with these concepts
- Wants simple explanations, not jargon
- Needs to understand connections and dependencies
- Learning while doing real feature work
- Asks great clarifying questions (e.g., "what does sandboxed mean?")

## Jira Structure (Confirmed)

### Main Strategy
**[RHAISTRAT-1697](https://redhat.atlassian.net/browse/RHAISTRAT-1697)** — Agents UI in AI Hub: Discovery, Registry & Deployment Views

### Three Engineering Tracks

| Track | Jira | Title | Status |
|-------|------|-------|--------|
| 1 | [RHAISTRAT-1758](https://redhat.atlassian.net/browse/RHAISTRAT-1758) | Agent Dashboard — list running agents | ✅ DONE (3.5 GA) |
| 2 | [RHAISTRAT-1742](https://redhat.atlassian.net/browse/RHAISTRAT-1742) | Deploy agent images from Dashboard | 🔄 IN PROGRESS (3.6) |
| 3 | [RHAISTRAT-2467](https://redhat.atlassian.net/browse/RHAISTRAT-2467) | Admin UI for governed execution | 🆕 NEW (user's work) |

### Track 3 Epics (Mapped)

**Epic 1 — odh-dashboard:** [RHOAIENG-81030](https://redhat.atlassian.net/browse/RHOAIENG-81030)
| Ticket | Title | FE work? |
|--------|-------|----------|
| 81066 | UI MF spike | Done |
| 81067 | BFF spike | Read only |
| **89723** | FE package, proxy, routes | **Start here** |
| **89741** | Auth UX, flags, Cypress | After 89723 |
| 89740 | Cluster manifests | Infra |
| 89726 | BFF image, auth bridge | Backend |

**Epic 2 — upstream:** [RHOAIENG-87732](https://redhat.atlassian.net/browse/RHOAIENG-87732) (Derek Xu)
87975 BFF dirs · 87983 SDK init · 87985 API spec · 88012 implement spec
→ FE cares about API/export contracts only

### Critical Blocker
**[RHAISTRAT-1752](https://redhat.atlassian.net/browse/RHAISTRAT-1752)** — RHOAI-deployed OpenShell gateway
- Status: On-hold upstream, UNDATED
- Impact: Track 3 CANNOT ship until this lands
- Dev workaround: Use self-hosted or HyperShell gateway

## Key Technical Notes

### Two Deployment Paths
1. **Native Sandbox CR** — Talks to Kubernetes API (Tracks 1 & 2)
2. **OpenShell Gateway** — Talks to gRPC API via Go SDK (Track 3)

### Track 3 BFF is Different
- Other BFFs proxy Kubernetes API
- Track 3 BFF talks to OpenShell gateway via gRPC
- "Relay-only" — forwards bearer tokens, never validates
- Gateway validates OIDC JWT and enforces workspace RBAC

### Auth for Track 3 (Double-Auth)
1. User logs into RHOAI (primary session, RHOAI SSO)
2. Second OpenShell-scoped token obtained against shared Keycloak
3. Token forwarded to gateway
4. External OIDC (Keycloak) required — OpenShift opaque tokens won't work

## Lessons to Create
1. ✅ What is Agent Ops (architecture)
2. ✅ Jira ticket hierarchy
3. ✅ OpenShell two epics + dependency map
4. ✅ 89723 acceptance criteria walkthrough
5. ✅ Host wrapper + mocked BFF setup
6. ✅ package.json deep dive (MF block, proxy, ports, validate:ports)
7. ✅ Spike explainer (SPIKE.md + FEDERATION-STRATEGY.md for beginners)
8. ⬜ Two deployment paths (native vs OpenShell)
9. ⬜ The development workflow

## Session Log
- **Session 1 (Sep 1, 2026)**: 
  - Initial setup, explored codebase
  - Explained architecture (Frontend → BFF → K8s)
  - Clarified Sandbox CR terminology
  - Documented Jira structure from user's paste
  - Created lessons 1-2, glossary, learning record
- **Session 2 (Sep 1, 2026)**:
  - User pasted full Track 3 epic/story breakdown (81030 + 87732)
  - Mapped frontend scope: 89723 → 89741
  - Created lesson 3, dependency map reference, learning record 0002
- **Session 3 (Sep 1, 2026)**:
  - Lesson 4: 89723 AC mapped to files (model-registry + agent-ops patterns)
  - Created 89723-file-checklist reference
  - Lesson 5: Host wrapper 4-layer breakdown, provider table, mock BFF options
  - Code snippets based on real agent-ops/mlflow files
- **Session 4 (Sep 1, 2026)**:
  - Lesson 6: package.json deep dive — module-federation block field-by-field, proxy explained with analogies, port allocation map, validate:ports script
  - Lesson 7: Spike explainer — translated SPIKE.md + FEDERATION-STRATEGY.md for beginners. Covered: what a spike is, the four big questions (UI source, MF ownership, BFF packaging, runtime boundary), proxy chain step-by-step, mock-to-real BFF progression (3 stages), rejected options and why, shared vs singleton deps
  - Updated glossary with 10 new terms (proxy, pathRewrite, remoteEntry, singleton, remote/host, spike, iframe, SPA, gRPC, sidecar, validate:ports)
  - User's key confusion points addressed: what is an API proxy, how mock data connects to real BFF later, what the spike findings actually mean
