const BASE_URL = process.env.ESTATE_LLM_BASE_URL;
const MODEL = process.env.ESTATE_LLM_MODEL ?? "llama-3.3-70b-instruct";
const API_KEY = process.env.ESTATE_LLM_API_KEY ?? "";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResult {
  content: string;
  mode: "live" | "stub";
}

export function isLive(): boolean {
  return Boolean(BASE_URL);
}

export async function chat(messages: ChatMessage[]): Promise<ChatResult> {
  if (!BASE_URL) {
    return {
      content: "[stub mode — set ESTATE_LLM_BASE_URL to enable]",
      mode: "stub",
    };
  }

  const url = BASE_URL.replace(/\/$/, "") + "/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.1,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `LLM request failed (${res.status}): ${body.slice(0, 200)}`
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  return { content, mode: "live" };
}
