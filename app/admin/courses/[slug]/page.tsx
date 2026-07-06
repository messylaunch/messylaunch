import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Curriculum } from "@/components/Curriculum";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function CourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      enrollments: { include: { client: { include: { user: true } } } },
    },
  });
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link href="/admin/courses" className="text-sm text-slate-500 hover:text-slate-300">
          ← Courses
        </Link>
        <h1 className="mt-2 text-3xl font-black text-white">{course.title}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{course.description}</p>
        <p className="mt-3 text-sm text-slate-500">
          {course.durationWeeks}-week pace · {course.status.toLowerCase()}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">Curriculum</h2>
        <Curriculum sections={course.modules.map((m) => ({ id: m.id, title: m.title, items: m.lessons }))} />
        <p className="mt-3 text-xs text-slate-600">
          🎬 Videos are served from Bunny.net Stream — set a lesson&apos;s Bunny video ID to embed the player.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">Enrolled clients</h2>
        {course.enrollments.length === 0 && <p className="text-sm text-slate-500">Nobody enrolled yet.</p>}
        <div className="flex flex-wrap gap-3">
          {course.enrollments.map((e) => (
            <Link
              key={e.id}
              href={`/admin/clients/${e.client.id}`}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 hover:border-orange-500/40"
            >
              <Avatar src={e.client.user.avatarUrl} name={e.client.user.name} size={32} />
              <div>
                <p className="text-sm font-semibold text-slate-200">{e.client.user.name}</p>
                <p className="text-xs text-slate-500">started {new Date(e.startedAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
