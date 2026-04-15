# Market Gap — P3 이중 레이어 구현 Spec

**Date**: 2026-04-14
**Module**: Market Position (Module 2)
**Predecessor**: `2026-04-14-market-gap-bayesian-loadbearing-diagnosis.md` (진단 → P3 채택)
**Status**: Implementation-ready (디자인 결정 정리, 코드 구현은 별도 세션)

---

## 1. P3의 본질

진단 결과 "베이지안이 부분 load-bearing(43%)" — 라벨은 명시적이지만 cyclic update process가 미가시.

**P3 처방 = 두 audience를 동시에 만족**:
- **Layer 1 (기본 UI, operator 언어)**: "Prior/Posterior" 학술 용어 제거, "**장르의 기대치 / 우리의 증명**" 으로 표현. 운영자가 베이지안을 몰라도 페이지가 self-evident
- **Layer 2 (Methodology 토글, 분석 언어)**: ⓘ 또는 "방법론 보기" 토글로 cyclic update timeline 노출. 투자자/심사위원/CTO 레벨 audience용 증명력

이 spec은 두 레이어 각각의 디자인 결정을 정리.

---

## 2. 비즈니스 언어 오버레이 — Alpha는 L2 signature mechanism (잠정, 외부 검증 대기)

**2026-04-15 재조정 (brainstorming 결과)**: Alpha를 top-line positioning으로 밀었던 어제 결정 철회. Alpha는 **Compass Decision OS의 signature mechanism**이며 **L2(Methodology / Investor Pitch) 레이어 전용**. Compass의 top-line은 CLAUDE.md §1 원본 "Experiment-to-Investment Decision OS for mobile gaming" 그대로 유지.

상세 근거: `2026-04-15-compass-positioning-language-layering-design.md`

이 프레임은 P3 Layer 1(operator UI)에는 노출하지 않고, Layer 2(methodology 토글 내부)에서만 작동. Layer 1은 의사결정 언어(Invest/Hold/Reduce 신호)로 통일.

### 2.1 3-layer 용어 매핑

| 통계 레이어 (원전) | 금융 Alpha 모델 | Compass operator 언어 (Layer 1) | 의사결정 의미 |
|---|---|---|---|
| **Prior (사전 확률)** | Benchmark / Consensus / Beta | **시장 컨센서스** (장르 median) | "시장이 이 장르에 매기는 최소 기대치" |
| **Posterior (사후 확률)** | Actuals / Realized Return | **우리 실적** (코호트 실측) | "우리가 증명한 실제 성과" |
| **Gap** | **Alpha / Outperformance / Beat** | **Alpha** (초과 성과) | **시장이 우리에게 매기는 edge — 추가 자본 투입 정당화 신호** |
| **Cyclic Update (loop)** | Alpha Persistence | **Alpha 지속성 검증** | "우리 edge가 시간 지나도 유지되는가" |

### 2.2 Compass 제품 포지셔닝에의 함의

이 프레임이 CLAUDE.md §12 "Capital Allocation Intelligence" 카테고리 정의와 정확히 정합:

- Sensor Tower / AppMagic → **시장 데이터** 제공자
- AppsFlyer / Adjust → **Attribution** 제공자
- Statsig / Firebase → **실험 데이터** 제공자
- **Compass → Alpha 측정 + 지속성 검증 인프라** ← 이 포지션이 P3에서 드러남

Market Gap 페이지는 Compass의 "alpha 측정 인프라" 정체성을 **한 화면으로 증명**하는 역할.

### 2.3 Signal-type별 Alpha 해석

| 게임 / 판정 | Statistical 표현 | Alpha 해석 | 의사결정 |
|---|---|---|---|
| Match League (INVEST) | Posterior > Prior (+31%) | **Positive Alpha** 생성 | 자본 투입 정당화 — "edge가 있으므로 확대" |
| Weaving Fairy (HOLD) | Posterior ≈ Prior | **Alpha ≈ 0** (at-market) | 유지 관찰 — "시장 평균 수준, 새 edge 신호 대기" |
| Dig Infinity (REDUCE) | Posterior < Prior (-19%) | **Negative Alpha** | 포지션 축소 — "시장 기대치도 미달, 자본 회수" |

