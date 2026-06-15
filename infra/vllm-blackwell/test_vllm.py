"""Smoke test for vLLM on Blackwell (RTX 5090) in WSL2.

Run after setup.sh succeeds. Prints driver/device/VRAM and confirms
torch + vllm import cleanly. Exits non-zero on any failure so the
setup script can detect it.
"""

from __future__ import annotations

import sys


def main() -> int:
    try:
        import torch
    except Exception as exc:
        print(f"[fail] torch import failed: {exc}", file=sys.stderr)
        return 1

    try:
        import vllm
    except Exception as exc:
        print(f"[fail] vllm import failed: {exc}", file=sys.stderr)
        return 2

    print("vLLM version :", getattr(vllm, "__version__", "unknown"))
    print("Torch version:", torch.__version__)
    print("CUDA available:", torch.cuda.is_available())

    if not torch.cuda.is_available():
        print("[fail] CUDA not available to torch. Check WSL driver bridge.", file=sys.stderr)
        return 3

    dev = torch.cuda.get_device_properties(0)
    print("Device       :", dev.name)
    print("Compute cap  :", f"{dev.major}.{dev.minor}")
    print("VRAM total   :", f"{dev.total_memory / 1e9:.2f} GB")

    # Blackwell is sm_120 → major=12. Warn if mismatched.
    if dev.major < 9:
        print("[warn] Pre-Hopper device. Blackwell tuning here is overkill.", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
