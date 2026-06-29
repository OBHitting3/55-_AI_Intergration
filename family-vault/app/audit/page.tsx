import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAudit, verifyAudit } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "owner") redirect("/vault");

  const log = await getAudit();
  const integrity = await verifyAudit();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Audit log</h1>
          <p className="text-sm text-slate-400">Every access is recorded, locally.</p>
        </div>
        <Link
          href="/vault"
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:border-accent"
        >
          Back
        </Link>
      </header>

      <div
        className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
          integrity.ok
            ? "border-emerald-700/50 bg-emerald-900/20 text-emerald-300"
            : "border-red-700/50 bg-red-900/20 text-red-300"
        }`}
      >
        {integrity.ok ? (
          <>Integrity verified — hash chain intact across {integrity.count} entries. No tampering detected.</>
        ) : (
          <>TAMPERING DETECTED — the hash chain breaks at entry #{(integrity.brokenAt ?? 0) + 1}. The log has been altered.</>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel/80 text-slate-300">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Who</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {log.map((e) => (
              <tr key={e.id} className="border-t border-slate-800">
                <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                  {new Date(e.at).toLocaleString()}
                </td>
                <td className="px-3 py-2">{e.username}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-slate-700 px-2 py-0.5 text-xs">{e.action}</span>
                </td>
                <td className="px-3 py-2 text-slate-300">{e.detail}</td>
              </tr>
            ))}
            {log.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                  No activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
