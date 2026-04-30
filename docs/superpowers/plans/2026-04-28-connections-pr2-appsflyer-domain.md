# Connections Hub PR 2 — AppsFlyer Domain Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AppsFlyer 도메인 코드(`shared/api/appsflyer/*`) 11개 파일 + 9개 단위 테스트를 yieldo로 이식. PR 4의 라이브 wiring과 PR 3의 API 라우트가 의존하는 라이브러리 layer.

**Architecture:** treenod의 production-grade 도메인 코드(1,365 lines)를 yieldo `src/shared/api/appsflyer/`로 lift-and-shift. 의존성 그래프 순서대로 파일별 단위 테스트 통과 검증. Vercel Blob, zod, tsx 의존성 신규 추가. PR 1과 병렬 가능 — 코드만 추가하고 UI에 연결 안 함.

**Tech Stack:** TypeScript · zod (스키마) · @vercel/blob (스토리지) · AES-256-GCM (Node crypto) · vitest (단위 테스트)

**Worktree:** `.worktrees/feature-connections-pr2-appsflyer-domain/` (브랜치: `feature/connections-pr2-appsflyer-domain`, base: `main`)

**참고 spec:** `docs/superpowers/specs/2026-04-28-connections-hub-appsflyer-migration-design.md`

**중요 — gh 계정**: 이 repo는 개인 (`mugungwhwa/project-compass`) — `gh auth switch -u mugungwhwa` 로 인증 활성. `treenod-mike` 계정으로 PR 생성 절대 금지.

---

## File Structure

### Create (treenod에서 lift-and-shift port — 11 source + 9 test files)
- `src/shared/api/appsflyer/types.ts` (322 lines) — zod 스키마, `AppStatus` 6-state, helpers
- `src/shared/api/appsflyer/errors.ts` (90 lines) — `CredentialInvalidError`, `AppMissingError`, `ThrottledError`, `BackfillInProgressError`
- `src/shared/api/appsflyer/crypto.ts` (52 lines) — AES-256-GCM `encryptToken`/`decryptToken`/`hashToken`
- `src/shared/api/appsflyer/blob-store.ts` (159 lines) — Vercel Blob R/W (`getApp`, `getAccount`, `getState`, `putState`, append/cohort)
- `src/shared/api/appsflyer/rate-limiter.ts` (72 lines) — `acquireLock`, `releaseLock`, `incrementCalls`, `resetIfDue`
- `src/shared/api/appsflyer/fetcher.ts` (136 lines) — AppsFlyer Pull API HTTP 호출 + 에러 매핑
- `src/shared/api/appsflyer/aggregation.ts` (168 lines) — 코호트 요약 계산
- `src/shared/api/appsflyer/snapshot-derive.ts` (32 lines) — snapshot → derived metric
- `src/shared/api/appsflyer/client.ts` (88 lines) — 프론트엔드 호출 헬퍼 (서버 코드 wraps)
- `src/shared/api/appsflyer/orchestrator.ts` (205 lines) — `runAppsFlyerSync`, `validateCredentials`, error 분류
- `src/shared/api/appsflyer/index.ts` (41 lines) — barrel export
- `src/shared/api/appsflyer/__tests__/types.test.ts`
- `src/shared/api/appsflyer/__tests__/errors.test.ts`
- `src/shared/api/appsflyer/__tests__/crypto.test.ts`
- `src/shared/api/appsflyer/__tests__/blob-store.test.ts`
- `src/shared/api/appsflyer/__tests__/rate-limiter.test.ts`
- `src/shared/api/appsflyer/__tests__/fetcher.test.ts`
- `src/shared/api/appsflyer/__tests__/aggregation.test.ts`
- `src/shared/api/appsflyer/__tests__/client.test.ts`
- `src/shared/api/appsflyer/__tests__/orchestrator.test.ts`

### Modify
- `package.json` — deps `@vercel/blob`, `zod`, `tsx` 추가

