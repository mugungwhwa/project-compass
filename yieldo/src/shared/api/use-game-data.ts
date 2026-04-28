"use client"

/**
 * useGameData — Adapter hook for per-game dashboard data.
 *
 * This is the single boundary between the UI and the data layer.
 * Consumers (HeroVerdict, KPI cards, charts) depend ONLY on this hook's
 * return shape — they don't know whether the data came from mock lookup
 * or a remote API.
 *
 * Current implementation: synchronous mock lookup via getGameData().
 * Future implementation: TanStack Query fetching from a backend endpoint.
 * When that swap happens, no consumer component needs to change as long
 * as the return shape is preserved.
 *
 * Return shape intentionally mirrors getGameData() output. If new fields
 * are needed (e.g., retention curves per game), extend here and in the
 * underlying data source simultaneously.
 */
import { useMemo } from "react"
import { useSelectedGame } from "@/shared/store/selected-game"
import { getGameData, getGameChartData } from "./mock-data"

const DEFAULT_COHORT = "2026-03"

export function useGameData(cohortMonth: string = DEFAULT_COHORT) {
  const gameId = useSelectedGame((s) => s.gameId)

  // Memoize on (gameId, cohort) to match future TanStack Query caching semantics.
  return useMemo(() => {
    const core = getGameData(gameId, cohortMonth)
    const charts = getGameChartData(gameId)
    return { ...core, charts }
  }, [gameId, cohortMonth])
}
