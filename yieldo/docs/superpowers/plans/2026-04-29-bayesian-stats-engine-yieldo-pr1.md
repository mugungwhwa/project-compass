# D — Bayesian Stats Engine (yieldo) PR1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the pure TS Bayesian engine library at `src/shared/lib/bayesian-stats/` with full unit + property test coverage. PR1 produces an importable, tested library with **no UI or AppsFlyer integration yet** — that is PR2-4.

**Architecture:** Pure functions, no I/O. `(priorParams, observations) → CredibleInterval | InvalidResult`. Conjugate models (Beta-Binomial for retention, LogNormal MoM for revenue). METRIC_REGISTRY pattern with 4 entries. Validity gate before posterior computation.

**Tech Stack:** TypeScript strict mode · Zod for schemas · Vitest for tests · Numerical Recipes betaincinv (ported, no scipy dependency).

**Spec reference:** `yieldo/docs/superpowers/specs/2026-04-29-bayesian-stats-engine-yieldo-design.md` (commit 185e76a).

**Subsequent plans (PR2-4) live in separate files** — written after PR1 lands.

---

## File Structure

### Files this PR creates

```
yieldo/src/shared/lib/bayesian-stats/
├── index.ts                            # barrel export
├── types.ts                            # CredibleInterval, MetricDefinition, Validity, ValidityReason
├── version.ts                          # ENGINE_VERSION = "1.0.0"
├── beta-quantile.ts                    # Numerical Recipes betaincinv port
├── effective-sample-size.ts            # ESS_RETENTION_CAP, ESS_REVENUE constants
├── beta-binomial.ts                    # Beta-Binomial conjugate model
├── lognormal.ts                        # LogNormal MoM revenue model
├── validity.ts                         # validateRetentionPosterior, validatePrior, etc.
├── metric-registry.ts                  # METRIC_REGISTRY (4 entries)
├── build-rows.ts                       # Registry → UI rows (helper)
└── __tests__/
    ├── beta-quantile.test.ts
    ├── beta-binomial.test.ts
    ├── lognormal.test.ts
    ├── validity.test.ts
    ├── shrinkage.test.ts               # property test
    └── e2e.test.ts                     # METRIC_REGISTRY end-to-end

yieldo/src/shared/data/
└── genre-priors.json                   # GameAnalytics 2024 + portfolio default
```

### Files this PR does NOT touch

- `src/app/(dashboard)/dashboard/market-gap/page.tsx` (PR4)
- `src/shared/api/appsflyer/` (PR2)
- `src/shared/api/posterior/` (PR2)
- `scripts/build-seed-snapshot.ts` (PR3)
- `package.json` scripts (PR3)
- `src/shared/i18n/dictionary.ts` (PR4)

### Tooling

- Test runner: `npm test` (existing — runs `vitest run --passWithNoTests`)
- Run single test file: `npx vitest run src/shared/lib/bayesian-stats/__tests__/<file>.test.ts`
- TypeScript: yieldo's existing strict tsconfig — no changes

---

## Task 1: Worktree + branch setup

**Files:** none (workspace setup)

- [ ] **Step 1: Create feature worktree**

```bash
cd /Users/mike/Downloads/Compass
git worktree add .worktrees/feature-d-bayesian-pr1-engine -b feature/d-bayesian-pr1-engine main
```

Expected: `Preparing worktree (new branch 'feature/d-bayesian-pr1-engine')` + worktree directory created.

- [ ] **Step 2: Verify worktree branch and clean state**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr1-engine
git status
git branch --show-current
```

Expected: clean working tree, branch = `feature/d-bayesian-pr1-engine`.

- [ ] **Step 3: Install dependencies (worktree shares node_modules but verify)**

```bash
cd /Users/mike/Downloads/Compass/.worktrees/feature-d-bayesian-pr1-engine/yieldo
npm install --legacy-peer-deps
```

Expected: completes without error. (Required because `@visx` peer-deps with React 19 — see CLAUDE.md §8.4.1.)

- [ ] **Step 4: Verify test runner works**

```bash
npm test
```

Expected: vitest runs, exits 0 (passWithNoTests means empty suites pass).

> All subsequent commands run from `.worktrees/feature-d-bayesian-pr1-engine/yieldo` unless stated otherwise.

---

## Task 2: ENGINE_VERSION constant

**Files:**
- Create: `src/shared/lib/bayesian-stats/version.ts`

- [ ] **Step 1: Create version file**

```typescript
// src/shared/lib/bayesian-stats/version.ts
export const ENGINE_VERSION = "1.0.0"
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (file is valid).

- [ ] **Step 3: Commit**

```bash
git add src/shared/lib/bayesian-stats/version.ts
git commit -m "feat(bayes): add ENGINE_VERSION constant (1.0.0)"
```

---

## Task 3: Types

**Files:**
- Create: `src/shared/lib/bayesian-stats/types.ts`

- [ ] **Step 1: Write types file**

```typescript
// src/shared/lib/bayesian-stats/types.ts
import { z } from "zod"

export type CredibleInterval = {
  mean: number
  ci_low: number
  ci_high: number
  sampleSize: number
}

export const CredibleIntervalSchema = z.object({
  mean: z.number(),
  ci_low: z.number(),
  ci_high: z.number(),
  sampleSize: z.number().nonnegative(),
})

export const ValidityReasonSchema = z.enum([
  "insufficient_installs",
  "insufficient_history",
  "prior_ess_too_low",
  "engine_version_mismatch",
])
export type ValidityReason = z.infer<typeof ValidityReasonSchema>

export const ValiditySchema = z.discriminatedUnion("valid", [
  z.object({ valid: z.literal(true) }),
  z.object({
    valid: z.literal(false),
    reason: ValidityReasonSchema,
    detail: z.string().optional(),
  }),
])
export type Validity = z.infer<typeof ValiditySchema>

export type PosteriorResult =
  | (CredibleInterval & { invalid?: false })
  | { invalid: true; validity: Extract<Validity, { valid: false }> }

export type BayesianModel<Prior, Obs> = {
  posterior: (prior: Prior, obs: Obs) => CredibleInterval
}

export type MetricDefinition<Prior, Obs> = {
  metricId: string
  model: BayesianModel<Prior, Obs>
  priorAccessor: (priors: GenrePriorRecord) => Prior
  observationAccessor: (cohortSummary: CohortSummaryShape) => Obs
  validate: (obs: Obs) => Validity
}

// Forward declarations — fully defined in Task 12 (genre-priors) + accessed from CohortSummary types in PR2
export type GenrePriorRecord = {
  retention: { d1: BetaPrior; d7: BetaPrior; d30: BetaPrior }
  monthlyRevenueUsd: LogNormalPrior
  essRetention: number
}

export type BetaPrior = { alpha: number; beta: number }
export type LogNormalPrior = { mu0: number; sigma0: number }

// Minimal shape needed by Registry observation accessors. Full CohortSummary
// type lives in shared/api/appsflyer/types.ts and is wired up in PR2.
export type CohortSummaryShape = {
  cohorts: Array<{
    installs: number
    retainedByDay: { d1: number | null; d7: number | null; d30: number | null }
    cohortDate: string
  }>
  revenue: {
    daily: Array<{ date: string; sumUsd: number; purchasers: number }>
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/lib/bayesian-stats/types.ts
git commit -m "feat(bayes): add core types (CredibleInterval, Validity, MetricDefinition)"
```

