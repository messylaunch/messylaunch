import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Outline } from "@/lib/ai";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  let slug = base || "untitled";
  let n = 2;
  while (await exists(slug)) slug = `${base}-${n++}`;
  return slug;
}

// Turns an approved AI outline into a draft course, or a project on a business.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "admin only" }, { status: 403 });
  try {
    const { outline, businessId } = (await req.json()) as { outline: Outline; businessId?: string };

    if (outline.kind === "COURSE") {
      const slug = await uniqueSlug(slugify(outline.title), async (s) =>
        Boolean(await db.course.findUnique({ where: { slug: s } }))
      );
      const course = await db.course.create({
        data: {
          slug,
          title: outline.title,
          description: outline.description,
          durationWeeks: outline.durationWeeks ?? 4,
          status: "DRAFT",
          modules: {
            create: outline.sections.map((s, si) => ({
              title: s.title,
              order: si,
              lessons: {
                create: s.items.map((it, ii) => ({
                  title: it.title,
                  type: it.type,
                  content: it.content,
                  order: ii,
                })),
              },
            })),
          },
        },
      });
      return NextResponse.json({ url: `/admin/courses/${course.slug}` });
    }

    if (!businessId) return NextResponse.json({ error: "Pick a business for this project" }, { status: 400 });
    const slug = await uniqueSlug(slugify(outline.title), async (s) =>
      Boolean(await db.project.findUnique({ where: { slug: s } }))
    );
    const project = await db.project.create({
      data: {
        slug,
        businessId,
        title: outline.title,
        description: outline.description,
        sections: {
          create: outline.sections.map((s, si) => ({
            title: s.title,
            order: si,
            items: {
              create: s.items.map((it, ii) => ({
                title: it.title,
                type: it.type,
                content: it.content,
                order: ii,
              })),
            },
          })),
        },
        tasks: {
          create: (outline.tasks ?? []).map((t) => ({
            title: t.title,
            details: t.details,
            assignedTo: t.assignedTo,
          })),
        },
      },
    });
    return NextResponse.json({ url: `/admin/projects/${project.slug}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "save failed" }, { status: 500 });
  }
}
