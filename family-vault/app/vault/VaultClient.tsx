"use client";

import { useEffect, useState } from "react";
import type { VaultId } from "@/lib/types";

interface VaultOpt {
  id: VaultId;
  label: string;
}
interface Source {
  vault: string;
  title: string;
  score: number;
}
interface ChatMsg {
  role: "you" | "ai";
  text: string;
  sources?: Source[];
  model?: string;
}
interface DocItem {
  id: string;
  vault: VaultId;
  title: string;
  chunks: number;
}

export default function VaultClient({
  userName,
  vaults,
}: {
  userName: string;
  vaults: VaultOpt[];
  accessibleIds: VaultId[];
}) {
  const [tab, setTab] = useState<"ask" | "add">("ask");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  const [docs, setDocs] = useState<DocItem[]>([]);
  const [vault, setVault] = useState<VaultId>(vaults[0]?.id ?? "family");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadDocs() {
    const res = await fetch("/api/docs");
    if (res.ok) {
      const data = await res.json();
      setDocs(data.docs);
    }
  }
  useEffect(() => {
    loadDocs();
  }, []);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || asking) return;
    setMessages((m) => [...m, { role: "you", text: q }]);
    setQuestion("");
    setAsking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: "ai", text: data.error || "Error" }]);
        return;
      }
      setMessages((m) => [
        ...m,
        { role: "ai", text: data.answer, sources: data.sources, model: data.model },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Network error" }]);
    } finally {
      setAsking(false);
    }
  }

  async function addDoc(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    if (!title.trim() || !text.trim()) {
      setNotice("Title and text are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ vault, title, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Could not save");
        return;
      }
      setNotice("Saved to your vault.");
      setTitle("");
      setText("");
      loadDocs();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("ask")}
          className={`rounded-lg px-4 py-2 text-sm ${
            tab === "ask" ? "bg-accent text-white" : "border border-slate-600 text-slate-300"
          }`}
        >
          Ask your files
        </button>
        <button
          onClick={() => setTab("add")}
          className={`rounded-lg px-4 py-2 text-sm ${
            tab === "add" ? "bg-accent text-white" : "border border-slate-600 text-slate-300"
          }`}
        >
          Add a document
        </button>
      </div>

      {tab === "ask" ? (
        <section className="rounded-xl border border-slate-700/60 bg-panel/60 p-4">
          <div className="mb-3 min-h-[220px] space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">
                Hi {userName.split(" ")[0]} — ask a question about your saved files. The AI only
                reads vaults you have access to.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "you" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                    m.role === "you"
                      ? "bg-accent text-white"
                      : "border border-slate-700 bg-ink text-slate-100"
                  }`}
                >
                  {m.text}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 border-t border-slate-700 pt-2 text-xs text-slate-400">
                      Sources:{" "}
                      {m.sources.map((s, j) => (
                        <span key={j} className="mr-2">
                          <span className="rounded bg-slate-700 px-1 py-0.5 capitalize">
                            {s.vault}
                          </span>{" "}
                          {s.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {asking && <p className="text-sm text-slate-500">Thinking…</p>}
          </div>
          <form onSubmit={ask} className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
              placeholder="e.g. What is the WiFi password?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              disabled={asking}
              className="rounded-lg bg-accent px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-700/60 bg-panel/60 p-4">
          <form onSubmit={addDoc} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Vault</label>
              <select
                value={vault}
                onChange={(e) => setVault(e.target.value as VaultId)}
                className="w-full rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
              >
                {vaults.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Title</label>
              <input
                className="w-full rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Insurance policy details"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Text</label>
              <textarea
                className="h-32 w-full rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste any notes or document text here…"
              />
            </div>
            {notice && <p className="text-sm text-slate-300">{notice}</p>}
            <button
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save to vault"}
            </button>
          </form>

          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-slate-300">
              Your documents ({docs.length})
            </h3>
            <ul className="space-y-1 text-sm">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700/60 px-3 py-2"
                >
                  <span>{d.title}</span>
                  <span className="rounded bg-slate-700 px-2 py-0.5 text-xs capitalize">
                    {d.vault}
                  </span>
                </li>
              ))}
              {docs.length === 0 && <li className="text-slate-500">No documents yet.</li>}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
