# Learning Record 0002: OpenShell Epics Mapped

**Date:** Sep 1, 2026  
**Session:** 2  
**Topic:** Track 3 epic breakdown and frontend scope

## What Was Learned

### Two Epics, One Feature
- **RHOAIENG-81030** (Epic 1) = odh-dashboard integration — user's primary work
- **RHOAIENG-87732** (Epic 2) = upstream openshell-dashboard — Derek Xu / Razzmatazz; supplier, not implementer

### Frontend Stories Identified
1. **89723** — First implementable story: package scaffold, proxy, nav, routes, upstream page mount (mocked BFF OK)
2. **89741** — After 89723: dual-auth UX, session handling, feature flags, slots, Cypress

### Not Frontend (awareness only)
- **89740** — Cluster sidecar manifests (port 8943)
- **89726** — Real BFF image + auth bridge (blocked by 89740)
- Epic 2 stories 87975–88012 — upstream BFF/SDK; affects API contracts only

### Architecture Pattern
- Import upstream `./pages`, `./api`, etc. via Module Federation (proven in spike 81066)
- Thin ODH wrapper supplies: QueryClientProvider, AlertProvider, `setApiBasePath`, nav callbacks, session handler
- Same pattern as `packages/mlflow`
- Separate from agent-ops Sandbox CR path (8843 vs 8943)

### Key Insight
Epic 2 does NOT block starting 89723. Mocks are explicitly acceptable. Epic 2 matters for API response shapes and upstream decoupling — watch 87985/88012 for contract, not for pairing on Go code.

## Questions Answered
- ✅ What are the Track 3 epics? — 81030 (odh) + 87732 (upstream)
- ✅ Which stories are mine? — Primarily 89723 then 89741
- ✅ Do I need Epic 2 story details? — Titles sufficient; contract-level awareness only

## Next Steps
1. Lesson 4: 89723 AC line-by-line with mlflow template
2. Lesson 5: Host wrapper and mock BFF setup
3. Read spike docs on branch RHOAIENG-81066/openshell-ui-mf
