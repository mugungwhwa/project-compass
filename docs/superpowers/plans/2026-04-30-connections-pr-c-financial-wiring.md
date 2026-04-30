# Connections PR-C (Financial Input → Dashboard Wiring) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PR-B 재무 입력값(localStorage)을 dashboard 상단 `RunwayStatusBar`의 burn/runway/payback 메트릭에 반영. 입력 없으면 기존 mock 그대로 — 회귀 0.

**Architecture:** 순수 변환 함수 `deriveFinancialHealth(input)` + React hook `useLiveFinancial()` 신설. status bar에서 hook 결과를 `??` 연산자로 `getGameData(...)` fallback 위에 override.

**Tech Stack:** Next.js 16 · React 19 · TypeScript · Vitest + Testing Library · 기존 `@/shared/api/financial-input` 재사용.

**Spec:** `docs/superpowers/specs/2026-04-30-connections-pr-c-financial-wiring-design.md`

**Worktree:** `.worktrees/feature-connections-pr-c-financial-wiring/`
**Branch:** `feat/connections-pr-c-financial-wiring`
**Base:** `main` @ `49e46e8` (PR-C spec 보정 commit) 또는 그 이후

---

## Task 0: Worktree + 의존성 + 베이스라인

- [ ] **Step 1: Worktree 생성**

```bash
cd /Users/mike/Downloads/Compass
git worktree add .worktrees/feature-connections-pr-c-financial-wiring -b feat/connections-pr-c-financial-wiring
```

- [ ] **Step 2: npm install (백그라운드)**

```bash
cd .worktrees/feature-connections-pr-c-financial-wiring/yieldo
npm install --legacy-peer-deps
```

- [ ] **Step 3: 베이스라인 테스트**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-c-financial-wiring/yieldo
npx vitest run
```

Expected: 27 files / 152 tests passing. NOTE: `--reporter=basic`은 vitest 4.x에서 broken — 기본 리포터 사용.

---

## Task 1: `financial-derived.ts` — 순수 변환 함수

**Files:**
- Create: `yieldo/src/shared/api/financial-derived.ts`
- Test: `yieldo/src/shared/api/__tests__/financial-derived.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

Create `yieldo/src/shared/api/__tests__/financial-derived.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { deriveFinancialHealth } from "@/shared/api/financial-derived"
import type { FinancialInput } from "@/shared/api/financial-input"

const seed: FinancialInput = {
  monthlyRevenue: 50_000_000,
  uaSpend: 20_000_000,
  cashBalance: 500_000_000,
  monthlyBurn: 30_000_000,
  targetPaybackMonths: 12,
  savedAt: new Date().toISOString(),
}

describe("deriveFinancialHealth", () => {
  it("converts seed input to expected USD K values", () => {
    const out = deriveFinancialHealth(seed)
    // KRW_PER_USD = 1300 → monthlyRevenueK = 50_000_000 / 1300 / 1000 ≈ 38.46
    // monthlyBurnK ≈ 23.08, uaSpendK ≈ 15.38, cashK ≈ 384.6
    // netBurn = round(38.46 - 23.08 - 15.38) = 0
    // absBurn = max(0.1, |min(0, 0)|) = 0.1
    // runwayMonths = round1(384.6 / 0.1) = capped at 18
    // burnTolerance = round1(min(18, 12)) = 12.0
    expect(out.kpis.netBurn).toBe(0)
    expect(out.netRunway.value).toBe(18)
    expect(out.burnTolerance.value).toBe(12)
    expect(out.paybackDay).toBe(360)  // 12 * 30
  })

  it("computes negative netBurn when burning cash", () => {
    const burning: FinancialInput = { ...seed, monthlyRevenue: 0, monthlyBurn: 30_000_000, uaSpend: 20_000_000 }
    const out = deriveFinancialHealth(burning)
    // netBurn = round(0 - 23.08 - 15.38) = -38
    expect(out.kpis.netBurn).toBeLessThan(0)
    expect(out.kpis.netBurn).toBe(-38)
  })

  it("caps runway at MAX_RUNWAY_MONTHS when net positive (no burn)", () => {
    const profitable: FinancialInput = { ...seed, monthlyRevenue: 100_000_000, monthlyBurn: 10_000_000, uaSpend: 10_000_000 }
    const out = deriveFinancialHealth(profitable)
    expect(out.netRunway.value).toBe(18)  // capped
    expect(out.netRunway.max).toBe(18)
  })

  it("returns 0 for revPerSpend when uaSpend is 0", () => {
    const noUa: FinancialInput = { ...seed, uaSpend: 0 }
    const out = deriveFinancialHealth(noUa)
    expect(out.kpis.revPerSpend).toBe(0)
  })

  it("color-codes burnTolerance: green ≥12, amber 6-11.9, red <6", () => {
    const longRunway: FinancialInput = { ...seed, cashBalance: 1_000_000_000, monthlyBurn: 10_000_000, uaSpend: 0, monthlyRevenue: 0, targetPaybackMonths: 18 }
    expect(deriveFinancialHealth(longRunway).burnTolerance.color).toBe("#16A34A")  // green

    const mediumRunway: FinancialInput = { ...seed, cashBalance: 100_000_000, monthlyBurn: 20_000_000, uaSpend: 0, monthlyRevenue: 0, targetPaybackMonths: 8 }
    expect(deriveFinancialHealth(mediumRunway).burnTolerance.color).toBe("#D97706")  // amber

    const shortRunway: FinancialInput = { ...seed, cashBalance: 50_000_000, monthlyBurn: 30_000_000, uaSpend: 0, monthlyRevenue: 0, targetPaybackMonths: 3 }
    expect(deriveFinancialHealth(shortRunway).burnTolerance.color).toBe("#DC2626")  // red
  })

  it("paybackDay equals targetPaybackMonths * 30", () => {
    expect(deriveFinancialHealth({ ...seed, targetPaybackMonths: 1 }).paybackDay).toBe(30)
    expect(deriveFinancialHealth({ ...seed, targetPaybackMonths: 60 }).paybackDay).toBe(1800)
  })

  it("handles 1 trillion KRW without overflow", () => {
    const huge: FinancialInput = { ...seed, monthlyRevenue: 1e12, cashBalance: 1e12 }
    const out = deriveFinancialHealth(huge)
    expect(Number.isFinite(out.kpis.capEfficiency)).toBe(true)
    expect(Number.isFinite(out.netRunway.value)).toBe(true)
  })
})
```

