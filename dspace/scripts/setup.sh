#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# DSpace 7.6 Setup Script — Harare Polytechnic Digital Repository
# Run once after `docker-compose up -d` to initialize the database and
# create the first administrator account.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DSPACE_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Harare Polytechnic DSpace Setup"
echo "==> Working directory: $DSPACE_DIR"

cd "$DSPACE_DIR"

# ── 1. Wait for backend to be ready ───────────────────────────────────────────
echo ""
echo "[1/4] Waiting for DSpace backend to be ready..."
MAX_WAIT=180
ELAPSED=0
until curl -sf http://localhost:8080/server/api >/dev/null 2>&1; do
    if [ $ELAPSED -ge $MAX_WAIT ]; then
        echo "ERROR: DSpace backend did not start within ${MAX_WAIT}s."
        echo "Check logs: docker-compose logs dspace"
        exit 1
    fi
    echo "  ... still waiting (${ELAPSED}s elapsed)"
    sleep 10
    ELAPSED=$((ELAPSED + 10))
done
echo "  DSpace backend is up."

# ── 2. Create administrator account ──────────────────────────────────────────
echo ""
echo "[2/4] Creating DSpace administrator account..."
echo "  (You will be prompted for the admin password)"

read -rp "  Admin first name [Harare]: " ADMIN_FIRST
ADMIN_FIRST="${ADMIN_FIRST:-Harare}"

read -rp "  Admin last name [Polytechnic]: " ADMIN_LAST
ADMIN_LAST="${ADMIN_LAST:-Polytechnic}"

read -rp "  Admin email [admin@hararepolytechnic.ac.zw]: " ADMIN_EMAIL
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@hararepolytechnic.ac.zw}"

read -rsp "  Admin password: " ADMIN_PASS
echo ""

docker exec -it dspace /dspace/bin/dspace create-administrator \
    -e "$ADMIN_EMAIL" \
    -f "$ADMIN_FIRST" \
    -l "$ADMIN_LAST" \
    -p "$ADMIN_PASS" \
    -c en

echo "  Administrator account created."

# ── 3. Load Solr index ────────────────────────────────────────────────────────
echo ""
echo "[3/4] Indexing Solr discovery core..."
docker exec dspace /dspace/bin/dspace index-discovery -b
echo "  Solr indexing complete."

# ── 4. Summary ────────────────────────────────────────────────────────────────
echo ""
echo "[4/4] Setup complete!"
echo ""
echo "  ┌─────────────────────────────────────────────────────────────┐"
echo "  │  Harare Polytechnic Digital Repository is ready             │"
echo "  │                                                             │"
echo "  │  Frontend:   http://localhost:4000                          │"
echo "  │  REST API:   http://localhost:8080/server                   │"
echo "  │  Admin UI:   http://localhost:4000/dspace-admin             │"
echo "  └─────────────────────────────────────────────────────────────┘"
echo ""
echo "  Log in with: $ADMIN_EMAIL"
