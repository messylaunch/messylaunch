// The MessyLaunch brand mark, recreated as SVG from the logo:
// white rocket with bold ink outlines, blue fins, orange nose + flame,
// riding an orange paint splat on cream paper.

export function Splat({ size = 120, className = "", color = "var(--accent)" }: { size?: number; className?: string; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill={color} className={className} aria-hidden>
      <path d="M100 30 C118 26 128 40 142 38 C150 37 158 30 164 36 C170 42 162 50 166 58 C170 66 184 64 188 74 C192 84 178 88 176 96 C174 106 188 112 184 122 C180 132 166 126 158 132 C150 138 156 152 146 156 C136 160 130 148 120 150 C110 152 108 168 98 166 C88 164 90 150 82 146 C74 142 64 152 56 146 C48 140 54 130 48 122 C42 114 28 118 24 108 C20 98 34 94 34 84 C34 76 22 70 26 60 C30 50 44 56 52 50 C60 44 56 30 66 26 C76 22 82 34 92 32 Z" />
      <circle cx="30" cy="42" r="7" />
      <circle cx="172" cy="28" r="5" />
      <circle cx="190" cy="140" r="6" />
      <circle cx="22" cy="150" r="5" />
      <circle cx="104" cy="8" r="5" />
      <circle cx="60" cy="184" r="6" />
      <circle cx="150" cy="180" r="4" />
      <ellipse cx="12" cy="92" rx="6" ry="4" />
      <ellipse cx="194" cy="96" rx="5" ry="4" />
    </svg>
  );
}

// Upright rocket in the logo's style; rotate externally when it needs to fly a path.
export function Rocket({ size = 28, flame = false, className = "" }: { size?: number; flame?: boolean; className?: string }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 80 104" fill="none" className={className} aria-hidden>
      {/* flame */}
      <g className={flame ? "animate-flame" : undefined}>
        <path
          d="M40 80 C33 86 32 95 36 102 C38 97 39 95 40 94 C41 95 42 97 44 102 C48 95 47 86 40 80 Z"
          fill="var(--accent)"
          stroke="var(--ink)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>
      {/* fins */}
      <path d="M25 52 C15 56 11 66 12 76 C19 71 25 69 28 67 Z" fill="var(--blue)" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M55 52 C65 56 69 66 68 76 C61 71 55 69 52 67 Z" fill="var(--blue)" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
      {/* body */}
      <path
        d="M40 4 C51 15 57 31 57 46 C57 60 51 70 40 74 C29 70 23 60 23 46 C23 31 29 15 40 4 Z"
        fill="var(--card)"
        stroke="var(--ink)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* nose cone */}
      <path d="M40 4 C45 9 49 16 51.5 24 L28.5 24 C31 16 35 9 40 4 Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
      {/* window */}
      <circle cx="40" cy="38" r="9.5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
      {/* exhaust collar */}
      <path d="M31 68 L49 68 L47 76 L33 76 Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

// The full lockup: rocket on its splat. Used for hero moments and app icons.
export function LogoMark({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`} style={{ width: size, height: size }} aria-hidden>
      <Splat size={size} className="absolute inset-0" />
      <span className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotate(30deg)" }}>
        <Rocket size={size * 0.42} flame />
      </span>
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`}>
      <span className="text-accent">Messy</span>
      <span className="text-blue">Launch</span>
    </span>
  );
}
