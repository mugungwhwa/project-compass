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

## 2. Layer 1 — Operator UI 변경 (즉시 가시 부분)

### 2.1 용어 치환표

| 현재 | 변경 후 (ko) | 변경 후 (en) |
|---|---|---|
| Prior vs Posterior · 베이지안 추론 (차트 제목) | **장르의 기대치 vs 우리의 증명** | Genre Expectation vs Our Evidence |
| Prior (장르 벤치마크) | **장르의 기대치 (D{n} cohort 평균)** | Genre Expectation (D{n} cohort avg) |
| Posterior (우리 데이터) | **우리 프로덕트의 증명 (관측 ±CI)** | Our Product's Evidence (observed ±CI) |
| (없음) | "장르는 X를 기대했고, 우리는 Y를 증명했다 — 장르 +Z%" 인사이트 한 줄 | "Genre expected X, we proved Y — outperforming by Z%" |

### 2.2 색상 (Revenue Forecast와 정합)

`feedback_chart_specs` + `project_revenue_forecast_decisions` 메모리에 따라 통일:

| 의미 | 색상 | 용도 |
|---|---|---|
| 장르의 기대치 (prior) | **빨강 `#C9372C` 8% fill, 점선 hatched** | 넓은 불확실성, "출발선 비교" |
| 우리의 증명 (posterior) | **초록 `#00875A` 14% fill, 실선** | 좁은 확신, "증명된 현실" |
| 격차 (gap indicator) | **파랑 `#5B9AFF`** | "+31% 우월 / -8% 부족" 화살표 |
| Operator-friendly arrow | 슬레이트 → 격차 방향에 따라 양/음 | 의사결정 신호 |

### 2.3 Insight 텍스트 (operator 언어)

기존 정적 차트 제목 → 동적 상황 문장으로 변환. 예시:

```
Match League (INVEST):
"D7 retention — 장르는 14.2를 기대했고, 우리는 18.7을 증명했습니다.
 장르 평균 +31% 우월 — 시장 prior를 넘어서 자체 공급(supply)을 만들어가는 단계."

Dig Infinity (REDUCE):
"D7 retention — 장르는 14.2를 기대했고, 우리는 11.5를 측정했습니다.
 장르 평균 -19% 부족 — 시장이 기대한 minimum도 충족 못함, 출시 가설 재검토 필요."
```

→ "사전 확률"이 단순 비교가 아닌 **시장이 우리에게 부여한 최소 기대치**라는 의사결정 의미를 부여.

### 2.4 Layer 1 컴포넌트 변경

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
[ⓘ Methodology — 베이지안 추론 보기]
       ↓ click
┌─────────────────────────────────────────────────────────┐
│  방법론: 베이지안 belief update                           │
│  ─────────────────────────────────────                   │
│  [Cyclic Update Timeline Component]                      │
│  D0 → D7 → D14 → D30 → D60 (slider/scrubber)            │
│  각 step에서 Prior 밴드가 좁아지며 Posterior로 수렴      │
│  ─────────────────────────────────────                   │
│  📚 Compass는 매 cohort 데이터 도착 시 Bayesian          │
│     posterior update 수행 — 시장 prior가 우리 데이터로   │
│     누적 학습되는 자산 (CLAUDE.md §4)                    │
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

Layer 1:
- [ ] PriorPosteriorChart 제목·범례·데이터 라벨에 학술 용어 잔존 0
- [ ] 색상 매핑이 Revenue Forecast의 `REVENUE_FORECAST_COLORS`와 일관 (초록/빨강/파랑)
- [ ] MarketHero 또는 차트 인사이트에 동적 한 줄 문장 ("장르는 X 기대, 우리 Y 증명, 격차 Z%")
- [ ] Operator가 '베이지안'/'Prior'/'Posterior' 단어를 한 번도 보지 않고 페이지 사용 가능

Layer 2:
- [ ] Methodology 토글 trigger가 페이지에 1개 존재 (ⓘ 또는 "방법론 보기")
- [ ] Cyclic Update Timeline에서 시간 step 변경 시 Prior 밴드 폭과 Posterior 등장이 시각적으로 명확
- [ ] D0 → D7 → ... 진행 시 "이전 posterior가 다음 prior에 흡수"되는 화살표/transition 가시화
- [ ] 패널 콘텐츠가 한국어/영어 모두 작동 (i18n 완비)

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
