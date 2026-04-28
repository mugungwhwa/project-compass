# Landing v2 — Terminal Chrome Overlay Design

**Date**: 2026-04-28
**Status**: Approved (brainstorming → spec)
**Owner**: yieldo design master (Claude, per 2026-04-28 user directive)
**Supersedes**: nothing — additive layer over `docs/design/landing-v2-spec.md`
**Related**: `Project_Compass_UI_Guide.md`, memory `feedback_landing_embedding.md`, `feedback_design_master_authority.md`

---

## 1. Context

Sprint 5에서 완성된 10-section v2 랜딩(`landing-v2-spec.md`, 2026-04-15)이 main에 배포 중이다.
사용자가 "현재 브랜드 디자인에서" 랜딩을 더 **터미널/레트로/세련** 방향으로 손질하길 원한다.
별도 진행 중인 yieldo-rebrand 워크트리는 **다크 풀-리브랜드**이며, 이 spec과는 분리된다.

본 spec은 **main 브랜드 토큰을 0개도 변경하지 않고**, 기존 10 섹션 위에 **터미널 chrome 어휘**와 **NavBar 구조 변경**을 오버레이한다. 카피와 섹션 구조는 변경하지 않는다 (ultraplan PR이 도착하면 카피만 별도 머지).

---

## 2. Goal & Non-Goals

### Goal
- 10 섹션 전체에 통일된 터미널 chrome 어휘 적용
- NavBar를 라이트 단일 행 + status badge + 섹션 anchor + ⌘K 패턴으로 교체
- Hero 매크로 레이아웃을 모노 헤드라인 + 우측 verdict 카드로 재구성
- "레트로하지만 세련" 균형 유지 — Bloomberg Terminal × Linear × Vercel 차용

### Non-Goals
- 색상 토큰 변경 (yieldo-rebrand 영역)
- 다크 테마 도입 (yieldo 영역)
- 카피 변경 (ultraplan PR이 별도 처리)
- 섹션 추가/제거 (Phase 1 카테고리 D — 분리 PR)
- 헤드라인 폰트만 모노화 — 본문 sans는 유지
- 대시보드 위젯 자체 시각 변경

---

## 3. Brand Baseline (LOCKED, no changes)

| 항목 | 값 |
|---|---|
| 컬러 토큰 | `compass/src/app/globals.css` 그대로 |
| `--bg-0` | `#F7F8FA` (Toss DPS 연회색) |
| `--bg-1` | `#FFFFFF` (카드) |
| `--fg-0..3` | 4단계 텍스트 명도 |
| `--brand` | `#1A7FE8` (Precision Blue) |
| `--positive / --caution / --risk` | signal palette |
| 폰트 | Geist Sans + Pretendard (본문), Instrument Serif + Noto Serif KR (display), **Geist Mono** (chrome — 이번에 노출 비중 증가) |
| 테마 | Light only |

토큰 추가는 다음 3개로 제한 (전부 mono-chrome 전용, 다른 페이지 영향 없음):
```css
--mono-chrome: rgba(10,10,10,0.45);   /* corner marker, divider */
--mono-anno:   rgba(10,10,10,0.55);   /* inline `// note` */
--cursor:      var(--brand);          /* hero cursor 단일 색 alias */
```

---

## 4. NavBar — Spec C

### 4.1 Anatomy (light, 단일 행, 56px)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  ▲ compass   [● LIVE / V2]    overview  modules  signals  compare  docs    ⌘K  EN  ▸ login  │
└────────────────────────────────────────────────────────────────────────────────┘
   logo+badge    section anchors (mono, 12px)                  utility cluster
```

| 영역 | 사양 |
|---|---|
| 컨테이너 | `fixed top-0`, `h-14` → **`h-[56px]`** 로 4px 증가, `px-[18px]` |
| 배경 | `bg-[var(--bg-1)]` (스크롤 전), `bg-[var(--bg-0)]/85 backdrop-blur-sm` (스크롤 후, 기존 동작 유지) |
| 좌측 — 로고 | `▲ compass` — 사용자 기존 `CompassLogo` 컴포넌트 그대로 사용. 추가 없음 |
| 좌측 — 배지 | `● LIVE / V2`, font-mono 10px uppercase, color `--positive`, bg `rgba(0,135,90,0.08)`, border `rgba(0,135,90,0.20)`, radius 4px, padding 2px 7px |
| 중앙 — 섹션 anchor | mono 12px, color `--fg-2`, gap 18px, hover `--fg-0`. active 항목은 color `--fg-0` + border-bottom 2px solid `--brand`, padding-bottom 14px |
| 우측 — kbd | `⌘K` `EN` — border 1px `--line-strong`, radius 4px, padding 2px 6px, mono 10px, color `--fg-2`, bg `--bg-0` |
| 우측 — login | mono 11px, `▸ login` (소문자), bg `--fg-0`, color `#fff`, padding 5px 12px, radius 4px |
| Framer Motion | 기존 fade-down 진입 애니 유지 |
| 모바일 (<768px) | section anchor 숨김 (햄버거 메뉴 X — 그냥 숨김), 로고+배지+kbd cluster만 노출 |

