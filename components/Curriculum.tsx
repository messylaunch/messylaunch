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
    return <p className="text-slate-500 text-sm">No content yet.</p>;
  }
  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <details key={section.id} open={i === 0} className="rounded-xl border border-slate-800 bg-slate-900/60">
          <summary className="cursor-pointer select-none px-4 py-3 font-semibold text-slate-100 flex items-center gap-2">
            <span className="text-orange-400">📁</span> {section.title}
            <span className="ml-auto text-xs font-normal text-slate-500">{section.items.length} items</span>
          </summary>
          <div className="border-t border-slate-800 divide-y divide-slate-800/60">
            {section.items.map((item) => (
              <details key={item.id} className="group">
                <summary className="cursor-pointer select-none px-4 py-2.5 flex items-center gap-3 hover:bg-slate-800/40">
                  <ItemBadge type={item.type} />
                  <span className="text-sm text-slate-200">{item.title}</span>
                  {item.bunnyVideoId && <span className="text-xs text-slate-500">▶ video</span>}
                </summary>
                <div className="px-5 pb-4 pt-1 space-y-3">
                  {item.bunnyVideoId && (
                    <div className="aspect-video max-w-2xl overflow-hidden rounded-lg border border-slate-800 bg-black">
                      <iframe
                        src={embedUrl(item.bunnyVideoId)}
                        className="h-full w-full"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title={item.title}
                      />
                    </div>
                  )}
                  {item.content && <p className="text-sm leading-relaxed text-slate-400 max-w-2xl whitespace-pre-line">{item.content}</p>}
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
