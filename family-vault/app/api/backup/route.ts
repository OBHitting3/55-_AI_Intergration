import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { appendAudit, exportAll } from "@/lib/storage";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner") {
    return NextResponse.json({ error: "Owner only" }, { status: 403 });
  }

  const data = await exportAll();
  await appendAudit({
    userId: user.id,
    username: user.username,
    action: "backup",
    detail: "Exported full encrypted-at-rest backup (JSON)",
  });

  const filename = `family-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
