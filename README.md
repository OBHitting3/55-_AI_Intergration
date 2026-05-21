# Iron Forge Studios — AI Bridge Sync (monorepo)

Central workspace for **AI Bridge Sync** and related Iron Forge products. Each idea/concept has its own folder under [`projects/`](projects/).

## Quick start (dashboard)

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

## Project catalog

See **[PROJECTS.md](PROJECTS.md)** for all slugs, paths, and run instructions.

## External drive consolidation (`D:\`)

1. **On Windows:** `.\scripts\scan-drive-windows.ps1` (scans `D:\` by default).
2. **Or copy** folders from `D:\` into [`drive-import/`](drive-import/), then `npm run drive:inventory`.
3. Add `projects/<slug>/` per [`docs/consolidation-log.md`](docs/consolidation-log.md) and [`PROJECTS.md`](PROJECTS.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | AI Bridge Sync local server |
| `npm run build` | Production build |
| `npm run drive:inventory` | Scan `drive-import/` + repo roots |
