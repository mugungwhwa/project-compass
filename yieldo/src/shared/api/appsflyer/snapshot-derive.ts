import type { AppState, CohortSummary } from "./types"

export type AppsFlyerCardData = {
  status: AppState["status"]
  lastSyncRelative: string
  installsCount: number
  costFormatted: string
  revenueFormatted: string
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / 86_400_000)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  return `${days}d ago`
}

export function deriveCardData(
  state: AppState,
  summary: CohortSummary | null,
): AppsFlyerCardData {
  const installsCount = summary?.cohorts.reduce((s, c) => s + c.installs, 0) ?? 0
  const revenue = summary?.revenue.total.sumUsd ?? 0
  return {
    status: state.status,
    lastSyncRelative: state.lastSyncAt ? formatRelative(state.lastSyncAt) : "—",
    installsCount,
    costFormatted: "—",
    revenueFormatted: revenue > 0 ? `$${revenue.toFixed(2)}` : "—",
  }
}
