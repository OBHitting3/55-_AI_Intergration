"use client";

import { useEffect, useRef, useState } from "react";
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

// Minimal typing for the browser Web Speech API (not in the default TS lib).
interface SpeechRecognitionResultEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionResultEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
interface SpeechRecognitionCtor {
  new (): SpeechRecognitionLike;
}

const SUGGESTIONS = [
  "What is the WiFi password?",
  "When is the next appointment?",
  "What is the emergency contact?",
  "What day is trash pickup?",
];

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

  // Voice input (works in Chrome on a Pixel). Hidden if unsupported.
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: SpeechRecognitionResultEventLike) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      setQuestion(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setVoiceSupported(true);
  }, []);

  function toggleVoice() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      setQuestion("");
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }

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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  async function runAsk(raw: string) {
    const q = raw.trim();
    if (!q || asking) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }
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

  function ask(e: React.FormEvent) {
    e.preventDefault();
    runAsk(question);
  }

  async function addDoc(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    if (!title.trim() || !text.trim()) {
      setNotice("Please add a name and some text.");
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
      setNotice("Saved.");
      setTitle("");
      setText("");
      loadDocs();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setTab("ask")}
          className={`rounded-xl px-4 py-3 text-base font-medium ${
            tab === "ask" ? "bg-accent text-white" : "border border-slate-600 text-slate-300"
          }`}
        >
          Ask a question
        </button>
        <button
          onClick={() => setTab("add")}
          className={`rounded-xl px-4 py-3 text-base font-medium ${
            tab === "add" ? "bg-accent text-white" : "border border-slate-600 text-slate-300"
          }`}
        >
          Add a note
        </button>
      </div>

      {tab === "ask" ? (
        <section className="rounded-2xl border border-slate-700/60 bg-panel/60 p-4">
          <div className="mb-3 min-h-[200px] space-y-3">
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="text-base text-slate-300">
                  Hi {userName.split(" ")[0]} 👋 — ask me anything about your saved notes. Tap a
                  question or use the microphone.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => runAsk(s)}
                      className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-accent active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "you" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-base ${
                    m.role === "you"
                      ? "bg-accent text-white"
                      : "border border-slate-700 bg-ink text-slate-100"
                  }`}
                >
                  {m.text}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 border-t border-slate-700 pt-2 text-xs text-slate-400">
                      From:{" "}
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
            {asking && <p className="text-base text-slate-500">Thinking…</p>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={ask}
            className="sticky bottom-0 -mx-4 -mb-4 flex items-center gap-2 rounded-b-2xl bg-panel/95 p-3 backdrop-blur"
          >
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                aria-label={listening ? "Stop listening" : "Speak your question"}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  listening
                    ? "animate-pulse bg-red-500 text-white"
                    : "border border-slate-600 text-slate-200"
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
            )}
            <input
              className="h-12 flex-1 rounded-full border border-slate-600 bg-ink px-4 text-base outline-none focus:border-accent"
              placeholder={listening ? "Listening…" : "Type or speak a question"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              disabled={asking || !question.trim()}
              className="h-12 shrink-0 rounded-full bg-accent px-5 text-base font-semibold text-white hover:bg-blue-500 disabled:opacity-40"
            >
              Ask
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            Answers can be wrong — please double-check anything important. Not legal, medical, or
            financial advice.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-700/60 bg-panel/60 p-4">
          <form onSubmit={addDoc} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Save to</label>
              <select
                value={vault}
                onChange={(e) => setVault(e.target.value as VaultId)}
                className="h-12 w-full rounded-xl border border-slate-600 bg-ink px-3 text-base outline-none focus:border-accent"
              >
                {vaults.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">What is it called?</label>
              <input
                className="h-12 w-full rounded-xl border border-slate-600 bg-ink px-3 text-base outline-none focus:border-accent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Insurance details"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Your note</label>
              <textarea
                className="h-36 w-full rounded-xl border border-slate-600 bg-ink px-3 py-2 text-base outline-none focus:border-accent"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste anything you want to remember…"
              />
            </div>
            {notice && <p className="text-sm text-slate-300">{notice}</p>}
            <button
              disabled={saving}
              className="h-12 w-full rounded-xl bg-accent px-4 text-base font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>

          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-slate-300">
              Your notes ({docs.length})
            </h3>
            <ul className="space-y-1 text-sm">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-xl border border-slate-700/60 px-3 py-3"
                >
                  <span>{d.title}</span>
                  <span className="rounded bg-slate-700 px-2 py-0.5 text-xs capitalize">
                    {d.vault}
                  </span>
                </li>
              ))}
              {docs.length === 0 && <li className="text-slate-500">No notes yet.</li>}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
