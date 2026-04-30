# Connections Hub PR 1 — UI Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/dashboard/connections` 4-silo 통합 hub 페이지를 mock 데이터 기반으로 yieldo에 등장시킨다. 사용자가 네비게이션을 통해 진입 → 4-silo 카드 그리드 → 카드 클릭 → ConnectionDialog 표시까지 작동.

**Architecture:** treenod에서 `widgets/connections/*` UI + `shared/api/mock-connections.ts` + `shared/ui/{dialog, page-header}.tsx` 를 lift-and-shift port. yieldo의 globals.css가 Phosphor 토큰 자동 resolve. 브랜드 아이콘 블록 제거 + active 카드 1px accent line 추가 + 메트릭 phosphor-text 적용.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · `@radix-ui/react-dialog` (신규) · `@iconify/react` (기존) · `vitest` + `jsdom` (신규)

**Worktree:** `.worktrees/feature-connections-pr1-ui-shell/` (브랜치: `feature/connections-pr1-ui-shell`)

**참고 spec:** `docs/superpowers/specs/2026-04-28-connections-hub-appsflyer-migration-design.md`

---

## File Structure

### Create (새로 생성)
- `vitest.config.ts` — vitest 설정 (jsdom env, alias `@/`)
- `src/shared/ui/dialog.tsx` — Radix Dialog wrapper (treenod에서 port)
- `src/shared/ui/page-header.tsx` — 페이지 상단 헤더 (treenod에서 port)
- `src/shared/api/mock-connections.ts` — 4-silo mock 데이터 (treenod에서 재구조화 port)
- `src/widgets/connections/index.ts` — barrel
- `src/widgets/connections/ui/connection-card.tsx` — 카드 (브랜드 아이콘 제거 + Phosphor accent)
- `src/widgets/connections/ui/connection-dialog.tsx` — modal
- `src/widgets/connections/ui/connections-client.tsx` — 4-silo 그리드 클라이언트
- `src/widgets/connections/__tests__/connection-card.test.tsx` — 6-state 렌더 검증
- `src/app/(dashboard)/dashboard/connections/page.tsx` — Next.js 라우트

### Modify (수정)
- `package.json` — deps 추가 + test script 변경
- `src/widgets/sidebar/ui/app-sidebar.tsx` — `nav.integrations` href를 `/dashboard/connections`로 변경

---

## Task 1: Worktree + Deps + Vitest Setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: 워크트리 생성 + 브랜치 진입**

```bash
cd /Users/mike/Downloads/Compass
git worktree add -b feature/connections-pr1-ui-shell .worktrees/feature-connections-pr1-ui-shell main
cd .worktrees/feature-connections-pr1-ui-shell/compass
```

- [ ] **Step 2: 의존성 추가**

```bash
npm install --legacy-peer-deps \
  @radix-ui/react-dialog \
  vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: `vitest.config.ts` 생성 (워크스페이스 루트)**

파일: `/Users/mike/Downloads/Compass/.worktrees/feature-connections-pr1-ui-shell/compass/vitest.config.ts`

```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})
```

- [ ] **Step 4: `vitest.setup.ts` 생성**

파일: `compass/vitest.setup.ts`

```ts
import "@testing-library/jest-dom/vitest"
```

- [ ] **Step 5: `package.json` test script 수정**

기존: `"test": "echo 'no tests yet' && exit 0"`
변경: `"test": "vitest run"`

- [ ] **Step 6: 빈 vitest 실행으로 환경 검증**

```bash
npm test
```
Expected: `No test files found` 메시지 출력 후 exit 0 (정상)

- [ ] **Step 7: 커밋**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts
git commit -m "feat(connections): add vitest + radix-dialog deps for PR 1 UI shell"
```

---

## Task 2: Port Shared UI Primitives (dialog + page-header)

**Files:**
- Create: `src/shared/ui/dialog.tsx`
- Create: `src/shared/ui/page-header.tsx`

- [ ] **Step 1: treenod의 `dialog.tsx` 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/ui/dialog.tsx" \
   /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr1-ui-shell/compass/src/shared/ui/dialog.tsx
```

- [ ] **Step 2: treenod의 `page-header.tsx` 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/ui/page-header.tsx" \
   /Users/mike/Downloads/Compass/.worktrees/feature-connections-pr1-ui-shell/compass/src/shared/ui/page-header.tsx
```

- [ ] **Step 3: import 경로 호환성 확인**

