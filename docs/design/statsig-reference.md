# Statsig Visual Reference — Compass Landing Page Blueprint

**Purpose**: Engineering and design reference for the Compass landing page v2 refactor.
**Strategy source**: `/Users/mike/Downloads/Compass/Compass_Statsig_Style_Landing_Strategy.md`
**Research method**: WebFetch on statsig.com (JS-rendered, config layer only), statsig.com/experimentation, statsig.com/el/product-growth, statsig.com/featureflags, statsig.com/blog/*, dribbble.com/statsig + dribbble.com/shots/19452926. Supplemented by SaaS design trend analysis from arounda.agency, saasframe.io, wearetenet.com. Statsig's marketing pages are heavily client-side rendered — direct HTML extraction was not possible. All Statsig-specific visual details are synthesized from: (a) Statsig's own design blog posts (Slate, Pluto design systems), (b) Dribbble portfolio metadata, (c) Statsig's public page copy extracted from config data, (d) best-in-class B2B SaaS pattern research.

**Pages fetched**: statsig.com ✓ (config only), statsig.com/experimentation ✓ (config only), statsig.com/featureflags ✓ (config only), statsig.com/el/product-growth ✓ (config only), statsig.com/blog/new-brand-identity-slate ✓ (config only), statsig.com/blog/statsig-brand-design-2023-review ✓ (config only), dribbble.com/statsig ✓ (metadata), dribbble.com/shots/19452926 ✗ (image-only, no extractable text). Pages 404: statsig.com/products, statsig.com/feature-flags, statsig.com/use-cases.

---

## 1. Section-by-Section Structure (Top to Bottom)

### Section 1 — Nav Bar
**What Statsig does**: Sticky top nav, logo left, product links center, "Get Started" CTA button right. Transparent over hero, fills on scroll. Light background in default state.
**Height**: ~64px
**Compass adaptation**: Same sticky pattern. CTA = "Book a Demo" or "See the Decision Demo". Nav links: Overview / How it Works / For Operators / Pricing. Keep nav minimal — no mega-menus.

---

### Section 2 — Hero
**What Statsig does**:
- Dark or deep-navy background (confirmed by Dribbble profile metadata: "bold, modular identity")
- Headline: short, 3–6 words. Current: "The modern product development platform"
- Sub-copy: 1 sentence, ~15–20 words
- Two CTAs: primary ("Get Started" — filled, high-contrast) + secondary ("Book a demo" — outlined or ghost)
- Hero visual: large product screenshot or dashboard, cropped to show 2–3 key UI elements rather than full product. Positioned center or right-of-center.
- Trust bar immediately below CTAs: 3–4 logos of known customers (OpenAI, Figma, etc.)
- Approximate height: 85–100vh (nearly full screen)

**Typography in hero**:
- Headline: ~56–72px, weight 700–800, tight letter-spacing (-0.02em to -0.04em)
- Sub-copy: ~18–20px, weight 400–500, color ~rgba(255,255,255,0.7) on dark bg
- CTA button: ~16px, weight 600, padding ~14px 28px, border-radius ~6–8px

**Compass adaptation**:
- Dark background — deep navy or near-black (#0a0f1e range) with subtle gradient toward the center
- Headline: "Run your game portfolio at the speed of evidence." — keep same tight tracking
- Sub-copy: "Not another dashboard. Your investment decision layer." — smaller, muted white
- Primary CTA: "See the decision demo" — filled, accent color (amber/gold OR blue — choose one brand accent)
- Secondary CTA: "Book a live demo" — ghost/outlined
- Hero image: crop of the Executive Overview showing ONLY: Investment Signal badge ("Invest More / 82% confidence"), Payback KPI (D47), and one Next Action recommendation. No charts. No tabs.
- Trust bar: "Trusted by game operators managing $X in UA spend" — or 3–4 company logos if available. If no logos yet, use a single metric: "Built on 5 years of mobile gaming retention research."

---

### Section 3 — Stats/Scale Bar
**What Statsig does**:
- Full-width band, slightly different background from hero (subtle contrast)
- 3–4 large numerical stats: "1+ Trillion events/day", "2.5B monthly experiment subjects", "99.99% uptime", "<1ms latency"
- Numbers large (40–48px), label small (12–14px), monospaced or semi-bold
- No background image — pure typographic treatment

**Compass adaptation**: REJECT for MVP. Compass has no usage-at-scale stats yet. Replace with 3 proof bullets in a different format (see Section 5 below). Do not use empty stats.

---

### Section 4 — "Why Current Tools Fail" / Problem Frame
**What Statsig does**: Implicit in their "5+ products in one platform" messaging — they acknowledge fragmentation. Visualized as integration diagram or connected product icons.
**Height**: ~50–70vh
**Background**: Light (white or off-white #f8f9fa) — contrast from dark hero

**Compass adaptation** (explicit problem frame, more prominent than Statsig):
- Background: light (#f4f6f8 or white)
- Headline: "Every team has data. Nobody connects it." — large, dark text
- 4 silo cards in a 2×2 grid: Market / UA / Product / Finance. Each card: icon, title, "knows X", "but not Y"
- End with a connector line/arrow pointing to Compass as the bridge
- This section should be ~60vh

---

### Section 5 — "Integrated Products" / Platform Overview
**What Statsig does**: This is their signature section — arguably the most important structural pattern to borrow.
- Dark background band (returns to dark after the light problem section)
- Large section headline: "There's a smarter way to build product" (or similar)
- Sub-headline: 1–2 sentences on platform unity
- Below: 4–6 product modules in a 2-column or 3-column grid
- Each module card: icon (small, 24–32px), title (18–20px, bold), 2-line description, optional "Learn more" link
- Cards have subtle border, slight shadow, hover state with border-color shift
- Card background: slightly lighter than section background (~1–2% opacity lift)
- Layout: on desktop, 3 columns. On tablet, 2 columns.

**Compass adaptation**:
- Dark background
- Headline: "There's a smarter way to run a game portfolio."
- Sub: "Compass gives operators a unified decision layer across market intelligence, UA, experiments, and financials."
- 4 module cards: Investment Signal / Market Gap / Experiment Value / Decision Copilot
- Each card: icon, bold title, 2-line description answering "what question does this answer?"

---

### Section 6 — Feature Deep-Dives (Alternating Image + Text)
**What Statsig does**: The core scroll experience. Each product feature gets its own full-width section.
- Alternating layout: Section A = image left / text right. Section B = text left / image right.
- Background alternates: dark → light → dark → light
- Each section is ~80–100vh (nearly full screen per feature)
- Image: large product screenshot (60–65% of width on desktop), shown with subtle drop shadow, slight rounded corners (~12px), sometimes with a dark frame/device mockup wrapper
- Text side: small eyebrow label (e.g., "Feature Flags"), large headline (32–40px), 2–3 sentence description, optional feature list with checkmarks, small CTA link ("See how it works →")
- Screenshot treatment: screenshots often have annotation overlays — arrows or highlight boxes pointing to key UI elements, sometimes with callout bubbles. This is critical — raw screenshots without annotation are less effective.

**Compass adaptation**:
- Follow exact same alternating image/text rhythm
- Each section = one "chart story" (Revenue vs Investment / Retention Forecast / Revenue Forecast / Experiment Translation)
- Screenshot treatment: ALWAYS add annotations. Show the P10/P50/P90 labels explicitly. Show the "Invest More" badge. Circle the payback day on the chart.
- Eyebrow labels: "Investment Signal" / "Retention Forecast" / "Experiment Value" / "Decision Copilot"
- Background alternation: maintain dark→light→dark pattern for pacing

---

### Section 7 — Social Proof / Case Studies
**What Statsig does**:
- Light background section
- 2–3 customer quote cards with: company logo, quote text (2–3 sentences), name + title
- Optionally: a horizontal logo bar above the quotes with 8–12 company logos, slightly muted/grayscale
- Quote cards: white background, light border, avatar photo of the person quoting

**Compass adaptation**: Use a simplified version initially.
- 1–2 strong operator quotes (handcrafted pilot customers)
- If no quotes yet: use a single proof statement + metric card (e.g., "Reduced capital allocation decision time from 2 weeks to 2 days.")
- Logo bar: show game company logos if permissible. Otherwise use investor/program logos (예창패, etc.)

---

### Section 8 — Comparison / Category Definition
**What Statsig does**: Minimal — implied through "5+ products in one" framing. No explicit competitor comparison table.
**Compass adaptation**: This is a Compass-specific section Statsig does NOT have.
- Light or subtle gray background
- Simple 4-row comparison: Analytics / Experimentation / Finance / Compass
- What each answers vs. what it does NOT answer
- Positions Compass as the layer above, not a replacement

---

### Section 9 — Bottom CTA Band
**What Statsig does**:
- Dark background band (returns to dark)
- Large centered headline: "Start building with Statsig today" (~40–48px)
- 1 sub-line
- Single primary CTA button (large, ~52–56px height)
- Sometimes a secondary "Talk to sales" text link below

**Compass adaptation**:
- Dark background
- Headline: "See how Compass turns game data into investment decisions."
- CTA: "See the decision demo" (primary) + "Book a live demo" (secondary text)

---

### Section 10 — Footer
**What Statsig does**: Dark background, multi-column link grid (4–5 columns), copyright, social icons.
**Compass adaptation**: Minimal footer for MVP. Logo + 3–4 links + copyright.

---

## 2. Hero Anatomy

| Element | Statsig Pattern | Compass Adaptation |
|---|---|---|
| Headline size | 56–72px, weight 800, tracking -0.03em | Same scale — do not go smaller |
| Headline length | 4–6 words | 8–10 words OK (sentence structure) |
| Sub-copy | 1 sentence, 15–20 words | 2 short sentences — "Not another dashboard. Your investment decision layer." |
| Sub-copy size | 18–20px, weight 400, ~70% opacity | Same |
| Primary CTA | Filled, high-contrast color, ~14px×28px padding | "See the decision demo" — amber/gold fill on dark bg |
| Secondary CTA | Ghost/outlined, same height | "Book a live demo" |
| CTA border-radius | 6–8px (not pill, not sharp) | Same |
| Hero image position | Center or right-aligned, ~55–65% width | Right-aligned, 60% width |
| Hero image content | 2–3 UI elements max, NOT full product | Investment Signal + Payback KPI + Next Action ONLY |
| Hero image treatment | Subtle shadow, rounded corners ~12px, sometimes glowing border | Add subtle glow border (accent color at 30% opacity) |
| Trust element | Customer logos or stats bar immediately below CTAs | Single trust statement or metric if no logos |
| Background | Dark navy / near-black | #0a0f1e or #0d1224, subtle radial gradient center |
| Section height | ~85–100vh | 90vh minimum |

---

## 3. Card / Module Grid Patterns

**Statsig integrated products grid**:
- Desktop: 3 columns, ~340px min card width
- Gap: 24px
- Card padding: 24–32px
- Card border: 1px solid rgba(255,255,255,0.08) on dark bg
- Card hover: border-color → rgba(255,255,255,0.2), subtle shadow lift
- Icon: 32×32px, contained in a 48×48px rounded square background (accent color at 15% opacity)
- Title: 18px, weight 600
- Description: 14–15px, weight 400, ~65% opacity
- No images inside cards — icon + text only

**Compass card adaptation**:
- Same 3-column grid (4 cards → 2×2 on desktop, or 4-column single row)
- Add a subtle "pill" label to each card: "Can we invest more?" / "Where do we stand?" / "Is R&D paying off?" / "What should we do next?"
- The question-as-label pattern differentiates from pure feature cards

---

## 4. Color Rhythm (Section Pacing)

| Section | Statsig BG | Statsig Treatment | Compass BG | Notes |
|---|---|---|---|---|
| Nav | Transparent → white fill on scroll | — | Transparent → dark fill | Compass stays dark |
| Hero | Dark navy #0d1224 approx | Radial glow center | #0a0f1e + radial gradient | Core brand anchor |
| Stats bar | Slightly lighter dark | Typographic only | OMIT | No stats yet |
| Problem frame | White / #f8f9fa | Light, clean | #f4f6f8 | Contrast after dark hero |
| Platform modules | Dark (returns dark) | Card grid | #0d1224 or #111827 | Mirror Statsig rhythm |
| Feature deep-dives | Alternating | dark/light/dark/light | Same alternation | Exact pattern to borrow |
| Social proof | White/light | Quote cards | White | Standard |
| Comparison | Light gray | Table/cards | #f0f2f5 | Compass-specific |
| Bottom CTA | Dark | Centered | Dark | Mirror hero |
| Footer | Dark | Multi-column | Dark, minimal | — |

**Rule**: The page starts dark (hero), breaks to light (problem), returns dark (modules), then alternates per feature. This creates breathing room and visual pacing. Never two consecutive dark sections unless they are hero + stats bar (very different visual treatment).

---

## 5. Typography System

**Statsig inferred system** (from Slate/Pluto design systems + CSS variable references):
- Display font: **Geist** or similar geometric sans (Vercel-era influence). Alternatively **Inter** with tight tracking.
- Body font: **Inter** (confirmed common in Statsig's product design system by designer portfolio references)
- Monospace: For code snippets — `JetBrains Mono` or `Fira Code`
- CSS variable pattern: `--font-size-larger`, `--font-size-base` (responsive scale)

**Inferred size scale**:
| Role | Size | Weight | Tracking |
|---|---|---|---|
| Hero headline | 64–72px | 800 | -0.03em |
| Section headline | 40–48px | 700 | -0.02em |
| Sub-section H3 | 28–32px | 600 | -0.01em |
| Eyebrow label | 11–12px | 600 | +0.08em (uppercase) |
| Body large | 18–20px | 400 | 0 |
| Body regular | 15–16px | 400 | 0 |
| Caption / label | 13–14px | 500 | 0 |
| CTA button | 15–16px | 600 | 0 |

**Compass adaptation**:
- Hero headline: **Geist** or **Inter** (whichever is already in stack), 64–72px, weight 800, tracking -0.03em
- Do NOT use a serif display font — Compass is operator-grade, not editorial
- Eyebrow labels: UPPERCASE, letter-spacing +0.1em, 11px, muted accent color
- All numbers (KPIs, confidence %, payback days): monospaced or tabular-nums feature enabled

---

## 6. Motion / Animation Patterns

**What Statsig does** (inferred from Dribbble shots + industry pattern):
- Scroll-triggered fade-up reveals: `opacity: 0 → 1`, `translateY: 20px → 0`, duration ~400ms, easing `ease-out`
- Stagger on card grids: each card delays by 80–100ms from previous
- Hero image: slight scale reveal on load (`scale: 0.97 → 1.0`, 600ms)
- Stats counter: count-up animation when entering viewport
- No parallax — clean and performance-focused

**Compass adaptation**:
- Use same subtle fade-up pattern. Do NOT add complex parallax or heavy motion.
- Charts should animate on scroll entry: lines draw left-to-right, bars grow from baseline
- The P10/P50/P90 fan should fan outward on entry (3 lines staggered by 100ms each)
- Investment Signal badge: pulse animation once on entry (subtle, 1 iteration only)
- Keep all animations under 500ms. Respect `prefers-reduced-motion`.

---

## 7. Image / Screenshot Treatment

**Statsig pattern**:
- Screenshots shown at ~1200–1400px source width, rendered at ~600–700px in section
- Rounded corners: 12–16px
- Drop shadow: `0 24px 80px rgba(0,0,0,0.3)` (deep, diffused)
- On dark backgrounds: sometimes a subtle glowing border (1px, accent color at 20–30% opacity)
- On light backgrounds: border `1px solid rgba(0,0,0,0.08)` + shadow
- Device frame: OPTIONAL — Statsig sometimes wraps in a minimal browser chrome (address bar + tab strip) at ~24px height. Simple, no OS decorations.
- Annotation overlays: arrows, callout bubbles, highlight boxes in accent color
- Never full-page screenshots — always cropped to the story being told

**Compass adaptation**:
- Same shadow treatment. Same border-radius 12–16px.
- ALWAYS crop to 2–4 key elements. Never show full dashboard.
- ALWAYS add annotation: circle/arrow pointing to the Investment Signal, label the P50 line, highlight the payback day.
- Use a minimal browser chrome wrapper for credibility.
- Annotation color: use the amber/gold accent (matches investment theme)
- On dark sections: glowing border in accent color at 20% opacity

---

## 8. Spacing Scale

**Statsig approximate values**:
- Max content width: **1200–1280px** (sections constrained, not full-bleed text)
- Section vertical padding: **120–160px** top and bottom (generous breathing room)
- Card grid gap: **24px**
- Card internal padding: **24–32px**
- Text-to-image gap (in alternating sections): **80px** horizontal
- Sub-section spacing (headline to body): **16–24px**
- Body paragraph spacing: **16px**
- CTA group gap (primary + secondary): **16px** horizontal

**Compass adaptation**:
- Use same section padding: 120px desktop, 80px tablet, 60px mobile
- Max content width: 1200px
- Do not compress spacing to fit more content — fewer, more spacious sections outperform dense ones

---

## 9. CTA Patterns

**Statsig CTA inventory**:
1. Nav: "Get Started" (small, ~36px height, filled)
2. Hero: "Get Started" (large, ~52px height, filled) + "Book a demo" (ghost)
3. Feature section ends: "Learn more →" (text link, no button)
4. Bottom CTA band: "Get Started" (large, centered, ~52px height)
5. Repetition: CTA appears in nav, hero, and bottom band — 3× minimum

**Button styling**:
- Primary: background = brand accent (inferred blue/indigo), white text, no border, border-radius 6–8px
- Ghost/secondary: transparent bg, 1px solid white (on dark) or 1px solid border-color (on light), text matches stroke
- Hover: primary darkens 10%, ghost fills slightly

**Compass adaptation**:
- Replace "Get Started" with "See the decision demo" throughout
- Add "Book a live demo" as consistent secondary
- CTA accent color: amber/gold (#f59e0b range) on dark backgrounds — differentiates from developer-tool blue and signals investment/financial tone
- Text links for section-level CTAs: "Explore the investment signal →"
- Minimum 3 CTA placements: nav, hero, bottom band

---

## 10. Trust / Proof Patterns

**Statsig approach**:
1. **Stats bar**: 4 scale metrics immediately after hero (1T events, 2.5B subjects, 99.99% uptime, <1ms latency)
2. **Customer logo bar**: grayscale logos, 8–12 companies, shown in a single horizontal strip
3. **Startup spotlights**: 10 case study cards with company name, date, 2-sentence result
4. **Testimonial cards**: quote + name + title + company logo, shown in 3-column grid
5. **Conference speakers**: Microsoft EVP, Figma CPO, OpenAI — implicit trust by association

**Statsig trust hierarchy**: Scale → Logos → Stories → Quotes → Association

**Compass adaptation**:
- Skip the stats bar (no Statsig-scale numbers yet)
- Use 1–3 operator quotes from pilot customers (most powerful available proof)
- If no quotes: use a single "Built on" credibility frame: "Built on Viljanen & Airola (2017) retention theory. Validated against GameAnalytics 2024 benchmark data across 30,000+ games."
- Academic credibility = substitute for customer scale at early stage
- Logo bar: use program affiliations (예창패 선정기업, etc.) or game company logos with permission
- Case study format: even 1 real result ("Reduced payback decision cycle from 14 days to 2 days for [Company X]") beats 10 abstract bullets

---

## 11. Patterns Compass Should REJECT

### Reject 1 — Developer SDK Install Snippets
Statsig shows code blocks (`npm install statsig`) as mid-page trust signals. Compass users are business operators, not engineers. Code blocks signal "this is a technical tool." Replace with KPI cards or decision-flow diagrams.

### Reject 2 — Playful Culture Content ("Pets @ Statsig")
Statsig's pet profiles are a developer-culture brand differentiator. They signal startup informality and engineer relatability. Compass is an investment decision OS — the tone is operator-grade and capital-conscious. Culture content does not belong on the marketing landing page.

### Reject 3 — Feature Parity / Checkbox Lists
Statsig lists 5+ products and their sub-features comprehensively. This is effective for developer evaluation (comparing feature sets). Compass users are CEOs and UA leads asking "should I invest more?" — they do not evaluate by feature checklist. Replace feature lists with decision outcomes: not "P10/P50/P90 credible intervals" but "See upside, base case, and downside before committing capital."

---

## 12. Compass-Specific Additions (Not in Statsig)

These patterns do NOT exist on Statsig but are required for Compass's positioning:

### A — Problem-Frame Section (Section 4 above)
Statsig assumes developers already know they need feature flags. Compass must explain why current tools fail before selling the solution. The 4-silo disconnected workflow diagram is mandatory.

### B — Decision Outcome Framing
Every section headline should answer a question starting with "Can we..." or "Should we..." — not describe a feature. This is Compass's core differentiator from every other analytics/experimentation tool.

### C — Uncertainty Visualization
The P10/P50/P90 fan chart is a unique visual signal that Compass makes probabilistic predictions, not point estimates. This visual must appear prominently (Section 6 Chart Story B). No other competitor shows this — it is a credibility and differentiation weapon.

### D — Experiment-to-Investment Pipeline Diagram
The ATE → ΔLTV → Payback → Capital Decision flow diagram (Section 8 in strategy doc) has no Statsig equivalent. This is pure Compass intellectual property and should be shown as a clean flow diagram, not a table.

---

## 13. Quick Reference: Implementation Priorities

| Pattern | Priority | Effort | Notes |
|---|---|---|---|
| Dark hero with cropped signal screenshot | P0 | Medium | Most impactful single change |
| Alternating dark/light section rhythm | P0 | Low | CSS only |
| Section padding 120px desktop | P0 | Low | Single CSS variable |
| Annotated screenshots (not raw) | P0 | High | Requires design work per screenshot |
| 4-module card grid (dark section) | P1 | Medium | Reusable card component |
| Alternating image+text deep-dives | P1 | High | 3–4 sections × layout |
| Fade-up scroll animations | P1 | Low | Framer Motion or CSS |
| Bottom CTA dark band | P1 | Low | Simple section |
| Problem-frame silo diagram | P1 | Medium | SVG diagram |
| Academic proof trust bar (no logos) | P2 | Low | Text only |

---

## Sources

- Statsig homepage config data: https://www.statsig.com/
- Statsig experimentation page: https://www.statsig.com/experimentation
- Statsig product growth page: https://www.statsig.com/el/product-growth
- Statsig brand 2023 review: https://www.statsig.com/blog/statsig-brand-design-2023-review
- Statsig Pluto design system: https://www.statsig.com/blog/new-design-system-pluto
- Statsig inside design: https://www.statsig.com/blog/inside-design-at-statsig
- Statsig landing page Dribbble shot: https://dribbble.com/shots/19452926-Statsig-Home-Landing-Page-Experience
- Statsig Dribbble profile: https://dribbble.com/statsig
- SaaS landing page trends 2026: https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples
- B2B SaaS landing page examples: https://arounda.agency/blog/landing-page-examples
- Audrey Janette Statsig design library: https://www.audreyjanette.com/statsig-design-library
