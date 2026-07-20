import { db } from "@/lib/db";
import { setLeadStatus } from "@/lib/actions";
import { fmtDate } from "@/lib/meta";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<string, string> = {
  IDEA: "💡 Starting from an idea",
  LAUNCHED_QUIET: "📉 Launched but quiet",
  HAS_CLIENTS: "💰 Has clients, wants profit",
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-accent/15 text-accent border-accent/30" },
  CONTACTED: { label: "Contacted", color: "bg-info/15 text-info border-info/30" },
  CONVERTED: { label: "Converted 🎉", color: "bg-ok/15 text-ok border-ok/30" },
  PASSED: { label: "Passed", color: "bg-card2 text-sub border-line" },
};

export default async function LeadsPage() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-black text-ink">Intakes 📥</h1>
      <p className="mt-1 text-sub">Everyone who started their Messy Launch on the site. Reply within a day — that&apos;s the promise the site makes.</p>

      <div className="mt-8 space-y-4">
        {leads.length === 0 && <p className="text-sm text-faint">No intakes yet — they&apos;ll land here the moment someone finishes the form.</p>}
        {leads.map((lead) => {
          const status = STATUS_META[lead.status] ?? STATUS_META.NEW;
          return (
            <div key={lead.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-ink">{lead.businessName}</p>
                  <p className="text-sm text-faint">
                    {lead.name} · <a className="underline hover:text-accent" href={`mailto:${lead.email}`}>{lead.email}</a>
                    {lead.phone && <> · <a className="underline hover:text-accent" href={`tel:${lead.phone}`}>{lead.phone}</a></>}
                  </p>
                </div>
                <span className={`ml-auto rounded-full border px-2.5 py-0.5 text-xs ${status.color}`}>{status.label}</span>
                <span className="text-xs text-faint">{fmtDate(lead.createdAt)}</span>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-card2/60 p-3">
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-faint">Stage</p>
                  <p className="mt-1 text-ink">{STAGE_LABEL[lead.stage] ?? lead.stage}</p>
                </div>
                <div className="rounded-xl border border-line bg-card2/60 p-3">
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-faint">What&apos;s messy</p>
                  <p className="mt-1 text-ink">{lead.messy ? lead.messy.split(",").join(" · ") : "—"}</p>
                </div>
                {lead.description && (
                  <div className="rounded-xl border border-line bg-card2/60 p-3 sm:col-span-2">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-faint">The business</p>
                    <p className="mt-1 text-sub">{lead.description}</p>
                  </div>
                )}
                {lead.goal && (
                  <div className="rounded-xl border border-line bg-card2/60 p-3 sm:col-span-2">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-faint">The 90-day win</p>
                    <p className="mt-1 text-sub">{lead.goal}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["NEW", "CONTACTED", "CONVERTED", "PASSED"].map((s) => (
                  <form key={s} action={setLeadStatus}>
                    <input type="hidden" name="leadId" value={lead.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      disabled={lead.status === s}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-default ${
                        lead.status === s
                          ? STATUS_META[s].color
                          : "border-line text-sub hover:border-accent/50 hover:text-ink"
                      }`}
                    >
                      {STATUS_META[s].label}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
