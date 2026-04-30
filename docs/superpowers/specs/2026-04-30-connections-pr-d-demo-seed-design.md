# Connections PR-D — Demo Seed Toolbar

**Date**: 2026-04-30
**Status**: Approved (brainstorming complete — Approach A)
**Branch (planned)**: `feat/connections-pr-d-demo-seed`
**Worktree (planned)**: `.worktrees/feature-connections-pr-d-demo-seed/`
**Base**: `main` (PR-A/B 머지 완료, PR-C #17 open이지만 의존 없음)
**Driver**: 시연 자리에서 5 지표 타이핑 부담 제거. 1-clk으로 narrative 진행.

---

## 1. Goal

`/dashboard/connections` 페이지에 "데모 시드 적용" + "초기화" 두 버튼 추가. 클릭 시 localStorage에 mid-stage mobile gaming 회사 5-metric 시드값을 한 번에 주입하고, manual-financial 카드 status가 즉시 connected로 갱신된다.

시연 발표자가 "이 버튼 누르면 5개 지표 입력 끝"을 한 컷에 처리.

## 2. Non-Goals

- URL flag `?demo=1` (Approach B) — Tier 2
- AppsFlyer mock 등록 (PR-A에서 mock-financial만 토글; AppsFlyer는 진짜 등록 필요)
- 다른 connector 시드 (Adjust/Statsig/GameAnalytics는 placeholder wizard만)
- 시드값 편집 UI — 상수 1세트만

## 3. Architecture

```
shared/api/financial-input-seed.ts (NEW)
  ├─ DEMO_SEED constant — 5 fields
  ├─ applyDemoSeed() — calls saveFinancialInput(DEMO_SEED)
  └─ resetDemoSeed() — calls clearFinancialInput()

widgets/connections/ui/demo-seed-toolbar.tsx (NEW)
  └─ 2 buttons + confirm UX. Calls apply/reset + onChange callback.

widgets/connections/ui/connections-client.tsx (modify)
  └─ Render <DemoSeedToolbar onChange={refreshFinancial} /> at top
```

## 4. 변경 파일

| 파일 | 변경 | 라인 |
|---|---|---|
| `yieldo/src/shared/api/financial-input-seed.ts` | 신규 | +30 |
| `yieldo/src/shared/api/__tests__/financial-input-seed.test.ts` | 신규 | +40 |
| `yieldo/src/widgets/connections/ui/demo-seed-toolbar.tsx` | 신규 | +60 |
| `yieldo/src/widgets/connections/__tests__/demo-seed-toolbar.test.tsx` | 신규 | +60 |
| `yieldo/src/widgets/connections/ui/connections-client.tsx` | toolbar 렌더 + onChange wiring | +5 |

라인 합계 ~+195.

## 5. 시드값 — `DEMO_SEED`

```ts
import type { FinancialInput } from "./financial-input"

export const DEMO_SEED: Omit<FinancialInput, "savedAt"> = {
  monthlyRevenue: 50_000_000,
  uaSpend: 20_000_000,
  cashBalance: 500_000_000,
  monthlyBurn: 30_000_000,
  targetPaybackMonths: 12,
}
```

CLAUDE.md §11 Match League 기준. 이 시드로 PR-C `deriveFinancialHealth`가 burn tolerance 12 (green), runway capped at 18 (green), payback day 360을 계산.

## 6. 헬퍼 함수

```ts
import { saveFinancialInput, clearFinancialInput } from "./financial-input"

export function applyDemoSeed(): void {
  saveFinancialInput(DEMO_SEED)
}

export function resetDemoSeed(): void {
  clearFinancialInput()
}
```

얇은 wrapper. 의도가 코드에서 self-evident — "데모용"이라는 의미는 함수명 + 호출 사이트로 표현.

## 7. DemoSeedToolbar UX

**Props**:
```ts
type Props = {
  hasInput: boolean       // 현재 financial input 있는지 (UI hint)
  onChange: () => void    // apply/reset 후 부모에게 갱신 알림
}
```

**Layout**:
- Connections 페이지의 카테고리 그룹 위, "연동 추가" 버튼과 같은 row.
- 좌측: "데모 시드" 라벨 + 작은 글씨 "1-clk으로 5개 지표 채우기"
- 우측: 두 버튼:
  - **"적용"** (primary) — `hasInput=false`일 때만 활성. confirm 없이 바로 apply.
  - **"초기화"** (secondary) — `hasInput=true`일 때만 활성. confirm dialog: "재무 입력값을 모두 지웁니다. 계속할까요?"

**Behavior**:
- 적용: `applyDemoSeed()` → `onChange()` → ConnectionsClient의 refreshFinancial 호출 → 카드 connected
- 초기화: confirm 후 `resetDemoSeed()` → `onChange()` → 카드 disconnected

**Visual**: 기존 yieldo 토큰 사용 (`border-border`, `bg-muted`, `bg-primary`, `text-primary-foreground`). 별도 스타일 없음.

## 8. ConnectionsClient 통합

```tsx
import { DemoSeedToolbar } from "./demo-seed-toolbar"

// 안에서:
const { hasFinancialInput, refreshFinancial } = ... (existing PR-B state)

// render 안:
<DemoSeedToolbar
  hasInput={hasFinancialInput}
  onChange={refreshFinancial}
/>
```

Toolbar는 connector 카드 grid 위에 배치. 기존 "연동 추가" disabled 버튼이 있는 row에 합치거나, 별도 row.

## 9. Testing

### 9.1 `financial-input-seed.ts`

| 테스트 | 검증 |
|---|---|
| `DEMO_SEED` 값이 spec과 일치 (5 fields) | 회귀 |
| `applyDemoSeed()` 후 `loadFinancialInput()` 결과 = DEMO_SEED + savedAt | round-trip |
| `resetDemoSeed()` 후 `loadFinancialInput()` 결과 null | clear |

### 9.2 `DemoSeedToolbar`

| 테스트 | 검증 |
|---|---|
| `hasInput=false` 시 "적용" 활성 / "초기화" 비활성 | UI 상태 |
| `hasInput=true` 시 "적용" 비활성 / "초기화" 활성 | UI 상태 |
| "적용" 클릭 → `onChange` 호출 + localStorage에 시드 저장 | apply path |
| "초기화" 클릭 → confirm dialog 표시 → 확인 클릭 → `onChange` + localStorage 비움 | reset path |
| "초기화" confirm 취소 → localStorage 변경 없음 | safety |

### 9.3 회귀

기존 29 files / 162 tests (PR-C 머지 후 base) 또는 27 files / 152 tests (PR-C 미머지 base) 그대로 통과.

## 10. Worktree & Branch

- 새 worktree: `.worktrees/feature-connections-pr-d-demo-seed/`
- branch: `feat/connections-pr-d-demo-seed`
- base: main (현재 `2d56ec3` 또는 그 이후)

PR-C #17과 의존 없음 — 별도 머지 가능. PR-C가 먼저 머지되면 자동 흡수, 늦게 머지되면 PR-D는 그대로 동작 (`saveFinancialInput`만 사용).

## 11. Risks

| 리스크 | 가능성 | 완화 |
|---|---|---|
| confirm dialog UX가 시연 자리에서 어색 | 중간 | "초기화"만 confirm. "적용"은 즉시 — 시연 도중 reset이 더 위험 |
| 시드값이 PR-C의 derive 결과와 너무 평탄해서 burn tolerance가 항상 green | 낮음 | 의도 — 안정 narrative. 추후 "demo dramatic" 시드 추가 가능 |
| ConnectionsClient render order로 toolbar가 아래 카드 그룹과 겹침 | 낮음 | 기존 mb-* 토큰으로 spacing |

## 12. Demo Script 추가분

> "여기 '데모 시드 적용' 버튼을 누르면, 입력창을 일일이 채울 필요 없이 mid-stage 게임 회사 5개 지표가 한 번에 들어갑니다. 카드가 즉시 '연결됨'으로 바뀌고, 다음 페이지 status bar에서 burn tolerance와 runway가 갱신됩니다."

## 13. References

- PR-A 머지: `7aacf83` (PR #13)
- PR-B 머지: `c0567dc` (PR #14)
- PR-C: open #17 (`d4703bf` HEAD)
- PR-B financial-input.ts (`saveFinancialInput`, `clearFinancialInput`, `loadFinancialInput`)
- 메모리 `feedback_default_to_recommendation.md`
