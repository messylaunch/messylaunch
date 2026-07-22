import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";

// Public intake: "Start your Messy Launch". Creates a Lead and notifies Michael.
export async function POST(req: NextRequest) {
  const data = await req.json();

  // honeypot — bots fill every field; humans never see this one
  if (data.website) return NextResponse.json({ ok: true });

  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const businessName = String(data.businessName ?? "").trim();
  const stage = String(data.stage ?? "");
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
      phone: String(data.phone ?? "").trim() || null,
      businessName,
      description: String(data.description ?? "").trim() || null,
      stage,
        messy: Array.isArray(data.messy) ? data.messy.slice(0, 5).join(",") : null,
        goal: String(data.goal ?? "").trim() || null,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Our intake is briefly down — email michael.quinn0831@gmail.com and we'll get you started directly." },
      { status: 503 }
    );
  }

  const admins = await db.user.findMany({ where: { role: "ADMIN" } }).catch(() => []);
  await notify(
    admins.map((a) => a.id),
    {
      title: `🚀 New intake: ${lead.businessName}`,
      body: `${lead.name} · ${stage === "IDEA" ? "starting from an idea" : stage === "LAUNCHED_QUIET" ? "launched but quiet" : "has clients, wants profit"}`,
      href: "/admin/leads",
    }
  );

  return NextResponse.json({ ok: true });
}
