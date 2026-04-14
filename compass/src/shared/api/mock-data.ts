export type SignalStatus = "invest" | "hold" | "reduce"

export type RetentionDataPoint = {
  day: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  genre: number
}

export type KPIData = {
  value: number
  unit: string
  trend: number
  trendLabel: string
}

export type ExperimentData = {
  id: number
  name: string
  ate: number
  deltaLtv: number
  annualRevenue: number
  roi: number
  status: "shipped" | "running" | "reverted"
  decision: "win" | "lose" | "pending"
}

export type ExperimentVariant = {
  id: string
  experimentId: number
  name: string
  description: string
  ltv_delta: number
  ltv_ci_low: number
  ltv_ci_high: number
  sample_size: number
  status: "control" | "winner" | "loser" | "shipped" | "reverted"
  shipped_at?: string
  reverted_at?: string
  rollout_history: { date: string; percentage: number; cumulative_ltv: number }[]
}

export type RippleForecast = {
  variantId: string
  stages: {
    percentage: number
    predicted_ltv_lift: number
    ci_low: number
    ci_high: number
    days_to_observe: number
  }[]
}

export type ActionData = {
  date: string
  type: "ua" | "liveops" | "release"
  description: string
  deltaLtv: number
  confidence: number
}

export type CompetitorData = {
  rank: number
  name: string
  d1: number
  d7: number
  d30: number
  revenue: string
}

export type BudgetSlice = {
  name: string
  value: number
  color: string
}

export type RevenueForecastPoint = {
  month: string
  // Posterior (현재 기준선) — D{asOf} 관측치가 반영된 사후분포
  p10: number
  p50: number
  p90: number
  // Prior (장르 벤치마크만으로 만든 사전분포) — 내부 데이터 없을 때의 불확실성
  priorP10: number
  priorP50: number
  priorP90: number
}

export type ExperimentForkScenario = {
  id: string                           // e.g. "E-247"
  name: { ko: string; en: string }
  deltaLtvPerUser: number              // $ per user
  annualRevenueLift: number            // $K annualized lift on P50
  shipMonth: string                    // month label at which fork begins
  // Per-month P50 override starting at shipMonth. Pre-ship months are null.
  forkP50: Array<number | null>
}

export type RevenueForecastMeta = {
  asOfDay: number                      // observation day (e.g. 14)
  cohortCount: number                  // number of cohorts informing posterior
  priorNarrowingPct: number            // how much posterior band narrowed vs prior (e.g. 42 → 42%)
  experiments: ExperimentForkScenario[]
}

export type ScenarioResult = {
  uaBudget: number
  paybackDays: number
  bepProbability: number
  monthlyRevenue: number
}

export const mockRetention = {
  gameId: "match-league",
  gameName: "Match League",
  cohort: "2026-03",
  genre: "Puzzle",
  data: [
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
  ] as RetentionDataPoint[],
  asymptoticDay: 30,
}

