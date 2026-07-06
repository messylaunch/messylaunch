/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { db } from "@/lib/db";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const businesses = await db.business.findMany({
    where: { isPublished: true },
    include: { niche: true, client: { include: { user: true } } },
  });

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <h1 className="font-display text-4xl font-black text-ink">Launches 🚀</h1>
        <p className="mt-3 max-w-2xl text-sub">
          Real businesses, real messy starts, real first wins. This is what the Messy Launch looks like — and their
          time to shine.
        </p>
        <div className="mt-10 space-y-6">
          {businesses.map((b) => (
            <article
              key={b.id}
              id={b.slug}
              className="scroll-mt-24 card p-7"
            >
              <div className="flex flex-wrap items-center gap-4">
                {b.logoUrl && <img src={b.logoUrl} alt={b.name} className="h-14 w-14 rounded-2xl" />}
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">{b.name}</h2>
                  <p className="text-sm text-faint">{b.location}</p>
                </div>
                {b.niche && (
                  <Link
                    href={`/niches/${b.niche.slug}`}
                    className="ml-auto rounded-full border border-line bg-card2 px-3 py-1 text-xs text-sub hover:border-accent/50"
                  >
                    {b.niche.emoji} {b.niche.name}
                  </Link>
                )}
              </div>
              {b.story && <p className="mt-4 text-sm leading-relaxed text-sub">{b.story}</p>}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {b.firstWin && (
                  <div className="rounded-xl border border-ok/20 bg-ok/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-ok">First win 🏆</p>
                    <p className="mt-2 text-sm text-sub">{b.firstWin}</p>
                  </div>
                )}
                {b.currentState && (
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-accent">Now 🚀</p>
                    <p className="mt-2 text-sm text-sub">{b.currentState}</p>
                  </div>
                )}
              </div>
              {b.services && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {b.services.split(",").map((s) => (
                    <span key={s} className="rounded-full border border-line bg-card2 px-3 py-1 text-xs text-sub">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
