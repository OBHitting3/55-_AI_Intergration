import { NextResponse } from "next/server";
import { clearSession, getSessionUser } from "@/lib/auth";
import { appendAudit } from "@/lib/storage";

export async function POST() {
  const user = await getSessionUser();
  if (user) {
    await appendAudit({
      userId: user.id,
      username: user.username,
      action: "logout",
      detail: "Signed out",
    });
  }
  clearSession();
  return NextResponse.json({ ok: true });
}