export const mockSignal = {
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

export const mockFinancialHealth = {
  burnTolerance: { value: 8.2, max: 18, color: "#D97706" },
  netRunway: { value: 14.5, max: 18, color: "#16A34A" },
  kpis: { capEfficiency: 0.72, revPerSpend: 2.4, netBurn: -28 },
  paybackDay: 47,
  runwayEndDay: 246,
}

// --- Revenue Decomposition (Experiment Investment Board) ---

export type RevenueDecompPoint = {
  month: string
  organic: number      // baseline revenue without experiments ($K)
  experiment: number   // revenue uplift from shipped experiments ($K)
  total: number        // organic + experiment
  expShipped: number   // experiments deployed this month
}

export type DecompStats = {
  totalExp: number
  shipRate: number
  avgDays: number
  cumDeltaLtv: number
  winRate: number
  expRoi: number
  organicQoQ: number
}

// --- Revenue vs Investment (Executive Overview main chart) ---

export type RevenueVsInvestPoint = {
  month: string
  revenue: number
  uaSpend: number
  cumRevenue: number
  cumUaSpend: number
  roas: number
}

export const mockRevenueVsInvest: RevenueVsInvestPoint[] = [
  // Realistic mobile game trajectory: heavy UA → gradual monetization → BEP ~month 7-8
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

export const mockRevenueDecomp: RevenueDecompPoint[] = [
  { month: "Jul",  organic: 28, experiment: 0,  total: 28,  expShipped: 0 },
  { month: "Aug",  organic: 30, experiment: 15, total: 45,  expShipped: 1 },
  { month: "Sep",  organic: 34, experiment: 28, total: 62,  expShipped: 1 },
  { month: "Oct",  organic: 38, experiment: 40, total: 78,  expShipped: 2 },
  { month: "Nov",  organic: 42, experiment: 50, total: 92,  expShipped: 2 },
  { month: "Dec",  organic: 46, experiment: 59, total: 105, expShipped: 3 },
  { month: "Jan",  organic: 48, experiment: 64, total: 112, expShipped: 2 },
  { month: "Feb",  organic: 50, experiment: 68, total: 118, expShipped: 3 },
  { month: "Mar",  organic: 52, experiment: 73, total: 125, expShipped: 2 },
  { month: "Apr",  organic: 54, experiment: 78, total: 132, expShipped: 3 },
]

export const mockDecompStats: DecompStats = {
  totalExp: 12,
  shipRate: 68,
  avgDays: 9,
  cumDeltaLtv: 1.2,
  winRate: 41,
  expRoi: 3.8,
  organicQoQ: 8,
}

export const mockKPIs = {
  payback:  { value: 47,   unit: "days",   trend: -12,  trendLabel: "faster" },
  roas:     { value: 142,  unit: "%",      trend: 8.3,  trendLabel: "up" },
  bep:      { value: 87,   unit: "%",      trend: 3.1,  trendLabel: "up" },
  burn:     { value: 8.2,  unit: "months", trend: 0.5,  trendLabel: "up" },
}

export const mockRevenueForecast: RevenueForecastPoint[] = [
  // Posterior (D14 관측 반영) + Prior (장르 벤치마크, ~1.8x 더 넓음, 약간 아래 센터)
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

export const mockMarketKPIs = {
  genreRank:  { value: 3,    unit: "#",  trend: 1,    trendLabel: "up" },
  d7vsAvg:    { value: 4.5,  unit: "pp", trend: 0.8,  trendLabel: "up" },
  revenueGap: { value: -26,  unit: "M",  trend: 5,    trendLabel: "narrowing" },
}

export const mockCompetitors: CompetitorData[] = [
  { rank: 1,  name: "Candy Crush Saga",    d1: 45.2, d7: 22.1, d30: 12.3, revenue: "$45M" },
  { rank: 2,  name: "Royal Match",         d1: 43.8, d7: 20.5, d30: 11.1, revenue: "$38M" },
  { rank: 3,  name: "Match League",        d1: 42.3, d7: 18.7, d30: 8.5,  revenue: "$12M" },
  { rank: 4,  name: "Homescapes",          d1: 40.1, d7: 17.3, d30: 7.8,  revenue: "$28M" },
  { rank: 5,  name: "Gardenscapes",        d1: 39.5, d7: 16.8, d30: 7.2,  revenue: "$25M" },
  { rank: 6,  name: "Toon Blast",          d1: 38.2, d7: 15.9, d30: 6.5,  revenue: "$20M" },
  { rank: 7,  name: "Lily's Garden",       d1: 36.8, d7: 14.5, d30: 5.8,  revenue: "$15M" },
  { rank: 8,  name: "Township",            d1: 35.1, d7: 13.8, d30: 5.2,  revenue: "$18M" },
  { rank: 9,  name: "Fishdom",             d1: 33.5, d7: 12.6, d30: 4.5,  revenue: "$10M" },
  { rank: 10, name: "Merge Mansion",       d1: 32.0, d7: 11.9, d30: 4.1,  revenue: "$22M" },
]

export const mockSaturation = [
  { metric: "Downloads",  myGame: 72, genreAvg: 58 },
  { metric: "Revenue",    myGame: 45, genreAvg: 62 },
  { metric: "D7 Ret.",    myGame: 82, genreAvg: 65 },
  { metric: "D30 Ret.",   myGame: 68, genreAvg: 55 },
  { metric: "ARPDAU",     myGame: 55, genreAvg: 48 },
]

export const mockActionKPIs = {
  totalActions: { value: 12,   unit: "",     trend: 3,    trendLabel: "up" },
  avgImpact:    { value: 1.88, unit: "ΔLTV", trend: 0.32, trendLabel: "up" },
  bestAction:   { value: 3.4,  unit: "ΔLTV", trend: 0,    trendLabel: "v2.3 Release" },
}

export const mockActions: ActionData[] = [
  { date: "2026-01-10", type: "ua",       description: "Facebook Lookalike v2",       deltaLtv: 0.9,  confidence: 72 },
  { date: "2026-01-25", type: "liveops",   description: "Lunar New Year event",        deltaLtv: 1.8,  confidence: 80 },
  { date: "2026-02-05", type: "release",   description: "v2.1 — UI refresh",           deltaLtv: 1.2,  confidence: 68 },
  { date: "2026-02-14", type: "ua",       description: "Valentine's push campaign",   deltaLtv: 0.5,  confidence: 55 },
  { date: "2026-02-28", type: "liveops",   description: "Weekend bonus event",         deltaLtv: 1.5,  confidence: 82 },
  { date: "2026-03-01", type: "ua",       description: "TikTok campaign launch",      deltaLtv: 1.2,  confidence: 78 },
  { date: "2026-03-08", type: "liveops",   description: "Spring event start",          deltaLtv: 2.1,  confidence: 85 },
  { date: "2026-03-15", type: "release",   description: "v2.3 — new dungeon system",   deltaLtv: 3.4,  confidence: 72 },
  { date: "2026-03-22", type: "ua",       description: "Meta Advantage+ scaling",     deltaLtv: 0.8,  confidence: 65 },
  { date: "2026-03-28", type: "liveops",   description: "Cherry blossom mini-event",   deltaLtv: 1.6,  confidence: 77 },
  { date: "2026-04-01", type: "release",   description: "v2.4 — guild system",         deltaLtv: 2.8,  confidence: 60 },
  { date: "2026-04-05", type: "ua",       description: "Google UAC re-optimization",  deltaLtv: 1.1,  confidence: 70 },
]

export const mockRetentionTrend = [
  { date: "2026-01-01", retention: 16.2 },
  { date: "2026-01-10", retention: 16.5 },
  { date: "2026-01-25", retention: 17.8 },
  { date: "2026-02-05", retention: 18.2 },
  { date: "2026-02-14", retention: 18.0 },
  { date: "2026-02-28", retention: 18.5 },
  { date: "2026-03-01", retention: 18.7 },
  { date: "2026-03-08", retention: 19.2 },
  { date: "2026-03-15", retention: 20.5 },
  { date: "2026-03-22", retention: 20.8 },
  { date: "2026-03-28", retention: 21.2 },
  { date: "2026-04-01", retention: 22.0 },
  { date: "2026-04-05", retention: 22.3 },
]

export const mockExperimentKPIs = {
  velocity:    { value: 4.2, unit: "/mo",  trend: 0.8,  trendLabel: "up" },
  shipRate:    { value: 68,  unit: "%",    trend: 5,    trendLabel: "up" },
  winRate:     { value: 42,  unit: "%",    trend: -3,   trendLabel: "down" },
  cumDeltaLtv: { value: 4.2, unit: "$",    trend: 1.9,  trendLabel: "up" },
}

export const mockExperiments: ExperimentData[] = [
  { id: 1, name: "Tutorial Redesign",      ate: 3.7,  deltaLtv: 2.4,  annualRevenue: 180000,  roi: 450, status: "shipped",  decision: "win" },
  { id: 2, name: "IAP Price Test A",       ate: -1.2, deltaLtv: -0.8, annualRevenue: -60000,  roi: -150, status: "reverted", decision: "lose" },
  { id: 3, name: "Push Notification v2",   ate: 1.1,  deltaLtv: 0.7,  annualRevenue: 52000,   roi: 260, status: "shipped",  decision: "win" },
  { id: 4, name: "Reward Calendar",        ate: 2.8,  deltaLtv: 1.9,  annualRevenue: 142000,  roi: 710, status: "running",  decision: "pending" },
  { id: 5, name: "Social Share Bonus",     ate: 0.3,  deltaLtv: 0.2,  annualRevenue: 15000,   roi: 75,  status: "shipped",  decision: "win" },
  { id: 6, name: "Energy System Rework",   ate: -0.5, deltaLtv: -0.3, annualRevenue: -22000,  roi: -55, status: "reverted", decision: "lose" },
  { id: 7, name: "Daily Quest Chain",      ate: 1.8,  deltaLtv: 1.2,  annualRevenue: 90000,   roi: 360, status: "running",  decision: "pending" },
  { id: 8, name: "Onboarding Flow B",      ate: 0.9,  deltaLtv: 0.6,  annualRevenue: 45000,   roi: 225, status: "shipped",  decision: "win" },
]

export const mockExperimentVariants: ExperimentVariant[] = [
  // Experiment 1: Tutorial Redesign (shipped winner, fully rolled out)
  {
    id: "exp1-control",
    experimentId: 1,
    name: "Control — Legacy tutorial",
    description: "Original 5-step tutorial with forced progression",
    ltv_delta: 0,
    ltv_ci_low: 0,
    ltv_ci_high: 0,
    sample_size: 48200,
    status: "control",
    rollout_history: [],
  },
  {
    id: "exp1-v1",
    experimentId: 1,
    name: "V1 — Skippable steps",
    description: "Made steps 3-5 skippable; kept narrative intact",
    ltv_delta: 0.9,
    ltv_ci_low: 0.3,
    ltv_ci_high: 1.5,
    sample_size: 24100,
    status: "loser",
    rollout_history: [],
  },
  {
    id: "exp1-v2",
    experimentId: 1,
    name: "V2 — Contextual tutorial",
    description: "Just-in-time hints triggered by player actions",
    ltv_delta: 2.4,
    ltv_ci_low: 1.7,
    ltv_ci_high: 3.2,
    sample_size: 24050,
    status: "shipped",
    shipped_at: "2026-02-18",
    rollout_history: [
      { date: "2026-02-18", percentage: 5,   cumulative_ltv: 3200 },
      { date: "2026-02-22", percentage: 15,  cumulative_ltv: 11800 },
      { date: "2026-03-01", percentage: 35,  cumulative_ltv: 32400 },
      { date: "2026-03-10", percentage: 60,  cumulative_ltv: 71200 },
      { date: "2026-03-18", percentage: 100, cumulative_ltv: 142800 },
    ],
  },
  // Experiment 2: IAP Price Test A (reverted loser)
  {
    id: "exp2-control",
    experimentId: 2,
    name: "Control — $4.99 starter pack",
    description: "Baseline starter pack pricing",
    ltv_delta: 0,
    ltv_ci_low: 0,
    ltv_ci_high: 0,
    sample_size: 31200,
    status: "control",
    rollout_history: [],
  },
  {
    id: "exp2-v1",
    experimentId: 2,
    name: "V1 — $5.99 starter pack",
    description: "20% price increase on starter pack",
    ltv_delta: -0.8,
    ltv_ci_low: -1.4,
    ltv_ci_high: -0.2,
    sample_size: 15600,
    status: "reverted",
    shipped_at: "2026-01-20",
    reverted_at: "2026-02-03",
    rollout_history: [
      { date: "2026-01-20", percentage: 5,  cumulative_ltv: -1800 },
      { date: "2026-01-25", percentage: 15, cumulative_ltv: -8400 },
      { date: "2026-02-01", percentage: 25, cumulative_ltv: -22100 },
      { date: "2026-02-03", percentage: 0,  cumulative_ltv: -22100 },
    ],
  },
  {
    id: "exp2-v2",
    experimentId: 2,
    name: "V2 — $6.99 premium pack",
    description: "New premium-tier pack, control unchanged",
    ltv_delta: -0.4,
    ltv_ci_low: -1.1,
    ltv_ci_high: 0.3,
    sample_size: 15450,
    status: "loser",
    rollout_history: [],
  },
  // Experiment 4: Reward Calendar (running, partial rollout)
  {
    id: "exp4-control",
    experimentId: 4,
    name: "Control — Daily login bonus",
    description: "Flat daily login reward",
    ltv_delta: 0,
    ltv_ci_low: 0,
    ltv_ci_high: 0,
    sample_size: 22800,
    status: "control",
    rollout_history: [],
  },
  {
    id: "exp4-v1",
    experimentId: 4,
    name: "V1 — 7-day calendar",
    description: "7-day escalating reward calendar with reset",
    ltv_delta: 1.2,
    ltv_ci_low: 0.6,
    ltv_ci_high: 1.9,
    sample_size: 11400,
    status: "loser",
    rollout_history: [],
  },
  {
    id: "exp4-v2",
    experimentId: 4,
    name: "V2 — 30-day milestone calendar",
    description: "30-day milestone calendar with monthly grand prize",
    ltv_delta: 1.9,
    ltv_ci_low: 1.1,
    ltv_ci_high: 2.8,
    sample_size: 11300,
    status: "winner",
    shipped_at: "2026-03-25",
    rollout_history: [
      { date: "2026-03-25", percentage: 5,  cumulative_ltv: 4100 },
      { date: "2026-03-30", percentage: 15, cumulative_ltv: 14200 },
      { date: "2026-04-03", percentage: 25, cumulative_ltv: 26800 },
    ],
  },
]

export const mockRippleForecasts: RippleForecast[] = [
  {
    variantId: "exp1-v2",
    stages: [
      { percentage: 5,   predicted_ltv_lift: 3200,   ci_low: 1800,   ci_high: 4900,   days_to_observe: 7 },
      { percentage: 25,  predicted_ltv_lift: 18400,  ci_low: 11200,  ci_high: 27800,  days_to_observe: 14 },
      { percentage: 50,  predicted_ltv_lift: 42100,  ci_low: 28600,  ci_high: 59200,  days_to_observe: 21 },
      { percentage: 100, predicted_ltv_lift: 142800, ci_low: 98400,  ci_high: 198600, days_to_observe: 30 },
    ],
  },
  {
    variantId: "exp2-v1",
    stages: [
      { percentage: 5,   predicted_ltv_lift: -1800,  ci_low: -3200,  ci_high: -600,   days_to_observe: 7 },
      { percentage: 25,  predicted_ltv_lift: -22100, ci_low: -34800, ci_high: -11400, days_to_observe: 14 },
      { percentage: 50,  predicted_ltv_lift: -48200, ci_low: -72600, ci_high: -26100, days_to_observe: 21 },
      { percentage: 100, predicted_ltv_lift: -98400, ci_low: -148200, ci_high: -54800, days_to_observe: 30 },
    ],
  },
  {
    variantId: "exp4-v2",
    stages: [
      { percentage: 5,   predicted_ltv_lift: 4100,   ci_low: 2200,   ci_high: 6800,   days_to_observe: 7 },
      { percentage: 25,  predicted_ltv_lift: 26800,  ci_low: 15400,  ci_high: 42100,  days_to_observe: 14 },
      { percentage: 50,  predicted_ltv_lift: 58200,  ci_low: 36400,  ci_high: 86800,  days_to_observe: 21 },
      { percentage: 100, predicted_ltv_lift: 142000, ci_low: 88600,  ci_high: 212400, days_to_observe: 30 },
    ],
  },
]

// --- Overview 2.0: Portfolio-level types & data ---

export type MarketContext = {
  genreGrowth: { value: number; unit: string; trend: "up" | "down" | "stable" }
  competitiveIntensity: { level: "rising" | "stable" | "falling"; newEntrants: number }
  cpiEnvironment: { channels: { name: string; momChange: number }[] }
  seasonality: { phase: string; description: { ko: string; en: string } }
  aiSummary: { ko: string; en: string }
}

export type CapitalWaterfallStep = {
  label: { ko: string; en: string }
  value: number
  type: "inflow" | "outflow" | "net"
}

export type TitleHealthRow = {
  gameId: string
  label: string
  genre: string
  signal: SignalStatus
  confidence: number
  paybackD: number
  roas: number
  retentionTrend: "improving" | "stable" | "declining"
}

export type DataFreshness = {
  lastSync: { minutesAgo: number }
  sourceCoverage: { connected: number; total: number; sources: string[] }
  signalQuality: "high" | "medium" | "low"
  anomalies: { message: { ko: string; en: string }; severity: "info" | "warn" | "critical" }[]
  modelConvergence: number
}

export const mockMarketContext: MarketContext = {
  genreGrowth: { value: 12, unit: "% YoY", trend: "up" },
  competitiveIntensity: { level: "rising", newEntrants: 2 },
  cpiEnvironment: {
    channels: [
      { name: "Meta", momChange: 8 },
      { name: "Google", momChange: 5 },
      { name: "TikTok", momChange: -2 },
    ],
  },
  seasonality: {
    phase: "Q2",
    description: { ko: "Q2 피크 진입 중", en: "Q2 peak entering" },
  },
  aiSummary: {
    ko: "시장은 성장 중이나 UA 비용 상승 주의",
    en: "Market growing but rising UA costs need attention",
  },
}

export const mockTitleHealth: TitleHealthRow[] = [
  { gameId: "match-league",  label: "Match League",  genre: "Puzzle",        signal: "invest", confidence: 82, paybackD: 47,  roas: 142, retentionTrend: "improving" },
  { gameId: "weaving-fairy", label: "Weaving Fairy", genre: "Casual",        signal: "hold",   confidence: 65, paybackD: 72,  roas: 96,  retentionTrend: "stable"    },
  { gameId: "dig-infinity",  label: "Dig Infinity",  genre: "Arcade / Idle", signal: "reduce", confidence: 58, paybackD: 104, roas: 72,  retentionTrend: "declining" },
]

export const mockCapitalWaterfall: CapitalWaterfallStep[] = [
  { label: { ko: "초기 자본",   en: "Initial Capital" },   value: 2400, type: "inflow"  },
  { label: { ko: "추가 투입",   en: "Follow-on" },         value: 600,  type: "inflow"  },
  { label: { ko: "UA 비용",    en: "UA Spend" },           value: -1420, type: "outflow" },
  { label: { ko: "개발비",     en: "Dev Cost" },            value: -480,  type: "outflow" },
  { label: { ko: "운영비",     en: "Ops Cost" },            value: -320,  type: "outflow" },
  { label: { ko: "누적 매출",   en: "Cum. Revenue" },       value: 1860, type: "inflow"  },
  { label: { ko: "순 포지션",   en: "Net Position" },       value: 640,  type: "net"     },
]

export const mockPortfolioKPIs = {
  blendedRoas:    { value: 148,  unit: "%",   trend: 6.2,  trendLabel: "up" },
  deployPace:     { value: 82,   unit: "$K/mo", trend: -5, trendLabel: "down" },
  portfolioMoic:  { value: 1.27, unit: "x",   trend: 0.08, trendLabel: "up" },
  fundDpi:        { value: 0.62, unit: "x",   trend: 0.05, trendLabel: "up" },
  expVelocity:    { value: 4.2,  unit: "/mo", trend: 0.8,  trendLabel: "up" },
  marketTiming:   { value: 72,   unit: "pts", trend: 3,    trendLabel: "up" },
}

export const mockPortfolioSignal = {
  status: "invest" as SignalStatus,
  confidence: 78,
  reason: {
    ko: "포트폴리오 MOIC 1.27x — Match League 1개 타이틀이 투자 시그널을 견인 (나머지 2개는 유지·축소)",
    en: "Portfolio MOIC 1.27x — driven by Match League (1 of 3 titles signaling scale; 2 others hold/reduce)",
  },
  recommendation: {
    ko: "Match League에 UA 예산 60%를 재배분하세요 (+$45K/월)",
    en: "Reallocate 60% of UA budget (+$45K/mo) to Match League",
  },
  rationale: {
    ko: "포트폴리오 유일의 투자 확대 시그널",
    en: "Only title signaling scale investment",
  },
  payback: { p10: 35, p50: 44, p90: 58 },
  impact: {
    value: { ko: "+$1.2M ARR 예상", en: "+$1.2M ARR projected" },
    direction: "positive" as const,
  },
}

export const mockDataFreshness: DataFreshness = {
  lastSync: { minutesAgo: 12 },
  sourceCoverage: { connected: 4, total: 5, sources: ["MMP", "A/B Platform", "Revenue", "Market"] },
  signalQuality: "high",
  anomalies: [
    { message: { ko: "MMP 데이터 24h 지연", en: "MMP data delayed 24h" }, severity: "warn" },
  ],
  modelConvergence: 82,
}

export const mockCapitalKPIs = {
  capitalEff: { value: 1.42, unit: "x",   trend: 0.12, trendLabel: "up" },
  burnMonths: { value: 8.2,  unit: "mo",  trend: 0.5,  trendLabel: "up" },
  irr:        { value: 34,   unit: "%",   trend: 5,    trendLabel: "up" },
  npv:        { value: 2.8,  unit: "M",   trend: 0.4,  trendLabel: "up" },
}

export const mockBudgetAllocation: BudgetSlice[] = [
  { name: "UA",       value: 55, color: "#5B9AFF" },
  { name: "Live Ops", value: 25, color: "#A78BFA" },
  { name: "R&D",      value: 20, color: "#3EDDB5" },
]

export const mockRevenueProjection: RevenueForecastPoint[] = [
  { month: "2026",  p10: 800,  p50: 1200, p90: 1600,  priorP10: 500,  priorP50: 1100, priorP90: 2000 },
  { month: "2027",  p10: 1200, p50: 2200, p90: 3400,  priorP10: 700,  priorP50: 2000, priorP90: 4400 },
  { month: "2028",  p10: 1800, p50: 3800, p90: 6200,  priorP10: 900,  priorP50: 3500, priorP90: 8800 },
]

export const mockRevenueProjectionMeta: RevenueForecastMeta = {
  asOfDay: 14,
  cohortCount: 15,
  priorNarrowingPct: 45,
  experiments: [],   // 3-year strategic view — no single experiment fork
}

// --- Capital Runway Monte Carlo Fan (Module 5 signature chart) ---

export type RunwayPoint = {
  month: number      // 0 = current
  label: string      // e.g. "Apr 2026"
  p10: number        // lower bound (bad scenario) in $K
  p50: number        // median projection in $K
  p90: number        // upper bound (good scenario) in $K
}

export type RunwayFanData = {
  points: RunwayPoint[]
  initialCash: number          // starting balance $K
  cashOutThreshold: number     // below this = cash-out zone ($K)
  /** Month index (fractional) where P50 crosses threshold. Negative = never. */
  p50CashOutMonth: number
  /** Probability mass below threshold by final month. */
  probCashOut: number
}

export const mockCashRunway: RunwayFanData = {
  initialCash: 1800,
  cashOutThreshold: 0,
  p50CashOutMonth: 12.0,
  probCashOut: 0.23,
  points: [
    { month: 0,  label: "Apr '26",  p10: 1800, p50: 1800, p90: 1800 },
    { month: 1,  label: "May '26",  p10: 1620, p50: 1650, p90: 1680 },
    { month: 2,  label: "Jun '26",  p10: 1430, p50: 1500, p90: 1570 },
    { month: 3,  label: "Jul '26",  p10: 1230, p50: 1350, p90: 1470 },
    { month: 4,  label: "Aug '26",  p10: 1020, p50: 1200, p90: 1380 },
    { month: 5,  label: "Sep '26",  p10: 800,  p50: 1050, p90: 1300 },
    { month: 6,  label: "Oct '26",  p10: 570,  p50: 900,  p90: 1230 },
    { month: 7,  label: "Nov '26",  p10: 330,  p50: 750,  p90: 1170 },
    { month: 8,  label: "Dec '26",  p10: 80,   p50: 600,  p90: 1120 },
    { month: 9,  label: "Jan '27",  p10: -180, p50: 450,  p90: 1080 },
    { month: 10, label: "Feb '27",  p10: -450, p50: 300,  p90: 1050 },
    { month: 11, label: "Mar '27",  p10: -730, p50: 150,  p90: 1030 },
    { month: 12, label: "Apr '27",  p10: -1020,p50: 0,    p90: 1020 },
  ],
}

// --- Market Gap Module — extended data ---

export type RankingHistoryPoint = {
  date: string
  myRank: number
  rankChange: number
}

export type SaturationTrendPoint = {
  month: string
  topGrossingThreshold: number  // revenue threshold to enter top 100 grossing
  myRevenue: number
}

export type PriorPosterior = {
  metric: string
  prior: { mean: number; ci_low: number; ci_high: number }
  posterior: { mean: number; ci_low: number; ci_high: number }
}

export const mockRankingHistory: RankingHistoryPoint[] = [
  { date: "2025-10", myRank: 8,  rankChange: 0  },
  { date: "2025-11", myRank: 7,  rankChange: +1 },
  { date: "2025-12", myRank: 6,  rankChange: +1 },
  { date: "2026-01", myRank: 5,  rankChange: +1 },
  { date: "2026-02", myRank: 4,  rankChange: +1 },
  { date: "2026-03", myRank: 3,  rankChange: +1 },
  { date: "2026-04", myRank: 3,  rankChange: 0  },
]

export const mockSaturationTrend: SaturationTrendPoint[] = [
  { month: "2025-10", topGrossingThreshold: 380, myRevenue: 95  },
  { month: "2025-11", topGrossingThreshold: 410, myRevenue: 105 },
  { month: "2025-12", topGrossingThreshold: 425, myRevenue: 118 },
  { month: "2026-01", topGrossingThreshold: 440, myRevenue: 120 },
  { month: "2026-02", topGrossingThreshold: 455, myRevenue: 135 },
  { month: "2026-03", topGrossingThreshold: 470, myRevenue: 148 },
  { month: "2026-04", topGrossingThreshold: 485, myRevenue: 162 },
]

export const mockPriorPosterior: PriorPosterior[] = [
  {
    metric: "D7 Retention",
    prior:     { mean: 14.2, ci_low: 9.5,  ci_high: 21.0 },  // wide genre prior
    posterior: { mean: 18.7, ci_low: 16.5, ci_high: 21.2 },  // narrow our data
  },
  {
    metric: "D30 Retention",
    prior:     { mean: 6.4,  ci_low: 3.2,  ci_high: 12.5 },
    posterior: { mean: 8.5,  ci_low: 7.1,  ci_high: 10.2 },
  },
  {
    metric: "ARPDAU",
    prior:     { mean: 0.18, ci_low: 0.08, ci_high: 0.35 },
    posterior: { mean: 0.22, ci_low: 0.18, ci_high: 0.27 },
  },
]

export const mockMarketHero = {
  status: "rising" as "rising" | "stable" | "falling",
  rank: 3,
  rankChange: +5,  // moved from #8 to #3 over 6 months
  confidence: 92,
  reason: {
    ko: "장르 내 5계단 상승, 6개월 연속 성장세",
    en: "Climbed 5 ranks in genre, 6-month consecutive growth",
  },
  factors: [
    { status: "ok" as const, text: { ko: "D7 리텐션 P75 이상", en: "D7 retention above P75" } },
    { status: "ok" as const, text: { ko: "장르 평균 대비 +4.5pp", en: "+4.5pp vs genre avg" } },
    { status: "warn" as const, text: { ko: "Top 1-2 매출 격차 -$26M", en: "Revenue gap to top 2: -$26M" } },
    { status: "ok" as const, text: { ko: "Top 100 진입 안정권", en: "Stable in top 100 grossing" } },
  ],
}

// --- Per-game data variants ---

const COHORT_MULTIPLIERS: Record<string, number> = {
  "2026-01": 0.92,
  "2026-02": 0.96,
  "2026-03": 1.00,
  "2026-04": 1.03,
}

type GameVariant = {
  signal: {
    status: SignalStatus
    confidence: number
    reason: { ko: string; en: string }
    factors: ReadonlyArray<{ status: "ok" | "warn" | "fail"; text: { ko: string; en: string } }>
    payback: { p10: number; p50: number; p90: number }
    nextAction: { ko: string; en: string }
    impact: { value: { ko: string; en: string }; direction: "positive" | "negative" | "neutral" }
  }
  financialHealth: {
    burnTolerance: typeof mockFinancialHealth.burnTolerance
    netRunway: { value: number; max: number; color: string }
    paybackDay: number
  }
  cashRunway: {
    initialCash: number
  }
  capitalKPIs: {
    capitalEff: { value: number }
  }
}

const GAME_VARIANTS: Record<string, GameVariant> = {
  // Portfolio sentinel — aggregated metrics across all titles.
  // Signal/payback mirror mockPortfolioSignal for consistency with the
  // PortfolioVerdict card rendered on the dashboard.
  "portfolio": {
    signal: {
      status: "invest",
      confidence: 78,
      reason: {
        ko: "포트폴리오 MOIC 1.27x — Match League 1개 타이틀이 투자 시그널을 견인 (나머지 2개는 유지·축소)",
        en: "Portfolio MOIC 1.27x — driven by Match League (1 of 3 titles signaling scale; 2 others hold/reduce)",
      },
      factors: [
        { status: "ok" as const,   text: { ko: "Match League 성장 가속 중",          en: "Match League accelerating growth" } },
        { status: "warn" as const, text: { ko: "Weaving Fairy 수익화 실험 필요",      en: "Weaving Fairy needs monetization work" } },
        { status: "fail" as const, text: { ko: "Dig Infinity UA 축소 권고",           en: "Dig Infinity UA cut recommended" } },
      ],
      payback: { p10: 35, p50: 44, p90: 58 },
      nextAction: {
        ko: "Match League에 UA 예산 60%를 재배분하세요 (+$45K/월) — 포트폴리오 유일의 투자 확대 시그널",
        en: "Reallocate 60% of UA budget (+$45K/mo) to Match League — the only title signaling scale",
      },
      impact: {
        value: { ko: "+$1.2M ARR 예상", en: "+$1.2M ARR projected" },
        direction: "positive" as const,
      },
    },
    financialHealth: {
      burnTolerance: { value: 8.6, max: 18, color: "#1A7FE8" },
      netRunway: { value: 12.5, max: 18, color: "#1A7FE8" },
      paybackDay: 65,
    },
    cashRunway: {
      initialCash: 4160, // sum of 3 titles: 2400 + 1180 + 580
    },
    capitalKPIs: {
      capitalEff: { value: 1.27 }, // mockPortfolioKPIs.portfolioMoic
    },
  },
  "match-league": {
    signal: {
      status: mockSignal.status,
      confidence: mockSignal.confidence,
      reason: mockSignal.reason,
      factors: mockSignal.factors,
      payback: mockSignal.payback,
      nextAction: mockSignal.nextAction,
      impact: mockSignal.impact,
    },
    financialHealth: {
      burnTolerance: mockFinancialHealth.burnTolerance,
      netRunway: mockFinancialHealth.netRunway,
      paybackDay: mockFinancialHealth.paybackDay,
    },
    cashRunway: {
      initialCash: mockCashRunway.initialCash,
    },
    capitalKPIs: {
      capitalEff: { value: mockCapitalKPIs.capitalEff.value },
    },
  },
  "weaving-fairy": {
    signal: {
      status: "hold",
      confidence: 65,
      reason: {
        ko: "D1 리텐션 안정적이나 ARPDAU 목표 미달, 수익화 실험 필요",
        en: "D1 retention stable but ARPDAU below target — monetization work needed",
      },
      factors: [
        { status: "ok" as const,   text: { ko: "D1 리텐션 안정적 (36%)",          en: "D1 retention stable (36%)" } },
        { status: "warn" as const, text: { ko: "ARPDAU 목표 대비 -15%",            en: "ARPDAU 15% below target" } },
        { status: "warn" as const, text: { ko: "페이백 D72 예상 (목표: D60)",      en: "Payback projected D72 (target: D60)" } },
        { status: "ok" as const,   text: { ko: "실험 속도: 월 2.3건",              en: "Experiment velocity: 2.3/month" } },
      ],
      payback: { p10: 58, p50: 72, p90: 98 },
      nextAction: {
        ko: "ARPDAU 실험 3건을 4주 내 집행 후 UA 증액 재평가 — 현 예산 동결",
        en: "Run 3 ARPDAU experiments within 4 weeks before reassessing UA scale — budget frozen",
      },
      impact: {
        value: { ko: "실험 결과 대기", en: "Awaiting exp. results" },
        direction: "neutral" as const,
      },
    },
    financialHealth: {
      burnTolerance: { value: 8.4, max: 18, color: "#D97706" },
      netRunway: { value: 11.8, max: 18, color: "#D97706" },
      paybackDay: 72,
    },
    cashRunway: {
      initialCash: 1180,
    },
    capitalKPIs: {
      capitalEff: { value: 0.92 },
    },
  },
  "dig-infinity": {
    signal: {
      status: "reduce",
      confidence: 58,
      reason: {
        ko: "CPI 급등, 리텐션 장르 하위 25%, 페이백 회수 경로 불투명",
        en: "CPI spike, retention bottom 25%, payback recovery unclear",
      },
      factors: [
        { status: "fail" as const, text: { ko: "D7 리텐션 장르 P10 수준",          en: "D7 retention at P10 benchmark" } },
        { status: "fail" as const, text: { ko: "페이백 D104 예상 (목표: D60)",     en: "Payback projected D104 (target: D60)" } },
        { status: "warn" as const, text: { ko: "CPI 전월 대비 +18% 급등",           en: "CPI +18% MoM spike" } },
        { status: "warn" as const, text: { ko: "ARPDAU 하락 추세 지속",             en: "ARPDAU continuously declining" } },
      ],
      payback: { p10: 85, p50: 104, p90: 145 },
      nextAction: {
        ko: "UA 예산 50%(월 $30K) 축소 → 리텐션 실험에 재배분, 분기 말 축소 유지/해제 재평가",
        en: "Cut UA spend 50% (-$30K/mo) → reallocate to retention experiments, reassess at quarter-end",
      },
      impact: {
        value: { ko: "+$180K 자본 보존", en: "+$180K capital preserved" },
        direction: "positive" as const,
      },
    },
    financialHealth: {
      burnTolerance: { value: 3.2, max: 18, color: "#DC2626" },
      netRunway: { value: 4.8, max: 18, color: "#DC2626" },
      paybackDay: 104,
    },
    cashRunway: {
      initialCash: 580,
    },
    capitalKPIs: {
      capitalEff: { value: 0.54 },
    },
  },
}

export function getGameData(gameId: string, cohortMonth: string = "2026-03") {
  const variant = GAME_VARIANTS[gameId] ?? GAME_VARIANTS["match-league"]
  const m = COHORT_MULTIPLIERS[cohortMonth] ?? 1.0

  return {
    signal: {
      ...variant.signal,
      confidence: Math.round(variant.signal.confidence * m),
      payback: {
        p10: Math.round(variant.signal.payback.p10 / m),
        p50: Math.round(variant.signal.payback.p50 / m),
        p90: Math.round(variant.signal.payback.p90 / m),
      },
    },
    financialHealth: {
      ...variant.financialHealth,
      netRunway: {
        ...variant.financialHealth.netRunway,
        value: Math.round(variant.financialHealth.netRunway.value * m * 10) / 10,
      },
      paybackDay: Math.round(variant.financialHealth.paybackDay / m),
    },
    cashRunway: {
      initialCash: Math.round(variant.cashRunway.initialCash * m),
    },
    capitalKPIs: {
      capitalEff: {
        value: Math.round(variant.capitalKPIs.capitalEff.value * m * 100) / 100,
      },
    },
  }
}

// --- Per-game chart data ---
// These power the per-title dashboard views (Revenue vs Invest, Forecast, etc.).
// The "portfolio" entry provides aggregated/blended data for the portfolio mode.

type GameChartData = {
  kpis: {
    roas:    { value: number; trend: number; trendLabel: string }
    payback: { value: number; trend: number; trendLabel: string }
    bep:     { value: number; trend: number; trendLabel: string }
    burn:    { value: number; trend: number; trendLabel: string }
  }
  revenueVsInvest: RevenueVsInvestPoint[]
  revenueForecast: RevenueForecastPoint[]
  revenueForecastMeta: RevenueForecastMeta
  capitalWaterfall: CapitalWaterfallStep[]
}

const GAME_CHART_DATA: Record<string, GameChartData> = {
  "match-league": {
    kpis: {
      roas:    { value: 142, trend: 8.3,  trendLabel: "up" },
      payback: { value: 47,  trend: -12,  trendLabel: "faster" },
      bep:     { value: 87,  trend: 3.1,  trendLabel: "up" },
      burn:    { value: 8.2, trend: 0.5,  trendLabel: "up" },
    },
    // Reuses mockRevenueVsInvest (INVEST story — BEP in Jan, strong growth)
    revenueVsInvest: [
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
    ],
    revenueForecast: [
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
    ],
    revenueForecastMeta: {
      asOfDay: 14,
      cohortCount: 6,
      priorNarrowingPct: 42,
      experiments: [
        {
          id: "E-247",
          name: { ko: "리워드 캘린더 50% 확대", en: "Reward Calendar — scale to 50%" },
          deltaLtvPerUser: 1.8,
          annualRevenueLift: 180,
          shipMonth: "Jun",
          // Baseline P50: Jun 148 → Dec 185. Fork lifts by ~$180K annualized.
          forkP50: [null, null, null, null, null, 168, 182, 195, 208, 218, 225, 232],
        },
        {
          id: "E-301",
          name: { ko: "온보딩 튜토리얼 v4", en: "Onboarding Tutorial v4" },
          deltaLtvPerUser: 1.2,
          annualRevenueLift: 110,
          shipMonth: "Aug",
          forkP50: [null, null, null, null, null, null, null, 178, 190, 202, 212, 220],
        },
      ],
    },
    capitalWaterfall: [
      { label: { ko: "초기 자본",   en: "Initial Capital" }, value: 2400, type: "inflow"  },
      { label: { ko: "추가 투입",   en: "Follow-on" },       value: 600,  type: "inflow"  },
      { label: { ko: "UA 비용",    en: "UA Spend" },         value: -708, type: "outflow" },
      { label: { ko: "개발비",     en: "Dev Cost" },          value: -240, type: "outflow" },
      { label: { ko: "운영비",     en: "Ops Cost" },          value: -160, type: "outflow" },
      { label: { ko: "누적 매출",   en: "Cum. Revenue" },     value: 897,  type: "inflow"  },
      { label: { ko: "순 포지션",   en: "Net Position" },     value: 2789, type: "net"     },
    ],
  },

  "weaving-fairy": {
    // HOLD story — stable but not yet profitable, ARPDAU gap
    kpis: {
      roas:    { value: 96,  trend: 2.1,  trendLabel: "up" },
      payback: { value: 72,  trend: -3,   trendLabel: "faster" },
      bep:     { value: 58,  trend: 1.4,  trendLabel: "up" },
      burn:    { value: 4.8, trend: -0.2, trendLabel: "down" },
    },
    revenueVsInvest: [
      { month: "Jul",  revenue: 18, uaSpend: 48, cumRevenue: 18,  cumUaSpend: 48,  roas: 38 },
      { month: "Aug",  revenue: 25, uaSpend: 45, cumRevenue: 43,  cumUaSpend: 93,  roas: 46 },
      { month: "Sep",  revenue: 32, uaSpend: 42, cumRevenue: 75,  cumUaSpend: 135, roas: 56 },
      { month: "Oct",  revenue: 40, uaSpend: 42, cumRevenue: 115, cumUaSpend: 177, roas: 65 },
      { month: "Nov",  revenue: 45, uaSpend: 44, cumRevenue: 160, cumUaSpend: 221, roas: 72 },
      { month: "Dec",  revenue: 48, uaSpend: 46, cumRevenue: 208, cumUaSpend: 267, roas: 78 },
      { month: "Jan",  revenue: 50, uaSpend: 48, cumRevenue: 258, cumUaSpend: 315, roas: 82 },
      { month: "Feb",  revenue: 52, uaSpend: 48, cumRevenue: 310, cumUaSpend: 363, roas: 85 },
      { month: "Mar",  revenue: 55, uaSpend: 50, cumRevenue: 365, cumUaSpend: 413, roas: 88 },
      { month: "Apr",  revenue: 58, uaSpend: 50, cumRevenue: 423, cumUaSpend: 463, roas: 91 },
    ],
    revenueForecast: [
      { month: "Jan", p10: 42, p50: 50,  p90: 60,  priorP10: 30, priorP50: 52, priorP90: 78  },
      { month: "Feb", p10: 43, p50: 52,  p90: 65,  priorP10: 28, priorP50: 54, priorP90: 88  },
      { month: "Mar", p10: 44, p50: 55,  p90: 70,  priorP10: 26, priorP50: 56, priorP90: 98  },
      { month: "Apr", p10: 42, p50: 58,  p90: 78,  priorP10: 24, priorP50: 58, priorP90: 110 },
      { month: "May", p10: 40, p50: 60,  p90: 85,  priorP10: 22, priorP50: 60, priorP90: 122 },
      { month: "Jun", p10: 38, p50: 62,  p90: 92,  priorP10: 20, priorP50: 62, priorP90: 135 },
      { month: "Jul", p10: 35, p50: 65,  p90: 100, priorP10: 18, priorP50: 65, priorP90: 148 },
      { month: "Aug", p10: 32, p50: 66,  p90: 108, priorP10: 15, priorP50: 67, priorP90: 162 },
      { month: "Sep", p10: 30, p50: 68,  p90: 115, priorP10: 13, priorP50: 68, priorP90: 175 },
      { month: "Oct", p10: 28, p50: 70,  p90: 122, priorP10: 11, priorP50: 70, priorP90: 188 },
      { month: "Nov", p10: 25, p50: 70,  p90: 128, priorP10: 9,  priorP50: 72, priorP90: 200 },
      { month: "Dec", p10: 22, p50: 72,  p90: 135, priorP10: 7,  priorP50: 74, priorP90: 215 },
    ],
    revenueForecastMeta: {
      asOfDay: 14,
      cohortCount: 4,
      priorNarrowingPct: 38,
      experiments: [
        {
          id: "W-104",
          name: { ko: "길드 채팅 베타", en: "Guild Chat Beta" },
          deltaLtvPerUser: 0.9,
          annualRevenueLift: 68,
          shipMonth: "Jul",
          forkP50: [null, null, null, null, null, null, 72, 76, 80, 83, 86, 88],
        },
        {
          id: "W-152",
          name: { ko: "시즌 패스 도입", en: "Season Pass Launch" },
          deltaLtvPerUser: 1.4,
          annualRevenueLift: 92,
          shipMonth: "Sep",
          forkP50: [null, null, null, null, null, null, null, null, 82, 92, 100, 108],
        },
      ],
    },
    capitalWaterfall: [
      { label: { ko: "초기 자본",   en: "Initial Capital" }, value: 1180, type: "inflow"  },
      { label: { ko: "추가 투입",   en: "Follow-on" },       value: 200,  type: "inflow"  },
      { label: { ko: "UA 비용",    en: "UA Spend" },         value: -463, type: "outflow" },
      { label: { ko: "개발비",     en: "Dev Cost" },          value: -180, type: "outflow" },
      { label: { ko: "운영비",     en: "Ops Cost" },          value: -120, type: "outflow" },
      { label: { ko: "누적 매출",   en: "Cum. Revenue" },     value: 423,  type: "inflow"  },
      { label: { ko: "순 포지션",   en: "Net Position" },     value: 1040, type: "net"     },
    ],
  },

  "dig-infinity": {
    // REDUCE story — declining revenue, CPI rising, burning cash
    kpis: {
      roas:    { value: 72,  trend: -6.2, trendLabel: "down" },
      payback: { value: 104, trend: 18,   trendLabel: "slower" },
      bep:     { value: 28,  trend: -4.3, trendLabel: "down" },
      burn:    { value: 2.1, trend: -1.4, trendLabel: "down" },
    },
    revenueVsInvest: [
      { month: "Jul",  revenue: 48, uaSpend: 55, cumRevenue: 48,  cumUaSpend: 55,  roas: 87 },
      { month: "Aug",  revenue: 50, uaSpend: 58, cumRevenue: 98,  cumUaSpend: 113, roas: 87 },
      { month: "Sep",  revenue: 52, uaSpend: 62, cumRevenue: 150, cumUaSpend: 175, roas: 86 },
      { month: "Oct",  revenue: 50, uaSpend: 68, cumRevenue: 200, cumUaSpend: 243, roas: 82 },
      { month: "Nov",  revenue: 48, uaSpend: 70, cumRevenue: 248, cumUaSpend: 313, roas: 79 },
      { month: "Dec",  revenue: 45, uaSpend: 72, cumRevenue: 293, cumUaSpend: 385, roas: 76 },
      { month: "Jan",  revenue: 42, uaSpend: 75, cumRevenue: 335, cumUaSpend: 460, roas: 73 },
      { month: "Feb",  revenue: 40, uaSpend: 78, cumRevenue: 375, cumUaSpend: 538, roas: 70 },
      { month: "Mar",  revenue: 38, uaSpend: 80, cumRevenue: 413, cumUaSpend: 618, roas: 67 },
      { month: "Apr",  revenue: 36, uaSpend: 82, cumRevenue: 449, cumUaSpend: 700, roas: 64 },
    ],
    revenueForecast: [
      { month: "Jan", p10: 32, p50: 42,  p90: 52, priorP10: 22, priorP50: 48, priorP90: 72  },
      { month: "Feb", p10: 28, p50: 40,  p90: 55, priorP10: 18, priorP50: 48, priorP90: 82  },
      { month: "Mar", p10: 25, p50: 38,  p90: 56, priorP10: 15, priorP50: 48, priorP90: 90  },
      { month: "Apr", p10: 22, p50: 36,  p90: 58, priorP10: 12, priorP50: 48, priorP90: 100 },
      { month: "May", p10: 18, p50: 34,  p90: 60, priorP10: 10, priorP50: 48, priorP90: 110 },
      { month: "Jun", p10: 15, p50: 32,  p90: 62, priorP10: 8,  priorP50: 48, priorP90: 118 },
      { month: "Jul", p10: 12, p50: 30,  p90: 65, priorP10: 6,  priorP50: 48, priorP90: 128 },
      { month: "Aug", p10: 10, p50: 28,  p90: 68, priorP10: 5,  priorP50: 48, priorP90: 138 },
      { month: "Sep", p10: 8,  p50: 26,  p90: 70, priorP10: 4,  priorP50: 48, priorP90: 148 },
      { month: "Oct", p10: 6,  p50: 25,  p90: 72, priorP10: 3,  priorP50: 48, priorP90: 158 },
      { month: "Nov", p10: 5,  p50: 24,  p90: 75, priorP10: 3,  priorP50: 48, priorP90: 168 },
      { month: "Dec", p10: 4,  p50: 22,  p90: 78, priorP10: 2,  priorP50: 48, priorP90: 178 },
    ],
    revenueForecastMeta: {
      asOfDay: 14,
      cohortCount: 5,
      priorNarrowingPct: 56,
      experiments: [
        {
          id: "D-089",
          name: { ko: "수익화 패치 v2", en: "Monetization Patch v2" },
          deltaLtvPerUser: 1.1,
          annualRevenueLift: 55,
          shipMonth: "May",
          // Fork attempts to arrest the decline — lift grows modestly
          forkP50: [null, null, null, null, 38, 40, 41, 42, 42, 43, 44, 45],
        },
        {
          id: "D-112",
          name: { ko: "CPI 최적화 캠페인", en: "CPI Optimization Campaign" },
          deltaLtvPerUser: 0.6,
          annualRevenueLift: 32,
          shipMonth: "Jul",
          forkP50: [null, null, null, null, null, null, 34, 36, 37, 38, 39, 40],
        },
      ],
    },
    capitalWaterfall: [
      { label: { ko: "초기 자본",   en: "Initial Capital" }, value: 580,  type: "inflow"  },
      { label: { ko: "추가 투입",   en: "Follow-on" },       value: 0,    type: "inflow"  },
      { label: { ko: "UA 비용",    en: "UA Spend" },         value: -700, type: "outflow" },
      { label: { ko: "개발비",     en: "Dev Cost" },          value: -140, type: "outflow" },
      { label: { ko: "운영비",     en: "Ops Cost" },          value: -95,  type: "outflow" },
      { label: { ko: "누적 매출",   en: "Cum. Revenue" },     value: 449,  type: "inflow"  },
      { label: { ko: "순 포지션",   en: "Net Position" },     value: 94,   type: "net"     },
    ],
  },

  // Portfolio = aggregated blended view (reuses top-level portfolio mocks)
  "portfolio": {
    kpis: {
      roas:    { value: 148, trend: 6.2,  trendLabel: "up" },
      payback: { value: 65,  trend: -5,   trendLabel: "faster" },
      bep:     { value: 62,  trend: 2.4,  trendLabel: "up" },
      burn:    { value: 8.6, trend: 0.3,  trendLabel: "up" },
    },
    revenueVsInvest: [
      { month: "Jul",  revenue: 94,  uaSpend: 198, cumRevenue: 94,   cumUaSpend: 198,  roas: 47  },
      { month: "Aug",  revenue: 120, uaSpend: 191, cumRevenue: 214,  cumUaSpend: 389,  roas: 55  },
      { month: "Sep",  revenue: 146, uaSpend: 184, cumRevenue: 360,  cumUaSpend: 573,  roas: 63  },
      { month: "Oct",  revenue: 168, uaSpend: 182, cumRevenue: 528,  cumUaSpend: 755,  roas: 70  },
      { month: "Nov",  revenue: 185, uaSpend: 182, cumRevenue: 713,  cumUaSpend: 937,  roas: 76  },
      { month: "Dec",  revenue: 198, uaSpend: 183, cumRevenue: 911,  cumUaSpend: 1120, roas: 81  },
      { month: "Jan",  revenue: 204, uaSpend: 183, cumRevenue: 1115, cumUaSpend: 1303, roas: 86  },
      { month: "Feb",  revenue: 210, uaSpend: 184, cumRevenue: 1325, cumUaSpend: 1487, roas: 89  },
      { month: "Mar",  revenue: 218, uaSpend: 192, cumRevenue: 1543, cumUaSpend: 1679, roas: 92  },
      { month: "Apr",  revenue: 226, uaSpend: 192, cumRevenue: 1769, cumUaSpend: 1871, roas: 95  },
    ],
    revenueForecast: [
      { month: "Jan", p10: 169, p50: 197, p90: 227, priorP10: 122, priorP50: 200, priorP90: 285 },
      { month: "Feb", p10: 161, p50: 202, p90: 250, priorP10: 106, priorP50: 204, priorP90: 330 },
      { month: "Mar", p10: 157, p50: 211, p90: 274, priorP10: 93,  priorP50: 209, priorP90: 373 },
      { month: "Apr", p10: 146, p50: 214, p90: 301, priorP10: 81,  priorP50: 214, priorP90: 425 },
      { month: "May", p10: 133, p50: 229, p90: 345, priorP10: 70,  priorP50: 220, priorP90: 492 },
      { month: "Jun", p10: 118, p50: 242, p90: 394, priorP10: 60,  priorP50: 228, priorP90: 563 },
      { month: "Jul", p10: 105, p50: 250, p90: 435, priorP10: 50,  priorP50: 235, priorP90: 636 },
      { month: "Aug", p10: 92,  p50: 256, p90: 476, priorP10: 42,  priorP50: 243, priorP90: 710 },
      { month: "Sep", p10: 83,  p50: 262, p90: 510, priorP10: 35,  priorP50: 248, priorP90: 778 },
      { month: "Oct", p10: 74,  p50: 270, p90: 544, priorP10: 29,  priorP50: 256, priorP90: 841 },
      { month: "Nov", p10: 65,  p50: 274, p90: 573, priorP10: 24,  priorP50: 262, priorP90: 893 },
      { month: "Dec", p10: 58,  p50: 279, p90: 603, priorP10: 19,  priorP50: 267, priorP90: 948 },
    ],
    revenueForecastMeta: {
      asOfDay: 14,
      cohortCount: 15,
      priorNarrowingPct: 48,
      experiments: [
        {
          id: "P-001",
          name: { ko: "포트폴리오 전체: 상위 3개 실험", en: "Portfolio: top 3 experiments combined" },
          deltaLtvPerUser: 1.4,
          annualRevenueLift: 303,
          shipMonth: "Jun",
          forkP50: [null, null, null, null, null, 265, 282, 302, 320, 335, 348, 360],
        },
        {
          id: "E-247",
          name: { ko: "Match League — 리워드 캘린더", en: "Match League — Reward Calendar" },
          deltaLtvPerUser: 1.8,
          annualRevenueLift: 180,
          shipMonth: "Jun",
          forkP50: [null, null, null, null, null, 255, 270, 285, 300, 312, 322, 330],
        },
      ],
    },
    capitalWaterfall: [
      { label: { ko: "초기 자본",   en: "Initial Capital" }, value: 4160, type: "inflow"  },
      { label: { ko: "추가 투입",   en: "Follow-on" },       value: 800,  type: "inflow"  },
      { label: { ko: "UA 비용",    en: "UA Spend" },         value: -1871, type: "outflow" },
      { label: { ko: "개발비",     en: "Dev Cost" },          value: -560,  type: "outflow" },
      { label: { ko: "운영비",     en: "Ops Cost" },          value: -375,  type: "outflow" },
      { label: { ko: "누적 매출",   en: "Cum. Revenue" },     value: 1769,  type: "inflow"  },
      { label: { ko: "순 포지션",   en: "Net Position" },     value: 3923,  type: "net"     },
    ],
  },
}

export function getGameChartData(gameId: string): GameChartData {
  return GAME_CHART_DATA[gameId] ?? GAME_CHART_DATA["match-league"]
}

export function computeScenario(uaBudget: number, targetRoas: number): ScenarioResult {
  const basePayback = 47
  const baseBep = 87
  const budgetRatio = uaBudget / 100000
  const roasRatio = targetRoas / 142

  return {
    uaBudget,
    paybackDays: Math.round(basePayback * (0.7 + 0.3 * budgetRatio) / roasRatio),
    bepProbability: Math.min(99, Math.round(baseBep * (1.1 - 0.1 * budgetRatio) * (roasRatio * 0.3 + 0.7))),
    monthlyRevenue: Math.round(120000 * budgetRatio * roasRatio * 0.8),
  }
}
