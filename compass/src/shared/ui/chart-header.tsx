"use client"

import type { ReactNode } from "react"

export type ChartHeaderProps = {
  /** Chart title */
  title: string
  /** Subtitle — the question this chart answers or key context */
  subtitle?: string
  /** Unit or context line (e.g., "Puzzle Quest · Cohort 2026-03 · P10 / P50 / P90") */
  context?: string
  /** One-line AI insight displayed below context */
  insight?: string
  /** Right-side slot for expand button or other controls */
  actions?: ReactNode
}

/**
 * ChartHeader — unified title/description block for all chart cards.
 *
 * Typography uses the new design system tokens:
 *   title    → text-h2 (18px/600) in --fg-0
 *   subtitle → text-caption (12px/400) in --fg-2
 *   context  → text-caption (12px/400) in --fg-2, italic
 */
export function ChartHeader({ title, subtitle, context, insight, actions }: ChartHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h3 className="text-h2 text-[var(--fg-0)]">{title}</h3>
        {subtitle && (
          <p className="text-caption text-[var(--fg-2)] mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        )}
        {context && (
          <p className="text-caption text-[var(--fg-2)] mt-0.5 italic leading-relaxed">
            {context}
          </p>
        )}
        {insight && (
          <p className="text-[11px] text-[var(--fg-2)] mt-1 font-medium">
            {insight}
          </p>
        )}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  )
}
