# See the game in Studio (Windows) — fix your errors + 5 minutes

## What went wrong in your terminal

You ran **two commands on one line** (no space/newline between them):

```text
verify.ps1$env:BRIDGE_URL = "https://..."
```

PowerShell tried to open a file named `verify.ps1$env:BRIDGE_URL` and broke parsing. **Run one command per line.**

`pull-bridge-export.ps1` is only in the **55-_AI_Intergration** repo (Vercel bridge), not in PalmSprings. **Skip it until the game runs in Studio.**

---

## Copy these scripts into PalmSprings (optional)

From `55-_AI_Intergration` clone, copy folder:

`scripts\windows\` → `C:\Users\karlu\Documents\Roblox\PalmSprings\scripts\windows\`

Or create the files manually from the repo on GitHub.

---

## Step-by-step (run each line separately)

### 1. Go to the game folder

```powershell
cd $env:USERPROFILE\Documents\Roblox\PalmSprings
```

### 2. Install Rokit (once)

```powershell
irm https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | iex
```

Close PowerShell, open a **new** Cursor terminal, then:

```powershell
cd $env:USERPROFILE\Documents\Roblox\PalmSprings
```

### 3. Pin tools + install Rojo

```powershell
Copy-Item staging\toolchain\rokit.toml . -Force
```

```powershell
Copy-Item staging\toolchain\wally.toml . -Force
```

```powershell
$env:Path = "$env:USERPROFILE\.rokit\bin;$env:Path"
```

```powershell
rokit install
```

### 4. Verify (one command)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\windows\verify-toolchain.ps1
```

If that file does not exist yet, check tools manually:

```powershell
rojo --version
```

You need a version number (e.g. 7.4.x). If `rojo` is not recognized, repeat step 3.

### 5. Start the game sync (SEE-GAME-NOW)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\windows\SEE-GAME-NOW.ps1
```

A **second** PowerShell window opens with `rojo serve`. **Leave it open.**

### 6. Roblox Studio

1. Open **Roblox Studio** (any baseplate is OK before connect).
2. **Plugins** → **Rojo** → **Connect** (port **34872**).
3. **Home** → **Game Settings** → **Security** → enable **Allow HTTP requests**.
4. Press **Play** (F5).
5. Open **View** → **Output** — look for:
   `PALM SPRINGS PARADISE - Server Starting`
6. Open chat and type: `/status` then `/coins 5000`

You should see desert terrain, roads, and buildings generate (procedural builders).

---

## If you still see an empty world

| Check | Action |
|-------|--------|
| Rojo window closed? | Re-run SEE-GAME-NOW.ps1 |
| Connect failed? | Studio → Rojo → Connect again |
| Red errors in Output? | Copy the first error line and fix (often a require path) |
| Grey baseplate only | Wait 15s; builders run on server start |
| No Rojo plugin | Install from https://rojo.space/docs/v7/getting-started/installation/ |

Manual serve (if script fails):

```powershell
cd $env:USERPROFILE\Documents\Roblox\PalmSprings
$env:Path = "$env:USERPROFILE\.rokit\bin;$env:Path"
rojo serve
```

---

## BRIDGE_URL (later — not needed to see the game)

Only after Vercel is deployed:

```powershell
$env:BRIDGE_URL = "https://your-real-app.vercel.app"
```

That is a **separate** line, not glued to `verify.ps1`.

---

## What you should have when it works

- Rojo window: `Rojo server listening...`
- Studio: world with sand sky, El Paseo, garden area
- Chat: `/status` responds
- You can adapt `src/` in Cursor and changes sync on Play

This is the **minimum playable view** to start building — not Creator Hub publish yet.
