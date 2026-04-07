# Project Compass — Technical Stack & Requirements Document

## Experiment-to-Investment Decision OS for Mobile Gaming

**Version**: 1.0
**Date**: 2026-04-01
**Team**: 2인 (풀스택 개발자 + 데이터분석가/AI 엔지니어)
**Classification**: Internal Technical Reference

---

## 1. System Architecture Overview

### 1.1 전체 아키텍처 맵

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│    Next.js 15 App Router + FSD 2.1 + Recharts + TanStack Query     │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER (Vercel)                     │
│              Next.js Server Components / Route Handlers             │
│                    Better Auth (Multi-tenant)                       │
└──────────┬─────────────────────────────────┬────────────────────────┘
           │ REST (OpenAPI)                  │ Supabase Client
           ▼                                 ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│   ML/STATS SERVICE       │    │         DATA LAYER               │
│   (GCP Cloud Run)        │    │     (Supabase PostgreSQL)        │
│                          │    │                                  │
│  ┌────────────────────┐  │    │  ┌────────────┐ ┌─────────────┐ │
│  │ FastAPI             │  │    │  │ 게임 데이터  │ │ 코호트 데이터 │ │
│  │ ├─ 리텐션 예측      │  │    │  └────────────┘ └─────────────┘ │
│  │ ├─ 베이지안 추론    │  │    │  ┌────────────┐ ┌─────────────┐ │
│  │ ├─ A/B 테스트 번역  │  │    │  │ 마켓 벤치마크│ │ 실험 결과    │ │
│  │ └─ 시나리오 시뮬    │  │    │  └────────────┘ └─────────────┘ │
│  └────────────────────┘  │    │  ┌────────────┐ ┌─────────────┐ │
│  ┌────────────────────┐  │    │  │ 크롤링 원본 │ │ 예측 결과    │ │
│  │ NumPyro + PyTorch   │  │    │  └────────────┘ └─────────────┘ │
│  │ scipy + lmfit       │  │    │         RLS (Row Level Security) │
│  └────────────────────┘  │    └──────────────────────────────────┘
└──────────────────────────┘                 ▲
           ▲                                 │
           │ Read/Write                      │ Upsert
           ▼                                 │
┌──────────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION LAYER                         │
│                (GCP Cloud Run Jobs + Scheduler)                  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │ App Store APIs    │  │ Benchmark Prior  │  │ Customer Data │  │
│  │ ├─ Apple RSS     │  │ ├─ GameAnalytics │  │ ├─ MMP 연동   │  │
│  │ ├─ iTunes Search │  │ ├─ Unity Report  │  │ ├─ 실험 연동  │  │
│  │ └─ GP Scraper    │  │ ├─ AppsFlyer Idx │  │ └─ 코호트 실측│  │
│  │                   │  │ └─ 학술 논문     │  │               │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│  Phase 3+: 앱 인텔리전스 파트너십/라이선싱 (플랫폼 성장 후 협상) │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 핵심 설계 원칙

| 원칙 | 설명 |
|---|---|
| **Decision-First** | 모든 데이터 흐름은 "이 인터벤션이 투자 가치를 만들었는가?"라는 결론으로 수렴 |
| **Inference ≠ Serving** | MCMC/SVI 추론은 배치, API 응답은 캐시된 결과 제공 (<200ms) |
| **멀티테넌트 by Default** | Supabase RLS로 DB 레벨 테넌트 격리, 코드 레벨 격리 최소화 |
| **단일 언어 우선** | 크롤링 + 프론트엔드 = TypeScript, ML/통계 = Python (2언어로 제한) |
| **매니지드 우선** | 2인 팀 — 인프라 운영 최소화, 코드에 집중 |

---

## 2. 역할 1: 풀스택 개발자 (본인)

### 2.1 담당 영역

```
Frontend (Next.js + FSD 2.1)
├── 인터벤션→투자 의사결정 대시보드 UI
│    ├── Module 1 (Overview): 요약 레이어 — Module 3/4 신호를 집계한 투자 스탠스
│    ├── Module 3 (Action Impact): 가치 창출 레이어 — 액션별 ΔLTV / Payback Shift
│    └── Module 4 (Experiment Board): 가치 창출 레이어 — ATE → ΔLTV → Experiment ROI
├── 리텐션 예측 시각화 (P10/P50/P90 밴드)
├── 시나리오 시뮬레이터 인터랙션
└── 멀티테넌트 인증/권한

Backend (Next.js API Routes + Supabase)
├── 데이터 CRUD API
├── Python 서비스 프록시
├── 실시간 구독 (Supabase Realtime)
└── 웹훅/알림

Data Collection (Crawlee + Cloud Run Jobs)
├── 마켓 인텔리전스 크롤링 엔진
├── 데이터 정규화 파이프라인
├── 스케줄링/모니터링
└── API 어댑터 (Sensor Tower 등 계약 시)
```

### 2.2 필수 기술 스택

#### Frontend

| 기술 | 용도 | 비고 |
|---|---|---|
| **Next.js 15** (App Router) | 프레임워크 | RSC + Server Actions |
| **TypeScript 5.x** | 타입 안전성 | strict 모드 필수 |
| **FSD 2.1** | 아키텍처 패턴 | 레이어 의존성 규칙 준수 |
| **TanStack Query v5** | 서버 상태 관리 | 캐싱, 폴링, 백그라운드 리페치 |
| **Zustand** | 클라이언트 상태 | UI 필터, 선택된 게임/기간 등 |
| **Recharts** | 차트 라이브러리 (주) | Area+Line으로 P10/P50/P90 밴드 |
| **D3.js** | 차트 라이브러리 (보조) | 커스텀 시각화 (몬테카를로 팬차트 등) |
| **framer-motion** | 애니메이션 | 카드 진입 애니메이션, 모달 트랜지션, 시그널 상태 전환 |
| **Tailwind CSS v4** | 스타일링 | 유틸리티 퍼스트 |
| **Better Auth** | 인증 | Organization 플러그인 (멀티테넌트) |

#### FSD 2.1 디렉토리 구조

```
app/                              # Next.js App Router (라우팅 셸)
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    layout.tsx                    # 대시보드 공통 레이아웃
    page.tsx                      # → Module 1: Executive Overview
    market-gap/page.tsx           # → Module 2: Market vs Internal
    actions/page.tsx              # → Module 3: Action Impact
    experiments/page.tsx          # → Module 4: Experiment Board
    capital/page.tsx              # → Module 5: Capital Allocation
  api/
    [...route]/route.ts           # Python 서비스 프록시

src/
  app/                            # FSD app 레이어
    providers/                    # QueryClientProvider, AuthProvider, ThemeProvider
    styles/                       # 글로벌 스타일, Tailwind config

  pages/                          # FSD pages 레이어 (페이지 컴포지션)
    executive-overview/
      ui/ExecutiveOverviewPage.tsx
      model/                      # 페이지 레벨 로직
    market-gap/
    action-impact/
    experiment-board/
    capital-allocation/

  widgets/                        # FSD widgets 레이어 (조합된 UI 블록)
    retention-chart/              # 리텐션 커브 + 크레디블 인터벌
      ui/RetentionChart.tsx
      ui/CredibleIntervalBand.tsx
    payback-forecast/             # 페이백 예측 게이지
    investment-signal/            # Green/Yellow/Red 시그널
    experiment-portfolio/         # 실험 포트폴리오 요약
    burn-tolerance/               # 번 톨러런스 윈도우
    scenario-simulator/           # 몬테카를로 시나리오

  features/                       # FSD features 레이어 (비즈니스 행위)
    select-game/                  # 게임/타이틀 선택
    date-range-filter/            # 기간 필터
    run-scenario/                 # 시나리오 실행
    compare-benchmarks/           # 벤치마크 비교
    export-report/                # 리포트 내보내기

  entities/                       # FSD entities 레이어 (도메인 모델)
    game/
      model/types.ts              # Game, GameMetrics 타입
      api/gameApi.ts              # TanStack Query hooks
      ui/GameCard.tsx
    cohort/
      model/types.ts              # Cohort, RetentionCurve 타입
      api/cohortApi.ts
    experiment/
      model/types.ts              # Experiment, ATE, ExperimentROI 타입
      api/experimentApi.ts
    investment/
      model/types.ts              # InvestmentSignal, PaybackForecast 타입
      api/investmentApi.ts
    market-benchmark/
      model/types.ts              # GenreBenchmark, CompetitorData 타입
      api/benchmarkApi.ts

  shared/                         # FSD shared 레이어
    ui/                           # 공통 UI 컴포넌트 (Button, Card, Dialog...)
    api/
      pythonClient.ts             # Python FastAPI 클라이언트 (openapi-fetch)
      supabaseClient.ts           # Supabase 클라이언트
    lib/
      formatters.ts               # 숫자/날짜 포맷
      constants.ts
    config/
      env.ts                      # 환경 변수 타입
```

#### Backend / Data Collection

