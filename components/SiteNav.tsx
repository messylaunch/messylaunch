import Link from "next/link";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-lg">
          <span className="text-2xl">🚀</span>
          <span>
            Messy<span className="text-orange-400">Launch</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-5 text-sm text-slate-300">
          <Link href="/niches" className="hover:text-white">
            Niches
          </Link>
          <Link href="/work" className="hover:text-white">
            Launches
          </Link>
          <Link href="/portal" className="hover:text-white">
            Client Portal
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 font-semibold text-orange-300 hover:bg-orange-500/20"
          >
            Mission Control
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800/70 py-8 text-center text-sm text-slate-500">
      <p>🚀 Messy Launch — we don&apos;t wait for perfect. We launch messy and learn fast.</p>
    </footer>
  );
}
