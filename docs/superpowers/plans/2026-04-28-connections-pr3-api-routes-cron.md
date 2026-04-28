# Connections Hub PR 3 — API Routes + Cron + Env Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AppsFlyer 도메인 layer(PR 2 머지본)를 6개 API 라우트로 노출 + Vercel Cron 등록 + 환경변수 셋업. PR 4의 라이브 wiring이 의존하는 server layer.

**Architecture:** `src/app/api/appsflyer/{register, apps, sync/[appId], summary/[appId], state/[appId], cron}/route.ts` 6개 라우트를 treenod에서 lift-and-shift port. Vercel Cron schedule은 `vercel.json`에 추가하지만 PR 4 머지 후 별도 commit으로 활성화 (안전 게이트). 통합 테스트는 vitest로 fetch 모킹.

**Tech Stack:** Next.js 16 App Router · TypeScript · zod (input validation) · vitest (통합 테스트)

**Worktree:** `.worktrees/feature-connections-pr3-api-routes/` (브랜치: `feature/connections-pr3-api-routes`, base: `main` (PR 2 머지본 포함))

**중요 — gh 계정**: `mugungwhwa` 강제. `gh auth switch -u mugungwhwa` 미리 확인.

**참고 spec:** `docs/superpowers/specs/2026-04-28-connections-hub-appsflyer-migration-design.md`

---

## File Structure

### Create (treenod에서 lift-and-shift port — 6 source + 4 test files)
- `src/app/api/appsflyer/register/route.ts` — POST: 신규 앱 등록 (validation ping → backfill 트리거)
- `src/app/api/appsflyer/sync/[appId]/route.ts` — POST: 수동 동기화
- `src/app/api/appsflyer/summary/[appId]/route.ts` — GET: 코호트 요약 조회
- `src/app/api/appsflyer/state/[appId]/route.ts` — GET: 6-state 폴링
- `src/app/api/appsflyer/apps/route.ts` — GET: 등록된 앱 목록
- `src/app/api/appsflyer/cron/route.ts` — GET (Vercel Cron): 매일 03:00 KST 일괄 sync
- `src/app/api/appsflyer/register/__tests__/route.test.ts`
- `src/app/api/appsflyer/sync/[appId]/__tests__/route.test.ts`
- `src/app/api/appsflyer/state/[appId]/__tests__/route.test.ts`
- `src/app/api/appsflyer/cron/__tests__/route.test.ts`
- `compass/.env.local.example` — env vars 템플릿 (실제 값은 git에서 제외)

### Modify
- `compass/vercel.json` — `crons` 필드 추가 (코드만, schedule 활성화는 PR 4 후 별도 commit)

---

## Task 1: Worktree + 의존성 검증

**Files:** (없음, env 셋업 + 검증)

- [ ] **Step 1: gh 계정 확인**

```bash
gh auth status | grep "Active account: true" -B1
```
Expected: `Logged in to github.com account mugungwhwa`. 다르면 `gh auth switch -u mugungwhwa`.

- [ ] **Step 2: 워크트리 생성 (PR 2 머지된 main 기준)**

```bash
cd /Users/mike/Downloads/Compass
git fetch origin main
git worktree add -b feature/connections-pr3-api-routes .worktrees/feature-connections-pr3-api-routes origin/main
cd .worktrees/feature-connections-pr3-api-routes/compass
```

- [ ] **Step 3: 의존성 설치 (PR 2 머지본의 package.json 그대로)**

```bash
npm install --legacy-peer-deps
```

- [ ] **Step 4: 도메인 layer 검증**

```bash
ls src/shared/api/appsflyer/
```
Expected: `aggregation.ts`, `blob-store.ts`, `client.ts`, `crypto.ts`, `errors.ts`, `fetcher.ts`, `index.ts`, `orchestrator.ts`, `rate-limiter.ts`, `snapshot-derive.ts`, `types.ts`, `__tests__/`

- [ ] **Step 5: 도메인 단위 테스트 회귀 확인**

