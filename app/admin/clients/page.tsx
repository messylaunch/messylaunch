import Link from "next/link";
import { db } from "@/lib/db";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    include: {
      user: true,
      businesses: { include: { niche: true, projects: true } },
      enrollments: { include: { course: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-black text-ink">Clients 👥</h1>
      <p className="mt-1 text-sub">Every client, their businesses, and what you&apos;re working on together.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/admin/clients/${c.id}`}
            className="card card-hover p-5"
          >
            <div className="flex items-center gap-3">
              <Avatar src={c.user.avatarUrl} name={c.user.name} size={48} />
              <div>
                <p className="font-bold text-ink">{c.user.name}</p>
                <p className="text-xs text-faint">{c.user.email}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {c.businesses.map((b) => (
                <span key={b.id} className="rounded-full border border-line bg-card2 px-2.5 py-1 text-sub">
                  {b.niche?.emoji} {b.name}
                </span>
              ))}
              {c.enrollments.map((e) => (
                <span key={e.id} className="rounded-full border border-info/30 bg-info/10 px-2.5 py-1 text-info">
                  🎓 {e.course.title}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
