# Iron Forge Studios — Project catalog

Monorepo layout: each concept lives under [`projects/`](projects/). Root [`src/`](src/) is **AI Bridge Sync**.

| Name | Slug | Status | Path | Description |
|------|------|--------|------|-------------|
| AI Bridge Sync | `ai-bridge-sync` | active | [`src/`](src/) | MCP dashboard, config validation, sync & webhooks |
| Palm Luxe Tycoon | `palm-luxe-tycoon` | active | [`projects/palm-luxe-tycoon/`](projects/palm-luxe-tycoon/) | Roblox unified LC economy |
| Estate Memory | `estate-memory` | active | [`projects/estate-memory/`](projects/estate-memory/) | Sovereign estate/trust RAG with citations |
| Karl Twin | `karl-twin` | active | [`projects/karl-twin/`](projects/karl-twin/) | Approval-gated digital twin agent (LangGraph) |
| Inbox | `_inbox` | triage | [`projects/_inbox/`](projects/_inbox/) | Unclassified drive imports |

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
