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
        <h1 className="text-4xl font-black text-white">Launches 🚀</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Real businesses, real messy starts, real first wins. This is what the Messy Launch looks like — and their
          time to shine.
        </p>
        <div className="mt-10 space-y-6">
          {businesses.map((b) => (
            <article
              key={b.id}
              id={b.slug}
              className="scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-900/50 p-7"
            >
              <div className="flex flex-wrap items-center gap-4">
                {b.logoUrl && <img src={b.logoUrl} alt={b.name} className="h-14 w-14 rounded-2xl" />}
                <div>
                  <h2 className="text-xl font-bold text-white">{b.name}</h2>
                  <p className="text-sm text-slate-500">{b.location}</p>
                </div>
                {b.niche && (
                  <Link
                    href={`/niches/${b.niche.slug}`}
                    className="ml-auto rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300 hover:border-orange-500/50"
                  >
                    {b.niche.emoji} {b.niche.name}
                  </Link>
                )}
              </div>
              {b.story && <p className="mt-4 text-sm leading-relaxed text-slate-300">{b.story}</p>}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {b.firstWin && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">First win 🏆</p>
                    <p className="mt-2 text-sm text-slate-300">{b.firstWin}</p>
                  </div>
                )}
                {b.currentState && (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-400">Now 🚀</p>
                    <p className="mt-2 text-sm text-slate-300">{b.currentState}</p>
                  </div>
                )}
              </div>
              {b.services && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {b.services.split(",").map((s) => (
                    <span key={s} className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
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