---

## Task 4: Beta quantile (Numerical Recipes betaincinv port)

**Files:**
- Create: `src/shared/lib/bayesian-stats/beta-quantile.ts`
- Test: `src/shared/lib/bayesian-stats/__tests__/beta-quantile.test.ts`

- [ ] **Step 1: Write the failing test**

Test reference values from R's `qbeta()` (analytical reference, 1e-3 tolerance per spec §1.5 #1):

```typescript
// src/shared/lib/bayesian-stats/__tests__/beta-quantile.test.ts
import { describe, expect, it } from "vitest"
import { betaQuantile } from "../beta-quantile"

describe("betaQuantile", () => {
  // Reference values from R: qbeta(p, alpha, beta)
  it("matches qbeta(0.025, 2, 3) ≈ 0.06755", () => {
    expect(betaQuantile(0.025, 2, 3)).toBeCloseTo(0.06755, 3)
  })

  it("matches qbeta(0.975, 2, 3) ≈ 0.80604", () => {
    expect(betaQuantile(0.975, 2, 3)).toBeCloseTo(0.80604, 3)
  })

  it("matches qbeta(0.5, 100, 100) ≈ 0.5 (symmetric)", () => {
    expect(betaQuantile(0.5, 100, 100)).toBeCloseTo(0.5, 3)
  })

  it("matches qbeta(0.025, 50, 950) ≈ 0.03725", () => {
    expect(betaQuantile(0.025, 50, 950)).toBeCloseTo(0.03725, 3)
  })

  it("matches qbeta(0.975, 50, 950) ≈ 0.06511", () => {
    expect(betaQuantile(0.975, 50, 950)).toBeCloseTo(0.06511, 3)
  })

  it("returns 0 at p=0", () => {
    expect(betaQuantile(0, 2, 3)).toBe(0)
  })

  it("returns 1 at p=1", () => {
    expect(betaQuantile(1, 2, 3)).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/shared/lib/bayesian-stats/__tests__/beta-quantile.test.ts
```

Expected: FAIL with "Cannot find module '../beta-quantile'".

- [ ] **Step 3: Implement betaQuantile**

```typescript
// src/shared/lib/bayesian-stats/beta-quantile.ts
// Numerical Recipes 3rd ed., Section 6.14: Inverse Incomplete Beta Function
// Returns x such that I_x(a, b) = p, where I is the regularized incomplete beta.
// Algorithm: rational approximation initial guess + Halley's method refinement.

const EPS = 1e-12

function logGamma(x: number): number {
  // Lanczos approximation
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
             -1.231739572450155, 0.001208650973866179, -0.000005395239384953]
  let y = x
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) {
    y += 1
    ser += c[j] / y
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x)
}

function betaCF(a: number, b: number, x: number): number {
  const MAXIT = 200
  const FPMIN = 1e-300
  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  let c = 1
  let d = 1 - qab * x / qap
  if (Math.abs(d) < FPMIN) d = FPMIN
  d = 1 / d
  let h = d
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    h *= d * c
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < EPS) break
  }
  return h
}

function regularizedIncompleteBeta(a: number, b: number, x: number): number {
  if (x === 0) return 0
  if (x === 1) return 1
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x),
  )
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betaCF(a, b, x) / a
  }
  return 1 - bt * betaCF(b, a, 1 - x) / b
}

export function betaQuantile(p: number, a: number, b: number): number {
  if (p <= 0) return 0
  if (p >= 1) return 1

  // Initial guess (Numerical Recipes 6.14.13)
  let x: number
  const lna = Math.log(a / (a + b))
  const lnb = Math.log(b / (a + b))
  const t = Math.sqrt(-2 * Math.log(p < 0.5 ? p : 1 - p))
  if (a > 1 && b > 1) {
    const r = (Math.sqrt(-Math.log(p * (1 - p))))
    let y = (r - (2.30753 + 0.27061 * r) / (1 + (0.99229 + 0.04481 * r) * r))
    if (p < 0.5) y = -y
    const al = (y * y - 3) / 6
    const h = 2 / (1 / (2 * a - 1) + 1 / (2 * b - 1))
    const w = (y * Math.sqrt(al + h) / h) -
              (1 / (2 * b - 1) - 1 / (2 * a - 1)) *
              (al + 5 / 6 - 2 / (3 * h))
    x = a / (a + b * Math.exp(2 * w))
  } else {
    const lna_ = Math.log(a / (a + b))
    const lnb_ = Math.log(b / (a + b))
    const t_ = Math.exp(a * lna_) / a
    const u_ = Math.exp(b * lnb_) / b
    const w_ = t_ + u_
    if (p < t_ / w_) x = Math.pow(a * w_ * p, 1 / a)
    else x = 1 - Math.pow(b * w_ * (1 - p), 1 / b)
  }

  // Halley's method refinement
  const afac = -logGamma(a) - logGamma(b) + logGamma(a + b)
  for (let j = 0; j < 10; j++) {
    if (x === 0 || x === 1) return x
    const err = regularizedIncompleteBeta(a, b, x) - p
    let t_ = Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) + afac)
    const u = err / t_
    t_ = u / (1 - 0.5 * Math.min(1, u * ((a - 1) / x - (b - 1) / (1 - x))))
    x -= t_
    if (x <= 0) x = 0.5 * (x + t_)
    if (x >= 1) x = 0.5 * (x + t_ + 1)
    if (Math.abs(t_) < EPS * x && j > 0) break
  }
  return x
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/shared/lib/bayesian-stats/__tests__/beta-quantile.test.ts
```

