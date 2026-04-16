# Cyclic Update Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Market Gap L2 Methodology modal — "📊 이 판정의 방법론 보기" CTA 클릭 시 6-frame 수평 step grid(D0→D90)가 장르 기대치가 우리 실적으로 업데이트되는 과정을 보여줌. Static + Play(~6초) 두 모드.

**Architecture:** `@base-ui/react/dialog` 기반 centered modal 안에 div+Tailwind+framer-motion step grid 배치. 각 frame은 prior(빨강)/posterior(초록) 밴드 + 관측값 + gap%. Frame 간 SVG 흡수 화살표. Play 버튼으로 D0→D90 순차 애니메이션. 1개 지표 집중 (match-league D7).

**Tech Stack:** Next.js 16 / React 19 / TypeScript / @base-ui/react/dialog / framer-motion / Tailwind. Recharts 미사용.

**Spec 출처:** `docs/superpowers/specs/2026-04-16-cyclic-update-timeline-design.md`

---

## File Structure

**Create:**
- `compass/src/shared/ui/methodology-modal.tsx` — Dialog 기반 centered modal 셸
- `compass/src/widgets/charts/ui/cyclic-update-timeline.tsx` — 6-frame step grid + play + hover

**Modify:**
- `compass/src/shared/api/mock-data.ts` — `CyclicUpdateStep`, `CyclicUpdateData` 타입 + match-league D7 mock
- `compass/src/shared/i18n/dictionary.ts` — `methodology.*` i18n 키
- `compass/src/widgets/charts/ui/prior-posterior-chart.tsx` — 하단 CTA link + modal 통합
- `compass/src/widgets/charts/index.ts` — `CyclicUpdateTimeline` re-export

---

### Task 1: Mock 데이터 타입 + match-league D7 데이터

**Files:**
- Modify: `compass/src/shared/api/mock-data.ts`

- [ ] **Step 1: 파일 말미 확인**

Run: `tail -20 compass/src/shared/api/mock-data.ts`
Expected: `getGameChartData` 또는 `computeScenario` 같은 마지막 export 함수.

- [ ] **Step 2: 타입 + 데이터 추가**

파일 맨 끝(`export function computeScenario` 이전 또는 이후)에 추가:

```ts
// --- Cyclic Update Timeline (Market Gap L2 Methodology) ---

export type CyclicUpdateStep = {
  day: number
  label: string
  updateRound: number
  prior: { p10: number; p50: number; p90: number }
  posterior: { p10: number; p50: number; p90: number } | null
  observed: number | null
  narrative: { ko: string; en: string }
}

export type CyclicUpdateData = {
  metric: string
  gameId: string
  steps: CyclicUpdateStep[]
}

export const mockCyclicUpdate_matchLeague_d7: CyclicUpdateData = {
  metric: "D7 Retention",
  gameId: "match-league",
  steps: [
    {
      day: 0, label: "D0", updateRound: 0,
      prior: { p10: 9.5, p50: 14.2, p90: 21.0 },
      posterior: null,
      observed: null,
      narrative: {
        ko: "장르 기대치만 있는 상태 — 아직 우리 데이터 없음",
        en: "Genre expectation only — no internal data yet",
      },
    },
    {
      day: 7, label: "D7", updateRound: 1,
      prior: { p10: 10.8, p50: 14.5, p90: 19.2 },
      posterior: { p10: 16.5, p50: 18.7, p90: 21.2 },
      observed: 18.7,
      narrative: {
        ko: "첫 코호트 관측 → 장르 기대치가 좁아지고, 우리 실적 등장",
        en: "First cohort observed → genre narrows, our actuals appear",
      },
    },
    {
      day: 14, label: "D14", updateRound: 2,
      prior: { p10: 12.2, p50: 14.8, p90: 17.8 },
      posterior: { p10: 16.0, p50: 17.5, p90: 19.5 },
      observed: 17.5,
      narrative: {
        ko: "D7 실적이 기대치에 흡수 → 2차 update, 밴드 더 좁아짐",
        en: "D7 actuals absorbed → 2nd update, bands narrower",
      },
    },
    {
      day: 30, label: "D30", updateRound: 3,
      prior: { p10: 13.5, p50: 15.2, p90: 17.0 },
      posterior: { p10: 15.8, p50: 17.2, p90: 18.5 },
      observed: 17.2,
      narrative: {
        ko: "누적 update 3회 → 수렴 진행 중",
        en: "3 updates accumulated → converging",
      },
    },
    {
      day: 60, label: "D60", updateRound: 4,
      prior: { p10: 14.2, p50: 15.5, p90: 16.8 },
      posterior: { p10: 15.5, p50: 17.0, p90: 18.2 },
      observed: 17.0,
      narrative: {
        ko: "거의 수렴 — 판정 신뢰도 높아짐",
        en: "Near convergence — judgment confidence increasing",
      },
    },
    {
      day: 90, label: "D90", updateRound: 5,
      prior: { p10: 14.8, p50: 15.8, p90: 16.5 },
      posterior: { p10: 15.2, p50: 16.8, p90: 17.8 },
      observed: 16.8,
      narrative: {
        ko: "안정 — 판정 확정 가능",
        en: "Stabilized — judgment finalized",
      },
    },
  ],
}
```

