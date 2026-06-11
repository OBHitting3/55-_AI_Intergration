import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/vault");
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Family Vault</h1>
        <p className="mt-2 text-slate-400">
          Private, local AI over your own files. Your data never leaves home.
        </p>
      </div>
      <LoginForm />
      <div className="mt-6 rounded-lg border border-slate-700/60 bg-panel/60 p-4 text-sm text-slate-400">
        <p className="font-medium text-slate-300">Demo logins</p>
        <p className="mt-1">
          Owner: <code className="text-accent">dad</code> /{" "}
          <code className="text-accent">dad12345</code> — sees Work + Family
        </p>
        <p>
          Family: <code className="text-accent">kid</code> /{" "}
          <code className="text-accent">kid12345</code> — sees Family only
        </p>
      </div>
    </main>
  );
}
