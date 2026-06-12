import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ollamaAvailable, CHAT_MODEL } from "@/lib/ollama";
import { config } from "@/lib/config";
import { userCount } from "@/lib/storage";
import VaultClient from "./VaultClient";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  if ((await userCount()) === 0) redirect("/setup");
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const online = await ollamaAvailable();
  const myVaults = config.vaults.filter((v) => user.vaults.includes(v.id));

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{config.brandName}</h1>
          <p className="text-sm text-slate-400">
            Signed in as <span className="text-slate-200">{user.name}</span> ·{" "}
            <span className="capitalize">{user.role}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user.role === "owner" && (
            <>
              <Link
                href="/settings"
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:border-accent"
              >
                Manage people
              </Link>
              <Link
                href="/audit"
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:border-accent"
              >
                Audit log
              </Link>
              <a
                href="/api/backup"
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:border-accent"
              >
                Backup
              </a>
            </>
          )}
          <LogoutButton />
        </div>
      </header>

      <div
        className={`mb-5 rounded-lg border px-4 py-2 text-sm ${
          online
            ? "border-emerald-700/50 bg-emerald-900/20 text-emerald-300"
            : "border-amber-700/50 bg-amber-900/20 text-amber-300"
        }`}
      >
        {online ? (
          <>Local AI online · model <code>{CHAT_MODEL}</code> · nothing leaves this machine.</>
        ) : (
          <>Local AI offline · answers use saved notes (extractive fallback). Start Ollama to enable full answers.</>
        )}
      </div>

      <VaultClient
        userName={user.name}
        vaults={myVaults}
        accessibleIds={user.vaults}
      />
    </main>
  );
}
