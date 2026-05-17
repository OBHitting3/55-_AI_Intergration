# Starts API and worker in two PowerShell windows. Stack assumed up.
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path "$PSScriptRoot\..\..").Path
Set-Location $Root

# Ensure docker stack is up
docker compose -f infra/docker/docker-compose.yml up -d

# Activate venv and launch API + worker in detached windows
$activate = "$Root\.venv\Scripts\Activate.ps1"

Start-Process powershell -ArgumentList @(
    '-NoExit', '-Command',
    ". `"$activate`"; Set-Location `"$Root`"; python -m karl_twin.api"
) | Out-Null

Start-Process powershell -ArgumentList @(
    '-NoExit', '-Command',
    ". `"$activate`"; Set-Location `"$Root`"; python -m karl_twin.worker"
) | Out-Null

Write-Host "API and worker launched in separate windows."
Write-Host "Approval UI: http://<LAN-IP>:8000/   (LAN-IP printed by API)"
