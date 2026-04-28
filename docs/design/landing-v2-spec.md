# yieldo Landing Page v2 — Design Specification

**Version**: 1.0  
**Date**: 2026-04-14  
**Status**: Source of truth for Phase 2 implementation  
**FSD target**: `yieldo/src/widgets/landing/ui/sections/*.tsx`

---

## 0. Aesthetic Direction

**Tone**: Bloomberg Terminal authority × Vercel clarity. Not a consumer SaaS splash page — an operator-grade decision instrument. Every section answers a capital question, not a product question.

**One memorable thing**: The page never shows "features." It shows decisions. Each section is structured as: *question an operator asks → evidence yieldo shows → confidence it carries.*

**Anti-patterns to avoid**:
- Purple gradients on white (AI slop)
- Generic hero imagery (abstract network diagrams, glowing orbs)
- Feature-list sections ("Here's what we offer")
- Testimonial carousels, star ratings, NPS scores
- Anything that reads as "startup pitch" rather than "institutional instrument"

---

## 1. Global Rhythm

### Section Spacing System

All sections use one of three background bands. Bands alternate to create visual breathing room without decorative dividers.

| Band | Token | Usage |
|---|---|---|
| Canvas | `--bg-0` | Hero, WhyFail, ChartStory A, Comparison |
| Surface | `--bg-1` | QuestionsSection, ProductProof, ChartStory C, CTA |
| Inset | `--bg-2` | ModuleOverview, ChartStory B, Copilot, ExperimentTranslation |

**Vertical padding per section**: `py-24` (96px) on `lg`, `py-16` (64px) on `md`, `py-12` (48px) on mobile.

**Content max-width**: `max-w-6xl mx-auto px-6` for all sections. Exception: ProductProof uses `max-w-7xl` to allow wider dashboard preview.

**Section-to-section transitions**: No decorative separators. Background color change alone signals the break. Where two same-band sections are adjacent (only permitted if the strategy doc mandates it), add a `border-t border-[var(--border-subtle)]`.

### Vertical Spacing Within Sections

| Element gap | Value |
|---|---|
| Section label → Heading | `mb-3` (12px) |
| Heading → Subhead | `mb-4` (16px) |
| Subhead → Body / Grid | `mb-12` (48px) on lg, `mb-8` on mobile |
| Card internal padding | `p-6` |
| Grid gap | `gap-6` standard, `gap-5` for dense 4-col grids |
| Preview crop bottom margin | `mt-12` on lg, `mt-8` on mobile |

### Typography Scale (landing-specific extensions)

Landing display uses a larger type ramp than the app interior. These extend (do not replace) the existing `.text-display` / `.text-h1` utilities.

| Role | Family | Size (lg) | Size (md) | Size (mobile) | Weight | Letter-spacing | Color token |
|---|---|---|---|---|---|---|---|
| Hero Headline | Instrument Serif / Noto Serif KR | `text-6xl` (60px) | `text-5xl` | `text-4xl` | 400 (serif natural) | `-0.03em` | `--fg-0` |
| Section Headline | Instrument Serif / Noto Serif KR | `text-4xl` (36px) | `text-3xl` | `text-2xl` | 400 | `-0.02em` | `--fg-0` |
| Section Label | Geist Sans / Pretendard | `text-xs` | same | same | 600 | `0.08em` | `--fg-2` |
| Body Lead | Geist Sans / Pretendard | `text-lg` (18px) | same | `text-base` | 400 | `0` | `--fg-1` |
| Body Support | Geist Sans / Pretendard | `text-base` (16px) | same | `text-sm` | 400 | `0` | `--fg-2` |
| Card Title | Geist Sans / Pretendard | `text-base` | same | same | 600 | `-0.01em` | `--fg-0` |
| Card Body | Geist Sans / Pretendard | `text-sm` | same | same | 400 | `0` | `--fg-2` |
| Signal Badge | Geist Mono | `text-xs` | same | same | 500 | `0.04em` | signal token |
| CTA Button | Geist Sans / Pretendard | `text-sm` | same | same | 600 | `0` | white on `--brand` |

**Line-height rules**:
- Display / Section headlines: `leading-[1.1]`
- Body Lead: `leading-relaxed` (1.625)
- Card Body: `leading-relaxed`
- Signal badges / labels: `leading-none`

### Motion System

All scroll-triggered animations use Framer Motion `whileInView` with `viewport={{ once: true, margin: '-80px' }}`. Page-load animations (Hero only) use `animate`.

| Moment | Animation | Duration | Easing |
|---|---|---|---|
| Hero headline | `y: 24 → 0, opacity: 0 → 1` | 550ms | `easeOut` |
| Hero elements stagger | 150ms between each child | — | — |
| Section headline | `y: 20 → 0, opacity: 0 → 1` | 450ms | `--ease-out-quart` |
| Card grid children | stagger 100ms, `y: 16 → 0` | 380ms per card | `--ease-out-quart` |
| Live product crop (all sections) | `y: 32 → 0, opacity: 0 → 1` | 600ms | `--ease-out-quart` |
| Pipeline diagram steps | stagger 120ms | 350ms per step | `--ease-out-quart` |

