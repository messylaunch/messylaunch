/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Avatar } from "@/components/Avatar";
import { PROJECT_STATUS, fmtDate } from "@/lib/meta";

export const dynamic = "force-dynamic";

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await db.client.findUnique({
    where: { id },
    include: {
      user: true,
      businesses: { include: { niche: true, projects: { include: { tasks: true } } } },
      enrollments: { include: { course: true } },
    },
  });
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link href="/admin/clients" className="text-sm text-faint hover:text-sub">
          ← Clients
        </Link>
        <div className="mt-3 flex items-center gap-4">
          <Avatar src={client.user.avatarUrl} name={client.user.name} size={64} />
          <div>
            <h1 className="font-display text-3xl font-black text-ink">{client.user.name}</h1>
            <p className="text-sm text-faint">
              {client.user.email}
              {client.phone ? ` · ${client.phone}` : ""}
            </p>
          </div>
        </div>
        {client.notes && (
          <div className="mt-4 rounded-xl border border-line bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-faint">Private notes</p>
            <p className="mt-1 text-sm text-sub">{client.notes}</p>
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">Businesses & projects</h2>
        <div className="space-y-4">
          {client.businesses.map((b) => (
            <div key={b.id} className="card p-5">
              <div className="flex items-center gap-3">
                {b.logoUrl && <img src={b.logoUrl} alt="" className="h-12 w-12 rounded-xl" />}
                <div>
                  <p className="font-bold text-ink">{b.name}</p>
                  <p className="text-xs text-faint">
                    {b.niche?.emoji} {b.niche?.name} · {b.location}
                    {b.isPublished && <span className="ml-2 text-ok">● live on portfolio</span>}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {b.projects.map((p) => {
                  const status = PROJECT_STATUS[p.status] ?? PROJECT_STATUS.ACTIVE;
                  const open = p.tasks.filter((t) => t.status !== "APPROVED").length;
                  return (
                    <Link
                      key={p.id}
                      href={`/admin/projects/${p.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-line bg-card2/60 px-4 py-3 text-sm hover:border-accent/40"
                    >
                      <span className="font-semibold text-ink">{p.title}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${status.color}`}>{status.label}</span>
                      <span className="ml-auto text-xs text-faint">
                        {open} open tasks · due {fmtDate(p.dueDate)}
                      </span>
                    </Link>
                  );
                })}
                {b.projects.length === 0 && <p className="text-sm text-faint">No projects yet.</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">Course enrollments</h2>
        <div className="flex flex-wrap gap-3">
          {client.enrollments.map((e) => (
            <Link
              key={e.id}
              href={`/admin/courses/${e.course.slug}`}
              className="rounded-xl border border-info/30 bg-info/10 px-4 py-2.5 text-sm text-info hover:bg-info/20"
            >
              🎓 {e.course.title}
            </Link>
          ))}
          {client.enrollments.length === 0 && <p className="text-sm text-faint">Not enrolled in any courses.</p>}
        </div>
      </section>
    </div>
  );
}
