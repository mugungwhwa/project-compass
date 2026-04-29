import { describe, expect, it } from "vitest"
import { betaQuantile } from "../beta-quantile"

describe("betaQuantile", () => {
  // Reference values from R: qbeta(p, alpha, beta)
  it("matches qbeta(0.025, 2, 3) ≈ 0.06755", () => {
    expect(betaQuantile(0.025, 2, 3)).toBeCloseTo(0.06755, 3)
  })

  it("matches qbeta(0.975, 2, 3) ≈ 0.80604", () => {
    expect(betaQuantile(0.975, 2, 3)).toBeCloseTo(0.80604, 3)
  })

  it("matches qbeta(0.5, 100, 100) ≈ 0.5 (symmetric)", () => {
    expect(betaQuantile(0.5, 100, 100)).toBeCloseTo(0.5, 3)
  })

  it("matches qbeta(0.025, 50, 950) ≈ 0.03725", () => {
    expect(betaQuantile(0.025, 50, 950)).toBeCloseTo(0.03725, 3)
  })

  it("matches qbeta(0.975, 50, 950) ≈ 0.06433", () => {
    expect(betaQuantile(0.975, 50, 950)).toBeCloseTo(0.06433, 3)
  })

  it("returns 0 at p=0", () => {
    expect(betaQuantile(0, 2, 3)).toBe(0)
  })

  it("returns 1 at p=1", () => {
    expect(betaQuantile(1, 2, 3)).toBe(1)
  })
})
