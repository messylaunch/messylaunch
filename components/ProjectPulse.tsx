import { fmtDate, isOverdue } from "@/lib/meta";

type PulseTask = { status: string; assignedTo: string; title: string; dueDate: Date | null };
type PulseItem = { completedAt: Date | null };

// The at-a-glance answer to "where are we on this project?"
// Progress = approved tasks + completed content items over the total of both.
export function ProjectPulse({ tasks, items }: { tasks: PulseTask[]; items: PulseItem[] }) {
  const done = tasks.filter((t) => t.status === "APPROVED").length + items.filter((i) => i.completedAt).length;
  const total = tasks.length + items.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const waitingReview = tasks.filter((t) => t.status === "SUBMITTED").length;
  const openTasks = tasks
    .filter((t) => t.status === "OPEN" || t.status === "CHANGES_REQUESTED")
    .sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));
  const nextUp = openTasks[0];
  const overdueCount = openTasks.filter((t) => isOverdue(t.dueDate)).length;

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="min-w-40 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-faint">Mission progress</p>
            <p className="font-display text-lg font-extrabold text-accent">{pct}%</p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-card2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-faint">
            {`${done} of ${total} tasks & lessons done`}
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="font-display text-xl font-extrabold text-warn">{waitingReview}</p>
            <p className="text-xs text-faint">awaiting review</p>
          </div>
          <div>
            <p className={`font-display text-xl font-extrabold ${overdueCount ? "text-err" : "text-ink"}`}>{overdueCount}</p>
            <p className="text-xs text-faint">overdue</p>
          </div>
          <div className="max-w-52">
            <p className="truncate text-sm font-semibold text-ink">{nextUp ? nextUp.title : "Nothing open 🎉"}</p>
            <p className="text-xs text-faint">
              {nextUp
                ? `next up · ${nextUp.assignedTo === "CLIENT" ? "client" : "Michael"} · due ${fmtDate(nextUp.dueDate)}`
                : "all tasks handled"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
