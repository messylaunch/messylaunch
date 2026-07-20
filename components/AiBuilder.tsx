"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Outline } from "@/lib/ai";
import { ITEM_TYPES } from "@/lib/meta";

type BusinessOption = { id: string; name: string; clientName: string };

export function AiBuilder({
  businesses,
  initialKind,
  aiConfigured,
}: {
  businesses: BusinessOption[];
  initialKind: "COURSE" | "PROJECT";
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<"COURSE" | "PROJECT">(initialKind);
  const [prompt, setPrompt] = useState("");
  const [useExisting, setUseExisting] = useState(true);
  const [businessId, setBusinessId] = useState("");
  const [outline, setOutline] = useState<Outline | null>(null);
  const [busy, setBusy] = useState<"generate" | "save" | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    setBusy("generate");
    setError("");
    setOutline(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, prompt, useExisting }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setOutline(data.outline);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!outline) return;
    setBusy("save");
    setError("");
    try {
      const res = await fetch("/api/ai/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline, businessId: businessId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {!aiConfigured && (
        <p className="rounded-xl border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
          ⚠ No <code>ANTHROPIC_API_KEY</code> set — the builder will return a sample outline so you can see the flow.
          Add your key to <code>.env</code> for real generation.
        </p>
      )}

      <div className="rounded-2xl border border-line bg-card p-6 space-y-4">
        <div className="flex gap-2">
          {(["COURSE", "PROJECT"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                kind === k
                  ? "bg-accent text-accent-ink"
                  : "border border-line text-sub hover:border-accent/60"
              }`}
            >
              {k === "COURSE" ? "🎓 Course" : "🤝 Project"}
            </button>
          ))}
        </div>
        <p className="text-xs text-faint">
          {kind === "COURSE"
            ? "Premade & resellable — one goal, self-paced within a 1/2/4/8-week time frame."
            : "A collaboration with one client — sections plus two-way tasks with deadlines."}
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder={
            kind === "COURSE"
              ? "Describe the customer and the goal… e.g. 'Barbershop owners who are booked on Saturdays but dead on weekdays. Goal: a rebooking system and a monthly content day, 4 weeks.'"
              : "Describe the client and what you're building together… e.g. 'Marcus at Better Man Coatings needs a one-page site. He owes photos and a bio; I owe the build, a QR business card, and the GHL form hookup. Live in 3 weeks.'"
          }
          className="w-full rounded-xl border border-line bg-card2 px-4 py-3 text-sm placeholder:text-faint focus:border-accent focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-sub">
            <input
              type="checkbox"
              checked={useExisting}
              onChange={(e) => setUseExisting(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Use my past courses & projects as a framework
          </label>
          {kind === "PROJECT" && (
            <select
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              className="rounded-lg border border-line bg-card2 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            >
              <option value="">Pick the business…</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.clientName})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={generate}
            disabled={!prompt.trim() || busy !== null}
            className="ml-auto rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:brightness-110 disabled:opacity-40"
          >
            {busy === "generate" ? "Building outline…" : "✨ Generate outline"}
          </button>
        </div>
        {error && <p className="text-sm text-err">{error}</p>}
      </div>

      {outline && (
        <div className="rounded-2xl border border-accent/30 bg-card p-6 space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent">
              Draft {outline.kind === "COURSE" ? "course" : "project"}
              {outline.durationWeeks ? ` · ${outline.durationWeeks} weeks` : ""}
            </p>
            <h2 className="mt-1 font-display text-2xl font-black text-ink">{outline.title}</h2>
            <p className="mt-2 text-sm text-sub">{outline.description}</p>
          </div>

          <div className="space-y-3">
            {outline.sections.map((s, i) => (
              <div key={i} className="rounded-xl border border-line bg-card2/60 p-4">
                <p className="font-bold text-ink">📁 {s.title}</p>
                <ul className="mt-2 space-y-1.5">
                  {s.items.map((it, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 shrink-0 rounded-full border border-line bg-card2 px-2 py-0.5 text-xs text-sub">
                        {ITEM_TYPES[it.type]?.emoji ?? "📄"} {ITEM_TYPES[it.type]?.label ?? it.type}
                      </span>
                      <span>
                        <span className="text-ink">{it.title}</span>
                        <span className="text-faint"> — {it.content}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {outline.tasks && outline.tasks.length > 0 && (
            <div className="rounded-xl border border-line bg-card2/60 p-4">
              <p className="font-bold text-ink">✅ Tasks</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {outline.tasks.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-xs ${
                        t.assignedTo === "CLIENT"
                          ? "border-pop/30 bg-pop/10 text-pop"
                          : "border-accent/30 bg-accent/10 text-accent"
                      }`}
                    >
                      {t.assignedTo === "CLIENT" ? "Client owes" : "I owe"}
                    </span>
                    <span>
                      <span className="text-ink">{t.title}</span>
                      <span className="text-faint"> — {t.details}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={busy !== null || (outline.kind === "PROJECT" && !businessId)}
              className="rounded-xl border border-ok/40 bg-ok/15 px-5 py-2.5 text-sm font-bold text-ok transition hover:bg-ok/25 disabled:opacity-40"
            >
              {busy === "save" ? "Saving…" : outline.kind === "COURSE" ? "Save as draft course" : "Create project"}
            </button>
            {outline.kind === "PROJECT" && !businessId && (
              <p className="text-xs text-faint">Pick the business above to save this project.</p>
            )}
            <button onClick={generate} disabled={busy !== null} className="text-sm text-sub underline hover:text-ink">
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
