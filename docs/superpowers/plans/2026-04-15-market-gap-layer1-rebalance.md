# Market Gap Layer 1 Rebalance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `PriorPosteriorChart`를 operator 의사결정 언어(L1)로 재작성 — Prior/Posterior/Bayesian/Alpha 용어를 제거하고 "장르 기대치 vs 우리 실적 + Invest/Hold/Reduce 신호"로 통일. 색상은 Revenue Forecast와 정합 (빨강=장르, 초록=우리, 파랑=격차).

**Architecture:** 기존 컴포넌트 `prior-posterior-chart.tsx` rewrite (type는 유지), 신규 색상 토큰 `MARKET_GAP_PROOF_COLORS` 추가, i18n `market.proof.*` 네임스페이스 신설, 신호 판정 helper `market-signal.ts` 신규. L2 용 레거시 i18n/색상 키는 유지(methodology 패널 차후 작업용).

**Tech Stack:** Next.js 16 (Turbopack) / React 19 / Tailwind / framer-motion / TypeScript. 테스트 러너 없음 → 검증은 `npx tsc --noEmit` + 브라우저 수동 + grep.

**Spec 출처:**
- `docs/superpowers/specs/2026-04-15-yieldo-positioning-language-layering-design.md` §3-§4
- `docs/superpowers/specs/2026-04-14-market-gap-bayesian-p3-implementation.md` §3 (재조정판)

---

## File Structure

**신규 (Create):**
- `yieldo/src/shared/lib/market-signal.ts` — 판정 신호 helper (pure function)
- `yieldo/src/shared/lib/market-signal.examples.ts` — usage example (테스트 러너 없으므로 assertion script 대체)

**수정 (Modify):**
- `yieldo/src/shared/config/chart-colors.ts` — `MARKET_GAP_PROOF_COLORS` 추가 (기존 `PRIOR_POSTERIOR_COLORS`는 L2 methodology 차후 작업용으로 유지)
- `yieldo/src/shared/i18n/dictionary.ts` — `market.proof.*` + `market.signal.*` 네임스페이스 신규 추가 (기존 `market.priorPosterior`/`market.bayesian`/`market.priorLabel`/`market.posteriorLabel`/`info.priorPosterior`는 L2 차후용 유지)
- `yieldo/src/shared/lib/index.ts` — 신규 helper re-export
- `yieldo/src/widgets/charts/ui/prior-posterior-chart.tsx` — 전면 rewrite

**건드리지 않음:**
- `yieldo/src/shared/api/mock-data.ts` (mockPriorPosterior 그대로 — 데이터 구조 변경 없음)
- `yieldo/src/app/(dashboard)/dashboard/market-gap/page.tsx` (컴포넌트 props 시그니처 변경 없음)
- `yieldo/src/shared/ui/info-hint.tsx` (어제 수정 그대로 사용)

---

## Task 1: `MARKET_GAP_PROOF_COLORS` 토큰 추가

**Files:**
- Modify: `yieldo/src/shared/config/chart-colors.ts`

- [ ] **Step 1: 파일 현황 확인**

Run: `grep -n "PRIOR_POSTERIOR_COLORS" /Users/mike/Downloads/yieldo/yieldo/src/shared/config/chart-colors.ts`
Expected: `177:export const PRIOR_POSTERIOR_COLORS = {` 같은 줄 발견

- [ ] **Step 2: `MARKET_GAP_PROOF_COLORS` 상수 추가**

파일 하단(다른 `*_COLORS` 상수들 사이 또는 뒤)에 추가:

