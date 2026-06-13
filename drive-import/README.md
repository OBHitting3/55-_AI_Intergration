# Drive import staging

Your external volume is **`D:\`**. This folder mirrors what you copy from `D:\` into the repo for Cloud Agent scans.

## Option A — Scan `D:\` on your PC (recommended first)

From the repo root in **PowerShell**:

```powershell
.\scripts\scan-drive-windows.ps1
# or a subfolder on D:
.\scripts\scan-drive-windows.ps1 -DriveRoot "D:\"
```

Writes [`docs/drive-inventory.json`](../docs/drive-inventory.json). Commit that file or copy results into `projects/<slug>/`.

## KRLX handoff (execute instructions)

After copying the kit (or running `import-pc-transfer-kit.ps1`):

```bash
npm run handoff:execute
```

Reads `PC_Transfer_Kit/KRLX_CURSOR_HANDOFF.md`, syncs kit folders into `projects/`, updates `projects/index.json`.

## Option B — Copy into this repo (Cloud Agent)

Copy top-level folders from `D:\` into `drive-import/` (e.g. `drive-import/MyGame/`), then:

```bash
npm run drive:inventory
```

## What to copy

- Top-level project folders (games, apps, notes, repos)
- Skip: `node_modules`, `.git` (optional), `Thumbs.db`, `System Volume Information`

## Secrets (do not commit)

`.env`, `*.pem`, `*.key`, wallet files, personal IDs — these are ignored via root `.gitignore`.

## Scan

```bash
npm run drive:inventory
```

Output: [`docs/drive-inventory.json`](../docs/drive-inventory.json)
