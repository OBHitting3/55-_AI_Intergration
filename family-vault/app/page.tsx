import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { userCount } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function Home() {
  if ((await userCount()) === 0) redirect("/setup");
  const user = await getSessionUser();
  redirect(user ? "/vault" : "/login");
}