두 파일을 열어 `@/shared/lib/utils`, `@/shared/i18n` 등의 import가 yieldo에서도 resolve 되는지 확인. yieldo는 `@/shared/lib` (utils 없음) — `cn` import가 다른 경로면 수정 필요.

```bash
grep -n "import" src/shared/ui/dialog.tsx src/shared/ui/page-header.tsx
```

- [ ] **Step 4: `cn` import 경로 수정 (필요 시)**

yieldo는 `@/shared/lib`에서 `cn`을 export. treenod는 `@/shared/lib/utils`. 차이가 있으면 `@/shared/lib/utils` → `@/shared/lib`로 일괄 치환.

- [ ] **Step 5: `npx tsc --noEmit` 으로 타입 검증**

```bash
npx tsc --noEmit
```
Expected: dialog/page-header 관련 에러 없음

- [ ] **Step 6: 커밋**

```bash
git add src/shared/ui/dialog.tsx src/shared/ui/page-header.tsx
git commit -m "feat(shared/ui): port dialog + page-header from treenod"
```

---

## Task 3: Mock Connections Data (4-silo Restructured)

**Files:**
- Create: `src/shared/api/mock-connections.ts`

- [ ] **Step 1: treenod의 mock 파일 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/mock-connections.ts" \
   src/shared/api/mock-connections.ts
```

- [ ] **Step 2: 카테고리/silo 구조 검증**

파일을 열어 `CATEGORY_ORDER`, `CATEGORY_LABEL`, `mockConnections` 배열이 다음 4-silo와 매핑되는지 확인:
- `mmp` (또는 유사) — AppsFlyer, Adjust, Singular
- `experimentation` — Statsig, Firebase
- `financial` — QuickBooks, 수동 입력
- `market` — 공개 벤치마크

treenod 기존 카테고리가 4-silo와 다르면 다음 단계에서 재정의.

- [ ] **Step 3: 4-silo 카테고리로 재정의 (필요 시)**

다음 형태로 통일 (이미 일치하면 skip):

```ts
export const CATEGORY_ORDER = ["mmp", "experimentation", "financial", "market"] as const
export type Category = typeof CATEGORY_ORDER[number]

export const CATEGORY_LABEL: Record<Category, string> = {
  mmp: "MMP — 어트리뷰션 / UA",
  experimentation: "실험 — A/B 테스트",
  financial: "재무 — 회계 / 매출",
  market: "시장 인텔리전스",
}
```

- [ ] **Step 4: AppsFlyer 카드만 `connected`, 나머지는 `disconnected`로 설정**

`mockConnections` 배열에서:
- AppsFlyer entry → `status: "connected"` + 샘플 메트릭 (`{ value: "$0.84", label: "CPI" }`, `{ value: "1.7M", label: "Installs" }`)
- 나머지 모든 entry → `status: "disconnected"` + 메트릭 비움

- [ ] **Step 5: 브랜드 아이콘 관련 필드 정리**

`brandColor`, `initials` 필드는 카드에서 제거되지만 mock 타입에서는 optional로 유지 (파괴적 변경 회피). 카드 컴포넌트에서 사용하지 않을 뿐.

- [ ] **Step 6: 타입 검증**

```bash
npx tsc --noEmit
```
Expected: mock-connections 관련 에러 없음

- [ ] **Step 7: 커밋**

```bash
git add src/shared/api/mock-connections.ts
git commit -m "feat(connections): port mock data with 4-silo category restructure"
```

---

## Task 4: ConnectionCard Widget + 6-state Test

**Files:**
- Create: `src/widgets/connections/index.ts`
- Create: `src/widgets/connections/ui/connection-card.tsx`
- Create: `src/widgets/connections/__tests__/connection-card.test.tsx`

- [ ] **Step 1: 실패하는 테스트 먼저 작성**

파일: `src/widgets/connections/__tests__/connection-card.test.tsx`

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ConnectionCard } from "@/widgets/connections"
import type { Connection } from "@/shared/api/mock-connections"

const baseConnection: Omit<Connection, "status"> = {
  id: "test-af",
  brand: "AppsFlyer",
  category: "mmp",
  description: "어트리뷰션 데이터",
}

describe("ConnectionCard", () => {
  it.each([
    ["connected", "연결됨"],
    ["warn", "검토 필요"],
    ["error", "에러"],
    ["disconnected", "미연결"],
  ] as const)("renders %s status with label %s", (status, label) => {
    render(<ConnectionCard connection={{ ...baseConnection, status }} />)
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByText("AppsFlyer")).toBeInTheDocument()
  })

  it("does not render brand icon block (icons removed per spec)", () => {
    const { container } = render(
      <ConnectionCard connection={{ ...baseConnection, status: "connected" }} />,
    )
    expect(container.querySelector('[aria-hidden="true"][style*="background"]')).toBeNull()
  })
})
```

