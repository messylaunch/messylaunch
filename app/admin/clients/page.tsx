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
      <h1 className="text-3xl font-black text-white">Clients 👥</h1>
      <p className="mt-1 text-slate-400">Every client, their businesses, and what you&apos;re working on together.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/admin/clients/${c.id}`}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-orange-500/50"
          >
            <div className="flex items-center gap-3">
              <Avatar src={c.user.avatarUrl} name={c.user.name} size={48} />
              <div>
                <p className="font-bold text-white">{c.user.name}</p>
                <p className="text-xs text-slate-500">{c.user.email}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {c.businesses.map((b) => (
                <span key={b.id} className="rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-slate-300">
                  {b.niche?.emoji} {b.name}
                </span>
              ))}
              {c.enrollments.map((e) => (
                <span key={e.id} className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-sky-300">
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