| 기술 | 용도 | 비고 |
|---|---|---|
| **Supabase** (PostgreSQL) | 메인 DB + Auth + Storage | RLS로 멀티테넌트 격리 |
| **Supabase Realtime** | 실시간 데이터 구독 | 대시보드 라이브 업데이트 |
| **Upstash Redis** | 캐싱 | 연산 결과, API 응답 캐시 |
| **Crawlee** | 크롤링 프레임워크 | CheerioCrawler (앱스토어 공개 데이터 전용) |
| **google-play-scraper** | Google Play 데이터 | 구조화된 데이터 추출 |
| **app-store-scraper** | App Store 데이터 | 구조화된 데이터 추출 |
| **openapi-typescript** | API 타입 생성 | Python FastAPI OpenAPI 스펙에서 자동 생성 |
| **openapi-fetch** | 타입 안전 API 호출 | 생성된 타입 기반 fetch |

#### 마켓 인텔리전스 데이터 전략

Compass의 마켓 데이터 전략은 **앱 인텔리전스 플랫폼 의존이 아닌, 자체 데이터 자산 구축**입니다.

```
┌─────────────────────────────────────────────────────────────────┐
│            Market Intelligence Data Strategy                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Layer 1: 공개 데이터 수집 (비용 $0, 합법)               │    │
│  │                                                         │    │
│  │  Apple RSS Top Charts ─┐                                │    │
│  │  iTunes Search API ────┤→ 장르별 랭킹 추이              │    │
│  │  GP Scraper ───────────┘  평점/리뷰 변화량              │    │
│  │                            메타데이터                    │    │
│  └──────────────────────┬──────────────────────────────────┘    │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Layer 2: 장르별 벤치마크 Prior 구축 (비용 $0, 합법)     │    │
│  │                                                         │    │
│  │  GameAnalytics 벤치마크 ─┐                              │    │
│  │  Unity Gaming Report ────┤→ 장르별 D1/D7/D28           │    │
│  │  AppsFlyer Index ────────┤   P10/P50/P90 밴드          │    │
│  │  학술 논문 (Viljanen) ───┘   리텐션 커브 파라미터       │    │
│  │                                                         │    │
│  │  + 5대 성질 이론으로 형태 제약 (b값/c값 범위)            │    │
│  │  = 장르별 베이지안 사전분포 (Prior)                      │    │
│  └──────────────────────┬──────────────────────────────────┘    │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Layer 3: 고객 데이터 → Posterior 업데이트 (핵심 자산)    │    │
│  │                                                         │    │
│  │  고객 A의 실제 리텐션 ─┐                                │    │
│  │  고객 B의 실제 리텐션 ──┤→ 베이지안 업데이트            │    │
│  │  고객 C의 실제 리텐션 ─┘   → Prior가 Posterior로 진화   │    │
│  │                                                         │    │
│  │  고객이 늘수록 → 장르별 벤치마크가 정밀해짐              │    │
│  │  = 네트워크 효과 (쓸수록 정확해지는 플랫폼)              │    │
│  └──────────────────────┬──────────────────────────────────┘    │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Layer 4: 앱 인텔리전스 API 연동 (선택적, 플랫폼 성장 후)│    │
│  │                                                         │    │
│  │  플랫폼 활성화 → 협상력 확보 → 데이터 파트너십/라이선싱  │    │
│  │  Sensor Tower Connect, 42matters 등                     │    │
│  │  = 자체 데이터 "보완", "의존"이 아님                     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

#### 신뢰성 확보 전략: Prior → Posterior 시각화

```
사용자가 보는 화면:

  "캐주얼 장르 D30 리텐션 예측"

  ┌──────────────────────────────────────┐
  │  Prior (장르 벤치마크)   ░░░░░░░░░░  │  ← 회색: 공개 벤치마크 밴드
  │  P10: 1.2%  P50: 3.5%  P90: 6.8%   │
  │                                      │
  │  Posterior (귀사 데이터 반영) ████████ │  ← 파랑: 실제 데이터 반영 후
  │  P10: 2.8%  P50: 4.1%  P90: 5.5%   │    (더 좁고 정밀한 밴드)
  │                                      │
  │  ── 관측 데이터 ●●●●●●              │  ← 실제 데이터 포인트
  │                                      │
  │  📊 신뢰도: 82% (D14 데이터 기반)    │
  │  📈 데이터 누적: 12개 코호트          │
  └──────────────────────────────────────┘

  "이 예측은 GameAnalytics 2024 장르 벤치마크(Prior)에
   귀사의 실제 12개 코호트 데이터를 결합한 결과입니다."
```

이 시각화가 신뢰를 주는 이유:
- 출처가 투명: "어디서 온 데이터인지" 명시
- 불확실성이 솔직: "얼마나 확실한지" 밴드로 표시
- 개선이 보임: 데이터가 쌓일수록 밴드가 좁아지는 과정을 눈으로 확인

#### 앱스토어 데이터 수집 스케줄

| 데이터 유형 | 빈도 | 근거 |
|---|---|---|
| 앱스토어 랭킹 (Top Charts) | 6시간마다 | 장르-티어 분류 기준 + 시장 트렌드 모니터링 |
| 앱 상세 정보 (메타데이터) | 1일 1회 | 메타데이터는 느리게 변경 |
| 리뷰/평점 변화량 | 1일 1회 | 참여도 프록시 신호 |
| 경쟁사 업데이트 추적 | 1일 1회 | 앱 업데이트는 최대 일 1회 |
| 공개 벤치마크 리포트 | 수동/발행 시 | GameAnalytics, AppsFlyer, Unity 등 |

#### 데이터 확보 단계별 로드맵

| Phase | 전략 | 비용 | 데이터 자산 |
|---|---|---|---|
| **Phase 1** | 공개 벤치마크 리포트 + 앱스토어 공개 API | $0 | 장르별 Prior 밴드 (공개 소스 기반) |
| **Phase 1** | 5대 성질 이론 기반 형태 제약 | $0 | 커브 파라미터 범위 (b, c 값) |
| **Phase 2** | 고객 실제 데이터 → 베이지안 업데이트 | $0 | 자체 Posterior (네트워크 효과) |
| **Phase 2** | 개발사 데이터 파트너십 (벤치마크 교환) | $0 | 학습용 ground truth 확보 |
| **Phase 3+** | 플랫폼 성장 → 앱 인텔리전스 파트너십/라이선싱 | 협상 | 정밀 매출/DL 추정 보완 |

---

## 3. 역할 2: 데이터분석가 / AI 엔지니어

### 3.1 담당 영역

```
ML/Statistics Engine (Python + FastAPI)
├── 리텐션 커브 피팅 (Layer 1: 파라메트릭)
├── LSTM 리텐션 예측 (Layer 2: 딥러닝)
├── 베이지안 추론 엔진
├── A/B 테스트 → ΔLTV → Experiment ROI 번역  ← 핵심 파이프라인
├── 라이브 ops 액션 → Payback Shift 번역       ← 핵심 파이프라인
├── 몬테카를로 시나리오 시뮬레이션 (예산 재배분 시뮬)
└── 모델 학습/평가/서빙 파이프라인

Data Analysis
├── 장르별 벤치마크 구축
├── 리텐션 속성 검증 (P1-P5)
├── 예측 정확도 모니터링
└── 이상 탐지 및 해석
```

### 3.2 필수 기술 스택

#### 핵심 Python 패키지

| 패키지 | 용도 | 선정 이유 |
|---|---|---|
| **FastAPI** | REST API 서버 | async, Pydantic 검증, 자동 OpenAPI 문서 |
| **NumPyro** | 베이지안 추론 | JAX 기반 최고속 추론, SVI로 실시간 근사, 가벼운 컨테이너 |
| **PyTorch 2.x** | LSTM 딥러닝 | 지배적 생태계, torch.compile() 성능, ONNX 내보내기 |
| **scipy** | 커브 피팅 | curve_fit (파워로, 와이블), 분포 피팅 |
| **lmfit** | 고급 커브 피팅 | 파라미터 경계/제약, 모델 비교, 신뢰 구간 |
| **numpy** | 수치 연산 | 몬테카를로 시뮬레이션 벡터 연산 |
| **pandas** | 데이터 처리 | 코호트 데이터 전처리, 피벗 |
| **W&B** (Weights & Biases) | 실험 추적 | 학습 로그, 모델 버전, 비교 대시보드 (무료 티어) |
| **psycopg2** / **asyncpg** | DB 연결 | Supabase PostgreSQL 직접 연결 |

#### 3.3 베이지안 추론 엔진 상세

##### Bayesian Decision Framework 구현

```
Prior (마켓 인텔리전스)     +    Likelihood (인터벤션 결과)    =    Posterior (투자 결정)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
장르별 리텐션 벤치마크           실험 ATE (ΔLTV 번역 핵심)        ΔLTV with credible intervals
경쟁 성과 분포                   라이브 ops 액션 결과             Payback Shift 예측
시장 포화 시그널                 실제 코호트 리텐션               BEP 확률 + Experiment ROI
UA 비용 트렌드                   매출/재무 실적                   투자 추천 + 예산 재배분 권고
```

##### 필요 역량 & 기술 구현 매핑

| 역량 | 기술 구현 | 사용 도구 |
|---|---|---|
| **사전 분포 구축** | 장르별 리텐션 벤치마크 → Beta/Normal prior | NumPyro `dist.Beta()`, `dist.Normal()` |
| **순차적 베이즈 업데이트** | D1→D7→D14→D30 관측 시 posterior 점진 갱신 | NumPyro SVI (실시간) / NUTS (배치) |
| **리텐션 커브 피팅** | 파워로 R(t)=a*t^b+c, 와이블, 지수 감쇠 | scipy.optimize.curve_fit, lmfit |
| **크레디블 인터벌** | P10/P50/P90 posterior 분위수 계산 | NumPyro posterior samples → np.percentile |
| **몬테카를로 시뮬** | CPI/ARPDAU 분포 샘플링 → 투자 결과 분포 | numpy + scipy.stats |
| **점근적 도달점 탐지** | 리텐션 커브 기울기 수렴 감지 → LTV 측정 가능 시점 | scipy derivative + 임계값 규칙 |

##### 베이지안 A/B 테스트 → 투자 가치 번역 파이프라인

```
A/B 테스트 결과 입력
        │
        ▼
