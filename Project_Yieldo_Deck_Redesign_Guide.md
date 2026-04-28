# yieldo — Deck 리디자인 가이드

**용도**: 다음 세션에서 `Project_Yieldo_Deck_v2.html`을 제작할 때 이 문서를 참조

---

## 1. 현재 → 목표

```
현재: 18슬라이드, 기술 4장 연속으로 내러티브 끊김
목표: 12슬라이드 + 부록 4장, 투자자 관점 스토리텔링
```

## 2. 슬라이드 구조 (12 + 부록)

| # | 슬라이드 | 핵심 | 현재 대비 변경 |
|---|---|---|---|
| 01 | Title | 유지 | — |
| 02 | Problem | "4개 사일로, 답 없음" | 운영자 인용문 1개 추가 |
| 03 | Solution | Before/After 비교 | "하지 않는 것" → 부록, Before→After 추가 |
| 04 | How It Works | "D7 → 투자 결정" 3단계 | **기술 4장(03-06) → 1장으로 통합** |
| 05 | Why Now | 카드별 헤드라인+숫자 1개 | 본문 축소, 임팩트 강화 |
| 06 | Market | TAM/SAM + 상향식 계산 | 계산 수식 명시 추가 |
| 07 | Product | 스크린샷 + 5모듈 아이콘 | **prototype_dashboard.html 캡처 활용** |
| 08 | Competition | 포지셔닝 맵 | "내부 BI팀" 경쟁자 강조 추가 |
| 09 | Business Model | 3-Phase + 단위 경제 | 유지 |
| 10 | Team + Traction | 창업자 적합성 + 성과 | 채용 계획 → 현재 2인 팀 + 실적 |
| 11 | Financials | 유지 | — |
| 12 | The Ask + Vision | 구체 금액 + 비전 | **TBD → 구체 금액/범위** |

| 부록 | 내용 |
|---|---|
| A1 | Retention Prediction Engine (5대 성질, LSTM, Prior→Posterior) |
| A2 | Revenue Modeling + A/B Test → Investment Translation |
| A3 | Platform Integration Architecture (4 Silo 브릿징) |
| A4 | Detailed 3-Year Roadmap |

## 3. 슬라이드별 제작 지침

### Slide 02: Problem
```
현재: 4개 사일로 카드 (동일 비중)
변경: 
  - 상단: 운영자 인용문 (큰 따옴표)
    "매달 4개 도구에서 데이터를 모아 엑셀로 취합하고,
     3번의 회의를 거쳐야 '더 투자할지' 결정할 수 있습니다"
  - 하단: 4개 사일로 카드 (유지, 약간 축소)

  [추가 메시지]: 실험 승리 ≠ 투자 가치
  - "A/B 테스트에서 이겼다 = 돈을 더 써도 된다?" → NO
  - 실험 결과를 ΔLTV · 페이백 · IRR로 번역하지 않으면
    '승리한 실험'도 잘못된 자본 배분으로 이어질 수 있다
  - 현재 어떤 도구도 실험 결과를 투자 가치로 번역하지 않는다
```

### Slide 03: Solution
```
현재: 번역 레이어 설명 + "하지 않는 것" 4개
변경:
  - Before/After 대비 구조
    Before: 4개 도구 · 3번 회의 · 2주 소요 · 직감 결정
    After:  1개 대시보드 · 1개 시그널 · 실시간 · 근거 기반 결정
  - "하지 않는 것"은 부록 또는 구두 설명
```

### Slide 04: How It Works (기술 4장 → 1장)
```
3단계 다이어그램:

  [Your Data]           [yieldo AI]                    [Investment Decision]
  MMP (CPI, ROAS)  →    리텐션 예측                →     ● GREEN: Increase rollout
  실험 (ATE)        →    ATE → ΔLTV → Exp ROI 번역  →     Payback: D47 (D38-D62)
  재무 (Burn Rate)  →    시나리오 시뮬               →     "UA 15% 증가 권장"

핵심 번역 파이프라인 (강조):
  실험 결과 (ATE: +3.6pp D7 retention)
    → ΔLTV per user: +$0.38
    → 연간 추가 매출: +$1.08M (예상 롤아웃 기준)
    → 실험 ROI: 54x
    → 결정: "롤아웃 확대" vs "추가 검증 필요"

하단 콜아웃:
  "실험 승리를 투자 가치로 자동 번역 — ATE → ΔLTV → Experiment ROI"
  "D7 데이터로 365일 매출을 예측 — 신뢰 범위 포함"
  "$1.08M 연간 매출 증가 / 실험 ROI 54x" ← 가장 강력한 숫자
```

### Slide 07: Product
```
현재: 5개 모듈 텍스트 카드
변경:
  - 좌측 60%: prototype_dashboard.html 스크린샷 (또는 재현)
    → Module 3(Actions) 또는 Module 4(Experiments) 화면 우선 표시
    → 실험 ROI / ATE → ΔLTV 번역이 보이는 상태
    → Signal Card는 보조 (요약 레이어임을 시각적으로 표현)
  - 우측 40%: 5개 모듈 아이콘 + 한줄 설명
    ◉ Overview    "현재 투자 포지션은?" (요약)
    ○ Market Gap  "시장 대비 어디로 향하는가?"
    ○ Actions     "어떤 액션이 가치를 만드는가?" ← 가치 창출 레이어
    ○ Experiments "실험이 투자 가능성을 높이는가?" ← 가치 창출 레이어
    ○ Capital     "다음 예산은 어디로 옮기나?"

  [캡션 추가]:
  "Overview는 요약 — 실제 가치 창출 근거는 Actions·Experiments 모듈에서 올라온다"
```

