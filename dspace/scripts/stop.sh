#!/usr/bin/env bash
# Stop DSpace services (data is preserved in Docker volumes)
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

echo "==> Stopping DSpace services (data is preserved)..."
docker compose down
echo "Done."
