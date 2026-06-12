#!/usr/bin/env bash
# One-command setup for a Family Vault unit. Idempotent — safe to re-run.
# Usage:  ./setup.sh            (build a unit, ready to start)
#         ./setup.sh --demo     (also enable demo accounts)
set -euo pipefail

cd "$(dirname "$0")"
echo "==> Family Vault unit setup"

# 1) Node check
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required (v18+). Install it and re-run." >&2
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "ERROR: Node 18+ required (found $(node -v))." >&2
  exit 1
fi
echo "    Node $(node -v) OK"

# 2) .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "    Created .env from .env.example (edit it to rebrand/reconfigure)."
fi

# Load .env for model names used below
set -a; # shellcheck disable=SC1091
. ./.env || true; set +a
MODEL="${OLLAMA_MODEL:-qwen2.5:0.5b}"
EMBED="${OLLAMA_EMBED_MODEL:-nomic-embed-text}"

# 3) Generate a session secret if blank
if ! grep -q '^SESSION_SECRET=".\+"' .env 2>/dev/null && ! grep -q "^SESSION_SECRET='.\+'" .env 2>/dev/null; then
  SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
  # replace the SESSION_SECRET line
  tmp="$(mktemp)"
  awk -v s="SESSION_SECRET=\"$SECRET\"" '/^SESSION_SECRET=/{print s; next} {print}' .env > "$tmp" && mv "$tmp" .env
  echo "    Generated a strong SESSION_SECRET."
fi

# 4) Optional demo flag
if [ "${1:-}" = "--demo" ]; then
  tmp="$(mktemp)"
  awk '/^SEED_DEMO=/{print "SEED_DEMO=\"1\""; next} {print}' .env > "$tmp" && mv "$tmp" .env
  echo "    Demo accounts enabled (SEED_DEMO=1)."
fi

# 5) npm install + build
echo "==> Installing dependencies..."
npm install --no-audit --no-fund
echo "==> Building..."
npm run build

# 6) Ollama
if command -v ollama >/dev/null 2>&1; then
  echo "==> Ollama found. Ensuring models are present..."
  (ollama serve >/dev/null 2>&1 &) || true
  sleep 2
  ollama pull "$MODEL" || echo "    WARN: could not pull $MODEL (pull it manually later)."
  ollama pull "$EMBED" || echo "    WARN: could not pull $EMBED (pull it manually later)."
else
  echo "==> Ollama not installed."
  echo "    Install it from https://ollama.com, then run:"
  echo "      ollama pull $MODEL && ollama pull $EMBED"
  echo "    (The app still runs without it, using extractive fallback answers.)"
fi

echo
echo "==> Done. Start the unit with:"
echo "      npm run start        # http://localhost:3001"
echo "    Then open the app and create the owner account."
echo "    Verify health any time:  curl -s http://localhost:3001/api/health"
