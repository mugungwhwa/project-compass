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
