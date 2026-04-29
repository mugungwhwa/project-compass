# D — Bayesian Stats Engine (yieldo) PR2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the PR1 Bayesian engine into the AppsFlyer sync pipeline. Each cron run produces a v2 PosteriorSnapshot (extends existing v1 cohort summary) that includes `posterior` + `metadata.validity`. Expose snapshot via `/api/posterior/[appId]` route.

**Architecture:** Pure additive on top of PR1. `runAppsFlyerSync` gets one new step at the end: `computePosterior(summary, app.genre)` → store `PosteriorSnapshot` in Vercel Blob. UI fetches via new Next API route. No mutation to existing cohort summary path — strictly *one extra write*.

**Tech Stack:** Next.js 15 App Router · TypeScript strict · Zod · Vitest · Vercel Blob (existing `blob-store.ts`)

**Spec:** `yieldo/docs/superpowers/specs/2026-04-29-bayesian-stats-engine-yieldo-design.md` (commit 185e76a) — §2 (system boundary), §4 (Snapshot v2 schema), §7 (AppsFlyer integration), §9 (Testing)

**PR1 dependency:** `feat(d-bayesian): PR1 engine core` merged at `7fc20ae` on origin/main. PR1 ships `src/shared/lib/bayesian-stats/` module exporting `buildRows()`, `ENGINE_VERSION`, types, and `genre-priors.json`.

## Brainstorming Decisions (2026-04-29)

| # | Decision | Choice | Rationale |
|---|---|---|---|
| Q1 | v1 snapshot compat | **B (Lazy)** | yieldo Phase 1, 0 production customers. Next cron cycle naturally produces v2. No bulk migration. |
| Q2 | API route structure | **standalone `/api/posterior/[appId]`** | Spec §2.1 + §8.2. Posterior is vendor-neutral concept, separated from `/api/appsflyer/*`. |
| Q3 | Genre missing handling | **Portfolio default (silent fallback)** | Spec §7.1 step 1. `app.genre` is optional in AppSchema. Methodology Modal will surface fallback in PR4. |
| Q4 | Engine version mismatch | **Cron auto-recompute** | Spec §13. Daily cron picks up `ENGINE_VERSION` change automatically. No special infra. |
| Q5 | Test strategy | **C (Fixture-based)** | Mirrors existing `aggregation.test.ts` pattern. No external API dependency. Real dev-token tests are PR4 manual smoke. |

---

## File Structure

### Files this PR creates

```
yieldo/src/shared/api/posterior/
├── index.ts                            # barrel export
├── snapshot-v2.ts                      # PosteriorSnapshotSchema (zod, extends AppsFlyer SnapshotSchema)
├── compute-posterior.ts                # cohortSummary + genre → PosteriorSnapshot
└── __tests__/
    ├── snapshot-v2.test.ts             # zod parse/validate
    └── compute-posterior.test.ts       # fixture-based + snapshot tests

yieldo/src/app/api/posterior/[appId]/
└── route.ts                            # GET handler — fetch v2 from Blob, 404 if missing
```

### Files this PR modifies

- `yieldo/src/shared/api/appsflyer/blob-store.ts` — add `putPosteriorSnapshot()` + `getPosteriorSnapshot()` exports
- `yieldo/src/shared/api/appsflyer/orchestrator.ts:185` — insert `computePosterior()` step right after `putCohortSummary(appId, summary)`
- `yieldo/src/shared/api/appsflyer/__tests__/orchestrator.test.ts` (or equivalent) — verify regression-free + new posterior write

### Files this PR does NOT touch

- `src/shared/lib/bayesian-stats/` (PR1 sealed)
- `src/shared/api/appsflyer/aggregation.ts` (no behavior change)
- `src/shared/data/genre-priors.json` (PR1 sealed)
- `src/app/(dashboard)/dashboard/market-gap/page.tsx` (PR4)
- `scripts/build-seed-snapshot.ts` (PR3)
- `package.json` scripts (PR3)

### Tooling

