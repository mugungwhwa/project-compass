# Compass Refocus Checklist + PvX Lambda UI Benchmark

작성일: 2026-04-06  
목적: 기존 Project Compass를 **UA funding readiness 중심 해석**에서 벗어나, **게임의 A/B 테스트·운영 개입·시장 반응을 LTV/투자 판단으로 번역하는 OS**로 재정렬하기 위한 실행 체크리스트.

---

## 0. 이번 리포커싱의 핵심 한 줄

### 기존 해석
- Compass = 투자 여부를 판단하는 Investment Decision OS
- 질문 = **"지금 더 투자해도 되는가?"**

### 리포커싱 후 해석
- Compass = 게임의 실험과 운영 개입을 **LTV / Payback / 투자 판단**으로 번역하는 시스템
- 질문 = **"어떤 개입이 실제로 LTV를 올렸고, 그 결과 더 투자해야 하는가?"**

### 내부 기준 문장
- **Compass turns game interventions into investment decisions.**
- **Compass is an Experiment-to-Investment Decision OS for live game teams.**
- **Compass measures whether A/B tests and live interventions are actually creating investable growth.**

---

## 1. 무엇을 유지하고 무엇을 바꿀 것인가

## 유지할 것
- 시장 데이터 + MMP + 실험 + 재무를 연결하는 기본 구조
- Bayesian prior/posterior 프레임
- Retention → LTV → Payback → Decision 구조
- ATE → ΔLTV → ROI 번역 엔진
- Decision-first UI 원칙
- 우측 사이드바 기반 레이아웃
- 5개 모듈 기반 전체 제품 구조

## 바꿀 것
- 첫 문제 인식 문구
- 랜딩/덱의 Hero 메시지
- "투자 판단"의 출발점 설명 방식
- Module 1 중심 서사 → Module 3/4 중심 서사로 재정렬
- 경쟁사 비교 프레임 (UA funding / cohort tool과의 차별화 강화)

## 크게 안 건드려도 되는 것
- 인프라
- 데이터 연결 방식
- 실험 플랫폼 연동 로직
- LTV/Payback 계산 엔진
- 리텐션 예측 모델
- DB/멀티테넌트 구조

---

## 2. 파일별 체크리스트

---

## A. `CLAUDE.md`

### 역할
프로젝트의 최상위 정체성, 문제 정의, 제품 범위, 원칙 고정 문서.

### 현재 상태 판단
- 유지 가치 높음
- 하지만 **문제 정의의 첫 문장과 제품의 출발 질문**을 바꿔야 함

### 유지
- 4개 silo 구조
- translation layer 개념
- 우리가 만들지 않는 것 목록
- Bayesian decision framework
- retention 중심 철학

### 수정 필요
- Executive definition 첫 문장
- Problem framing
- Why now narrative
- Product module ordering 설명
- 경쟁 구도 설명

### 수정 체크리스트
- [ ] One-line definition을 아래 중 하나로 교체
  - [ ] Compass is the system that turns game interventions into investment decisions.
  - [ ] Compass is an Experiment-to-Investment Decision OS for mobile game teams.
- [ ] "Can we invest more?"를 단독 첫 질문으로 두지 않기
- [ ] 첫 질문을 다음처럼 변경
  - [ ] Which experiments and live actions are actually increasing LTV?
  - [ ] Are our interventions creating investable growth?
- [ ] Problem 섹션에서 "data silos" 다음에 아래 문제 추가
  - [ ] A/B tools tell teams what won, but not whether it created investment value.
- [ ] Solution 섹션에 "ATE → ΔLTV → capital allocation" 문장 명시
- [ ] Module 설명 순서를 3/4를 더 앞세우는 방향으로 재서술
- [ ] "funding readiness"로 읽힐 수 있는 표현 제거

### 추천 교체 문장
**Before**  
Project Compass transforms Market Intelligence into Capital Allocation Intelligence.

**After**  
Project Compass transforms game interventions, experiments, and market signals into capital allocation decisions.

---

## B. `Project_Compass_Business_Plan.md`

### 역할
투자자/정부지원/외부 설명용 사업계획 핵심 문서.

### 현재 상태 판단
- 구조는 좋음
- 하지만 현재는 다소 "투자 판단 일반론"이 앞에 있고, **게임 개발 과정의 실험 가치 측정**이 뒤에 있음

### 유지
- Investment Decision OS 큰 개념
- 4 silo 문제의식
- 시장 기회
- 5개 모듈 구조
- 경쟁사 비대체 원칙

### 수정 필요
- Executive Summary
- Problem 2.3 / 2.4
- Solution 3.2 / 3.4
- Product Overview 6번대 설명 순서
- Competitive Landscape narrative

