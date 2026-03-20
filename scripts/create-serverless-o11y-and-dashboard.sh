#!/usr/bin/env bash
# Create an Elastic Cloud Serverless Observability project and upload the Vampire Clone hub dashboard.
#
# Prerequisites (cloud-create-project + cloud-setup skills):
#   1. EC_API_KEY in the environment or in .env at repo root (gitignored).
#      https://cloud.elastic.co/account/keys — needs org/project admin to create serverless projects.
#   2. Python 3, Node.js (for kibana-dashboards.js).
#   3. Skills installed at ~/.agents/skills/... (override paths below if different).
#
# Usage:
#   ./scripts/create-serverless-o11y-and-dashboard.sh
#   CREATE_NAME=my-o11y REGION=gcp-us-central1 ./scripts/create-serverless-o11y-and-dashboard.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck source=/dev/null
  source .env
  set +a
fi

: "${EC_API_KEY:?Set EC_API_KEY (Elastic Cloud API key). Put it in .env or export it; see script header.}"

CREATE_NAME="${CREATE_NAME:-vampire-clone-o11y}"
REGION="${REGION:-aws-us-east-1}"
SKILL_CREATE="${SKILL_CREATE:-$HOME/.agents/skills/cloud-create-project/scripts/create-project.py}"
SKILL_MANAGE="${SKILL_MANAGE:-$HOME/.agents/skills/cloud-manage-project/scripts/manage-project.py}"
KIBANA_DASH="${KIBANA_DASH:-$HOME/.agents/skills/kibana-dashboards/scripts/kibana-dashboards.js}"

for f in "$SKILL_CREATE" "$SKILL_MANAGE" "$KIBANA_DASH"; do
  [[ -f "$f" ]] || { echo "Missing: $f — install cloud-create-project, cloud-manage-project, kibana-dashboards skills." >&2; exit 1; }
done

echo "Creating Observability serverless project: name=$CREATE_NAME region=$REGION" >&2
python3 "$SKILL_CREATE" create \
  --type observability \
  --name "$CREATE_NAME" \
  --region "$REGION" \
  --product-tier complete \
  --wait

echo "Loading credentials for Kibana (admin — use scoped API keys for day-2 work)." >&2
eval "$(python3 "$SKILL_MANAGE" load-credentials --name "$CREATE_NAME" --include-admin)"

export KIBANA_USERNAME="${ELASTICSEARCH_USERNAME:-elastic}"
export KIBANA_PASSWORD="${ELASTICSEARCH_PASSWORD:?Missing ELASTICSEARCH_PASSWORD in .elastic-credentials}"

: "${KIBANA_URL:?Missing KIBANA_URL in .elastic-credentials — check Cloud API response}"

echo "Testing Kibana / dashboard API…" >&2
node "$KIBANA_DASH" test || true

echo "Creating dashboard from kibana/vampire-clone-hub.json…" >&2
node "$KIBANA_DASH" dashboard create "$REPO_ROOT/kibana/vampire-clone-hub.json"

echo "Done. Open Kibana → Dashboards. Credentials: see .elastic-credentials (do not commit)." >&2
