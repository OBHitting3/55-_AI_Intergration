# Iron Forge Studios — AI Bridge Sync (monorepo)

**Your single workspace.** All 8 former GitHub repos now live here under [`projects/`](projects/). Start with **[docs/GETTING-STARTED.md](docs/GETTING-STARTED.md)** if repositories felt scattered across Cursor windows.

## Quick start (dashboard)

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

## Project catalog

See **[PROJECTS.md](PROJECTS.md)** for all slugs, paths, and run instructions.

## External drive consolidation (`D:\`)

1. **KRLX handoff:** `.\scripts\import-pc-transfer-kit.ps1` (copies `D:\PC_Transfer_Kit`), then `npm run handoff:execute`.
2. **Or scan in place:** `.\scripts\scan-drive-windows.ps1` (scans `D:\` by default).
3. **Or copy** folders into [`drive-import/`](drive-import/), then `npm run drive:inventory`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | AI Bridge Sync local server |
| `npm run build` | Production build |
| `npm run drive:inventory` | Scan `drive-import/` + repo roots |
