# Connections PR-B — Financial Manual Input Form

**Date**: 2026-04-29
**Status**: Approved (brainstorming complete)
**Branch (planned)**: `feat/connections-pr-b-financial`
**Worktree (planned)**: `.worktrees/feature-connections-pr-b-financial/`
**Base**: `main` @ `6daeae9` (PR-A 머지 + Vercel Hobby cron 보정 직후)
**Driver**: 예창패/투자자 시연 (PR-A와 동일 1주 데드라인)

---

## 1. Goal

`manual-financial` connector 카드 클릭 시 PlaceholderWizardDialog 대신 진짜 입력 폼을 보여주고, 5-metric 입력값을 localStorage에 저장하며, 카드 status를 자동으로 `connected`로 토글한다. 새로고침해도 유지된다.

시연 narrative: "재무 silo도 input 흐름 살아있고, 한 번 입력하면 영구 저장된다."

## 2. Non-Goals

- Supabase 영구 저장 / 멀티 디바이스 동기화 (Tier 2 이상)
- 통화 토글 (USD/KRW) — KRW 단일
- Range 입력 ("100K-200K") — 단일 값만
- Module 1 (Executive Overview) burn tolerance 카드에 데이터 흐름 — Tier 2 또는 별도 PR
- React Hook Form / Formik / 그 외 폼 라이브러리 도입

## 3. Architecture

```
ConnectionDialog
  ├─ id === "appsflyer" → RegisterForm (existing)
  ├─ id === "manual-financial" → FinancialInputForm (NEW)
  └─ else → PlaceholderWizardDialog (existing)

ConnectionsClient
  ├─ refreshApps()        — /api/appsflyer/apps fetch (existing)
  └─ refreshFinancial()   — localStorage check (NEW)
       → registered list에 'manual-financial' merge

FinancialInputForm
  ├─ useState 5 fields + zod validation
  ├─ mount 시 localStorage load → pre-fill
  └─ submit → save() → onSaved() → close
```

## 4. 변경 파일

| 파일 | 변경 | 라인 |
|---|---|---|
| `yieldo/src/shared/api/financial-input.ts` | 신규 — zod schema + load/save 헬퍼 + localStorage key 상수 | +60 |
| `yieldo/src/shared/api/__tests__/financial-input.test.ts` | 신규 — schema/storage round-trip + version mismatch | +80 |
| `yieldo/src/widgets/connections/ui/financial-input-form.tsx` | 신규 — 폼 컴포넌트 | +180 |
| `yieldo/src/widgets/connections/__tests__/financial-input-form.test.tsx` | 신규 — 검증/submit/pre-fill | +120 |
| `yieldo/src/widgets/connections/ui/connection-dialog.tsx` | 분기 1개 추가 + import | +6 |
| `yieldo/src/widgets/connections/ui/connections-client.tsx` | refreshFinancial 추가 + merge 로직 | +18 |

라인 합계 ~+464 (테스트 포함).

## 5. Data Model

### 5.1 zod Schema

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
```

### 5.2 Storage 헬퍼

```ts
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
  FinancialInputSchema.parse(enriched) // throw on invalid
  window.localStorage.setItem(FINANCIAL_INPUT_KEY, JSON.stringify(enriched))
  return enriched
}

export function clearFinancialInput(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(FINANCIAL_INPUT_KEY)
}
```

## 6. FinancialInputForm UX

**Props**: `{ onSaved: () => void; onClose: () => void }`

**Render**:
- Header: "재무 직접 입력" + 부제 "Visible.vc 모델 · KRW · 5개 지표"
- 5 input rows:
  | Field | 라벨 | 단위 | placeholder |
  |---|---|---|---|
  | monthlyRevenue | 월 매출 | KRW | 예: 50,000,000 |
  | uaSpend | UA 지출 | KRW | 예: 20,000,000 |
  | cashBalance | 현금 잔고 | KRW | 예: 500,000,000 |
  | monthlyBurn | 월 burn | KRW | 예: 30,000,000 |
  | targetPaybackMonths | 목표 payback | 개월 | 예: 12 |
- 입력 표시: 천 단위 콤마. 내부 state는 raw number.
- Validation: zod 실패 시 inline 에러 (필드별 빨간 텍스트)
- CTA: "저장" 버튼 (primary). 성공 시 1초 "저장됨" 토스트 → onSaved() → onClose()
- Footer: 작은 글씨 "localStorage 저장 — 멀티 디바이스 동기화는 Tier 2(Supabase)부터"

**Mount 시**: useEffect에서 loadFinancialInput() → 값 있으면 5 fields pre-fill (edit mode)

**SSR 안전**: 모든 localStorage 접근은 useEffect 안에서만. 초기 render는 빈 폼.

## 7. ConnectionsClient 통합

```ts
// 추가: financial 상태 추적
const [hasFinancialInput, setHasFinancialInput] = useState(false)

