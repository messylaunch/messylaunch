"use client";

import { useSyncExternalStore } from "react";

// Runs before paint (inlined in <head>) so there's no theme flash.
export const THEME_INIT = `(function(){try{var t=localStorage.getItem("ml-theme");if(!t){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})()`;

// Subscribe to <html data-theme> so every toggle on the page stays in sync.
function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme ?? "dark",
    () => "dark" // server snapshot; corrected on hydration
  );

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ml-theme", next);
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark theme"
      title="Toggle theme"
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card2 text-sub transition hover:border-accent hover:text-accent ${className}`}
    >
      {/* render both, fade by theme, so SSR markup is stable */}
      <span className={`absolute transition-all duration-300 ${theme === "light" ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
        {/* sun */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </span>
      <span className={`absolute transition-all duration-300 ${theme === "light" ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}>
        {/* moon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      </span>
    </button>
  );
}
