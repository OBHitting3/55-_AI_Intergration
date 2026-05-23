import { NextRequest, NextResponse } from "next/server";
import type { BridgeContext } from "@/types/bridge-context";
import { buildSuperbulletExport } from "@/lib/bridge-router";
import { readSyncState } from "@/lib/sync-state";

/**
 * GET /api/export/superbullet
 * Returns files to write into the Palm Springs Roblox repo for SuperbulletAI.
 * Optional ?version=N to match last sync; body override via POST.
 */
export async function GET(): Promise<NextResponse> {
  const state = await readSyncState();
  const context = defaultContext(state.configVersion);
  return NextResponse.json({
    success: true,
    configVersion: state.configVersion,
    lastSynced: state.lastSynced,
    files: buildSuperbulletExport(context),
    instructions: SUPERBULLET_INSTRUCTIONS,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const context = body as BridgeContext;
  if (!context.globalContext) {
    return NextResponse.json(
      { error: "Missing globalContext" },
      { status: 400 }
    );
  }
  const files = buildSuperbulletExport({
    ...context,
    version: context.version ?? 1,
    lastSynced: context.lastSynced ?? new Date().toISOString(),
  });
  return NextResponse.json({
    success: true,
    configVersion: context.version,
    files,
    instructions: SUPERBULLET_INSTRUCTIONS,
  });
}

const SUPERBULLET_INSTRUCTIONS = {
  windows: [
    "Open the same PalmSprings folder in VS Code/Cursor and SuperbulletAI",
    "Run: powershell -ExecutionPolicy Bypass -File scripts/pull-bridge-export.ps1",
    "Or copy each file from the JSON response into your repo",
    "In VS Code: Task Rojo: Serve",
    "In Roblox Studio: Rojo plugin Connect, HTTP enabled, Play Solo",
  ],
  superbulletUrl: "https://superbullet.ai/downloads",
};

function defaultContext(version: number): BridgeContext {
  return {
    globalContext:
      process.env.DEFAULT_GLOBAL_CONTEXT ??
      "Palm Springs Paradise — KarLux MCM life sim. See docs/karlux and .cursor/rules/roblox-mcm.md.",
    targets: [
      { id: "cursor", enabled: true, format: "cursorrules" },
      { id: "superbullet", enabled: true, format: "project-context" },
      { id: "claude", enabled: false, format: "knowledge-base" },
      { id: "chatgpt", enabled: false, format: "custom-instructions" },
      { id: "gemini", enabled: false, format: "system-prompt" },
    ],
    version,
    lastSynced: new Date().toISOString(),
  };
}