No transform-scale animations. No entrance from X-axis. Vertical reveal only — consistent with the existing codebase pattern.

---

## 2. Korean-Specific Rules

### word-break

Apply `style={{ wordBreak: 'keep-all' }}` (or Tailwind `[word-break:keep-all]`) to **every Korean text node** that is a heading, label, or pill. This is mandatory — Korean word-wrap without `keep-all` breaks mid-syllable block and reads unprofessionally.

Apply `[overflow-wrap:break-word]` alongside `keep-all` on all display headlines.

### Font weight adjustment for Korean body

Pretendard at `font-weight: 400` renders lighter than Geist Sans at the same weight on macOS. For card body text (`text-sm`) in Korean, use `font-weight: 500` instead of 400 to match perceived weight. Apply via locale-conditional class: `locale === 'ko' ? 'font-medium' : 'font-normal'`.

### Manual line-split keys

The following i18n keys need explicit `<br />` tags at specific breakpoints. Spec the intended break for each:

| Section | Key | Intended break (EN) | Intended break (KO) |
|---|---|---|---|
| S1 Hero | `headline` | After "evidence." → new line | After "운영하세요." → new line |
| S1 Hero | `subhead` | After "decision layer." — single line at lg | After "않습니다." → new line |
| S2 WhyFail | `heading` | Single line at lg | After "않습니다." if wraps |
| S4 ModuleOverview | `sectionHead` | Single line at lg | After "방법이" if 2-line |
| S8 Experiment | `sectionHead` | Single line at lg | After "않습니다." |
| S10 CTA | `heading` | Single line | Force single line, shorten KO if needed |

Rule: Korean headlines must never wrap to 3 lines on mobile at `text-2xl`. Shorten the KO string before allowing 3-line wrap.

### Section labels (eyebrow text)

All section labels (eyebrow lines above headings) should be **English only**. The labels are data-register, category-marker text — they work as classification markers and are internationally legible. Do not translate: "Decision Layer", "The Problem", "Four Questions", "Platform", "Proof", "Evidence", "Explainability", "Experiment ROI", "Category", "Get Started".

---

## 3. Live Product Crop Placement Map

### Why live crops, not static images

The six preview components are live React trees — not screenshots or image files. They reuse actual dashboard widgets with `transform: scale(...)`, `pointer-events-none`, and static fixture data from `preview-fixtures.ts`. This means the previews are always in sync with the real product: any design token change, widget refactor, or data shape update propagates automatically. There is no asset pipeline to maintain, no Figma-export step, no stale PNG on Vercel's CDN. The output is a static build — the crops render at build time and produce no runtime API calls.

### Placement and native sizes

The crops are already implemented at `/yieldo/src/widgets/landing/ui/dashboard-preview/`. Each has default `width`, `height`, and `scale` props that control its rendered footprint. The table below is the authoritative sizing contract.

| Component | Section | Placement | Native rendered size (default props) | Scale |
|---|---|---|---|---|
| `SignalCrop` | S1 Hero | Below CTA pills, centered within `max-w-4xl` | 520 × 260 px | 0.65 |
| `PaybackCrop` | S5 ProductProof | Right column at lg, below text at mobile | 480 × 280 px | 0.70 |
| `RevenueVsInvestmentCrop` | S6a Chart Story A | Right col of 2-col layout | 560 × 320 px | 0.65 |
| `RetentionFanCrop` | S6b Chart Story B | Right col of 2-col layout | 560 × 340 px | 0.65 |
| `RevenueForecastCrop` | S6c Chart Story C | Right col of 2-col layout | 560 × 300 px | 0.65 |
| `ActionCrop` | S7 Copilot | Right col of 2-col layout | 460 × 200 px | 0.70 |

### Container constraints and responsive scaling

| Component | lg container max-width | md | mobile |
|---|---|---|---|
| `SignalCrop` | `max-w-4xl` (896px), centered | `max-w-3xl` | `w-full`, stacks below text |
| `PaybackCrop` | Right col of `max-w-7xl` 2-col grid | Stacks below text | `w-full` |
| Chart crops (3×) | Right col of `max-w-6xl` 2-col grid, `lg:col-span-1` | Stacks below text | `w-full`, cap at native width |
| `ActionCrop` | Right col of `max-w-6xl` 2-col grid | Stacks below text | `w-full`, cap at native width |

On mobile, each crop renders at its default pixel width but inside a `w-full overflow-x-auto` wrapper so it does not cause horizontal page scroll. Do not override `width` props — let the outer scroll container absorb overflow rather than distorting the inner widget's layout.

### Framing: how to make a live tree read as a "product preview"

Do not wrap crops in a `<img>` or `<Image>` tag. Wrap the component in a framing `<div>` with these classes:

```tsx
<div className="rounded-[var(--radius-card)] border border-[var(--border-default)] overflow-hidden shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]">
  <CropComponent />
</div>
```

Rules:
- One thin `border-[var(--border-default)]` only — no double borders (the crop components already have `rounded-[var(--radius-card)]` internally; the outer frame clips them cleanly via `overflow-hidden`).
- One level of very soft shadow (`shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]`) to lift the preview off the background. This single shadow is permitted — it reads as a physical panel, not a decorative glow.
- No glows, no colored drop shadows, no border-glow effects.
- On mobile: preview stacks below its associated text block, not beside it.
- At `md` (768px): begin 2-col layouts where specified. Below `md`: single column, preview second.