```ts
export const MARKET_GAP_PROOF_COLORS = {
  // Operator 시각 언어: 빨강=장르 기대치, 초록=우리 실적, 파랑=격차 accent
  // Revenue Forecast(REVENUE_FORECAST_COLORS)와 정합 — 같은 palette 재사용
  genre:           PALETTE.risk,                   // #C9372C — 장르 기대치(prior)
  genreFill:       "rgba(201, 55, 44, 0.08)",      // 8% 투명도 dashed hatched
  genreLine:       "rgba(201, 55, 44, 0.55)",      // hatched line 농도

  our:             PALETTE.positive,               // #00875A — 우리 실적(posterior)
  ourFill:         "rgba(0, 135, 90, 0.14)",       // 14% 투명도 solid

  gapAccent:       PALETTE.revenue,                // #5B9AFF — 격차 표시

  // Invest/Hold/Reduce 판정 신호 (HeroVerdict 팔레트와 동일)
  signalInvest:    PALETTE.positive,               // #00875A
  signalHold:      PALETTE.legendGray,             // #64748B
  signalReduce:    PALETTE.risk,                   // #C9372C

  axis:            PALETTE.axis,
  grid:            PALETTE.grid,
  border:          PALETTE.border,
} as const
```

- [ ] **Step 3: tsc 검증**

Run: `cd /Users/mike/Downloads/yieldo/yieldo && npx tsc --noEmit 2>&1 | grep -v "decision-surface" | head -20`
Expected: 출력 없음 (또는 기존 decision-surface 에러 외 신규 에러 없음)

- [ ] **Step 4: 커밋**

```bash
cd /Users/mike/Downloads/yieldo
git add yieldo/src/shared/config/chart-colors.ts
git commit -m "feat(market-gap): add MARKET_GAP_PROOF_COLORS token aligned with Revenue Forecast"
```

---

## Task 2: i18n 키 `market.proof.*` + `market.signal.*` 추가

**Files:**
- Modify: `yieldo/src/shared/i18n/dictionary.ts`

- [ ] **Step 1: 기존 market.* 키 위치 확인**

Run: `grep -n "market.priorPosterior\|market.posteriorLabel" /Users/mike/Downloads/yieldo/yieldo/src/shared/i18n/dictionary.ts`
Expected: `206:"market.priorPosterior"...` / `213:"market.posteriorLabel"...` 같은 줄들

- [ ] **Step 2: 기존 키 직후 주석 + 신규 키 추가**

`market.posteriorLabel` 다음 줄에 삽입 (info.priorPosterior 앞):

```ts
  // ─── Market Gap Layer 1 (operator 의사결정 언어) — 2026-04-15 L0/L1/L2 레이어링 ─────
  // 기존 market.priorPosterior / bayesian / priorLabel / posteriorLabel / info.priorPosterior
  // 는 L2 methodology 패널 향후 작업용으로 유지. L1 UI에서는 아래 market.proof.* 사용.
  "market.proof.title":    { ko: "장르 기대치 vs 우리 실적",          en: "Genre Expectation vs Our Actuals" },
  "market.proof.subtitle": { ko: "장르 평균(median) 대비 우리 코호트 관측 결과",
                             en: "Our cohort observations vs genre median" },
  "market.proof.info":     { ko: "빨간 분포(장르 기대치)와 초록 분포(우리 실적)의 차이가 격차입니다. 격차가 양(+)이면 장르를 상회, 음(−)이면 미달. 신호 뱃지로 투자 판단이 즉시 드러납니다.",
                             en: "The gap between the red distribution (genre expectation) and green distribution (our actuals) reveals outperformance. Positive = above genre, negative = below. The signal badge surfaces the investment judgment." },
  "market.proof.genreLabel": { ko: "장르 기대치",                   en: "Genre Expectation" },
  "market.proof.ourLabel":   { ko: "우리 실적",                     en: "Our Actuals" },
  "market.proof.gapAbove":   { ko: "우리 우월",                     en: "Our lead" },
  "market.proof.gapBelow":   { ko: "우리 부족",                     en: "Our shortfall" },
  "market.signal.invest":    { ko: "Invest 신호",                   en: "Invest signal" },
  "market.signal.hold":      { ko: "Hold 신호",                    en: "Hold signal" },
  "market.signal.reduce":    { ko: "Reduce 신호",                   en: "Reduce signal" },
```

