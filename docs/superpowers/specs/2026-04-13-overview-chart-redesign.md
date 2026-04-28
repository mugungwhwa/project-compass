# Overview Chart Redesign — Revenue Decomposition + BEP Crossover

**Date**: 2026-04-13
**Status**: Approved
**Branch**: feature/chart

---

## 1. Problem

Executive Overview의 차트 2장이 yieldo의 핵심 질문에 정확히 답하지 못함:

| 기존 차트 | 문제 |
|-----------|------|
| Revenue vs Investment (바 + ROAS 라인) | Break-even 안 보임, 이중 축 인지 부하, 좌축 겹침 |
| Retention Curve (P10/P50/P90 밴드) | Overview에서 볼 이유 없음 — 리텐션은 중간 변수이지 투자 판정 변수가 아님 |

## 2. Design Decisions

### 2.1 Revenue vs Investment → Cumulative Crossover (완료)

- **형태**: 두 누적 Area 라인 (cumRevenue vs cumUaSpend) 교차
- **BEP**: 교차점에 pulse ring + "BEP" 라벨 — 놓칠 수 없음
- **단일 Y축**: $K 단위, 이중 축 제거
- **Mock 데이터**: 적자 7개월 → 8월차(Jan) BEP 도달 (현실적)
- **마케팅 역할**: UA 투자를 **비용 레버**로 표현 (누적 투자 곡선)

### 2.2 Retention Curve → Revenue Decomposition (신규)

리텐션 차트를 Market Gap 모듈로 이동하고, 실험 기반 매출 분해 차트로 교체.

#### 차트 형태: 2-Layer Stacked Bar

```
  [$140] ┌────┐
         │████│ ← 실험이 만든 매출 (파란)
         │░░░░│ ← 베이스 매출 (회색)
         └────┘
         Jul  Aug  Sep  ...  Apr
```

- **하단 (회색)**: 실험 없이도 나왔을 베이스 매출
- **상단 (파란)**: 실험 배포로 추가된 매출
- **▲ 마커**: 실험 배포 시점

#### 왜 2-레이어인가 (3-레이어 아닌 이유)

마케팅(UA)과 실험은 매출에 대해 곱셈 관계:
```
Revenue = Volume(마케팅) × UnitEconomics(실험)
```

스택 바는 덧셈을 암시하므로 마케팅을 별도 레이어로 넣으면 왜곡.
마케팅은 좌측 차트(Revenue vs Investment)에서 비용 레버로 이미 표현됨.

- **좌측**: 마케팅 = 비용 효율 (ROAS, 투자 회수)
- **우측**: 실험 = 가치 창출 (ΔLTV, 매출 기여)

#### 인터랙션: 레전드 클릭 → 레이어 격리

- 기본: 2-레이어 스택 (전체 매출 구성)
- 레전드 아이템 클릭: 해당 레이어만 단독 표시
  - Y축 자동 리스케일 (격리된 레이어 범위에 맞춤)
  - 차트 헤더 지표가 해당 레이어 맥락으로 전환
- 같은 아이템 재클릭 또는 "전체 보기": 스택 복귀

#### 차트 헤더: 속도/탄력성 지표 바

차트 본체와 헤더 사이에 인라인 지표 바 배치:

```
┌──────────────────────┬───────────────────────────┐
│ 속도                  │ 탄력성                     │
│ 12 exp · 68% ship    │ +$1.2 ΔLTV · 41% win     │
│ · 9d avg             │ · 3.8× ROI               │
└──────────────────────┴───────────────────────────┘
```

정보 계층:
1. HeroVerdict = 판정
2. KPI 카드 = 재무 증거
3. **차트 헤더 지표 = 운영 맥락** ← 여기
4. 차트 본체 = 추세 증거

격리 모드별 헤더 전환:

| 모드 | 좌측 (속도) | 우측 (탄력성) |
|------|------------|--------------|
| 전체 | 12 exp · 68% ship · 9d avg | +$1.2 ΔLTV · 41% win · 3.8× ROI |
| 베이스 | *(숨김)* | 기저 매출 추이: +8% QoQ |
| 실험 | 12 exp · 68% ship · 9d avg | +$1.2 ΔLTV · 41% win · 3.8× ROI |

## 3. Data Model

### 3.1 RevenueDecompPoint (신규)

```typescript
export type RevenueDecompPoint = {
  month: string
  organic: number      // 베이스 매출 ($K)
  experiment: number   // 실험 추가 매출 ($K)
  total: number        // organic + experiment
  expShipped: number   // 이번 달 배포 실험 수
}
```

### 3.2 DecompStats (신규)

```typescript
export type DecompStats = {
  // Velocity (속도)
  totalExp: number
  shipRate: number
  avgDays: number
  // Elasticity (탄력성)
  cumDeltaLtv: number
  winRate: number
  expRoi: number
  // Organic context
  organicQoQ: number
}
```

### 3.3 Mock Data

