/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { db } from "@/lib/db";
import { FilmHero } from "@/components/FilmHero";
import { SiteFooter } from "@/components/SiteNav";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

const PILLARS = [
  {
    emoji: "🔌",
    title: "Tech",
    body: "Website, booking, follow-up, automations — set up with you driving, so you're never held hostage by your own stack.",
  },
  {
    emoji: "📣",
    title: "Marketing",
    body: "Content, campaigns, and a voice that's actually yours — pointed at the people your business exists for.",
  },
  {
    emoji: "🤝",
    title: "Connecting",
    body: "Leads answered, follow-up that doesn't drop, referrals asked for out loud. The unglamorous stuff that pays.",
  },
  {
    emoji: "🏟️",
    title: "Community",
    body: "An audience that sticks around between purchases — because a crowd that knows you beats an ad budget.",
  },
];

export default async function Home() {
  const businesses = await db.business.findMany({
    where: { isPublished: true },
    include: { niche: true },
    take: 3,
  });

  return (
    // the home page lives in the film's dark world in both themes
    <div data-theme="dark" className="bg-paper text-ink">
      <FilmHero />

      <main className="relative">
        {/* ---- the main offer ---- */}
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-6">
          <Reveal>
            <div className="card overflow-hidden">
              <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
                <div className="p-8 sm:p-12">
                  <p className="eyebrow">The offer</p>
                  <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                    Your Messy Launch, <span className="text-accent">done with you.</span>
                  </h2>
                  <p className="mt-5 leading-relaxed text-sub">
                    We get in the mess with you. Together we build your game plan and work it — the tech, the
                    marketing, the connections, the community — with profit checkpoints from day one, not after
                    the burnout. You come out the other side with a launched business <em className="text-ink">and</em> the
                    hands that know how to fly it.
                  </p>
                  <ul className="mt-7 space-y-3 text-sm">
                    {[
                      "A game plan built around where YOU are — idea, launched, or already earning",
                      "Tech + marketing built with you at the controls, never behind a curtain",
                      "Real connection work: follow-up, referrals, and a community that sticks",
                      "Profit checkpoints early — we make it make money before it's too late",
                    ].map((li) => (
                      <li key={li} className="flex gap-3">
                        <span className="mt-0.5 text-accent">✓</span>
                        <span className="text-sub">{li}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9 flex flex-wrap items-center gap-4">
                    <Link href="/start" className="btn btn-primary">
                      Start your Messy Launch 🚀
                    </Link>
                    <span className="text-xs text-faint">5 questions · a human replies within a day</span>
                  </div>
                </div>
                <div className="relative hidden items-center justify-center border-l border-line bg-card2/40 md:flex">
                  <div className="grid-bg absolute inset-0" />
                  <div className="relative p-10 text-center">
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-faint">The whole line</p>
                    <p className="mt-6 space-y-1 font-mono text-sm leading-8 text-sub">
                      idea <span className="text-accent">→</span> game plan <span className="text-accent">→</span> tech
                      <br />
                      <span className="text-accent">→</span> marketing <span className="text-accent">→</span> community
                      <br />
                      <span className="text-accent">→</span> <span className="font-bold text-accent2">profit</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ---- two starting points ---- */}
        <section className="border-y border-line bg-card/40">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <Reveal>
              <p className="eyebrow">Wherever you&apos;re starting</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                The game plan meets you where you are.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Reveal delay={100}>
                <div className="card card-hover h-full p-8">
                  <p className="text-3xl">💡</p>
                  <h3 className="mt-4 font-display text-xl font-bold">Starting from an idea</h3>
                  <p className="mt-3 text-sm leading-relaxed text-sub">
                    You know what you want to build — the mess is everything between here and launched. We map the
                    whole line first: who it&apos;s for, what the offer is, what gets built, what gets said, and what
                    week one of selling looks like. Then we walk it together.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={220}>
                <div className="card card-hover h-full p-8">
                  <p className="text-3xl">💰</p>
                  <h3 className="mt-4 font-display text-xl font-bold">Already have clients</h3>
                  <p className="mt-3 text-sm leading-relaxed text-sub">
                    Money&apos;s coming in but it&apos;s chaos — every job is custom, follow-up slips, and profit is a
                    rumor. We untangle the knot you&apos;re already in: systems for the repeat work, community that
                    feeds referrals, and margin you can actually see. Before it&apos;s too late, not after.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---- the four pillars ---- */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <Reveal>
            <p className="eyebrow">What we untangle</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Four knots. One line.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <div className="card card-hover h-full p-7">
                  <p className="text-2xl">{p.emoji}</p>
                  <h3 className="mt-3 font-display text-lg font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-sub">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-6 rounded-2xl border border-accent/25 bg-gradient-to-r from-accent/10 to-transparent p-7">
              <p className="font-display text-lg font-bold">
                📈 And underneath all four: <span className="text-accent">profit.</span>
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sub">
                Profit isn&apos;t a phase-two problem. Every game plan we build has money checkpoints from the first
                week — so the business funds itself while it grows, instead of running on hope.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ---- recent launches ---- */}
        {businesses.length > 0 && (
          <section className="border-t border-line">
            <div className="mx-auto max-w-5xl px-6 py-20">
              <Reveal>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="eyebrow">Proof</p>
                    <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">Lines we&apos;ve drawn.</h2>
                  </div>
                  <Link href="/work" className="text-sm font-semibold text-accent transition hover:brightness-110">
                    All launches →
                  </Link>
                </div>
              </Reveal>
              <div className="mt-9 grid gap-5 md:grid-cols-3">
                {businesses.map((b, i) => (
                  <Reveal key={b.id} delay={i * 110}>
                    <Link href={`/work#${b.slug}`} className="card card-hover block h-full p-6">
                      <div className="flex items-center gap-3">
                        {b.logoUrl && <img src={b.logoUrl} alt={b.name} className="h-11 w-11 rounded-xl border border-line" />}
                        <div>
                          <p className="font-display font-bold">{b.name}</p>
                          <p className="text-xs text-faint">
                            {b.niche?.emoji} {b.niche?.name}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm italic text-sub">“{b.tagline}”</p>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---- the side quest ---- */}
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <Reveal>
            <div className="rounded-2xl border border-line bg-card2/40 p-6 text-sm leading-relaxed text-sub">
              <span className="font-semibold text-ink">Also in the toolbox:</span> for some niches we build apps and
              repeatable workflows — systems a business can run again and again, or even resell. It&apos;s not the main
              thing we do, but if your messy launch needs one, we build it.{" "}
              <Link href="/start" className="text-accent underline">
                Mention it in your intake.
              </Link>
            </div>
          </Reveal>
        </section>

        {/* ---- final CTA ---- */}
        <section className="relative overflow-hidden border-t border-line">
          <div className="grid-bg absolute inset-0 opacity-60" />
          <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
            <Reveal>
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Still a knot?
                <br />
                <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">Good. That&apos;s where we start.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl leading-relaxed text-sub">
                Five questions about your business. A human reads every word and replies within a day with first
                thoughts on your game plan. No pitch deck, no pressure.
              </p>
              <Link href="/start" className="btn btn-primary mt-9 !px-8 !py-4 !text-base">
                Start your Messy Launch 🚀
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
