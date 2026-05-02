# yieldo — Technical Moat & Pipeline

**Version**: 0.2 (draft — §0–4·§6·§7·§9 본문 완료 / §5·§8 의도적으로 lean)
**Date**: 2026-05-02
**Classification**: Internal — pre-investor / pre-government-program review
**Purpose**: 흩어져 있는 기술적 IP·파이프라인·해자 논리를 단일 문서로 통합. 외부(투자자, 예비창업패키지 심사위원)와 내부(신규 합류자, 영업) 양쪽이 같은 source-of-truth를 참조하기 위함.

---

## 0. Document Purpose & Credibility Tiers

### 0.1 이 문서가 존재하는 이유

yieldo의 기술적 자산은 현재 7개 문서에 분산되어 있다 (CLAUDE.md, Project_Yieldo_Tech_Stack, Engine_Blueprint, Data_Sources_Guide, Data_Architecture, Data_Policy, Legal). 각 문서가 자기 영역에서는 정확하나, **"yieldo의 진짜 해자는 무엇인가?"** 라는 단일 질문에 답하려면 문서 사이를 건너다녀야 한다. 이 분산은 외부 평가자(심사위원, 투자자, 잠재 고객)에게 *무게감의 누수*로 작동한다.

본 문서는 그 누수를 막는다.

### 0.2 신뢰등급 (Credibility Tiers)

이 문서를 읽는 사람은 모든 주장을 동일한 신뢰등급으로 받아들이기 쉽다. 그것을 막기 위해 각 섹션에 **신뢰등급**을 명시한다:

| Tier | 의미 | 해당 섹션 |
|---|---|---|
| **T1: 과학적 사실** | 코드 구현 여부와 무관하게 참. 학계·산업 데이터로 외부 검증 가능 | §2 (Scientific Foundation) |
| **T2: 수학적 결정성** | 입력이 있으면 결과가 유일하게 결정됨. 모델 자유도 = 0 | §3 (Inference Engine) |
| **T3: 아키텍처 설계** | 합리적이고 일관된 청사진. 일부 구현, 일부 미구현 | §4–5 (Pipeline + Stack) |
| **T4: 운영 현황** | 현재 시점의 실제 코드·데이터·배포 상태 | §8 (Implementation Status) |

T1-T2는 "yieldo가 만들어지든 안 만들어지든 진실"이고, T3는 "구현 진행 중", T4는 "오늘 현재의 사실"이다. 이 구분이 흐려지면 본 문서는 마케팅 자료가 되고, 분명하면 기술 백서가 된다.

### 0.3 본 문서와 다른 문서의 관계

| 본 문서 섹션 | 1차 출처 | 보완 출처 |
|---|---|---|
| §2 Scientific Foundation | CLAUDE.md §3 (Retention Theory) | Viljanen & Airola 2017 외 학술 논문 |
| §3 Inference Engine | CLAUDE.md §4–6, §8.1–8.2 | Project_Yieldo_Engine_Blueprint.md |
| §4 Data Pipeline | CLAUDE.md §2.2, §8.5–8.6 | Project_Yieldo_Data_Sources_Guide.md, Data_Architecture.md |
| §5 Technology Stack | CLAUDE.md §8 | Project_Yieldo_Tech_Stack.md |
| §6 End-to-End Pipeline | (이 문서 신규 통합) | 모든 위 문서 |
| §7 Competitive Moat | CLAUDE.md §10, §1.3 | Project_Yieldo_Business_Plan.md |
| §8 Implementation Status | (이 문서 신규 감사) | yieldo/ 코드베이스 직접 검사 (2026-05-02) |
| §9 Source Mapping | (이 문서 자체) | — |

---

## 1. Executive Summary

### 1.1 한 문장 정의

**yieldo는 모바일게임의 실험·운영·시장 신호를 *자본배분 결정*으로 번역하는 결정 운영체제(Decision Operating System)다.** 분석 도구가 아니다. 운영자의 단 하나의 질문 — *"Should we invest more?"* — 에만 답한다.

### 1.2 일곱 개의 해자 (Seven Moats)

| # | 해자 | 신뢰등급 | 설명 (한 줄) |
|---|---|---|---|
| 1 | **이론 권위** (Theory Authority) | T1 | 5대 리텐션 성질을 2021년 내부 정식화 → 2017–2024 학계가 사후 검증. 슬로프 기반 예측 + 점근선 도착 검출까지 결합한 통합 프레임워크는 학술 문헌에 packaged form으로 존재하지 않음 |
| 2 | **수학적 폐쇄성** (Mathematical Closure) | T2 | 멱법칙 retention curve + 단조수렴정리(monotone convergence) 로 점근선 floor 존재가 수식적으로 보장됨. LTV 적분 종점이 임의가 아니라 *수학적으로* 정의됨 |
| 3 | **Bayesian 결정 프레임워크** | T2 | 시장 prior + 내부 likelihood → posterior 라는 구조적 강제. 점추정 출력을 아키텍처 레벨에서 금지하면 환각 표면적이 0에 수렴 |
| 4 | **ATE → ΔLTV → ΔIRR 결정론적 번역** | T2 | 실험 결과 → 자본 영향 변환은 결정론적 적분. LLM이 메울 자리가 구조적으로 없음 — 환각 불가능 영역 |
| 5 | **Bayesian 네트워크 효과** | T3 | 고객 데이터가 누적될수록 장르별 prior 정밀도가 ↑. 시간이 흐를수록 정확도가 복리로 강해지는 자가 강화 해자 |
| 6 | **카테고리 창출** (Category Creation) | T3 | "Capital Allocation Intelligence"는 현재 카테고리로 존재하지 않음. Sensor Tower / Statsig / AppsFlyer 위에 앉아 *번역 레이어* 라는 새 좌표계를 정의 |
| 7 | **정직성 포지셔닝** (Honesty as Asset) | T3 | 사내 BI팀(가장 큰 경쟁자)은 임원 압박 때문에 점추정으로 회귀하는 조직 역학에 갇혀 있음. 외부 SaaS만이 "모르는 것을 모른다고 말하는" 디자인을 상품화 가능 |

### 1.3 카피 가능한 것 vs 카피 불가능한 것

| 카피 가능 | 카피 불가능 |
|---|---|
| NumPyro / scipy / LSTM 코드 (오픈소스) | 5대 성질을 운영 결정과 결합한 packaged framework |
| 4개 사일로 API 통합 (시간문제) | 첫 발견자 권위 (2021 정식화) |
| Recharts P10/P50/P90 시각화 | "불확실성을 제품 UX로 강제"하는 디자인 결정의 운영 효과 |
| Capital allocation dashboard UI | 카테고리 정의를 통해 만든 reframing 자체 |

진짜 해자는 **(1) Theory authority + (4) Translation determinism + (7) Honesty positioning** 의 결합이다. 이 셋이 동시에 존재하는 회사는 현재 시장에 없다.

---

## 2. Scientific Foundation (T1: 과학적 사실)

> **신뢰등급 T1**: 본 섹션의 모든 주장은 yieldo 코드 구현 여부와 무관하게 참이며, 외부 학술 문헌 또는 산업 벤치마크 데이터로 검증 가능하다.

### 2.1 왜 리텐션이 중심 변수인가

모바일게임의 모든 경제적 흐름은 결국 리텐션을 통과한다:

```
Retention(t) → DAU(t) → ARPDAU(t) → Daily Revenue(t) → LTV → Payback → 투자 결정
```

리텐션은 다음을 동시에 결정한다:
- DAU 지속성 (얼마나 오래 활성 사용자가 남는가)
- LTV 천장 (한 사용자에게서 얼마나 오래 매출을 추출 가능한가)
- 회수 시점 (광고비를 언제 회수하는가)
- 추가 투자의 정당성 (자본 추가 투입이 합리적인가)

따라서 **리텐션을 예측할 수 있다면, 투자 결과를 예측할 수 있다**. 이것이 yieldo가 retention을 단일 코어 변수로 채택한 이유다.

### 2.2 다섯 가지 리텐션 성질 (Five Retention Properties)

2021년 모바일게임 포트폴리오 운영 경험에서 정식화된 다섯 성질. 이후 학술 문헌(Viljanen & Airola 2017, GameAnalytics 2024 벤치마크, Deconstructor of Fun 2020) 과 교차 검증되었다.

#### Property 1 — Monotonic Non-Increase (단조 비증가)

> 코호트 리텐션은 N일차에 N-1일차의 값을 초과할 수 없다.

- **정식화**: Cohort retention $R(t)$ where $R(t) = |\{u \in C : u\text{ active at }t\}| / |C|$ for cohort $C$ at $t = 0$. By definition, the active subset can only shrink: $R(t+1) \leq R(t)$.
- **수학적 위상**: 코호트 리텐션의 정의로부터 자동 도출. 정리(theorem)가 아니라 정의(definition)의 직접 결과.
- **주의**: Re-engagement 캠페인은 "rolling retention" 측정에서 일시적 위반을 만들 수 있다. P1은 표준 코호트 리텐션 정의에서 성립하며, rolling metric에서는 별도 처리 필요.

