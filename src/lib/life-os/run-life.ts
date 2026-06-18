import type { LifeRunResult, LifeSnapshot } from "@/types/life-context";
import { readLifeContext } from "./life-context";
import { generateBriefing, briefingToMarkdown } from "./briefing";
import { saveBriefing } from "./briefing-store";
import { readSyncState, writeSyncState } from "@/lib/sync-state";
import { logAction } from "@/lib/audit-log";
import { generateTargetConfigs } from "@/lib/bridge-router";
import type { BridgeContext } from "@/types/bridge-context";

function lifeContextToBridgeGlobal(context: Awaited<ReturnType<typeof readLifeContext>>): string {
  const priorities = context.priorities
    .sort((a, b) => a.rank - b.rank)
    .map((p) => `${p.rank}. [${p.area}] ${p.label}`)
    .join("\n");

  const goals = context.goals
    .filter((g) => g.status === "active")
    .map((g) => `- ${g.title}${g.targetDate ? ` (by ${g.targetDate})` : ""}`)
    .join("\n");

  return [
    `Personal Life OS — ${context.owner}`,
    "",
    `North star: ${context.northStar}`,
    "",
    "Current priorities:",
    priorities,
    "",
    "Active goals:",
    goals || "(none)",
    "",
    `Last life run: ${new Date().toISOString()}`,
  ].join("\n");
}

export async function runLife(
  snapshot: LifeSnapshot,
  options?: { syncToBridge?: boolean }
): Promise<LifeRunResult> {
  const context = await readLifeContext();
  const briefing = generateBriefing(context, snapshot);
  await saveBriefing(briefing);

  let syncedToBridge = false;

  if (options?.syncToBridge !== false) {
    const currentState = await readSyncState();
    const bridgeContext: BridgeContext = {
      globalContext: lifeContextToBridgeGlobal(context),
      targets: [
        { id: "cursor", enabled: true, format: "cursorrules" },
        { id: "claude", enabled: true, format: "knowledge-base" },
        { id: "chatgpt", enabled: false, format: "custom-instructions" },
        { id: "gemini", enabled: false, format: "system-prompt" },
      ],
      version: currentState.configVersion + 1,
      lastSynced: briefing.generatedAt,
    };

    generateTargetConfigs(bridgeContext);

    await writeSyncState({
      configVersion: bridgeContext.version,
      lastSynced: briefing.generatedAt,
      targetStatuses: Object.fromEntries(
        bridgeContext.targets.filter((t) => t.enabled).map((t) => [t.id, "synced" as const])
      ),
    });

    await logAction({
      timestamp: briefing.generatedAt,
      action: "life-run",
      actor: "life-os",
      target: "bridge-sync",
      configVersion: bridgeContext.version,
      diff: briefingToMarkdown(briefing).slice(0, 500),
    });

    syncedToBridge = true;
  }

  return {
    briefing,
    contextVersion: context.version,
    syncedToBridge,
  };
}
