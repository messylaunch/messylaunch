import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { pushConfigured } from "@/lib/notify";

// GET → is push available + the public key the browser needs to subscribe
export async function GET() {
  return NextResponse.json({
    configured: pushConfigured(),
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null,
  });
}

// POST → store this browser's subscription for the signed-in user
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "not logged in" }, { status: 401 });
  const { subscription } = await req.json();
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: "a valid subscription is required" }, { status: 400 });
  }
  await db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    update: { userId: user.id, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
  });
  return NextResponse.json({ ok: true });
}