#### Property 2 — Sequential Dependency (순차 의존성)

> 매일의 리텐션은 직전일의 리텐션 상태로부터 영향을 받는다.

- **이론적 대응**: Markov chain / Hidden Markov Model 프레임워크와 일관 (Rothenbuehler et al. 2015).
- **개선점 (학계 보강)**: 1차 Markov 근사는 유용하지만 단순화. Jang et al. (2021) — 3-7일 윈도우의 행동 특징이 더 강한 예측력 제공.
- **운영 함의**: D[n+1]/D[n] 일별 비율 자체가 미래에 대한 예측 정보를 운반한다. 이것이 §2.4 슬로프 기반 예측의 수학적 토대다.

#### Property 3 — Temporal Decrease (시간적 감소)

> 리텐션은 시간이 지남에 따라 감소한다 (population-level regularity).

- **외부 검증**: GameAnalytics 2024 벤치마크 — 수천 게임 중앙값 D1=22.91%, D7=4.2%, D28=0.85%. 보편적으로 관찰됨.
- **메커니즘**: 사용자 모집단은 이질적(heterogeneous). 저참여 사용자가 먼저 이탈 → 점차 더 참여도 높은 잔존 풀(survivor pool)로 필터링.

#### Property 4 — Decelerating Decline (감속 감소)

> 리텐션 감소율은 시간이 지남에 따라 *느려진다*.

- **이론적 대응**: 생존분석의 "decreasing hazard rate" 개념과 직접 대응 (Viljanen & Airola 2017).
- **수학적 근거**: 멱법칙 모델 $R(t) = a \cdot t^b$ ($b < 0$) 에서 $\frac{dR}{dt} = a \cdot b \cdot t^{b-1}$ 는 $t$ 가 커질수록 0에 수렴하는 음수. 즉 $|dR/dt| \to 0$.
- **메커니즘**: 자기선택 효과(self-selection). D7, D14, D30 같은 임계 시점을 통과한 사용자는 근본적으로 일별 이탈 확률이 낮음.

#### Property 5 — Asymptotic Stabilization (점근선 안정화)

> P1(단조 비증가) + P4(감속 감소) → 리텐션 곡선은 수평 floor에 점근적으로 접근한다.

- **수학적 보장**: **단조수렴정리 (Monotone Convergence Theorem)**. 단조감소이며 하한(0)이 있는 함수는 수렴한다. 즉 $\lim_{t \to \infty} R(t) = c$ 가 존재 (where $c \geq 0$ is the asymptotic floor).
  - *주: CLAUDE.md §3.2에서 "squeeze theorem"으로 표기되었으나, 정확한 정리명은 단조수렴정리(monotone convergence theorem)다. 본 문서에서 정정.*
- **외부 검증**: Deconstructor of Fun (2020) — "the retention curve flattens out" in D30-D60 window. GoPractice — "for a number of products, the retention curve plateaus."
- **운영적 의미**: Floor $c$ 는 게임의 **코어 사용자 기반(core user base)**. 장기 매출이 추출되는 안정 모집단.

### 2.3 점근선 도착이 LTV 측정의 관문인 이유

LTV 계산은 다음 적분이다:

$$\text{LTV} = \int_0^T R(t) \cdot \text{ARPDAU}(t) \, dt$$

여기서 $T$ 는 적분 종점이다. $T$ 가 임의로 정해지면 LTV도 임의로 변한다. **점근선 도착(asymptotic arrival)**은 이 종점을 *수학적으로* 정의해준다:

| 시점 | LTV 추정 신뢰도 | 투자 결정 가능성 |
|---|---|---|
| 점근선 도착 *이전* | 낮음 — 매일 데이터가 LTV를 크게 변화시킴 | 고불확실성 |
| 점근선 도착 *이후* | 높음 — 잔존 tail이 모델로 예측 가능 | 정량화된 신뢰도로 결정 가능 |

이것이 점근선 도착점이 단순한 분석적 호기심이 아니라 **합리적 자본배분의 관문**인 이유다.

### 2.4 수학적 프레임워크 — 모델 선택

리텐션 곡선의 1차 모델은 멱법칙(power law decay):

$$R(t) = a \cdot t^b, \quad b \in (-1, 0)$$

이 모델이 P1-P5를 모두 만족함을 보일 수 있다:

| Property | 멱법칙에서의 도출 |
|---|---|
| P1 (단조 비증가) | $b < 0$ 이므로 $R'(t) < 0$ |
| P2 (순차 의존성) | $R(t+1)/R(t) = ((t+1)/t)^b$ 가 진행에 따라 변화하는 구조 |
| P3 (시간적 감소) | $b < 0$ 이므로 $R(t)$ 감소 |
| P4 (감속 감소) | $|R''(t)| < |R'(t)|$ 인 구간에서 deceleration 성립 |
| P5 (점근선) | $R(t) \to 0^+$ as $t \to \infty$ |

코어 참여도가 강한 게임은 **shifted power law**로 더 잘 적합된다:

$$R(t) = a \cdot t^b + c, \quad c > 0$$

여기서 $c$ 는 §2.2 P5의 점근선 floor 자체. 검증된 대체 모델:

- Shifted exponential: $R(t) = a \cdot e^{-bt} + c$
- Weibull survival: $R(t) = e^{-(t/\lambda)^k}$
- Log-linear: $R(t) = a - b \log(t)$

**핵심 참고문헌**:
- Viljanen & Airola (2017), "Modelling User Retention in Mobile Games", IEEE CIG
- Valeev (2018), "How to Make Retention Model and Calculate LTV for Mobile Game"
- Viljanen et al. (2016), "User Activity Decay in Mobile Games"

### 2.5 슬로프 기반 예측 방법론 (Slope-Based Prediction)

yieldo의 차별화된 방법론은 D2-D7 의 *기울기*를 장르 벤치마크 *밴드의 기울기*와 정합시키는 것이다. 학술 문헌에 packaged form으로 존재하지 않는 통합 절차.

#### Phase 1 — Benchmark Construction
1. App intelligence 플랫폼 또는 공공 벤치마크 리포트에서 D1/D2/D3/D4/D5/D6/D7/D14/D30 리텐션 수집
2. 장르(Puzzle, Casual, RPG, Strategy 등) × 성과 등급(예: Top Gross 50)으로 세그먼트
3. 각 타이틀에서 일별 리텐션 비율 D[n+1]/D[n] 계산
4. 장르-등급 조합별 P10/P50/P90 예측 밴드 구축

#### Phase 2 — Retention Curve Interpolation
직접 벤치마크 데이터가 없는 일자(D8-D13, D15-D29)를 채움:

$$R(d) = R(d_{\text{prev}}) - \frac{R(d_{\text{prev}}) - R(d_{\text{next}})}{d_{\text{next}} - d_{\text{prev}}}$$

P4 (감속 감소) 제약을 부여한다: 일별 감소가 deceleration 패턴을 따라야 함.

#### Phase 3 — Slope-Based Projection
1. D1 리텐션 관측 → 장르 벤치마크로 전체 예측 밴드 생성
2. D2-D7 데이터 도착 → 관측 기울기를 예측 밴드 기울기와 비교
3. 관측 기울기가 예측 밴드 안에 들어가면 → 해당 장기 projection 채택
4. **D7 데이터만으로 D30/D60/D180 리텐션을 장르 특정 밴드 안에서 투영 가능**

#### Phase 4 — Asymptotic Arrival Detection
조기 안정화 게임의 특수 처리:
- D2-D6 기울기가 얕음 (작은 일별 감소) → 조기 점근선 도착 감지
- 기울기 순위와 예측 밴드 순위를 교차 비교
- 정합되면 직접 채택, 분기되면 §2.6 조정 규칙 적용

### 2.6 예측 조정 규칙 (Slope ↔ Band Alignment Rules)

밴드 위치와 점근선 도착 속도가 분기할 때:

| 예측 밴드 위치 | 점근선 도착 속도 | 결정 |
|---|---|---|
| 하위 등급 | 조기 도착 (빠른 안정화) | **상위 등급** 채택 — 낮은 초기 리텐션에도 *조기 안정화*는 강한 코어 참여를 의미 |
| 상위 등급 | 후기 도착 (느린 안정화) | **하위 등급** 채택 — 높은 초기 리텐션에도 *느린 안정화*는 약한 코어를 의미 |
| 정합 | 정합 | 직접 채택 — 일관된 신호는 신뢰도를 높임 |

이 규칙의 통찰: **곡선의 단일 데이터 포인트보다 모양(shape)이 더 중요하다**. 이것이 패턴 인식 기반 운영 IP의 핵심이며, 학술 문헌이 아닌 실제 포트폴리오 운영 경험에서만 도출 가능한 휴리스틱이다.

### 2.7 검증 매트릭스 (Validation Matrix)