### 수정 체크리스트
- [ ] Executive Summary 첫 2문단을 "A/B test and live interventions are not translated into capital decisions" 중심으로 재작성
- [ ] Problem에 아래 항목 추가
  - [ ] Teams know experiment winners, but not investment winners.
  - [ ] Live game iteration lacks an operating system linking intervention to LTV.
- [ ] Solution에 아래 구조를 전면화
  - [ ] Intervention → Signal Change → ΔLTV → Payback Shift → Decision
- [ ] Product Overview에서 Module 3 / 4 설명을 더 길고 앞쪽으로 강조
- [ ] Module 1은 summary layer, Module 3/4는 value creation layer로 설명
- [ ] Competitive section에서 PvX/Lambda류는 "underwriting/funding intelligence"로 구분
- [ ] Compass는 "capital allocation for operators"로 정의

### 추천 문장
**Compass does not merely evaluate whether a game deserves more capital. It measures whether ongoing game interventions are creating the conditions that justify more capital.**

---

## C. `Project_Compass_Deck_v2.html`

### 역할
투자자 덱 / 외부 설명용 시각적 핵심 자산.

### 현재 상태 판단
- 디자인/구조는 강함
- 다만 초반 슬라이드가 아직 "투자 판단 일반론" 비중이 높음

### 유지
- dark mode 기반 전체 톤
- before/after 구조
- how it works 3단 구성
- product screenshot 중심 슬라이드
- competition / business model / team slide 구조

### 수정 필요
- Slide 02 Problem
- Slide 03 Solution
- Slide 04 How It Works
- Slide 07 Product
- Slide 08 Competition

### 슬라이드별 체크리스트

#### Slide 02 Problem
- [ ] 운영자의 고통을 "4개 툴"뿐 아니라 "실험 승리 ≠ 투자 가치"로 바꾸기
- [ ] 문장 추가
  - [ ] "Teams can run experiments every week, but still cannot tell which actions truly increase LTV."

#### Slide 03 Solution
- [ ] Before/After를 아래처럼 변경
  - Before: experiment results / ROAS tables / separate dashboards / meeting-based interpretation
  - After: intervention value / ΔLTV translation / capital recommendation / one operating view

#### Slide 04 How It Works
- [ ] Your Data 항목에 실험과 live actions를 더 앞세우기
- [ ] Compass AI에서 ATE → ΔLTV → decision 흐름을 더 크게 표기
- [ ] 하단 strongest proof 숫자 영역에 experiment ROI 사례 넣기

#### Slide 07 Product
- [ ] Executive Overview 하나만 크게 보이게 하지 말고
- [ ] Action Impact / Experiment Investment가 같이 보이게 product narrative 재배치

#### Slide 08 Competition
- [ ] PvX Lambda를 직접 competitor bucket으로 넣을지 검토
- [ ] 넣는다면 아래처럼 구분
  - Funding Intelligence
  - Experimentation Platform
  - Market Intelligence
  - Compass = Intervention-to-Investment OS

---

## D. `prototype_dashboard.html`

### 역할
제품 감각과 내부 앱 구조의 프로토타입.

### 현재 상태 판단
- 전체 구조는 매우 유효
- 현재도 Decision Dashboard에 가깝고 유지 가치 큼

### 유지
- Top bar
- Right sidebar
- Sticky signal card
- KPI row
- Recommendation card
- fan chart / uncertainty 표현

### 수정 필요
- Signal card 문구
- KPI 이름
- Recommendation block 문장
- navigation label 우선순위

### 체크리스트
- [ ] 메인 signal 문장을 "Invest More" 단독 표현에서 확장
  - [ ] Increase rollout
  - [ ] Scale with caution
  - [ ] Keep testing before scaling
- [ ] KPI 중 하나를 반드시 experiment value 관련 KPI로 노출
  - [ ] Experiment ROI
  - [ ] Incremental LTV
  - [ ] Winning intervention rate
- [ ] Recommendation card를 단순 투자 권고가 아니라 "next action" 중심으로 변경
- [ ] Sidebar nav에서 Actions / Experiments의 가시성 강화
- [ ] Executive Overview는 결과 요약 레이어로 유지

### 추천 KPI 세트
- Incremental LTV
- Payback Shift
- Experiment ROI
- Decision Confidence

---

## E. `Project_Compass_UI_Guide.md`

### 역할
제품 UX 원칙 정의 문서.

### 현재 상태 판단
- 거의 유지 가능
- Compass 리포커싱과 가장 잘 맞는 문서 중 하나

### 유지
- Decision-first
- Signal → Evidence → Action
- Prior vs Posterior 시각화
- right sidebar rationale
- uncertainty 표현 규칙

### 수정 필요
- Module 질문 문장
- Executive Overview의 해석
- recommendation tone