┌─────────────────────────────┐
│  Bayesian A/B 모델 (NumPyro) │
│  Beta-Binomial for retention │
│  Normal-Normal for revenue   │
│  → ATE posterior 산출        │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  ATE → 투자 가치 번역        │
│                              │
│  ATE (리텐션 변화)           │
│    → ΔRetention(d) 전일 예측 │
│    → ΔLTV per user           │
│    → ΔAnnual Revenue         │
│      (ΔLTV × 예상 유저 수)   │
│    → ΔPayback Period         │
│    → ΔIRR                    │
│    → Experiment ROI          │
│      (ΔRevenue / 실험 비용)  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  출력 (P10 / P50 / P90)     │
│  • ΔLTV: [$1.2, $2.1, $3.4] │
│  • Experiment ROI: 340%      │
│  • P(positive ROI): 87%     │
│  • 추천: "전체 배포 권장"     │
└─────────────────────────────┘
```

#### 3.4 LSTM 리텐션 예측 모델 상세

##### 아키텍처

```
Input Sequence (D1-D14+ 코호트 리텐션)
  + Genre Benchmark Embedding
  + UA Channel Mix
  + Market Signals
        │
        ▼
┌─────────────────────────┐
│  LSTM Layer 1 (128 units) │
│  + Variational Dropout    │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  LSTM Layer 2 (128 units) │
│  + Variational Dropout    │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Attention Mechanism      │
│  (시퀀스 내 중요 시점 가중) │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Bayesian Head            │
│  (MC Dropout, 50 passes)  │
│  → P10/P50/P90 예측       │
└─────────────────────────┘

Output: D60-D365 리텐션 with 크레디블 인터벌
```

##### MC Dropout 불확실성 추정

- 추론 시 dropout을 활성 상태로 유지
- 50회 forward pass → 50개 서로 다른 예측 수집
- percentile 계산 → P10(비관), P50(중앙), P90(낙관)
- Variational Dropout 사용 (시퀀스 전체에 동일 마스크 적용) → LSTM에 더 나은 불확실성 추정

##### 학습 파이프라인

| 단계 | 도구 | 환경 |
|---|---|---|
| 데이터 전처리 | pandas, numpy | Local / Cloud Run Job |
| 모델 학습 | PyTorch + W&B | Local GPU 또는 Vertex AI (T4/L4) |
| 실험 추적 | W&B 무료 티어 | 클라우드 (wandb.ai) |
| 모델 서빙 | FastAPI + PyTorch (CPU) | GCP Cloud Run (2GB RAM, GPU 불필요) |
| 배치 추론 | Cloud Run Jobs | 일/시간 단위 스케줄 |

##### Dual-Layer 전환 로직

```
if cohort_data_days < 14:
    # Layer 1: 파라메트릭 모델
    use scipy.curve_fit(power_law, data)
    apply genre_benchmark as prior
    output = "예측 밴드 (넓은 불확실성)"

elif cohort_data_days >= 14 and sufficient_volume:
    # Layer 2: LSTM 모델
    use lstm_model.predict_with_uncertainty(data)
    output = "정밀 예측 (좁은 불확실성)"

# 전환은 점진적 — 두 레이어의 가중 평균으로 블렌딩
```

---

## 4. 외부 플랫폼 연동 (Silo 2 & 3 브릿징)

Compass는 자체 데이터를 생산하는 도구가 아니라, **기존 도구들의 출력을 투자 결정으로 번역하는 레이어**입니다.
따라서 MMP(어트리뷰션)와 A/B 테스트 플랫폼의 API 연동은 Decision OS의 핵심 인프라입니다.

### 4.1 MMP (Mobile Measurement Partner) 연동

#### 왜 필요한가

```
CLAUDE.md Silo 2: Attribution & User Acquisition
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MMP가 답하는 것: "유저가 어디서 오고 비용이 얼마인가?"
MMP가 답 못하는 것: "이 획득 비용이 장기 수익으로 정당화되는가?"

Compass가 MMP 데이터를 가져와야 하는 이유:
  Revenue Chain = UA Spend → ÷ CPI → Installs → × Retention(d) → DAU → × ARPDAU → Revenue
                  ^^^^^^^^     ^^^     ^^^^^^^^
                  MMP에서       MMP에서  MMP에서
                  가져옴        가져옴   가져옴
```

#### 플랫폼별 연동 사양

##### AppsFlyer (1순위 추천)

| 항목 | 상세 |
|---|---|
| **Cohort API** | `POST https://hq1.appsflyer.com/api/cohorts/v1/data/app/{app_id}` |
| **인증** | Bearer Token (V2 API Token) |
| **핵심 데이터** | 코호트 리텐션 (D0-D90), CPI, ROAS, Revenue per cohort |
| **세분화** | 채널, 캠페인, 국가, 기간별 분할 가능 |
| **Rate Limit** | 500 req/sec, 30K req/min |
| **데이터 형식** | JSON |
| **필요 플랜** | 고객사가 AppsFlyer 계약 필요 (Compass 비용 아님) |

```typescript
// Compass에서 AppsFlyer 데이터를 가져오는 흐름
interface AppsFlyerCohortRequest {
  from: string;           // "2026-01-01"
  to: string;             // "2026-03-31"
  groupings: string[];    // ["date", "geo", "media_source"]
  kpis: string[];         // ["retention_day_1", "retention_day_7", ..., "ecpi", "roas"]
  filters: {
    geo: string[];        // ["US", "JP", "KR"]
    media_source: string[]; // ["Facebook Ads", "Google Ads", "Unity Ads"]
  };
}

// Compass가 수신하여 투자 결정에 사용하는 핵심 필드
interface NormalizedUAData {
  tenant_id: string;
  app_id: string;
  source: 'appsflyer' | 'adjust' | 'singular';
  date: string;
  channel: string;          // 매체
  campaign: string;         // 캠페인
  country: string;          // 국가
  installs: number;         // 설치 수
  cost: number;             // UA 비용
  cpi: number;              // Cost Per Install
  revenue_d7: number;       // D7 누적 매출
  revenue_d30: number;      // D30 누적 매출
  roas_d7: number;          // D7 ROAS
  roas_d30: number;         // D30 ROAS
  retention_d1: number;     // D1 리텐션
  retention_d7: number;     // D7 리텐션
  retention_d30: number;    // D30 리텐션
  // Compass가 여기에 추가하는 필드:
  predicted_ltv_p50?: number;    // 예측 LTV (중앙값)
  predicted_payback_day?: number; // 예측 페이백 일
  investment_signal?: 'green' | 'yellow' | 'red';
}
```

##### Adjust (2순위)

| 항목 | 상세 |
|---|---|
| **Report Service API** | `GET https://automate.adjust.com/reports-service/report` |
| **인증** | Bearer Token |
| **핵심 데이터** | 코호트 리텐션 (D0-D120, AppsFlyer보다 긴 윈도우), CPI, ROAS |
| **Rate Limit** | 50 concurrent requests |
| **장점** | D120 코호트 — 장기 리텐션 분석에 유리 |

##### Singular (3순위 — 비용 집계 보완용)

| 항목 | 상세 |
|---|---|
| **Reporting API** | 비동기 쿼리 모델 (요청 → 폴링 → 결과) |
| **장점** | 멀티 MMP 비용 집계에 강점 |
| **단점** | 코호트 지원 약함, 최소 ~$795/월, 복잡한 비동기 모델 |
| **권장** | AppsFlyer/Adjust 우선, 고객이 Singular만 쓸 경우 대비 |

#### MMP 연동 아키텍처

