import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashToken, homeFor } from "@/lib/auth";

// Magic-link landing: validates a single-use login token, starts a session.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("token");
  const fail = NextResponse.redirect(new URL("/login?error=invalid", req.url));
  if (!raw) return fail;

  const token = await db.loginToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!token || token.usedAt || token.expiresAt < new Date()) return fail;

  const user = await db.user.findUnique({ where: { id: token.userId }, include: { client: true } });
  if (!user) return fail;

  await db.loginToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });
  await createSession(user.id);
  return NextResponse.redirect(new URL(homeFor(user), req.url));
}
