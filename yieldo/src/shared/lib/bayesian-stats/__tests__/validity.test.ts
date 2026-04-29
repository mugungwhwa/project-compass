import { describe, expect, it } from "vitest"
import {
  validateRetentionPosterior,
  validateRevenuePosterior,
  validatePrior,
} from "../validity"

describe("validateRetentionPosterior", () => {
  it("rejects when n < 1000", () => {
    const v = validateRetentionPosterior({ n: 500, cohortAgeDays: 30 }, 1)
    expect(v).toEqual({
      valid: false,
      reason: "insufficient_installs",
      detail: "n=500",
    })
  })

  it("rejects when cohortAgeDays < day", () => {
    const v = validateRetentionPosterior({ n: 5000, cohortAgeDays: 10 }, 30)
    expect(v).toEqual({
      valid: false,
      reason: "insufficient_history",
      detail: "age=10d, need 30d",
    })
  })

  it("accepts when both thresholds met", () => {
    const v = validateRetentionPosterior({ n: 5000, cohortAgeDays: 35 }, 30)
    expect(v).toEqual({ valid: true })
  })

  it("D1 only requires 1 day age", () => {
    const v = validateRetentionPosterior({ n: 5000, cohortAgeDays: 1 }, 1)
    expect(v).toEqual({ valid: true })
  })
})

describe("validateRevenuePosterior", () => {
  it("rejects when fewer than 3 months", () => {
    const v = validateRevenuePosterior({ monthlyValues: [100, 200] })
    expect(v).toEqual({
      valid: false,
      reason: "insufficient_history",
      detail: "2 months",
    })
  })

  it("accepts at exactly 3 months", () => {
    const v = validateRevenuePosterior({ monthlyValues: [100, 200, 300] })
    expect(v).toEqual({ valid: true })
  })
})

describe("validatePrior", () => {
  it("rejects when essRetention < 5000", () => {
    const v = validatePrior({ essRetention: 3000 } as Parameters<typeof validatePrior>[0])
    expect(v).toEqual({
      valid: false,
      reason: "prior_ess_too_low",
      detail: "ESS=3000",
    })
  })

  it("accepts when essRetention >= 5000", () => {
    const v = validatePrior({ essRetention: 8000 } as Parameters<typeof validatePrior>[0])
    expect(v).toEqual({ valid: true })
  })
})
