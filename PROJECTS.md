# Iron Forge Studios — Project catalog

**Single monorepo** — open this repository once in Cursor; all former GitHub repos live under [`projects/`](projects/).

New here? Read **[docs/GETTING-STARTED.md](docs/GETTING-STARTED.md)**.

Root [`src/`](src/) is the **AI Bridge Sync** web dashboard.

## Active (in this repo)

| Name | Slug | Path | Notes |
|------|------|------|-------|
| AI Bridge Sync | `ai-bridge-sync` | [`src/`](src/) | MCP dashboard — `npm run dev` |
| Karl Twin | `karl-twin` | [`projects/karl-twin/`](projects/karl-twin/) | Digital twin agent |
| Palm Luxe Tycoon | `palm-luxe-tycoon` | [`projects/palm-luxe-tycoon/`](projects/palm-luxe-tycoon/) | Roblox economy |
| Estate Memory | `estate-memory` | [`projects/estate-memory/`](projects/estate-memory/) | Estate/trust RAG |

## Imported from other GitHub repos (2026-05-23)

| Name | Slug | Path | Original repo |
|------|------|------|---------------|
| Gemini Discovers Diamonds | `gemini-discovers-diamonds` | [`projects/gemini-discovers-diamonds/`](projects/gemini-discovers-diamonds/) | OBHitting3/Gemini-discovers-Diamonds |
| Content Shield | `content-shield` | [`projects/content-shield/`](projects/content-shield/) | OBHitting3/Content_Shield |
| Iron Forge site | `iron-forge-studios-site` | [`projects/iron-forge-studios-site/`](projects/iron-forge-studios-site/) | OBHitting3/Iron-Forge-Studios |
| Faceless Shorts | `faceless-shorts` | [`projects/faceless-shorts/`](projects/faceless-shorts/) | OBHitting3/Faceless_Shorts |
| Joshua 7 | `joshua7` | [`projects/joshua7/`](projects/joshua7/) | OBHitting3/joshua7 |
| YouTube Autopilot | `yt-autopilot` | [`projects/yt-autopilot/`](projects/yt-autopilot/) | OBHitting3/yt-autopilot |
| Freelance | `freelance` | [`projects/freelance/`](projects/freelance/) | OBHitting3/FreeLance (was empty) |

Each imported project includes [`ORIGIN.md`](projects/gemini-discovers-diamonds/ORIGIN.md) with the GitHub link.

## Triage

| Name | Slug | Path | Purpose |
|------|------|------|---------|
| Inbox | `_inbox` | [`projects/_inbox/`](projects/_inbox/) | Unsorted drive imports |

## Drive import (`D:\`)

**Windows (scan in place):**

```powershell
.\scripts\scan-drive-windows.ps1
```

**Or copy** from `D:\` into [`drive-import/`](drive-import/), then:

```bash
npm run drive:inventory
```

See [`docs/drive-inventory.json`](docs/drive-inventory.json) and [`docs/consolidation-log.md`](docs/consolidation-log.md).

## Machine-readable index

[`projects/index.json`](projects/index.json)