```
┌──────────────────────────────────────────────────────────┐
│                 MMP Integration Layer                     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ AppsFlyer    │  │ Adjust       │  │ Singular        │  │
│  │ Adapter      │  │ Adapter      │  │ Adapter         │  │
│  │              │  │              │  │                 │  │
│  │ • Cohort API │  │ • Report Svc │  │ • Reporting API │  │
│  │ • Pull API   │  │ • KPI Svc    │  │ • ETL           │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                 │                   │           │
│         ▼                 ▼                   ▼           │
│  ┌──────────────────────────────────────────────────┐    │
│  │         Normalizer (NormalizedUAData 스키마)       │    │
│  │  • CPI/ROAS 통합                                  │    │
│  │  • 채널/캠페인 네이밍 정규화                        │    │
│  │  • 코호트 리텐션 → Compass 리텐션 스키마 매핑       │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         │                                │
│                         ▼                                │
│              Supabase (ua_cohorts 테이블)                 │
│                         │                                │
│                         ▼                                │
│    ┌─────────────────────────────────────────┐           │
│    │  Compass Investment Engine               │           │
│    │  MMP CPI + Compass Retention Prediction  │           │
│    │  = Payback Period + LTV + ROAS Forecast  │           │
│    └─────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────┘

동기화: Cloud Scheduler → 일 1회 Pull (각 어댑터)
```

#### MMP 데이터가 투자 결정에 연결되는 흐름

```
MMP 데이터 (실제 관측)              Compass 예측 엔진                투자 결정
━━━━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━              ━━━━━━━━━━
CPI = $2.50/install    ─────→    LTV 예측 = $3.80 (P50)    ─────→  ROAS(D180) = 152%
                                            $2.10 (P10)              BEP 확률 = 73%
Installs = 50K/month   ─────→   Revenue 예측 = $190K (P50)  ─────→  "투자 지속" (Green)
                                              $105K (P10)
ROAS(D7) = 12%         ─────→   ROAS 궤적 예측              ─────→  예상 페이백: D95
Channel: Facebook 60%  ─────→   채널별 효율 비교             ─────→  "Unity Ads 비중 ↑ 권장"
```

---

### 4.2 A/B 테스트 플랫폼 연동 & 롤아웃 관리

#### 왜 필요한가

```
CLAUDE.md Silo 3: Experimentation & Product
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
실험 플랫폼이 답하는 것: "어떤 변형이 더 좋았는가?"
실험 플랫폼이 답 못하는 것: "이 실험이 얼마나 많은 투자 가치를 만들었는가?"

Compass가 실험 데이터를 가져와야 하는 이유:
  ATE → ΔRetention → ΔLTV → ΔAnnual Revenue → Experiment ROI
  ^^^
  실험 플랫폼에서 가져옴
```

#### 플랫폼별 연동 사양

##### Statsig (1순위 강력 추천)

| 항목 | 상세 |
|---|---|
| **Pulse Results API** | `GET /console/v1/experiments/{id}/pulse_results` |
| **인증** | Console API Key (Header: `statsig-api-key`) |
| **핵심 반환값** | `absoluteChange` (ATE), `confidenceInterval`, `pValue`, `testMean`, `controlMean`, `toplineImpact` |
| **Feature Gates API** | `GET /console/v1/gates` — 피처 플래그 목록 및 상태 |
| **Rollout 제어** | `PATCH /console/v1/gates/{id}` — 롤아웃 비율 변경 가능 |
| **Server SDK** | Python SDK (`statsig-python`) — 로컬 평가, 실험 할당 |
| **가격** | Developer 무료: 2M 이벤트/월, 무제한 시트, 전체 실험 기능 |
| **Rate Limit** | ~100 mutations/10sec, ~900/15min |

```typescript
// Statsig에서 가져오는 실험 결과 스키마
interface StatsigPulseResult {
  experiment_id: string;
  experiment_name: string;
  status: 'active' | 'decided' | 'abandoned';
  start_date: string;
  variants: {
    name: string;          // "control" | "treatment"
    sample_size: number;
  }[];
  metrics: {
    metric_name: string;   // "d7_retention", "revenue_per_user"
    test_mean: number;
    control_mean: number;
    absolute_change: number;  // ← 이것이 ATE
    relative_change: number;  // 상대적 변화율
    confidence_interval: {
      lower: number;
      upper: number;
    };
    p_value: number;
    is_significant: boolean;
    topline_impact: number;   // 전체 영향 추정
  }[];
}

// Compass가 이를 투자 가치로 번역
interface ExperimentInvestmentTranslation {
  experiment_id: string;
  // Statsig에서 가져온 원본
  ate_retention_d7: number;        // +3.7pp
  ate_confidence_interval: [number, number]; // [+1.2pp, +6.1pp]

  // Compass가 계산하는 투자 가치 (P10/P50/P90)
  delta_ltv: { p10: number; p50: number; p90: number };
  delta_annual_revenue: { p10: number; p50: number; p90: number };
  experiment_cost: number;         // 실험 운영 비용
  experiment_roi: { p10: number; p50: number; p90: number };
  prob_positive_roi: number;       // P(ROI > 0)

  // Compass 의사결정 출력
  recommendation: 'ship' | 'iterate' | 'kill';
  decision_confidence: number;     // 0-1
  recommended_rollout: number;     // 권장 롤아웃 비율 (%)
}
```

##### Firebase Remote Config + A/B Testing (2순위 — 기존 사용 고객 대응)

| 항목 | 상세 |
|---|---|
| **실험 결과** | REST API 없음 — BigQuery Export 필수 |
| **Remote Config API** | `PUT https://firebaseremoteconfig.googleapis.com/v1/projects/{id}/remoteConfig` |
| **롤아웃 제어** | Remote Config 조건별 % 비율 설정 가능 |
| **한계** | ATE 직접 제공 안 함, BigQuery에서 직접 계산 필요 |
| **가격** | 무료 (BigQuery 비용만 발생) |

```
Firebase 연동 시 데이터 흐름:
  Firebase A/B → BigQuery Export → Compass Python 서비스
                                     ├─ ATE 직접 계산 (NumPyro Bayesian A/B)
                                     ├─ 신뢰 구간 산출
                                     └─ 투자 가치 번역
```

##### LaunchDarkly (3순위 — 대형 고객 대응)

| 항목 | 상세 |
|---|---|
| **Experimentation API** | 베타, $3/1K MAU 추가 비용 |
| **Flag Management API** | `PATCH /api/v2/flags/{projKey}/{flagKey}` — 롤아웃 % 제어 |
| **장점** | 엔터프라이즈 수준 피처 플래그 관리 |
| **단점** | 비용 높음, 실험 API 미성숙 |

#### 어댑터 패턴 (공통 인터페이스)

```typescript
// 모든 A/B 플랫폼을 하나의 인터페이스로 추상화
interface ExperimentPlatformAdapter {
  // 실험 목록 조회
  listExperiments(filters: ExperimentFilter): Promise<Experiment[]>;

  // 특정 실험의 ATE 결과 가져오기
  getExperimentResults(experimentId: string): Promise<ExperimentResult>;

  // 롤아웃 비율 변경 (Decision OS의 핵심 액추에이터)
  setRolloutPercentage(
    flagId: string,
    percentage: number  // 0-100
  ): Promise<void>;

  // 실험 상태 변경
  updateExperimentStatus(
    experimentId: string,
    status: 'start' | 'pause' | 'ship' | 'kill'
  ): Promise<void>;
}

// 각 플랫폼별 어댑터 구현
class StatsigAdapter implements ExperimentPlatformAdapter { ... }
class FirebaseAdapter implements ExperimentPlatformAdapter { ... }
class LaunchDarklyAdapter implements ExperimentPlatformAdapter { ... }
```

---

### 4.3 롤아웃 오케스트레이션 (Compass 핵심 차별화)

#### 왜 이것이 Decision OS의 핵심인가

기존 A/B 테스트 플랫폼은 "통계적으로 유의미하면 Ship"이라는 단순 로직을 사용합니다.
Compass는 이를 **투자 관점**으로 전환합니다:

> "이 실험을 Ship하면 얼마의 투자 가치가 생기고, 어떤 속도로 롤아웃해야 리스크가 최소화되는가?"

#### 자동 롤아웃 결정 루프

```
┌─────────────────────────────────────────────────────────────┐
│            Compass Rollout Orchestration Loop                │
│                                                             │
│  ┌──────────┐    ┌───────────────┐    ┌────────────────┐   │
│  │ 1. PULL   │    │ 2. ANALYZE    │    │ 3. DECIDE      │   │
│  │           │    │               │    │                │   │
│  │ Statsig   │───→│ ATE 추출      │───→│ Bayesian 판정  │   │
│  │ Pulse API │    │ 신뢰구간 확인 │    │ 투자 가치 계산 │   │
│  │           │    │ 샘플 사이즈   │    │ ROI 확률 산출  │   │
│  └──────────┘    └───────────────┘    └───────┬────────┘   │
│                                               │            │
│                                               ▼            │
│  ┌──────────┐    ┌───────────────┐    ┌────────────────┐   │
│  │ 6. MONITOR│    │ 5. MEASURE    │    │ 4. ACT         │   │
│  │           │    │               │    │                │   │
│  │ 이상 탐지 │←───│ 실제 영향 측정│←───│ 롤아웃 % 변경  │   │
│  │ 리스크 감시│    │ 예측 vs 실제 │    │ Statsig API    │   │
│  │ 알림 발송 │    │ LTV 추적     │    │ 또는 수동 알림 │   │
│  └──────────┘    └───────────────┘    └────────────────┘   │
│                                                             │
│  반복 주기: 일 1회 (배치) 또는 충분 샘플 도달 시 (이벤트)    │
└─────────────────────────────────────────────────────────────┘
```