- Test: `npm test` (vitest run --passWithNoTests)
- Single file: `npx vitest run src/shared/api/posterior/__tests__/<file>.test.ts`
- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`

---

## Task 1: Worktree + branch + npm install

**Files:** none (workspace setup)

- [ ] **Step 1: Verify main is clean and synced**

```bash
cd /Users/mike/Downloads/Compass
git checkout main
git pull origin main
git status
```

Expected: `On branch main, Your branch is up to date with 'origin/main'`. Note: `yieldo/src/styles/globals.css` may show as `M` — leave it alone (unrelated transcendent-translation work, not in PR2 scope).

- [ ] **Step 2: Create feature worktree**

```bash
cd /Users/mike/Downloads/Compass
git worktree add .worktrees/feature-d-bayesian-pr2-appsflyer-integration -b feature/d-bayesian-pr2-appsflyer-integration main
```

Expected: `Preparing worktree (new branch 'feature/d-bayesian-pr2-appsflyer-integration')`

- [ ] **Step 3: Verify worktree branch + clean state**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr2-appsflyer-integration
git branch --show-current
git status
```

Expected: branch = `feature/d-bayesian-pr2-appsflyer-integration`, working tree clean.

- [ ] **Step 4: npm install**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr2-appsflyer-integration/yieldo
npm install --legacy-peer-deps
```

Expected: completes with exit 0.

- [ ] **Step 5: Verify baseline tests pass**

```bash
npm test
```

Expected: exit 0, all existing tests (105+ from PR1 merge) green.

> All subsequent commands run from `/Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr2-appsflyer-integration/yieldo` unless stated otherwise.

---

## Task 2: PosteriorSnapshot v2 schema

**Files:**
- Create: `src/shared/api/posterior/snapshot-v2.ts`
- Test: `src/shared/api/posterior/__tests__/snapshot-v2.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/shared/api/posterior/__tests__/snapshot-v2.test.ts
import { describe, expect, it } from "vitest"
import { PosteriorSnapshotSchema } from "../snapshot-v2"

const baseSnapshot = {
  cohortSummary: {
    updatedAt: "2026-04-29T00:00:00.000Z",
    cohorts: [
      {
        cohortDate: "2026-03-15",
        installs: 5000,
        retainedByDay: { d1: 1100, d7: 200, d30: 40 },
        uaSpendUsd: 1500,
      },
    ],
    revenue: {
      daily: [
        { date: "2026-03-15", sumUsd: 1234.56, purchasers: 12 },
      ],
      total: { sumUsd: 1234.56, purchasers: 12 },
    },
    spend: { totalUsd: 1500, homeCurrency: "USD" },
  },
  posterior: {
    retention_d1: { mean: 0.22, ci_low: 0.20, ci_high: 0.24, sampleSize: 13_000 },
    retention_d7: { mean: 0.04, ci_low: 0.035, ci_high: 0.045, sampleSize: 13_000 },
    retention_d30: { mean: 0.008, ci_low: 0.006, ci_high: 0.010, sampleSize: 13_000 },
    monthly_revenue_usd: { mean: 100_000, ci_low: 80_000, ci_high: 130_000, sampleSize: 7 },
  },
  metadata: {
    engineVersion: "1.0.0",
    priorVersion: "genre-priors-2026-04-29",
    genreUsed: "portfolio",
    validity: {
      retention_d1: { valid: true },
      retention_d7: { valid: true },
      retention_d30: { valid: true },
      monthly_revenue_usd: { valid: true },
    },
  },
}

