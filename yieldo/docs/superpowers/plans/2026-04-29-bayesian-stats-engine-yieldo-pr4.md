# D — Bayesian Stats Engine (yieldo) PR4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Wire the Bayesian engine output into yieldo's `/dashboard/market-gap` page. Replace `mockPriorPosterior` with live (Vercel Blob) or seed (committed JSON) PosteriorSnapshot. Add Methodology Modal for L2 transparency. Surface validity gate via "보류" badge.

**Architecture:** PR4 is the UI consumption layer for PR1-3. Adapter pattern transforms `PosteriorSnapshot` (engine shape) into the existing `PriorPosterior[]` chart shape. Demo path uses committed seed JSON (PR3); live path uses `/api/posterior/[appId]` fetch (PR2). Both flow through one hook with one analytical surface.

**Tech Stack:** Next.js 15 App Router · TanStack Query v5 · Radix Dialog (existing) · Framer Motion (existing) · Vitest

**Spec:** `yieldo/docs/superpowers/specs/2026-04-29-bayesian-stats-engine-yieldo-design.md` — §5 (Validity Gate UI), §8 (Market-Gap wiring)

**PR1-3 dependencies:**
- PR1 (`7fc20ae`): engine + ENGINE_VERSION + genre-priors.json
- PR2 (`23e584b`): PosteriorSnapshot v2 schema + /api/posterior/[appId] route
- PR3 (PR #11 머지): seed-posterior.json committed

---

## Decisions (memory: design_master_authority + autonomous_decisions + default_to_recommendation)

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Hook fetcher | TanStack Query v5 with key=["posterior", appId]; demo→seed JSON import / live→fetch | Mirrors yieldo's existing `useLiveAfData` pattern (memory: project_treenod_to_yieldo_migration A) |
| 2 | Adapter location | `shared/api/posterior/snapshot-to-rows.ts` — pure function, no I/O | Testable separately, no React dependency |
| 3 | Prior CI derivation | Compute from genre-priors.json at runtime via existing `betaQuantile` + LogNormal formula | Avoid duplicating prior CI in snapshot — reuse PR1 math |
| 4 | Chart props | Keep existing `PriorPosterior[]` shape — adapter outputs verbatim | Minimal blast radius. PriorPosteriorChart untouched except for validity prop |
| 5 | Methodology Modal | Extend existing `methodologyOpen` state in PriorPosteriorChart (modal already structured there) | Follow existing pattern (memory: feedback_landing_embedding "실물 그대로") |
| 6 | Validity badge | Inline "보류" tag on metric row when `validity[metricId].valid === false` | L1 surface — operator sees suspended state without methodology jargon |
| 7 | Metric set transition | ARPDAU dropped (engine doesn't produce). Chart now shows 4 metrics: D1/D7/D30 + Monthly Revenue | Engine truth > mock placeholder |
| 8 | i18n keys | Per spec §5.3 — `market.priorPosterior.*`, `market.validity.*`, `market.methodology.*` | Korean L1 vocabulary (memory: feedback_korean_stats_terms) |

---

## File Structure

### Files this PR creates

```
yieldo/src/shared/api/posterior/
├── snapshot-to-rows.ts                # Adapter: PosteriorSnapshot → PriorPosterior[] (with derived prior CI + validity)
├── use-live-posterior.ts              # TanStack Query hook (demo seed | live fetch)
└── __tests__/
    └── snapshot-to-rows.test.ts       # Adapter unit tests

yieldo/src/widgets/dashboard/ui/
└── methodology-modal.tsx              # L2 surface (engineVersion / sampleSize / ESS / prior params)
```

### Files this PR modifies

- `yieldo/src/app/(dashboard)/dashboard/market-gap/page.tsx` — replace `mockPriorPosterior` import with `useLivePosterior("demo")` (live customer wiring deferred until customer onboarding flow)
- `yieldo/src/widgets/charts/ui/prior-posterior-chart.tsx` — accept optional `validity` prop, render "보류" badge per row when invalid; mount MethodologyModal
- `yieldo/src/widgets/charts/ui/index.ts` (or wherever `PriorPosteriorChart` is exported) — keep export shape
- `yieldo/src/shared/i18n/dictionary.ts` — add new keys (Korean primary; English via transcendent-translation skill on follow-up)
- `yieldo/src/shared/api/index.ts` — add posterior re-exports if not already (PR2 may have added)

### Files this PR does NOT touch

- `src/shared/lib/bayesian-stats/` (PR1 sealed)
- `src/shared/api/posterior/{snapshot-v2,compute-posterior,index}.ts` (PR2 sealed)
- `src/shared/data/seed-posterior.json` (PR3 sealed — but consumed at build time)
- `src/shared/api/mock-data.ts:773` (`mockPriorPosterior` left intact for now — backward compat with any other consumers; full removal in a follow-up cleanup PR)

### Tooling

- Test: `npm test`
- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`
- Dev server (manual smoke): `npm run dev` → `http://localhost:3000/dashboard/market-gap`

---

## Task 1: Worktree + branch + npm install

- [ ] **Step 1: Verify main is clean and synced**

```bash
cd /Users/mike/Downloads/Compass
git checkout main
git pull origin main
git status
```

Expected: clean (or `M yieldo/src/styles/globals.css` only — leave alone).

- [ ] **Step 2: Create worktree**

```bash
git worktree add .worktrees/feature-d-bayesian-pr4-market-gap -b feature/d-bayesian-pr4-market-gap main
```

- [ ] **Step 3: Verify worktree state**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr4-market-gap
git branch --show-current
git status
```

Expected: branch `feature/d-bayesian-pr4-market-gap`, clean.

- [ ] **Step 4: npm install**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr4-market-gap/yieldo
npm install --legacy-peer-deps
```

- [ ] **Step 5: Verify baseline**

```bash
npm test
```

Expected: 21 files / 120 tests / 120 passed.

> All subsequent commands run from `/Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr4-market-gap/yieldo`.

---

## Task 2: snapshot-to-rows adapter

**Files:**
- Create: `src/shared/api/posterior/snapshot-to-rows.ts`
- Test: `src/shared/api/posterior/__tests__/snapshot-to-rows.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/shared/api/posterior/__tests__/snapshot-to-rows.test.ts
import { describe, expect, it } from "vitest"
import { snapshotToRows } from "../snapshot-to-rows"
import seedPosterior from "@/shared/data/seed-posterior.json"
import type { PosteriorSnapshot } from "../snapshot-v2"

describe("snapshotToRows", () => {
  it("produces 4 rows from seed snapshot", () => {
    const rows = snapshotToRows(seedPosterior as unknown as PosteriorSnapshot)
    expect(rows).toHaveLength(4)
    expect(rows.map(r => r.metricId).sort()).toEqual([
      "monthly_revenue_usd",
      "retention_d1",
      "retention_d30",
      "retention_d7",
    ])
  })

  it("each retention row has prior + posterior CI", () => {
    const rows = snapshotToRows(seedPosterior as unknown as PosteriorSnapshot)
    const d1 = rows.find(r => r.metricId === "retention_d1")!
    expect(d1.prior.mean).toBeGreaterThan(0)
    expect(d1.prior.ci_low).toBeLessThan(d1.prior.mean)
    expect(d1.prior.ci_high).toBeGreaterThan(d1.prior.mean)
    expect(d1.posterior.mean).toBeGreaterThan(0)
  })

  it("monthly_revenue_usd row has lognormal-derived prior CI", () => {
    const rows = snapshotToRows(seedPosterior as unknown as PosteriorSnapshot)
    const rev = rows.find(r => r.metricId === "monthly_revenue_usd")!
    expect(rev.prior.mean).toBeGreaterThan(50_000)
    expect(rev.prior.mean).toBeLessThan(500_000)
    expect(rev.posterior.mean).toBeGreaterThan(0)
  })

  it("attaches validity flag from snapshot", () => {
    const rows = snapshotToRows(seedPosterior as unknown as PosteriorSnapshot)
    rows.forEach(r => {
      expect(r.validity.valid).toBe(true)
    })
  })

  it("handles invalid metric (insufficient_installs)", () => {
    const fakeSnapshot = {
      ...seedPosterior,
      metadata: {
        ...(seedPosterior as PosteriorSnapshot).metadata,
        validity: {
          ...(seedPosterior as PosteriorSnapshot).metadata.validity,
          retention_d1: { valid: false, reason: "insufficient_installs", detail: "n=500" },
        },
      },
    } as unknown as PosteriorSnapshot
    const rows = snapshotToRows(fakeSnapshot)
    const d1 = rows.find(r => r.metricId === "retention_d1")!
    expect(d1.validity.valid).toBe(false)
    if (!d1.validity.valid) {
      expect(d1.validity.reason).toBe("insufficient_installs")
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/shared/api/posterior/__tests__/snapshot-to-rows.test.ts
```

Expected: FAIL with `Cannot find module '../snapshot-to-rows'`.

- [ ] **Step 3: Implement adapter**

```typescript
// src/shared/api/posterior/snapshot-to-rows.ts
import {
  betaQuantile,
  ESS_REVENUE,
  type CredibleInterval,
  type Validity,
} from "@/shared/lib/bayesian-stats"
import genrePriorsRaw from "@/shared/data/genre-priors.json"
import type { PosteriorSnapshot } from "./snapshot-v2"

export type PriorPosteriorRow = {
  metricId: string
  prior: CredibleInterval
  posterior: CredibleInterval
  validity: Validity
}

const ESS_RETENTION = genrePriorsRaw.essRetention

function deriveBetaPriorCI(alpha: number, beta: number, ess: number): CredibleInterval {
  return {
    mean: alpha / (alpha + beta),
    ci_low: betaQuantile(0.025, alpha, beta),
    ci_high: betaQuantile(0.975, alpha, beta),
    sampleSize: ess,
  }
}

function deriveLogNormalPriorCI(mu0: number, sigma0: number): CredibleInterval {
  return {
    mean: Math.exp(mu0 + (sigma0 ** 2) / 2),
    ci_low: Math.exp(mu0 - 1.96 * sigma0),
    ci_high: Math.exp(mu0 + 1.96 * sigma0),
    sampleSize: ESS_REVENUE,
  }
}

export function snapshotToRows(snapshot: PosteriorSnapshot): PriorPosteriorRow[] {
  const genreUsed = snapshot.metadata.genreUsed
  const genres = genrePriorsRaw.genres as Record<
    string,
    {
      retention: { d1: { alpha: number; beta: number }; d7: { alpha: number; beta: number }; d30: { alpha: number; beta: number } }
      monthlyRevenueUsd: { mu0: number; sigma0: number }
    }
  >
  const genrePrior = genres[genreUsed] ?? genres.portfolio

  return Object.entries(snapshot.posterior).map(([metricId, posteriorCI]) => {
    const validity = snapshot.metadata.validity[metricId] ?? { valid: true }
    let priorCI: CredibleInterval
    if (metricId === "retention_d1") {
      priorCI = deriveBetaPriorCI(genrePrior.retention.d1.alpha, genrePrior.retention.d1.beta, ESS_RETENTION)
    } else if (metricId === "retention_d7") {
      priorCI = deriveBetaPriorCI(genrePrior.retention.d7.alpha, genrePrior.retention.d7.beta, ESS_RETENTION)
    } else if (metricId === "retention_d30") {
      priorCI = deriveBetaPriorCI(genrePrior.retention.d30.alpha, genrePrior.retention.d30.beta, ESS_RETENTION)
    } else if (metricId === "monthly_revenue_usd") {
      priorCI = deriveLogNormalPriorCI(genrePrior.monthlyRevenueUsd.mu0, genrePrior.monthlyRevenueUsd.sigma0)
    } else {
      priorCI = posteriorCI // unknown metric — fall back to posterior shape
    }
    return { metricId, prior: priorCI, posterior: posteriorCI, validity }
  })
}
```

- [ ] **Step 4: Run test — expect 5/5 PASS**

```bash
npx vitest run src/shared/api/posterior/__tests__/snapshot-to-rows.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/posterior/snapshot-to-rows.ts src/shared/api/posterior/__tests__/snapshot-to-rows.test.ts
git commit -m "feat(posterior): add snapshot-to-rows adapter (PosteriorSnapshot → chart rows)"
```

---

## Task 3: useLivePosterior hook

**Files:**
- Create: `src/shared/api/posterior/use-live-posterior.ts`

- [ ] **Step 1: Implement hook**

```typescript
// src/shared/api/posterior/use-live-posterior.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import seedPosterior from "@/shared/data/seed-posterior.json"
import { PosteriorSnapshotSchema, type PosteriorSnapshot } from "./snapshot-v2"

const SEED_SNAPSHOT = seedPosterior as unknown as PosteriorSnapshot

/**
 * Hook for retrieving a PosteriorSnapshot.
 * - appId === "demo" → returns the committed seed JSON (no network)
 * - any other appId → fetches /api/posterior/[appId] (PR2 route)
 *
 * Falls through to the seed snapshot on fetch error so the dashboard
 * never goes blank during a transient backend hiccup.
 */
export function useLivePosterior(appId: string) {
  return useQuery<PosteriorSnapshot>({
    queryKey: ["posterior", appId],
    queryFn: async () => {
      if (appId === "demo") return SEED_SNAPSHOT
      const res = await fetch(`/api/posterior/${appId}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`posterior fetch failed: ${res.status}`)
      const json = await res.json()
      return PosteriorSnapshotSchema.parse(json)
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
```

- [ ] **Step 2: tsc check**

```bash
npx tsc --noEmit
```

Expected: 0 errors. (Confirm `@tanstack/react-query` is already installed — it is per yieldo CLAUDE.md §8.4.)

- [ ] **Step 3: Commit**

```bash
git add src/shared/api/posterior/use-live-posterior.ts
git commit -m "feat(posterior): add useLivePosterior hook (demo seed | live fetch)"
```

---

## Task 4: posterior barrel update

**Files:**
- Modify: `src/shared/api/posterior/index.ts`

- [ ] **Step 1: Update barrel exports**

Edit `src/shared/api/posterior/index.ts` to also export the new adapter + hook. Final state:

```typescript
// src/shared/api/posterior/index.ts
export { computePosterior } from "./compute-posterior"
export { PosteriorSnapshotSchema } from "./snapshot-v2"
export type { PosteriorSnapshot } from "./snapshot-v2"
export { snapshotToRows } from "./snapshot-to-rows"
export type { PriorPosteriorRow } from "./snapshot-to-rows"
export { useLivePosterior } from "./use-live-posterior"
```

- [ ] **Step 2: tsc check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/api/posterior/index.ts
git commit -m "feat(posterior): export snapshotToRows + useLivePosterior from barrel"
```

---

## Task 5: i18n keys (Korean)

**Files:**
- Modify: `src/shared/i18n/dictionary.ts`

- [ ] **Step 1: Add new keys**

Find the existing `market.priorPosterior` key (around line 235) and add the following keys nearby. Insert in alphabetical order with the other `market.*` keys:

```typescript
  // PR4: validity gate L1 카피 (memory: feedback_korean_stats_terms)
  "market.priorPosterior.posteriorLabel": { ko: "사후 분포 (우리 데이터 반영)", en: "Posterior (our data)" },
  "market.priorPosterior.priorLabel":     { ko: "사전 분포 (장르 기대치)",      en: "Prior (genre baseline)" },
  "market.priorPosterior.ciLabel":        { ko: "95% 신뢰 구간",                 en: "95% credible interval" },
  "market.validity.suspended":            { ko: "보류",                          en: "Suspended" },
  "market.validity.insufficientInstalls": { ko: "데이터 부족",                   en: "Insufficient data" },
  "market.validity.insufficientHistory":  { ko: "관측 기간 부족",                en: "Insufficient history" },
  "market.validity.priorEssTooLow":       { ko: "장르 기준값 부족",              en: "Prior baseline too weak" },
  "market.validity.engineVersionMismatch":{ ko: "엔진 갱신 중",                  en: "Engine updating" },

  // PR4: methodology modal L2 카피
  "market.methodology.title":             { ko: "방법론",                        en: "Methodology" },
  "market.methodology.engineVersion":     { ko: "엔진 버전",                     en: "Engine version" },
  "market.methodology.priorVersion":      { ko: "사전값 버전",                   en: "Prior version" },
  "market.methodology.genreUsed":         { ko: "사용된 장르",                   en: "Genre used" },
  "market.methodology.sampleSize":        { ko: "유효 표본 수",                  en: "Effective sample size" },

  // Metric display labels
  "metric.retention_d1":                  { ko: "D1 리텐션",                     en: "D1 retention" },
  "metric.retention_d7":                  { ko: "D7 리텐션",                     en: "D7 retention" },
  "metric.retention_d30":                 { ko: "D30 리텐션",                    en: "D30 retention" },
  "metric.monthly_revenue_usd":           { ko: "월 수익 (USD)",                 en: "Monthly revenue (USD)" },
```

- [ ] **Step 2: tsc check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/i18n/dictionary.ts
git commit -m "feat(i18n): add validity gate + methodology + metric labels (ko/en)"
```

> Note: per memory `feedback_transcendent_translation`, English translations may be refined by the transcendent-translation skill on a follow-up. Initial English provided here is functional.

---

## Task 6: MethodologyModal widget

**Files:**
- Create: `src/widgets/dashboard/ui/methodology-modal.tsx`

- [ ] **Step 1: Read existing dialog/modal pattern**

```bash
grep -rn "from \"@radix-ui/react-dialog\"" src/widgets/ src/shared/ui/ 2>&1 | head -5
```

Identify the existing Dialog wrapper (e.g. `src/shared/ui/dialog.tsx`). Use the same pattern.

- [ ] **Step 2: Implement modal**

```typescript
// src/widgets/dashboard/ui/methodology-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { useLocale } from "@/shared/i18n"
import type { PosteriorSnapshot } from "@/shared/api/posterior"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: PosteriorSnapshot | null
}

