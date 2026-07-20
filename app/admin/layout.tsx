import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";
import { AdminNav } from "@/components/AdminNav";
import { Rocket, Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/Theme";
import { NotificationBell } from "@/components/NotificationBell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-card/50 p-5 backdrop-blur md:flex">
        <div className="mb-2 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-6">
              <Rocket size={22} />
            </span>
            <Wordmark className="text-lg" />
          </Link>
          <NotificationBell align="left" />
        </div>
        <p className="mb-6 mt-4 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-faint">Mission Control</p>
        <AdminNav />
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-line bg-card2/60 px-3 py-2.5">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-faint">Theme</span>
            <ThemeToggle />
          </div>
          <div className="space-y-1.5 text-xs text-faint">
            <Link href="/portal" className="block transition hover:text-accent">→ View as client</Link>
            <Link href="/" className="block transition hover:text-accent">→ Public site</Link>
            <form action={logout}>
              <button className="transition hover:text-err">→ Log out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
