# Connections Demo Pack — Design

**Date**: 2026-04-29
**Status**: Approved (brainstorming complete)
**Branch (planned)**: `feat/connections-demo-pack`
**Worktree (planned)**: `.worktrees/feature-connections-demo-pack/`
**Base**: `main` @ d44ed72
**Driver**: 예창패/투자자 시연 (1주 데드라인)
**Scope split**:
- **PR-A (this spec)**: 카드 채우기 + placeholder wizard dialog + AppsFlyer cron 활성화
- **PR-B (별도 spec)**: 재무 manual input form 5-metric (Visible.vc 모델)

---

## 1. Goal

4-silo 통합 진입점이 시각적으로 완성된 상태로 시연할 수 있게 하기.

- 모든 카테고리(MMP / 실험 / 재무 / 시장)에 최소 1개 이상의 connector 카드 표시
- 카드 클릭 시 단계별 wizard dialog로 "API key → 검증 → connected" 흐름 시각화 (정직한 mock)
- AppsFlyer 1개는 실제 cron으로 가동 — "1개는 진짜, 나머지는 합류 중" narrative 가능
- 1주 안에 PR-A 종결, demo 즉시 가능

## 2. Non-Goals

- 실제 OAuth flow 구현
- mock 등록 후 새로고침 시 connected 상태 유지 (PR-A에서는 닫으면 상태 변화 없음 — disclaimer로 정직하게 표시)
- 재무 input form 실제 폼 구현 (PR-B로 분리)
- Adjust / Statsig / GameAnalytics의 실제 데이터 fetch
- 다른 모듈(Revenue Forecast, Capital Console 등)에 새 connector 데이터 파급

## 3. Architecture

```
ConnectionsClient (existing)
  ├─ ConnectionCard × 4 categories (existing)
  └─ ConnectionDialog (existing) — connector type 분기 로직 추가
       ├─ AppsFlyer → RegisterForm (existing, 실제 작동)
       └─ 그 외 → PlaceholderWizardDialog (신규)
            ├─ Step 1: Credentials 안내 (read-only example)
            ├─ Step 2: 검증 단계 (mock spinner ~1.5s)
            └─ Step 3: Connected 확인 + "시연용" disclaimer
```

## 4. 변경 파일

| 파일 | 변경 종류 | 핵심 |
|---|---|---|
| `yieldo/src/shared/api/mock-connections.ts` | 확장 | AVAILABLE_CONNECTORS에 4개 신규 connector 추가 (Adjust / Statsig / Manual Financial / GameAnalytics). 카테고리/아이콘/설명 메타 포함 |
| `yieldo/src/widgets/connections/ui/connection-dialog.tsx` | 수정 | connector.id가 `appsflyer`면 RegisterForm, 아니면 PlaceholderWizardDialog |
| `yieldo/src/widgets/connections/ui/placeholder-wizard-dialog.tsx` | 신규 | 3-step stepper + connector.id 기반 콘텐츠 분기 + footer disclaimer |
| `yieldo/src/widgets/connections/__tests__/placeholder-wizard-dialog.test.tsx` | 신규 | step 진행 / disclaimer 표시 / connector별 텍스트 분기 검증 |
| `yieldo/vercel.json` | 수정 | `crons` 항목 활성화 (PR3 deferred 회수). path `/api/appsflyer/sync`, schedule `0 */6 * * *` |

라인 추정 합계: +250 (테스트 포함)

## 5. Connector 메타 추가 명세

`mock-connections.ts`에 추가될 4개 connector의 필수 필드:

| id | category | name | description | docsUrl (placeholder OK) |
|---|---|---|---|---|
| `adjust` | mmp | Adjust | "Mobile attribution & marketing analytics" | https://help.adjust.com |
| `statsig` | experimentation | Statsig | "A/B 실험 + feature flag 플랫폼" | https://docs.statsig.com |
| `manual-financial` | financial | 재무 직접 입력 | "월 매출 · UA 지출 · 현금 잔고 등 5개 지표 수동 입력 (Visible.vc 모델)" | (없음) |
| `gameanalytics` | market-intel | GameAnalytics | "공개 벤치마크 — Bayesian prior" | https://gameanalytics.com |

기존 `appsflyer` connector는 변경 없음.

## 6. PlaceholderWizardDialog 사양

**Props**
```ts
interface Props {
  connection: Connection
  onClose: () => void
}
```

**State**
- `step: 1 | 2 | 3` (초기값 1)

**Render**
- Header: connector 이름 + 카테고리 라벨
- Stepper: 3-dot indicator, 현재 단계 강조 (yieldo 토큰 `--ring`)
- Body: step별 콘텐츠
  - **Step 1**: connector별 가이드 텍스트 (e.g., Statsig: "Statsig Console → API Keys 메뉴 → Server Secret Key 발급"), read-only `<input>` placeholder, "다음" 버튼
  - **Step 2**: 중앙 정렬 spinner + "검증 중..." 텍스트, 1500ms 후 자동으로 step 3
  - **Step 3**: 체크 아이콘(green-500) + "연결되었습니다 (시연용)" + "닫기" 버튼 (onClose)
- Footer (모든 step): 작은 글씨 "시연용 placeholder — 실제 등록은 추후 릴리즈" — 항상 표시

**Connector 분기**: connector.id별 step 1 가이드 텍스트만 다르고, step 2/3은 공통.

## 7. AppsFlyer Cron 활성화

`yieldo/vercel.json`:
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