| 주장 (Claim) | 상태 | 근거 |
|---|---|---|
| P1-P5 다섯 성질 | ✓ Confirmed | Viljanen & Airola 2017; GameAnalytics 2024; Deconstructor of Fun 2020 |
| 멱법칙 모델 적합 | ✓ Confirmed | Valeev 2018; Viljanen et al. 2016 |
| D7 → D180 예측력 (장르 stratified) | ✓ Confirmed (제한적) | ~50% variance explained — 장르 통제 필수 |
| D30 → D180 예측력 | ✓ Confirmed | ~80% variance explained |
| 슬로프 기반 밴드 예측 (방법론) | ✓ Confirmed | D[n+1]/D[n] 비율 안정성 학술 문헌과 일관 |
| 점근선 floor 존재 (top-grossing) | ✓ Confirmed | GoPractice; Deconstructor of Fun; GameAnalytics |
| 슬로프-밴드 분기 조정 규칙 | △ Internal IP | yieldo 운영 경험에 근거. 학술 packaged form 없음 |

**핵심 한계 (정직 표시)**: 장르 stratification 없는 무차별 D7→D180 예측은 부족하다. 장르 통제는 필수 전제 조건이다.

---

## 3. Inference Engine (T2: 수학적 결정성)

> **신뢰등급 T2**: 본 섹션의 변환은 결정론적이거나 확률적으로 잘 정의된다. 입력이 동일하면 결과가 유일하게 결정되거나, 명확한 확률 분포로 출력된다. 모델 자유도는 0이며, *환각이 들어올 구조적 자리가 없다*.

### 3.1 Bayesian 결정 프레임워크

#### 3.1.1 핵심 등식

$$\underbrace{P(\theta)}_{\text{Prior}} \times \underbrace{P(D | \theta)}_{\text{Likelihood}} \propto \underbrace{P(\theta | D)}_{\text{Posterior}}$$

| 구성 요소 | yieldo에서의 의미 | 데이터 출처 |
|---|---|---|
| **Prior** $P(\theta)$ | 시장 인텔리전스로 구성한 사전 분포 | 장르별 리텐션 벤치마크, 경쟁 성과 분포, 시장 포화 신호, 채널·지역별 UA 비용 추세 |
| **Likelihood** $P(D \| \theta)$ | 내부 관측 데이터의 조건부 확률 | 실제 코호트 리텐션 곡선, UA 성과 및 CPI, 실험 결과(ATE), 라이브 운영 영향, 매출·재무 실적 |
| **Posterior** $P(\theta \| D)$ | 정량화된 불확실성을 가진 투자 결정 분포 | 회수 확률 $P(\text{payback} \leq T)$, 신뢰구간이 있는 기대 LTV, 자본 효율 점수, 결정 신뢰도 |

#### 3.1.2 왜 Bayesian이고 frequentist 가 아닌가

| 측면 | Frequentist (전통적 분석) | Bayesian (yieldo) |
|---|---|---|
| 출력 | 점추정 ("D30 = 8.5%") | 신뢰구간 ("D30 ∈ [7.2%, 10.1%], 90% credible") |
| 거짓 정밀 | 점추정은 정밀해 *보임* | 신뢰구간은 모름을 명시 |
| 초기 데이터 | 노이즈에 과적합 위험 | Prior가 과적합 방지 |
| 데이터 누적 | 모델 갱신이 ad-hoc | Posterior 업데이트가 수학적으로 정의됨 |
| 위험 인지 | 불확실성이 숨겨짐 | 불확실성이 일급 객체 |

투자 결정에서 이 차이는 결정적이다. **점추정은 잘못된 자신감을 만든다**. 신뢰구간은 위험 인지 자본배분을 가능케 한다.

#### 3.1.3 Belief Update 사이클

```
Day 0:  Prior  = 장르 벤치마크 분포
         ↓
Day 1:  D1 관측 → Posterior 갱신
         ↓
Day 3:  D3 관측 → Posterior 추가 좁힘
         ↓
Day 7:  D7 관측 → Posterior 유의미하게 좁아짐
         ↓
Day 14: D14 관측 → 고신뢰 Posterior
         ↓
Day 30: D30 관측 → 경계가 분명한 투자 결정
```

각 관측이 Posterior를 좁힌다. 시장 수준 불확실성이 점진적으로 게임 특정 투자 확신으로 변환된다.

### 3.2 Dual-Layer Prediction (이중 레이어 예측)

데이터 가용성 lifecycle을 거울처럼 반영하는 두 층 시스템.

#### 3.2.1 Layer 1 — 모수적 리텐션 모델 (Early-Stage)

| 특성 | 값 |
|---|---|
| 적용 시점 | 소프트 런칭, D1-D7 데이터 가용 |
| 방법 | 멱법칙 곡선 적합 + 장르 stratified 벤치마크 밴드 |
| 토대 | §2.2 5대 성질 + §2.5 슬로프 기반 방법론 |
| 출력 | 장르 prior 신뢰구간을 가진 리텐션 예측 밴드 |
| 장점 | 최소 데이터로 작동. 해석 가능. 빠름 |
| 구현 | `scipy.optimize.curve_fit` + `lmfit` (Python) |

#### 3.2.2 Layer 2 — LSTM 딥러닝 모델 (Scale-Stage)

| 특성 | 값 |
|---|---|
| 적용 시점 | D14+ 데이터, 충분한 코호트 볼륨 |
| 방법 | Sequence-to-sequence LSTM with attention |
| 입력 | 코호트 리텐션 시퀀스 + 장르 벤치마크 + UA 채널 믹스 + 시장 신호 |
| 아키텍처 | 2× LSTM (128 units) → Attention → Bayesian head (Monte Carlo dropout) |
| 출력 | D60-D365 리텐션 with P10/P50/P90 신뢰구간; 사용자별 churn 확률 |
| 장점 | 비선형 행동 패턴 포착. 개인 수준 예측. 라이브 운영 적응 |

#### 3.2.3 두 레이어는 경쟁이 아니라 보완

- Layer 1이 시장 벤치마크 + 리텐션 이론으로부터 **Bayesian prior** 제공
- Layer 2가 내부 행동 데이터 누적에 따라 **posterior**를 정밀화
- Layer 1 → Layer 2 전환은 데이터 충분성에 기반한 *점진적이고 자동적*인 과정 (절단 transition 아님)

### 3.3 Revenue Chain (매출 사슬)

```
UA 지출 → ÷ CPI → Installs → × Retention(d) → DAU → × ARPDAU(d) → Daily Revenue(d)
```

#### 3.3.1 코어 등식

$$\text{Daily Revenue}(d) = \sum_{c \in \text{cohorts}} \text{Installs}_c \times R_c(d) \times \text{ARPDAU}(d)$$

각 변수는 불확실성을 가지고 forecast된다:

| 변수 | 모델링 |
|---|---|
| **CPI** | 채널별 관측 + 추세 외삽 |
| **Retention(d)** | LSTM 예측 + Bayesian 신뢰구간 (Layer 2) 또는 멱법칙 (Layer 1) |
| **ARPDAU** | IAP 매출 + 광고 매출로 분해. payer 전환율과 spend depth 모델링 |

#### 3.3.2 LTV 계산 (적분 형태)

$$\text{LTV} = \int_{0}^{T^*} R(t) \cdot \text{ARPDAU}(t) \, dt$$

- $T^*$ = §2.3에서 정의한 점근선 도착점. 곡선이 충분히 안정화되어 적분이 *경계 잡힌 오차*로 수렴하는 시점.
- 이산 형태: $\text{LTV} = \sum_{d=1}^{T^*} R(d) \cdot \text{ARPDAU}(d)$

**핵심 통찰**: $T^*$ 가 임의가 아니라 §2.5 점근선 검출 알고리즘으로 *수학적으로 결정*된다. 이것이 yieldo의 LTV 추정이 다른 도구의 LTV 추정과 구조적으로 다른 이유다.

### 3.4 ATE → Investment Translation (실험-투자 번역)

기존 실험 플랫폼은 통계 결과를 보고한다: *"Treatment improved D7 retention by +3.7pp (p < 0.05)"*

yieldo는 이를 투자 언어로 번역한다:

```
ATE (Average Treatment Effect)
   ↓ §3.2 Layer 1/2 모델 적용
ΔRetention(d) ∀ d
   ↓ §3.3 LTV 적분 재계산
ΔLTV per user
   ↓ × 예상 user volume
ΔAnnual Revenue
   ↓ Δ(투자비용 회수 시점)
ΔPayback Period
   ↓ NPV = 0 풀이
ΔIRR
   ↓ ÷ Experiment Cost
Experiment ROI
```

#### 3.4.1 왜 환각이 불가능한가

이 사슬의 각 화살표는 *결정론적 변환* 또는 *잘 정의된 확률 모델*이다:

