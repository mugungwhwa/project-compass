/**
 * Chart Typography — shared font config for all chart components.
 * Keeps axis ticks, tooltips, legends, and annotations visually consistent.
 *
 * Usage:
 *   <XAxis tick={{ ...CHART_TYPO.axisTick, fill: C.axis }} />
 *   <text {...CHART_TYPO.annotation} fill={C.profit}>BEP</text>
 */

export const CHART_FONT = {
  mono: "var(--font-geist-mono)",
  sans: "var(--font-geist-sans)",
} as const

export const CHART_TYPO = {
  /** XAxis / YAxis tick labels — monospace for aligned numbers */
  axisTick: { fontSize: 11, fontFamily: CHART_FONT.mono },

  /** Axis unit labels ($K, %, etc.) */
  axisLabel: { fontSize: 10, fontFamily: CHART_FONT.mono },

  /** Tooltip title (date, category) — sans-serif inherited */
  tooltipTitle: { fontSize: 11, fontWeight: 600 },

  /** Tooltip numeric values — monospace with tabular nums */
  tooltipValue: {
    fontSize: 12,
    fontWeight: 500,
    fontFamily: CHART_FONT.mono,
    fontVariantNumeric: "tabular-nums" as const,
  },

  /** Tooltip descriptive labels */
  tooltipLabel: { fontSize: 12 },

  /** Legend text */
  legend: { fontSize: 11 },

  /** In-chart annotations — numbers & abbreviations (BEP, $120K, etc.) */
  annotation: { fontSize: 11, fontWeight: 700, fontFamily: CHART_FONT.mono },

  /** In-chart annotations — descriptive text labels (실행 시점, Stage Rollout, etc.) */
  annotationText: { fontSize: 11, fontWeight: 600, fontFamily: CHART_FONT.sans },
} as const
