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

For 32 GB of VRAM with 4–6 concurrent debate agents, start with a 32B class
model. Boot with `--enforce-eager` the first time to skip CUDA-graph capture
while Blackwell wheels stabilize:

```bash
source ~/vllm-env/bin/activate
vllm serve Qwen/Qwen3-32B-AWQ \
  --enforce-eager \
  --gpu-memory-utilization 0.90 \
  --max-model-len 16384
```

Drop `--enforce-eager` once the server is stable and you want CUDA-graph speedups.

70B class models on 32 GB require aggressive Q3/Q4 quants, lower context, and
will likely not host 10 simultaneous debate agents at usable throughput —
prefer the 32B path and scale agent count instead.

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
