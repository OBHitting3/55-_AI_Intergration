import Link from "next/link";
import { readLifeContext } from "@/lib/life-os/life-context";
import { getBriefings } from "@/lib/life-os/briefing-store";

export const dynamic = "force-dynamic";

export default async function LifePage() {
  const context = await readLifeContext();
  const briefings = await getBriefings(5);

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-8">
      <header className="border-b border-gray-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Life OS
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Personal priorities, routines, and daily briefings for {context.owner}
          </p>
        </div>
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
          ← Bridge Sync
        </Link>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">North star</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{context.northStar}</p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-200">Priorities</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            {context.priorities.map((p) => (
              <li key={p.rank}>
                <span className="text-gray-500">#{p.rank}</span> {p.label}
                <span className="text-gray-600 ml-2">({p.area})</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-200">Routines</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            {context.routines
              .filter((r) => r.enabled)
              .map((r) => (
                <li key={r.id}>
                  {r.timeOfDay ?? "—"} · {r.title}
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">Recent briefings</h2>
        {briefings.length === 0 ? (
          <p className="text-sm text-gray-500">
            No briefings yet. POST to <code className="text-gray-400">/api/life/run</code>{" "}
            or trigger the daily automation.
          </p>
        ) : (
          <ul className="space-y-4">
            {briefings.map((b) => (
              <li
                key={b.id}
                className="border border-gray-800 rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{new Date(b.generatedAt).toLocaleString()}</span>
                  <span>{b.summary}</span>
                </div>
                <p className="text-sm text-gray-200">{b.greeting}</p>
                {b.topActions.length > 0 && (
                  <ul className="text-sm text-gray-400 list-disc list-inside">
                    {b.topActions.slice(0, 3).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
