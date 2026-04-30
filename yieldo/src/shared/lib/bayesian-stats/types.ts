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
