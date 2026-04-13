"use client"

import { useState, useCallback } from "react"

type ChartExpandOptions = {
  /** Base chart height in px (default: 384) */
  baseHeight?: number
  /** Expanded chart height in px (default: baseHeight * 1.5) */
  expandedHeight?: number
}

/**
 * Hook for chart inline expand/collapse state.
 * Returns expanded state, toggle, CSS class for grid col-span, and computed height.
 */
export function useChartExpand(options: ChartExpandOptions = {}) {
  const { baseHeight = 384, expandedHeight } = options
  const computedExpandedHeight = expandedHeight ?? Math.round(baseHeight * 1.5)

  const [expanded, setExpanded] = useState(false)
  const toggle = useCallback(() => setExpanded((e) => !e), [])

  const gridClassName = expanded ? "col-span-2" : ""
  const chartHeight = expanded ? computedExpandedHeight : baseHeight

  return { expanded, toggle, gridClassName, chartHeight } as const
}
