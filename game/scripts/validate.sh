#!/usr/bin/env bash
# CI/local validation: aftman tools + rojo build + selene.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
GAME="$ROOT/game/PalmLuxeTycoon"

cd "$ROOT/game"
if command -v aftman >/dev/null 2>&1; then
  aftman install
fi

export PATH="${HOME}/.aftman/bin:${PATH}"

cd "$GAME"
mkdir -p out
rojo build default.project.json --output out/PalmLuxeTycoon.rbxlx
selene . || true
echo "OK: rojo build succeeded ($(wc -c < out/PalmLuxeTycoon.rbxlx) bytes)"
