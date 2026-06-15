import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { appendAudit, getActiveModel, setActiveModel } from "@/lib/storage";
import { listModels } from "@/lib/ollama";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });
  const [available, active] = await Promise.all([listModels(), getActiveModel()]);
  return NextResponse.json({ available, active });
}

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { model?: string };
  const model = (body.model || "").trim();
  if (!model) return NextResponse.json({ error: "model is required" }, { status: 400 });

  const available = await listModels();
  if (available.length && !available.includes(model)) {
    return NextResponse.json(
      { error: `That model isn't installed. Run: ollama pull ${model}` },
      { status: 400 }
    );
  }

  await setActiveModel(model);
  await appendAudit({
    userId: me.id,
    username: me.username,
    action: "model_changed",
    detail: `Active AI model set to ${model}`,
  });
  return NextResponse.json({ ok: true, active: model });
}