Expected: 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/bayesian-stats/beta-quantile.ts src/shared/lib/bayesian-stats/__tests__/beta-quantile.test.ts
git commit -m "feat(bayes): port Numerical Recipes betaincinv with R qbeta reference tests"
```

---

## Task 5: Effective Sample Size constants

**Files:**
- Create: `src/shared/lib/bayesian-stats/effective-sample-size.ts`

- [ ] **Step 1: Create constants file**

```typescript
// src/shared/lib/bayesian-stats/effective-sample-size.ts
//
// ESS caps prevent prior pseudo-counts from overwhelming observed data.
// See spec §3.5.

/** Beta(α,β) sum cap for retention priors. Roughly 5-10× typical cohort install count. */
export const ESS_RETENTION_CAP = 10_000

/** Pseudo-month count for monthly revenue prior (LogNormal MoM weighting). */
export const ESS_REVENUE = 6

/** Threshold below which a prior is considered too weak to anchor inference (validity reason). */
export const PRIOR_ESS_FLOOR = 5_000

/** Minimum installs in a cohort before retention posterior is reportable. */
export const MIN_COHORT_INSTALLS = 1_000

/** Minimum months of revenue data before LogNormal posterior is reportable. */
export const MIN_REVENUE_MONTHS = 3
```

- [ ] **Step 2: TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/lib/bayesian-stats/effective-sample-size.ts
git commit -m "feat(bayes): add ESS caps + validity thresholds"
```

---

## Task 6: Beta-Binomial model

**Files:**
- Create: `src/shared/lib/bayesian-stats/beta-binomial.ts`
- Test: `src/shared/lib/bayesian-stats/__tests__/beta-binomial.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/shared/lib/bayesian-stats/__tests__/beta-binomial.test.ts
import { describe, expect, it } from "vitest"
import { betaBinomialModel } from "../beta-binomial"

describe("betaBinomialModel", () => {
  it("posterior mean equals (α+k)/(α+β+n)", () => {
    const prior = { alpha: 10, beta: 90 }
    const obs = { n: 1000, k: 200 }
    const result = betaBinomialModel.posterior(prior, obs)
    // (10+200)/(100+1000) = 210/1100 ≈ 0.19091
    expect(result.mean).toBeCloseTo(0.19091, 4)
  })

  it("CI narrows as observed n grows (shrinkage)", () => {
    const prior = { alpha: 10, beta: 90 }
    const small = betaBinomialModel.posterior(prior, { n: 100, k: 20 })
    const large = betaBinomialModel.posterior(prior, { n: 10_000, k: 2000 })
    expect(large.ci_high - large.ci_low).toBeLessThan(small.ci_high - small.ci_low)
  })

  it("prior dominates when n=0", () => {
    const prior = { alpha: 5, beta: 95 }
    const result = betaBinomialModel.posterior(prior, { n: 0, k: 0 })
    // mean = 5/100 = 0.05
    expect(result.mean).toBeCloseTo(0.05, 4)
  })

  it("sampleSize equals α+β+n", () => {
    const result = betaBinomialModel.posterior(
      { alpha: 50, beta: 950 },
      { n: 1500, k: 200 },
    )
    expect(result.sampleSize).toBe(1000 + 1500)
  })

  it("ci_low < mean < ci_high", () => {
    const result = betaBinomialModel.posterior(
      { alpha: 10, beta: 90 },
      { n: 1000, k: 200 },
    )
    expect(result.ci_low).toBeLessThan(result.mean)
    expect(result.mean).toBeLessThan(result.ci_high)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/shared/lib/bayesian-stats/__tests__/beta-binomial.test.ts
```

Expected: FAIL with "Cannot find module '../beta-binomial'".

- [ ] **Step 3: Implement model**

```typescript
// src/shared/lib/bayesian-stats/beta-binomial.ts
import { betaQuantile } from "./beta-quantile"
import type { BayesianModel, BetaPrior } from "./types"

export type BinomialObs = { n: number; k: number }

export const betaBinomialModel: BayesianModel<BetaPrior, BinomialObs> = {
  posterior: ({ alpha, beta }, { n, k }) => {
    const alphaPost = alpha + k
    const betaPost = beta + (n - k)
    return {
      mean: alphaPost / (alphaPost + betaPost),
      ci_low: betaQuantile(0.025, alphaPost, betaPost),
      ci_high: betaQuantile(0.975, alphaPost, betaPost),
      sampleSize: alphaPost + betaPost,
    }
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/shared/lib/bayesian-stats/__tests__/beta-binomial.test.ts
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/bayesian-stats/beta-binomial.ts src/shared/lib/bayesian-stats/__tests__/beta-binomial.test.ts
git commit -m "feat(bayes): add Beta-Binomial conjugate retention model"
```

---

## Task 7: LogNormal MoM revenue model

