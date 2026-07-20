type FeedMessage = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string; avatarUrl: string | null };
};
type FeedTask = {
  id: string;
  title: string;
  status: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  submissionNote: string | null;
};

type Event = { at: Date; kind: string; icon: string; text: string; detail?: string; author?: FeedMessage["author"] };

// One chronological story of the project: messages and task milestones together,
// so anyone picking the project up can read it top to bottom and know where it's at.
export function ActivityFeed({ messages, tasks }: { messages: FeedMessage[]; tasks: FeedTask[] }) {
  const events: Event[] = [];

  for (const m of messages) {
    events.push({ at: m.createdAt, kind: "message", icon: "💬", text: `${m.author.name} said`, detail: m.body, author: m.author });
  }
  for (const t of tasks) {
    const owner = t.assignedTo === "CLIENT" ? "client" : "Michael";
    events.push({ at: t.createdAt, kind: "task", icon: "📋", text: `Task created for ${owner}: ${t.title}` });
    if (t.status !== "OPEN" && t.updatedAt.getTime() !== t.createdAt.getTime()) {
      const map: Record<string, { icon: string; text: string }> = {
        SUBMITTED: { icon: "📥", text: `Turned in: ${t.title}` },
        APPROVED: { icon: "✅", text: `Approved: ${t.title}` },
        CHANGES_REQUESTED: { icon: "🔁", text: `Changes requested on: ${t.title}` },
      };
      const e = map[t.status];
      if (e) events.push({ at: t.updatedAt, kind: "task", icon: e.icon, text: e.text, detail: t.status === "SUBMITTED" ? t.submissionNote ?? undefined : undefined });
    }
  }

  events.sort((a, b) => a.at.getTime() - b.at.getTime());

  if (!events.length) return <p className="text-sm text-faint">Nothing has happened yet.</p>;

  return (
    <ol className="relative space-y-5 border-l border-line pl-6">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[2.05rem] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-card text-xs">
            {e.icon}
          </span>
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-medium text-ink">{e.text}</p>
            <p className="shrink-0 text-[0.65rem] uppercase tracking-wider text-faint">
              {e.at.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
          {e.detail && <p className="mt-1 max-w-xl rounded-lg border border-line bg-card2/60 px-3 py-2 text-sm leading-relaxed text-sub">{e.detail}</p>}
        </li>
      ))}
    </ol>
  );
}
