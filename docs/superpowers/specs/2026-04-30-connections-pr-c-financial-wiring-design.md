# Connections PR-C — Financial Input → Dashboard Wiring

**Date**: 2026-04-30
**Status**: Approved (brainstorming complete — Approach 1)
**Branch (planned)**: `feat/connections-pr-c-financial-wiring`
**Worktree (planned)**: `.worktrees/feature-connections-pr-c-financial-wiring/`
**Base**: `main` @ `8a99640` (demo script commit; PR-A/B 머지 + 시연 doc 직후)
**Driver**: 예창패/투자자 시연 narrative 강화 — "input → dashboard 영향" 한 컷 완성

---

## 1. Goal

`/dashboard/connections`에서 입력한 5-metric 재무값(localStorage 저장)을 `RunwayStatusBar`(전 페이지 상단 항상 표시)의 burn tolerance / netRunway / netBurn / capEfficiency / revPerSpend / payback 메트릭에 반영한다. 입력 없으면 기존 mock 값으로 fallback — 회귀 0.

시연 narrative: "재무 카드에 5개 지표 입력 → 저장 → 다른 dashboard 화면으로 이동 → 상단 status bar에 그 값이 반영된 burn tolerance와 runway가 보임."

## 2. Non-Goals

- `mockCashRunway`, `mockCapitalKPIs` 등 다른 financial mock 객체 wiring (별도 PR — Tier 2)
- `FinancialHealth` 컴포넌트가 dashboard 페이지 본문에 별도로 렌더되면 그것도 wiring (현재는 `RunwayStatusBar`만 진입점이지만 검증 후 결정)
- 게임별 `getGameData(...)` 변형값 override — 입력값은 portfolio 컨텍스트에만 영향
- 통화 토글 (KRW/USD) — 환율 상수 1300 KRW/USD 고정
- Module 1 Executive Overview 본문 카드 (`HeroVerdict`, `PortfolioVerdict` 등)
- 새 dashboard 페이지나 시각화 추가

## 3. Architecture

```
financial-input.ts (PR-B, existing)  →  loadFinancialInput()
              ↓
financial-derived.ts (NEW)
  └─ deriveFinancialHealth(input, fallback) → FinancialHealthShape
              ↓
use-live-financial.ts (NEW)
  └─ useLiveFinancial() → live health (or mock fallback)
              ↓
RunwayStatusBar (modify) — replaces direct mockFinancialHealth read
```

PR-B `loadFinancialInput()`을 SSR-safe하게 호출하는 React hook으로 감싸고, 결과를 `mockFinancialHealth`와 같은 shape로 변환하는 순수 함수로 위임. status bar는 hook 결과만 소비.

## 4. 변경 파일

| 파일 | 변경 | 라인 |
|---|---|---|
| `yieldo/src/shared/api/financial-derived.ts` | 신규 — 순수 변환 함수 | +90 |
| `yieldo/src/shared/api/__tests__/financial-derived.test.ts` | 신규 — 7+ 테스트 | +110 |
| `yieldo/src/shared/api/use-live-financial.ts` | 신규 — React hook | +35 |
| `yieldo/src/shared/api/__tests__/use-live-financial.test.tsx` | 신규 — hook 테스트 | +60 |
| `yieldo/src/shared/api/index.ts` | 두 신규 export 추가 | +2 |
| `yieldo/src/widgets/app-shell/ui/runway-status-bar.tsx` | mockFinancialHealth → useLiveFinancial 사용처 교체 | ~6 |

라인 합계 ~+300 (테스트 포함).

## 5. Conversion Logic — `deriveFinancialHealth`

### 5.1 시그니처

```ts
import type { FinancialInput } from "./financial-input"

type FinancialHealthShape = {
  burnTolerance: { value: number; max: number; color: string }
  netRunway: { value: number; max: number; color: string }
  kpis: { capEfficiency: number; revPerSpend: number; netBurn: number }
  paybackDay: number
  runwayEndDay: number
}

const KRW_PER_USD = 1300
const MAX_RUNWAY_MONTHS = 18  // 시각화 게이지 max
const MIN_BURN_FOR_RUNWAY = 0.1  // 0 division guard ($K/mo)

export function deriveFinancialHealth(
  input: FinancialInput | null,
  fallback: FinancialHealthShape,
): FinancialHealthShape
```

