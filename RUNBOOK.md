# Sovereign Node Runbook

The single document to follow when you sit down at the PC. Top to bottom.

If any step fails, stop, paste output to Claude, and wait for diagnosis
before proceeding. Do not improvise around errors.

---

## A. Do these on phone / iPad before sitting at the PC

These don't need the workstation and remove the biggest blockers.

### A1. Hugging Face account + model access (hard blocker)

The 70B model is gated. Without this, the vLLM serve step will fail.

1. Create an account at https://huggingface.co if you don't have one.
2. Visit https://huggingface.co/nvidia/Llama-3.3-70B-Instruct-NVFP4 and
   click **"Agree and access repository"** at the top of the model card.
3. Generate a token: Settings → Access Tokens → **New token** → name it
   `sovereign-node`, scope: **Read**. Copy the token.
4. Store the token in Bitwarden under a new item:
   - Name: `huggingface — sovereign-node read token`
   - Username: your HF username
   - Password: the token

### A2. Tailscale on the Pixel

1. Install **Tailscale** from the Play Store on the Pixel 10 Pro XL.
2. Open it, sign in. Pick whichever identity you'll also use on WSL
   (Google / GitHub / email — anything, just be consistent).
3. The Pixel will sit in the tailnet with no peers visible until WSL
   joins in step C below. That's expected.

### A3. Confirm Windows-side prereqs (no clicks yet, just verify)

- NVIDIA driver version: **570 series or newer** (right-click desktop →
  NVIDIA Control Panel → System Information). If older, update before
  going further.
- NVIDIA Control Panel → Manage 3D Settings → Global → set
  **"CUDA – Sysmem Fallback Policy"** to **"Prefer No Sysmem Fallback"**.
  Apply.
- Free disk space on the drive WSL2 lives on: **at least 80 GB**.

---

## B. Open WSL2 and get the repo

```bash
# In Ubuntu (WSL2):
cd ~
git clone <your repo URL> 55-_AI_Intergration   # if not already cloned
cd 55-_AI_Intergration
git fetch origin
git checkout claude/setup-vllm-blackwell-KZcDJ
git pull origin claude/setup-vllm-blackwell-KZcDJ
```

Verify you're on the right branch:

```bash
git status
# expect: On branch claude/setup-vllm-blackwell-KZcDJ
```

---

## C. Bring up Tailscale

```bash
bash infra/tailscale/setup-wsl.sh
```

The first run opens a login URL. Copy it, open on phone, authorize.
The script ends with `tailscale status` and the IPv4.

Verify on the Pixel: open Tailscale app → device list should show
`blackwell-wsl`. Tap it; ping should succeed.

**Paste back to Claude:** `tailscale status` output.

---

## D. Install vLLM

```bash
bash infra/vllm-blackwell/setup.sh
```

The script:
- Verifies `nvidia-smi` (driver bridge into WSL).
- Creates the venv at `~/vllm-env`.
- Installs vLLM via `uv pip install vllm --torch-backend=auto`.
- Falls back to cu128 index, then to source build if both wheels fail.
- Runs the smoke test (`test_vllm.py`) — driver, GPU, VRAM.

**Paste back to Claude:** the smoke-test output (driver, GPU name,
compute capability, VRAM total, vLLM version).

If it fails at the install step, stop and paste the last ~50 lines.
Do not run the source-build script yourself — Claude will tell you
whether that's the right next move.

---

## E. Authenticate to Hugging Face

```bash
source ~/vllm-env/bin/activate
pip install huggingface_hub
huggingface-cli login
# Paste the token from Bitwarden (A1, step 4). Hit enter.
```

Verify:

```bash
huggingface-cli whoami
# expect: your HF username
```

---

## F. Serve the model — Phase 1 (stability)

In **terminal 1**, with the venv active:

```bash
export VLLM_FLASH_ATTN_VERSION=2
vllm serve nvidia/Llama-3.3-70B-Instruct-NVFP4 \
  --enforce-eager \
  --gpu-memory-utilization 0.92 \
  --max-model-len 8192 \
  --kv-cache-dtype fp8
```

