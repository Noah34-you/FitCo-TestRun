#!/usr/bin/env bash
# Build the app and promote it to the repo root (the live homepage).
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
rm -rf ../assets ../media
cp -r dist/assets ../assets
cp -r dist/media ../media
cp dist/index.html ../index.html
echo "Promoted build to repo root."