```bash
npm test src/shared/api/appsflyer/__tests__/
```
Expected: 56 통과 (PR 2 결과 유지).

- [ ] **Step 6: env 임시 셋업 (테스트용)**

`.env.local.example` 생성 — git에서 제외 + 실제 값 placeholder:

```
APPSFLYER_MASTER_KEY=<32-byte hex from openssl rand -hex 32>
BLOB_READ_WRITE_TOKEN=<from Vercel Blob dashboard>
CRON_SECRET=<32-byte hex>
```

- [ ] **Step 7: 커밋**

```bash
git add compass/.env.local.example
git commit -m "feat(appsflyer-api): add env template + worktree base"
```

---

## Task 2: register/route.ts (앱 등록)

**Files:**
- Create: `src/app/api/appsflyer/register/route.ts`
- Create: `src/app/api/appsflyer/register/__tests__/route.test.ts`

- [ ] **Step 1: route 복사**

```bash
mkdir -p src/app/api/appsflyer/register/__tests__
cp "/Users/mike/Downloads/Project Compass/src/app/api/appsflyer/register/route.ts" \
   src/app/api/appsflyer/register/route.ts
cp "/Users/mike/Downloads/Project Compass/src/app/api/appsflyer/register/__tests__/route.test.ts" \
   src/app/api/appsflyer/register/__tests__/route.test.ts
```

- [ ] **Step 2: import 경로 호환 확인**

```bash
grep "^import" src/app/api/appsflyer/register/route.ts
```
모든 `@/shared/api/appsflyer` 등 경로가 yieldo에서 resolve 되는지 확인.

- [ ] **Step 3: 테스트 runner 호환 확인**

```bash
head -3 src/app/api/appsflyer/register/__tests__/route.test.ts
```
- vitest 포맷 → 그대로 사용
- `node:test` 포맷 → vitest로 변환 필요 (PR 2 fetcher 변환 패턴 참고)

- [ ] **Step 4: tsc + 테스트 실행**

```bash
APPSFLYER_MASTER_KEY=$(openssl rand -hex 32) npx tsc --noEmit && \
APPSFLYER_MASTER_KEY=$(openssl rand -hex 32) npm test src/app/api/appsflyer/register/__tests__/
```
Expected: 모두 통과 — 200/400/401/404/409 status + zod validation + state machine 진입

- [ ] **Step 5: 커밋**

```bash
git add src/app/api/appsflyer/register/
git commit -m "feat(appsflyer-api): port register route with validation tests"
```

---

## Task 3: state/[appId]/route.ts (상태 폴링)

**Files:**
- Create: `src/app/api/appsflyer/state/[appId]/route.ts`
- Create: `src/app/api/appsflyer/state/[appId]/__tests__/route.test.ts`

- [ ] **Step 1: 복사**

```bash
mkdir -p "src/app/api/appsflyer/state/[appId]/__tests__"
cp "/Users/mike/Downloads/Project Compass/src/app/api/appsflyer/state/[appId]/route.ts" \
   "src/app/api/appsflyer/state/[appId]/route.ts"
cp "/Users/mike/Downloads/Project Compass/src/app/api/appsflyer/state/[appId]/__tests__/route.test.ts" \
   "src/app/api/appsflyer/state/[appId]/__tests__/route.test.ts"
```

- [ ] **Step 2: tsc + 테스트**

```bash
npx tsc --noEmit && APPSFLYER_MASTER_KEY=$(openssl rand -hex 32) npm test src/app/api/appsflyer/state/
```
Expected: 6-state 응답 케이스 모두 통과

- [ ] **Step 3: 커밋**

```bash
git add "src/app/api/appsflyer/state/[appId]/"
git commit -m "feat(appsflyer-api): port state route with 6-state response tests"
```

---

## Task 4: sync/[appId]/route.ts (수동 동기화)

**Files:**
- Create: `src/app/api/appsflyer/sync/[appId]/route.ts`
- Create: `src/app/api/appsflyer/sync/[appId]/__tests__/route.test.ts`

