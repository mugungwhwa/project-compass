"use client"

import type { ReactNode } from "react"
import { InfoHint } from "./info-hint"

export type ChartHeaderProps = {
  /** Chart title */
  title: string
  /** Subtitle — the question this chart answers or key context */
  subtitle?: string
  /** Meta line (e.g., "Puzzle Quest · Cohort 2026-03 · $K"). Keep it factual; no methodology prose. */
  context?: string
  /** One-line AI insight displayed below subtitle/context */
  insight?: string
  /**
   * Static methodology / legend text revealed via an ⓘ icon next to the title.
   * Use this for "what do these colors/bands mean" explanations that readers
   * only need once.
   */
  info?: string
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
 *   insight  → 11px/500 in --fg-2 (dynamic per-render takeaway)
 *
 * Information hierarchy:
 *   - Always visible: title, subtitle (meta), insight (dynamic)
 *   - On-demand via ⓘ: info (static methodology/legend)
 */
export function ChartHeader({ title, subtitle, context, insight, info, actions }: ChartHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-h2 text-[var(--fg-0)]">{title}</h3>
          {info && <InfoHint content={info} />}
        </div>
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
