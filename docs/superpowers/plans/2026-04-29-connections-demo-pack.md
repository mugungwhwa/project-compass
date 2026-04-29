# Connections Demo Pack (PR-A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connections 페이지의 4-silo 카드 슬롯을 모두 채우고, AppsFlyer 외 connector는 정직한 placeholder wizard dialog를 통해 등록 흐름을 시각화하며, AppsFlyer cron을 활성화해서 1주 데드라인 시연을 가능하게 한다.

**Architecture:** 신규 `PlaceholderWizardDialog` 컴포넌트를 추가하고, 기존 `ConnectionDialog`에서 `connection.id`로 분기(AppsFlyer는 기존 RegisterForm 경로 유지, 그 외는 wizard). `mock-connections.ts`의 `AVAILABLE_CONNECTORS` 카탈로그에 4개 connector(Adjust / Statsig / Manual Financial / GameAnalytics)를 추가. `vercel.json`에 cron 항목 1개 활성화.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui Dialog · Vitest + Testing Library · Vercel Cron.

**Spec:** `docs/superpowers/specs/2026-04-29-connections-demo-pack-design.md`

**Worktree:** `.worktrees/feature-connections-demo-pack/`
**Branch:** `feat/connections-demo-pack`
**Base:** `main` (commit `eefa9fb` 또는 그 이후)

---

## Task 0: Worktree + Branch + 의존성 설치

**Files:**
- Create worktree: `.worktrees/feature-connections-demo-pack/`

- [ ] **Step 1: Worktree 생성 + 브랜치 분기**

```bash
cd /Users/mike/Downloads/Compass
git worktree add .worktrees/feature-connections-demo-pack -b feat/connections-demo-pack
```

Expected: `Preparing worktree (new branch 'feat/connections-demo-pack')` + checkout 완료.

- [ ] **Step 2: 의존성 설치 (백그라운드 가능)**

```bash
cd .worktrees/feature-connections-demo-pack/yieldo
npm install --legacy-peer-deps
```

Expected: `added N packages` 메시지. 약 1-2분 소요.

- [ ] **Step 3: 베이스라인 테스트 통과 확인**

```bash
cd .worktrees/feature-connections-demo-pack/yieldo
npx vitest run --reporter=basic 2>&1 | tail -5
```

Expected: PR1 메모리 4351 기준 107 tests passing across 19 files. 새 테스트 추가 전 베이스라인 fix.

- [ ] **Step 4: 이후 모든 작업은 worktree 내부에서**

이후 task의 `Files:` 경로는 모두 `.worktrees/feature-connections-demo-pack/yieldo/...` 기준. 가독성을 위해 plan 본문에서는 `yieldo/...`로 표기.

---

## Task 1: AVAILABLE_CONNECTORS 카탈로그 확장

**Files:**
- Modify: `yieldo/src/shared/api/mock-connections.ts:43-56`
- Test: `yieldo/src/shared/api/__tests__/mock-connections.test.ts` (신규)

- [ ] **Step 1: 실패하는 테스트 작성**

Create `yieldo/src/shared/api/__tests__/mock-connections.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import {
  AVAILABLE_CONNECTORS,
  CATEGORY_ORDER,
} from "@/shared/api/mock-connections"

describe("AVAILABLE_CONNECTORS catalog", () => {
  it("has at least one connector per category", () => {
    for (const cat of CATEGORY_ORDER) {
      const items = AVAILABLE_CONNECTORS.filter((c) => c.category === cat)
      expect(items.length, `category=${cat}`).toBeGreaterThanOrEqual(1)
    }
  })

  it("includes the 5 PR-A demo-pack connectors", () => {
    const ids = AVAILABLE_CONNECTORS.map((c) => c.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        "appsflyer",
        "adjust",
        "statsig",
        "manual-financial",
        "gameanalytics",
      ]),
    )
  })

  it("every connector has non-empty brand and description", () => {
    for (const c of AVAILABLE_CONNECTORS) {
      expect(c.brand.length).toBeGreaterThan(0)
      expect(c.description.length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd yieldo
npx vitest run src/shared/api/__tests__/mock-connections.test.ts --reporter=basic
```

