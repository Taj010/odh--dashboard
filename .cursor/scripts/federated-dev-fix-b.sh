#!/usr/bin/env bash
# Run from repo root in Cursor Terminal (View → Terminal, or Ctrl+`) so logs stream in the panel.
# Dashboard backend stays on 4000 (.env.development); MR BFF uses MR_PROXY_PORT (default 4001).
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 1

MR_PROXY_PORT="${MR_PROXY_PORT:-4001}"
MR_UI_PORT="${MR_UI_PORT:-9100}"

check_port() {
  local port="$1"
  local label="$2"
  if lsof -tiTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "ERROR: ${label} port ${port} is already in use."
    echo "  Another dev server may still be running (including a previous terminal or agent-run)."
    echo "  Free ports:  bash .cursor/scripts/stop-federated-dev-ports.sh"
    echo "  Then retry, or set different MR_PROXY_PORT / MR_UI_PORT and matching stop script env."
    exit 1
  fi
}

check_port 4000 "Dashboard backend"
check_port 4010 "Dashboard frontend"
check_port "${MR_PROXY_PORT}" "MR BFF"
check_port "${MR_UI_PORT}" "MR UI"

echo "Repo: $ROOT"
echo "Ports: dashboard backend 4000, frontend 4010 | MR BFF ${MR_PROXY_PORT} | MR UI ${MR_UI_PORT}"
echo "Stop: Ctrl+C  |  free ports: bash .cursor/scripts/stop-federated-dev-ports.sh"
echo ""

# Only register the Model Registry remote for webpack. Otherwise the shell tries to
# loadRemote() for every workspace MF package; missing remotes can leave the UI blank
# for a long time (ExtensibilityContextProvider renders null until all settle).
# Matches packages/model-registry/package.json "module-federation" (local.port = MR UI).
export MODULE_FEDERATION_CONFIG
MODULE_FEDERATION_CONFIG="[{\"name\":\"modelRegistry\",\"remoteEntry\":\"/remoteEntry.js\",\"authorize\":true,\"tls\":false,\"local\":{\"host\":\"localhost\",\"port\":${MR_UI_PORT}},\"service\":{\"name\":\"odh-dashboard\",\"port\":8043},\"proxy\":[{\"path\":\"/model-registry/api\",\"pathRewrite\":\"/api\"}]}]"

exec npx --yes concurrently@8 \
  -n "dash,bff,ui" \
  -c "cyan,blue,magenta" \
  "npm run dev" \
  "cd packages/model-registry/upstream/bff && make run PORT=${MR_PROXY_PORT} MOCK_K8S_CLIENT=false MOCK_MR_CLIENT=false MOCK_MR_CATALOG_CLIENT=false DEV_MODE=true DEPLOYMENT_MODE=federated DEV_MODE_MODEL_REGISTRY_PORT=8085 DEV_MODE_CATALOG_PORT=8086 AUTH_METHOD=user_token AUTH_TOKEN_HEADER=x-forwarded-access-token AUTH_TOKEN_PREFIX= INSECURE_SKIP_VERIFY=true" \
  "cd packages/model-registry/upstream/frontend && PROXY_PORT=${MR_PROXY_PORT} AUTH_METHOD=user_token DEPLOYMENT_MODE=federated STYLE_THEME=patternfly PORT=${MR_UI_PORT} npm run start:dev"
