# Notes

- Teaching workspace lives at `.teach/openshell/` so we do not drop course files on the odh-dashboard repo root.
- User asked to use `/teach` and explain RHOAIENG-81030, including the two spikes and a Go BFF structure proposal. Lesson 0001 is the epic's *job*. Later lessons cover Module Federation consume, BFF packaging, auth bridge, then interface decoration.
- Speak plainly; assume a newer web developer. Architecture first, ticket fields second.
- Jira MCP could not load `RHOAIENG-81030` (project not in the connected filter). Ticket text came from the user paste + public upstream sources.
- Spike package `packages/openshell` is **not** on this checkout; Daniel Reed's comment says it lived on branch `RHOAIENG-81066/openshell-ui-mf`. This tree still has `packages/agent-ops`.
- Preference (inferred): they pasted both spikes *and* the Go BFF proposal — they want the whole map, but in digestible lessons.
