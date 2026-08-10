# Teaching Notes

## User Preferences
- Prefers ultra-concise communication for answers, comprehensive explanations when teaching
- Wants things explained in simple terms
- Appreciates step-by-step breakdowns

## Prior Knowledge
- JavaScript: comfortable
- React: comfortable (basics — components, props, state, hooks)
- TypeScript: no prior exposure
- Kubernetes / OpenShift: no prior exposure
- Monorepo tooling (npm workspaces, Turbo): no prior exposure
- PatternFly: no prior exposure
- Module Federation: no prior exposure
- Testing frameworks (Jest, Cypress): unknown — confirm in future sessions

## Working Notes
- The user is a new web developer joining as a contributor to this repo
- Ground all lessons in "what you need to know to contribute" — not abstract theory

## Curiosity from Lesson 1 (Aug 6)
User asked follow-ups on: (1) what pipelines automate, (2) monorepo tests/packages/CI vs frontend, (3) how monorepos change how you run/start dev, (4) K8s cluster login for local development. Answered in chat; deepen later in dedicated lessons (pipelines domain, monorepo day-to-day, local cluster workflow).

## Session 3 — PatternFly (Aug 6)
Covered PF as the full UI layer. User asked specifically about: rules/conventions, upstream vs local fix decision, keeping up with PF versions, most common components. All addressed in lesson 3. User seems interested in practical/hands-on next — suggest running the dev server lesson.

## Session 4 — Dev server (Aug 7)
Created lesson 4 (running the dev server). Emphasized Path A (`frontend` + `start:dev:ext`) vs Path B (`npm run dev`). Asked user about cluster/`oc` access — waiting for reply. Next after they get localhost:4010 working: how a page is structured (routing + real page folder).

## Session 5 — Page structure (Aug 7)
Created lesson 5 using Connection types as the walkthrough (routes.ts → *Routes → *Page → ApplicationsPage; nav separate in navigation.ts). User asked for next lesson without confirming cluster access yet. Next zone: data hooks / useFetch, or a guided mini-edit if server is up.