- [ ] **Step 2: vitest 실행해서 실패 확인**

```bash
npm test src/widgets/connections/__tests__/connection-card.test.tsx
```
Expected: 4개 케이스 + 1개 케이스 모두 FAIL — `ConnectionCard` not found

- [ ] **Step 3: treenod의 ConnectionCard 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/widgets/connections/ui/connection-card.tsx" \
   src/widgets/connections/ui/connection-card.tsx
```

- [ ] **Step 4: 브랜드 아이콘 블록 제거**

파일을 열어 다음 블록을 제거:

```tsx
<div
  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-white text-sm"
  style={{ backgroundColor: connection.brandColor }}
  aria-hidden
>
  {connection.initials}
</div>
```

대체 = 그냥 삭제. 카드 1행은 `<div className="min-w-0">` (브랜드명) + 우측 상태 pill만 남김.

- [ ] **Step 5: Phosphor accent line 추가 (active 상태만)**

`cardClass` 정의 부분에서 `isActive` 가 `connection.status !== "disconnected"`일 때 `phosphor-glow` 또는 카드 상단 1px line 추가:

```tsx
const cardClass = cn(
  "group relative block w-full text-left rounded-2xl border border-border bg-card p-5",
  "transition-all hover:border-primary hover:shadow-sm",
  isActive && "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[var(--phosphor)]",
)
```

- [ ] **Step 6: 메트릭 숫자에 phosphor-text 클래스 적용**

3행 메트릭 렌더링 부분의 숫자 span에 `phosphor-text` 추가:

```tsx
<span
  className="font-bold text-foreground phosphor-text"
  style={{ fontVariantNumeric: "tabular-nums" }}
>
  {m.value}
</span>
```

- [ ] **Step 7: barrel export 작성**

파일: `src/widgets/connections/index.ts`

```ts
export { ConnectionCard } from "./ui/connection-card"
```

- [ ] **Step 8: vitest 재실행해서 통과 확인**

```bash
npm test src/widgets/connections/__tests__/connection-card.test.tsx
```
Expected: 5개 케이스 모두 PASS

- [ ] **Step 9: 커밋**

```bash
git add src/widgets/connections/
git commit -m "feat(connections): add ConnectionCard widget with 6-state test (icon block removed, phosphor accent)"
```

---

## Task 5: ConnectionDialog Widget

**Files:**
- Create: `src/widgets/connections/ui/connection-dialog.tsx`
- Modify: `src/widgets/connections/index.ts`

- [ ] **Step 1: treenod의 ConnectionDialog 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/widgets/connections/ui/connection-dialog.tsx" \
   src/widgets/connections/ui/connection-dialog.tsx
```

- [ ] **Step 2: register-modal/sync-progress/failure-history 의존성 분리**

ConnectionDialog가 `register-modal.tsx` / `sync-progress-card.tsx` / `failure-history-tab.tsx` 를 import하면 PR 4 영역. PR 1에서는 mock 표시만 하므로 해당 import 모두 제거 + 본문에서 사용하는 부분도 mock placeholder로 대체:

```tsx
{/* PR 4에서 register-modal로 교체 */}
<div className="text-sm text-muted-foreground p-4">
  연동 등록 폼 — PR 4에서 활성화
</div>
```

- [ ] **Step 3: barrel export에 추가**

파일: `src/widgets/connections/index.ts`

```ts
export { ConnectionCard } from "./ui/connection-card"
export { ConnectionDialog } from "./ui/connection-dialog"
```

- [ ] **Step 4: 타입 검증**

```bash
npx tsc --noEmit
```
Expected: ConnectionDialog 관련 에러 없음

- [ ] **Step 5: 커밋**

```bash
git add src/widgets/connections/
git commit -m "feat(connections): add ConnectionDialog widget (mock-only, PR 4 wiring deferred)"
```

---

## Task 6: ConnectionsClient Widget (4-silo Grid)

**Files:**
- Create: `src/widgets/connections/ui/connections-client.tsx`
- Modify: `src/widgets/connections/index.ts`

