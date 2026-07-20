import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, homeFor } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

// Clients land straight in their own portal. Admins get this picker to
// "view as" any client. Logged-out visitors go to login.
export default async function PortalPicker() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect(homeFor(user));

  const clients = await db.client.findMany({ include: { user: true, businesses: true } });

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-black text-ink">View as client</h1>
        <p className="mt-2 text-sub">Open any client&apos;s portal to see exactly what they see.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/portal/${c.id}`}
              className="flex items-center gap-4 card card-hover p-5 text-left"
            >
              <Avatar src={c.user.avatarUrl} name={c.user.name} size={48} />
              <div>
                <p className="font-bold text-ink">{c.user.name}</p>
                <p className="text-xs text-faint">{c.businesses.map((b) => b.name).join(", ") || "No businesses yet"}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
