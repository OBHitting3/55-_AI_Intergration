import { search, type ScoredChunk } from "./store";
import { chat, isLive, type ChatMessage } from "./llm";
import type { Citation, QueryResult } from "@/types/estate";

const SYSTEM_PROMPT = `You are Estate Memory, a private legal-and-financial document assistant.
You answer ONLY using the numbered SOURCE excerpts provided below.
If the sources do not contain the answer, say so plainly and stop.
Cite every factual claim with [n] referring to the source numbers.
Keep answers concise and literal. Do not speculate or extrapolate.`;

const TOP_K = 5;

function buildPrompt(question: string, hits: ScoredChunk[]): ChatMessage[] {
  const sources = hits
    .map(
      (h, i) =>
        `[${i + 1}] (${h.docPath}${h.page ? `, page ${h.page}` : ""})\n${h.text}`
    )
    .join("\n\n");

  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `SOURCES:\n\n${sources}\n\n---\n\nQUESTION: ${question}`,
    },
  ];
}

function stubAnswer(hits: ScoredChunk[]): string {
  if (hits.length === 0) return "No matching documents found.";
  return `[stub mode — no LLM endpoint configured. Showing top retrieved excerpt verbatim.]\n\n${hits[0].text}\n\n[1]`;
}

export async function answerQuestion(question: string): Promise<QueryResult> {
  const start = Date.now();
  const hits = await search(question, TOP_K);

  let answer: string;
  let mode: "live" | "stub";

  if (!isLive()) {
    answer = stubAnswer(hits);
    mode = "stub";
  } else if (hits.length === 0) {
    answer = "No matching documents in the vault.";
    mode = "live";
  } else {
    const result = await chat(buildPrompt(question, hits));
    answer = result.content;
    mode = result.mode;
  }

  const citations: Citation[] = hits.map((h) => ({
    chunkId: h.id,
    docId: h.docId,
    docPath: h.docPath,
    page: h.page,
    snippet: h.text.length > 400 ? h.text.slice(0, 400) + "…" : h.text,
    score: Number(h.score.toFixed(4)),
  }));

  return {
    question,
    answer,
    citations,
    latencyMs: Date.now() - start,
    llmMode: mode,
  };
}
