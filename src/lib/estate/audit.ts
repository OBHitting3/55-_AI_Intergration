import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { EstateAuditEntry } from "@/types/estate";

const ESTATE_DIR = join(process.cwd(), "src", "data", "estate");
const AUDIT_PATH = join(ESTATE_DIR, "audit.json");

async function ensureDir(): Promise<void> {
  if (!existsSync(ESTATE_DIR)) {
    await mkdir(ESTATE_DIR, { recursive: true });
  }
}

async function readLog(): Promise<EstateAuditEntry[]> {
  await ensureDir();
  try {
    const raw = await readFile(AUDIT_PATH, "utf-8");
    return JSON.parse(raw) as EstateAuditEntry[];
  } catch {
    return [];
  }
}

export async function logQuery(entry: EstateAuditEntry): Promise<void> {
  await ensureDir();
  const entries = await readLog();
  entries.push(entry);
  await writeFile(AUDIT_PATH, JSON.stringify(entries, null, 2), "utf-8");
}

export async function getQueryHistory(limit?: number): Promise<EstateAuditEntry[]> {
  const entries = await readLog();
  const sorted = entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}
