# Cyclic Update Timeline — Layer 2 시각 디자인

**Date**: 2026-04-16
**Module**: Market Position (Module 2) → Methodology Modal (Layer 2)
**Source**: Brainstorming (8 sections, all approved)
**Predecessor**: `2026-04-14-market-gap-bayesian-p3-implementation.md` §3.2 (원안), `2026-04-15-yieldo-positioning-language-layering-design.md` (L0/L1/L2 정책)

---

## 1. 요약

Market Gap L1 차트("장르 기대치 vs 우리 실적")의 Methodology 보기 기능. 모달을 열면 **D0→D90까지 6-frame 수평 step grid**가 "장르 기대치가 우리 실적으로 업데이트되는 과정"을 보여줌.

**소비 모드**: Static(한 장에 전체 스토리) + Live(Play 버튼으로 11초 순차 애니메이션)
**지표 밀도**: 1개 지표 집중 (L1 차트에서 선택된 metric)
**시각 메타포**: Step grid (시점별 분할 프레임 + 흡수 화살표)
**패널 형태**: Modal overlay (backdrop dimming + 중앙 카드)
**Library**: div + Tailwind + framer-motion (Recharts/visx 미사용)

---

## 2. Trigger UX (L1 → L2 진입)

L1 차트(`PriorPosteriorChart`) 하단 범례 아래에 CTA 링크:

```
  범례: ▓ 장르 기대치   █ 우리 실적
  ──────────────────────────────────────
  [📊 이 판정의 방법론 보기]  ← 텍스트 링크
```

- 스타일: `text-caption text-[var(--fg-3)]`, hover시 `text-[var(--fg-1)]`
- 클릭 → modal open (framer-motion `AnimatePresence`)
- ⓘ 기존 tooltip 역할은 그대로 유지 (L1 info 가이드)
- URL 변경 없음 (client-side overlay)

---

## 3. Modal Layout

```
max-w-4xl (896px), centered, backdrop rgba(0,0,0,0.5)
rounded-[var(--radius-card)] bg-[var(--bg-1)]
```

| 영역 | 내용 | 높이 |
|---|---|---|
| **Header** | "방법론: {metric} 판정의 근거" + subtitle + ✕ close | ~56px |
| **Body** | Cyclic Update Timeline (step grid) + Play 버튼 | ~280px |
| **Footer** | 2-3문장 L1 설명 + 마지막 줄 L2 힌트 (italic, fg-3) | ~80px |

- Close: ✕ 버튼 + backdrop 클릭 + ESC key
- 총 높이 ~420px, 스크롤 불필요
- Footer 마지막 줄: `"(L2 맥락: Bayesian posterior update, Alpha Persistence 검증)"` — italic fg-3, 분석가용 힌트

---

## 4. Step Grid 프레임 구조

### 6 Frame 수평 배열 (~800px 가용)

```
   D0          D7          D14         D30         D60         D90
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│▓▓▓▓▓▓▓▓│  │▓▓▓▓▓▓▓ │  │▓▓▓▓▓▓  │  │▓▓▓▓▓   │  │▓▓▓▓    │  │▓▓▓     │
│        │  │  ████  │  │  ████ │  │  ███  │  │  ███  │  │  ██   │
│        │  │   ×    │  │   ×   │  │   ×   │  │   ×   │  │   ×   │
├────────┤  ├────────┤  ├────────┤  ├────────┤  ├────────┤  ├────────┤
│장르only │  │14.5    │  │14.8    │  │15.2    │  │15.5    │  │15.8    │
│CI 넓음  │  │→18.7   │  │→17.5   │  │→17.2   │  │→17.0   │  │→16.8   │
│        │  │+31.7%  │  │+18.2%  │  │+13.2%  │  │+9.7%   │  │+6.3%   │
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘
     ─→          ─→          ─→          ─→          ─→
  "흡수"      "흡수"      "흡수"      "흡수"      "흡수"
```

### 단일 Frame 내부 (120px × ~200px)

상단: 밴드 시각화 영역
- 장르 기대치: `C.genreFill` 8% + `1px dashed C.genreLine` (빨강 계열)
- 우리 실적: `C.ourFill` 14% + `1px solid C.our` (초록 계열)
- 관측값: × marker, `color: C.our`, bold
- D0만: 장르 밴드만 존재, 우리 밴드·관측값 없음

하단: 수치 3줄 (text-[11px] font-mono)
- 장르 P50 (빨강 fg)
- → 우리 P50 (초록 bold)
- gap ±% (파랑 accent)

