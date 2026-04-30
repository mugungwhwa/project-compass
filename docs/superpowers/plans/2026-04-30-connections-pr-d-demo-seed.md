# Connections PR-D (Demo Seed Toolbar) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connections 페이지에 "데모 시드 적용" + "초기화" 두 버튼 추가. 1-clk으로 mid-stage 게임 회사 5-metric 시드값을 localStorage에 주입해 시연 입력 부담 제거.

**Architecture:** PR-B의 `saveFinancialInput`/`clearFinancialInput`을 얇게 wrap하는 `applyDemoSeed`/`resetDemoSeed` 헬퍼 + `DemoSeedToolbar` UI 컴포넌트. ConnectionsClient는 toolbar를 카드 grid 위에 렌더하고 onChange로 financial state를 갱신.

**Tech Stack:** Next.js 16 · React 19 · TypeScript · Vitest + Testing Library · 기존 `@/shared/api/financial-input` 재사용.

**Spec:** `docs/superpowers/specs/2026-04-30-connections-pr-d-demo-seed-design.md`

**Worktree:** `.worktrees/feature-connections-pr-d-demo-seed/`
**Branch:** `feat/connections-pr-d-demo-seed`
**Base:** `main` (PR-C #17 의존 없음 — 어떤 순서로 머지돼도 OK)

---

## Task 0: Worktree + 의존성 + 베이스라인

- [ ] **Step 1: Worktree 생성**

```bash
cd /Users/mike/Downloads/Compass
git worktree add .worktrees/feature-connections-pr-d-demo-seed -b feat/connections-pr-d-demo-seed
```

- [ ] **Step 2: npm install**

```bash
cd .worktrees/feature-connections-pr-d-demo-seed/yieldo
npm install --legacy-peer-deps
```

- [ ] **Step 3: 베이스라인**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-d-demo-seed/yieldo
npx vitest run
```

Expected: 27 files / 152 tests (main 기준). NOTE: 기본 reporter — `--reporter=basic` 금지.

---

## Task 1: `financial-input-seed.ts`

**Files:**
- Create: `yieldo/src/shared/api/financial-input-seed.ts`
- Test: `yieldo/src/shared/api/__tests__/financial-input-seed.test.ts`

- [ ] **Step 1: 실패 테스트**

Create `yieldo/src/shared/api/__tests__/financial-input-seed.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest"
import {
  DEMO_SEED,
  applyDemoSeed,
  resetDemoSeed,
} from "@/shared/api/financial-input-seed"
import { loadFinancialInput } from "@/shared/api/financial-input"

describe("DEMO_SEED constant", () => {
  it("has the 5 spec values", () => {
    expect(DEMO_SEED).toEqual({
      monthlyRevenue: 50_000_000,
      uaSpend: 20_000_000,
      cashBalance: 500_000_000,
      monthlyBurn: 30_000_000,
      targetPaybackMonths: 12,
    })
  })
})

describe("applyDemoSeed / resetDemoSeed", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("applyDemoSeed → loadFinancialInput returns DEMO_SEED + savedAt", () => {
    applyDemoSeed()
    const loaded = loadFinancialInput()
    expect(loaded).not.toBeNull()
    expect(loaded?.monthlyRevenue).toBe(DEMO_SEED.monthlyRevenue)
    expect(loaded?.uaSpend).toBe(DEMO_SEED.uaSpend)
    expect(loaded?.cashBalance).toBe(DEMO_SEED.cashBalance)
    expect(loaded?.monthlyBurn).toBe(DEMO_SEED.monthlyBurn)
    expect(loaded?.targetPaybackMonths).toBe(DEMO_SEED.targetPaybackMonths)
    expect(typeof loaded?.savedAt).toBe("string")
  })

  it("resetDemoSeed clears stored input", () => {
    applyDemoSeed()
    expect(loadFinancialInput()).not.toBeNull()
    resetDemoSeed()
    expect(loadFinancialInput()).toBeNull()
  })
})
```

- [ ] **Step 2: 실패 확인**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-d-demo-seed/yieldo
npx vitest run src/shared/api/__tests__/financial-input-seed.test.ts
```

Expected: fail with module-not-found.

- [ ] **Step 3: 구현**

Create `yieldo/src/shared/api/financial-input-seed.ts`:

