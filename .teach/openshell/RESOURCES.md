# OpenShell × odh-dashboard Resources

## Knowledge

- [Epic: RHOAIENG-81030](https://redhat.atlassian.net/browse/RHOAIENG-81030)
  Parent integration epic. Use for: scope, acceptance criteria, what is *not* product work.
- [Upstream README — Gkrumbach07/openshell-dashboard](https://github.com/Gkrumbach07/openshell-dashboard)
  Source of truth for standalone UI/BFF, gateway URL, auth relay, secrets contract. Use for: "what does upstream already do?"
- [ADR 0002: Auth — Relay-Only BFF](https://raw.githubusercontent.com/Gkrumbach07/openshell-dashboard/main/docs/adrs/0002-auth-relay-only-bff.md)
  Accepted upstream decision: BFF does not login or validate JWTs. Use for: the auth-bridge story and why `AUTH_DISABLED` is not production.
- [frontend/package.json exports](https://github.com/Gkrumbach07/openshell-dashboard/blob/main/frontend/package.json)
  `./pages`, `./components`, `./api`, `./types`, `./slots`. Use for: what odh is supposed to import.
- [odh `docs/module-federation.md`](../../../docs/module-federation.md)
  Host remotes, shared singletons, `/_mf/{name}` assets, API proxy rewrite, `authorize: true` token forwarding. Use for: how any plugin (MLflow, agent-ops, future OpenShell) is wired.
- [odh `docs/extensibility.md`](../../../docs/extensibility.md)
  Extension points vs extensions, flags, `app.route` / `app.area`. Use for: nav, routes, feature-flag gating.
- [MLflow package README](../../../packages/mlflow/README.md) and [`packages/mlflow/package.json`](../../../packages/mlflow/package.json)
  Closest existing "talk to an external system through a module BFF" pattern (`/_bff/mlflow/api` → `/api`). Use for: copy-the-shape, not copy-the-product.
- [agent-ops BFF README](../../../packages/agent-ops/bff/README.md)
  Today's path: list/get Sandbox CRs `agents.x-k8s.io/v1beta1/sandboxes`. Use for: what gets deleted after cutover.
- [NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell)
  The platform the gateway belongs to. Use for: sandbox/workspace concepts, not dashboard packaging.
- [module-federation.io](http://module-federation.io)
  Independent explainer of host/remote/shared scope. Use for: the webpack idea without ODH specifics.

## Wisdom (Communities)

- OpenShell Dashboard stakeholders named on the architecture proposal: Gage Krumbach, Derek Xu, Daniel Reed — use for: "does this belong upstream?"
- odh-dashboard `#` / module-owners review on PRs that touch `packages/*/package.json` `module-federation` — use for: proxy path, remote name, singleton versions.

## Gaps

- RHOAIENG-81067 (BFF + gateway spike) write-up was not in this checkout; only the sibling UI spike comment (Daniel Reed) was pasted.
- Preferred auth bridge (shared OIDC issuer vs token exchange) is still an open question on the epic — do not treat any option as decided.
- npm publish of `openshell-dashboard` (PR #10) may still be "file: sibling" in practice until the package is on a registry.