### 시점별 시각 상태 규칙

| 시점 | 장르 밴드 | 우리 밴드 | 핵심 변화 |
|---|---|---|---|
| D0 | 매우 넓음 | 없음 | 출발점 |
| D7 | 약간 좁아짐 | **등장** | 첫 데이터 |
| D14 | 더 좁아짐 | 더 좁아짐 | 흡수 사이클 진행 |
| D30 | 상당히 좁아짐 | 좁음 | 수렴 진행 |
| D60 | 거의 수렴 | 매우 좁음 | 신뢰도↑ |
| D90 | posterior와 거의 겹침 | 최종 | 판정 확정 가능 |

---

## 5. Hover / Highlight / Active

### Hover 상태 (마우스 올렸을 때)

| 요소 | 기본 | Hover |
|---|---|---|
| Frame 테두리 | `border-[var(--border-default)]` 1px | `border-[var(--brand)]` 2px + `ring-2 ring-[var(--brand)]/20` |
| Frame 스케일 | `scale(1)` | `scale(1.04)` via framer-motion `whileHover` |
| 관측값 | × marker만 | × marker + **수치 라벨 등장** (초록 bold) |
| 비hover 프레임 | opacity 1 | `opacity: 0.45` + `blur(0.5px)` — hovered frame이 시각적으로 pop |
| 인접 화살표 | 점선 fg-3, 0.5 opacity | `opacity: 1` + `color: var(--brand)` + 2px |

### Hover 요약 Tooltip (frame 상단)

```
┌──────────────────────────────────────────────┐
│ D14: 장르 14.8 → 우리 17.5 (우리 우월 +18.2%)│
│ · 2차 update · Hold 신호                      │
└──────────────────────────────────────────────┘
```

### Active 상태 (Play 진행 중 현재 step)

| 요소 | Active |
|---|---|
| Frame 테두리 | `border-[var(--brand)]` 2px + `shadow-[0_0_16px_rgba(26,127,232,0.25)]` glow |
| 비active 프레임 | `opacity: 0.35` |
| 밴드 진입 | 장르 shrink animation + 우리 expand-in + × fade-in |

### Play 중 hover

Play 진행 중 frame hover → 자동 Pause. Hover 해제 → Resume.

---

## 6. 흡수 화살표

Frame 사이 "이전 우리 실적 → 다음 장르 기대치로 흡수" 시각화.

```
  ┌──D7──┐         ┌──D14──┐
  │  ████ │ ──┐    │▓▓▓▓▓▓  │
  │ (우리)│   ╰───→│(장르)  │   "D7 우리 실적 → D14 장르 기대치로 흡수"
  └──────┘         └────────┘
```

| 상태 | 스타일 |
|---|---|
| 기본 (static) | 가는 점선 `stroke-dasharray: 3 3`, `var(--fg-3)`, opacity 0.5 |
| Hover (인접 frame) | `opacity: 1` + `var(--brand)` + 2px |
| Play active transition | `stroke-dashoffset` animation — 점선이 좌→우 흐르는 pulse (0.4s, 1회) |
| 라벨 | 기본 "흡수" (9px fg-3), hover시 "이전 실적 → 다음 기대치"로 확장 |

구현: inline SVG `<svg><line/><polygon/></svg>` (6 frame 사이 5개 화살표)

---

## 7. Play 애니메이션

### 타이밍

| Step | 시작 | 내용 | 체류 |
|---|---|---|---|
| D0 | 0.0s | 장르 밴드 fade-in | 0.6s |
| →D7 | 0.6s | 화살표 pulse 0.2s | — |
| D7 | 0.8s | 장르 shrink 0.4s + 우리 appear 0.3s + × fade 0.2s | 0.6s |
| →D14 | 1.8s | 화살표 pulse | — |
| D14 | 2.0s | 밴드 전환 | 0.5s |
| →D30 | 2.9s | 화살표 | — |
| D30 | 3.1s | 밴드 전환 | 0.5s |
| →D60 | 4.0s | 화살표 | — |
| D60 | 4.2s | 밴드 전환 | 0.5s |
| →D90 | 5.1s | 화살표 | — |
| D90 | 5.3s | 밴드 전환 + "안정" 라벨 | 0.8s |
| 완료 | ~6.3s | 전체 밝아짐, 버튼 "다시 재생" | — |

총 ~6초 cycle.

