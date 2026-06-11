import { NextResponse } from "next/server";
import { setSession, toPublic, verifyCredentials } from "@/lib/auth";
import { appendAudit } from "@/lib/storage";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };
  const username = (body.username || "").trim();
  const password = body.password || "";
  if (!username || !password) {
    return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
  }

  const user = await verifyCredentials(username, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  setSession(user.id);
  await appendAudit({
    userId: user.id,
    username: user.username,
    action: "login",
    detail: "Signed in",
  });
  return NextResponse.json({ user: toPublic(user) });
}
