"use client";

import { useState } from "react";

// Renders the AI handoff brief inline. Markdown-lite: we only need bold + lines.
function renderBrief(text: string) {
  return text.split("\n").map((line, i) => {
    const html = line
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^#+\s*(.+)$/, "<strong>$1</strong>")
      // italics only when the underscores wrap whole words (avoids ANTHROPIC_API_KEY)
      .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,;:!?])/g, "$1<em>$2</em>");
    return <p key={i} className={line.trim() === "" ? "h-2" : ""} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export function BriefButton({ slug }: { slug: string }) {
  const [brief, setBrief] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Brief failed");
      setBrief(data.brief);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Brief failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={load} disabled={busy} className="btn btn-ghost !py-2 text-xs disabled:opacity-40">
        {busy ? "Reading the project…" : brief ? "🔄 Refresh brief" : "🧠 Catch-up brief"}
      </button>
      {error && <p className="mt-2 text-sm text-err">{error}</p>}
      {brief && (
        <div className="card mt-3 space-y-1 border-accent/30 p-5 text-sm leading-relaxed text-sub [&_strong]:text-ink">
          <p className="eyebrow mb-2">Handoff brief — anyone can take it from here</p>
          {renderBrief(brief)}
        </div>
      )}
    </div>
  );
}