- [ ] **Step 3: tsc 검증**

Run: `cd compass && npx tsc --noEmit 2>&1 | head -10`
Expected: 출력 없음

- [ ] **Step 4: 커밋**

```bash
git add compass/src/shared/api/mock-data.ts
git commit -m "feat(market-gap-l2): add CyclicUpdateStep/Data types + match-league D7 mock data"
```

---

### Task 2: i18n `methodology.*` 키 추가

**Files:**
- Modify: `compass/src/shared/i18n/dictionary.ts`

- [ ] **Step 1: `market.signal.reduce` 키 위치 확인**

Run: `grep -n "market.signal.reduce" compass/src/shared/i18n/dictionary.ts`
Expected: 줄 번호 확인 (이 키 뒤에 methodology.* 키 삽입)

- [ ] **Step 2: methodology.* 키 추가**

`market.signal.reduce` 키 직후에 삽입:

```ts
  // ─── Methodology Modal (L2 — 방법론 패널, Alpha/Bayesian 허용) ─────
  "methodology.title":         { ko: "방법론: {metric} 판정의 근거",      en: "Methodology: basis for {metric} judgment" },
  "methodology.subtitle":     { ko: "장르 기대치가 내부 데이터로 업데이트되는 과정",
                                 en: "How genre expectations update with internal data" },
  "methodology.footer":       { ko: "Compass는 매 코호트 데이터 도착 시 장르 기대치를 우리 실적으로 업데이트합니다. 시간이 지날수록 예측 범위가 좁아지며, 이 수렴이 Invest/Hold/Reduce 판정의 신뢰도를 결정합니다.",
                                 en: "Compass updates genre expectations with our actuals as each cohort arrives. Over time the prediction range narrows, and this convergence determines the confidence of the Invest/Hold/Reduce judgment." },
  "methodology.footerL2":     { ko: "(Bayesian posterior update, Alpha Persistence 검증)",
                                 en: "(Bayesian posterior update, Alpha Persistence verification)" },
  "methodology.play":         { ko: "재생",                              en: "Play" },
  "methodology.pause":        { ko: "일시정지",                           en: "Pause" },
  "methodology.replay":       { ko: "다시 재생",                          en: "Replay" },
  "methodology.ctaLabel":     { ko: "이 판정의 방법론 보기",              en: "View methodology behind this judgment" },
  "methodology.absorption":   { ko: "흡수",                              en: "absorbed" },
  "methodology.absorptionFull":{ ko: "이전 실적 → 다음 기대치",          en: "Previous actuals → next expectation" },
  "methodology.genreOnly":    { ko: "장르 기대치만 (데이터 없음)",        en: "Genre expectation only (no data)" },
  "methodology.stabilized":   { ko: "안정 — 판정 확정 가능",             en: "Stabilized — judgment finalized" },
  "methodology.updateRound":  { ko: "{n}차 update",                     en: "Update #{n}" },
```

- [ ] **Step 3: tsc 검증**

Run: `cd compass && npx tsc --noEmit 2>&1 | head -10`
Expected: 출력 없음

- [ ] **Step 4: 커밋**

```bash
git add compass/src/shared/i18n/dictionary.ts
git commit -m "feat(market-gap-l2): add methodology.* i18n keys for modal + timeline"
```

---

### Task 3: MethodologyModal 셸 컴포넌트

**Files:**
- Create: `compass/src/shared/ui/methodology-modal.tsx`

- [ ] **Step 1: sheet.tsx 구조 참조**

Run: `head -60 compass/src/shared/ui/sheet.tsx`
Expected: `@base-ui/react/dialog` import 패턴 확인. 이 패턴을 centered modal로 변형.

- [ ] **Step 2: methodology-modal.tsx 작성**

