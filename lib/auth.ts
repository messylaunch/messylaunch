// Session auth: opaque random tokens, stored hashed, httpOnly cookie.
// Reads are cached per request. Guards throw redirects, so pages/layouts can
// simply `await requireAdmin()` etc.

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";

export const SESSION_COOKIE = "ml_session";
const SESSION_DAYS = 30;
export const LOGIN_TOKEN_MINUTES = 15;

export function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function newRawToken() {
  return randomBytes(32).toString("base64url");
}

// Dev login (pick-a-user, no email) is for local demos only. It turns off
// automatically the moment an email provider is configured — and it NEVER
// runs on a hosted deploy (Vercel) unless AUTH_DEV_MODE=1 is set explicitly.
export function authDevMode() {
  if (process.env.AUTH_DEV_MODE === "1") return true;
  if (process.env.RESEND_API_KEY) return false;
  return !process.env.VERCEL;
}

export async function createSession(userId: string) {
  const raw = newRawToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { tokenHash: hashToken(raw), userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, raw, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) await db.session.deleteMany({ where: { tokenHash: hashToken(raw) } });
  jar.delete(SESSION_COOKIE);
}

// Current user, or null. Cached so layouts + pages + actions share one lookup.
export const getSessionUser = cache(async () => {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const session = await db.session.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!session || session.expiresAt < new Date()) return null;
  return db.user.findUnique({ where: { id: session.userId }, include: { client: true } });
});

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/portal");
  return user;
}

// Admins can view any client's portal ("view as client"); a client only their own.
export async function requireClientAccess(clientId: string) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.client?.id !== clientId) redirect("/portal");
  return user;
}

// Where a user lands after login.
export function homeFor(user: { role: string; client: { id: string } | null }) {
  return user.role === "ADMIN" ? "/admin" : user.client ? `/portal/${user.client.id}` : "/";
}
