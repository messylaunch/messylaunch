import Link from "next/link";
import { db } from "@/lib/db";
import { TaskCard } from "@/components/TaskCard";
import { fmtDate } from "@/lib/meta";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [needsReview, myOpenTasks, waitingOnClients, activeProjects, recentMessages] = await Promise.all([
    // things clients submitted that you need to approve
    db.task.findMany({
      where: { assignedTo: "CLIENT", status: "SUBMITTED" },
      include: { project: { include: { business: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    // things you owe
    db.task.findMany({
      where: { assignedTo: "ADMIN", status: { in: ["OPEN", "CHANGES_REQUESTED"] } },
      include: { project: { include: { business: true } } },
      orderBy: { dueDate: "asc" },
    }),
    // things clients owe you
    db.task.findMany({
      where: { assignedTo: "CLIENT", status: { in: ["OPEN", "CHANGES_REQUESTED"] } },
      include: { project: { include: { business: true } } },
      orderBy: { dueDate: "asc" },
    }),
    db.project.count({ where: { status: "ACTIVE" } }),
    db.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { author: true, project: { include: { business: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="font-display text-3xl font-black text-ink">Mission Control 🎛️</h1>
        <p className="mt-1 text-sub">Everything that needs your attention, across every project.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Needs your review", value: needsReview.length, tone: "text-warn" },
          { label: "You owe", value: myOpenTasks.length, tone: "text-accent" },
          { label: "Active projects", value: activeProjects, tone: "text-ok" },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className={`font-display text-3xl font-black ${s.tone}`}>{s.value}</p>
            <p className="mt-1 text-sm text-sub">{s.label}</p>
          </div>
        ))}
      </div>

      {needsReview.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">📥 Submitted — review these</h2>
          <div className="space-y-3">
            {needsReview.map((t) => (
              <div key={t.id}>
                <Link
                  href={`/admin/projects/${t.project.slug}`}
                  className="mb-1 block text-xs text-faint hover:text-accent"
                >
                  {t.project.business.name} · {t.project.title}
                </Link>
                <TaskCard task={t} perspective="ADMIN" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">🔧 Your task list</h2>
        {myOpenTasks.length === 0 && <p className="text-sm text-faint">Nothing on your plate. Rare air. 🎉</p>}
        <div className="space-y-3">
          {myOpenTasks.map((t) => (
            <div key={t.id}>
              <Link
                href={`/admin/projects/${t.project.slug}`}
                className="mb-1 block text-xs text-faint hover:text-accent"
              >
                {t.project.business.name} · {t.project.title}
              </Link>
              <TaskCard task={t} perspective="ADMIN" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">⏳ Waiting on clients</h2>
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-line">
              {waitingOnClients.map((t) => (
                <tr key={t.id} className="bg-card hover:bg-card2">
                  <td className="px-4 py-3 text-ink">{t.title}</td>
                  <td className="px-4 py-3 text-faint">
                    <Link href={`/admin/projects/${t.project.slug}`} className="hover:text-accent">
                      {t.project.business.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-faint">due {fmtDate(t.dueDate)}</td>
                </tr>
              ))}
              {waitingOnClients.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-faint">Clients are all caught up.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">💬 Latest in the threads</h2>
        <div className="space-y-2">
          {recentMessages.map((m) => (
            <Link
              key={m.id}
              href={`/admin/projects/${m.project.slug}`}
              className="block rounded-xl border border-line bg-card px-4 py-3 text-sm hover:border-accent/40"
            >
              <span className="font-semibold text-ink">{m.author.name}</span>
              <span className="text-faint"> in {m.project.business.name} · {m.project.title}: </span>
              <span className="text-sub">{m.body.slice(0, 90)}{m.body.length > 90 ? "…" : ""}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
