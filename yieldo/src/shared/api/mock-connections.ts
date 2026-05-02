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
 *
 * 메타: brand 색상은 official palette 근사값. initials는 카드 좌측 chip에 표시.
 */
export const AVAILABLE_CONNECTORS: Array<
  Pick<Connection, "id" | "brand" | "category" | "description" | "initials" | "brandColor">
> = [
  // MMP — Silo 2 (Attribution & UA)
  {
    id: "appsflyer",
    brand: "AppsFlyer",
    category: "mmp",
    description: "어트리뷰션 데이터 — Pull API로 cohort 리텐션·CPI·ROAS 수집.",
    initials: "AF",
    brandColor: "#00B2E5",
  },
  {
    id: "adjust",
    brand: "Adjust",
    category: "mmp",
    description: "어트리뷰션 데이터 — Report Service API로 D120 long-term cohort 수집.",
    initials: "AJ",
    brandColor: "#1B26EB",
  },
  {
    id: "singular",
    brand: "Singular",
    category: "mmp",
    description: "통합 어트리뷰션 + cost aggregation — Reporting API로 채널별 ROAS·incrementality 수집.",
    initials: "SG",
    brandColor: "#FF7B18",
  },
  // Experimentation — Silo 3 (A/B Testing & Feature Flags)
  {
    id: "statsig",
    brand: "Statsig",
    category: "experimentation",
    description: "A/B 실험 + feature flag. Console API로 ATE·confidence interval·rollout 상태 수집.",
    initials: "ST",
    brandColor: "#194F86",
  },
  {
    id: "firebase",
    brand: "Firebase",
    category: "experimentation",
    description: "Remote Config + A/B Testing. BigQuery Connector로 실험 결과·이벤트 stream 수집.",
    initials: "FB",
    brandColor: "#FFA000",
  },
  {
    id: "optimizely",
    brand: "Optimizely",
    category: "experimentation",
    description: "Feature experimentation 플랫폼. Results API로 ATE·variant 성능 metric 수집.",
    initials: "OP",
    brandColor: "#0037FF",
  },
  // Financial — Silo 4 (Revenue & Capital)
  {
    id: "manual-financial",
    brand: "재무 직접 입력",
    category: "financial",
    description: "월 매출 · UA 지출 · 현금 잔고 · 월 burn · 목표 payback — 5개 지표 수동 입력 (Visible.vc 모델).",
    initials: "재",
    brandColor: "#6B7280",
  },
  {
    id: "quickbooks",
    brand: "QuickBooks",
    category: "financial",
    description: "회계 자동 동기화 — 매출·비용·현금흐름·부채 OAuth로 pull. Tier 3 (Phase 3+).",
    initials: "QB",
    brandColor: "#2CA01C",
  },
  {
    id: "xero",
    brand: "Xero",
    category: "financial",
    description: "글로벌 회계 SaaS — APAC 게임 회사 표준. P&L · 현금잔고 · 게임별 cost 자동 import.",
    initials: "XR",
    brandColor: "#13B5EA",
  },
  // Market Intelligence — Silo 1 (External)
  {
    id: "gameanalytics",
    brand: "GameAnalytics",
    category: "market",
    description: "공개 벤치마크 데이터 — 장르별 D1/D7/D28 P10/P50/P90 prior 구성에 사용.",
    initials: "GA",
    brandColor: "#F39C12",
  },
  {
    id: "sensortower",
    brand: "Sensor Tower",
    category: "market",
    description: "App intelligence — download · revenue 추정치 + 경쟁 타이틀 ad creative. Phase 3 partnership.",
    initials: "SN",
    brandColor: "#2563EB",
  },
  {
    id: "appmagic",
    brand: "AppMagic",
    category: "market",
    description: "Mobile gaming 특화 시장 데이터 — genre/category 전문 큐레이션. Phase 3 partnership.",
    initials: "AM",
    brandColor: "#7C3AED",
  },
]
