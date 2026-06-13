# Copy D:\PC_Transfer_Kit into the repo and print the handoff for Cursor.
# Run from repo root in PowerShell:
#   .\scripts\import-pc-transfer-kit.ps1

param(
    [string]$Source = "D:\PC_Transfer_Kit",
    [string]$Dest = "drive-import\PC_Transfer_Kit"
)

$ErrorActionPreference = "Stop"
$repoRoot = if (Test-Path "package.json") { (Get-Location).Path } else { Split-Path $PSScriptRoot -Parent }

if (-not (Test-Path $Source)) {
    Write-Error "Source not found: $Source. Confirm the drive is D: and PC_Transfer_Kit exists."
}

$destPath = Join-Path $repoRoot $Dest
New-Item -ItemType Directory -Path (Split-Path $destPath -Parent) -Force | Out-Null
if (Test-Path $destPath) { Remove-Item -Recurse -Force $destPath }
Copy-Item -Path $Source -Destination $destPath -Recurse -Force

$handoff = Join-Path $destPath "KRLX_CURSOR_HANDOFF.md"
if (-not (Test-Path $handoff)) {
    Write-Warning "Missing KRLX_CURSOR_HANDOFF.md in copied kit."
} else {
    Write-Host "`n=== KRLX_CURSOR_HANDOFF.md ===`n"
    Get-Content $handoff -Raw
}

Write-Host "`nCopied to $destPath"
Write-Host "Next: git add drive-import docs; git commit -m 'import PC_Transfer_Kit from D:'; git push"
Write-Host "Then (cloud or local): npm run handoff:execute"
