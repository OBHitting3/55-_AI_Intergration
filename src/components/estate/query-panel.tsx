"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { QueryResult } from "@/types/estate";

export default function QueryPanel() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/estate/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult((await res.json()) as QueryResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "query failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Who is the current beneficiary of the 1994 grandchildren's trust after the 2017 amendment?"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-4 py-2 rounded"
          >
            {loading ? "Searching…" : "Ask"}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-sm text-red-400 border border-red-800 rounded p-3">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="border border-gray-700 rounded p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {result.latencyMs}ms · {result.citations.length} source
                {result.citations.length === 1 ? "" : "s"}
              </span>
              <span
                className={
                  result.llmMode === "live"
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                {result.llmMode === "live" ? "LIVE LLM" : "STUB MODE"}
              </span>
            </div>
            <div className="text-sm text-gray-100 whitespace-pre-wrap">
              {result.answer}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Sources</h3>
            {result.citations.length === 0 ? (
              <div className="text-sm text-gray-500">
                No matching documents.
              </div>
            ) : (
              result.citations.map((c, i) => (
                <div
                  key={c.chunkId}
                  className="border border-gray-800 rounded p-3 text-xs space-y-1"
                >
                  <div className="flex justify-between text-gray-500">
                    <span>
                      [{i + 1}] {c.docPath}
                      {c.page ? `, p. ${c.page}` : ""}
                    </span>
                    <span>score {c.score}</span>
                  </div>
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {c.snippet}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
