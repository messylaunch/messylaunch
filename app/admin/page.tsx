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
        <h1 className="text-3xl font-black text-white">Mission Control 🎛️</h1>
        <p className="mt-1 text-slate-400">Everything that needs your attention, across every project.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Needs your review", value: needsReview.length, tone: "text-amber-300" },
          { label: "You owe", value: myOpenTasks.length, tone: "text-orange-300" },
          { label: "Active projects", value: activeProjects, tone: "text-emerald-300" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <p className={`text-3xl font-black ${s.tone}`}>{s.value}</p>
            <p className="mt-1 text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {needsReview.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-white">📥 Submitted — review these</h2>
          <div className="space-y-3">
            {needsReview.map((t) => (
              <div key={t.id}>
                <Link
                  href={`/admin/projects/${t.project.slug}`}
                  className="mb-1 block text-xs text-slate-500 hover:text-orange-300"
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
        <h2 className="mb-3 text-lg font-bold text-white">🔧 Your task list</h2>
        {myOpenTasks.length === 0 && <p className="text-sm text-slate-500">Nothing on your plate. Rare air. 🎉</p>}
        <div className="space-y-3">
          {myOpenTasks.map((t) => (
            <div key={t.id}>
              <Link
                href={`/admin/projects/${t.project.slug}`}
                className="mb-1 block text-xs text-slate-500 hover:text-orange-300"
              >
                {t.project.business.name} · {t.project.title}
              </Link>
              <TaskCard task={t} perspective="ADMIN" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">⏳ Waiting on clients</h2>
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-800">
              {waitingOnClients.map((t) => (
                <tr key={t.id} className="bg-slate-900/40 hover:bg-slate-900">
                  <td className="px-4 py-3 text-slate-200">{t.title}</td>
                  <td className="px-4 py-3 text-slate-500">
                    <Link href={`/admin/projects/${t.project.slug}`} className="hover:text-orange-300">
                      {t.project.business.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">due {fmtDate(t.dueDate)}</td>
                </tr>
              ))}
              {waitingOnClients.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-slate-500">Clients are all caught up.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">💬 Latest in the threads</h2>
        <div className="space-y-2">
          {recentMessages.map((m) => (
            <Link
              key={m.id}
              href={`/admin/projects/${m.project.slug}`}
              className="block rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm hover:border-orange-500/40"
            >
              <span className="font-semibold text-slate-200">{m.author.name}</span>
              <span className="text-slate-500"> in {m.project.business.name} · {m.project.title}: </span>
              <span className="text-slate-400">{m.body.slice(0, 90)}{m.body.length > 90 ? "…" : ""}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