### Accessibility

All six crop components already carry `aria-hidden="true"`. They are invisible to screen readers. The semantic meaning of each preview must be fully carried by the surrounding landing copy — the heading, subhead, and bullet points must describe what is shown in the crop without relying on the crop being perceivable. Do not add `alt` text or `aria-label` to the crop wrapper — the `aria-hidden` is already set inside the component.

---

## 4. Section Specifications

---

### S1 — Hero

**File**: `sections/hero-section.tsx` (replace existing)  
**Background**: `--bg-0`  
**Min-height**: `min-h-[92vh]` — taller than current 80vh to accommodate the preview crop.

#### Layout

```
[NavBar: fixed 56px]
[Hero section: flex col, items-center, justify-center, pt-20 pb-16]
  [Eyebrow label]
  [H1 headline — 2 lines]
  [Subhead — 1-2 lines]
  [CTA button]
  [3 auxiliary pills — inline-flex row]
  [SignalCrop live preview — max-w-4xl, mt-16]
```

Responsive:
- `lg`: All items centered. `SignalCrop` preview at full `max-w-4xl` width.
- `md`: Same center alignment. Preview at `max-w-3xl`.
- mobile: Preview at full container width `w-full`.

#### Typography

| Element | Classes |
|---|---|
| Eyebrow | `text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-3` |
| H1 Line 1 | `font-display text-6xl md:text-5xl text-4xl leading-[1.1] tracking-[-0.03em] text-[var(--fg-0)]` |
| H1 Line 2 | same, displayed as second line via `<br />` |
| Subhead | `text-lg md:text-base leading-relaxed text-[var(--fg-1)] max-w-2xl text-center mt-4` |
| CTA | `h-11 px-7 bg-[var(--brand)] text-white text-sm font-semibold rounded-[var(--radius-card)]` |
| Aux pill text | `text-xs text-[var(--fg-2)]` |

#### Visual Hierarchy

1. H1 headline (largest text, Instrument Serif, `--fg-0`)
2. `SignalCrop` live preview (real product rendered — proof that it's real)
3. CTA button (brand blue)
4. Subhead (supporting context)
5. Aux pills (tertiary trust signals)

#### Auxiliary Pills

Three pills below CTA. Style: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-1)] text-xs text-[var(--fg-2)]`. Gap between pills: `gap-3` on a flex row, wraps to 2 rows on mobile.

| EN | KO |
|---|---|
| Forecast investment outcomes with confidence | 신뢰구간으로 투자 결과를 예측 |
| See your market gap clearly | 시장 격차를 명확하게 확인 |
| Translate experiment wins into capital decisions | 실험 승리를 자본 배분으로 전환 |

#### Animation

| Element | Delay |
|---|---|
| Eyebrow | 0ms |
| H1 | 80ms |
| Subhead | 200ms |
| CTA | 320ms |
| Pills | 420ms (single group, not staggered individually) |
| `SignalCrop` preview | 500ms, `y: 40 → 0` |

#### Copy

**EN**:
- Eyebrow: "Decision Layer"
- H1 Line 1: "Run your game portfolio"
- H1 Line 2: "at the speed of evidence."
- Subhead: "Not another dashboard. yieldo turns market, experiment, UA, and financial data into one investment decision."

**KO**:
- Eyebrow: "Decision Layer"
- H1 Line 1: "데이터 근거로"
- H1 Line 2: "게임 포트폴리오를 운영하세요."
- Subhead: "또 하나의 대시보드가 아닙니다. 시장, 실험, UA, 재무 데이터를 하나의 투자 판단으로 연결합니다."

**Korean line-break**: H1 must use `word-break: keep-all`. Subhead needs manual `<br />` after "않습니다." at `md` breakpoint.

---

### S2 — Why Current Tools Fail

**File**: `sections/why-fail-section.tsx`  
**Background**: `--bg-1`  
**Border**: `border-y border-[var(--border-subtle)]`

#### Layout

```
[Section: py-24]
  [max-w-6xl mx-auto px-6]
    [Eyebrow + Heading — text-center]
    [Subhead — text-center, max-w-3xl mx-auto]
    [4-card grid — mt-12]
    [Conclusion line — mt-10, text-center]
```

Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5`

#### Card Structure

Each of the 4 silo cards:
```
[Card: p-6, bg-[var(--bg-0)], border border-[var(--border-subtle)], rounded-[var(--radius-card)]]
  [Label badge: text-xs font-semibold uppercase tracking-wide]  ← brand-colored
  [Does line: text-sm font-medium text-[var(--fg-1)] mt-3]
  [Misses line: text-sm text-[var(--signal-caution)] mt-1]  ← amber, signals incompleteness
  [Divider: border-t border-[var(--border-subtle)] mt-4 pt-4]
  [Missing question: text-xs text-[var(--fg-3)] italic]
```

The "misses" line uses `--signal-caution` (amber) — not red. Amber = "incomplete, not broken." This maintains operator-grade restraint.

#### Visual Hierarchy