#### 롤아웃 결정 매트릭스

| ATE 방향 | 투자 가치 (P50) | P(ROI > 0) | Compass 결정 | 롤아웃 액션 |
|---|---|---|---|---|
| 양수 (개선) | 높음 | ≥ 90% | **Ship** | 100% 롤아웃 권장 |
| 양수 (개선) | 중간 | 70-90% | **점진 확대** | 10% → 25% → 50% → 100% |
| 양수 (개선) | 낮음 | 50-70% | **관찰 지속** | 현재 비율 유지, 데이터 추가 수집 |
| 양수 (미미) | 미미 | < 50% | **재설계** | 실험 중단, 가설 재검토 |
| 음수 (악화) | 음수 | < 30% | **Kill** | 즉시 0% 롤아웃 |

#### 점진적 롤아웃 시나리오 (투자 관점)

```
Day 0:  실험 Ship 결정 (ATE = +3.7pp D7 리텐션, P(ROI>0) = 82%)
        └─ Compass 권장: "점진 확대" — 먼저 10%에 배포

Day 3:  10% 롤아웃 관측
        ├─ 실제 리텐션 변화: +3.2pp (예측 범위 내)
        ├─ 매출 영향: +$12K (예측 $15K의 80%)
        └─ Compass: "관측값이 P10-P90 밴드 내 → 25%로 확대 권장"

Day 7:  25% 롤아웃 관측
        ├─ 실제 리텐션 변화: +4.1pp (예측보다 좋음!)
        ├─ P(ROI>0) 업데이트: 82% → 91%
        └─ Compass: "신뢰도 상승 → 50%로 확대 권장"

Day 14: 50% 롤아웃 관측
        ├─ 실제 ΔLTV 관측: $0.85/user
        ├─ 연간 매출 증분 예측: $510K (P50)
        └─ Compass: "충분한 확신 → 100% 전체 배포 권장"

Day 15: 전체 배포 완료
        └─ Experiment ROI 기록: $510K / $15K(실험비용) = 3,400%
           → 실험 포트폴리오에 누적 기록
```

#### 필요 기술 스택 (롤아웃 오케스트레이션)

| 기술 | 용도 | 담당 |
|---|---|---|
| **Statsig Console API** | 실험 결과 Pull, 롤아웃 % 변경 | 풀스택 |
| **Statsig Python SDK** | 서버사이드 실험 할당 (고객 앱에서) | 풀스택 |
| **NumPyro** | ATE → ΔLTV 베이지안 번역, ROI 확률 계산 | 데이터/AI |
| **Cloud Scheduler** | 일 1회 실험 결과 동기화 + 롤아웃 판정 | 공동 |
| **Supabase** | 실험 이력, 롤아웃 상태, 투자 가치 기록 | 공동 |
| **알림 시스템** | 롤아웃 결정 알림 (Slack/Email webhook) | 풀스택 |

---

### 4.4 투자 영향도 번역 엔진 (The Core IP)

#### CLAUDE.md Section 6의 기술 구현

이것이 Compass의 **핵심 지적 재산**입니다. 어떤 기존 도구도 이 번역을 수행하지 않습니다.

```
┌─────────────────────────────────────────────────────────────────┐
│              Investment Impact Translation Engine                │
│                                                                  │
│  INPUT (3개 소스에서 수집)                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────────┐  │
│  │ MMP Data      │ │ A/B Results  │ │ Compass Retention Model │  │
│  │ • CPI         │ │ • ATE        │ │ • R(t) curve            │  │
│  │ • Installs    │ │ • CI         │ │ • Genre benchmark       │  │
│  │ • Channel mix │ │ • Sample N   │ │ • ARPDAU model          │  │
│  └──────┬────────┘ └──────┬───────┘ └───────────┬─────────────┘  │
│         │                 │                     │                │
│         ▼                 ▼                     ▼                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                TRANSLATION PIPELINE                        │  │
│  │                                                            │  │
│  │  Step 1: ATE → ΔRetention Curve                           │  │
│  │    ATE(D7) = +3.7pp                                       │  │
│  │    → 리텐션 커브 전체를 재계산                               │  │
│  │    → ΔR(d) for d = 1...365                                │  │
│  │                                                            │  │
│  │  Step 2: ΔRetention → ΔLTV                                │  │
│  │    ΔLTV = Σ(d=1→T) ΔR(d) × ARPDAU(d)                     │  │
│  │    → with 불확실성 전파 (ATE CI × ARPDAU variance)         │  │
│  │    → ΔLTV: P10=$0.40, P50=$0.85, P90=$1.50               │  │
│  │                                                            │  │
│  │  Step 3: ΔLTV → ΔAnnual Revenue                          │  │
│  │    ΔRevenue = ΔLTV × projected_installs_per_year          │  │
│  │    → installs from MMP data (trend extrapolation)         │  │
│  │    → ΔRevenue: P10=$120K, P50=$510K, P90=$900K            │  │
│  │                                                            │  │
│  │  Step 4: ΔRevenue → Investment Metrics                    │  │
│  │    Experiment ROI = ΔRevenue / experiment_cost             │  │
│  │    ΔPayback Period = 기존 payback - 새 payback             │  │
│  │    ΔIRR = 기존 IRR - 새 IRR                                │  │
│  │    Capital Efficiency Δ = ΔRevenue / total_investment      │  │
│  │                                                            │  │
│  │  Step 5: Decision Output                                  │  │
│  │    P(ROI > 0) = 0.87                                      │  │
│  │    Recommendation = "Ship (점진 롤아웃)"                    │  │
│  │    Decision Confidence = 0.82                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  OUTPUT → Dashboard (Module 3, 4) + 알림 + 롤아웃 제어           │
└─────────────────────────────────────────────────────────────────┘
```

#### 투자 영향도 전체 메트릭 체계

| 레벨 | 메트릭 | 산출 방법 | Module |
|---|---|---|---|
| **실험 단위** | ATE | 실험 플랫폼 API | Module 4 |
| | ΔLTV | ATE × retention curve × ARPDAU | Module 4 |
| | Experiment ROI | ΔRevenue / experiment_cost | Module 4 |
| | Time-to-Decision | 실험 시작 → 결정까지 일수 | Module 4 |
| **액션 단위** | Causal Impact | 리텐션 모델 기반 인과 추정 | Module 3 |
| | ΔPayback Period | 액션 전후 페이백 변화 | Module 3 |
| | Cumulative Action Value | 모든 액션의 누적 투자 가치 | Module 3 |
| **타이틀 단위** | 투자 시그널 | Bayesian posterior → Green/Yellow/Red | Module 1 |
| | BEP 확률 | P(LTV ≥ CPI) from posterior | Module 1 |
| | Burn Tolerance | 현재 손실률 기준 런웨이 (개월) | Module 1 |
| **포트폴리오** | Experiment Velocity | 월간 완료 실험 수 | Module 4 |
| | Ship Rate × Win Rate | R&D → 제품 가치 전환율 | Module 4 |
| | 누적 ΔLTV | 전체 shipped winner의 LTV 증분 합 | Module 4 |
| | Learning Efficiency | 실험당 창출 가치 (실패 포함) | Module 4 |
| **컴파운딩** | Baseline Improvement | shipped winner로 인한 기준선 상승 | Module 5 |
| | Compounding Rate | 실험 가치의 복리 효과 | Module 5 |

#### 필요 기술 상세

| 역량 | 기술 구현 | 담당 |
|---|---|---|
| ATE → ΔRetention 전파 | NumPyro: ATE posterior × retention curve refit | 데이터/AI |
| 불확실성 전파 | Monte Carlo: ATE samples × ARPDAU samples → ΔLTV distribution | 데이터/AI |
| Causal Impact (비실험) | CausalImpact 라이브러리 또는 NumPyro 커스텀 | 데이터/AI |
| 실험 메타데이터 관리 | Supabase experiments 테이블 | 풀스택 |
| 롤아웃 상태 추적 | Supabase rollout_history 테이블 | 풀스택 |
| 투자 가치 시각화 | Recharts: 실험 ROI 차트, 누적 가치 영역 차트 | 풀스택 |
| 포트폴리오 대시보드 | Module 4 UI (실험 카드 + 파이프라인 뷰) | 풀스택 |

---

### 4.5 Silo 연동 우선순위 로드맵

모든 것을 한꺼번에 구축할 필요는 없습니다. Decision OS는 점진적으로 완성됩니다.