- 6시간 간격 = Vercel Hobby plan에서도 합리적, 시연 자리에서도 "최근 sync 시각" 살아있게 보임.
- `/api/appsflyer/sync`는 PR3에서 이미 만들어진 라우트 재사용 (별도 코드 변경 없음).
- Vercel Production 배포 후 manual smoke: 1회 cron 트리거 → DB에 새 row 들어가는지 확인.

## 8. Data Flow

1. 새 카드는 `mock-connections.ts`에 추가되는 즉시 ConnectionsClient 카테고리별 그룹화에 포함됨 (기존 로직 그대로).
2. 카드 클릭 → ConnectionsClient의 `setActive(c)` → ConnectionDialog 렌더 → connector.id 분기:
   - `appsflyer` → 기존 RegisterForm (실 동작)
   - 그 외 → PlaceholderWizardDialog (시각용)
3. PlaceholderWizardDialog는 닫혀도 어떤 상태도 변경하지 않음 — `refreshApps()` 호출 X. AppsFlyer만 등록 시 `onRegistered` callback으로 polling 재시작.
4. AppsFlyer cron은 Vercel 인프라 레벨 — 코드 흐름 변경 없음, 단지 `vercel.json` 활성화.

## 9. Error Handling

- **PlaceholderWizardDialog**: 에러 케이스 없음 (visual only). step 2 spinner는 setTimeout 기반 — 실패 분기 없음.
- **AppsFlyer cron**: Vercel cron 실패 시 platform alert로 처리 (별도 코드 X). 기존 `/api/appsflyer/sync` 내부 에러 처리는 PR3 코드 그대로.
- **연결 카드 status**: 새 connector는 항상 `disconnected` (메모리 캐시 X). 새로고침 시 그대로.

## 10. Testing

| 범위 | 도구 | 테스트 항목 |
|---|---|---|
| Unit | Vitest + Testing Library | PlaceholderWizardDialog: step 1→2→3 진행 / disclaimer 항상 표시 / connector.id별 step 1 텍스트 분기 |
| Unit | Vitest | mock-connections.ts AVAILABLE_CONNECTORS 길이 +4, 카테고리 균등 배분 |
| Integration | 기존 ConnectionCard 테스트 | 회귀 0 (그대로 통과) |
| Manual | 로컬 dev | 4 카테고리 모두 카드 보임, "곧 추가됩니다" empty state 사라짐, AppsFlyer 카드만 RegisterForm, 나머지는 wizard |
| Manual (production) | Vercel | cron 1회 수동 트리거 → /api/appsflyer/sync 호출 → DB row 생성 |

ESLint baseline (33 pre-existing errors, 메모리 `4393`)는 차단 가능성 — 새 코드는 strict하게 작성하여 신규 에러 0 유지. `YIELDO_GATE_SKIP=1` 사용 금지 (메모리 `feedback_gate_skip_policy.md`).

## 11. Worktree & Branch Strategy

- 새 worktree: `.worktrees/feature-connections-demo-pack/` (npm install --legacy-peer-deps 필요)
- 브랜치: `feat/connections-demo-pack` (base: main @ d44ed72)
- 동시 worktree 충돌 점검:
  - **PR2 D Bayesian** (`feature/d-bayesian-pr2-appsflyer-integration`): connections 폴더 diff = 0. 안전.
  - **yieldo-rebrand**: connections 8개 파일 미보유 — rebrand 머지 전 main rebase 필수. PR-A 머지 후 rebrand 측에서 conflict 해결.
  - **landing-terminal-chrome**: 구 `compass/` 경로 — yieldo 코드와 분리. 무관.

## 12. Risks

| 리스크 | 가능성 | 완화책 |
|---|---|---|
| ESLint baseline 33개로 harness gate 차단 | 높음 | 새 코드 lint clean + 베이스라인 fix는 PR-A 외부 (별도 cleanup PR) |
| Vercel cron schedule이 Hobby plan limit 초과 | 낮음 | 6시간 간격은 Hobby plan 허용 범위. 검증 필요. |
| Disclaimer가 시연 영상에서 너무 눈에 띔 | 중간 | footer 작은 글씨로 처리 (text-xs text-muted-foreground), 영상 컷에서 충분히 정직 |
| yieldo-rebrand 머지 시점이 PR-A 이전이면 connections 전체 사라짐 | 중간 | rebrand 측에 main rebase 의무 통보 (메모리 추가) |

## 13. Demo Script

> "yieldo는 mobile gaming의 4개 데이터 silo를 하나로 묶는 통합 진입점입니다. MMP, A/B 실험, 재무, 시장 인텔리전스 — 모든 신호가 여기로 모입니다.
>
> 현재 AppsFlyer는 실제 가동 중입니다. 6시간마다 cron이 cohort 데이터를 fetch해서 LTV 계산에 신선한 신호를 공급합니다.
>
> 나머지 connector — Adjust, Statsig, 재무 입력, GameAnalytics — 는 등록 흐름이 준비되어 있고, 정식 출시 시 순차 활성화됩니다."

## 14. References

- 기존 connections PRs: #3 (UI shell), #4 (AppsFlyer domain), #5 (API routes), #7 (live wiring)
- CLAUDE.md §8.5 External Platform Integration
- 메모리 `feedback_gate_skip_policy.md` (gate skip 정책)
- 메모리 `feedback_default_to_recommendation.md` (추천 자동 채택)
- 메모리 `project_scope_a_progress.md` (worktree 충돌 매트릭스)
