import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { appendAudit, exportAll } from "@/lib/storage";
import { encryptString } from "@/lib/crypto";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner") {
    return NextResponse.json({ error: "Owner only" }, { status: 403 });
  }

  const data = await exportAll();
  // The backup file is encrypted (AES-256-GCM) with the vault key. Restoring it
  // requires the same VAULT_PASSPHRASE (or the machine's key file). This is a
  // real encrypted blob, not plaintext.
  const encrypted = await encryptString(JSON.stringify(data));

  await appendAudit({
    userId: user.id,
    username: user.username,
    action: "backup",
    detail: "Exported encrypted backup (AES-256-GCM)",
  });

  const filename = `family-vault-backup-${new Date().toISOString().slice(0, 10)}.fvbackup`;
  return new NextResponse(encrypted, {
    status: 200,
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
