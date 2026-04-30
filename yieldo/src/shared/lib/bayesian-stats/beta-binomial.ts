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