- [ ] **Step 2: 실패 확인**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-c-financial-wiring/yieldo
npx vitest run src/shared/api/__tests__/financial-derived.test.ts
```

Expected: all 7 tests fail with "Cannot find module '@/shared/api/financial-derived'".

- [ ] **Step 3: 구현**

Create `yieldo/src/shared/api/financial-derived.ts`:

```ts
import type { FinancialInput } from "./financial-input"

export type FinancialHealthShape = {
  burnTolerance: { value: number; max: number; color: string }
  netRunway: { value: number; max: number; color: string }
  kpis: { capEfficiency: number; revPerSpend: number; netBurn: number }
  paybackDay: number
  runwayEndDay: number
}

const KRW_PER_USD = 1300
const MAX_RUNWAY_MONTHS = 18
const MIN_BURN_FOR_RUNWAY = 0.1

const round1 = (x: number) => Math.round(x * 10) / 10
const round2 = (x: number) => Math.round(x * 100) / 100

const colorFor = (months: number): string => {
  if (months >= 12) return "#16A34A"
  if (months >= 6) return "#D97706"
  return "#DC2626"
}

export function deriveFinancialHealth(input: FinancialInput): FinancialHealthShape {
  const monthlyRevenueK = input.monthlyRevenue / KRW_PER_USD / 1000
  const uaSpendK = input.uaSpend / KRW_PER_USD / 1000
  const cashK = input.cashBalance / KRW_PER_USD / 1000
  const monthlyBurnK = input.monthlyBurn / KRW_PER_USD / 1000

  const netBurn = Math.round(monthlyRevenueK - monthlyBurnK - uaSpendK)
  const absBurn = Math.max(MIN_BURN_FOR_RUNWAY, Math.abs(Math.min(0, netBurn)))
  const runwayMonthsRaw = cashK / absBurn
  const runwayMonths = round1(Math.min(MAX_RUNWAY_MONTHS, runwayMonthsRaw))
  const burnToleranceMonths = round1(Math.min(runwayMonths, input.targetPaybackMonths))

  const denom = uaSpendK + Math.max(0, monthlyBurnK - monthlyRevenueK)
  const capEfficiency = denom > 0 ? round2(monthlyRevenueK / denom) : 0
  const revPerSpend = uaSpendK > 0 ? round1(monthlyRevenueK / uaSpendK) : 0

  return {
    burnTolerance: {
      value: burnToleranceMonths,
      max: MAX_RUNWAY_MONTHS,
      color: colorFor(burnToleranceMonths),
    },
    netRunway: {
      value: runwayMonths,
      max: MAX_RUNWAY_MONTHS,
      color: colorFor(runwayMonths),
    },
    kpis: {
      capEfficiency,
      revPerSpend,
      netBurn,
    },
    paybackDay: input.targetPaybackMonths * 30,
    runwayEndDay: Math.round(runwayMonths * 30),
  }
}
```

- [ ] **Step 4: 통과 확인 + 회귀**

```bash
npx vitest run src/shared/api/__tests__/financial-derived.test.ts
npx vitest run
```

Expected: 7 derive tests pass. Full suite: 28 files / 159 tests.

- [ ] **Step 5: 커밋**

From worktree root:

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-c-financial-wiring
git add yieldo/src/shared/api/financial-derived.ts yieldo/src/shared/api/__tests__/financial-derived.test.ts
git commit -m "feat(connections): add deriveFinancialHealth pure function

Converts FinancialInput (KRW) to dashboard FinancialHealthShape
(USD K, runway months, payback days). Color-codes by health bands.
Caps runway at MAX_RUNWAY_MONTHS=18 for gauge consistency."
```

