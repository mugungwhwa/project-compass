/**
 * Per-chart color config objects.
 * Single source of truth for legend, tooltip dot, and graph fill/stroke.
 *
 * WHY hex not CSS var(): Recharts SVG attributes don't resolve
 * CSS custom properties at runtime. These hex values MUST stay
 * in sync with globals.css tokens (noted in comments).
 */

/**
 * Shared palette — mirrors globals.css :root tokens (dark + phosphor edition).
 *
 * Updated 2026-04-28 for yieldo dark/terminal rebrand: all values flipped to
 * dark-theme hex equivalents.  Chart lines now use phosphor-tier colors so
 * data pops against the #0A0E1A canvas; muted grays only for axis/grid.
 */
export const PALETTE = {
  // Brand / chart tokens
  p50:           "#4A9EFF",  // --chart-p50 (info-blue, dark-readable)
  bandInner:     "rgba(74, 158, 255, 0.50)",  // --chart-band-inner — substantial fill
  bandOuter:     "rgba(74, 158, 255, 0.28)",  // --chart-band-outer
  benchmark:     "#B8BFCE",  // dashed benchmark — light enough to read
  observed:      "#FFFFFF",  // datapoint dots — pure white on dark

  // Signal colors — phosphor tier for terminal pop (3-color Bloomberg-style)
  positive:      "#00E89A",  // bright phosphor green
  caution:       "#FFE45E",  // phosphor yellow (was #FFB347 ochre — dropped amber)
  risk:          "#FF6B7A",  // phosphor red

  // Cohort categorical — terminal-saturated
  cohort1:       "#4A9EFF",  // info blue
  cohort2:       "#00E89A",  // do green
  cohort3:       "#F4C842",  // yield yellow
  cohort4:       "#C39BFF",  // lavender
  cohort5:       "#5DD3F0",  // cyan
  cohort6:       "#FF6B7A",  // coral

  // Neutral
  axis:          "#C0C8D6",  // --fg-2 (axis labels — readable)
  grid:          "#2D3548",  // --chart-grid (visible but subtle)
  border:        "#1F2436",  // --border-default
  bg:            "#0E1320",  // --bg-1 (chart panel background, v3 deeper navy)
  fg0:           "#FFFFFF",  // --fg-0
  fg2:           "#C0C8D6",  // --fg-2

  // Legacy hex aliases — re-pointed at terminal-bright palette
  revenue:       "#5DE7FF",  // phosphor cyan (revenue line — pops)
  uaSpend:       "#FFE45E",  // phosphor yellow (was #FFB347 ochre)
  roas:          "#4DFFA3",  // phosphor green
  breakeven:     "#FF6B7A",  // phosphor red
  genreAvgGray:  "#6B7280",  // muted gray for benchmark on dark
  legendGray:    "#8E96A4",  // --fg-3 (legend labels)
} as const

// ─── Per-chart configs ───

export const RETENTION_CURVE_COLORS = {
  p50:        PALETTE.p50,
  bandOuter:  PALETTE.bandOuter,
  bandInner:  PALETTE.bandInner,
  benchmark:  PALETTE.benchmark,
  asymptotic: PALETTE.positive,
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
  bg:         PALETTE.bg,
} as const

export const REVENUE_VS_INVEST_COLORS = {
  revenue:    PALETTE.revenue,
  uaSpend:    PALETTE.uaSpend,
  roas:       PALETTE.roas,
  breakeven:  PALETTE.breakeven,
  profit:     PALETTE.positive,      // monthly net > 0
  loss:       PALETTE.risk,          // monthly net < 0
  cumLine:    PALETTE.p50,           // cumulative net trajectory
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
  legend:     PALETTE.legendGray,
} as const

export const REVENUE_DECOMP_COLORS = {
  organic:    PALETTE.benchmark,    // #9CA3AF — neutral gray
  experiment: PALETTE.p50,          // #1A7FE8 — brand blue
  deploy:     PALETTE.positive,     // #00875A — signal green
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
  legend:     PALETTE.legendGray,
  fg0:        PALETTE.fg0,
  fg2:        PALETTE.fg2,
} as const

export const REVENUE_FORECAST_COLORS = {
  // Posterior (사후 확률 — 데이터 반영된 현재 예측) — phosphor green
  line:       PALETTE.positive,           // #00E89A
  postFill:   "rgba(0, 232, 154, 0.22)",
  postLine:   PALETTE.positive,
  // Prior (사전 확률 — 장르 벤치마크, 넓은 불확실성) — phosphor red
  prior:      PALETTE.risk,               // #FF6B7A
  priorFill:  "rgba(255, 107, 122, 0.14)",
  priorLine:  "rgba(255, 107, 122, 0.6)",
  // Experiment fork — phosphor cyan dashed
  experiment: PALETTE.revenue,            // #5DE7FF
  forkMark:   PALETTE.legendGray,         // vertical ship-line
  // Shared neutrals
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
} as const

