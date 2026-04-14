# Revenue Forecast — Bayesian Belief-Update Redesign

**Date**: 2026-04-14
**Module**: Executive Overview (Module 1)
**Chart**: `compass/src/widgets/charts/ui/revenue-forecast.tsx`
**Status**: Shipped (commits `278142d`, `eb9c9c3` on main)
**Scope**: Single-chart redesign per `feedback_chart_specs` rule — one chart at a time

---

## 1. Problem Statement

The pre-redesign Revenue Forecast rendered a single P10/P50/P90 band with hardcoded values. It did not express Compass's core differentiator: that forecasts arise from **market-intelligence prior + internal-data posterior + experiment-fork scenarios** per CLAUDE.md §4 (Bayesian Decision Framework) and §5 (Revenue Modeling Engine).

Three inputs were invisible:

| Input | Where it lives in Compass | Visible on chart before? |
|---|---|---|
| Genre benchmark (prior) | Market Intelligence module | ❌ |
| Internal observed cohort retention (posterior) | Forecast itself, but presented as black-box | ❌ (indirectly) |
| Shipping/running experiments (fork scenarios) | Module 4 Experiment Board | ❌ |

---

## 2. Design Direction

**A + B combined** (selected from four options):
- **A. Belief-update visualization** — prior vs posterior bands, proving uncertainty has narrowed
- **B. Scenario fork** — "what if experiment E-247 ships?" branching line

Baseline is always the **current posterior** (user-confirmed: "기본은 당연히 현재 스탯을 기준으로").

**As-of-day snapshot feature deferred** — requires DB snapshot persistence (out of scope for MVP). Belief-update story delivered via Prior band toggle instead.

**Experiment fork requires explicit selection** — default view stays clean (no auto-picked experiment).

---

## 3. Visual Language

### Color mapping (red/green per user direction)

| Layer | Color | Rationale |
|---|---|---|
| Posterior band/line | Green `#00875A` (`PALETTE.positive`) | "Current confident forecast — trust this" |
| Prior band (hatched) | Red `#C9372C` (`PALETTE.risk`) | "Before data — wider uncertainty, reference only" |
| Experiment fork line | Blue `#5B9AFF` (`PALETTE.revenue`) | "What-if — Compass brand blue for forward scenarios" |
| Ship-point marker | Slate `#64748B` (`PALETTE.legendGray`) | Neutral vertical rule |

Opacity tuned so red prior doesn't read as "alarm" — 8% fill + 45% line stroke in hatched pattern.

### Layer z-order (bottom → top)

1. Prior hatched fill (conditional)
2. Posterior solid fill
3. Posterior P10/P90 dashed outlines
4. Posterior P50 solid line (2.25px, always on top among baseline)
5. Experiment fork P50 dashed (conditional, topmost)
6. Ship-point ReferenceLine + label (conditional)

### Korean terminology

- `Prior` → **사전 확률**
- `Posterior` → **사후 확률**

Adopted because Compass targets **business operators, not data analysts** (CLAUDE.md §11.2). 통계 교양 수준 Korean is universally decodable; "Prior/Posterior" as English loanwords creates friction for the primary target user.

---

## 4. Control Strip (Chart-Header-Adjacent)

Matches `runway-status-bar.tsx` game-selector pattern for app-wide consistency:

```
[AS OF  D14  · 6 cohorts]  |  [■ POSTERIOR]  [╌ PRIOR  off]  [╌ EXPERIMENT  — None —  ∧]
```

### Type ramp (revised for chart-card compactness)

Value-h2 (18px) was too large inside a chart card. Final scale:

| Element | Size/weight |
|---|---|
| Label (uppercase) | 11px/400 |
| Value (D14, E-247, off) | 13px/500 |
| Caption secondary (· 6 cohorts) | 11px/400 fg-3 |

All chips use `h-7` (28px) height + `items-center` for stable vertical alignment.

### `Swatch` component (3 variants)

- `solid` — posterior (always on)
- `dashed` — OFF state (outline only, dim 0.5)
- `dashed-filled` — ON state (15% fill + dashed border)

---

## 5. Tooltip Structure (Grouped)

Recharts default tooltip is useless when fills are `url(#pattern)` references — color dots render as invalid strings. Replaced with fully custom grouped rendering.

Each distribution is a `TooltipGroup` with a 3px left color bar as visual anchor:

```
┃ Dec
┃ ─────────────
┃┃ 사후 확률 — 현재 예측
┃   중앙값 P50        $185K   (emphasized, 600)
┃   P10–P90 범위     $32 – $390K
┃   불확실성 폭       ±$179K   (muted fg-3)
┃
┃┃ 사전 확률 — 장르 벤치마크      (Prior ON only)
┃   중앙값 P50        $145K
┃   ...
┃
┃┃ E-247 · 리워드 캘린더 50% 확대  (Experiment only)
┃   Ship 후 P50       $232K   (emphasized)
┃   Baseline 대비    +$47K   (green accent)
```

Information-per-group is **intentionally asymmetric**: Posterior/Prior share identical row structure (comparability); Experiment shows different fields (post-ship P50 + lift vs baseline).

---

## 6. Dynamic Insight Matrix

Four states driven by toggles. Inline string interpolation (dictionary ships raw templates with `{placeholder}` tokens; runtime `interpolate()` substitutes):

