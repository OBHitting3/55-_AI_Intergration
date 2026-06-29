import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { userCount } from "@/lib/storage";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  // Onboarding is only available before any owner exists.
  if ((await userCount()) > 0) redirect("/login");
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{config.brandName}</h1>
        <p className="mt-2 text-slate-400">
          Welcome. Create the owner account for this device. You&apos;ll be the
          administrator who can add family members and staff.
        </p>
      </div>
      <SetupForm />
      <p className="mt-6 text-center text-xs text-slate-500">
        Everything you store stays encrypted on this machine. Choose a strong password
        you&apos;ll remember.
      </p>
    </main>
  );
}
