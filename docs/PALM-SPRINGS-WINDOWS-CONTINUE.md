# Palm Springs Paradise — continue from Step 0 (Windows + Cursor)

Use this on your **CyberPower PC**. The canonical game repo is **not** `55-_ai_intergration`; it is:

| Item | Value |
|------|--------|
| Repo | https://github.com/OBHitting3/Gemini-discovers-Diamonds |
| Branch | `cursor/karlux-foundation-292d` |
| PR | #24 (draft) — merge `staging/` only after Karl/Eddie approval |
| Local folder | `C:\Users\<YOU>\Documents\Roblox\PalmSprings` (recommended) |

This workspace (`55-_ai_intergration`) holds **karl-twin** (optional approval-gated AI). The **Rojo game** lives in Gemini-discovers-Diamonds.

---

## Step 0 — Open in Cursor (you are here)

1. **Cursor** → **File → Open Folder** → `Documents\Roblox\PalmSprings`  
   Or double-click `PalmSpringsParadise.code-workspace`.

2. If not cloned yet (**Cursor → PowerShell**):

```powershell
mkdir -Force "$env:USERPROFILE\Documents\Roblox"
cd "$env:USERPROFILE\Documents\Roblox"
git clone https://github.com/OBHitting3/Gemini-discovers-Diamonds.git PalmSprings
cd PalmSprings
git checkout cursor/karlux-foundation-292d
```

**Pass:** Explorer shows `src\`, `staging\`, `default.project.json`.

---

## Step 1 — Git

```powershell
git --version
```

Install from https://git-scm.com/download/win if missing.

---

## Step 2 — Rokit (not Homebrew, not Aftman)

```powershell
irm https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | iex
```

Close terminal → **new** Cursor terminal. If `rokit` not found:

```powershell
[Environment]::SetEnvironmentVariable(
  "Path",
  $env:Path + ";$env:USERPROFILE\.rokit\bin",
  "User"
)
```

Restart Cursor, then:

```powershell
rokit --version
```

---

## Step 3 — Toolchain pins + packages

From repo root (`PalmSprings`):

```powershell
Copy-Item staging\toolchain\rokit.toml . -Force
Copy-Item staging\toolchain\wally.toml . -Force
rokit install
wally install
```

**Pass:**

```powershell
powershell -ExecutionPolicy Bypass -File staging\scripts\toolchain\verify.ps1
```

All required tools: `rojo`, `wally`, `stylua`, `selene`, `git`.

---

## Step 4 — Workspace bootstrap

```powershell
powershell -ExecutionPolicy Bypass -File staging\scripts\krlx-workspace-bootstrap.ps1
```

Copies `.vscode` from staging if needed and creates `.env` from `staging\env\.env.example`.

---

## Step 5 — Cursor extensions

Install recommended (popup or `.vscode/extensions.json`):

- Luau LSP  
- Rojo  
- StyLua  
- Selene  

---

## Step 6 — Rojo serve (prefer over build)

**Cursor** → **Tasks: Run Task** → **Rojo: Serve**

Or terminal:

```powershell
rojo serve
```

**Gotcha:** `rojo build` may hit `ServerScriptService` class conflicts — use **serve + Studio** as the daily loop.

---

## Step 7 — Roblox Studio

1. Install Studio from https://www.roblox.com/create  
2. Rojo plugin → **Connect** (same port as serve)  
3. **Game Settings** → allow HTTP requests  
4. **Play Solo**  
5. Chat commands: `/coins 5000`, `/status`, `/claimplot 1`

---

## MCP / agents (what exists vs missing)

| Capability | Status |
|------------|--------|
| Roblox MCP in Cursor | **Missing** — no Studio/Luau MCP in cloud or desktop catalog |
| **Cursor** | Luau, Rojo, PRs, `.vscode` — **use this** |
| **Manus** | Assets, Supabase push, secrets |
| **karl-twin** (other repo) | Optional self-iteration with Pixel approval + RTX Whisper |

---

## Not merged yet (PR #24)

Day-phase orchestrator + AssetRegistry in `staging/src/` — see `docs/karlux/03-vertical-slice-merge-guide.md`.

---

## Full doc index

Under `docs/karlux/` in the PalmSprings clone — start with `07-step-by-step-install-windows.md` and `HANDOFF-condensed.md`.

---

## Optional: karl-twin on same PC

Clone `55-_ai_intergration` separately, run `karl-twin\infra\scripts\install-game-pipeline.ps1`, set `GAME_ROOT` to Palm Springs `src` only after Karl approves AI edits to production Luau.
