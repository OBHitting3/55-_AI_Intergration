"use client";

import { useEffect, useState } from "react";

export default function ModelPicker() {
  const [available, setAvailable] = useState<string[]>([]);
  const [active, setActive] = useState("");
  const [choice, setChoice] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/models");
    if (res.ok) {
      const data = await res.json();
      setAvailable(data.available || []);
      setActive(data.active || "");
      setChoice(data.active || "");
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: choice }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not change model");
        return;
      }
      setActive(data.active);
      setNotice(`Now using ${data.active}.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-panel/60 p-4">
      <h2 className="mb-1 text-sm font-medium text-slate-300">AI model</h2>
      <p className="mb-3 text-xs text-slate-500">
        Bigger models give smarter answers but need more powerful hardware. On a real rig
        (RTX 5090) try <code>qwen2.5:7b</code> or <code>llama3.1:8b</code>. Install one first with{" "}
        <code>ollama pull &lt;model&gt;</code>.
      </p>
      <p className="mb-3 text-sm text-slate-300">
        Current: <span className="rounded bg-slate-700 px-2 py-0.5">{active || "—"}</span>
      </p>
      <form onSubmit={save} className="flex flex-wrap items-center gap-2">
        {available.length > 0 ? (
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            className="h-11 rounded-xl border border-slate-600 bg-ink px-3 text-base outline-none focus:border-accent"
          >
            {available.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            placeholder="e.g. qwen2.5:7b"
            className="h-11 flex-1 rounded-xl border border-slate-600 bg-ink px-3 text-base outline-none focus:border-accent"
          />
        )}
        <button
          disabled={busy || !choice}
          className="h-11 rounded-xl bg-accent px-4 text-base font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Use this model"}
        </button>
      </form>
      {available.length === 0 && (
        <p className="mt-2 text-xs text-amber-400">
          No installed models detected (is Ollama running?). You can still type a model name.
        </p>
      )}
      {notice && <p className="mt-2 text-sm text-emerald-400">{notice}</p>}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </section>
  );
}
