import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";
import { ingestFile } from "@/lib/estate/ingest";
import type { IngestedDoc } from "@/types/estate";

const SAMPLES_DIR = join(process.cwd(), "samples", "estate");

export async function POST(): Promise<NextResponse> {
  let entries: string[];
  try {
    entries = await readdir(SAMPLES_DIR);
  } catch {
    return NextResponse.json(
      { error: "samples/estate/ not found" },
      { status: 404 }
    );
  }

  const files = entries.filter((e) => /\.(txt|md)$/i.test(e));
  const docs: IngestedDoc[] = [];
  for (const f of files) {
    docs.push(await ingestFile(join(SAMPLES_DIR, f)));
  }
  return NextResponse.json({ docs, count: docs.length });
}