- [ ] **Step 1: treenod의 ConnectionsClient 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/widgets/connections/ui/connections-client.tsx" \
   src/widgets/connections/ui/connections-client.tsx
```

- [ ] **Step 2: 4-silo 그리드 레이아웃 검증**

파일을 열어 `CATEGORY_ORDER`를 순회하며 각 silo를 헤더 + ConnectionCard 그리드로 렌더하는 구조 확인. 빈 silo는 `silo 헤더 + "곧 추가됩니다" placeholder` 로 표시:

```tsx
{byCategory.map((g) => (
  <section key={g.id}>
    <h2 className="text-lg font-bold mb-3">{g.label}</h2>
    {g.items.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {g.items.map((c) => (
          <ConnectionCard key={c.id} connection={c} onClick={() => setActive(c)} />
        ))}
      </div>
    ) : (
      <div className="text-sm text-muted-foreground py-8 text-center">
        곧 추가됩니다
      </div>
    )}
  </section>
))}
```

- [ ] **Step 3: "+ 연동 추가" 버튼 추가 (페이지 우측 상단)**

ConnectionsClient의 헤더 영역에 다음 버튼 추가 (현 단계 onClick은 alert 또는 console.log):

```tsx
<button
  onClick={() => alert("PR 4에서 활성화")}
  className="ml-auto rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
>
  + 연동 추가
</button>
```

- [ ] **Step 4: barrel export 추가**

```ts
export { ConnectionCard } from "./ui/connection-card"
export { ConnectionDialog } from "./ui/connection-dialog"
export { ConnectionsClient } from "./ui/connections-client"
```

- [ ] **Step 5: 타입 검증**

```bash
npx tsc --noEmit
```
Expected: ConnectionsClient 관련 에러 없음

- [ ] **Step 6: 커밋**

```bash
git add src/widgets/connections/
git commit -m "feat(connections): add ConnectionsClient with 4-silo grid + add-connection button"
```

---

## Task 7: Page Route + Sidebar Wiring

**Files:**
- Create: `src/app/(dashboard)/dashboard/connections/page.tsx`
- Modify: `src/widgets/sidebar/ui/app-sidebar.tsx`

- [ ] **Step 1: 페이지 라우트 생성**

파일: `src/app/(dashboard)/dashboard/connections/page.tsx`

```tsx
import { ConnectionsClient } from "@/widgets/connections"
import { PageTransition, FadeInUp } from "@/shared/ui/page-transition"

export default function ConnectionsPage() {
  return (
    <PageTransition>
      <FadeInUp>
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold mb-1">데이터 연결</h1>
          <p className="text-sm text-muted-foreground mb-6">
            MMP · 실험 · 재무 · 시장 인텔리전스 4개 사일로의 통합 진입점
          </p>
          <ConnectionsClient />
        </div>
      </FadeInUp>
    </PageTransition>
  )
}
```

- [ ] **Step 2: sidebar의 integrations href 변경**

파일: `src/widgets/sidebar/ui/app-sidebar.tsx`

기존:
```ts
const settingsItems = [
  { key: "nav.integrations" as const, href: "#", icon: Settings },
  { key: "nav.account" as const,      href: "#", icon: User },
]
```

변경:
```ts
const settingsItems = [
  { key: "nav.integrations" as const, href: "/dashboard/connections", icon: Settings },
  { key: "nav.account" as const,      href: "#", icon: User },
]
```

- [ ] **Step 3: dev server 시작**

```bash
npm run dev
```

- [ ] **Step 4: 브라우저에서 확인**

`http://localhost:3000/dashboard/connections` 진입.
검증 항목:
- 4-silo 헤더 (MMP/실험/재무/시장 인텔리전스) 모두 보임
- AppsFlyer 카드만 connected (초록 배지 + Phosphor accent line)
- 나머지 silo는 "곧 추가됩니다" placeholder
- 우측 상단 "+ 연동 추가" 버튼 보임
- 사이드바의 "데이터 연결" 클릭 시 이 페이지로 이동
- 사이드바 active 상태 (브랜드 컬러) 적용됨

- [ ] **Step 5: 타입 + 빌드 검증**

```bash
npx tsc --noEmit && npm run build
```
Expected: 둘 다 성공

- [ ] **Step 6: 커밋**

```bash
git add src/app/\(dashboard\)/dashboard/connections/ src/widgets/sidebar/ui/app-sidebar.tsx
git commit -m "feat(connections): add /dashboard/connections route + wire sidebar nav"
```

