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
