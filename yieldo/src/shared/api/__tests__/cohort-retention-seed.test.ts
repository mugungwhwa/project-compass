import { describe, it, expect } from "vitest"
import {
  generateCohortRetention,
  PERSONA_RETENTION_PROFILES,
  type CohortRetentionSeedInput,
} from "@/shared/api/cohort-retention-seed"

const baseInput: CohortRetentionSeedInput = {
  personaId: "A",
  gameId: "game-001",
  cohortStartDate: new Date("2026-04-01T00:00:00Z"),
  cohortSize: 10_000,
  observationDays: 30,
  genre: "puzzle",
}

describe("generateCohortRetention — output shape", () => {
  it("produces observationDays + 1 points (Day 0 through Day N)", () => {
    const points = generateCohortRetention(baseInput)
    expect(points).toHaveLength(31)
    expect(points[0].dayN).toBe(0)
    expect(points[30].dayN).toBe(30)
  })

  it("Day 0 retention is 1.0 with full cohort active", () => {
    const points = generateCohortRetention(baseInput)
    expect(points[0].retentionRate).toBe(1)
    expect(points[0].activeUsers).toBe(10_000)
  })

  it("activeUsers = round(cohortSize * retentionRate)", () => {
    const points = generateCohortRetention(baseInput)
    points.forEach((p) => {
      expect(p.activeUsers).toBe(Math.round(baseInput.cohortSize * p.retentionRate))
    })
  })

  it("each retentionRate is in [0, 1]", () => {
    const points = generateCohortRetention(baseInput)
    points.forEach((p) => {
      expect(p.retentionRate).toBeGreaterThanOrEqual(0)
      expect(p.retentionRate).toBeLessThanOrEqual(1)
    })
  })
})

describe("generateCohortRetention — five retention properties", () => {
  const points = generateCohortRetention(baseInput)

  it("P1 monotonic non-increase: R(d+1) <= R(d)", () => {
    for (let i = 1; i < points.length; i++) {
      expect(points[i].retentionRate).toBeLessThanOrEqual(points[i - 1].retentionRate)
    }
  })

  it("P3 temporal decrease: late retention < early retention", () => {
    expect(points[points.length - 1].retentionRate).toBeLessThan(points[1].retentionRate)
  })

  it("P4 decelerating decline: |slope| at end <= |slope| at start", () => {
    const earlySlope = Math.abs(points[2].retentionRate - points[1].retentionRate)
    const lateSlope = Math.abs(points[29].retentionRate - points[28].retentionRate)
    expect(lateSlope).toBeLessThanOrEqual(earlySlope)
  })

  it("P5 asymptotic stabilization: last 5 days within 1pp of each other", () => {
    const tail = points.slice(-5).map((p) => p.retentionRate)
    const range = Math.max(...tail) - Math.min(...tail)
    expect(range).toBeLessThan(0.01)
  })
})

describe("generateCohortRetention — determinism", () => {
  it("same input produces identical output", () => {
    const a = generateCohortRetention(baseInput)
    const b = generateCohortRetention(baseInput)
    expect(a).toEqual(b)
  })

  it("different gameId produces different output (jitter varies)", () => {
    const a = generateCohortRetention(baseInput)
    const b = generateCohortRetention({ ...baseInput, gameId: "game-002" })
    const aRates = a.map((p) => p.retentionRate)
    const bRates = b.map((p) => p.retentionRate)
    expect(aRates).not.toEqual(bRates)
  })

  it("different personaId produces materially different curve", () => {
    const a = generateCohortRetention(baseInput)
    const c = generateCohortRetention({ ...baseInput, personaId: "C" })
    expect(c[7].retentionRate).toBeLessThan(a[7].retentionRate)
  })
})

describe("PERSONA_RETENTION_PROFILES — spec ranges", () => {
  it("Persona A targets D1≈0.38, D7≈0.14 (Anchor Puzzle)", () => {
    const p = generateCohortRetention({ ...baseInput, personaId: "A" })
    expect(p[1].retentionRate).toBeCloseTo(0.38, 1)
    expect(p[7].retentionRate).toBeCloseTo(0.14, 1)
  })

  it("Persona B targets D1≈0.42, D7≈0.18 (Soft-launch Saga)", () => {
    const p = generateCohortRetention({ ...baseInput, personaId: "B" })
    expect(p[1].retentionRate).toBeCloseTo(0.42, 1)
    expect(p[7].retentionRate).toBeCloseTo(0.18, 1)
  })

  it("Persona C targets D1≈0.25, D7≈0.08 (Declining Veteran)", () => {
    const p = generateCohortRetention({ ...baseInput, personaId: "C" })
    expect(p[1].retentionRate).toBeCloseTo(0.25, 1)
    expect(p[7].retentionRate).toBeCloseTo(0.08, 1)
  })

  it("exposes profile constants for all 3 personas", () => {
    expect(PERSONA_RETENTION_PROFILES.A).toBeDefined()
    expect(PERSONA_RETENTION_PROFILES.B).toBeDefined()
    expect(PERSONA_RETENTION_PROFILES.C).toBeDefined()
  })
})

describe("generateCohortRetention — cohortDate progression", () => {
  it("each point's cohortDate is cohortStartDate + dayN days", () => {
    const points = generateCohortRetention(baseInput)
    const startMs = baseInput.cohortStartDate.getTime()
    const dayMs = 24 * 60 * 60 * 1000
    points.forEach((p) => {
      expect(p.cohortDate.getTime()).toBe(startMs + p.dayN * dayMs)
    })
  })
})