---

## Task 2: `use-live-financial.ts` — React hook

**Files:**
- Create: `yieldo/src/shared/api/use-live-financial.ts`
- Test: `yieldo/src/shared/api/__tests__/use-live-financial.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

Create `yieldo/src/shared/api/__tests__/use-live-financial.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useLiveFinancial } from "@/shared/api/use-live-financial"
import {
  FINANCIAL_INPUT_KEY,
  saveFinancialInput,
} from "@/shared/api/financial-input"

describe("useLiveFinancial", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("returns null when localStorage empty", () => {
    const { result } = renderHook(() => useLiveFinancial())
    expect(result.current).toBeNull()
  })

  it("returns derived shape when input is saved", () => {
    saveFinancialInput({
      monthlyRevenue: 50_000_000,
      uaSpend: 20_000_000,
      cashBalance: 500_000_000,
      monthlyBurn: 30_000_000,
      targetPaybackMonths: 12,
    })

    const { result } = renderHook(() => useLiveFinancial())
    expect(result.current).not.toBeNull()
    expect(result.current?.paybackDay).toBe(360)
    expect(result.current?.netRunway.max).toBe(18)
  })

  it("re-reads on storage event (cross-tab sync)", () => {
    const { result } = renderHook(() => useLiveFinancial())
    expect(result.current).toBeNull()

    act(() => {
      saveFinancialInput({
        monthlyRevenue: 1_000_000,
        uaSpend: 0,
        cashBalance: 10_000_000,
        monthlyBurn: 1_000_000,
        targetPaybackMonths: 6,
      })
      window.dispatchEvent(new StorageEvent("storage", { key: FINANCIAL_INPUT_KEY }))
    })

    expect(result.current).not.toBeNull()
    expect(result.current?.paybackDay).toBe(180)
  })
})
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/shared/api/__tests__/use-live-financial.test.tsx
```

Expected: fail with module-not-found.

- [ ] **Step 3: 구현**

Create `yieldo/src/shared/api/use-live-financial.ts`:

```ts
"use client"

import { useEffect, useState } from "react"
import { loadFinancialInput } from "./financial-input"
import {
  deriveFinancialHealth,
  type FinancialHealthShape,
} from "./financial-derived"

export function useLiveFinancial(): FinancialHealthShape | null {
  const [data, setData] = useState<FinancialHealthShape | null>(null)

  useEffect(() => {
    const refresh = () => {
      const input = loadFinancialInput()
      setData(input ? deriveFinancialHealth(input) : null)
    }
    refresh()
    window.addEventListener("storage", refresh)
    return () => window.removeEventListener("storage", refresh)
  }, [])

  return data
}
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run src/shared/api/__tests__/use-live-financial.test.tsx
npx vitest run
```

Expected: 3 hook tests pass. Full suite 29 files / 162 tests.

- [ ] **Step 5: 커밋**

```bash
git add yieldo/src/shared/api/use-live-financial.ts yieldo/src/shared/api/__tests__/use-live-financial.test.tsx
git commit -m "feat(connections): add useLiveFinancial hook

