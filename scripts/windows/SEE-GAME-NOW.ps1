# Minimum path: get Palm Springs visible in Roblox Studio (Windows)
# Run from PalmSprings repo root:
#   powershell -ExecutionPolicy Bypass -File scripts\windows\SEE-GAME-NOW.ps1
#
# Prereq: Roblox Studio installed + Rojo plugin (https://rojo.space/docs/v7/getting-started/installation/)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
# If script lives in scripts\windows, repo root is two levels up
if ($Root -match 'scripts\\windows$' -or $Root -match 'scripts/windows$') {
    $Root = (Resolve-Path (Join-Path $Root "..\..")).Path
} else {
    $Root = (Get-Location).Path
}
Set-Location $Root
Write-Host "Repo: $Root"

# 1) Rokit on PATH
$rokitBin = Join-Path $env:USERPROFILE ".rokit\bin"
if (Test-Path $rokitBin) {
    $env:Path = "$rokitBin;$env:Path"
}

# 2) rokit.toml at root
$rokitToml = Join-Path $Root "rokit.toml"
$stagingRokit = Join-Path $Root "staging\toolchain\rokit.toml"
if (-not (Test-Path $rokitToml)) {
    if (Test-Path $stagingRokit) {
        Copy-Item $stagingRokit $rokitToml -Force
        Write-Host "[OK] Copied staging\toolchain\rokit.toml to root"
    } else {
        Write-Error "Missing rokit.toml. Are you in the PalmSprings repo?"
    }
}

# 3) Install CLI tools if rojo missing
if (-not (Get-Command rokit -ErrorAction SilentlyContinue)) {
    Write-Host "[INSTALL] Rokit..."
    irm https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | iex
    $env:Path = "$rokitBin;$env:Path"
}

if (-not (Get-Command rojo -ErrorAction SilentlyContinue)) {
    Write-Host "[INSTALL] rokit install (Rojo, Wally, Selene, StyLua)..."
    Set-Location $Root
    rokit install
    $env:Path = "$rokitBin;$env:Path"
}

if (-not (Test-Path (Join-Path $Root "default.project.json"))) {
    Write-Error "default.project.json not found. Wrong folder?"
}

# 4) Optional wally (no required deps in v0.1)
if ((Get-Command wally -ErrorAction SilentlyContinue) -and (Test-Path (Join-Path $Root "wally.toml"))) {
    wally install 2>$null
}

# 5) Start rojo serve in a new window
Write-Host ""
Write-Host "Starting Rojo server in a new window..."
$serveCmd = "cd `"$Root`"; `$env:Path = `"$rokitBin;`" + `$env:Path; rojo serve; pause"
Start-Process powershell -ArgumentList @("-NoExit", "-Command", $serveCmd)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " ROJO IS SERVING - DO THIS IN STUDIO NOW" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host " 1. Open Roblox Studio"
Write-Host " 2. Plugins tab -> Rojo -> Connect (default localhost:34872)"
Write-Host " 3. Game Settings -> Security -> Allow HTTP requests = ON"
Write-Host " 4. Press Play (F5) - wait 10-20 sec for world build"
Write-Host " 5. Output window should show: PALM SPRINGS PARADISE - Server Starting"
Write-Host " 6. In chat type: /status   then   /coins 5000"
Write-Host ""
Write-Host "If Connect fails: keep the Rojo window open and retry Connect."
Write-Host "Do NOT close the Rojo PowerShell window while testing."
Write-Host ""