```tsx
"use client"

import { type ReactNode, useCallback } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/shared/lib/utils"

type MethodologyModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  footer?: ReactNode
  children: ReactNode
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

const transition = { duration: 0.2, ease: [0.16, 1, 0.3, 1] }

export function MethodologyModal({ open, onOpenChange, title, subtitle, footer, children }: MethodologyModalProps) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal>
            <Dialog.Backdrop
              render={
                <motion.div
                  className="fixed inset-0 z-50 bg-black/50"
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={transition}
                />
              }
            />
            <Dialog.Popup
              render={
                <motion.div
                  className={cn(
                    "fixed inset-0 z-50 flex items-center justify-center p-4",
                  )}
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={transition}
                >
                  <motion.div
                    className={cn(
                      "relative w-full max-w-4xl",
                      "rounded-[var(--radius-card)] border border-[var(--border-default)]",
                      "bg-[var(--bg-1)] shadow-[0_16px_64px_rgba(0,0,0,0.12)]",
                    )}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={transition}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] px-6 py-4">
                      <div>
                        <Dialog.Title className="text-h2 text-[var(--fg-0)]">
                          {title}
                        </Dialog.Title>
                        {subtitle && (
                          <Dialog.Description className="text-caption text-[var(--fg-2)] mt-1">
                            {subtitle}
                          </Dialog.Description>
                        )}
                      </div>
                      <Dialog.Close
                        className={cn(
                          "rounded-[var(--radius-inline)] p-1.5 text-[var(--fg-3)]",
                          "hover:bg-[var(--bg-3)] hover:text-[var(--fg-1)] transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]",
                        )}
                      >
                        <X className="h-4 w-4" />
                      </Dialog.Close>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">
                      {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                      <div className="border-t border-[var(--border-default)] px-6 py-4">
                        {footer}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              }
            />
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
```

- [ ] **Step 3: tsc 검증**

Run: `cd compass && npx tsc --noEmit 2>&1 | head -10`
Expected: 출력 없음

- [ ] **Step 4: 커밋**

```bash
git add compass/src/shared/ui/methodology-modal.tsx
git commit -m "feat(market-gap-l2): add MethodologyModal shell (Dialog + framer-motion)"
```

---

### Task 4: CyclicUpdateTimeline — Static 렌더 (frame grid + 밴드 + 수치)

**Files:**
- Create: `compass/src/widgets/charts/ui/cyclic-update-timeline.tsx`
- Modify: `compass/src/widgets/charts/index.ts`

- [ ] **Step 1: cyclic-update-timeline.tsx 작성 (static only, hover/play는 후속)**

