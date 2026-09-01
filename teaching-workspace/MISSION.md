# Mission: Agent Deployments Feature Development

## Who am I?

A new web developer learning to build enterprise features in the ODH Dashboard monorepo.

## What do I want to accomplish?

Learn to understand and implement the Agent Hub UI feature work, which involves:
- Understanding the architecture (React frontend + Go BFF)
- Reading and understanding Jira tickets (Strategy → Feature → Epic → Story)
- Writing production-quality code following team conventions
- Understanding how pieces connect and what blocks what

## Why does this matter?

This is my first time:
- Working on features with this complexity level
- Building with a BFF (Backend-for-Frontend) architecture
- Understanding enterprise Jira workflows
- Contributing to a large monorepo with established patterns

## What will success look like?

1. **Understand** - Can explain the Agent Hub feature and its architecture in simple terms
2. **Navigate** - Can read Jira tickets and understand what work is needed
3. **Implement** - Can write code that follows the team's patterns and passes review
4. **Connect** - Can identify dependencies and blockers between tickets

## The Big Picture

**Problem Being Solved**: Platform engineers and AI developers have no unified UI to discover, inspect, and manage AI agents in RHOAI. They must use CLI/API, which limits discoverability and governance.

**Solution**: Agent Hub views in the RHOAI Dashboard:
- **Registry View** — browsable catalog of all registered agents
- **Deployments View** — running agent instances with health/endpoints/status
- **Deploy Action** — secure agent onboarding into governed sandboxes
- **Admin UI** — workspace and policy management for OpenShell

## Current State: Three Engineering Tracks

### Track 1: ✅ COMPLETED — [RHAISTRAT-1758](https://redhat.atlassian.net/browse/RHAISTRAT-1758)
**"Agent Dashboard — list running OpenShell agent deployments"**
- List/filter deployed agents from Sandbox CRs
- Show name, namespace, status, endpoint
- **This shipped in 3.5 GA**

### Track 2: 🔄 IN PROGRESS — [RHAISTRAT-1742](https://redhat.atlassian.net/browse/RHAISTRAT-1742)
**"Deploy agent images from AI Hub Agents Deployments page"**
- BYO image deploy wizard
- BFF write/lifecycle APIs (stop/start/delete)
- List-page lifecycle actions
- **Target: 3.6**

### Track 3: 🆕 NEW (My Work) — [RHAISTRAT-2467](https://redhat.atlassian.net/browse/RHAISTRAT-2467)
**"Administration UI for governed agent execution environments"**
- OpenShell Dashboard (Go BFF + React/PF6)
- Workspace, policy, and credential management
- Embed in RHOAI console via module federation
- **⚠️ BLOCKED on ship** by RHOAI-deployed OpenShell gateway (RHAISTRAT-1752) — can develop with mocks
- **Epic 1 (odh):** [RHOAIENG-81030](https://redhat.atlassian.net/browse/RHOAIENG-81030) — 6 stories; frontend: **89723** then **89741**
- **Epic 2 (upstream):** [RHOAIENG-87732](https://redhat.atlassian.net/browse/RHOAIENG-87732) — 4 backend stories (Derek Xu); contract supplier only

## Key Blocker to Understand

Track 3 (my work) is **hard-gated** on a backend dependency:
- **RHAISTRAT-1752** — RHOAI must deploy an OpenShell gateway
- As of Aug 2026, this gateway **does not exist** in RHOAI
- The UI has nothing to administer until that backend lands
- **Cannot commit to a specific release** until gateway has a date

## Questions Answered

1. ✅ What is an "AgentRuntime"? — A running instance of an agent (1:1 with Sandbox CR)
2. ✅ What is a "Sandbox CR"? — A Kubernetes Custom Resource defining a secure, isolated agent environment
3. How does the frontend talk to the BFF? — HTTP calls to REST API
4. How do I know if something is blocked? — Check dependencies in Jira strategy docs