SSR-safe React hook returning derived FinancialHealthShape from
localStorage, or null if empty. Listens to 'storage' event for
cross-tab sync. Caller uses ?? fallback against existing data."
```

---

## Task 3: RunwayStatusBar wire-up + barrel export

**Files:**
- Modify: `yieldo/src/widgets/app-shell/ui/runway-status-bar.tsx` (lines 28, 79-83 area)
- Modify: `yieldo/src/shared/api/index.ts` (add 2 exports)

- [ ] **Step 1: index.ts barrel export 추가**

Read `yieldo/src/shared/api/index.ts` first to confirm structure, then append:

```ts
export {
  deriveFinancialHealth,
  type FinancialHealthShape,
} from "./financial-derived"
export { useLiveFinancial } from "./use-live-financial"
```

If `financial-input` exports aren't already in the barrel, add them too:

```ts
export {
  FinancialInputSchema,
  FINANCIAL_INPUT_KEY,
  loadFinancialInput,
  saveFinancialInput,
  clearFinancialInput,
  type FinancialInput,
} from "./financial-input"
```

(Skip the `financial-input` re-export if it's already there.)

- [ ] **Step 2: RunwayStatusBar 수정**

Read `yieldo/src/widgets/app-shell/ui/runway-status-bar.tsx`. Locate two changes:

**Change A** — line 28 import (add `useLiveFinancial`):

```ts
import { mockCashRunway, mockFinancialHealth, mockCapitalKPIs, getGameData, useLiveFinancial } from "@/shared/api"
```

(Keep `mockFinancialHealth` import — other code may reference it; safer to leave alone for this PR.)

**Change B** — around line 79-83, after `const data = getGameData(gameId, cohortMonth)`, replace the two read lines:

Before:
```ts
const data = getGameData(gameId, cohortMonth)
// ...
const runwayValue = data.financialHealth.netRunway.value
// ...
const paybackValue = data.financialHealth.paybackDay
```

After:
```ts
const data = getGameData(gameId, cohortMonth)
const live = useLiveFinancial()
// ...
const runwayValue = live?.netRunway.value ?? data.financialHealth.netRunway.value
// ...
const paybackValue = live?.paybackDay ?? data.financialHealth.paybackDay
```

NOTE: Preserve all other lines exactly — only those two `const` assignments change. The `useLiveFinancial()` call must go after `getGameData(...)` and inside the same component function (top-level hook, not in conditionals).

- [ ] **Step 3: tsc + 전체 테스트**

```bash
npx tsc --noEmit 2>&1 | tail -5
npx vitest run
```

Expected: 0 tsc errors. 29 files / 162 tests still passing (status bar has no unit tests — change is type-checked + manually verified).

- [ ] **Step 4: 커밋**

```bash
git add yieldo/src/shared/api/index.ts yieldo/src/widgets/app-shell/ui/runway-status-bar.tsx
git commit -m "feat(connections): wire useLiveFinancial into RunwayStatusBar

Live financial input (PR-B localStorage) overrides netRunway and
paybackDay shown in app-shell top bar. Falls back to getGameData()
mock values when input is null."
```

---

## Task 4: 수동 점검 (dev 서버)

- [ ] **Step 1: dev 서버**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-c-financial-wiring/yieldo
npm run dev -- --port 3000
```

- [ ] **Step 2: 회귀 시나리오 (입력 X, mock fallback 그대로)**

http://localhost:3000/dashboard/overview (또는 다른 dashboard 페이지)
- 상단 status bar의 runway/payback 값이 PR-A/B 상태와 동일한지 확인 (mock 값 그대로)

- [ ] **Step 3: live 시나리오 (입력 → status bar 갱신)**

1. http://localhost:3000/dashboard/connections 이동
2. "재무 직접 입력" 카드 클릭 → form 열림
3. 시드값 입력: `50000000` / `20000000` / `500000000` / `30000000` / `12`
4. 저장 → dialog 닫힘
5. 페이지 새로고침 → status bar runway 값이 derive된 값으로 변경 확인 (대략 12mo, 360 day)
6. 다른 dashboard 페이지로 이동 → status bar 값 유지

- [ ] **Step 4: 정리**

브라우저 콘솔에서 `localStorage.removeItem("yieldo:financial-input:v1")` 후 새로고침 → status bar mock fallback 복귀.

