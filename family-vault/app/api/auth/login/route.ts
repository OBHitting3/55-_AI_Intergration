import { NextResponse } from "next/server";
import { setSession, toPublic, verifyCredentials } from "@/lib/auth";
import { appendAudit } from "@/lib/storage";
import { checkRate, recordFailure, recordSuccess } from "@/lib/ratelimit";

function clientKey(req: Request, username: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  return `${ip}:${username.toLowerCase()}`;
}

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

  const key = clientKey(req, username);
  const rate = checkRate(key);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rate.retryAfterSec}s.` },
      { status: 429, headers: { "retry-after": String(rate.retryAfterSec) } }
    );
  }

  const user = await verifyCredentials(username, password);
  if (!user) {
    recordFailure(key);
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  recordSuccess(key);
  await setSession(user.id);
  await appendAudit({
    userId: user.id,
    username: user.username,
    action: "login",
    detail: "Signed in",
  });
  return NextResponse.json({ user: toPublic(user) });
}
