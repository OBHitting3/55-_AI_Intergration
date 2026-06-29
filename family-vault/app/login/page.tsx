import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { config } from "@/lib/config";
import { userCount } from "@/lib/storage";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if ((await userCount()) === 0) redirect("/setup");
  const user = await getSessionUser();
  if (user) redirect("/vault");
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{config.brandName}</h1>
        <p className="mt-2 text-slate-400">{config.tagline}</p>
      </div>
      <LoginForm />
      {config.seedDemo && (
        <div className="mt-6 rounded-lg border border-slate-700/60 bg-panel/60 p-4 text-sm text-slate-400">
          <p className="font-medium text-slate-300">Demo logins</p>
          <p className="mt-1">
            Owner: <code className="text-accent">dad</code> /{" "}
            <code className="text-accent">dad12345</code>
          </p>
          <p>
            Family: <code className="text-accent">kid</code> /{" "}
            <code className="text-accent">kid12345</code>
          </p>
        </div>
      )}
    </main>
  );
}
