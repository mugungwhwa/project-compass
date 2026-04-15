# Operations Page Redesign — Action Impact Board

**Date**: 2026-04-15
**Status**: Phase 1 (전체 구조) 구현 완료, Phase 2 (개별 차트 정교화) 대기
**Branch**: main
**Related Memory**: `project_operations_page_redesign.md`
**Related CLAUDE.md**: §6 (Experiment-to-Investment Translation), §7.1 Module 3 (Action Impact Board), §7.3 (Intervention Over Analysis)

---

## 1. Problem

`/dashboard/actions` (운영 효과)는 CLAUDE.md §7.1 Module 3 "Action Impact Board"에 해당하지만, 기존 구현은 **로그 뷰어**에 가까웠음.

| 기존 요소 | 답한 질문 | 빠진 것 |
|---|---|---|
| KPI 3개 (총 액션, 평균 ΔLTV, 베스트 액션) | "최근 뭐 했고 평균 효과는?" | 누적 가치, ROI, 실행 속도 |
| ActionTimeline (리텐션 + ReferenceLine) | "실행 시점이 언제였나" | 효과의 인과적 근거 |
| Action Log 테이블 | "각 액션 ΔLTV 얼마였나" | 비용 대비 효율, 코호트별 영향 분포 |

### 핵심 원인 3가지

1. **액션 타입이 섞여있는데 의사결정 프레임이 없음** — UA / Live Ops / Release가 한 테이블에 있지만 각자 답해야 할 질문이 다름
2. **ΔLTV에서 파이프라인이 멈춤** — CLAUDE.md §6.1의 `ATE → ΔRetention → ΔLTV → ΔPayback → ΔIRR → Action ROI` 중 절반만 노출
3. **포트폴리오 뷰 부재** — §6.2 "Experiment Portfolio as Investment" 프레임이 운영에도 적용되어야 하는데 누락

---

## 2. Design Decisions

### 2.1 페이지 정체성 재정의

| 축 | Before | After |
|---|---|---|
| **한 줄 정의** | "최근 운영 액션 목록" | "어떤 운영이 투자가치를 만들었나" |
| **답하는 질문** | "뭐 했고 효과 얼마였나?" | "다음에 어디에 자본을 더 태울까?" |
| **출력 단위** | ΔLTV 점추정 | ΔLTV credible interval + ROI + 인과 확률 |
| **포트폴리오** | 없음 | 누적 가치 + 4분면 분류 + 코호트별 영향 |

### 2.2 모듈 경계 명확화

운영 페이지에서 의도적으로 **제외**한 기능:
- "다음에 뭐 해야 하나" 추천 → Module 5 (Capital Allocation Console)로 이관
- 이유: Module 3는 *과거 영향 측정*, Module 5는 *미래 자본 배분 결정*. 경계 분리해야 각 페이지가 단일 책임.

### 2.3 7개 차트 후보 + 우선순위

| Priority | 차트 | 답하는 질문 | Phase |
|---|---|---|---|
| **P0** | Causal Impact Panel (Pre/Post 반사실) | "정말로 움직였나, 자연 변동인가?" | Phase 1 ✅ |
| **P0** | Action ROI Quadrant (Cost × ΔLTV) | "어디에 자본을 더 태울까?" | Phase 1 ✅ |
| **P1** | Cumulative Impact Curve | "전체가 얼마나 가치를 쌓았나?" (Compounding) | Phase 1 ✅ |
| **P1** | Retention Shift Heatmap (액션×day) | "초기 스파이크형인가 장기 리텐션형인가?" | Phase 1 ✅ |
| **P2** | Action Impact Distribution (히스토그램) | "안정적인가, 대박 의존인가?" | Phase 3 |
| **P2** | Action Velocity Timeline | "점점 빨라지고 있나?" | Phase 3 |
| **P2** | Concurrent Actions Overlap (간트+음영) | "귀속 불확실 기간 경고" | Phase 3 |

---

## 3. Page Layout (Phase 1 구현)

