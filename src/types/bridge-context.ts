export interface LLMTarget {
  id: "cursor" | "claude" | "chatgpt" | "gemini" | "superbullet";
  enabled: boolean;
  format: string;
}

/** Files produced for the VS Code → SuperbulletAI → Rojo → Studio line */
export interface SuperbulletExportFile {
  path: string;
  content: string;
}

export interface BridgeContext {
  globalContext: string;
  targets: LLMTarget[];
  version: number;
  lastSynced: string;
}

export interface MCPServerConfig {
  name: string;
  transport: "sse" | "stdio";
  url?: string;
  command?: string;
  tools: string[];
}

export interface SyncState {
  configVersion: number;
  lastSynced: string;
  targetStatuses: Record<string, "synced" | "pending" | "error">;
}
