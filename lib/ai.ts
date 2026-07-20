// AI outline builder: describe the customer, get a course or project outline.
// Uses the Anthropic API when ANTHROPIC_API_KEY is set; otherwise returns a
// sample outline so the flow can be demoed without a key.

import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";

export type OutlineItem = { title: string; type: string; content: string };
export type OutlineSection = { title: string; items: OutlineItem[] };
export type Outline = {
  kind: "COURSE" | "PROJECT";
  title: string;
  description: string;
  durationWeeks?: number;
  sections: OutlineSection[];
  tasks?: { title: string; details: string; assignedTo: "ADMIN" | "CLIENT" }[];
};

const ITEM_TYPE_LIST =
  "OVERVIEW, LESSON, TUTORIAL, SCENARIO, REAL_WORLD, BRAINSTORM, ASSIGNMENT, KNOWLEDGE_CHECK, CONCLUSION, BOOK_CALL";

const OUTLINE_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    durationWeeks: { type: "number" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                type: { type: "string" },
                content: { type: "string" },
              },
              required: ["title", "type", "content"],
            },
          },
        },
        required: ["title", "items"],
      },
    },
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          details: { type: "string" },
          assignedTo: { type: "string", enum: ["ADMIN", "CLIENT"] },
        },
        required: ["title", "details", "assignedTo"],
      },
    },
  },
  required: ["title", "description", "sections"],
};

async function existingWorkContext(useExisting: boolean): Promise<string> {
  if (!useExisting) return "";
  const courses = await db.course.findMany({
    include: { modules: { include: { lessons: true }, orderBy: { order: "asc" } } },
  });
  const projects = await db.project.findMany({
    include: {
      business: true,
      sections: { include: { items: true }, orderBy: { order: "asc" } },
      tasks: true,
    },
  });
  const courseText = courses
    .map(
      (c) =>
        `COURSE: ${c.title} (${c.durationWeeks} wk)\n` +
        c.modules
          .map((m) => `  Module: ${m.title}\n` + m.lessons.map((l) => `    [${l.type}] ${l.title}`).join("\n"))
          .join("\n")
    )
    .join("\n\n");
  const projectText = projects
    .map(
      (p) =>
        `PROJECT: ${p.title} (for ${p.business.name})\n` +
        p.sections
          .map((s) => `  Section: ${s.title}\n` + s.items.map((i) => `    [${i.type}] ${i.title}`).join("\n"))
          .join("\n") +
        (p.tasks.length ? `\n  Tasks: ${p.tasks.map((t) => `(${t.assignedTo}) ${t.title}`).join("; ")}` : "")
    )
    .join("\n\n");
  return `\n\nHere are the outlines of past Messy Launch courses and projects. Use them as a rough framework — mirror their structure and pacing where it fits, but tailor everything to this customer:\n\n${courseText}\n\n${projectText}`;
}

export async function generateOutline(opts: {
  kind: "COURSE" | "PROJECT";
  prompt: string;
  useExisting: boolean;
}): Promise<Outline> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return sampleOutline(opts.kind, opts.prompt);
  }

  const context = await existingWorkContext(opts.useExisting);
  const system = `You design ${opts.kind === "COURSE" ? "courses" : "client projects"} for Messy Launch, a company that helps business owners through the messy early stage — getting clear on their offer, building their online presence, launching organically, and learning to run the business themselves.

A COURSE is premade and resellable: one goal, self-paced within a time frame (1/2/4/8 weeks), organized as modules containing items.
A PROJECT is a tailored collaboration with one client: same section/item structure, but it also has two-way tasks — things the client owes Michael (assignedTo CLIENT) and things Michael owes the client (assignedTo ADMIN) — with real deadlines and an approval flow.

Every item must use one of these types: ${ITEM_TYPE_LIST}. Write item content as practical, plain-spoken guidance (2-5 sentences or a short list). ${opts.kind === "PROJECT" ? "Include 4-8 tasks split between ADMIN and CLIENT." : "Set a realistic durationWeeks of 1, 2, 4, or 8."}${context}`;

  const anthropic = new Anthropic();
  const res = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
    max_tokens: 8000,
    system,
    messages: [{ role: "user", content: `Build a ${opts.kind.toLowerCase()} outline for this customer/situation:\n\n${opts.prompt}` }],
    tools: [
      {
        name: "save_outline",
        description: "Save the finished outline",
        input_schema: OUTLINE_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "save_outline" },
  });

  const toolUse = res.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("AI did not return an outline");
  const out = toolUse.input as Omit<Outline, "kind">;
  return { kind: opts.kind, ...out };
}