- [ ] **Step 3: tsc 검증**

Run: `cd /Users/mike/Downloads/yieldo/yieldo && npx tsc --noEmit 2>&1 | grep -v "decision-surface" | head -20`
Expected: 출력 없음

- [ ] **Step 4: grep으로 키 등록 확인**

Run: `grep -c "market.proof\." /Users/mike/Downloads/yieldo/yieldo/src/shared/i18n/dictionary.ts`
Expected: 최소 7 (market.proof.title/subtitle/info/genreLabel/ourLabel/gapAbove/gapBelow)

- [ ] **Step 5: 커밋**

```bash
cd /Users/mike/Downloads/yieldo
git add yieldo/src/shared/i18n/dictionary.ts
git commit -m "feat(market-gap): add L1 i18n keys (market.proof.* + market.signal.*)"
```

---

## Task 3: 판정 신호 helper `market-signal.ts` 신규

**Files:**
- Create: `yieldo/src/shared/lib/market-signal.ts`
- Create: `yieldo/src/shared/lib/market-signal.examples.ts`
- Modify: `yieldo/src/shared/lib/index.ts`

- [ ] **Step 1: shared/lib/index.ts 현황 확인**

Run: `cat /Users/mike/Downloads/yieldo/yieldo/src/shared/lib/index.ts`
Expected: `export * from "./utils"` 같은 줄들. 없으면 파일 자체 미존재 가능 — Run: `ls /Users/mike/Downloads/yieldo/yieldo/src/shared/lib/` 로 확인

- [ ] **Step 2: `market-signal.ts` 작성**

파일 생성: `/Users/mike/Downloads/yieldo/yieldo/src/shared/lib/market-signal.ts`

```ts
/**
 * Market Gap 판정 신호 계산 (L1 operator 언어).
 *
 * 장르 기대치(prior) 대비 우리 실적(posterior)의 %격차를 계산해
 * Invest / Hold / Reduce 3단 신호로 매핑한다.
 * HeroVerdict (Module 1)의 Invest/Hold/Reduce 판정과 1:1 대응.
 *
 * Threshold: ±5% (|delta| ≤ 5% → Hold, > +5% → Invest, < −5% → Reduce)
 *
 * @example
 *   computeMarketSignal(14.2, 18.7)  // { signal: "invest", deltaPct: 31.7, direction: "above" }
 *   computeMarketSignal(14.2, 14.8)  // { signal: "hold",   deltaPct:  4.2, direction: "above" }
 *   computeMarketSignal(14.2, 11.5)  // { signal: "reduce", deltaPct: -19.0, direction: "below" }
 */

export type MarketSignal = "invest" | "hold" | "reduce"

export type MarketSignalResult = {
  signal: MarketSignal
  /** % difference (posterior − prior) / prior × 100. 부호 포함 */
  deltaPct: number
  /** 방향 레이블 — L1 UI 표현 "우리 우월 / 우리 부족" 매핑용 */
  direction: "above" | "at" | "below"
}

/** Hold band threshold (절대값 %) */
export const MARKET_SIGNAL_HOLD_THRESHOLD = 5

export function computeMarketSignal(
  prior: number,
  posterior: number,
): MarketSignalResult {
  if (prior === 0) {
    // Edge case: prior 0이면 delta% 무한대 → hold로 안전 처리
    return { signal: "hold", deltaPct: 0, direction: "at" }
  }

  const deltaPct = ((posterior - prior) / prior) * 100
  const rounded = Math.round(deltaPct * 10) / 10 // 소수점 1자리

  const absDelta = Math.abs(rounded)
  let signal: MarketSignal
  let direction: MarketSignalResult["direction"]

  if (absDelta <= MARKET_SIGNAL_HOLD_THRESHOLD) {
    signal = "hold"
    direction = rounded > 0 ? "above" : rounded < 0 ? "below" : "at"
  } else if (rounded > 0) {
    signal = "invest"
    direction = "above"
  } else {
    signal = "reduce"
    direction = "below"
  }

  return { signal, deltaPct: rounded, direction }
}
```

