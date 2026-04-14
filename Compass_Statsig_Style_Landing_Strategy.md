# Compass 랜딩페이지 전략 가이드 (Statsig 스타일 적용)

## 0. 목적

이 문서는 Statsig 스타일의 B2B SaaS 랜딩페이지 구조를 참고하되, Compass의 정체성을 유지하면서  
**Hero copy + 이미지 전략 + 섹션별 기능 소개 방식**을 설계하기 위한 제작 지침이다.

---

## 1. 기준이 되는 현재 문구

### English Hero
**Run your game portfolio at the speed of evidence.**  
**Not another dashboard. Your investment decision layer.**  
**Compass turns market, experiment, UA, and financial data into one investment decision layer for game operators.**

### Korean Hero
**데이터 근거로 게임 포트폴리오를 운영하세요.**  
**또 하나의 대시보드가 아닙니다. 투자 판단을 위한 의사결정 레이어입니다.**  
**Compass는 시장, 실험, UA, 재무 데이터를 하나로 연결해 게임 운영자를 위한 투자 의사결정 기반을 제공합니다.**

---

## 2. Statsig에서 가져와야 하는 핵심 구조

Statsig 랜딩페이지의 핵심은 아래 흐름이다.

1. **짧고 강한 Hero headline**
2. **1문장 설명**
3. **실제 제품이 보이는 Hero visual**
4. **고객 로고/신뢰 구간**
5. **Integrated products 섹션**
6. **각 제품군을 큰 이미지 + 짧은 설명으로 반복 소개**
7. **Case study / proof**
8. **Pricing / CTA**

Statsig는 “무슨 기능이 있나?”보다  
**“하나의 플랫폼이 여러 제품군을 통합한다”**는 인상을 강하게 준다.  
Compass도 이 방식은 맞지만, Statsig와 달리 제품 구조의 맨 앞에 **investment decision**이 와야 한다.

즉 Compass는 다음 순서가 맞다.

**Decision → Why → Product Modules → Proof → Explanation → CTA**

---

## 3. Compass에 맞는 랜딩페이지 핵심 전략

Statsig처럼 만들되, Compass는 반드시 아래 3가지를 사용자에게 첫 화면 근처에서 이해시켜야 한다.

### A. 이건 분석 툴이 아니라 의사결정 툴이다
- Not another dashboard
- investment decision layer
- Can we invest more?

### B. 4개 데이터 영역을 연결한다
- market
- UA
- experiments
- financials

### C. 실험 결과를 투자 가치로 번역한다
- ATE → ΔLTV
- payback
- capital efficiency
- next action

즉 Compass 랜딩페이지는 “기능 소개 페이지”가 아니라  
**게임 포트폴리오 운영을 위한 의사결정 시스템 소개 페이지**여야 한다.

---

## 4. 추천 랜딩페이지 구조

## Section 1 — Hero
### 목표
사용자가 5초 안에 아래를 이해해야 한다.
- 게임 사용 제품이다
- 대시보드가 아니다
- 투자 판단을 위한 제품이다

### 카피
**Run your game portfolio at the speed of evidence.**  
**Not another dashboard. Your investment decision layer.**  
Compass turns market, experiment, UA, and financial data into one investment decision layer for game operators.

### Hero 이미지 전략
Statsig처럼 “실제 제품이 보이는 큰 Hero visual”을 사용한다.

### 추천 Hero 이미지 구성
한 장에 너무 많은 기능을 보여주지 말고, 아래 3요소만 크게 보이게 crop한다.

- **Investment Signal**  
  예: Invest More / 82% confidence
- **Payback KPI**  
  예: Payback D47
- **Next Action**  
  예: Scale Reward Calendar experiment to 50%

### 피해야 할 것
- 작은 차트 여러 개를 전부 노출
- 5개 모듈을 한 번에 다 보여주기
- 글씨가 안 읽히는 전체 스크린샷
- 표나 탭이 많은 enterprise 화면을 hero에 그대로 넣기

