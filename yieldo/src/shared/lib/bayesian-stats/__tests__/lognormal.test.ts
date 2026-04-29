import { describe, expect, it } from "vitest"
import { lognormalModel } from "../lognormal"

describe("lognormalModel", () => {
  it("converges to MLE when observed n >> ESS_REVENUE", () => {
    const prior = { mu0: Math.log(100_000), sigma0: 0.5 }
    // 1000 months of $1M revenue (constant) — MLE should dominate
    const obs = { monthlyValues: Array(1000).fill(1_000_000) }
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