### 체크리스트
- [ ] Module 질문 재정의
  - Module 1: What is the current investment posture?
  - Module 2: Where are we heading vs market?
  - Module 3: Which actions are creating value?
  - Module 4: Are our experiments improving investability?
  - Module 5: Where should the next budget move go?
- [ ] Signal card 예시에서 "invest more" 단독 헤드라인 지양
- [ ] recommendation block 예시를 개입/롤아웃/예산이동 중심으로 교체

---

## F. `Project_Compass_Engine_Blueprint.md`

### 역할
데이터 → 예측 → 번역 → 결정 파이프라인 구현 청사진.

### 현재 상태 판단
- 핵심 유지
- 가장 적게 수정해도 되는 문서

### 유지
- INGEST / ENRICH / PREDICT / TRANSLATE / DECIDE 구조
- prior-only → layer1 → layer2 예측 구조
- financial_inputs schema
- experiment_results / translation pipeline

### 수정 필요
- 문서 상단의 goal narrative 정도
- TRANSLATE / DECIDE 단계 설명에 실험 중심 문구 추가

### 체크리스트
- [ ] 문서 앞부분에 한 줄 추가
  - [ ] This engine exists to translate interventions and experiment outcomes into investment decisions.
- [ ] DECIDE 단계에 budget reallocation language 추가
- [ ] TRANSLATE 단계 예시에 experiment-driven ΔLTV case 추가

### 비고
- 구조/DB/API 설계는 대부분 그대로 재사용 가능

---

## G. `Project_Compass_Data_Sources_Guide.md`

### 역할
데이터 소스/수집/연동 가이드.

### 현재 상태 판단
- 거의 유지

### 유지
- Apple RSS / iTunes / Google Play
- 공개 benchmark prior
- AppsFlyer / Adjust / Statsig 연동 구조
- legal-safe source hierarchy

### 수정 필요
- 데이터 사용 목적 설명 문장

### 체크리스트
- [ ] "왜 이 데이터를 수집하는가"를 아래처럼 재정의
  - [ ] to evaluate intervention impact against market and benchmark context
- [ ] 실험 데이터 importance 문장 강화
- [ ] MMP/cohort data는 'funding readiness'가 아니라 'intervention effectiveness under market conditions' 맥락으로 기술

---

## H. `Project_Compass_Tech_Stack.md`

### 역할
시스템 아키텍처 / 역할 분리 / 기술 스택 정의.

### 현재 상태 판단
- 대부분 유지

### 유지
- Next.js / FastAPI / Supabase / Cloud Run / NumPyro / PyTorch
- 멀티테넌트 구조
- external platform bridge philosophy

### 수정 필요
- architecture diagram 상단 product narrative
- module 설명 문장

### 체크리스트
- [ ] 상단 정의를 experiment-to-investment 방향으로 수정
- [ ] widgets/examples에 Experiment ROI / Action Impact prominence 강화
- [ ] overview module을 summary layer로 설명

---

## I. `Project_Compass_Deck_Redesign_Guide.md`

### 역할
덱 제작 가이드라인.

### 현재 상태 판단
- 전면 폐기 불필요
- 일부 슬라이드 목적 수정 필요

### 체크리스트
- [ ] Slide 02 Problem 문구 교체 지시 추가
- [ ] Slide 04에 ATE → ΔLTV → Investment translation 강조
- [ ] Slide 07 product screenshot에서 Experiments / Actions 노출 지시 추가
- [ ] Slide 08 competitor framing에 funding intelligence category 추가

---

## J. `CONTEXT_INDEX.md`

### 역할
프로젝트 상태 인덱스.

### 현재 상태 판단
- 최소 수정만 필요

### 체크리스트
- [ ] 프로젝트 한 줄 요약 교체
- [ ] 덱/사업계획 관련 문서 설명에 "experiment-to-investment" 반영
- [ ] Module 4와 Module 3를 더 중요한 읽기 entry point로 표시

---

## K. `Project_Compass_Legal.md`

### 역할
법적 데이터 수집 / 연동 기준 문서.

### 현재 상태 판단
- 거의 유지

### 체크리스트
- [ ] 수정 불필요에 가깝다
- [ ] 단, 대외 포지셔닝 문구에서 funding intermediary로 오해받지 않게 주석 추가 가능

---

## 3. 우선순위 실행 순서

### 1순위: 정체성/대외 메시지
1. `CLAUDE.md`
2. `Project_Compass_Business_Plan.md`
3. `Project_Compass_Deck_v2.html`
4. `Project_Compass_Deck_Redesign_Guide.md`

### 2순위: 제품 UX 문구
5. `prototype_dashboard.html`
6. `Project_Compass_UI_Guide.md`
7. `CONTEXT_INDEX.md`

### 3순위: 기술 문서 문장 정리
8. `Project_Compass_Engine_Blueprint.md`
9. `Project_Compass_Tech_Stack.md`
10. `Project_Compass_Data_Sources_Guide.md`

