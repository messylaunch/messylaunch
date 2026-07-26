// Incoming webhook from GoHighLevel — receives contact-update, opportunity-change,
// and other GHL workflow events so Messy Launch stays in sync without polling.
//
// To wire this up in GHL: Settings → Integrations → Webhooks → Add Webhook →
//   URL:  https://your-domain.com/api/ghl/webhook
//   Event: Contact Update, Opportunity Status Change (pick what you need)
//
// The webhook payload is validated against GHL_VERIFICATION_TOKEN (set the same
// value in your GHL webhook config so we know the request came from your GHL).

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";

export async function POST(req: NextRequest) {
  // Verify the request came from your GHL webhook
  const token = req.headers.get("x-ghl-token") ?? req.nextUrl.searchParams.get("token");
  if (process.env.GHL_VERIFICATION_TOKEN && token !== process.env.GHL_VERIFICATION_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const type = typeof body.type === "string" ? body.type : "unknown";
  console.log("GHL webhook received:", type);

  // Handle Contact Update — if a lead's contact gets updated in GHL (tag added,
  // opportunity created, etc.), we could sync status back. For now, log and ack.
  if (type === "ContactUpdate" || type === "ContactCreate") {
    const email = typeof body.email === "string" ? body.email.toLowerCase() : null;
    if (email) {
      const lead = await db.lead.findFirst({ where: { email }, orderBy: { createdAt: "desc" } });
      if (lead && lead.status === "NEW") {
        // Auto-transition to CONTACTED since GHL has the contact now
        await db.lead.update({ where: { id: lead.id }, data: { status: "CONTACTED" } });
        const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } }).catch(() => []);
        if (admins.length) {
          await notify(
            admins.map((a) => a.id),
            {
              title: `📋 GHL: ${lead.businessName} contact synced`,
              body: `${lead.name} — now in GoHighLevel. Status updated to CONTACTED.`,
              href: "/admin/leads",
            }
          );
        }
      }
    }
  }

  // Always acknowledge — GHL retries on non-2xx
  return NextResponse.json({ received: true });
}