1. Heading ("Every team has data. Nobody connects it.")
2. 4 silo cards (scan the landscape of fragmentation)
3. Conclusion line ("yieldo connects all four into one investment decision.") — `font-medium text-[var(--fg-0)]`, signals resolution

#### Copy

**EN**:
- Eyebrow: "The Problem"
- Heading: "Every team has data. Nobody connects it."
- Subhead: "Market, UA, product, and finance each answer a narrow question. None answers the one that matters."
- Conclusion: "yieldo connects all four into one investment decision."

Cards (EN):
| Label | Does | Misses |
|---|---|---|
| Market | Knows external benchmarks | Not whether the market justifies investment |
| UA | Knows acquisition efficiency | Not long-term investment value |
| Product | Knows which variant won | Not the capital allocation value of that win |
| Finance | Knows burn and runway | Not whether experiments are working |

**KO**:
- Eyebrow: "The Problem"
- Heading: "모두가 데이터를 갖고 있지만, 아무도 연결하지 않습니다."
- Subhead: "시장, UA, 프로덕트, 재무 — 각자 좁은 질문에만 답합니다. 진짜 중요한 질문엔 아무도 답하지 않습니다."
- Conclusion: "yieldo가 네 영역을 하나의 투자 판단으로 연결합니다."

**Korean line-break**: Heading needs `word-break: keep-all`. Conclusion should stay on 1 line at `md+`.

#### Animation

Cards: `whileInView`, stagger `0.09s` per card. Section heading: `whileInView`, `y: 20 → 0`.

---

### S3 — Four Questions yieldo Answers

**File**: `sections/questions-section.tsx`  
**Background**: `--bg-2`

#### Layout

```
[Section: py-24]
  [max-w-6xl mx-auto px-6]
    [Eyebrow + Heading — text-center]
    [2×2 grid of question cards — mt-12]
```

Grid: `grid-cols-1 md:grid-cols-2 gap-6`

#### Question Card Structure

Each card is a decision-framing unit, not a feature card:
```
[Card: p-8, bg-[var(--bg-1)], border border-[var(--border-subtle)], rounded-[var(--radius-card)]]
  [Question mark icon OR number — text-[var(--fg-3)]]
  [Question text: text-xl font-semibold text-[var(--fg-0)] mt-3, leading-snug]
  [Who asks this: text-sm text-[var(--fg-2)] mt-2]
  [Mini annotation: text-xs font-mono text-[var(--brand)] mt-4]  ← e.g. "82% confidence · Invest More"
```

The mini annotation at the bottom of each card is an inline signal — a 1-line glimpse of what yieldo actually shows. It uses `--font-geist-mono` and `--brand` color to look data-register.

#### Visual Hierarchy

1. Section heading ("Four questions. One layer.")
2. Question text in each card (large, bold serif emphasis)
3. Mini signal annotation (brand blue, monospace — proof of specificity)
4. "Who asks this" (tertiary, context)

#### Questions

| # | Question (EN) | Who asks | Mini annotation |
|---|---|---|---|
| 1 | Should we invest more right now? | CEO, CFO | "82% confidence · Invest More" |
| 2 | Why did payback drift from D42 to D47? | UA Lead, Finance | "CPI +12% · D7 retention −0.8pp" |
| 3 | Where are we below the market? | Product, Strategy | "D7: 4.1% vs genre P50: 6.8%" |
| 4 | Which experiment created investment value? | Product, Finance | "ΔLTV +$0.31 · Payback −5 days" |

KO equivalents — all question text needs `word-break: keep-all`.

#### Copy

**EN**: Eyebrow: "Four Questions" | Heading: "The questions operators actually ask."
**KO**: Eyebrow: "Four Questions" | Heading: "운영자가 실제로 묻는 네 가지 질문."

#### Animation

2×2 grid: stagger `0.1s` per card, `whileInView`.

---

### S4 — Module Overview (Integrated Platform)

**File**: `sections/module-overview-section.tsx`  
**Background**: `--bg-0`

This is the Statsig "Integrated products" equivalent — the clearest statement that yieldo is a unified system, not four separate tools.

#### Layout

```
[Section: py-24]
  [max-w-6xl mx-auto px-6]
    [Eyebrow + Heading — text-center]
    [Subhead — text-center, max-w-3xl mx-auto]
    [4-module card grid — mt-14]
```

Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`

#### Module Card Structure

```
[Card: p-6, bg-[var(--bg-1)], border border-[var(--border-subtle)], rounded-[var(--radius-card)]]
  [Module number: text-xs font-mono text-[var(--fg-3)] — "01" "02" etc.]
  [Module name: text-base font-semibold text-[var(--fg-0)] mt-2]
  [Core question: text-sm text-[var(--brand)] mt-1 font-medium]
  [Description: text-sm text-[var(--fg-2)] mt-3 leading-relaxed]
