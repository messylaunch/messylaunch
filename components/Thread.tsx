import { postMessage } from "@/lib/actions";
import { Avatar } from "./Avatar";

export type ThreadMessage = {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; name: string; avatarUrl: string | null; role: string };
};

// The back-and-forth on a project. `viewerId` is who new posts are authored as.
export function Thread({
  projectId,
  messages,
  viewerId,
}: {
  projectId: string;
  messages: ThreadMessage[];
  viewerId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {messages.length === 0 && <p className="text-sm text-faint">No messages yet — start the thread below.</p>}
        {messages.map((m) => {
          const isViewer = m.author.id === viewerId;
          return (
            <div key={m.id} className={`flex gap-3 ${isViewer ? "flex-row-reverse" : ""}`}>
              <Avatar src={m.author.avatarUrl} name={m.author.name} size={36} />
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isViewer
                    ? "bg-accent/15 border border-accent/25 text-ink"
                    : "bg-card2 border border-line text-ink"
                }`}
              >
                <p className="mb-0.5 text-xs font-semibold text-sub">
                  {m.author.name}
                  <span className="ml-2 font-normal text-faint">
                    {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </p>
                {m.body}
              </div>
            </div>
          );
        })}
      </div>
      <form action={postMessage} className="flex gap-2">
        <input type="hidden" name="projectId" value={projectId} />
        <input
          name="body"
          required
          placeholder="Write a message…"
          className="flex-1 rounded-xl border border-line bg-card2 px-4 py-2.5 text-sm placeholder:text-faint focus:border-accent focus:outline-none"
        />
        <button className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink hover:brightness-110">
          Send
        </button>
      </form>
    </div>
  );
}