### 4순위: 점검용
11. `Project_Compass_Legal.md`

---

## 4. PvX Lambda에서 참고할 UI 흐름

중요: **복제 금지, 구조 참고만**

PvX Lambda는 공개 랜딩 기준으로 아래 흐름을 갖는다.

1. Hero: 제품 이름 + 짧은 가치 제안 + CTA
2. Feature block: 핵심 기능 4개
3. Product explanation: decision hub 설명
4. Demo/interactive section
5. Data trust / integrations
6. Social proof / authority
7. Conversion CTA

### Compass에 가져올 수 있는 것
- 짧은 hero headline + subheadline 구조
- 기능 4카드 구조
- 제품 preview를 중간에 넣는 방식
- integration / trust section 강조
- CTA 반복 구조

### Compass가 그대로 따라하면 안 되는 것
- funding readiness 느낌
- financing application funnel 중심 설계
- operator tool보다 lender tool처럼 보이는 카피
- cohort underwriting 중심 정보 구조

---

## 5. PvX Lambda UI 흐름을 Compass에 맞게 변환하는 법

## Hero
### PvX식
- Get Access
- Watch How it Works
- funding/decision utility 강조

### Compass식 변환
- Headline: **Change how game capital gets allocated**
- Sub: **Measure which experiments and live actions actually increase LTV — then decide where to invest next**
- CTA 1: **See Demo**
- CTA 2: **Explore Decision System**

---

## Feature cards
### PvX식
- Validated Cohort Data
- Continuous Funding Assessment
- Deterministic ROAS Benchmarks
- Reliable Financial Forecasting

### Compass식 변환
- **Experiment ROI Translation**
- **Action Impact Timeline**
- **Market-to-Game Gap**
- **Capital Reallocation Guidance**

---

## Product preview section
### PvX식
- decision making hub 소개

### Compass식 변환
- Executive Overview는 요약 패널로만 제시
- 반드시 **Action Impact / Experiment Investment / Capital Console**도 같이 노출
- 제품이 "투자 판정판"이 아니라 "실험-개입 운영 시스템"처럼 보이게 구성

---

## Data trust section
### PvX식 참고 포인트
- 신뢰 가능한 cohort
- data lake / integration

### Compass식 변환
- AppsFlyer / Adjust / Statsig / Databricks / Finance Inputs 연결
- Prior vs Posterior 시각화
- "Not another dashboard" 문장
- "Evidence for capital decisions" 강조

---

## CTA section
### PvX식
- Apply / Get Access / Download Guide

### Compass식 변환
- **Request Demo**
- **See Product Walkthrough**
- **Get the Intervention-to-LTV Guide**

---

## 6. Compass 랜딩 추천 IA (정보구조)

## Section 1. Hero
- What Compass is
- 2 CTA
- 오른쪽에 dashboard preview

## Section 2. Problem
- 4 silo cards
- + "experiments do not automatically become investment evidence"

## Section 3. What Compass Does
- Intervention → Signal Change → ΔLTV → Decision
- before/after 구조

## Section 4. Product Modules
- Executive Overview
- Actions
- Experiments
- Capital

## Section 5. Why Teams Trust It
- integrations
- benchmark + posterior
- uncertainty honesty

## Section 6. What You Can Decide
- Which test to roll out
- Whether to scale UA
- Whether to increase content/live ops spend
- Where the next budget shift should go

## Section 7. CTA
- Request Demo
- Get Guide

---

## 7. Claude Code 작업 지시용 요약 프롬프트

아래 문장을 Claude Code 작업 지시의 기본 문장으로 사용 가능.

```md
Compass is not a UA funding readiness tool.
Compass is an Experiment-to-Investment Decision OS for live game teams.

Keep the infrastructure, data pipelines, Bayesian retention/LTV engine, and experiment translation architecture.
Refocus the product narrative, landing structure, deck messaging, and module emphasis around this core question:

Which game interventions and A/B tests are actually increasing LTV, and does that justify more investment?

Prioritize Action Impact and Experiment Investment over generic funding language.
Use PvX Lambda only as a benchmark for landing-page flow, feature-card compression, trust/integration sections, and CTA sequencing.
Do not make Compass look like a lender or underwriting platform.
```

---

## 8. 최종 결론

### 한 줄 결론
전부 갈아엎는 것이 아니라,

- **기술 / 데이터 / 모델 / 인프라 = 대부분 유지**
- **문제 정의 / 외부 메시지 / 슬라이드 / 랜딩 / 모듈 강조 순서 = 크게 수정**

### 실제 체감 비율
- 하부 구조 변경: 10~20%
- 상부 메시지/표현 변경: 50~70%

즉, **인프라는 유지하고 서사를 재정렬하는 프로젝트**로 보는 것이 맞다.
