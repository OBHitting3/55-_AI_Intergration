import ConfigValidateButton from "@/components/bridge/config-validate-button";
import HealthStatus from "@/components/bridge/health-status";
import SyncHistory from "@/components/bridge/sync-history";
import type { BridgeContext } from "@/types/bridge-context";

const PROJECTS_INDEX = `Iron Forge Studios monorepo (see PROJECTS.md):
- ai-bridge-sync (src/) — MCP dashboard, config validation, sync
- palm-luxe-tycoon — Roblox LC economy
- estate-memory — estate/trust RAG (integrate from projects/estate-memory/)
- karl-twin — approval-gated digital twin agent
- drive-import/ — staging for external USB/Windows drive scans`;

const DEFAULT_CONTEXT: BridgeContext = {
  globalContext: `${PROJECTS_INDEX}\n\nIron Forge Studios AI Bridge Sync — MCP-only architecture. Edit global context via the dashboard or DEFAULT_GLOBAL_CONTEXT.`,
  targets: [
    { id: "cursor", enabled: true, format: "cursorrules" },
    { id: "claude", enabled: true, format: "knowledge-base" },
    { id: "chatgpt", enabled: false, format: "custom-instructions" },
    { id: "gemini", enabled: false, format: "system-prompt" },
  ],
  version: 1,
  lastSynced: new Date().toISOString(),
};

export default function DashboardPage() {
  return (
    <main className="max-w-5xl mx-auto p-8 space-y-8">
      <header className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AI Bridge Sync
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Iron Forge Studios — MCP-only architecture
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">
          Config Validation
        </h2>
        <p className="text-sm text-gray-400">
          Validate your exported config against each target LLM&apos;s
          constraints before deploying.
        </p>
        <ConfigValidateButton context={DEFAULT_CONTEXT} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">
          MCP Server Health
        </h2>
        <HealthStatus />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">Sync History</h2>
        <SyncHistory />
      </section>
    </main>
  );
}
