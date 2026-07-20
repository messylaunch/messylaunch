import { ItemBadge } from "./ItemBadge";
import { embedUrl } from "@/lib/bunny";
import { toggleItemComplete } from "@/lib/actions";

export type CurriculumItem = {
  id: string;
  title: string;
  type: string;
  content: string | null;
  bunnyVideoId: string | null;
  completedAt?: Date | null;
};
export type CurriculumSection = { id: string; title: string; items: CurriculumItem[] };

// Renders the folder structure: big folder (course/project) -> sections -> items.
// Used by both the admin views and the client portal. Pass `completable` on
// project pages so items can be checked off (that's how progress is tracked).
export function Curriculum({ sections, completable = false }: { sections: CurriculumSection[]; completable?: boolean }) {
  if (!sections.length) {
    return <p className="text-faint text-sm">No content yet.</p>;
  }
  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <details key={section.id} open={i === 0} className="folder card overflow-hidden !rounded-2xl">
          <summary className="flex cursor-pointer select-none items-center gap-3 px-5 py-4 font-display font-semibold text-ink transition hover:bg-card2/60">
            <span className="caret text-accent" aria-hidden>
              ▸
            </span>
            <span className="text-accent" aria-hidden>📁</span>
            {section.title}
            <span className="chip ml-auto font-mono">
              {completable
                ? `${section.items.filter((it) => it.completedAt).length}/${section.items.length} done`
                : `${section.items.length} items`}
            </span>
          </summary>
          <div className="divide-y divide-line border-t border-line">
            {section.items.map((item) => (
              <details key={item.id} className="folder group">
                <summary className="flex cursor-pointer select-none items-center gap-3 px-5 py-3 transition hover:bg-card2/60">
                  <span className="caret text-faint" aria-hidden>▸</span>
                  <ItemBadge type={item.type} />
                  <span className={`text-sm ${item.completedAt ? "text-faint line-through" : "text-ink"}`}>{item.title}</span>
                  {item.bunnyVideoId && (
                    <span className="chip font-mono !text-accent">▶ video</span>
                  )}
                  {completable && item.completedAt && <span className="ml-auto text-xs text-ok">done ✓</span>}
                </summary>
                <div className="space-y-3 px-6 pb-5 pt-1">
                  {item.bunnyVideoId && (
                    <div className="aspect-video max-w-2xl overflow-hidden rounded-xl border border-line bg-black shadow-lg">
                      <iframe
                        src={embedUrl(item.bunnyVideoId)}
                        className="h-full w-full"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title={item.title}
                      />
                    </div>
                  )}
                  {item.content && (
                    <p className="max-w-2xl whitespace-pre-line border-l-2 border-accent/40 pl-4 text-sm leading-relaxed text-sub">
                      {item.content}
                    </p>
                  )}
                  {completable && (
                    <form action={toggleItemComplete}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <button
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                          item.completedAt
                            ? "border-line text-faint hover:text-sub"
                            : "border-ok/40 bg-ok/10 text-ok hover:bg-ok/20"
                        }`}
                      >
                        {item.completedAt ? "Mark as not done" : "✓ Mark complete"}
                      </button>
                    </form>
                  )}
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