```tsx
"use client"

import { useState, useMemo, type ReactNode } from "react"
import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { CyclicUpdateData, CyclicUpdateStep } from "@/shared/api/mock-data"
import { MARKET_GAP_PROOF_COLORS } from "@/shared/config/chart-colors"
import { computeMarketSignal } from "@/shared/lib"

const C = MARKET_GAP_PROOF_COLORS

type CyclicUpdateTimelineProps = {
  data: CyclicUpdateData
}

/**
 * Cyclic Update Timeline — L2 Methodology 패널 내부.
 *
 * D0→D90 6-frame 수평 step grid. 각 frame은 장르 기대치(빨강 prior) +
 * 우리 실적(초록 posterior) 밴드를 보여주고, frame 간 흡수 화살표로
 * "이전 posterior → 다음 prior" 순환 구조를 시각화.
 */
export function CyclicUpdateTimeline({ data }: CyclicUpdateTimelineProps) {
  const { t, locale } = useLocale()

  // 전체 frame 공통 Y축 (D0의 가장 넓은 prior로 통일)
  const yMin = useMemo(() => {
    const allVals = data.steps.flatMap((s) => {
      const vals = [s.prior.p10, s.prior.p90]
      if (s.posterior) vals.push(s.posterior.p10, s.posterior.p90)
      return vals
    })
    return Math.min(...allVals) * 0.85
  }, [data.steps])

  const yMax = useMemo(() => {
    const allVals = data.steps.flatMap((s) => {
      const vals = [s.prior.p10, s.prior.p90]
      if (s.posterior) vals.push(s.posterior.p10, s.posterior.p90)
      return vals
    })
    return Math.max(...allVals) * 1.15
  }, [data.steps])

  const yRange = yMax - yMin

  // Normalize a value to % position within the Y range
  const toY = (v: number) => ((v - yMin) / yRange) * 100

  return (
    <div>
      {/* Play button placeholder — Task 7에서 구현 */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-inline)] border border-[var(--border-default)] px-3 py-1.5 text-[12px] font-medium text-[var(--fg-2)] hover:bg-[var(--bg-3)] transition-colors"
          disabled
        >
          ⏵ {t("methodology.play")}
        </button>
      </div>

      {/* Step grid (6 frames + 5 arrows) */}
      <div className="flex items-start gap-1">
        {data.steps.map((step, idx) => (
          <div key={step.label} className="flex items-start">
            {/* Frame */}
            <StepFrame
              step={step}
              toY={toY}
              locale={locale}
              t={t}
            />

            {/* Absorption arrow (between frames, not after last) */}
            {idx < data.steps.length - 1 && (
              <div className="flex flex-col items-center justify-center self-center px-1" style={{ minWidth: 28 }}>
                <svg width="28" height="20" viewBox="0 0 28 20" className="text-[var(--fg-3)] opacity-50">
                  <line x1="2" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <polygon points="20,6 28,10 20,14" fill="currentColor" />
                </svg>
                <span className="text-[9px] text-[var(--fg-3)] mt-0.5 whitespace-nowrap">
                  {t("methodology.absorption")}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- StepFrame ---

type StepFrameProps = {
  step: CyclicUpdateStep
  toY: (v: number) => number
  locale: "ko" | "en"
  t: (key: string) => string
}

function StepFrame({ step, toY, locale, t }: StepFrameProps) {
  const priorTop = toY(step.prior.p90)
  const priorBottom = toY(step.prior.p10)
  const priorHeight = Math.abs(priorBottom - priorTop)
  const priorOffset = Math.min(priorTop, priorBottom)

  const hasPost = step.posterior !== null
  const postTop = hasPost ? toY(step.posterior!.p90) : 0
  const postBottom = hasPost ? toY(step.posterior!.p10) : 0
  const postHeight = hasPost ? Math.abs(postBottom - postTop) : 0
  const postOffset = hasPost ? Math.min(postTop, postBottom) : 0

  const signal = hasPost ? computeMarketSignal(step.prior.p50, step.posterior!.p50) : null
  const signalColor = signal
    ? signal.signal === "invest" ? C.signalInvest : signal.signal === "reduce" ? C.signalReduce : C.signalHold
    : null

  return (
    <div
      className="flex flex-col items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-1)] transition-all"
      style={{ width: 120 }}
    >
      {/* Label */}
      <div className="w-full text-center py-1.5 border-b border-[var(--border-default)]">
        <span className="text-[11px] font-bold text-[var(--fg-0)]">{step.label}</span>
      </div>

      {/* Band area */}
      <div className="relative w-full" style={{ height: 120 }}>
        {/* Prior band (genre, red dashed) */}
        <div
          className="absolute left-2 right-2 rounded-sm"
          style={{
            top: `${100 - priorOffset - priorHeight}%`,
            height: `${priorHeight}%`,
            background: C.genreFill,
            border: `1px dashed ${C.genreLine}`,
          }}
        />

        {/* Prior P50 line */}
        <div
          className="absolute left-2 right-2 h-px"
          style={{
            top: `${100 - toY(step.prior.p50)}%`,
            background: C.genre,
          }}
        />

        {/* Posterior band (our, green solid) */}
        {hasPost && (
          <>
            <div
              className="absolute left-3 right-3 rounded-sm"
              style={{
                top: `${100 - postOffset - postHeight}%`,
                height: `${postHeight}%`,
                background: C.ourFill,
                border: `1px solid ${C.our}`,
              }}
            />
            {/* Posterior P50 line */}
            <div
              className="absolute left-3 right-3 h-px"
              style={{
                top: `${100 - toY(step.posterior!.p50)}%`,
                background: C.our,
              }}
            />
          </>
        )}

        {/* Observed marker × */}
        {step.observed !== null && (
          <div
            className="absolute left-1/2 -translate-x-1/2 text-[11px] font-bold"
            style={{
              top: `${100 - toY(step.observed)}%`,
              color: C.our,
              transform: "translate(-50%, -50%)",
            }}
          >
            ×
          </div>
        )}
      </div>

      {/* Numbers area */}
      <div className="w-full border-t border-[var(--border-default)] px-2 py-1.5 text-[10px] font-mono tabular-nums leading-relaxed">
        {hasPost ? (
          <>
            <div className="text-[var(--fg-2)]">{step.prior.p50.toFixed(1)}</div>
            <div className="font-bold" style={{ color: C.our }}>→ {step.posterior!.p50.toFixed(1)}</div>
            {signal && (
              <div className="font-bold" style={{ color: C.gapAccent }}>
                {signal.deltaPct > 0 ? "+" : ""}{signal.deltaPct.toFixed(1)}%
              </div>
            )}
          </>
        ) : (
          <div className="text-[var(--fg-3)] text-[9px]">{t("methodology.genreOnly")}</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: index.ts에 re-export 추가**

`compass/src/widgets/charts/index.ts` 맨 끝에:

```ts
export { CyclicUpdateTimeline } from "./ui/cyclic-update-timeline"
```

- [ ] **Step 3: tsc 검증**

Run: `cd compass && npx tsc --noEmit 2>&1 | head -10`
Expected: 출력 없음

- [ ] **Step 4: 커밋**

```bash
git add compass/src/widgets/charts/ui/cyclic-update-timeline.tsx compass/src/widgets/charts/index.ts
git commit -m "feat(market-gap-l2): add CyclicUpdateTimeline static render (6-frame step grid)"
```

---

### Task 5: Hover / Highlight 상태

**Files:**
- Modify: `compass/src/widgets/charts/ui/cyclic-update-timeline.tsx`

- [ ] **Step 1: hoveredIdx state + dim 처리 추가**

`CyclicUpdateTimeline` 컴포넌트에 추가:

상단 state:
```tsx
const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
```

Step grid `data.steps.map()` 안의 StepFrame에 props 추가:

```tsx
<StepFrame
  step={step}
  toY={toY}
  locale={locale}
  t={t}
  isHovered={hoveredIdx === idx}
  isDimmed={hoveredIdx !== null && hoveredIdx !== idx}
  onMouseEnter={() => setHoveredIdx(idx)}
  onMouseLeave={() => setHoveredIdx(null)}
