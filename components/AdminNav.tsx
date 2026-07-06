"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "🎛️" },
  { href: "/admin/courses", label: "Courses", icon: "🎓" },
  { href: "/admin/projects", label: "Projects", icon: "🤝" },
  { href: "/admin/clients", label: "Clients", icon: "👥" },
  { href: "/admin/ai", label: "AI Builder", icon: "✨" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
              active
                ? "bg-accent/10 font-semibold text-accent"
                : "text-sub hover:translate-x-0.5 hover:bg-card2 hover:text-ink"
            }`}
          >
            {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent" />}
            <span className={`transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`}>{n.icon}</span>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