| 변환 | 종류 | 모델 자유도 |
|---|---|---|
| ATE → ΔRetention(d) | Layer 1/2 모델 평가 | 모델 파라미터로 결정 |
| ΔRetention(d) → ΔLTV | 적분 (수치) | 0 (입력 함수가 정해지면 결과 유일) |
| ΔLTV → ΔAnnual Revenue | 곱셈 (스칼라) | 0 |
| ΔAnnual Revenue → ΔPayback | 누적합 임계점 | 0 |
| ΔPayback → ΔIRR | NPV = 0 풀이 (수치 근) | 0 (수렴하면 유일근) |

LLM이 자유롭게 채울 자리가 *구조적으로* 없다. 각 화살표는 수치 연산이며, 입력이 같으면 출력이 같다. **이 결정성이 yieldo의 환각 면역 코어**다.

#### 3.4.2 실험 포트폴리오 = 투자 포트폴리오

yieldo는 실험 기능을 R&D 비용 센터가 아닌 **투자 포트폴리오**로 reframe한다:

| 메트릭 | 의미 |
|---|---|
| Experiment Velocity | 자본 효율적 학습의 속도 |
| Ship Rate × Win Rate | R&D 지출의 제품 가치 전환율 |
| Cumulative ΔLTV | 출시된 승자들로부터의 총 증분 가치 |
| Experiment ROI | 실험 투자의 수익률 |
| Learning Efficiency | 실험 1달러당 지식 가치 (실패 포함) |
| Time-to-Decision | 증거 기반 자본 재배분 속도 |

#### 3.4.3 복리 효과 (Compounding)

실험 가치는 복리로 누적된다:
- 출시된 승자 1개 → 리텐션·매출 baseline 영구 개선
- 개선된 baseline → 후속 실험이 더 큰 사용자 풀에서 작동 → 가치 ↑
- 실험 사이클 가속 → 가치 창출 속도 ↑
- 결과: **조직 학습 속도 = 자본 효율의 측정 가능한 경쟁 해자**

### 3.5 Uncertainty Enforcement (불확실성 강제)

본 섹션은 yieldo가 다른 모든 BI/분석 도구와 *구조적으로* 다른 핵심 이유다.

#### 3.5.1 점추정 출력 금지 (Architecture-Level Prohibition)

```
❌ 금지:    "D30 retention = 8.5%"
❌ 금지:    "LTV = $4.2M"
❌ 금지:    "Recommended UA spend: $500K"

✓ 강제:    "D30 retention ∈ [7.2%, 10.1%], 90% CI, 신뢰등급 B"
✓ 강제:    "LTV ∈ [$3.1M, $5.8M], 90% CI, 신뢰등급 B (D14 데이터 부족)"
✓ 강제:    "UA $500K 권고, 결정 신뢰도 0.74 / 1.00"
```

이것은 UI 디자인 선택이 아니라 **API 레벨의 강제**다. 점추정을 반환하는 endpoint 자체를 시스템에 두지 않는다. 환각의 표면적이 0에 수렴한다.

#### 3.5.2 신뢰등급 시스템

| 등급 | 의미 | 트리거 조건 |
|---|---|---|
| A | 고신뢰 — 결정 권고 가능 | D30+ 데이터, posterior 변동 < 5% |
| B | 중신뢰 — 결정 가능하나 모니터링 권장 | D14+ 데이터, posterior 변동 5-15% |
| C | 저신뢰 — prior dominant | D7 미만 또는 cohort 볼륨 부족 |
| - | 데이터 없음 | 의사결정 권고 보류 |

#### 3.5.3 "Prior Dominant" 명시 표시

데이터가 희박한 영역(신규 장르, 신규 시장, 첫 14일)에서는 출력에 *"prior dominant — 더 많은 내부 데이터 필요"* 를 명시적으로 표기한다. 이것은 단순 disclaimer가 아니라 *모델이 무엇을 모르는지를 자기 인식*하는 시스템 설계의 결과다.

#### 3.5.4 LLM 통합의 안전 경계

LLM은 yieldo에서 다음 역할만 수행한다:
- 수치 posterior를 자연어로 *번역* (수치는 모델이 이미 산출)
- 컨텍스트 인지 *설명 생성* (이상치 → 가능 원인 후보 제시)
- 자연어 *질의 라우팅* (사용자 질문 → 어느 모델 endpoint를 호출할지 결정)

LLM이 *수치를 생성*하지 않는다. 이 경계가 무너지면 §3.4의 환각 면역도 무너진다. 따라서 LLM의 권한은 "단어를 바꾸는 역할"로 엄격히 제한된다.

---

## 4. Data Pipeline (T3: Architecture)

> **신뢰등급 T3**: 본 섹션은 합리적이고 일관된 청사진이다. §4.1·§4.4 는 대부분 개념적 진실이며, §4.2·§4.3 은 부분 구현 + 부분 약속이다. 구현 현황은 §8 참조.

### 4.1 Four-Silo Integration (네 사일로 통합)

모바일게임 데이터 생태계는 네 개의 disconnected 사일로로 분리되어 있다. 각 사일로는 좁은 질문에는 답하나, *투자 질문* 에는 답하지 않는다. yieldo의 첫 번째 통합 작업은 이 사일로들 위에 *번역 레이어* 를 두는 것이다.

#### 4.1.1 사일로별 책임과 한계

| Silo | 외부 도구 | 답하는 질문 | 답하지 않는 질문 |
|---|---|---|---|
| **1. Market Intelligence** (External) | Sensor Tower, AppMagic, data.ai | "시장은 어떻게 생겼는가?" | "이 시장이 우리 투자 수준을 정당화하는가?" |
| **2. Attribution & UA** (Boundary) | AppsFlyer, Adjust, Singular | "유저는 어디서 오는가? 비용은?" | "이 획득비용이 장기 수익으로 정당화되는가?" |
| **3. Experimentation & Product** (Internal) | Statsig, Optimizely, Firebase | "어느 변형이 더 잘 작동했는가?" | "이 실험은 얼마나 투자가치를 만들었는가?" |
| **4. Financial & Revenue** (Internal) | ERP, 스프레드시트 | "현재 재무 상태는?" | "더 투자해야 하는가?" |

#### 4.1.2 yieldo가 채우는 빈 칸

위 표 오른쪽 열의 질문들이 yieldo의 작업 영역이다. 각 사일로의 출력을 **Bayesian 프레임워크의 입력** 으로 변환한다:

| Silo | yieldo 사용처 | Bayesian 역할 |
|---|---|---|
| 1. Market | 장르별 리텐션·ARPDAU 벤치마크 분포 | **Prior** 구성 |
| 2. UA | 채널별 CPI, 코호트 attribution | **Likelihood** (UA 비용 구성) |
| 3. Experimentation | ATE, 신뢰구간, rollout 메타 | **Likelihood** (개입 효과 측정) |
| 4. Financial | 매출, 비용, 현금흐름, 회수 목표 | **Likelihood** (제약) + 결정 출력 측정 기준 |

이 매핑이 yieldo의 코어 *통합 전략* 이다. 단순 데이터 통합이 아니라 *Bayesian 추론을 위한 입력 변환* 이다.

### 4.2 Three-Layer Storage (3-계층 저장 구조)

데이터의 *역할별* 로 저장 책임을 분리한다. Hot/Cache/Cold 의 표준 패턴이지만, 각 레이어의 *경계* 정의가 yieldo 운영의 핵심이다.

#### 4.2.1 L1 — Supabase PostgreSQL (HOT, Source of Truth)

| 항목 | 값 |
|---|---|
| 저장 대상 | 운영 데이터의 source of truth — Identity (org/user/role), Cohort retention point (일별 N일 retention), Financial T1 영업비밀 (AES-256 column 암호화), Experiment 메타·ATE 결과, ML inference 결과 + credible interval, 모든 T1·T2 read/write 감사 로그 |
| 저장 *대상이 아닌 것* | Raw event 로그, 시계열 대규모 데이터, 외부 플랫폼 원본 응답 (이들은 L3) |
| 접근 패턴 | 실시간 read/write, 트랜잭션 필수 |
| Latency | <50ms |
| Retention | 무제한 (거래 내역·감사 목적) |
| 비용 | Supabase Pro $25/월 (테넌트 수 무관) |
| 재구축 가능성 | 불가능 (소실 = 운영 사고) |

#### 4.2.2 L2 — Upstash Redis (CACHE)

| 항목 | 값 |
|---|---|
| 저장 대상 | Hot path 응답 캐시만 — `pred:band:{game_id}:{date}` (P10/P50/P90, TTL 24h), `dash:overview:{org_id}` (TTL 5min), `mmp:cohort:{conn_id}:{date}` (TTL 24h), `bench:genre:{genre}:{tier}` (TTL 7d) |
| 저장 *대상이 아닌 것* | 영속 데이터, 개인정보, 영업비밀 — 모두 L1 또는 L3 |
| 접근 패턴 | 초고빈도 read, 무상태 |
| Latency | <10ms |
| TTL | 60s ~ 24h (도메인별) |
| 비용 | Upstash per-request (MVP 무료 레벨 충분) |
| 재구축 가능성 | **가능 — Redis 전체 손실 시 L1에서 완전 재구축** |