| Prior | Experiment | Insight text (ko) |
|---|---|---|
| off | none | `"D14 기준 · 연말 매출 $185K (P10–P90 ±179K). 코호트 6개가 수렴 중입니다."` |
| **on** | none | `"사전 확률 대비 불확실성이 42% 좁혀졌습니다. 내부 D14 관측 덕분입니다."` |
| off | **selected** | `"{expName}이 {ship}에 ship되면 연말 P50이 +${lift}K 상향됩니다."` |
| **on** | **selected** | `"사후 확률 밴드는 사전 확률 대비 42% 좁혀졌고, {expName} ship 시 ..."` |

---

## 7. Data Contract

### Existing type extended

```ts
export type RevenueForecastPoint = {
  month: string
  p10: number; p50: number; p90: number            // posterior (always)
  priorP10: number; priorP50: number; priorP90: number  // prior (new, always)
}
```

### New types

```ts
export type ExperimentForkScenario = {
  id: string                          // e.g. "E-247"
  name: { ko: string; en: string }
  deltaLtvPerUser: number             // $
  annualRevenueLift: number           // $K — P50 lift at year-end
  shipMonth: string                   // month label = fork origin
  forkP50: Array<number | null>       // length = data.length; null pre-ship
}

export type RevenueForecastMeta = {
  asOfDay: number                     // e.g. 14
  cohortCount: number                 // posterior confidence signal
  priorNarrowingPct: number           // how much posterior narrowed vs prior (%)
  experiments: ExperimentForkScenario[]
}
```

### Prior band centering (game-specific)

Prior is centered around **genre-average assumption** — not around the game's own posterior. This surfaces the "outperform / underperform" story:

- **Match League (INVEST)**: posterior P50 $185K > prior P50 $145K → outperforming Puzzle genre
- **Weaving Fairy (HOLD)**: posterior ~ prior → at-genre
- **Dig Infinity (REDUCE)**: posterior P50 $22K < prior P50 $48K → underperforming, surfaces problem visually

---

## 8. Info Tooltip Guide

`info.revenueForecast` rewritten to a structured 3-step usage guide, rendered via `info-hint.tsx` with `whitespace-pre-line` (small one-line change to that component):

```
📊 활용 가이드
① 기본 보기: 초록 밴드 = 현재 예측 범위...
② 사전 확률 토글: 빨간 밴드를 켜면 장르 벤치마크만으로 만든 초기 예측...
③ 실험 선택: 드롭다운에서 실험을 고르면 Ship 시점부터 파란 점선으로...

💡 의사결정 팁: 사전 확률 대비 사후 확률 밴드가 좁을수록 투자 판단 신뢰도가 높고,
실험 분기의 상향폭이 클수록 해당 실험을 우선순위로 올릴 가치가 큽니다.
```

---

## 9. Files Touched

| File | Change |
|---|---|
| `shared/api/mock-data.ts` | Type extensions + prior values + `experiments` arrays + `mockRevenueProjectionMeta` |
| `shared/config/chart-colors.ts` | `REVENUE_FORECAST_COLORS` expanded with `prior`, `priorFill`, `priorLine`, `postFill`, `experiment`, `forkMark` |
| `shared/i18n/dictionary.ts` | `info.revenueForecast` rewritten as structured guide; `rfc.*` namespace (20+ keys) for controls + tooltip rows + dynamic insights |
| `shared/ui/info-hint.tsx` | Added `whitespace-pre-line` + `max-w-sm` to support multi-line structured guide |
| `widgets/charts/ui/revenue-forecast.tsx` | Full rewrite — meta prop, state, controls, custom dropdown, grouped tooltip, layered chart |
| `app/(dashboard)/dashboard/page.tsx` | Pass `meta` prop |
| `app/(dashboard)/dashboard/capital/page.tsx` | Pass `meta` prop (uses new `mockRevenueProjectionMeta`) |

---

## 10. Deferred / Future Work

- **As-of snapshot dropdown** (D7/D14/D30 time-travel) — requires DB persistence; Phase 2
- **Experiment fork from actual Experiment Board data** — currently mocked per-game; wire to `ExperimentData` source when experiment-investment board is refactored
- **Keyboard navigation for custom dropdown** — Arrow keys/Enter (current impl: click-only; game selector has full a11y — port it when polish pass comes)
- **Prior band math transparency** — current prior values are handcrafted near genre averages; need to expose source ("GameAnalytics 2024 benchmark P10–P90") in tooltip when data source wiring lands

---

## 11. Known Limitations

- Commit messages `278142d` and `eb9c9c3` do not name this work in their subject lines — diffs contain Revenue Forecast changes buried alongside unrelated PaybackGauge / Noto Serif fixes. Historically trackable via this spec but not via `git log --oneline`.
- `connectNulls={false}` on fork Line is mandatory — otherwise pre-ship months interpolate from 0 and break the "fork here" visual. Test regression: ensure null handling in Recharts upgrades.
- `info-hint` `whitespace-pre-line` change affects all hints globally. Safe for current uses (single-line text unchanged), but future multi-paragraph info strings should be validated.

---

## 12. Related Documents

- `CLAUDE.md` §4 (Bayesian Decision Framework), §5 (Revenue Modeling Engine), §11.2 (operator-not-analyst design principle)
- `feedback_chart_specs` memory — one-chart-at-a-time process
- `runway-status-bar.tsx` — source pattern for dropdown a11y + animation
- Previous Overview 2.0 redesign: `docs/superpowers/specs/2026-04-13-overview-chart-redesign.md`