- [ ] **Step 3: `market-signal.examples.ts` 작성** (테스트 러너 대체 — node로 직접 실행 가능한 assertion script)

파일 생성: `/Users/mike/Downloads/yieldo/yieldo/src/shared/lib/market-signal.examples.ts`

```ts
/**
 * market-signal.ts 기대 동작 예시 + runtime assertion.
 *
 * 테스트 러너 도입 전까지 이 파일로 수동 검증한다.
 * 실행: cd yieldo && npx tsx src/shared/lib/market-signal.examples.ts
 *       (tsx 미설치 시 npx ts-node 또는 빌드된 JS 실행)
 */

import { computeMarketSignal, MARKET_SIGNAL_HOLD_THRESHOLD } from "./market-signal"

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    process.exit(1)
  }
  console.log(`✅ ${message}`)
}

// Match League (INVEST): D7 prior 14.2, posterior 18.7 → +31.7% → invest
{
  const r = computeMarketSignal(14.2, 18.7)
  assert(r.signal === "invest", `Match League D7 → invest (got ${r.signal})`)
  assert(Math.abs(r.deltaPct - 31.7) < 0.1, `deltaPct ≈ 31.7 (got ${r.deltaPct})`)
  assert(r.direction === "above", `direction above (got ${r.direction})`)
}

// Weaving Fairy (HOLD): prior 14.2, posterior 14.8 → +4.2% → hold (within ±5%)
{
  const r = computeMarketSignal(14.2, 14.8)
  assert(r.signal === "hold", `Weaving Fairy within hold band (got ${r.signal})`)
  assert(Math.abs(r.deltaPct - 4.2) < 0.1, `deltaPct ≈ 4.2 (got ${r.deltaPct})`)
}

// Dig Infinity (REDUCE): prior 14.2, posterior 11.5 → -19.0% → reduce
{
  const r = computeMarketSignal(14.2, 11.5)
  assert(r.signal === "reduce", `Dig Infinity → reduce (got ${r.signal})`)
  assert(Math.abs(r.deltaPct + 19.0) < 0.1, `deltaPct ≈ -19.0 (got ${r.deltaPct})`)
  assert(r.direction === "below", `direction below (got ${r.direction})`)
}

// Boundary: exactly ±5% → hold
{
  const above = computeMarketSignal(100, 105)
  const below = computeMarketSignal(100, 95)
  assert(above.signal === "hold", `+5.0% at boundary = hold (got ${above.signal})`)
  assert(below.signal === "hold", `-5.0% at boundary = hold (got ${below.signal})`)
}

// Just above threshold: 5.1% → invest, -5.1% → reduce
{
  const above = computeMarketSignal(100, 105.1)
  const below = computeMarketSignal(100, 94.9)
  assert(above.signal === "invest", `+5.1% over threshold = invest (got ${above.signal})`)
  assert(below.signal === "reduce", `-5.1% under threshold = reduce (got ${below.signal})`)
}

// Edge case: prior = 0
{
  const r = computeMarketSignal(0, 100)
  assert(r.signal === "hold", `prior=0 safe fallback to hold (got ${r.signal})`)
  assert(r.deltaPct === 0, `prior=0 deltaPct=0 (got ${r.deltaPct})`)
}

// Edge case: both 0
{
  const r = computeMarketSignal(0, 0)
  assert(r.signal === "hold", `both=0 safe fallback to hold (got ${r.signal})`)
}

console.log(`\nAll ${7} assertion blocks passed. MARKET_SIGNAL_HOLD_THRESHOLD = ±${MARKET_SIGNAL_HOLD_THRESHOLD}%`)
```

- [ ] **Step 4: `shared/lib/index.ts` 에 re-export 추가**

기존 파일 끝에 추가:

