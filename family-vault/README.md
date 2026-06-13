# Family Vault

A local-first, private AI over your own files. Built for people who **need** their
data to stay on their own hardware — doctors, lawyers, and other professionals — and
for their families. Nothing is sent to any external AI service.

This is an MVP that demonstrates the core product:

- **Private AI chat** over your own documents (RAG), powered by a local model via **Ollama**.
- **Per-user logins** with **vault-level access control** (e.g. kids can't see Work files).
- **Encryption at rest** — every data file (documents, users, audit log) is encrypted
  with AES-256-GCM. The on-disk files are ciphertext, not readable plaintext.
- **Tamper-evident audit log** — entries are linked in a SHA-256 hash chain, so any
  edit, deletion, or reorder of past entries is detected. The audit page shows a live
  integrity check.
- **Encrypted backup** (owner only) — the export is an encrypted blob, restorable only
  with your vault key/passphrase, so a single box never means a single point of loss.
- **Login rate-limiting / lockout** to slow password guessing.
- **Graceful fallback**: if Ollama isn't running, answers fall back to extractive
  saved-notes so the app is never hard-down.

## Security model — honest version

- **Encryption key.** If you set `VAULT_PASSPHRASE`, the encryption key is derived
  from it (scrypt) and is **never written to disk** — this protects data even against
  full-disk theft. If you do **not** set it, a random key is generated and stored at
  `data/.keys/master.key` (chmod 600); this protects against casual file access but
  **not** someone who steals the whole disk (they get the key too). The app warns in
  this mode. Set a passphrase in production.
- **Session secret.** Comes from `SESSION_SECRET`, or a strong random value generated
  and persisted on first run. There is **no hardcoded default**, so a missing env var
  cannot leave the app signing sessions with a public key.

## What this is NOT (yet)

- It is **not** a turnkey "HIPAA-certified" product. Encryption + audit + access control
  are necessary pieces, but full compliance also needs OS hardening, physical security,
  TLS in transit, breach policy, and legal review. Get a compliance review before
  charging regulated buyers.
- **AI answers can be wrong.** The model is instructed to answer only from your files and
  to say when it doesn't know, but small local models still make mistakes. Verify
  anything important. Not legal/medical/financial advice.
- Storage is encrypted local files under `data/` (gitignored). A larger deployment would
  move to a real datastore (still encrypted) and add MFA + key rotation.

## Run it

Quickest path (replicable, idempotent installer):

```bash
./setup.sh           # installs deps, builds, pulls the AI model, makes .env + a strong secret
npm run start        # http://localhost:3001  → first-run screen asks you to create the owner
```

Or manually for development:

```bash
npm install
npm run dev          # http://localhost:3001
```

To build and sell units repeatably, see **`SETUP.md`** (build / adjust / run-on-boot / verify).

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
| `SESSION_SECRET` | auto-generated & persisted | Session signing key (no insecure default) |
| `VAULT_PASSPHRASE` | _(none)_ | If set, encryption key is derived from it and never stored on disk |

## First run (real units)

By default there are **no demo accounts**. On first launch the app shows a **setup
screen** where the customer creates their **owner account**. The owner can then go to
**Manage people** to add family members / staff and assign which vaults each can use.

## Demo mode (for your sales demos only)

Set `SEED_DEMO=1` (or run `./setup.sh --demo`) to seed sample data:

| User | Password | Access |
|---|---|---|
| `dad` | `dad12345` | Owner — all vaults, audit log, backup |
| `kid` | `kid12345` | Member — Family vault only |

Then ask `kid` "What is the deposition date for the Hendricks matter?" — no Work access,
so it returns nothing. Ask `dad` the same question and it answers. That's access control.

## Health check

`curl -s http://localhost:3001/api/health` → brand, model, vaults, `ollamaOnline`,
`setupComplete`, `demoMode`.
