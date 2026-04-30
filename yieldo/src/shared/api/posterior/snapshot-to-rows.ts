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
      priorCI = posteriorCI
    }
    return { metricId, prior: priorCI, posterior: posteriorCI, validity }
  })
}
