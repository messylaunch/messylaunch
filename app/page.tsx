/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { db } from "@/lib/db";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Reveal } from "@/components/Reveal";
import { Rocket } from "@/components/Logo";

export const dynamic = "force-dynamic";

const STARS = [
  { top: "12%", left: "8%", size: 2, tw: "2.8s", twd: "0s" },
  { top: "22%", left: "18%", size: 3, tw: "3.6s", twd: "0.4s" },
  { top: "9%", left: "38%", size: 2, tw: "3.1s", twd: "1.1s" },
  { top: "30%", left: "72%", size: 2, tw: "2.5s", twd: "0.7s" },
  { top: "14%", left: "86%", size: 3, tw: "4s", twd: "0.2s" },
  { top: "44%", left: "12%", size: 2, tw: "3.4s", twd: "1.6s" },
  { top: "52%", left: "90%", size: 2, tw: "2.9s", twd: "0.9s" },
  { top: "38%", left: "55%", size: 2, tw: "3.8s", twd: "1.3s" },
  { top: "60%", left: "30%", size: 2, tw: "3.2s", twd: "0.5s" },
  { top: "8%", left: "62%", size: 2, tw: "2.7s", twd: "1.8s" },
];

const TICKER = [
  "Websites",
  "Funnels",
  "Offer stacks",
  "Organic content",
  "Google Business",
  "Email drips",
  "First clients",
  "Review systems",
  "Rebooking flows",
  "Launch plans",
];

