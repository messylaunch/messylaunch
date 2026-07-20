"use client";

// The guided "Start your Messy Launch" intake — one question per screen,
// feels like a conversation, lands in Mission Control as a Lead.

import { useState } from "react";
import Link from "next/link";

const STAGES = [
  { value: "IDEA", emoji: "💡", label: "It's still an idea", sub: "Nothing launched yet — I need the game plan." },
  { value: "LAUNCHED_QUIET", emoji: "📉", label: "Launched, but quiet", sub: "It exists, but customers aren't finding it." },
  { value: "HAS_CLIENTS", emoji: "💰", label: "I have clients", sub: "Money's coming in — I need profit and systems before it's too late." },
];

const MESSY = [
  { value: "TECH", emoji: "🔌", label: "Tech", sub: "Website, tools, automations" },
  { value: "MARKETING", emoji: "📣", label: "Marketing", sub: "Content, ads, being seen" },
  { value: "CONNECTING", emoji: "🤝", label: "Connecting", sub: "Leads, follow-up, referrals" },
  { value: "COMMUNITY", emoji: "🏟️", label: "Community", sub: "An audience that sticks around" },
  { value: "PROFIT", emoji: "📈", label: "Profit", sub: "Pricing, offers, margin" },
];

export function StartFlow() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    description: "",
    stage: "",
    messy: [] as string[],
    goal: "",
    name: "",
    email: "",
    phone: "",
    website: "", // honeypot
  });

  const steps = 5;
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const canNext =
    (step === 0 && form.businessName.trim().length > 0) ||
    (step === 1 && form.stage !== "") ||
    (step === 2 && form.messy.length > 0) ||
    step === 3 ||
    (step === 4 && form.name.trim() && /.+@.+\..+/.test(form.email));

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Something broke — try again?");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something broke — try again?");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-6xl">🚀</p>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Got it, {form.name.split(" ")[0]}.</h1>
        <p className="mt-4 leading-relaxed text-sub">
          We&apos;re reading everything you wrote about <span className="font-semibold text-ink">{form.businessName}</span>.
          You&apos;ll hear from us within a day with first thoughts on your game plan — no fluff, no pressure.
        </p>
        <Link href="/" className="btn btn-ghost mt-8">← Back to the site</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* progress */}
      <div className="mb-10 flex items-center gap-3">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-faint">
          {String(step + 1).padStart(2, "0")} / {String(steps).padStart(2, "0")}
        </p>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-card2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-all duration-500"
            style={{ width: `${((step + 1) / steps) * 100}%` }}
          />
        </div>
      </div>

      {/* honeypot */}
      <input
        type="text"
        value={form.website}
        onChange={(e) => set({ website: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      {step === 0 && (
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">What are we launching?</h1>
          <p className="mt-2 text-sub">The business — or the idea. Working titles welcome.</p>
          <input
            autoFocus
            value={form.businessName}
            onChange={(e) => set({ businessName: e.target.value })}
            placeholder="Business or idea name"
            className="input mt-8 !py-3.5 !text-lg"
          />
          <textarea
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="One or two sentences: what do you do, and for who? (optional)"
            rows={3}
            className="input mt-4"
          />
        </div>
      )}

      {step === 1 && (
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Where are you at?</h1>
          <p className="mt-2 text-sub">No wrong answer — the game plan starts wherever you are.</p>
          <div className="mt-8 grid gap-3">
            {STAGES.map((s) => (
              <button
                key={s.value}
                onClick={() => set({ stage: s.value })}
                className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
                  form.stage === s.value
                    ? "border-accent bg-accent/10"
                    : "border-line bg-card hover:border-accent/50"
                }`}
              >
                <span className="text-3xl">{s.emoji}</span>
                <span>
                  <span className="block font-display font-bold text-ink">{s.label}</span>
                  <span className="block text-sm text-sub">{s.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">What feels messy right now?</h1>
          <p className="mt-2 text-sub">Pick everything that applies — mess is normal, that&apos;s why we&apos;re here.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {MESSY.map((m) => {
              const on = form.messy.includes(m.value);
              return (
                <button
                  key={m.value}
                  onClick={() =>
                    set({ messy: on ? form.messy.filter((v) => v !== m.value) : [...form.messy, m.value] })
                  }
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    on ? "border-accent bg-accent/10" : "border-line bg-card hover:border-accent/50"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span>
                    <span className="block font-display font-bold text-ink">{m.label}</span>
                    <span className="block text-xs text-sub">{m.sub}</span>
                  </span>
                  <span className={`ml-auto text-lg ${on ? "text-accent" : "text-faint"}`}>{on ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">90 days from now — what&apos;s the win?</h1>
          <p className="mt-2 text-sub">Say it plain. &quot;First 10 customers.&quot; &quot;Booked out.&quot; &quot;Quit my job.&quot;</p>
          <textarea
            autoFocus
            value={form.goal}
            onChange={(e) => set({ goal: e.target.value })}
            placeholder="What would make you say 'this worked'? (optional but helpful)"
            rows={4}
            className="input mt-8 !text-base"
          />
        </div>
      )}

      {step === 4 && (
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Where do we reach you?</h1>
          <p className="mt-2 text-sub">You&apos;ll hear from a human within a day. No drip campaign ambush.</p>
          <div className="mt-8 grid gap-4">
            <input
              autoFocus
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="Your name"
              className="input !py-3"
              autoComplete="name"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="Email"
              className="input !py-3"
              autoComplete="email"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="Phone (optional — for a faster call-back)"
              className="input !py-3"
              autoComplete="tel"
            />
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-err">{error}</p>}

      <div className="mt-10 flex items-center gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn btn-ghost">
            ← Back
          </button>
        )}
        {step < steps - 1 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext} className="btn btn-primary ml-auto disabled:opacity-40">
            Next →
          </button>
        ) : (
          <button onClick={submit} disabled={!canNext || busy} className="btn btn-primary ml-auto disabled:opacity-40">
            {busy ? "Sending…" : "Start my Messy Launch 🚀"}
          </button>
        )}
      </div>
    </div>
  );
}
