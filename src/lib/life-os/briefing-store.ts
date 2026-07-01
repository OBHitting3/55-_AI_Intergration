import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import type { LifeBriefing } from "@/types/life-context";

const DATA_DIR = join(process.cwd(), "src", "data");
const BRIEFINGS_PATH = join(DATA_DIR, "life-briefings.json");

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readAll(): Promise<LifeBriefing[]> {
  await ensureDataDir();
  try {
    const raw = await readFile(BRIEFINGS_PATH, "utf-8");
    return JSON.parse(raw) as LifeBriefing[];
  } catch {
    return [];
  }
}

export async function saveBriefing(briefing: LifeBriefing): Promise<void> {
  await ensureDataDir();
  const entries = await readAll();
  entries.unshift(briefing);
  const trimmed = entries.slice(0, 30);
  await writeFile(BRIEFINGS_PATH, JSON.stringify(trimmed, null, 2), "utf-8");
}

export async function getBriefings(limit = 10): Promise<LifeBriefing[]> {
  const entries = await readAll();
  return entries.slice(0, limit);
}