| Phase | 연동 | 시기 | 근거 |
|---|---|---|---|
| **Phase 1** | Statsig Console API (실험 결과 Pull) | Month 2-3 | 무료, ATE 직접 제공, 롤아웃 제어 가능 |
| **Phase 1** | AppsFlyer Cohort API (CPI/ROAS Pull) | Month 2-3 | 고객이 이미 사용 중, Revenue Chain 핵심 |
| **Phase 2** | 투자 영향도 번역 엔진 v1 | Month 3-4 | ATE → ΔLTV → ROI 기본 파이프라인 |
| **Phase 2** | 롤아웃 오케스트레이션 v1 | Month 4-5 | 점진 롤아웃 결정 + 모니터링 |
| **Phase 3** | Adjust Report Service API | Month 5-6 | Adjust 고객 대응 |
| **Phase 3** | Firebase BigQuery Connector | Month 5-6 | Firebase 고객 대응 |
| **Phase 4** | LaunchDarkly / Singular | Month 7+ | 엔터프라이즈 고객 대응 |
| **Phase 4** | Causal Impact (비실험 액션) | Month 7+ | Module 3 완성 |

---

### 4.6 A/B 플랫폼 미보유 고객을 위한 약식 실험 지원

#### 전제: Compass는 A/B 테스트 SDK가 아니다

CLAUDE.md Section 1.3에 명시된 대로 Compass는 Statsig, Firebase를 대체하지 않습니다.
하지만 현실적으로 **A/B 플랫폼 없이 운영하는 소규모 게임사**가 많습니다.
이 고객들도 "실험 → 투자 가치" 번역의 혜택을 받을 수 있도록, 최소한의 약식 지원을 제공합니다.

> 핵심 원칙: **Compass가 실험을 실행하지 않는다. 실험 결과를 입력받아 투자 가치로 번역한다.**

#### 3가지 약식 모드

##### Mode 1: 수동 실험 등록 (Manual Entry)

가장 가벼운 방식. 고객이 자체적으로 실험한 결과를 Compass에 직접 입력합니다.

```
┌─────────────────────────────────────────────────┐
│  Compass 실험 등록 폼                            │
│                                                  │
│  실험명: [신규 튜토리얼 플로우 v2             ]  │
│  시작일: [2026-03-15]    종료일: [2026-03-29]    │
│                                                  │
│  ── Control Group ──                             │
│  유저 수:  [12,400  ]   D7 리텐션: [18.5%]       │
│  ARPDAU:   [$0.042  ]   D7 매출:   [$3,200]      │
│                                                  │
│  ── Treatment Group ──                           │
│  유저 수:  [12,600  ]   D7 리텐션: [22.1%]       │
│  ARPDAU:   [$0.045  ]   D7 매출:   [$4,100]      │
│                                                  │
│  [투자 가치 분석 실행]                            │
└─────────────────────────────────────────────────┘
```

**Compass가 수행하는 작업:**
1. 입력된 control/treatment 수치로 **Bayesian A/B 분석** (NumPyro Beta-Binomial)
2. ATE + 크레디블 인터벌 자동 산출
3. ATE → ΔLTV → ΔRevenue → Experiment ROI 번역 (기존 파이프라인 그대로)
4. Ship/Iterate/Kill 추천 + 결정 신뢰도

**필요 기술:** NumPyro (이미 있음), Compass UI 폼 (React Hook Form)
**추가 개발량:** ~1주 (UI 폼 + API 엔드포인트)

##### Mode 2: Pre/Post 시계열 비교 (Before-After Analysis)

A/B 분할 없이 **"변경 전 vs 변경 후"** 비교. 업데이트, 이벤트, 밸런스 패치 등의 영향을 추정합니다.

```
시계열:  ──────────── 변경 시점 ────────────
                       │
         [Pre 기간]    │    [Post 기간]
         D-14 ~ D-1    │    D+1 ~ D+14
                       │
Compass 분석:
  1. Pre 기간의 리텐션/매출 트렌드 피팅
  2. Post 기간의 예상값 (counterfactual) 추정
  3. 실제 Post 값 - 예상 Post 값 = 인과 효과 추정
  4. → ΔLTV → 투자 가치 번역
```

**기술 구현:**
- **CausalImpact** (Python: `causalimpact` 패키지 또는 `tfcausalimpact`)
  - Google이 개발한 Bayesian Structural Time-Series 모델
  - 대조군 없이도 counterfactual을 추정
  - 크레디블 인터벌 자동 산출
- 또는 **NumPyro 커스텀**: Interrupted Time Series (ITS) 모델

```python
# Pre/Post 분석 예시 (CausalImpact)
from causalimpact import CausalImpact

# 변경 시점 전후의 일별 리텐션/매출 데이터
data = pd.DataFrame({
    'y': daily_retention_values,           # 분석 대상 지표
    'x1': genre_benchmark_retention,       # 대조 시계열 (시장 벤치마크)
}, index=dates)

pre_period = ['2026-03-01', '2026-03-14']
post_period = ['2026-03-16', '2026-03-29']

ci = CausalImpact(data, pre_period, post_period)
# ci.summary()  → 추정 인과 효과 + 크레디블 인터벌
# ci.inferences → 일별 counterfactual vs actual

ate_estimate = ci.summary_data.loc['average', 'abs_effect']
ate_ci = (ci.summary_data.loc['average', 'abs_effect_lower'],
          ci.summary_data.loc['average', 'abs_effect_upper'])

# → 기존 투자 가치 번역 파이프라인에 투입
```

**핵심 제약:** 대조군이 없으므로 정확도가 A/B 테스트보다 낮습니다.
Compass는 이를 **결정 신뢰도(decision confidence)에 반영**합니다:
- A/B 테스트 기반 ATE: confidence penalty = 0 (가장 신뢰)
- Pre/Post with 시장 벤치마크 대조: confidence penalty = -0.15
- Pre/Post without 대조: confidence penalty = -0.30

**추가 개발량:** ~2주 (CausalImpact 통합 + UI)

##### Mode 3: 코호트 비교 (Cohort Comparison)

특정 날짜 이전/이후 코호트를 자연 실험으로 비교합니다.

```
코호트 A: 3월 1-14일 설치 유저 (변경 전 버전 경험)
코호트 B: 3월 16-29일 설치 유저 (변경 후 버전 경험)

Compass 분석:
  1. 두 코호트의 리텐션 커브 비교
  2. 시장 트렌드 / 계절성 보정 (장르 벤치마크 활용)
  3. 보정된 ATE 추정
  4. → 투자 가치 번역
```

**기술 구현:** NumPyro Bayesian regression with time covariates
**추가 개발량:** ~1주 (코호트 데이터는 이미 Supabase에 존재)

#### 약식 모드 비교

| 모드 | 정확도 | 필요 데이터 | 개발 비용 | 적합 상황 |
|---|---|---|---|---|
| **수동 등록** | 높음 (고객이 A/B 했다면) | Control/Treatment 집계 수치 | 1주 | 자체 A/B 했지만 플랫폼 없음 |
| **Pre/Post** | 중간 | 변경 전후 시계열 | 2주 | 업데이트/이벤트 영향 측정 |
| **코호트 비교** | 중간-낮음 | 코호트별 리텐션 | 1주 | 버전 업데이트 효과 추정 |

#### 추천 전략: "약식으로 시작, 플랫폼 도입 유도"

```
고객 온보딩 시나리오:

1. 고객이 A/B 플랫폼 없음
   → Compass 약식 모드 (수동 등록 + Pre/Post) 제공
   → 투자 가치 번역 결과를 경험하게 함
   → "Statsig 무료 티어를 연동하면 이 분석이 자동화됩니다" 안내

2. 고객이 Statsig 무료 티어 도입
   → API 연동 → 실험 결과 자동 수집
   → 롤아웃 오케스트레이션 활성화
   → Compass의 전체 가치 경험

이 전략은 고객의 실험 성숙도를 높이면서
Compass의 풀 기능으로 자연스럽게 유도합니다.
```

#### 약식 모드 추가 기술 스택

| 패키지 | 용도 | 담당 | Phase |
|---|---|---|---|
| **causalimpact** (Python) | Pre/Post 시계열 인과 추정 | 데이터/AI | Phase 2 |
| **React Hook Form** | 수동 실험 등록 폼 | 풀스택 | Phase 2 |
| NumPyro (이미 포함) | Bayesian A/B, 코호트 비교 | 데이터/AI | Phase 2 |

---

## 5. 공통 인프라 & DevOps

### 5.1 인프라 구성

| 서비스 | 플랫폼 | 용도 | 예상 월 비용 |
|---|---|---|---|
| **Next.js 호스팅** | Vercel (Pro) | 프론트엔드 + API Routes | $20 |
| **DB + Auth + Storage** | Supabase (Pro) | PostgreSQL, RLS, Auth, Storage | $25 |
| **Python API 서버** | GCP Cloud Run | FastAPI 서빙 (min-instances=1) | $30-80 |
| **배치 추론** | GCP Cloud Run Jobs | MCMC/SVI 배치, 리텐션 예측 | $20-50 |
| **크롤링 잡** | GCP Cloud Run Jobs | Crawlee 실행 | $20-50 |
| **스케줄러** | GCP Cloud Scheduler | 크롤링 + 배치 추론 트리거 | ~$0 |
| **캐시** | Upstash Redis | 연산 결과 캐시, API 응답 캐시 | $10 |
| **Raw 데이터 아카이브** | GCS (Cloud Storage) | 크롤링 원본 JSON 보관 | $5-10 |
| **프록시** | ScraperAPI + Bright Data | 크롤링 안티봇 우회 | $50-500 |
| **실험 추적** | W&B 무료 티어 | ML 모델 학습 로그 | $0 |
| **모니터링** | GCP Cloud Monitoring | 알림, 로그, 메트릭 | ~$0 |
| | | **합계** | **$180-735/월** |

