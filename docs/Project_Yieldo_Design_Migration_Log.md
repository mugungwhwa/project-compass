# yieldo — Design Migration Log

> **목적**: 2026-04 시작된 US 엔터프라이즈 시장 대응 디자인 리노베이션의 모든 결정, 변경, 진행 상황을 추적하는 살아있는 문서. 새 세션/새 협업자가 이 파일 하나만 읽으면 "어디까지 왔고 다음에 뭘 해야 하는지" 알 수 있어야 한다.
>
> **갱신 규칙**: 모든 디자인/구조 변경 직후 해당 섹션에 기록. 각 항목은 날짜·근거·담당을 남긴다. 폐기된 결정은 삭제하지 말고 취소선(`~~~~`)으로 보존.

---

## 0. 한 눈에 보기 (Status Dashboard)

| 영역 | 상태 | 최근 업데이트 |
|---|---|---|
| 전략·방향 | ✅ 확정 | 2026-04-07 |
| 디자인 시스템 토큰 (`globals.css`) | ✅ 완료 | 2026-04-07 |
| 폰트 스택 (Geist + Instrument Serif) | ✅ 완료 | 2026-04-07 |
| `<DecisionSurface>` 컴포넌트 | ✅ 완료 (빌드 통과) | 2026-04-07 |
| `HeroVerdict` → `DecisionSurface` 리팩터 | ✅ 완료 | 2026-04-07 |
| `MarketHeroVerdict` → `DecisionSurface` 리팩터 | ✅ 완료 | 2026-04-07 |
| `RetentionCurve` 새 토큰 재스타일링 | ✅ 완료 | 2026-04-07 |
| `@visx/*` 설치 (--legacy-peer-deps) | ✅ 완료 | 2026-04-07 |
| `RunwayFanChart` Visx PoC (Module 5) | ✅ 완료 | 2026-04-07 |
| **BI 통일: project yieldo + Nautical N** | ✅ 완료 | 2026-04-08 |
| **App-shell: RunwayStatusBar (top)** | ✅ 완료 | 2026-04-08 |
| ~~App-shell: CopilotPanel (우측 slide-in)~~ | 🔁 폐기 → CommandBar로 교체 | 2026-04-08 |
| **App-shell: CopilotCommandBar (Variant A, 하단 고정)** | ✅ 완료 | 2026-04-08 |
| **FloatingAnswerCard (떠있는 답변 카드)** | ✅ 완료 | 2026-04-08 |
| **⌘K 키보드 단축키 + 토글** | ✅ 완료 | 2026-04-08 |
| **Module 1 dashboard에서 FH/AI 위젯 제거** | ✅ 완료 | 2026-04-08 |
| **PageHeader 비작동 UI 제거 (game/period/export)** | ✅ 완료 | 2026-04-09 |
| **한국어 네이밍 직관성 정리** | ✅ 완료 | 2026-04-09 |
| **Noto Sans KR 한글 폰트 로드** | ✅ 완료 | 2026-04-09 |
| **B2B Readiness Blueprint 문서** | ✅ 완료 | 2026-04-09 |
| **DS Research (Bloomberg/Toss/Top 10)** | ✅ 완료 | 2026-04-09 |
| **사이드바 192px 슬림화 + nav font-medium** | ✅ 완료 | 2026-04-10 |
| **Status bar h-14 + yieldoLogo lg** | ✅ 완료 | 2026-04-10 |
| **모듈 타이틀 재정립 (투자 결정 언어)** | ✅ 완료 | 2026-04-10 |
| **게임별 mock 데이터 (3 variants + cohort multiplier)** | ✅ 완료 | 2026-04-10 |
| **Asymptotic Arrival 인터랙티브 툴팁** | ✅ 완료 | 2026-04-10 |
| **Scenario Simulator 토큰 정리** | ✅ 완료 | 2026-04-10 |
| **Status bar: MetricCell 통일 패턴 (게임+캘린더)** | ✅ 완료 | 2026-04-13 |
| **react-day-picker date range 통합** | ✅ 완료 | 2026-04-13 |
| **bg-0 #F7F8FA 앱 배경 (Toss DPS)** | ✅ 완료 | 2026-04-13 |
| **글로벌 커서 표준화 정책** | ✅ 완료 | 2026-04-13 |
| **Vercel 배포 연동 + git push** | ✅ 완료 | 2026-04-13 |
| **MVP Revision (메시지·데이터 정합성·UX 폴리시)** | ✅ 완료 | 2026-04-14 |
| **Pretendard 본문 + Noto Serif KR 결정문** | ✅ 완료 | 2026-04-14 |
| **Dynamic chart grid (`useGridLayout`)** | ✅ 완료 | 2026-04-14 |
| **Responsive chart heights (h-full + flex-1)** | ✅ 완료 | 2026-04-14 |
| **Grid pair height/header 통일** | ✅ 완료 | 2026-04-14 |
| **Overview 2.0 expand 통합** | ✅ 완료 | 2026-04-14 |
| AI Copilot Level 2 (Vercel AI SDK + Claude) | 🔴 미착수 | — |
| AI Copilot Level 3 (Scenario Simulator in chat) | 🔴 미착수 | — |
| AI Copilot Level 4 (Action Executor Agent) | 🔴 미착수 | — |
| 나머지 위젯 새 토큰 재스타일링 (KPI/ChartCards 11개) | 🔴 미착수 | — |
| 컴포넌트 라이브러리 단일화 (Base UI) | 🔴 미착수 | — |
| Module 3/4 Decision Surface 적용 | 🔴 미착수 | — |
| 영어 단일 덱 재작성 (v2 기반) | 🔴 미착수 | — |

---

## 1. 확정된 디자인 전략 (Source of Truth)

### 1.1 포지셔닝
- **카테고리**: Signal-to-Yield Operating Terminal for Mobile Gaming
- **핵심 사용자**: 미국 중대형 게임 퍼블리셔의 CEO / CFO / UA Lead / Live Ops Head ($10M+ 매출)
- **디자인 무드**: *"Bloomberg Terminal이 Vercel을 인수했을 때처럼 생겨야 한다."*
- **키워드**: Conviction · Calibrated · Austere · Signal-Dense · Operator-Grade

### 1.2 결정 사항 (2026-04-07)
| 결정 | 확정값 | 근거 |
|---|---|---|
| 언어 디폴트 | **English** (`<html lang="en">`) | US 시장 타깃 |
| 테마 디폴트 | **Light** + Dark 토글 1급 지원 | CFO/CEO는 회의·프로젝터·모바일·PDF 익스포트가 주요 컨텍스트 (Ramp/Mercury/Stripe 선례) |
| Brand Blue | `#1A7FE8` | Visual Director 제안. Bloomberg 블루와 구별되는 명도, WCAG AA 통과 |
| 차트 라이브러리 | **Recharts 70% + Visx 30%** | Recharts: 표준 line/area/bar. Visx: fan chart, ridgeline, swimlane 등 시그니처 차트 전용 |
| 디자인 패턴 통일 | `<DecisionSurface>` — Situation → Confidence → Recommendation → Evidence 4단 | 모든 모듈이 동일 리듬으로 읽히도록. Lint 규칙으로 Confidence 영역 누락 시 빌드 실패 |
| 컴포넌트 라이브러리 | **Base UI 단일화** (Radix 팀 차세대) | 현재 shadcn + base-ui + radix 혼합 상태. shadcn이 Base UI로 이동 중 |
| 카피 톤 | 투자위원회 화법, 동사로 끝나는 문장, 수동태 금지 | "D7 retention improved +3.7pp. Scale UA." |
| 숫자 표기 | `$1.2M` / `+3.7pp` / `[P10: 6.1% – P90: 10.4%]` / `D14` | 혼용 금지. tabular-nums 전역 |
| Border Radius | `2px / 4px / 6px` — 라운드 없음 | 엔터프라이즈 결정 도구는 각진다 |
| Density | **Compact** | 여러 지표 동시 비교 |

### 1.3 폐기된 자산 / 결정 (2026-04-07)
- ~~`Project_Yieldo_Deck.html` (v1)~~ → **삭제 완료** (2026-04-07)
- ~~`prototype_dashboard.html`~~ → **삭제 완료** (2026-04-07)
- ~~한국어 i18n 디폴트 정책~~ → 영어 디폴트로 교체
- ~~Deck brand accent 팔레트 (`--accent-coral`, `--accent-lavender`, `--glow-blue` 등)~~ → 전면 폐기, globals.css에서 제거 예정
- ~~5겹 신뢰구간 노출 (P10/P25/P50/P75/P90 동시)~~ → 3겹(P10/P50/P90)으로 축소, 나머지는 토글
- ~~PvX Lambda 구조 기계적 모방~~ → yieldo 고유의 ATE→LTV 파이프라인 중심으로
- ~~Inter + JetBrains Mono 폰트 스택~~ → Geist + Geist Mono + Instrument Serif로 교체

### 1.4 유지된 자산
- `Project_Yieldo_Deck_v2.html` — 유지 (단, 향후 영어 단일 덱으로 재작성 예정)
- `yieldo/` Next.js 프로젝트의 FSD 구조 (`src/app`, `src/shared`, `src/widgets`) — 유지
- 기존 signal 컬러 방향 (Green/Amber/Red) — 유지, 정확한 hex만 재조정
- ATE → ΔLTV → Experiment ROI 번역 파이프라인 메시징 — 유지, 카피 톤만 조정

---

## 2. 기술 스택 현황