```ts
export { computeMarketSignal, MARKET_SIGNAL_HOLD_THRESHOLD } from "./market-signal"
export type { MarketSignal, MarketSignalResult } from "./market-signal"
```

`index.ts` 파일이 없으면 신규 생성하고 기존 `utils.ts` 등도 함께 re-export:

```ts
export * from "./utils"
export { computeMarketSignal, MARKET_SIGNAL_HOLD_THRESHOLD } from "./market-signal"
export type { MarketSignal, MarketSignalResult } from "./market-signal"
```

- [ ] **Step 5: tsc 검증**

Run: `cd /Users/mike/Downloads/yieldo/yieldo && npx tsc --noEmit 2>&1 | grep -v "decision-surface" | head -20`
Expected: 출력 없음

- [ ] **Step 6: assertion script 수동 실행**

Run: `cd /Users/mike/Downloads/yieldo/yieldo && npx tsx src/shared/lib/market-signal.examples.ts`
Expected: 모든 assertion "✅" 통과, 마지막 "All 7 assertion blocks passed" 출력

tsx가 없으면 `npm install --save-dev tsx --legacy-peer-deps` 후 재실행. (devDep 추가 확인: package.json)

- [ ] **Step 7: 커밋**

```bash
cd /Users/mike/Downloads/yieldo
git add yieldo/src/shared/lib/market-signal.ts yieldo/src/shared/lib/market-signal.examples.ts yieldo/src/shared/lib/index.ts yieldo/package.json yieldo/package-lock.json
git commit -m "feat(market-gap): add computeMarketSignal helper (Invest/Hold/Reduce 판정, ±5% threshold)"
```

만약 tsx 설치가 환경 제약으로 불가능하면 Step 6 skip 하고 Step 7에서 package.json/lock 추가 제외.

---

## Task 4: `PriorPosteriorChart` 컴포넌트 rewrite

**Files:**
- Modify: `yieldo/src/widgets/charts/ui/prior-posterior-chart.tsx`

- [ ] **Step 1: 현재 파일 읽기**

Run: `cat /Users/mike/Downloads/yieldo/yieldo/src/widgets/charts/ui/prior-posterior-chart.tsx`
전체 파일 이해 후 진행.

- [ ] **Step 2: 전면 rewrite**

파일 전체를 다음으로 교체:

