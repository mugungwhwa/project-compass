# Connections Hub PR 4 — Live Wiring + 6-state UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PR 1의 UI shell + PR 2의 도메인 + PR 3의 API 라우트를 실제로 wiring해서 end-to-end 작동하는 AppsFlyer connector 완성. mock 제거 + 등록 폼 + 6-state 실시간 폴링 + Phosphor 강조 활성화 + Vercel Cron schedule 활성화.

**Architecture:** PR 1-3과 달리 lift-and-shift 비중 적음. **yieldo-specific 새 wiring 코드** 위주 — `use-live-af-data` hook (라이브 상태 폴링), ConnectionDialog 등록 폼 (POST /api/appsflyer/register 호출), ConnectionCard live wiring, mock 제거. 6-state edge case CTA + Phosphor accent 활성화. cron schedule 활성화는 마지막 commit (env vars 등록 후).

**Tech Stack:** TypeScript · React 19 · Next.js 16 client components · fetch API · TanStack Query는 도입 안 함 (단순 polling으로 충분, yieldo CLAUDE.md §8.4 명시 후 도입)

**Worktree:** `.worktrees/feature-connections-pr4-live-wiring/` (브랜치: `feature/connections-pr4-live-wiring`, base: `main` (PR 3 머지본 포함))

**중요 — gh 계정**: `mugungwhwa` 강제.

**참고 spec:** `docs/superpowers/specs/2026-04-28-connections-hub-appsflyer-migration-design.md`

---

## File Structure

### Create (yieldo 새 코드)
- `src/shared/api/appsflyer/use-live-af-data.ts` — React hook (clientside): `/api/appsflyer/state/[appId]` 폴링 + `/api/appsflyer/summary/[appId]` fetch
- `src/widgets/connections/ui/register-form.tsx` — dev_token 입력 폼 + `/api/appsflyer/register` POST

### Modify (PR 1 위젯 업그레이드)
- `src/widgets/connections/ui/connection-dialog.tsx` — placeholder 제거, register-form 통합
- `src/widgets/connections/ui/connection-card.tsx` — 6-state CTA 추가 (`재등록` / `재시도` / `AF 권한 확인`) + live status 표시
- `src/widgets/connections/ui/connections-client.tsx` — mockConnections 제거, `/api/appsflyer/apps` fetch로 교체
- `src/shared/api/mock-connections.ts` — 삭제 또는 silo 메타데이터만 유지 (4-silo placeholder용)
- `src/widgets/connections/index.ts` — register-form export 추가

### Modify (cron 활성화)
- `compass/vercel.json` — `crons` 빈 array → `[{path:"/api/appsflyer/cron", schedule:"0 18 * * *"}]` (별도 commit)

---

## Task 1: Worktree + 기존 인프라 검증

- [ ] **Step 1: gh 계정 확인**

```bash
gh auth status | grep "Active account: true" -B1
```
Expected: `mugungwhwa`. 다르면 `gh auth switch -u mugungwhwa`.

- [ ] **Step 2: 워크트리 생성**

```bash
cd /Users/mike/Downloads/Compass
git fetch origin main
git worktree add -b feature/connections-pr4-live-wiring .worktrees/feature-connections-pr4-live-wiring origin/main
cd .worktrees/feature-connections-pr4-live-wiring/compass
npm install --legacy-peer-deps
```

- [ ] **Step 3: 인프라 회귀 확인**

```bash
APPSFLYER_MASTER_KEY=$(openssl rand -hex 32) CRON_SECRET=$(openssl rand -hex 32) npm test
```
Expected: 76 통과 (PR 1+2+3 결과 유지)

---

## Task 2: use-live-af-data Hook (라이브 상태 폴링)

**Files:**
- Create: `src/shared/api/appsflyer/use-live-af-data.ts`

- [ ] **Step 1: hook 작성**

파일: `src/shared/api/appsflyer/use-live-af-data.ts`

```ts
"use client"

import { useEffect, useState } from "react"
import type { AppStatus } from "./types"

type LiveAfData = {
  status: AppStatus["status"] | null
  lastSyncAt: string | null
  callsUsedToday: number | null
  loading: boolean
  error: string | null
}

export function useLiveAfData(appId: string | null, pollMs = 10_000): LiveAfData {
  const [data, setData] = useState<LiveAfData>({
    status: null,
    lastSyncAt: null,
    callsUsedToday: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!appId) {
      setData((d) => ({ ...d, loading: false }))
      return
    }

    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null

    async function tick() {
      try {
        const res = await fetch(`/api/appsflyer/state/${appId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!alive) return
        setData({
          status: json.status ?? null,
          lastSyncAt: json.lastSyncAt ?? null,
          callsUsedToday: json.callsUsedToday ?? null,
          loading: false,
          error: null,
        })
      } catch (err) {
        if (!alive) return
        setData((d) => ({ ...d, loading: false, error: (err as Error).message }))
      } finally {
        if (alive) timer = setTimeout(tick, pollMs)
      }
    }

    tick()
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
    }
  }, [appId, pollMs])

  return data
}
```

- [ ] **Step 2: tsc 검증**

```bash
npx tsc --noEmit
```
Expected: 통과

- [ ] **Step 3: 커밋**

```bash
git add compass/src/shared/api/appsflyer/use-live-af-data.ts
git commit -m "feat(connections): add use-live-af-data hook for state polling"
```

---

## Task 3: Register Form Widget

**Files:**
- Create: `src/widgets/connections/ui/register-form.tsx`

- [ ] **Step 1: 폼 작성**

파일: `src/widgets/connections/ui/register-form.tsx`

```tsx
"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"

