# Scan Windows D:\ (or another drive) and write drive-inventory.json for the monorepo.
# Run from PowerShell on your PC (repo root):
#   .\scripts\scan-drive-windows.ps1
#   .\scripts\scan-drive-windows.ps1 -DriveRoot "D:\Projects"

param(
    [string]$DriveRoot = "D:\",
    [string]$OutFile = "docs\drive-inventory.json"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent

if (-not (Test-Path $DriveRoot)) {
    Write-Error "Drive not found: $DriveRoot. Plug in the drive or set -DriveRoot."
}

$skipDirs = @(
    "node_modules", ".git", ".next", "System Volume Information",
    "`$RECYCLE.BIN", "Thumbs.db"
)

$markers = @{
    "package.json"           = "web-app"
    "pyproject.toml"         = "python-app"
    "requirements.txt"       = "python-app"
    "default.project.json"   = "roblox-game"
    "rojo.json"              = "roblox-game"
    "docker-compose.yml"     = "infra"
}

function Get-ClusterType($dir) {
    foreach ($kv in $markers.GetEnumerator()) {
        if (Test-Path (Join-Path $dir $kv.Key)) { return $kv.Value }
    }
    $luau = Get-ChildItem -Path $dir -Filter "*.luau" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($luau) { return "roblox-game" }
    return "unknown"
}

$clusters = @()
Get-ChildItem -Path $DriveRoot -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    if ($skipDirs -contains $_.Name) { return }
    $files = Get-ChildItem -Path $_.FullName -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "\\node_modules\\" }
    $fileCount = @($files).Count
    $foundMarkers = @()
    foreach ($kv in $markers.GetEnumerator()) {
        if (Test-Path (Join-Path $_.FullName $kv.Key)) {
            $foundMarkers += @{ marker = $kv.Key; at = (Join-Path $_.Name $kv.Key) }
        }
    }
    $slug = ($_.Name.ToLower() -replace '[^a-z0-9]+', '-').Trim('-')
    $clusters += @{
        name = $_.Name
        slug = $slug
        windowsPath = $_.FullName
        fileCount = $fileCount
        markers = $foundMarkers
        type = Get-ClusterType $_.FullName
    }
}

$inventory = @{
    version = 1
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    roots = @(
        @{
            id = "windows-drive"
            path = $DriveRoot
            exists = $true
            scannedAt = (Get-Date).ToUniversalTime().ToString("o")
            clusters = $clusters
        }
    )
    notes = "Scanned from Windows. Copy clusters into drive-import/ or projects/<slug>/ per PROJECTS.md."
}

$outPath = Join-Path $repoRoot $OutFile
$outDir = Split-Path $outPath -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
$inventory | ConvertTo-Json -Depth 8 | Set-Content -Path $outPath -Encoding UTF8
Write-Host "Wrote $outPath ($($clusters.Count) top-level folders on $DriveRoot)"
