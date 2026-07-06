import Link from "next/link";
import { db } from "@/lib/db";
import { Avatar } from "@/components/Avatar";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

// Demo login screen: pick which client to view the portal as.
// (Real authentication comes later — this makes every client's view browsable now.)
export default async function PortalPicker() {
  const clients = await db.client.findMany({ include: { user: true, businesses: true } });

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-black text-ink">Client Portal</h1>
        <p className="mt-2 text-sub">Demo mode — pick a client to view their portal. (Login comes later.)</p>
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