Expected: 2 fails — "has at least one connector per category" (3 카테고리 비어있음), "includes the 5 PR-A demo-pack connectors" (4개 부족).

- [ ] **Step 3: AVAILABLE_CONNECTORS 확장**

Modify `yieldo/src/shared/api/mock-connections.ts` — replace the AVAILABLE_CONNECTORS array (lines 47-56):

```ts
export const AVAILABLE_CONNECTORS: Array<
  Pick<Connection, "id" | "brand" | "category" | "description">
> = [
  {
    id: "appsflyer",
    brand: "AppsFlyer",
    category: "mmp",
    description: "어트리뷰션 데이터 — Pull API로 cohort 리텐션·CPI·ROAS 수집.",
  },
  {
    id: "adjust",
    brand: "Adjust",
    category: "mmp",
    description: "Mobile attribution & marketing analytics. Report Service API로 D120 long-term cohort 수집.",
  },
  {
    id: "statsig",
    brand: "Statsig",
    category: "experimentation",
    description: "A/B 실험 + feature flag. Console API로 ATE·confidence interval·rollout 상태 수집.",
  },
  {
    id: "manual-financial",
    brand: "재무 직접 입력",
    category: "financial",
    description: "월 매출 · UA 지출 · 현금 잔고 · 월 burn · 목표 payback — 5개 지표 수동 입력 (Visible.vc 모델).",
  },
  {
    id: "gameanalytics",
    brand: "GameAnalytics",
    category: "market",
    description: "공개 벤치마크 데이터 — 장르별 D1/D7/D28 P10/P50/P90 prior 구성에 사용.",
  },
]
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
cd yieldo
npx vitest run src/shared/api/__tests__/mock-connections.test.ts --reporter=basic
```

Expected: 3 tests passing.

- [ ] **Step 5: 커밋**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-demo-pack
git add yieldo/src/shared/api/mock-connections.ts yieldo/src/shared/api/__tests__/mock-connections.test.ts
git commit -m "feat(connections): expand AVAILABLE_CONNECTORS to 5 demo-pack connectors

Add Adjust (mmp), Statsig (experimentation), manual-financial (financial),
GameAnalytics (market) so all 4 silo categories show at least one card."
```

---

## Task 2: PlaceholderWizardDialog 컴포넌트

**Files:**
- Create: `yieldo/src/widgets/connections/ui/placeholder-wizard-dialog.tsx`
- Test: `yieldo/src/widgets/connections/__tests__/placeholder-wizard-dialog.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

Create `yieldo/src/widgets/connections/__tests__/placeholder-wizard-dialog.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PlaceholderWizardDialog } from "@/widgets/connections/ui/placeholder-wizard-dialog"
import type { Connection } from "@/shared/api/mock-connections"

const statsig: Connection = {
  id: "statsig",
  brand: "Statsig",
  category: "experimentation",
  description: "A/B 실험 플랫폼",
  status: "disconnected",
}

const adjust: Connection = {
  id: "adjust",
  brand: "Adjust",
  category: "mmp",
  description: "Mobile attribution",
  status: "disconnected",
}

describe("PlaceholderWizardDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders step 1 by default with brand name", () => {
    render(<PlaceholderWizardDialog connection={statsig} onClose={() => {}} />)
    expect(screen.getByText("Statsig")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /다음/ })).toBeInTheDocument()
  })

  it("always renders the demo disclaimer", () => {
    render(<PlaceholderWizardDialog connection={statsig} onClose={() => {}} />)
    expect(
      screen.getByText(/시연용 placeholder/i),
    ).toBeInTheDocument()
  })

  it("renders connector-specific guide text on step 1", () => {
    const { rerender } = render(
      <PlaceholderWizardDialog connection={statsig} onClose={() => {}} />,
    )
    expect(screen.getByText(/Statsig Console/i)).toBeInTheDocument()

    rerender(
      <PlaceholderWizardDialog connection={adjust} onClose={() => {}} />,
    )
    expect(screen.getByText(/Adjust Dashboard/i)).toBeInTheDocument()
  })

  it("advances to step 2 (verifying) on 다음 click, then auto-advances to step 3", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<PlaceholderWizardDialog connection={statsig} onClose={() => {}} />)

    await user.click(screen.getByRole("button", { name: /다음/ }))
    expect(screen.getByText(/검증 중/)).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(1500)
    })

    expect(screen.getByText(/연결되었습니다/)).toBeInTheDocument()
  })

  it("calls onClose when 닫기 is clicked on step 3", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onClose = vi.fn()
    render(<PlaceholderWizardDialog connection={statsig} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: /다음/ }))
    await act(async () => {
      vi.advanceTimersByTime(1500)
    })
    await user.click(screen.getByRole("button", { name: /닫기/ }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd yieldo
npx vitest run src/widgets/connections/__tests__/placeholder-wizard-dialog.test.tsx --reporter=basic
```

