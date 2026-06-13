// Single place to adjust a unit before selling it. Everything here is driven by
// environment variables so you can rebrand and reconfigure WITHOUT editing code.
// Copy .env.example to .env, change values, rebuild. That's the whole "adjust" step.

export interface VaultDef {
  id: string;
  label: string;
}

function parseVaults(raw: string | undefined): VaultDef[] {
  if (!raw) {
    return [
      { id: "work", label: "Work (confidential)" },
      { id: "family", label: "Family" },
    ];
  }
  // Format: "id:Label,id2:Label 2"
  const out: VaultDef[] = [];
  for (const part of raw.split(",")) {
    const [id, ...rest] = part.split(":");
    const cleanId = (id || "").trim();
    if (!cleanId) continue;
    out.push({ id: cleanId, label: (rest.join(":").trim() || cleanId) });
  }
  return out.length ? out : [{ id: "family", label: "Family" }];
}

export const config = {
  brandName: process.env.BRAND_NAME || "Family Vault",
  tagline:
    process.env.BRAND_TAGLINE ||
    "Private, local AI over your own files. Your data never leaves home.",
  model: process.env.OLLAMA_MODEL || "qwen2.5:0.5b",
  embedModel: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",
  vaults: parseVaults(process.env.VAULTS),
  // Demo accounts/data are OFF by default. Turn on only for your own demos.
  seedDemo: process.env.SEED_DEMO === "1",
  version: "0.2.0",
};

export function vaultIds(): string[] {
  return config.vaults.map((v) => v.id);
}

export function isValidVault(id: string): boolean {
  return vaultIds().includes(id);
}
