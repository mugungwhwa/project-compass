"use client"

import { useState, useCallback } from "react"

/**
 * Container-level expand state for chart grids.
 * Only one chart can be expanded at a time within a grid.
 * Provides span classes and orphan detection for the last odd child.
 */
export function useGridLayout(chartCount: number) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = useCallback(
    (id: string) => setExpandedId((prev) => (prev === id ? null : id)),
    [],
  )

  /** Returns "col-span-2" if this chart is expanded, "" otherwise */
  const getSpan = useCallback(
    (id: string) => (expandedId === id ? "col-span-2" : ""),
    [expandedId],
  )

  /**
   * When one chart is expanded (col-span-2), the remaining charts
   * may be an odd count → last one gets col-span-2 to fill the gap.
   */
  const isOrphan = useCallback(
    (id: string, index: number) => {
      if (!expandedId) return false
      if (expandedId === id) return false
      // Remaining non-expanded charts
      const remainingCount = chartCount - 1
      const isOddRemaining = remainingCount % 2 === 1
      // Find the index among non-expanded charts
      // The last non-expanded chart is orphan if remaining count is odd
      if (!isOddRemaining) return false
      // Check if this is the last non-expanded chart by index
      // Since expanded chart is removed from flow consideration,
      // we need to check if this is the highest-index non-expanded item
      const expandedIndex = Array.from({ length: chartCount }, (_, i) => `chart-${i}`).indexOf(expandedId)
      const nonExpandedIndices = Array.from({ length: chartCount }, (_, i) => i).filter(
        (i) => `chart-${i}` !== expandedId,
      )
      return index === nonExpandedIndices[nonExpandedIndices.length - 1]
    },
    [expandedId, chartCount],
  )

  /** Convenience: get className for a chart by id and index */
  const getClassName = useCallback(
    (id: string, index: number) => {
      if (expandedId === id) return "col-span-2"
      if (isOrphan(id, index)) return "col-span-2"
      return ""
    },
    [expandedId, isOrphan],
  )

  return { expandedId, toggle, getSpan, isOrphan, getClassName } as const
}
