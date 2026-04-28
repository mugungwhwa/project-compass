# yieldo Rebrand & Visual Foundation — Design Spec

**Date**: 2026-04-28
**Status**: Approved by user, ready for implementation plan
**Scope**: Full rebrand from "Compass" to "yieldo" + visual mockup of two surfaces (Landing Hero, Main Dashboard)
**Source**: User-provided yieldo Design Guidelines v1.0 (in conversation context, not yet committed to repo)
**Isolation**: Worktree `feature/yieldo-rebrand`

---

## 1. Brand Identity (확정 사항)

| Field | Value |
|---|---|
| Brand name | `yieldo` (always lowercase) |
| Origin | Yield (수익률) + Do (실행) |
| Category | Operating Intelligence Terminal for Game Studios |
| Tagline (EN) | "Operating intelligence for game studios." |
| Sub-tagline (EN) | "From signal to yield, executed." |
| Tagline (KR) | "게임 스튜디오 운영 인텔리전스 터미널" |
| Sub-tagline (KR) | "시그널을 수익으로, 즉시 실행" |
| Wordmark | Geist Mono / JetBrains Mono, lowercase, no kerning changes |
| Brand personality | Serious, clear, pragmatic, grounded, modern |

Forbidden: uppercase form (`YIELDO`, `Yieldo`), gradient, shadow, custom kerning, color outside the palette.

---

## 2. Scope of Rebrand (User-Confirmed)

| Decision | Choice |
|---|---|
| Q1 Root folder rename | (b) Keep `/Users/mike/Downloads/Compass/` as-is, rename only inner `compass/` → `yieldo/` |
| Q2 Mockup surface | (c) Both Landing Hero AND Main Dashboard |
| Q3 `bloomberg-terminal/` clone usage | (b) Visual aesthetic reference only, no code reuse |
| Q4 Claude tooling rename | (a) Full unification — `compass-verify`, `compass-dev`, `compass-redflags.sh` all → `yieldo-*` |

External systems that consequently require user-side adjustment:
- Vercel project root directory: `compass` → `yieldo` (one-time manual change in Vercel UI before next deploy)
- GitHub repo (`mugungwhwa/project-compass`) and git remote: **unchanged** (Q1=b)

---

## 3. Section 1 — Rename Strategy

### 3.1 Directory & metadata
- `/Users/mike/Downloads/Compass/compass/` → `/Users/mike/Downloads/Compass/yieldo/`
- `package.json` field `name`: `"compass"` → `"yieldo"`
- `compass/CLAUDE.md`, `compass/AGENTS.md`, `compass/README.md` content: full rewrite (these are short, repo-internal)

### 3.2 React component identifiers
- File: `src/shared/ui/compass-logo.tsx` → `src/shared/ui/yieldo-logo.tsx`
- Component export: `CompassLogo` → `YieldoLogo`
- All 9 import sites updated (sweep TypeScript imports)

### 3.3 String occurrences in code (~30 files)

Mechanical replacements with case-aware mapping:

| Pattern | Replacement |
|---|---|
| `compass` (identifier/lowercase) | `yieldo` |
| `Compass` (PascalCase) | `Yieldo` (only in component names; product references should go to `yieldo` lowercase) |
| `COMPASS` (constants) | `YIELDO` |
| `"Project Compass"` (string literal) | `"yieldo"` |

### 3.4 Claude tooling chain (Q4=a)
- `.claude/skills/compass-verify/` → `.claude/skills/yieldo-verify/` + SKILL.md content rebrand
- `.claude/skills/compass-dev/` → `.claude/skills/yieldo-dev/` + SKILL.md content rebrand
- `.claude/hooks/compass-redflags.sh` → `.claude/hooks/yieldo-redflags.sh`
- `.claude/settings.json` (and `.claude/settings.local.json` if relevant): update hook paths and skill references
- User-facing slash commands: `/compass-dev`, `/compass-verify` deprecated → `/yieldo-dev`, `/yieldo-verify`

### 3.5 Asset handling
- `PROJECT_COMPASS_rocko_*.png` (2 files) → move to `archive/` (preserved for reference, not active)
- New yieldo wordmark: text-based for mockup (Geist Mono rendered via `next/font`); SVG production deferred to a follow-up task

### 3.6 Verification gate for Section 1
- `tsc -p .` exits 0
- `npm run dev` boots without runtime errors
- Single greppable string: case-insensitive `compass` returns only intended residue (`archive/`, `.git/` history, this spec doc, CLAUDE.md historical notes if any)

---

## 4. Section 2 — Content & Voice Rewrite

### 4.1 Vocabulary mapping (binding)

