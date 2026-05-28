/** Niche-themed inline vector arts. Stroke + cream/pine palette. */

export function PineGroveArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 260" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="pg-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.32 0.04 150)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.16 0.012 150)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#pg-sky)" />
      <circle cx="320" cy="60" r="22" stroke="oklch(0.94 0.025 85)" strokeOpacity="0.5" />
      {/* pines */}
      {[
        { x: 60, h: 130, s: 0.9 },
        { x: 120, h: 180, s: 1.1 },
        { x: 200, h: 150, s: 1 },
        { x: 270, h: 200, s: 1.15 },
        { x: 340, h: 140, s: 0.95 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${220 - p.h}) scale(${p.s})`}>
          <path
            d="M 0 0 L -22 60 L -10 60 L -30 100 L -14 100 L -34 140 L 34 140 L 14 100 L 30 100 L 10 60 L 22 60 Z"
            fill="oklch(0.32 0.06 150)"
            stroke="oklch(0.62 0.13 150)"
            strokeWidth="1.2"
          />
          <line x1="0" y1="140" x2="0" y2="160" stroke="oklch(0.45 0.06 60)" strokeWidth="3" />
        </g>
      ))}
      <line x1="0" y1="220" x2="400" y2="220" stroke="oklch(0.62 0.13 150)" strokeOpacity="0.5" />
    </svg>
  );
}

export function CompassArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden>
      <circle cx="100" cy="100" r="86" stroke="oklch(0.62 0.13 150)" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="68" stroke="oklch(0.62 0.13 150)" strokeOpacity="0.4" strokeWidth="0.8" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 24;
        const r1 = 80;
        const r2 = i % 6 === 0 ? 68 : 74;
        return (
          <line
            key={i}
            x1={100 + Math.cos(a) * r1}
            y1={100 + Math.sin(a) * r1}
            x2={100 + Math.cos(a) * r2}
            y2={100 + Math.sin(a) * r2}
            stroke="oklch(0.94 0.025 85)"
            strokeOpacity={i % 6 === 0 ? 0.9 : 0.4}
          />
        );
      })}
      <path d="M 100 30 L 110 100 L 100 170 L 90 100 Z" fill="oklch(0.62 0.13 150)" opacity="0.9" />
      <path d="M 30 100 L 100 110 L 170 100 L 100 90 Z" fill="oklch(0.45 0.06 60)" opacity="0.8" />
      <circle cx="100" cy="100" r="4" fill="oklch(0.94 0.025 85)" />
      <text x="100" y="22" textAnchor="middle" fontSize="10" fill="oklch(0.94 0.025 85)" fontFamily="ui-serif">N</text>
    </svg>
  );
}

export function LeafArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden>
      <path
        d="M 30 170 C 30 80 90 30 170 30 C 170 110 110 170 30 170 Z"
        stroke="oklch(0.62 0.13 150)"
        strokeWidth="1.5"
        fill="oklch(0.32 0.06 150)"
        fillOpacity="0.3"
      />
      <path d="M 30 170 L 170 30" stroke="oklch(0.62 0.13 150)" strokeWidth="1.2" />
      {Array.from({ length: 6 }).map((_, i) => {
        const t = (i + 1) / 7;
        const x = 30 + (170 - 30) * t;
        const y = 170 - (170 - 30) * t;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x + 30 * (1 - t)}
            y2={y - 30 * (1 - t)}
            stroke="oklch(0.62 0.13 150)"
            strokeOpacity="0.7"
          />
        );
      })}
    </svg>
  );
}

export function ScissorsArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" fill="none" className={className} aria-hidden>
      <circle cx="40" cy="40" r="26" stroke="oklch(0.62 0.13 150)" strokeWidth="2" />
      <circle cx="40" cy="120" r="26" stroke="oklch(0.45 0.06 60)" strokeWidth="2" />
      <line x1="60" y1="60" x2="200" y2="80" stroke="oklch(0.94 0.025 85)" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="100" x2="200" y2="80" stroke="oklch(0.94 0.025 85)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="80" r="3" fill="oklch(0.94 0.025 85)" />
      <path d="M 200 80 L 215 75 L 215 85 Z" fill="oklch(0.62 0.13 150)" />
    </svg>
  );
}

export function EnvelopeArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" className={className} aria-hidden>
      <rect x="20" y="30" width="200" height="110" rx="4" stroke="oklch(0.62 0.13 150)" strokeWidth="1.5" />
      <path d="M 20 40 L 120 100 L 220 40" stroke="oklch(0.94 0.025 85)" strokeWidth="1.5" fill="none" />
      <path d="M 60 20 Q 120 -10 180 20" stroke="oklch(0.45 0.06 60)" strokeWidth="1.2" fill="none" />
      <circle cx="120" cy="14" r="3" fill="oklch(0.62 0.13 150)" />
    </svg>
  );
}