describe("PosteriorSnapshotSchema", () => {
  it("parses a fully valid snapshot", () => {
    const parsed = PosteriorSnapshotSchema.parse(baseSnapshot)
    expect(parsed.metadata.engineVersion).toBe("1.0.0")
    expect(parsed.metadata.genreUsed).toBe("portfolio")
    expect(parsed.posterior.retention_d1.mean).toBeCloseTo(0.22)
  })

  it("accepts invalid validity discriminator (valid:false with reason)", () => {
    const withInvalid = {
      ...baseSnapshot,
      posterior: {
        ...baseSnapshot.posterior,
        retention_d30: { mean: 0, ci_low: 0, ci_high: 0, sampleSize: 0 },
      },
      metadata: {
        ...baseSnapshot.metadata,
        validity: {
          ...baseSnapshot.metadata.validity,
          retention_d30: { valid: false, reason: "insufficient_history", detail: "age=10d, need 30d" },
        },
      },
    }
    expect(() => PosteriorSnapshotSchema.parse(withInvalid)).not.toThrow()
  })

  it("rejects validity with unknown reason string", () => {
    const bad = {
      ...baseSnapshot,
      metadata: {
        ...baseSnapshot.metadata,
        validity: {
          ...baseSnapshot.metadata.validity,
          retention_d1: { valid: false, reason: "bogus_reason" },
        },
      },
    }
    expect(() => PosteriorSnapshotSchema.parse(bad)).toThrow()
  })

  it("rejects when cohortSummary is missing", () => {
    const { cohortSummary: _, ...withoutCohort } = baseSnapshot
    expect(() => PosteriorSnapshotSchema.parse(withoutCohort)).toThrow()
  })

  it("rejects when engineVersion is missing", () => {
    const bad = { ...baseSnapshot, metadata: { ...baseSnapshot.metadata, engineVersion: undefined } }
    expect(() => PosteriorSnapshotSchema.parse(bad)).toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/shared/api/posterior/__tests__/snapshot-v2.test.ts
```

Expected: FAIL with `Cannot find module '../snapshot-v2'`.

- [ ] **Step 3: Implement schema**

```typescript
// src/shared/api/posterior/snapshot-v2.ts
import { z } from "zod"
import { CohortSummarySchema } from "@/shared/api/appsflyer/types"
import { CredibleIntervalSchema, ValiditySchema } from "@/shared/lib/bayesian-stats"

/**
 * v2 PosteriorSnapshot — wraps the existing v1 CohortSummary plus engine output.
 *
 * Persistence: Vercel Blob, key = `posterior/${appId}.json`.
 * Wire-format: zod-parsed JSON. Backward compat: v1 CohortSummary path is unchanged
 * (still written separately by `putCohortSummary`); this is an additional write.
 */
export const PosteriorSnapshotSchema = z.object({
  cohortSummary: CohortSummarySchema,
  posterior: z.record(z.string(), CredibleIntervalSchema),
  metadata: z.object({
    engineVersion: z.string(),
    priorVersion: z.string(),
    genreUsed: z.string(),
    validity: z.record(z.string(), ValiditySchema),
  }),
})
export type PosteriorSnapshot = z.infer<typeof PosteriorSnapshotSchema>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/shared/api/posterior/__tests__/snapshot-v2.test.ts
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/posterior/snapshot-v2.ts src/shared/api/posterior/__tests__/snapshot-v2.test.ts
git commit -m "feat(posterior): add PosteriorSnapshot v2 zod schema"
```

---

## Task 3: computePosterior function

**Files:**
- Create: `src/shared/api/posterior/compute-posterior.ts`
- Test: `src/shared/api/posterior/__tests__/compute-posterior.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/shared/api/posterior/__tests__/compute-posterior.test.ts
import { describe, expect, it } from "vitest"
import { computePosterior } from "../compute-posterior"
import type { CohortSummary } from "@/shared/api/appsflyer/types"

function makeFixtureSummary(): CohortSummary {
  // Cohort old enough that all of d1/d7/d30 are measurable; installs > MIN_COHORT_INSTALLS (1000).
  const cohortDate = new Date()
  cohortDate.setDate(cohortDate.getDate() - 45)
  return {
    updatedAt: new Date().toISOString(),
    cohorts: [
      {
        cohortDate: cohortDate.toISOString().slice(0, 10),
        installs: 5000,
        retainedByDay: { d1: 1100, d7: 200, d30: 40 },
        uaSpendUsd: 1500,
      },
    ],
    revenue: {
      daily: [
        { date: "2026-01-15", sumUsd: 50_000, purchasers: 100 },
        { date: "2026-02-15", sumUsd: 60_000, purchasers: 120 },
        { date: "2026-03-15", sumUsd: 70_000, purchasers: 140 },
      ],
      total: { sumUsd: 180_000, purchasers: 360 },
    },
    spend: { totalUsd: 1500, homeCurrency: "USD" },
  }
}

describe("computePosterior", () => {
  it("returns 4 posterior entries when all metrics valid", () => {
    const result = computePosterior(makeFixtureSummary(), "match-3")
    expect(Object.keys(result.posterior).sort()).toEqual([
      "monthly_revenue_usd",
      "retention_d1",
      "retention_d30",
      "retention_d7",
    ])
  })

  it("falls back to portfolio when genre is undefined", () => {
    const result = computePosterior(makeFixtureSummary(), undefined)
    expect(result.metadata.genreUsed).toBe("portfolio")
  })

  it("falls back to portfolio when genre is unknown", () => {
    const result = computePosterior(makeFixtureSummary(), "unknown-genre")
    expect(result.metadata.genreUsed).toBe("portfolio")
  })

  it("uses requested genre when present", () => {
    const result = computePosterior(makeFixtureSummary(), "match-3")
    expect(result.metadata.genreUsed).toBe("match-3")
  })

  it("records engineVersion and priorVersion", () => {
    const result = computePosterior(makeFixtureSummary(), "portfolio")
    expect(result.metadata.engineVersion).toBe("1.0.0")
    expect(result.metadata.priorVersion).toBe("genre-priors-2026-04-29")
  })

  it("marks insufficient_installs validity when n < 1000", () => {
    const tooSmall = makeFixtureSummary()
    tooSmall.cohorts[0].installs = 500
    tooSmall.cohorts[0].retainedByDay = { d1: 110, d7: 20, d30: 4 }
    const result = computePosterior(tooSmall, "portfolio")
    expect(result.metadata.validity.retention_d1).toEqual({
      valid: false,
      reason: "insufficient_installs",
      detail: "n=500",
    })
  })

  it("marks insufficient_history for d30 when cohort age < 30", () => {
    const newCohort = makeFixtureSummary()
    const recent = new Date()
    recent.setDate(recent.getDate() - 10)
    newCohort.cohorts[0].cohortDate = recent.toISOString().slice(0, 10)
    newCohort.cohorts[0].retainedByDay = { d1: 1100, d7: 200, d30: null }
    const result = computePosterior(newCohort, "portfolio")
    expect(result.metadata.validity.retention_d30).toMatchObject({
      valid: false,
      reason: "insufficient_history",
    })
  })

  it("output passes PosteriorSnapshotSchema parse", async () => {
    const { PosteriorSnapshotSchema } = await import("../snapshot-v2")
    const result = computePosterior(makeFixtureSummary(), "portfolio")
    expect(() => PosteriorSnapshotSchema.parse(result)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/shared/api/posterior/__tests__/compute-posterior.test.ts
```

Expected: FAIL with `Cannot find module '../compute-posterior'`.

- [ ] **Step 3: Implement computePosterior**

```typescript
// src/shared/api/posterior/compute-posterior.ts
import {
  ENGINE_VERSION,
  buildRows,
  type CohortSummaryShape,
  type CredibleInterval,
  type GenrePriorRecord,
  type Validity,
} from "@/shared/lib/bayesian-stats"
import genrePriorsRaw from "@/shared/data/genre-priors.json"
import type { CohortSummary } from "@/shared/api/appsflyer/types"
import type { PosteriorSnapshot } from "./snapshot-v2"

const GENRES = genrePriorsRaw.genres as Record<string, GenrePriorRecord>
const PRIOR_VERSION = genrePriorsRaw.version
const ESS_RETENTION = genrePriorsRaw.essRetention

function pickGenrePrior(genre: string | undefined): { record: GenrePriorRecord; genreUsed: string } {
  const requested = genre && GENRES[genre] ? genre : "portfolio"
  const base = GENRES[requested]
  // genre-priors.json stores prior shape but not essRetention — splice it in.
  const record: GenrePriorRecord = { ...base, essRetention: ESS_RETENTION }
  return { record, genreUsed: requested }
}

/**
 * Compute the posterior layer of a v2 snapshot from an existing v1 cohort summary.
 *
 * Flow:
 *   1. Resolve genre-specific prior (fallback: portfolio)
 *   2. Run buildRows() — registry iteration with validity gate
 *   3. Wrap into PosteriorSnapshot envelope (cohortSummary + posterior + metadata)
 */
export function computePosterior(
  cohortSummary: CohortSummary,
  genre: string | undefined,
): PosteriorSnapshot {
  const { record: priorRecord, genreUsed } = pickGenrePrior(genre)

  const rows = buildRows(cohortSummary as unknown as CohortSummaryShape, priorRecord)

  const posterior: Record<string, CredibleInterval> = {}
  const validity: Record<string, Validity> = {}

  for (const row of rows) {
    if ("invalid" in row.result && row.result.invalid) {
      validity[row.metricId] = row.result.validity
      // Even when invalid, persist a zero-CI placeholder so the schema stays uniform.
      posterior[row.metricId] = { mean: 0, ci_low: 0, ci_high: 0, sampleSize: 0 }
    } else {
      const ci = row.result as CredibleInterval
      posterior[row.metricId] = ci
      validity[row.metricId] = { valid: true }
    }
  }

  return {
    cohortSummary,
    posterior,
    metadata: {
      engineVersion: ENGINE_VERSION,
      priorVersion: PRIOR_VERSION,
      genreUsed,
      validity,
    },
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/shared/api/posterior/__tests__/compute-posterior.test.ts
```

Expected: 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/posterior/compute-posterior.ts src/shared/api/posterior/__tests__/compute-posterior.test.ts
git commit -m "feat(posterior): add computePosterior — cohortSummary + genre → v2 snapshot"
```

---

## Task 4: blob-store extension

**Files:**
- Modify: `src/shared/api/appsflyer/blob-store.ts`

- [ ] **Step 1: Read current putCohortSummary/getCohortSummary as template**

```bash
grep -n "putCohortSummary\|getCohortSummary\|CohortSummarySchema" src/shared/api/appsflyer/blob-store.ts
```

Expected: shows the existing put/get pair around line 79-87.

- [ ] **Step 2: Append posterior put/get functions to blob-store.ts**

Add the following two functions to the END of `src/shared/api/appsflyer/blob-store.ts` (after the existing exports, before EOF). Do NOT modify any existing function.

```typescript
import { PosteriorSnapshotSchema, type PosteriorSnapshot } from "@/shared/api/posterior/snapshot-v2"

export async function putPosteriorSnapshot(
  appId: string,
  snapshot: PosteriorSnapshot,
): Promise<void> {
  const validated = PosteriorSnapshotSchema.parse(snapshot)
  await put(`posterior/${appId}.json`, JSON.stringify(validated), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  })
}

export async function getPosteriorSnapshot(appId: string): Promise<PosteriorSnapshot | null> {
  const url = await blobUrl(`posterior/${appId}.json`)
  if (!url) return null
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) return null
  const json = await res.json()
  return PosteriorSnapshotSchema.parse(json)
}
```

> Notes:
> - `put` and `blobUrl` are existing helpers in blob-store.ts (used by `putCohortSummary` etc.). Do NOT redefine them.
> - The import line at the top of blob-store.ts: keep alphabetical/grouping convention. Add the new import line near other `@/shared/api/...` imports.

- [ ] **Step 3: Verify no existing tests break + tsc clean**

```bash
npx tsc --noEmit
npx vitest run src/shared/api/appsflyer/__tests__/blob-store.test.ts
```

Expected: tsc 0 errors. blob-store tests still pass (they test the existing functions; these aren't touched).

- [ ] **Step 4: Commit**

```bash
git add src/shared/api/appsflyer/blob-store.ts
git commit -m "feat(blob-store): add putPosteriorSnapshot + getPosteriorSnapshot"
```

---

## Task 5: posterior barrel index

**Files:**
- Create: `src/shared/api/posterior/index.ts`

- [ ] **Step 1: Write barrel**

```typescript
// src/shared/api/posterior/index.ts
export { computePosterior } from "./compute-posterior"
export { PosteriorSnapshotSchema } from "./snapshot-v2"
export type { PosteriorSnapshot } from "./snapshot-v2"
```

- [ ] **Step 2: tsc check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/api/posterior/index.ts
git commit -m "feat(posterior): add barrel export"
```

---

## Task 6: orchestrator integration

**Files:**
- Modify: `src/shared/api/appsflyer/orchestrator.ts:185`

- [ ] **Step 1: Locate insertion point**

```bash
grep -n "putCohortSummary(appId, summary)" src/shared/api/appsflyer/orchestrator.ts
```

Expected: prints `185:    await putCohortSummary(appId, summary)` (or similar line number).

- [ ] **Step 2: Add computePosterior import + call**

In `src/shared/api/appsflyer/orchestrator.ts`:

a) Add import at the top of the file alongside other `@/shared/api/...` imports:

```typescript
import { computePosterior } from "@/shared/api/posterior"
import { putPosteriorSnapshot } from "@/shared/api/appsflyer/blob-store"
```

> If `putPosteriorSnapshot` is already imported from `./blob-store` indirectly (e.g. via existing `putCohortSummary` import line), extend that line instead of duplicating.

b) Replace this block (around line 185):

```typescript
    const summary = aggregate(allInstalls, allEvents, account.currency)
    await putCohortSummary(appId, summary)
```

with:

```typescript
    const summary = aggregate(allInstalls, allEvents, account.currency)
    await putCohortSummary(appId, summary)

    // PR2 (D Bayesian): derive + persist posterior snapshot. Failures are non-fatal —
    // cohort summary write already succeeded above, so the next cron cycle retries.
    try {
      const posteriorSnapshot = computePosterior(summary, app.genre)
      await putPosteriorSnapshot(appId, posteriorSnapshot)
    } catch (err) {
      // Surface in failureHistory but do not change `status`. Cron auto-retries.
      const failureEntry = {
        at: new Date().toISOString(),
        type: "partial" as const,
        message: `posterior compute failed: ${(err as Error).message}`,
        report: "compute_posterior",
      }
      state = await mutateState(appId, (fresh) => ({
        failureHistory: [...fresh.failureHistory, failureEntry].slice(-10) as AppState["failureHistory"],
      }))
    }
```

> The try/catch is critical: PR2 must never regress the existing v1 cohort path. If posterior compute throws (engine bug, prior file corruption, etc.), the v1 summary already persisted and the caller still sees `status: active`.

- [ ] **Step 3: tsc check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Run existing AppsFlyer tests — verify zero regression**

```bash
npx vitest run src/shared/api/appsflyer/__tests__/
```

Expected: all existing tests still pass. The orchestrator change is additive + try/catch protected, so nothing should break.

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/appsflyer/orchestrator.ts
git commit -m "feat(orchestrator): persist posterior snapshot after cohort summary

Non-fatal try/catch: posterior failure never reverts cohort summary state.
Cron auto-retries on next cycle. Engine version mismatch handled implicitly
(any change to ENGINE_VERSION causes posterior recompute on next sync)."
```

---

## Task 7: API route — `/api/posterior/[appId]`

**Files:**
- Create: `src/app/api/posterior/[appId]/route.ts`

- [ ] **Step 1: Write route handler**

```typescript
// src/app/api/posterior/[appId]/route.ts
import { NextResponse } from "next/server"
import { getPosteriorSnapshot } from "@/shared/api/appsflyer/blob-store"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ appId: string }> },
): Promise<Response> {
  const { appId } = await ctx.params
  const snapshot = await getPosteriorSnapshot(appId)
  if (!snapshot) {
    return NextResponse.json({ error: "not_found", appId }, { status: 404 })
  }
  return NextResponse.json(snapshot, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  })
}
```

> Mirrors `src/app/api/appsflyer/summary/[appId]/route.ts` pattern verbatim.

- [ ] **Step 2: tsc check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify route file structure matches existing convention**

```bash
ls src/app/api/posterior/[appId]/
```

Expected: `route.ts` (just the one file).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/posterior
git commit -m "feat(api): add GET /api/posterior/[appId] route"
```

---

## Task 8: Full suite + tsc + lint + push + PR

- [ ] **Step 1: Full test suite**

```bash
npm test
```

Expected: all tests green. Count = baseline (105+) + 13 new (5 snapshot-v2 + 8 compute-posterior). Final ≥ 118.

- [ ] **Step 2: Type check entire project**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: 0 errors in NEW files (`src/shared/api/posterior/*`, `src/app/api/posterior/*`). Pre-existing lint errors elsewhere remain — do NOT fix them in PR2.

If lint fails on new files, fix the issue, commit as separate `fix(posterior): lint cleanup` commit, re-run lint to confirm.

- [ ] **Step 4: Verify file inventory**

```bash
ls src/shared/api/posterior/
ls src/shared/api/posterior/__tests__/
ls src/app/api/posterior/[appId]/
```

Expected:
```
src/shared/api/posterior/:
  __tests__/  compute-posterior.ts  index.ts  snapshot-v2.ts

src/shared/api/posterior/__tests__/:
  compute-posterior.test.ts  snapshot-v2.test.ts

src/app/api/posterior/[appId]/:
  route.ts
```

- [ ] **Step 5: Push branch + create PR**

```bash
git push -u origin feature/d-bayesian-pr2-appsflyer-integration
gh pr create --title "feat(d-bayesian): PR2 AppsFlyer integration + Snapshot v2 + posterior route" \
  --body "$(cat <<'EOF'
## Summary
- New posterior layer at `src/shared/api/posterior/` (snapshot-v2 schema + computePosterior + barrel)
- AppsFlyer orchestrator now writes a v2 PosteriorSnapshot after the v1 cohort summary (non-fatal try/catch — never regresses v1 path)
- New API route `GET /api/posterior/[appId]` serves the v2 snapshot from Vercel Blob
- Lazy v1 → v2 strategy: existing v1 snapshots untouched; next cron cycle produces v2 naturally
- Genre lookup falls back to `portfolio` default when app has no genre or unknown genre
- Engine version mismatch handled implicitly: any `ENGINE_VERSION` change causes posterior recompute on next cron

## Spec
`yieldo/docs/superpowers/specs/2026-04-29-bayesian-stats-engine-yieldo-design.md` (commit 185e76a) — §2, §4, §7, §13

## Plan
`yieldo/docs/superpowers/plans/2026-04-29-bayesian-stats-engine-yieldo-pr2.md`

## Brainstorming decisions
- Q1 v1 compat: Lazy
- Q2 API route: standalone /api/posterior/[appId]
- Q3 Genre missing: portfolio default
- Q4 Engine version: cron auto-recompute
- Q5 Tests: fixture-based

## Test plan
- [x] `npm test` — all green (≥ 118 tests, +13 new)
- [x] `npx tsc --noEmit` — 0 type errors
- [x] `npm run lint` — 0 errors in new files
- [x] Existing 76 AppsFlyer tests untouched (regression check)
- [x] PosteriorSnapshotSchema parses + rejects malformed inputs
- [x] computePosterior produces 4 metrics + handles validity branches + genre fallback

## Out of scope (next PRs)
- PR3: Seed snapshot prebuild (`scripts/build-seed-snapshot.ts`)
- PR4: market-gap page wiring + Methodology Modal + i18n

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

If `gh pr create` errors with auth, push branch only and report manual URL: `https://github.com/mugungwhwa/project-compass/pull/new/feature/d-bayesian-pr2-appsflyer-integration`.

---

## Self-Review

**Spec coverage check** (against `2026-04-29-bayesian-stats-engine-yieldo-design.md`):

| Spec section | PR2 coverage |
|---|---|
| §2 시스템 경계 + 데이터 흐름 | ✅ Task 6 (orchestrator → posterior write) + Task 7 (API route serves) |
| §4 Snapshot v2 Schema | ✅ Task 2 (PosteriorSnapshotSchema) |
| §7.1 computePosterior algorithm | ✅ Task 3 (genre fallback, METRIC_REGISTRY iteration via buildRows, validity gate) |
| §7.2 backward compatibility (v1 snapshot 잔존) | ✅ Task 6 (additive write, no v1 mutation) + Brainstorming Q1 (Lazy) |
| §9 Testing — Integration / Snapshot | ✅ Task 3 (fixture + schema parse) + Task 6 step 4 (regression) |
| §13 Engine version 운영 규약 (cron auto-recompute) | ✅ Brainstorming Q4 + Task 6 (any sync run picks up new ENGINE_VERSION) |
| §10 PR 분할 PR2 행 | ✅ This entire plan |

**Placeholder scan**: searched plan for "TBD", "TODO", "fill in", "similar to" — none in PR2 task bodies. ✅

**Type consistency**:
- `PosteriorSnapshot` defined in Task 2, consumed in Task 3, 4, 7. Same shape.
- `computePosterior(summary, genre)` signature consistent in Task 3 (definition) + Task 6 (call site).
- `putPosteriorSnapshot(appId, snapshot)` defined Task 4, called Task 6. ✅

**No regression risk** confirmed by Task 6 try/catch + Task 6 step 4 explicit existing test run.

---

## What ships at end of PR2

- AppsFlyer cron run produces v2 snapshot in Blob (key: `posterior/<appId>.json`)
- UI/clients can call `GET /api/posterior/<appId>` to read it (PR4 will consume)
- v1 cohort summary path unchanged (regression-free)
- 13 new tests (5 schema + 8 compute) + 0 regressions

**Subsequent plans:**
- **PR3** (`2026-04-29-bayesian-stats-engine-yieldo-pr3.md` — to be written): seed snapshot prebuild, `verify-seed` CI gate
- **PR4** (`2026-04-29-bayesian-stats-engine-yieldo-pr4.md` — to be written): market-gap page wiring, Methodology Modal, i18n

---

**End of PR2 plan.**
