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
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          ⚠ No <code>ANTHROPIC_API_KEY</code> set — the builder will return a sample outline so you can see the flow.
          Add your key to <code>.env</code> for real generation.
        </p>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="flex gap-2">
          {(["COURSE", "PROJECT"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                kind === k
                  ? "bg-orange-500 text-slate-950"
                  : "border border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              {k === "COURSE" ? "🎓 Course" : "🤝 Project"}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
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
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm placeholder:text-slate-600 focus:border-orange-500 focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={useExisting}
              onChange={(e) => setUseExisting(e.target.checked)}
              className="h-4 w-4 accent-orange-500"
            />
            Use my past courses & projects as a framework
          </label>
          {kind === "PROJECT" && (
            <select
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
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
            className="ml-auto rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-orange-400 disabled:opacity-40"
          >
            {busy === "generate" ? "Building outline…" : "✨ Generate outline"}
          </button>
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
      </div>

      {outline && (
        <div className="rounded-2xl border border-orange-500/30 bg-slate-900/50 p-6 space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Draft {outline.kind === "COURSE" ? "course" : "project"}
              {outline.durationWeeks ? ` · ${outline.durationWeeks} weeks` : ""}
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">{outline.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{outline.description}</p>
          </div>

          <div className="space-y-3">
            {outline.sections.map((s, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="font-bold text-slate-100">📁 {s.title}</p>
                <ul className="mt-2 space-y-1.5">
                  {s.items.map((it, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 shrink-0 rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400">
                        {ITEM_TYPES[it.type]?.emoji ?? "📄"} {ITEM_TYPES[it.type]?.label ?? it.type}
                      </span>
                      <span>
                        <span className="text-slate-200">{it.title}</span>
                        <span className="text-slate-500"> — {it.content}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {outline.tasks && outline.tasks.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="font-bold text-slate-100">✅ Tasks</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {outline.tasks.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-xs ${
                        t.assignedTo === "CLIENT"
                          ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                          : "border-orange-500/30 bg-orange-500/10 text-orange-300"
                      }`}
                    >
                      {t.assignedTo === "CLIENT" ? "Client owes" : "I owe"}
                    </span>
                    <span>
                      <span className="text-slate-200">{t.title}</span>
                      <span className="text-slate-500"> — {t.details}</span>
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
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold hover:bg-emerald-500 disabled:opacity-40"
            >
              {busy === "save" ? "Saving…" : outline.kind === "COURSE" ? "Save as draft course" : "Create project"}
            </button>
            {outline.kind === "PROJECT" && !businessId && (
              <p className="text-xs text-slate-500">Pick the business above to save this project.</p>
            )}
            <button onClick={generate} disabled={busy !== null} className="text-sm text-slate-400 underline hover:text-slate-200">
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