```
┌──────────────────────────────────────────────────────────┐
│ PageHeader: "어떤 운영이 가장 효과적인가?"                  │
│             "액션 임팩트 보드"                              │
├──────────────────────────────────────────────────────────┤
│ KPI Cards (4)                                            │
│ [총 액션 수] [누적 ΔLTV] [평균 ROI] [실행 속도]            │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────┐        │
│ │ Cumulative Impact    │ │ Action ROI Quadrant  │        │
│ │ Curve (P1)           │ │ (P0)                 │        │
│ └──────────────────────┘ └──────────────────────┘        │
│   ↑ useGridLayout(2)로 expand 동기화                      │
├──────────────────────────────────────────────────────────┤
│ ActionTimeline (기존 유지, 리텐션 + ReferenceLine)         │
├──────────────────────────────────────────────────────────┤
│ Causal Impact Panel (P0)                                 │
│ — 대표 액션 1건의 Pre/Post + 반사실 90% CI                 │
│ — ATE / 인과 확률 / 판정 3-카드                            │
├──────────────────────────────────────────────────────────┤
│ Retention Shift Heatmap (P1)                             │
│ — 액션 × (D1·D3·D7·D14·D30) ΔRetention(pp)              │
├──────────────────────────────────────────────────────────┤
│ Action Log 테이블 (확장: + Cost · ROI 컬럼)                │
└──────────────────────────────────────────────────────────┘
```

---

## 4. 신규 위젯 사양 (Phase 1 베이스라인)

> Phase 2에서 차트 단위 정교화 예정. 아래는 최초 스캐폴드 사양.

### 4.1 CumulativeImpactCurve

- **위치**: `compass/src/widgets/charts/ui/cumulative-impact-curve.tsx`
- **시각화**: AreaChart × 2 (실제 누적 vs 반사실 baseline), gradient fill
- **데이터**: `mockCumulativeImpact` — `{ date, actual, baseline }[]`
- **인사이트**: 차트 헤더에 "현재 운영 덕에 유저 1인당 +{gap} ΔLTV가 쌓였습니다" 동적 표시
- **레전드**: 실제 누적 ΔLTV (파란 솔리드) / 운영 없었을 때 반사실 (회색 점선)

### 4.2 ActionRoiQuadrant

- **위치**: `compass/src/widgets/charts/ui/action-roi-quadrant.tsx`
- **시각화**: ScatterChart, X=Cost($K), Y=ΔLTV, 액션 타입별 색상
- **4분면 기준선**: Cost 중앙값, ΔLTV 중앙값
- **데이터**: `mockActions.filter(a => a.cost)` — `cost` 필드 신규 추가
- **분면 라벨**:
  - 좌상: 고효율 (저비용·고임팩트) ← 자본 재배분 1순위
  - 우상: 대형 베팅
  - 좌하: 소규모
  - 우하: 비효율 (고비용·저임팩트)

### 4.3 CausalImpactPanel

- **위치**: `compass/src/widgets/charts/ui/causal-impact-panel.tsx`
- **시각화**: ComposedChart (Area band + 2 lines + ReferenceLine)
- **데이터**: `mockCausalImpact` — 대표 액션 1건 (`v2.3 Release`)의 Pre/Post 시계열 + 반사실 90% CI
- **상단 3-카드**: ATE (점추정 + 90% CI), 인과 확률 P(effect>0), 판정 (Real Impact / Inconclusive)
- **시각 요소**: observed 검정 솔리드, counterfactual 회색 점선, CI band 회색 그라데이션, 실행 시점 파란 점선
- **확장 여지**: Phase 2에서 액션 셀렉터 추가 (Timeline 클릭 → 패널 액션 전환)

### 4.4 RetentionShiftHeatmap

- **위치**: `compass/src/widgets/charts/ui/retention-shift-heatmap.tsx`
- **시각화**: 테이블 기반 셀 색상 매핑 (HSL 채도 = ΔRetention 절대값)
- **데이터**: `mockActions[].retentionShift` — `{ d1, d3, d7, d14, d30 }` 신규 필드
- **색상**: 양수=파랑계, 음수=빨강계, 0=백색. 강도는 ±2.5pp까지 선형 매핑
- **레전드**: -2pp / 0 / +2pp 색 샘플 + ΔRetention(pp) 표기

---

## 5. 데이터 모델 변경

### 5.1 ActionData 타입 확장

```typescript
export type ActionData = {
  date: string
  type: "ua" | "liveops" | "release"
  description: string
  deltaLtv: number
  confidence: number
  /** 신규: 투입비용 (USD, 천 단위) */
  cost?: number
  /** 신규: ΔRetention by cohort day (pp) */
  retentionShift?: { d1: number; d3: number; d7: number; d14: number; d30: number }
}
```

### 5.2 mockActionKPIs 확장

