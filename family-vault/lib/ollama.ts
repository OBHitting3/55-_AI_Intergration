// Thin client for a local Ollama server. Everything degrades gracefully:
// if Ollama is not running, the app still works using extractive answers and
// keyword retrieval, so the product is never hard-down on the model.

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const CHAT_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b";
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

export async function ollamaAvailable(): Promise<boolean> {
  try {
    const res = await withTimeout(fetch(`${OLLAMA_URL}/api/tags`), 1500);
    return res.ok;
  } catch {
    return false;
  }
}

export async function embedTexts(texts: string[]): Promise<(number[] | null)[]> {
  if (!(await ollamaAvailable())) return texts.map(() => null);
  const out: (number[] | null)[] = [];
  for (const text of texts) {
    try {
      const res = await withTimeout(
        fetch(`${OLLAMA_URL}/api/embeddings`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
        }),
        20000
      );
      if (!res.ok) {
        out.push(null);
        continue;
      }
      const data = (await res.json()) as { embedding?: number[] };
      out.push(Array.isArray(data.embedding) ? data.embedding : null);
    } catch {
      out.push(null);
    }
  }
  return out;
}

export async function embedOne(text: string): Promise<number[] | null> {
  const [e] = await embedTexts([text]);
  return e;
}

export interface GenerateResult {
  answer: string;
  model: string;
  usedModel: boolean;
}

export async function generateAnswer(
  question: string,
  context: string
): Promise<GenerateResult> {
  const system =
    "You are a private, local family assistant. Answer ONLY using the provided context. " +
    "If the answer is not in the context, say you do not have that information. " +
    "Never invent facts. Be concise and honest.";
  const prompt = `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer using only the context above.`;

  if (!(await ollamaAvailable())) {
    return {
      answer:
        "[Local model offline — showing the most relevant saved notes instead]\n\n" +
        (context.trim() || "No matching information found in your vaults."),
      model: "extractive-fallback",
      usedModel: false,
    };
  }

  try {
    const res = await withTimeout(
      fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: CHAT_MODEL,
          stream: false,
          options: { temperature: 0.2 },
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        }),
      }),
      60000
    );
    if (!res.ok) throw new Error(`ollama ${res.status}`);
    const data = (await res.json()) as { message?: { content?: string } };
    const answer = data.message?.content?.trim();
    if (!answer) throw new Error("empty answer");
    return { answer, model: CHAT_MODEL, usedModel: true };
  } catch {
    return {
      answer:
        "[Local model error — showing the most relevant saved notes instead]\n\n" +
        (context.trim() || "No matching information found in your vaults."),
      model: "extractive-fallback",
      usedModel: false,
    };
  }
}

export { CHAT_MODEL };