L2의 핵심 설계 원칙: *cold-start 가능*. Redis가 0이 되어도 L1만 살아있으면 시스템 무결성 유지. 이 분리가 운영 안전성의 토대.

#### 4.2.3 L3 — GCS Cold Storage (Archive)

| 항목 | 값 |
|---|---|
| 저장 대상 | Raw archive + 장기 보존 + ML training corpus — `gs://yieldo-cold/raw/mmp/{org_id}/{date}.json.gz`, `raw/statsig/{org_id}/{exp_id}/{date}.json.gz`, `audit/{yyyy-mm}/audit_log_archive.parquet`, `ml/models/`, `ml/training/` |
| 저장 *대상이 아닌 것* | 실시간 쿼리 대상 데이터 (이는 L1) |
| 접근 패턴 | 배치 읽기, 드물고 느린 접근 |
| Latency | ~100ms (Standard) ~ 5s (Coldline) |
| Lifecycle | 30d (Standard) → 60d (Nearline) → 275d (Coldline) → Archive/삭제 |
| Retention | Audit log 7년 강제 (회계법 + 부정경쟁방지법) |
| 비용 | GCS Lifecycle 자동 할인 — $1~5/월 |

#### 4.2.4 Databricks를 도입하지 않는 명시적 근거

흔한 오해: "기술적으로 정밀한 SaaS = 데이터 웨어하우스 필요". yieldo는 *데이터 웨어하우스가 아니다*. Translation layer다. 이미 집계된 4개 silo 출력을 연결·번역할 뿐.

| 메트릭 | Databricks 필요 기준 | yieldo 현재 | 충족 |
|---|---|---|---|
| 일별 raw event volume | 10TB+/월 | ~1MB/월 | ✗ |
| 활성 유료 테넌트 | 100+ | 0 | ✗ |
| 분산 compute 강제 | Spark / deep learning at scale | NumPyro 충분 | ✗ |
| 비용 부담 | $1,500+/월 | Supabase Pro $25/월 | — |

**도입 트리거**: 위 세 조건 *모두* 충족 시 검토 권한 생성. 현재 0/3. 검토 시작 불가 (ETA 18-24개월). BigQuery는 Databricks의 약 95% 가치를 5% 비용으로 제공 — Phase 2 후반에 BigQuery 추가 가능성이 Databricks보다 압도적으로 높다.

#### 4.2.5 Phase별 진화 경로

| Phase | 시점 | 구성 | 월 비용 |
|---|---|---|---|
| Phase 1 (MVP) | 0-12개월 | Supabase + Upstash + Cloud Run + GCS | $50-100 |
| Phase 2 (PMF) | 12-24개월 | + dbt Core (무료) + BigQuery (선택) | $300-800 |
| Phase 3 (Scale) | 24개월+ | Databricks 검토 권한 생성 (자동 도입 ✗) | 매번 cost-benefit 재평가 |

#### 4.2.6 데이터 흐름 (Ingestion + Read/Inference)

**Ingestion Flow (Silo → L1)**:
```
Public Benchmark (주간 Cloud Run Job)
  → GCS raw/benchmark/
  → L1 benchmark_band

MMP — AppsFlyer (야간 Cloud Run Job, 테넌트별)
  → GCS raw/mmp/{org_id}/
  → L1 cohort, cohort_retention_point

Experimentation — Statsig (webhook + nightly fallback)
  → GCS raw/statsig/{org_id}/
  → L1 experiment_result

Financial — Manual T1 (사용자 입력)
  → L1 financial_input (AES-256)
  → L1 financial_input_history (감사 추적)
```

**Read/Inference Flow (L1 → ML → UI)**:
```
사용자가 Executive Overview 접속
  → Next.js RSC가 Redis dash:overview:{org_id} 확인
  ├─ HIT → 즉시 렌더링
  └─ MISS
      → Server Action이 Supabase 쿼리 (RLS 적용)
      → Retention 예측 필요 시
        → FastAPI POST /predict/retention 호출
        → FastAPI가 L1 cohort_retention_point 로드
        → scipy curve_fit + NumPyro SVI 실행
        → Prediction band (P10/P50/P90) 반환
        → Redis 캐시 (TTL 24h)
      → RSC로 반환 → 렌더링
```

### 4.3 Customer-Authorized Agent Pattern (고객 위임 에이전트 패턴)

외부 플랫폼(AppsFlyer, Statsig, Adjust 등)의 데이터를 yieldo가 처리하는 모델의 *법적 구조* 를 정식화한다. 이 패턴이 yieldo가 *legally sound* 한 이유의 토대다.

#### 4.3.1 패턴의 정확한 정의

```
Platform ─(API 계약)─→ Customer ─(API Key 위임)─→ yieldo

→ yieldo의 API 접근 권한은 고객의 권리에서 *파생*된다.
→ 고객이 API Key를 제공하는 행위 자체가 위임의 명시 증거.
```

법적 구조의 4요소:
1. **데이터 소유자 = 고객** (Statsig, AppsFlyer 계정 소유자)
2. **API 제공 의도 = 접근 인가** (OAuth 또는 Key-based authentication)
3. **고객의 명시 위임** (API Key 제공 + UI상 "Connect" 클릭 + MSA 동의)
4. **변환적 가치 추가** (데이터 재판매가 아닌 *분석·결정 지원*)

#### 4.3.2 한국 법 컨텍스트

| 법령 | 적용 영역 | yieldo 위치 |
|---|---|---|
| 부정경쟁방지법 | 영업비밀 보호 (고객 재무 데이터) | 영업비밀 strict protection — AES-256 + RLS + 감사 + 집계 금지 |
| 정보통신망법 제48조 | 웹크롤링 형사 처벌 | API 연동만 사용 (인가된 접근). 크롤링은 *원천 금지* |
| 개인정보보호법 (PIPA, 2023 개정) | 자연인 개인정보 처리 | 유저 레벨 리텐션에 한해 적용. DPA 필수, "정당한 이익" 활용 |
| 데이터산업법 (2022) | 데이터분석서비스 | yieldo 카테고리. 법 취지가 데이터 기반 서비스에 허용적 |

핵심 사실: **고객 재무 데이터는 PIPA 개인정보가 아니다**. 법인 회사 정보. 그러나 *영업비밀로* 보호된다 (3요건: 비공개성·경제적 유용성·관리성).

#### 4.3.3 API 연동 vs 크롤링 (yieldo의 "원천 회피" 결정)

| 항목 | API 연동 (yieldo 모델) | 크롤링 (금지 대상) |
|---|---|---|
| 플랫폼 의도 | "들어오세요" (공식 API 제공) | "들어오지 마세요" (ToS 금지) |
| 데이터 소유권 | 고객 (고객 API Key) | 제3자 독점 (예: Sensor Tower 데이터) |
| 보호 강도 | 단층 (API Key) | 3중 (로그인 + 유료 + ToS) |
| 한국법 판정 | 합법 | 형사 처벌 가능 |
| 판례 | hiQ v. LinkedIn (2022) — API 합의 $50만 | Sensor Tower — ToS 명시 + 형사 대상 |

**전략적 결론**: yieldo는 *Sensor Tower / AppMagic 데이터를 직접 크롤하지 않는다*. 대신 공공 벤치마크(GameAnalytics 등) + 자체 추정 모델 + Phase 3에서 partnership/licensing.

#### 4.3.4 외부 플랫폼 약관 위반 회피 메커니즘

| 플랫폼 | ToS 정책 | yieldo 대응 |
|---|---|---|
| AppsFlyer | "Technology Partner + Marketplace" 권장 | 파트너 프로그램 신청 (Phase 2) → Official status |
| Statsig | "REST API 공개, 무료 티어 포함" | 표준 API 사용, rate limit 준수 |
| Adjust | "KPI Service / Cohort API 허용" | 권한 있는 사용자 endpoint 사용 |
| Firebase | "OAuth 기반 제3자 위임 설계" | Better Auth(제3자 라이브러리)로 처리 |

**5가지 위반 회피 운영 원칙**:
1. **파트너 프로그램 신청** (Phase 2) — Official status 획득 → ToS 위반 클레임 회피
2. **Rate Limit 준수** — 자동 rate limiting, 플랫폼 권장 rate 준수
3. **데이터 최소화** — 필요한 필드만 조회, full export 회피
4. **ToS 모니터링** — 6개월 주기 정기 검토, 변경 시 고객 공지
5. **C&D 대응 계획** — Cease & Desist 수신 시 즉시 API 접근 중단 + 고객 공지

#### 4.3.5 MSA 필수 조항

```
yieldo는 고객으로부터 명시적으로 위임받은 API Key만 사용.
고객이 위임을 철회하면 즉시 접근 중단.
yieldo는 API Key를 제3자에게 공유하지 않음.
yieldo는 고객 재무 데이터를 영업비밀로 취급.
yieldo는 고객 재무 데이터를 제3자 공유 / 벤치마크 집계에 사용하지 않음.
```