This is the canonical mapping. All copy rewrites must use these substitutions.

| Old (Compass) | New (yieldo) — English | New — Korean (operator-friendly) |
|---|---|---|
| Project Compass | yieldo | yieldo (소문자 고정) |
| Investment Decision OS | Operating Intelligence Terminal | 게임 스튜디오 운영 인텔리전스 터미널 |
| Experiment-to-Investment Decision OS | Signal-to-Yield Operating Terminal | 시그널-수익 운영 터미널 |
| From experiment to investment | From signal to yield, executed | 시그널을 수익으로, 즉시 실행 |
| Decision Translation Layer | Yield Operating Layer | 운영 결정 layer |
| Capital Allocation OS | Portfolio Yield OS | 포트폴리오 수익 운영 |
| Compass transforms... | yieldo turns... | yieldo는 ...을 ...으로 전환합니다 |

### 4.2 i18n dictionary.ts (32 occurrences)
- Apply Section 4.1 mapping
- Preserve UI label tone: existing operator-friendly Korean policy (per memory `feedback_korean_stats_terms`) — Prior/Posterior remain "사전/사후 확률"
- Keep all non-brand domain terminology untouched (LTV, Payback, Bayesian, retention, etc.)

### 4.3 Document files (rename + content update)

Rename pattern: `Project_Compass_<Topic>.md` → `Project_Yieldo_<Topic>.md`, `Compass_<Topic>.md` → `Yieldo_<Topic>.md`.

Files affected:
- Root: `Project_Compass_Business_Plan.md`, `Project_Compass_Tech_Stack.md`, `Project_Compass_Engine_Blueprint.md`, `Project_Compass_UI_Guide.md`, `Project_Compass_Legal.md`, `Project_Compass_Data_Sources_Guide.md`, `Project_Compass_Deck_Redesign_Guide.md`, `Project_Compass_Deck_v2.html`, `Compass_MVP_Revision_Notes_2026-04-13.md`, `Compass_Refocus_Checklist_and_PvX_UI_Benchmark.md`, `Compass_Statsig_Style_Landing_Strategy.md`
- `archive/`: `Project_Compass_Legal_Crawling.md`, `Project_Compass_Legal_API_Integration.md`
- `docs/`: `Project_Compass_BM_Packaging_Plan.md`, `Project_Compass_B2B_Readiness_Blueprint.md`, `Project_Compass_Design_Migration_Log.md`
- `docs/superpowers/specs/2026-04-15-compass-positioning-language-layering-design.md` → keep filename (historical record, dated spec) but content brand mentions update with note "(formerly Compass)"

Content scope: **brand mention only**. Retention theory, Bayesian framework, scientific properties, business model methodology — untouched.

### 4.4 CLAUDE.md (37 KB) — selective rewrite

Sections requiring rewrite:
- Section 1 (Project Identity) — full rewrite of one-liner, definition, what-this-is/isn't
- Section 7 (Product Architecture) — module names if branded
- Section 8.4.1 (Vercel deployment) — `compass` → `yieldo` directory reference
- Section 15 (Document Usage Guide) — file table updated to new names

Sections preserved verbatim:
- Section 2 (Data Silos)
- Section 3 (Retention Theory) — academic content
- Section 4 (Bayesian Framework)
- Section 5 (Revenue Modeling)
- Section 6 (Experiment Translation)
- Section 9-14 — business model, competition, market, GTM, references

### 4.5 Memory system updates
- `MEMORY.md` index lines: replace "Compass" mentions with "yieldo"
- Linked memory files (`project_status.md`, `project_market_gap_alpha_frame.md`, `project_compass_terminal_idea.md`, etc.): brand mention only; project context and learnings preserved
- File `project_compass_terminal_idea.md` itself rename → `project_yieldo_terminal_idea.md` (and update MEMORY.md pointer)

---

## 5. Section 3 — Visual Mockup (Landing + Dashboard)

### 5.1 Visual system foundation (shared)

Files modified:
- `src/styles/globals.css`: add yieldo CSS variables under `:root` (per design guide §2.1)
- `src/app/layout.tsx`: load Geist Mono, Inter, JetBrains Mono via `next/font/google` and apply CSS variables
- Tailwind config: extend `theme.colors.yieldo` and `theme.fontFamily.{mono,sans,nums}`
- Body baseline: `bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased`

KPI numeric class (reusable):
```
.font-num { font-family: var(--font-jetbrains); font-feature-settings: 'tnum' 1; }
```

