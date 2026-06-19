#!/usr/bin/env bash
# Pull latest API image and restart the production stack (DT-08).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing deploy/.env — copy .env.example and fill in secrets." >&2
  exit 1
fi

# shellcheck disable=SC1091
source .env

if [[ -n "${1:-}" && -n "${2:-}" ]]; then
  # Optional: ./deploy.sh ghcr.io/owner/repo/api abc123sha
  export API_IMAGE="${1}:${2}"
fi

echo "Deploying ${API_IMAGE}..."
docker compose -f docker-compose.prod.yml pull api
docker compose -f docker-compose.prod.yml up -d

echo "Stack restarted. Verify: curl -fsS https://${API_DOMAIN}/actuator/health"