#### 4.3.6 리스크 등급

법적 구조가 강력한 이유:
- 판례 지지 (Van Buren v. US 2021, hiQ v. LinkedIn 2022)
- 산업 표준 (Zapier, Segment, Fivetran, Singular 등 수천 개 SaaS의 표준 패턴)
- 명시 동의 + 감사 추적
- 변환적 가치 (재판매 아님)

**결론적 리스크 등급: 낮음**. 단, MSA 조항·인가 플로우·감사 로그가 *모두 정상 작동* 해야 함. 셋 중 하나라도 빠지면 등급 상승.

### 4.4 Bayesian Network Effect (네트워크 효과)

yieldo의 가장 *조용하지만 가장 강한* 해자. 시간이 흐를수록 자동으로 강화된다.

#### 4.4.1 메커니즘

```
초기:        공공 벤치마크 (GameAnalytics, Unity, AppsFlyer Index)
              → 장르별 prior 분포 (P10/P50/P90)
              → 분산 큼 (얇은 데이터)

고객 1 합류:  Bayesian update — 1개 게임 cohort 데이터 통합
              → prior 약간 좁아짐
고객 5 합류:  prior 의미 있게 좁아짐
고객 20 합류: 장르별 prior가 *공공 벤치마크보다* 정밀
고객 100 합류: prior 자체가 yieldo의 *독자적 자산* — 외부에 없음
```

#### 4.4.2 시간축 효과

| 단계 | 상태 | 신규 고객 경험 |
|---|---|---|
| Year 1 (10 customers) | Prior 분산 큼 | C 등급 결정이 잦음 — "더 많은 내부 데이터 필요" |
| Year 2 (50 customers) | Prior 의미 있게 좁음 | B 등급 도달 시간 단축 |
| Year 3 (200 customers) | Prior 정밀 | A 등급 도달 시간 더 단축 |
| Year 5 (1000 customers) | Prior 가 공공 벤치마크 *이상* | 신규 고객도 D7부터 신뢰등급 B 가능 |

#### 4.4.3 영업비밀 보호와의 정합

§4.3.5 MSA 조항이 "고객 재무 데이터 집계 금지"를 명시한다. 그러나 **장르별 *리텐션 분포* 는 영업비밀이 아니다**. 사용자 행동 통계의 집계는 PIPA·부정경쟁방지법 모두에서 허용 (개인 식별 불가 + 회사 식별 불가).

따라서 네트워크 효과의 *합법적 표면* 은:
- 합법: 장르별 리텐션·ARPDAU·CPI 분포 집계 → prior 갱신
- 불법: 개별 고객 매출·burn rate·cash 집계

이 경계가 분명하기 때문에 yieldo는 네트워크 효과를 *구조적으로 안전하게* 가질 수 있다.

#### 4.4.4 경쟁 차별

| 경쟁자 | 네트워크 효과? | 이유 |
|---|---|---|
| Sensor Tower / AppMagic | 부분적 | 시장 데이터는 모음. 그러나 *결정 데이터* 는 모으지 않음 |
| AppsFlyer / Adjust | 없음 | 단일 고객 데이터로만 작업, 집계 prior 없음 |
| Statsig / Optimizely | 없음 | 실험 결과는 고객별 격리, prior 공유 안 됨 |
| Internal BI 팀 | 불가능 | 단일 회사 데이터만 |
| **yieldo** | **있음** | 장르 prior 가 *카테고리 정의를 통해* 합법 집계 가능 |

이것이 §1.2의 "해자 5"가 단순 마케팅 주장이 아니라 *합법적·구조적* 자산인 이유다.

---

## 5. Technology Stack (의도적으로 lean)

> **신뢰등급 T3 (설계) + T4 (구현)**. 본 섹션은 *의도적으로 짧게* 유지된다 — 코드 진척에 따라 빠르게 변하는 휘발성 콘텐츠. 정확한 최신 상태는 항상 `Project_Yieldo_Tech_Stack.md` 와 `yieldo/package.json` 을 1차 출처로 본다. 본 문서에서는 카테고리별 한 줄 요약 + 구현률만 유지.

- §5.1 Frontend (Next.js 16 App Router + FSD 2.1 + Zustand + Recharts) — *현재 80% 구현됨*
- §5.2 ML Service (FastAPI on GCP Cloud Run + NumPyro + scipy + LSTM) — *현재 0% 구현됨*
- §5.3 Data Layer (Supabase + RLS + Upstash Redis + GCS) — *현재 0% 구현됨*
- §5.4 Auth & Multi-tenant (Better Auth + Organization plugin) — *현재 0% 구현됨*
- §5.5 Deployment (Vercel for frontend + GCP for ML + Cloud Scheduler for batch) — *Vercel 부분만 구현됨*

---

## 6. End-to-End Pipeline (전체 흐름)

> **신뢰등급 T3 (설계) + T4 (구현 상태)**. 6단계 각각에 [입력 / 연산 / 출력 / 실패 가능 지점 / 구현 상태] 명시. 구현 상태는 2026-05-02 기준이며 빠르게 변한다.

전체 데이터-결정 흐름을 6단계로 표준화한다. 각 단계는 독립적으로 검증 가능하며, 어디서 환각이나 오류가 발생할 수 있는지 사전에 표시된다.

### 6.1 Stage 1 — Data Ingestion (4 사일로 → L1)

| 항목 | 내용 |
|---|---|
| 입력 | (a) 고객의 AppsFlyer / Adjust API Key (Customer-Authorized Agent), (b) Statsig Console API access, (c) 고객 재무 5-metric manual input, (d) 공공 장르 벤치마크 리포트 (GameAnalytics 등) |
| 연산 | (1) Cloud Run Job이 야간 batch sync — `cohort_retention_point` row 생성, (2) Webhook + nightly fallback으로 `experiment_result` row 생성, (3) Manual financial input → AES-256 encrypt → `financial_input` row, (4) 주간 `benchmark_band` 갱신 |
| 출력 | L1 정규화 데이터 (cohort, experiment, financial, benchmark) + L3 raw archive |
| 실패 가능 지점 | API rate limit hit / API key 만료 / 외부 ToS 변경 / 데이터 스키마 변경 / 고객 입력 누락 |
| 구현 상태 (2026-05-02) | AppsFlyer Pull API 작동. Adjust / Statsig / Firebase 미구현. Manual financial 작동 (Visible.vc 5-metric 모델). Public benchmark 미구현 |

### 6.2 Stage 2 — Prior Construction (벤치마크 → 장르 분포)

| 항목 | 내용 |
|---|---|
| 입력 | 장르 × 성과 등급별 D1/D2/.../D30 리텐션 데이터 (공공 벤치마크 + 누적 고객 데이터, §4.4 네트워크 효과) |
| 연산 | (1) 장르 × 등급 segment, (2) 일별 리텐션 비율 D[n+1]/D[n] 계산, (3) Beta 또는 Normal prior 분포 fit, (4) P10/P50/P90 밴드 산출 |
| 출력 | `benchmark_band` table — 장르별 prior 분포 파라미터 |
| 실패 가능 지점 | 장르 mis-classification / 등급 cut-off 오류 / 누적 고객 수가 적어 분산 큼 |
| 구현 상태 (2026-05-02) | 미구현. 코드 0줄. *문서상 가장 시급한 구현 우선순위* |

### 6.3 Stage 3 — Posterior Update (내부 데이터 → Bayesian 갱신)

| 항목 | 내용 |
|---|---|
| 입력 | (a) Stage 2 prior 분포, (b) Stage 1 코호트 retention point (D1, D3, D7, D14, ...) |
| 연산 | (1) Layer 1 (D1-D7): scipy `curve_fit` 으로 멱법칙 적합 + slope-band 정합 검증 (§2.5-2.6), (2) Layer 2 (D14+): NumPyro SVI 또는 NUTS로 Bayesian 추론 — Monte Carlo dropout으로 신뢰구간 산출 |
| 출력 | Posterior 분포 — D60/D180/D365 retention with P10/P50/P90 |
| 실패 가능 지점 | Curve fit 수렴 실패 / Slope-band 분기 (§2.6 조정 규칙 트리거) / 데이터 부족으로 prior dominant |
| 구현 상태 (2026-05-02) | 미구현. NumPyro/scipy/lmfit 코드 0줄. FastAPI service 미배포 |

### 6.4 Stage 4 — LTV Integration (점근선 도착 검출 → 적분)

