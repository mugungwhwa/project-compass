/**
 * Per-chart color config objects.
 * Single source of truth for legend, tooltip dot, and graph fill/stroke.
 *
 * WHY hex not CSS var(): Recharts SVG attributes don't resolve
 * CSS custom properties at runtime. These hex values MUST stay
 * in sync with globals.css tokens (noted in comments).
 */

/** Shared palette — mirrors globals.css :root tokens */
export const PALETTE = {
  // Brand / chart tokens
  p50:           "#1A7FE8",  // --chart-p50
  bandInner:     "rgba(26, 127, 232, 0.18)", // --chart-band-inner
  bandOuter:     "rgba(26, 127, 232, 0.10)", // --chart-band-outer
  benchmark:     "#9CA3AF",  // --chart-benchmark
  observed:      "#0A0A0A",  // --chart-observed

  // Signal colors
  positive:      "#00875A",  // --signal-positive
  caution:       "#B25E09",  // --signal-caution
  risk:          "#C9372C",  // --signal-risk

  // Cohort categorical
  cohort1:       "#1A7FE8",  // --chart-cohort-1
  cohort2:       "#00875A",  // --chart-cohort-2
  cohort3:       "#B25E09",  // --chart-cohort-3
  cohort4:       "#7C3AED",  // --chart-cohort-4
  cohort5:       "#0891B2",  // --chart-cohort-5
  cohort6:       "#C9372C",  // --chart-cohort-6

  // Neutral
  axis:          "#6B7280",  // --fg-2
  grid:          "#ECECE8",  // --border-subtle
  border:        "#E2E2DD",  // --border-default
  bg:            "#FFFFFF",  // --bg-1
  fg0:           "#0A0A0A",  // --fg-0
  fg2:           "#6B7280",  // --fg-2

  // Legacy hex used by older charts (pre-migration)
  revenue:       "#5B9AFF",
  uaSpend:       "#FFA94D",
  roas:          "#3EDDB5",
  breakeven:     "#FF6B8A",
  genreAvgGray:  "#CBD5E1",
  legendGray:    "#64748B",
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
  // Posterior (사후 확률 — 데이터 반영된 현재 예측) — green
  line:       PALETTE.positive,           // #00875A
  postFill:   "rgba(0, 135, 90, 0.14)",
  postLine:   PALETTE.positive,
  // Prior (사전 확률 — 장르 벤치마크, 넓은 불확실성) — red
  prior:      PALETTE.risk,               // #C9372C
  priorFill:  "rgba(201, 55, 44, 0.08)",
  priorLine:  "rgba(201, 55, 44, 0.55)",
  // Experiment fork — blue dashed (Compass brand blue for "if we ship this")
  experiment: PALETTE.revenue,            // #5B9AFF
  forkMark:   PALETTE.legendGray,         // #64748B, vertical ship-line
  // Shared neutrals
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
} as const

export const MARKET_BENCHMARK_COLORS = {
  p50:        PALETTE.revenue,
  genre:      PALETTE.benchmark,
  bandFill:   "rgba(148, 163, 184, 0.08)",
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
  retention:  PALETTE.revenue,
  ua:         PALETTE.revenue,
  liveops:    "#A78BFA",
  release:    PALETTE.uaSpend,
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
  errorBar:   "#0F172A",
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
  bandFill:   "rgba(91, 154, 255, 0.18)",
  bandFillEnd:"rgba(91, 154, 255, 0.04)",
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
} as const

export const PRIOR_POSTERIOR_COLORS = {
  prior:      PALETTE.benchmark,
  priorFill:  "rgba(148, 163, 184, 0.3)",
  priorBorder:"rgba(148, 163, 184, 0.4)",
  posterior:  PALETTE.revenue,
  postFill:   "rgba(91, 154, 255, 0.6)",
  postBorder: PALETTE.revenue,
} as const

export const RUNWAY_FAN_COLORS = {
  p50:        PALETTE.p50,
  bandOuter:  PALETTE.bandOuter,
  bandInner:  PALETTE.bandInner,
  cashOut:    "rgba(201, 55, 44, 0.08)",
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
  level5:     "#5B9AFF",
  level4:     "#7AAEFF",
  level3:     "#A8C8FF",
  level2:     "#D4E7FF",
  level1:     "#EBF3FF",
} as const