/>
```

화살표에도 hover 연동:
```tsx
{idx < data.steps.length - 1 && (
  <div className="flex flex-col items-center justify-center self-center px-1" style={{ minWidth: 28 }}>
    <svg width="28" height="20" viewBox="0 0 28 20"
      className={hoveredIdx === idx || hoveredIdx === idx + 1 ? "text-[var(--brand)] opacity-100" : "text-[var(--fg-3)] opacity-50"}
      style={{ transition: "all 200ms ease-in-out" }}
    >
      <line x1="2" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth={hoveredIdx === idx || hoveredIdx === idx + 1 ? 2 : 1} strokeDasharray="3 3" />
      <polygon points="20,6 28,10 20,14" fill="currentColor" />
    </svg>
    <span className={`text-[9px] mt-0.5 whitespace-nowrap transition-colors ${hoveredIdx === idx || hoveredIdx === idx + 1 ? "text-[var(--brand)]" : "text-[var(--fg-3)]"}`}>
      {hoveredIdx === idx || hoveredIdx === idx + 1 ? t("methodology.absorptionFull") : t("methodology.absorption")}
    </span>
  </div>
)}
```

- [ ] **Step 2: StepFrame에 hover props 처리**

`StepFrameProps`에 추가:
```tsx
isHovered: boolean
isDimmed: boolean
onMouseEnter: () => void
onMouseLeave: () => void
```

StepFrame 최상위 `<div>`를 `motion.div`로 교체:

```tsx
<motion.div
  className="flex flex-col items-center rounded-lg border bg-[var(--bg-1)] cursor-pointer"
  style={{ width: 120 }}
  animate={{
    borderColor: isHovered ? "var(--brand)" : "var(--border-default)",
    opacity: isDimmed ? 0.45 : 1,
    filter: isDimmed ? "blur(0.5px)" : "none",
    scale: isHovered ? 1.04 : 1,
  }}
  transition={{ duration: 0.2 }}
  whileHover={{ scale: 1.04 }}
  onMouseEnter={onMouseEnter}
  onMouseLeave={onMouseLeave}
>
```

`isHovered` 시 ring 추가 — motion.div에 className 조건:
```tsx
className={cn(
  "flex flex-col items-center rounded-lg border bg-[var(--bg-1)] cursor-pointer",
  isHovered && "ring-2 ring-[var(--brand)]/20",
)}
```

관측값 marker: hover 시 수치 라벨 추가 (기존 × 옆에):

```tsx
{step.observed !== null && (
  <div
    className="absolute left-1/2 text-[11px] font-bold"
    style={{
      top: `${100 - toY(step.observed)}%`,
      color: C.our,
      transform: "translate(-50%, -50%)",
    }}
  >
    × {isHovered && <span className="ml-0.5 text-[10px]">{step.observed.toFixed(1)}</span>}
  </div>
)}
```

- [ ] **Step 3: Tooltip 추가 (hover 시 frame 상단)**

StepFrame 내부, motion.div 최상단 자식으로:

```tsx
{/* Hover summary tooltip */}
<AnimatePresence>
  {isHovered && step.posterior && (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-md border border-[var(--border-default)] bg-[var(--bg-1)] px-2.5 py-1.5 shadow-lg text-[10px]"
    >
      <span className="text-[var(--fg-2)]">{step.label}: </span>
      <span style={{ color: C.genre }}>{step.prior.p50.toFixed(1)}</span>
      <span className="text-[var(--fg-3)]"> → </span>
      <span className="font-bold" style={{ color: C.our }}>{step.posterior!.p50.toFixed(1)}</span>
      <span className="ml-1.5 font-bold" style={{ color: C.gapAccent }}>
        {computeMarketSignal(step.prior.p50, step.posterior!.p50).deltaPct > 0 ? "+" : ""}
        {computeMarketSignal(step.prior.p50, step.posterior!.p50).deltaPct.toFixed(1)}%
      </span>
    </motion.div>
  )}
