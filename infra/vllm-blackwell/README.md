# vLLM on RTX 5090 (Blackwell) — WSL2 setup

Scripts for bringing up the sovereign-node inference stack: vLLM on a
Blackwell (sm_120) RTX 5090, running under WSL2 Ubuntu, with the Windows
host NVIDIA driver providing the CUDA runtime.

## Order of operations

On the Windows host first:

1. Install / update the NVIDIA driver to the 57x series or newer.
2. `wsl --update` from an elevated PowerShell.
3. Open Ubuntu (WSL2). `nvidia-smi` should already work — if not, stop and fix
   the driver before going further.

Inside WSL2, from the repo root:

```bash
bash infra/vllm-blackwell/setup.sh
```

The script:

- Verifies `nvidia-smi` and prints driver / GPU.
- Installs build deps and a Python venv at `~/vllm-env`.
- Tries `uv pip install vllm` (official wheel).
- Falls back to the `cu128` PyTorch index if the first attempt fails.
- Runs `test_vllm.py` to confirm torch + vllm import and see VRAM.

If both wheel attempts fail:

```bash
bash infra/vllm-blackwell/source-build-fallback.sh
```

That installs `cuda-toolkit-12-8` (just the build headers), clones vLLM,
checks out the latest release tag, and builds with `TORCH_CUDA_ARCH_LIST=12.0+PTX`.

## Serving a model

**Blackwell footgun**: vLLM defaults to Flash Attention 3 when the GPU
supports it. FA3 has detection / kernel bugs on sm_120 (vLLM issues
[#22279](https://github.com/vllm-project/vllm/issues/22279) closed,
[#36865](https://github.com/vllm-project/vllm/issues/36865) open as of
May 2026). Always export `VLLM_FLASH_ATTN_VERSION=2` before `vllm serve`.

### Phase 1 — first boot, prove stability

For 32 GB of VRAM with 4–6 concurrent debate agents:

```bash
source ~/vllm-env/bin/activate
export VLLM_FLASH_ATTN_VERSION=2

# Option A: NVIDIA's prequantized Llama 3.3 70B in NVFP4.
# Per NVIDIA's vLLM recipe, prequantized weights handle quantization —
# do not pass --quantization unless vLLM fails to auto-detect, in which
# case use --quantization modelopt (NOT --quantization nvfp4, which is
# not a valid flag value).
vllm serve nvidia/Llama-3.3-70B-Instruct-NVFP4 \
  --enforce-eager \
  --gpu-memory-utilization 0.92 \
  --max-model-len 8192 \
  --kv-cache-dtype fp8

# Option B: Qwen3-32B AWQ — faster boot, more context headroom, lower
# reasoning ceiling. Good fallback if 70B is OOM or unstable.
vllm serve Qwen/Qwen3-32B-AWQ \
  --enforce-eager \
  --gpu-memory-utilization 0.90 \
  --max-model-len 16384
```

Drop `--enforce-eager` once the server boots cleanly and you want CUDA-graph
speedups.

### Phase 2 — add compilation passes for throughput

Once Phase 1 works for a full debate, restart with the NVIDIA-recipe
compilation passes. **These flags only take effect when `--enforce-eager`
is OFF** — `--enforce-eager` is roughly equivalent to `-O0` and silently
disables compilation, so combining the two makes the `pass_config` a
no-op.

```bash
vllm serve nvidia/Llama-3.3-70B-Instruct-NVFP4 \
  --gpu-memory-utilization 0.92 \
  --max-model-len 8192 \
  --kv-cache-dtype fp8 \
  --compilation-config '{"pass_config":{"fuse_allreduce_rms":true,"fuse_attn_quant":true,"eliminate_noops":true}}'

# Or the simpler optimization-level shorthand — full autotuning:
# vllm serve <model> ... -O3
# (NOT --compilation-config 3 — that flag expects JSON.)
```

**Do not add `--attention-backend TRITON_ATTN` blindly.** It is not in
NVIDIA's recipe, the canonical CLI value for the Triton backend changed
in vLLM 0.11+, and an unverified value will just fail to start. Add an
explicit backend only if FA2 also fails and you've checked
`vllm serve --help` on your installed version for the current value.

Note: Llama 3.3 was released **70B only**. There is no 32B/40B Llama 3.3 —
if you want a mid-size open model use Qwen3-32B or Mistral-class instead.

## Knobs

| Env var          | Default              | Purpose                                  |
| ---------------- | -------------------- | ---------------------------------------- |
| `VENV_DIR`       | `~/vllm-env`         | Where the Python venv lives.             |
| `VLLM_REF`       | latest release tag   | Override for source-build checkout.      |
| `MAX_JOBS`       | `nproc`              | Parallelism for the source build.        |

## What this does not do

- No model download — pick that explicitly when serving.
- No systemd unit / autostart — add separately once the manual boot is clean.
- No Tailscale setup — that lives elsewhere.
