import { NextRequest, NextResponse } from "next/server";
import type { LifeSnapshot } from "@/types/life-context";
import { runLife } from "@/lib/life-os/run-life";
import { briefingToMarkdown } from "@/lib/life-os/briefing";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const payload = body as {
    snapshot?: Partial<LifeSnapshot>;
    syncToBridge?: boolean;
  };

  const snapshot: LifeSnapshot = {
    capturedAt: payload.snapshot?.capturedAt ?? new Date().toISOString(),
    issues: payload.snapshot?.issues ?? [],
    projects: payload.snapshot?.projects ?? [],
    notes: payload.snapshot?.notes,
  };

  const result = await runLife(snapshot, {
    syncToBridge: payload.syncToBridge,
  });

  return NextResponse.json({
    ...result,
    markdown: briefingToMarkdown(result.briefing),
  });
}
