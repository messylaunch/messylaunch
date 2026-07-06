import Link from "next/link";

const nav = [
  { href: "/admin", label: "Dashboard", emoji: "🎛️" },
  { href: "/admin/courses", label: "Courses", emoji: "🎓" },
  { href: "/admin/projects", label: "Projects", emoji: "🤝" },
  { href: "/admin/clients", label: "Clients", emoji: "👥" },
  { href: "/admin/ai", label: "AI Builder", emoji: "✨" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950 p-5 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 font-black">
          <span className="text-xl">🚀</span> Messy<span className="text-orange-400">Launch</span>
        </Link>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">Mission Control</p>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              <span>{n.emoji}</span> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2 text-xs text-slate-600">
          <Link href="/portal" className="block hover:text-slate-400">
            → View as client
          </Link>
          <Link href="/" className="block hover:text-slate-400">
            → Public site
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