```

The core question line (brand blue) is the decision-register hook. It makes each module read as an answer to an operator question, not a feature description.

No icons. Numbers instead — more operator-grade, less consumer SaaS.

#### Modules

| # | Name | Core Question (EN) | Description (EN) |
|---|---|---|---|
| 01 | Investment Signal | Can we invest more? | Shows confidence, payback trajectory, and current capital efficiency — one signal, not five charts. |
| 02 | Market Gap | Where do we stand? | Benchmarks retention and revenue against genre P10/P50/P90 — so you see the headroom and the gap. |
| 03 | Experiment Value | Which tests moved LTV? | Translates A/B results into ΔLTV, payback movement, and capital efficiency. Experiments become investment portfolio items. |
| 04 | Decision Copilot | Why did the metric move? | Explains what changed — CPI, retention, ARPDAU — and recommends the next capital action. |

KO equivalents with `word-break: keep-all` on all text.

#### Copy

**EN**: Eyebrow: "Platform" | Heading: "There's a smarter way to run a game portfolio." | Subhead: "yieldo gives operators a unified decision layer across market intelligence, UA, experiments, and financials."

**KO**: Eyebrow: "Platform" | Heading: "게임 포트폴리오를 운영하는 더 똑똑한 방법이 있습니다." | Subhead: "yieldo는 시장 인텔리전스, UA, 실험, 재무 데이터를 하나의 의사결정 레이어로 통합합니다."

#### Animation

Heading: `whileInView y:20→0`. Cards: stagger `0.08s` each.

---

### S5 — Product Proof

**File**: `sections/product-proof-section.tsx`  
**Background**: `--bg-1`

This is the "Executive Overview" deep-dive — showing the single most powerful screen in the product.

#### Layout (lg: 2-column)

```
[Section: py-24]
  [max-w-7xl mx-auto px-6]
    [2-col grid: grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 items-center]
      [Left col]
        [Eyebrow]
        [Heading]
        [Subhead]
        [5 bullet points — what is visible in the preview]
        [CTA link — "Explore live demo →"]
      [Right col]
        [PaybackCrop live preview]
```

Mobile: single column, preview renders below text.

#### Left Column — Bullet Points

5 bullets with leading dot in `--brand` color:
- Investment status signal
- Confidence level (%)
- Payback range (P10–P90)
- Top reasons behind the signal
- Next action recommendation

Style: `flex items-start gap-3 text-sm text-[var(--fg-1)]` with `w-1.5 h-1.5 rounded-full bg-[var(--brand)] mt-1.5 flex-shrink-0` as the dot.

#### Copy

**EN**: Eyebrow: "Proof" | Heading: "One screen for the decision that matters most." | Subhead: "yieldo gives game operators one investment signal, the evidence behind it, and the next action to take."

**KO**: Eyebrow: "Proof" | Heading: "가장 중요한 의사결정을 위한 하나의 화면." | Subhead: "yieldo는 게임 운영자에게 하나의 투자 시그널, 그 근거, 그리고 다음 실행 방향을 제공합니다."

#### Visual Hierarchy

1. `PaybackCrop` live preview — the product speaks first (right col at lg)
2. Heading (left col, serif display)
3. 5 bullet points (specificity / evidence)
4. CTA link

#### Animation

Left col: `whileInView y:20→0 opacity`. Right col (preview crop): `whileInView y:32→0`, 150ms delay after left col starts.

---

### S6 — Three Chart Stories

**File**: `sections/chart-stories-section.tsx`  
**Background**: Alternating — A: `--bg-2`, B: `--bg-0`, C: `--bg-1`

Each sub-story is a full-width section with a 2-column layout. They are implemented as three separate `<section>` elements inside this file, OR as a single section with three visual blocks separated by `border-t border-[var(--border-subtle)]`. **Preferred**: three separate `<section>` tags for clean scroll behavior and independent animation triggers.

#### Layout (each chart story)

```
[Section: py-24]
  [max-w-6xl mx-auto px-6]
    [2-col: grid-cols-1 lg:grid-cols-2 gap-16 items-center]
      [Text col (left on A and C, right on B — alternating)]
        [Eyebrow]
        [Heading]
        [Body paragraph]
        [1-2 key callout lines — monospace data register]
      [Preview col]
        [Chart crop live preview]
```

Alternating text/preview side creates rhythm across the three stories. Story A: text left, preview right. Story B: text right, preview left. Story C: text left, preview right.

#### Chart Story A — Revenue vs Investment

**Background**: `--bg-2`  
**Preview**: `RevenueVsInvestmentCrop`

- Eyebrow: "Evidence"
- Heading: "See whether growth is paying back."
- Body: "Compare revenue, UA spend, and break-even dynamics in one view — so capital decisions are grounded in actual efficiency."
- Callout: `Revenue CAGR: +34% · ROAS(D30): 1.14×` (monospace, `--fg-1`)

KO heading: "성장이 투자 비용을 회수하고 있는지 확인하세요." — `word-break: keep-all`

#### Chart Story B — Retention Forecast

**Background**: `--bg-0`  
**Preview**: `RetentionFanCrop`

- Eyebrow: "Evidence"
- Heading: "Retention, with real confidence."
- Body: "Forecast D1–D60 retention with P10/P50/P90 bands, so you see both the expected path and the uncertainty around it."
- Callout: `D7: 5.8% · Genre P50: 4.2% · Top 25% in genre` (monospace, `--signal-positive`)

KO heading: "실제 신뢰구간으로 리텐션을 예측하세요." — `word-break: keep-all`

#### Chart Story C — Revenue Forecast

**Background**: `--bg-1`  
**Preview**: `RevenueForecastCrop`

- Eyebrow: "Evidence"
- Heading: "Forecast outcomes, not hopes."
- Body: "See downside, base case, and upside scenarios as probability ranges instead of a single fragile number."
- Callout: `Base: $2.1M · Upside: $2.8M · Downside: $1.5M` (monospace, `--fg-1`)

KO heading: "희망이 아닌 결과를 예측하세요." — `word-break: keep-all`

#### Animation (each story)

Text col: `whileInView y:20→0`. Preview col: `whileInView y:32→0`, 120ms delay.

---

### S7 — Copilot / Explainability

**File**: `sections/copilot-section.tsx`  
**Background**: `--bg-2`

#### Layout (2-column, text left / preview right)

```
[Section: py-24]
  [max-w-6xl mx-auto px-6]
    [2-col: grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-center]
      [Left: text block]
        [Eyebrow]
        [Heading]
        [Body paragraph]
        [Attribution breakdown — 3 rows, monospace]
      [Right: ActionCrop live preview]
