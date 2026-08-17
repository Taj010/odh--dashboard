# Mission: Ship OpenShell inside odh-dashboard

## Why
You need to work on (or review) [RHOAIENG-81030](https://redhat.atlassian.net/browse/RHOAIENG-81030) without mixing two jobs that look similar: **OpenShell product features** (upstream) and **odh-dashboard integration** (this epic). When this is solid, you can pick a child story, know which repo to change, and explain the cutover to a teammate.

## Success looks like
- Draw today's agent-ops path and tomorrow's OpenShell path from memory, including where the user's token goes
- Point at a task and say "odh wiring" vs "file upstream" vs "still an open question"
- Name the host pieces a federated OpenShell plugin must register (remote, proxy, extensions, flags) by looking at an existing module such as MLflow

## Constraints
- Treat this as onboarding to one epic, not a full OpenShell internals course
- Prefer primary sources (upstream README/ADR, odh `docs/module-federation.md`, current `packages/agent-ops`) over memory
- Explain in plain language first; jargon only after the picture is clear

## Out of scope
- Implementing the integration in this teaching workspace
- OpenShell gateway internals (sandbox isolation, drivers) beyond what the dashboard must call
- The full Go "interface decoration" proposal — that is a later lesson, not the epic itself
