/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Avatar } from "@/components/Avatar";
import { PROJECT_STATUS, fmtDate } from "@/lib/meta";

export const dynamic = "force-dynamic";

export default async function ClientPortal({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      user: true,
      businesses: { include: { projects: { include: { tasks: true } } } },
      enrollments: { include: { course: { include: { modules: { include: { _count: { select: { lessons: true } } } } } } } },
    },
  });
  if (!client) notFound();

  const projects = client.businesses.flatMap((b) => b.projects.map((p) => ({ ...p, business: b })));
  const owedByMe = projects.flatMap((p) =>
    p.tasks.filter((t) => t.assignedTo === "CLIENT" && (t.status === "OPEN" || t.status === "CHANGES_REQUESTED"))
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-4">
        <Avatar src={client.user.avatarUrl} name={client.user.name} size={56} />
        <div>
          <h1 className="font-display text-3xl font-black text-ink">Hey, {client.user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-faint">
            Your Messy Launch home base ·{" "}
            <Link href="/portal" className="underline hover:text-sub">
              switch client
            </Link>
          </p>
        </div>
      </div>

      {owedByMe.length > 0 && (
        <div className="mt-8 rounded-2xl border border-warn/30 bg-warn/5 p-5">
          <p className="font-bold text-warn">🔔 Michael is waiting on {owedByMe.length} thing{owedByMe.length === 1 ? "" : "s"} from you</p>
          <ul className="mt-2 space-y-1 text-sm text-sub">
            {owedByMe.map((t) => (
              <li key={t.id}>
                • {t.title} <span className="text-faint">(due {fmtDate(t.dueDate)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-ink">🤝 Your projects</h2>
        <div className="space-y-4">
          {projects.map((p) => {
            const status = PROJECT_STATUS[p.status] ?? PROJECT_STATUS.ACTIVE;
            return (
              <Link
                key={p.id}
                href={`/portal/${client.id}/projects/${p.slug}`}
                className="flex items-center gap-4 card card-hover p-5"
              >
                {p.business.logoUrl && <img src={p.business.logoUrl} alt="" className="h-12 w-12 rounded-xl" />}
                <div>
                  <p className="font-bold text-ink">{p.title}</p>
                  <p className="text-xs text-faint">
                    {p.business.name} · due {fmtDate(p.dueDate)}
                  </p>
                </div>
                <span className={`ml-auto rounded-full border px-2.5 py-0.5 text-xs ${status.color}`}>{status.label}</span>
              </Link>
            );
          })}
          {projects.length === 0 && <p className="text-sm text-faint">No projects yet.</p>}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-ink">🎓 Your courses</h2>
        <div className="space-y-4">
          {client.enrollments.map((e) => (
            <Link
              key={e.id}
              href={`/portal/${client.id}/courses/${e.course.slug}`}
              className="block card card-hover p-5"
            >
              <p className="font-bold text-ink">{e.course.title}</p>
              <p className="mt-1 text-xs text-faint">
                {e.course.durationWeeks}-week pace · {e.course.modules.length} modules ·{" "}
                {e.course.modules.reduce((n, m) => n + m._count.lessons, 0)} lessons · started{" "}
                {new Date(e.startedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
          {client.enrollments.length === 0 && <p className="text-sm text-faint">No courses yet.</p>}
        </div>
      </section>
    </div>
  );
}