Expected: 모든 테스트 fail with "Cannot find module '@/widgets/connections/ui/placeholder-wizard-dialog'".

- [ ] **Step 3: PlaceholderWizardDialog 구현**

Create `yieldo/src/widgets/connections/ui/placeholder-wizard-dialog.tsx`:

```tsx
"use client"

import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import type { Connection } from "@/shared/api/mock-connections"

type Props = {
  connection: Connection
  onClose: () => void
}

const GUIDE_BY_ID: Record<string, string> = {
  adjust:
    "Adjust Dashboard → Settings → Report Service API에서 token 발급 후 입력합니다.",
  statsig:
    "Statsig Console → Project Settings → API Keys에서 Server Secret Key를 발급해 입력합니다.",
  "manual-financial":
    "월 매출, UA 지출, 현금 잔고, 월 burn, 목표 payback 5개 지표를 직접 입력합니다.",
  gameanalytics:
    "GameAnalytics Studio → Settings → API Keys에서 Game Key + Secret Key를 발급합니다.",
}

const STEP_LABELS = ["인증 정보", "검증", "연결 완료"]

export function PlaceholderWizardDialog({ connection, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    if (step !== 2) return
    const t = setTimeout(() => setStep(3), 1500)
    return () => clearTimeout(t)
  }, [step])

  const guide = GUIDE_BY_ID[connection.id] ?? "추후 연동 가이드가 제공됩니다."

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-lg font-bold">{connection.brand}</h2>
        <p className="text-sm text-muted-foreground">{connection.description}</p>
      </header>

      <div
        role="list"
        aria-label="연동 진행 단계"
        className="flex items-center gap-2"
      >
        {STEP_LABELS.map((label, idx) => {
          const n = (idx + 1) as 1 | 2 | 3
          const active = n === step
          const done = n < step
          return (
            <div
              key={label}
              role="listitem"
              className={`flex flex-1 items-center gap-2 rounded-lg border px-2 py-1.5 text-xs ${
                active
                  ? "border-ring bg-ring/10 font-bold"
                  : done
                    ? "border-border text-muted-foreground"
                    : "border-dashed border-border text-muted-foreground"
              }`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current">
                {n}
              </span>
              <span>{label}</span>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm">{guide}</p>
            <input
              type="text"
              readOnly
              value="••••••••••••••••"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-muted-foreground"
              aria-label="자격 증명 placeholder"
            />
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              다음
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">검증 중...</p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold">연결되었습니다 (시연용)</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-1.5 text-sm hover:bg-muted"
            >
              닫기
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        시연용 placeholder — 실제 등록 흐름은 추후 릴리즈에서 활성화됩니다.
      </p>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
cd yieldo
npx vitest run src/widgets/connections/__tests__/placeholder-wizard-dialog.test.tsx --reporter=basic
```

Expected: 5 tests passing.

- [ ] **Step 5: 커밋**

```bash
git add yieldo/src/widgets/connections/ui/placeholder-wizard-dialog.tsx yieldo/src/widgets/connections/__tests__/placeholder-wizard-dialog.test.tsx
git commit -m "feat(connections): add PlaceholderWizardDialog for non-AppsFlyer connectors

3-step wizard (자격증명 입력 → 검증 → 완료) with connector-specific guide
text + persistent demo disclaimer. Visual-only — no real registration."
```