### 의존성 그래프 (포트 순서)
```
types.ts ◄──── errors.ts ◄──── crypto.ts
   ▲                ▲              ▲
   ├── blob-store ──┤              │
   ├── rate-limiter ─────────────────┤ (lock state)
   ├── fetcher ─────┤              │
   ├── aggregation                 │
   ├── snapshot-derive             │
   ├── client                      │
   └── orchestrator ◄─── 모두 사용 ─┘

index.ts (barrel) — 마지막
```

---

## Task 1: Worktree + Deps

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 워크트리 생성 (main 기준)**

```bash
cd /Users/mike/Downloads/Compass
git worktree add -b feature/connections-pr2-appsflyer-domain .worktrees/feature-connections-pr2-appsflyer-domain main
cd .worktrees/feature-connections-pr2-appsflyer-domain/compass
```

- [ ] **Step 2: 의존성 추가 (PR 2 신규 deps + PR 1의 vitest 스택 합침)**

```bash
npm install --legacy-peer-deps \
  @vercel/blob zod tsx \
  vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/dom
```

이유: PR 2는 PR 1과 병렬 — main에서 분기하므로 vitest 환경도 다시 설정.

- [ ] **Step 3: vitest config 이식 (PR 1과 동일)**

PR 1의 `vitest.config.ts`와 `vitest.setup.ts`를 동일하게 작성:

`compass/vitest.config.ts`:
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

`compass/vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest"
```

- [ ] **Step 4: package.json test script 변경**

기존: `"test": "echo 'no tests yet' && exit 0"`
변경: `"test": "vitest run --passWithNoTests"`

- [ ] **Step 5: vitest 환경 검증**

```bash
npm test
```
Expected: `No test files found, exiting with code 0`

- [ ] **Step 6: 커밋**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts
git commit -m "feat(appsflyer): add vercel-blob/zod/tsx deps + vitest for PR 2 domain layer"
```

---

## Task 2: types.ts + errors.ts (Foundation Layer)

**Files:**
- Create: `src/shared/api/appsflyer/types.ts`
- Create: `src/shared/api/appsflyer/errors.ts`
- Create: `src/shared/api/appsflyer/__tests__/types.test.ts`
- Create: `src/shared/api/appsflyer/__tests__/errors.test.ts`

- [ ] **Step 1: types.ts 복사**

```bash
mkdir -p src/shared/api/appsflyer/__tests__
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/types.ts" \
   src/shared/api/appsflyer/types.ts
```

- [ ] **Step 2: errors.ts 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/errors.ts" \
   src/shared/api/appsflyer/errors.ts
```

- [ ] **Step 3: tsc 검증**

```bash
npx tsc --noEmit
```
Expected: types.ts/errors.ts 관련 에러 없음. (외부 import는 zod만)

- [ ] **Step 4: 테스트 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/__tests__/types.test.ts" \
   src/shared/api/appsflyer/__tests__/types.test.ts
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/__tests__/errors.test.ts" \
   src/shared/api/appsflyer/__tests__/errors.test.ts
```

- [ ] **Step 5: 테스트 실행**

```bash
npm test src/shared/api/appsflyer/__tests__/types.test.ts \
         src/shared/api/appsflyer/__tests__/errors.test.ts
```
Expected: 모두 통과

- [ ] **Step 6: 커밋**

```bash
git add src/shared/api/appsflyer/
git commit -m "feat(appsflyer): port types + errors with unit tests"
```

---

## Task 3: crypto.ts (Encryption Layer)

**Files:**
- Create: `src/shared/api/appsflyer/crypto.ts`
- Create: `src/shared/api/appsflyer/__tests__/crypto.test.ts`

- [ ] **Step 1: crypto.ts + 테스트 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/crypto.ts" \
   src/shared/api/appsflyer/crypto.ts
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/__tests__/crypto.test.ts" \
   src/shared/api/appsflyer/__tests__/crypto.test.ts
```

- [ ] **Step 2: 환경변수 의존성 확인**

