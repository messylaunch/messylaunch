// Hand-drawn Messy Launch rocket. `flame` animates the exhaust.
export function Rocket({ size = 28, flame = false, className = "" }: { size?: number; flame?: boolean; className?: string }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 80 100" fill="none" className={className} aria-hidden>
      {/* exhaust */}
      <g className={flame ? "animate-flame" : undefined}>
        <path d="M40 78 C34 86 36 94 40 99 C44 94 46 86 40 78 Z" fill="var(--accent)" />
        <path d="M40 78 C37 84 38 90 40 93 C42 90 43 84 40 78 Z" fill="var(--accent2)" />
      </g>
      {/* fins */}
      <path d="M26 52 C16 58 12 70 13 78 C20 72 26 70 30 68 Z" fill="var(--accent)" />
      <path d="M54 52 C64 58 68 70 67 78 C60 72 54 70 50 68 Z" fill="var(--accent)" />
      {/* body */}
      <path
        d="M40 2 C52 14 58 32 58 48 C58 62 52 72 40 76 C28 72 22 62 22 48 C22 32 28 14 40 2 Z"
        fill="var(--card2)"
        stroke="var(--ink)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* window */}
      <circle cx="40" cy="36" r="9" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3.5" />
      <circle cx="43" cy="33" r="2.5" fill="var(--accent2)" />
      {/* body seam */}
      <path d="M27 58 C33 62 47 62 53 58" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`}>
      Messy<span className="text-accent">Launch</span>
    </span>
  );
}
