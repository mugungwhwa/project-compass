# Chart Typography Unification Spec

**Date**: 2026-04-17
**Scope**: 24개 차트 컴포넌트 전체 폰트 통일
**Goal**: 서비스 레벨 타이포그래피 일관성 확보

---

## Problem

- Recharts 차트 20개: fontFamily 미지정 → Geist Sans 상속 (비례폭, 숫자 정렬 안됨)
- Visx 차트 1개: Geist Mono 명시 (정상)
- CSS 클래스 기반 3개: font-mono-num (정상)
- fontSize: 10px~12px 차트마다 산발적
- BEP 등 annotation: fontFamily 없음 → 브라우저 SVG 기본 폰트

## Solution

### 1. 공통 config 파일 생성

`yieldo/src/shared/config/chart-typography.ts`

```ts
export const CHART_FONT = {
  mono: "var(--font-geist-mono)",
  sans: "var(--font-geist-sans)",
} as const

export const CHART_TYPO = {
  axisTick: { fontSize: 11, fontFamily: CHART_FONT.mono },
  axisLabel: { fontSize: 10, fontFamily: CHART_FONT.mono },
  tooltipTitle: { fontSize: 11, fontWeight: 600 },
  tooltipValue: {
    fontSize: 12,
    fontWeight: 500,
    fontFamily: CHART_FONT.mono,
    fontVariantNumeric: "tabular-nums" as const,
  },
  tooltipLabel: { fontSize: 12 },
  legend: { fontSize: 11 },
  annotation: { fontSize: 11, fontWeight: 700, fontFamily: CHART_FONT.mono },
} as const
```

### 2. 적용 규칙

| 요소 | Config key | fontFamily | fontSize | fontWeight |
|------|-----------|-----------|----------|------------|
| XAxis/YAxis tick | `axisTick` | Geist Mono | 11 | 400 |
| Axis label ($K, %) | `axisLabel` | Geist Mono | 10 | 400 |
| Tooltip 제목 (날짜/카테고리) | `tooltipTitle` | Sans (상속) | 11 | 600 |
| Tooltip 값 (숫자) | `tooltipValue` | Geist Mono | 12 | 500 |
| Tooltip 라벨 (설명) | `tooltipLabel` | Sans (상속) | 12 | 400 |
| Legend | `legend` | Sans (상속) | 11 | 400 |
| Annotation (BEP, ReferenceLine) | `annotation` | Geist Mono | 11 | 700 |

### 3. 대상 파일 (24개)

**Recharts (fontFamily 추가 필요)**:
1. revenue-vs-invest.tsx — BEP annotation 포함
2. revenue-forecast.tsx
3. capital-waterfall.tsx
4. variant-impact-chart.tsx
5. experiment-bar.tsx
6. experiment-revenue.tsx
7. retention-curve.tsx
8. market-benchmark.tsx
9. ranking-trend.tsx
10. saturation-bar.tsx
11. saturation-trend.tsx
12. action-timeline.tsx
13. ripple-forecast-fan.tsx
14. rollout-history-timeline.tsx
15. cumulative-impact-curve.tsx
16. causal-impact-panel.tsx
17. action-roi-quadrant.tsx
18. budget-donut.tsx
19. scenario-simulator.tsx

**Visx (이미 Mono, fontSize만 확인)**:
20. runway-fan-chart.tsx

**CSS 클래스 기반 (font-mono-num 유지, 확인만)**:
21. prior-posterior-chart.tsx
22. cyclic-update-timeline.tsx

**테이블 (Mono 적용 필요)**:
23. cohort-heatmap.tsx

**특수 (retention-shift-heatmap)**:
24. retention-shift-heatmap.tsx

### 4. 적용 패턴

**Recharts tick 변경 예시:**
```tsx
// Before
<XAxis tick={{ fontSize: 12, fill: C.axis }} />

// After
import { CHART_TYPO } from "@/shared/config/chart-typography"
<XAxis tick={{ ...CHART_TYPO.axisTick, fill: C.axis }} />
```

**SVG annotation 변경 예시:**
```tsx
// Before
<text fontSize={10} fontWeight={700} fill={C.profit}>BEP</text>

// After
<text {...CHART_TYPO.annotation} fill={C.profit}>BEP</text>
```

**Tooltip 값 변경 예시:**
```tsx
// Before
<span style={{ fontWeight: 500, color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>

// After
<span style={{ ...CHART_TYPO.tooltipValue, color: "#0A0A0A" }}>
```

### 5. 범위 외

- 색상 변경 없음 (chart-colors.ts 유지)
- 차트 구조/데이터 변경 없음
- ChartHeader/ChartTooltip 공통 컴포넌트는 이미 Sans → 변경 불필요