```typescript
{
  totalActions:       { value, trend, trendLabel },
  cumulativeDeltaLtv: { value, trend, trendLabel },  // 신규
  avgRoi:             { value, trend, trendLabel },  // 신규
  velocity:           { value, trend, trendLabel },  // 신규
  // legacy 유지: avgImpact, bestAction
}
```

### 5.3 신규 데이터셋

- `mockCumulativeImpact`: `{ date, actual, baseline }[]` — 누적 ΔLTV 곡선
- `mockCausalImpact`: 대표 액션의 Pre/Post 시계열 + 반사실 CI + ATE 통계

---

## 6. UX / 인터랙션

### 6.1 Expand 동기화 (Phase 1 마무리 단계 수정)

`CumulativeImpactCurve` ↔ `ActionRoiQuadrant`는 `useGridLayout(2)` 훅으로 묶음:
- 한쪽 expand 시 `col-span-2`로 확장, 다른 쪽 자동 숨김
- market-gap / experiments / capital 페이지와 동일 패턴

`ActionTimeline` / `CausalImpactPanel` / `RetentionShiftHeatmap`는 단독 행이라 sync 대상 없음.

### 6.2 Phase 2 인터랙션 후보 (미구현)

- ActionTimeline 액션 클릭 → CausalImpactPanel이 해당 액션으로 전환
- ROI Quadrant 점 클릭 → Action Log 해당 행 하이라이트
- Heatmap 행 클릭 → CausalImpactPanel 액션 전환

---

## 7. 카피 / 한국어 정책

memory `feedback_korean_stats_terms.md` 준수:
- "Causal Impact" → "인과 영향 검증"
- "Counterfactual" → "반사실"
- "ATE (Average Treatment Effect)" → "평균 처치효과"
- "P(effect > 0)" → "효과가 0보다 크다"
- "Probability" → "인과 확률"
- "Cumulative Impact" → "운영 누적 임팩트"

영어 사용처: `ATE`, `ΔLTV`, `ROI` 같은 단위/지표 약어는 그대로 (Operator 익숙).

---

## 8. Phase 2 (다음 세션) 작업 단위

Mike의 `feedback_chart_specs.md` 정책 준수: **차트 1개 = 1 spec 문서 = 1 brainstorm + ralplan + implementation 사이클**

권장 순서:
1. **Causal Impact Panel** (P0) — Bayesian 철학의 시각적 핵심. 액션 셀렉터 + 통계 카드 정교화
2. **Action ROI Quadrant** (P0) — 4분면 라벨 톤·중앙값 vs 평균 결정·이상치 처리
3. **Cumulative Impact Curve** (P1) — 반사실 baseline 산출 방법론 명시 (현재는 mock)
4. **Retention Shift Heatmap** (P1) — 색 스케일 명시 + 정렬 옵션 + 인사이트 자동 라벨

각 차트별로 spec 문서:
- `docs/superpowers/specs/2026-04-XX-operations-causal-impact-panel.md`
- `docs/superpowers/specs/2026-04-XX-operations-roi-quadrant.md`
- ...

## 9. Phase 3 (장기) 후보

- P2 차트 3종 (Distribution / Velocity Timeline / Concurrent Overlap)
- 실제 데이터 연동 (Statsig API, Live Ops 캘린더, MMP cohort)
- Causal Impact 백엔드 (NumPyro 기반 BSTS 모델 — `Project_Compass_Engine_Blueprint.md` 참조)

---

## 10. 구현 결과 (Phase 1)

- **커밋 1**: `275ac86 feat(actions): rebuild as Action Impact Board with 4 new widgets`
- **커밋 2**: `793067c fix(actions): sync expand state between impact curve and ROI quadrant`
- **검증**: `tsc --noEmit` exit 0, `/dashboard/actions` HTTP 200, 4개 신규 위젯 타이틀 렌더 확인
- **Vercel**: main push → 자동 재배포 트리거됨

---

## 참고

- CLAUDE.md §6 (Experiment-to-Investment Translation), §7.1 Module 3, §7.3 (Intervention Over Analysis), §7.4 (What This Product Deliberately Does NOT Do)
- `docs/superpowers/specs/2026-04-13-overview-chart-redesign.md` — 동일한 "단일 차트 = 단일 질문" 원칙 적용 사례
- memory `project_operations_page_redesign.md` — 다음 세션 자동 로드용 압축본
- memory `feedback_chart_specs.md` — 차트 단위 점진적 정교화 정책
- memory `feedback_workflow_brainstorm_first.md` — Phase 2 진입 전 brainstorming → ralplan consensus 의무