### 컨트롤 상태

```
[⏵ Play] → [⏸ Pause] → [⏵ Resume]
                            ↓ 완료
                      [⏵ 다시 재생]
```

### 애니메이션 속성

| 요소 | Duration | Easing |
|---|---|---|
| 장르 밴드 shrink | 400ms | `[0.16, 1, 0.3, 1]` |
| 우리 밴드 appear | 300ms (150ms delay) | ease-out |
| 관측값 fade-in | 200ms (250ms delay) | ease-out |
| 화살표 pulse | 200ms | linear (`stroke-dashoffset`) |
| Dim 전환 | 200ms | ease-in-out |

### 구현

- `useReducer`: `{ status: 'idle'|'playing'|'paused', activeStep: number }`
- `useEffect` + `setTimeout` chain (step-based)
- framer-motion `animate` prop for band width/opacity
- CSS `@keyframes dashflow` for arrow pulse

---

## 8. Data Contract

### TypeScript 타입

```ts
type CyclicUpdateStep = {
  day: number                    // 0, 7, 14, 30, 60, 90
  label: string                  // "D0", "D7", ...
  updateRound: number            // 0, 1, 2, 3, 4, 5
  prior: { p10: number; p50: number; p90: number }
  posterior: { p10: number; p50: number; p90: number } | null
  observed: number | null
  narrative: { ko: string; en: string }
}

type CyclicUpdateData = {
  metric: string                 // L1 차트에서 선택된 지표명
  gameId: string
  steps: CyclicUpdateStep[]      // 항상 6개
}
```

### 데이터 무결성 규칙

- prior P10–P90 범위: step 진행마다 좁아짐
- posterior는 같은 step 내 prior보다 항상 좁음
- 다음 step prior P50 ≈ 이전 step posterior 반영
- D0: posterior=null, observed=null
- steps.length === 6 고정
- L1 차트의 `mockPriorPosterior[0].prior.mean` === L2의 `steps[0].prior.p50` (D0 prior 일치)

### 초기 구현 범위

match-league × D7 Retention 1세트만. 나머지 게임/지표는 동일 구조로 확장.

---

## 9. Library & Color

### Library: div + Tailwind + framer-motion

Recharts/visx 미사용. 근거:
- L1 PriorPosteriorChart가 이미 div-based 밴드 — 같은 패턴으로 L2도 구현
- Step grid는 "6개 카드의 수평 배열" — 레이아웃 문제이지 차트 문제 아님
- 애니메이션은 framer-motion으로 충분
- 화살표만 간단한 inline SVG

### Color Anchor (L1 ↔ L2 일치)

| 의미 | 토큰 | L1과 동일 |
|---|---|---|
| 장르 기대치 밴드 | `C.genreFill` + `C.genreLine` | ✅ |
| 우리 실적 밴드 | `C.ourFill` + `C.our` | ✅ |
| 격차 수치 | `C.gapAccent` | ✅ |
| 판정 신호 pill | `C.signalInvest/Hold/Reduce` | ✅ |
| 관측값 marker | `C.our` | ✅ |
| 화살표 | `var(--fg-3)` / hover `var(--brand)` | L2 전용 (L1엔 없음) |
| Frame 테두리 | `var(--border-default)` / hover `var(--brand)` | L2 전용 |
| Active glow | `rgba(26,127,232,0.25)` | L2 전용 |

신규 토큰 불필요 — `MARKET_GAP_PROOF_COLORS` + CSS variables로 커버.

---

## 10. File Structure (예상)

**신규 (Create):**
- `yieldo/src/widgets/charts/ui/cyclic-update-timeline.tsx` — 메인 컴포넌트 (step grid + play control)
- `yieldo/src/shared/ui/methodology-modal.tsx` — 범용 modal 셸 (header/body/footer 레이아웃)
- `yieldo/src/shared/api/mock-data.ts` 하단에 `CyclicUpdateStep`, `CyclicUpdateData` 타입 + `mockCyclicUpdate_matchLeague_d7` 데이터

**수정 (Modify):**
- `yieldo/src/widgets/charts/ui/prior-posterior-chart.tsx` — 하단에 "방법론 보기" CTA link 추가 + modal 연결
- `yieldo/src/widgets/charts/index.ts` — `CyclicUpdateTimeline` re-export
- `yieldo/src/shared/i18n/dictionary.ts` — `methodology.*` 키 추가 (modal header/footer/narrative)

