# Connections Hub Framework + AppsFlyer Migration — Design

**Date**: 2026-04-28
**Source**: treenod-mike/compass (`/Users/mike/Downloads/Project Compass/`)
**Target**: yieldo (`/Users/mike/Downloads/Compass/compass/`)
**Migration memory**: `~/.claude/projects/-Users-mike-Downloads-Compass/memory/project_treenod_to_yieldo_migration.md` (Feature A, 1순위)
**Approach**: Lift-and-shift port + yieldo Phosphor 재스킨 (A안)

---

## 1. Overview

`/dashboard/connections` 페이지를 **4-silo 통합 hub framework** + **AppsFlyer 첫 connector instance** 형태로 yieldo에 이전한다. treenod에서 production-grade로 검증된 1,365 lines의 도메인 코드 + 6개 API 라우트 + vitest 테스트를 그대로 이식하고, yieldo의 Phosphor terminal 디자인 토큰을 globals.css 자동 resolve로 흡수한다.

**4-silo (yieldo CLAUDE.md §2.2 참조):**
- MMP (Mobile Measurement Partner) — AppsFlyer (active), Adjust (Feature D 후 추가)
- Experimentation — Statsig, Firebase (Feature B 이후)
- Financial — QuickBooks, 수동 입력
- Market Intelligence — 공개 벤치마크 (Phase 1, Sensor Tower 제외)

**스코프 외 (별도 후속 sub-project):**
- Adjust/Statsig/Firebase/QuickBooks 실제 connector 구현
- better-auth 통합 (현 단계는 익명 accountId 모델 유지)
- `bloomberg-terminal/` 폴더 처리 (다른 세션 결과 대기)

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  /dashboard/connections                                      │
│  ├ Silo 1: MMP        [AppsFlyer ✅] [Adjust placeholder]    │
│  ├ Silo 2: 실험       [Statsig placeholder] [Firebase ph.]   │
│  ├ Silo 3: 재무       [QuickBooks placeholder] [수동 입력]   │
│  ├ Silo 4: 시장정보   [공개 벤치마크 placeholder]            │
│  └ + 연동 추가 버튼                                          │
└────────┬─────────────────────────────────────────────────────┘
         │  ConnectionCard / ConnectionDialog (재사용 패턴)
         │  use-live-af-data (라이브 UI 훅)
         ▼
┌──────────────────────────────────────────────────────────────┐
│  src/shared/api/appsflyer/  (treenod에서 그대로 이식)        │
│   orchestrator → fetcher → aggregation → blob-store          │
│              ↑               ↑              ↑                │
│         rate-limiter      crypto       Vercel Blob           │
│              ↑                                               │
│           errors                                             │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  src/app/api/appsflyer/                                      │
│   register · apps · sync/[appId] · summary/[appId]           │
│   state/[appId] · cron (Vercel Cron — UTC 18:00 = KST 03:00) │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Components Inventory (이식 대상)

### 3.1 UI 레이어
| treenod 경로 | yieldo 대상 경로 | 비고 |
|---|---|---|
| `src/app/(dashboard)/dashboard/connections/page.tsx` | 동일 경로 | 4-silo 카드 그리드 |
| `src/widgets/connections/ui/connection-card.tsx` | 동일 경로 | **브랜드 아이콘 블록 제거** (이니셜 + colored square 제외) |
| `src/widgets/connections/ui/connection-dialog.tsx` | 동일 경로 | 등록/관리 modal |
| `src/widgets/connections/ui/register-modal.tsx` | 동일 경로 | dev_token 등록 폼 |
| `src/widgets/connections/ui/sync-progress-card.tsx` | 동일 경로 | backfill 진행률 |
| `src/widgets/connections/ui/failure-history-tab.tsx` | 동일 경로 | 실패 이력 탭 |
| `src/widgets/connections/ui/app-card.tsx` | 동일 경로 | 등록된 앱 카드 |
| `src/widgets/connections/ui/connections-client.tsx` | 동일 경로 | 클라이언트 wrapper |
| `src/widgets/connections/__tests__/*` | 동일 경로 | vitest 위젯 테스트 |
| `src/widgets/connections/index.ts` | 동일 경로 | barrel |
| `src/shared/api/mock-connections.ts` | 동일 경로 | PR 1에서 사용, PR 4에서 제거 |
| `src/shared/ui/dialog.tsx` | 동일 경로 | yieldo에 없음 — 신규 추가 (`@radix-ui/react-dialog` 추가) |
| `src/shared/ui/page-header.tsx` | 동일 경로 | yieldo에 없음 — 신규 추가 |

