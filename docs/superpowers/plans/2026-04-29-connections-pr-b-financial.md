# Connections PR-B (Financial Manual Input) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `manual-financial` connector를 클릭하면 PlaceholderWizardDialog 대신 진짜 5-metric 입력 폼이 뜨고, 저장 시 localStorage에 영구 저장되며 카드 status가 connected로 토글되도록 한다.

**Architecture:** zod 기반 입력 스키마 + localStorage save/load 헬퍼를 `shared/api`에 분리. 폼 컴포넌트는 useState + useEffect만 사용 (외부 폼 라이브러리 X). ConnectionDialog에 `id === "manual-financial"` 분기 1개 추가, ConnectionsClient는 localStorage를 읽어 registered 상태에 merge.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · zod (이미 dependency) · Tailwind v4 · Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-04-29-connections-pr-b-financial-design.md`

**Worktree:** `.worktrees/feature-connections-pr-b-financial/`
**Branch:** `feat/connections-pr-b-financial`
**Base:** `main` @ `3bf2822` (이 plan commit 직전 또는 이후)

---

## Task 0: Worktree + Branch + 의존성

**Files:**
- Create worktree: `.worktrees/feature-connections-pr-b-financial/`

- [ ] **Step 1: Worktree 생성**

```bash
cd /Users/mike/Downloads/Compass
git worktree add .worktrees/feature-connections-pr-b-financial -b feat/connections-pr-b-financial
```

- [ ] **Step 2: 의존성 설치 (백그라운드)**

```bash
cd .worktrees/feature-connections-pr-b-financial/yieldo
npm install --legacy-peer-deps
```

Expected: `added N packages`. ~1-2 min.

- [ ] **Step 3: 베이스라인 테스트**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-b-financial/yieldo
npx vitest run
```

Expected: 25 files / 135 tests passing (PR-A 머지 후 baseline). NOTE: `--reporter=basic`는 vitest 4.x에서 broken — 기본 리포터 사용.

---

## Task 1: financial-input.ts (schema + storage 헬퍼)

**Files:**
- Create: `yieldo/src/shared/api/financial-input.ts`
- Test: `yieldo/src/shared/api/__tests__/financial-input.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

Create `yieldo/src/shared/api/__tests__/financial-input.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest"
import {
  FinancialInputSchema,
  FINANCIAL_INPUT_KEY,
  loadFinancialInput,
  saveFinancialInput,
  clearFinancialInput,
} from "@/shared/api/financial-input"

