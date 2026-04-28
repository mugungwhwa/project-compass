"use client"

/**
 * EndpointLabel — Bloomberg-style "current value at line tip".
 * --------------------------------------------------------------
 * Recharts <LabelList> by default paints one label per data point.
 * On a 30-point time series this clutters the line with 30 labels.
 *
 * This helper builds a custom `content` function that only renders at
 * the LAST data index — exactly one label, at the right tip of the line,
 * 14px clear of the line endpoint.  Mirrors trader-screen convention
 * (Bloomberg / TradingView / Refinitiv): one current value, painted in
 * mono next to where the eye lands.
 *
 * Usage in a Recharts <Line> child:
 *   <Line dataKey="p50" stroke={C.p50} ...>
 *     <LabelList content={endpointLabel(chartData.length, (v) => `${v.toFixed(1)}%`, C.p50)} />
 *   </Line>
 *
 * Reference: docs/Project_Yieldo_Design_Migration_Log.md §8.9
 */

import type { ReactElement } from "react"

export type EndpointLabelOptions = {
  /** Offset from the line endpoint, in px.  Default 14 (was 8 — too close). */
  offset?: number
  /** Vertical alignment correction (defaults to mid-baseline). */
  dy?: number
  /** Font size in px. Default 11. */
  fontSize?: number
  /** Font weight. Default 600 (700 for critical/rank metrics). */
  fontWeight?: number
}

// Recharts passes a RenderableText (string|number|null|undefined|ReactElement) for
// `value`. We relax the type accordingly and runtime-check before formatting.
type RechartsLabelProps = {
  x?: number | string
  y?: number | string
  value?: unknown
  index?: number
}

/**
 * Build a Recharts LabelList `content` callback that renders ONLY at
 * `lastIndex` (i.e. the rightmost data point).  Returns null for all
 * other indices, producing exactly one label per series.
 */
export function endpointLabel(
  lastIndex: number,
  formatter: (v: number) => string,
  color: string,
  opts: EndpointLabelOptions = {},
) {
  const { offset = 14, dy = 4, fontSize = 11, fontWeight = 600 } = opts

  return function EndpointLabelContent(props: unknown): ReactElement | null {
    const p = (props ?? {}) as RechartsLabelProps
    const { x, y, value, index } = p
    if (index !== lastIndex) return null
    if (typeof value !== "number") return null
    if (typeof x !== "number" || typeof y !== "number") return null

    return (
      <text
        x={x + offset}
        y={y}
        dy={dy}
        textAnchor="start"
        fill={color}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fontFamily="var(--font-geist-mono), 'D2Coding', 'JetBrains Mono', monospace"
        style={{
          fontVariantNumeric: "tabular-nums",
          paintOrder: "stroke",
          stroke: "var(--bg-1)",
          strokeWidth: 3,
          strokeLinejoin: "round",
        }}
      >
        {formatter(value)}
      </text>
    )
  }
}
