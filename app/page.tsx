/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { db } from "@/lib/db";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [niches, businesses] = await Promise.all([
    db.niche.findMany({ include: { _count: { select: { businesses: { where: { isPublished: true } } } } } }),
    db.business.findMany({ where: { isPublished: true }, include: { niche: true }, take: 6 }),
  ]);

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl px-6">
        {/* Hero */}
        <section className="relative py-24 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
          </div>
          <p className="mb-4 text-6xl">🚀</p>
          <h1 className="mx-auto max-w-3xl text-5xl font-black leading-tight tracking-tight text-white">
            The launch is supposed to be <span className="text-orange-400">messy</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            You know you want a website, some campaigns, a funnel — you just don&apos;t know how it all connects yet.
            That&apos;s not a you problem, that&apos;s the messy stage. We hand you the roadmap, build it <em>with</em> you,
            and teach you to pull the strings yourself — so you launch something you actually understand.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/work"
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-slate-950 hover:bg-orange-400"
            >
              See real launches
            </Link>
            <Link
              href="/niches"
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 hover:border-slate-500"
            >
              Find your niche
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="grid gap-6 py-12 md:grid-cols-3">
          {[
            {
              emoji: "🧭",
              title: "1. Get clear",
              body: "Your offer, your one person, and the problem ladder they're climbing. No launching until a stranger can understand what you do in one sentence.",
            },
            {
              emoji: "🔥",
              title: "2. Launch messy",
              body: "Website, funnel, and organic reach in the places your people already hang out. First win first — polish later.",
            },
            {
              emoji: "🛠️",
              title: "3. Own the controls",
              body: "We don't hand you a machine you can't drive. You learn every piece, so the business points where YOU point it.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <p className="text-3xl">{c.emoji}</p>
              <h3 className="mt-3 text-lg font-bold text-white">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.body}</p>
            </div>
          ))}
        </section>

        {/* Niche focus */}
        <section className="py-12">
          <h2 className="text-2xl font-black text-white">One or two niches a month. That&apos;s it.</h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Every month we go deep on a niche — launch a business inside it, do the research, and bounce ideas off
            everyone in the room. Then we show off who we helped.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {niches.map((n) => (
              <Link
                key={n.id}
                href={`/niches/${n.slug}`}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-orange-500/50"
              >
                <p className="text-2xl">{n.emoji}</p>
                <p className="mt-2 font-semibold text-white">{n.name}</p>
                <p className="text-xs text-slate-500">{n._count.businesses} launched</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent launches */}
        <section className="py-12">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-black text-white">Fresh off the launchpad</h2>
            <Link href="/work" className="text-sm text-orange-400 hover:text-orange-300">
              All launches →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {businesses.map((b) => (
              <Link
                key={b.id}
                href={`/work#${b.slug}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-orange-500/50"
              >
                <div className="flex items-center gap-3">
                  {b.logoUrl && <img src={b.logoUrl} alt={b.name} className="h-12 w-12 rounded-xl" />}
                  <div>
                    <p className="font-bold text-white">{b.name}</p>
                    <p className="text-xs text-slate-500">
                      {b.niche?.emoji} {b.niche?.name} · {b.location}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm italic text-slate-400">“{b.tagline}”</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Philosophy strip */}
        <section className="my-12 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-10 text-center">
          <h2 className="text-2xl font-black text-white">You don&apos;t have to be THE expert.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            You just have to be the expert at <span className="font-semibold text-orange-300">one person&apos;s problem</span>.
            Start there, help them for real, capitalize on that first client instead of taking them for granted — and
            build the organic engine most people skip on their way to burning money on ads.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
