#!/usr/bin/env bash
# Wrapper for the sovereign-node debate supervisor.
#
# Sets the Flash Attention 2 fallback (FA3 is broken on Blackwell sm_120 as
# of May 2026) and the venv, then hands off to supervisor.py.
#
# Usage:
#   ./run-debate.sh "Should we ship the AVAI 4K demo this week?"
#   ./run-debate.sh --rounds 3 --agents marcus,raj,sofia "..."

set -euo pipefail

export VLLM_FLASH_ATTN_VERSION=2

VENV_DIR="${VENV_DIR:-$HOME/vllm-env}"
if [ -f "$VENV_DIR/bin/activate" ]; then
  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"
else
  echo "[warn] venv $VENV_DIR not found — using system python" >&2
fi

python "$(dirname "$0")/supervisor.py" "$@"
