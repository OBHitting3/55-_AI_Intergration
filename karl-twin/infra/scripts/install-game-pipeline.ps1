# Full self-iterating Roblox + karl-twin pipeline install (Windows 11 + RTX 5090).
# Run as Administrator from the repository root.
#
# Usage:
#   Set-ExecutionPolicy -Scope Process Bypass
#   .\karl-twin\infra\scripts\install-game-pipeline.ps1

$ErrorActionPreference = 'Stop'
$ScriptRoot = $PSScriptRoot
$KarlTwinRoot = (Resolve-Path "$ScriptRoot\..\..").Path

Write-Host "==> Palm Luxe self-iteration pipeline (karl-twin + Rojo)"
Write-Host ""

& "$ScriptRoot\bootstrap.ps1"
Set-Location $KarlTwinRoot
& "$ScriptRoot\install.ps1"
& "$ScriptRoot\install-roblox.ps1"

Write-Host ""
Write-Host "================================================================"
Write-Host " Pipeline installed. Still required on your machine:"
Write-Host "  - ANTHROPIC_API_KEY + E2B_API_KEY in karl-twin\.env"
Write-Host "  - Roblox Studio + Rojo plugin (if not already)"
Write-Host "  - Tailscale on Pixel 10 Pro XL (tag:owner) per karl-twin README"
Write-Host "  - Optional: ROBLOX_API_KEY for Open Cloud publish automation"
Write-Host "================================================================"
Write-Host ""
Write-Host "Start: .\karl-twin\infra\scripts\start.ps1"
Write-Host "Iterate: python -m karl_twin `"add a daily login bonus to GameConfig`""
