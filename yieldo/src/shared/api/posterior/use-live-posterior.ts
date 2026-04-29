"use client"

import { useEffect, useState } from "react"
import seedPosterior from "@/shared/data/seed-posterior.json"
import { PosteriorSnapshotSchema, type PosteriorSnapshot } from "./snapshot-v2"

const SEED_SNAPSHOT = seedPosterior as unknown as PosteriorSnapshot

type HookResult = {
  data: PosteriorSnapshot | null
  isLoading: boolean
  error: Error | null
}

/**
 * Hook for retrieving a PosteriorSnapshot.
 * - appId === "demo" → returns the committed seed JSON synchronously (no network)
 * - any other appId → fetches /api/posterior/[appId] (PR2 route) on mount
 *
 * On fetch error, falls through to seed snapshot so the dashboard never
 * goes blank during a transient backend hiccup.
 */
export function useLivePosterior(appId: string): HookResult {
  const isDemo = appId === "demo"
  const [data, setData] = useState<PosteriorSnapshot | null>(isDemo ? SEED_SNAPSHOT : null)
  const [isLoading, setIsLoading] = useState<boolean>(!isDemo)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isDemo) {
      setData(SEED_SNAPSHOT)
      setIsLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    setIsLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await fetch(`/api/posterior/${appId}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`posterior fetch failed: ${res.status}`)
        const json = await res.json()
        const parsed = PosteriorSnapshotSchema.parse(json)
        if (!cancelled) {
          setData(parsed)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          // Fall through to seed snapshot — dashboard never blank
          setData(SEED_SNAPSHOT)
          setError(err as Error)
          setIsLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [appId, isDemo])

  return { data, isLoading, error }
}