### 3.2 도메인 레이어 (1,365 lines)
| 파일 | lines | 역할 |
|---|---|---|
| `src/shared/api/appsflyer/types.ts` | 322 | zod 스키마 + `ConnectionStatusLive` + `AppStatus` 6-state |
| `src/shared/api/appsflyer/orchestrator.ts` | 205 | `runAppsFlyerSync`, `validateCredentials`, error 분류, `mutateState` |
| `src/shared/api/appsflyer/aggregation.ts` | 168 | 코호트 요약 계산 |
| `src/shared/api/appsflyer/blob-store.ts` | 159 | Vercel Blob 읽기/쓰기 (`getApp`, `getAccount`, `getState`, `putState`, append/cohort) |
| `src/shared/api/appsflyer/fetcher.ts` | 136 | AppsFlyer Pull API HTTP 호출 |
| `src/shared/api/appsflyer/errors.ts` | 90 | `CredentialInvalidError`, `AppMissingError`, `ThrottledError`, `BackfillInProgressError` |
| `src/shared/api/appsflyer/client.ts` | 88 | 프론트엔드 호출 헬퍼 |
| `src/shared/api/appsflyer/rate-limiter.ts` | 72 | `acquireLock`, `releaseLock`, `incrementCalls`, `resetIfDue` |
| `src/shared/api/appsflyer/crypto.ts` | 52 | AES-256-GCM `encryptToken`/`decryptToken`/`hashToken` |
| `src/shared/api/appsflyer/index.ts` | 41 | barrel |
| `src/shared/api/appsflyer/snapshot-derive.ts` | 32 | snapshot → derived metric |
| `src/shared/api/appsflyer/__tests__/*` | — | 단위 테스트 |

### 3.3 API 라우트 (6개 + 테스트)
| 라우트 | 메서드 | 역할 |
|---|---|---|
| `app/api/appsflyer/register/route.ts` | POST | 신규 앱 등록 (validation ping → backfill 트리거) |
| `app/api/appsflyer/sync/[appId]/route.ts` | POST | 수동 동기화 |
| `app/api/appsflyer/summary/[appId]/route.ts` | GET | 코호트 요약 조회 |
| `app/api/appsflyer/state/[appId]/route.ts` | GET | 6-state 폴링 |
| `app/api/appsflyer/apps/route.ts` | GET | 등록된 앱 목록 |
| `app/api/appsflyer/cron/route.ts` | GET (Vercel Cron) | 매일 03:00 KST 일괄 sync |

### 3.4 공통 인프라
- `vitest.config.ts` 이식 (jsdom env, alias `@/`)
- `package.json` test script: `"echo no tests yet"` → `"vitest run"`
- 의존성 추가: `@vercel/blob`, `zod`, `tsx`, `@radix-ui/react-dialog`

---

## 4. Data Flow

```
[1] 등록   POST /api/appsflyer/register { dev_token, app_id, ... }
            ├─ validateCredentials() — 1-call probe (installs_report 1d)
            ├─ encryptToken(dev_token) — AES-256-GCM
            ├─ putAccount() / putApp() / putState({status: "backfilling"})
            └─ runBackfill() — fire-and-forget (90일 4-step fetch)

[2] Backfill 4단계 (앱당 ~1-2분):
            ① non-organic installs_report
            ② organic_installs_report
            ③ in_app_events_report
            ④ organic_in_app_events_report
            → aggregate() → 코호트 요약 → status: "active"
            (실패 시 error 분류 → "credential_invalid"/"app_missing"/"failed")

[3] 일일 sync   Vercel Cron (UTC 18:00 = KST 03:00)
                /api/appsflyer/cron → 모든 active 앱 순회
                → rate-limiter (acquireLock + incrementCalls)
                → 어제~오늘 윈도 sync
                → state 업데이트

[4] 라이브 UI   use-live-af-data hook
                /api/appsflyer/state/[appId] 폴링 (10초 주기 dev mode)
                /api/appsflyer/summary/[appId] (코호트 차트)
                ConnectionCard 6-state 배지 + 메트릭 + Phosphor 강조
```

