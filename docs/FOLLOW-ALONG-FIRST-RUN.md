# Follow along — first time seeing the game

**You use BOTH:** Terminal first (Cursor), then Studio (clicks).  
**I cannot open Studio on your PC** — I run terminal here; you mirror on Windows.

---

## The two programs

| Where | Tool | What you do |
|-------|------|-------------|
| **Terminal** | Cursor PowerShell | Install Rojo, run `rojo serve` |
| **Studio** | Roblox Studio | Rojo → Connect → Play |

Terminal sends code **into** Studio. Without `rojo serve`, Studio has nothing to show.

---

# PART 1 — Terminal (do this with me now)

Open **Cursor** → **Terminal** → **PowerShell**.

### Step 1 — Go to the game folder

```powershell
cd $env:USERPROFILE\Documents\Roblox\PalmSprings
```

**You should see:** prompt ends with `PalmSprings>`

---

### Step 2 — Fix Rojo project file (important)

Your repo’s `default.project.json` breaks `rojo serve`. Replace it.

**Option A** — copy from 55-_AI_Intergration repo:

```powershell
Copy-Item "C:\path\to\55-_AI_Intergration\scripts\windows\default.project.json" .\default.project.json -Force
```

**Option B** — backup and edit in Cursor: open `default.project.json`, change **only** these two blocks:

`ServerScriptService` becomes:

```json
    "ServerScriptService": {
      "$className": "ServerScriptService",
      "Server": {
        "$path": "src/server"
      }
    },
```

`StarterPlayerScripts` becomes:

```json
      "StarterPlayerScripts": {
        "$className": "StarterPlayerScripts",
        "Client": {
          "$path": "src/client"
        }
      }
```

Save the file.

---

### Step 3 — Install Rokit (once per PC)

```powershell
irm https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | iex
```

**You should see:** download/install messages, no red “failed”.

Close terminal → **open a new terminal** in Cursor.

```powershell
cd $env:USERPROFILE\Documents\Roblox\PalmSprings
```

---

### Step 4 — Install Rojo

```powershell
Copy-Item staging\toolchain\rokit.toml . -Force
```

```powershell
$env:Path = "$env:USERPROFILE\.rokit\bin;$env:Path"
```

```powershell
rokit install
```

If it asks to **trust** tools, type `y` for each (or run `rokit add rojo-rbx/rojo` and confirm).

```powershell
rojo --version
```

**You should see:** `Rojo 7.4.x` (or similar).

---

### Step 5 — Start Rojo (keep window open)

```powershell
cd $env:USERPROFILE\Documents\Roblox\PalmSprings
$env:Path = "$env:USERPROFILE\.rokit\bin;$env:Path"
rojo serve
```

**You should see:**

```text
Rojo server listening:
  Address: localhost
  Port:    34872
```

**Do not close this terminal.** Minimize it.

If you see `ClassName for Instance "ServerScriptService"` → go back to **Step 2**.

---

# PART 2 — Studio (only you can do this)

### Step 6 — Open Studio

1. Start **Roblox Studio** from Start menu or roblox.com/create  
2. You can use “New Baseplate” or any empty place.

---

### Step 7 — Connect Rojo

1. Top menu **Plugins**  
2. Click **Rojo** (install plugin first if missing: https://rojo.space/docs/v7/getting-started/installation/)  
3. Click **Connect**  
4. Leave port **34872**

**You should see:** Connected (green / success message).

If Connect fails → check Part 1 Step 5 is still running.

---

### Step 8 — Allow HTTP (for Supabase mock)

1. **Home** tab → **Game Settings**  
2. **Security**  
3. Enable **Allow HTTP requests**  
4. OK

---

### Step 9 — Play

1. Press **Play** (F5) or top **Play** button  
2. **View** → **Output**  
3. Wait **15–20 seconds**

**You should see in Output:**

```text
PALM SPRINGS PARADISE — Server Starting
```

Then builders run; the 3D view gets desert sand, roads, buildings.

---

### Step 10 — Test in chat

Press **/** or open chat, type:

```text
/status
```

```text
/coins 5000
```

**You should see:** command responses (not errors).

---

## What I completed in the cloud (proof it works)

After fixing `default.project.json`:

```text
Rojo server listening: localhost:34872
Building project 'PalmSpringsParadise'
Built project to PalmSpringsParadise.rbxlx
```

Your PC should match after Step 2 + Step 5.

---

## Next time (short version)

1. Terminal: `cd PalmSprings` → `rojo serve` (leave open)  
2. Studio: Rojo Connect → Play  
3. Edit `src/` in Cursor → Play again to see changes  

---

## If stuck

Send a screenshot or copy **the first red line** from:

- PowerShell (`rojo serve` window), or  
- Studio **Output** after Play  
