# Compass MVP 수정사항 정리

작성일: 2026-04-13  
대상: `project-compass-beige.vercel.app` / `/dashboard`  
목적: 투자자·심사위원 관점에서 **설득력, 신뢰감, 제품 완성도**를 높이기 위한 우선 수정안 정리

---

## 1. 총평

현재 Compass MVP는 이미 **아이디어 설명용 화면을 넘어, 실제 데모 가능한 수준**까지 올라와 있다.

특히 아래 요소는 강점이다.

- 랜딩에서 `Turn Experiments into Investment Decisions`로 제품 정체성을 빠르게 전달함
- 대시보드에서 `Invest More`, `82% confidence`, `Payback window`, `Recommended Action`이 보여서 단순 BI가 아니라 **의사결정 도구**처럼 읽힘
- Copilot 영역이 단순 챗봇이 아니라, 원인 요약과 시나리오 제안을 연결하는 구조로 보여 제품 차별점이 살아 있음

다만 현재 단계에서 가장 중요한 과제는 새로운 기능 추가가 아니라 아래 3가지다.

1. **숫자 신뢰성 확보**
2. **메시지 일관성 정리**
3. **첫 화면 임팩트 강화**

즉, 핵심 철학은 이미 좋고, 이제는 **모순 제거 + 표현 정교화** 단계다.

---

## 2. 핵심 문제 요약

### 문제 1. 숫자 일관성 부족
대시보드 상단에는 Payback D47, Runway 14.5mo처럼 정상적인 판단 지표가 보이는데,
하단 KPI 카드에서는 `0 days`, `0 months`처럼 모순된 수치가 함께 표시됨.

이 문제는 사용자가 가장 먼저 신뢰를 잃는 지점이다.

### 문제 2. 데모 스토리 정합성 부족
상단 타이틀은 `Match League`인데 차트나 설명 일부에 `Puzzle Quest`가 섞여 보임.

작은 문제처럼 보이지만, 투자자·심사위원은 이런 부분에서 바로
`더미 데이터가 정리되지 않았다`, `아직 미완성이다`라는 인상을 받음.

### 문제 3. 랜딩 메시지 구조 분산
상단에서는 ROAS / finance / experiment 중심으로 3축처럼 읽히지만,
아래에서는 다시 `Unify 4 Data Silos`가 등장함.

제품의 핵심 메시지는 단순해야 하므로, **전 구간에서 같은 구조를 반복**해야 함.

### 문제 4. 랜딩의 시각적 임팩트 부족
텍스트 설명은 좋은데, 첫 화면에서 “실제 제품이 어떻게 생겼는가”가 강하게 들어오지는 않음.

초기 MVP/심사 데모에서는 문장보다 먼저
**제품 스크린 자체가 신뢰를 만들어야 함**.

### 문제 5. 추천 액션의 금전 번역 부족
현재 추천 액션은 방향성은 좋지만,
`그래서 이 액션이 얼마나 가치가 있는가`까지는 바로 전달되지 않음.

Compass의 강점은 결국 **행동 → 투자 가치** 번역이므로,
추천 액션에는 가능하면 기대효과 숫자가 함께 붙는 것이 좋다.

---

## 3. 랜딩 페이지 수정안

## 3.1 목표
랜딩 페이지는 아래 한 가지를 달성해야 한다.

> “Compass가 무엇인지 10초 안에 이해되고, 실제 제품처럼 느껴져야 한다.”

현재는 이해는 되지만, 제품의 강한 첫인상은 조금 약한 편이다.
따라서 설명형 랜딩에서 제품형 랜딩으로 한 단계 더 옮겨야 한다.

---

## 3.2 히어로 메시지 수정

### 현재 방향
- 메시지 자체는 좋음
- 다만 상단/하단의 구조가 완전히 일치하지 않음

### 권장 방향
제품 정의를 더 단순하게 통일할 것.

### 추천 헤드라인 안

#### 안 1
**Turn Game Data into Investment Decisions**

