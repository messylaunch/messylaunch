import Link from "next/link";
import { Rocket, Wordmark } from "./Logo";
import { ThemeToggle } from "./Theme";
import { getSessionUser, homeFor } from "@/lib/auth";

export async function SiteNav() {
  const user = await getSessionUser();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3.5">
        <Link href="/" className="group flex items-center gap-2.5 text-lg">
          <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-6">
            <Rocket size={22} />
          </span>
          <Wordmark />
        </Link>
        <div className="ml-auto flex items-center gap-1 text-sm">
          {[
            { href: "/niches", label: "Niches" },
            { href: "/work", label: "Launches" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sub transition hover:bg-card2 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link href="/login" className="rounded-lg px-3 py-2 text-sub transition hover:bg-card2 hover:text-ink">
              Log in
            </Link>
          )}
          {user?.role === "CLIENT" && (
            <Link href={homeFor(user)} className="btn btn-primary ml-2 !px-4 !py-2 text-xs uppercase tracking-wider">
              My Portal
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="btn btn-primary ml-2 !px-4 !py-2 text-xs uppercase tracking-wider">
              Mission Control
            </Link>
          )}
          <ThemeToggle className="ml-2" />
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-14 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Rocket size={30} flame />
            <Wordmark className="text-3xl" />
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-faint">
            You don&apos;t need everything figured out to start. You need enough clarity to take the next real step.
          </p>
        </div>
        <div className="flex gap-10 text-sm">
          <div className="space-y-2">
            <p className="eyebrow">Explore</p>
            <Link href="/niches" className="block text-sub transition hover:text-accent">Niches</Link>
            <Link href="/work" className="block text-sub transition hover:text-accent">Launches</Link>
          </div>
          <div className="space-y-2">
            <p className="eyebrow">Inside</p>
            <Link href="/portal" className="block text-sub transition hover:text-accent">Client Portal</Link>
            <Link href="/admin" className="block text-sub transition hover:text-accent">Mission Control</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center font-mono text-[0.65rem] uppercase tracking-[0.3em] text-faint">
        MessyLaunch · start messy · don&apos;t stay messy
      </div>
    </footer>
  );
}
