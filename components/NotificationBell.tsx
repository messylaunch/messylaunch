"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { markNotificationsRead } from "@/lib/actions";

type Item = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function NotificationBell({ userId, align = "right" }: { userId: string; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [pushState, setPushState] = useState<"unknown" | "unavailable" | "off" | "on">("unknown");
  const wrap = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch {}
  }, [userId]);

  useEffect(() => {
    // first fetch on a timeout so no state is set synchronously inside the effect
    const first = setTimeout(refresh, 0);
    const t = setInterval(refresh, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [refresh]);

  // figure out whether web push is available / already enabled
  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return setPushState("unavailable");
      const { configured } = await fetch("/api/push/subscribe").then((r) => r.json());
      if (!configured) return setPushState("unavailable");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setPushState(sub ? "on" : "off");
    })().catch(() => setPushState("unavailable"));
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function openPanel() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const fd = new FormData();
      fd.set("userId", userId);
      await markNotificationsRead(fd);
      setUnread(0);
    }
  }

  async function enablePush() {
    try {
      const { publicKey } = await fetch("/api/push/subscribe").then((r) => r.json());
      if (!publicKey) return;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscription: sub.toJSON() }),
      });
      setPushState("on");
    } catch {}
  }

  return (
    <div ref={wrap} className="relative">
      <button
        onClick={openPanel}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card2 text-sub transition hover:border-accent hover:text-accent"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-bold text-accent-ink">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-card shadow-2xl ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="text-sm font-bold text-ink">Notifications</p>
            {pushState === "off" && (
              <button onClick={enablePush} className="text-xs font-semibold text-accent hover:brightness-110">
                Enable push →
              </button>
            )}
            {pushState === "on" && <span className="text-xs text-ok">push on ✓</span>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-6 text-center text-sm text-faint">Nothing yet — all quiet. 🚀</p>}
            {items.map((n) => {
              const inner = (
                <div className={`border-b border-line px-4 py-3 text-sm transition hover:bg-card2/60 ${n.readAt ? "opacity-60" : ""}`}>
                  <p className="font-semibold text-ink">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs leading-relaxed text-sub">{n.body}</p>}
                  <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-faint">{timeAgo(n.createdAt)}</p>
                </div>
              );
              return n.href ? (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)}>
                  {inner}
                </Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