### 4.2 ⌘K 동작 — v1 명시적 비활성

`⌘K` 키캡은 v1에서 시각 chrome으로만 표시. "비작동 UI 금지" 메모리 원칙 위반을 피하기 위해:
- `aria-disabled="true"` + `tabIndex={-1}` (포커스 불가)
- Tooltip: `Command palette · coming v2` (한국어 locale: `명령 팔레트 · v2 예정`)
- Hover 시 cursor `not-allowed`
- 클릭은 `event.preventDefault()` (아무 동작 없음)

명시적으로 미래 기능임을 라벨링한 disabled 상태는 broken UI가 아니라 **계획된 비활성**이다 (disabled checkbox 패턴과 동일).
실제 명령 팔레트 기능은 별 spec/PR에서.

### 4.3 섹션 anchor IDs
10 섹션 중 5개를 anchor로 노출. 나머지는 스크롤만:
- `overview` → `#hero` (S1)
- `modules` → `#modules` (S4)
- `signals` → `#chart-stories` (S6)
- `compare` → `#comparison` (S9)
- `docs` → `#cta` (S10) — 본 PR v1에서는 단순 마지막 섹션 anchor. 외부 docs 라우트 분리 시 별 PR

active 표시는 IntersectionObserver 또는 scroll position 기반. 단순 구현으로 시작.

---

## 5. Hero Macro Layout (S1)

### 5.1 Composition

```
┌─ Section S01 / HERO ─────────────────────────────────────────────────────┐
│ [ S01 / HERO ]   // 4-silo translation layer                             │
│                                                                          │
│ 실험을 자본 결정으로            ┌──────────────────────────────────────┐ │
│ 바꾸는 OS▌                     │┌                       ◢ INVEST · 86% │ │
│                                 │ 투자 확대 권고                       │ │
│ A/B·라이브옵스·시장 신호를      │ Payback이 P50 5.2개월…              │ │
│ ROI로 번역합니다.               │ ──────────────                       │ │
│                                 │ PAYBACK  ΔLTV  CAPITAL Δ            │ │
│ [▸ START_DEMO] [// 데이터로 보기]│ 5.2mo    +$3.40 +18.4%              │ │
│                                 │ ──────────────                       │ │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─        │ ▸ NEXT_ACTION  UA 채널 B…           │ │
│ [trust] 5 publishers            │                                    ┘│ │
│ [median Δ] +18.4%               └──────────────────────────────────────┘ │
│ [uptime] 99.94%                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 변경점 (vs 현재 hero)

| 요소 | 현재 | 신규 |
|---|---|---|
| Eyebrow | `01 — HERO` (sans) | `[ S01 / HERO ]` (mono) + ` // 4-silo …` annotation |
| Headline | Instrument Serif 60px | **Geist Mono 38px medium**, `letter-spacing: -0.01em`, `word-break: keep-all` |
| Cursor | 없음 | 헤드라인 끝에 `▌` (12px, color `--brand`, blink 1.2s, prefers-reduced-motion 해제) |
| Sub | sans 16px | **mono 14px**, max-width 560px |
| CTA | 일반 버튼 | `▸ START_DEMO` (mono, bg `--fg-0`, white text), `// 데이터로 보기` (mono, ghost) |
| Meta row | 없음 | 신규 — `[trust] 5 publishers · [median Δ] +18.4% · [uptime] 99.94%` (mono 11px, dashed top border) |
| Verdict 카드 | 헤드라인 아래 풀폭 | **우측 380px 고정 사이드** — corner marker `┌ ┘` (대각 2개), `◢ INVEST` pill, mono KPI 3-col, `▸ NEXT_ACTION` prompt |
| Grid | 단일 컬럼 | `grid-template-columns: 1fr 380px`, gap 24px, align-items start |

### 5.3 반응형
- ≥ 1024px: 2-col grid (위 anatomy)
- 768–1023px: verdict 카드를 헤드라인 아래로 쌓기, max-width 580px
- < 768px: 모노 헤드라인 32px로 축소, verdict 카드 full-width

