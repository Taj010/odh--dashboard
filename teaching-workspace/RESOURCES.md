# Resources

## Primary Sources (In This Repo)

### Architecture & Guidelines
| Resource | Path | Why It Matters |
|----------|------|----------------|
| Agent-Ops AGENTS.md | `packages/agent-ops/AGENTS.md` | Development flow, project structure, conventions |
| Root CLAUDE.md | `CLAUDE.md` | Monorepo overview, key technologies |
| BFF Go Rules | `.claude/rules/bff-go.md` | Go backend patterns |

### Code to Study
| Resource | Path | What It Shows |
|----------|------|---------------|
| OpenAPI Spec | `packages/agent-ops/api/openapi/agent-ops.yaml` | The API contract (source of truth) |
| Deploy Agent API | `packages/agent-ops/frontend/src/app/api/deployAgent.ts` | How frontend calls BFF |
| Agent Runtime Types | `packages/agent-ops/frontend/src/app/types/` | TypeScript type definitions |
| BFF Handlers | `packages/agent-ops/bff/internal/api/` | Go HTTP handlers |

### Documentation
| Resource | Path | Content |
|----------|------|---------|
| Install Guide | `packages/agent-ops/docs/install.md` | Local setup |
| Architecture | `packages/agent-ops/frontend/docs/architecture.md` | System design |
| Local Deployment | `packages/agent-ops/docs/local-deployment-guide.md` | Running locally |

## External Resources

### BFF architecture (OpenShell / Agent Ops)
- [GitHub: d0w/openshell-bff-examples](https://github.com/d0w/openshell-bff-examples)
  Three Go modules: `upstream`, `downstream-reuse` (100% import), `downstream-partialreuse` (embed + extra routes). Use when: 1 vs 2 BFFs, decorating OpenShell from ODH.
- [Effective Go — Embedding](https://go.dev/doc/effective_go#embedding)
  Why Go can override one method and keep the rest. Use when: reading the examples’ `Service` struct.
- [go-chi/chi](https://github.com/go-chi/chi)
  Router the migration proposal uses (`server.Option` gets a `chi.Router`). Current agent-ops BFF still uses httprouter.
- [agent-ops BFF README](../packages/agent-ops/bff/README.md)
  CR-path BFF: Sandbox CRs, port 8843, SAR. Use for: contrasting with the gateway path.
- [BFF Go rules](../.claude/rules/bff-go.md)
  Shared directory layout, flags, auth methods, error envelope. Use for: “what every BFF contains.”
- [Inter-BFF communication](../docs/inter-bff-communication.md)
  How two BFF processes call each other over HTTP. Use for: sharing data without merging fillings.

### Jira (To Be Added)
- [ ] RFE link
- [ ] Strategy link  
- [ ] Epic 1 (6 stories)
- [ ] Epic 2 (4 stories)

### Technologies
| Tech | Documentation | Why We Use It |
|------|--------------|---------------|
| PatternFly v6 | https://www.patternfly.org/v6/ | UI component library |
| Go BFF | https://go.dev/doc/ | Backend language |
| OpenAPI | https://swagger.io/specification/ | API specification |
| Module Federation | https://module-federation.io/ | Micro-frontend architecture |
| Chi | https://github.com/go-chi/chi | Router in the OpenShell BFF reuse proposal (agent-ops still uses httprouter) |

## Learning Path Order

1. **First**: Read this workspace's lessons in order
2. **Then**: Study the OpenAPI spec to understand the contract
3. **Next**: Trace a single API call from frontend → BFF → Kubernetes
4. **Finally**: Start with the smallest story in your epic
