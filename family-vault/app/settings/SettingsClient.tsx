"use client";

import { useEffect, useState } from "react";

interface VaultDef {
  id: string;
  label: string;
}
interface UserRow {
  id: string;
  username: string;
  name: string;
  role: "owner" | "member";
  vaults: string[];
}

export default function SettingsClient({
  vaults,
  currentUserId,
}: {
  vaults: VaultDef[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/users");
    if (res.ok) setUsers((await res.json()).users);
  }
  useEffect(() => {
    load();
  }, []);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((v) => v !== id) : [...s, id]));
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, username, password, vaults: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add person");
        return;
      }
      setNotice(`Added ${username}.`);
      setName("");
      setUsername("");
      setPassword("");
      setSelected([]);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function removeUser(id: string) {
    setError("");
    setNotice("");
    const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not remove");
      return;
    }
    load();
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-slate-700/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel/80 text-slate-300">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Username</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Vaults</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2">{u.username}</td>
                <td className="px-3 py-2 capitalize">{u.role}</td>
                <td className="px-3 py-2 text-slate-300">{u.vaults.join(", ") || "—"}</td>
                <td className="px-3 py-2 text-right">
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => removeUser(u.id)}
                      className="rounded border border-slate-600 px-2 py-1 text-xs hover:border-red-500 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-slate-700/60 bg-panel/60 p-4">
        <h2 className="mb-3 text-sm font-medium text-slate-300">Add a person</h2>
        <form onSubmit={addUser} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              className="rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
            />
            <input
              type="password"
              className="rounded-lg border border-slate-600 bg-ink px-3 py-2 outline-none focus:border-accent"
              placeholder="Password (min 8)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <p className="mb-1 text-sm text-slate-300">Vaults this person can use:</p>
            <div className="flex flex-wrap gap-3">
              {vaults.map((v) => (
                <label key={v.id} className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={selected.includes(v.id)}
                    onChange={() => toggle(v.id)}
                  />
                  {v.label}
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="text-sm text-emerald-400">{notice}</p>}
          <button
            disabled={busy}
            className="rounded-lg bg-accent px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {busy ? "Adding…" : "Add person"}
          </button>
        </form>
      </section>
    </div>
  );
}
