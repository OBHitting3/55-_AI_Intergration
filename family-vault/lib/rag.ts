import { DocRecord, VaultId } from "./types";
import { embedOne } from "./ollama";

export function chunkText(text: string, size = 480): string[] {
  const clean = text.replace(/\r/g, "").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + " " + s).trim().length > size && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current = (current + " " + s).trim();
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [clean];
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length && i < b.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

const STOP = new Set([
  "the", "a", "an", "is", "are", "of", "to", "and", "in", "on", "for",
  "what", "who", "when", "where", "how", "my", "our", "i", "do", "does",
  "with", "at", "by", "this", "that", "it", "me", "you", "your",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t));
}

function keywordScore(query: string, text: string): number {
  const q = tokens(query);
  if (!q.length) return 0;
  const t = new Set(tokens(text));
  let hits = 0;
  for (const w of q) if (t.has(w)) hits++;
  return hits / q.length;
}

export interface RetrievedChunk {
  text: string;
  vault: VaultId;
  docTitle: string;
  docId: string;
  score: number;
}

export async function retrieve(
  query: string,
  docs: DocRecord[],
  topK = 4
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedOne(query);
  const scored: RetrievedChunk[] = [];

  for (const doc of docs) {
    for (const chunk of doc.chunks) {
      let score: number;
      if (queryEmbedding && chunk.embedding) {
        score = cosine(queryEmbedding, chunk.embedding);
      } else {
        score = keywordScore(query, chunk.text);
      }
      scored.push({
        text: chunk.text,
        vault: doc.vault,
        docTitle: doc.title,
        docId: doc.id,
        score,
      });
    }
  }

  return scored
    .filter((c) => c.score > 0.01)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