### Slide 08: Competition
```
현재: 포지셔닝 맵 + "내부 BI팀" 경쟁자 강조
변경:
  경쟁자 카테고리를 4개로 명확히 구분:

  1. 시장 인텔리전스    Sensor Tower, AppMagic, data.ai
     → "무슨 일이 있는가?" — 관찰 레이어, 결정 불가

  2. MMP/어트리뷰션     AppsFlyer, Adjust, Singular
     → "어디서 유저가 오는가?" — 단일 사일로, 투자 가치 번역 불가

  3. 실험 플랫폼        Statsig, Firebase, Optimizely
     → "어떤 변형이 이겼는가?" — 실험 승리 ≠ 투자 가치 번역 불가

  4. Funding Intelligence  (신규 카테고리 — yieldo가 정의)
     Visible.vc, Mosaic, Runway
     → 재무 건전성 모니터링 도구. 게임 인터벤션 효과와 연결 불가.
     → "yieldo와 카테고리가 다름": yieldo는 인터벤션 → 투자 가치 번역,
        Funding Intelligence는 재무 상태 보고

  [포지셔닝 메시지]:
  "yieldo는 위 4개 카테고리 어디에도 속하지 않는다.
   실험 결과·UA 성과·시장 맥락을 통합해 '이 인터벤션이 투자할 가치가 있는가'를
   답하는 유일한 플랫폼."
```

### Slide 10: Team + Traction
```
현재: Founder-Market Fit + 5명 채용 계획
변경:
  - 좌측: 창업자 프로필
    "리텐션 5대 성질 이론 원 저자 · 게임 업계 데이터 전략 경험"
  - 우측: Traction to Date
    □ 운영자 인터뷰 N회 완료
    □ 파일럿 고객 N사 확보
    □ MVP 설계 문서 완성 (8개 문서 체계)
    □ 8주 MVP 로드맵 확정
```

### Slide 12: The Ask + Vision
```
현재: TBD + 별도 Vision 슬라이드
변경:
  - 상단: "[금액] 시드 라운드" (구체 숫자)
  - 중앙: Use of Funds (3-4항목 비율 바)
    Product Development 50% | Data & AI 25% | GTM 15% | Operations 10%
  - 하단: Vision 한줄
    "모바일 게임의 투자 결정을 과학으로 바꾸는 OS"
```

## 4. 기술 용어 → 투자자 언어 변환표

| 기술 용어 | 투자자 언어 |
|---|---|
| LSTM + Attention + MC Dropout | "D7 데이터로 1년 매출을 예측하는 AI" |
| P10/P50/P90 크레디블 인터벌 | "보수적/기대/낙관적 시나리오 범위" |
| 베이지안 Prior + Posterior | "시장 평균으로 시작, 실제 데이터로 정밀화" |
| ATE → ΔLTV → ROI | "실험 결과를 금전 가치로 자동 번역" |
| NumPyro + scipy | "학술적으로 검증된 예측 엔진" |
| 5대 성질 (P1-P5) | "게임 리텐션의 5가지 수학적 법칙" |
| Customer-Authorized Agent | "고객이 자기 데이터를 위임하는 표준 SaaS 모델" |

## 5. 비주얼 가이드라인

```
유지:
  ✅ 다크 모드 (투자자 미팅/데모데이 최적)
  ✅ Inter 폰트
  ✅ 현재 색상 팔레트 (blue/green/orange/red/purple)
  ✅ 카드 기반 레이아웃
  ✅ 포지셔닝 맵

변경:
  📐 본문 폰트 18px 이상 (현재 13.5px → 너무 작음)
  📐 카드 내 텍스트도 14px 이상
  📐 슬라이드당 카드 3개 이하 (현재 4-5개 → 시선 분산)
  📐 일부 슬라이드에 전체 너비 비주얼 사용 (모든 슬라이드가 그리드면 단조로움)
  📐 스크린샷/목업 슬라이드 1개 이상 추가
```

## 6. 다음 세션 실행 방법

```
1. 이 가이드를 읽는다
2. 기존 Deck.html을 archive에 복사
3. Project_Yieldo_Deck_v2.html을 12슬라이드 + 부록으로 신규 제작
4. prototype_dashboard.html의 스크린샷을 Product 슬라이드에 활용
5. 브라우저에서 확인 후 반복 수정
```

## 7. 예비창업패키지 대응

```
투자자 덱 (Deck_v2.html):  다크 모드, 12슬라이드, 영문 가능
정부 지원 덱 (별도 제작):  라이트 모드, 한글 전용, 15-20슬라이드
                            기술 혁신 깊이 + 시장 검증 근거 강조
                            인쇄 최적화 (다크 배경 제거)
```