### 5.2 멀티테넌트 설계

```sql
-- Supabase RLS 기반 테넌트 격리

-- 모든 테넌트 데이터 테이블에 tenant_id 포함
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  app_id TEXT NOT NULL,
  store TEXT NOT NULL CHECK (store IN ('ios', 'android')),
  -- ...
);

-- RLS 정책: 사용자는 자기 테넌트 데이터만 접근
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON games
  USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));

-- 크롤러 서비스 계정은 RLS 우회 (service_role key 사용)
-- 마켓 벤치마크 테이블은 모든 테넌트 공유 (별도 RLS 정책)
```

### 5.3 재무 데이터 보안 인프라

고객의 재무 데이터(매출, burn rate, 현금 잔액)는 **영업비밀**(부정경쟁방지법 보호)입니다.

#### Day 1 (MVP) — 필수 보안 조치 ($0)

| 조치 | 구현 | 비용 |
|---|---|---|
| TLS 1.2+ 전체 적용 | Supabase/Vercel/Cloud Run 기본 제공 | $0 |
| AES-256 암호화 (at rest) | Supabase PostgreSQL 기본 제공 | $0 |
| RLS 테넌트 격리 | `financial_inputs` 테이블 RLS 정책 | $0 |
| MFA 인증 | Better Auth MFA 활성화 | $0 |
| API Key 암호화 저장 | 환경 변수 + GCP Secret Manager | $0 |
| 감사 추적 | `financial_access_log` 테이블 | $0 |
| Privacy Policy + ToS | 템플릿 기반 + 변호사 검토 | ₩100-200만 |

#### Month 3-6 — 권장 보안 조치

| 조치 | 구현 | 비용 |
|---|---|---|
| SOC 2 준비 | Vanta 또는 Drata | $5K-15K/년 |
| 침투 테스트 | 서드파티 연 1회 | $3K-10K |
| 사이버 보험 | 기본 보장 ($500K-$1M) | $500-2K/년 |
| 자동 백업 검증 | Cloud Run Jobs | 최소 비용 |

#### Year 1-2 — 엔터프라이즈 보안

| 조치 | 비용 |
|---|---|
| SOC 2 Type I | $25K-40K |
| SOC 2 Type II (Year 2) | +$15K-25K |
| ISO 27001 (한국 엔터프라이즈 대상 시) | $30K-60K |
| K-ISMS (의무 대상 도달 시) | 별도 |
| 한국 데이터 레지던시 (GCP Seoul) | 호스팅 증분 비용 |

### 5.4 CI/CD 파이프라인

```
GitHub Push
    │
    ├──→ Vercel (자동 배포) ─── Next.js 프리뷰/프로덕션
    │
    └──→ GitHub Actions
          ├── TypeScript: tsc --noEmit + ESLint + Vitest
          ├── Python: pytest + mypy + ruff
          └── Docker Build → GCP Artifact Registry → Cloud Run Deploy
```

### 5.4 개발 환경

| 도구 | 용도 |
|---|---|
| **pnpm** | 패키지 매니저 (Next.js/TS) |
| **uv** | Python 패키지 매니저 (빠른 설치) |
| **Docker Compose** | 로컬 개발 환경 (Supabase local, Python 서비스) |
| **Turborepo** (선택) | 모노레포 빌드 캐싱 (프론트+크롤러) |

---

## 6. Phase별 구현 로드맵

### Phase 1: Foundation (Month 1-2) — Module 1 MVP

**목표**: Executive Overview 대시보드의 최소 작동 버전

| 주차 | 풀스택 개발자 | 데이터/AI 엔지니어 |
|---|---|---|
| **1-2주** | Next.js + FSD 프로젝트 셋업, Supabase 스키마, Better Auth | Python 프로젝트 셋업, FastAPI 스켈레톤, scipy 커브 피팅 프로토타입 |
| **3-4주** | Crawlee 크롤링 엔진 v1 (Apple RSS + GP Scraper), 정규화 파이프라인 | 장르별 벤치마크 데이터 구축, 파워로/와이블 피팅 검증 |
| **5-6주** | Module 1 대시보드 UI (Recharts P10/P50/P90 밴드), OpenAPI 연동 | NumPyro 베이지안 모델 v1 (사전분포 + 순차 업데이트), FastAPI 엔드포인트 |
| **7-8주** | 통합 테스트, Cloud Run 배포, 크롤링 스케줄링 | 몬테카를로 시뮬레이션 v1, 투자 시그널 (Green/Yellow/Red) 로직 |

**Phase 1 산출물**:
- 작동하는 대시보드: 게임 선택 → 리텐션 예측 밴드 → 투자 시그널
- 마켓 데이터 자동 크롤링 (일 1회)
- 파라메트릭 리텐션 예측 (Layer 1)

### Phase 2: Intelligence + Silo 연동 (Month 3-4) — Module 2 + MMP/A/B 연동

| 작업 | 담당 |
|---|---|
| Module 2 (Market vs Internal Gap) UI | 풀스택 |
| 앱 인텔리전스 API 파트너십/라이선싱 검토 (플랫폼 성장 후) | 풀스택 |
| **AppsFlyer Cohort API 어댑터** (CPI, ROAS, 코호트 리텐션) | 풀스택 |
| **Statsig Console API 어댑터** (실험 결과 Pull, ATE 수집) | 풀스택 |
| **약식 실험 지원: 수동 등록 폼 + 코호트 비교** | 풀스택 |
| LSTM 모델 개발 및 학습 (Layer 2) | 데이터/AI |
| **ATE → ΔLTV → ROI 투자 가치 번역 엔진 v1** | 데이터/AI |
| **CausalImpact Pre/Post 분석 모듈** | 데이터/AI |
| 배치 추론 파이프라인 (Cloud Run Jobs) | 공동 |

### Phase 3: Experiment Translation + 롤아웃 (Month 5-6) — Module 3 + 4

| 작업 | 담당 |
|---|---|
| Module 3 (Action Impact Board) UI | 풀스택 |
| Module 4 (Experiment Board) UI | 풀스택 |
| **Adjust Report Service API 어댑터** | 풀스택 |
| **Firebase BigQuery Connector** | 풀스택 |
| **롤아웃 오케스트레이션 루프 v1** (Pull→Analyze→Decide→Act) | 공동 |
| 실험 포트폴리오 메트릭 엔진 (Velocity, Ship Rate, Win Rate) | 데이터/AI |
| **점진적 롤아웃 결정 매트릭스 구현** | 데이터/AI |
| 이상 탐지 + LLM 해석 연동 | 공동 |

### Phase 4: Capital Allocation (Month 7-8) — Module 5 + 고도화

| 작업 | 담당 |
|---|---|
| Module 5 (Capital Allocation Console) UI | 풀스택 |
| 시나리오 시뮬레이터 (실시간 SVI) | 데이터/AI |
| 다중 타이틀 포트폴리오 최적화 | 데이터/AI |
| **LaunchDarkly / Singular 어댑터** (엔터프라이즈) | 풀스택 |
| **Causal Impact 비실험 액션 영향도 분석** | 데이터/AI |
| **컴파운딩 효과 추적** (shipped winner → 기준선 상승) | 데이터/AI |
| 엔터프라이즈 기능 (멀티테넌트 완성) | 풀스택 |

---

## 7. 기술 리스크 & 의존성

### 7.1 High Risk

| 리스크 | 영향 | 완화 전략 |
|---|---|---|
| **마켓 데이터 크롤링 차단** | Module 2 기능 불가 | 3-Tier 프록시 + 공식 API 전환 준비, Apple RSS/iTunes API 우선 |
| **리텐션 예측 정확도 부족** | 투자 결정 신뢰도 하락 | Layer 1 (파라메트릭) 우선 검증, 장르 세분화, 점진적 LSTM 전환 |
| **2인 팀 병목** | 개발 속도 저하 | Phase 우선순위 엄격 준수, Module 1 집중, 이후 확장 |

### 7.2 Medium Risk

| 리스크 | 영향 | 완화 전략 |
|---|---|---|
| **Supabase 성능 한계** | 대규모 코호트 쿼리 지연 | 파티셔닝, 인덱싱, 필요 시 읽기 레플리카 |
| **Cloud Run 콜드스타트** | Python 서비스 응답 지연 | min-instances=1, 모델 사전 로딩, 결과 캐싱 |
| **NumPyro/JAX 호환성** | 컨테이너 빌드 이슈 | CPU-only JAX wheel 고정, Docker 이미지 테스트 자동화 |

