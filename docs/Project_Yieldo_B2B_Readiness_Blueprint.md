# yieldo — B2B Readiness Blueprint

> **목적**: "project yieldo"가 프로토타입에서 프로덕션 B2B SaaS로 가는 여정의 gap 분석 및 단계별 로드맵.
>
> **사용법**: 새 세션에서 *"B2B 준비도 블루프린트를 보고 다음 작업 정해줘"* 라고만 하면 이 문서가 맥락이 되어 이어갈 수 있습니다.
>
> **생성일**: 2026-04-09
> **최종 점검일**: 2026-04-09 (Sprint 2 App-shell refactor + BI 통일 + i18n 정리 직후)
> **상태**: 블루프린트 (계획 문서 — 실행은 별도 세션에서)

---

## 0. TL;DR

> 현재 상태는 **고해상도 디자인 목업**입니다. 프론트엔드 디자인 시스템·IA·시그니처 컴포넌트는 거의 완성(≈90%)이지만, **백엔드 인프라·인증·결제·통합·관찰가능성·법적 문서**는 거의 0%입니다.
>
> 수치로 표현하면 **B2B 준비도 약 15-20%**. 실 고객 파일럿까지는 최소 **8-12주** 엔지니어링 (2인 팀 기준).

---

## 1. 현재 가진 것 ✅

### 프론트엔드 디자인 시스템 (강점)
- **Stack**: Next.js 16.2.2 + React 19 + Turbopack + FSD 아키텍처
- **Design**: Tailwind v4 + 자체 디자인 토큰(`globals.css`) + Geist Sans/Mono + Instrument Serif + Noto Sans KR
- **BI**: `△ project yieldo` 통일 (Direction γ — Nautical N)
- **Signature components**: `<DecisionSurface>`, `<HeroVerdict>`, `<MarketHeroVerdict>`, `<RunwayFanChart>` (visx)
- **App shell**: Top status bar (persistent financial health) + Bottom command bar + Floating answer card (Cursor/Perplexity 패턴)
- **i18n**: ko/en 완비, 브랜드 이름은 번역 제외 원칙
- **5 dashboard 모듈**: Overview / Market Gap / Actions / Experiments / Capital (모두 mock 데이터로 렌더)
- **Design Migration Log**: `docs/Project_Yieldo_Design_Migration_Log.md` — 모든 변경 추적

### 제품 정체성 문서 (강점)
- `CLAUDE.md` — 제품 정의, Retention Theory, Bayesian Framework
- `Project_Yieldo_Business_Plan.md` — 비즈니스 케이스
- `Project_Yieldo_Engine_Blueprint.md` — 엔진 구현 청사진
- `Project_Yieldo_UI_Guide.md` — UI 설계 지침
- `Project_Yieldo_Legal.md` — 법적 분석
- `Project_Yieldo_Data_Sources_Guide.md` — 데이터 소스 명세

### CLAUDE.md에 계획된 인프라 (구현 0)
| 항목 | 계획 | 구현 상태 |
|---|---|---|
| Better Auth (Organization plugin) | §8.4 | ❌ |
| Supabase (PostgreSQL + RLS) | §8.4 | ❌ |
| Vercel AI SDK / Anthropic SDK | §8.3 | ❌ |
| FastAPI on GCP Cloud Run | §8.4 | ❌ |
| Upstash Redis | §8.4 | ❌ |
| W&B ML tracking | §8.4 | ❌ |
| AppsFlyer/Adjust/Statsig 통합 | §8.5 | ❌ |

---

## 2. 빠진 것 — 24개 차원 Gap Matrix

### 🔴 P0 — 런칭 불가 수준 (실 고객 못 받음)

| # | 차원 | 현재 | 필요 | 예상 공수 |
|---|---|---|---|---|
| 1 | **실제 인증** | login 페이지 UI만, `demo@yieldo.io` 하드코딩 | Better Auth 또는 Clerk, email/password + Google SSO + 이메일 인증 + 세션 관리 | 3-5일 |
| 2 | **멀티 테넌트 (Organizations)** | 전역 mock 1개, 모든 사용자가 공유 | Better Auth Organization plugin, `org_id` scoped, RLS 정책 | 1주 |
| 3 | **데이터베이스** | 없음, 모든 데이터가 `mock-data.ts` 상수 | Supabase 프로젝트, 스키마 설계 (users/orgs/titles/cohorts/experiments/actions/audit_log), 마이그레이션 | 1-2주 |
| 4 | **API 라우트** | `src/app/api/` 디렉토리 존재 안 함 | Server Actions + Route Handlers: fetch cohort, run scenario, save decision, log action | 1주 |
| 5 | **Row-Level Security (RLS)** | 없음 | Supabase RLS 정책: 모든 테이블 `org_id = auth.org_id` 규칙 | 2-3일 (스키마 완성 후) |
| 6 | **보호된 라우트 / middleware** | `middleware.ts` 없음, 누구나 `/dashboard` 접근 | `middleware.ts`로 미인증 리다이렉트, 조직 context 설정 | 1일 |
| 7 | **법적 문서 (고객용)** | `Legal.md` 분석 문서만, ToS/Privacy/DPA 없음 | Terms of Service, Privacy Policy, Data Processing Agreement, Cookie Consent UI | 1주 (변호사 검토 포함) |