- [ ] **Step 1: 복사**

```bash
mkdir -p "src/app/api/appsflyer/sync/[appId]/__tests__"
cp "/Users/mike/Downloads/Project Compass/src/app/api/appsflyer/sync/[appId]/route.ts" \
   "src/app/api/appsflyer/sync/[appId]/route.ts"
cp "/Users/mike/Downloads/Project Compass/src/app/api/appsflyer/sync/[appId]/__tests__/route.test.ts" \
   "src/app/api/appsflyer/sync/[appId]/__tests__/route.test.ts"
```

- [ ] **Step 2: tsc + 테스트**

```bash
npx tsc --noEmit && APPSFLYER_MASTER_KEY=$(openssl rand -hex 32) npm test src/app/api/appsflyer/sync/
```
Expected: 동기화 트리거 + lock/quota 케이스 통과

- [ ] **Step 3: 커밋**

```bash
git add "src/app/api/appsflyer/sync/[appId]/"
git commit -m "feat(appsflyer-api): port sync route with lock/quota tests"
```

---

## Task 5: summary/[appId]/route.ts + apps/route.ts (조회 라우트)

**Files:**
- Create: `src/app/api/appsflyer/summary/[appId]/route.ts`
- Create: `src/app/api/appsflyer/apps/route.ts`

- [ ] **Step 1: 복사**

```bash
mkdir -p "src/app/api/appsflyer/summary/[appId]" src/app/api/appsflyer/apps
cp "/Users/mike/Downloads/Project Compass/src/app/api/appsflyer/summary/[appId]/route.ts" \
   "src/app/api/appsflyer/summary/[appId]/route.ts"
cp "/Users/mike/Downloads/Project Compass/src/app/api/appsflyer/apps/route.ts" \
   src/app/api/appsflyer/apps/route.ts
```

- [ ] **Step 2: tsc 검증**

```bash
npx tsc --noEmit
```
Expected: 통과 (테스트 파일은 treenod에 없음 — 단순 조회 라우트)

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/appsflyer/summary/ src/app/api/appsflyer/apps/
git commit -m "feat(appsflyer-api): port summary + apps query routes"
```

---

## Task 6: cron/route.ts (일괄 sync)

**Files:**
- Create: `src/app/api/appsflyer/cron/route.ts`
- Create: `src/app/api/appsflyer/cron/__tests__/route.test.ts`

- [ ] **Step 1: 복사**

```bash
mkdir -p src/app/api/appsflyer/cron/__tests__
cp "/Users/mike/Downloads/Project Compass/src/app/api/appsflyer/cron/route.ts" \
   src/app/api/appsflyer/cron/route.ts
cp "/Users/mike/Downloads/Project Compass/src/app/api/appsflyer/cron/__tests__/route.test.ts" \
   src/app/api/appsflyer/cron/__tests__/route.test.ts
```

- [ ] **Step 2: CRON_SECRET 인증 확인**

`route.ts`가 `Authorization: Bearer <CRON_SECRET>` 헤더를 검증하는지 확인. Vercel Cron은 자동으로 이 헤더 주입.

- [ ] **Step 3: tsc + 테스트**

```bash
npx tsc --noEmit && \
APPSFLYER_MASTER_KEY=$(openssl rand -hex 32) CRON_SECRET=$(openssl rand -hex 32) \
  npm test src/app/api/appsflyer/cron/
