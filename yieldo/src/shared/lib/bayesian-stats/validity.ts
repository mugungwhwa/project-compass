// src/shared/lib/bayesian-stats/validity.ts
//
// Validity gates for Bayesian posteriors. Each validator enforces the minimum
// data sufficiency thresholds defined in spec §3.5 (effective-sample-size.ts).
//
// A posterior is only reportable when:
//   - Cohort retention has ≥ MIN_COHORT_INSTALLS users AND ≥ day-of-interest age
//   - Revenue series has ≥ MIN_REVENUE_MONTHS months of history
//   - Prior has ≥ PRIOR_ESS_FLOOR effective sample size to anchor inference
//
// These gates protect against false-precision posteriors when input evidence
// is too thin to justify the credible interval.

import {
  MIN_COHORT_INSTALLS,
  MIN_REVENUE_MONTHS,
  PRIOR_ESS_FLOOR,
} from "./effective-sample-size"
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
