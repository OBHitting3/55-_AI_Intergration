# Palm Springs Excellence Pack — apply to Gemini-discovers-Diamonds

Research-backed fixes for **RUBRIC-14**. Audits: `docs/karlux/AUDIT-RUBRIC-5x14.md` (five consecutive **14/14** after apply).

## Quick apply (PowerShell)

```powershell
cd $env:USERPROFILE\Documents\Roblox\PalmSprings
$src = "C:\path\to\55-_AI_Intergration\palm-springs-excellence"   # or clone path

Copy-Item "$src\default.project.json" . -Force
Copy-Item "$src\src\server\Services\FtueService.lua" .\src\server\Services\ -Force
Copy-Item "$src\src\server\Services\EconomyService.lua" .\src\server\Services\ -Force
Copy-Item "$src\src\server\Services\PlotService.lua" .\src\server\Services\ -Force
Copy-Item "$src\src\server\Services\PersistenceService.lua" .\src\server\Services\ -Force
Copy-Item "$src\src\server\Commands\TestCommands.lua" .\src\server\Commands\ -Force
Copy-Item "$src\src\server\init.server.lua" .\src\server\ -Force
Copy-Item "$src\src\shared\GameConfig.lua" .\src\shared\ -Force

$env:Path = "$env:USERPROFILE\.rokit\bin;$env:Path"
rojo serve
```

Studio → Rojo Connect → Play. New player: 3 FTUE toasts, then claim plot.

## What changed (research-backed)

| Fix | Rubric | Source |
|-----|--------|--------|
| FtueService 3-step guide | R04 | Roblox onboarding doc |
| TestCommands Studio-only | R07 | Production safety |
| Game pass + event multipliers | R09 | Monetization must affect gameplay |
| Plot rehydration on join | R10 | DataStore ↔ world consistency |
| `psp_*` Supabase table names | R11 | Migration alignment |
| Rojo nested Server/Client paths | R14 | Rojo 7 init.server.lua pattern |

Snippets in `staging/patches/` are reference only if you prefer manual merge.
