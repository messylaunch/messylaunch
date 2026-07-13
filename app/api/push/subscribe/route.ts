import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pushConfigured } from "@/lib/notify";

// GET → is push available + the public key the browser needs to subscribe
export async function GET() {
  return NextResponse.json({
    configured: pushConfigured(),
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null,
  });
}

// POST → store this browser's subscription for a user
export async function POST(req: NextRequest) {
  const { userId, subscription } = await req.json();
  if (!userId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: "userId and a valid subscription are required" }, { status: 400 });
  }
  await db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    update: { userId, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
  });
  return NextResponse.json({ ok: true });
}