```
Expected: 인증 + 일괄 sync 진입 케이스 통과

- [ ] **Step 4: 커밋**

```bash
git add src/app/api/appsflyer/cron/
git commit -m "feat(appsflyer-api): port cron route with auth + batch sync tests"
```

---

## Task 7: vercel.json — Cron schedule 추가 (활성화는 PR 4 이후)

**Files:**
- Modify: `compass/vercel.json` (또는 신규 생성)

- [ ] **Step 1: 기존 vercel.json 확인**

```bash
cat compass/vercel.json 2>/dev/null || echo "(no vercel.json)"
```

- [ ] **Step 2: cron schedule 추가 (코드만 — 활성화 별도 commit)**

기존 vercel.json이 있으면 `crons` 필드 추가. 없으면 신규 생성:

```json
{
  "crons": [
    {
      "path": "/api/appsflyer/cron",
      "schedule": "0 18 * * *"
    }
  ]
}
```

(UTC 18:00 = KST 03:00 일일 sync)

⚠️ **이 commit 시점에서는 schedule 활성화 안 됨** — Vercel은 production 배포되어야 cron 등록. PR 3 머지 → main 배포 → cron 자동 등록되니, **PR 4 머지 후 env vars(BLOB_READ_WRITE_TOKEN, APPSFLYER_MASTER_KEY, CRON_SECRET) 모두 셋업된 다음**에 이 schedule이 처음 작동.

대안: schedule을 빈 array `"crons": []`로 두고 PR 4 머지 후 별도 commit으로 활성화. **추천 = 빈 array** (안전).

빈 array 버전:
```json
{
  "crons": []
}
```

후속 commit에서 활성화:
```json
{
  "crons": [{ "path": "/api/appsflyer/cron", "schedule": "0 18 * * *" }]
}
```

- [ ] **Step 3: 커밋**

```bash
git add compass/vercel.json
git commit -m "feat(appsflyer-api): add vercel.json cron config (deferred activation)"
```

---

## Task 8: 전체 검증 + Vercel env vars 가이드

**Files:**
- Create: `compass/docs/appsflyer-env-setup.md` (셋업 가이드)

- [ ] **Step 1: 전체 테스트 통과 확인**

```bash
APPSFLYER_MASTER_KEY=$(openssl rand -hex 32) CRON_SECRET=$(openssl rand -hex 32) npm test
```
Expected: 도메인 56 + API 라우트 통합 테스트 모두 통과

- [ ] **Step 2: 빌드 검증**

```bash
npm run build
```
Expected: `/api/appsflyer/*` 6개 라우트 빌드 성공 (Dynamic 표시)

- [ ] **Step 3: 셋업 가이드 작성**

파일: `docs/appsflyer-env-setup.md`

```markdown
# AppsFlyer Connector — Vercel Env Vars Setup

PR 3/PR 4 머지 후 production 배포 전, 다음 환경변수를 Vercel에 등록해야 합니다.

## 필수 변수 (3개)

### 1. APPSFLYER_MASTER_KEY (AES-256 암호화 키)
- 발급: `openssl rand -hex 32` (32바이트 hex 문자열)
- 환경: Production + Preview 모두
- 용도: 사용자가 등록하는 AppsFlyer dev_token 암호화

### 2. BLOB_READ_WRITE_TOKEN (Vercel Blob 토큰)
- 발급: Vercel 대시보드 → Storage → Blob → Create → "Connect Project"
- 환경: 자동 주입 (Vercel-managed)
- 용도: 계정 정보 + 코호트 데이터 저장

### 3. CRON_SECRET (Cron 라우트 인증)
- 발급: `openssl rand -hex 32`
- 환경: Production + Preview 모두
- 용도: 외부에서 /api/appsflyer/cron 호출 차단

## 셋업 절차

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 3개 변수 모두 추가 (Production + Preview)
3. Storage → Blob 활성화 (BLOB_READ_WRITE_TOKEN 자동)
4. PR 4 머지 후 활성화 commit (`crons` 필드 채움)
5. 다음 deploy에서 첫 cron 작동 확인 — Vercel Logs에서 03:00 KST 호출 확인

## 활성화 commit 예시

```json
// compass/vercel.json
{
  "crons": [
    { "path": "/api/appsflyer/cron", "schedule": "0 18 * * *" }
  ]
}
```
```

- [ ] **Step 4: 커밋**

```bash
git add compass/docs/appsflyer-env-setup.md
git commit -m "docs(appsflyer-api): add Vercel env vars setup guide"
```

---

## Task 9: Push + PR

- [ ] **Step 1: gh 계정 재확인**

```bash
gh auth status | grep "Active account: true" -B1
```
Expected: `mugungwhwa`. 다르면 `gh auth switch -u mugungwhwa`.

- [ ] **Step 2: Push**

```bash
git push -u origin feature/connections-pr3-api-routes
```

- [ ] **Step 3: PR 생성**

```bash
gh pr create --title "feat(connections): PR 3 — AppsFlyer API routes + Cron + env setup" --body "$(cat <<'EOF'
## Summary
- 6개 API 라우트 이식: register / sync/[appId] / summary/[appId] / state/[appId] / apps / cron
- 4개 통합 테스트 통과 (vitest)
- vercel.json cron config (활성화는 PR 4 머지 후 별도 commit)
- env vars 셋업 가이드 (`docs/appsflyer-env-setup.md`)

## Test plan
- [x] 통합 테스트 100% 통과 (200/400/401/404/409 status, zod validation, state machine)
- [x] tsc + build 통과 (6 라우트 빌드 확인)
- [ ] PR 4 (live wiring) 머지 후 env vars 셋업 + cron 활성화

## 배포 주의사항
- **이 PR 머지 즉시 cron 작동 안 함** — `vercel.json`의 `crons`가 빈 array. PR 4 머지 후 별도 commit으로 활성화.
- **APPSFLYER_MASTER_KEY** + **BLOB_READ_WRITE_TOKEN** + **CRON_SECRET** 3개 env vars Vercel 등록 필요.

## 참고
- spec: `docs/superpowers/specs/2026-04-28-connections-hub-appsflyer-migration-design.md`
- plan: `docs/superpowers/plans/2026-04-28-connections-pr3-api-routes-cron.md`
- PR 1: #3 (UI shell, 머지됨)
- PR 2: #4 (도메인 layer, 머지됨)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: postpr-enrich.sh 자동 작동 확인**

Vercel preview URL이 PR description 또는 코멘트에 자동 추가되는지 확인.

- [ ] **Step 5: 머지 + 로컬 cleanup**

```bash
gh pr merge <PR_NUMBER> --merge
git worktree remove .worktrees/feature-connections-pr3-api-routes --force
git branch -D feature/connections-pr3-api-routes
git checkout main && git pull origin main
```

---

## Self-Review

**Spec coverage** (`2026-04-28-connections-hub-appsflyer-migration-design.md` Section 7 PR 3 범위):

| Spec PR 3 항목 | Plan 매핑 |
|---|---|
| `app/api/appsflyer/*` 6개 라우트 | Tasks 2-6 |
| 4개 통합 테스트 | Tasks 2-4, 6 |
| `vercel.json` cron schedule (deferred) | Task 7 |
| env vars 등록 가이드 | Task 8 Step 3 |
| 통합 테스트 100% 통과 | Task 8 Step 1 |
| smoke test (curl) | 의도적 생략 — Vercel preview에서 실측 |

**Placeholder scan**: 없음. 모든 명령어 + 파일 경로 명시.

**Type consistency**: PR 2의 `runAppsFlyerSync`, `validateCredentials`, `AppStatus` 시그니처를 라우트들이 그대로 사용. PR 2 머지본이 모든 import 가능.

**의존성 그래프**:
- Task 2 (register) → PR 2의 `validateCredentials` + `runBackfill`
- Task 3 (state) → PR 2의 `getState`
- Task 4 (sync) → PR 2의 `runAppsFlyerSync` + rate-limiter
- Task 5 (summary/apps) → PR 2의 `getCohortSummary` + `getApp`
- Task 6 (cron) → PR 2의 `runAppsFlyerSync` 일괄 호출

각 task의 tsc 검증이 누적적으로 보호.

---

## 후속 plan 매핑

PR 3 머지 후 마지막 plan:
- `2026-04-28-connections-pr4-live-wiring.md` — `use-live-af-data` hook + ConnectionDialog 등록 폼 wiring + ConnectionCard 실시간 상태 폴링 + 6-state UX edge case + Phosphor 강조 활성화 + mock 제거 + cron schedule 활성화 commit