---

## Task 3: ConnectionDialog 분기 로직

**Files:**
- Modify: `yieldo/src/widgets/connections/ui/connection-dialog.tsx`
- Test: `yieldo/src/widgets/connections/__tests__/connection-dialog.test.tsx` (신규)

- [ ] **Step 1: 실패하는 테스트 작성**

Create `yieldo/src/widgets/connections/__tests__/connection-dialog.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ConnectionDialog } from "@/widgets/connections/ui/connection-dialog"
import type { Connection } from "@/shared/api/mock-connections"

const appsflyer: Connection = {
  id: "appsflyer",
  brand: "AppsFlyer",
  category: "mmp",
  description: "AF",
  status: "disconnected",
}

const statsig: Connection = {
  id: "statsig",
  brand: "Statsig",
  category: "experimentation",
  description: "Statsig",
  status: "disconnected",
}

describe("ConnectionDialog branching", () => {
  it("renders RegisterForm for AppsFlyer disconnected", () => {
    render(<ConnectionDialog connection={appsflyer} onClose={() => {}} />)
    // RegisterForm 고유 라벨 — App ID 입력 필드 라벨
    expect(screen.getByLabelText(/App ID/i)).toBeInTheDocument()
  })

  it("renders PlaceholderWizardDialog for non-AppsFlyer connector", () => {
    render(<ConnectionDialog connection={statsig} onClose={() => {}} />)
    // wizard 고유 텍스트
    expect(screen.getByText(/시연용 placeholder/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/App ID/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd yieldo
npx vitest run src/widgets/connections/__tests__/connection-dialog.test.tsx --reporter=basic
```

Expected: "renders PlaceholderWizardDialog for non-AppsFlyer connector" fails — Statsig 연결도 RegisterForm으로 가서 App ID 라벨이 보임.

- [ ] **Step 3: ConnectionDialog 분기 로직 추가**

Modify `yieldo/src/widgets/connections/ui/connection-dialog.tsx` — replace the entire body inside the `{connection && (` JSX block (lines 30-78). The new body:

```tsx
{connection && (
  <>
    <DialogHeader>
      <DialogTitle>{connection.brand}</DialogTitle>
      <DialogDescription>{connection.description}</DialogDescription>
    </DialogHeader>

    <div className="mt-4">
      {connection.id !== "appsflyer" ? (
        <PlaceholderWizardDialog
          connection={connection}
          onClose={onClose}
        />
      ) : connection.status === "disconnected" ? (
        <RegisterForm
          onSuccess={(appId) => {
            onRegistered?.(appId)
            onClose()
          }}
        />
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            상태:{" "}
            <span className="font-bold">{connection.status}</span>
            {connection.lastSync && (
              <span className="ml-2 text-muted-foreground">
                · {connection.lastSync}
              </span>
            )}
          </div>
          {connection.metrics && connection.metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {connection.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-border p-3"
                >
                  <div
                    className="phosphor-text text-lg font-bold"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {m.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </>
)}
```

Add the import at top of file (after the RegisterForm import):

```tsx
import { PlaceholderWizardDialog } from "./placeholder-wizard-dialog"
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
cd yieldo
npx vitest run src/widgets/connections/__tests__/connection-dialog.test.tsx --reporter=basic
```

Expected: 2 tests passing.

- [ ] **Step 5: 회귀 점검 — 전체 connections 테스트**

```bash
cd yieldo
npx vitest run src/widgets/connections --reporter=basic
```

Expected: 모든 connections 위젯 테스트 통과 (기존 ConnectionCard 테스트 + 신규 wizard + dialog 테스트).

- [ ] **Step 6: 커밋**

```bash
git add yieldo/src/widgets/connections/ui/connection-dialog.tsx yieldo/src/widgets/connections/__tests__/connection-dialog.test.tsx
git commit -m "feat(connections): branch ConnectionDialog by connector id

AppsFlyer keeps existing RegisterForm/metrics flow.
Other connectors render PlaceholderWizardDialog (visual-only)."
```

