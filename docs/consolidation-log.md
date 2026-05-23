# Consolidation log

## 2026-05-23 — All GitHub repos into monorepo

**Branch:** `cursor/consolidate-all-repos-6bb4`  
**Base:** `cursor/drive-consolidation-78cb` + merge `claude/upgrade-ai-bridge-sync-JqMHc`

### Imported from GitHub (copy, not delete)

| Slug | Source repo | Files |
|------|-------------|-------|
| `gemini-discovers-diamonds` | OBHitting3/Gemini-discovers-Diamonds | ~206 |
| `content-shield` | OBHitting3/Content_Shield | ~84 |
| `iron-forge-studios-site` | OBHitting3/Iron-Forge-Studios | ~29 |
| `faceless-shorts` | OBHitting3/Faceless_Shorts | ~37 |
| `joshua7` | OBHitting3/joshua7 | ~33 |
| `yt-autopilot` | OBHitting3/yt-autopilot | ~5 |
| `freelance` | OBHitting3/FreeLance | 0 (placeholder README) |

Each folder has `ORIGIN.md` pointing at the old repo URL.

### Cleanup

- Removed duplicate root `karl-twin/` after merge (canonical copy: `projects/karl-twin/`).

### Known overlaps (user should pick one source of truth later)

| Topic | Locations |
|-------|-----------|
| Joshua 7 / Content Shield | `projects/joshua7/`, `projects/content-shield/`, `projects/content-shield/joshua7/`, `projects/gemini-discovers-diamonds/content-shield/` |
| Palm / Roblox games | `projects/palm-luxe-tycoon/`, `projects/gemini-discovers-diamonds/` (Palm Springs Paradise) |

### Not imported

- `.git` history from old repos (files only; simpler for review)
- `node_modules`, `.next`, `__pycache__`, `.venv`

### Still manual (your PC)

- `D:\` drive files: use `scripts/scan-drive-windows.ps1` or copy into `drive-import/`, then `npm run drive:inventory`

---

## 2026-05-21 — Drive consolidation branch

**Branch:** `cursor/drive-consolidation-78cb`

| Slug | Action | Source |
|------|--------|--------|
| `palm-luxe-tycoon` | `git mv` from `game/PalmLuxeTycoon/` | In-repo |
| `karl-twin` | Imported from `origin/cursor/build-karl-twin-digital-twin-e233` | Remote branch |
| `estate-memory` | Extracted from `origin/claude/review-digital-twin-hLHZU` | Remote branch |
| `ai-bridge-sync` | Catalog entry; code at repo root `src/` | In-repo |
