import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { config } from "@/lib/config";
import SettingsClient from "./SettingsClient";
import ModelPicker from "./ModelPicker";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "owner") redirect("/vault");

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between pr-12 sm:pr-0">
        <div>
          <h1 className="text-xl font-semibold">Manage people</h1>
          <p className="text-sm text-slate-400">
            Add family members or staff and choose which vaults they can use.
          </p>
        </div>
        <Link
          href="/vault"
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:border-accent"
        >
          Back
        </Link>
      </header>

      <div className="space-y-6">
        <SettingsClient vaults={config.vaults} currentUserId={user.id} />
        <ModelPicker />
      </div>
    </main>
  );
}