```

#### Attribution Breakdown

Three rows showing the decomposition of a payback drift event. Style as a mini data table:

```
[Row: flex justify-between items-center py-2 border-b border-[var(--border-subtle)]]
  [Metric name: text-sm text-[var(--fg-1)]]
  [Value: text-sm font-mono font-medium text-[color]]
```

| Metric | Value | Color |
|---|---|---|
| CPI change | +12% | `--signal-caution` |
| D7 retention shift | −0.8pp | `--signal-risk` |
| ARPDAU change | +3% | `--signal-positive` |

Above the table, the question in a `blockquote`-style box:
```
[Box: px-4 py-3, border-l-2 border-[var(--brand)], bg-[var(--brand-tint)], rounded-r-[var(--radius-inline)]]
  [Text: text-sm italic text-[var(--fg-1)]]
  "Why did payback drift from D42 to D47?"
```

#### Copy

**EN**: Eyebrow: "Explainability" | Heading: "Know what changed — before you change the budget." | Body: "yieldo explains why payback moved, what changed in retention or CPI, and how much each factor contributed."

**KO**: Eyebrow: "Explainability" | Heading: "예산을 바꾸기 전에, 무엇이 변했는지 파악하세요." | Body: "yieldo는 회수 기간이 변동한 이유, 리텐션이나 CPI에서 무엇이 달라졌는지, 각 요인이 얼마나 기여했는지를 설명합니다."

#### Visual Hierarchy

1. Blockquote question (anchors the operator's mental model)
2. Attribution breakdown table (specific, quantified)
3. `ActionCrop` live preview (proof)
4. Heading and body

#### Animation

Left col: `whileInView y:20→0`. Breakdown table rows: stagger `0.07s` each. Right preview: `whileInView y:32→0`, 100ms delay.

---

### S8 — Experiment-to-Investment Translation

**File**: `sections/experiment-section.tsx`  
**Background**: `--bg-0`

#### Layout

```
[Section: py-24]
  [max-w-6xl mx-auto px-6]
    [Eyebrow + Heading — text-center]
    [Subhead — text-center, max-w-2xl mx-auto]
    [Pipeline diagram — mt-14, full width]
    [3-stat row — mt-12]
```

#### Pipeline Diagram

A horizontal flow with 4 nodes connected by arrows. On mobile, renders as a vertical stack.

```
[Flex: items-center justify-center gap-0 flex-wrap]
  [Node] → [Arrow] → [Node] → [Arrow] → [Node] → [Arrow] → [Node]
```

Node style:
```
[px-5 py-3, bg-[var(--bg-1)], border border-[var(--border-subtle)], rounded-[var(--radius-card)]]
  [text-xs text-[var(--fg-2)] uppercase tracking-wide]  ← node label
  [text-sm font-semibold text-[var(--fg-0)] mt-1]       ← value
```

Arrow: `→` in `text-[var(--fg-3)] text-xl mx-3`, `hidden` on mobile (replaced by vertical connector line).

| Node | Label | Value example |
|---|---|---|
| 1 | Experiment | D7 retention +3.7pp |
| 2 | Translation | ΔLTV +$0.31 |
| 3 | Signal | Payback −5 days |
| 4 | Decision | Scale to 100% |

Nodes 1→2→3→4 animate in sequence with stagger `150ms`.

#### 3-Stat Row

Below the pipeline: three stat blocks in `grid-cols-3 gap-6 mt-12`.

```
[Stat: text-center]
  [Number: text-4xl font-bold tabular-nums text-[var(--fg-0)] font-mono]
  [Label: text-sm text-[var(--fg-2)] mt-1]
