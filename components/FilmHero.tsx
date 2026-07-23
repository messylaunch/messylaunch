"use client";

/*
 * "One Messy Line" — the scroll film.
 *
 * The whole hero is one continuous orange marker line on cream paper: a
 * scribbled knot (the idea in your head) that untangles as you scroll and
 * draws, in order: a storefront (THE OFFER), broadcast waves over an audience
 * (THE MESSAGE), a constellation of people (YOUR PEOPLE), a climbing chart
 * (THE SYSTEM) — then pulls taut into the logo rocket's flight path: liftoff,
 * and the page melts into the offer. Brand: logo cream/orange/blue.
 *
 * Engine: Lenis smooth scroll + a manually computed, lerped playhead (see
 * .claude/skills… scroll-film engine notes). No <video>, no ScrollTrigger —
 * every scrubbed value is driven from one rAF tick for total control.
 * Dev contract: ?jump=<y> lands pre-settled; window.__ready gates screenshots.
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import Lenis from "lenis";
import { Splat, Rocket, Wordmark } from "./Logo";

// ---- the world ----------------------------------------------------------
const WORLD_W = 6400;
const WORLD_H = 800;
const VIEW_W = 1200;

// One continuous line, start to finish.
const LINE =
  // the knot — chaotic crossing loops
  "M 480 470 " +
  "C 560 300 720 300 680 430 C 650 540 480 520 520 400 " +
  "C 560 280 760 340 700 470 C 660 560 520 560 560 440 " +
  "C 590 350 700 380 660 450 " +
  // untangle, travel right with a calming wobble
  "C 760 540 880 400 1020 440 C 1120 470 1220 470 1320 500 " +
  // the storefront (TECH): ground, left wall, awning zigzag, right wall
  "L 1500 500 L 1500 370 " +
  "L 1540 410 L 1580 370 L 1620 410 L 1660 370 L 1700 410 L 1740 370 L 1780 410 L 1820 370 " +
  "L 1820 500 L 1920 500 " +
  // travel + megaphone tip
  "C 2050 470 2200 430 2400 440 L 2520 415 L 2520 465 L 2455 440 " +
  // broadcast waves (MARKETING)
  "C 2680 320 2820 320 2920 430 " +
  "C 3020 540 3140 540 3240 430 " +
  "C 3340 320 3460 320 3560 420 " +
  // the constellation (CONNECTING → COMMUNITY)
  "L 3800 380 L 3950 480 L 4100 340 L 4250 470 L 4400 370 L 4550 450 " +
  // settle to the chart baseline, then climb (PROFIT)
  "C 4680 510 4760 525 4850 525 " +
  "L 4950 460 L 5050 495 L 5200 400 L 5310 435 L 5450 330 L 5560 365 L 5750 255 " +
  // pull taut — the flight path (LIFTOFF)
  "C 5950 140 6060 40 6150 -120";

// tech-station window detail + community nodes + marketing dots + chart ticks
const NODES = [
  [3800, 380], [3950, 480], [4100, 340], [4250, 470], [4400, 370], [4550, 450],
] as const;
const DOTS = [
  [2760, 470], [2870, 300], [3010, 520], [3120, 310], [3260, 500], [3400, 320], [3520, 480],
] as const;
const TICKS = [4950, 5050, 5200, 5310, 5450, 5560, 5700] as const;

// beat copy over the film: [in, peak, out] in film progress p
const BEATS = [
  { in: -0.1, peak: 0, out: 0.09, cls: "beat-hero" },
  { in: 0.13, peak: 0.19, out: 0.27, cls: "beat-1" },
  { in: 0.31, peak: 0.37, out: 0.45, cls: "beat-2" },
  { in: 0.49, peak: 0.55, out: 0.63, cls: "beat-3" },
  { in: 0.66, peak: 0.72, out: 0.80, cls: "beat-4" },
  { in: 0.875, peak: 0.93, out: 2, cls: "beat-5" }, // finale never fades
];

const CHAPTERS: [number, string][] = [
  [0, "00 · THE MESS"],
  [0.11, "01 · THE OFFER"],
  [0.30, "02 · THE MESSAGE"],
  [0.47, "03 · YOUR PEOPLE"],
  [0.645, "04 · THE SYSTEM"],
  [0.85, "05 · LIFTOFF"],
];

export function FilmHero() {
  const driverRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const driver = driverRef.current!;
    const stage = stageRef.current!;
    const path = stage.querySelector<SVGPathElement>("#mline")!;
    const world = stage.querySelector<SVGGElement>("#world")!;
    const tipEl = stage.querySelector<SVGGElement>("#tip")!;
    const rocketEl = stage.querySelector<SVGGElement>("#rocket")!;
    const flashEl = stage.querySelector<HTMLDivElement>(".film-flash")!;
    const fadeEl = stage.querySelector<HTMLDivElement>(".film-fade")!;
    const beatEls = BEATS.map((b) => stage.querySelector<HTMLDivElement>(`.${b.cls}`)!);
    const chapterLabel = document.querySelector<HTMLElement>("#chapter-label");
    const chapterBar = document.querySelector<HTMLElement>("#chapter-bar");
    const litEls = Array.from(stage.querySelectorAll<SVGElement>("[data-lit-x]"));

    const L = path.getTotalLength();
    path.style.strokeDasharray = `${L}`;
    path.style.strokeDashoffset = `${L}`;

    // The knot is already drawn at scroll 0 — the film untangles everything after it.
    // Find where the knot ends (first time the line escapes its x-region for good).
    let KNOT_LEN = 0;
    for (let len = 0; len < L; len += 12) {
      if (path.getPointAtLength(len).x > 980) {
        KNOT_LEN = len;
        break;
      }
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const jumpParam = new URLSearchParams(location.search).get("jump");
    if (jumpParam !== null) history.scrollRestoration = "manual";

    // Lenis smoothing — skipped for reduced-motion and for the screenshot harness
    let lenis: Lenis | null = null;
    if (!reduce && jumpParam === null) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    }

    let current = 0; // lerped playhead
    let camX = 0, camY = 0;
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
      // the line draws across the film (knot pre-drawn; small hero hold at the top)
      const drawP = clamp((p - 0.03) / 0.94, 0, 1);
      const len = KNOT_LEN + drawP * (L - KNOT_LEN);
      path.style.strokeDashoffset = `${L - len}`;

      // camera follows the pen tip with lag
      const pt = path.getPointAtLength(len);
      const tx = clamp(pt.x - VIEW_W * 0.45, 0, WORLD_W - VIEW_W);
      const ty = clamp(pt.y - WORLD_H * 0.52, -150, 60);
      camX += (tx - camX) * 0.09;
      camY += (ty - camY) * 0.09;
      world.setAttribute("transform", `translate(${-camX} ${-camY})`);

      // pen ember → rocket handoff
      const rocketOn = p > 0.865;
      tipEl.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      tipEl.style.opacity = rocketOn ? "0" : "1";
      if (rocketOn) {
        const back = path.getPointAtLength(Math.max(0, len - 24));
        const ang = (Math.atan2(pt.y - back.y, pt.x - back.x) * 180) / Math.PI + 90;
        rocketEl.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${ang})`);
        rocketEl.style.opacity = String(clamp((p - 0.865) / 0.03, 0, 1));
      } else {
        rocketEl.style.opacity = "0";
      }

      // stations light up as the tip passes them
      for (const el of litEls) {
        el.classList.toggle("lit", pt.x > Number(el.dataset.litX));
      }

      // beat overlays
      BEATS.forEach((b, i) => {
        const a = beatAlpha(b, p);
        const el = beatEls[i];
        el.style.opacity = String(a);
        el.style.transform = `translateY(${(1 - a) * 22}px)`;
        el.style.pointerEvents = a > 0.6 ? "auto" : "none";
      });

      // ignition flash + melt into the content
      const flash = p > 0.94 && p < 0.985 ? 1 - Math.abs((p - 0.9625) / 0.0225) : 0;
      flashEl.style.opacity = String(clamp(flash, 0, 1) * 0.85);
      fadeEl.style.opacity = String(clamp((p - 0.9) / 0.1, 0, 1));

      // chapter readout
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

      if (!settled) {
        settled = true;
        if (jumpParam !== null) {
          scrollTo(0, +jumpParam || 0);
          current = targetProgress();
          camX = 0; camY = 0;
          render(current);
          // second render so the lagged camera lands exactly
          camX = 0; camY = 0;
          const pt = path.getPointAtLength(clamp((current - 0.03) / 0.94, 0, 1) * L);
          camX = clamp(pt.x - VIEW_W * 0.45, 0, WORLD_W - VIEW_W);
          camY = clamp(pt.y - WORLD_H * 0.52, -150, 60);
          render(current);
        }
        (window as unknown as { __ready?: boolean }).__ready = true;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return (
    <>
      {/* film header — fixed chrome, dark world */}
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
      <div ref={driverRef} className="relative" style={{ height: "560vh" }}>
        <div ref={stageRef} className="sticky top-0 h-screen overflow-hidden bg-paper">
          <div className="grid-bg absolute inset-0" />
          {/* stray paint drips on the paper */}
          {[
            ["6%", "8%", 26, "var(--accent)"], ["14%", "86%", 18, "var(--blue)"], ["74%", "6%", 20, "var(--accent)"],
            ["82%", "90%", 30, "var(--blue)"], ["8%", "55%", 14, "var(--accent)"], ["86%", "42%", 16, "var(--blue)"],
          ].map(([top, left, size, color], i) => (
            <span key={i} className="absolute opacity-30" style={{ top: top as string, left: left as string }}>
              <Splat size={size as number} color={color as string} />
            </span>
          ))}

          {/* the world */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${VIEW_W} ${WORLD_H}`}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--accent)" />
                <stop offset="1" stopColor="var(--accent2)" />
              </linearGradient>
              <radialGradient id="emberGrad">
                <stop offset="0" stopColor="#ffd9a8" />
                <stop offset="0.4" stopColor="var(--accent2)" />
                <stop offset="1" stopColor="transparent" />
              </radialGradient>
            </defs>

            <g id="world">
              {/* marketing dots — audience the waves reach */}
              {DOTS.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="7" className="film-dot" data-lit-x={x - 60} />
              ))}
              {/* community constellation nodes */}
              {NODES.map(([x, y], i) => (
                <g key={i} className="film-node" data-lit-x={x - 30}>
                  <circle cx={x} cy={y} r="22" className="film-node-halo" />
                  <circle cx={x} cy={y} r="9" className="film-node-core" />
                </g>
              ))}
              {/* chart baseline ticks */}
              {TICKS.map((x, i) => (
                <line key={i} x1={x} y1={545} x2={x} y2={560} className="film-tick" data-lit-x={x - 40} />
              ))}
              <line x1={4870} y1={552} x2={5760} y2={552} className="film-tick" data-lit-x={4900} />

              {/* THE line */}
              <path id="mline" d={LINE} fill="none" stroke="url(#lineGrad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

              {/* the ember drawing the line */}
              <g id="tip" style={{ opacity: 0 }}>
                <circle r="26" fill="url(#emberGrad)" opacity="0.55" className="film-ember-glow" />
                <circle r="6" fill="var(--accent2)" stroke="var(--ink)" strokeWidth="2" />
              </g>

              {/* the rocket the ember becomes — the logo rocket */}
              <g id="rocket" style={{ opacity: 0 }}>
                <g transform="translate(-32 -50) scale(0.8)">
                  <path d="M40 80 C33 86 32 95 36 102 C38 97 39 95 40 94 C41 95 42 97 44 102 C48 95 47 86 40 80 Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" className="animate-flame" />
                  <path d="M25 52 C15 56 11 66 12 76 C19 71 25 69 28 67 Z" fill="var(--blue)" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
                  <path d="M55 52 C65 56 69 66 68 76 C61 71 55 69 52 67 Z" fill="var(--blue)" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
                  <path d="M40 4 C51 15 57 31 57 46 C57 60 51 70 40 74 C29 70 23 60 23 46 C23 31 29 15 40 4 Z" fill="var(--card)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M40 4 C45 9 49 16 51.5 24 L28.5 24 C31 16 35 9 40 4 Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
                  <circle cx="40" cy="38" r="9.5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
                </g>
              </g>
            </g>
          </svg>

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
          <div className="film-fade pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-paper" style={{ opacity: 0 }} />
        </div>
      </div>
    </>
  );
}
