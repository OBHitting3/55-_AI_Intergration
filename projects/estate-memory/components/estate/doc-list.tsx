"use client";

import { useCallback, useEffect, useState } from "react";
import type { IngestedDoc } from "@/types/estate";

export default function DocList() {
  const [docs, setDocs] = useState<IngestedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/estate/docs");
      const json = (await res.json()) as { docs: IngestedDoc[] };
      setDocs(json.docs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function ingestSamples() {
    setIngesting(true);
    setError(null);
    try {
      const res = await fetch("/api/estate/ingest-samples", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ingest failed");
    } finally {
      setIngesting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {loading
            ? "Loading…"
            : `${docs.length} document${docs.length === 1 ? "" : "s"} indexed`}
        </span>
        <button
          onClick={() => void ingestSamples()}
          disabled={ingesting}
          className="text-xs text-blue-400 hover:text-blue-300 underline disabled:text-gray-600"
        >
          {ingesting ? "Ingesting…" : "Ingest sample docs"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 border border-red-800 rounded p-3">
          {error}
        </div>
      )}

      {docs.length === 0 && !loading ? (
        <div className="text-sm text-gray-500 border border-gray-800 rounded p-3">
          No documents indexed yet. Click <em>Ingest sample docs</em> above to
          load the bundled samples from{" "}
          <code className="text-gray-400">samples/estate/</code>.
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div
              key={d.docId}
              className="flex items-center justify-between border border-gray-800 rounded p-3 text-xs"
            >
              <div>
                <div className="text-gray-200 font-medium">{d.title}</div>
                <div className="text-gray-500 mt-0.5">{d.docPath}</div>
              </div>
              <div className="text-gray-500 text-right space-y-0.5">
                <div>
                  {d.chunkCount} chunks · {(d.bytes / 1024).toFixed(1)} KB
                </div>
                <div>{new Date(d.ingestedAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
