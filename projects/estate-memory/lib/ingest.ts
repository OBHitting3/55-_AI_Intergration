import { readFile, stat } from "fs/promises";
import { createHash } from "crypto";
import { basename, relative } from "path";
import type { Chunk, IngestedDoc } from "@/types/estate";
import { chunkText, tokenize } from "./chunker";
import { addDoc } from "./store";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function buildChunks(docId: string, docPath: string, text: string): Chunk[] {
  return chunkText(text).map((c) => ({
    id: `${docId}:${c.chunkIndex}`,
    docId,
    docPath,
    page: null,
    chunkIndex: c.chunkIndex,
    text: c.text,
    tokens: tokenize(c.text),
  }));
}

export async function ingestFile(absPath: string): Promise<IngestedDoc> {
  const stats = await stat(absPath);
  const text = await readFile(absPath, "utf-8");
  const sha = sha256(text);
  const docId = sha.slice(0, 16);
  const docPath = relative(process.cwd(), absPath);
  const chunks = buildChunks(docId, docPath, text);

  const doc: IngestedDoc = {
    docId,
    docPath,
    title: basename(absPath),
    ingestedAt: new Date().toISOString(),
    chunkCount: chunks.length,
    bytes: stats.size,
    sha256: sha,
  };

  await addDoc(doc, chunks);
  return doc;
}

export async function ingestText(title: string, text: string): Promise<IngestedDoc> {
  const sha = sha256(text);
  const docId = sha.slice(0, 16);
  const docPath = `inline:${title}`;
  const chunks = buildChunks(docId, docPath, text);

  const doc: IngestedDoc = {
    docId,
    docPath,
    title,
    ingestedAt: new Date().toISOString(),
    chunkCount: chunks.length,
    bytes: Buffer.byteLength(text, "utf-8"),
    sha256: sha,
  };

  await addDoc(doc, chunks);
  return doc;
}
