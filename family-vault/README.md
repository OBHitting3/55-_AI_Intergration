# Family Vault

A local-first, private AI over your own files. Built for people who **need** their
data to stay on their own hardware — doctors, lawyers, and other professionals — and
for their families. Nothing is sent to any external AI service.

This is an MVP that demonstrates the core product:

- **Private AI chat** over your own documents (RAG), powered by a local model via **Ollama**.
- **Per-user logins** with **vault-level access control** (e.g. kids can't see Work files).
- **Append-only audit log** — every access is recorded locally (a compliance asset).
- **One-click backup** (owner only) so a single box never means single point of loss.
- **Graceful fallback**: if Ollama isn't running, answers fall back to extractive
  saved-notes so the app is never hard-down.

## Honest scope / what this is NOT (yet)

- It is **not** a turnkey "HIPAA-certified" product. Local storage solves the biggest
  piece (no third party), but full compliance also needs disk encryption, OS hardening,
  physical security, and policy — get a compliance/legal review before charging regulated buyers.
- Storage is local JSON files under `data/` (gitignored). Production should add
  encryption at rest and a real datastore.
- Auth is a signed session cookie with scrypt-hashed passwords — fine for a demo,
  harden before production (rate limiting, rotation, MFA).

## Run it

```bash
npm install
npm run dev   # http://localhost:3001
```

### Enable the local AI (optional but recommended)

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve &
ollama pull qwen2.5:0.5b        # tiny demo model; use a larger one on a real rig
ollama pull nomic-embed-text    # embeddings for better retrieval
```

The app auto-detects Ollama. Without it, you still get retrieval + extractive answers.

### Config (env)

| Var | Default | Purpose |
|---|---|---|
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Local Ollama server |
| `OLLAMA_MODEL` | `qwen2.5:0.5b` | Chat model (use a bigger one on the rig) |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Embedding model |
| `SESSION_SECRET` | dev default | Set a strong value in production |

## Demo logins

| User | Password | Access |
|---|---|---|
| `dad` | `dad12345` | Owner — Work + Family vaults, audit log, backup |
| `kid` | `kid12345` | Member — Family vault only |

Try asking `kid` "What is the deposition date for the Hendricks matter?" — it has no
access to the Work vault, so it correctly returns nothing. Ask `dad` the same question
and it answers. That's the access control in action.