#### 안 2
**Should We Invest More? Compass Answers in One Screen.**

#### 안 3
**Compass turns market, UA, experiments, and financials into one investment signal.**

### 추천 서브카피
**Compass unifies market intelligence, UA, experiments, and financials into one decision layer for mobile game operators.**

이 문장으로 가면 아래의 `Unify 4 Data Silos`와 정확히 연결되고,
서비스 전체 내러티브가 정리된다.

---

## 3.3 히어로 비주얼 강화

### 문제
현재 히어로는 설명이 먼저 들어오고, 제품의 결과물은 뒤에 온다.

### 수정 제안
히어로 오른쪽에 실제 대시보드 핵심 화면을 크게 삽입할 것.

### 추천 구성 요소
아래 요소 중 2~3개가 보이도록 구성:

- `Invest More — 82% confidence`
- `Payback window`
- `Capital efficiency`
- `Recommended Action`
- `Retention / Revenue Forecast`

### 의도
사용자가 첫 화면에서 바로 이렇게 느끼게 해야 함.

> “아, 이건 그냥 소개 페이지가 아니라 실제 제품이 있구나.”

---

## 3.4 사일로 설명 블록 수정

### 현재 문제
사일로 설명이 팀 소개처럼 읽히는 경향이 있음.

### 수정 방향
각 부서 설명보다, **기존 도구의 한계**를 강조해야 함.

### 추천 카피
- **UA knows acquisition efficiency, not investment value**
- **Finance knows burn, not experiment impact**
- **Product knows winners, not capital allocation**
- **Compass connects all four into one decision**

이렇게 쓰면 “기능 소개”가 아니라 “왜 Compass가 필요한가”가 더 또렷해진다.

---

## 3.5 CTA 수정

### 현재
- Try the Dashboard
- Start for Free

### 권장
초기 MVP/심사 버전에서는 무료 가입보다 데모 중심 CTA가 더 적합함.

### 추천 문구
- **View Live Demo**
- **See the Decision Dashboard**
- **Explore the MVP**

### 이유
지금 단계에서 중요한 것은 가입 유도가 아니라,
**이미 작동하는 제품처럼 보이게 하는 것**이다.

---

## 3.6 랜딩에 추가하면 좋은 한 줄
아래 문장을 히어로 아래 또는 Why Compass 구간에 넣는 것을 추천.

**Not another analytics dashboard. A decision layer for capital allocation.**

이 문장은 Compass가 Tableau/Looker류와 다르다는 점을 짧게 못박아준다.

---

## 4. 대시보드 수정안

## 4.1 목표
대시보드는 아래를 달성해야 한다.

> “숫자를 믿을 수 있고, 지금 어떤 결정을 내려야 하는지 바로 보인다.”

현재 구조는 좋다.
문제는 주로 **신뢰를 깎는 세부 모순**이다.

---

## 4.2 숫자 모순 제거 — 최우선

### 현재 문제
- 상단: Payback D47 / Runway 14.5mo
- 하단: Payback Period = 0 days / Burn Tolerance = 0 months

이런 조합은 계산이 아직 안 맞거나, 목업이 덜 정리된 것으로 보인다.

### 수정 원칙
틀린 숫자를 노출하느니, 비어 있거나 상태형으로 보여주는 것이 낫다.

### 대체 표기 예시
- `—`
- `Pending`
- `Awaiting financial input`
- `Sample calculation`

### 결론
이 부분은 디자인보다 먼저 수정해야 한다.
이 문제 하나만으로도 전체 신뢰도가 크게 떨어진다.

---

## 4.3 게임명/데모 시나리오 통일

### 현재 문제
- 상단: Match League
- 일부 차트/설명: Puzzle Quest

### 수정 방향
데모용 프로젝트명 하나로 전부 통일할 것.

### 선택지
#### 선택지 A. 완전 가상 이름 사용
- Project Atlas
- Nova Match
- Puzzle Frontier

#### 선택지 B. Match League로 통일
이미 네 스토리와 연결되어 있다는 장점이 있음.