type RegisterFormProps = {
  onSuccess: (appId: string) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [devToken, setDevToken] = useState("")
  const [appId, setAppId] = useState("")
  const [appLabel, setAppLabel] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/appsflyer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dev_token: devToken,
          app_id: appId,
          app_label: appLabel,
          home_currency: "USD",
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? "등록 실패")
        return
      }
      onSuccess(appId)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          AppsFlyer Dev Token
        </label>
        <Input
          type="password"
          value={devToken}
          onChange={(e) => setDevToken(e.target.value)}
          placeholder="eyJhbGc..."
          required
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          App ID
        </label>
        <Input
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          placeholder="id123456789 또는 com.example.app"
          required
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          앱 이름
        </label>
        <Input
          value={appLabel}
          onChange={(e) => setAppLabel(e.target.value)}
          placeholder="예: Match League"
          required
        />
      </div>
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            검증 중...
          </>
        ) : (
          "연동 시작"
        )}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: barrel export 추가**

`src/widgets/connections/index.ts` 수정 — `RegisterForm` 추가

- [ ] **Step 3: tsc + 커밋**

```bash
npx tsc --noEmit && \
git add compass/src/widgets/connections/ui/register-form.tsx compass/src/widgets/connections/index.ts && \
git commit -m "feat(connections): add register form for dev_token submission"
```

---

## Task 4: ConnectionDialog Wiring

**Files:**
- Modify: `src/widgets/connections/ui/connection-dialog.tsx`

- [ ] **Step 1: connection-dialog.tsx 업그레이드**

기존 placeholder를 제거하고 `RegisterForm` 통합. `connection.status === "disconnected"`일 때만 form 표시.

```tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import type { Connection } from "@/shared/api/mock-connections"
import { RegisterForm } from "./register-form"

type ConnectionDialogProps = {
  connection: Connection | null
  onClose: () => void
  onRegistered: (appId: string) => void
}

export function ConnectionDialog({
  connection,
  onClose,
  onRegistered,
}: ConnectionDialogProps) {
  const open = connection !== null

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        {connection && (
          <>
            <DialogHeader>
              <DialogTitle>{connection.brand}</DialogTitle>
              <DialogDescription>{connection.description}</DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              {connection.status === "disconnected" ? (
                <RegisterForm
                  onSuccess={(appId) => {
                    onRegistered(appId)
                    onClose()
                  }}
                />
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                    상태: <span className="font-bold">{connection.status}</span>
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
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: tsc + 커밋**

```bash
npx tsc --noEmit && \
git add compass/src/widgets/connections/ui/connection-dialog.tsx && \
git commit -m "feat(connections): wire ConnectionDialog to register form + live status"
```

---

## Task 5: ConnectionsClient API-driven (Mock 제거)

**Files:**
- Modify: `src/widgets/connections/ui/connections-client.tsx`
- Modify: `src/shared/api/mock-connections.ts` — silo 메타데이터만 유지 (CATEGORY_LABEL/ORDER), mockConnections 제거 또는 빈 array

- [ ] **Step 1: mock-connections.ts 슬림화**

```ts
// types + CATEGORY 메타만 유지, mockConnections 제거
export type ConnectionStatus = "connected" | "warn" | "error" | "disconnected"
export type ConnectionCategory = "mmp" | "experimentation" | "financial" | "market"
export type ConnectionMetric = { label: string; value: string }

export type Connection = {
  id: string
  brand: string
  category: ConnectionCategory
  description: string
  status: ConnectionStatus
  lastSync?: string
  metrics?: ConnectionMetric[]
}

export const CATEGORY_LABEL: Record<ConnectionCategory, string> = {
  mmp: "MMP — 어트리뷰션 / UA",
  experimentation: "실험 — A/B 테스트",
  financial: "재무 — 회계 / 매출",
  market: "시장 인텔리전스",
}

export const CATEGORY_ORDER: ConnectionCategory[] = [
  "mmp", "experimentation", "financial", "market",
]

