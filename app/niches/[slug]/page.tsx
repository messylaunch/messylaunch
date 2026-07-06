/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

export default async function NichePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const niche = await db.niche.findUnique({
    where: { slug },
    include: { businesses: { where: { isPublished: true }, include: { client: { include: { user: true } } } } },
  });
  if (!niche) notFound();

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <Link href="/niches" className="text-sm text-slate-500 hover:text-slate-300">
          ← All niches
        </Link>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-5xl">{niche.emoji}</span>
          <h1 className="text-4xl font-black text-white">{niche.name}</h1>
        </div>
        <p className="mt-4 max-w-2xl text-slate-400">{niche.description}</p>

        <div className="mt-12 space-y-8">
          {niche.businesses.length === 0 && (
            <p className="text-slate-500">This niche is up next — launches land here as they happen. 🚀</p>
          )}
          {niche.businesses.map((b) => (
            <article key={b.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7">
              <div className="flex flex-wrap items-center gap-4">
                {b.logoUrl && <img src={b.logoUrl} alt={b.name} className="h-16 w-16 rounded-2xl" />}
                <div>
                  <h2 className="text-2xl font-bold text-white">{b.name}</h2>
                  <p className="text-sm text-slate-500">
                    {b.location} · run by {b.client.user.name}
                  </p>
                </div>
                {b.tagline && <p className="ml-auto max-w-xs text-right text-sm italic text-orange-300/80">“{b.tagline}”</p>}
              </div>
              {b.story && <p className="mt-5 leading-relaxed text-slate-300">{b.story}</p>}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {b.firstWin && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">First win 🏆</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{b.firstWin}</p>
                  </div>
                )}
                {b.currentState && (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-400">Where they are now 🚀</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{b.currentState}</p>
                  </div>
                )}
              </div>
              {b.services && (
                <div className="mt-5 flex flex-wrap gap-2">
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