Color tokens (canonical):
```
--bg-primary: #0A0E1A
--bg-secondary: #141826
--bg-tertiary: #1F2436
--text-primary: #F8F8F8
--text-secondary: #B8BFCE
--text-tertiary: #6B7280
--border-default: #1F2436
--border-strong: #2D3548
--accent-yield: #F4C842
--accent-do: #00D984
--accent-warning: #FF9F43
--accent-danger: #FF4757
--accent-info: #4A9EFF
```

### 5.2 Mockup 1 — Landing Hero (`src/widgets/landing/`)

5 sections in scope (subset of design guide's 7):

1. **Top Nav (sticky)**
   - Left: `yieldo` wordmark (Geist Mono, 24 px, `--text-primary`)
   - Center: links — Product / Pricing / Docs (Inter, 13 px, `--text-secondary`)
   - Right: `[See Demo →]` ghost button

2. **Hero**
   - Eyebrow: `OPERATING INTELLIGENCE TERMINAL` (mono, 11 px, tracking-wider, `--text-tertiary`)
   - Display word: `yieldo` (Geist Mono, 96 px, `--text-primary`)
   - H1 line: "Operating intelligence for game studios." (Inter, 48 px, `--text-primary`)
   - Sub: "From signal to yield, executed." (Inter, 20 px, `--text-secondary`)
   - Body (1 short paragraph): 14-year mobile gaming marketing veteran origin
   - CTA cluster: `[See Live Demo →]` (yellow primary) + `[Watch 90s tour]` (ghost)
   - Right side: dashboard mockup screenshot (renders Section 5.3 as preview)

3. **Problem (4 silos)**
   - 4-card grid (Market / Attribution / Experiment / Finance)
   - Each card: silo name + one-line description + "decisions don't live here" footnote (`--text-tertiary`)
   - All cards in `--bg-secondary` with `--border-default`

4. **Solution (yieldo bridges them)**
   - One large card, `--bg-secondary`, accent `--accent-yield` for the bridging metaphor
   - Headline: "yieldo turns those four signals into one daily yield decision."

5. **CTA Footer**
   - Big `[Open the Terminal]` primary button
   - Email capture (operator-only sign-up framing)
   - Footer microcopy: "Built by 14-year mobile gaming marketers."

Out of scope for this mockup: Modules grid, Proof, full Comparison table — deferred.

### 5.3 Mockup 2 — Main Dashboard (`src/app/(dashboard)/dashboard/page.tsx`)

Layout (Bloomberg Terminal-inspired, per design guide §3.3):

```
┌────────────────────────────────────────────────────────────┐
│ Top bar (60 px) — yieldo logo + Cmd+K palette stub + game ▼ │
├────────┬──────────────────────────────────────────┬────────┤
│ Side   │ ┌─────────────────┬──────────────────┐   │ AI     │
│ nav    │ │ Capital KPI     │ Retention Fan    │   │ Copilot│
│ 240 px │ │ Strip           │ (P10/P50/P90)    │   │        │
│        │ ├─────────────────┼──────────────────┤   │ 320 px │
│        │ │ Action Impact   │ AI Insight Card  │   │        │
│        │ │ Top 3 ΔLTV      │ (latest finding) │   │        │
│        │ └─────────────────┴──────────────────┘   │        │
└────────┴──────────────────────────────────────────┴────────┘
```

Component-level changes:
- Top bar: new component `src/widgets/app-shell/ui/yieldo-top-bar.tsx`. Contains wordmark, command palette stub (input only, no logic), game selector reusing existing `selected-game` Zustand store
- Left sidebar: existing `app-sidebar.tsx` repurposed; recolor with new tokens; nav items remain (Capital, Operations, Experiments, Market)
- Workspace grid: 2x2 CSS grid, gap-4
  - Panel A (Capital KPI strip): reuses existing KPI card widgets, only color/font tokens change
  - Panel B (Retention fan): existing `runway-fan-chart.tsx` or `retention-curve.tsx`, recolored via `chart-colors.ts` token swap
  - Panel C (Action Impact): existing action-impact widget, recolored
  - Panel D (AI Insight): new mockup card with hardcoded sample insight + `[Run]` / `[Details]` buttons (per design guide §4.4)
- Right AI Copilot panel (new): `src/widgets/app-shell/ui/yieldo-copilot-panel.tsx`, 320 px collapsible, contains:
  - User question (mono, sample: "Why did payback drift?")
  - AI response (sans-serif, sample bullets with mono numbers)
  - Recommended action card with `[Run]` `[Details]`
  - Bottom input: "🔍 Ask yieldo anything..."
- Existing `copilot-command-bar.tsx` and `copilot-store.tsx` (already present per scan): inspect during implementation; reuse if compatible, otherwise create new

Numeric formatting: every KPI value, axis tick, and table number adopts `.font-num` class. Tabular numbers + monospace.

Behavior: command palette and AI Copilot are visual mockups only — no LLM call, no actual command parsing. Just realistic-looking content.

### 5.4 Out of mockup scope (explicitly deferred)
- Other dashboard routes (`/dashboard/capital`, `/dashboard/actions`, `/dashboard/experiments`, `/dashboard/market-gap`) — they automatically inherit color tokens but layout reorganization is a separate task
- Real LLM integration for AI Copilot
- Real command palette routing
- Logo SVG production
- Mobile responsive layout for dashboard (terminal aesthetic is desktop-first per design guide §3.3)

---

## 6. Section 4 — Sequence, Risks, Done Criteria

### 6.1 Execution sequence (5 commits in worktree)

1. Create worktree: `feature/yieldo-rebrand`
2. **Commit 1 — Rename layer** (Section 3)
   - Directory rename + package.json + component file/identifier rename + tooling rename + asset move
   - Verify: `tsc -p .` exits 0, `npm run dev` boots
3. **Commit 2 — Voice rewrite** (Section 4)
   - i18n dictionary + document file renames + content rebrand + CLAUDE.md selective rewrite + MEMORY.md updates
4. **Commit 3 — Visual foundation** (Section 5.1)
   - CSS tokens, font loading, Tailwind config, body baseline
   - Verify: dev server renders dark background and correct font on existing pages
5. **Commit 4 — Landing mockup** (Section 5.2)
   - 5 hero sections, recolored
6. **Commit 5 — Dashboard mockup** (Section 5.3)
   - Top bar, recolored sidebar, 2x2 panel grid, AI Copilot panel
7. Final verification: `tsc -p .`, `npm run dev`, browser visual check
8. User review → if approved, merge to main; if rejected, iterate in worktree

### 6.2 Risks & mitigations

| Risk | Mitigation |
|---|---|
| Vercel build breaks after directory rename | User performs one-time root directory change in Vercel UI before next push; documented in Section 8.4.1 of CLAUDE.md update |
| Slash commands `/compass-*` stop working mid-session | Update `.claude/settings.json` hook paths and skill references in same Commit 1; new commands are `/yieldo-dev`, `/yieldo-verify` |
| Existing chart palettes clash with dark theme | `chart-colors.ts` and `CHART_TYPO` are centralized (per memory #104) — single token swap propagates to all 21 charts |
| Logo SVG missing | Mockup uses Geist Mono text wordmark; SVG production deferred (out of scope) |
| Memory file rename breaks index lookups | Update `MEMORY.md` pointer line atomically with file rename in same commit |
| Worktree merge conflicts with main | main is currently quiet (only `animated-number.tsx` modified per git status); merge is low-risk |

### 6.3 Done criteria

- [ ] `grep -ri "compass"` over working tree returns only: `archive/`, this spec, intentional historical references (e.g., MEMORY items with date context, `(formerly Compass)` notes)
- [ ] `tsc -p .` exits 0
- [ ] `npm run dev` boots, no console errors
- [ ] `/dashboard` renders new dark 2x2 panel grid with right AI Copilot panel
- [ ] `/` (landing) renders new dark 5-section hero
- [ ] All KPI numbers use `font-num` (mono + tabular)
- [ ] `package.json` name = `"yieldo"`
- [ ] `/yieldo-dev`, `/yieldo-verify` slash commands resolvable from `.claude/settings.json`
- [ ] CLAUDE.md sections 1, 7, 8.4.1, 15 reflect yieldo brand; sections 2-6, 9-14 unchanged
- [ ] Vercel deployment guide note added: user must rename project root to `yieldo` before next deploy
- [ ] User approves mockup visually

---

## 7. Out of Scope (explicit non-goals for this spec)

- LLM integration for command palette / AI Copilot
- Real-time data wiring (mockup uses existing dummy/mock data)
- Logo SVG production (deferred follow-up)
- Mobile-responsive dashboard layout
- Other dashboard routes' layout overhaul
- Marketing site additional sections (Modules, Proof, Comparison full table)
- Domain registration (yieldo.com / .io / .ai) — business task, not engineering
- Trademark filing — legal task, not engineering
- GitHub repo rename — Q1=b means stay on `project-compass`

---

## 8. References

- yieldo Design Guidelines v1.0 (in conversation context, dated 2026-04-28)
- CLAUDE.md (root) — current product foundation (sections to be selectively rewritten)
- Memory: `project_status.md`, `project_compass_terminal_idea.md`, `feedback_korean_stats_terms.md`, `project_language_layering.md`
- Prior compass work: `Project_Compass_*.md` series (to be renamed `Project_Yieldo_*.md`)
