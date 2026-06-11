"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:border-red-500 hover:text-red-300"
    >
      Sign out
    </button>
  );
}