```tsx
"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { PriorPosterior } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { MARKET_GAP_PROOF_COLORS } from "@/shared/config/chart-colors"
import { computeMarketSignal } from "@/shared/lib"

const C = MARKET_GAP_PROOF_COLORS

type PriorPosteriorChartProps = {
  data: PriorPosterior[]
}

/**
 * Market Gap — Layer 1 "장르 기대치 vs 우리 실적" 차트.
 *
 * L0/L1/L2 언어 레이어링 정책(docs/superpowers/specs/2026-04-15-yieldo-positioning-language-layering-design.md)에 따라
 * L1(operator UI)에는 Prior/Posterior/Bayesian/Alpha 용어 사용 금지. 장르 기대치 / 우리 실적 /
 * Invest·Hold·Reduce 신호 언어로 통일. 색상은 Revenue Forecast와 정합 (빨강=장르, 초록=우리, 파랑=격차 accent).
 */
export function PriorPosteriorChart({ data }: PriorPosteriorChartProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName } = useChartExpand()

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("market.proof.title")}
        subtitle={t("market.proof.subtitle")}
        info={t("market.proof.info")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />

      <div className="space-y-6">
        {data.map((item, i) => {
          // 판정 신호 계산 (HeroVerdict와 1:1)
          const { signal, deltaPct, direction } = computeMarketSignal(item.prior.mean, item.posterior.mean)
          const signalColor =
            signal === "invest" ? C.signalInvest : signal === "reduce" ? C.signalReduce : C.signalHold
          const signalLabel = t(
            signal === "invest" ? "market.signal.invest" : signal === "reduce" ? "market.signal.reduce" : "market.signal.hold",
          )
          const gapLabel = t(direction === "above" ? "market.proof.gapAbove" : "market.proof.gapBelow")
          const deltaDisplay = `${deltaPct > 0 ? "+" : ""}${deltaPct.toFixed(1)}%`

          // 밴드 정규화 (0-100% 스케일로)
          const allValues = [item.prior.ci_low, item.prior.ci_high, item.posterior.ci_low, item.posterior.ci_high]
          const min = Math.min(...allValues) * 0.8
          const max = Math.max(...allValues) * 1.2
          const range = max - min

          const genreLeft = ((item.prior.ci_low - min) / range) * 100
          const genreWidth = ((item.prior.ci_high - item.prior.ci_low) / range) * 100
          const genreMean = ((item.prior.mean - min) / range) * 100

          const ourLeft = ((item.posterior.ci_low - min) / range) * 100
          const ourWidth = ((item.posterior.ci_high - item.posterior.ci_low) / range) * 100
          const ourMean = ((item.posterior.mean - min) / range) * 100

          return (
            <div key={i}>
              {/* 헤더: 지표명 + 장르 기대치 → 우리 실적 + 격차 + 신호 뱃지 */}
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-[var(--fg-0)]">{item.metric}</span>
                <div className="flex items-center gap-3 text-xs font-mono-num">
                  <span className="text-[var(--fg-2)]">
                    {t("market.proof.genreLabel")}: {item.prior.mean.toFixed(2)}
                  </span>
                  <span className="text-[var(--fg-3)]">→</span>
                  <span className="font-bold" style={{ color: C.our }}>
                    {t("market.proof.ourLabel")}: {item.posterior.mean.toFixed(2)}
                  </span>
                  <span className="font-bold" style={{ color: C.gapAccent }}>
                    {gapLabel} {deltaDisplay}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
                    style={{ background: `${signalColor}15`, color: signalColor }}
                  >
                    {signalLabel}
                  </span>
                </div>
              </div>

              {/* 분포 bar: 장르 기대치(빨강 hatched) + 우리 실적(초록 solid) */}
              <div className="relative h-12">
                {/* 장르 기대치 밴드 */}
                <div
                  className="absolute top-1 h-4 rounded-full"
                  style={{
                    left: `${genreLeft}%`,
                    width: `${genreWidth}%`,
                    background: C.genreFill,
                    border: `1px dashed ${C.genreLine}`,
                  }}
                />
                <div
                  className="absolute top-0 w-0.5 h-6"
                  style={{ left: `${genreMean}%`, background: C.genre }}
                />
                <span
                  className="absolute top-7 text-[10px] text-[var(--fg-2)] font-mono-num"
                  style={{ left: `${genreMean}%`, transform: "translateX(-50%)" }}
                >
                  {t("market.proof.genreLabel")}
                </span>

                {/* 우리 실적 밴드 */}
                <div
                  className="absolute top-1 h-4 rounded-full"
                  style={{
                    left: `${ourLeft}%`,
                    width: `${ourWidth}%`,
                    background: C.ourFill,
                    border: `1px solid ${C.our}`,
                  }}
                />
                <div
                  className="absolute top-0 w-0.5 h-6"
                  style={{ left: `${ourMean}%`, background: C.our }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[var(--fg-2)] font-mono-num mt-1">
                <span>{min.toFixed(1)}</span>
                <span>{max.toFixed(1)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 범례: 장르 기대치 + 우리 실적 (Alpha / Prior / Posterior / Bayesian 용어 일체 없음) */}
      <div className="mt-4 pt-4 border-t border-[var(--border-default)] flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-2 rounded"
            style={{ background: C.genreFill, border: `1px dashed ${C.genre}` }}
          />
          <span className="text-[var(--fg-2)]">{t("market.proof.genreLabel")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded" style={{ background: C.ourFill, border: `1px solid ${C.our}` }} />
          <span className="text-[var(--fg-2)]">{t("market.proof.ourLabel")}</span>
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 3: tsc 검증**

Run: `cd /Users/mike/Downloads/yieldo/yieldo && npx tsc --noEmit 2>&1 | grep -v "decision-surface" | head -20`
Expected: 출력 없음

- [ ] **Step 4: 커밋**

```bash
cd /Users/mike/Downloads/yieldo
git add yieldo/src/widgets/charts/ui/prior-posterior-chart.tsx
git commit -m "feat(market-gap): rewrite PriorPosteriorChart to Layer 1 language