</AnimatePresence>
```

StepFrame 최상위 div에 `relative` 추가하고, `AnimatePresence` import 추가.

- [ ] **Step 4: tsc 검증 + 커밋**

```bash
cd compass && npx tsc --noEmit 2>&1 | head -10
git add compass/src/widgets/charts/ui/cyclic-update-timeline.tsx
git commit -m "feat(market-gap-l2): add hover/highlight/dim states + tooltip to step grid"
```

---

### Task 6: Play 애니메이션

**Files:**
- Modify: `compass/src/widgets/charts/ui/cyclic-update-timeline.tsx`

- [ ] **Step 1: useReducer state machine 추가**

CyclicUpdateTimeline 상단에:

```tsx
import { useReducer, useEffect, useRef } from "react"

type PlayState = { status: "idle" | "playing" | "paused"; activeStep: number }
type PlayAction = { type: "play" } | { type: "pause" } | { type: "resume" } | { type: "next" } | { type: "done" } | { type: "reset" }

function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "play": return { status: "playing", activeStep: 0 }
    case "pause": return { ...state, status: "paused" }
    case "resume": return { ...state, status: "playing" }
    case "next": return { ...state, activeStep: state.activeStep + 1 }
    case "done": return { status: "idle", activeStep: -1 }
    case "reset": return { status: "idle", activeStep: -1 }
    default: return state
  }
}
```

컴포넌트 내부:
```tsx
const [play, dispatch] = useReducer(playReducer, { status: "idle", activeStep: -1 })
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
```

- [ ] **Step 2: Play timing engine (useEffect)**

```tsx
// Step dwell durations (ms) per spec §7: ~6초 total
const STEP_TIMINGS = [
  { dwell: 600, arrow: 200 },   // D0
  { dwell: 600, arrow: 200 },   // D7
  { dwell: 500, arrow: 200 },   // D14
  { dwell: 500, arrow: 200 },   // D30
  { dwell: 500, arrow: 200 },   // D60
  { dwell: 800, arrow: 0 },     // D90 (last, no arrow after)
]
const BAND_ANIM_MS = 400

useEffect(() => {
  if (play.status !== "playing") return
  if (play.activeStep >= data.steps.length) {
    dispatch({ type: "done" })
    return
  }

  const timing = STEP_TIMINGS[play.activeStep]
  const totalStepMs = BAND_ANIM_MS + timing.dwell + timing.arrow

  timerRef.current = setTimeout(() => {
    dispatch({ type: "next" })
  }, totalStepMs)

  return () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }
}, [play.status, play.activeStep, data.steps.length])
```

- [ ] **Step 3: Play 버튼 UI 교체**

기존 disabled 버튼을:

```tsx
<button
  type="button"
  onClick={() => {
    if (play.status === "idle") dispatch({ type: "play" })
    else if (play.status === "playing") dispatch({ type: "pause" })
    else if (play.status === "paused") dispatch({ type: "resume" })
  }}
  className="inline-flex items-center gap-1.5 rounded-[var(--radius-inline)] border border-[var(--border-default)] px-3 py-1.5 text-[12px] font-medium text-[var(--fg-2)] hover:bg-[var(--bg-3)] transition-colors"
>
  {play.status === "playing" ? `⏸ ${t("methodology.pause")}` : play.status === "paused" ? `⏵ ${t("methodology.play")}` : play.activeStep === -1 ? `⏵ ${t("methodology.play")}` : `⏵ ${t("methodology.replay")}`}
</button>
```

- [ ] **Step 4: StepFrame에 active 상태 반영**

StepFrame props에 `isActive: boolean` 추가. CyclicUpdateTimeline에서:

```tsx
<StepFrame
  ...
  isActive={play.status === "playing" && play.activeStep === idx}
  isDimmed={(hoveredIdx !== null && hoveredIdx !== idx) || (play.status === "playing" && play.activeStep !== idx)}
  ...
