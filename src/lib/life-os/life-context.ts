import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import type { LifeContext } from "@/types/life-context";
import { DEFAULT_LIFE_CONTEXT } from "./default-context";

const DATA_DIR = join(process.cwd(), "src", "data");
const LIFE_CONTEXT_PATH = join(DATA_DIR, "life-context.json");

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readLifeContext(): Promise<LifeContext> {
  await ensureDataDir();
  try {
    const raw = await readFile(LIFE_CONTEXT_PATH, "utf-8");
    return JSON.parse(raw) as LifeContext;
  } catch {
    const initial = { ...DEFAULT_LIFE_CONTEXT, updatedAt: new Date().toISOString() };
    await writeLifeContext(initial);
    return initial;
  }
}

export async function writeLifeContext(context: LifeContext): Promise<void> {
  await ensureDataDir();
  await writeFile(LIFE_CONTEXT_PATH, JSON.stringify(context, null, 2), "utf-8");
}