export const MARKET_BENCHMARK_COLORS = {
  p50:        PALETTE.revenue,
  genre:      PALETTE.benchmark,
  bandFill:   "rgba(184, 191, 206, 0.12)",
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
} as const

export const RANKING_TREND_COLORS = {
  line:       PALETTE.revenue,
  top5:       PALETTE.uaSpend,
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
} as const

export const SATURATION_TREND_COLORS = {
  threshold:  PALETTE.uaSpend,
  myRevenue:  PALETTE.revenue,
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
} as const

export const SATURATION_BAR_COLORS = {
  myGame:     PALETTE.revenue,
  genreAvg:   PALETTE.genreAvgGray,
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
} as const

export const ACTION_TIMELINE_COLORS = {
  retention:  PALETTE.revenue,   // phosphor cyan — data line
  ua:         PALETTE.cohort3,   // yield yellow — UA marker
  liveops:    PALETTE.cohort4,   // lavender — live-ops marker
  release:    PALETTE.cohort1,   // info blue — release marker
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
} as const

export const EXPERIMENT_BAR_COLORS = {
  positive:   PALETTE.roas,
  negative:   PALETTE.breakeven,
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
  label:      PALETTE.legendGray,
} as const

export const VARIANT_IMPACT_COLORS = {
  shipped:    PALETTE.roas,
  reverted:   PALETTE.breakeven,
  control:    PALETTE.benchmark,
  running:    PALETTE.revenue,
  errorBar:   "rgba(255, 255, 255, 0.55)",  // neutral monochrome whiskers — readable on dark
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
  label:      PALETTE.legendGray,
} as const

export const ROLLOUT_HISTORY_COLORS = {
  bar:        PALETTE.revenue,
  line:       PALETTE.roas,
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
} as const

export const RIPPLE_FORECAST_COLORS = {
  line:       PALETTE.revenue,
  bandFill:   "rgba(93, 231, 255, 0.22)",
  bandFillEnd:"rgba(93, 231, 255, 0.06)",
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
} as const

export const PRIOR_POSTERIOR_COLORS = {
  prior:      PALETTE.benchmark,
  priorFill:  "rgba(184, 191, 206, 0.30)",
  priorBorder:"rgba(184, 191, 206, 0.45)",
  posterior:  PALETTE.revenue,
  postFill:   "rgba(93, 231, 255, 0.55)",
  postBorder: PALETTE.revenue,
} as const

export const MARKET_GAP_PROOF_COLORS = {
  // Operator 시각 언어: 빨강=장르 기대치, 초록=우리 실적, 파랑=격차 accent
  // Revenue Forecast와 정합 — 같은 palette 재사용 (phosphor 톤)
  genre:           PALETTE.risk,                   // #FF6B7A — 장르 기대치(prior)
  genreFill:       "rgba(255, 107, 122, 0.12)",
  genreLine:       "rgba(255, 107, 122, 0.6)",

  our:             PALETTE.positive,               // #00E89A — 우리 실적(posterior)
  ourFill:         "rgba(0, 232, 154, 0.18)",

  gapAccent:       PALETTE.revenue,                // #5DE7FF — 격차 표시

  // Invest/Hold/Reduce 판정 신호
  signalInvest:    PALETTE.positive,
  signalHold:      PALETTE.legendGray,
  signalReduce:    PALETTE.risk,

  axis:            PALETTE.axis,
  grid:            PALETTE.grid,
  border:          PALETTE.border,
} as const

export const RUNWAY_FAN_COLORS = {
  p50:        PALETTE.p50,
  bandOuter:  PALETTE.bandOuter,
  bandInner:  PALETTE.bandInner,
  cashOut:    "rgba(255, 107, 122, 0.12)",
  cashOutBorder: PALETTE.risk,
  axis:       PALETTE.axis,
  grid:       PALETTE.grid,
  border:     PALETTE.border,
  fg0:        PALETTE.fg0,
  fg2:        PALETTE.fg2,
} as const

export const SCENARIO_SIMULATOR_COLORS = {
  payback:    PALETTE.p50,
  bep:        PALETTE.positive,
} as const

export const BUDGET_DONUT_COLORS = {
  legend:     PALETTE.legendGray,
} as const

export const COHORT_HEATMAP_COLORS = {
  // Dark-theme heatmap: brightest cell = phosphor cyan, fade to deep navy
  level5:     "#5DE7FF",
  level4:     "#3FB8E0",
  level3:     "#2A8AB5",
  level2:     "#1F5B85",
  level1:     "#173F5C",
} as const

export const CAPITAL_WATERFALL_COLORS = {
  inflow:     PALETTE.positive,                  // #00E89A — phosphor green
  outflow:    PALETTE.risk,                      // #FF6B7A — phosphor red
  netPos:     PALETTE.p50,                       // #4A9EFF — info blue (net positive)
  netNeg:     "rgba(255, 107, 122, 0.55)",       // muted phosphor red (net negative)
  running:    PALETTE.legendGray,                // #8E96A4 — cumulative line/dot
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
  fg2:        PALETTE.fg2,                       // tooltip cumulative value
} as const