`crypto.ts`가 `process.env.APPSFLYER_TOKEN_ENC_KEY`를 참조하는지 확인. 그렇다면 테스트 실행 전 임시 키 export 필요:

```bash
export APPSFLYER_TOKEN_ENC_KEY=$(openssl rand -hex 32)
```

또는 vitest setup에서 `vi.stubEnv` 사용 — treenod 테스트가 어떻게 처리하는지 확인 후 동일하게 적용.

- [ ] **Step 3: 테스트 실행**

```bash
APPSFLYER_TOKEN_ENC_KEY=$(openssl rand -hex 32) npm test src/shared/api/appsflyer/__tests__/crypto.test.ts
```
Expected: encrypt/decrypt 라운드트립 통과

- [ ] **Step 4: 커밋**

```bash
git add src/shared/api/appsflyer/crypto.ts src/shared/api/appsflyer/__tests__/crypto.test.ts
git commit -m "feat(appsflyer): port AES-256-GCM crypto with roundtrip test"
```

---

## Task 4: blob-store.ts (Storage Layer)

**Files:**
- Create: `src/shared/api/appsflyer/blob-store.ts`
- Create: `src/shared/api/appsflyer/__tests__/blob-store.test.ts`

- [ ] **Step 1: 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/blob-store.ts" \
   src/shared/api/appsflyer/blob-store.ts
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/__tests__/blob-store.test.ts" \
   src/shared/api/appsflyer/__tests__/blob-store.test.ts
```

- [ ] **Step 2: tsc 검증**

```bash
npx tsc --noEmit
```
Expected: types.ts 의존성 resolve, `@vercel/blob` import OK

- [ ] **Step 3: 테스트 실행 (in-memory mock 패턴 — treenod에서 함께 이식됨)**

```bash
npm test src/shared/api/appsflyer/__tests__/blob-store.test.ts
```
Expected: 모든 케이스 통과 (Vercel Blob을 mock으로 처리)

- [ ] **Step 4: 커밋**

```bash
git add src/shared/api/appsflyer/blob-store.ts src/shared/api/appsflyer/__tests__/blob-store.test.ts
git commit -m "feat(appsflyer): port Vercel Blob store with mocked unit tests"
```

---

## Task 5: rate-limiter.ts

**Files:**
- Create: `src/shared/api/appsflyer/rate-limiter.ts`
- Create: `src/shared/api/appsflyer/__tests__/rate-limiter.test.ts`

- [ ] **Step 1: 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/rate-limiter.ts" \
   src/shared/api/appsflyer/rate-limiter.ts
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/__tests__/rate-limiter.test.ts" \
   src/shared/api/appsflyer/__tests__/rate-limiter.test.ts
```

- [ ] **Step 2: tsc + 테스트**

```bash
npx tsc --noEmit && npm test src/shared/api/appsflyer/__tests__/rate-limiter.test.ts
```
Expected: lock/release/increment/reset 케이스 통과

- [ ] **Step 3: 커밋**

```bash
git add src/shared/api/appsflyer/rate-limiter.ts src/shared/api/appsflyer/__tests__/rate-limiter.test.ts
git commit -m "feat(appsflyer): port rate limiter with lock/quota tests"
```

---

## Task 6: fetcher.ts (HTTP Layer)

**Files:**
- Create: `src/shared/api/appsflyer/fetcher.ts`
- Create: `src/shared/api/appsflyer/__tests__/fetcher.test.ts`

- [ ] **Step 1: 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/fetcher.ts" \
   src/shared/api/appsflyer/fetcher.ts
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/__tests__/fetcher.test.ts" \
   src/shared/api/appsflyer/__tests__/fetcher.test.ts
