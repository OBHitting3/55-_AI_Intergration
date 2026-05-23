# Pull Superbullet + Cursor export files from deployed AI Bridge Sync (Vercel).
# Run from PalmSprings repo root (Gemini-discovers-Diamonds).
#
# Usage:
#   $env:BRIDGE_URL = "https://your-app.vercel.app"
#   powershell -ExecutionPolicy Bypass -File scripts/pull-bridge-export.ps1

$ErrorActionPreference = "Stop"
$Base = $env:BRIDGE_URL
if (-not $Base) {
    Write-Error "Set BRIDGE_URL to your Vercel deployment (e.g. https://xxx.vercel.app)"
}

$uri = "$Base/api/export/superbullet"
Write-Host "GET $uri"
$res = Invoke-RestMethod -Uri $uri -Method Get

foreach ($file in $res.files) {
    $dest = Join-Path (Get-Location) $file.path
    $dir = Split-Path -Parent $dest
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    Set-Content -Path $dest -Value $file.content -Encoding utf8
    Write-Host "[OK] $($file.path)"
}

Write-Host ""
Write-Host "Next:"
$res.instructions.windows | ForEach-Object { Write-Host "  $_" }