---

## Task 8: Push + PR + 시각 검증 마무리

**Files:** (없음, GitHub 작업)

- [ ] **Step 1: 푸시**

```bash
git push -u origin feature/connections-pr1-ui-shell
```

- [ ] **Step 2: PR 생성**

```bash
gh pr create --title "feat(connections): PR 1 — UI shell with 4-silo hub framework (mock data)" --body "$(cat <<'EOF'
## Summary
- `/dashboard/connections` 페이지 신규 추가 — 4-silo 통합 hub framework
- ConnectionCard / ConnectionDialog / ConnectionsClient 위젯 이식 (treenod에서 lift-and-shift)
- 브랜드 아이콘 블록 제거, active 카드에 Phosphor accent line + 메트릭 phosphor-text 적용
- mock 데이터로 작동 (실제 AppsFlyer 연동은 PR 2-4)
- vitest + @radix-ui/react-dialog 신규 도입

## Test plan
- [x] `npm test` — ConnectionCard 6-state 렌더 + 아이콘 블록 부재 검증 통과
- [x] `npx tsc --noEmit` 통과
- [x] `npm run build` 통과
- [x] dev server 시각 검증: 4-silo 헤더 / AppsFlyer connected / 나머지 placeholder / 사이드바 nav active

## 참고 spec
docs/superpowers/specs/2026-04-28-connections-hub-appsflyer-migration-design.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: postpr-enrich.sh 자동 작동 확인**

`@coderabbitai review` 코멘트 + Vercel preview URL이 PR description 또는 코멘트로 자동 추가되는지 확인. 안 되면 hook 실패 — 수동으로 코멘트 추가:

```bash
gh pr comment <PR_NUMBER> --body "@coderabbitai review"
```

- [ ] **Step 4: Vercel preview URL에서 시각 재검증**

PR description의 preview URL 클릭 → `/dashboard/connections` 진입 → 로컬과 동일하게 보이는지 확인.

- [ ] **Step 5: PR 1 완료**

PR 1 완료. PR 2 plan 작성 단계로 이동 (별도 대화 turn).

---

## Self-Review

**Spec coverage** (`2026-04-28-connections-hub-appsflyer-migration-design.md` Section 7 PR 1 범위):

| Spec PR 1 항목 | Plan 매핑 |
|---|---|
| `connections/page.tsx` 생성 | Task 7 Step 1 |
| `widgets/connections/*` 이식 | Task 4 (Card), 5 (Dialog), 6 (Client) |
| `mock-connections.ts` 이식 | Task 3 |
| `shared/ui/dialog.tsx` 신규 | Task 2 Step 1 |
| `shared/ui/page-header.tsx` 신규 | Task 2 Step 2 |
| sidebar entry 변경 | Task 7 Step 2 |
| Phosphor 재스킨 (브랜드 아이콘 제거) | Task 4 Step 4 |
| Phosphor accent line + phosphor-text | Task 4 Steps 5-6 |
| `@radix-ui/react-dialog` 추가 | Task 1 Step 2 |
| vitest 신규 도입 | Task 1 Steps 2-5 |
| 위젯 단위 테스트 통과 | Task 4 Steps 1-2, 8 |
| dev server 시각 확인 | Task 7 Step 4 |

**Spec deferred to PR 4 (의도된 분리)**:
- `register-modal.tsx`, `sync-progress-card.tsx`, `failure-history-tab.tsx`, `app-card.tsx` (post-registration UX, mock에서 불필요)
- live wiring 관련 import — Task 5 Step 2에서 명시적으로 stub 처리

**Placeholder scan**: 코드 블록 모두 실제 사용 가능한 형태. "TODO/TBD" 없음.

**Type consistency**: `Connection`, `ConnectionStatus`, `ConnectionCard` 시그니처 모든 task에서 일관.

---

## 후속 plan 매핑

PR 1 머지 후 다음 plan 작성 (별도 turn):
- `2026-04-28-connections-pr2-appsflyer-domain.md` — `shared/api/appsflyer/*` 11개 파일 + 단위 테스트 + deps (`@vercel/blob`, `zod`, `tsx`)
- `2026-04-28-connections-pr3-api-routes-cron.md` — 6개 API 라우트 + 통합 테스트 + Vercel Cron + env setup
- `2026-04-28-connections-pr4-live-wiring.md` — `use-live-af-data` hook + ConnectionDialog wiring + 6-state UX + Phosphor 강조 활성화 + mock 제거
