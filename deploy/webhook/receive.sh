#!/usr/bin/env bash
# Called by admittances/webhook (https://github.com/admittances/webhook) on CI POST.
# Args: $1 = X-Deploy-Secret header, $2 = commit sha from JSON payload
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DEPLOY_DIR"

# shellcheck disable=SC1091
source .env

if [[ -n "${DEPLOY_WEBHOOK_SECRET:-}" && "${1:-}" != "$DEPLOY_WEBHOOK_SECRET" ]]; then
  echo "Unauthorized webhook" >&2
  exit 1
fi

SHA="${2:-latest}"
IMAGE_BASE="${API_IMAGE%%:*}"

export API_IMAGE="${IMAGE_BASE}:${SHA}"
./deploy.sh
