import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { Chunk, IngestedDoc } from "@/types/estate";
import { tokenize } from "./chunker";

const ESTATE_DIR = join(process.cwd(), "src", "data", "estate");
const CHUNKS_PATH = join(ESTATE_DIR, "chunks.json");
const DOCS_PATH = join(ESTATE_DIR, "docs.json");

const BM25_K1 = 1.5;
const BM25_B = 0.75;

async function ensureDir(): Promise<void> {
  if (!existsSync(ESTATE_DIR)) {
    await mkdir(ESTATE_DIR, { recursive: true });
  }
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function loadChunks(): Promise<Chunk[]> {
  await ensureDir();
  return readJson<Chunk[]>(CHUNKS_PATH, []);
}

export async function loadDocs(): Promise<IngestedDoc[]> {
  await ensureDir();
  return readJson<IngestedDoc[]>(DOCS_PATH, []);
}

export async function addDoc(doc: IngestedDoc, chunks: Chunk[]): Promise<void> {
  const docs = (await loadDocs()).filter((d) => d.docId !== doc.docId);
  const existingChunks = (await loadChunks()).filter((c) => c.docId !== doc.docId);
  await ensureDir();
  await writeFile(DOCS_PATH, JSON.stringify([...docs, doc], null, 2), "utf-8");
  await writeFile(
    CHUNKS_PATH,
    JSON.stringify([...existingChunks, ...chunks], null, 2),
    "utf-8"
  );
}

export interface ScoredChunk extends Chunk {
  score: number;
}

export async function search(query: string, k: number = 5): Promise<ScoredChunk[]> {
  const chunks = await loadChunks();
  if (chunks.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const N = chunks.length;
  const uniqueQueryTerms = Array.from(new Set(queryTokens));

  const df = new Map<string, number>();
  for (const term of uniqueQueryTerms) {
    let count = 0;
    for (const c of chunks) {
      if (c.tokens.includes(term)) count++;
    }
    df.set(term, count);
  }

  const avgdl =
    chunks.reduce((s, c) => s + c.tokens.length, 0) / Math.max(N, 1);

  const scored: ScoredChunk[] = chunks.map((chunk) => {
    const dl = chunk.tokens.length;
    const tf = new Map<string, number>();
    for (const t of chunk.tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

    let score = 0;
    for (const term of queryTokens) {
      const f = tf.get(term) ?? 0;
      if (f === 0) continue;
      const n = df.get(term) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      const numer = f * (BM25_K1 + 1);
      const denom = f + BM25_K1 * (1 - BM25_B + BM25_B * (dl / avgdl));
      score += idf * (numer / denom);
    }
    return { ...chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