// Deterministic fallback so the AI builder is demoable without an API key.
function sampleOutline(kind: "COURSE" | "PROJECT", prompt: string): Outline {
  const topic = prompt.slice(0, 60) || "your customer";
  if (kind === "COURSE") {
    return {
      kind,
      title: `Launch Plan: ${topic}`,
      description: `(Sample outline — set ANTHROPIC_API_KEY to generate real ones.) A guided path from idea to first customers for: ${prompt}`,
      durationWeeks: 4,
      sections: [
        {
          title: "Get Clear",
          items: [
            { title: "Where we're going", type: "OVERVIEW", content: "The goal of this course and what done looks like." },
            { title: "Your one person", type: "LESSON", content: "Define exactly who you help and the problem you solve." },
            { title: "Offer stack workshop", type: "BRAINSTORM", content: "List everything you could include in your offer, then rank it." },
          ],
        },
        {
          title: "Build the Basics",
          items: [
            { title: "Set up your page", type: "TUTORIAL", content: "Walk through building your one-page site step by step." },
            { title: "A business like yours", type: "REAL_WORLD", content: "How a similar business used this exact setup to get clients." },
            { title: "Publish it", type: "ASSIGNMENT", content: "Get your page live and send the link." },
          ],
        },
        {
          title: "Launch",
          items: [
            { title: "Did it stick?", type: "KNOWLEDGE_CHECK", content: "Five quick questions on your offer and funnel." },
            { title: "Wrap up", type: "CONCLUSION", content: "What you built and what to do every week from here." },
            { title: "Launch review call", type: "BOOK_CALL", content: "Book 30 minutes to review your launch together." },
          ],
        },
      ],
    };
  }
  return {
    kind,
    title: `Project: ${topic}`,
    description: `(Sample outline — set ANTHROPIC_API_KEY to generate real ones.) A collaboration plan for: ${prompt}`,
    sections: [
      {
        title: "Kickoff",
        items: [
          { title: "What we're building together", type: "OVERVIEW", content: "Scope, timeline, and who owes what." },
          { title: "Kickoff call", type: "BOOK_CALL", content: "Book the kickoff so we can lock the plan." },
        ],
      },
      {
        title: "Build & Review",
        items: [
          { title: "How the tool works", type: "TUTORIAL", content: "Short walkthrough so you can make edits yourself." },
          { title: "First draft review", type: "ASSIGNMENT", content: "Review the draft and leave your notes." },
        ],
      },
      {
        title: "Launch",
        items: [{ title: "Go live checklist", type: "CONCLUSION", content: "Everything checked before we launch." }],
      },
    ],
    tasks: [
      { title: "Send 5 photos of your work", details: "Phone photos are fine — recent jobs, before/after if you have them.", assignedTo: "CLIENT" },
      { title: "Write a short bio", details: "3-4 sentences: who you are, who you help, why you started.", assignedTo: "CLIENT" },
      { title: "First website draft", details: "Build and share the first draft for review.", assignedTo: "ADMIN" },
      { title: "QR code + business card file", details: "Print-ready card with QR code to the new site.", assignedTo: "ADMIN" },
    ],
  };
}
