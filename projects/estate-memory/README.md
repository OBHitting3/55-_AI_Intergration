# Estate Memory

Sovereign RAG for estate, trust, and family-office documents. Cited search with per-query audit logging for attorney workflows.

**Status:** active (library extracted from `origin/claude/review-digital-twin-hLHZU`)

**Source:** Git branch `claude/review-digital-twin-hLHZU` — not yet wired into root `src/` in this monorepo.

## Layout

| Path | Purpose |
|------|---------|
| `lib/` | Chunker, BM25 store, RAG, ingest, LLM client |
| `types/estate.ts` | Shared types |
| `samples/estate/` | Sample trust/LLC text for demos |
| `api-routes/estate/` | Next.js App Router API routes (copy into `src/app/api/estate/` to enable) |
| `app/estate/` | Dashboard page (copy into `src/app/estate/`) |
| `components/estate/` | UI components (copy into `src/components/estate/`) |

## Integrate with AI Bridge Sync

1. Copy `api-routes/estate`, `app/estate`, and `components/estate` into repo `src/`.
2. Copy `lib/*.ts` to `src/lib/estate/` and `types/estate.ts` to `src/types/`.
3. Set `ESTATE_LLM_BASE_URL` (optional; stub mode works without a model).
4. Run `npm run build`.

## Run sample ingest (after integration)

```bash
curl -X POST http://localhost:3000/api/estate/ingest-samples
curl -X POST http://localhost:3000/api/estate/query -H 'Content-Type: application/json' -d '{"question":"Who is the trustee?"}'
```