→ 현재 페이지의 `MarketHeroVerdict`가 보여주는 Invest/Hold/Reduce 판정이 Alpha의 부호와 정확히 대응. Alpha 프레임을 드러내면 판정 로직이 자명해짐.

### 2.4 Cyclic Update의 비즈니스 의미

Round 4에서 확정된 "순환 구조" 진단이 Alpha 프레임에서는 **Alpha Persistence Check**로 재정의:

```
초기 Beta (장르 prior)
  ↓ + 첫 cohort 데이터
첫 Alpha 측정 (posterior 1)
  ↓ posterior 1이 다음 Beta로 흡수 (시장이 우리 증명을 반영)
두 번째 Alpha 측정 (posterior 2)
  ↓ posterior 2가 다음 Beta로 흡수
...
Alpha가 시간 지나도 생성되면 → Persistent Alpha (진짜 edge)
Alpha가 소멸하면 → Transient Alpha (운/노이즈)
```

Layer 2 Methodology 패널은 따라서 "베이지안 belief update"가 아니라 **"Alpha Persistence 검증 — 베이지안 모델 기반"** 으로 포지셔닝. 분석가 audience에게 훨씬 설득력 있음.

---

## 3. Layer 1 — Operator UI 변경 (즉시 가시 부분)

**2026-04-15 재조정**: §2 Alpha 프레임은 L2 전용. Layer 1은 의사결정 언어로 재구성.

### 3.1 용어 치환표 (L1 규칙 적용, Alpha 제거)

**핵심**: L1(operator UI)에서 Alpha/Prior/Posterior/Bayesian 용어 사용 금지. Alpha는 L2 methodology 패널에서만 등장.

| 위치 | 현재 (통계 용어) | L1 조정안 (operator 의사결정 언어) | en |
|---|---|---|---|
| 차트 제목 | Prior vs Posterior · 베이지안 추론 | **시장 기대치 vs 우리 실적** | Genre Expectation vs Our Actuals |
| 범례 (prior side) | Prior (장르 벤치마크) | **장르 기대치 (median, D{n})** | Genre Expectation (median, D{n}) |
| 범례 (posterior side) | Posterior (우리 데이터) | **우리 실적 (코호트 관측 ±CI)** | Our Actuals (cohort observed ±CI) |
| Gap 표시 | (없음) | **"우리 우월 +31%"** / **"우리 부족 −19%"** | "+31% outperforming" / "−19% underperforming" |
| 판정 신호 | (없음) | **"Invest 신호 / Hold 신호 / Reduce 신호"** (HeroVerdict와 1:1) | "Invest/Hold/Reduce signal" |

**L2 methodology 패널**에서만 Alpha · Posterior · Prior · Bayesian 용어 허용. 관련 세부: `2026-04-15-compass-positioning-language-layering-design.md` §4.

### 3.2 색상 (Revenue Forecast와 정합)

`feedback_chart_specs` + `project_revenue_forecast_decisions` 메모리에 따라 통일:

| 의미 (L1 언어) | 색상 | 용도 |
|---|---|---|
| 장르 기대치 | **빨강 `#C9372C` 8% fill, 점선 hatched** | 넓은 불확실성, "출발선 비교" |
| 우리 실적 | **초록 `#00875A` 14% fill, 실선** | 좁은 확신, "증명된 현실" |
| 격차 (우월/부족 표시) | **파랑 `#5B9AFF`** | "+31% 우월 / −19% 부족" accent |
| Operator 판정 신호 | Invest(초록) / Hold(슬레이트) / Reduce(빨강) | HeroVerdict와 동일 팔레트 |

### 3.3 Insight 텍스트 (L1 의사결정 언어)

**2026-04-15 재조정**: Alpha 단어 L1에서 제거. Invest/Hold/Reduce 판정 신호로 통일 (HeroVerdict와 1:1). 금융 용어는 L2 methodology에서만.

