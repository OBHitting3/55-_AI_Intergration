import { NextRequest, NextResponse } from "next/server";
import type { LifeContext } from "@/types/life-context";
import { readLifeContext, writeLifeContext } from "@/lib/life-os/life-context";

export async function GET(): Promise<NextResponse> {
  const context = await readLifeContext();
  return NextResponse.json(context);
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const incoming = body as LifeContext;

  if (!incoming.owner || !incoming.northStar) {
    return NextResponse.json(
      { error: "Missing required fields: owner, northStar" },
      { status: 400 }
    );
  }

  const updated: LifeContext = {
    ...incoming,
    version: (incoming.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  await writeLifeContext(updated);
  return NextResponse.json(updated);
}
