"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Setup failed");
        return;
      }
      router.replace("/vault");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-700/60 bg-panel/70 p-6">
      <div>
        <label className="mb-1 block text-sm text-slate-300">Your name</label>
        <input
          className="w-full rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dr. Karl"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Username</label>
        <input
          className="w-full rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Password (min 8 chars)</label>
        <input
          type="password"
          className="w-full rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Confirm password</label>
        <input
          type="password"
          className="w-full rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent px-4 py-2 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create owner account"}
      </button>
    </form>
  );
}