---

## Task 4: AppsFlyer Cron 활성화

**Files:**
- Modify: `yieldo/vercel.json`

- [ ] **Step 1: vercel.json 수정**

Replace the contents of `yieldo/vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/appsflyer/sync",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

- [ ] **Step 2: 라우트 존재 확인**

```bash
ls yieldo/src/app/api/appsflyer/sync/route.ts
```

Expected: file exists (PR3에서 생성됨).

- [ ] **Step 3: vercel.json 문법 검증**

```bash
node -e "JSON.parse(require('fs').readFileSync('yieldo/vercel.json', 'utf8')); console.log('valid')"
```

Expected: `valid`.

- [ ] **Step 4: 커밋**

```bash
git add yieldo/vercel.json
git commit -m "feat(connections): activate AppsFlyer sync cron (every 6h)

PR3에서 deferred로 남긴 cron schedule을 활성화.
/api/appsflyer/sync를 6시간 간격으로 호출 (Vercel Hobby plan 호환)."
```

---

## Task 5: Connections 페이지 수동 점검

**Files:** (변경 없음 — 수동 검증)

- [ ] **Step 1: 로컬 dev 서버 시작**

```bash
cd yieldo
npm run dev -- --port 3000
```

Wait for "Ready in N s".

- [ ] **Step 2: /dashboard/connections 페이지 점검**

브라우저에서 http://localhost:3000/dashboard/connections 접속.

확인 사항:
- [ ] MMP 카테고리에 AppsFlyer + Adjust 카드 2개
- [ ] 실험 카테고리에 Statsig 카드 1개
- [ ] 재무 카테고리에 "재무 직접 입력" 카드 1개
- [ ] 시장 인텔리전스 카테고리에 GameAnalytics 카드 1개
- [ ] "곧 추가됩니다" empty state는 어디에도 보이지 않음

- [ ] **Step 3: AppsFlyer 카드 dialog 동작 확인**

AppsFlyer 카드 클릭 → RegisterForm (App ID 입력 필드) 보여야 함. (변경 없음 — 회귀 점검)

- [ ] **Step 4: 비-AppsFlyer 카드 wizard 동작 확인**

Statsig 카드 클릭 → 다음 시퀀스:
- [ ] Step 1: "Statsig Console → Project Settings..." 가이드 + read-only input + "다음" 버튼
- [ ] "다음" 클릭 → Step 2: spinner + "검증 중..."
- [ ] ~1.5초 후 자동으로 Step 3: 체크 아이콘 + "연결되었습니다 (시연용)" + "닫기" 버튼
- [ ] 모든 step에서 footer disclaimer "시연용 placeholder — ..." 표시
- [ ] "닫기" 클릭 → dialog 닫힘
- [ ] dialog 닫은 후 페이지 새로고침해도 카드는 여전히 "미연결" — 진짜 등록 안 됨 확인

- [ ] **Step 5: dev 서버 종료**

`Ctrl+C`.

---

## Task 6: 풀 게이트 통과 + 푸시 + PR

**Files:** (변경 없음)

- [ ] **Step 1: lint clean 확인**

```bash
cd yieldo
npm run lint 2>&1 | tail -20
```

Expected: 새로 추가된 코드(mock-connections.ts 신규 라인 + placeholder-wizard-dialog.tsx + 테스트들)에서 신규 에러 0. 베이스라인 33개 pre-existing 에러는 그대로 (메모리 4393 — 별도 cleanup PR 처리).

해당 task 범위에서 신규 에러가 보이면 즉시 fix. `YIELDO_GATE_SKIP=1` 사용 금지.

- [ ] **Step 2: tsc clean 확인**

```bash
cd yieldo
npx tsc --noEmit 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 3: 전체 테스트 통과**

```bash
cd yieldo
npx vitest run --reporter=basic 2>&1 | tail -10
```

