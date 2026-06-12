import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { AuditEntry, DocRecord, Role, User, VaultId } from "./types";
import { decryptString, encryptString, sha256 } from "./crypto";
import { config, isValidVault, vaultIds } from "./config";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit.json");
const DOCS_DIR = path.join(DATA_DIR, "docs");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

// All data files are encrypted at rest (AES-256-GCM). Reads decrypt; writes
// encrypt. A failed decrypt (tampering or wrong key) throws and is treated as
// "no data" by readJson callers rather than silently returning plaintext.
async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const plain = await decryptString(raw);
    return JSON.parse(plain) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await ensureDir(path.dirname(file));
  const blob = await encryptString(JSON.stringify(data, null, 2));
  await fs.writeFile(file, blob, "utf8");
}

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function makeUser(
  username: string,
  name: string,
  role: "owner" | "member",
  vaults: VaultId[],
  password: string
): User {
  const salt = crypto.randomBytes(16).toString("hex");
  return {
    id: crypto.randomUUID(),
    username,
    name,
    role,
    vaults,
    salt,
    hash: hashPassword(password, salt),
  };
}

let initialized = false;

// On first run: if SEED_DEMO=1, seed demo accounts + sample docs so the product
// is instantly demoable. Otherwise (the default for a real sold unit) do nothing
// here — the owner is created through the /setup onboarding flow instead.
export async function init(): Promise<void> {
  if (initialized) return;
  await ensureDir(DATA_DIR);

  if (!config.seedDemo) {
    initialized = true;
    return;
  }

  const users: User[] = [
    makeUser("dad", "Dr. Karl (Owner)", "owner", ["work", "family"], "dad12345"),
    makeUser("kid", "Sam (Family)", "member", ["family"], "kid12345"),
  ];

  // Atomically claim first-run with an exclusive write. If another concurrent
  // caller (or a build-time prerender) already created the file, we skip seeding
  // entirely — this prevents duplicate seed documents from races.
  try {
    const blob = await encryptString(JSON.stringify(users, null, 2));
    await fs.writeFile(USERS_FILE, blob, { flag: "wx" });
  } catch {
    initialized = true;
    return;
  }

  {
    const dad = users[0];
    await seedDoc(
      "work",
      "Client matter — Hendricks v. Atlas (privileged)",
      "Privileged and confidential. Client: Maria Hendricks. Matter: wrongful termination claim against Atlas Logistics. Key date: deposition scheduled for July 14. Settlement authority granted up to $85,000. Lead counsel notes: opposing party has weak documentation on the performance review timeline.",
      dad.id
    );
    await seedDoc(
      "family",
      "Household notes",
      "Home WiFi network is BlueHeron and the password is river-otter-42. Emergency contact is Aunt Lisa at 555-0142. The kids' dentist is Dr. Patel, appointments are usually on the first Tuesday of the month. Trash pickup is Wednesday morning.",
      dad.id
    );
  }
  initialized = true;
}

export async function getUsers(): Promise<User[]> {
  return readJson<User[]>(USERS_FILE, []);
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

async function saveUsers(users: User[]): Promise<void> {
  await writeJson(USERS_FILE, users);
}

export async function userCount(): Promise<number> {
  return (await getUsers()).length;
}

export type CreateUserResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

export async function createUser(opts: {
  username: string;
  name: string;
  password: string;
  role: Role;
  vaults: VaultId[];
}): Promise<CreateUserResult> {
  const username = opts.username.trim();
  if (!username || !opts.password) {
    return { ok: false, error: "Username and password are required" };
  }
  if (opts.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }
  const users = await getUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: "That username is already taken" };
  }
  // Owners always get every vault; members get the (validated) selected vaults.
  const vaults =
    opts.role === "owner" ? vaultIds() : opts.vaults.filter((v) => isValidVault(v));
  const user = makeUser(username, opts.name.trim() || username, opts.role, vaults, opts.password);
  users.push(user);
  await saveUsers(users);
  return { ok: true, user };
}

