"use client"

/*
  CompassLogo — project compass wordmark.
  ----------------------------------------
  Direction γ (Nautical N) — confirmed 2026-04-08 deep BI session.

  Design:
    - Solid upward triangle (north needle) in brand blue
    - "project compass" in Geist Sans 600, all lowercase, tight tracking
    - One unified mark across status bar, sidebar, login, future surfaces

  Replaces the previous Inter 900 UPPERCASE COMPASS + ornate compass-rose
  SVG (which carried a stray "N" text artifact and used the old #2563EB
  brand color).

  Source of truth: docs/Project_Compass_Design_Migration_Log.md §1.2
*/

type CompassLogoProps = {
  /** sm = sidebar icon+label (12px icon, 14px text) | md = compact bar (14/18) | lg = status bar (18/24) | xl = login/marketing (22/30) */
  size?: "sm" | "md" | "lg" | "xl"
  /** "icon" hides the wordmark for tight spaces */
  variant?: "full" | "icon"
  /** Optional className passthrough on the outer span */
  className?: string
}

const SIZES = {
  sm: { icon: 12, text: 14, gap: 6 },
  md: { icon: 14, text: 18, gap: 8 },
  lg: { icon: 18, text: 24, gap: 9 },
  xl: { icon: 22, text: 30, gap: 10 },
} as const

export function CompassLogo({
  size = "md",
  variant = "full",
  className,
}: CompassLogoProps) {
  const s = SIZES[size]

  return (
    <span
      className={`inline-flex items-center ${className ?? ""}`}
      style={{ gap: s.gap }}
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        {/* Nautical N — north needle, ship's compass arrow */}
        <path d="M7 1 L13 13 L1 13 Z" fill="var(--brand)" />
      </svg>
      {variant === "full" && (
        <span
          className="text-[var(--fg-0)]"
          style={{
            fontFamily: 'var(--font-instrument-serif), "Noto Serif KR", Georgia, serif',
            fontSize: s.text,
            letterSpacing: "-0.01em",
            lineHeight: 1,
            fontStyle: "italic",
          }}
        >
          PROJECT COMPASS
        </span>
      )}
    </span>
  )
}
