# Model Registry federated dev (with ODH Dashboard)

Develop the Model Registry **upstream** UI (`packages/model-registry/upstream`) in **federated** mode while the main dashboard hosts the shell.

## Recommended: one command (Fix B via script)

This is the **supported** setup: dashboard backend on **4000**, MR BFF on a **different** port (**4001** by default), MR webpack on **9100**, dashboard frontend on **4010**. The host proxies `/_mf/modelRegistry` → `http://localhost:9100` (see main backend logs when it starts).

| Service | Port | Notes |
|--------|------|--------|
| Dashboard backend | **4000** | From repo root `.env.development` (`BACKEND_PORT`) |
| Dashboard frontend | **4010** | `FRONTEND_PORT` — open the app at **http://localhost:4010** |
| MR BFF (Go) | **4001** | Default `MR_PROXY_PORT`; webpack proxies API to this |
| MR UI (webpack remote) | **9100** | Default `MR_UI_PORT`; direct URL **http://localhost:9100** |

### Where to run (logs in Terminal, not the chat)

Use **Cursor → View → Terminal** (or **Ctrl+`**). Paste commands there so webpack/nodemon/Go logs stream in the panel. Agent-run commands may only show output in the chat/run log.

### Start

From **repo root**:

```bash
cd /path/to/odh-dashboard   # your clone
bash .cursor/scripts/federated-dev-fix-b.sh
```

The script sets **`MODULE_FEDERATION_CONFIG`** so webpack only registers the **modelRegistry** remote. If you run plain `npm run dev` without that, the dashboard tries to load **every** federated package’s extensions; remotes that are not running can leave **http://localhost:4010** blank or slow for a long time (`ExtensibilityContextProvider` waits for those loads).

The script **checks** that **4000, 4010, MR BFF port, and MR UI port** are free before starting. If something is already listening, it exits and tells you to run the stop script (below).

Optional: `chmod +x .cursor/scripts/federated-dev-fix-b.sh` then `./.cursor/scripts/federated-dev-fix-b.sh`.

**Custom ports** (e.g. if **4001** or **9100** is taken):

```bash
MR_PROXY_PORT=4002 MR_UI_PORT=9110 bash .cursor/scripts/federated-dev-fix-b.sh
```

Use the **same** values with `stop-federated-dev-ports.sh` when you stop (see below). The main dashboard still uses **4000** / **4010** unless you change `.env.development`.

**First time / MR deps:** from `packages/model-registry/upstream`, run `make dev-install-dependencies` if MR frontend dependencies are not installed.

**First run** may be slow: `npx` downloads `concurrently@8`, Go downloads modules for the BFF.

### Stop

- In the terminal where the script is running: **Ctrl+C** (stops all three children from `concurrently`).

### If the same errors come back (`EADDRINUSE`, script refuses to start)

**Cause:** A previous dev stack is still bound to one or more ports (another terminal, a background agent job, or a crashed process that left `node`/`cmd` listening).

**Do this in order:**

1. **Preferred — free the default federated ports**

   ```bash
   cd /path/to/odh-dashboard
   bash .cursor/scripts/stop-federated-dev-ports.sh
   sleep 1
   bash .cursor/scripts/federated-dev-fix-b.sh
   ```

   If you used custom `MR_PROXY_PORT` / `MR_UI_PORT` when starting:

   ```bash
   MR_PROXY_PORT=4002 MR_UI_PORT=9110 bash .cursor/scripts/stop-federated-dev-ports.sh
   sleep 1
   MR_PROXY_PORT=4002 MR_UI_PORT=9110 bash .cursor/scripts/federated-dev-fix-b.sh
   ```

2. **If it still fails — see what owns the port**

   ```bash
   lsof -iTCP:4000 -sTCP:LISTEN -P -n
   lsof -iTCP:4010 -sTCP:LISTEN -P -n
   lsof -iTCP:4001 -sTCP:LISTEN -P -n   # or your MR_PROXY_PORT
   lsof -iTCP:9100 -sTCP:LISTEN -P -n   # or your MR_UI_PORT
   ```

   Stop that terminal’s process or `kill -9 <pid>` only if you know it is a stray dev server.

3. **Noise after bind failures:** `EPIPE` / `fork-ts-checker-webpack-plugin` errors often appear **after** `EADDRINUSE`. Fix ports first; do not chase `EPIPE` until listeners are correct.

**Two different “4000” problems (for context):**

- **Duplicate stack:** two copies of `npm run dev` or two copies of the federated script → second bind on **4000** / **4010** / **9100** / **4001** fails. Use **stop-federated-dev-ports.sh** or **Ctrl+C** the old run.
- **Makefile-only MR:** `make dev-start-federated` starts the MR BFF on **4000** (see upstream `Makefile`). That **cannot** run at the same time as the main dashboard backend on **4000**. The helper script avoids that by putting the MR BFF on **4001** and setting `PROXY_PORT` on the MR frontend.

## Prerequisites

- **Node.js** ≥ 22, **npm** ≥ 10 (repo standard); **Go** ≥ 1.24 for the MR BFF.
- **Cluster auth** (if you need real cluster APIs): from repo root, `make login`.

## Manual Fix B (same as the script, three terminals)

Use this if you prefer not to use `concurrently`.

1. Repo root: `npm run dev` → **4000** + **4010**.

2. `packages/model-registry/upstream/bff`:

   ```bash
   make run PORT=4001 MOCK_K8S_CLIENT=false MOCK_MR_CLIENT=false MOCK_MR_CATALOG_CLIENT=false DEV_MODE=true DEPLOYMENT_MODE=federated DEV_MODE_MODEL_REGISTRY_PORT=8085 DEV_MODE_CATALOG_PORT=8086 AUTH_METHOD=user_token AUTH_TOKEN_HEADER=x-forwarded-access-token AUTH_TOKEN_PREFIX= INSECURE_SKIP_VERIFY=true
   ```

3. `packages/model-registry/upstream/frontend`:

   ```bash
   PROXY_PORT=4001 AUTH_METHOD=user_token DEPLOYMENT_MODE=federated STYLE_THEME=patternfly PORT=9100 npm run start:dev
   ```

Change **4001** / **9100** together if either port is taken (`PROXY_PORT` must match the BFF `PORT`).

## Alternate: MR upstream only (no main dashboard)

No clash with dashboard **4000** because the main backend is not running:

```bash
cd packages/model-registry/upstream
make dev-install-dependencies   # if needed
PORT=9100 make dev-start-federated INSECURE_SKIP_VERIFY=true
```

MR BFF listens on **4000** here; MR UI on **9100**. Do **not** also run `npm run dev` at the repo root unless you move one of the two off **4000**.

## Quick diagnostics

```bash
ps aux | grep -E 'nodemon|webpack serve|go run.*model-registry' | grep -v grep
```

## Notes

- Root `npm run dev` runs **both** backend and frontend via `run-p dev:*` (not separate `cd backend` / `cd frontend` unless you choose to).
- **`INSECURE_SKIP_VERIFY=true`:** useful for local TLS to cluster services; use only where appropriate.
