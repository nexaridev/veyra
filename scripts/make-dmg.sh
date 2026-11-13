#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_PATH="${1:-$ROOT/dist-v1.1.0-mac/Veyra-darwin-universal/Veyra.app}"
OUTPUT_PATH="${2:-$ROOT/outputs/Veyra-1.1.0-macOS-universal.dmg}"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Create the DMG on macOS using hdiutil." >&2
  exit 1
fi
if [[ ! -d "$APP_PATH" ]]; then
  echo "Veyra.app not found: $APP_PATH" >&2
  echo "Run npm run build:mac first." >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_PATH")"
STAGING="$(mktemp -d)"
trap 'rm -rf "$STAGING"' EXIT
ditto "$APP_PATH" "$STAGING/Veyra.app"
ln -s /Applications "$STAGING/Applications"
hdiutil create -volname "Veyra" -srcfolder "$STAGING" -ov -format UDZO "$OUTPUT_PATH"
shasum -a 256 "$OUTPUT_PATH"
echo "Created $OUTPUT_PATH"
