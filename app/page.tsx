/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { db } from "@/lib/db";
import { FilmHero } from "@/components/FilmHero";
import { SiteFooter } from "@/components/SiteNav";
import { Reveal } from "@/components/Reveal";
import { Splat } from "@/components/Logo";

export const dynamic = "force-dynamic";

const BACKSTAGE = [
  {
    emoji: "🧭",
    title: "Direction",
    body: "Who you're becoming, who you're helping, and what you're actually building — so the business stops being a pile of random opportunities.",
  },
  {
    emoji: "🧱",
    title: "Foundation",
    body: "The offer, the price, the proof, and the customer journey. What are we selling, who is it for, and what happens after someone says yes?",
  },
  {
    emoji: "🌱",
    title: "Cultivation",
    body: "The people you already know — past customers, referrals, your Dream 100. Relationships worked on purpose, not by accident.",
  },
];

const FRONTSTAGE = [
  {
    emoji: "🗣️",
    title: "Define",
    body: "Positioning and messaging a stranger understands in one sentence. The pitch, the objections, the words your customer actually uses.",
  },
  {
    emoji: "🖥️",
    title: "Presence",
    body: "The smallest useful online home — a one-page site, a lead capture, a follow-up sequence. Clear and findable beats everywhere and exhausted.",
  },
  {
    emoji: "📈",
    title: "Leads",
    body: "Content, outreach, partnerships, and ads — turned on after the basics work, matched to your customer instead of copied from a guru.",
  },
];

export default async function Home() {
  // the film must load even if the database is down — proof strip just hides
  const businesses = await db.business
    .findMany({ where: { isPublished: true }, include: { niche: true }, take: 3 })
    .catch(() => []);

  return (
    // the home page lives in the brand's cream-paper world in both themes
    <div data-theme="light" className="bg-paper text-ink">
      <FilmHero />

      <main className="relative">
        {/* ---- the main offer ---- */}
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-6">
          <Reveal>
            <div className="card overflow-hidden border-2 !border-ink/80 shadow-[8px_8px_0_0_var(--accent)]">
              <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
                <div className="p-8 sm:p-12">
                  <p className="eyebrow">The offer</p>
                  <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                    Your Messy Launch, <span className="text-accent">done with you.</span>
                  </h2>
                  <p className="mt-5 leading-relaxed text-sub">
                    Most people don&apos;t struggle because they lack ideas or talent — they struggle because
                    everything is mixed together. The business already exists in your head, your notes, and your
                    half-built pages. We help you turn it into something{" "}
                    <em className="text-ink">clear, usable, and capable of growing</em> — and you learn to run it
                    yourself.
                  </p>
                  <ul className="mt-7 space-y-3 text-sm">
                    {[
                      "A direction and a defined customer — not a pile of maybes",
                      "An offer built around a result, not a list of tasks",
                      "A customer journey from “heard about you” to “paid you”",
                      "A follow-up system so opportunities stop falling through the cracks",
                    ].map((li) => (
                      <li key={li} className="flex gap-3">
                        <span className="mt-0.5 font-bold text-accent">✓</span>
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
                <div className="relative hidden items-center justify-center border-l-2 border-ink/80 bg-card2/50 md:flex">
                  <div className="grid-bg absolute inset-0" />
                  <span className="absolute right-4 top-4 opacity-70">
                    <Splat size={56} color="var(--blue)" />
                  </span>
                  <div className="relative p-10">
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-faint">You need</p>
                    <ul className="mt-5 space-y-2.5 font-display text-lg font-bold leading-snug">
                      <li>a direction,</li>
                      <li>a customer,</li>
                      <li>a problem worth solving,</li>
                      <li>an offer that makes sense,</li>
                      <li>a way to say it,</li>
                      <li>a clear next step,</li>
                      <li className="text-accent">and a system that keeps you moving.</li>
                    </ul>
                    <p className="mt-5 text-sm text-sub">Not everything figured out. Just this.</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ---- two starting points ---- */}
        <section className="border-y border-line bg-card/50">
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
                  <h3 className="mt-4 font-display text-xl font-bold">It&apos;s still an idea</h3>
                  <p className="mt-3 text-sm leading-relaxed text-sub">
                    You know bits and pieces — the service, maybe a name, a few notes. What&apos;s missing is the
                    connective tissue: who it&apos;s for, what the offer is, what to say, and what week one of
                    actually selling looks like. We map the line first, then walk it with you.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={220}>
                <div className="card card-hover h-full p-8">
                  <p className="text-3xl">💰</p>
                  <h3 className="mt-4 font-display text-xl font-bold">You have customers — and chaos</h3>
                  <p className="mt-3 text-sm leading-relaxed text-sub">
                    Money&apos;s coming in, but the business is held together by your personal effort. Leads live in
                    your memory, follow-up slips, every job is custom. We untangle the knot you&apos;re already in —
                    and build the system so it stops depending on you remembering everything.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---- the framework: backstage before front stage ---- */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <Reveal>
            <p className="eyebrow">The framework</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Backstage before front stage.
            </h2>
            <p className="mt-3 max-w-2xl text-sub">
              A business can look polished out front while everything behind the curtain runs on memory and panic.
              More marketing only magnifies that. So we build in this order:
            </p>
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <Reveal delay={80}>
              <div>
                <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-blue">
                  ① Backstage — what makes it work
                </p>
                <div className="space-y-4">
                  {BACKSTAGE.map((f) => (
                    <div key={f.title} className="card card-hover p-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{f.emoji}</span>
                        <h3 className="font-display text-lg font-bold">{f.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-sub">{f.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div>
                <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-accent">
                  ② Front stage — what the world sees
                </p>
                <div className="space-y-4">
                  {FRONTSTAGE.map((f) => (
                    <div key={f.title} className="card card-hover p-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{f.emoji}</span>
                        <h3 className="font-display text-lg font-bold">{f.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-sub">{f.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={250}>
            <div className="relative mt-8 overflow-hidden rounded-2xl border-2 border-ink/80 bg-card p-7 shadow-[6px_6px_0_0_var(--blue)]">
              <p className="font-display text-lg font-bold">
                Ads amplify what already exists. <span className="text-accent">So we fix the container first.</span>
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sub">
                If the message is unclear, more traffic means more confused people. If follow-up leaks, more leads
                just leak faster. MessyLaunch doesn&apos;t pour more into a leaking business — we make the container
                hold, then turn up the volume.
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
                    <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">Messes we&apos;ve launched.</h2>
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
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-4">
          <Reveal>
            <div className="rounded-2xl border border-line bg-card2/50 p-6 text-sm leading-relaxed text-sub">
              <span className="font-semibold text-ink">Also in the toolbox:</span>{" "}for some niches we build apps and
              repeatable workflows — systems a business can run again and again, or even resell. It&apos;s not the
              main thing we do, but if your messy launch needs one, we build it.{" "}
              <Link href="/start" className="text-accent underline">
                Mention it in your intake.
              </Link>
            </div>
          </Reveal>
        </section>

        {/* ---- final CTA: the belief ---- */}
        <section className="relative overflow-hidden border-t border-line">
          <div className="grid-bg absolute inset-0 opacity-60" />
          <span className="absolute -left-8 top-10 opacity-25">
            <Splat size={160} />
          </span>
          <span className="absolute -right-6 bottom-10 opacity-20">
            <Splat size={120} color="var(--blue)" />
          </span>
          <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
            <Reveal>
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Start with what you know.
                <br />
                <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
                  Build what you need.
                </span>
                <br />
                Learn from what happens.
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
