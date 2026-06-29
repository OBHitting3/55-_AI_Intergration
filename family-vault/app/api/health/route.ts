import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { ollamaAvailable } from "@/lib/ollama";
import { userCount } from "@/lib/storage";

export const dynamic = "force-dynamic";

// Lightweight check to confirm a unit is healthy after install. No secrets.
export async function GET() {
  const [ollama, users] = await Promise.all([ollamaAvailable(), userCount()]);
  return NextResponse.json({
    status: "ok",
    brand: config.brandName,
    version: config.version,
    model: config.model,
    embedModel: config.embedModel,
    vaults: config.vaults.map((v) => v.id),
    ollamaOnline: ollama,
    setupComplete: users > 0,
    demoMode: config.seedDemo,
  });
}
