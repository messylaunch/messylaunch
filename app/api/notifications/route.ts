import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// The signed-in user's notifications — identity comes from the session cookie.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "not logged in" }, { status: 401 });
  const [items, unread] = await Promise.all([
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return NextResponse.json({ items, unread });
}