const refreshFinancial = useCallback(() => {
  setHasFinancialInput(loadFinancialInput() !== null)
}, [])

useEffect(() => {
  refreshFinancial()
}, [refreshFinancial])

// registered list 계산 시:
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

// dialog onRegistered prop을 더 일반화: id 받아서 분기
<ConnectionDialog
  connection={active}
  onClose={() => setActive(null)}
  onRegistered={(id) => {
    if (id === "manual-financial") refreshFinancial()
    else refreshApps()
  }}
/>
```

`onRegistered` 시그니처는 기존 `(appId: string) => void`였음 — id를 connector id로 의미 확장. AppsFlyer는 appId를 그대로 넘기지만 `id === "appsflyer"` 분기로 통일.

## 8. ConnectionDialog 분기 추가

```tsx
{connection.id === "appsflyer" ? (
  // 기존 RegisterForm 또는 metrics view
) : connection.id === "manual-financial" ? (
  <FinancialInputForm
    onSaved={() => onRegistered?.("manual-financial")}
    onClose={onClose}
  />
) : (
  <PlaceholderWizardDialog ... />
)}
```

## 9. Error Handling

- Schema 실패: form submit 차단, 필드별 inline 에러
- localStorage 쓰기 실패 (quota exceeded 등): try/catch — 사용자에게 "저장 실패, 다시 시도" 토스트
- localStorage 읽기 실패 (corrupt JSON): 기본값(disconnected)으로 fallback, 사용자 영향 없음
- SSR: window 미존재 시 항상 null 반환

## 10. Testing

| 범위 | 테스트 |
|---|---|
| `financial-input.ts` | (a) save→load round-trip / (b) invalid JSON → null / (c) version mismatch (다른 키) → null / (d) schema invalid → null / (e) save 시 savedAt 자동 추가 |
| `FinancialInputForm` | (a) 빈 폼 mount → 모든 필드 비어있음 / (b) 저장된 값 있을 때 pre-fill / (c) required field 누락 시 submit 차단 / (d) 음수 입력 차단 / (e) 정상 submit → onSaved + localStorage 값 일치 |
| `ConnectionDialog` | (a) id `manual-financial` → FinancialInputForm 렌더 / (b) id `statsig` → wizard 그대로 / (c) AppsFlyer 회귀 0 |
| `ConnectionsClient` | (a) localStorage에 값 있으면 manual-financial 카드 status connected / (b) 저장 직후 onRegistered → status 변경 |

precommit-gate (lint/tsc/test/build) 통과 필수. `YIELDO_GATE_SKIP=1` 사용 금지.

## 11. Worktree & Branch

- 새 worktree: `.worktrees/feature-connections-pr-b-financial/`
- branch: `feat/connections-pr-b-financial` (base: main `6daeae9`)
- 동시 worktree: yieldo-rebrand는 connections 미보유 → rebrand가 main rebase 시 connections 모듈 흡수. PR-B 머지가 PR-A보다 늦지만 같은 폴더라 충돌 없음 (신규 파일 위주)

## 12. Risks

| 리스크 | 완화 |
|---|---|
| localStorage SSR mismatch | useEffect 내부 접근만, 초기 render는 항상 disconnected |
| onRegistered prop 시그니처 변경으로 AppsFlyer flow 회귀 | id 분기 명확히, 기존 AppsFlyer 테스트로 회귀 검증 |
| 큰 숫자 (1조 KRW) Number 정밀도 | schema max 1e15 — 1000조 KRW까지 안전 (실제 mobile gaming AAA 회사 매출도 안 넘음) |
| 시연 후 Supabase 마이그레이션 시 schema 변경 | 키 prefix `:v1`로 명시, 마이그레이션 시 `:v2` 신규 + 자동 import |

## 13. Demo Script (PR-B 추가분)

> "재무 silo도 input 흐름이 살아있습니다. 카드 클릭 → 5개 지표 입력 → 저장 → '연결됨' 표시. 새로고침해도 유지됩니다. 이 단계의 저장은 localStorage 기반의 prototype이고, 정식 출시 시 Supabase로 영구 저장됩니다."

## 14. References

- PR-A spec: `docs/superpowers/specs/2026-04-29-connections-demo-pack-design.md`
- PR-A 머지: commit `7aacf83` (PR #13)
- CLAUDE.md §8.5 — Tier 1 Manual Input — 5 metrics
- 메모리 `project_connections_demo_pack_shipped.md`
- 메모리 `feedback_default_to_recommendation.md`