### 7.3 핵심 의존성 매트릭스

```
Frontend ──depends on──→ Python API (OpenAPI spec)
Python API ──depends on──→ Supabase (코호트/벤치마크 데이터)
Supabase ──depends on──→ Crawling Engine (마켓 데이터 적재)
LSTM Model ──depends on──→ Benchmark Data (장르별 사전분포)
Investment Signal ──depends on──→ Bayesian Engine + Revenue Model

∴ 크리티컬 패스: 크롤링 → 벤치마크 구축 → 베이지안 모델 → 대시보드
```

---

## 8. Decision OS가 되기 위한 필수 기술 요건 체크리스트

Decision OS는 단순 대시보드가 아니라 **"투자해야 하는가?"에 대한 답을 내리는 시스템**입니다.
아래 체크리스트의 모든 항목이 충족되어야 진정한 Decision OS입니다.

### 8.1 데이터 통합 (4개 사일로 브릿징)

- [ ] **마켓 인텔리전스 수집** — 장르 벤치마크, 경쟁사 데이터, 시장 트렌드 (크롤링 엔진)
- [ ] **UA/어트리뷰션 연동** — CPI, ROAS, 채널 성과 (API 어댑터: AppsFlyer/Adjust)
- [ ] **실험 결과 수집** — A/B 테스트 ATE, 실험 메타데이터 (API 어댑터: Statsig/Firebase)
- [ ] **재무 데이터 입력 (Tier 1)** — 월 매출, UA 비용, 현금 잔액, Burn Rate, 목표 페이백 (수동 3분 입력)
- [ ] **재무 데이터 확장 (Tier 2)** — IAP/광고 분해, 게임별 비용, Gross Margin (선택적)
- [ ] **재무 데이터 자동화 (Tier 3)** — QuickBooks/Xero 연동 (Phase 3+)
- [ ] **재무 데이터 보안** — AES-256, RLS 격리, 감사 추적, 영업비밀 보호 수준

### 8.2 예측 엔진

- [ ] **Layer 1 파라메트릭 모델** — 파워로/와이블 커브 피팅 (scipy/lmfit)
- [ ] **Layer 2 LSTM 모델** — 시퀀스 예측 + MC Dropout 불확실성 (PyTorch)
- [ ] **장르별 벤치마크 밴드** — P10/P50/P90 예측 밴드 (마켓 데이터 기반)
- [ ] **점근적 도달점 탐지** — LTV 측정 가능 시점 자동 감지

### 8.3 베이지안 추론

- [ ] **사전분포 구축** — 장르 벤치마크 → 파라미터 prior (NumPyro)
- [ ] **순차적 업데이트** — D1→D7→D14→D30 관측 시 posterior 갱신
- [ ] **크레디블 인터벌** — 모든 예측에 P10/P50/P90 범위 제공
- [ ] **몬테카를로 시뮬레이션** — 투자 결과 분포 시뮬레이션

### 8.4 투자 메트릭 산출

- [ ] **LTV 계산** — Σ Retention(d) × ARPDAU(d) with 불확실성
- [ ] **페이백 기간** — CPI 회수 시점 with 확률
- [ ] **BEP 확률** — P(LTV ≥ CPI) from posterior
- [ ] **ROAS(d)** — 시점별 투자 수익률
- [ ] **Capital Efficiency** — Revenue / Total Investment
- [ ] **Burn Tolerance** — 현재 손실률 기준 런웨이

### 8.5 MMP 연동 (Silo 2 브릿징)

- [ ] **AppsFlyer Cohort API 연동** — CPI, ROAS, 코호트 리텐션 자동 수집
- [ ] **Adjust Report Service API 연동** — D120 장기 코호트 지원
- [ ] **UA 데이터 정규화** — 채널/캠페인/국가별 통합 스키마 (NormalizedUAData)
- [ ] **MMP 데이터 → Revenue Chain 연결** — CPI + Installs → Compass 리텐션 예측 → LTV/Payback

### 8.6 실험 연동 & 롤아웃 (Silo 3 브릿징)

- [ ] **Statsig Console API 연동** — ATE, 신뢰구간, 실험 결과 자동 수집
- [ ] **Firebase BigQuery Connector** — Firebase 고객 실험 데이터 수집
- [ ] **약식 실험 지원 (수동 등록)** — A/B 플랫폼 미보유 고객 대응
- [ ] **약식 실험 지원 (Pre/Post)** — CausalImpact 기반 Before-After 분석
- [ ] **약식 실험 지원 (코호트 비교)** — 자연 실험 코호트 분석
- [ ] **롤아웃 오케스트레이션** — Pull→Analyze→Decide→Act 자동 루프
- [ ] **점진적 롤아웃 결정** — 투자 가치 기반 1%→10%→50%→100% 제어

### 8.7 실험 → 투자 가치 번역

- [ ] **ATE → ΔRetention → ΔLTV 번역** — 실험 효과를 리텐션 커브 변화로 전파
- [ ] **ΔLTV → ΔRevenue → Experiment ROI** — 금전 가치 + 불확실성 전파
- [ ] **결정 신뢰도 차등 적용** — A/B(최고) > Pre/Post(중간) > 코호트 비교(낮음)
- [ ] **실험 포트폴리오 관리** — Velocity, Ship Rate × Win Rate, 누적 ΔLTV
- [ ] **컴파운딩 효과 추적** — shipped winner의 기준선 상승 → 복리 가치

### 8.8 의사결정 출력

- [ ] **투자 시그널** — Green/Yellow/Red 자동 판정
- [ ] **시나리오 시뮬레이터** — "만약 CPI가 20% 오른다면?" 실시간 응답
- [ ] **AI 추천** — 다음 행동 제안 with 결정 신뢰도
- [ ] **자연어 요약** — LLM 기반 투자 요약 리포트
- [ ] **롤아웃 추천** — 실험 Ship/Iterate/Kill + 권장 배포 비율

---

## 9. 기술 스택 전체 요약

```
┌──────────────────────────────────────────────────────────────────────┐
│                      PROJECT COMPASS TECH STACK                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FRONTEND            │  BACKEND/DATA        │  ML/STATISTICS         │
│  ─────────           │  ────────────        │  ──────────────        │
│  Next.js 15          │  Supabase            │  NumPyro (JAX)         │
│  TypeScript 5        │  PostgreSQL + RLS    │  PyTorch 2.x           │
│  FSD 2.1             │  Better Auth         │  scipy + lmfit         │
│  TanStack Query v5   │  Upstash Redis       │  FastAPI               │
│  Zustand             │  Crawlee (TS)        │  pandas + numpy        │
│  Recharts + D3       │  Playwright          │  W&B (추적)            │
│  framer-motion       │  openapi-fetch       │  causalimpact          │
│  Tailwind CSS v4     │                      │                        │
│  React Hook Form     │                      │  psycopg2              │
│                      │                      │                        │
│  SILO 2: MMP         │  SILO 3: EXPERIMENT  │  CORE IP: TRANSLATION  │
│  ──────────          │  ─────────────────   │  ────────────────────  │
│  AppsFlyer API       │  Statsig Console API │  ATE → ΔLTV → ROI     │
│  Adjust API          │  Statsig Python SDK  │  Rollout Orchestration │
│  Singular API (opt)  │  Firebase BigQuery   │  Investment Signal     │
│                      │  LaunchDarkly (opt)  │  Scenario Simulation   │
│                      │  약식: 수동등록/     │  Confidence Penalty    │
│                      │    Pre-Post/코호트   │  Compounding Tracker   │
│                      │                      │                        │
│  INFRA               │  DEVOPS              │  MARKET INTELLIGENCE   │
│  ─────               │  ──────              │  ────────────────────  │
│  Vercel              │  GitHub Actions      │  Apple RSS/iTunes API  │
│  GCP Cloud Run       │  Docker              │  GP/AS Scrapers        │
│  GCP Cloud Scheduler │  pnpm + uv           │  GameAnalytics Report  │
│  GCS                 │  Turborepo (opt)     │  Unity/AppsFlyer Idx   │
│                      │                      │  고객 데이터 (핵심)    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  Team: 2인 │ Phase 1: Module 1 MVP (8주)                             │
│  예상 비용: $180-735/월 │ 4 Silos → 1 Decision OS                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## References

- Viljanen, M. & Airola, A. (2017). "Modelling User Retention in Mobile Games."
- Gal, Y. & Ghahramani, Z. (2016). "Dropout as a Bayesian Approximation."
- Google (2015). "CausalImpact: Inferring Causal Impact using Bayesian Structural Time-Series."
- NumPyro Documentation: https://num.pyro.ai
- Crawlee Documentation: https://crawlee.dev
- Feature-Sliced Design: https://feature-sliced.design
- Better Auth: https://www.better-auth.com
- FastAPI: https://fastapi.tiangolo.com
- AppsFlyer Cohort API: https://dev.appsflyer.com/hc/reference/cohort-api
- Statsig Console API: https://docs.statsig.com/console-api
- Adjust Report Service: https://help.adjust.com/en/article/report-service-api
