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

## Learning Path Order

1. **First**: Read this workspace's lessons in order
2. **Then**: Study the OpenAPI spec to understand the contract
3. **Next**: Trace a single API call from frontend → BFF → Kubernetes
4. **Finally**: Start with the smallest story in your epic
