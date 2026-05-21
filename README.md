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

## External drive consolidation

1. Copy your USB / Windows drive into [`drive-import/`](drive-import/).
2. Run `npm run drive:inventory` → [`docs/drive-inventory.json`](docs/drive-inventory.json).
3. Add or update entries under `projects/<slug>/` per [`docs/consolidation-log.md`](docs/consolidation-log.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | AI Bridge Sync local server |
| `npm run build` | Production build |
| `npm run drive:inventory` | Scan `drive-import/` + repo roots |
