import Link from "next/link";
import { Rocket, Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/Theme";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
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
          <span className="chip font-mono uppercase tracking-[0.2em]">Client Portal</span>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/portal" className="text-sm text-sub transition hover:text-ink">
              Switch client
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