### 🟡 P1 — 파일럿·조기 고객 단계에 필요

| # | 차원 | 현재 | 필요 | 예상 공수 |
|---|---|---|---|---|
| 8 | **데이터 통합 (MMP/실험)** | Mock만 | Customer-Authorized Agent 패턴 (key 입력 → cohort fetch), 에러 핸들링, 재시도, rate limiting | 2주 (플랫폼당 3-4일) |
| 9 | **재무 입력 UX** | `mockFinancialHealth` | Visible.vc식 3분 재무 입력 (Revenue/UA Spend/Cash/Burn/Target Payback), 범위 입력, AES-256 암호화 | 1주 |
| 10 | **온보딩 플로우** | 없음, 로그인 → 바로 dashboard | 6단계 value-first (장르 → 벤치마크 prior → 5 숫자 → 첫 verdict → API 옵션) | 1-2주 |
| 11 | **결제 & 구독** | 없음 | Stripe 연결 (Customer, Subscription, Invoice, Webhook), 플랜 (Free/Pro/Enterprise), 사용량 과금 로직 | 2-3주 |
| 12 | **Empty states** | 모든 화면이 mock으로 가득 차있음 | "데이터 없음" placeholder + "Connect your MMP" CTA | 2-3일 |
| 13 | **Error boundaries** | 없음 | Next.js `error.tsx` + `not-found.tsx` per route group, Sentry 연결 | 1-2일 |
| 14 | **Settings / 조직 관리** | 사이드바 링크는 `#`로 연결 | `/settings`: Team (초대, 역할), Integrations (API 키), Billing (plan 변경, 청구서), Profile | 1-2주 |

### 🟢 P2 — 성장·스케일 단계에 필요

| # | 차원 | 현재 | 필요 | 예상 공수 |
|---|---|---|---|---|
| 15 | **감사 로그 (Audit trail)** | 없음 | `audit_log` 테이블에 모든 action 기록 (로그인, 설정 변경, 데이터 export). 엔터프라이즈 필수 | 1주 |
| 16 | **이메일 / 알림** | 없음 | Resend: welcome, password reset, invoice, weekly digest, scenario alert | 3-5일 |
| 17 | **관찰가능성** | 없음 (console 로그조차) | Sentry (errors) + PostHog or Vercel Analytics (product) + Axiom or Datadog (server logs) | 3-5일 |
| 18 | **성능 & 캐싱** | 매 요청 client-side mock | Upstash Redis (session, cached cohorts), TanStack Query (client cache), ISR (정적 benchmark 페이지) | 1주 |
| 19 | **AI Copilot Level 2-4** | Level 1 static shell | Vercel AI SDK + Claude + context serialize + scenario engine + action executor | 4-8주 |
| 20 | **접근성 (a11y)** | 중간 (일부 aria-label) | WCAG 2.1 AA 감사, 키보드 내비, 포커스 링, 색 대비 | 1주 |
| 21 | **문서·도움말** | 없음 | In-app 툴팁 (각 지표 "왜 중요한가"), help center (Mintlify/Nextra), onboarding walkthrough (Intro.js/Shepherd) | 2-3주 |
| 22 | **데이터 export** | 없음 | PDF (react-pdf — Investment Posture), CSV download, scheduled email reports | 1주 |
| 23 | **마케팅 사이트** | Deck v2 HTML만 | Landing page, Pricing, Blog, Changelog, Case studies (Next.js 별도 프로젝트 or Framer) | 2-3주 |
| 24 | **Trial/Demo 플로우** | 없음 | "Request demo" 폼 → Calendly → sales qualification → 트라이얼 계정 생성 | 3-5일 |

---

## 3. 차원별 점수판

| 차원 | 점수 (0-10) | 비고 |
|---|---|---|
| 디자인 시스템 | **9/10** | 거의 완성 |
| 제품 컨셉·스토리 | **9/10** | CLAUDE.md + Business Plan 탄탄 |
| 프론트엔드 프로토타입 | **8/10** | 5개 모듈 모두 렌더 |
| 인증·멀티테넌시 | **0/10** | 완전 부재 |
| 데이터 인프라 (DB) | **0/10** | Supabase 미설치 |
| API 레이어 | **0/10** | Route handlers 0 |
| 데이터 통합 (MMP/실험) | **1/10** | 계획만 |
| 결제·구독 | **0/10** | Stripe 미연결 |
| 보안·감사 | **1/10** | RLS 계획만 |
| 법적 문서 (고객용) | **2/10** | 분석 문서만 |
| 관찰가능성 | **0/10** | Sentry 0 |
| 이메일·알림 | **0/10** | 0 |
| 온보딩·Empty states | **1/10** | 부재 |
| 마케팅·성장 | **3/10** | 덱만 |
| **종합** | **≈ 15-20%** | **프로토타입 단계** |

---

## 4. 단계 목표 프레임워크

### 어느 단계를 목표로 하느냐에 따라 필요한 작업 범위가 달라집니다.

