"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import {
  authDevMode,
  createSession,
  destroySession,
  hashToken,
  homeFor,
  newRawToken,
  LOGIN_TOKEN_MINUTES,
} from "./auth";
import { sendLoginEmail } from "./mail";

// Email a magic link. Always lands on the "check your email" screen for real
// addresses AND unknown ones, so the form can't be used to probe who's a client.
export async function requestLoginLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/login");

  const user = await db.user.findUnique({ where: { email }, include: { client: true } });
  if (user) {
    const raw = newRawToken();
    await db.loginToken.create({
      data: {
        tokenHash: hashToken(raw),
        userId: user.id,
        expiresAt: new Date(Date.now() + LOGIN_TOKEN_MINUTES * 60 * 1000),
      },
    });
    const base = process.env.APP_URL ?? "http://localhost:3000";
    const link = `${base}/api/auth/verify?token=${raw}`;

    if (authDevMode()) {
      // no email provider configured — hand the link straight to the browser (dev only)
      redirect(`/login?sent=1&devlink=${encodeURIComponent(link)}`);
    }
    await sendLoginEmail(user.email, link);
  }
  redirect("/login?sent=1");
}

// One-click login as any seeded user. Available ONLY while no email provider
// is configured (local/demo). Configure RESEND_API_KEY to turn this off.
export async function devLogin(formData: FormData) {
  if (!authDevMode()) redirect("/login");
  const userId = String(formData.get("userId"));
  const user = await db.user.findUnique({ where: { id: userId }, include: { client: true } });
  if (!user) redirect("/login");
  await createSession(user.id);
  redirect(homeFor(user));
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
