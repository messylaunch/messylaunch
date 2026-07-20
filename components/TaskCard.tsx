import { reviewTask, submitTask, reopenTask } from "@/lib/actions";
import { TASK_STATUS, fmtDate, isOverdue } from "@/lib/meta";

export type TaskLike = {
  id: string;
  title: string;
  details: string | null;
  assignedTo: string;
  status: string;
  dueDate: Date | null;
  submissionNote: string | null;
};

// perspective: who is looking at this card — "ADMIN" (you) or "CLIENT".
// You submit tasks assigned to you; the other side reviews what you submitted.
export function TaskCard({ task, perspective }: { task: TaskLike; perspective: "ADMIN" | "CLIENT" }) {
  const mine = task.assignedTo === perspective;
  const canSubmit = mine && (task.status === "OPEN" || task.status === "CHANGES_REQUESTED");
  const canReview = !mine && task.status === "SUBMITTED";
  const status = TASK_STATUS[task.status] ?? TASK_STATUS.OPEN;
  const overdue = task.status === "OPEN" && isOverdue(task.dueDate);

  return (
    <div className="rounded-xl border border-line bg-card p-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            task.assignedTo === "CLIENT"
              ? "bg-pop/15 text-pop border-pop/30"
              : "bg-accent/15 text-accent border-accent/30"
          }`}
        >
          {task.assignedTo === "CLIENT" ? "Client owes" : "Michael owes"}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
        <span className={`ml-auto text-xs ${overdue ? "text-err font-semibold" : "text-faint"}`}>
          {overdue ? "⚠ overdue — " : "due "}
          {fmtDate(task.dueDate)}
        </span>
      </div>
      <p className="font-medium text-ink">{task.title}</p>
      {task.details && <p className="text-sm text-sub">{task.details}</p>}
      {task.submissionNote && (
        <p className="text-sm rounded-lg bg-card2 border border-line px-3 py-2 text-sub">
          <span className="text-faint">Turned in:</span> {task.submissionNote}
        </p>
      )}

      {canSubmit && (
        <form action={submitTask} className="flex gap-2 pt-1">
          <input type="hidden" name="taskId" value={task.id} />
          <input
            name="submissionNote"
            placeholder="What are you turning in? (note or link)"
            className="flex-1 rounded-lg border border-line bg-card2 px-3 py-1.5 text-sm placeholder:text-faint focus:border-accent focus:outline-none"
          />
          <button className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink hover:brightness-110">
            Submit
          </button>
        </form>
      )}

      {canReview && (
        <div className="flex gap-2 pt-1">
          <form action={reviewTask}>
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="decision" value="APPROVED" />
            <button className="rounded-lg border border-ok/40 bg-ok/15 px-3 py-1.5 text-sm font-semibold text-ok transition hover:bg-ok/25">
              ✓ Approve
            </button>
          </form>
          <form action={reviewTask}>
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="decision" value="CHANGES_REQUESTED" />
            <button className="rounded-lg border border-err/40 bg-err/10 px-3 py-1.5 text-sm font-semibold text-err hover:bg-err/20">
              Request changes
            </button>
          </form>
        </div>
      )}

      {mine && task.status === "CHANGES_REQUESTED" && (
        <form action={reopenTask}>
          <input type="hidden" name="taskId" value={task.id} />
          <button className="text-xs text-sub underline hover:text-ink">Mark as back in progress</button>
        </form>
      )}
    </div>
  );
}