### 권장
심사용/투자자용이라면 **Compass 데모 전용 가상 게임명** 1개를 별도로 만드는 것도 좋다.

---

## 4.4 상단 시그널 카드 강화

### 현재 강점
현재 대시보드에서 가장 좋은 영역은 상단 Investment Status 카드다.

- Invest More
- 82% confidence
- Payback window
- Key signals
- Recommended action

이 구조는 Compass의 핵심 철학을 이미 잘 보여준다.

### 개선 방향
이 카드를 더 “의사결정 카드”처럼 정제할 것.

### 추천 구조
**Investment Status**  
**INVEST MORE**  
82% confidence

**Why**
- D7 retention in genre top 25%
- Payback on track: D47 vs target D60
- Capital efficiency stable at 1.42x

**Recommended Action**
- Scale Reward Calendar experiment from 20% → 50%
- Expected impact: +$120K annualized revenue

### 핵심 포인트
추천 액션에는 가능하면 아래 중 하나를 반드시 붙일 것.

- expected revenue lift
- expected payback improvement
- expected probability lift

즉, Compass의 강점인 **행동 → 투자 가치 번역**을 직접 보여줘야 한다.

---

## 4.5 KPI 카드 명칭 재정비

### 현재 방향
ROAS, Payback, BEP, Burn Tolerance 등 구성은 나쁘지 않음.

### 개선 방향
보다 “투자 판단용 언어”로 정리할 것.

### 추천 KPI 명칭
- **Payback Forecast**
- **Break-even Probability**
- **Runway Impact**
- **Capital Efficiency**

### 이유
단순 운영 지표처럼 보이기보다,
“이 숫자가 왜 투자 판단과 연결되는지”가 먼저 느껴진다.

---

## 4.6 차트 설명 방식 수정

### 현재 문제
차트 하단 설명이 친절하긴 하지만, 조금 길고 분석툴스럽다.

### 수정 방향
차트별로 **한 줄 인사이트**를 붙이는 방식으로 변경.

### 예시
#### Revenue vs Investment
**Revenue is outpacing UA spend for 3 straight months.**

#### Retention Forecast
**Prediction band tightened after D14 cohort stabilization.**

#### Revenue Forecast
**Upside remains positive, but uncertainty widens after D60.**

### 효과
차트가 설명의 대상이 아니라,
바로 판단 근거로 읽힌다.

---

## 4.7 Copilot 영역 강화

### 현재 강점
Copilot 영역은 MVP에서 가장 매력적인 차별 포인트 중 하나다.
원인 요약과 시나리오 제안이 연결되기 때문이다.

### 개선 방향
지금보다 조금 더 “도구”처럼 보이게 만들 것.

### 추천 구조
**Compass Copilot**  
`Demo reasoning`

- Why did payback drift from D42 to D47?
- CPI on Facebook US increased 12%
- D7 retention fell 0.8pp
- ARPDAU improved 3%

**Suggested next action**
- Reallocate 30% of FB US spend to TikTok test cohort

### 추천 버튼
- **Run scenario**
- **Compare channels**
- **Simulate lower CPI**

### 의도
단순 챗봇처럼 보이는 것이 아니라,
**의사결정 인터페이스**처럼 보여야 한다.

---

## 4.8 Demo Data 표기 명확화

### 현재 문제
샘플 데이터임을 암시하는 요소는 있지만 더 명확해도 좋다.

### 수정 방향
상단 우측 또는 카드 라벨에 아래 배지 중 하나를 삽입.

- **Demo Data**
- **Illustrative Scenario**
- **Static Preview for MVP**

### 이유
심사위원/투자자는 실제 데이터 여부에 민감하므로,
오히려 명확히 밝히는 것이 신뢰에 도움이 된다.

---

## 4.9 계산 논리 한 줄 삽입

### 문제
투자 지표가 어떤 입력을 기반으로 나왔는지 직관적으로 보이지 않음.

