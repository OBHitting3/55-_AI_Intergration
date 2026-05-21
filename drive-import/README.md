# Drive import staging

Copy contents from your external drive here for Cloud Agent inventory scans.

**Windows example paths:** `E:\`, `D:\Backup\`, or `C:\Users\<you>\ExternalDrive\`

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