```
Match League (INVEST):
"D7 retention — 장르 기대치 14.2, 우리 실적 18.7.
 장르 평균 대비 +31% 우월 — Invest 신호.
 (추가 자본 투입 정당화)"

Weaving Fairy (HOLD):
"D7 retention — 장르 기대치 14.2, 우리 실적 14.8.
 장르 평균 ±4% — Hold 신호.
 (새 우위 신호 대기 중)"

Dig Infinity (REDUCE):
"D7 retention — 장르 기대치 14.2, 우리 실적 11.5.
 장르 평균 대비 −19% 부족 — Reduce 신호.
 (포지션 축소 검토)"
```

→ 신호 레이블이 Module 1 HeroVerdict 판정과 1:1. L2 methodology 패널 열면 이 판정을 "Alpha Persistence 기반"으로 기술 재설명.

### 3.4 Layer 1 컴포넌트 변경

| 파일 | 변경 |
|---|---|
| `widgets/charts/ui/prior-posterior-chart.tsx` | 제목·범례·데이터 라벨 모두 operator 언어로. 색상 토큰 `MARKET_GAP_PROOF_COLORS` 신설 |
| `shared/i18n/dictionary.ts` | `market.priorPosterior` → `market.expectVsProven` 등 키 신설 (기존 키 유지하되 deprecated 표시) |
| `shared/config/chart-colors.ts` | `MARKET_GAP_PROOF_COLORS` 추가 (Revenue Forecast 색상과 정합) |
| `widgets/dashboard/ui/market-hero-verdict.tsx` | "장르 기대치 X → 우리 증명 Y → 격차 Z%" 한 줄 인사이트 표시 |

---

## 3. Layer 2 — Methodology 패널 (Cyclic Update 시각화)

### 3.1 Trigger UI

`info-hint.tsx` 패턴 확장 — ⓘ 클릭 시 단순 텍스트가 아닌 **인터랙티브 패널** 오픈:

```
[ⓘ Methodology — Alpha Persistence 검증 보기]
       ↓ click
┌─────────────────────────────────────────────────────────┐
│  방법론: Alpha Persistence (베이지안 모델 기반)           │
│  ─────────────────────────────────────                   │
│  [Cyclic Update Timeline Component]                      │
│  D0 → D7 → D14 → D30 → D60 (slider/scrubber)            │
│  각 step에서 우리 실적이 시장 컨센서스를 업데이트하며     │
│  Alpha가 지속되는지 측정. 밴드가 좁아질수록 Alpha 신뢰도↑ │
│  ─────────────────────────────────────                   │
│  📚 Compass는 매 cohort 도착 시 Bayesian posterior       │
│     update를 수행해 시장 컨센서스(prior)가 우리 실적     │
│     (posterior)으로 재학습되는 구조. 시간이 지나도 Alpha │
│     가 지속된다면 = Persistent Alpha (진짜 edge).         │
│     사라지면 = Transient Alpha (운/노이즈).              │
│     (CLAUDE.md §4 Bayesian Decision Framework)           │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Cyclic Update Timeline 컴포넌트 (신설)

**핵심 시각화 요구사항**:

```
시간축 (X): D0 → D7 → D14 → D30 → D60 → D90
세로축 (Y): retention rate

D0 시점:
  ├─ Prior 밴드 ████████████████  (매우 넓음, 회색/빨강 hatched, 장르 prior만)
  └─ Posterior 데이터 없음

D7 시점:
  ├─ Prior 밴드 ████████████      (살짝 좁아짐 — D7 cohort 1개 update)
  ├─ Observed marker × (D7 첫 관측치)
  └─ Posterior 밴드 등장 ████     (좁고 초록)

D14 시점:
  ├─ Prior 밴드 ████████          (더 좁아짐)
  ├─ Posterior 밴드 ███           (더 좁아짐)
  └─ "이전 posterior가 다음 prior로 흡수" 화살표 시각화

D30 시점:
  └─ Prior와 Posterior가 거의 수렴