---

## 6. Chrome Vocabulary — 8 Elements

각 요소는 `compass/src/widgets/landing/ui/_shared/`에 컴포넌트화한다 (재사용 보장).

| # | 컴포넌트 | 적용 위치 | 시각 |
|---|---|---|---|
| 01 | `<TerminalEyebrow section="S04" name="MODULES" />` | 10 섹션 전체 | `[ S04 / MODULES ]` mono 11px uppercase |
| 02 | `font-mono tabular-nums` 클래스 | 모든 KPI·%·날짜·돈 단위 | Geist Mono + tnum |
| 03 | `<HeroCursor />` | S1 헤드라인 끝 1회만 | `▌` 12px brand color, blink 1.2s |
| 04 | `<AsciiDivider />` | 섹션 사이 (선택적, 색상 대역 교차 보강용) | `─ ─ ─ ─ …` 32-char repeat, mono 11px, opacity 0.55 |
| 05 | `<CornerMarker variant="card" />` | SignalCard, ModuleCard, VerdictCard | `┌` (top-left) + `┘` (bottom-right) 대각 2개만 |
| 06 | `<StatusPill tone="positive\|caution\|risk">◢ INVEST</StatusPill>` | SignalCard 상단, Comparison 표 | mono 10px uppercase, 8% bg, 20% border |
| 07 | `<PromptLine cmd="NEXT_ACTION">UA 채널 B…</PromptLine>` | HeroVerdict, CTA, Action Impact | `▸` brand + `KEY_NAME` (fg-3) + 본문 (fg-1) |
| 08 | `<InlineAnno>// trans.</InlineAnno>` | S2/S3/S5 본문 옆 sparingly | mono 13px, color `--mono-anno` |

### 6.1 컴포넌트 위치
```
compass/src/widgets/landing/ui/_shared/
├── terminal-eyebrow.tsx      (NEW)
├── hero-cursor.tsx           (NEW)
├── ascii-divider.tsx         (NEW)
├── corner-marker.tsx         (NEW)
├── status-pill.tsx           (NEW — yieldo-pill과 별개. 라이트 테마용)
├── prompt-line.tsx           (NEW)
├── inline-anno.tsx           (NEW)
└── widget-fixtures.ts        (기존)
```

`mono-numerals`은 컴포넌트가 아니라 utility class. globals.css에 추가:
```css
.mono-num { font-family: var(--font-mono); font-feature-settings: 'tnum' 1; }
```

---

## 7. Per-Section Application Matrix

| Sec | Eyebrow | Cursor | Divider | Corner | Pill | Prompt | Anno | Mono Head |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| S1 Hero | ✅ | ✅ (only here) | ✅ before | ✅ verdict card | ✅ | ✅ | ✅ | **✅** |
| S2 Why Fail | ✅ | — | ✅ before | ✅ each card | — | — | ✅ | sans 유지 |
| S3 Questions | ✅ | — | — | ✅ each card | — | ✅ | — | sans 유지 |
| S4 Modules | ✅ | — | ✅ before | ✅ each card | ✅ each | ✅ | — | sans 유지 |
| S5 Product Proof | ✅ | — | — | ✅ verdict card | ✅ | — | ✅ | sans 유지 |
| S6 Chart Stories | ✅ | — | ✅ before | ✅ each chart | — | — | ✅ caption | sans 유지 |
| S7 Experiment Impact | ✅ | — | — | ✅ each metric | ✅ | ✅ | — | sans 유지 |
| S8 Translation | ✅ | — | ✅ before | — | ✅ pipeline node | ✅ | — | sans 유지 |
| S9 Comparison | ✅ | — | ✅ before | — | ✅ table cells | — | — | sans 유지 |
| S10 CTA | ✅ | — | — | ✅ button frame | — | ✅ | — | sans 유지 |

**모노 헤드라인은 S1에만**. S2-S10는 기존 Instrument Serif/Noto Serif KR 헤드라인 유지 — 헤드라인까지 다 모노로 가면 retro 과잉으로 무너진다.

---

## 8. Deliberate Exclusions (camp territory)

다음은 명시적으로 적용하지 않는다:

- ❌ CRT scanline, 글리치 텍스트, matrix rain
- ❌ Phosphor green 전면 적용 (yieldo 영역)
- ❌ "ACCESS_GRANTED" / "INITIALIZING…" / "DECRYPTING…" 류 카피
- ❌ 모든 섹션 헤드라인을 모노로 (S1만)
- ❌ 모든 텍스트에 cursor (S1 헤드라인 1회만)
- ❌ 큰 ASCII 아트 로고 (`▲ compass` 텍스트만)
- ❌ Bloomberg 듀얼 strip ticker tape (NavBar B 거절됨)
- ❌ 다크 테마 또는 다크 NavBar
- ❌ Yield Yellow `#F4C842` (yieldo 영역)