### Hero 하단 보조 포인트 3개
Hero headline 아래 작은 3개 bullet / pill / mini-card로 아래를 넣는 것을 권장:

- Forecast investment outcomes with confidence
- See your market gap clearly
- Translate experiment wins into capital decisions

---

## Section 2 — Why current tools fail
### 목표
왜 Compass가 필요한지 설명

### 구조
Statsig처럼 기능을 먼저 길게 풀지 말고, 현재 시장의 disconnected workflow를 보여준다.

### 추천 카피
**Every team has data. Nobody connects it.**

### 카드 4개
- Market → knows external benchmarks
- UA → knows acquisition efficiency
- Product → knows which variant won
- Finance → knows burn and runway

### 마지막 문장
**Compass connects all four into one investment decision.**

### 이미지
- 회색 silo cards
- 화살표가 끊긴 diagram
- 중앙에 Compass가 연결하는 before/after graphic

---

## Section 3 — What Compass actually answers
### 목표
기존 SaaS들이 답하지 못하는 질문을 Compass가 답한다고 보여줌

### 추천 질문 카드 4개
- Should we invest more right now?
- Why did payback drift?
- Where are we below market?
- Which experiment created investment value?

### 이미지 전략
텍스트만 두지 말고, 각 질문 옆에 미니 스크린샷/annotation을 붙인다.

예:
- Invest More badge
- Payback drift panel
- Market gap chart preview
- Experiment translation diagram

---

## Section 4 — Integrated product modules
Statsig의 “Integrated products” 섹션을 Compass식으로 변형한 핵심 섹션

### 섹션 헤드라인
**There’s a smarter way to run a game portfolio.**

### 설명
Compass gives operators a unified decision layer across market intelligence, UA, experiments, and financials.

### 추천 모듈 4개
#### 1. Investment Signal
- Can we invest more?
- Shows confidence, payback, and current capital efficiency

#### 2. Market Gap
- Where do we stand versus genre benchmarks?
- Highlights underperformance and headroom

#### 3. Experiment Value
- Which tests actually moved LTV?
- Translates A/B results into investment value

#### 4. Decision Copilot
- Why did the metric move?
- Explains what changed and recommends the next action

### 이미지 전략
Statsig처럼 **각 모듈마다 큰 제품 이미지 1개 + 짧은 설명 1개** 구조를 반복한다.

---

## Section 5 — Product proof with current dashboard
### 목표
현재 데모의 가장 강한 장면을 랜딩페이지의 핵심 증거로 사용

### 추천 섹션 제목
**One screen for the decision that matters most.**

### 보여줄 요소
- investment status
- confidence
- payback range
- top reasons behind the signal
- next action recommendation

### 카피 예시
Compass gives game operators one investment signal, the evidence behind it, and the next action to take.

### 이미지 전략
여기는 Hero보다 조금 더 넓은 crop 사용 가능.
단, 여전히 아래 5개만 강조:
- signal card
- confidence
- payback
- reasons
- recommendation

---

## Section 6 — Three chart stories
Statsig가 제품군을 각각 큰 이미지로 소개하는 방식처럼, Compass는 차트를 각각 “기능 이야기”로 소개해야 한다.

### Chart Story A — Revenue vs Investment
#### Headline
**See whether growth is paying back.**

#### 설명
Compare revenue, UA spend, and break-even dynamics in one view — so capital decisions are grounded in actual efficiency.

#### 이미지 전략
- Revenue line
- UA spend line
- break-even reference
- ROI / ROAS annotation

---

### Chart Story B — Retention Forecast
#### Headline
**Retention, with real confidence.**

#### 설명
Forecast D1–D60 retention with P10/P50/P90 bands, so you see both the expected path and the uncertainty around it.

#### 이미지 전략
- fan chart 확대
- P10 / P50 / P90 라벨
- “top 25% in genre” badge

---

### Chart Story C — Revenue Forecast
#### Headline
**Forecast outcomes, not hopes.**