// MMP silo 후보 connector — 등록되지 않았을 때 표시되는 placeholder
export const AVAILABLE_CONNECTORS: Array<Pick<Connection, "id" | "brand" | "category" | "description">> = [
  {
    id: "appsflyer",
    brand: "AppsFlyer",
    category: "mmp",
    description: "Pull API로 cohort 리텐션·CPI·ROAS 수집",
  },
]
```

- [ ] **Step 2: connections-client.tsx 업그레이드**

```tsx
"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  AVAILABLE_CONNECTORS,
  type Connection,
} from "@/shared/api/mock-connections"
import { ConnectionCard } from "./connection-card"
import { ConnectionDialog } from "./connection-dialog"

export function ConnectionsClient() {
  const [active, setActive] = useState<Connection | null>(null)
  const [registered, setRegistered] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/appsflyer/apps")
      .then((r) => r.json())
      .then((j) => setRegistered(j.appIds ?? []))
      .catch(() => setRegistered([]))
      .finally(() => setLoading(false))
  }, [])

  // 등록된 앱 + 등록 가능한 connector 합치기
  const allConnectors: Connection[] = AVAILABLE_CONNECTORS.map((c) => ({
    ...c,
    status: registered.includes(c.id) ? "connected" : "disconnected",
  }))

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    id: cat,
    label: CATEGORY_LABEL[cat],
    items: allConnectors.filter((c) => c.category === cat),
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          disabled
          title="개별 connector 카드의 '연동하기' 버튼을 사용하세요"
        >
          <Plus className="h-4 w-4" />
          연동 추가
        </button>
      </div>

      {byCategory.map((g) => (
        <section key={g.id}>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {g.label}
          </h2>
          {g.items.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {g.items.map((c) => (
                <ConnectionCard
                  key={c.id}
                  connection={c}
                  onClick={() => setActive(c)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              곧 추가됩니다
            </div>
          )}
        </section>
      ))}

      <ConnectionDialog
        connection={active}
        onClose={() => setActive(null)}
        onRegistered={(appId) => setRegistered((r) => [...r, appId])}
      />
    </div>
  )
}
```

- [ ] **Step 3: 위젯 테스트 회귀 확인**

PR 1의 ConnectionCard 6-state 테스트는 mock-connections type만 사용하므로 영향 없어야 함.

```bash
npm test src/widgets/connections/__tests__/
```
Expected: 5/5 통과

- [ ] **Step 4: tsc + 커밋**

```bash
npx tsc --noEmit && \
git add compass/src/shared/api/mock-connections.ts compass/src/widgets/connections/ && \
git commit -m "feat(connections): replace mock with /api/appsflyer/apps fetch"
```

---

## Task 6: ConnectionCard 6-state CTA + Live Status

**Files:**
- Modify: `src/widgets/connections/ui/connection-card.tsx`

- [ ] **Step 1: 6-state CTA 매핑 확장**

기존 4-state CTA에서 6-state로 확장. `useLiveAfData(connection.id)`로 실시간 상태 표시 (connected 상태만).

```tsx
const PRIMARY_CTA: Record<ConnectionStatus, string> = {
  connected: "관리",
  warn: "재시도",
  error: "확인",
  disconnected: "연동하기",
}

// 추가 — backfilling/credential_invalid/app_missing 표시
const LIVE_LABEL: Record<string, string> = {
  backfilling: "백필 중",
  active: "정상",
  stale: "지연",
  failed: "실패",
  credential_invalid: "재등록 필요",
  app_missing: "앱 권한 확인",
}
```

connected 상태 카드에서 use-live-af-data로 실제 상태 가져와 sublabel로 표시:

```tsx
// 카드 본문에 useLiveAfData 호출 (connected 상태만)
const live = useLiveAfData(connection.status === "connected" ? connection.id : null)
// live.status가 있으면 status pill 옆에 sublabel 표시
```

- [ ] **Step 2: tsc + 커밋**

```bash
npx tsc --noEmit && \
npm test src/widgets/connections/__tests__/ && \
git add compass/src/widgets/connections/ui/connection-card.tsx && \
git commit -m "feat(connections): wire ConnectionCard to live state polling + 6-state CTAs"
```

---

## Task 7: 전체 회귀 + Vercel preview 시각 검증

**Files:** (없음)

- [ ] **Step 1: 전체 테스트 통과**

```bash
APPSFLYER_MASTER_KEY=$(openssl rand -hex 32) CRON_SECRET=$(openssl rand -hex 32) npm test
```
Expected: 76+ 통과 (이전 + 새 widget 테스트)

- [ ] **Step 2: build 확인**

```bash
npm run build
```
Expected: `/dashboard/connections` + `/api/appsflyer/*` 6 라우트 모두 빌드 성공

- [ ] **Step 3: dev server 시각 검증 (선택)**

```bash
npm run dev
```
브라우저에서 `/dashboard/connections` 진입 → AppsFlyer 카드 클릭 → 등록 폼 표시 확인 (실제 등록은 Vercel preview에서)

---

## Task 8: Push + PR (cron 비활성화 상태)

- [ ] **Step 1: gh 계정 + push**

```bash
gh auth status | grep "Active account: true" -B1
git push -u origin feature/connections-pr4-live-wiring
```

- [ ] **Step 2: PR 생성 (cron 비활성화 명시)**

```bash
gh pr create --title "feat(connections): PR 4 — live wiring + 6-state UX (cron deferred)" --body "$(cat <<'EOF'
## Summary
- use-live-af-data hook (실시간 상태 폴링)
- RegisterForm widget (POST /api/appsflyer/register)
- ConnectionDialog wiring (등록 폼 + live 상태 표시)
- ConnectionsClient — mock 제거, /api/appsflyer/apps fetch
- ConnectionCard — 6-state CTA + live status polling
- mock-connections.ts 슬림화 (silo 메타만 유지, AVAILABLE_CONNECTORS 추가)

## ⚠️ cron 활성화 별도 commit
이 PR 머지 후 env vars 셋업 완료한 다음 vercel.json crons 활성화 commit 필요. 그 전엔 cron 작동 안 함.

env vars setup: docs/appsflyer-env-setup.md

## Test plan
- [x] 76+ 단위/통합 테스트 통과
- [x] tsc + build (모든 라우트 등록)
- [ ] Vercel preview에서 실제 dev_token 등록 → backfill → active 확인
- [ ] env vars 셋업 후 cron 활성화

## 참고
- spec: docs/superpowers/specs/2026-04-28-connections-hub-appsflyer-migration-design.md
- plan: docs/superpowers/plans/2026-04-28-connections-pr4-live-wiring.md
- PR 1 #3, PR 2 #4, PR 3 #5 (모두 머지됨)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Task 9: Cron 활성화 (env vars 셋업 후 별도 commit)

이 task는 **PR 4 머지 + env vars 등록 후** 실행. 별도 작은 PR 또는 main 직접 commit.

- [ ] **Step 1: env vars 등록 확인**
  - Vercel 대시보드 → Settings → Environment Variables
  - `APPSFLYER_MASTER_KEY`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET` 모두 Production + Preview에 존재 확인

- [ ] **Step 2: vercel.json 수정**

```json
{
  "crons": [
    { "path": "/api/appsflyer/cron", "schedule": "0 18 * * *" }
  ]
}
```

- [ ] **Step 3: 커밋 + push**

```bash
git add compass/vercel.json
git commit -m "feat(appsflyer-api): activate daily cron (UTC 18:00 = KST 03:00)"
git push origin main
```

- [ ] **Step 4: 첫 실행 확인 (다음날)**

Vercel Logs에서 KST 03:00에 `/api/appsflyer/cron` 호출 로그 확인.

---

## Self-Review

**Spec coverage** (`2026-04-28-connections-hub-appsflyer-migration-design.md` Section 7 PR 4 범위):

| Spec PR 4 항목 | Plan 매핑 |
|---|---|
| `use-live-af-data` hook | Task 2 |
| ConnectionDialog 등록 폼 wiring | Task 3 (RegisterForm) + Task 4 (Dialog) |
| ConnectionCard live 상태 + 6-state CTA | Task 6 |
| mock 제거 | Task 5 |
| 6-state edge case UX | Tasks 4, 6 |
| Phosphor 강조 활성화 | PR 1에서 이미 적용 (active 카드) — Task 6에서 live 데이터로 트리거 |
| cron schedule 활성화 | Task 9 (별도 commit) |
| end-to-end 검증 | Task 7 |

**Placeholder scan**: 없음. 모든 코드 블록은 yieldo-specific 새 코드.

**Type consistency**: `Connection`, `ConnectionStatus`, `AppStatus` 시그니처는 PR 1+2 머지본 그대로 사용. RegisterForm의 응답 타입은 PR 3 register/route.ts response와 일치.

---

## 후속 sub-project 매핑

PR 4 머지 + cron 활성화 commit 후 Feature A 종료. 다음 사이클:

| 후속 | 의존 | 예상 분량 |
|---|---|---|
| **Feature D** — PyMC Bayesian Stats Engine | Feature A 코호트 데이터 입력 | 별도 spec/plan |
| **Feature B** — LSTM 리텐션 예측 | Feature A 코호트 데이터 입력 | 별도 spec/plan |
| **차트/항목 polish** | yieldo 기존 페이지에 새 데이터 연결 | 작은 PRs |
| **Adjust connector** | A의 hub framework | MMP silo 두 번째 |
| **Statsig connector** | A의 hub framework | Experimentation silo 첫 |