```ts
import {
  saveFinancialInput,
  clearFinancialInput,
  type FinancialInput,
} from "./financial-input"

export const DEMO_SEED: Omit<FinancialInput, "savedAt"> = {
  monthlyRevenue: 50_000_000,
  uaSpend: 20_000_000,
  cashBalance: 500_000_000,
  monthlyBurn: 30_000_000,
  targetPaybackMonths: 12,
}

export function applyDemoSeed(): void {
  saveFinancialInput(DEMO_SEED)
}

export function resetDemoSeed(): void {
  clearFinancialInput()
}
```

- [ ] **Step 4: 통과 확인 + 회귀**

```bash
npx vitest run src/shared/api/__tests__/financial-input-seed.test.ts
npx vitest run
```

Expected: 3 seed tests pass. Full suite: 28 files / 155 tests.

- [ ] **Step 5: 커밋**

From worktree root:

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-d-demo-seed
git add yieldo/src/shared/api/financial-input-seed.ts yieldo/src/shared/api/__tests__/financial-input-seed.test.ts
git commit -m "feat(connections): add DEMO_SEED + applyDemoSeed/resetDemoSeed helpers

Mid-stage mobile gaming 5-metric values for 1-clk demo seeding.
Thin wrappers over saveFinancialInput / clearFinancialInput."
```

---

## Task 2: `DemoSeedToolbar` 컴포넌트

**Files:**
- Create: `yieldo/src/widgets/connections/ui/demo-seed-toolbar.tsx`
- Test: `yieldo/src/widgets/connections/__tests__/demo-seed-toolbar.test.tsx`

- [ ] **Step 1: 실패 테스트**

Create `yieldo/src/widgets/connections/__tests__/demo-seed-toolbar.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DemoSeedToolbar } from "@/widgets/connections/ui/demo-seed-toolbar"
import { loadFinancialInput } from "@/shared/api/financial-input"

describe("DemoSeedToolbar", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("renders both buttons", () => {
    render(<DemoSeedToolbar hasInput={false} onChange={() => {}} />)
    expect(screen.getByRole("button", { name: /적용/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /초기화/ })).toBeInTheDocument()
  })

  it("disables 적용 when hasInput=true and 초기화 when hasInput=false", () => {
    const { rerender } = render(
      <DemoSeedToolbar hasInput={false} onChange={() => {}} />,
    )
    expect(screen.getByRole("button", { name: /적용/ })).toBeEnabled()
    expect(screen.getByRole("button", { name: /초기화/ })).toBeDisabled()

    rerender(<DemoSeedToolbar hasInput={true} onChange={() => {}} />)
    expect(screen.getByRole("button", { name: /적용/ })).toBeDisabled()
    expect(screen.getByRole("button", { name: /초기화/ })).toBeEnabled()
  })

  it("적용 클릭 → onChange + DEMO_SEED 저장", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DemoSeedToolbar hasInput={false} onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: /적용/ }))
    expect(onChange).toHaveBeenCalledTimes(1)
    const loaded = loadFinancialInput()
    expect(loaded?.monthlyRevenue).toBe(50_000_000)
  })

  it("초기화 → confirm 확인 시 onChange + localStorage 비움", async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
    const onChange = vi.fn()

    // pre-seed localStorage
    window.localStorage.setItem(
      "yieldo:financial-input:v1",
      JSON.stringify({
        monthlyRevenue: 1,
        uaSpend: 0,
        cashBalance: 0,
        monthlyBurn: 0,
        targetPaybackMonths: 1,
        savedAt: new Date().toISOString(),
      }),
    )

    render(<DemoSeedToolbar hasInput={true} onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: /초기화/ }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(loadFinancialInput()).toBeNull()
    confirmSpy.mockRestore()
  })

  it("초기화 → confirm 취소 시 onChange 호출 안 됨, localStorage 유지", async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)
    const onChange = vi.fn()

    window.localStorage.setItem(
      "yieldo:financial-input:v1",
      JSON.stringify({
        monthlyRevenue: 1,
        uaSpend: 0,
        cashBalance: 0,
        monthlyBurn: 0,
        targetPaybackMonths: 1,
        savedAt: new Date().toISOString(),
      }),
    )

    render(<DemoSeedToolbar hasInput={true} onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: /초기화/ }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(loadFinancialInput()).not.toBeNull()
    confirmSpy.mockRestore()
  })
})
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/widgets/connections/__tests__/demo-seed-toolbar.test.tsx
```

Expected: fail with module-not-found.

- [ ] **Step 3: 구현**

Create `yieldo/src/widgets/connections/ui/demo-seed-toolbar.tsx`:

```tsx
"use client"