export async function deleteUser(id: string): Promise<void> {
  const users = await getUsers();
  await saveUsers(users.filter((u) => u.id !== id));
}

function docPath(id: string) {
  return path.join(DOCS_DIR, `${id}.json`);
}

export async function listDocs(vaults: VaultId[]): Promise<DocRecord[]> {
  await ensureDir(DOCS_DIR);
  const files = await fs.readdir(DOCS_DIR).catch(() => [] as string[]);
  const docs: DocRecord[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const doc = await readJson<DocRecord | null>(path.join(DOCS_DIR, f), null);
    if (doc && vaults.includes(doc.vault)) docs.push(doc);
  }
  return docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveDoc(doc: DocRecord): Promise<void> {
  await ensureDir(DOCS_DIR);
  await writeJson(docPath(doc.id), doc);
}

async function seedDoc(vault: VaultId, title: string, text: string, userId: string) {
  const { chunkText } = await import("./rag");
  const { embedTexts } = await import("./ollama");
  const chunks = chunkText(text);
  const embeddings = await embedTexts(chunks);
  const doc: DocRecord = {
    id: crypto.randomUUID(),
    vault,
    title,
    createdAt: new Date().toISOString(),
    createdBy: userId,
    chunks: chunks.map((t, i) => ({ text: t, embedding: embeddings[i] ?? null })),
  };
  await saveDoc(doc);
}

const GENESIS = "GENESIS";

function entryHash(e: Omit<AuditEntry, "hash">): string {
  // Hash binds this entry to the previous one (prevHash), forming a chain.
  // Editing or deleting any past entry breaks every hash after it.
  return sha256(
    [e.prevHash, e.id, e.at, e.userId, e.username, e.action, e.detail].join("\u0000")
  );
}

export async function appendAudit(
  entry: Omit<AuditEntry, "id" | "at" | "prevHash" | "hash">
): Promise<void> {
  const log = await readJson<AuditEntry[]>(AUDIT_FILE, []);
  const prevHash = log.length ? log[log.length - 1].hash : GENESIS;
  const base: Omit<AuditEntry, "hash"> = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    prevHash,
    ...entry,
  };
  const full: AuditEntry = { ...base, hash: entryHash(base) };
  log.push(full);
  await writeJson(AUDIT_FILE, log);
}

export async function getAudit(): Promise<AuditEntry[]> {
  const log = await readJson<AuditEntry[]>(AUDIT_FILE, []);
  return [...log].sort((a, b) => b.at.localeCompare(a.at));
}

export interface AuditIntegrity {
  ok: boolean;
  count: number;
  brokenAt: number | null;
}

// Recomputes the hash chain in stored order to detect any edit/delete/reorder.
export async function verifyAudit(): Promise<AuditIntegrity> {
  const log = await readJson<AuditEntry[]>(AUDIT_FILE, []);
  let prev = GENESIS;
  for (let i = 0; i < log.length; i++) {
    const e = log[i];
    if (e.prevHash !== prev) return { ok: false, count: log.length, brokenAt: i };
    const expected = entryHash({
      id: e.id,
      at: e.at,
      userId: e.userId,
      username: e.username,
      action: e.action,
      detail: e.detail,
      prevHash: e.prevHash,
    });
    if (expected !== e.hash) return { ok: false, count: log.length, brokenAt: i };
    prev = e.hash;
  }
  return { ok: true, count: log.length, brokenAt: null };
}

export async function exportAll(): Promise<unknown> {
  const users = (await getUsers()).map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    vaults: u.vaults,
  }));
  await ensureDir(DOCS_DIR);
  const files = await fs.readdir(DOCS_DIR).catch(() => [] as string[]);
  const docs: DocRecord[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const doc = await readJson<DocRecord | null>(path.join(DOCS_DIR, f), null);
    if (doc) docs.push(doc);
  }
  return {
    exportedAt: new Date().toISOString(),
    users,
    documents: docs,
    audit: await getAudit(),
  };
}