- [ ] **Step 5: dev 서버 종료**

`Ctrl+C`.

---

## Task 5: 풀 게이트 + 푸시 + PR

- [ ] **Step 1: lint clean (신규 코드 0 신규 에러)**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-c-financial-wiring/yieldo
npm run lint 2>&1 | grep -E "financial-derived|use-live-financial|runway-status-bar" | head
```

Expected: empty output. baseline ESLint 33개는 별도.

- [ ] **Step 2: tsc clean**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected: 0 errors.

- [ ] **Step 3: 전체 테스트**

```bash
npx vitest run
```

Expected: 29 files / 162 tests passing (152 baseline + 7 derive + 3 hook = 162).

- [ ] **Step 4: 빌드**

```bash
npm run build 2>&1 | tail -15
```

Expected: `Compiled successfully`.

- [ ] **Step 5: 푸시 + PR**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-c-financial-wiring
git push -u origin feat/connections-pr-c-financial-wiring
gh pr create --title "feat(connections): PR-C — financial input → dashboard runway/payback wiring" --body "$(cat <<'EOF'
## Summary

- 신규 `deriveFinancialHealth()` 순수 함수: `FinancialInput` → `FinancialHealthShape` (KRW → USD K 환산, runway months 계산, 색상 코딩)
- 신규 `useLiveFinancial()` SSR-safe hook: localStorage 읽어 derived shape 반환 또는 null
- `RunwayStatusBar`에서 `??` fallback으로 live 값 우선, mock fallback 회귀 안전
- 입력 없으면 기존 dashboard 그대로 — 회귀 0

Spec: `docs/superpowers/specs/2026-04-30-connections-pr-c-financial-wiring-design.md`
Plan: `docs/superpowers/plans/2026-04-30-connections-pr-c-financial-wiring.md`

## Test plan

- [x] `vitest run` — 7 derive + 3 hook = 10 신규 테스트 모두 통과
- [x] `tsc --noEmit` — 0 errors
- [x] `npm run build` — compile 성공
- [ ] dev 서버 manual smoke (입력 → 새로고침 → status bar 갱신)
- [ ] Vercel preview에서 같은 시퀀스 검증

## Disclaimer

Status bar 시각화 필드 2개(netRunway.value, paybackDay)만 노출. burnTolerance/kpis는 derive 결과에 포함되지만 현재 UI에서 안 쓰임 — `FinancialHealth` 위젯이 dashboard에 렌더되면 그대로 흘러감. 환율 KRW/USD 1300 상수 (Tier 2에서 토글).
EOF
)"
```

- [ ] **Step 6: PR URL 사용자에게 보고**

---

## Self-Review

**1. Spec coverage:**
- §3 Architecture ↔ Tasks 1+2+3 매핑 ✓
- §4 변경 파일 6개 ↔ 모두 매핑 (financial-derived + 테스트, use-live-financial + 테스트, index.ts, runway-status-bar) ✓
- §5 Conversion logic ↔ Task 1 step 3 코드의 식 모두 포함 ✓
- §6 Hook ↔ Task 2 step 3 코드 ✓
- §7 RunwayStatusBar ↔ Task 3 step 2 변경 ✓
- §8 Testing ↔ Task 1 step 1 (7 derive) + Task 2 step 1 (3 hook) ✓

**2. Placeholder scan:** TBD/TODO/"implement later" 0건. 모든 step에 실제 코드 포함. ✓

**3. Type consistency:**
- `FinancialHealthShape` (Task 1 export) ↔ `useLiveFinancial(): FinancialHealthShape | null` (Task 2) ↔ `live?.netRunway.value` (Task 3) — 일관 ✓
- `deriveFinancialHealth(input: FinancialInput)` 시그니처 — 모든 task에서 단일 인자 ✓
- `KRW_PER_USD = 1300`, `MAX_RUNWAY_MONTHS = 18`, `MIN_BURN_FOR_RUNWAY = 0.1` 상수 — Task 1 코드 + 테스트의 expected 값 일관 ✓

**4. Gap check:** 없음. mockFinancialHealth import는 그대로 두기 — Task 3 instruction 명시 (다른 사용처가 없으면 unused import lint warning 가능, 하지만 안전 우선).

---

## 실행

추천: **Subagent-Driven**. 추천 자동 채택으로 직진.