| 항목 | 내용 |
|---|---|
| 입력 | Stage 3 posterior retention curve + ARPDAU(d) 모델 (IAP + 광고 매출 분해) |
| 연산 | (1) §2.3 점근선 도착점 $T^*$ 검출, (2) LTV 적분 $\sum_{d=1}^{T^*} R(d) \cdot \text{ARPDAU}(d)$, (3) 신뢰구간 propagate (Monte Carlo) |
| 출력 | LTV 분포 (P10/P50/P90) + 적분 종점 $T^*$ + 신뢰등급 (A/B/C) |
| 실패 가능 지점 | $T^*$ 미검출 (곡선 안정화 안 됨, 적분 발산) / ARPDAU 모델 오차 propagate / 신뢰구간 과도하게 넓음 |
| 구현 상태 (2026-05-02) | 미구현. ARPDAU 모델 0줄, 점근선 검출 알고리즘 0줄 |

### 6.5 Stage 5 — Decision Translation (ATE → ΔLTV → ΔIRR)

| 항목 | 내용 |
|---|---|
| 입력 | (a) 실험 ATE (Statsig 또는 manual), (b) Stage 4 baseline LTV 분포, (c) 재무 입력 (CPI, target payback, 현금 잔고) |
| 연산 | §3.4 결정론적 변환 사슬 — ATE → ΔRetention(d) → ΔLTV → ΔAnnual Revenue → ΔPayback → ΔIRR → Experiment ROI |
| 출력 | 자본배분 권고 with: (a) 추천 액션, (b) 신뢰구간, (c) 결정 신뢰도 점수, (d) "prior dominant" 표시 (해당 시) |
| 실패 가능 지점 | NPV 수렴 실패 (현금흐름 부호 변동 多) / 사용자 volume 외삽 오차 / *LLM이 수치 생성하면 환각 발생 — 이 경계가 무너지면 안 됨 (§3.5.4)* |
| 구현 상태 (2026-05-02) | 미구현. 결정론 사슬 코드 0줄 |

### 6.6 Stage 6 — Confidence-Tagged Output (신뢰등급 출력)

| 항목 | 내용 |
|---|---|
| 입력 | Stage 5 권고 + Posterior 분산 + 데이터 가용성 메타 |
| 연산 | (1) 신뢰등급 산출 (§3.5.2 — A/B/C 룰 적용), (2) "Prior dominant" 검출 룰 적용, (3) UI 렌더링 페이로드 구성 |
| 출력 | UI에 표시되는 모든 결정에 등급 + 신뢰구간 + 데이터 부족 경고 동봉 |
| 실패 가능 지점 | 등급 계산 오류 / UI 컴포넌트가 점추정으로 *떨어뜨려 표시* (← 이 경우 §3.5.1 강제 위반, 빌드 단계 lint로 차단해야 함) |
| 구현 상태 (2026-05-02) | UI 표현은 부분 구현. 등급 계산 백엔드 0줄 |

### 6.7 Pipeline Health Summary

| Stage | 약속 (T3) | 현실 (T4) | 갭 |
|---|---|---|---|
| 1. Ingestion | 4 silo 자동 sync | 1.25 silo (AppsFlyer + manual financial) | Adjust / Statsig / 벤치마크 미구현 |
| 2. Prior | 장르 분포 + 네트워크 효과 | 0 | 코드 0줄 |
| 3. Posterior | NumPyro Bayesian | 0 | 코드 0줄 |
| 4. LTV | 적분 + 점근선 검출 | 0 | 코드 0줄 |
| 5. Translation | ΔLTV → ΔIRR | 0 | 코드 0줄 |
| 6. Confidence | 모든 출력에 등급 | UI 일부, 백엔드 0 | 등급 계산 미구현 |

**핵심 사실**: 본 파이프라인의 §2-3 *과학·수학* 은 진실로 닫혀 있다. 그러나 *구현* 은 1.25 / 6 단계에 불과하다. v0.2 시점의 정직한 상태다. §8 우선순위 로드맵은 본 표를 먼저 채우는 순서로 작성된다.

---

## 7. Competitive Moat Synthesis (해자 종합)

> **신뢰등급 T3**. 본 섹션은 §2-§6 합성에서 도출되는 *전략적 해자* 를 정리한다. T1·T2 사실에 근거하지만 결론은 전략 판단이다.

### 7.1 사내 BI팀이 만들 수 없는 것

가장 큰 경쟁자는 다른 SaaS가 아니다. 대형 퍼블리셔의 *사내 BI 팀* 이다. 그들은 스프레드시트, Looker, custom dashboard로 yieldo 기능의 70%를 흉내낼 수 있다.

그러나 **사내 BI팀이 구조적으로 만들 수 없는 것 하나**가 있다: *조직 압박 하에서의 점추정 회귀*.

| 압박 상황 | 사내 BI 결과물 | yieldo 결과물 |
|---|---|---|
| 임원이 "결국 LTV 얼마야?" | "$4.2M" (점추정) — 경계 보고했어도 의사결정 시 사라짐 | "$3.1M ~ $5.8M, 90% CI, 등급 B" — 시스템이 강제 |
| 분기 리뷰 | 신뢰구간 슬라이드는 *부록* 으로 밀림 | 신뢰구간이 *결정 단위* 자체 |
| 이사회 보고 | "7월에 $1M 회수" 단일 시나리오 | P10/P50/P90 시나리오 분포 |
| 데이터 부족 영역 | 추정값 채움 (보고 압박) | "Prior dominant — 데이터 부족" 명시 |

이것은 BI팀의 *기술 부족* 이 아니다. 조직 역학의 *구조적 제약* 이다. 임원은 점추정을 요구하고, 분석가는 거절할 정치 자본이 없다. 외부 SaaS만이 *제품 자체에 정직성을 강제* 할 수 있다.

**이것이 §3.5 Architecture-Level Prohibition 이 단순한 디자인 결정이 아니라 *전략적 경쟁우위* 인 이유다**.

### 7.2 외부 도구가 만들 수 없는 것

기존 외부 도구들은 각자의 사일로에 깊다. 그러나 *번역 레이어* 는 비어있다.

| 도구 | 깊이 | 부재 |
|---|---|---|
| Sensor Tower / AppMagic | 시장 데이터 | "이 시장이 우리 투자 수준을 정당화하는가?" |
| AppsFlyer / Adjust | UA attribution | "이 획득비용이 장기 수익으로 정당화되는가?" |
| Statsig / Optimizely | 실험 통계 | "이 실험은 얼마나 *투자 가치* 를 만들었는가?" |
| Looker / Tableau | 일반 BI | "Should we invest more?" — 단 한 질문도 답 못함 |

각 도구가 자기 사일로에 충실한 *합리적* 결과다. 사일로를 통과해 *번역 레이어* 를 만들려면 카테고리 자체를 새로 정의해야 한다. 기존 도구가 그 카테고리로 이동하려면 자기 핵심 가치 명제를 *재구성* 해야 하므로 구조적으로 어렵다.

#### 7.2.1 Positioning Map

```
                  High External + Internal Integration
                              ▲
                              │
      Sensor Tower   ●        │              ● yieldo
      AppMagic       ●        │
                              │
   ◄──────────────────────────┼─────────────────────────────►
   Observation                │              Decision
                              │
              AppsFlyer  ●    │   ● Statsig
              Adjust     ●    │   ● Firebase
                              │
        Looker       ●        │
        Tableau      ●        │
                              │
                              ▼
                  Low Integration / Single Silo
```

yieldo의 좌표(우상단)는 *비어있다*. 카테고리 창출(category creation)의 정의 자체.

### 7.3 Bayesian Network Effect 복리 메커니즘

§4.4의 메커니즘을 시간축에서 보면 *복리 곡선* 이다:

```
Year 1:  prior 분산 ─────────────────  (vendor만 사용)
Year 2:  prior 분산 ───────────────    (10 customers)
Year 3:  prior 분산 ────────────       (50 customers)
Year 5:  prior 분산 ─────              (200 customers)
Year 7:  prior 분산 ──                 (1000 customers)
```

각 신규 고객은 *모든* 기존 고객의 prior 정밀도를 개선한다. 이 복리 효과는:
1. **시간이 자산** — 후발주자가 따라잡기 어려움
2. **데이터 자체가 IP** — 코드는 카피 가능하나 *집계 prior* 는 카피 불가능
3. **합법적 표면** (§4.4.3) — 영업비밀 보호와 정합

복리의 끝점: yieldo의 prior가 *공공 벤치마크보다* 정밀해지는 시점. 그 후로는 신규 고객에게 *yieldo만이 줄 수 있는 가치* 를 제공한다 — 다른 곳에서는 받을 수 없는 정밀도.

### 7.4 정직성을 마케팅 자산으로

업계 관습: "정밀해 *보이게* 만든다 — credible interval은 부록에 묻는다."

yieldo의 차별: **"We tell you what we don't know" 자체가 핵심 가치 명제**.

| 시장 통상 | yieldo |
|---|---|
| 점추정 = 신뢰의 시그널 | 신뢰구간 = 신뢰의 시그널 |
| 모름 = 약점 (감춤) | 모름 = 정직 (명시) |
| 권고는 단정 | 권고는 *결정 신뢰도* 동봉 |
| AI는 *답* 을 준다 | AI는 *분포* 를 준다 |

