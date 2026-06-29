import crypto from "crypto";
import { NextResponse } from "next/server";
import { canAccessVault, getSessionUser } from "@/lib/auth";
import { appendAudit, listDocs, saveDoc } from "@/lib/storage";
import { chunkText } from "@/lib/rag";
import { embedTexts } from "@/lib/ollama";
import { DocRecord, VaultId } from "@/lib/types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const docs = await listDocs(user.vaults);
  return NextResponse.json({
    docs: docs.map((d) => ({
      id: d.id,
      vault: d.vault,
      title: d.title,
      createdAt: d.createdAt,
      chunks: d.chunks.length,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    vault?: VaultId;
    title?: string;
    text?: string;
  };
  const vault = body.vault;
  const title = (body.title || "").trim();
  const text = (body.text || "").trim();

  if (!vault || !title || !text) {
    return NextResponse.json({ error: "vault, title and text are required" }, { status: 400 });
  }
  if (!canAccessVault(user, vault)) {
    return NextResponse.json({ error: "You do not have access to that vault" }, { status: 403 });
  }

  const chunks = chunkText(text);
  const embeddings = await embedTexts(chunks);
  const doc: DocRecord = {
    id: crypto.randomUUID(),
    vault,
    title,
    createdAt: new Date().toISOString(),
    createdBy: user.id,
    chunks: chunks.map((t, i) => ({ text: t, embedding: embeddings[i] ?? null })),
  };
  await saveDoc(doc);
  await appendAudit({
    userId: user.id,
    username: user.username,
    action: "upload",
    detail: `Added "${title}" to ${vault} vault (${chunks.length} chunks)`,
  });

  return NextResponse.json({ ok: true, id: doc.id });
}
