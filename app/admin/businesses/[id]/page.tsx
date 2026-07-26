import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateBusiness, togglePublishBusiness } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [business, niches] = await Promise.all([
    db.business.findUnique({ where: { id }, include: { client: { include: { user: true } }, niche: true } }),
    db.niche.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!business) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/businesses" className="text-sm text-faint hover:text-sub">
        ← Portfolio
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-ink">{business.name}</h1>
          <p className="text-sm text-faint">run by {business.client.user.name}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            business.isPublished ? "border-ok/30 bg-ok/15 text-ok" : "border-line bg-card2 text-sub"
          }`}
        >
          {business.isPublished ? "● Live on the public site" : "Draft — not visible publicly"}
        </span>
      </div>

      <form action={togglePublishBusiness} className="mt-4">
        <input type="hidden" name="businessId" value={business.id} />
        <input type="hidden" name="isPublished" value={String(business.isPublished)} />
        <button
          className={`btn ${business.isPublished ? "btn-ghost" : "btn-primary"} !px-4 !py-2 text-sm`}
        >
          {business.isPublished ? "Unpublish from the site" : "Publish to the site"}
        </button>
      </form>

      <form action={updateBusiness} className="mt-8 space-y-5">
        <input type="hidden" name="businessId" value={business.id} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business name" name="name" defaultValue={business.name} required />
          <Field label="Tagline" name="tagline" defaultValue={business.tagline ?? ""} />
          <Field label="Location" name="location" defaultValue={business.location ?? ""} />
          <Field label="Logo URL" name="logoUrl" defaultValue={business.logoUrl ?? ""} />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-faint">Niche</span>
          <select name="nicheId" defaultValue={business.nicheId ?? ""} className="input w-full">
            <option value="">No niche</option>
            {niches.map((n) => (
              <option key={n.id} value={n.id}>
                {n.emoji} {n.name}
              </option>
            ))}
          </select>
        </label>

        <TextArea label="Story — what they do and who they help" name="story" defaultValue={business.story ?? ""} />
        <TextArea label="First win with Messy Launch" name="firstWin" defaultValue={business.firstWin ?? ""} />
        <TextArea label="Current state — what it looks like now" name="currentState" defaultValue={business.currentState ?? ""} />
        <Field
          label="Services (comma-separated)"
          name="services"
          defaultValue={business.services ?? ""}
        />

        <div className="border-t border-line pt-5">
          <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-faint">
            The person / team behind it — the shoutout
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Founder / team name" name="founderName" defaultValue={business.founderName ?? ""} />
            <Field label="Founder photo URL" name="founderPhotoUrl" defaultValue={business.founderPhotoUrl ?? ""} />
          </div>
          <TextArea label="Founder bio" name="founderBio" defaultValue={business.founderBio ?? ""} className="mt-5" />
        </div>

        <button type="submit" className="btn btn-primary !px-6 !py-3">
          Save changes
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-faint">{label}</span>
      <input name={name} defaultValue={defaultValue} required={required} className="input w-full" />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  className,
}: {
  label: string;
  name: string;
  defaultValue: string;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-faint">{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={3} className="input w-full resize-y" />
    </label>
  );
}
