# =============================================================================
# PALM SPRINGS — FINISH EVERYTHING (one script, no guessing)
#
# In Cursor: Terminal -> PowerShell -> paste:
#   irm "https://raw.githubusercontent.com/OBHitting3/55-_AI_Intergration/cursor/roblox-self-iterate-pipeline-8a91/scripts/windows/FINISH-ALL.ps1" | iex
# =============================================================================

$ErrorActionPreference = "Stop"
$Base = "https://raw.githubusercontent.com/OBHitting3/55-_AI_Intergration/cursor/roblox-self-iterate-pipeline-8a91"
$GameFolder = Join-Path $env:USERPROFILE "Documents\Roblox\PalmSprings"
$GeminiRepo = "https://github.com/OBHitting3/Gemini-discovers-Diamonds.git"

function Download-File($url, $dest) {
    $dir = Split-Path -Parent $dest
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    Write-Host "  got $(Split-Path -Leaf $dest)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Palm Springs - automatic setup" -ForegroundColor Cyan
Write-Host ""

# 1) Clone game if missing
if (-not (Test-Path $GameFolder)) {
    Write-Host "[1/4] Downloading game (first time only)..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path (Split-Path $GameFolder) | Out-Null
    git clone $GeminiRepo $GameFolder
} else {
    Write-Host "[1/4] Using existing folder..." -ForegroundColor Yellow
}
Set-Location $GameFolder
git checkout cursor/karlux-foundation-292d 2>$null
if ($LASTEXITCODE -ne 0) { git checkout main 2>$null }

# 2) Apply fixes from cloud agent (playable patch)
Write-Host "[2/4] Applying playable fixes..." -ForegroundColor Yellow
$files = @{
    "default.project.json" = "$Base/palm-springs-excellence/default.project.json"
    "src/server/Services/FtueService.lua" = "$Base/palm-springs-excellence/src/server/Services/FtueService.lua"
    "src/server/Services/EconomyService.lua" = "$Base/palm-springs-excellence/src/server/Services/EconomyService.lua"
    "src/server/Services/PlotService.lua" = "$Base/palm-springs-excellence/src/server/Services/PlotService.lua"
    "src/server/Services/PersistenceService.lua" = "$Base/palm-springs-excellence/src/server/Services/PersistenceService.lua"
    "src/server/Commands/TestCommands.lua" = "$Base/palm-springs-excellence/src/server/Commands/TestCommands.lua"
    "src/server/init.server.lua" = "$Base/palm-springs-excellence/src/server/init.server.lua"
    "src/shared/GameConfig.lua" = "$Base/palm-springs-excellence/src/shared/GameConfig.lua"
}
foreach ($rel in $files.Keys) {
    Download-File $files[$rel] (Join-Path $GameFolder $rel)
}
Write-Host "  OK - fixes applied" -ForegroundColor Green

# 3) Install Rojo
Write-Host "[3/4] Installing Rojo..." -ForegroundColor Yellow
if (-not (Get-Command rokit -ErrorAction SilentlyContinue)) {
    irm https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | iex
}
$rokitBin = Join-Path $env:USERPROFILE ".rokit\bin"
$env:Path = "$rokitBin;$env:Path"
if (Test-Path "staging\toolchain\rokit.toml") { Copy-Item "staging\toolchain\rokit.toml" "rokit.toml" -Force }
rokit install
Write-Host "  OK - $(rojo --version)" -ForegroundColor Green

# 4) Build openable game file
Write-Host "[4/4] Building game file you can open..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "out" | Out-Null
$place = Join-Path $GameFolder "out\PalmSpringsParadise.rbxlx"
rojo build default.project.json --output $place
if (-not (Test-Path $place)) { throw "Build failed - send this error to support" }

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " DONE - open your game now:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host $place -ForegroundColor White
Write-Host ""
Write-Host "1. Double-click that file (or File -> Open in Studio)" -ForegroundColor Cyan
Write-Host "2. Press Play (F5)" -ForegroundColor Cyan
Write-Host "3. Wait 20 seconds" -ForegroundColor Cyan
Write-Host "4. Chat: /status" -ForegroundColor Cyan
Write-Host ""
explorer.exe "/select,$place"