```

- [ ] **Step 2: tsc + 테스트**

```bash
npx tsc --noEmit && npm test src/shared/api/appsflyer/__tests__/fetcher.test.ts
```
Expected: 401/403/404/429 분기 케이스 fetch 모킹으로 통과

- [ ] **Step 3: 커밋**

```bash
git add src/shared/api/appsflyer/fetcher.ts src/shared/api/appsflyer/__tests__/fetcher.test.ts
git commit -m "feat(appsflyer): port Pull API fetcher with HTTP error mapping tests"
```

---

## Task 7: aggregation.ts + snapshot-derive.ts

**Files:**
- Create: `src/shared/api/appsflyer/aggregation.ts`
- Create: `src/shared/api/appsflyer/snapshot-derive.ts`
- Create: `src/shared/api/appsflyer/__tests__/aggregation.test.ts`

- [ ] **Step 1: 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/aggregation.ts" \
   src/shared/api/appsflyer/aggregation.ts
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/snapshot-derive.ts" \
   src/shared/api/appsflyer/snapshot-derive.ts
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/__tests__/aggregation.test.ts" \
   src/shared/api/appsflyer/__tests__/aggregation.test.ts
```

- [ ] **Step 2: tsc + 테스트**

```bash
npx tsc --noEmit && npm test src/shared/api/appsflyer/__tests__/aggregation.test.ts
```
Expected: 코호트 계산 정확성 통과

- [ ] **Step 3: 커밋**

```bash
git add src/shared/api/appsflyer/aggregation.ts src/shared/api/appsflyer/snapshot-derive.ts src/shared/api/appsflyer/__tests__/aggregation.test.ts
git commit -m "feat(appsflyer): port aggregation + snapshot-derive with cohort calc tests"
```

---

## Task 8: client.ts (Frontend Helpers)

**Files:**
- Create: `src/shared/api/appsflyer/client.ts`
- Create: `src/shared/api/appsflyer/__tests__/client.test.ts`

- [ ] **Step 1: 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/client.ts" \
   src/shared/api/appsflyer/client.ts
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/__tests__/client.test.ts" \
   src/shared/api/appsflyer/__tests__/client.test.ts
```

- [ ] **Step 2: tsc + 테스트**

```bash
npx tsc --noEmit && npm test src/shared/api/appsflyer/__tests__/client.test.ts
```
Expected: 통과

- [ ] **Step 3: 커밋**

```bash
git add src/shared/api/appsflyer/client.ts src/shared/api/appsflyer/__tests__/client.test.ts
git commit -m "feat(appsflyer): port client helpers"
```

---

## Task 9: orchestrator.ts (Coordination Layer)

**Files:**
- Create: `src/shared/api/appsflyer/orchestrator.ts`
- Create: `src/shared/api/appsflyer/__tests__/orchestrator.test.ts`

- [ ] **Step 1: 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/orchestrator.ts" \
   src/shared/api/appsflyer/orchestrator.ts
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/__tests__/orchestrator.test.ts" \
   src/shared/api/appsflyer/__tests__/orchestrator.test.ts
```

- [ ] **Step 2: tsc + 테스트**

```bash
npx tsc --noEmit && npm test src/shared/api/appsflyer/__tests__/orchestrator.test.ts
```
Expected: validate/sync/error-classify 통과

- [ ] **Step 3: 커밋**

```bash
git add src/shared/api/appsflyer/orchestrator.ts src/shared/api/appsflyer/__tests__/orchestrator.test.ts
git commit -m "feat(appsflyer): port orchestrator with state machine + error classification tests"
```

---

## Task 10: index.ts (Barrel) + 전체 테스트

**Files:**
- Create: `src/shared/api/appsflyer/index.ts`

- [ ] **Step 1: index.ts 복사**

```bash
cp "/Users/mike/Downloads/Project Compass/src/shared/api/appsflyer/index.ts" \
   src/shared/api/appsflyer/index.ts
```

- [ ] **Step 2: 전체 테스트 실행**

```bash
npm test
```
Expected: appsflyer 9개 테스트 파일 모두 통과 + 에러 0개

- [ ] **Step 3: tsc + build 검증**

```bash
npx tsc --noEmit && npm run build
```
Expected: 빌드 성공

- [ ] **Step 4: 커밋**

```bash
git add src/shared/api/appsflyer/index.ts
git commit -m "feat(appsflyer): add domain barrel export — full unit suite green"
```

