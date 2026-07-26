import { db } from "@/lib/db";
import { aiConfigured, aiProviderLabel } from "@/lib/ai";
import { AiBuilder } from "@/components/AiBuilder";

export const dynamic = "force-dynamic";

export default async function AiPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const businesses = await db.business.findMany({ include: { client: { include: { user: true } } } });

  const configured = aiConfigured();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-black text-ink">AI Builder ✨</h1>
      <p className="mt-1 text-sub">
        Tell it about your customer. It drafts a course or project outline — modeled on the way you already build them.
        {configured && <> Powered by {aiProviderLabel()}.</>}
      </p>
      <div className="mt-8">
        <AiBuilder
          businesses={businesses.map((b) => ({ id: b.id, name: b.name, clientName: b.client.user.name }))}
          initialKind={kind === "PROJECT" ? "PROJECT" : "COURSE"}
          aiConfigured={configured}
          providerLabel={configured ? aiProviderLabel() : null}
        />
      </div>
    </div>
  );
}