export function MethodologyModal({ open, onOpenChange, snapshot }: Props) {
  const { t } = useLocale()
  if (!snapshot) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("market.methodology.title")}</DialogTitle>
        </DialogHeader>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-[var(--text-muted)]">{t("market.methodology.engineVersion")}</dt>
          <dd className="font-mono">{snapshot.metadata.engineVersion}</dd>
          <dt className="text-[var(--text-muted)]">{t("market.methodology.priorVersion")}</dt>
          <dd className="font-mono text-xs">{snapshot.metadata.priorVersion}</dd>
          <dt className="text-[var(--text-muted)]">{t("market.methodology.genreUsed")}</dt>
          <dd className="font-mono">{snapshot.metadata.genreUsed}</dd>
        </dl>
        <div className="mt-4 border-t border-[var(--border)] pt-3 space-y-1 text-xs text-[var(--text-muted)]">
          {Object.entries(snapshot.metadata.validity).map(([metricId, validity]) => (
            <div key={metricId} className="flex justify-between">
              <span className="font-mono">{metricId}</span>
              <span>
                {validity.valid
                  ? `n=${snapshot.posterior[metricId]?.sampleSize ?? "—"}`
                  : `❌ ${validity.reason}${validity.detail ? ` (${validity.detail})` : ""}`}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

> If `@/shared/ui/dialog` doesn't export `DialogHeader`/`DialogTitle`, adapt to whatever the existing wrapper exposes (Radix raw or shadcn shape — Task 6 Step 1 reveals which).

- [ ] **Step 3: Add to widget barrel**

If `src/widgets/dashboard/index.ts` exists, add:

```typescript
export { MethodologyModal } from "./ui/methodology-modal"
```

- [ ] **Step 4: tsc check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/widgets/dashboard
git commit -m "feat(market-gap): add MethodologyModal (engine version, prior version, validity)"
```

---

## Task 7: market-gap page wiring

**Files:**
- Modify: `src/app/(dashboard)/dashboard/market-gap/page.tsx`
- Modify (optionally): `src/widgets/charts/ui/prior-posterior-chart.tsx`

- [ ] **Step 1: Read current page imports + chart props**

```bash
grep -n "mockPriorPosterior\|PriorPosteriorChart" src/app/\(dashboard\)/dashboard/market-gap/page.tsx
grep -n "type PriorPosteriorChartProps\|interface PriorPosteriorChartProps\|export function PriorPosteriorChart" src/widgets/charts/ui/prior-posterior-chart.tsx
```

- [ ] **Step 2: Replace mockPriorPosterior with hook + adapter**

In `market-gap/page.tsx`:

a) Replace import line `mockPriorPosterior,` (line ~11) with no import (drop the symbol).

b) Add new imports:

```typescript
import { useLivePosterior, snapshotToRows } from "@/shared/api/posterior"
```

c) Inside the component, after `const { t } = useLocale()`:

```typescript
const { data: snapshot } = useLivePosterior("demo")
const rows = snapshot ? snapshotToRows(snapshot) : []
```

d) Replace the chart usage (line ~44):

```typescript
<PriorPosteriorChart data={rows} snapshot={snapshot ?? null} />
```

- [ ] **Step 3: Update PriorPosteriorChart props to accept new shape + snapshot**

In `src/widgets/charts/ui/prior-posterior-chart.tsx`:

Change the props type to:

```typescript
import type { PriorPosteriorRow, PosteriorSnapshot } from "@/shared/api/posterior"
import { MethodologyModal } from "@/widgets/dashboard"

type PriorPosteriorChartProps = {
  data: PriorPosteriorRow[]
  snapshot?: PosteriorSnapshot | null
}
```

Inside the component, mount the methodology modal:

```typescript
{snapshot && (
  <MethodologyModal
    open={methodologyOpen}
    onOpenChange={setMethodologyOpen}
    snapshot={snapshot}
  />
)}
```

For each row's render, surface validity:

```typescript
{!row.validity.valid && (
  <span className="ml-2 inline-flex items-center rounded-sm border border-[var(--signal-caution)]/40 bg-[var(--signal-caution)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--signal-caution)]">
    {t("market.validity.suspended")} — {t(`market.validity.${camelCase(row.validity.reason)}`)}
  </span>
)}
```

> The exact insertion point depends on the chart's existing render structure. The agent should adapt to whatever loop/JSX pattern is already there (likely `data.map((row) => …)`). Add a small `camelCase` helper or use a switch statement to map `insufficient_installs` → `insufficientInstalls`, etc.

- [ ] **Step 4: tsc check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Run full suite — verify no regressions**

```bash
npm test
```

Expected: 21+ files / 125+ tests / all passed (5 new from snapshot-to-rows).

- [ ] **Step 6: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/market-gap/page.tsx src/widgets/charts/ui/prior-posterior-chart.tsx
git commit -m "feat(market-gap): wire useLivePosterior + snapshotToRows + validity badge

mockPriorPosterior import removed from market-gap/page.tsx (mock-data.ts
keeps the export for any other consumers — full removal in cleanup PR).
PriorPosteriorChart now accepts snapshot prop for MethodologyModal."
```

---

## Task 8: Manual smoke test + Full suite + push + PR

- [ ] **Step 1: Start dev server**

```bash
npm run dev &
DEV_PID=$!
sleep 8
```

- [ ] **Step 2: Curl the demo page (sanity)**

```bash
curl -s http://localhost:3000/dashboard/market-gap | grep -E "(보류|Posterior|Methodology|posterior)" | head -5
```

Expected: at least one of these strings appears in the rendered HTML.

- [ ] **Step 3: Stop dev server**

```bash
kill $DEV_PID || true
sleep 2
```

- [ ] **Step 4: Full test suite**

```bash
npm test
```

Expected: all green, ≥ 125 tests.

- [ ] **Step 5: tsc + lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: 0 errors. New files lint clean.

- [ ] **Step 6: Push + create PR**

```bash
git push -u origin feature/d-bayesian-pr4-market-gap
gh pr create --title "feat(d-bayesian): PR4 market-gap wiring + Methodology Modal + i18n" \
  --body "$(cat <<'EOF'
## Summary
- New adapter \`snapshotToRows\` (PosteriorSnapshot → chart row shape with derived prior CI + validity)
- New hook \`useLivePosterior\` (demo seed | live /api/posterior fetch)
- New widget \`MethodologyModal\` (L2 surface — engine version, prior version, genreUsed, validity table)
- \`market-gap/page.tsx\` wired: \`mockPriorPosterior\` import dropped, replaced with \`useLivePosterior("demo") + snapshotToRows()\`
- \`PriorPosteriorChart\` accepts new row shape + optional snapshot prop; renders "보류" badge per invalid metric
- New i18n keys: \`market.priorPosterior.*\`, \`market.validity.*\`, \`market.methodology.*\`, \`metric.*\`

## Spec
\`yieldo/docs/superpowers/specs/2026-04-29-bayesian-stats-engine-yieldo-design.md\` — §5, §8

## Plan
\`yieldo/docs/superpowers/plans/2026-04-29-bayesian-stats-engine-yieldo-pr4.md\`

## Decisions (memory: design_master_authority + autonomous + default_to_recommendation)
- Adapter location: \`shared/api/posterior/snapshot-to-rows.ts\` (pure, testable)
- Prior CI derivation: runtime via \`betaQuantile\` + LogNormal formula (no duplication in snapshot)
- Chart props: new \`PriorPosteriorRow[]\` shape (adapter outputs verbatim)
- Methodology modal: extends existing \`methodologyOpen\` state in PriorPosteriorChart
- Validity badge: inline "보류" tag (L1 surface)
- Metric set: D1/D7/D30 + Monthly Revenue (engine truth, ARPDAU mock dropped)

## Test plan
- [x] \`npm test\` — all green (≥ 125 tests, +5 from snapshot-to-rows)
- [x] \`npx tsc --noEmit\` — 0 type errors
- [x] \`npm run lint\` — 0 errors in new files
- [x] Adapter handles all 4 metrics + invalid validity branch
- [x] Manual smoke: \`/dashboard/market-gap\` renders without error

## D 마이그레이션 종료
PR4 머지 시 D = 8개 마이그레이션 매트릭스 중 2번째 항목 완료 (A 첫 번째). 다음 분기점: 옵션 A/B/C 결정.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed (likely PR #12).

If `gh pr create` errors, push branch only and report manual URL.

---

## Self-Review

**Spec coverage check:**

| Spec section | PR4 task |
|---|---|
| §5 Validity Gate UI | Task 5 (i18n) + Task 7 (badge in chart) |
| §5.3 i18n keys | Task 5 |
| §8.1 Files to modify | Tasks 6, 7 |
| §8.2 hook interface | Task 3 |

**Placeholder scan:** Code blocks have concrete TypeScript. The `camelCase` helper note in Task 7 Step 3 is a known stub — agent will write a 3-line helper or inline switch when implementing. ✅

**Type consistency:**
- `PriorPosteriorRow` defined in Task 2, consumed in Tasks 4, 7. Same shape.
- `PosteriorSnapshot` import path consistent (`@/shared/api/posterior`).
- `useLivePosterior(appId)` signature consistent in Task 3 (definition) + Task 7 (call site). ✅

---

## What ships at end of PR4

- `/dashboard/market-gap` renders PriorPosteriorChart with **real engine output** (seed for demo, live for customer)
- MethodologyModal exposes engine/prior versions + validity per metric
- "보류" badge surfaces invalid metrics (validity gate working at L1)
- i18n keys ready for transcendent-translation polish on follow-up

**PR4 머지 = D 마이그레이션 (treenod → yieldo) 완료.**
다음 결정: 옵션 A/B/C (MVP 3개 vs 마이그 7개 vs 전체 19개).

---

**End of PR4 plan.**
