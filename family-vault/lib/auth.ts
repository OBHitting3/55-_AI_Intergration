import crypto from "crypto";
import { cookies } from "next/headers";
import { getUserById, getUserByUsername, hashPassword, init } from "./storage";
import { getSessionSecret } from "./crypto";
import { PublicUser, User, VaultId } from "./types";

const COOKIE = "fv_session";

// Secret comes from SESSION_SECRET, or a strong random value generated and
// persisted on first run. There is intentionally NO hardcoded fallback, so a
// missing env var can never leave the app signing with a public/default key.
async function sign(value: string): Promise<string> {
  const secret = await getSessionSecret();
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

async function makeToken(userId: string): Promise<string> {
  return `${userId}.${await sign(userId)}`;
}

async function verifyToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = await sign(userId);
  if (
    sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return userId;
  }
  return null;
}

export function toPublic(u: User): PublicUser {
  return { id: u.id, username: u.username, name: u.name, role: u.role, vaults: u.vaults };
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<User | null> {
  await init();
  const user = await getUserByUsername(username);
  if (!user) return null;
  const candidate = hashPassword(password, user.salt);
  const ok =
    candidate.length === user.hash.length &&
    crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(user.hash));
  return ok ? user : null;
}

export async function setSession(userId: string): Promise<void> {
  cookies().set(COOKIE, await makeToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function clearSession(): void {
  cookies().delete(COOKIE);
}

export async function getSessionUser(): Promise<PublicUser | null> {
  await init();
  const token = cookies().get(COOKIE)?.value;
  const userId = await verifyToken(token);
  if (!userId) return null;
  const user = await getUserById(userId);
  return user ? toPublic(user) : null;
}

// Central authorization helpers so routes don't each re-implement checks.
export async function requireUser(): Promise<PublicUser | null> {
  return getSessionUser();
}

export function canAccessVault(user: PublicUser, vault: VaultId): boolean {
  return user.vaults.includes(vault);
}
