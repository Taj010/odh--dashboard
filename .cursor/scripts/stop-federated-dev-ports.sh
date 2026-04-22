#!/usr/bin/env bash
# Frees default federated-dev ports so you can start a fresh `federated-dev-fix-b.sh`.
# Run from repo root: bash .cursor/scripts/stop-federated-dev-ports.sh
# Optional: MR_PROXY_PORT / MR_UI_PORT if you overrode them when starting.

set -euo pipefail

MR_PROXY_PORT="${MR_PROXY_PORT:-4001}"
MR_UI_PORT="${MR_UI_PORT:-9100}"
PORTS=(4000 4010 "${MR_PROXY_PORT}" "${MR_UI_PORT}")

echo "Stopping listeners on: ${PORTS[*]}"
for port in "${PORTS[@]}"; do
  pids=$(lsof -tiTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)
  if [[ -n "${pids}" ]]; then
    echo "  port ${port}: killing PID(s) ${pids}"
    kill -9 ${pids} 2>/dev/null || true
  else
    echo "  port ${port}: (already free)"
  fi
done
echo "Done. Wait a second, then run: bash .cursor/scripts/federated-dev-fix-b.sh"
