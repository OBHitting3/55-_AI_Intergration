import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/estate/rag";
import { logQuery } from "@/lib/estate/audit";

interface QueryBody {
  question?: string;
  actor?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => null)) as QueryBody | null;
  if (!body?.question) {
    return NextResponse.json({ error: "missing question" }, { status: 400 });
  }

  const result = await answerQuestion(body.question);

  await logQuery({
    timestamp: new Date().toISOString(),
    actor: body.actor ?? "anonymous",
    question: result.question,
    answer: result.answer,
    citationIds: result.citations.map((c) => c.chunkId),
    latencyMs: result.latencyMs,
    llmMode: result.llmMode,
  });

  return NextResponse.json(result);
}