slider/scrubber로 시간 진행 조작 → "내가 어떤 시점에 의사결정했는지" 시뮬레이션
```

**기술 결정**:
- Library: Recharts (기존 차트와 정합) + Framer Motion으로 step-by-step 애니메이션
- 데이터 형태: `Array<{ day: number, prior: {p10, p50, p90}, posterior: {p10, p50, p90} | null, observed: number | null }>`
- 인터랙션: 자동 재생 + slider drag + step 클릭 (3가지 입력 방식)
- 키: 각 step에서 Prior가 어떻게 update되는지 화살표/transition으로 명시

### 3.3 Mock 데이터 확장

게임당 시계열 데이터 신설 (`mock-data.ts`):

```ts
type CyclicUpdateStep = {
  day: number              // 0, 7, 14, 30, 60, 90
  cohortLabel: string      // "D7 cohort 1차 관측"
  prior: { p10: number; p50: number; p90: number }  // 장르 prior (점차 좁아짐)
  posterior: { p10: number; p50: number; p90: number } | null  // null = 아직 데이터 없음
  observed: number | null  // 실제 관측치 marker
  narrative: { ko: string; en: string }  // step별 한 줄 설명
}

export const mockCyclicUpdate: Record<gameId, CyclicUpdateStep[]>
```

### 3.4 Layer 2 컴포넌트

| 파일 | 변경 |
|---|---|
| `widgets/charts/ui/cyclic-update-timeline.tsx` | **신규** — 시계열 belief update 시각화 |
| `shared/ui/methodology-panel.tsx` | **신규** — info-hint 확장형, 차트+텍스트 컨테이너 |
| `widgets/charts/ui/prior-posterior-chart.tsx` | Methodology 패널 trigger 추가 |
| `shared/api/mock-data.ts` | `mockCyclicUpdate` 신설 |
| `shared/i18n/dictionary.ts` | `methodology.bayesian.{title, intro, steps...}` 키 추가 |
| `shared/config/chart-colors.ts` | `CYCLIC_UPDATE_COLORS` 추가 |

---

## 4. 두 Layer 통합 UX 흐름

```
User lands on Market Gap page
  ↓
Layer 1 (default, operator 언어):
  "장르의 기대치 vs 우리의 증명" 차트 + 의사결정 인사이트
  → 운영자는 베이지안 몰라도 페이지 의미 즉시 파악
  ↓
좌측 상단 [ⓘ Methodology] 인지 (눈에 띄지만 강요되지 않음)
  ↓ (선택적 클릭)
Layer 2 (Methodology 패널):
  Cyclic Update Timeline + 텍스트 설명
  → 분석가/투자자/CTO가 "이거 진짜 베이지안이네" 확인
  ↓ (패널 닫기)
