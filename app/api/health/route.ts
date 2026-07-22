import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Plain-English self-diagnosis: open /api/health on the deployed site and it
// tells you exactly which piece of setup is missing. Safe to expose — it never
// reveals credentials, only whether each piece works.
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      status: "error",
      problem: "DATABASE_URL is not set.",
      fix: "In Vercel: Settings → Environment Variables → add DATABASE_URL with your Neon connection string, then Redeploy.",
    });
  }

  try {
    const [users, businesses, courses, leads] = await Promise.all([
      db.user.count(),
      db.business.count(),
      db.course.count(),
      db.lead.count(),
    ]);
    if (users === 0) {
      return NextResponse.json({
        status: "warning",
        problem: "Database is connected but EMPTY.",
        fix: "Run the messylaunch-database.sql file in Neon's SQL Editor (console.neon.tech → your project → SQL Editor → paste → Run).",
      });
    }
    return NextResponse.json({
      status: "ok",
      message: "Everything is connected. 🚀",
      data: { users, businesses, courses, leads },
      email_login: process.env.RESEND_API_KEY ? "configured" : "not configured yet (login disabled — set RESEND_API_KEY)",
      push_notifications: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "configured" : "not configured yet (optional)",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("does not exist")) {
      return NextResponse.json({
        status: "error",
        problem: "Database is connected but the tables were never created.",
        fix: "Run the messylaunch-database.sql file in Neon's SQL Editor (console.neon.tech → your project → SQL Editor → paste → Run).",
      });
    }
    return NextResponse.json({
      status: "error",
      problem: "The website cannot reach the database.",
      fix: "Check that DATABASE_URL in Vercel matches your Neon connection string (Settings → Environment Variables), then Redeploy.",
      detail: msg.split("\n")[0].slice(0, 200),
    });
  }
}
