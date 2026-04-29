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