---

## 9. Implementation Guardrails

기존 spec(`landing-v2-spec.md`)의 다음 원칙은 변경 불가:

1. **실물 위젯 100% 임베드 (Path B)** — S1·S5·S6의 차트는 현재 자연 크기로 임베드된 dashboard 위젯을 유지. chrome은 위젯 외곽에만 적용.
2. **한국어 `word-break: keep-all`** — 모노 폰트로 바꿔도 한국어 줄바꿈 규칙은 그대로.
3. **Framer Motion `whileInView` + `viewport={{ once: true, margin: '-80px' }}`** — 모든 섹션 reveal 애니 유지. cursor blink만 새로 추가.
4. **색상 대역 교차 리듬** — dark hero / light problem / dark modules / … 패턴 유지. ASCII divider는 보강용일 뿐 대체용 아님.
5. **모바일 viewport 시각 일관성** — chrome 요소가 좁은 폭에서 깨지지 않도록 각 컴포넌트 반응형 자체 확보.

---

## 10. Acceptance Criteria

PR 머지 직전 다음을 모두 충족해야 한다:

- [ ] `npm run lint && tsc && npm test` 통과 (precommit-gate hook 자동)
- [ ] NavBar C가 모든 viewport(모바일/태블릿/데스크톱)에서 깨지지 않음
- [ ] S1 hero가 데스크톱 2-col, 태블릿/모바일 단일 컬럼으로 정상 reflow
- [ ] 8 chrome 컴포넌트가 `_shared/`에 신규 생성, 각각 단위 테스트 1개 이상 (props 기본 렌더 확인)
- [ ] 10 섹션 모두에 `<TerminalEyebrow>` 적용, section anchor `id` 부여 (overview/modules/signals/compare/docs 5개 활성)
- [ ] `prefers-reduced-motion: reduce` 환경에서 cursor blink 비활성화
- [ ] 한/영 i18n 양쪽에서 chrome 텍스트(`NEXT_ACTION`, `START_DEMO` 등) 일관 — 모두 영문 `UPPER_SNAKE_CASE` 유지 (영어 외 변역 안 함, 의도된 chrome 어휘)
- [ ] 색상 토큰은 0개 변경 — `globals.css` diff에서 신규 3개(`--mono-chrome`, `--mono-anno`, `--cursor`)만 추가
- [ ] 기존 `landing-v2-spec.md`의 Path B 위젯 임베드는 그대로 작동 (S1 SignalCard, S6 RetentionCurve/RevenueVsInvest/RevenueForecast)
- [ ] `/design-review` 스킬 8-pattern 점검 통과
- [ ] Vercel preview URL에서 시각 검증 (`@coderabbitai review` post-pr-enrich 자동)

---

## 11. Out-of-Scope Follow-ups

다음은 별 PR로 분리:

- ⌘K 명령 팔레트 실제 동작 (현재는 disabled tooltip만)
- ultraplan PR이 가져올 카피 변경
- Section anchor active state IntersectionObserver 정교화 (v1은 단순 scroll position 매칭)
- Dark theme 토글 지원 (yieldo-rebrand 머지 후 검토)
- Comparison 표(S9) 셀 모노화 깊이 — 이번 PR은 status pill 적용까지만

---

## 12. References

### Visual DNA 차용
- **Bloomberg Terminal** — 모노 KPI 그리드, status pill 어휘
- **Linear** — 미니멀 NavBar 자세, ⌘K kbd 노출
- **Vercel** — 모노 inline `// comment`, 라이트 테마 일관성
- **Raycast** — `▸` prompt accent, mono command line
- **Statsig** — embedded 차트와 marketing의 결합 (이미 landing-v2가 차용)

### 내부 문서
- `docs/design/landing-v2-spec.md` — 모체 spec
- `Project_Compass_UI_Guide.md` — 5 모듈 구조 + 시그널 우선 원칙
- 메모리: `feedback_landing_embedding.md`, `feedback_design_master_authority.md`, `feedback_design.md`, `project_landing_v2_revision.md` (생성 예정)

### Brainstorm 시각 자료
- `.superpowers/brainstorm/48493-1777369149/content/chrome-system.html` — chrome 8 요소 mockup
- `.superpowers/brainstorm/48493-1777369149/content/macro-layout.html` — NavBar 후보 + 매크로 레이아웃
