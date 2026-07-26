import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { upsertContact, leadCustomFields, ghlConfigured } from "@/lib/ghl";

// Public intake: "Start your Messy Launch". Creates a Lead, notifies admin, and
// optionally pushes to GoHighLevel when GHL_API_KEY is configured.
export async function POST(req: NextRequest) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // honeypot — bots fill every field; humans never see this one
  if (data.website) return NextResponse.json({ ok: true });

  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const phone = String(data.phone ?? "").trim();
  const businessName = String(data.businessName ?? "").trim();
  const description = String(data.description ?? "").trim();
  const stage = String(data.stage ?? "");
  const messy = Array.isArray(data.messy) ? (data.messy as string[]).slice(0, 5) : [];
  const goal = String(data.goal ?? "").trim();

  if (!name || !email || !businessName) {
    return NextResponse.json({ error: "name, email, and business name are required" }, { status: 400 });
  }
  if (!["IDEA", "LAUNCHED_QUIET", "HAS_CLIENTS"].includes(stage)) {
    return NextResponse.json({ error: "invalid stage" }, { status: 400 });
  }

  let lead;
  try {
    lead = await db.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        businessName,
        description: description || null,
        stage,
        messy: messy.length ? messy.join(",") : null,
        goal: goal || null,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Our intake is briefly down — email michael.quinn0831@gmail.com and we'll get you started directly." },
      { status: 503 }
    );
  }

  const admins = await db.user.findMany({ where: { role: "ADMIN" } }).catch(() => []);
  if (admins.length) {
    await notify(
      admins.map((a) => a.id),
      {
        title: `🚀 New intake: ${lead.businessName}`,
        body: `${lead.name} · ${stage === "IDEA" ? "starting from an idea" : stage === "LAUNCHED_QUIET" ? "launched but quiet" : "has customers, wants profit"}`,
        href: "/admin/leads",
      }
    );
  }

  // Push to GoHighLevel — best-effort, a GHL failure never blocks the lead save
  if (ghlConfigured()) {
    void upsertContact({
      name,
      email,
      phone: phone || undefined,
      companyName: businessName,
      tags: ["messy-launch-lead", `stage-${stage.toLowerCase()}`],
      customFields: leadCustomFields({ businessName, stage, messy: messy.join(","), goal }),
    });
  }

  return NextResponse.json({ ok: true });
}
