import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { appendAudit, listDocs } from "@/lib/storage";
import { retrieve } from "@/lib/rag";
import { generateAnswer } from "@/lib/ollama";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { question?: string };
  const question = (body.question || "").trim();
  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  // Access control: a user only ever retrieves from vaults they can access.
  const docs = await listDocs(user.vaults);
  const hits = await retrieve(question, docs);
  const context = hits
    .map((h, i) => `[${i + 1}] (${h.vault} • ${h.docTitle})\n${h.text}`)
    .join("\n\n");

  const result = await generateAnswer(question, context);

  const sources = hits.map((h) => ({
    vault: h.vault,
    title: h.docTitle,
    score: Number(h.score.toFixed(3)),
  }));

  await appendAudit({
    userId: user.id,
    username: user.username,
    action: "query",
    detail:
      `Q: ${question.slice(0, 120)} | model: ${result.model} | ` +
      `sources: ${sources.map((s) => `${s.vault}/${s.title}`).join(", ") || "none"}`,
  });

  return NextResponse.json({
    answer: result.answer,
    usedModel: result.usedModel,
    model: result.model,
    sources,
    accessibleVaults: user.vaults,
  });
}