L0/L1/L2 레이어링 정책 적용. 차트 제목을 '장르 기대치 vs 우리 실적'으로
교체하고, 각 지표 헤더에 Invest/Hold/Reduce 신호 뱃지와 격차% 표시 추가.
색상은 Revenue Forecast와 정합 (빨강=장르, 초록=우리, 파랑=격차).

L1 UI에서 Prior/Posterior/Bayesian/Alpha 용어 사용 0 — operator가 기술
용어를 만나지 않고 페이지를 사용 가능.

spec: docs/superpowers/specs/2026-04-14-market-gap-bayesian-p3-implementation.md §3 (재조정)"
```

---

## Task 5: L1 compliance 검증

**Files:** (검증만, 수정 없음)

- [ ] **Step 1: Market Gap 페이지 구성 컴포넌트에서 금지 용어 grep**

Market Gap 페이지 렌더 체인의 컴포넌트들(PriorPosteriorChart, MarketHeroVerdict, MarketBenchmark, RankingTrend, SaturationTrendChart, 그리고 market-gap/page.tsx 자체)에서 금지어 검색:

```bash
cd /Users/mike/Downloads/yieldo/yieldo
for f in \
  src/app/\(dashboard\)/dashboard/market-gap/page.tsx \
  src/widgets/charts/ui/prior-posterior-chart.tsx \
  src/widgets/charts/ui/market-benchmark.tsx \
  src/widgets/charts/ui/ranking-trend.tsx \
  src/widgets/charts/ui/saturation-trend.tsx \
  src/widgets/dashboard/ui/market-hero-verdict.tsx; do
  echo "=== $f ==="
  grep -En "Prior|Posterior|Bayesian|Alpha|사전 확률|사후 확률|베이지안" "$f" || echo "(no forbidden L1 terms)"
