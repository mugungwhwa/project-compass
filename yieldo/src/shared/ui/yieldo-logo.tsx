"use client"

/*
  YieldoLogo — yieldo wordmark.
  -----------------------------
  Always lowercase, monospace. One unified mark across status bar, sidebar,
  login, and marketing surfaces.

  Reference: yieldo Design Guidelines v1.0 §2.3.

  Replaces the previous CompassLogo (Instrument Serif italic "PROJECT COMPASS"
  + nautical triangle needle), which is archived under archive/.
  Historical name is preserved here intentionally (see archive/).
*/

type YieldoLogoProps = {
  /** sm = sidebar icon+label (14px) | md = compact bar (18px) | lg = status bar (24px) | xl = login/marketing (30px) */
  size?: "sm" | "md" | "lg" | "xl"
  /** "icon" renders a single-letter mark for tight spaces */
  variant?: "full" | "icon"
  /** Optional className passthrough on the outer span */
  className?: string
}

const SIZES = {
  sm: { text: 14 },
  md: { text: 18 },
  lg: { text: 24 },
  xl: { text: 30 },
} as const

export function YieldoLogo({
  size = "md",
  variant = "full",
  className,
}: YieldoLogoProps) {
  const s = SIZES[size]
  const wordmark = variant === "icon" ? "y." : "yieldo"

  return (
    <span
      className={`inline-flex items-center text-[var(--fg-0)] ${className ?? ""}`}
      style={{
        fontFamily:
          'var(--font-mono), "JetBrains Mono", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: s.text,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        lineHeight: 1,
      }}
    >
      {wordmark}
    </span>
  )
}
