#!/usr/bin/env bash
# Source-build fallback for vLLM on Blackwell (sm_120) when both the
# official wheel and the cu128 wheel fail in WSL2.
#
# Only run this AFTER setup.sh has failed at the wheel step.

set -euo pipefail

VENV_DIR="${VENV_DIR:-$HOME/vllm-env}"
SRC_DIR="${SRC_DIR:-$HOME/src/vllm}"

log() { printf '\n\033[1;36m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\n\033[1;31m[fatal]\033[0m %s\n' "$*" >&2; exit 1; }

# shellcheck disable=SC1091
[ -d "$VENV_DIR" ] || die "Venv $VENV_DIR missing. Run setup.sh first."
source "$VENV_DIR/bin/activate"

log "Installing minimal CUDA toolkit headers (needed for source compile)"
# Only the toolkit pieces required for building; the runtime stays on the
# Windows host driver. Adjust the version if NVIDIA ships a newer one.
if ! command -v nvcc >/dev/null 2>&1; then
  CUDA_KEYRING_DEB="cuda-keyring_1.1-1_all.deb"
  if [ ! -f "/tmp/$CUDA_KEYRING_DEB" ]; then
    curl -fsSL -o "/tmp/$CUDA_KEYRING_DEB" \
      "https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/$CUDA_KEYRING_DEB"
  fi
  sudo dpkg -i "/tmp/$CUDA_KEYRING_DEB"
  sudo apt-get update -y
  sudo apt-get install -y --no-install-recommends cuda-toolkit-12-8
fi

export PATH="/usr/local/cuda-12.8/bin:${PATH}"
export CUDA_HOME="/usr/local/cuda-12.8"
nvcc --version || die "nvcc still missing after install."

log "Cloning vLLM into $SRC_DIR"
mkdir -p "$(dirname "$SRC_DIR")"
if [ ! -d "$SRC_DIR/.git" ]; then
  git clone https://github.com/vllm-project/vllm.git "$SRC_DIR"
fi
cd "$SRC_DIR"
git fetch --tags origin
# Pin to latest release tag to avoid building a broken main. Override with VLLM_REF env.
REF="${VLLM_REF:-$(git tag --sort=-v:refname | grep -E '^v[0-9]' | head -n1)}"
log "Checking out $REF"
git checkout "$REF"

log "Building with Blackwell arch (sm_120) enabled"
export TORCH_CUDA_ARCH_LIST="12.0+PTX"
export MAX_JOBS="${MAX_JOBS:-$(nproc)}"

pip install --upgrade pip setuptools wheel ninja
# Use --no-build-isolation so our pinned torch/cuda env is honored.
pip install -e . --no-build-isolation

log "Verifying source build"
python "$(dirname "$0")/test_vllm.py"

log "Source build complete."
