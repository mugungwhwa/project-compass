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
