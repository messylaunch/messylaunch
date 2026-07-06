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
  OPEN: { label: "Open", color: "bg-info/15 text-info border-info/30" },
  SUBMITTED: { label: "Submitted — needs review", color: "bg-warn/15 text-warn border-warn/30" },
  APPROVED: { label: "Approved", color: "bg-ok/15 text-ok border-ok/30" },
  CHANGES_REQUESTED: { label: "Changes requested", color: "bg-err/15 text-err border-err/30" },
};

export const PROJECT_STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "bg-ok/15 text-ok border-ok/30" },
  ON_HOLD: { label: "On hold", color: "bg-warn/15 text-warn border-warn/30" },
  COMPLETE: { label: "Complete", color: "bg-card2 text-sub border-line" },
};

export function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function isOverdue(d: Date | string | null | undefined) {
  if (!d) return false;
  return new Date(d).getTime() < Date.now();
}