First run downloads ~40 GB. Expect 15–40 minutes depending on bandwidth.

In **terminal 2**, monitor VRAM:

```bash
watch -n 1 nvidia-smi
```

Expect 28–30 GB used at steady state. If VRAM climbs past 31 GB or you
see OOM in terminal 1, kill the server (Ctrl-C in terminal 1), drop
`--gpu-memory-utilization` to `0.88`, and retry.

The server is ready when terminal 1 prints something like:

```
INFO ... Started server process
INFO ... Uvicorn running on http://0.0.0.0:8000
```

**Paste back to Claude:** the first 50 lines of vLLM startup, plus the
peak VRAM from `nvidia-smi`.

---

## G. Run the first debate

Leave vLLM running in terminal 1. In **terminal 2** (after stopping the
`watch nvidia-smi`):

```bash
cd ~/55-_AI_Intergration
./run-debate.sh "Should I ship the AVAI 4K demo before Friday?"
```

Defaults: 6 agents (Marcus, Elena, Raj, Aisha, Fatima, Sofia) × 3 rounds.
Roughly 18 model calls + 1 consensus call. Expect 3–8 minutes.

Output goes to:
- stdout (each agent name as it speaks, plus the consensus at the end)
- `obsidian/journals/<agent>-YYYYMMDD.log` (append-only)
- `obsidian/journals/consensus-YYYYMMDD.log`

**Paste back to Claude:** the full stdout and the consensus log.

---

## H. Phase 2 — throughput (only after Phase 1 works)

Kill terminal 1 (Ctrl-C). Restart without `--enforce-eager` and with
compilation passes:

```bash
export VLLM_FLASH_ATTN_VERSION=2
vllm serve nvidia/Llama-3.3-70B-Instruct-NVFP4 \
  --gpu-memory-utilization 0.92 \
  --max-model-len 8192 \
  --kv-cache-dtype fp8 \
  --compilation-config '{"pass_config":{"fuse_allreduce_rms":true,"fuse_attn_quant":true,"eliminate_noops":true}}'
```

First boot will be slower (compilation passes need to run once and get
cached). Subsequent boots are fast. Rerun the debate from step G and
compare wall-clock time.

---

## I. After it's running — customization (no urgency)

These don't block anything. Do them as you go.

- **Agent voice notes**: open each `agents/<name>.md`, fill in the
  "Voice notes (fill in)" sections with phrases you actually use.
- **twin-profile.md**: create this at repo root with your values, goals,
  and decision history. Fatima will reference it. Structure TBD.
- **Real Obsidian vault**: currently the supervisor writes to
  `obsidian/journals/` inside the repo. Once your real vault is set up,
  symlink that directory to the vault, or change `JOURNAL_DIR` in
  `supervisor.py`.
- **Bitwarden CLI for agents**: if Diego needs to read domain/entity
  credentials, set up `bw unlock --raw` → export as `BW_SESSION` in
  the supervisor's environment. Never bake the master password.
- **Aisha's Mac janitor script**: pending from Grok. Will go in
  `agents/scripts/aisha-mac-cleanup.sh` when delivered.

---

## J. Known footguns (don't trip these)

- **Don't combine `--enforce-eager` with `--compilation-config`.**
  Eager mode silently disables the compilation passes. Use one or the
  other, never both.
- **Don't pass `--quantization nvfp4`.** That value doesn't exist. The
  prequantized weights handle quantization. If vLLM ever asks for an
  explicit value, it's `modelopt`, not `nvfp4`.
- **Don't add `--attention-backend TRITON_ATTN`.** Unverified flag
  value; NVIDIA's recipe omits it. FA2 via the env var is enough.
- **Don't run vLLM and ComfyUI / Hunyuan Video at the same time.**
  They will fight over VRAM. Stop one before starting the other.
