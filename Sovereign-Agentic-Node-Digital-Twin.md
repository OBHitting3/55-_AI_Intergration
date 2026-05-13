# Sovereign Agentic Node + Digital Twin Execution Plan
**Hardware:** Pixel 10 Pro XL (Tensor G5) + RTX 5090 (32GB) workstation
**Goal:** Mobile-first voice ingestion → 10 debating agents → autonomous digital twin on local sovereign stack. No cloud reliance.

## Core Architecture
- **Ingestion:** Pixel native Gemini Live / Recorder → on-device transcripts → Tailscale sync to Obsidian vault.
- **Mesh:** Tailscale private tunnel (Pixel + 5090).
- **Credentials:** Bitwarden local-first vault.
- **Memory:** Obsidian vault (single source of truth + twin personality profile).
- **Compute:** WSL2 Ubuntu 24.04 on 5090. Disable NVIDIA System Memory Fallback. Lock models to GPU.
- **LLM Serving:** Primary vLLM (batching for debates). Fallback: llama.cpp (GGUF).
- **Agents:** 10 conflicting facets of your digital twin that battle on every major decision.

## Ten Debating Agents (Digital Twin Facets)
1. **Marcus** – Aggressive Strategist (high conviction, impatient)
2. **Elena** – Ruthless Ingester (detail-obsessed, filters noise)
3. **Raj** – Paranoid Security (worst-case focus)
4. **Aisha** – Brutal Janitor (cleanup first)
5. **Liam** – Visionary Builder (3D/creative)
6. **Mei** – Production Pragmatist (speed > perfection, AVAI video)
7. **Diego** – Operator Realist (domains, revenue)
8. **Fatima** – Memory Keeper (Obsidian coherence, twin profile)
9. **Kwame** – Hardware Maximalist (5090 optimization)
10. **Sofia** – Cynical Auditor (flaw finder)

**Orchestration:** Supervisor script spawns parallel calls to vLLM OpenAI endpoint. Elena feeds Pixel voice. All write to shared Obsidian threads. Consensus → action or report.

## Verified Setup Steps (execute sequentially)

### 1. Tailscale Mesh (Immediate)
**WSL2 Ubuntu:**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```
**Pixel 10 Pro XL:** Install Tailscale app from Play Store, login, join same network. Confirm both nodes visible with private IPs.

> Staged in this repo at `infra/tailscale/setup-wsl.sh` (script form, with the audit notes below baked in).

### 2. Bitwarden + Obsidian
- Install Bitwarden desktop + browser extension.
- Set up Obsidian vault synced via Tailscale share.
- Create "Executive Master Table" and "Digital Twin Profile" notes.

### 3. WSL2 LLM Environment (vLLM Primary)
```bash
# Update
sudo apt update && sudo apt upgrade -y
sudo apt install build-essential cmake python3 python3-pip python3-venv git curl -y

# venv
python3 -m venv ~/vllm-env
source ~/vllm-env/bin/activate
pip install --upgrade pip uv

# vLLM (use source/nightly for 5090 stability if wheel fails)
uv pip install vllm --torch-backend=auto
# If issues: follow PyTorch nightly cu128 + vLLM source build per community guides
```

Test:
```bash
nvidia-smi
python -c "
import torch
import vllm
print('CUDA:', torch.cuda.is_available())
print('Device:', torch.cuda.get_device_name(0))
print('VRAM:', torch.cuda.get_device_properties(0).total_memory / 1e9, 'GB')
"
```

> Staged in this repo at `infra/vllm-blackwell/` with a guarded installer (`setup.sh`), a smoke test (`test_vllm.py`), and a source-build fallback (`source-build-fallback.sh`).

Fallback: llama.cpp
```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp && make LLAMA_CUDA=1 -j
```

### 4. Quantization Strategy (32GB Reality)
- Prefer 32B–72B Q4_K_M / Q5_K_M (GGUF) or AWQ for vLLM.
- vLLM: `--quantization awq --gpu-memory-utilization 0.90 --max-model-len 8192`.
- Use paged attention + batching for 4–10 agent debates.
- Kwame agent manages loading/swapping.

### 5. High-Value Missions
- **Aisha:** Mac legacy cleanup.
- **Liam:** Gaussian Splatting / HY-World 2.0 on Pixel photos (Palm Springs).
- **Mei:** ComfyUI + Hunyuan Video 1.5 for AVAI 4K.
- **Diego:** Domain/entity automation via Bitwarden.

## Supervisor & Agent Prompts
(Place in Obsidian. Expand with specific system prompts defining your voice/goals.)

## Next Action
Run Tailscale + vLLM test. Paste outputs. Then deploy supervisor + agent files.

## Risks
- vLLM on 5090 may need source build initially.
- 70B full parallel debates tight on 32GB — start with 4–6 agents. Always test small before scaling.

## Maintain
Update this `.md` as twin evolves. Agents debate changes.

---

## Audit Notes (Claude, 2026-05-13)

These are the non-obvious items worth pinning down before they bite. They do
not change the plan, they sharpen it.

1. **One model, ten personas.** 32 GB VRAM holds one 32B-class model at Q5 or
   one 70B at aggressive Q4 — not ten. Run a single vLLM server and vary the
   ten facets via system prompts in batched OpenAI-style requests. Kwame is
   advisory, not literally swapping ten weight files.
2. **Parallel Obsidian writes race.** Ten agents writing into shared notes
   will clobber each other. Design as append-only per-agent journals
   (`vault/agents/<name>.md`) and have Fatima/the supervisor compose the
   consensus note in a single writer step.
3. **"Disable NVIDIA System Memory Fallback" is a Windows-side toggle.** It
   lives in the NVIDIA Control Panel (Manage 3D Settings → CUDA – Sysmem
   Fallback Policy = "Prefer No Sysmem Fallback"). WSL inherits it. Worth
   flipping before vLLM boots so a near-OOM model doesn't silently swap to
   host RAM and tank throughput.
4. **Bitwarden access for agents.** If any agent calls `bw` CLI, it needs a
   `BW_SESSION` token (from `bw unlock --raw`) in its env. Don't bake the
   master password into a script — derive the session at session start, scope
   it to the supervisor process, and let it expire.
5. **Tailscale on WSL2.** Ubuntu 24.04 from the Microsoft Store has systemd
   enabled by default, so `tailscale up` works directly. If systemd is off,
   the official install script falls back to userspace networking — slower
   but functional. Worth running `--ssh --accept-routes` on first up to enable
   Tailscale SSH and reach any subnets you advertise from elsewhere.
6. **Single base-model assumption affects Mission 5.** Mei's video work
   (ComfyUI + Hunyuan) needs its own VRAM budget. If vLLM is holding the
   32B model at 90% memory utilization, video gens will OOM. Plan the
   serve/swap discipline (stop vLLM → run video → restart vLLM).