---

## 5. State Machine (6-state)

| 상태 | 진입 조건 | UI 표현 | CTA |
|---|---|---|---|
| `backfilling` | 등록 직후 | 노란 배지 + 진행률 | (없음) |
| `active` | backfill 성공 / sync 성공 | 초록 배지 + Phosphor 강조 | "관리" |
| `stale` | 마지막 sync > 24h | 주황 배지 | "재시도" |
| `failed` | partial fail (network/timeout) | 빨간 배지 | "재시도" |
| `credential_invalid` | 401/403 (키 만료/박탈) | 빨간 배지 | "재등록" |
| `app_missing` | 404 (AF에서 앱 사라짐) | 빨간 배지 | "AF에서 앱 권한 확인" |

전이는 `orchestrator.ts:classifyError` 가 결정. `ThrottledError` 는 status 변경 없이 `failureHistory` 에만 기록.

---

## 6. yieldo 어댑터 결정

| 항목 | 결정 |
|---|---|
| FSD 레이어 | yieldo도 `features/`/`entities/` 미사용 — 동일 구조 (`shared/`, `widgets/`, `app/`) |
| Auth 모델 | **익명 accountId 그대로 이식** (treenod와 동일). cookie 저장. 진짜 auth 도입은 별도 sub-project |
| Dialog primitive | `@radix-ui/react-dialog` 신규 추가 (yieldo에 이미 다른 radix 다수) |
| 디자인 토큰 | globals.css 자동 resolve (Phosphor 팔레트 이미 yieldo에 정의됨) |
| 브랜드 아이콘 | **전부 제외** — colored square 블록 제거. 카드 1행 = 브랜드명 텍스트 + 상태 pill만 |
| Phosphor 강조 적용 | (a) active 카드 1px accent line, (b) 메트릭 숫자 `phosphor-text`, (c) 빈 silo placeholder는 무채색 |
| vitest | yieldo에 신규 도입. precommit-gate.sh가 자동 호출 |

---

## 7. PR 분해 (4 PR)

| PR | 제목 | 범위 | 가시 progress |
|---|---|---|---|
| **PR 1** | UI shell + sidebar 진입점 | `connections/page.tsx`, `widgets/connections/*`, `mock-connections.ts`, `shared/ui/{dialog, page-header}.tsx`, sidebar entry, Phosphor 재스킨 (브랜드 아이콘 제거) | ✅ 페이지 등장, 카드 클릭 → mock 다이얼로그 |
| **PR 2** | AppsFlyer 도메인 + 단위 테스트 | `shared/api/appsflyer/*` 11개 파일 + `__tests__` + deps (`@vercel/blob`, `zod`, `tsx`) + `vitest.config.ts` | ❌ (code-only, vitest 통과) |
| **PR 3** | API 라우트 + Cron + env setup | `app/api/appsflyer/*` 6개 라우트 + `__tests__` + `vercel.json` cron schedule (코드만, schedule 활성화는 PR 4 후 별도 commit) + env vars 등록 가이드 | ❌ (API-only, 통합 테스트 통과) |
| **PR 4** | UI ↔ live wiring + Phosphor 강조 + 6-state UX | `use-live-af-data` hook, ConnectionDialog 등록 폼 wiring, ConnectionCard live 배지, mock 제거, 6-state edge case CTA, Phosphor 강조 활성화 | ✅ end-to-end 작동 |

**의존성**: PR 1 (UI 독립) → PR 2 → PR 3 → PR 4. PR 1과 PR 2는 **병렬 가능** (도메인은 mock과 무관).

**Worktree 분리**: 각 PR은 `/dev-start feature connections-pr<N>` 으로 별도 worktree.

---

## 8. 환경변수 + 운영 셋업 (PR 3 머지 시)

