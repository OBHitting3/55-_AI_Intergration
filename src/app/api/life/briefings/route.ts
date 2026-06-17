import { NextRequest, NextResponse } from "next/server";
import { getBriefings } from "@/lib/life-os/briefing-store";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 10, 30) : 10;
  const briefings = await getBriefings(limit);
  return NextResponse.json({ briefings });
}
