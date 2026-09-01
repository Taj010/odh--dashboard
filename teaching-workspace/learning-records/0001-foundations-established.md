# Learning Record 0001: Foundations Established

**Date:** Sep 1, 2026  
**Session:** 1  
**Topic:** Agent Ops Overview & Jira Structure

## What Was Learned

### Concepts Mastered
1. **Agent vs AgentRuntime** — Agent is the code/image; AgentRuntime is the running instance
2. **Sandbox CR** — Kubernetes Custom Resource that defines a secure, isolated agent environment (1:1 with AgentRuntime)
3. **BFF Architecture** — Frontend → BFF → Kubernetes, browser can't talk directly to cluster
4. **Contract-First** — OpenAPI spec is source of truth, write spec before code

### Jira Hierarchy Understood
- Strategy → Feature → Epic → Story
- RHAISTRAT = Strategy/Feature level
- RHOAIENG = Epic/Story level (engineering work)

### Three Tracks Identified
1. **Track 1 (DONE):** List View — showing deployed agents
2. **Track 2 (IN PROGRESS):** Deploy — wizard and lifecycle actions
3. **Track 3 (NEW):** Admin UI — workspace/policy/credential management for OpenShell

### Critical Blocker Understood
- Track 3 is hard-gated on RHAISTRAT-1752 (OpenShell gateway)
- Gateway doesn't exist in RHOAI yet
- Can develop against self-hosted/HyperShell for dev
- Cannot ship until backend lands

## Questions Answered
- ✅ What is a Sandbox CR? (secure isolated environment, 1:1 with AgentRuntime)
- ✅ Why "sandboxed"? (security isolation, like a child's sandbox)
- ✅ How are tickets organized? (Strategy → Feature → Epic → Story)
- ✅ What does "blocked" mean? (cannot ship until dependency met)

## Questions Still Open
- What are the specific epics/stories in Track 3?
- What can be started now vs. what's truly blocked?
- What does the code structure look like for Track 3?
- What's the double-auth flow specifically?

## Key Insight
Track 3 (Admin UI) talks to the OpenShell gateway via gRPC, NOT the Kubernetes API. This is different from Tracks 1 & 2 which use the standard BFF → Kubernetes pattern. The BFF for Track 3 is "relay-only" — it forwards tokens to the gateway but never validates them.

## Next Steps
1. Get the 2 epics and 10 stories for Track 3
2. Map dependencies to identify what's actionable
3. Learn the two deployment paths (native Sandbox vs OpenShell gateway)
4. Start with smallest unblocked story

## Materials Created
- `lessons/0001-what-is-agent-ops.html` — Architecture overview
- `lessons/0002-jira-ticket-hierarchy.html` — Ticket structure
- `reference/glossary.html` — Key terms
- `MISSION.md` — Updated with real Jira context
