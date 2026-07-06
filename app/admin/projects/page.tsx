/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { db } from "@/lib/db";
import { PROJECT_STATUS, fmtDate } from "@/lib/meta";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    include: {
      business: { include: { client: { include: { user: true } } } },
      tasks: true,
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Projects 🤝</h1>
          <p className="mt-1 text-slate-400">Built together — threads, two-way tasks, and real deadlines.</p>
        </div>
        <Link
          href="/admin/ai?kind=PROJECT"
          className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-orange-400"
        >
          ✨ New with AI
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {projects.map((p) => {
          const status = PROJECT_STATUS[p.status] ?? PROJECT_STATUS.ACTIVE;
          const openTasks = p.tasks.filter((t) => t.status !== "APPROVED").length;
          const needsReview = p.tasks.filter((t) => t.status === "SUBMITTED").length;
          return (
            <Link
              key={p.id}
              href={`/admin/projects/${p.slug}`}
              className="block rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-orange-500/50"
            >
              <div className="flex flex-wrap items-center gap-3">
                {p.business.logoUrl && <img src={p.business.logoUrl} alt="" className="h-11 w-11 rounded-xl" />}
                <div>
                  <p className="font-bold text-white">
                    {p.business.name} <span className="text-slate-500">·</span> {p.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    with {p.business.client.user.name} · due {fmtDate(p.dueDate)}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs">
                  {needsReview > 0 && (
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300">
                      {needsReview} to review
                    </span>
                  )}
                  <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-slate-400">
                    {openTasks} open tasks · {p._count.messages} msgs
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 ${status.color}`}>{status.label}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