/>
```

StepFrame motion.div animate에 active glow:

```tsx
animate={{
  borderColor: isHovered || isActive ? "var(--brand)" : "var(--border-default)",
  opacity: isDimmed ? (play.status === "playing" ? 0.35 : 0.45) : 1,
  filter: isDimmed ? "blur(0.5px)" : "none",
  scale: isHovered ? 1.04 : isActive ? 1.02 : 1,
  boxShadow: isActive ? "0 0 16px rgba(26,127,232,0.25)" : "none",
}}
```

밴드 appear 애니메이션: posterior band와 observed marker를 `motion.div`로 감싸고 `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` 적용 (isActive 시에만).

- [ ] **Step 5: Play 중 hover → auto pause**

hoveredIdx 변경 감지:
```tsx
useEffect(() => {
  if (hoveredIdx !== null && play.status === "playing") {
    dispatch({ type: "pause" })
  }
}, [hoveredIdx, play.status])
```

hover 해제 시 resume 하려면 `onMouseLeave`에서:
```tsx
onMouseLeave={() => {
  setHoveredIdx(null)
  if (play.status === "paused" && play.activeStep >= 0) {
    dispatch({ type: "resume" })
  }
}}
```

단, 이 resume 로직은 CyclicUpdateTimeline 레벨에서 처리 (StepFrame이 아닌 부모).

- [ ] **Step 6: 화살표 play pulse 애니메이션**

화살표 SVG에 active transition 감지:

```tsx
const isArrowActive = play.status === "playing" && play.activeStep === idx + 1

// SVG line에 CSS animation class 적용
<svg ...
  className={cn(
    "transition-all",
    isArrowActive && "animate-[dashflow_0.4s_linear]",
    hoveredIdx === idx || hoveredIdx === idx + 1 ? "text-[var(--brand)] opacity-100" : "text-[var(--fg-3)] opacity-50",
  )}
>
```

globals.css에 keyframe 추가 (또는 inline):
```css
@keyframes dashflow {
  to { stroke-dashoffset: -6; }
}
```

- [ ] **Step 7: tsc 검증 + 커밋**

```bash
cd compass && npx tsc --noEmit 2>&1 | head -10
git add compass/src/widgets/charts/ui/cyclic-update-timeline.tsx compass/src/styles/globals.css
git commit -m "feat(market-gap-l2): add Play animation (~6s, state machine + band transitions + arrow pulse)"
```

---

### Task 7: L1 차트에 CTA Link + Modal 통합

**Files:**
- Modify: `compass/src/widgets/charts/ui/prior-posterior-chart.tsx`

- [ ] **Step 1: 현재 파일 끝 부분 확인**

Run: `tail -30 compass/src/widgets/charts/ui/prior-posterior-chart.tsx`
Expected: 범례 div + 닫는 `</motion.div>` + `}` 확인

- [ ] **Step 2: 상단에 import 추가**

```tsx
import { useState } from "react"
import { MethodologyModal } from "@/shared/ui/methodology-modal"
import { CyclicUpdateTimeline } from "./cyclic-update-timeline"
import { mockCyclicUpdate_matchLeague_d7 } from "@/shared/api/mock-data"
```

- [ ] **Step 3: modal state + CTA link + modal 렌더 추가**

컴포넌트 함수 상단에:
```tsx
const [methodologyOpen, setMethodologyOpen] = useState(false)
```

범례 div 직후, `</motion.div>` 직전에:

```tsx
      {/* L2 Methodology CTA */}
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setMethodologyOpen(true)}
          className="text-caption text-[var(--fg-3)] hover:text-[var(--fg-1)] transition-colors"
        >
          📊 {t("methodology.ctaLabel")}
        </button>
      </div>

      {/* L2 Methodology Modal */}
      <MethodologyModal
        open={methodologyOpen}
        onOpenChange={setMethodologyOpen}
        title={t("methodology.title").replace("{metric}", data[0]?.metric ?? "")}
        subtitle={t("methodology.subtitle")}
        footer={
          <div className="text-caption text-[var(--fg-2)] leading-relaxed">
            <p>{t("methodology.footer")}</p>
            <p className="mt-1 italic text-[var(--fg-3)]">{t("methodology.footerL2")}</p>
          </div>
        }
      >
        <CyclicUpdateTimeline data={mockCyclicUpdate_matchLeague_d7} />
      </MethodologyModal>
```

- [ ] **Step 4: tsc 검증**

Run: `cd compass && npx tsc --noEmit 2>&1 | head -10`

- [ ] **Step 5: 커밋**

```bash
git add compass/src/widgets/charts/ui/prior-posterior-chart.tsx
git commit -m "feat(market-gap-l2): wire CTA link + MethodologyModal in PriorPosteriorChart

L1 차트 하단에 '📊 이 판정의 방법론 보기' CTA 추가.
클릭 → modal overlay → CyclicUpdateTimeline 렌더.
match-league D7 mock data 사용."
```

---

### Task 8: L1/L2 Compliance 검증

**Files:** (검증만, 수정 없음)

- [ ] **Step 1: L1 금지어 grep**

```bash
for f in \
  compass/src/widgets/charts/ui/prior-posterior-chart.tsx \
  compass/src/widgets/charts/ui/cyclic-update-timeline.tsx \
  compass/src/shared/ui/methodology-modal.tsx; do
  echo "=== $f ==="
  grep -En "\"[^\"]*(Prior|Posterior|Bayesian|Alpha|사전 확률|사후 확률|베이지안)[^\"]*\"" "$f" || echo "(clean)"
