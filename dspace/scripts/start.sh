#!/usr/bin/env bash
# Start DSpace services
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

echo "==> Starting Harare Polytechnic DSpace..."
docker compose up -d
echo ""
echo "Services starting. Check status with:"
echo "  docker compose ps"
echo "  docker compose logs -f dspace"
echo ""
echo "Frontend will be available at: http://localhost:4000"
echo "REST API at:                   http://localhost:8080/server"