done
```

Expected:
- `prior-posterior-chart.tsx`: `(no forbidden L1 terms)` — rewrite에서 모두 제거됨
- 다른 파일들: 인라인 주석·import 경로(`PriorPosterior` type)·조건부 로직 변수명 등은 허용. **화면에 렌더되는 사용자 문자열** 중 금지어가 있으면 FAIL

발견된 렌더 문자열 금지어가 있으면 해당 파일 수정 후 Task 4 Step 3-4 반복.

- [ ] **Step 2: 브라우저 수동 확인**

Run: `cd /Users/mike/Downloads/yieldo/yieldo && npm run dev` (이미 dev 서버 돌고 있으면 skip — 기존 세션 확인)

브라우저에서 `/dashboard/market-gap` 열어 확인:
- [ ] 차트 제목이 "장르 기대치 vs 우리 실적"인지 (이전 "Prior vs Posterior · 베이지안 추론" 아님)
- [ ] 각 지표(D7 Retention 등) 헤더에 "장르 기대치: X", "우리 실적: Y", "우리 우월/부족 ±Z%", "Invest/Hold/Reduce 신호" 뱃지가 표시되는지
- [ ] 밴드 색상이 장르=빨강 dashed, 우리=초록 solid인지 (이전 gray/blue 아님)
- [ ] 범례에 "장르 기대치" / "우리 실적"만 보이는지 (Prior/Posterior 없음)
- [ ] ⓘ 호버 시 Info 가이드 텍스트가 L1 언어로 나오는지

하나라도 실패하면 Task 2 또는 Task 4로 되돌아가 수정.

- [ ] **Step 3: 한/영 locale 전환 확인**

브라우저에서 locale 토글 후 영어 렌더에서도 "Prior/Posterior/Bayesian/Alpha" 문자열이 화면에 없는지 확인.

Expected: 영어 렌더도 "Genre Expectation vs Our Actuals", "Invest/Hold/Reduce signal" 로 표시됨.

- [ ] **Step 4: 최종 tsc + lint**

```bash
cd /Users/mike/Downloads/yieldo/yieldo
npx tsc --noEmit 2>&1 | grep -v "decision-surface" | head -20
npm run lint 2>&1 | tail -20
```

Expected: tsc 에러 없음(기존 decision-surface 예외). lint는 신규 에러 없음.

- [ ] **Step 5: 검증 완료 주석 커밋** (선택)

변경사항이 없으면 skip. 있다면:

```bash
git add -A
git commit -m "chore(market-gap): L1 compliance cleanup (verification-found fixes)"
```

---

## Self-Review

플랜 작성 후 확인:

**Spec 커버리지**:
- Spec §3.1 치환표(차트 제목·범례·Gap 표시·판정 신호) → Task 2(i18n)·Task 4(컴포넌트) 커버
- Spec §3.2 색상 매핑 → Task 1(토큰)·Task 4(컴포넌트 사용) 커버
- Spec §3.3 동적 insight 문장 (헤더 내 격차+신호) → Task 4 Step 2의 헤더 블록 커버
- Spec §6 수용 기준 ("L1에 'Alpha' 부재") → Task 5 Step 1 grep 커버
- Spec §6 수용 기준 ("HeroVerdict와 1:1") → Task 3 computeMarketSignal + Task 4 signalLabel 커버
- Spec §6 수용 기준 ("i18n 키 단일 참조") → Task 2의 `market.proof.*` 네임스페이스 + Task 4의 t() 호출 커버
- Gap: L2 methodology 패널·Cyclic Update Timeline은 **범위 밖** (spec §1에서 Layer 2는 별도 플랜 명시)

**Placeholder 스캔**: TBD/TODO 없음. 모든 Step에 실행 가능한 명령·코드 포함

**Type 일관성**:
- `MarketSignal = "invest" | "hold" | "reduce"` (Task 3) → `signal === "invest" ? ...` (Task 4) 일치
- `MARKET_GAP_PROOF_COLORS` 프로퍼티 이름 (genre/genreFill/genreLine/our/ourFill/gapAccent/signalInvest/signalHold/signalReduce) (Task 1) → Task 4 `C.genre`, `C.our` 등 사용 일치
- i18n 키 (Task 2) → Task 4 `t("market.proof.title")` 등 일치

---

## 완료 기준

- [ ] Task 1–5 모든 Step 완료
- [ ] `npx tsc --noEmit` 통과 (기존 decision-surface 예외 외)
- [ ] 브라우저 `/dashboard/market-gap` 시각 확인 통과
- [ ] grep 검증: 페이지 컴포넌트에 Prior/Posterior/Bayesian/Alpha 렌더 문자열 0
- [ ] 한/영 locale 양쪽에서 L1 규칙 준수
- [ ] 각 Task 개별 커밋 (총 4-5개 커밋, Task 1~4 + 옵션 Task 5)

## Deferred (이 플랜 범위 밖)

- Layer 2 methodology 패널 + Cyclic Update Timeline 컴포넌트 → 별도 brainstorming 후 별도 플랜
- Signature metric 이름 외부 검증 (Alpha / Market Beat / 초과 성과지표 중 택1) → 사람 인터뷰, 코드 아님
- Module 1 HeroVerdict 표시 문구 변경 (필요 시) → 이번 스코프에서 제외

## Execution Handoff

플랜 완료. `docs/superpowers/plans/2026-04-15-market-gap-layer1-rebalance.md` 저장됨.