export default async function Home() {
  const [niches, businesses] = await Promise.all([
    db.niche.findMany({ include: { _count: { select: { businesses: { where: { isPublished: true } } } } } }),
    db.business.findMany({ where: { isPublished: true }, include: { niche: true }, take: 6 }),
  ]);

  return (
    <>
      <SiteNav />
      <main className="w-full">
        {/* ============================== HERO ============================== */}
        <section className="relative overflow-hidden">
          <div className="grid-bg absolute inset-0" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
            {STARS.map((s, i) => (
              <span
                key={i}
                className="star"
                style={{ top: s.top, left: s.left, width: s.size, height: s.size, "--tw": s.tw, "--twd": s.twd } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-24 pt-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:pt-28">
            <div>
              <Reveal>
                <p className="eyebrow flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-ok pulse-dot" />
                  Mission: client acquisition — status: messy
                </p>
              </Reveal>
              <Reveal delay={120}>
                <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                  The launch is <br />
                  <span className="relative inline-block">
                    supposed
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      viewBox="0 0 300 24"
                      fill="none"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <path
                        d="M4 14 C60 22 90 6 150 12 C210 18 250 8 296 14"
                        stroke="var(--accent)"
                        strokeWidth="7"
                        strokeLinecap="round"
                        className="draw-on-load"
                        opacity="0.85"
                      />
                    </svg>
                  </span>{" "}
                  <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">to be messy.</span>
                </h1>
              </Reveal>
              <Reveal delay={240}>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-sub">
                  You want the website, the campaigns, the funnel — you just don&apos;t know how it all connects yet.
                  That&apos;s the messy stage, and it&apos;s exactly where we work. We hand you the roadmap, build it{" "}
                  <em className="text-ink">with</em> you, and teach you to pull the strings yourself.
                </p>
              </Reveal>
              <Reveal delay={360}>
                <div className="mt-9 flex flex-wrap gap-4">
                  <Link href="/work" className="btn btn-primary">
                    See real launches
                    <span aria-hidden>→</span>
                  </Link>
                  <Link href="/niches" className="btn btn-ghost">
                    Find your niche
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* rocket scene */}
            <Reveal delay={300} className="relative hidden lg:block">
              <div className="relative mx-auto flex h-80 w-80 items-center justify-center">
                <svg className="animate-orbit absolute inset-0 h-full w-full" viewBox="0 0 320 320" fill="none" aria-hidden>
                  <circle cx="160" cy="160" r="150" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="3 10" />
                  <circle cx="160" cy="10" r="5" fill="var(--accent2)" />
                </svg>
                <svg className="absolute inset-6 h-[calc(100%-3rem)] w-[calc(100%-3rem)]" viewBox="0 0 272 272" fill="none" aria-hidden>
                  <circle cx="136" cy="136" r="128" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 8" opacity="0.7" />
                </svg>
                <div className="animate-float">
                  <Rocket size={120} flame />
                </div>
              </div>
              <p className="mt-2 text-center font-mono text-[0.65rem] uppercase tracking-[0.3em] text-faint">
                fig. 01 — a business, mid-launch
              </p>
            </Reveal>
          </div>

          {/* ticker */}
          <div className="marquee relative border-y border-line bg-card/60 py-3.5 backdrop-blur">
            <div className="marquee-track">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                  {TICKER.map((t) => (
                    <span key={`${dup}-${t}`} className="flex items-center gap-6 px-6 font-mono text-xs uppercase tracking-[0.25em] text-sub">
                      {t} <span className="text-accent">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ PHASES ============================ */}
        <section className="relative mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <p className="eyebrow">Flight plan</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Three burns to orbit.
            </h2>
          </Reveal>
          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            {/* dashed flight path behind the cards */}
            <svg
              className="pointer-events-none absolute -top-6 left-0 hidden w-full md:block"
              viewBox="0 0 1000 60"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M60 50 C260 0 420 55 520 30 C640 0 800 45 950 12" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 10" opacity="0.4" />
            </svg>
            {[
              {
                n: "01",
                title: "Get clear",
                body: "Your offer, your one person, and the problem ladder they're climbing. No launching until a stranger understands what you do in one sentence.",
              },
              {
                n: "02",
                title: "Launch messy",
                body: "Website, funnel, and organic reach in the places your people already hang out. First win first — polish later.",
              },
              {
                n: "03",
                title: "Own the controls",
                body: "We don't hand you a machine you can't drive. You learn every piece, so the business points where YOU point it.",
              },
            ].map((c, i) => (
              <Reveal key={c.n} delay={i * 140}>
                <div className="card card-hover group h-full p-7">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs tracking-[0.3em] text-faint">PHASE</span>
                    <span className="font-display text-4xl font-extrabold text-accent/30 transition-colors duration-300 group-hover:text-accent">
                      {c.n}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">{c.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-sub">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================ NICHES ============================ */}
        <section className="border-y border-line bg-card/40">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Depth over breadth</p>
                  <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                    One or two niches a month. <span className="text-faint">That&apos;s it.</span>
                  </h2>
                  <p className="mt-3 max-w-xl text-sub">
                    Every month we go deep on a niche — launch a business inside it, do the research, bounce ideas off
                    everyone in the room. Then we show off who we helped.
                  </p>
                </div>
                <Link href="/niches" className="btn btn-ghost shrink-0">All niches →</Link>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {niches.map((n, i) => (
                <Reveal key={n.id} delay={i * 90}>
                  <Link href={`/niches/${n.slug}`} className="card card-hover group block h-full p-5">
                    <p className="text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      {n.emoji}
                    </p>
                    <p className="mt-3 font-display font-bold text-ink">{n.name}</p>
                    <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-faint">
                      {n._count.businesses} launched
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =========================== LAUNCHES =========================== */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">Launch log</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Fresh off the pad.
                </h2>
              </div>
              <Link href="/work" className="text-sm font-semibold text-accent transition hover:brightness-110">
                All launches →
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {businesses.map((b, i) => (
              <Reveal key={b.id} delay={i * 110}>
                <Link href={`/work#${b.slug}`} className="card card-hover block h-full p-6">
                  <div className="flex items-center gap-3">
                    {b.logoUrl && (
                      <img src={b.logoUrl} alt={b.name} className="h-12 w-12 rounded-xl border border-line" />
                    )}
                    <div>
                      <p className="font-display font-bold text-ink">{b.name}</p>
                      <p className="text-xs text-faint">
                        {b.niche?.emoji} {b.niche?.name} · {b.location}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm italic leading-relaxed text-sub">“{b.tagline}”</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ========================== PHILOSOPHY ========================== */}
        <section className="relative overflow-hidden border-t border-line">
          <div className="grid-bg absolute inset-0 opacity-60" />
          <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
            <Reveal>
              <p className="eyebrow">The whole belief system</p>
              <h2 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
                You don&apos;t have to be <span className="text-faint line-through decoration-err/70">the expert</span>.
                <br />
                Be the expert at{" "}
                <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
                  one person&apos;s problem
                </span>
                .
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mx-auto mt-7 max-w-2xl leading-relaxed text-sub">
                Start there. Help them for real. Capitalize on that first client instead of taking them for granted —
                and build the organic engine most people skip on their way to burning money on ads.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <Link href="/work" className="btn btn-primary mt-10">
                Watch it work <span aria-hidden>🚀</span>
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
