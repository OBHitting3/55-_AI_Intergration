import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

// Encryption at rest. Honest threat model:
// - If VAULT_PASSPHRASE is set, the key is derived from it (scrypt) and is
//   NEVER written to disk. This protects data even if the whole disk is stolen.
// - If no passphrase is set, a random key is generated and stored at
//   data/.keys/master.key (chmod 600). This protects against casual file
//   access, but NOT against an attacker who steals the disk (they also get the
//   key file). The app logs a warning in this mode. Set VAULT_PASSPHRASE in
//   production for full at-rest protection.

const DATA_DIR = path.join(process.cwd(), "data");
const KEYS_DIR = path.join(DATA_DIR, ".keys");
const MASTER_KEY_FILE = path.join(KEYS_DIR, "master.key");
const SALT_FILE = path.join(KEYS_DIR, "salt");
const SESSION_SECRET_FILE = path.join(KEYS_DIR, "session.secret");

const PREFIX = "fvenc1:";

let cachedKey: Buffer | null = null;
let cachedSessionSecret: string | null = null;
let warnedNoPassphrase = false;

async function ensureKeysDir() {
  await fs.mkdir(KEYS_DIR, { recursive: true, mode: 0o700 });
}

export async function getMasterKey(): Promise<Buffer> {
  if (cachedKey) return cachedKey;
  await ensureKeysDir();

  const passphrase = process.env.VAULT_PASSPHRASE;
  if (passphrase && passphrase.length > 0) {
    let salt: Buffer;
    try {
      salt = Buffer.from((await fs.readFile(SALT_FILE, "utf8")).trim(), "hex");
    } catch {
      salt = crypto.randomBytes(16);
      await fs.writeFile(SALT_FILE, salt.toString("hex"), { mode: 0o600 });
    }
    cachedKey = crypto.scryptSync(passphrase, salt, 32);
    return cachedKey;
  }

  if (!warnedNoPassphrase) {
    // eslint-disable-next-line no-console
    console.warn(
      "[family-vault] VAULT_PASSPHRASE not set: using an on-disk key (data/.keys/master.key). " +
        "This protects against casual file access but NOT full-disk theft. Set VAULT_PASSPHRASE for full protection."
    );
    warnedNoPassphrase = true;
  }

  try {
    const hex = (await fs.readFile(MASTER_KEY_FILE, "utf8")).trim();
    cachedKey = Buffer.from(hex, "hex");
  } catch {
    cachedKey = crypto.randomBytes(32);
    await fs.writeFile(MASTER_KEY_FILE, cachedKey.toString("hex"), { mode: 0o600 });
  }
  return cachedKey;
}

export async function getSessionSecret(): Promise<string> {
  if (cachedSessionSecret) return cachedSessionSecret;
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length > 0) {
    cachedSessionSecret = process.env.SESSION_SECRET;
    return cachedSessionSecret;
  }
  await ensureKeysDir();
  try {
    cachedSessionSecret = (await fs.readFile(SESSION_SECRET_FILE, "utf8")).trim();
  } catch {
    cachedSessionSecret = crypto.randomBytes(32).toString("hex");
    await fs.writeFile(SESSION_SECRET_FILE, cachedSessionSecret, { mode: 0o600 });
  }
  return cachedSessionSecret;
}

export async function encryptString(plaintext: string): Promise<string> {
  const key = await getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ct]).toString("base64");
}

export async function decryptString(blob: string): Promise<string> {
  if (!isEncrypted(blob)) {
    throw new Error("not an encrypted blob");
  }
  const key = await getMasterKey();
  const raw = Buffer.from(blob.slice(PREFIX.length), "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ct = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

export function isEncrypted(blob: string): boolean {
  return typeof blob === "string" && blob.startsWith(PREFIX);
}

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}
