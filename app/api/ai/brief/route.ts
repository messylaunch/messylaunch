import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/meta";

// "Brief me on this project" — a handoff summary so a teammate (or future you)
// can pick the project up cold. Uses the Anthropic API when configured;
// otherwise builds a deterministic brief from the same data.
export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  const project = await db.project.findUnique({
    where: { slug },
    include: {
      business: { include: { client: { include: { user: true } }, niche: true } },
      sections: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } },
      tasks: { orderBy: { createdAt: "asc" } },
      messages: { orderBy: { createdAt: "asc" }, include: { author: true } },
    },
  });
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const items = project.sections.flatMap((s) => s.items);
  const facts = [
    `PROJECT: ${project.title} for ${project.business.name} (${project.business.niche?.name ?? "no niche"})`,
    `CLIENT: ${project.business.client.user.name} — notes: ${project.business.client.notes ?? "none"}`,
    `STATUS: ${project.status}, due ${fmtDate(project.dueDate)}`,
    `GOAL: ${project.description ?? "no description"}`,
    `CONTENT: ${items.length} items across ${project.sections.length} sections; completed: ${items.filter((i) => i.completedAt).map((i) => i.title).join(", ") || "none yet"}`,
    `TASKS:\n${project.tasks.map((t) => `- [${t.status}] (${t.assignedTo === "CLIENT" ? "client owes" : "Michael owes"}) ${t.title}${t.dueDate ? ` — due ${fmtDate(t.dueDate)}` : ""}${t.submissionNote ? ` — turned in: ${t.submissionNote}` : ""}`).join("\n")}`,
    `THREAD:\n${project.messages.map((m) => `- ${m.author.name} (${fmtDate(m.createdAt)}): ${m.body}`).join("\n")}`,
  ].join("\n\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    const open = project.tasks.filter((t) => t.status === "OPEN" || t.status === "CHANGES_REQUESTED");
    const review = project.tasks.filter((t) => t.status === "SUBMITTED");
    const brief = [
      `**Where we're at** — ${project.title} for ${project.business.name} is ${project.status.toLowerCase()}, due ${fmtDate(project.dueDate)}. ${project.description ?? ""}`,
      review.length ? `**Waiting on a decision:** ${review.map((t) => t.title).join("; ")}.` : "",
      open.length
        ? `**Still open:** ${open.map((t) => `${t.title} (${t.assignedTo === "CLIENT" ? "client" : "Michael"}${t.dueDate ? `, due ${fmtDate(t.dueDate)}` : ""})`).join("; ")}.`
        : "**Nothing open** — all tasks approved.",
      `**Client has completed** ${items.filter((i) => i.completedAt).length} of ${items.length} content items.`,
      project.messages.length
        ? `**Last word in the thread** (${project.messages.at(-1)!.author.name}): "${project.messages.at(-1)!.body}"`
        : "",
      "_(Set ANTHROPIC_API_KEY for a fuller written brief.)_",
    ]
      .filter(Boolean)
      .join("\n\n");
    return NextResponse.json({ brief, live: false });
  }

  const anthropic = new Anthropic();
  const res = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
    max_tokens: 1200,
    system:
      "You write handoff briefs for Messy Launch client projects. A teammate who has never seen this project reads your brief and should be able to take over today. Write in markdown with exactly these sections: 'Where we're at' (2-3 sentences), 'What the client has learned/done so far', 'Blocked or waiting' (who owes what, with dates), 'Decisions already made' (from the thread), and 'Do this next' (max 3 concrete actions). Be specific, use names, keep it under 250 words. No preamble.",
    messages: [{ role: "user", content: facts }],
  });
  const brief = res.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return NextResponse.json({ brief, live: true });
}
