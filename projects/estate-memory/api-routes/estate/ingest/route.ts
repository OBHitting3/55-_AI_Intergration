import { NextResponse } from "next/server";
import { isAbsolute, join, resolve } from "path";
import { ingestFile, ingestText } from "@/lib/estate/ingest";

const PROJECT_ROOT = process.cwd();

interface IngestBody {
  path?: string;
  title?: string;
  text?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => null)) as IngestBody | null;
  if (!body) {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (body.text) {
    const title = body.title ?? "untitled.txt";
    const doc = await ingestText(title, body.text);
    return NextResponse.json({ doc });
  }

  if (body.path) {
    const abs = isAbsolute(body.path) ? body.path : join(PROJECT_ROOT, body.path);
    const resolved = resolve(abs);
    if (!resolved.startsWith(PROJECT_ROOT)) {
      return NextResponse.json(
        { error: "path outside project root" },
        { status: 400 }
      );
    }
    const doc = await ingestFile(resolved);
    return NextResponse.json({ doc });
  }

  return NextResponse.json(
    { error: "provide { path } or { text, title }" },
    { status: 400 }
  );
}