`input`이 `null`이면 `fallback` 그대로 반환 — 회귀 안전판.

### 5.2 변환 식

```
monthlyRevenueK = (input.monthlyRevenue / KRW_PER_USD) / 1000
uaSpendK        = (input.uaSpend / KRW_PER_USD) / 1000
cashK           = (input.cashBalance / KRW_PER_USD) / 1000
monthlyBurnK    = (input.monthlyBurn / KRW_PER_USD) / 1000

netBurn = round(monthlyRevenueK - monthlyBurnK - uaSpendK)   // -ve = burning
absBurn = max(MIN_BURN_FOR_RUNWAY, abs(min(0, netBurn)))
runwayMonths = round1(cashK / absBurn)
burnToleranceMonths = round1(min(runwayMonths, input.targetPaybackMonths))

capEfficiency = round2(monthlyRevenueK / (uaSpendK + max(0, monthlyBurnK - monthlyRevenueK)))
revPerSpend   = uaSpendK > 0 ? round1(monthlyRevenueK / uaSpendK) : 0

paybackDay    = input.targetPaybackMonths * 30
runwayEndDay  = round(runwayMonths * 30)
```

### 5.3 색상 매핑 (게이지 fill)

```
burnTolerance.color =
  burnToleranceMonths >= 12 ? "#16A34A" (green) :
  burnToleranceMonths >= 6  ? "#D97706" (amber) :
                              "#DC2626" (red)

netRunway.color =
  runwayMonths >= 12 ? "#16A34A" :
  runwayMonths >= 6  ? "#D97706" :
                       "#DC2626"
```

`max`는 항상 `MAX_RUNWAY_MONTHS = 18`. `value`가 max를 넘으면 `min(value, max)`.

### 5.4 헬퍼

```
round1(x) = Math.round(x * 10) / 10
round2(x) = Math.round(x * 100) / 100
round(x)  = Math.round(x)
```

## 6. `useLiveFinancial` 훅

```ts
"use client"

import { useEffect, useState } from "react"
import { mockFinancialHealth } from "./mock-data"
import { loadFinancialInput } from "./financial-input"
import { deriveFinancialHealth } from "./financial-derived"

export function useLiveFinancial() {
  const [data, setData] = useState(mockFinancialHealth)

  useEffect(() => {
    const refresh = () => {
      setData(deriveFinancialHealth(loadFinancialInput(), mockFinancialHealth))
    }
    refresh()
    // 다른 탭/창에서 저장 시 갱신
    window.addEventListener("storage", refresh)
    return () => window.removeEventListener("storage", refresh)
  }, [])

  return data
}
```

SSR-safe: 첫 render는 항상 `mockFinancialHealth` (서버에서 localStorage 모름). useEffect 내부에서만 갱신 → hydration mismatch 없음.

## 7. RunwayStatusBar 변경

기존 import + 사용:
```ts
import { mockCashRunway, mockFinancialHealth, mockCapitalKPIs, getGameData } from "@/shared/api"
// ...
const financial = mockFinancialHealth  // 어딘가에서 직접 읽음
```

신규:
```ts
import { mockCashRunway, mockCapitalKPIs, getGameData } from "@/shared/api"
import { useLiveFinancial } from "@/shared/api/use-live-financial"
// ...
const financial = useLiveFinancial()
```

`mockFinancialHealth`를 직접 import한 곳을 hook 사용으로 교체. 다른 mock(`mockCashRunway`, `mockCapitalKPIs`)은 그대로 — Tier 2 영역.

## 8. Testing

### 8.1 `deriveFinancialHealth` 단위 (Vitest)