```

| Stat | Value | Label |
|---|---|---|
| 1 | ΔLTV | "investment value per shipped experiment" |
| 2 | Payback Δ | "days recovered per winning test" |
| 3 | Capital signal | "one decision per experiment cycle" |

These stats are conceptual benchmarks — not real numbers until there is actual customer data. Phase 2 should implement them as static display values for now, with a comment noting they will be replaced by dynamic data.

#### Copy

**EN**: Eyebrow: "Experiment ROI" | Heading: "Experiments don't just ship. They move capital." | Subhead: "yieldo translates experiment results into ΔLTV, payback movement, and capital efficiency — so winning tests become funding decisions."

**KO**: Eyebrow: "Experiment ROI" | Heading: "실험은 그냥 출시되지 않습니다. 자본을 움직입니다." | Subhead: "yieldo는 실험 결과를 ΔLTV, 회수 기간 변동, 자본 효율성으로 번역합니다."

#### Korean line-break

Heading: `word-break: keep-all`. Both lines should be 2 lines max on mobile — verify at `text-2xl`.

#### Animation

Heading `whileInView`. Pipeline nodes: sequential stagger `150ms`. Stat row: simultaneous `whileInView y:16→0` after pipeline finishes.

---

### S9 — Category Comparison

**File**: `sections/comparison-section.tsx`  
**Background**: `--bg-1`

#### Layout

```
[Section: py-24]
  [max-w-5xl mx-auto px-6]
    [Eyebrow + Heading — text-center]
    [Subhead — text-center]
    [Comparison table / card row — mt-14]
```

#### Comparison Structure

Four columns as cards, last one (yieldo) is visually distinguished.

Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`

Card style for competitors:
```
[p-6, bg-[var(--bg-0)], border border-[var(--border-subtle)], rounded-[var(--radius-card)]]
  [Category: text-xs uppercase tracking-wide text-[var(--fg-3)]]
  [Tool type: text-sm font-semibold text-[var(--fg-0)] mt-2]
  [What it tells you: text-sm text-[var(--fg-2)] mt-3 leading-relaxed]
```

Card style for yieldo (last column):
```
[p-6, bg-[var(--bg-1)], border border-[var(--brand)], rounded-[var(--radius-card)]]
  [Category: text-xs uppercase tracking-wide text-[var(--brand)]]
  [Tool type: text-sm font-semibold text-[var(--fg-0)] mt-2]
  [What it tells you: text-sm text-[var(--fg-1)] mt-3 leading-relaxed font-medium]
```

No checkmark grids. No competitor logos. Text-only comparison, more FT-editorial than SaaS marketing.

| Category | Tool Type | What it tells you |
|---|---|---|
| Analytics | Dashboard | What happened |
| Experimentation | Testing | Which variant won |
| Finance | Reporting | What was spent |
| **yieldo** | **Decision Layer** | **Whether to invest more** |

#### Copy

**EN**: Eyebrow: "Category" | Heading: "Built for decisions, not just measurement." | Subhead: "Analytics tells you what happened. yieldo tells you what to do next."

**KO**: Eyebrow: "Category" | Heading: "측정이 아닌 의사결정을 위해 만들어졌습니다." | Subhead: "분석 도구는 무슨 일이 있었는지 말해줍니다. yieldo는 다음에 무엇을 해야 할지 말해줍니다."

#### Visual Hierarchy

1. Heading (positions the category gap)
2. yieldo card (brand-bordered, distinguished)
3. Competitor cards (muted, contextual)

#### Animation

Cards: stagger `0.08s` per card, last card (yieldo) gets `0.05s` extra delay so it "lands" last.

---

### S10 — CTA

**File**: `sections/cta-section.tsx` (replace existing)  
**Background**: `--bg-0`  
**Border**: `border-t border-[var(--border-subtle)]`

This section is minimal by design. The page has already made the argument — this is resolution, not pitch.

#### Layout

```
[Section: py-28 px-6]
  [max-w-2xl mx-auto flex flex-col items-center text-center]
    [Heading]
    [Subhead]
    [CTA button — primary]
    [Secondary link]
```

#### Typography

| Element | Classes |
|---|---|
| Heading | `font-display text-4xl md:text-3xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)]` |
| Subhead | `text-base text-[var(--fg-2)] mt-4 max-w-sm` |
| Primary CTA | `h-12 px-8 bg-[var(--brand)] text-white text-sm font-semibold rounded-[var(--radius-card)] mt-8` |
| Secondary | `text-sm text-[var(--fg-2)] underline underline-offset-2 mt-4` |

#### Copy

**EN**: Heading: "See the decision, not just the data." | Subhead: "See how yieldo turns game data into investment decisions." | Primary CTA: "See the decision demo" | Secondary: "Or explore the live demo →"

**KO**: Heading: "데이터가 아닌 판단을 확인하세요." | Subhead: "yieldo가 게임 데이터를 투자 판단으로 바꾸는 과정을 직접 확인하세요." | Primary CTA: "데모 보기" | Secondary: "또는 라이브 데모 탐색하기 →"

#### Animation

Single motion group: `whileInView y:20→0 opacity`, all children together (no stagger — the CTA is a resolution, not a reveal).

---

## 5. Navigation Bar — Updates

**File**: `sections/nav-bar.tsx` (extend existing, not replace)

**Additions to existing NavBar**:
- Add "Book a demo" ghost button between locale toggle and Login: `text-sm font-medium px-3 py-1.5 rounded-[var(--radius-card)] border border-[var(--border-default)] text-[var(--fg-1)] hover:border-[var(--border-strong)]`
- No logo changes.
- Existing scroll behavior (backdrop blur on scroll) retained.

---

