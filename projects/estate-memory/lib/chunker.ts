const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from",
  "has", "have", "he", "her", "his", "i", "in", "is", "it", "its", "me",
  "my", "of", "on", "or", "our", "she", "so", "that", "the", "their",
  "them", "they", "this", "to", "was", "we", "were", "will", "with",
  "you", "your",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export interface ChunkSpec {
  text: string;
  chunkIndex: number;
}

const TARGET_CHARS = 1200;
const OVERLAP_CHARS = 200;
const MAX_PARA_CHARS = 2000;

export function chunkText(text: string): ChunkSpec[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  let buffer = "";

  function flush() {
    if (buffer.length > 0) {
      chunks.push(buffer);
      buffer = "";
    }
  }

  for (const para of paragraphs) {
    if (para.length > MAX_PARA_CHARS) {
      flush();
      const step = TARGET_CHARS - OVERLAP_CHARS;
      for (let i = 0; i < para.length; i += step) {
        chunks.push(para.slice(i, i + TARGET_CHARS));
        if (i + TARGET_CHARS >= para.length) break;
      }
      continue;
    }
    if (buffer.length + para.length + 2 > TARGET_CHARS && buffer.length > 0) {
      flush();
      buffer = para;
    } else {
      buffer = buffer.length === 0 ? para : `${buffer}\n\n${para}`;
    }
  }
  flush();

  return chunks.map((t, chunkIndex) => ({ text: t, chunkIndex }));
}
