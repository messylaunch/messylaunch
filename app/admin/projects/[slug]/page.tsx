/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Curriculum } from "@/components/Curriculum";
import { TaskCard } from "@/components/TaskCard";
import { Thread } from "@/components/Thread";
import { ProjectPulse } from "@/components/ProjectPulse";
import { ActivityFeed } from "@/components/ActivityFeed";
import { BriefButton } from "@/components/BriefButton";
import { createTask } from "@/lib/actions";
import { PROJECT_STATUS, fmtDate } from "@/lib/meta";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, admin] = await Promise.all([
    db.project.findUnique({
      where: { slug },
      include: {
        business: { include: { client: { include: { user: true } } } },
        sections: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } },
        tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] },
        messages: { orderBy: { createdAt: "asc" }, include: { author: true } },
      },
    }),
    db.user.findFirst({ where: { role: "ADMIN" } }),
  ]);
  if (!project || !admin) notFound();
  const status = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.ACTIVE;
  const clientTasks = project.tasks.filter((t) => t.assignedTo === "CLIENT");
  const adminTasks = project.tasks.filter((t) => t.assignedTo === "ADMIN");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <Link href="/admin/projects" className="text-sm text-faint hover:text-sub">
          ← Projects
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {project.business.logoUrl && <img src={project.business.logoUrl} alt="" className="h-14 w-14 rounded-2xl" />}
          <div>
            <h1 className="font-display text-3xl font-black text-ink">{project.title}</h1>
            <p className="text-sm text-faint">
              {project.business.name} · with {project.business.client.user.name} · due {fmtDate(project.dueDate)}
            </p>
          </div>
          <span className={`ml-auto rounded-full border px-3 py-1 text-sm ${status.color}`}>{status.label}</span>
        </div>
        {project.description && <p className="mt-3 max-w-3xl text-sub">{project.description}</p>}
      </div>

      <ProjectPulse tasks={project.tasks} items={project.sections.flatMap((s) => s.items)} />
      <BriefButton slug={project.slug} />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: tasks */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-bold text-ink">📤 Client owes ({clientTasks.length})</h2>
            <div className="space-y-3">
              {clientTasks.map((t) => (
                <TaskCard key={t.id} task={t} perspective="ADMIN" />
              ))}
              {clientTasks.length === 0 && <p className="text-sm text-faint">Nothing requested from the client yet.</p>}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-ink">🔧 You owe ({adminTasks.length})</h2>
            <div className="space-y-3">
              {adminTasks.map((t) => (
                <TaskCard key={t.id} task={t} perspective="ADMIN" />
              ))}
              {adminTasks.length === 0 && <p className="text-sm text-faint">You don&apos;t owe anything here yet.</p>}
            </div>
          </section>

          <section className="card p-5">
            <h3 className="mb-3 font-bold text-ink">+ New task / request</h3>
            <form action={createTask} className="space-y-3">
              <input type="hidden" name="projectId" value={project.id} />
              <input
                name="title"
                required
                placeholder="What's needed? e.g. Send 5 photos of your work"
                className="w-full rounded-lg border border-line bg-card2 px-3 py-2 text-sm placeholder:text-faint focus:border-accent focus:outline-none"
              />
              <textarea
                name="details"
                rows={2}
                placeholder="Details (optional)"
                className="w-full rounded-lg border border-line bg-card2 px-3 py-2 text-sm placeholder:text-faint focus:border-accent focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-3">
                <select
                  name="assignedTo"
                  className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                >
                  <option value="CLIENT">Client owes this</option>
                  <option value="ADMIN">I owe this</option>
                </select>
                <input
                  type="date"
                  name="dueDate"
                  className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm text-sub focus:border-accent focus:outline-none"
                />
                <button className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:brightness-110">
                  Add task
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right: thread */}
        <section className="card p-5">
          <h2 className="mb-4 text-lg font-bold text-ink">💬 Thread with {project.business.client.user.name}</h2>
          <Thread projectId={project.id} messages={project.messages} viewerId={admin.id} />
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">📚 Project content</h2>
        <Curriculum sections={project.sections} completable />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">🛰️ Mission log</h2>
        <p className="mb-4 text-sm text-faint">
          The whole story in order — messages and task milestones together, so anyone can catch up.
        </p>
        <ActivityFeed messages={project.messages} tasks={project.tasks} />
      </section>
    </div>
  );
}
