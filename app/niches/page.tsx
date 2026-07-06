import Link from "next/link";
import { db } from "@/lib/db";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

export default async function NichesPage() {
  const niches = await db.niche.findMany({
    include: { businesses: { where: { isPublished: true } } },
  });

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <h1 className="font-display text-4xl font-black text-ink">Niches we&apos;ve gone deep on</h1>
        <p className="mt-3 max-w-2xl text-sub">
          We take one or two niches a month through the full Messy Launch cycle — research, launch, and real results
          from real businesses inside it.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {niches.map((n) => (
            <Link
              key={n.id}
              href={`/niches/${n.slug}`}
              className="card card-hover p-6"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{n.emoji}</span>
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">{n.name}</h2>
                  <p className="text-xs text-faint">
                    {n.businesses.length} business{n.businesses.length === 1 ? "" : "es"} launched
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-sub">{n.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
