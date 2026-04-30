import { describe, expect, it } from "vitest"
import { PosteriorSnapshotSchema } from "../snapshot-v2"

const baseSnapshot = {
  cohortSummary: {
    updatedAt: "2026-04-29T00:00:00.000Z",
    cohorts: [
      {
        cohortDate: "2026-03-15",
        installs: 5000,
        retainedByDay: { d1: 1100, d7: 200, d30: 40 },
        uaSpendUsd: 1500,
      },
    ],
    revenue: {
      daily: [
        { date: "2026-03-15", sumUsd: 1234.56, purchasers: 12 },
      ],
      total: { sumUsd: 1234.56, purchasers: 12 },
    },
    spend: { totalUsd: 1500, homeCurrency: "USD" },
  },
  posterior: {
    retention_d1: { mean: 0.22, ci_low: 0.20, ci_high: 0.24, sampleSize: 13_000 },
    retention_d7: { mean: 0.04, ci_low: 0.035, ci_high: 0.045, sampleSize: 13_000 },
    retention_d30: { mean: 0.008, ci_low: 0.006, ci_high: 0.010, sampleSize: 13_000 },
    monthly_revenue_usd: { mean: 100_000, ci_low: 80_000, ci_high: 130_000, sampleSize: 7 },
  },
  metadata: {
    engineVersion: "1.0.0",
    priorVersion: "genre-priors-2026-04-29",
    genreUsed: "portfolio",
    validity: {
      retention_d1: { valid: true },
      retention_d7: { valid: true },
      retention_d30: { valid: true },
      monthly_revenue_usd: { valid: true },
    },
  },
}

describe("PosteriorSnapshotSchema", () => {
  it("parses a fully valid snapshot", () => {
    const parsed = PosteriorSnapshotSchema.parse(baseSnapshot)
    expect(parsed.metadata.engineVersion).toBe("1.0.0")
    expect(parsed.metadata.genreUsed).toBe("portfolio")
    expect(parsed.posterior.retention_d1.mean).toBeCloseTo(0.22)
  })

  it("accepts invalid validity discriminator (valid:false with reason)", () => {
    const withInvalid = {
      ...baseSnapshot,
      posterior: {
        ...baseSnapshot.posterior,
        retention_d30: { mean: 0, ci_low: 0, ci_high: 0, sampleSize: 0 },
      },
      metadata: {
        ...baseSnapshot.metadata,
        validity: {
          ...baseSnapshot.metadata.validity,
          retention_d30: { valid: false, reason: "insufficient_history", detail: "age=10d, need 30d" },
        },
      },
    }
    expect(() => PosteriorSnapshotSchema.parse(withInvalid)).not.toThrow()
  })

  it("rejects validity with unknown reason string", () => {
    const bad = {
      ...baseSnapshot,
      metadata: {
        ...baseSnapshot.metadata,
        validity: {
          ...baseSnapshot.metadata.validity,
          retention_d1: { valid: false, reason: "bogus_reason" },
        },
      },
    }
    expect(() => PosteriorSnapshotSchema.parse(bad)).toThrow()
  })

  it("rejects when cohortSummary is missing", () => {
    const { cohortSummary: _, ...withoutCohort } = baseSnapshot
    expect(() => PosteriorSnapshotSchema.parse(withoutCohort)).toThrow()
  })

  it("rejects when engineVersion is missing", () => {
    const bad = { ...baseSnapshot, metadata: { ...baseSnapshot.metadata, engineVersion: undefined } }
    expect(() => PosteriorSnapshotSchema.parse(bad)).toThrow()
  })
})
