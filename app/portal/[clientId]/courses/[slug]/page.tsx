import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Curriculum } from "@/components/Curriculum";

export const dynamic = "force-dynamic";

export default async function PortalCourse({
  params,
}: {
  params: Promise<{ clientId: string; slug: string }>;
}) {
  const { clientId, slug } = await params;
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      enrollments: true,
    },
  });
  // only enrolled clients can view
  if (!course || !course.enrollments.some((e) => e.clientId === clientId)) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
      <div>
        <Link href={`/portal/${clientId}`} className="text-sm text-faint hover:text-sub">
          ← Your portal
        </Link>
        <h1 className="mt-2 font-display text-3xl font-black text-ink">{course.title}</h1>
        <p className="mt-2 max-w-2xl text-sub">{course.description}</p>
        <p className="mt-2 text-sm text-faint">{course.durationWeeks}-week pace — start whenever, keep the rhythm.</p>
      </div>
      <Curriculum sections={course.modules.map((m) => ({ id: m.id, title: m.title, items: m.lessons }))} />
    </div>
  );
}