#### 설명
See downside, base case, and upside scenarios as probability ranges instead of a single fragile number.

#### 이미지 전략
- future forecast band
- conservative / expected / upside 라벨
- uncertainty 설명 한 줄

---

## Section 7 — Explainability / Copilot
### 목표
숫자만 보여주는 대시보드와 다르다는 점을 강조

### 섹션 제목
**Know what changed — before you change the budget.**

### 설명
Compass explains why payback moved, what changed in retention or CPI, and how much those changes matter.

### 추천 UI 요소
- “Why did payback drift from D42 to D47?”
- CPI +12%
- D7 retention −0.8pp
- ARPDAU +3%

### 이미지 전략
- 오른쪽 explanation card / copilot panel
- 텍스트는 길지 않게, 핵심 bullet만 강조

---

## Section 8 — Experiment-to-investment translation
### 목표
Statsig와 가장 차별화되는 부분을 명확히 말함

### 섹션 제목
**Experiments don’t just ship. They move capital.**

### 설명
Compass translates experiment results into ΔLTV, payback movement, and capital efficiency — so winning tests become funding decisions.

### 이미지 전략
단순 표보다 pipeline diagram이 좋다.

**Experiment Result → ΔLTV → Payback → Recommendation**

### 포인트
여기서 “hit rate”를 전면에 두지 않는다.  
Compass는 “얼마나 많이 이겼나”보다  
**“무엇이 실제 투자 가치를 만들었나”**를 말해야 한다.

---

## Section 9 — Comparison
### 목표
카테고리 정의

### 추천 제목
**Built for decisions, not just measurement.**

### 비교 대상
- Analytics dashboards
- Experimentation tools
- Financial reporting tools
- Compass

### 비교 문장 예시
- Analytics tells you what happened
- Experimentation tells you which variant won
- Finance tells you what was spent
- Compass tells you whether to invest more

---

## Section 10 — CTA
### 목표
book demo 또는 product tour로 연결

### 추천 CTA 문구
- **See the decision demo**
- **Try Compass**
- **Book a live demo**

### 보조 문구
See how Compass turns game data into investment decisions.

---

## 5. 이미지 제작 원칙

### 원칙 1
**Hero는 “결정”을 보여준다.**

### 원칙 2
중간 섹션은 “근거 차트”를 보여준다.

### 원칙 3
하단 섹션은 “왜 이 결론인지”와 “무엇을 할지”를 보여준다.

### 원칙 4
한 섹션당 핵심 이미지 1개만 사용한다.
Statsig처럼 각 섹션은 큰 이미지 하나가 중심이어야 한다.

### 원칙 5
스크린샷은 실제 제품 화면을 쓰되, 반드시 읽히도록 crop / 확대 / annotation 해야 한다.

---

## 6. 최종 추천 구조 요약

### Above the fold
- Hero copy
- Signal-focused screenshot
- CTA
- 3개 보조 포인트

### Mid page
- Why current tools fail
- Questions Compass answers
- 4 module overview

### Lower page
- Executive overview proof
- 3 chart stories
- Copilot explanation
- Experiment-to-investment translation

### Bottom
- comparison
- CTA

---

## 7. 결론

Statsig처럼 보이게 만드는 핵심은 단순히 dark theme나 카드 UI가 아니다.

핵심은:
- **짧은 headline**
- **제품이 보이는 큰 이미지**
- **통합 플랫폼처럼 보이는 구조**
- **각 기능을 이미지와 함께 반복 소개**
- **고객/성과/증거를 중간중간 배치하는 흐름**

Compass는 여기에 한 가지를 더해야 한다.

Statsig가 “product development platform”이라면,  
Compass는 반드시 **investment decision layer for game operators**로 읽혀야 한다.

즉 랜딩페이지 전체의 질문은 기능 소개가 아니라 이거다:

**Can this product help a game operator decide where to invest next?**

그 질문에 yes라고 느껴지면 방향이 맞다.
