/**
 * Static fixture data for landing page widget embeds.
 * These are frozen snapshots — independent of any real hook or live fetch.
 * All types mirror @/shared/api/mock-data exactly.
 */

import type {
  SignalStatus,
  RetentionDataPoint,
  RevenueVsInvestPoint,
  RevenueForecastPoint,
  RevenueForecastMeta,
} from "@/shared/api/mock-data"

// ─── HeroVerdict / SignalCard ────────────────────────────────────────────────

export const FIXTURE_SIGNAL = {
  status: "invest" as SignalStatus,
  confidence: 82,
  reason: {
    ko: "D7 리텐션 장르 상위 25%, 페이백 안정적 단축 중",
    en: "D7 retention in genre top 25%, stable payback reduction",
  },
  factors: [
    { status: "ok" as const, text: { ko: "리텐션 장르 벤치마크 P75 이상", en: "Retention above P75 genre benchmark" } },
    { status: "ok" as const, text: { ko: "페이백 D47 예상 (목표: D60)", en: "Payback projected D47 (target: D60)" } },
    { status: "warn" as const, text: { ko: "CPI 전월 대비 +8% 상승 추세", en: "CPI trending up +8% MoM" } },
    { status: "ok" as const, text: { ko: "실험 속도: 월 3.2건 성공", en: "Experiment velocity: 3.2 wins/month" } },
  ],
  payback: { p10: 38, p50: 47, p90: 62 },
  nextAction: {
    ko: "Reward Calendar 실험을 50% 트래픽으로 확대 — 예상 효과: 연 +$120K 매출",
    en: "Scale Reward Calendar experiment to 50% traffic — Expected: +$120K annualized revenue",
  },
  impact: {
    value: { ko: "+$120K ARR", en: "+$120K ARR" },
    direction: "positive" as const,
  },
}

// ─── RetentionCurve ──────────────────────────────────────────────────────────

export const FIXTURE_RETENTION_DATA: RetentionDataPoint[] = [
  { day: 1,  p10: 38, p25: 40, p50: 42.3, p75: 45, p90: 47, genre: 34.1 },
  { day: 2,  p10: 28, p25: 30, p50: 33.1, p75: 36, p90: 38, genre: 26.5 },
  { day: 3,  p10: 22, p25: 25, p50: 27.8, p75: 30, p90: 33, genre: 22.0 },
  { day: 5,  p10: 17, p25: 19, p50: 22.4, p75: 25, p90: 28, genre: 17.8 },
  { day: 7,  p10: 14, p25: 16, p50: 18.7, p75: 21, p90: 23, genre: 14.2 },
  { day: 14, p10: 9,  p25: 11, p50: 13.2, p75: 15, p90: 17, genre: 9.8  },
  { day: 21, p10: 7,  p25: 9,  p50: 10.8, p75: 13, p90: 15, genre: 8.0  },
  { day: 30, p10: 5,  p25: 7,  p50: 8.5,  p75: 10, p90: 12, genre: 6.4  },
  { day: 45, p10: 4,  p25: 5.5,p50: 7.2,  p75: 9,  p90: 10.5,genre: 5.1 },
  { day: 60, p10: 3,  p25: 5,  p50: 6.1,  p75: 8,  p90: 9,  genre: 4.2  },
]

export const FIXTURE_ASYMPTOTIC_DAY = 30

// ─── RevenueVsInvest ─────────────────────────────────────────────────────────

export const FIXTURE_REVENUE_VS_INVEST: RevenueVsInvestPoint[] = [
  { month: "Jul",  revenue: 28,  uaSpend: 95,  cumRevenue: 28,   cumUaSpend: 95,   roas: 29  },
  { month: "Aug",  revenue: 45,  uaSpend: 88,  cumRevenue: 73,   cumUaSpend: 183,  roas: 40  },
  { month: "Sep",  revenue: 62,  uaSpend: 80,  cumRevenue: 135,  cumUaSpend: 263,  roas: 51  },
  { month: "Oct",  revenue: 78,  uaSpend: 72,  cumRevenue: 213,  cumUaSpend: 335,  roas: 64  },
  { month: "Nov",  revenue: 92,  uaSpend: 68,  cumRevenue: 305,  cumUaSpend: 403,  roas: 76  },
  { month: "Dec",  revenue: 105, uaSpend: 65,  cumRevenue: 410,  cumUaSpend: 468,  roas: 88  },
  { month: "Jan",  revenue: 112, uaSpend: 60,  cumRevenue: 522,  cumUaSpend: 528,  roas: 99  },
  { month: "Feb",  revenue: 118, uaSpend: 58,  cumRevenue: 640,  cumUaSpend: 586,  roas: 109 },
  { month: "Mar",  revenue: 125, uaSpend: 62,  cumRevenue: 765,  cumUaSpend: 648,  roas: 118 },
  { month: "Apr",  revenue: 132, uaSpend: 60,  cumRevenue: 897,  cumUaSpend: 708,  roas: 127 },
]

// ─── RevenueForecast ─────────────────────────────────────────────────────────

export const FIXTURE_REVENUE_FORECAST: RevenueForecastPoint[] = [
  { month: "Jan", p10: 95,  p50: 105, p90: 115,  priorP10: 70,  priorP50: 100, priorP90: 135 },
  { month: "Feb", p10: 90,  p50: 110, p90: 130,  priorP10: 60,  priorP50: 102, priorP90: 160 },
  { month: "Mar", p10: 88,  p50: 118, p90: 148,  priorP10: 52,  priorP50: 105, priorP90: 185 },
  { month: "Apr", p10: 82,  p50: 120, p90: 165,  priorP10: 45,  priorP50: 108, priorP90: 215 },
  { month: "May", p10: 75,  p50: 135, p90: 200,  priorP10: 38,  priorP50: 112, priorP90: 260 },
  { month: "Jun", p10: 65,  p50: 148, p90: 240,  priorP10: 32,  priorP50: 118, priorP90: 310 },
  { month: "Jul", p10: 58,  p50: 155, p90: 270,  priorP10: 26,  priorP50: 122, priorP90: 360 },
  { month: "Aug", p10: 50,  p50: 162, p90: 300,  priorP10: 22,  priorP50: 128, priorP90: 410 },
  { month: "Sep", p10: 45,  p50: 168, p90: 325,  priorP10: 18,  priorP50: 132, priorP90: 455 },
  { month: "Oct", p10: 40,  p50: 175, p90: 350,  priorP10: 15,  priorP50: 138, priorP90: 495 },
  { month: "Nov", p10: 35,  p50: 180, p90: 370,  priorP10: 12,  priorP50: 142, priorP90: 525 },
  { month: "Dec", p10: 32,  p50: 185, p90: 390,  priorP10: 10,  priorP50: 145, priorP90: 555 },
]

export const FIXTURE_REVENUE_FORECAST_META: RevenueForecastMeta = {
  asOfDay: 14,
  cohortCount: 12,
  priorNarrowingPct: 42,
  experiments: [
    {
      id: "E-247",
      name: { ko: "Reward Calendar", en: "Reward Calendar" },
      deltaLtvPerUser: 1.9,
      annualRevenueLift: 142,
      shipMonth: "Apr",
      forkP50: [null, null, null, 126, 140, 155, 162, 170, 176, 183, 188, 193],
    },
  ],
}