| 변수 | 발급 | 비고 |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel 대시보드 → Storage → Blob → Connect | Vercel-managed, 자동 주입 |
| `APPSFLYER_TOKEN_ENC_KEY` | `openssl rand -hex 32` | 32바이트 hex, Production + Preview 양쪽 |
| `CRON_SECRET` | `openssl rand -hex 32` | `vercel.json` cron header와 일치 |

**Vercel Cron schedule**: `vercel.json` 에 `{ "crons": [{ "path": "/api/appsflyer/cron", "schedule": "0 18 * * *" }] }` (UTC 18:00 = KST 03:00). PR 3에서 코드 추가, 활성화는 PR 4 머지 후 별도 commit.

---

## 9. 테스팅 전략

| PR | 통과 기준 |
|---|---|
| PR 1 | 위젯 단위 테스트 통과 + dev server 페이지 시각 확인 (스토리북 없음) |
| PR 2 | vitest 단위 테스트 100% (crypto, aggregation, rate-limiter, errors) |
| PR 3 | API 라우트 통합 테스트 100% + 로컬 `curl /api/appsflyer/register` smoke |
| PR 4 | Vercel preview에서 실제 AppsFlyer dev token으로 end-to-end (등록 → backfill → state 폴링 → active 표시) |

**모킹 전략:**
- Vercel Blob → in-memory mock (treenod 패턴 그대로)
- AppsFlyer Pull API → fetch 모킹으로 401/404/429 응답 시뮬레이션
- 실제 API 호출 = staging Vercel preview에서만 (rate limit 보호)

**RTL 도입 여부**: 현 단계 미도입. 6-state 렌더 검증은 vitest mount + assertion 만.

---

## 10. 리스크 + 완화

| 리스크 | 영향 | 완화 |
|---|---|---|
| AppsFlyer API quota 소진 (테스트 중 production token 실수 사용) | 중간 | 통합 테스트는 fetch 모킹 only, 실제 호출은 staging preview에서만 |
| Vercel Cron timezone 혼동 | 중간 | UTC schedule `0 18 * * *` 명시 + 첫 주 manual log 확인 |
| 익명 accountId — 사용자 cookie 삭제 시 등록 손실 | 중간 | 등록 후 accountId 화면 표시 + "북마크하세요" 안내. 진짜 auth 도입 시 cookie → user_id 마이그레이션 |
| `@radix-ui/react-dialog` 번들 사이즈 증가 | 낮음 | tree-shake됨, 약 10KB |
| yieldo-rebrand worktree와 timing 충돌 | 중간 | connections 작업은 별도 worktree (`feature/connections-hub`), yieldo-rebrand 머지 후 rebase |

---

## 11. 후속 sub-project 매핑

이 sub-project (Feature A) 완료 후 다음 사이클:

| 후속 | 의존 | 비고 |
|---|---|---|
| Feature D — PyMC Bayesian Stats Engine | A의 코호트 데이터 입력 | 2순위 |
| Feature B — LSTM 리텐션 예측 | A의 코호트 데이터 입력 | 3순위 |
| Adjust connector | A의 hub framework | MMP silo 두 번째 carded |
| Statsig connector | A의 hub framework | Experimentation silo 첫 carded |
| QuickBooks connector | A의 hub framework | Financial silo 첫 carded |

---

## 12. Open Questions (해결됨)

- ~~Q1: 익명 accountId vs better-auth 통합~~ → **익명 그대로** 결정
- ~~Q2: `bloomberg-terminal/` 폴더 처리~~ → **다른 세션 결과 대기**, 이 작업과 분리
- ~~Q3: PR 1 빈 카드 렌더~~ → **silo 헤더 + placeholder** 결정 (개별 connector 카드는 후속에서)

---

## 13. 참고 문서

- 마이그레이션 메모리: `~/.claude/projects/-Users-mike-Downloads-Compass/memory/project_treenod_to_yieldo_migration.md`
- treenod 원본 spec: `2026-04-23-appsflyer-post-registration-workflow-design.md`, `2026-04-20-appsflyer-api-pipeline-design.md` (treenod 내부)
- yieldo CLAUDE.md §8.5 (External Platform Integration), §16 (작업 컨벤션)
- yieldo `Project_Compass_Legal.md` (Customer-Authorized Agent pattern)
