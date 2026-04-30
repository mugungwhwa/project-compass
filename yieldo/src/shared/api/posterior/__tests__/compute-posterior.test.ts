import { describe, expect, it } from "vitest"
import { computePosterior } from "../compute-posterior"
import type { CohortSummary } from "@/shared/api/appsflyer/types"

function makeFixtureSummary(): CohortSummary {
  // Cohort old enough that all of d1/d7/d30 are measurable; installs > MIN_COHORT_INSTALLS (1000).
  const cohortDate = new Date()
  cohortDate.setDate(cohortDate.getDate() - 45)
  return {
    updatedAt: new Date().toISOString(),
    cohorts: [
      {
        cohortDate: cohortDate.toISOString().slice(0, 10),
        installs: 5000,
        retainedByDay: { d1: 1100, d7: 200, d30: 40 },
        uaSpendUsd: 1500,
      },
    ],
    revenue: {
      daily: [
        { date: "2026-01-15", sumUsd: 50_000, purchasers: 100 },
        { date: "2026-02-15", sumUsd: 60_000, purchasers: 120 },
        { date: "2026-03-15", sumUsd: 70_000, purchasers: 140 },
      ],
      total: { sumUsd: 180_000, purchasers: 360 },
    },
    spend: { totalUsd: 1500, homeCurrency: "USD" },
  }
}

describe("computePosterior", () => {
  it("returns 4 posterior entries when all metrics valid", () => {
    const result = computePosterior(makeFixtureSummary(), "match-3")
    expect(Object.keys(result.posterior).sort()).toEqual([
      "monthly_revenue_usd",
      "retention_d1",
      "retention_d30",
      "retention_d7",
    ])
  })

  it("falls back to portfolio when genre is undefined", () => {
    const result = computePosterior(makeFixtureSummary(), undefined)
    expect(result.metadata.genreUsed).toBe("portfolio")
  })

  it("falls back to portfolio when genre is unknown", () => {
    const result = computePosterior(makeFixtureSummary(), "unknown-genre")
    expect(result.metadata.genreUsed).toBe("portfolio")
  })

  it("uses requested genre when present", () => {
    const result = computePosterior(makeFixtureSummary(), "match-3")
    expect(result.metadata.genreUsed).toBe("match-3")
  })

  it("records engineVersion and priorVersion", () => {
    const result = computePosterior(makeFixtureSummary(), "portfolio")
    expect(result.metadata.engineVersion).toBe("1.0.0")
    expect(result.metadata.priorVersion).toBe("genre-priors-2026-04-29")
  })

  it("marks insufficient_installs validity when n < 1000", () => {
    const tooSmall = makeFixtureSummary()
    tooSmall.cohorts[0].installs = 500
    tooSmall.cohorts[0].retainedByDay = { d1: 110, d7: 20, d30: 4 }
    const result = computePosterior(tooSmall, "portfolio")
    expect(result.metadata.validity.retention_d1).toEqual({
      valid: false,
      reason: "insufficient_installs",
      detail: "n=500",
    })
  })

  it("marks insufficient_history for d30 when cohort age < 30", () => {
    const newCohort = makeFixtureSummary()
    const recent = new Date()
    recent.setDate(recent.getDate() - 10)
    newCohort.cohorts[0].cohortDate = recent.toISOString().slice(0, 10)
    newCohort.cohorts[0].retainedByDay = { d1: 1100, d7: 200, d30: null }
    const result = computePosterior(newCohort, "portfolio")
    expect(result.metadata.validity.retention_d30).toMatchObject({
      valid: false,
      reason: "insufficient_history",
    })
  })

  it("output passes PosteriorSnapshotSchema parse", async () => {
    const { PosteriorSnapshotSchema } = await import("../snapshot-v2")
    const result = computePosterior(makeFixtureSummary(), "portfolio")
    expect(() => PosteriorSnapshotSchema.parse(result)).not.toThrow()
  })
})
