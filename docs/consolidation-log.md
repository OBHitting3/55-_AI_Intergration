# Consolidation log

**Date:** 2026-05-21  
**Branch:** `cursor/drive-consolidation-78cb`

## Drive access

External volume is **`D:\`** on the user’s Windows machine. It is not mounted in the cloud VM. Use `scripts/scan-drive-windows.ps1` locally, or copy `D:\` folders into `drive-import/`.

## Migrations

| Slug | Action | Source |
|------|--------|--------|
| `palm-luxe-tycoon` | `git mv` from `game/PalmLuxeTycoon/` | In-repo |
| `karl-twin` | Imported from `origin/cursor/build-karl-twin-digital-twin-e233` | Remote branch |
| `estate-memory` | Extracted lib, UI, API, samples from `origin/claude/review-digital-twin-hLHZU` | Remote branch (not merged into root `src/`) |
| `ai-bridge-sync` | Catalog entry only; code remains at repo root | In-repo |

## Skipped / unchanged

- `eslint-plugin-no-sdk` — dev tooling at repo root (not a product project)
- `node_modules`, `.next`, secrets — never imported

## Duplicates

None detected in `drive-import/` (empty). Re-run `npm run drive:inventory` after copying drive contents.

## Next steps for user

1. Copy external drive folders into `drive-import/`.
2. Run `npm run drive:inventory`.
3. For each new cluster in `docs/drive-inventory.json`, add `projects/<slug>/` with README or move to `projects/_inbox/`.
