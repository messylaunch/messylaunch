/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Curriculum } from "@/components/Curriculum";
import { TaskCard } from "@/components/TaskCard";
import { Thread } from "@/components/Thread";
import { fmtDate } from "@/lib/meta";

export const dynamic = "force-dynamic";

export default async function PortalProject({
  params,
}: {
  params: Promise<{ clientId: string; slug: string }>;
}) {
  const { clientId, slug } = await params;
  const project = await db.project.findUnique({
    where: { slug },
    include: {
      business: { include: { client: { include: { user: true } } } },
      sections: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } },
      tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] },
      messages: { orderBy: { createdAt: "asc" }, include: { author: true } },
    },
  });
  // only let this client view their own project
  if (!project || project.business.clientId !== clientId) notFound();
  const viewer = project.business.client.user;

  const yourTasks = project.tasks.filter((t) => t.assignedTo === "CLIENT");
  const michaelsTasks = project.tasks.filter((t) => t.assignedTo === "ADMIN");

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
      <div>
        <Link href={`/portal/${clientId}`} className="text-sm text-slate-500 hover:text-slate-300">
          ← Your portal
        </Link>
        <div className="mt-2 flex items-center gap-4">
          {project.business.logoUrl && <img src={project.business.logoUrl} alt="" className="h-14 w-14 rounded-2xl" />}
          <div>
            <h1 className="text-3xl font-black text-white">{project.title}</h1>
            <p className="text-sm text-slate-500">
              {project.business.name} · due {fmtDate(project.dueDate)}
            </p>
          </div>
        </div>
        {project.description && <p className="mt-3 max-w-3xl text-slate-400">{project.description}</p>}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-bold text-white">📋 Your to-dos ({yourTasks.length})</h2>
            <div className="space-y-3">
              {yourTasks.map((t) => (
                <TaskCard key={t.id} task={t} perspective="CLIENT" />
              ))}
              {yourTasks.length === 0 && <p className="text-sm text-slate-500">Nothing on your plate right now.</p>}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">🚀 What Michael owes you ({michaelsTasks.length})</h2>
            <div className="space-y-3">
              {michaelsTasks.map((t) => (
                <TaskCard key={t.id} task={t} perspective="CLIENT" />
              ))}
              {michaelsTasks.length === 0 && <p className="text-sm text-slate-500">Nothing pending from Michael.</p>}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <h2 className="mb-4 text-lg font-bold text-white">💬 Thread with Michael</h2>
          <Thread projectId={project.id} messages={project.messages} viewerId={viewer.id} />
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">📚 Project content</h2>
        <Curriculum sections={project.sections} />
      </section>
    </div>
  );
}