Expected: 베이스라인 107 + 신규 (5 wizard + 3 catalog + 2 dialog) = ≥117 passing.

- [ ] **Step 4: 빌드 통과**

```bash
cd yieldo
npm run build 2>&1 | tail -15
```

Expected: `Compiled successfully`. cron 활성화 시 Vercel 빌드는 별도이지만 로컬 next build는 영향 없음.

- [ ] **Step 5: 푸시 + PR 생성**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-connections-demo-pack
git push -u origin feat/connections-demo-pack
```

```bash
gh pr create --title "feat(connections): demo pack — 4 silos lit + placeholder wizard + AF cron" --body "$(cat <<'EOF'
## Summary

- 빈 카테고리 4개에 connector 카드 추가 (Adjust / Statsig / Manual Financial / GameAnalytics)
- AppsFlyer 외 connector를 위한 `PlaceholderWizardDialog` (3-step 시각화, visual-only)
- AppsFlyer cron 활성화 — `/api/appsflyer/sync` 6시간 간격 (PR3 deferred 회수)

Spec: `docs/superpowers/specs/2026-04-29-connections-demo-pack-design.md`
Plan: `docs/superpowers/plans/2026-04-29-connections-demo-pack.md`

## Test plan

- [x] `vitest run` — 신규 5 + 3 + 2 = 10 tests, 베이스라인 회귀 0
- [x] `tsc --noEmit` — 0 errors
- [x] `npm run build` — compile 성공
- [ ] Vercel preview 배포 후 /dashboard/connections 4 카테고리 카드 시각 확인
- [ ] Vercel production 배포 후 cron 1회 수동 트리거 → /api/appsflyer/sync 호출 확인

## Disclaimer

시연용 묶음. 비-AppsFlyer connector는 클릭 시 정직한 placeholder wizard만 보여줌 (실제 등록 X).
PR-B (재무 manual input form)는 별도 PR로 진행.
EOF
)"
```

- [ ] **Step 6: PR URL 사용자에게 보고**

```
PR 생성 완료: <URL>
```

---

## Self-Review

**1. Spec coverage check:**
- §1 Goal: Task 1+2+3+4 → 4-silo 카드 + wizard + cron 모두 커버 ✓
- §3 Architecture: Task 3 분기 로직 = 다이어그램 일치 ✓
- §4 변경 파일 5개: Task 1 (mock-connections), Task 2 (wizard 컴포넌트 + 테스트), Task 3 (dialog 분기), Task 4 (vercel.json) — 모두 task 매핑 ✓
- §5 Connector 메타: Task 1 step 3 코드에 4개 connector 메타 모두 포함 ✓
- §6 Wizard UX: Task 2 step 3 구현 코드에 3-step + stepper + connector별 가이드 + disclaimer 모두 포함 ✓
- §7 Cron: Task 4 ✓
- §10 Testing: Task 1+2+3+5+6에 unit / integration / manual smoke 모두 커버 ✓
- §11 Worktree: Task 0 ✓

**2. Placeholder scan:** 검색 — TBD/TODO/"implement later" 0건. 모든 step에 실제 코드/명령 포함. ✓

**3. Type consistency:**
- `PlaceholderWizardDialog`의 props는 Task 2 step 3에서 정의 (`connection: Connection, onClose: () => void`) → Task 3 step 3에서 사용처 일치 ✓
- `Connection` 타입은 mock-connections.ts에서 import (Task 1 변경 없음) — 모든 task에서 동일 ✓
- `connection.id !== "appsflyer"` 분기 키는 Task 1의 connector ID와 일치 ✓

**4. Gap check:** 없음.

---

## 실행 옵션

Plan 작성 완료 — `docs/superpowers/plans/2026-04-29-connections-demo-pack.md`.

다음 두 가지 실행 방식 중 선택:

**1. Subagent-Driven (추천)** — Task 단위로 fresh subagent dispatch, task 간 리뷰 체크포인트, 빠른 iteration

**2. Inline Execution** — 현재 세션에서 executing-plans 스킬로 직접 실행, batch 단위 체크포인트

어떤 방식으로 진행할까요?
