# Installs Roblox toolchain (Aftman + Rojo/Selene/StyLua) and validates the game project.
# Run from repo root or karl-twin root after bootstrap.ps1.
#
# Usage:
#   .\karl-twin\infra\scripts\install-roblox.ps1

$ErrorActionPreference = 'Stop'

# Repo root: parent of karl-twin when script lives in karl-twin/infra/scripts
$ScriptRoot = $PSScriptRoot
$KarlTwinRoot = (Resolve-Path "$ScriptRoot\..\..").Path
$RepoRoot = (Resolve-Path "$KarlTwinRoot\..").Path
$GameRoot = Join-Path $RepoRoot 'game\PalmLuxeTycoon'
$AftmanToml = Join-Path $RepoRoot 'game\aftman.toml'

Write-Host "==> Roblox toolchain install"
Write-Host "    Repo root : $RepoRoot"
Write-Host "    Game root : $GameRoot"

function Test-Cmd($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

# 1. Aftman (tool manager for Rojo ecosystem)
if (-not (Test-Cmd aftman)) {
    Write-Host "[INSTALL] Aftman via winget..."
    winget install --id LPGhatguy.Aftman --silent --accept-source-agreements --accept-package-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
        [System.Environment]::GetEnvironmentVariable('Path', 'User')
}

if (-not (Test-Path $AftmanToml)) {
    Write-Error "Missing $AftmanToml"
}

Set-Location $RepoRoot
Write-Host "[AFTMAN] Installing pinned tools from game/aftman.toml"
aftman install

# 2. Roblox Studio (manual — no silent winget id is reliable across regions)
$studioPaths = @(
    "${env:LOCALAPPDATA}\Roblox\Versions",
    "C:\Program Files (x86)\Roblox\Versions"
)
$hasStudio = $false
foreach ($p in $studioPaths) {
    if (Test-Path $p) { $hasStudio = $true; break }
}
if ($hasStudio) {
    Write-Host "[OK] Roblox Studio install detected."
} else {
    Write-Host "[ACTION] Install Roblox Studio from https://www.roblox.com/create"
    Write-Host "         Then install the Rojo plugin: https://rojo.space/docs/v7/getting-started/installation/"
}

# 3. Validate build + lint
$rojo = Join-Path $env:USERPROFILE '.aftman\bin\rojo.exe'
$selene = Join-Path $env:USERPROFILE '.aftman\bin\selene.exe'
if (-not (Test-Path $rojo)) { $rojo = 'rojo' }
if (-not (Test-Path $selene)) { $selene = 'selene' }

Set-Location $GameRoot
New-Item -ItemType Directory -Force -Path out | Out-Null

Write-Host "[ROJO] Building place file..."
& $rojo build default.project.json --output out\PalmLuxeTycoon.rbxlx
if ($LASTEXITCODE -ne 0) { throw "rojo build failed" }

Write-Host "[SELENE] Linting Luau sources..."
& $selene $GameRoot
if ($LASTEXITCODE -ne 0) {
    Write-Warning "selene reported issues (warnings allowed in v0.1)"
}

# 4. Patch .env GAME_ROOT if karl-twin .env exists
$envFile = Join-Path $KarlTwinRoot '.env'
if (Test-Path $envFile) {
    $text = Get-Content $envFile -Raw
    if ($text -match '(?m)^GAME_ROOT=\s*$') {
        $text = $text -replace '(?m)^GAME_ROOT=\s*$', "GAME_ROOT=$($GameRoot -replace '\\','\\')"
        Set-Content -Path $envFile -Value $text -NoNewline
        Write-Host "[ENV] Set GAME_ROOT in karl-twin\.env"
    }
}

Write-Host "==> Roblox toolchain ready."
Write-Host "Next:"
Write-Host "  1. Open Roblox Studio > Rojo plugin > Connect (rojo serve in $GameRoot)"
Write-Host "  2. .\karl-twin\infra\scripts\start.ps1"
Write-Host "  3. On Pixel: approve game.luau.write / rojo.build actions from karl-twin"
