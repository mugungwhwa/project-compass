/**
 * Mock Connections — 4-silo 통합 hub
 *
 *  · MMP (어트리뷰션 / UA): AppsFlyer, Adjust
 *  · Experimentation (실험): Statsig, Firebase
 *  · Financial (재무): QuickBooks, 수동 입력
 *  · Market Intelligence (시장 정보): 공개 벤치마크
 *
 *  PR 1에서는 AppsFlyer 카드만 mock connected 상태. 나머지는 silo placeholder.
 *  실제 동작은 PR 2-4에서 단계적 활성화.
 */

export type ConnectionStatus = "connected" | "warn" | "error" | "disconnected"

export type ConnectionCategory = "mmp" | "experimentation" | "financial" | "market"

export type ConnectionMetric = { label: string; value: string }

export type Connection = {
  id: string
  brand: string
  category: ConnectionCategory
  description: string
  status: ConnectionStatus
  lastSync?: string
  metrics?: ConnectionMetric[]
  /** Optional — kept for forward compat with treenod patterns, unused in PR 1 UI */
  initials?: string
  brandColor?: string
}

export const CATEGORY_LABEL: Record<ConnectionCategory, string> = {
  mmp: "MMP — 어트리뷰션 / UA",
  experimentation: "실험 — A/B 테스트",
  financial: "재무 — 회계 / 매출",
  market: "시장 인텔리전스",
}

export const CATEGORY_ORDER: ConnectionCategory[] = [
  "mmp",
  "experimentation",
  "financial",
  "market",
]

export const mockConnections: Connection[] = [
  {
    id: "appsflyer",
    brand: "AppsFlyer",
    category: "mmp",
    description: "어트리뷰션 데이터 — Pull API로 cohort 리텐션·CPI·ROAS 수집.",
    status: "connected",
    lastSync: "방금 전",
    metrics: [
      { label: "CPI", value: "$0.84" },
      { label: "Installs", value: "1.7M" },
    ],
  },
]
