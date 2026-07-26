/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { db } from "@/lib/db";
import { togglePublishBusiness } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const businesses = await db.business.findMany({
    include: { niche: true, client: { include: { user: true } } },
    orderBy: [{ isPublished: "asc" }, { name: "asc" }],
  });
  const drafts = businesses.filter((b) => !b.isPublished);
  const live = businesses.filter((b) => b.isPublished);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-black text-ink">Portfolio 🖼️</h1>
      <p className="mt-1 text-sub">
        What shows up on the public site (home, /work, /niches). Nothing here goes live until you flip it to
        Published — everything starts as a draft.
      </p>

      {drafts.length > 0 && (
        <section className="mt-8">
          <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-faint">
            Drafts · not on the public site ({drafts.length})
          </p>
          <div className="space-y-3">
            {drafts.map((b) => (
              <BusinessRow key={b.id} business={b} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-faint">
          Live on the public site ({live.length})
        </p>
        <div className="space-y-3">
          {live.length === 0 && <p className="text-sm text-faint">Nothing published yet.</p>}
          {live.map((b) => (
            <BusinessRow key={b.id} business={b} />
          ))}
        </div>
      </section>
    </div>
  );
}

function BusinessRow({
  business: b,
}: {
  business: {
    id: string;
    slug: string;
    name: string;
    location: string | null;
    logoUrl: string | null;
    isPublished: boolean;
    niche: { emoji: string; name: string } | null;
    client: { user: { name: string } };
  };
}) {
  return (
    <div className="card flex flex-wrap items-center gap-4 p-4">
      {b.logoUrl ? (
        <img src={b.logoUrl} alt="" className="h-11 w-11 rounded-xl object-cover" />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-line text-lg">
          {b.niche?.emoji ?? "🚀"}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{b.name}</p>
        <p className="truncate text-xs text-faint">
          {b.niche?.name ?? "No niche"} · {b.location ?? "—"} · run by {b.client.user.name}
        </p>
      </div>
      <span
        className={`ml-auto shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${
          b.isPublished ? "border-ok/30 bg-ok/15 text-ok" : "border-line bg-card2 text-sub"
        }`}
      >
        {b.isPublished ? "● Live" : "Draft"}
      </span>
      <Link
        href={`/admin/businesses/${b.id}`}
        className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-sub transition hover:border-accent/50 hover:text-ink"
      >
        Edit
      </Link>
      <form action={togglePublishBusiness} className="shrink-0">
        <input type="hidden" name="businessId" value={b.id} />
        <input type="hidden" name="isPublished" value={String(b.isPublished)} />
        <button
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            b.isPublished
              ? "border-line text-sub hover:border-err/50 hover:text-err"
              : "border-ok/30 bg-ok/10 text-ok hover:bg-ok/20"
          }`}
        >
          {b.isPublished ? "Unpublish" : "Publish"}
        </button>
      </form>
    </div>
  );
}
