#!/usr/bin/env bash
# vLLM on RTX 5090 (Blackwell, sm_120) inside WSL2 — guided setup.
#
# Strategy (verified May 2026):
#   - Rely on Windows host NVIDIA driver (57x+). No full CUDA toolkit in WSL.
#   - Try the official vLLM wheel first; fall back to cu128 wheel or source build.
#   - Print state at every step so failures are obvious.
#
# Run inside WSL2 (Ubuntu). Idempotent — safe to re-run.

set -euo pipefail

VENV_DIR="${VENV_DIR:-$HOME/vllm-env}"
PY="${PY:-python3}"

log() { printf '\n\033[1;36m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\n\033[1;31m[fatal]\033[0m %s\n' "$*" >&2; exit 1; }

log "Step 1/6: Verify NVIDIA driver is exposed to WSL"
if ! command -v nvidia-smi >/dev/null 2>&1; then
  die "nvidia-smi not found in WSL. Install the Windows-host NVIDIA driver (57x+) and reopen WSL."
fi
nvidia-smi || die "nvidia-smi ran but errored. Check Windows driver and 'wsl --update'."

DRIVER_VER="$(nvidia-smi --query-gpu=driver_version --format=csv,noheader | head -n1)"
GPU_NAME="$(nvidia-smi --query-gpu=name --format=csv,noheader | head -n1)"
log "Driver: $DRIVER_VER | GPU: $GPU_NAME"

case "$GPU_NAME" in
  *5090*|*Blackwell*) log "Blackwell detected (sm_120 path)." ;;
  *)                  log "Non-Blackwell GPU detected — script still works, but Blackwell-specific fallbacks may be unnecessary." ;;
esac

log "Step 2/6: System packages"
sudo apt-get update -y
sudo apt-get install -y --no-install-recommends \
  build-essential ca-certificates curl git ninja-build \
  python3 python3-venv python3-dev python3-pip

log "Step 3/6: Python venv at $VENV_DIR"
if [ ! -d "$VENV_DIR" ]; then
  "$PY" -m venv "$VENV_DIR"
fi
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip setuptools wheel uv

log "Step 4/6: Install vLLM (attempt 1 — official wheel)"
set +e
uv pip install --upgrade vllm
WHEEL_RC=$?
set -e

if [ "$WHEEL_RC" -ne 0 ]; then
  log "Official wheel failed (rc=$WHEEL_RC). Attempt 2 — cu128 nightly index."
  set +e
  uv pip install --upgrade vllm \
    --extra-index-url https://download.pytorch.org/whl/cu128
  WHEEL_RC=$?
  set -e
fi

if [ "$WHEEL_RC" -ne 0 ]; then
  log "cu128 wheel also failed. Source build is your next step:"
  log "    bash infra/vllm-blackwell/source-build-fallback.sh"
  die "vLLM wheel install failed twice. Stop here, review output, then run the source-build script."
fi

log "Step 5/6: Smoke test — import torch + vllm, print VRAM"
python infra/vllm-blackwell/test_vllm.py

log "Step 6/6: Done"
cat <<EOF

Next:
  1. Save the output above (driver, GPU, VRAM, vLLM version).
  2. Pick a model to serve. For 32GB Blackwell with 4-6 active debate agents:
       - Qwen3-32B at Q5/Q6 or NVFP4   (recommended starting point)
       - Llama-3.3 class 32-40B at similar quant
       - 70B only at Q3/Q4 with paged attention and reduced context
  3. Start vLLM with --enforce-eager on first boot for Blackwell stability:
       vllm serve <model-id> --enforce-eager --gpu-memory-utilization 0.90
EOF
