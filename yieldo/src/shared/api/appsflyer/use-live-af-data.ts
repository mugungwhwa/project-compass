"use client"

import { useEffect, useState } from "react"
import type { AppStatus } from "./types"

type LiveAfData = {
  status: AppStatus | null
  lastSyncAt: string | null
  callsUsedToday: number | null
  loading: boolean
  error: string | null
}

/**
 * AppsFlyer connector의 실시간 상태를 폴링하는 client-side hook.
 *
 * - `appId`가 null이면 폴링 안 함 (loading=false로 즉시 반환).
 * - 실패 시에도 다음 tick까지 대기 후 재시도 — 지속 가용.
 * - 컴포넌트 unmount 시 안전하게 cleanup.
 */
export function useLiveAfData(
  appId: string | null,
  pollMs: number = 10_000,
): LiveAfData {
  const [data, setData] = useState<LiveAfData>({
    status: null,
    lastSyncAt: null,
    callsUsedToday: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!appId) {
      setData((d) => ({ ...d, loading: false }))
      return
    }

    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null

    async function tick() {
      try {
        const res = await fetch(`/api/appsflyer/state/${appId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!alive) return
        setData({
          status: json.status ?? null,
          lastSyncAt: json.lastSyncAt ?? null,
          callsUsedToday: json.callsUsedToday ?? null,
          loading: false,
          error: null,
        })
      } catch (err) {
        if (!alive) return
        setData((d) => ({
          ...d,
          loading: false,
          error: (err as Error).message,
        }))
      } finally {
        if (alive) timer = setTimeout(tick, pollMs)
      }
    }

    tick()
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
    }
  }, [appId, pollMs])

  return data
}
