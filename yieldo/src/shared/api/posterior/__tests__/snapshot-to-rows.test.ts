import { describe, expect, it } from "vitest"
import { snapshotToRows } from "../snapshot-to-rows"
import seedPosterior from "@/shared/data/seed-posterior.json"
import type { PosteriorSnapshot } from "../snapshot-v2"

describe("snapshotToRows", () => {
  it("produces 4 rows from seed snapshot", () => {
    const rows = snapshotToRows(seedPosterior as unknown as PosteriorSnapshot)
    expect(rows).toHaveLength(4)
    expect(rows.map(r => r.metricId).sort()).toEqual([
      "monthly_revenue_usd",
      "retention_d1",
      "retention_d30",
      "retention_d7",
    ])
  })

  it("each retention row has prior + posterior CI", () => {
    const rows = snapshotToRows(seedPosterior as unknown as PosteriorSnapshot)
    const d1 = rows.find(r => r.metricId === "retention_d1")!
    expect(d1.prior.mean).toBeGreaterThan(0)
    expect(d1.prior.ci_low).toBeLessThan(d1.prior.mean)
    expect(d1.prior.ci_high).toBeGreaterThan(d1.prior.mean)
    expect(d1.posterior.mean).toBeGreaterThan(0)
  })

  it("monthly_revenue_usd row has lognormal-derived prior CI", () => {
    const rows = snapshotToRows(seedPosterior as unknown as PosteriorSnapshot)
    const rev = rows.find(r => r.metricId === "monthly_revenue_usd")!
    expect(rev.prior.mean).toBeGreaterThan(50_000)
    expect(rev.prior.mean).toBeLessThan(500_000)
    expect(rev.posterior.mean).toBeGreaterThan(0)
  })

  it("attaches validity flag from snapshot", () => {
    const rows = snapshotToRows(seedPosterior as unknown as PosteriorSnapshot)
    rows.forEach(r => {
      expect(r.validity.valid).toBe(true)
    })
  })

  it("handles invalid metric (insufficient_installs)", () => {
    const fakeSnapshot = {
      ...seedPosterior,
      metadata: {
        ...(seedPosterior as PosteriorSnapshot).metadata,
        validity: {
          ...(seedPosterior as PosteriorSnapshot).metadata.validity,
          retention_d1: { valid: false, reason: "insufficient_installs", detail: "n=500" },
        },
      },
    } as unknown as PosteriorSnapshot
    const rows = snapshotToRows(fakeSnapshot)
    const d1 = rows.find(r => r.metricId === "retention_d1")!
    expect(d1.validity.valid).toBe(false)
    if (!d1.validity.valid) {
      expect(d1.validity.reason).toBe("insufficient_installs")
    }
  })
})
