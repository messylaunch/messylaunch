import Link from "next/link";
import { db } from "@/lib/db";
import { Rocket, Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/Theme";
import { NotificationBell } from "@/components/NotificationBell";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await db.client.findUnique({ where: { id: clientId }, include: { user: true } });

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3.5">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-6">
              <Rocket size={20} />
            </span>
            <Wordmark />
          </Link>
          <span className="chip hidden font-mono uppercase tracking-[0.2em] sm:inline-flex">Client Portal</span>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/portal" className="text-sm text-sub transition hover:text-ink">
              Switch client
            </Link>
            {client && <NotificationBell userId={client.user.id} />}
            <ThemeToggle />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
