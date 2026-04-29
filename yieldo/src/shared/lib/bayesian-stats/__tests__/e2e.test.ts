// src/shared/lib/bayesian-stats/__tests__/e2e.test.ts
import { describe, expect, it } from "vitest"
import { buildRows } from "../build-rows"
import { METRIC_REGISTRY } from "../metric-registry"
import genrePriorsRaw from "@/shared/data/genre-priors.json"
import type { CohortSummaryShape, GenrePriorRecord } from "../types"

const portfolioPrior = {
  ...genrePriorsRaw.genres.portfolio,
  essRetention: genrePriorsRaw.essRetention,
} as GenrePriorRecord

function makeCohort(daysAgo: number, installs: number, d1Pct = 0.22, d7Pct = 0.04, d30Pct = 0.008) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return {
    cohortDate: date.toISOString().slice(0, 10),
    installs,
    retainedByDay: {
      d1: Math.round(installs * d1Pct),
      d7: daysAgo >= 7 ? Math.round(installs * d7Pct) : null,
      d30: daysAgo >= 30 ? Math.round(installs * d30Pct) : null,
    },
  }
}

describe("buildRows (Registry e2e)", () => {
  it("produces 4 rows (d1/d7/d30 + monthly_revenue)", () => {
    const summary: CohortSummaryShape = {
      cohorts: [makeCohort(45, 5000)],
      revenue: {
        daily: [
          { date: "2026-01-15", sumUsd: 50_000, purchasers: 100 },
          { date: "2026-02-15", sumUsd: 60_000, purchasers: 120 },
          { date: "2026-03-15", sumUsd: 70_000, purchasers: 140 },
        ],
      },
    }
    const rows = buildRows(summary, portfolioPrior)
    expect(rows).toHaveLength(4)
    expect(rows.map((r) => r.metricId).sort()).toEqual([
      "monthly_revenue_usd",
      "retention_d1",
      "retention_d30",
      "retention_d7",
    ])
  })

  it("returns valid CI for sufficient cohort", () => {
    const summary: CohortSummaryShape = {
      cohorts: [makeCohort(45, 5000)],
      revenue: {
        daily: [
          { date: "2026-01-15", sumUsd: 50_000, purchasers: 100 },
          { date: "2026-02-15", sumUsd: 60_000, purchasers: 120 },
          { date: "2026-03-15", sumUsd: 70_000, purchasers: 140 },
        ],
      },
    }
    const rows = buildRows(summary, portfolioPrior)
    const d1 = rows.find((r) => r.metricId === "retention_d1")!
    expect("invalid" in d1.result && d1.result.invalid).toBe(false)
    if (!("invalid" in d1.result) || !d1.result.invalid) {
      expect(d1.result.mean).toBeGreaterThan(0.15)
      expect(d1.result.mean).toBeLessThan(0.30)
    }
  })

  it("returns insufficient_installs when n < 1000", () => {
    const summary: CohortSummaryShape = {
      cohorts: [makeCohort(45, 500)],
      revenue: { daily: [] },
    }
    const rows = buildRows(summary, portfolioPrior)
    const d1 = rows.find((r) => r.metricId === "retention_d1")!
    expect(d1.result).toEqual({
      invalid: true,
      validity: { valid: false, reason: "insufficient_installs", detail: "n=500" },
    })
  })

  it("returns insufficient_history for d30 when cohort age < 30", () => {
    const summary: CohortSummaryShape = {
      cohorts: [makeCohort(10, 5000)],
      revenue: { daily: [] },
    }
    const rows = buildRows(summary, portfolioPrior)
    const d30 = rows.find((r) => r.metricId === "retention_d30")!
    expect(d30.result).toMatchObject({
      invalid: true,
      validity: { valid: false, reason: "insufficient_history" },
    })
  })

  it("METRIC_REGISTRY has exactly 4 entries", () => {
    expect(Object.keys(METRIC_REGISTRY)).toHaveLength(4)
  })
})
