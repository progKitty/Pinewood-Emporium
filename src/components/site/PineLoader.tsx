type Props = { size?: number; label?: string; className?: string };

/**
 * White pine-tree outline that fills with green from bottom to top in a loop.
 */
export function PineLoader({ size = 72, label = "Loading", className }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex flex-col items-center justify-center gap-3 ${className ?? ""}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Soft rotating halo */}
        <div
          aria-hidden
          className="pw-loader-ring absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--pine-glow) 40%, transparent) 90deg, transparent 180deg)",
            mask: "radial-gradient(circle, transparent 58%, #000 60%)",
            WebkitMask: "radial-gradient(circle, transparent 58%, #000 60%)",
          }}
        />
        <svg
          viewBox="0 0 64 64"
          width={size}
          height={size}
          className="relative"
          aria-hidden
        >
          <defs>
            <clipPath id="pw-pine-shape">
              {/* Pine tree silhouette */}
              <path d="M32 4 L44 22 L38 22 L48 36 L40 36 L52 52 L36 52 L36 60 L28 60 L28 52 L12 52 L24 36 L16 36 L26 22 L20 22 Z" />
            </clipPath>
          </defs>
          {/* White outline (the empty tree) */}
          <path
            d="M32 4 L44 22 L38 22 L48 36 L40 36 L52 52 L36 52 L36 60 L28 60 L28 52 L12 52 L24 36 L16 36 L26 22 L20 22 Z"
            fill="none"
            stroke="var(--cream)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Green fill, clipped to the tree, animated bottom→top */}
          <g clipPath="url(#pw-pine-shape)">
            <rect
              x="0"
              y="0"
              width="64"
              height="64"
              className="pw-loader-fill"
              fill="url(#pw-pine-grad)"
            />
          </g>
          <defs>
            <linearGradient id="pw-pine-grad" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0%" stopColor="var(--pine)" />
              <stop offset="100%" stopColor="var(--pine-glow)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
    </div>
  );
}