---

## Task 11: Push + PR

- [ ] **Step 1: gh 계정 확인 (mugungwhwa로)**

```bash
gh auth status | grep -E "Active|Logged in to"
gh auth switch -u mugungwhwa  # 필요 시
```

- [ ] **Step 2: Push**

```bash
git push -u origin feature/connections-pr2-appsflyer-domain
```

- [ ] **Step 3: PR 생성**

```bash
gh pr create --title "feat(connections): PR 2 — AppsFlyer domain layer (1,365 lines + 9 unit tests)" --body "$(cat <<'EOF'
## Summary
- shared/api/appsflyer 도메인 코드 11개 파일 이식 (types/errors/crypto/blob-store/rate-limiter/fetcher/aggregation/snapshot-derive/client/orchestrator/index)
- 단위 테스트 9개 파일 통과 (vitest)
- 의존성 추가: @vercel/blob, zod, tsx
- vitest 환경 별도 설정 (PR 1과 병렬 가능)

## Test plan
- [x] 모든 단위 테스트 통과 — encrypt/decrypt 라운드트립, 코호트 계산, lock/quota, HTTP 에러 매핑, state machine 전이
- [x] tsc + build 통과
- [ ] PR 3 (API 라우트)에서 라우트 코드가 이 도메인을 사용하면서 통합 검증

## 참고
- spec: `docs/superpowers/specs/2026-04-28-connections-hub-appsflyer-migration-design.md`
- plan: `docs/superpowers/plans/2026-04-28-connections-pr2-appsflyer-domain.md`
- PR 1: #3 (UI shell, 병렬 머지 가능)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: postpr-enrich.sh 자동 작동 확인**

CodeRabbit 코멘트 + Vercel preview URL이 PR에 추가되는지 확인.

- [ ] **Step 5: PR 2 완료**

PR 3 plan 작성 단계로 이동 (별도 turn).

---

## Self-Review

**Spec coverage** (`2026-04-28-connections-hub-appsflyer-migration-design.md` Section 7 PR 2 범위):

| Spec PR 2 항목 | Plan 매핑 |
|---|---|
| `shared/api/appsflyer/*` 11개 파일 이식 | Tasks 2-10 |
| `__tests__` 9개 단위 테스트 | Tasks 2-9 (각 파일과 함께) |
| deps `@vercel/blob`, `zod`, `tsx` 추가 | Task 1 Step 2 |
| vitest 환경 (PR 1과 동일) | Task 1 Steps 3-4 |
| 단위 테스트 100% 통과 | Task 10 Step 2 |
| code-only — UI에 wiring 안 함 | 의도적 — PR 4 영역 |

**Placeholder scan**: 없음. 모든 명령어 + 파일 경로 명시.

**Type consistency**: `AppStatus`, `Connection`, `runAppsFlyerSync`, `validateCredentials` 시그니처 — treenod 원본 그대로 이식하므로 자체 일관성 유지.

**의존성 그래프 검증**:
- Task 2 (types/errors) → 외부 의존 zod만
- Task 3 (crypto) → 외부 의존 Node crypto만
- Task 4 (blob-store) → types
- Task 5 (rate-limiter) → blob-store
- Task 6 (fetcher) → types, errors
- Task 7 (aggregation/snapshot-derive) → types
- Task 8 (client) → types
- Task 9 (orchestrator) → 모두
- Task 10 (index) → 모두

각 task의 tsc 검증이 누적적으로 보호. 한 단계 실패 시 다음 task 진입 안 함.

---

## 후속 plan 매핑

PR 2 머지 후 다음 plan 작성:
- `2026-04-28-connections-pr3-api-routes-cron.md` — 6개 API 라우트 + 통합 테스트 + Vercel Cron 등록 + env vars 가이드
- `2026-04-28-connections-pr4-live-wiring.md` — `use-live-af-data` hook + ConnectionDialog wiring + 6-state UX + Phosphor 강조 활성화 + mock 제거