**Files:**
- Create: `src/shared/lib/bayesian-stats/lognormal.ts`
- Test: `src/shared/lib/bayesian-stats/__tests__/lognormal.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/shared/lib/bayesian-stats/__tests__/lognormal.test.ts
import { describe, expect, it } from "vitest"
import { lognormalModel } from "../lognormal"

describe("lognormalModel", () => {
  it("converges to MLE when observed n >> ESS_REVENUE", () => {
    const prior = { mu0: Math.log(100_000), sigma0: 0.5 }
    // 100 months of $1M revenue (constant) — MLE should dominate
    const obs = { monthlyValues: Array(100).fill(1_000_000) }
    const result = lognormalModel.posterior(prior, obs)
    // E[LogNormal(ln(1M), 0)] = 1M (when sigma=0)
    expect(result.mean).toBeGreaterThan(900_000)
    expect(result.mean).toBeLessThan(1_100_000)
  })

  it("falls back to prior when observed monthlyValues is empty", () => {
    const prior = { mu0: Math.log(50_000), sigma0: 0.5 }
    const result = lognormalModel.posterior(prior, { monthlyValues: [] })
    // E[LogNormal(mu0, sigma0)] = exp(mu0 + sigma0²/2)
    const expected = Math.exp(Math.log(50_000) + 0.5 * 0.5 / 2)
    expect(result.mean).toBeCloseTo(expected, -2)
  })

  it("CI is wider when sigma is larger", () => {
    const prior = { mu0: Math.log(100_000), sigma0: 1.0 }
    const small_sigma = lognormalModel.posterior(prior, {
      monthlyValues: [100_000, 100_000, 100_000],
    })
    const large_sigma = lognormalModel.posterior(prior, {
      monthlyValues: [10_000, 100_000, 1_000_000],
    })
    expect(large_sigma.ci_high - large_sigma.ci_low).toBeGreaterThan(small_sigma.ci_high - small_sigma.ci_low)
  })

  it("ci_low < mean < ci_high", () => {
    const result = lognormalModel.posterior(
      { mu0: Math.log(100_000), sigma0: 0.5 },
      { monthlyValues: [100_000, 110_000, 90_000] },
    )
    expect(result.ci_low).toBeLessThan(result.mean)
    expect(result.mean).toBeLessThan(result.ci_high)
  })

  it("sampleSize equals monthlyValues.length + ESS_REVENUE", () => {
    const result = lognormalModel.posterior(
      { mu0: 0, sigma0: 1 },
      { monthlyValues: [1, 2, 3, 4, 5] },
    )
    // 5 + 6 = 11
    expect(result.sampleSize).toBe(11)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/shared/lib/bayesian-stats/__tests__/lognormal.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement model**

```typescript
// src/shared/lib/bayesian-stats/lognormal.ts
import { ESS_REVENUE } from "./effective-sample-size"
import type { BayesianModel, LogNormalPrior } from "./types"

export type LogNormalObs = { monthlyValues: number[] }

function mean(xs: number[]): number {
  if (xs.length === 0) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function std(xs: number[]): number {
  if (xs.length < 2) return 0
  const m = mean(xs)
  const variance = xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1)
  return Math.sqrt(variance)
}

