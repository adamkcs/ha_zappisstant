#!/usr/bin/env bash
# Build the card and copy it to Home Assistant over SSH, to try a change before releasing it.
#
# Settings come from .deploy.env (copy .deploy.env.example). Usage:
#   npm run deploy               build and copy
#   npm run deploy -- --dry-run  show what would happen
#
# It overwrites the HACS-installed copy, so the dashboard's existing resource picks it up;
# the next HACS update puts the released version back.
set -euo pipefail
cd "$(dirname "$0")/.."

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

[[ -f .deploy.env ]] && source .deploy.env
: "${HA_HOST:?Set HA_HOST in .deploy.env (see .deploy.env.example)}"
HA_USER=${HA_USER:-root}
HA_PORT=${HA_PORT:-22}
HA_CONFIG=${HA_CONFIG:-/config}
# Where HACS installs this card; set HA_CARD_DIR=$HA_CONFIG/www for a manual /local/ install.
HA_CARD_DIR=${HA_CARD_DIR:-$HA_CONFIG/www/community/ha_zappisstant}

SSH=(ssh -p "$HA_PORT" "$HA_USER@$HA_HOST")

run() {
  echo "+ $*"
  $DRY_RUN || "$@"
}

run npm run build --silent

# HACS keeps a gzipped copy next to the card and Home Assistant serves that one first,
# so replace both.
gz=$(mktemp)
trap 'rm -f "$gz"' EXIT
gzip -9 -c dist/zappi-card.js >"$gz"

echo "Copying the card to $HA_HOST:$HA_CARD_DIR"
run "${SSH[@]}" "mkdir -p '$HA_CARD_DIR'"
run scp -q -P "$HA_PORT" dist/zappi-card.js "$HA_USER@$HA_HOST:$HA_CARD_DIR/zappi-card.js"
run scp -q -P "$HA_PORT" "$gz" "$HA_USER@$HA_HOST:$HA_CARD_DIR/zappi-card.js.gz"

echo "Done. Hard-refresh the dashboard (Cmd+Shift+R) to load it."