| 테스트 | 검증 |
|---|---|
| null input → fallback 그대로 반환 | 회귀 안전 |
| 정상 시드값 (50M / 20M / 500M / 30M / 12) → 변환 결과 expected 값 | core path |
| netBurn 양수(흑자)일 때 runway 무한대 방어 (MAX_RUNWAY_MONTHS 캡) | edge |
| uaSpend 0 → revPerSpend 0 | 0 division |
| burnToleranceMonths 색상 분기 (3 / 8 / 15) | UX |
| paybackDay = targetPaybackMonths * 30 | 단위 |
| 매우 큰 KRW (1조) → finite USD 결과 | overflow |

### 8.2 `useLiveFinancial` 훅 (Testing Library)

| 테스트 | 검증 |
|---|---|
| localStorage empty → mockFinancialHealth 반환 | 회귀 |
| localStorage 정상값 → derive된 값 반환 | 핵심 |
| storage event 발생 → re-render with new value | 다탭 동기화 |

### 8.3 회귀

기존 27 files / 152 tests 모두 그대로 통과. RunwayStatusBar는 컴파일 + 시각 회귀 (수동 점검) — 단위 테스트는 status-bar 자체는 손대지 않음.

## 9. Error Handling

- `loadFinancialInput()` 자체가 invalid JSON / schema 실패에 null 반환 — derive 진입점에서도 null fallback
- 0 division: `MIN_BURN_FOR_RUNWAY` 가드, `uaSpend > 0` 체크
- 매우 큰 숫자: `MAX_RUNWAY_MONTHS = 18` 캡으로 게이지 깨짐 방지
- SSR: hook은 항상 mockFinancialHealth로 첫 render → useEffect에서 교체

## 10. Worktree & Branch

- 새 worktree: `.worktrees/feature-connections-pr-c-financial-wiring/`
- branch: `feat/connections-pr-c-financial-wiring` (base: main `8a99640` 또는 그 이후)
- 동시 worktree: 다른 worktree들과 파일 충돌 0 (신규 파일 위주, RunwayStatusBar 한 곳만 6줄 수정)

## 11. Risks

| 리스크 | 가능성 | 완화 |
|---|---|---|
| RunwayStatusBar가 다른 metric도 함께 표시 → mockFinancialHealth만 교체하면 일관성 깨짐 | 중간 | 구현 시점에 status bar 전체 props 흐름 점검 후 결정 |
| 환율 1300 KRW/USD 고정으로 KRW 입력 시 USD 표시값과 시각적 불일치 | 낮음 | 시연 narrative에서 "환율 상수 사용" 짧게 언급 |
| 1조 KRW 같은 극단값 → 게이지 max 초과 | 낮음 | `MAX_RUNWAY_MONTHS` 캡 + 시각화 max 18 고정 |
| storage event가 같은 탭에서 안 발화 → 입력 후 즉시 갱신 안 됨 | 높음 | PR-B의 `onSaved` 콜백이 이미 dialog 닫음. 새로고침 시 갱신. 같은 탭 즉시 갱신은 PR-D 영역 |

## 12. Demo Script 추가분

> "재무 카드에서 입력 → 저장 → 다른 페이지로 이동하면 상단 status bar의 burn tolerance, runway가 입력값 기반으로 갱신됩니다. 이 값들은 환율 상수 변환 후 mock fallback을 override합니다 — 입력 안 한 상태에서는 디폴트 값 그대로."

데모 흐름 보강:
1. (PR-B 흐름) 재무 카드에 시드값 입력 → 저장 → 새로고침
2. **NEW**: 다른 dashboard 페이지로 이동 (예: `/dashboard/overview`)
3. **NEW**: 상단 status bar의 burn tolerance / runway / netBurn 값이 입력 기반으로 변경된 것 확인

## 13. References

- PR-A 머지: `7aacf83` (PR #13)
- PR-B 머지: `c0567dc` (PR #14)
- Demo script: `docs/demo/2026-04-30-yieldo-demo-script.md` (`8a99640`)
- PR-B spec: `docs/superpowers/specs/2026-04-29-connections-pr-b-financial-design.md`
- 메모리 `project_connections_demo_pack_shipped.md`
