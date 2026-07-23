"use client";

/*
 * "One Messy Line" — the scroll film, Lane B (real footage).
 *
 * The hero is now an actual film: six 5-second Higgsfield clips chained
 * shot-to-shot (each clip starts from the literal last frame of the previous
 * one), assembled into one continuous take and pre-extracted to JPEG frames.
 * Scrolling scrubs the film on a full-viewport canvas — the knot untangles,
 * draws the storefront, broadcasts the message, connects your people, runs
 * the system, and the rocket lifts off.
 *
 * Engine (see .claude/skills scroll-film notes): canvas + pre-extracted
 * frames (never <video currentTime> — seek stutter), an ImageBitmap sliding
 * window so every draw is a GPU blit (drawImage(HTMLImageElement) forces a
 * synchronous JPEG decode = the frame-by-frame jank), a lerped playhead,
 * Lenis smooth scroll, DPR capped at 1.5.
 * Dev contract: ?jump=<y> lands pre-settled; window.__ready gates screenshots.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";
import { Rocket, Wordmark } from "./Logo";

const FRAME_COUNT = 361; // from assemble output
const FRAME_SRC = (i: number) => `/film/f_${String(i + 1).padStart(4, "0")}.jpg`;
const SEAM = "#cab9b5"; // sampled bottom-strip colour of the final frame

// beat copy over the film: [in, peak, out] in film progress p.
// Junctions land at i/6 — each chapter owns one clip.
const BEATS = [
  { in: -0.1, peak: 0, out: 0.12, cls: "beat-hero" },
  { in: 0.19, peak: 0.25, out: 0.315, cls: "beat-1" },
  { in: 0.355, peak: 0.415, out: 0.48, cls: "beat-2" },
  { in: 0.52, peak: 0.58, out: 0.645, cls: "beat-3" },
  { in: 0.685, peak: 0.745, out: 0.81, cls: "beat-4" },
  { in: 0.875, peak: 0.93, out: 2, cls: "beat-5" }, // finale never fades
];

const CHAPTERS: [number, string][] = [
  [0, "00 · THE MESS"],
  [1 / 6, "01 · THE OFFER"],
  [2 / 6, "02 · THE MESSAGE"],
  [3 / 6, "03 · YOUR PEOPLE"],
  [4 / 6, "04 · THE SYSTEM"],
  [5 / 6, "05 · LIFTOFF"],
];

export function FilmHero() {
  const driverRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const driver = driverRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const flashEl = stage.querySelector<HTMLDivElement>(".film-flash")!;
    const fadeEl = stage.querySelector<HTMLDivElement>(".film-fade2")!;
    const grainEl = stage.querySelector<HTMLDivElement>(".film-grain")!;
    const beatEls = BEATS.map((b) => stage.querySelector<HTMLDivElement>(`.${b.cls}`)!);
    const chapterLabel = document.querySelector<HTMLElement>("#chapter-label");
    const chapterBar = document.querySelector<HTMLElement>("#chapter-bar");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const jumpParam = new URLSearchParams(location.search).get("jump");
    if (jumpParam !== null) history.scrollRestoration = "manual";

    let lenis: Lenis | null = null;
    if (!reduce && jumpParam === null) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    }

    // ---- frame store + concurrency-capped loader --------------------------
    const images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    let loadedCount = 0;
    let disposed = false;
    let ready = false;

    function pump(queue: number[], parallel: number, onDone: () => void) {
      let inFlight = 0;
      const next = () => {
        if (disposed) return;
        while (inFlight < parallel && queue.length) {
          const i = queue.shift()!;
          if (images[i]) continue;
          inFlight++;
          const img = new Image();
          img.onload = img.onerror = () => {
            inFlight--;
            if (img.complete && img.naturalWidth > 0) images[i] = img;
            // if this frame is inside the current decode window, re-scan so it
            // gets an ImageBitmap and upgrades whatever fallback is on screen
            if (Math.abs(i - bmpCenter) <= B_AHEAD) bmpCenter = -999;
            loadedCount++;
            if (loadedCount % 12 === 0 || loadedCount === FRAME_COUNT)
              setLoadPct(Math.round((loadedCount / FRAME_COUNT) * 100));
            if (loadedCount >= FRAME_COUNT) onDone();
            else next();
          };
          img.src = FRAME_SRC(i);
        }
      };
      next();
    }

    // Load order: frame 0 zone first (hero must paint instantly), then the rest.
    const order: number[] = [];
    for (let i = 0; i < Math.min(24, FRAME_COUNT); i++) order.push(i);
    for (let i = 24; i < FRAME_COUNT; i++) order.push(i);

    function nearestFrame(idx: number): HTMLImageElement | null {
      if (images[idx]) return images[idx];
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (images[idx - d]) return images[idx - d];
        if (images[idx + d]) return images[idx + d];
      }
      return null;
    }

    // ---- ImageBitmap sliding window (the anti-jank core) ------------------
    const bitmaps = new Map<number, ImageBitmap>();
    const decoding = new Set<number>();
    const B_AHEAD = 18, B_KEEP = 28;
    let bmpCenter = -999;
    let displayed = -1;

    function ensureBitmaps(center: number) {
      if (Math.abs(center - bmpCenter) < 3) return;
      bmpCenter = center;
      const lo = Math.max(0, center - B_AHEAD);
      const hi = Math.min(FRAME_COUNT - 1, center + B_AHEAD);
      for (let i = lo; i <= hi; i++) {
        if (bitmaps.has(i) || decoding.has(i) || !images[i]) continue;
        decoding.add(i);
        createImageBitmap(images[i]!)
          .then((b) => {
            decoding.delete(i);
            if (disposed || Math.abs(i - bmpCenter) > B_KEEP) { b.close(); return; }
            bitmaps.set(i, b);
            if (i === displayed) drawFrame(i, true);
          })
          .catch(() => decoding.delete(i));
      }
      for (const k of Array.from(bitmaps.keys()))
        if (k < center - B_KEEP || k > center + B_KEEP) {
          bitmaps.get(k)!.close();
          bitmaps.delete(k);
        }
    }

    // ---- canvas sizing + cover-fit draw -----------------------------------
    let cw = 0, ch = 0, dpr = 1;
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      cw = stage.clientWidth;
      ch = stage.clientHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      displayed = -1; // force repaint
    }

    function drawFrame(idx: number, force = false) {
      if (idx === displayed && !force) return;
      const exact: ImageBitmap | HTMLImageElement | null = bitmaps.get(idx) ?? images[idx];
      const src = exact ?? nearestFrame(idx);
      if (!src) return;
      const iw = src.width, ih = src.height;
      const scale = Math.max((cw * dpr) / iw, (ch * dpr) / ih);
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(src, (cw * dpr - dw) / 2, (ch * dpr - dh) / 2, dw, dh);
      // a fallback draw leaves `displayed` unset so the tick keeps retrying
      // until the true frame exists, then the bitmap upgrade repaints it
      displayed = exact ? idx : -1;
      (window as unknown as { __frame?: number }).__frame = displayed;
    }

    // ---- playhead ---------------------------------------------------------
    let current = 0;
    let raf = 0;
    let settled = false;

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    function targetProgress() {
      const r = driver.getBoundingClientRect();
      return clamp(-r.top / (r.height - innerHeight), 0, 1);
    }

    function beatAlpha(b: { in: number; peak: number; out: number }, p: number) {
      if (p < b.in || p > b.out) return 0;
      if (p < b.peak) return (p - b.in) / Math.max(1e-4, b.peak - b.in);
      if (b.out > 1.5) return 1;
      return 1 - (p - b.peak) / Math.max(1e-4, b.out - b.peak);
    }

    function render(p: number) {
      const frame = Math.round(p * (FRAME_COUNT - 1));
      ensureBitmaps(frame);
      drawFrame(frame);

      BEATS.forEach((b, i) => {
        const a = beatAlpha(b, p);
        const el = beatEls[i];
        el.style.opacity = String(a);
        el.style.transform = `translateY(${(1 - a) * 22}px)`;
        el.style.pointerEvents = a > 0.6 ? "auto" : "none";
      });

      // ignition flash near liftoff + melt into the content
      const flash = p > 0.94 && p < 0.985 ? 1 - Math.abs((p - 0.9625) / 0.0225) : 0;
      flashEl.style.opacity = String(clamp(flash, 0, 1) * 0.7);
      const melt = clamp((p - 0.92) / 0.08, 0, 1);
      fadeEl.style.opacity = String(melt);
      grainEl.style.opacity = String(0.5 * (1 - melt));

      if (chapterLabel && chapterBar) {
        let label = CHAPTERS[0][1];
        for (const [at, name] of CHAPTERS) if (p >= at) label = name;
        chapterLabel.textContent = label;
        chapterBar.style.width = `${p * 100}%`;
      }
    }

    let lastTs = 0, maxDelta = 0, lastLog = 0;
    function tick(ts: number) {
      lenis?.raf(ts);
      const target = targetProgress();
      current += (target - current) * (reduce || jumpParam !== null ? 1 : 0.14);
      if (Math.abs(target - current) < 0.0004) current = target;
      render(current);

      // jank meter (console) — judge max, never average
      if (lastTs) {
        maxDelta = Math.max(maxDelta, ts - lastTs);
        if (ts - lastLog > 2000) {
          if (maxDelta > 50) console.warn(`[film] frame max ${maxDelta.toFixed(0)}ms`);
          maxDelta = 0;
          lastLog = ts;
        }
      }
      lastTs = ts;

      if (!settled && ready) {
        settled = true;
        if (jumpParam !== null) {
          scrollTo(0, +jumpParam || 0);
          current = targetProgress();
          render(current);
        }
        (window as unknown as { __ready?: boolean }).__ready = true;
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    addEventListener("resize", resize);

    // land the jump scroll immediately so targetProgress() (and the boot
    // gate below) see the real position from the first tick
    if (jumpParam !== null) scrollTo(0, +jumpParam || 0);

    // Boot: pre-warm the hero zone, then reveal and start ticking.
    pump(order, 10, () => {});
    const bootCheck = setInterval(() => {
      const heroReady = images.slice(0, 12).every(Boolean);
      const jumpReady =
        jumpParam === null ||
        loadedCount >= FRAME_COUNT ||
        images[Math.round(targetProgress() * (FRAME_COUNT - 1))] !== null;
      if (heroReady && jumpReady) {
        clearInterval(bootCheck);
        ready = true;
        setLoaded(true);
      }
    }, 60);

    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearInterval(bootCheck);
      removeEventListener("resize", resize);
      for (const b of bitmaps.values()) b.close();
      bitmaps.clear();
      lenis?.destroy();
    };
  }, []);

  return (
    <>
      {/* film header — fixed chrome over the cream film world */}
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="flex items-center gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Rocket size={20} />
            <Wordmark className="text-lg" />
          </Link>
          <div className="hidden flex-1 items-center justify-center gap-3 md:flex">
            <span id="chapter-label" className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-faint">
              00 · THE MESS
            </span>
            <span className="h-px w-40 overflow-hidden rounded bg-line">
              <span id="chapter-bar" className="block h-full w-0 bg-accent transition-none" />
            </span>
          </div>
          <nav className="ml-auto flex items-center gap-2 text-sm md:ml-0">
            <Link href="/work" className="hidden rounded-lg px-3 py-2 text-sub transition hover:text-ink sm:block">
              Launches
            </Link>
            <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sub transition hover:text-ink sm:block">
              Log in
            </Link>
            <Link href="/start" className="btn btn-primary !px-4 !py-2 text-xs uppercase tracking-wider">
              Start
            </Link>
          </nav>
        </div>
      </header>

      {/* the film */}
      <div ref={driverRef} className="relative" style={{ height: "900vh" }}>
        <div ref={stageRef} className="sticky top-0 h-screen overflow-hidden bg-paper">
          <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />

          {/* film grain + vignette — sells the one-shot feel, melts out at the end */}
          <div className="film-grain pointer-events-none absolute inset-0" style={{ opacity: 0.5 }} />

          {/* loader — real progress, gone once the hero zone is decoded */}
          <div
            className={`pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-paper transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
            aria-hidden={loaded}
          >
            <Rocket size={44} />
            <div className="h-1 w-44 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${loadPct}%` }} />
            </div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.35em] text-faint">loading the film</p>
          </div>

          {/* beats */}
          <div className="beat-hero pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ opacity: 0 }}>
            <p className="eyebrow">MessyLaunch</p>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.03] tracking-tight text-ink sm:text-7xl">
              You don&apos;t need everything
              <br />
              figured out <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">to start.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-sub">
              You need enough clarity to take the next real step. That tangle? That&apos;s the
              business in your head. Scroll.
            </p>
            <p className="mt-12 animate-bounce font-mono text-[0.65rem] uppercase tracking-[0.35em] text-faint">▼ scroll</p>
          </div>

          {[
            { cls: "beat-1", n: "01 / The Offer", h: "An offer that makes sense.", p: "Not a list of services — a clear result for a real customer. We package what you already know into something people understand and buy." },
            { cls: "beat-2", n: "02 / The Message", h: "Say it so people get it.", p: "If you can't explain it in one sentence, a prettier website won't save it. Messaging comes before decoration." },
            { cls: "beat-3", n: "03 / Your People", h: "Start with who you already know.", p: "Past customers, referrals, your Dream 100 — opportunities stop falling through the cracks when follow-up becomes a system." },
            { cls: "beat-4", n: "04 / The System", h: "Fix the container. Then pour.", p: "Capture, follow up, book, deliver, ask for the review. More marketing only amplifies what already exists — so we make what exists work." },
          ].map((b) => (
            <div key={b.cls} className={`${b.cls} pointer-events-none absolute inset-0 flex items-center px-6 sm:px-16`} style={{ opacity: 0 }}>
              <div className="max-w-md rounded-2xl border-2 border-ink/80 bg-card/85 p-6 shadow-[6px_6px_0_0_var(--accent)] backdrop-blur-sm sm:p-8">
                <p className="eyebrow">{b.n}</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{b.h}</h2>
                <p className="mt-3 leading-relaxed text-sub">{b.p}</p>
              </div>
            </div>
          ))}

          <div className="beat-5 pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ opacity: 0 }}>
            <p className="eyebrow">05 / Liftoff</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight text-ink sm:text-6xl">
              Launch what&apos;s ready. Fix what&apos;s broken.
              <br />
              <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">Build what&apos;s missing.</span>
            </h2>
            <Link href="/start" className="btn btn-primary pointer-events-auto mt-9 !px-8 !py-4 !text-base">
              Start your Messy Launch 🚀
            </Link>
            <p className="mt-4 text-sm text-faint">5 quick questions · a human replies within a day</p>
          </div>

          {/* ignition flash + melt into content */}
          <div className="film-flash pointer-events-none absolute inset-0 bg-gradient-to-t from-accent2 via-accent/70 to-transparent" style={{ opacity: 0 }} />
          <div
            className="film-fade2 pointer-events-none absolute inset-x-0 bottom-0 h-80"
            style={{ opacity: 0, background: `linear-gradient(to bottom, transparent, ${SEAM} 55%, var(--paper))` }}
          />
        </div>
      </div>
    </>
  );
}
