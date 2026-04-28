"use client"

/**
 * Chart line labels — Bloomberg-grade, density-aware.
 * --------------------------------------------------------------
 * Two helpers ship from this file, both for use as Recharts
 * `<LabelList content={...}/>` overrides.
 *
 *  endpointLabel()    — render exactly one label at the line tip.
 *  sparseLineLabels() — render labels at endpoint + every Nth point,
 *                       auto-thinned by data density.
 *
 * Both apply:
 *   - 14-16px offset clear of the line tip
 *   - paint-order knockout halo (text never overlaps any line)
 *   - mono + tabular-nums (Bloomberg standard)
 *
 * Density rules baked in (Miller 7±2 capacity, Stephen Few direct-
 * labeling guidance):
 *
 *   ≤ 7 points  →  every point     (rich data, sparse density)
 *   8–14 points →  endpoint + N=3  (every 3rd, plus tips)
 *   15+ points  →  endpoint only   (Bloomberg pattern; reading via
 *                                   hover tooltip + axis ticks)
 *
 * Reference: docs/Project_Yieldo_Design_Migration_Log.md §8.9
 */

import type { ReactElement } from "react"

// ---------- Shared rendering primitive ----------

type Anchor = "start" | "middle" | "end"

type RenderOpts = {
  offset?: number
  fontSize?: number
  fontWeight?: number
  textAnchor?: Anchor
  /** Vertical baseline correction in px (default 4 — sits on the data row). */
  dy?: number
  /** Bg-color stroke for paint-halo. Default var(--bg-1). */
  haloColor?: string
}

function renderText(
  x: number,
  y: number,
  text: string,
  color: string,
  o: RenderOpts,
): ReactElement {
  const offset = o.offset ?? 14
  const dy = o.dy ?? 4
  const fontSize = o.fontSize ?? 11
  const fontWeight = o.fontWeight ?? 600
  const anchor = o.textAnchor ?? "start"
  const halo = o.haloColor ?? "var(--bg-1)"

  // Place by anchor: "start" → x+offset, "end" → x-offset, "middle" → x
  const tx = anchor === "start" ? x + offset : anchor === "end" ? x - offset : x

  return (
    <text
      x={tx}
      y={y}
      dy={dy}
      textAnchor={anchor}
      fill={color}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fontFamily="var(--font-geist-mono), 'D2Coding', 'JetBrains Mono', monospace"
      style={{
        fontVariantNumeric: "tabular-nums",
        // Knockout halo — bg-color outline behind text so any line
        // crossing through the label is visually broken by the halo.
        paintOrder: "stroke",
        stroke: halo,
        strokeWidth: 3.5,
        strokeLinejoin: "round",
      }}
    >
      {text}
    </text>
  )
}

// ---------- 1. endpointLabel: exactly one label at the line tip ----------

export type EndpointLabelOptions = RenderOpts

export function endpointLabel(
  lastIndex: number,
  formatter: (v: number) => string,
  color: string,
  opts: EndpointLabelOptions = {},
) {
  return function EndpointLabelContent(props: unknown): ReactElement | null {
    const p = (props ?? {}) as { x?: unknown; y?: unknown; value?: unknown; index?: unknown }
    if (p.index !== lastIndex) return null
    if (typeof p.value !== "number") return null
    if (typeof p.x !== "number" || typeof p.y !== "number") return null
    return renderText(p.x, p.y, formatter(p.value), color, opts)
  }
}

// ---------- 2. sparseLineLabels: density-aware sparse labels ----------

export type SparseLabelsOptions = RenderOpts & {
  /** Total length of the data series. Required for density math. */
  total: number
  /**
   * Override the auto-density rule. If provided, label every Nth point
   * (regardless of total).  Endpoint is always labeled.
   */
  everyNth?: number
}

export function sparseLineLabels(
  formatter: (v: number) => string,
  color: string,
  opts: SparseLabelsOptions,
) {
  const { total, everyNth: explicitN, ...renderOpts } = opts
  const lastIndex = total - 1

  // Auto density rule (Miller 7±2 + Stephen Few direct-labeling):
  //   ≤7  → everyNth = 1 (label every point)
  //   8–14 → everyNth = 3
  //   15+ → endpoint only (everyNth = Infinity)
  const autoN =
    total <= 7 ? 1 : total <= 14 ? 3 : Number.POSITIVE_INFINITY
  const N = explicitN ?? autoN

  return function SparseLabelsContent(props: unknown): ReactElement | null {
    const p = (props ?? {}) as { x?: unknown; y?: unknown; value?: unknown; index?: unknown }
    const idx = p.index
    if (typeof idx !== "number") return null
    if (typeof p.value !== "number") return null
    if (typeof p.x !== "number" || typeof p.y !== "number") return null

    // Always show endpoint; otherwise honor every-Nth rule
    const isEndpoint = idx === lastIndex
    const onPeriod = N !== Number.POSITIVE_INFINITY && idx % N === 0
    if (!isEndpoint && !onPeriod) return null

    // Endpoint anchors LEFT (label drifts right of tip), interior points
    // anchor MIDDLE (label sits centered above the dot, lifted by offset).
    if (isEndpoint) {
      return renderText(p.x, p.y, formatter(p.value), color, {
        ...renderOpts,
        textAnchor: "start",
        offset: renderOpts.offset ?? 14,
        dy: renderOpts.dy ?? 4,
      })
    }

    // Interior label: lift above the data point so it doesn't sit ON the line.
    return renderText(p.x, p.y, formatter(p.value), color, {
      ...renderOpts,
      textAnchor: "middle",
      // shift label vertically up by ~14px (offset becomes 0 horizontally,
      // but we move y instead via dy)
      offset: 0,
      dy: -10,
    })
  }
}