describe("FinancialInputSchema", () => {
  it("accepts valid input", () => {
    const result = FinancialInputSchema.safeParse({
      monthlyRevenue: 50_000_000,
      uaSpend: 20_000_000,
      cashBalance: 500_000_000,
      monthlyBurn: 30_000_000,
      targetPaybackMonths: 12,
      savedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })

  it("rejects negative numbers", () => {
    const result = FinancialInputSchema.safeParse({
      monthlyRevenue: -1,
      uaSpend: 0,
      cashBalance: 0,
      monthlyBurn: 0,
      targetPaybackMonths: 1,
      savedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it("rejects payback > 60 months", () => {
    const result = FinancialInputSchema.safeParse({
      monthlyRevenue: 0,
      uaSpend: 0,
      cashBalance: 0,
      monthlyBurn: 0,
      targetPaybackMonths: 61,
      savedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it("rejects non-integer payback", () => {
    const result = FinancialInputSchema.safeParse({
      monthlyRevenue: 0,
      uaSpend: 0,
      cashBalance: 0,
      monthlyBurn: 0,
      targetPaybackMonths: 12.5,
      savedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })
})

describe("Financial input storage", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("returns null when nothing stored", () => {
    expect(loadFinancialInput()).toBeNull()
  })

  it("save → load round-trip preserves values + adds savedAt", () => {
    const before = Date.now()
    const saved = saveFinancialInput({
      monthlyRevenue: 50_000_000,
      uaSpend: 20_000_000,
      cashBalance: 500_000_000,
      monthlyBurn: 30_000_000,
      targetPaybackMonths: 12,
    })
    const after = Date.now()
    expect(new Date(saved.savedAt).getTime()).toBeGreaterThanOrEqual(before)
    expect(new Date(saved.savedAt).getTime()).toBeLessThanOrEqual(after)
    const loaded = loadFinancialInput()
    expect(loaded).toEqual(saved)
  })

  it("returns null when stored JSON is invalid", () => {
    window.localStorage.setItem(FINANCIAL_INPUT_KEY, "{not-json")
    expect(loadFinancialInput()).toBeNull()
  })

  it("returns null when stored value fails schema", () => {
    window.localStorage.setItem(
      FINANCIAL_INPUT_KEY,
      JSON.stringify({ monthlyRevenue: -1 }),
    )
    expect(loadFinancialInput()).toBeNull()
  })

  it("clearFinancialInput removes the entry", () => {
    saveFinancialInput({
      monthlyRevenue: 0,
      uaSpend: 0,
      cashBalance: 0,
      monthlyBurn: 0,
      targetPaybackMonths: 1,
    })
    expect(loadFinancialInput()).not.toBeNull()
    clearFinancialInput()
    expect(loadFinancialInput()).toBeNull()
  })

  it("uses versioned key", () => {
    expect(FINANCIAL_INPUT_KEY).toBe("yieldo:financial-input:v1")
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-b-financial/yieldo
npx vitest run src/shared/api/__tests__/financial-input.test.ts
```

Expected: all fail with "Cannot find module '@/shared/api/financial-input'".

- [ ] **Step 3: 구현**

Create `yieldo/src/shared/api/financial-input.ts`:

```ts
import { z } from "zod"

export const FinancialInputSchema = z.object({
  monthlyRevenue: z.number().min(0).max(1e15),
  uaSpend: z.number().min(0).max(1e15),
  cashBalance: z.number().min(0).max(1e15),
  monthlyBurn: z.number().min(0).max(1e15),
  targetPaybackMonths: z.number().int().min(1).max(60),
  savedAt: z.string().datetime(),
})

export type FinancialInput = z.infer<typeof FinancialInputSchema>

export const FINANCIAL_INPUT_KEY = "yieldo:financial-input:v1"

export function loadFinancialInput(): FinancialInput | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(FINANCIAL_INPUT_KEY)
  if (!raw) return null
  try {
    const parsed = FinancialInputSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveFinancialInput(
  value: Omit<FinancialInput, "savedAt">,
): FinancialInput {
  const enriched: FinancialInput = {
    ...value,
    savedAt: new Date().toISOString(),
  }
  FinancialInputSchema.parse(enriched)
  if (typeof window !== "undefined") {
    window.localStorage.setItem(FINANCIAL_INPUT_KEY, JSON.stringify(enriched))
  }
  return enriched
}

export function clearFinancialInput(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(FINANCIAL_INPUT_KEY)
}
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run src/shared/api/__tests__/financial-input.test.ts
```

Expected: all 11 tests passing.

- [ ] **Step 5: 커밋**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-b-financial
git add yieldo/src/shared/api/financial-input.ts yieldo/src/shared/api/__tests__/financial-input.test.ts
git commit -m "feat(connections): add financial-input zod schema + localStorage helpers

5-metric Tier 1 Visible.vc model with versioned key.
SSR-safe (window guards). Schema rejects invalid persisted JSON."
```

---

## Task 2: FinancialInputForm 컴포넌트

**Files:**
- Create: `yieldo/src/widgets/connections/ui/financial-input-form.tsx`
- Test: `yieldo/src/widgets/connections/__tests__/financial-input-form.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

Create `yieldo/src/widgets/connections/__tests__/financial-input-form.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FinancialInputForm } from "@/widgets/connections/ui/financial-input-form"
import {
  FINANCIAL_INPUT_KEY,
  loadFinancialInput,
} from "@/shared/api/financial-input"

describe("FinancialInputForm", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("renders 5 input fields with KRW labels", () => {
    render(<FinancialInputForm onSaved={() => {}} onClose={() => {}} />)
    expect(screen.getByLabelText(/월 매출/)).toBeInTheDocument()
    expect(screen.getByLabelText(/UA 지출/)).toBeInTheDocument()
    expect(screen.getByLabelText(/현금 잔고/)).toBeInTheDocument()
    expect(screen.getByLabelText(/월 burn/)).toBeInTheDocument()
    expect(screen.getByLabelText(/목표 payback/)).toBeInTheDocument()
  })

  it("shows demo disclaimer", () => {
    render(<FinancialInputForm onSaved={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/localStorage 저장/i)).toBeInTheDocument()
  })

  it("blocks submit when fields empty", async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<FinancialInputForm onSaved={onSaved} onClose={() => {}} />)

    await user.click(screen.getByRole("button", { name: /저장/ }))
    expect(onSaved).not.toHaveBeenCalled()
    expect(loadFinancialInput()).toBeNull()
  })

  it("blocks submit on negative input", async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<FinancialInputForm onSaved={onSaved} onClose={() => {}} />)

    await user.type(screen.getByLabelText(/월 매출/), "-1")
    await user.type(screen.getByLabelText(/UA 지출/), "0")
    await user.type(screen.getByLabelText(/현금 잔고/), "0")
    await user.type(screen.getByLabelText(/월 burn/), "0")
    await user.type(screen.getByLabelText(/목표 payback/), "12")
    await user.click(screen.getByRole("button", { name: /저장/ }))

    expect(onSaved).not.toHaveBeenCalled()
  })

  it("saves valid input + calls onSaved + persists to localStorage", async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<FinancialInputForm onSaved={onSaved} onClose={() => {}} />)

    await user.type(screen.getByLabelText(/월 매출/), "50000000")
    await user.type(screen.getByLabelText(/UA 지출/), "20000000")
    await user.type(screen.getByLabelText(/현금 잔고/), "500000000")
    await user.type(screen.getByLabelText(/월 burn/), "30000000")
    await user.type(screen.getByLabelText(/목표 payback/), "12")
    await user.click(screen.getByRole("button", { name: /저장/ }))

    expect(onSaved).toHaveBeenCalledTimes(1)
    const saved = loadFinancialInput()
    expect(saved).not.toBeNull()
    expect(saved?.monthlyRevenue).toBe(50_000_000)
    expect(saved?.targetPaybackMonths).toBe(12)
  })

  it("pre-fills from localStorage when value already exists", () => {
    window.localStorage.setItem(
      FINANCIAL_INPUT_KEY,
      JSON.stringify({
        monthlyRevenue: 12345,
        uaSpend: 0,
        cashBalance: 0,
        monthlyBurn: 0,
        targetPaybackMonths: 6,
        savedAt: new Date().toISOString(),
      }),
    )

    render(<FinancialInputForm onSaved={() => {}} onClose={() => {}} />)
    expect(screen.getByLabelText(/월 매출/)).toHaveValue("12,345")
    expect(screen.getByLabelText(/목표 payback/)).toHaveValue("6")
  })
})
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/widgets/connections/__tests__/financial-input-form.test.tsx
```

Expected: all fail with "Cannot find module".

- [ ] **Step 3: 구현**

Create `yieldo/src/widgets/connections/ui/financial-input-form.tsx`:

```tsx
"use client"

import { useEffect, useId, useState } from "react"
import {
  loadFinancialInput,
  saveFinancialInput,
  type FinancialInput,
} from "@/shared/api/financial-input"

type Props = {
  onSaved: () => void
  onClose: () => void
}

type FormState = {
  monthlyRevenue: string
  uaSpend: string
  cashBalance: string
  monthlyBurn: string
  targetPaybackMonths: string
}

const EMPTY: FormState = {
  monthlyRevenue: "",
  uaSpend: "",
  cashBalance: "",
  monthlyBurn: "",
  targetPaybackMonths: "",
}

const FIELDS: Array<{
  key: keyof FormState
  label: string
  unit: "KRW" | "개월"
  placeholder: string
  isInteger?: boolean
}> = [
  { key: "monthlyRevenue", label: "월 매출", unit: "KRW", placeholder: "예: 50,000,000" },
  { key: "uaSpend", label: "UA 지출", unit: "KRW", placeholder: "예: 20,000,000" },
  { key: "cashBalance", label: "현금 잔고", unit: "KRW", placeholder: "예: 500,000,000" },
  { key: "monthlyBurn", label: "월 burn", unit: "KRW", placeholder: "예: 30,000,000" },
  { key: "targetPaybackMonths", label: "목표 payback", unit: "개월", placeholder: "예: 12", isInteger: true },
]

const formatNumber = (raw: string): string => {
  const digits = raw.replace(/[^\d-]/g, "")
  if (!digits) return ""
  const n = Number(digits)
  if (!Number.isFinite(n)) return ""
  return n.toLocaleString("ko-KR")
}

const parseNumber = (raw: string): number | null => {
  const digits = raw.replace(/[^\d-]/g, "")
  if (!digits) return null
  const n = Number(digits)
  return Number.isFinite(n) ? n : null
}

const initialFromStored = (stored: FinancialInput | null): FormState => {
  if (!stored) return EMPTY
  return {
    monthlyRevenue: stored.monthlyRevenue.toLocaleString("ko-KR"),
    uaSpend: stored.uaSpend.toLocaleString("ko-KR"),
    cashBalance: stored.cashBalance.toLocaleString("ko-KR"),
    monthlyBurn: stored.monthlyBurn.toLocaleString("ko-KR"),
    targetPaybackMonths: stored.targetPaybackMonths.toString(),
  }
}

export function FinancialInputForm({ onSaved, onClose }: Props) {
  const idPrefix = useId()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    const stored = loadFinancialInput()
    if (stored) setForm(initialFromStored(stored))
  }, [])

  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const next = key === "targetPaybackMonths" ? raw.replace(/[^\d]/g, "") : formatNumber(raw)
    setForm((prev) => ({ ...prev, [key]: next }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = {
      monthlyRevenue: parseNumber(form.monthlyRevenue),
      uaSpend: parseNumber(form.uaSpend),
      cashBalance: parseNumber(form.cashBalance),
      monthlyBurn: parseNumber(form.monthlyBurn),
      targetPaybackMonths: parseNumber(form.targetPaybackMonths),
    }

    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    for (const f of FIELDS) {
      const v = parsed[f.key]
      if (v === null) {
        nextErrors[f.key] = "값을 입력하세요"
      } else if (v < 0) {
        nextErrors[f.key] = "음수는 입력할 수 없습니다"
      } else if (f.key === "targetPaybackMonths") {
        if (!Number.isInteger(v) || v < 1 || v > 60) {
          nextErrors[f.key] = "1~60 사이 정수를 입력하세요"
        }
      } else if (v > 1e15) {
        nextErrors[f.key] = "값이 너무 큽니다"
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      saveFinancialInput({
        monthlyRevenue: parsed.monthlyRevenue!,
        uaSpend: parsed.uaSpend!,
        cashBalance: parsed.cashBalance!,
        monthlyBurn: parsed.monthlyBurn!,
        targetPaybackMonths: parsed.targetPaybackMonths!,
      })
      setSavedFlash(true)
      onSaved()
      setTimeout(() => {
        setSavedFlash(false)
        onClose()
      }, 1000)
    } catch {
      setErrors({ monthlyRevenue: "저장 실패 — 다시 시도하세요" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <header>
        <h2 className="text-lg font-bold">재무 직접 입력</h2>
        <p className="text-sm text-muted-foreground">
          Visible.vc 모델 · KRW · 5개 지표
        </p>
      </header>

      <div className="space-y-3">
        {FIELDS.map((f) => {
          const id = `${idPrefix}-${f.key}`
          const err = errors[f.key]
          return (
            <div key={f.key}>
              <label htmlFor={id} className="block text-xs font-bold mb-1">
                {f.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={id}
                  type="text"
                  inputMode="numeric"
                  value={form[f.key]}
                  onChange={handleChange(f.key)}
                  placeholder={f.placeholder}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                  aria-invalid={!!err}
                  aria-describedby={err ? `${id}-error` : undefined}
                />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {f.unit}
                </span>
              </div>
              {err && (
                <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
                  {err}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          {savedFlash ? "저장됨" : "저장"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          취소
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        localStorage 저장 — 멀티 디바이스 동기화는 Tier 2(Supabase)부터 지원됩니다.
      </p>
    </form>
  )
}
```

- [ ] **Step 4: 통과 확인 + 회귀 점검**

```bash
npx vitest run src/widgets/connections
```

Expected: 6 form tests + 기존 connections 테스트 모두 통과.

- [ ] **Step 5: 커밋**

```bash
git add yieldo/src/widgets/connections/ui/financial-input-form.tsx yieldo/src/widgets/connections/__tests__/financial-input-form.test.tsx
git commit -m "feat(connections): add FinancialInputForm with 5-metric Visible.vc model

useState + zod validation, KRW comma formatting, pre-fill from localStorage,
1-second save flash before auto-close. SSR-safe."
```

---

## Task 3: ConnectionDialog + ConnectionsClient 통합

**Files:**
- Modify: `yieldo/src/widgets/connections/ui/connection-dialog.tsx`
- Modify: `yieldo/src/widgets/connections/ui/connections-client.tsx`
- Test: `yieldo/src/widgets/connections/__tests__/connection-dialog.test.tsx` (확장)

- [ ] **Step 1: ConnectionDialog 테스트 확장**

Append to `yieldo/src/widgets/connections/__tests__/connection-dialog.test.tsx`:

```tsx
const manualFinancial: Connection = {
  id: "manual-financial",
  brand: "재무 직접 입력",
  category: "financial",
  description: "5-metric",
  status: "disconnected",
}

it("renders FinancialInputForm for manual-financial connector", () => {
  render(<ConnectionDialog connection={manualFinancial} onClose={() => {}} />)
  expect(screen.getByLabelText(/월 매출/)).toBeInTheDocument()
  expect(screen.queryByText(/시연용 placeholder/i)).not.toBeInTheDocument()
})
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/widgets/connections/__tests__/connection-dialog.test.tsx
```

Expected: 신규 테스트 fail (현재는 PlaceholderWizardDialog가 표시됨).

- [ ] **Step 3: ConnectionDialog 분기 추가**

Read the current `yieldo/src/widgets/connections/ui/connection-dialog.tsx` first. Locate the JSX block where `connection.id !== "appsflyer"` decides between PlaceholderWizardDialog and the AppsFlyer flow. Replace that branching with:

```tsx
{connection.id === "appsflyer" ? (
  connection.status === "disconnected" ? (
    <RegisterForm
      onSuccess={(appId) => {
        onRegistered?.(appId)
        onClose()
      }}
    />
  ) : (
    /* existing metrics view — keep as-is */
    <div className="space-y-3">
      {/* preserve original metrics view content */}
    </div>
  )
) : connection.id === "manual-financial" ? (
  <FinancialInputForm
    onSaved={() => onRegistered?.("manual-financial")}
    onClose={onClose}
  />
) : (
  <PlaceholderWizardDialog
    connection={connection}
    onClose={onClose}
  />
)}
```

Add the import at the top:

```tsx
import { FinancialInputForm } from "./financial-input-form"
```

NOTE: When applying this edit, preserve the existing metrics view content (`<div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">상태:` block + metrics grid) byte-for-byte from the current implementation. Do not rewrite that — only add the new branch and the manual-financial branch.

- [ ] **Step 4: ConnectionsClient에 financial 상태 추가**

Read the current `yieldo/src/widgets/connections/ui/connections-client.tsx` first. Add the imports near existing imports:

```tsx
import { loadFinancialInput } from "@/shared/api/financial-input"
```

Inside the `ConnectionsClient` component:

1. Add a state next to `registered`:
```tsx
const [hasFinancialInput, setHasFinancialInput] = useState(false)
```

2. Add a refresh callback alongside `refreshApps`:
```tsx
const refreshFinancial = useCallback(() => {
  setHasFinancialInput(loadFinancialInput() !== null)
}, [])
```

3. Add a useEffect after the existing apps effect:
```tsx
useEffect(() => {
  refreshFinancial()
}, [refreshFinancial])
```

4. Update the `allConnectors` mapping to merge financial state:
```tsx
const allConnectors: Connection[] = AVAILABLE_CONNECTORS.map(
  (c): Connection => ({
    ...c,
    status:
      registered.includes(c.id) ||
      (c.id === "manual-financial" && hasFinancialInput)
        ? "connected"
        : "disconnected",
  }),
)
```

5. Update the dialog `onRegistered` to dispatch by id:
```tsx
<ConnectionDialog
  connection={active}
  onClose={() => setActive(null)}
  onRegistered={(id) => {
    if (id === "manual-financial") {
      refreshFinancial()
    } else {
      refreshApps()
    }
  }}
/>
```

- [ ] **Step 5: 전체 connections 테스트 통과 확인**

```bash
npx vitest run src/widgets/connections
```

Expected: 모든 테스트 통과 (기존 + 신규 dialog branch).

- [ ] **Step 6: 커밋**

```bash
git add yieldo/src/widgets/connections/ui/connection-dialog.tsx \
        yieldo/src/widgets/connections/ui/connections-client.tsx \
        yieldo/src/widgets/connections/__tests__/connection-dialog.test.tsx
git commit -m "feat(connections): wire FinancialInputForm into ConnectionDialog + Client

manual-financial card now opens real form. ConnectionsClient reads
localStorage to flip card status to connected. onRegistered prop
dispatches by connector id."
```

---

## Task 4: 수동 점검 (dev 서버)

- [ ] **Step 1: dev 서버**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-b-financial/yieldo
npm run dev -- --port 3000
```

- [ ] **Step 2: /dashboard/connections 검증**

브라우저 http://localhost:3000/dashboard/connections

- [ ] 재무 카테고리 "재무 직접 입력" 카드 클릭 → wizard 아닌 5-field form 표시
- [ ] 빈 상태로 "저장" 클릭 → 모든 필드에 inline 에러 표시
- [ ] 5 필드 정상값 입력 (예: 50000000 / 20000000 / 500000000 / 30000000 / 12) → 콤마 자동 포맷 → "저장" 클릭 → "저장됨" 1초 후 dialog 자동 닫힘
- [ ] 페이지 새로고침 → manual-financial 카드 status "연결됨"
- [ ] 다시 카드 클릭 → form pre-filled (저장된 값 표시)
- [ ] 다른 connector(Statsig 등) 회귀 — wizard 그대로 동작

- [ ] **Step 3: dev 서버 종료**

`Ctrl+C`.

---

## Task 5: 풀 게이트 + 푸시 + PR

- [ ] **Step 1: lint clean (신규 코드 0 신규 에러)**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-b-financial/yieldo
npm run lint 2>&1 | grep -E "financial-input|connections/ui/connection-dialog|connections/ui/connections-client" | head
```

Expected: empty output. 베이스라인 ESLint 에러는 별도 cleanup PR.

- [ ] **Step 2: tsc clean**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected: 0 errors.

- [ ] **Step 3: 전체 테스트**

```bash
npx vitest run
```

Expected: 28 files / 152 tests (baseline 25/135 + 신규 schema 11 + form 6 + dialog 1 = 18 → 153) 또는 그 근처.

- [ ] **Step 4: 빌드**

```bash
npm run build 2>&1 | tail -15
```

Expected: `Compiled successfully`.

- [ ] **Step 5: 푸시 + PR**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr-b-financial
git push -u origin feat/connections-pr-b-financial
gh pr create --title "feat(connections): PR-B — financial manual input form (5 metrics, localStorage)" --body "$(cat <<'EOF'
## Summary

- `manual-financial` connector 카드 클릭 → PlaceholderWizardDialog 대신 실제 5-metric 입력 폼 표시
- 입력값 zod 검증 + localStorage `yieldo:financial-input:v1`에 저장
- 카드 status 자동 토글 (저장 후 새로고침해도 "연결됨" 유지)
- pre-fill: 재방문 시 저장된 값으로 폼 채워짐 (edit mode)

Spec: `docs/superpowers/specs/2026-04-29-connections-pr-b-financial-design.md`
Plan: `docs/superpowers/plans/2026-04-29-connections-pr-b-financial.md`

## Test plan

- [x] `vitest run` — schema 11 + form 6 + dialog 1 = 18 신규 테스트
- [x] `tsc --noEmit` — 0 errors
- [x] `npm run build` — compile 성공
- [ ] Vercel preview에서 카드 클릭 → 폼 → 저장 → 새로고침 → 연결됨 사이클 확인

## Disclaimer

Tier 1 (localStorage). Tier 2(Supabase + 멀티 디바이스 동기화)는 별도.
PR-A demo-pack과 함께 4-silo 모두 input 흐름 시연 가능.
EOF
)"
```

- [ ] **Step 6: PR URL 사용자에게 보고**

---

## Self-Review

**1. Spec coverage:**
- §3 Architecture ↔ Tasks 1+2+3 매핑 ✓
- §4 변경 파일 6개 — Task 1 (financial-input + 테스트), Task 2 (form + 테스트), Task 3 (dialog + client + 테스트 확장) 모두 매핑 ✓
- §5 Schema/Storage — Task 1 코드에 zod schema + load/save/clear 모두 포함 ✓
- §6 UX 디테일 — Task 2 코드에 5 fields + 라벨/단위/placeholder/콤마 포맷/pre-fill/disclaimer 포함 ✓
- §7 ConnectionsClient — Task 3 step 4 모든 변경 포함 ✓
- §8 ConnectionDialog 분기 — Task 3 step 3 ✓
- §10 Testing — Task 1 (11 schema/storage tests), Task 2 (6 form tests), Task 3 (dialog branch test) ✓

**2. Placeholder scan:** TBD/TODO/"implement later" 0건. 모든 step에 실제 코드 포함. Task 3은 "preserve metrics view content" 지시 — 기존 코드 유지를 명시했으므로 placeholder 아님 ✓

**3. Type consistency:**
- `FinancialInput` (Task 1) → `loadFinancialInput()` 반환 타입 (Task 2 mount 효과) ↔ `saveFinancialInput()` 입력 (Task 2 submit) — 모두 일관 ✓
- `Props.onSaved: () => void` (Task 2) ↔ `onSaved={() => onRegistered?.("manual-financial")}` (Task 3) ↔ `onRegistered: (id: string) => void` (기존 + Task 3 step 4) ✓
- `FINANCIAL_INPUT_KEY` 문자열 `"yieldo:financial-input:v1"` — Task 1 schema export, Task 1 테스트 expect, 모두 일치 ✓

**4. Gap check:** 없음.

---

## 실행 옵션

Plan 작성 완료. 추천: **Subagent-Driven**. 추천 자동 채택 정책에 따라 user reject 없으면 그대로 직진.