### 수정 제안
핵심 카드 하단에 아주 짧게 계산 근거를 넣기.

### 예시
- **Based on D7 retention, CPI, and ARPDAU assumptions**
- **Updated from cohort retention + current UA mix**
- **Forecast derived from sample retention curve and payback target**

### 효과
복잡한 수식 없이도 숫자의 출처가 보이므로 신뢰가 올라간다.

---

## 5. 우선순위별 실행 계획

## 5.1 즉시 수정해야 할 항목

### P0 — 오늘 바로 수정
1. 숫자 모순 제거 (`0 days`, `0 months` 제거)
2. 게임명/차트명/데모 시나리오 통일
3. 랜딩 상단과 하단의 메시지 구조 통일 (3축 vs 4사일로)

### P1 — 이번 주 수정
4. 랜딩 히어로에 실제 대시보드 목업 크게 삽입
5. 추천 액션에 기대효과 숫자 추가
6. KPI 명칭을 투자 언어로 정비
7. 차트 설명을 한 줄 인사이트형으로 변경

### P2 — 다음 단계
8. Copilot 액션 버튼 추가
9. Demo Data 배지 명확화
10. 계산 논리 한 줄 설명 삽입

---

## 6. 바로 반영 가능한 카피 초안

## 6.1 랜딩 히어로 카피

### 헤드라인 안 A
**Turn Game Data into Investment Decisions**

### 헤드라인 안 B
**Should We Invest More? Compass Answers in One Screen.**

### 서브카피
**Compass unifies market intelligence, UA, experiments, and financials into one decision layer for mobile game operators.**

### 보조 문장
**Not another analytics dashboard. A decision layer for capital allocation.**

### CTA
- **View Live Demo**
- **See the Decision Dashboard**

---

## 6.2 사일로 설명 카피

- **Market tells you where the genre is going.**
- **UA tells you what acquisition costs today.**
- **Experiments tell you what changed.**
- **Finance tells you how much room you have left.**
- **Compass turns all four into one investment decision.**

또는 더 공격적으로:

- **UA knows efficiency, not investment value.**
- **Finance knows burn, not experiment impact.**
- **Product knows winners, not capital allocation.**
- **Compass connects all four into one decision.**

---

## 6.3 대시보드 상단 카드 카피

**Investment Status**  
**INVEST MORE**  
82% confidence

**Why**
- D7 retention in genre top 25%
- Payback on track: D47 vs target D60
- Capital efficiency stable at 1.42x

**Recommended Action**
- Scale Reward Calendar experiment from 20% → 50%
- Expected impact: +$120K annualized revenue

**Model Note**
- Based on D7 retention, CPI, and ARPDAU assumptions

---

## 6.4 차트 인사이트 카피

### Revenue vs Investment
**Revenue is outpacing UA spend for 3 straight months.**

### Retention Forecast
**Prediction band tightened after D14 cohort stabilization.**

### Revenue Forecast
**Upside remains positive, but uncertainty widens after D60.**

### Copilot
**Want me to simulate shifting 30% of FB US budget to TikTok?**

---

## 7. 최종 결론

현재 Compass MVP는 방향이 맞다.
핵심 철학도 명확하다.
그리고 무엇보다, **이미 “말하는 서비스”가 아니라 “보여줄 수 있는 서비스” 단계에 와 있다.**

지금 필요한 것은 기능을 더 늘리는 것이 아니라 아래 세 가지다.

1. **신뢰를 해치는 모순 제거**
2. **메시지 일관성 정리**
3. **첫 화면에서 제품감을 더 강하게 전달**

이 세 가지만 정리해도 Compass는 훨씬 더
- 심사자에게는 “실행 가능한 제품”으로,
- 투자자에게는 “카테고리 정의형 도구”로,
- 실무자에게는 “실제로 써보고 싶은 대시보드”로 보이게 된다.

---

## 8. 한 줄 요약

**Compass MVP는 방향이 틀린 것이 아니라, 이제 신뢰감과 완성도를 정리할 단계다.**