**건드리지 않음:**
- `yieldo/src/shared/config/chart-colors.ts` — `MARKET_GAP_PROOF_COLORS` 이미 있음
- `yieldo/src/app/(dashboard)/dashboard/market-gap/page.tsx` — 페이지 레이아웃 변경 없음 (modal은 컴포넌트 내부에서 렌더)

---

## 11. 수용 기준

- [ ] L1 차트 하단에 "📊 이 판정의 방법론 보기" CTA 링크 표시
- [ ] CTA 클릭 → modal overlay 열림 (backdrop + 중앙 카드 + ✕ close)
- [ ] Modal 내 6-frame 수평 step grid (D0/D7/D14/D30/D60/D90)
- [ ] D0 frame은 장르 밴드만, 우리 밴드 없음 (null 상태 명시)
- [ ] D7~D90: 장르 밴드 점차 좁아지고 우리 밴드 점차 좁아짐 (수렴)
- [ ] 흡수 화살표 5개 (frame 사이), 기본 점선·hover시 brand 색·play시 pulse
- [ ] Frame hover: scale 1.04 + ring + 비hover dim + 관측값 라벨 등장 + tooltip
- [ ] Play 버튼: D0→D90 순차 애니메이션 (~11초), Play/Pause/Resume 상태 전환
- [ ] Play 중 hover → 자동 Pause, hover 해제 → Resume
- [ ] Footer에 L1 설명 2-3줄 + L2 힌트 (italic fg-3)
- [ ] 색상이 L1 차트와 동일 anchor (빨강=장르, 초록=우리, 파랑=격차)
- [ ] Modal 내에서 Prior/Posterior/Bayesian/Alpha 용어 미노출 (Footer L2 힌트 제외)
- [ ] 한/영 locale 모두 작동
- [ ] `npx tsc --noEmit` 통과
- [ ] Mock 데이터 무결성 규칙 만족 (§8 규칙 전부)

---

## 12. Non-goals

- 3개 지표 동시 표시 (1개 집중, 차후 확장)
- Interactive scrubber (Play 버튼만)
- 실시간 데이터 연결 (mock only)
- 다른 게임(Weaving Fairy, Dig Infinity) mock 데이터 (match-league D7만)
- 모바일 반응형 — PC 기준 고정. 전체 기획 완료 후 리팩토링 단계에서 일괄 대응 예정

---

## 13. 위험 요소

- **div-based 밴드의 Y축 스케일 일관성**: 6 frame이 각자 다른 범위를 가질 수 있음 → 모든 frame에 동일한 Y축 min/max 적용 필수 (D0의 넓은 prior로 통일)
- **11초 애니메이션의 지루함**: 투자자 데모에서 11초는 길 수 있음 → Play speed 1.5x/2x 옵션은 non-goal이지만 차후 추가 용이하게 설계 (duration을 상수로)
- **Mock 데이터의 수학적 정확성**: "이전 posterior가 다음 prior에 흡수"되는 수치가 실제 Bayesian update 수식과 근사해야 함 → 분석가 audience가 "숫자가 어색하다" 판단 가능. Mock 작성 시 수치 검수 필요

---

## 14. 구현 순서 (예상, writing-plans에서 구체화)

1. Mock 데이터 타입 + match-league D7 데이터 (30min)
2. i18n methodology.* 키 추가 (15min)
3. MethodologyModal 셸 컴포넌트 (1h)
4. CyclicUpdateTimeline — static 렌더 (frame grid + 밴드 + 수치) (2h)
5. 흡수 화살표 SVG (45min)
6. Hover/highlight 상태 (dim + scale + tooltip) (1.5h)
7. Play 애니메이션 (state machine + 밴드 transition + 화살표 pulse) (2h)
8. L1 차트에 CTA link + modal 연결 (30min)
9. L1/L2 compliance 검증 + tsc (30min)

총 예상: **~9시간** (2-3 세션)

---

## 15. 관련 문서

- `2026-04-14-market-gap-bayesian-p3-implementation.md` §3.2 (원안, 이 spec으로 supersede)
- `2026-04-15-yieldo-positioning-language-layering-design.md` (L0/L1/L2 정책)
- `2026-04-15-market-gap-layer1-rebalance.md` (L1 구현 완료 — 이 위에 L2 올림)
- Memory: `project_language_layering.md` (L2 용어 허용 규칙)
- Memory: `project_market_gap_alpha_frame.md` (Alpha는 L2 signature metric)
