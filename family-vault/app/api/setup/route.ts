import { NextResponse } from "next/server";
import { setSession, toPublic } from "@/lib/auth";
import { appendAudit, createUser, userCount } from "@/lib/storage";

export async function POST(req: Request) {
  // First-run only: refuse once an owner already exists.
  if ((await userCount()) > 0) {
    return NextResponse.json({ error: "Setup already completed" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    username?: string;
    password?: string;
  };

  const result = await createUser({
    username: (body.username || "").trim(),
    name: (body.name || "").trim(),
    password: body.password || "",
    role: "owner",
    vaults: [],
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await setSession(result.user.id);
  await appendAudit({
    userId: result.user.id,
    username: result.user.username,
    action: "owner_created",
    detail: "Owner account created during first-run setup",
  });

  return NextResponse.json({ user: toPublic(result.user) });
}