done
```

Expected: CyclicUpdateTimeline과 MethodologyModal은 L2 전용 — 단, UI에 직접 렌더되는 "Prior/Posterior" 문자열은 없어야 함 (i18n 키를 통해 간접 노출은 OK). Prior-posterior-chart.tsx (L1)은 완전 clean.

- [ ] **Step 2: Modal footer L2 힌트 확인**

`methodology.footerL2` i18n 키가 `(Bayesian posterior update, Alpha Persistence 검증)` 이라는 괄호 안 텍스트로, `italic text-[var(--fg-3)]`로 렌더되는지 확인 (L2 허용 맥락).

- [ ] **Step 3: 색상 일관성 확인**

```bash
grep -n "C\.\|MARKET_GAP_PROOF_COLORS" compass/src/widgets/charts/ui/cyclic-update-timeline.tsx | head -20
```

Expected: `C.genreFill`, `C.genreLine`, `C.ourFill`, `C.our`, `C.gapAccent`, `C.signalInvest/Hold/Reduce`, `C.genre` 만 사용 — L1 차트와 동일한 토큰.

- [ ] **Step 4: tsc + lint**

```bash
cd compass && npx tsc --noEmit 2>&1 | head -10
npm run lint 2>&1 | tail -20
```

- [ ] **Step 5: 브라우저 수동 확인**

`/dashboard/market-gap` 방문:
- [ ] L1 차트 하단에 "📊 이 판정의 방법론 보기" 링크 보임
- [ ] 클릭 → modal (backdrop dim + 중앙 카드)
- [ ] Modal 내 6-frame 수평 grid 표시
- [ ] D0은 장르 밴드만 (빨강), 우리 밴드 없음
- [ ] D7~D90: 장르 밴드(빨강 dashed) 좁아지고 우리 밴드(초록 solid) 좁아짐
- [ ] 흡수 화살표 5개 (frame 사이)
- [ ] Frame hover: scale + ring + 비hover dim + 관측값 수치 + tooltip
- [ ] Play 버튼: D0→D90 순차 ~6초
- [ ] ESC / ✕ / backdrop 클릭 → modal 닫힘
- [ ] 한/영 locale 양쪽 정상

---

## Self-Review

**Spec 커버리지:**
- §2 Trigger UX → Task 7 (CTA link)
- §3 Modal layout → Task 3 (MethodologyModal)
- §4 Step grid frames → Task 4 (static render)
- §5 Hover/highlight → Task 5
- §6 흡수 화살표 → Task 4 (static) + Task 5 (hover) + Task 6 (play pulse)
- §7 Play 애니메이션 → Task 6
- §8 Data contract → Task 1
- §9 Library (div+TW+FM) → Task 4 구현 방식
- §10 Color anchor → Task 8 검증
- §11 수용 기준 → Task 8 체크리스트
- §12 Non-goals → 준수 (1개 지표, Play만, mock, match-league만, PC 기준)

**Placeholder 스캔:** 없음. 모든 step에 코드 포함.

**Type 일관성:**
- `CyclicUpdateStep.posterior: {...} | null` → Task 4 `hasPost = step.posterior !== null` 일치
- `CyclicUpdateData` → Task 4 `CyclicUpdateTimelineProps.data` 일치
- `StepFrameProps.toY: (v: number) => number` → Task 4/5 동일 시그니처
- `PlayState.activeStep` → Task 6 `play.activeStep` 일치
- `MARKET_GAP_PROOF_COLORS` 프로퍼티 → Task 4/5 `C.genre`, `C.our` 등 일치
- `computeMarketSignal` 시그니처 → Task 4/5 `(prior.p50, posterior.p50)` 호출 일치

---

## 완료 기준

- [ ] Task 1–8 모든 Step 완료
- [ ] `npx tsc --noEmit` 통과
- [ ] 브라우저 `/dashboard/market-gap` 시각 확인 통과 (static + play + hover)
- [ ] 한/영 locale 양쪽 정상 작동
- [ ] 각 Task 개별 커밋 (총 8개 커밋)

## Deferred

- 다른 게임/지표 mock 데이터 → 동일 구조로 확장 시 30분
- Interactive scrubber → non-goal per spec
- 모바일 반응형 → 전체 기획 완료 후 리팩토링
- Play speed 1.5x/2x → duration을 상수로 뽑아뒀으므로 확장 용이
