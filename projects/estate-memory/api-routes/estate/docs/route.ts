import { NextResponse } from "next/server";
import { loadDocs } from "@/lib/estate/store";

export async function GET(): Promise<NextResponse> {
  const docs = await loadDocs();
  return NextResponse.json({ docs });
}
