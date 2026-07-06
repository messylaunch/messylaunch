import { ItemBadge } from "./ItemBadge";
import { embedUrl } from "@/lib/bunny";

export type CurriculumItem = {
  id: string;
  title: string;
  type: string;
  content: string | null;
  bunnyVideoId: string | null;
};
export type CurriculumSection = { id: string; title: string; items: CurriculumItem[] };

// Renders the folder structure: big folder (course/project) -> sections -> items.
// Used by both the admin views and the client portal.
export function Curriculum({ sections }: { sections: CurriculumSection[] }) {
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
            <span className="chip ml-auto font-mono">{section.items.length} items</span>
          </summary>
          <div className="divide-y divide-line border-t border-line">
            {section.items.map((item) => (
              <details key={item.id} className="folder group">
                <summary className="flex cursor-pointer select-none items-center gap-3 px-5 py-3 transition hover:bg-card2/60">
                  <span className="caret text-faint" aria-hidden>▸</span>
                  <ItemBadge type={item.type} />
                  <span className="text-sm text-ink">{item.title}</span>
                  {item.bunnyVideoId && (
                    <span className="chip font-mono !text-accent">▶ video</span>
                  )}
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
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