### 2.1 확정된 스택
| 항목 | 버전/선택 | 상태 |
|---|---|---|
| Next.js | **16.2.2** (2026-03-18 stable) | ✅ 유지 |
| React | 19.2.4 | ✅ 유지 |
| Tailwind | v4 | ✅ 유지 |
| Recharts | 3.8 | ✅ 설치됨 |
| framer-motion | 12.38 | ✅ 설치됨 |
| Base UI | 1.3 | ✅ 설치됨, 단일화 대상 |
| @visx/* | — | 🔴 추가 필요 |
| Geist 폰트 | `next/font/google` 내장 | 🔴 미적용 |
| Instrument Serif | `next/font/google` | 🔴 미적용 |

### 2.2 Next 16 주의사항 (프로젝트 경고)
`yieldo/AGENTS.md`에 명시:
> "This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."

**규칙**: Next.js 관련 코드 작성 전 반드시 로컬 docs 선행 확인.

### 2.3 Next 15 → 16 주요 Breaking Change (영향 있는 것만)
- **Async Request APIs**: `cookies()`, `headers()`, `params`, `searchParams`가 async. 현재 프로젝트는 mock 데이터만 쓰므로 당장 영향 없음.
- `useFormState` → `useActionState` 교체 필요 (현재 미사용)
- `@next/font` → `next/font` 마이그레이션 (현재 이미 `next/font/google` 사용)
- `geo`, `ip` on NextRequest 제거 (현재 미사용)
- `next/font` API는 15와 동일 — Geist 사용 안전

### 2.4 혼합 컴포넌트 라이브러리 현황
현재 설치된 것:
- `@base-ui/react` 1.3 — **목표 단일화 대상**
- `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip` — **점진 교체 대상**
- `shadcn` 4.1 — 생성기, 유지하되 Base UI 기반 템플릿으로 구성

---

## 3. 변경 내역 (Changelog)

> 모든 파일 편집은 이 섹션에 기록. 형식: `[날짜] 파일경로 — 변경 요약 — 근거`

### 2026-04-07
- `Project_Yieldo_Deck.html` — **삭제** — Deck v1 폐기 결정
- `prototype_dashboard.html` — **삭제** — 구 프로토타입 폐기
- `docs/Project_Yieldo_Design_Migration_Log.md` — **생성** — 이 문서

### 2026-04-14 (Sprint 5: Statsig-style Landing v2 Rebuild)

#### 핵심 결정
- **랜딩 구조 4섹션 → 10섹션 확장** — Statsig 리듬(Decision → Why → Modules → Proof → Explanation → CTA) 차용, yieldo 포지셔닝으로 변형. `Yieldo_Statsig_Style_Landing_Strategy.md`가 source of truth.
- **대시보드 위젯 재사용 접근법 3번 피벗** → 최종 **실제 위젯을 자연 크기 그대로 임베드**. 축소·변형 금지. 마케팅 SVG 재창조는 제품과 랜딩 간 시각 언어 불일치를 낳아 폐기.
- **언어별 Hero 폰트 패밀리** — Instrument Serif + Noto Serif KR(한글 폴백) 유지. Nanum Square Round 실험 후 철회 — 디자인 시스템 일관성 우선.

#### 변경된 파일
- `yieldo/src/widgets/landing/ui/sections/*.tsx` — 10개 섹션 컴포넌트 신규 (hero/problem/questions/modules/product-proof/chart-stories/copilot/translation/comparison/cta)
- `yieldo/src/widgets/landing/ui/_shared/*.tsx` — `SectionShell`(4개 band variant: canvas/surface/inset/dark), `Eyebrow`, `widget-fixtures.ts`(랜딩 전용 고정 스냅샷)
- `yieldo/src/widgets/landing/ui/showcase/pipeline-showcase.tsx` — 대시보드에 대응 위젯 없는 Experiment→ΔLTV→Payback 다이어그램만 bespoke 유지
- `yieldo/src/widgets/landing/index.ts` — barrel 재구성
- `yieldo/src/shared/i18n/dictionary.ts` — `landing.v2.*` 56+키 추가 (EN 기본, KO 병행, `headlineLine1/2` 분할)
- `yieldo/src/app/(public)/page.tsx` — 10섹션 재조립
- `yieldo/src/app/layout.tsx` — Noto Serif KR CDN 로드(한글 글리프용, `next/font/google` 타입 한계 우회)
- `docs/design/landing-v2-spec.md`, `docs/design/statsig-reference.md` — 신규 설계 문서

#### 중간 기착지 (폐기된 시도)
- **Phase 1 try A — `transform: scale` + 고정 컨테이너**: 레이아웃 미참여로 크롭 클리핑 발생
- **try B — CSS `zoom`**: 레이아웃 참여는 되지만 framer-motion 컴포지팅·Recharts `ResponsiveContainer` 측정·IntersectionObserver와 충돌
- **try C — `transform: scale` + ResizeObserver 높이 측정**: 기술적으로 동작하나 축소된 위젯은 랜딩 맥락에서 판독성 부족
- **try D (Path A) — 마케팅 전용 SVG 재창조**: 제품과 랜딩 시각 언어 분리 → 허위 표시 위험으로 폐기
- **try E (Path B, 최종) — 실제 위젯 100% 네이티브**: `max-w-[1100px]` + 프레임(border/shadow), 모바일 `overflow-x-auto`. 대시보드와 1:1 동기화.

#### 결정 사항
- **FSD 예외 수용**: `widgets/landing → widgets/dashboard·charts` 크로스 임포트는 arch-guard Critical 표기되지만 Path B의 의도적 선택. 향후 `shared/ui` 브릿지 승격은 별도 이슈.
- **band 알터네이션**: Hero(canvas) → WhyFail(surface) → Questions(inset) → Modules(dark) → Proof(surface) → ChartA(canvas) → ChartB(dark) → ChartC(surface) → Copilot(inset) → Translation(surface) → Comparison(canvas) → CTA(inset). light→dark→light 리듬.
- **Hero 타이포**: 한글 3줄 잘림 방지를 위해 `lg:text-9xl`(128px) → `lg:text-8xl`(96px) 하향. `word-break: keep-all` + `headlineLine1/2` 분할 유지.

#### 교훈 (다음 세션이 반복하지 말 것)
- **"대시보드를 랜딩에 넣는다"는 요구의 올바른 해석은 "실물을 그대로" 가 1순위**. 축소·재작성은 맥락 설명 후에 제안할 것.
- **`transform: scale`은 레이아웃 미참여** — 크롭용으로 쓸 땐 반드시 컨테이너 크기를 명시 예약하거나 ResizeObserver 측정. `zoom`은 framer-motion/Recharts와 충돌하니 회피.
- **Vercel 빌드 실패 = `git status` 확인이 먼저**. 이번 회차에 `dictionary.ts`가 unstaged라 로컬 tsc는 통과하고 Vercel만 실패한 사례 발생. `git add <dir>` 단위보다 `git add -A` 또는 명시적 파일 확인을 루틴화.
- **에이전트 디스패치 시 "커밋/푸시까지 포함" 명시**해야 중간 중단 방지. 이번에 4개 에이전트 중 2개가 커밋 직전 "Waiting for build" 상태로 멈춰 오케스트레이터가 마무리해야 했음.
- **폰트 CDN 경로**: `Nanum Square Round`는 Google Fonts에 **없음** — Naver `hangeul.pstatic.net` 사용. `Noto Serif KR`는 `next/font/google` 타입에 `"korean"` subset 누락 → 직접 CSS `<link>` 필수.

#### 커밋 체인 (feature/onboarding_page → main)
`e099f3d` (Phase 2 10 섹션) → `7c64686` (i18n 키 누락 수정) → `d3e2ad0` (zoom) → `795d730` (ResizeObserver) → `d2f5f78/adb0a6d` (Path A 쇼케이스) → `7284558` (Path B 실제 위젯) → `cf98396` (Nanum 실험) → `0049243` (Nanum 철회, 크기 축소 유지). main fast-forward merge.

#### Post-merge 수정 (main 직접)
- `034261d` — Chart/Proof 섹션에서 텍스트·위젯 수평 중심 정렬 (`mx-auto`) → 시각 비대칭 해소.
- `7f21477` → `c030334` → `91a1453` — 대시보드 위젯의 `sticky top-0 z-10` 해제 3단계 시도: Tailwind v3 prefix `!important` → v4 suffix → 최종 globals.css `.landing-static-widget` 명시적 CSS 규칙으로 확정 해결.
- `13c8c60` — `HeroVerdict`에 `compactScrollThreshold` prop 추가, 랜딩에서 `Number.MAX_SAFE_INTEGER` 전달해 `DecisionSurface`의 스크롤 기반 compact 전환 비활성화. 위젯이 스크롤 중 "접히는" 현상 제거.
- `c08c640` — §7 Copilot(Explainer) 삭제, Experiment Impact 카드로 교체. yieldo 포지셔닝("decision layer, not analytics")과 정합. §8 파이프라인과 역할 분담 (§7 = one-scene case, §8 = schema). 새 i18n 키 `landing.v2.expImpact.*` 추가.
- `c0b1491` — 랜딩 내 모든 CTA(`#demo`, `/contact`, `/dashboard`)를 `/login`으로 통일 라우팅. NavBar 로고만 `/` 유지.

---

### 2026-04-14 (Sprint 4: MVP Revision + Typography + Dynamic Grid)

#### 핵심 결정
- **메시지·데이터 정합성 재점검** — 랜딩/대시보드의 내러티브와 KPI 언어를 "투자 결정"으로 통일. 게임명 단일화, 기대효과 숫자 명시, 계산 근거 노출.
- **타이포그래피 권위감 업그레이드** — 한글 본문 Pretendard, 한글 결정문 Noto Serif KR 폴백 추가. 한/영 모두 Bloomberg/FT급 권위감을 일관되게 전달.
- **그리드 자율 재배치** — 차트 확대 시 컨테이너가 쌍/비대칭 레이아웃을 자동 계산. 빈 칸 제거·홀수 보정·비대칭 그리드 리플로우까지 단일 훅으로.
- **그리드 쌍 시각 균형 완성** — CSS Grid `stretch`만으론 부족. `baseHeight` 상향 통일 + `ChartHeader` 줄 수(3줄) 통일 조합으로만 시각 균형 달성.

#### 커밋
- `25d0aa5 feat: MVP revision`
- `2d0b156 feat: font upgrade`
- `2a4a8ec feat: dynamic chart grid`
- `f104a9f feat: responsive chart heights`
- `c3c95cb fix: unify grid pair heights`
- `6aa9eec fix: apply expand + useGridLayout to Overview 2.0`
- `d6e3aa8 chore: untrack .next/ and revision notes`

#### 변경 파일 및 근거

**MVP Revision (`25d0aa5`)**
- `yieldo/src/app/(public)/**` (랜딩) — 4사일로 내러티브로 통일, CTA "View Live Demo" 중심 재편 — 데모 체험이 첫 가치 전달 지점
- 전체 mock — 게임명 `"Puzzle Quest"` → **`"Match League"`** 전면 통일 — 예창패 트랙과 제품 내 표기 일치
- `yieldo/src/shared/i18n/dictionary.ts` — KPI 명칭 투자 언어화
  - Payback Period → **Payback Forecast** / 회수 기간 → **회수 예측**
  - BEP Probability → **Break-even Probability** / BEP 확률 → **손익분기 확률**
  - Burn Tolerance → **Runway Impact** / 잔여 운영 기간 → **잔여 운영력**
  - 근거: 후행 관찰이 아닌 "앞으로의 의사결정"에 쓰는 언어로 교체
- KPICards — `basisKey` prop 추가로 계산 근거 한 줄 노출 (예: "D7 관측치 × 장르 벤치마크 슬로프")
- 추천 액션 — 기대효과 숫자 표기 (`+$120K annualized revenue`) — 결정 가격표 명시
- Copilot — 시나리오 액션 버튼 3개 (Run scenario / Compare channels / Simulate lower CPI) — 정적 답변 → 실행 가능 탐색
- 차트 3개(RevenueVsInvest, RetentionCurve, RevenueForecast) — 한 줄 인사이트 삽입
- `yieldo/src/app/(dashboard)/layout.tsx` — 우상단 **Demo Data** 배지

**Pretendard + Noto Serif KR (`2d0b156`)**
- `yieldo/src/app/layout.tsx`, `yieldo/src/styles/globals.css`
  - 본문 한글: `Noto Sans KR` → **`Pretendard`** (jsdelivr CDN, Variable) — Geist와 x-height·메트릭 호환, Toss DPS 표준
  - 결정문 한글: `Instrument Serif` 체인에 **`Noto Serif KR`** 폴백 — 영문 serif 권위감을 한글에도 일관 적용
  - 근거: 한/영 혼용 화면에서 본문 리듬 + 결정문 무게감이 모두 한 방향으로 읽혀야 함

**Dynamic chart grid (`2a4a8ec`, `f104a9f`, `c3c95cb`, `6aa9eec`)**
- `yieldo/src/shared/hooks/use-grid-layout.ts` — **신규** 훅
  - 컨테이너 레벨 확대 상태 관리: `{ expandedId, toggle, getSpan, isOrphan, getClassName }`
  - Framer Motion `layout` prop 기반 FLIP 애니메이션으로 자동 재배치
  - 홀수 남은 차트는 `col-span-2`로 확장되어 빈 칸 제거
- `yieldo/src/shared/hooks/use-chart-expand.ts` — 선택적 외부 상태 주입 (`expanded?`, `onToggle?`) 지원
- 그리드 내 차트 컴포넌트 — `expanded?` / `onToggle?` optional props 추가
- 차트 카드 — `h-full flex flex-col`, body는 `flex-1` + `minHeight: chartHeight`, `ResponsiveContainer height="100%"` — CSS Grid `align-items: stretch`가 쌍의 높이 자동 동기화
- 그리드 쌍 `baseHeight` 상향 통일 (큰 쪽 기준)
  - market-gap §3 RankingTrend 240→**280**
  - market-gap §4 SaturationTrend 240→**320**, CompetitorTable 헤더 3줄화
  - experiments RolloutHistory 280→**320**
- `ChartHeader` 3줄(title + subtitle + context) 통일 — 그리드 stretch만으론 시각 균형 미완성, 헤더 줄 수까지 맞춰야 함
- **Overview 2.0 보완 (`6aa9eec`)**
  - CapitalWaterfall, TitleHeatmap, MarketContextCard에 `ExpandButton` 추가 (c69a166 리디자인에서 누락된 부분)
  - `yieldo/src/app/(dashboard)/dashboard/page.tsx` — §3(3:2), §5(3:1) **비대칭 그리드** 리플로우 로직 추가. 확대 시 양쪽 모두 `col-span-max`로 전환하여 스택
  - DataFreshnessStrip은 의도적 제외 (정보 스트립)

**Housekeeping (`d6e3aa8`)**
- 루트 `.gitignore` — `.next/`, `Yieldo_MVP_Revision_Notes_*.md` 추가 (빌드 결과물 / 임시 리비전 노트 비추적)

### 2026-04-13 (Sprint 3: Status Bar UX 확정 + 배포)
- **git push** → `mugungwhwa/project-yieldo` main 브랜치 (`8daab7c→4dde8dd`). Vercel 자동 배포 연동 완료.
- `CLAUDE.md` §8.4.1 — **Vercel 배포 가이드** 추가 (Root Dir, Install Override `--legacy-peer-deps`, 빌드 워크플로우)

### 2026-04-10 ~ 12 (Sprint 3: Status Bar 게임·캘린더 UX)

#### 핵심 결정: "MetricCell과 같은 시각 언어로 통일"
- 게임 셀렉터/캘린더를 테두리 없는 **라벨+값+▾** 패턴으로 교체 (좌측 재무 메트릭과 동일 형태)
- 이전 시도: Segmented Pill → 분리 버튼 → 모두 시각적으로 메트릭과 충돌. **근본 원인**: 좌측(정적 읽기)과 우측(인터랙티브 버튼)의 시각 언어가 달랐음
- 해결: 둘 다 `text-caption uppercase label + text-h2 value` 포맷. 유일한 차이는 ▾ chevron

#### 변경 파일
- `yieldo/src/widgets/app-shell/ui/runway-status-bar.tsx` — **대폭 재작성**
  - Segmented Pill 해체 → 게임/캘린더가 `gap-1` 독립 MetricCell 스타일
  - `react-day-picker` (DateRange mode) 통합 — 시작일~종료일 범위 선택
  - 트리거 표시: `Mar 1–31` (en) / `3/1–31` (ko) — `font-mono` 숫자, `text-body font-medium` 텍스트
  - DayPicker popover: `--rdp-accent-color: var(--brand)`, `--rdp-range_middle-background-color: var(--brand-tint)`
  - framer-motion: `AnimatePresence` + `dropdownVariants` (scale 0.95→1, opacity, y -4→0)
  - 키보드: Enter/Space/Esc/↑↓ 게임 드롭다운, Enter/Space/Esc 캘린더
  - `getGameData(gameId, cohortMonth)` 연동 — 게임/코호트 변경 시 메트릭 실시간 전환
  - ◀ ▶ 화살표 버튼 제거 (DayPicker가 자체 월 내비 제공)
  - `ChevronLeft`, `ChevronRight` import 제거
- `yieldo/src/shared/api/mock-data.ts` — **게임별 mock 데이터** 추가
  - `GAME_VARIANTS` 레코드: puzzle-quest (기존), hero-saga (hold/71%), farm-empire (invest/91%)
  - `COHORT_MULTIPLIERS`: 월별 미세 변동 (0.92~1.03)
  - `getGameData(gameId, cohortMonth)` 함수 export
- `yieldo/src/styles/globals.css` — **2가지 추가**
  - `--bg-0: #F7F8FA` — 앱 배경 토큰 (Toss DPS 참고 연회색). `--background: var(--bg-0)`으로 변경
  - **커서 표준화 정책** — `button:not(:disabled)`, `[role="button"]`, `a[href]` 등 모든 인터랙티브 요소에 `cursor: pointer` 자동 적용. `disabled` → `cursor: not-allowed`
- `yieldo/package.json` — `react-day-picker` 의존성 추가

#### 추가 수정 (04-10)
- `yieldo/src/widgets/charts/ui/retention-curve.tsx` — Asymptotic Arrival 툴팁 수정
  - Recharts `<ReferenceLine label>` 정적 텍스트 → 커스텀 `<AsymptoticLabel>` SVG 컴포넌트
  - `foreignObject`로 HTML 카드 렌더 (hover 시 설명 표시)
  - 투명 `<rect>` 80×20px 히트 영역 추가
  - `info.asymptotic` 사전 키 추가 (ko/en)
- `yieldo/src/shared/i18n/dictionary.ts` — 모듈 타이틀 재정립
  - `exec.title`: "추가 투자가 가능한가?" → **"지금 투자를 늘려야 하는가?"**
  - `actions.title`: "실제로 효과가 있는 것은?" → **"어떤 운영이 가장 효과적인가?"**
  - `experiments.title`: "R&D가 성과를 내고 있는가?" → **"R&D 투자가 성과를 내는가?"**
  - `capital.title`: "다음에 무엇을 해야 하는가?" → **"자본을 어디에 배분할 것인가?"**
- `yieldo/src/widgets/sidebar/ui/app-sidebar.tsx`
  - 사이드바 폭 `w-[220px]` → `w-[192px]` (13% 감소)
  - nav 아이템 `font-semibold` → `font-medium`, 패딩 축소
  - 한국어 라벨 `truncate` + `min-w-0` overflow 보호
  - 게임 셀렉터 제거 (status bar로 이동)
- `yieldo/src/widgets/app-shell/ui/runway-status-bar.tsx` — status bar 높이 `h-12` → `h-14`, yieldoLogo `size="md"` → `size="lg"`
- `yieldo/src/shared/ui/yieldo-logo.tsx` — `xl` 사이즈 추가 (22/30px)
- `yieldo/src/widgets/charts/ui/scenario-simulator.tsx` — legacy 토큰 정리 (`bg-white` → `bg-[var(--bg-1)]` 등)

### 2026-04-09 (B2B Readiness 감사 + DS Research)
- `docs/Project_Yieldo_B2B_Readiness_Blueprint.md` — **생성** — 24차원 gap 분석, P0/P1/P2 분류, 4단계 로드맵
- Migration Log §6 — B2B Blueprint 포인터 추가
- Migration Log §7 — Design System Research 섹션 추가 (Bloomberg/Toss/Top 10 레퍼런스, 구축 옵션 4가지, 숫자 표기 규칙 draft)
- `yieldo/src/widgets/sidebar/ui/page-header.tsx` — **비작동 UI 제거** (게임 셀렉터, 기간 셀렉터, 내보내기 버튼). "5분 전" → "Sample data" 배지
- `yieldo/src/widgets/sidebar/ui/app-sidebar.tsx` — 게임 셀렉터 footer→상단 이동, `h-screen`→`h-full`+`pb-20`
- `yieldo/src/shared/i18n/dictionary.ts` — 한국어 네이밍 정리 (외래어 음역 제거: "페이백"→"회수 시점", "코파일럿"→"질의응답" 등)
- `yieldo/src/app/layout.tsx` — `Noto_Sans_KR` 폰트 추가, `--font-noto-kr` CSS 변수
- `yieldo/src/styles/globals.css` — body font-family에 `var(--font-noto-kr)` 체인 추가

### 2026-04-08 — 밤 (한국어 i18n 지원 + 로케일 디폴트 일치화)
사용자 리포트: 현재 화면이 "사이드바는 한국어 / 상단 status bar·하단 copilot은 영어"의 하이브리드 상태. 원인 진단:
- **LocaleProvider 기본값이 여전히 `"ko"`** 였음 (내가 2026-04-07에 `<html lang="en">`으로 바꿨지만 런타임 로케일은 안 건드렸음)
- **내가 새로 만든 3개 shell 컴포넌트**(`RunwayStatusBar`, `CopilotCommandBar`, login subtitle)는 `useLocale()`를 쓰지 않고 **하드코딩 영어**만 갖고 있었음
- 결과: 한국어 로케일 상태에서 sidebar/HeroVerdict/KPI는 한국어, 내 새 컴포넌트는 영어 → 시각적 언어 혼재

- `yieldo/src/shared/i18n/dictionary.ts` — **17개 신규 키 추가**
  - `status.cash`, `status.runway`, `status.payback`, `status.capEff` — status bar 메트릭 라벨
  - `copilot.askyieldo`, `copilot.placeholder`, `copilot.comingSoon`, `copilot.context`, `copilot.footer`, `copilot.module1Ctx` — Copilot UI 라벨
  - `copilot.mock.user`, `copilot.mock.intro`, `copilot.mock.b1/b2/b3`, `copilot.mock.followup` — Copilot v0 mock 답변 카드 내용
  - `login.subtitle` — login 페이지 서브타이틀
- `yieldo/src/widgets/app-shell/ui/runway-status-bar.tsx` — **locale-aware로 재작성**
  - `buildMetrics()`가 hardcoded string 대신 `TranslationKey`를 반환
  - `MetricCell`이 `t(labelKey)`로 렌더
  - `<yieldoLogo>` 워드마크는 브랜드 이름이므로 번역 안 함 (Vercel/Linear 원칙)
- `yieldo/src/widgets/app-shell/ui/copilot-command-bar.tsx` — **locale-aware로 재작성**
  - 하드코딩 `MOCK_ANSWER` 상수 제거
  - `FloatingAnswerCard`, `CopilotCommandBar` 모두 `useLocale()` + `t()` 기반
  - Mock bullets는 `[t("copilot.mock.b1"), t("copilot.mock.b2"), t("copilot.mock.b3")]`로 조립
- `yieldo/src/app/(auth)/login/page.tsx` — subtitle을 `t("login.subtitle")`로 교체
- `yieldo/src/shared/i18n/context.tsx` — **LocaleProvider 기본값 `"ko"` → `"en"`**
  - 이 변경으로 `<html lang="en">`과 런타임 로케일이 일치
  - 기존 사용자는 localStorage에 이전 선택(`ko` 또는 `en`)이 남아있으면 그걸 존중 (toggle로 자유 전환 가능)
  - 신규 사용자는 영어 디폴트 경험
- **빌드 검증**: `npm run build` — Next 16.2.2 Turbopack 2.8s / tsc 2.5s / 10 static pages 통과

### 2026-04-08 — 저녁 (BI 통일: project yieldo / Nautical N)
사용자 검토 후 문제 발견: 상단 status bar의 `yieldo` (Instrument Serif)와 우측 sidebar의 `YIELDO` (Inter 900 uppercase, 구 brand blue `#2563EB`, 스트레이 N 텍스트 SVG 아티팩트 포함)가 완전히 다른 BI를 쓰고 있었음. 두 워드마크가 한 화면에 동시 보임.

10개 글로벌 레퍼런스 조사 후 사용자 결정:
- **이름 변경**: `yieldo` → `project yieldo` (lowercase, 2-word codename 형식)
- **방향**: Direction γ — Nautical N (얇은 북쪽 화살표 삼각형 + Geist Sans 600 lowercase 워드마크)
- **레퍼런스**: Vercel(△), Cursor(이름-아이콘 일치), Linear(geometric mark + lowercase wordmark)

- `yieldo/src/shared/ui/yieldo-logo.tsx` — **전면 재작성**
  - 기존: `<yieldoLogo size showSubtitle>` — Inter 900 UPPERCASE "YIELDO" + 1-line subtitle "INVESTMENT DECISION OS" + ornate yieldo-rose SVG with stray "N" text + hardcoded `#2563EB`
  - 신규: `<yieldoLogo size variant>` — Geist Sans 600 lowercase "project yieldo" + 단순 솔리드 삼각형 (north needle) `<path d="M7 1 L13 13 L1 13 Z" fill="var(--brand)"/>` + brand blue 토큰 사용
  - Size 스케일 재조정: sm (12/14) / md (14/18) / lg (18/24)
  - Variant: `full` (icon + word) | `icon` (mark only, 좁은 공간용)
  - 모든 색은 토큰으로 (`var(--brand)`, `var(--fg-0)`)
- `yieldo/src/widgets/app-shell/ui/runway-status-bar.tsx` — 인라인 Instrument Serif `yieldo` 스팬 제거, `<yieldoLogo size="md" />` 사용
- `yieldo/src/app/layout.tsx` — metadata title `"yieldo —"` → `"project yieldo —"`
- 사이드바 (`app-sidebar.tsx`)는 이미 `<yieldoLogo size="sm" />`를 호출 중이므로 자동으로 새 디자인 적용 — 추가 수정 불필요. 이게 컴포넌트 분리의 보상.

**브랜드 시스템 결정 정리** (Migration Log §1.2 갱신 필요):
- **Wordmark**: `project yieldo` (lowercase, 2-word, Geist Sans 600, `-0.015em` tracking)
- **Brand mark**: 솔리드 isoceles 삼각형 (북쪽 화살표), brand blue `#1A7FE8`
- **사용 폰트 역할 분리**:
  - Instrument Serif → **오직 Decision statements** (HeroVerdict 권고문). 워드마크에 사용 금지.
  - Geist Sans → 워드마크 + 모든 UI 본문/헤딩
  - Geist Mono → 모든 숫자/코드/메트릭 (tabular nums)
- **희소성 = 강조**: Serif는 결정 순간에만 등장 → 그 순간이 더 강력해짐

### 2026-04-08 — 오후 (Variant A 피벗: Right Panel → Bottom Command Bar)
사용자 실사용 검토 후 피드백: *"이부분을 아래 하단에 메세지창으로 만들어보는건 어때?"* — 우측 slide-in 패널을 **하단 고정 command bar + floating answer card**로 교체. Cursor/Perplexity/Vercel v0 패턴.

- `yieldo/src/widgets/app-shell/ui/copilot-panel.tsx` — **삭제** — 우측 slide-in 패널 폐기
- `yieldo/src/widgets/app-shell/ui/copilot-command-bar.tsx` — **신규**
  - `CopilotCommandBar` (하단 고정, 64px): 좌측 ⚡ 토글 버튼 + 가운데 비활성 input + 우측 Send(disabled) + ⌘K 배지
  - `FloatingAnswerCard` (내부 컴포넌트): bottom 88px 위치에 fixed, 640px max-width, 중앙 정렬. 열릴 때 fade + y-up 2px. Backdrop opacity 0.03 (거의 투명, 클릭 시 닫힘). Esc 키 핸들러 로컬 추가.
  - 카드 구조: 헤더(context + close X) → user query → AI response(intro + bullets + followup, border-l 2px brand) → 푸터 hint
  - v0: 입력 disabled, 클릭 시 MOCK_ANSWER 카드 표시. 실제 AI 응답은 Level 2부터
- `yieldo/src/widgets/app-shell/ui/runway-status-bar.tsx` — **수정** — 우측 "Ask yieldo" 트리거 버튼 제거. Command bar가 이제 하단에 항상 보이므로 중복 제거. Lucide Zap/Command 임포트와 useCopilot import도 함께 제거
- `yieldo/src/widgets/app-shell/index.ts` — **수정** — `CopilotPanel` export 제거, `CopilotCommandBar` export 추가
- `yieldo/src/app/(dashboard)/layout.tsx` — **수정** — `<CopilotPanel>` → `<CopilotCommandBar>` 교체. `<main>` 패딩 `pb-8` → `pb-24`로 증가 (하단 bar 64px + 여유)

**결정 근거**: 
- Cursor/v0/Perplexity 모두 bottom command bar 패턴으로 수렴. yieldo 타깃 사용자(운영자)는 개발자와 같은 키보드/커맨드 친화 사용자
- 우측 panel이 360px를 항상 잡을 위험 제거 → 본문 화면 보호
- 하단 bar 진입 마찰 0 (토글 필요 없음, 항상 보임)
- CopilotProvider/store는 100% 재사용 — UI shell만 swap

**유지 사항**: 
- ⌘K 토글 동작, Esc 닫기, CopilotProvider Context API는 그대로
- v0 static shell 원칙 유지 — 입력은 여전히 disabled, 카드는 하드코딩
- Level 2+ 로드맵(Vercel AI SDK + useChat())은 §5에 그대로

### 2026-04-08 (Sprint 2: App-Shell Refactor)
- **Deep Interview** (4 라운드, 10% 모호성): Module 1의 FinancialHealth + AI Recommendation을 page 위젯에서 app-shell 컴포넌트로 승격하기로 결정
- 스펙: `.omc/specs/2026-04-08-dashboard-shell-refactor.md`
- `yieldo/src/widgets/app-shell/ui/copilot-store.tsx` — **신규** — React Context + Provider, ⌘K/⌃K 토글 핸들러, Esc로 닫기. v0는 단순 open/close 상태만 (메시지 히스토리, 스트리밍 등 Level 2+에서)
- `yieldo/src/widgets/app-shell/ui/runway-status-bar.tsx` — **신규** — 상단 sticky 48px status bar
  - 좌측: `yieldo` brand sigil (Instrument Serif) + 4개 메트릭 셀 (Cash $1.8M / Runway 14.5mo / Payback D47 / Cap Eff 1.42x)
  - 각 메트릭 라벨은 Geist Sans uppercase caption, 값은 Geist Mono tabular text-h2
  - tone 시스템: runway가 6mo 미만이면 risk red, 12mo 미만이면 caution amber, 그 외는 positive green
  - 각 메트릭 클릭 시 해당 모듈 (`/dashboard/capital`)로 이동
  - 우측: `⚡ Ask yieldo · ⌘K` 트리거 버튼 — 활성 시 brand-tint 배경
- `yieldo/src/widgets/app-shell/ui/copilot-panel.tsx` — **신규** — 우측 360px slide-in 패널 (v0 STATIC SHELL)
  - 헤더: Sparkles + "Ask yieldo" + 닫기 X
  - Context indicator 바: "Module 1 · Executive Overview · Cohort 2026-03" (정적)
  - 메시지 영역: 4개 하드코딩 turn (user → assistant with bullets+followup → user → assistant placeholder)
  - 입력 영역: disabled input (`"AI copilot — coming soon"` placeholder) + ⌘K 배지
  - 푸터: "yieldo Copilot v0 · Static preview · See roadmap §5"
  - Backdrop: opacity 0.04 (거의 투명, 클릭 시 닫힘)
  - Translation: `translate-x-full` ↔ `translate-x-0` (220ms ease-out-quart)
- `yieldo/src/widgets/app-shell/index.ts` — **신규** — barrel exports
- `yieldo/src/app/(dashboard)/layout.tsx` — **수정** — `<CopilotProvider>`로 wrap, `<RunwayStatusBar>`를 main 위에, `<CopilotPanel>`을 fixed overlay로 추가. flex container를 column으로 변경
- `yieldo/src/app/(dashboard)/dashboard/page.tsx` — **수정** — `<FinancialHealth>` 임포트 및 사용 제거, AI Recommendation inline div 제거, 마지막 grid 재정렬 (RevenueForecast 단독)
- 빌드 검증: 다음 단계
- **다음 세션 권장**: KPI Cards 토큰 정리 → Module 3/4 DecisionSurface 적용 → AI Copilot Level 2 (Vercel AI SDK)

### 2026-04-07 (Sprint 2: Integration 첫 세션)
- `yieldo/src/widgets/dashboard/ui/market-hero-verdict.tsx` — **DecisionSurface 기반으로 재작성**
  - Public API 보존 + optional `recommendation` prop 추가
  - Status 매핑: `rising` → invest, `falling` → reduce, `stable` → hold
  - Confidence interval: `rank`과 `rankChange`로부터 합성 (`synthesizeRankCI`) — 변동 적을수록 band 타이트, 변동 클수록 wider
  - Impact 배지: "+5 rank · 92% posterior" 형태로 momentum + confidence 동시 표시
  - Default recommendation: status별 영/한 기본 문장 제공, 외부에서 override 가능
- `yieldo/src/widgets/charts/ui/retention-curve.tsx` — **yieldo 시그니처 차트 재스타일링**
  - 하드코딩 hex(`#5B9AFF`, `#FFA94D`, `#3EDDB5`, `#94A3B8`, `#E2E8F0`, `#F1F5F9`) → 상단 `const C` 객체로 분리, globals.css 토큰과 동기화
  - Wrapper gradient + glow 제거 → flat card
  - Recharts SVG attr이 `var()`를 안정적으로 해석 못 하므로 **token-mirrored hex 패턴** 채택 (주석으로 토큰 이름 병기)
  - P50 dot: hollow → solid fill (더 정직한 observed 표시)
  - CartesianGrid stroke: `2 4`로 미세화, legend icon 12→10, strokeWidth 2.5→2
- `yieldo/src/shared/api/mock-data.ts` — **`mockCashRunway` 추가** — `RunwayPoint`, `RunwayFanData` 타입 포함, 12개월 P10/P50/P90 fan 데이터, initialCash 1800K, cashOutThreshold 0, p50CashOutMonth 12.0, probCashOut 0.23
- `yieldo/package.json` — **@visx 설치 (7 패키지)** — `@visx/group`, `@visx/scale`, `@visx/shape`, `@visx/axis`, `@visx/curve`, `@visx/responsive`, `@visx/text`. React 19 peer dep 충돌 → `--legacy-peer-deps`로 설치 (Visx는 SVG 렌더링만 하므로 runtime 안전)
- `yieldo/src/widgets/charts/ui/runway-fan-chart.tsx` — **신규 생성** — yieldo 첫 Visx 차트
  - 구조: `ParentSize` → `Group` → Cash-out zone rect → gridlines → `AreaClosed` (P10-P90 band) → `LinePath` P90/P10 (dashed outline) → `LinePath` P50 (primary) → P50 dots → P50 cash-out 교차 마커 → `AxisBottom`/`AxisLeft`
  - Cash-out zone: threshold 아래 직사각형 필(`rgba(201,55,44,0.08)`) + dashed threshold line
  - P50 cash-out marker: P50이 threshold를 가로지르는 x 좌표에 vertical dashed line + 붉은 원형 마커
  - 축 폰트: `var(--font-geist-mono)` tabular — 모든 숫자 정렬
  - 우상단 annotation: `23% probability of cash-out by month 12` — yieldo 디자인 원칙 §3 "확률은 숫자와 면적으로 동시에"
  - 컨테이너는 flat card, 토큰 기반 border/radius
- `yieldo/src/widgets/charts/index.ts` — `RunwayFanChart` export 추가
- `yieldo/src/app/(dashboard)/dashboard/capital/page.tsx` — `<RunwayFanChart data={mockCashRunway} locale={locale} />` 추가 (KPI Cards 아래, ScenarioSimulator 위)
- **빌드 검증**: 각 단계 후 `npm run build` 실행, 모두 Next 16.2.2 Turbopack 2.6-2.9s + tsc 2.3-2.6s + 10페이지 정적 생성 통과

### 2026-04-07 (Sprint 2 진행 중: Integration)
- `yieldo/src/app/globals.css` — **삭제** — 고아 파일(아무도 import 안 함), 과거 shadcn 초기화 잔재
- `yieldo/src/styles/globals.css` — **레거시 alias 블록 추가** — 기존 위젯 13개가 참조하던 폐기 클래스/변수 복구
  - 추가된 alias 변수: `--accent-blue/green/orange/lavender/coral` (→ `--chart-cohort-*`), `--brand-light` (→ `--brand-tint`), `--glow-blue/green` (→ 거의 투명한 no-op)
  - 추가된 legacy 유틸리티 클래스: `.card-premium` (gradient/glow 제거, flat enterprise card로), `.card-glow` (border 전환만), `.text-hero`, `.text-hero-lg`, `.text-glow` (no-op), `.signal-bg-invest/hold/reduce` (그라데이션 제거, tint만)
  - 원칙: 이 블록은 위젯이 하나씩 `DecisionSurface` 기반으로 리팩터되면서 점진적으로 삭제. 신규 코드 사용 금지
- `yieldo/src/widgets/dashboard/ui/hero-verdict.tsx` — **내부 구현 DecisionSurface 기반으로 재작성**
  - Public API 보존 (status, confidence, factors, payback, nextAction)
  - 신규 optional prop: `reason` (situation 문장용)
  - 매핑: payback → DecisionSurface.confidence, nextAction → recommendation (Serif Display), reason → situation, factors → evidence (접힘), confidence 스칼라 → impact 배지
  - framer-motion sticky wrapper는 최소 유지 (Module 1 top-of-fold 고정)
  - 구 하드코딩 색상(`#3EDDB5`, `#FF6B8A`, `#FFA94D` 등) 전부 새 시그널 토큰으로 교체
- `yieldo/src/app/(dashboard)/dashboard/page.tsx` — `<HeroVerdict>`에 `reason={mockSignal.reason}` prop 추가 (1줄)
- **빌드 검증**: `npm run build` — Next 16.2.2 Turbopack 3.3s 컴파일, tsc 2.9s 통과, 10개 정적 페이지 생성 성공

### 2026-04-07 (Sprint 1: Foundation 완료)
- `yieldo/src/styles/globals.css` — **전면 재작성** — 구 accent/glow/premium 유틸리티 제거, 새 토큰 체계 도입
  - 추가: `--bg-0..4`, `--fg-0..3`, `--brand: #1A7FE8`, `--signal-{positive|caution|risk|pending}`, `--chart-p50/band-inner/band-outer/cohort-1..6`, `--radius-{inline|card|modal}`, `--duration-{micro|component|chart}`, `--ease-out-quart`
  - 제거: `--accent-coral`, `--accent-lavender`, `--glow-blue`, `.card-premium`, `.text-glow`, `.signal-bg-*` 그라데이션
  - 유지(전환용): `--background`, `--text-primary`, `--signal-green` 등을 새 토큰의 alias로 남김 — 기존 위젯이 깨지지 않도록 하는 브릿지. 전면 리팩터 후 삭제 예정
  - 다크 테마: `html[data-theme="dark"]` 기반 opt-in, 기본값은 light
  - 글로벌: `* { font-variant-numeric: tabular-nums }` — 모든 숫자 비교 가능하게
  - 타이포 유틸: `.text-display / .text-h1 / .text-h2 / .text-h3 / .text-body / .text-caption`
- `yieldo/src/app/layout.tsx` — 폰트 스택 교체 + 언어 변경
  - `Inter` → `Geist` (variable: `--font-geist-sans`)
  - `JetBrains_Mono` → `Geist_Mono` (variable: `--font-geist-mono`)
  - 신규: `Instrument_Serif` (variable: `--font-instrument-serif`, weight 400, italic 포함) — Decision statement 전용
  - `lang="ko"` → `lang="en"`
  - metadata title/description US 메시지로 교체
- `yieldo/src/shared/ui/decision-surface.tsx` — **신규 생성** — yieldo의 유닛 컴포넌트
  - 4단 구조: Status Badge / Situation / ConfidenceBar / Recommendation(Display-Serif) / Evidence(collapsed)
  - Confidence는 **필수 prop** — 타입 시스템 레벨에서 강제 (`confidence: Confidence` non-optional)
  - `ConfidenceBar` 내장: P10-P90을 너비로, P50을 2px vertical mark로 시각화 — 숫자가 아닌 너비로 확신도 전달
  - Impact prop으로 positive/negative/neutral 시그널 컬러 자동 적용
  - Evidence는 `useState`로 접힘/펼침 토글, 기본 접힘
  - 3가지 status: `invest` (green) / `hold` (amber) / `reduce` (red) — 각각 border-top 2px + badge 색
  - 타입체크 통과 (`npx tsc --noEmit` clean)
- `docs/Project_Yieldo_Design_Migration_Log.md` — **이 문서 생성 및 Sprint 1 완료 기록**

---

## 4. 컴포넌트 계약 (Design System Contracts)

### 4.1 `<DecisionSurface>` — yieldo의 유닛 컴포넌트
모든 의사결정 지점에서 사용. **Confidence 영역 누락 시 빌드 실패 (lint 규칙)**.

```tsx
<DecisionSurface
  status="invest" | "hold" | "reduce"           // 3색 상태
  situation={string}                             // 한 문장 + 핵심 숫자
  confidence={{ p10: number, p50: number, p90: number, unit: string }}
  recommendation={string}                        // 동사로 시작
  impact={{ value: string, direction: "positive" | "negative" | "neutral" }}
  evidence={ReactNode}                           // 접힘 상태로 시작
  evidenceLabel?: string                         // 기본 "Why?"
/>
```

**시각 계층**:
1. 상단 2px 컬러 보더 (상태색)
2. Status 배지 (uppercase, H3)
3. Situation (Body, FG-1)
4. Confidence 바 (폭이 확신도)
5. Recommendation (Display/Serif, 강조)
6. Impact (Mono, 시그널 컬러)
7. Evidence ("Why?" 토글, 기본 접힘)

### 4.2 토큰 명명 컨벤션
- 컬러: `--bg-{0..4}`, `--fg-{0..3}`, `--brand`, `--signal-{positive|caution|risk|pending}`
- 차트: `--chart-p50`, `--chart-band-outer`, `--chart-band-inner`, `--chart-benchmark`, `--chart-cohort-{1..6}`
- Radius: `--radius-inline` (2px), `--radius-card` (4px), `--radius-modal` (6px)
- Spacing: Tailwind v4 기본 스케일(4px base) 사용, 커스텀 금지

---

## 5. AI Copilot 로드맵 (Level 1 → Level 4)

> 2026-04-08 deep interview 결과로 정의된 4단계 진화 경로. v0 (Level 1) shell만 현재 구현되어 있고, 나머지는 미래 작업의 청사진. 이 섹션을 읽으면 다음 세션이 어디서부터 이어가야 할지 알 수 있다.

### 비전 한 줄
> *"운영자가 자연어로 yieldo에게 묻고, yieldo가 답하고, 결국 yieldo가 직접 행동한다 — 모든 단계에서 신뢰구간과 근거가 함께 표시된다."*

### Level 1 — Static UI Shell ✅ (2026-04-08 완료)
- **무엇**: 우측 slide-in 패널의 시각적 껍데기. 4개 하드코딩 메시지. 입력창 비활성.
- **목적**: IA 결정 (top status bar + right slide panel) 검증, 디자인 언어 정착, 향후 Level 2+ 작업의 컨테이너 마련
- **컴포넌트**: `RunwayStatusBar`, `CopilotPanel`, `CopilotProvider`, `useCopilot()`
- **상태**: ✅ 완료

### Level 2 — Dynamic Recommendations
- **무엇**: 매일 자동 생성되는 실제 추천 2-3개. 사용자가 추천에 대해 추가 질문을 하면 LLM이 답변. 입력창 활성화.
- **선행 작업**:
  - Anthropic API 키 발급 + Vercel 환경변수 설정
  - `yieldo/src/shared/api/copilot.ts` 신규 — Vercel AI SDK 래퍼
  - `mockSignal.recommendations[]` 자리에 실제 generation 호출
  - Cron: Vercel Cron 6시간마다 재계산
- **기술 스택**:
  - **`ai` (Vercel AI SDK)** — Next.js App Router native, streaming UI
  - **`@ai-sdk/anthropic`** — Claude provider
  - **모델**: Claude Sonnet 4.5 (정확도) 또는 Haiku 4.5 (비용)
  - **Streaming**: `useChat()` hook으로 panel 내부에서 stream 렌더링
  - **State 진화**: `CopilotProvider`에 `messages: ChatMessage[]` 필드 추가
- **예상 소요**: 3-5일
- **차단 요소**: API 키, Vercel cron 비용 정책, 프롬프트 엔지니어링

### Level 3 — Scenario Simulator in Chat
- **무엇**: 사용자가 자연어 what-if 질문을 하면 (예: "UA를 20% 줄이고 TikTok으로 옮기면?"), AI가 시나리오 엔진을 호출하고 결과를 fan chart로 채팅 안에 인라인 렌더링
- **선행 작업**:
  - `mock-data.ts:527`의 `computeScenario()`를 실제 함수로 승격 + 단위 테스트
  - Claude tool-use 스키마 정의: `{action: "simulate", uaBudget: number, targetRoas: number}`
  - 채팅 메시지 안에 React 컴포넌트 렌더링하는 메커니즘 (Vercel AI SDK `experimental_streamUI` 또는 메시지 타입에 `component` field 추가)
  - `<RunwayFanChart>` (이미 존재)를 chat-friendly variant로 리팩터 (작은 사이즈, label 축약)
- **기술 스택**:
  - 위 Level 2 + Claude tool-use API
  - **`zod`** — tool input 스키마 검증 (이미 Vercel AI SDK 의존성에 포함될 가능성)
  - **server actions**: simulator 호출은 server-side에서 (mock 엔진은 client에서도 가능하지만 향후 실제 Monte Carlo로 전환 시 server 필수)
- **예상 소요**: 1-2주
- **차단 요소**: 시나리오 엔진의 실제 정확도, tool-use latency, chat 안 차트 렌더링 UX 정착

### Level 4 — Action Executor Agent
- **무엇**: 사용자가 "Pause Facebook US bid by 40%" 같은 명령을 내리면 AI가 인간 승인 게이트 후 실제 외부 API 호출. 모든 액션은 audit trail에 기록되고 rollback 가능.
- **선행 작업**:
  - **법무 검토** — 외부 API write 액세스의 책임 한계, customer consent 모델, GDPR/PIPA 영향 (`Project_Yieldo_Legal.md` 참조)
  - **OAuth integration**: AppsFlyer, Statsig, Firebase 각각의 OAuth flow 구현 (Better Auth Organization plugin과 통합)
  - **Audit log table**: Supabase `audit_log` (user_id, org_id, action_type, before_state, after_state, rollback_handler, executed_at) — RLS 정책 필수
  - **Approval gate UX**: AI proposes → 카드에 "Execute" / "Reject" / "Modify" 버튼 → human click → server action → external API
  - **Rollback handlers**: 각 tool마다 `undo()` 함수 정의 (예: `pauseChannel(id)`의 undo는 `resumeChannel(id, prevBid)`)
- **기술 스택**:
  - 위 Level 3 + 외부 API SDK들 + Better Auth + Supabase (이미 CLAUDE.md §8.4에 명시)
  - **Server actions**: 모든 external API 호출은 반드시 server-side
  - **Idempotency keys**: 중복 실행 방지
  - **Circuit breaker**: API 실패 시 자동 차단 + alert
- **예상 소요**: 3-4주 + 법무 리뷰
- **차단 요소**: 법무 승인, 각 외부 플랫폼의 customer-authorized agent 가능성 (CLAUDE.md §8.5 참조), 보안 audit, 보험

### 권장 SDK: Vercel AI SDK
**`ai` package + `@ai-sdk/anthropic`** 조합을 권장하는 이유:
1. **Next.js App Router 네이티브** — yieldo의 스택과 1:1 매칭
2. **`useChat()` hook** — 메시지 상태, 스트리밍, error 핸들링이 내장
3. **Tool-use 추상화** — 동일 코드로 Claude/OpenAI/기타 모델 swap 가능 (vendor lock-in 최소화)
4. **Server Component-friendly** — RSC 안에서도 작동
5. **Streaming UI components** — Level 3의 inline chart 렌더링에 직접 도움

대안: `@anthropic-ai/sdk` 직접 사용 — Vercel 추상화 없이 Claude 전용. 더 단순하지만 위 1, 2, 5의 이점을 모두 잃음. 선택하지 말 것.

### 환경 변수 (미래용)
```bash
# .env.local (Level 2부터 필요)
ANTHROPIC_API_KEY=sk-ant-...
COPILOT_MODEL=claude-sonnet-4-5
COPILOT_MAX_TOKENS=2048
COPILOT_TEMPERATURE=0.2
```

### 패키지 설치 (Level 2 시작 시)
```bash
npm install --legacy-peer-deps ai @ai-sdk/anthropic zod
```

---

## 6.5 Design System Research & References
§7에 저장됨 — Bloomberg 현실 체크, Toss Design System 분석, 글로벌 레퍼런스 Top 10 (Palantir Blueprint, Vercel Geist, Stripe, IBM Carbon, Linear, GOV.UK, Toss, Kakao, Arc, NASA), 구축 4개 옵션, 숫자 표기 규칙 draft. 향후 공식 Design System 구축 시 이 섹션에서 바로 시작하면 됨.

## 6. B2B Readiness Blueprint (별도 문서)

> 2026-04-09 생성 — "project yieldo"가 프로토타입에서 프로덕션 B2B SaaS로 가는 여정의 **14개 차원 gap 분석 + 단계별 로드맵** 문서:
>
> 📄 **[`Project_Yieldo_B2B_Readiness_Blueprint.md`](./Project_Yieldo_B2B_Readiness_Blueprint.md)**
>
> 핵심 요약:
> - 현재 **B2B 준비도 ≈ 15-20%** (프론트엔드 디자인만 강함, 백엔드 인프라 0)
> - 24개 차원 점검 (P0 7개 / P1 7개 / P2 10개)
> - 단계 프레임워크 (데모 A → 알파 B → 베타 C → GA D) + 공수 견적
> - 추천: 단계 A → B 브리지 전략 (프로토타입 완성 1-2주 → Walking Skeleton 4-6주)
>
> 새 세션에서 "B2B 준비도 블루프린트 보고 다음 작업 정해줘"라고 하면 이 문서가 맥락이 됩니다.

## 7. Design System Research — 참조 자료 (2026-04-09)

> **목적**: 향후 yieldo 공식 디자인 시스템 구축 시 참조할 글로벌 레퍼런스와 분석. 구축은 나중에 하되 조사 결과는 여기 보존.
>
> **배경**: 사용자가 *"Bloomberg TDC 같은 게 있나? 토스처럼 디자인 표준화를 하면?"* 질문 → 현실 체크 + 레퍼런스 카탈로그 + 구축 옵션 정리.

### 7.1 Bloomberg 현실 체크
- **공식 "Bloomberg TDC" 같은 공개 디자인 시스템은 없음** (2026-04 기준)
- Bloomberg 내부 component library + 40년 된 터미널 디자인 기준은 모두 비공개
- Bloomberg 유사도 레퍼런스 중 **가장 가까운 공개 자료 3가지**:
  1. **Palantir Blueprint** (`blueprintjs.com`) — 데이터 밀도 높은 엔터프라이즈 UI, 오픈소스 React, 풀 가이드. **yieldo 도메인과 가장 유사**.
  2. Bloomberg 데이터 비주얼라이제이션 팀 백서 (SSRN/academic 일부 공개)
  3. Koyfin / FactSet / Refinitiv Eikon — 공개 가이드 없지만 UI 자체가 reference case

### 7.2 Toss Design System (TDS) 핵심 원칙 5가지
Toss(`toss.design`)가 유명한 실제 이유:

1. **"왜"를 문서화한다** — 컴포넌트 사용법보다 결정의 이유가 더 길다. 예외 상황 판단 기준까지 제공.
2. **숫자 표기 규칙이 매우 정교** — 화폐 포맷, 단위 표기, 반올림 규칙 모두 맥락별로 다름. `1,234,567원` vs `123.4만원` vs `1.2억원` 기준 명확.
3. **톤 & 보이스가 제품 전체를 통일** — "대출 가능 금액" ❌ → "빌릴 수 있는 돈" ✅. 심리적 거리감 낮춤.
4. **컬러는 기능이 아닌 의미** — Toss Blue는 행동 유도에만. 빨강은 경고가 아닌 자금 손실.
5. **"페이퍼"(`toss.tech`)로 제품 철학 공개** — 원칙·실패·A/B 결과. 채용 자산 + 브랜드.

### 7.3 TDS → yieldo 적용 매핑
| TDS 원칙 | yieldo 현재 상태 |
|---|---|
| "왜" 문서화 | ✅ 이 Migration Log이 이미 수행 중 |
| 숫자 표기 규칙 | ❌ 가장 큰 gap — 별도 §9.2로 정립 필요 |
| 톤 & 보이스 | 🟡 한국어 네이밍 정리 시작(2026-04-09), 영어 톤도 필요 |
| 컬러의 의미성 | ✅ signal 3색(positive/caution/risk) 구축됨 |
| 공개 페이퍼 | ❌ 블로그는 추후 |

### 7.4 글로벌 레퍼런스 Top 10 (yieldo 우선순위 순)

#### Tier 1 — 직접 훔칠 만함
| # | 이름 | URL | 유사도 | 훔칠 포인트 |
|---|---|---|---|---|
| 1 | **Palantir Blueprint** | blueprintjs.com | ★★★★★ | Table 밀도, 다크모드 설계, 키보드 내비게이션 |
| 2 | **Vercel Geist** | vercel.com/geist | ★★★★☆ | 공식 컴포넌트 prop 네이밍, 모션 시스템, `font-variant-numeric` |
| 3 | **Stripe Design** | stripe.com/docs | ★★★★☆ | 숫자 표기, 에러 톤, 신뢰 시그널, 결제 UI 명확성 |

#### Tier 2 — 원칙/철학 레퍼런스
| # | 이름 | 훔칠 포인트 |
|---|---|---|
| 4 | **IBM Carbon** (carbondesignsystem.com) | Accessibility 표준, i18n 전략, 복잡 폼 패턴 |
| 5 | **Linear Design** (제품+blog) | 미니멀리즘, ⌘K, 모션 절제, 키보드 퍼스트 |
| 6 | **GOV.UK Design System** | 콘텐츠 가이드, 폼 설계, 에러 메시지 |

#### Tier 3 — 한국 시장 특화
| # | 이름 | 훔칠 포인트 |
|---|---|---|
| 7 | **Toss Design System** (toss.design) | 위 7.2 모든 원칙 |
| 8 | **카카오 Kakao UI Kit** | 한국어 타이포 위계, 국산 폰트 선택 |

#### Tier 4 — 영감/분위기
| # | 이름 | 훔칠 포인트 |
|---|---|---|
| 9 | **Arc Browser Principles** (blog) | 전복적 설계 사고 |
| 10 | **NASA Space Design** (최근 리뉴얼) | 미션 패치 + "project" prefix 정당성 |

### 7.5 yieldo Design System 구축 옵션 (미래 작업)
향후 공식 디자인 시스템을 구축할 때 고려할 4가지 경로:

#### Option A — Lightweight Markdown Doc
- `docs/Project_Yieldo_Design_System.md` 독립 파일
- 원칙 + 토큰 + 컴포넌트 + 패턴 + 톤 가이드
- 공수: 1-2일. 단점: 시각 레퍼런스 약함.

#### Option B — Storybook
- `npm install --save-dev storybook`, `.storybook/` + `*.stories.tsx`
- 인터랙티브 컴포넌트 프리뷰
- 공수: 1주. 단점: Next 16 + React 19 호환성 검증 필요.

#### Option C — Full Design System Site
- 별도 Next.js 프로젝트 또는 `/design` 서브라우트
- MDX + 라이브 프리뷰 + 토큰 탐색기
- Geist/Blueprint/TDS 수준
- 공수: 3-4주. 단점: 현 단계엔 오버킬.

#### Option D — Migration Log에 §9 Design Principles 추가 ⭐
- 이 Migration Log에 §9.1 원칙 5개 / §9.2 숫자 표기 / §9.3 톤 / §9.4 계약 / §9.5 패턴 섹션 추가
- 이미 있는 정보 구조화
- 공수: 3-4시간. 단점: 시각 프리뷰 없음.

### 7.6 추천 구축 경로
**Phase A → B 순차**:
1. **Phase A (지금-가까운 미래)**: Option D — Migration Log §9 섹션 추가. 투자자/심사위원용 "우리 제품 이렇게 설계됨" 근거 자료로 충분.
2. **Phase B (Walking Skeleton 완성 후)**: Option B — Storybook 추가. 2인 이상 엔지니어 합류 시점에 필요.
3. **Phase C (GA 근접)**: Option C — Full DS Site. 외부 디자이너 채용·마케팅 자산이 필요해지는 시점.

### 7.7 구축 전 즉시 정립 필요한 것 (§9.2 draft)
향후 Option D 구축 시 가장 먼저 넣을 **숫자 표기 규칙**:
```
화폐        → $1.2M, $450K, $1,234 (단위 앞, 소수점 1자리)
백분율 변화  → +3.7pp (절대) vs +18% (상대). 혼용 금지
신뢰구간     → $2.4M [P10: 1.8M – P90: 3.1M]
일수         → D7, D14, D30 (코호트 기준, 절대 날짜보다 우선)
시간 단위    → 14.5mo (월), 8.2w (주)
부호         → 색상만으로 표현 금지, 반드시 + / − 기호 동반
천/만 구분자 → 영문 로케일은 콤마, 한국어는 만 단위 쉼표 고려
Null/미정   → "—" (em dash, 절대 "N/A" 또는 "0" 아님)
```

이건 **TDS에서 가장 강력하게 차용할 만한 단일 패턴**. 구축 시점에 이 블록을 기반으로 확장.

---

## 8. 열린 질문 / 미결정 (Open Questions)

| # | 질문 | 블로커? | 메모 |
|---|---|---|---|
| Q1 | Base UI 단일화 시점 — Big Bang vs 점진 교체? | ❌ | 점진 교체 권장. 새 컴포넌트는 Base UI, 구 컴포넌트는 교체 시 전환 |
| Q2 | Dark mode 토큰 정의 시점 — 지금 vs 기능 완성 후? | ❌ | `@media (prefers-color-scheme: dark)` + `html[data-theme]` 토글 기반 구조는 지금 세팅, 구체 색은 추후 |
| Q3 | i18n 완전 제거 vs 프레임워크 유지(영어만)? | ❌ | `LocaleProvider` 유지, default만 "en"으로. 향후 확장 여지 |
| Q4 | Cmd+K 팔레트 — 어느 단계에서? | ❌ | P2. MVP 이후 |
| Q5 | PDF 익스포트 — 어느 단계에서? | ❌ | P2. "Share with board" CTA용 |

---

## 6. 다음 세션 인계 (Handoff Notes)

**현재 위치**: Sprint 4 + Revenue Forecast Bayesian + Market Gap L1/L2 + Positioning L0/L1/L2 완료 (2026-04-17) → 다음 Sprint 정의 대기

**Sprint 4 산출물 (2026-04-14 완료)**:
- ✅ MVP Revision — 랜딩 내러티브 통일, 게임명 `Match League` 통일, KPI 투자 언어화(Payback Forecast/Break-even Probability/Runway Impact), 계산 근거 라인(`basisKey`), 추천 액션 기대효과 수치, Copilot 시나리오 버튼, 차트 인사이트 문구, Demo Data 배지
- ✅ Pretendard 본문 + Noto Serif KR 결정문 폴백 체인
- ✅ `useGridLayout` 훅 (FLIP 애니메이션 + 홀수 보정 + 비대칭 그리드 리플로우)
- ✅ `useChartExpand` 외부 상태 주입 확장
- ✅ 차트 카드 반응형 높이 (`h-full flex flex-col`, `flex-1`)
- ✅ 그리드 쌍 `baseHeight`/`ChartHeader` 3줄 통일
- ✅ Overview 2.0 expand 통합 (CapitalWaterfall/TitleHeatmap/MarketContextCard)
- ✅ `.gitignore` 정비

**Revenue Forecast Bayesian 재설계 (2026-04-14, 커밋 `278142d` + `eb9c9c3`)**:
- ✅ 단일 P밴드 → **사전 확률(Prior) + 사후 확률(Posterior) + Experiment Fork** 3-layer 구조
- ✅ 색상 매핑 확정: Posterior 초록(`#00875A`), Prior 빨강(`#C9372C` 8% fill), Experiment Fork 파랑(`#5B9AFF`), Ship 마커 슬레이트
- ✅ 한국어 용어 채택 — `Prior/Posterior` → **`사전 확률 / 사후 확률`** (CLAUDE.md §11.2 operator-not-analyst 원칙)
- ✅ 커스텀 드롭다운 — `runway-status-bar` game-selector 패턴 차용, `AnimatePresence` + 외부 클릭 감지, 2-line 아이템(id/lift/ship + name), Chevron 회전
- ✅ 그룹 구조 툴팁 — 분포별 좌측 3px 색상 바, Posterior/Prior 동일 구조(P50/범위/spread), Experiment는 별도 구조(Ship 후 P50 + baseline 대비 lift)
- ✅ 컨트롤 바 12px→13px/500 스케일 다운(차트 카드 내부 컴팩트)
- ✅ ⓘ 툴팁 info 가이드 — 3단계 활용법 + 의사결정 팁 구조화 (`whitespace-pre-line`)
- ✅ 동적 insight 4-조합 (Prior on/off × Experiment selected/none) 매트릭스
- ✅ Game별 Prior 센터링 — 장르 평균 기준으로 "outperform / underperform" 스토리 자연 노출 (Dig Infinity posterior P50 < prior P50)
- ✅ 신규 타입: `ExperimentForkScenario`, `RevenueForecastMeta`; `RevenueForecastPoint`에 `priorP10/50/90` 추가
- ✅ Spec 문서: `docs/superpowers/specs/2026-04-14-revenue-forecast-bayesian.md`

**Revenue Forecast 재설계의 deferred 항목**:
- As-of-day 드롭다운 (D7/D14/D30 time-travel) — DB snapshot 저장 선행 필요, Phase 2
- Experiment 데이터 소스를 실 Experiment Board에 wire — 현재는 per-game mock
- 커스텀 드롭다운 키보드 내비게이션 (game-selector에서 port 예정)
- Prior 밴드 수치의 근거(GameAnalytics 2024 P10–P90 등) 툴팁 노출

**Market Gap L1/L2 재설계 (2026-04-15~17, 커밋 `9008664..f6909ce` L1 + `d1e3e10..1cec2e1` L2)**:

L1 (Operator UI, 2026-04-15):
- ✅ PriorPosteriorChart 전면 리라이트 — "Prior/Posterior/베이지안" → **"장르 기대치 vs 우리 실적"**
- ✅ `computeMarketSignal` helper — ±5% threshold → Invest/Hold/Reduce 판정 (NaN/음수 guard 포함)
- ✅ `MARKET_GAP_PROOF_COLORS` 토큰 — Revenue Forecast와 정합 (빨강=장르, 초록=우리, 파랑=격차)
- ✅ 동적 신호 뱃지 — 지표별 "우리 우월 +31% · Invest 신호" L1 언어 (Alpha 단어 미노출)
- ✅ L1 compliance 검증 통과 (grep 금지어 0, 한/영 locale)

L2 (Methodology Modal, 2026-04-16~17):
- ✅ `MethodologyModal` — @base-ui/react/dialog 기반 centered overlay (framer-motion 애니메이션)
- ✅ `CyclicUpdateTimeline` — 6-frame 수평 step grid (D0→D90), div+Tailwind+framer-motion (Recharts 미사용)
  - 장르 기대치 밴드(빨강 dashed) 점차 좁아짐 + 우리 실적 밴드(초록 solid) 등장/수렴
  - SVG 흡수 화살표 5개 ("이전 실적 → 다음 기대치로 흡수")
  - Hover: scale 1.04 + brand ring + 비hover dim(0.45) + 관측값 수치 라벨 + tooltip
  - Play 애니메이션: useReducer state machine, ~6초 sequential (D0→D90), 화살표 pulse
  - Play 중 hover → auto-pause, leave → auto-resume
- ✅ L1 차트 하단 CTA "📊 이 판정의 방법론 보기" → modal 연결
- ✅ Mock 데이터: `CyclicUpdateStep`/`CyclicUpdateData` 타입, match-league D7 6-step
- ✅ i18n: `methodology.*` 13개 키 (modal header/footer/play/CTA/absorption/narrative)
- ✅ L1/L2 compliance 검증 통과 — L1 금지어 0, L2에서만 Bayesian/Alpha (footer 힌트)

**Positioning & Language Layering (2026-04-15, 커밋 `ed1dfca`)**:
- ✅ A+B 하이브리드 확정: Top-line = Decision OS (CLAUDE.md §1 유지), Alpha = L2 signature mechanism
- ✅ L0/L1/L2 언어 레이어링 정책 — Marketing(L0) / Operator UI(L1, 기술 용어 0) / Methodology(L2, Alpha·Bayesian 허용)
- ✅ Alpha 단어 외부 검증 대기 (operator 3+/VC 2+/analyst 1-2 인터뷰 — 코드 아님)
- ✅ Spec: `2026-04-15-yieldo-positioning-language-layering-design.md`

**Market Gap deferred 항목**:
- Cyclic Timeline 다른 게임/지표 mock 확장 (동일 구조, ~30min per game)
- Alpha 이름 외부 검증 (operator/투자자 인터뷰)
- Revenue Forecast L1 용어 정합 점검 (사전/사후 확률 → L1 정책과 불일치 가능성)
- Cyclic Timeline 모바일 반응형 — 전체 기획 완료 후 리팩토링
- Interactive scrubber (현재 Play만) — 필요성 검증 후

**Sprint 5 후보 (우선순위 미정)**:
1. **AI Copilot Level 2** — Vercel AI SDK + Claude. 시나리오 액션 버튼을 실제 LLM 기반 탐색으로 승격
2. **Module 3/4 DecisionSurface 적용** — Actions/Experiments 페이지에 Situation → Confidence → Recommendation → Evidence 리듬 정착
3. **KPI Cards 레거시 토큰 제거** — 11개 위젯
4. **Better Auth + Supabase Walking Skeleton** — 투자자 데모용 로그인 + 멀티테넌트 기초
5. **영어 단일 덱 재작성 (v2 기반)**

**Sprint 4 + Revenue Forecast에서 얻은 교훈 (다음 세션이 반복하지 말 것)**:
- **CSS Grid `align-items: stretch`만으로는 쌍의 시각 균형이 완성되지 않는다.** 반드시 `baseHeight`를 큰 쪽 기준으로 통일 + `ChartHeader` 줄 수(3줄)를 맞춰야 한다.
- **비대칭 그리드(3:2, 3:1)에서 expand 리플로우**는 `useGridLayout` 기본 로직으론 부족. 확대 시 양쪽 모두 `col-span-max`로 전환하는 별도 리플로우 로직이 페이지 레벨에서 필요.
- **Pretendard는 CDN(jsdelivr Variable)** 경로 사용. `next/font/google`엔 없음.
- **대형 리디자인(c69a166 Overview 2.0) 후엔 공통 Chart 기능(ExpandButton 등) 누락 체크 필수.**
- **Recharts 커스텀 툴팁은 `fill="url(#pattern)"` 사용 시 default dot 렌더가 깨진다.** 해결: payload 순회 대신 `payload[0].payload`(raw row)에서 직접 읽어 그룹 구조로 재렌더. (Revenue Forecast §5 참조)
- **차트 카드 내부 컨트롤 타입 스케일은 상단 status-bar보다 작아야 한다.** `text-h2`(18px)는 56px 헤더엔 자연스럽지만 차트 카드 내부에선 과함. 11px/13px scale 권장.
- **한국어 네이밍은 operator 타겟이면 학술 용어를 직역하지 말고 한국어 교양어로.** Prior/Posterior → 사전 확률/사후 확률. "Bayesian Updating"처럼 업계 통용어가 없는 경우는 우리가 표준을 정해야 함.
- **데이터 정직성 vs 데모 품질 트레이드오프**: As-of snapshot 같은 "과거 시점" 조작은 mock으로 위조 가능하지만, 심사 시 "이거 진짜야?"에서 깨진다. 진짜로 구현하기 전까진 정직한 고정 라벨로 두고, 같은 스토리를 다른 방식으로(예: Prior band 토글) 전달.

**수정하지 말 것**:
- `yieldo/AGENTS.md` — Next 16 주의사항 경고, 보존
- `yieldo/CLAUDE.md` — `@AGENTS.md` 참조 포인터, 보존
- `Project_Yieldo_Deck_v2.html` — 향후 재작성 대상이지만 아직 삭제 금지
- `globals.css`의 "Legacy aliases" 블록 — 모든 기존 위젯이 새 토큰으로 리팩터되기 전까지 유지

**읽어야 할 참조**:
- 루트 `CLAUDE.md` — 제품 정의 원본
- `docs/Project_Yieldo_Engine_Blueprint.md` — 엔진 파이프라인
- `docs/Project_Yieldo_UI_Guide.md` — 기존 UI 가이드 (Sprint 2에서 업데이트 필요)
- `yieldo/node_modules/next/dist/docs/01-app/` — Next 16 API 참조 (Next.js 코드 건드리기 전 필독)

**회귀 테스트 체크포인트**:
- [ ] `npx tsc --noEmit` 통과 (Sprint 1 통과 확인됨)
- [ ] `npm run build` 통과 (Sprint 2 시작 전 확인 필요)
- [ ] `npm run lint` 통과 (Sprint 2 시작 전 확인 필요)
- [ ] 기존 5개 dashboard 페이지 (overview/market-gap/actions/experiments/capital) 시각 확인

**수정하지 말 것**:
- `yieldo/AGENTS.md` — Next 16 주의사항 경고, 보존
- `yieldo/CLAUDE.md` — `@AGENTS.md` 참조 포인터, 보존
- `Project_Yieldo_Deck_v2.html` — 향후 재작성 대상이지만 아직 삭제 금지

**읽어야 할 참조**:
- 루트 `CLAUDE.md` — 제품 정의 원본
- `docs/Project_Yieldo_Engine_Blueprint.md` — 엔진 파이프라인
- `docs/Project_Yieldo_UI_Guide.md` — 기존 UI 가이드 (업데이트 필요)
- `yieldo/node_modules/next/dist/docs/01-app/` — Next 16 API 참조
