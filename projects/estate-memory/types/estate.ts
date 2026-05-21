export interface Chunk {
  id: string;
  docId: string;
  docPath: string;
  page: number | null;
  chunkIndex: number;
  text: string;
  tokens: string[];
}

export interface IngestedDoc {
  docId: string;
  docPath: string;
  title: string;
  ingestedAt: string;
  chunkCount: number;
  bytes: number;
  sha256: string;
}

export interface Citation {
  chunkId: string;
  docId: string;
  docPath: string;
  page: number | null;
  snippet: string;
  score: number;
}

export type LLMMode = "live" | "stub";

export interface QueryResult {
  question: string;
  answer: string;
  citations: Citation[];
  latencyMs: number;
  llmMode: LLMMode;
}

export interface EstateAuditEntry {
  timestamp: string;
  actor: string;
  question: string;
  answer: string;
  citationIds: string[];
  latencyMs: number;
  llmMode: LLMMode;
}