import { Sparkles, RotateCcw } from "lucide-react"
import { applyDemoSeed, resetDemoSeed } from "@/shared/api/financial-input-seed"

type Props = {
  hasInput: boolean
  onChange: () => void
}

export function DemoSeedToolbar({ hasInput, onChange }: Props) {
  const handleApply = () => {
    applyDemoSeed()
    onChange()
  }

  const handleReset = () => {
    if (window.confirm("재무 입력값을 모두 지웁니다. 계속할까요?")) {
      resetDemoSeed()
      onChange()
    }
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-2">
      <div className="text-xs">
        <div className="font-bold">데모 시드</div>
        <div className="text-muted-foreground">1-clk으로 5개 재무 지표 채우기</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleApply}
          disabled={hasInput}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4" />
          적용
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasInput}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-4 w-4" />
          초기화
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run src/widgets/connections/__tests__/demo-seed-toolbar.test.tsx
npx vitest run
```

Expected: 5 toolbar tests pass. Full suite: 29 files / 160 tests.

- [ ] **Step 5: 커밋**

```bash
git add yieldo/src/widgets/connections/ui/demo-seed-toolbar.tsx yieldo/src/widgets/connections/__tests__/demo-seed-toolbar.test.tsx
git commit -m "feat(connections): add DemoSeedToolbar with 적용/초기화 buttons

적용은 즉시 (시연 흐름), 초기화는 window.confirm으로 안전 가드.
hasInput prop으로 mutual exclusive disable."
```

---

## Task 3: ConnectionsClient에 toolbar 통합

**Files:**
- Modify: `yieldo/src/widgets/connections/ui/connections-client.tsx`

- [ ] **Step 1: 현재 파일 읽기**

```bash
cat /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-d-demo-seed/yieldo/src/widgets/connections/ui/connections-client.tsx
```

Locate:
- 기존 `useState<boolean>(false)` for `hasFinancialInput` (PR-B에서 추가됨)
- 기존 `refreshFinancial` callback (PR-B)
- render 안에서 카드 grid 시작 직전 위치 (예: "연동 추가" 버튼 row 또는 그 위)

- [ ] **Step 2: import + render 추가**

Add to imports:

```tsx
import { DemoSeedToolbar } from "./demo-seed-toolbar"
```

Add `<DemoSeedToolbar />` component just before the existing "연동 추가" disabled button row (or just before the categories `<section>` map). Pass:

```tsx
<DemoSeedToolbar
  hasInput={hasFinancialInput}
  onChange={refreshFinancial}
