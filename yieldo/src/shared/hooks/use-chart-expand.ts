"use client"

import { useState, useCallback } from "react"

type ChartExpandOptions = {
  /** Base chart height in px (default: 384) */
  baseHeight?: number
  /** Expanded chart height in px (default: baseHeight * 1.5) */
  expandedHeight?: number
  /** External expanded state — when provided, the hook becomes controlled */
  expanded?: boolean
  /** External toggle — required when expanded is provided */
  onToggle?: () => void
}

/**
 * Hook for chart inline expand/collapse state.
 * Supports both standalone (internal state) and grid-controlled (external state) modes.
 * When `expanded` and `onToggle` are provided, the hook delegates to them.
 */
export function useChartExpand(options: ChartExpandOptions = {}) {
  const { baseHeight = 384, expandedHeight, expanded: externalExpanded, onToggle: externalToggle } = options
  const computedExpandedHeight = expandedHeight ?? Math.round(baseHeight * 1.5)

  const [internalExpanded, setInternalExpanded] = useState(false)
  const internalToggle = useCallback(() => setInternalExpanded((e) => !e), [])

  const expanded = externalExpanded ?? internalExpanded
  const toggle = externalToggle ?? internalToggle

  const gridClassName = expanded ? "col-span-2" : ""
  const chartHeight = expanded ? computedExpandedHeight : baseHeight

  return { expanded, toggle, gridClassName, chartHeight } as const
}
