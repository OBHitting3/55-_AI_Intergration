import crypto from "crypto";
import { cookies } from "next/headers";
import { getUserById, getUserByUsername, hashPassword, init } from "./storage";
import { PublicUser, User } from "./types";

const COOKIE = "fv_session";
const SECRET = process.env.SESSION_SECRET || "dev-only-secret-change-me";

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

function makeToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(userId);
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

export function setSession(userId: string): void {
  cookies().set(COOKIE, makeToken(userId), {
    httpOnly: true,
    sameSite: "lax",
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
  const userId = verifyToken(token);
  if (!userId) return null;
  const user = await getUserById(userId);
  return user ? toPublic(user) : null;
}