export const lognormalModel: BayesianModel<LogNormalPrior, LogNormalObs> = {
  posterior: ({ mu0, sigma0 }, { monthlyValues }) => {
    if (monthlyValues.length === 0) {
      // Pure prior fallback
      return {
        mean: Math.exp(mu0 + sigma0 ** 2 / 2),
        ci_low: Math.exp(mu0 - 1.96 * sigma0),
        ci_high: Math.exp(mu0 + 1.96 * sigma0),
        sampleSize: ESS_REVENUE,
      }
    }
    const positive = monthlyValues.filter((v) => v > 0)
    const logVals = positive.map(Math.log)
    const muMle = mean(logVals)
    const sigmaMle = std(logVals)

    const n = positive.length
    const w = n / (n + ESS_REVENUE)
    const muPost = w * muMle + (1 - w) * mu0
    const sigmaPost = Math.sqrt(w * sigmaMle ** 2 + (1 - w) * sigma0 ** 2)

    return {
      mean: Math.exp(muPost + sigmaPost ** 2 / 2),
      ci_low: Math.exp(muPost - 1.96 * sigmaPost),
      ci_high: Math.exp(muPost + 1.96 * sigmaPost),
      sampleSize: n + ESS_REVENUE,
    }
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/shared/lib/bayesian-stats/__tests__/lognormal.test.ts
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/bayesian-stats/lognormal.ts src/shared/lib/bayesian-stats/__tests__/lognormal.test.ts
git commit -m "feat(bayes): add LogNormal MoM revenue model with prior weighting"
```

---

## Task 8: Validity validators

**Files:**
- Create: `src/shared/lib/bayesian-stats/validity.ts`
- Test: `src/shared/lib/bayesian-stats/__tests__/validity.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/shared/lib/bayesian-stats/__tests__/validity.test.ts
import { describe, expect, it } from "vitest"
import {
  validateRetentionPosterior,
  validateRevenuePosterior,
  validatePrior,
} from "../validity"

describe("validateRetentionPosterior", () => {
  it("rejects when n < 1000", () => {
    const v = validateRetentionPosterior({ n: 500, cohortAgeDays: 30 }, 1)
    expect(v).toEqual({
      valid: false,
      reason: "insufficient_installs",
      detail: "n=500",
    })
  })

  it("rejects when cohortAgeDays < day", () => {
    const v = validateRetentionPosterior({ n: 5000, cohortAgeDays: 10 }, 30)
    expect(v).toEqual({
      valid: false,
      reason: "insufficient_history",
      detail: "age=10d, need 30d",
    })
  })

  it("accepts when both thresholds met", () => {
    const v = validateRetentionPosterior({ n: 5000, cohortAgeDays: 35 }, 30)
    expect(v).toEqual({ valid: true })
  })

  it("D1 only requires 1 day age", () => {
    const v = validateRetentionPosterior({ n: 5000, cohortAgeDays: 1 }, 1)
    expect(v).toEqual({ valid: true })
  })
})

describe("validateRevenuePosterior", () => {
  it("rejects when fewer than 3 months", () => {
    const v = validateRevenuePosterior({ monthlyValues: [100, 200] })
    expect(v).toEqual({
      valid: false,
      reason: "insufficient_history",
      detail: "2 months",
    })
  })

  it("accepts at exactly 3 months", () => {
    const v = validateRevenuePosterior({ monthlyValues: [100, 200, 300] })
    expect(v).toEqual({ valid: true })
  })
})

describe("validatePrior", () => {
  it("rejects when essRetention < 5000", () => {
    const v = validatePrior({ essRetention: 3000 } as any)
    expect(v).toEqual({
      valid: false,
      reason: "prior_ess_too_low",
      detail: "ESS=3000",
    })
  })

  it("accepts when essRetention >= 5000", () => {
    const v = validatePrior({ essRetention: 8000 } as any)
    expect(v).toEqual({ valid: true })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/shared/lib/bayesian-stats/__tests__/validity.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement validators**

```typescript
// src/shared/lib/bayesian-stats/validity.ts
import { MIN_COHORT_INSTALLS, MIN_REVENUE_MONTHS, PRIOR_ESS_FLOOR } from "./effective-sample-size"
import type { Validity, GenrePriorRecord } from "./types"

export function validateRetentionPosterior(
  obs: { n: number; cohortAgeDays: number },
  day: 1 | 7 | 30,
): Validity {
  if (obs.n < MIN_COHORT_INSTALLS) {
    return { valid: false, reason: "insufficient_installs", detail: `n=${obs.n}` }
  }
  if (obs.cohortAgeDays < day) {
    return {
      valid: false,
      reason: "insufficient_history",
      detail: `age=${obs.cohortAgeDays}d, need ${day}d`,
    }
  }
  return { valid: true }
}

export function validateRevenuePosterior(obs: { monthlyValues: number[] }): Validity {
  if (obs.monthlyValues.length < MIN_REVENUE_MONTHS) {
    return {
      valid: false,
      reason: "insufficient_history",
      detail: `${obs.monthlyValues.length} months`,
    }
  }
  return { valid: true }
}

export function validatePrior(prior: GenrePriorRecord): Validity {
  if (prior.essRetention < PRIOR_ESS_FLOOR) {
    return {
      valid: false,
      reason: "prior_ess_too_low",
      detail: `ESS=${prior.essRetention}`,
    }
  }
  return { valid: true }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/shared/lib/bayesian-stats/__tests__/validity.test.ts
```

Expected: 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/bayesian-stats/validity.ts src/shared/lib/bayesian-stats/__tests__/validity.test.ts
git commit -m "feat(bayes): add validity gate for retention/revenue/prior thresholds"
```

---

## Task 9: Genre priors data file

**Files:**
- Create: `src/shared/data/genre-priors.json`

> Sources: GameAnalytics (2024) Mobile Gaming Benchmarks Report; yieldo CLAUDE.md §3.7. Numbers below are seed values — refine after PR4 ships.

- [ ] **Step 1: Create data file**

```json
{
  "version": "genre-priors-2026-04-29",
  "essRetention": 8000,
  "genres": {
    "portfolio": {
      "retention": {
        "d1": { "alpha": 1830, "beta": 6170 },
        "d7":  { "alpha": 336,  "beta": 7664 },
        "d30": { "alpha": 68,   "beta": 7932 }
      },
      "monthlyRevenueUsd": { "mu0": 11.51, "sigma0": 1.20 }
    },
    "match-3": {
      "retention": {
        "d1": { "alpha": 2080, "beta": 5920 },
        "d7":  { "alpha": 432,  "beta": 7568 },
        "d30": { "alpha": 96,   "beta": 7904 }
      },
      "monthlyRevenueUsd": { "mu0": 12.21, "sigma0": 1.15 }
    },
    "puzzle": {
      "retention": {
        "d1": { "alpha": 1920, "beta": 6080 },
        "d7":  { "alpha": 360,  "beta": 7640 },
        "d30": { "alpha": 76,   "beta": 7924 }
      },
      "monthlyRevenueUsd": { "mu0": 11.85, "sigma0": 1.18 }
    },
    "idle": {
      "retention": {
        "d1": { "alpha": 1680, "beta": 6320 },
        "d7":  { "alpha": 288,  "beta": 7712 },
        "d30": { "alpha": 56,   "beta": 7944 }
      },
      "monthlyRevenueUsd": { "mu0": 11.30, "sigma0": 1.25 }
    }
  }
}
```

> Note on numbers: each `(alpha, beta)` sum = `essRetention` (8000) so the prior carries the declared strength. Expected D1 retention for `portfolio` = 1830/8000 = 22.875% (matches GameAnalytics 2024 median 22.91%). Sub-genre values offset within ±5pp range of portfolio per CLAUDE.md §3.7 benchmark band.

- [ ] **Step 2: Verify JSON parses**

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('src/shared/data/genre-priors.json', 'utf8')).version)"
```

Expected: prints `genre-priors-2026-04-29`.

- [ ] **Step 3: Commit**

```bash
git add src/shared/data/genre-priors.json
git commit -m "feat(bayes): seed genre-priors.json (GameAnalytics 2024 benchmark)"
```

---

## Task 10: Metric Registry

**Files:**
- Create: `src/shared/lib/bayesian-stats/metric-registry.ts`

> Tests for the registry come in Task 12 (e2e). This task is mostly composition.

- [ ] **Step 1: Implement registry**

```typescript
// src/shared/lib/bayesian-stats/metric-registry.ts
import { betaBinomialModel } from "./beta-binomial"
import { lognormalModel } from "./lognormal"
import { validateRetentionPosterior, validateRevenuePosterior } from "./validity"
import type {
  MetricDefinition,
  CohortSummaryShape,
  GenrePriorRecord,
  BetaPrior,
  LogNormalPrior,
  Validity,
} from "./types"

function totalInstalls(s: CohortSummaryShape): number {
  return s.cohorts.reduce((acc, c) => acc + c.installs, 0)
}

function totalRetained(s: CohortSummaryShape, day: 1 | 7 | 30): number {
  return s.cohorts.reduce((acc, c) => {
    const r =
      day === 1 ? c.retainedByDay.d1 :
      day === 7 ? c.retainedByDay.d7 :
                  c.retainedByDay.d30
    return acc + (r ?? 0)
  }, 0)
}

function maxCohortAgeDays(s: CohortSummaryShape, asOf = new Date()): number {
  if (s.cohorts.length === 0) return 0
  const ages = s.cohorts.map((c) => {
    const ms = asOf.getTime() - new Date(c.cohortDate).getTime()
    return Math.floor(ms / (24 * 60 * 60 * 1000))
  })
  return Math.max(...ages, 0)
}

function groupRevenueByMonth(daily: CohortSummaryShape["revenue"]["daily"]): number[] {
  const byMonth = new Map<string, number>()
  for (const { date, sumUsd } of daily) {
    const ym = date.slice(0, 7) // "YYYY-MM"
    byMonth.set(ym, (byMonth.get(ym) ?? 0) + sumUsd)
  }
  return Array.from(byMonth.values())
}

function makeRetentionMetric(day: 1 | 7 | 30): MetricDefinition<BetaPrior, { n: number; k: number; cohortAgeDays: number }> {
  const dayKey = `d${day}` as const
  return {
    metricId: `retention_${dayKey}`,
    model: {
      posterior: (prior, obs) => betaBinomialModel.posterior(prior, { n: obs.n, k: obs.k }),
    },
    priorAccessor: (priors: GenrePriorRecord) => priors.retention[dayKey],
    observationAccessor: (s: CohortSummaryShape) => ({
      n: totalInstalls(s),
      k: totalRetained(s, day),
      cohortAgeDays: maxCohortAgeDays(s),
    }),
    validate: (obs): Validity => validateRetentionPosterior(obs, day),
  }
}

const monthlyRevenueMetric: MetricDefinition<LogNormalPrior, { monthlyValues: number[] }> = {
  metricId: "monthly_revenue_usd",
  model: lognormalModel,
  priorAccessor: (priors) => priors.monthlyRevenueUsd,
  observationAccessor: (s) => ({ monthlyValues: groupRevenueByMonth(s.revenue.daily) }),
  validate: validateRevenuePosterior,
}

export const METRIC_REGISTRY: Record<string, MetricDefinition<any, any>> = {
  retention_d1: makeRetentionMetric(1),
  retention_d7: makeRetentionMetric(7),
  retention_d30: makeRetentionMetric(30),
  monthly_revenue_usd: monthlyRevenueMetric,
}
```

- [ ] **Step 2: TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/lib/bayesian-stats/metric-registry.ts
git commit -m "feat(bayes): add METRIC_REGISTRY with 4 entries (d1/d7/d30 + monthly_revenue)"
```

---

## Task 11: Build rows helper

**Files:**
- Create: `src/shared/lib/bayesian-stats/build-rows.ts`

- [ ] **Step 1: Implement build-rows**

```typescript
// src/shared/lib/bayesian-stats/build-rows.ts
import { METRIC_REGISTRY } from "./metric-registry"
import { validatePrior } from "./validity"
import type {
  CohortSummaryShape,
  CredibleInterval,
  GenrePriorRecord,
  PosteriorResult,
  Validity,
} from "./types"

export type PosteriorRow = {
  metricId: string
  result: PosteriorResult
  prior: CredibleInterval | null
}

/**
 * Iterate METRIC_REGISTRY → for each metric:
 *   1. validatePrior — if invalid, mark all metrics with prior_ess_too_low
 *   2. metric.validate(obs) — if invalid, return { invalid: true, validity }
 *   3. metric.model.posterior(prior, obs) — return CI
 */
export function buildRows(
  cohortSummary: CohortSummaryShape,
  priors: GenrePriorRecord,
): PosteriorRow[] {
  const priorValidity = validatePrior(priors)
  const priorInvalid = priorValidity.valid === false

  return Object.values(METRIC_REGISTRY).map((metric) => {
    if (priorInvalid) {
      return {
        metricId: metric.metricId,
        result: { invalid: true, validity: priorValidity as Extract<Validity, { valid: false }> },
        prior: null,
      }
    }
    const prior = metric.priorAccessor(priors)
    const obs = metric.observationAccessor(cohortSummary)
    const validity = metric.validate(obs)
    if (validity.valid === false) {
      return {
        metricId: metric.metricId,
        result: { invalid: true, validity },
        prior: null,
      }
    }
    const ci = metric.model.posterior(prior, obs)
    return { metricId: metric.metricId, result: ci, prior: null }
  })
}
```

- [ ] **Step 2: TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/lib/bayesian-stats/build-rows.ts
git commit -m "feat(bayes): add buildRows helper (Registry → PosteriorRow[])"
```

---

## Task 12: End-to-end Registry test

**Files:**
- Test: `src/shared/lib/bayesian-stats/__tests__/e2e.test.ts`

- [ ] **Step 1: Write the e2e test**

```typescript
// src/shared/lib/bayesian-stats/__tests__/e2e.test.ts
import { describe, expect, it } from "vitest"
import { buildRows } from "../build-rows"
import { METRIC_REGISTRY } from "../metric-registry"
import genrePriorsRaw from "@/shared/data/genre-priors.json"
import type { CohortSummaryShape, GenrePriorRecord } from "../types"

const portfolioPrior = {
  ...genrePriorsRaw.genres.portfolio,
  essRetention: genrePriorsRaw.essRetention,
} as GenrePriorRecord

function makeCohort(daysAgo: number, installs: number, d1Pct = 0.22, d7Pct = 0.04, d30Pct = 0.008) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return {
    cohortDate: date.toISOString().slice(0, 10),
    installs,
    retainedByDay: {
      d1: Math.round(installs * d1Pct),
      d7: daysAgo >= 7 ? Math.round(installs * d7Pct) : null,
      d30: daysAgo >= 30 ? Math.round(installs * d30Pct) : null,
    },
  }
}

describe("buildRows (Registry e2e)", () => {
  it("produces 4 rows (d1/d7/d30 + monthly_revenue)", () => {
    const summary: CohortSummaryShape = {
      cohorts: [makeCohort(45, 5000)],
      revenue: {
        daily: [
          { date: "2026-01-15", sumUsd: 50_000, purchasers: 100 },
          { date: "2026-02-15", sumUsd: 60_000, purchasers: 120 },
          { date: "2026-03-15", sumUsd: 70_000, purchasers: 140 },
        ],
      },
    }
    const rows = buildRows(summary, portfolioPrior)
    expect(rows).toHaveLength(4)
    expect(rows.map((r) => r.metricId).sort()).toEqual([
      "monthly_revenue_usd",
      "retention_d1",
      "retention_d30",
      "retention_d7",
    ])
  })

  it("returns valid CI for sufficient cohort", () => {
    const summary: CohortSummaryShape = {
      cohorts: [makeCohort(45, 5000)],
      revenue: {
        daily: [
          { date: "2026-01-15", sumUsd: 50_000, purchasers: 100 },
          { date: "2026-02-15", sumUsd: 60_000, purchasers: 120 },
          { date: "2026-03-15", sumUsd: 70_000, purchasers: 140 },
        ],
      },
    }
    const rows = buildRows(summary, portfolioPrior)
    const d1 = rows.find((r) => r.metricId === "retention_d1")!
    expect("invalid" in d1.result && d1.result.invalid).toBe(false)
    if (!("invalid" in d1.result) || !d1.result.invalid) {
      expect(d1.result.mean).toBeGreaterThan(0.15)
      expect(d1.result.mean).toBeLessThan(0.30)
    }
  })

  it("returns insufficient_installs when n < 1000", () => {
    const summary: CohortSummaryShape = {
      cohorts: [makeCohort(45, 500)],
      revenue: { daily: [] },
    }
    const rows = buildRows(summary, portfolioPrior)
    const d1 = rows.find((r) => r.metricId === "retention_d1")!
    expect(d1.result).toEqual({
      invalid: true,
      validity: { valid: false, reason: "insufficient_installs", detail: "n=500" },
    })
  })

  it("returns insufficient_history for d30 when cohort age < 30", () => {
    const summary: CohortSummaryShape = {
      cohorts: [makeCohort(10, 5000)],
      revenue: { daily: [] },
    }
    const rows = buildRows(summary, portfolioPrior)
    const d30 = rows.find((r) => r.metricId === "retention_d30")!
    expect(d30.result).toMatchObject({
      invalid: true,
      validity: { valid: false, reason: "insufficient_history" },
    })
  })

  it("METRIC_REGISTRY has exactly 4 entries", () => {
    expect(Object.keys(METRIC_REGISTRY)).toHaveLength(4)
  })
})
```

- [ ] **Step 2: Run test**

```bash
npx vitest run src/shared/lib/bayesian-stats/__tests__/e2e.test.ts
```

Expected: 5 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/shared/lib/bayesian-stats/__tests__/e2e.test.ts
git commit -m "test(bayes): add e2e Registry integration test (4 metrics, validity branches)"
```

---

## Task 13: Shrinkage property test

**Files:**
- Test: `src/shared/lib/bayesian-stats/__tests__/shrinkage.test.ts`

> No fast-check dependency — use a 100-trial loop with deterministic seeds for reproducibility.

- [ ] **Step 1: Write the property test**

```typescript
// src/shared/lib/bayesian-stats/__tests__/shrinkage.test.ts
import { describe, expect, it } from "vitest"
import { betaBinomialModel } from "../beta-binomial"

// Linear congruential generator — deterministic, no extra dep.
function makeRng(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x1_0000_0000
  }
}

describe("Shrinkage property: observed n ↑ ⇒ posterior CI width ↓", () => {
  it("holds across 100 random (alpha, beta, p) configurations", () => {
    const rng = makeRng(42)
    let failures = 0
    for (let trial = 0; trial < 100; trial++) {
      const alpha = 1 + Math.floor(rng() * 100)        // 1..100
      const beta = 1 + Math.floor(rng() * 100)         // 1..100
      const p = 0.05 + rng() * 0.9                      // 0.05..0.95

      const small_n = 100
      const large_n = 10_000
      const small_k = Math.round(small_n * p)
      const large_k = Math.round(large_n * p)

      const small = betaBinomialModel.posterior(
        { alpha, beta },
        { n: small_n, k: small_k },
      )
      const large = betaBinomialModel.posterior(
        { alpha, beta },
        { n: large_n, k: large_k },
      )

      const small_w = small.ci_high - small.ci_low
      const large_w = large.ci_high - large.ci_low
      if (large_w >= small_w) failures++
    }
    expect(failures).toBe(0)
  })
})
```

- [ ] **Step 2: Run test**

```bash
npx vitest run src/shared/lib/bayesian-stats/__tests__/shrinkage.test.ts
```

Expected: 1 test PASS.

- [ ] **Step 3: Commit**

```bash
git add src/shared/lib/bayesian-stats/__tests__/shrinkage.test.ts
git commit -m "test(bayes): add shrinkage property test (100 trials, deterministic seed)"
```

---

## Task 14: Barrel export

**Files:**
- Create: `src/shared/lib/bayesian-stats/index.ts`

- [ ] **Step 1: Write barrel**

```typescript
// src/shared/lib/bayesian-stats/index.ts
export { ENGINE_VERSION } from "./version"
export * from "./types"
export { betaBinomialModel } from "./beta-binomial"
export { lognormalModel } from "./lognormal"
export {
  ESS_RETENTION_CAP,
  ESS_REVENUE,
  PRIOR_ESS_FLOOR,
  MIN_COHORT_INSTALLS,
  MIN_REVENUE_MONTHS,
} from "./effective-sample-size"
export {
  validateRetentionPosterior,
  validateRevenuePosterior,
  validatePrior,
} from "./validity"
export { METRIC_REGISTRY } from "./metric-registry"
export { buildRows } from "./build-rows"
export type { PosteriorRow } from "./build-rows"
```

- [ ] **Step 2: TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/lib/bayesian-stats/index.ts
git commit -m "feat(bayes): add barrel export for bayesian-stats module"
```

---

## Task 15: Full test suite + PR readiness

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all bayesian-stats tests pass + existing yieldo tests untouched. Total ≥ 24 new tests added.

- [ ] **Step 2: Type check entire yieldo project**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: 0 errors. (Warnings acceptable but fix any in new files.)

- [ ] **Step 4: Verify file inventory matches plan**

```bash
ls src/shared/lib/bayesian-stats/
ls src/shared/lib/bayesian-stats/__tests__/
ls src/shared/data/genre-priors.json
```

Expected output:
```
build-rows.ts    effective-sample-size.ts  lognormal.ts        types.ts
beta-binomial.ts beta-quantile.ts          metric-registry.ts  validity.ts
index.ts         version.ts                __tests__/

beta-binomial.test.ts  beta-quantile.test.ts  e2e.test.ts
lognormal.test.ts      shrinkage.test.ts      validity.test.ts

src/shared/data/genre-priors.json
```

- [ ] **Step 5: Push branch and open PR**

```bash
git push -u origin feature/d-bayesian-pr1-engine
gh pr create --title "feat(d-bayesian): PR1 engine core (TS pure conjugate, 4 metrics, full tests)" \
  --body "$(cat <<'EOF'
## Summary
- Pure TS Bayesian engine at `src/shared/lib/bayesian-stats/`
- Beta-Binomial conjugate (retention) + LogNormal MoM (revenue)
- METRIC_REGISTRY with 4 entries (d1/d7/d30 + monthly_revenue_usd)
- Validity gate (insufficient_installs / insufficient_history / prior_ess_too_low / engine_version_mismatch)
- Genre priors seed (GameAnalytics 2024 benchmark)
- ENGINE_VERSION = "1.0.0"

## Spec
`yieldo/docs/superpowers/specs/2026-04-29-bayesian-stats-engine-yieldo-design.md` (commit 185e76a)

## Test plan
- [x] `npm test` — full vitest suite green (24+ new tests)
- [x] `npx tsc --noEmit` — 0 type errors
- [x] `npm run lint` — 0 errors
- [x] Beta quantile values match R `qbeta()` to 1e-3 tolerance
- [x] Shrinkage property test (100 trials, deterministic)
- [x] Registry e2e: 4 metrics × valid + invalid branches

## Out of scope (next PRs)
- PR2: AppsFlyer integration + Snapshot v2 + API route
- PR3: Seed snapshot prebuild
- PR4: market-gap page wiring + Methodology Modal + i18n

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

---

## PR2 — AppsFlyer Integration + Snapshot v2 (next plan)

**To be written as separate plan after PR1 lands.** High-level task list:

1. Worktree + branch `feature/d-bayesian-pr2-appsflyer-integration`
2. Create `src/shared/api/posterior/snapshot-v2.ts` with `PosteriorSnapshotSchema` (extends existing `SnapshotSchema`)
3. Create `src/shared/api/posterior/compute-posterior.ts` — calls `buildRows()` from PR1, wraps in v2 envelope
4. Modify `src/shared/api/appsflyer/orchestrator.ts:runAppsFlyerSync` — add `computePosterior()` step at end (preserve existing v1 path for backward compat)
5. Create `src/app/api/posterior/[appId]/route.ts` — GET handler, fetches Vercel Blob, returns parsed v2 snapshot
6. Tests: orchestrator integration + route handler + snapshot v2 zod parse
7. Manual smoke test against existing dev token (yieldo CLAUDE.md §8.4.1)

**Estimated tasks:** ~8.

---

## PR3 — Seed Snapshot Prebuild (next plan)

**To be written as separate plan after PR2 lands.** High-level task list:

1. Worktree + branch `feature/d-bayesian-pr3-seed-snapshot`
2. Create `scripts/build-seed-snapshot.ts` — load `mockPriorPosterior` fixture, transform to `CohortSummaryShape`, run engine, write JSON
3. Create `scripts/verify-seed-snapshot.ts` — re-run prebuild, fail if git diff non-empty
4. Add `prebuild` + `verify-seed` to `package.json` scripts
5. Run prebuild → commit `src/shared/data/seed-posterior.json`
6. Add `verify-seed` to CI gate (Vercel build hook)
7. Verify Vercel preview build still passes

**Estimated tasks:** ~6.

---

## PR4 — Market-Gap Page + Methodology Modal + i18n (next plan)

**To be written as separate plan after PR3 lands.** High-level task list:

1. Worktree + branch `feature/d-bayesian-pr4-market-gap-wiring`
2. Create `src/shared/api/posterior/use-live-posterior.ts` (TanStack Query v5 hook, demo→seed JSON / live→API route)
3. Modify `src/widgets/charts/PriorPosteriorChart.tsx` — accept `PosteriorSnapshot` props (instead of mock shape)
4. Create `src/widgets/methodology/MethodologyModal.tsx` — engineVersion / sampleSize / ESS / prior params (L2 surface)
5. Modify `src/app/(dashboard)/dashboard/market-gap/page.tsx` — replace `mockPriorPosterior` import with `useLivePosterior(appId)`
6. Add i18n keys to `src/shared/i18n/dictionary.ts` (per spec §5.3) — invoke transcendent-translation skill for non-Korean locales
7. Validity gate UI: "보류" 배지 + 4 reason variants
8. Vercel preview screenshot check vs Toss DPS reference (memory `feedback_design`)

**Estimated tasks:** ~10.

---

## Self-Review

**Spec coverage check** (against `2026-04-29-bayesian-stats-engine-yieldo-design.md`):

| Spec section | PR | Tasks |
|---|---|---|
| §1 목적과 배경 | (informational) | — |
| §2 시스템 경계와 데이터 흐름 | PR2 | (data flow wiring) |
| §3 Bayesian Engine Core | **PR1** | 2-14 |
| §4 Snapshot v2 Schema | PR2 | (next plan) |
| §5 Validity Gate UI | PR4 | (next plan) |
| §6 Seed Snapshot Prebuild | PR3 | (next plan) |
| §7 AppsFlyer 통합 | PR2 | (next plan) |
| §8 Market-Gap 페이지 와이어링 | PR4 | (next plan) |
| §9 Testing Strategy | **PR1** | 6, 7, 8, 12, 13, 15 |
| §10 PR 분할 | (informational) | — |
| §11 Out of Scope | (informational) | — |
| §13 Engine Version 운영 규약 | PR3 | (next plan, verify-seed gate) |

**PR1 spec coverage**: §3 (모듈 구성, 공통 타입, Beta-Binomial, LogNormal, ESS, Validity, METRIC_REGISTRY) + §9 (Unit, Integration, Property tests). ✅

**Placeholder scan**: searched for "TBD", "TODO", "fill in", "similar to" — none found in PR1 tasks. ✅

**Type consistency**: `BetaPrior`, `LogNormalPrior`, `GenrePriorRecord`, `CohortSummaryShape`, `Validity`, `MetricDefinition` defined in Task 3 and used consistently in Tasks 6, 7, 10, 11, 12. `betaBinomialModel.posterior(prior, obs)` signature consistent across files. ✅

**Engine version**: `ENGINE_VERSION = "1.0.0"` defined in Task 2, exported from barrel in Task 14. PR3 will check this for seed snapshot freshness. ✅

---

**End of PR1 plan.**
