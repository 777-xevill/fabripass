import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { getStore } from "../db/store/client";

export type AuthUser = {
  userId: string;
  displayName: string;
  email: string;
};

const SESSION_COOKIE = "fabripass_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, salt, SCRYPT_KEYLEN);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await getStore()
    .prepare(
      "INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(?,?,?,?) ON CONFLICT(token_hash) DO NOTHING",
    )
    .bind(hashToken(token), userId, now.toISOString(), expiresAt.toISOString())
    .first();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const store = getStore();
  const row = await store
    .prepare(
      `SELECT users.id AS id, users.email AS email, users.display_name AS displayName
       FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash=? AND sessions.expires_at > ?`,
    )
    .bind(hashToken(token), new Date().toISOString())
    .first<{ id: string; email: string; displayName: string }>();
  if (!row) return null;
  return { userId: row.id, email: row.email, displayName: row.displayName };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await getStore()
      .prepare("DELETE FROM sessions WHERE token_hash=?")
      .bind(hashToken(token))
      .first()
      .catch(() => undefined);
  }
  jar.delete(SESSION_COOKIE);
}

export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/workspace";
  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/workspace";
  }
  if (url.origin !== "https://app.local") return "/workspace";
  if (url.pathname === "/login" || url.pathname === "/signup") return "/workspace";
  return `${url.pathname}${url.search}${url.hash}`;
}
