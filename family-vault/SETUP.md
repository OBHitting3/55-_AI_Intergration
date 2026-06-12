# Build, adjust & sell a Family Vault unit

This is the repeatable runbook for turning a bare machine (e.g. a CyberPower PC
with an RTX 5090) into a sellable, private-AI unit. The software is the product;
the box is just the vessel.

## 1. Build a unit (replicable)

On the target machine, with this folder copied to it:

```bash
cd family-vault
./setup.sh            # installs deps, builds, pulls the AI model, makes .env + a strong secret
# (use ./setup.sh --demo only if you want sample dad/kid accounts for a sales demo)
```

`setup.sh` is **idempotent** — run it as many times as you want. It will:
- check Node 18+,
- create `.env` from `.env.example` and generate a strong `SESSION_SECRET`,
- `npm install` + `npm run build`,
- pull the configured Ollama model + embedder (if Ollama is installed).

## 2. Adjust a unit (per customer)

Everything you normally change lives in **`.env`** — no code edits:

| Setting | What it does |
|---|---|
| `BRAND_NAME` / `BRAND_TAGLINE` | Rebrand for the customer |
| `VAULTS` | The access-controlled areas, e.g. `cases:Cases,personal:Personal` |
| `OLLAMA_MODEL` | The brain. Use a bigger model on a real rig (e.g. `qwen2.5:7b`, `llama3.1:8b`) |
| `VAULT_PASSPHRASE` | Encryption key source. **Set this** — then the key is never stored on disk |
| `SEED_DEMO` | `1` only for demos; leave `0` for real units |

After changing `.env`: `npm run build` again.

## 3. Run it so it survives reboots (sellable)

Linux rig (recommended):

```bash
sudo cp deploy/family-vault.service /etc/systemd/system/
sudo nano /etc/systemd/system/family-vault.service   # set User, WorkingDirectory, VAULT_PASSPHRASE
sudo systemctl daemon-reload
sudo systemctl enable --now family-vault
```

Or just run `npm run start` (port 3001) inside tmux/screen for a quick start.

## 4. Hand it to the customer

1. Open the app — it shows a **first-run setup screen** (no demo data).
2. The customer creates their **owner account** (this becomes the admin).
3. Owner → **Manage people**: add family members / staff and assign vaults.
4. Add documents, ask questions. Done.

## 5. Verify a unit before shipping

```bash
curl -s http://localhost:3001/api/health
```

You want: `"status":"ok"`, `"ollamaOnline":true`, `"setupComplete":false` (before the
customer onboards), and the right `brand`, `model`, and `vaults`.

## Honest reminders (don't oversell)

- **Set `VAULT_PASSPHRASE`.** Without it the encryption key sits in a file next to the
  data — fine against casual snooping, not against someone stealing the whole machine.
- This is **not** turnkey HIPAA/compliance certification. It provides encryption,
  audit, and access control — the customer still needs OS hardening, TLS, physical
  security, and legal sign-off. Get a compliance review before selling to regulated buyers.
- **AI answers can be wrong.** The app says so; keep that promise in your sales pitch.