이 차별은 마케팅 카피가 아니다. *제품 아키텍처가 강제한 결과* 다 (§3.5 Architecture-Level Prohibition). 그래서 카피하기 어렵다 — 경쟁사가 같은 메시지를 내려면 자사 제품의 모든 점추정 endpoint를 제거해야 한다.

#### 7.4.1 정직성이 영업·심사에 작동하는 이유

| Audience | 정직성 효과 |
|---|---|
| Game Studio CEO | "다른 도구는 단정하는데 yieldo만 *모르는 영역을 알려줌* → 회의 신뢰 ↑" |
| CFO | "신뢰구간이 있으니 의사결정 위험을 *정량화* 가능 → 자본배분 정당화" |
| 예창패 심사위원 | "기술적 정직성이 사업계획 신뢰도 ↑ → 다른 신청서와 차별" |
| 투자자 | "환각 면역 + 네트워크 효과 + 합법적 모집 → 시간이 흐를수록 강해지는 회사" |

**핵심 메타-원리**: yieldo의 마케팅이 작동하려면 *제품이 정직해야 한다*. 그 반대(마케팅 → 제품) 가 아니다. 따라서 §3.5 Architecture-Level Prohibition이 무너지면 §7.4 포지셔닝도 무너진다. 이 둘은 같은 자산의 두 면이다.

---

## 8. Implementation Status (T4: 운영 현황)

> **신뢰등급 T4**. 2026-05-02 시점 코드베이스 감사 결과. *의도적으로 짧게* 유지 — 코드 진척에 따라 매주 갱신되는 휘발성 콘텐츠. 갱신 주기: 빌드 마일스톤 단위. 본 문서에서는 갭 요약 + 다음 4주 우선순위만 유지하고, 상세는 GitHub PR / commit 로그를 1차 출처로 본다.

### 8.1 현황 요약 (2026-05-02 기준)

| 축 | 상태 | 핵심 갭 |
|---|---|---|
| Frontend | 80% | TanStack Query 미설치, FSD features/entities 레이어 부재 |
| AppsFlyer 통합 | Working | Pull API 동작 중, 다른 MMP는 미구현 |
| ML 엔진 (Python/FastAPI) | **0%** | NumPyro, scipy, LSTM 코드 0줄. Cloud Run 배포 설정 없음 |
| 데이터베이스 (Supabase) | **0%** | 스키마, RLS 정책, migration 없음 |
| 인증 (Better Auth) | **0%** | 패키지 미설치, 멀티테넌트 불가 |
| 외부 API (Adjust, Statsig, Firebase, QuickBooks/Xero) | 카탈로그만 | 실제 sync route 없음 |

### 8.2 치명적 갭 Top 3

1. **Python ML 엔진 전체** — yieldo의 §2-3 코어 가치(Bayesian posterior, LTV 적분, ATE→IRR 번역)가 코드에 부재. 현 시점에 "Posterior 추론을 보여달라"고 하면 시연 불가
2. **Supabase 데이터베이스** — 멀티테넌트 데이터 저장소 없음. 배포 후 데이터 휘발
3. **Better Auth + Organization plugin** — 로그인 불가 → 멀티테넌트 SaaS로 동작 불가

### 8.3 다음 4주 우선순위 (잠정)

> 검토 후 확정 예정.

- Week 1: Supabase 스키마 + RLS + 첫 migration
- Week 2: Better Auth + Organization plugin 통합
- Week 3: Python ML service skeleton (FastAPI on Cloud Run, 멱법칙 fitter 1개 endpoint부터)
- Week 4: 첫 end-to-end posterior demo (AppsFlyer cohort → Layer 1 fit → P10/P50/P90 출력)

---

## 9. Source Document Mapping

| 본 문서 섹션 | 1차 출처 (정확한 위치) | 정정·보강 사항 |
|---|---|---|
| §0 | (이 문서 신규) | — |
| §1 | CLAUDE.md §1, §10 | 7개 해자 표는 본 문서 신규 합성 |
| §2.1 | CLAUDE.md §3.1 | — |
| §2.2 (P1-P5) | CLAUDE.md §3.2 | P5: "squeeze theorem" → **monotone convergence theorem** 으로 정정 |
| §2.3 | CLAUDE.md §3.3 | — |
| §2.4 | CLAUDE.md §3.4 | — |
| §2.5 | CLAUDE.md §3.5 | — |
| §2.6 | CLAUDE.md §3.6 | — |
| §2.7 | CLAUDE.md §3.7 | — |
| §3.1 | CLAUDE.md §4 | — |
| §3.2 | CLAUDE.md §8.1 | — |
| §3.3 | CLAUDE.md §5 | — |
| §3.4 | CLAUDE.md §6 | "환각 면역" 분석은 본 문서 신규 합성 |
| §3.5 | CLAUDE.md §4.2, §8.6 | "Architecture-Level Prohibition" 프레이밍은 본 문서 신규 |
| §4.1 | CLAUDE.md §2.2, §8.5 | — |
| §4.2 | Project_Yieldo_Data_Architecture.md §1–6 | — |
| §4.3 | Project_Yieldo_Legal.md Part 1–6 | — |
| §4.4 | CLAUDE.md §8.6 + 본 문서 합성 | "합법적 표면" 분석은 본 문서 신규 |
| §6 | 본 문서 신규 합성 | §2–§4 통합 매핑, 6단계 표준화 |
| §7 | CLAUDE.md §10, §1.3, Project_Yieldo_Business_Plan.md + 본 문서 합성 | "Architecture-Level Prohibition = 경쟁우위" 프레이밍 신규 |
| §8 | 2026-05-02 코드베이스 감사 (이 문서 신규) | — |

---

## Appendix A. References

### 학술 문헌
- Viljanen, M. & Airola, A. (2017). "Modelling User Retention in Mobile Games." IEEE Conference on Computational Intelligence and Games.
- Viljanen, M. et al. (2016). "User Activity Decay in Mobile Games Determined by Simple Differential Equations." ResearchGate.
- Jang, S. et al. (2021). "On Analyzing Churn Prediction in Mobile Games." arXiv:2104.05554.
- Rothenbuehler, P. et al. (2015). "Hidden Markov Models for Churn Prediction." Academia.edu.
- Chen, P. et al. (2018). "Customer Lifetime Value in Video Games Using Deep Learning." arXiv:1811.12799.

### 산업 출처
- Deconstructor of Fun (2020). "Long-Term Retention — Why D180 is the New D30."
- GoPractice. "The Importance of Long-Term Retention."
- GameAnalytics (2024). "Mobile Gaming Benchmarks Report."
- Valeev, R. (2018). "How to Make Retention Model and Calculate LTV for Mobile Game." Medium.

### 내부 자료
- Mike (2021). 5대 리텐션 성질 + 슬로프 기반 예측 방법론 내부 정식화.

---

## Appendix B. Glossary (한국어 ↔ English)

| 한국어 | English | 정의 |
|---|---|---|
| 리텐션 | Retention | 코호트 사용자 중 N일차에 활성 상태인 비율 |
| 사전 분포 | Prior Distribution | 데이터 관측 전 변수의 확률 분포 |
| 사후 분포 | Posterior Distribution | 데이터 관측 후 갱신된 확률 분포 |
| 신뢰구간 | Credible Interval | Bayesian 신뢰 영역. 90% CI = 변수가 90% 확률로 들어가는 구간 |
| 평균 처치 효과 | Average Treatment Effect (ATE) | A/B 실험의 처치-대조 평균 차이 |
| 점근선 도착 | Asymptotic Arrival | 리텐션 곡선이 floor에 수렴한 것으로 판정되는 시점 |
| 결정 신뢰도 | Decision Confidence | 자본배분 권고에 동봉되는 0-1 범위 신뢰 점수 |
| 사일로 | Silo | 분리된 데이터 시스템 (Market / MMP / Experiment / Financial) |
| 결정 운영체제 | Decision Operating System | yieldo의 카테고리 명. 분석 도구가 아닌 결정 자동화 layer |

---

**End of v0.2 draft (§0–4 · §6 · §7 · §9 본문 완료, §5 · §8 의도적으로 lean)**

§5 (Tech Stack)와 §8 (Implementation Status)는 코드 진척에 따라 빠르게 변화하는 휘발성 콘텐츠라 의도적으로 짧게 두었음. 갱신은 빌드 마일스톤 단위로 짧고 자주 (vs. 본문 깊게 자주). 외부에 보낼 때는 본 문서를 그대로 보낸 후 §8.1 표만 *해당 날짜로 업데이트* 하면 된다.

다음 개정 트리거:
- ML 엔진 첫 endpoint 작동 시 → §6.7 Pipeline Health Summary 갱신
- Supabase 스키마·RLS 머지 시 → §4.2 → "구현됨" 마커 추가
- AppMagic 키맨 미팅·예창패 영문 첨부 요구 시 → 영문 압축본 v1.0 추출