/>
```

NOTE: 기존 "연동 추가" 버튼 row와 분리 — toolbar는 별도 row, 그 아래에 기존 row 유지. spacing은 기존 `space-y-8` 또는 추가 `mb-4`.

If the file has a wrapping `<div className="space-y-8">`, just add the toolbar as a sibling before the `byCategory.map(...)` block. Example:

Before:
```tsx
return (
  <div className="space-y-8">
    <div className="flex items-center justify-end gap-2">
      {loading && <span ...>불러오는 중...</span>}
      <button ... disabled>연동 추가</button>
    </div>
    {byCategory.map((g) => (
      <section ...>
```

After:
```tsx
return (
  <div className="space-y-8">
    <DemoSeedToolbar
      hasInput={hasFinancialInput}
      onChange={refreshFinancial}
    />
    <div className="flex items-center justify-end gap-2">
      {loading && <span ...>불러오는 중...</span>}
      <button ... disabled>연동 추가</button>
    </div>
    {byCategory.map((g) => (
      <section ...>
```

- [ ] **Step 3: 검증**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-d-demo-seed/yieldo
npx tsc --noEmit 2>&1 | tail -3
npx vitest run
```

Expected: 0 tsc errors. 29 files / 160 tests passing (회귀 0).

- [ ] **Step 4: 커밋**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-d-demo-seed
git add yieldo/src/widgets/connections/ui/connections-client.tsx
git commit -m "feat(connections): mount DemoSeedToolbar above connector card grid

Renders demo seed apply/reset row at top of connections page.
Wired to existing hasFinancialInput state + refreshFinancial callback."
```

---

## Task 4: 풀 게이트 + 푸시 + PR

- [ ] **Step 1: lint scoped**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-d-demo-seed/yieldo
npm run lint 2>&1 | grep -E "financial-input-seed|demo-seed-toolbar|connections-client" | head
```

Expected: empty output (또는 PR-A/B/C와 동일한 baseline).

- [ ] **Step 2: tsc**

```bash
npx tsc --noEmit 2>&1 | tail -3
```

Expected: 0 errors.

- [ ] **Step 3: 전체 테스트**

```bash
npx vitest run
```

Expected: 29 files / 160 tests (152 baseline + 3 seed + 5 toolbar = 160).

- [ ] **Step 4: 빌드**

```bash
npm run build 2>&1 | tail -10
```

Expected: `Compiled successfully`.

- [ ] **Step 5: 푸시 + PR**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-d-demo-seed
git push -u origin feat/connections-pr-d-demo-seed
```

```bash
gh auth switch --user mugungwhwa
gh pr create --head feat/connections-pr-d-demo-seed --title "feat(connections): PR-D — demo seed toolbar (적용/초기화)" --body "$(cat <<'EOF'
## Summary

- 신규 DEMO_SEED 상수 + applyDemoSeed/resetDemoSeed 헬퍼 — saveFinancialInput/clearFinancialInput 위에 얇은 wrapper
- 신규 DemoSeedToolbar 컴포넌트 — 적용 (즉시) + 초기화 (window.confirm 가드)
- ConnectionsClient에 toolbar 1 row 추가 (카드 grid 위)

## Test plan

- [x] 3 seed 테스트 (DEMO_SEED 값 / round-trip / clear)
- [x] 5 toolbar 테스트 (UI 상태 / 적용 / 초기화 confirm yes/no)
- [x] tsc --noEmit: 0 errors
- [x] vitest run: 29 files / 160 tests passing
- [x] npm run build: compile 성공
- [ ] dev 서버 manual smoke (적용 → 카드 connected → 새로고침 유지 → 초기화 → disconnected)

## Disclaimer

- DEMO_SEED 값은 mid-stage Match League 회사 가정 (CLAUDE.md §11). 시연 narrative 안정 톤.
- "적용"은 confirm 없이 즉시 — 시연 흐름 우선. "초기화"만 window.confirm 가드.
- AppsFlyer mock 등록은 시드 범위 외 (별도 PR).
- PR-C #17과 의존 없음 — 어떤 순서로 머지돼도 OK.

Spec: docs/superpowers/specs/2026-04-30-connections-pr-d-demo-seed-design.md
Plan: docs/superpowers/plans/2026-04-30-connections-pr-d-demo-seed.md
EOF
)"
```

- [ ] **Step 6: PR URL 보고**

---

## Self-Review

**1. Spec coverage:**
- §3 Architecture ↔ Tasks 1+2+3 매핑 ✓
- §4 변경 파일 5개 ↔ 모두 매핑 ✓
- §5 시드값 ↔ Task 1 step 3 코드의 DEMO_SEED ✓
- §6 헬퍼 ↔ Task 1 step 3 ✓
- §7 UX ↔ Task 2 step 3 (props/disabled/confirm) ✓
- §8 ConnectionsClient 통합 ↔ Task 3 ✓
- §9 Testing ↔ Task 1 (3 tests) + Task 2 (5 tests) ✓

**2. Placeholder scan:** TBD/TODO 0건. ✓

**3. Type consistency:**
- `DEMO_SEED: Omit<FinancialInput, "savedAt">` ↔ `saveFinancialInput(DEMO_SEED)` (Task 1 헬퍼 호출) — 일관 ✓
- `Props.hasInput: boolean` ↔ ConnectionsClient의 `hasFinancialInput` state (PR-B 기존) ↔ Task 2 테스트 mock — 일관 ✓
- `Props.onChange: () => void` ↔ `refreshFinancial` callback ↔ Task 2 테스트 vi.fn() — 일관 ✓

**4. Gap check:** 없음.

---

## 실행

추천: **Subagent-Driven**. 추천 자동 채택으로 직진.
