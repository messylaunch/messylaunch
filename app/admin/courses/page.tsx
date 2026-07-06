import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await db.course.findMany({
    include: {
      modules: { include: { _count: { select: { lessons: true } } } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Courses 🎓</h1>
          <p className="mt-1 text-slate-400">Premade and resellable — one goal, self-paced within a time frame.</p>
        </div>
        <Link
          href="/admin/ai?kind=COURSE"
          className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-orange-400"
        >
          ✨ New with AI
        </Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {courses.map((c) => {
          const lessons = c.modules.reduce((n, m) => n + m._count.lessons, 0);
          return (
            <Link
              key={c.id}
              href={`/admin/courses/${c.slug}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-orange-500/50"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs ${
                    c.status === "PUBLISHED"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-600 bg-slate-800 text-slate-400"
                  }`}
                >
                  {c.status.toLowerCase()}
                </span>
                <span className="text-xs text-slate-500">{c.durationWeeks}-week pace</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-white">{c.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">{c.description}</p>
              <p className="mt-4 text-xs text-slate-500">
                {c.modules.length} modules · {lessons} lessons · {c._count.enrollments} enrolled
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
