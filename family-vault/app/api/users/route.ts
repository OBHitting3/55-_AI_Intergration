import { NextResponse } from "next/server";
import { getSessionUser, toPublic } from "@/lib/auth";
import { appendAudit, createUser, deleteUser, getUserById, getUsers } from "@/lib/storage";

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });
  const users = await getUsers();
  return NextResponse.json({ users: users.map(toPublic) });
}

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    username?: string;
    password?: string;
    vaults?: string[];
    role?: "owner" | "member";
  };

  const result = await createUser({
    username: (body.username || "").trim(),
    name: (body.name || "").trim(),
    password: body.password || "",
    role: body.role === "owner" ? "owner" : "member",
    vaults: Array.isArray(body.vaults) ? body.vaults : [],
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await appendAudit({
    userId: me.id,
    username: me.username,
    action: "user_added",
    detail: `Added ${result.user.role} "${result.user.username}" with vaults: ${result.user.vaults.join(", ") || "none"}`,
  });
  return NextResponse.json({ user: toPublic(result.user) });
}

export async function DELETE(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  if (id === me.id) {
    return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
  }

  const target = await getUserById(id);
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Never allow removing the last owner.
  if (target.role === "owner") {
    const owners = (await getUsers()).filter((u) => u.role === "owner");
    if (owners.length <= 1) {
      return NextResponse.json({ error: "Cannot remove the last owner" }, { status: 400 });
    }
  }

  await deleteUser(id);
  await appendAudit({
    userId: me.id,
    username: me.username,
    action: "user_removed",
    detail: `Removed user "${target.username}"`,
  });
  return NextResponse.json({ ok: true });
}
