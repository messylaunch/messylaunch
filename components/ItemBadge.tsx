import { ITEM_TYPES } from "@/lib/meta";

export function ItemBadge({ type }: { type: string }) {
  const t = ITEM_TYPES[type] ?? { label: type, emoji: "📄" };
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-card2 px-2 py-0.5 text-xs text-sub">
      <span>{t.emoji}</span>
      {t.label}
    </span>
  );
}
