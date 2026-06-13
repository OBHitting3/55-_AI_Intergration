# Palm Springs Paradise — toolchain verify (Windows, ASCII-safe)
# Run ONE command per line:
#   cd $env:USERPROFILE\Documents\Roblox\PalmSprings
#   powershell -ExecutionPolicy Bypass -File scripts\windows\verify-toolchain.ps1
#
# Or from repo if you copied this folder into PalmSprings:
#   powershell -ExecutionPolicy Bypass -File staging\scripts\toolchain\verify.ps1

$ErrorActionPreference = "Continue"

$rokitBin = Join-Path $env:USERPROFILE ".rokit\bin"
if (Test-Path $rokitBin) {
    $env:Path = "$rokitBin;$env:Path"
}

Write-Host "=== Palm Springs Paradise - toolchain verify ==="

$required = @("rojo", "wally", "stylua", "selene", "git")
$missing = @()

foreach ($tool in $required) {
    $cmd = Get-Command $tool -ErrorAction SilentlyContinue
    if ($cmd) {
        try {
            $ver = & $tool --version 2>&1 | Select-Object -First 1
        } catch {
            $ver = "(ok)"
        }
        Write-Host "  OK   $tool - $ver"
    } else {
        Write-Host "  MISS $tool"
        $missing += $tool
    }
}

foreach ($tool in @("darklua", "remodel")) {
    if (Get-Command $tool -ErrorAction SilentlyContinue) {
        Write-Host "  OK   $tool (optional)"
    } else {
        Write-Host "  OPT  $tool"
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "Fix: install Rokit, then from PalmSprings folder:"
    Write-Host "  irm https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | iex"
    Write-Host "  Copy-Item staging\toolchain\rokit.toml . -Force"
    Write-Host "  rokit install"
    exit 1
}

Write-Host ""
Write-Host "=== All required tools found ==="
exit 0
