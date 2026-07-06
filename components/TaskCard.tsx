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
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            task.assignedTo === "CLIENT"
              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
              : "bg-orange-500/15 text-orange-300 border-orange-500/30"
          }`}
        >
          {task.assignedTo === "CLIENT" ? "Client owes" : "Michael owes"}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
        <span className={`ml-auto text-xs ${overdue ? "text-rose-400 font-semibold" : "text-slate-500"}`}>
          {overdue ? "⚠ overdue — " : "due "}
          {fmtDate(task.dueDate)}
        </span>
      </div>
      <p className="font-medium text-slate-100">{task.title}</p>
      {task.details && <p className="text-sm text-slate-400">{task.details}</p>}
      {task.submissionNote && (
        <p className="text-sm rounded-lg bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-slate-300">
          <span className="text-slate-500">Turned in:</span> {task.submissionNote}
        </p>
      )}

      {canSubmit && (
        <form action={submitTask} className="flex gap-2 pt-1">
          <input type="hidden" name="taskId" value={task.id} />
          <input
            name="submissionNote"
            placeholder="What are you turning in? (note or link)"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm placeholder:text-slate-600 focus:border-orange-500 focus:outline-none"
          />
          <button className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-orange-400">
            Submit
          </button>
        </form>
      )}

      {canReview && (
        <div className="flex gap-2 pt-1">
          <form action={reviewTask}>
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="decision" value="APPROVED" />
            <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold hover:bg-emerald-500">
              ✓ Approve
            </button>
          </form>
          <form action={reviewTask}>
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="decision" value="CHANGES_REQUESTED" />
            <button className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-sm font-semibold text-rose-300 hover:bg-rose-500/20">
              Request changes
            </button>
          </form>
        </div>
      )}

      {mine && task.status === "CHANGES_REQUESTED" && (
        <form action={reopenTask}>
          <input type="hidden" name="taskId" value={task.id} />
          <button className="text-xs text-slate-400 underline hover:text-slate-200">Mark as back in progress</button>
        </form>
      )}
    </div>
  );
}
