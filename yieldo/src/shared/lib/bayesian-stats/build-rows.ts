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
