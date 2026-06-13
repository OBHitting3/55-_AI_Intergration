# Start here — you don't need to know how

## Easiest path (2 things)

### 1. On your PC — one command

Open **Cursor** → **Terminal** → paste this **whole block** → Enter:

```powershell
cd $env:USERPROFILE\Documents\Roblox
if (-not (Test-Path PalmSprings)) { git clone https://github.com/OBHitting3/Gemini-discovers-Diamonds.git PalmSprings }
cd PalmSprings
git fetch origin
git checkout cursor/playable-now-8a91
git pull origin cursor/playable-now-8a91
irm https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | iex
$env:Path = "$env:USERPROFILE\.rokit\bin;$env:Path"
Copy-Item staging\toolchain\rokit.toml . -Force -ErrorAction SilentlyContinue
rokit install
New-Item -ItemType Directory -Force -Path out | Out-Null
rojo build default.project.json --output out\PalmSpringsParadise.rbxlx
```

Wait until it finishes (no red errors at the end).

### 2. Open the game

Double-click this file in File Explorer:

`C:\Users\karlu\Documents\Roblox\PalmSprings\out\PalmSpringsParadise.rbxlx`

Roblox Studio opens → press **Play** (F5) → wait 20 seconds → type `/status` in chat.

You should see a desert town (sand, roads, buildings).

---

## If double-click doesn't work

1. Open **Roblox Studio** manually  
2. **File → Open** → pick `PalmSpringsParadise.rbxlx` from the `out` folder  
3. **Play** (F5)

---

## You do NOT need (for now)

- Vercel  
- Superbullet  
- Supabase  
- `verify.ps1`  
- `pull-bridge-export.ps1`  

---

## If something fails

Copy the **last 10 lines** from the red error in Cursor terminal and send them. Say which step number failed.

Branch with fixes: `cursor/playable-now-8a91`  
https://github.com/OBHitting3/Gemini-discovers-Diamonds
