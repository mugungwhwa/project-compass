/**
 * Connection types + 4-silo metadata.
 *
 *  · MMP (어트리뷰션 / UA): AppsFlyer, (후속) Adjust
 *  · Experimentation (실험): (후속) Statsig, Firebase
 *  · Financial (재무): (후속) QuickBooks, 수동 입력
 *  · Market Intelligence (시장 정보): (후속) 공개 벤치마크
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
  /** Optional — forward compat fields, unused in current UI */
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

/**
 * 등록 가능한 connector 카탈로그 — silo별 placeholder 카드 렌더에 사용.
 * 등록 상태(`status`)는 ConnectionsClient에서 /api/appsflyer/apps 응답으로 결정.
 */
export const AVAILABLE_CONNECTORS: Array<
  Pick<Connection, "id" | "brand" | "category" | "description">
> = [
  {
    id: "appsflyer",
    brand: "AppsFlyer",
    category: "mmp",
    description: "어트리뷰션 데이터 — Pull API로 cohort 리텐션·CPI·ROAS 수집.",
  },
  {
    id: "adjust",
    brand: "Adjust",
    category: "mmp",
    description: "Mobile attribution & marketing analytics. Report Service API로 D120 long-term cohort 수집.",
  },
  {
    id: "statsig",
    brand: "Statsig",
    category: "experimentation",
    description: "A/B 실험 + feature flag. Console API로 ATE·confidence interval·rollout 상태 수집.",
  },
  {
    id: "manual-financial",
    brand: "재무 직접 입력",
    category: "financial",
    description: "월 매출 · UA 지출 · 현금 잔고 · 월 burn · 목표 payback — 5개 지표 수동 입력 (Visible.vc 모델).",
  },
  {
    id: "gameanalytics",
    brand: "GameAnalytics",
    category: "market",
    description: "공개 벤치마크 데이터 — 장르별 D1/D7/D28 P10/P50/P90 prior 구성에 사용.",
  },
]