| 단계 | 의미 | 필요한 최소 작업 | 공수 (2인 팀) |
|---|---|---|---|
| **A. 투자자/심사위원 데모** | "이게 어떻게 생길 거다"만 보여주기 | 현재 상태로 충분 + Git 정리 + Module 3/4 완성 + 영어 덱 재작성 | **1-2주** |
| **B. 알파 파일럿 (친한 고객 3-5명)** | 실 데이터로 실 결정 내리게 하기 | **P0 전부** + P1의 온보딩/Empty states/Settings | **8-12주** |
| **C. 베타 (유료 고객 5-10명)** | Stripe 결제 받기 | **P0 + P1 대부분** + 법적 문서 확정 | **추가 6-8주** (C까지 총 14-20주) |
| **D. GA (General Availability)** | 자체 마케팅으로 신규 고객 유입 | **P0 + P1 + P2** | **추가 8-12주** (D까지 총 22-32주) |

---

## 5. 추천 진입 전략 — "단계 A → B 브리지"

### 📍 Phase 1 — 투자 유치용 프로토타입 완성 (1-2주)
- **Git 정리**: 지금까지 모든 작업을 의미 있는 커밋으로 묶기 + `.gitignore` 정비
- **프로토타입 gap 채우기**:
  - Module 3 (Actions) / Module 4 (Experiments)에 `<DecisionSurface>` 상단 카드 적용
  - KPI Cards 레거시 토큰 제거 (text-hero/card-premium/text-glow)
  - 나머지 11개 차트 카드 새 토큰으로 재스타일링
- **영어 단일 덱 재작성** (Deck v2 기반, US 투자자용)
- **법무 체크리스트** 작성 (어떤 문서가 파일럿 전에 필요한가)

### 📍 Phase 2 — Walking Skeleton (4-6주, Phase 1 완료 후)
"가볍게 실제로 동작하는" 시스템 — 기능은 적지만 진짜로 돌아감.
- Better Auth + Supabase 연결 + 스키마 설계
- `middleware.ts` + RLS
- 모든 `mock-data.ts`를 Supabase 쿼리로 교체 (같은 shape 유지 → 프론트 수정 최소)
- 친한 고객 3명과 알파 파일럿 시작 (데이터는 수동 입력)

### 📍 Phase 3 — 결제 가능 베타 (추가 6-8주)
- Stripe 연결 + 구독 플랜
- Resend 이메일
- Sentry + PostHog
- 기본 Settings (Team/Integrations/Billing/Profile)
- 첫 MMP 통합 (AppsFlyer 권장 — 가장 큰 시장점유율)
- 첫 유료 고객 확보

### 📍 Phase 4 — AI Copilot Level 2-4 (Phase 3와 병렬 가능)
- Level 2: Vercel AI SDK + Claude + 컨텍스트 serialize
- Level 3: Scenario simulator in chat
- Level 4: Action Executor Agent (법무 검토 필수)

---

## 6. "지금 당장 고민하지 않아도 되는 것"

이 블루프린트는 **미래 작업 계획**입니다. 매 세션마다 이걸 떠올릴 필요는 없습니다. 다만:
- 새 기능을 추가할 때 "이게 P0/P1/P2 중 어디 해당하나"를 물으면 됩니다
- 시간이 걸리는 인프라 결정 (Auth, DB, 결제)을 만날 때 이 문서의 §4 단계 프레임워크를 참조
- 투자자나 고객이 "이거 언제 준비되나" 물으면 §5 로드맵을 인용

---

## 7. 미해결 / 열린 질문

| Q | 해결 필요 시점 |
|---|---|
| 목표 단계는 A/B/C/D 중 무엇인가? | Phase 2 진입 전 (지금은 A/B 브리지 전략) |
| 2인 팀 구성은 어떻게 되는가? 풀스택 2명 vs 프론트+백 분업? | Walking Skeleton 시작 전 |
| 법무 검토는 누가 언제? | 파일럿 고객 첫 도입 직전 |
| 초기 파일럿 고객 3명은 누구? | Phase 2 시작 전 섭외 |
| Free tier 있나 vs. Paid only? | 베타 진입 전 pricing 결정 |
| 마케팅 사이트는 Next.js 내 통합 vs. 별도 도메인? | GA 진입 시점 |
| 데이터 통합 우선순위: AppsFlyer vs Adjust vs Statsig? | Walking Skeleton 후반 |

---

## 8. 참조

- `CLAUDE.md` — 제품 정체성 (섹션 7.4 2인 팀 명시, 8.4 기술 스택, 8.5 통합 전략)
- `docs/Project_Yieldo_Design_Migration_Log.md` — 디자인 시스템 변경 이력
- `docs/Project_Yieldo_Business_Plan.md` — 비즈니스 케이스
- `docs/Project_Yieldo_Legal.md` — 법적 분석
- `docs/Project_Yieldo_Engine_Blueprint.md` — 엔진 청사진
- `docs/Project_Yieldo_Data_Sources_Guide.md` — 데이터 소스

---

**이 블루프린트는 살아있는 문서입니다.** 각 차원이 해결될 때마다 점수와 상태를 업데이트하세요.