## 6. Footer

**File**: `ui/footer.tsx` (existing, no change in this spec)

Footer is not part of the 10-section refactor. Leave as-is.

---

## 7. Page Composition

The updated `(public)/page.tsx` imports in this order:

```tsx
<NavBar />
<main className="pt-14">
  <HeroSection />           // S1 — bg-0
  <WhyFailSection />        // S2 — bg-1
  <QuestionsSection />      // S3 — bg-2
  <ModuleOverviewSection /> // S4 — bg-0
  <ProductProofSection />   // S5 — bg-1
  <ChartStoriesSection />   // S6 — bg-2 / bg-0 / bg-1 (internal)
  <CopilotSection />        // S7 — bg-2
  <ExperimentSection />     // S8 — bg-0
  <ComparisonSection />     // S9 — bg-1
  <CtaSection />            // S10 — bg-0
</main>
<Footer />
```

The `pt-14` on `<main>` accounts for the 56px fixed NavBar. No change here.

---

## 8. Responsive Breakpoint Summary

| Breakpoint | Width | Key layout changes |
|---|---|---|
| mobile (default) | <640px | Single column everywhere. Preview crops stack below text. Pills wrap. H1 `text-4xl`. Pipeline diagram: vertical. |
| sm | 640px | Silo cards go 2-col. Comparison cards go 2-col. |
| md | 768px | Hero subhead single line. Chart stories go 2-col. |
| lg | 1024px | All 2-col layouts activate. Module cards go 4-col. Silo cards go 4-col. Comparison cards go 4-col. H1 `text-6xl`. |

All preview crop widths at mobile: `w-full` (inside `overflow-x-auto` wrapper). At md: `max-w-xl`. At lg: follow grid column width.

---

## 9. Accessibility Checklist

- All `<section>` elements have an `aria-label` attribute matching the section's eyebrow/heading.
- Live product crop components carry `aria-hidden="true"` — do not add `alt` text to them. Semantic meaning must be carried entirely by surrounding copy.
- CTA buttons and links: `focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2`.
- Pipeline diagram on mobile: rendered as a vertical list with `role="list"` if implemented as animated sequence.
- Color-alone information: signal colors (amber/green/red) always paired with text labels, never color alone.
- Section order is logical in DOM — no reordering via CSS that breaks tab/screen-reader order.
- Locale toggle button: `aria-label="Switch to English"` / `"한국어로 전환"`.

---

## 10. Visual Inventory Gate — Phase 2 Checklist

Phase 2 engineers must verify all items before PR merge.

### Tokens
- [ ] No hardcoded hex colors — all colors use CSS variable tokens
- [ ] No hardcoded pixel values for radii — use `--radius-card`, `--radius-inline`, `--radius-modal`
- [ ] No hardcoded transition durations — use `--duration-micro`, `--duration-component`, `--duration-chart`

### Typography
- [ ] All display/section headlines: Instrument Serif / Noto Serif KR via `.font-display`
- [ ] All body: Geist Sans / Pretendard via `body` font stack
- [ ] All numerical values: `font-variant-numeric: tabular-nums` (inherited from global `*` selector)
- [ ] Signal/data callouts: Geist Mono via `.font-mono`
- [ ] No Arial, Inter, Roboto, Space Grotesk anywhere in landing code

### Korean
- [ ] Every Korean heading node has `word-break: keep-all`
- [ ] Every Korean heading node has `overflow-wrap: break-word`
- [ ] Korean card body text uses `font-medium` (500) not `font-normal` (400)
- [ ] No Korean heading wraps to 3 lines at mobile `text-2xl`
- [ ] Section eyebrow labels remain English in both locales

### Animation
- [ ] All scroll animations use `whileInView` with `once: true`
- [ ] Hero animations use `animate`, not `whileInView`
- [ ] No animation on preview crops that are below the fold and not yet in viewport

### Live Product Crops
- [ ] All 6 crop components render without console errors
- [ ] No `alt` text added to crop wrappers — `aria-hidden` is already set inside each component
- [ ] All wrapped in framing div: `rounded-[var(--radius-card)] border border-[var(--border-default)] overflow-hidden shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]`
- [ ] No glow effects or colored drop shadows on crop containers

### Layout
- [ ] All sections have correct background token (matches Section Specifications above)
- [ ] `max-w-6xl mx-auto px-6` on all standard sections (S5 uses `max-w-7xl`)
- [ ] No sections have adjacent same-band backgrounds without `border-t border-[var(--border-subtle)]`
- [ ] `pt-14` on `<main>` preserved in page.tsx

### Accessibility
- [ ] All `<section>` have `aria-label`
- [ ] No `alt` text on crop components (they are `aria-hidden`) — surrounding copy carries all meaning
- [ ] All interactive elements have visible focus ring
- [ ] Tab order matches visual order
- [ ] Color contrast: all text tokens meet WCAG AA on their background tokens

### FSD compliance
- [ ] All section components in `yieldo/src/widgets/landing/ui/sections/`
- [ ] `yieldo/src/widgets/landing/index.ts` exports all new section components
- [ ] No direct imports from `sections/` outside `widgets/landing/`
- [ ] No business logic inside section components — props and i18n copy only