다시 Layer 1으로 복귀
```

핵심 원칙:
- Layer 1만 봐도 페이지 활용 가능 (operator 보호)
- Layer 2가 enabling이지 blocking이 아님 (모르는 사람은 그냥 안 봐도 됨)
- 두 Layer 사이의 정보가 모순되지 않음 — Layer 2의 D30 posterior가 Layer 1의 "우리 증명"과 정확히 일치

---

## 5. 비-목표 (Non-Goals)

명시적으로 제외:
- **실시간 cohort 업데이트** — mock 단계에선 정적 시계열로 충분
- **Bayesian update 수식 노출** — operator도 분석가도 수식엔 관심 없음
- **다른 페이지(Revenue Forecast, Capital)에 cyclic timeline 이식** — 차후 별도 spec
- **prior 데이터 소스 출처(GameAnalytics 2024 등) 인용 표기** — Phase 2 작업

---

## 6. 수용 기준 (Acceptance Criteria)

Layer 1 (Operator 의사결정 언어, Alpha 미노출):
- [ ] PriorPosteriorChart 제목·범례·데이터 라벨에 학술 용어(Prior/Posterior/베이지안/Alpha) 잔존 0
- [ ] 차트 제목·범례가 "장르 기대치 / 우리 실적" 언어 채택
- [ ] 색상 매핑이 Revenue Forecast의 `REVENUE_FORECAST_COLORS`와 일관 (초록=우리 실적, 빨강=장르 기대치, 파랑=격차 accent)
- [ ] MarketHero 또는 차트 인사이트에 동적 의사결정 문장 ("장르 평균 대비 ±Z% — {Invest/Hold/Reduce} 신호")
- [ ] 판정 신호가 Module 1 HeroVerdict의 Invest/Hold/Reduce와 1:1 대응
- [ ] Operator가 '베이지안'/'Prior'/'Posterior'/'Alpha' 단어를 **한 번도 보지 않고** 페이지 사용 가능

Layer 2 (Methodology 패널 — Alpha 용어 허용):
- [ ] Methodology 토글 trigger 텍스트가 i18n 키 `methodology.signatureMetric.triggerLabel` 단일 참조 (잠정값 "Alpha Persistence 검증 보기", 외부 검증 후 교체 가능)
- [ ] Cyclic Update Timeline에서 시간 step 변경 시 우리 실적 band 폭과 판정 재측정이 시각적으로 명확
- [ ] D0 → D7 → ... 진행 시 "이전 실적이 다음 장르 기대치로 흡수"되는 화살표/transition 가시화
- [ ] 패널 콘텐츠에 "Persistent vs Transient" 신호 지속성 개념 설명 포함
- [ ] 패널 콘텐츠가 한국어/영어 모두 작동 (i18n 완비)
- [ ] L1/L2가 동일 데이터 source를 가리키며 시각 anchor(색상) 일관

통합:
- [ ] Layer 2 D30 posterior 값과 Layer 1 차트의 같은 데이터 일치 (모순 없음)
- [ ] `npx tsc --noEmit` 통과
- [ ] Match League / Weaving Fairy / Dig Infinity 모두 게임별 cyclic update 데이터 존재

---

## 7. 구현 순서 (제안)

1. **Mock 데이터 확장** (1h) — `mockCyclicUpdate` 시계열 게임 4종 작성
2. **색상 토큰** (15min) — `MARKET_GAP_PROOF_COLORS` + `CYCLIC_UPDATE_COLORS`
3. **i18n 키** (30min) — operator 언어 + methodology 텍스트
4. **Layer 1 — `prior-posterior-chart.tsx` 리프레임** (1h) — 제목·범례·색상 교체
5. **Layer 1 — MarketHero 동적 인사이트** (45min)
6. **Layer 2 — `cyclic-update-timeline.tsx` 신규 컴포넌트** (3-4h) — 가장 큰 작업
7. **Layer 2 — `methodology-panel.tsx` 컨테이너** (1h)
8. **통합 — trigger 연결 + 검증** (1h)

총 예상: **8-9시간** (1-2 세션)

---

## 8. 위험 요소

- **Cyclic Update Timeline의 시각 디자인이 결정적**: Recharts 만으로 어렵고 D3 또는 visx 검토 필요할 수 있음. 너무 복잡하면 P3가 P2로 후퇴할 수도
- **Mock 데이터의 베이지안 일관성**: 시점별 prior/posterior 값이 실제 update 수식과 어긋나면 분석가 audience가 즉시 catch — 수치 검수 필요
- **방법론 패널의 정보 밀도**: 너무 많이 넣으면 operator의 호기심마저 겁먹고, 너무 적으면 분석가가 만족 안 함 — 둘 사이 균형
- **Korean term 일관성**: Revenue Forecast의 `사전 확률 / 사후 확률`을 Layer 2에서만 쓰고 Layer 1에선 안 쓰는 게 이상해 보일 수도. 결정 필요: Layer 2도 한국어 학술 용어를 쓸지, 아니면 둘 다 operator 언어로 갈지

---

## 9. 다음 액션

이 spec 승인 후:
- **옵션 A**: 곧바로 implementation 시작 (executor 또는 ralph로 디스패치)
- **옵션 B**: omc-plan --consensus로 Architect/Critic 검증 → autopilot 실행
- **옵션 C**: Mock 데이터 + 색상/i18n까지만 먼저 만들고 Layer 2 timeline은 별도 디자인 세션 후

권장 — **C → A** 순차. Cyclic Update Timeline은 디자인 결정이 많아서 바로 코딩 들어가기보단 한 번 디자인 검토 필요.

---

## 10. 관련 문서

- `2026-04-14-market-gap-bayesian-loadbearing-diagnosis.md` — 진단 spec
- `2026-04-14-revenue-forecast-bayesian.md` — 색상/한국어/툴팁 패턴 참조
- `CLAUDE.md` §4 (Bayesian Decision Framework) — Cyclic update의 이론적 근거
- `CLAUDE.md` §11.2 — Operator-not-analyst 원칙 (Layer 1의 정당성)
- Memory: `feedback_korean_stats_terms` — Korean term 정책