```
       organic  experiment  total  shipped
Jul      28        0         28      0
Aug      30       15         45      1
Sep      34       28         62      1
Oct      38       40         78      2
Nov      42       50         92      2
Dec      46       59        105      3
Jan      48       64        112      2
Feb      50       68        118      3
Mar      52       73        125      2
Apr      54       78        132      3
```

스토리: 오가닉 완만 성장 + 실험이 점진적으로 매출의 59% 차지 (Apr 기준).
total 값은 Revenue vs Investment 차트의 월별 revenue와 일치.

### 3.4 DecompStats Mock

```typescript
{
  totalExp: 12,  shipRate: 68,  avgDays: 9,
  cumDeltaLtv: 1.2,  winRate: 41,  expRoi: 3.8,
  organicQoQ: 8,
}
```

## 4. Colors

| 요소 | 토큰 | Hex |
|------|------|-----|
| 베이스 매출 | PALETTE.benchmark | #9CA3AF |
| 실험 매출 | PALETTE.p50 | #1A7FE8 |
| 배포 마커 | PALETTE.positive | #00875A |
| 속도/탄력성 텍스트 | PALETTE.fg2 | #6B7280 |
| 속도/탄력성 숫자 | PALETTE.fg0 | #0A0A0A |

## 5. Component Structure

```
ExperimentRevenue (신규 위젯)
├── ChartHeader (기존 재사용)
├── VelocityElasticityBar (신규)
│   ├── 좌: 속도 클러스터
│   └── 우: 탄력성 클러스터
│   └── 격리 모드별 내용 전환
├── StackedBarChart (Recharts ComposedChart)
│   ├── Bar: organic (stackId="revenue")
│   ├── Bar: experiment (stackId="revenue")
│   ├── CustomDot: 배포 마커 (expShipped > 0)
│   └── Y축 리스케일 (격리 시)
├── InteractiveLegend (신규)
│   ├── LegendItem × 2 (클릭 → 격리/복귀)
│   └── "전체 보기" 버튼
└── Tooltip (모드별 전환)
```

## 6. i18n Keys

```typescript
"chart.revenueDecomp"  → "매출 원천 분해" / "Revenue Decomposition"
"chart.organic"        → "베이스 매출" / "Baseline Revenue"
"chart.expLift"        → "실험 매출" / "Experiment Revenue"
"chart.expRatio"       → "실험 기여율" / "Experiment Share"
"chart.showAll"        → "전체 보기" / "Show All"
"chart.deployments"    → "배포" / "Deployments"
"exp.velocity"         → "속도" / "Velocity"
"exp.elasticity"       → "탄력성" / "Elasticity"
"info.revenueDecomp"   → tooltip context text
```

## 7. Page Changes

### Overview (page.tsx)

```diff
- import { RevenueVsInvest, RetentionCurve, RevenueForecast } from "@/widgets/charts"
+ import { RevenueVsInvest, ExperimentRevenue, RevenueForecast } from "@/widgets/charts"

  <FadeInUp className="grid grid-cols-2 gap-6 mb-8">
    <RevenueVsInvest data={mockRevenueVsInvest} />
-   <RetentionCurve data={mockRetention.data} asymptoticDay={mockRetention.asymptoticDay} />
+   <ExperimentRevenue data={mockRevenueDecomp} stats={mockDecompStats} />
  </FadeInUp>
```

### RetentionCurve

삭제하지 않음. Market Gap 모듈에서 계속 사용 (확인 필요: 이미 import 여부).

## 8. Final Overview Layout

```
┌─────────────────────────────────────────────┐
│ HeroVerdict — "투자해야 하는가?"              │
├─────────────────────────────────────────────┤
│ [ROAS] [Payback] [BEP] [Burn]               │
├────────────────────┬────────────────────────┤
│ Revenue vs Invest  │ Revenue Decomposition  │
│ 마케팅 = 비용 레버  │ 실험 = 가치 레버        │
│ 누적 교차 BEP      │ 베이스 + 실험 스택 바    │
│                    │ 속도/탄력성 인라인       │
│                    │ 레전드 클릭 → 격리      │
├────────────────────┴────────────────────────┤
│ Revenue Forecast (P10/P50/P90)              │
└─────────────────────────────────────────────┘

좌: "돈을 회수하고 있는가?" → 마케팅 비용 효율
우: "그 성장은 어디서 오는가?" → 실험 가치 창출
```

## 9. Validation Checklist

- [ ] tsc --noEmit 통과
- [ ] next build 성공
- [ ] 브라우저에서 전체 스택 렌더링 확인
- [ ] 레전드 클릭 → 격리/복귀 동작
- [ ] Y축 리스케일 확인
- [ ] 헤더 지표 전환 확인
- [ ] 툴팁 모드별 내용 확인
- [ ] i18n ko/en 전환 확인
- [ ] Revenue vs Investment 차트 total과 일치 확인
