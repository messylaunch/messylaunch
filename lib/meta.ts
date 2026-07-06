// Shared vocabulary for lesson / project-item types and statuses.

export const ITEM_TYPES: Record<string, { label: string; emoji: string; hint: string }> = {
  OVERVIEW: { label: "Overview", emoji: "🧭", hint: "Where we're going and why" },
  LESSON: { label: "Lesson", emoji: "📚", hint: "Core teaching content" },
  TUTORIAL: { label: "Tutorial", emoji: "🛠️", hint: "Step-by-step walkthrough of a tool" },
  SCENARIO: { label: "Scenario", emoji: "🎭", hint: "A made-up situation to think through" },
  REAL_WORLD: { label: "Real World Example", emoji: "🌍", hint: "How this applies to a real business" },
  BRAINSTORM: { label: "Brainstorm", emoji: "💡", hint: "Come up with a plan, answers, or ideas" },
  ASSIGNMENT: { label: "Assignment", emoji: "📝", hint: "Something to go do" },
  KNOWLEDGE_CHECK: { label: "Check Knowledge", emoji: "✅", hint: "Quick questions to lock it in" },
  CONCLUSION: { label: "Conclusion", emoji: "🏁", hint: "Wrap up and next steps" },
  BOOK_CALL: { label: "Book a Call", emoji: "📞", hint: "Schedule time together" },
};

export const TASK_STATUS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  SUBMITTED: { label: "Submitted — needs review", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  APPROVED: { label: "Approved", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  CHANGES_REQUESTED: { label: "Changes requested", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

export const PROJECT_STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  ON_HOLD: { label: "On hold", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  COMPLETE: { label: "Complete", color: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
};

export function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function isOverdue(d: Date | string | null | undefined) {
  if (!d) return false;
  return new Date(d).getTime() < Date.now();
}
