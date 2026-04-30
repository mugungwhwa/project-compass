import { describe, it, expect } from "vitest"
import { deriveFinancialHealth } from "@/shared/api/financial-derived"
import type { FinancialInput } from "@/shared/api/financial-input"

const seed: FinancialInput = {
  monthlyRevenue: 50_000_000,
  uaSpend: 20_000_000,
  cashBalance: 500_000_000,
  monthlyBurn: 30_000_000,
  targetPaybackMonths: 12,
  savedAt: new Date().toISOString(),
}

describe("deriveFinancialHealth", () => {
  it("converts seed input to expected USD K values", () => {
    const out = deriveFinancialHealth(seed)
    expect(out.kpis.netBurn).toBe(0)
    expect(out.netRunway.value).toBe(18)
    expect(out.burnTolerance.value).toBe(12)
    expect(out.paybackDay).toBe(360)
  })

  it("computes negative netBurn when burning cash", () => {
    const burning: FinancialInput = { ...seed, monthlyRevenue: 0, monthlyBurn: 30_000_000, uaSpend: 20_000_000 }
    const out = deriveFinancialHealth(burning)
    expect(out.kpis.netBurn).toBeLessThan(0)
    expect(out.kpis.netBurn).toBe(-38)
  })

  it("caps runway at MAX_RUNWAY_MONTHS when net positive (no burn)", () => {
    const profitable: FinancialInput = { ...seed, monthlyRevenue: 100_000_000, monthlyBurn: 10_000_000, uaSpend: 10_000_000 }
    const out = deriveFinancialHealth(profitable)
    expect(out.netRunway.value).toBe(18)
    expect(out.netRunway.max).toBe(18)
  })

  it("returns 0 for revPerSpend when uaSpend is 0", () => {
    const noUa: FinancialInput = { ...seed, uaSpend: 0 }
    const out = deriveFinancialHealth(noUa)
    expect(out.kpis.revPerSpend).toBe(0)
  })

  it("color-codes burnTolerance: green ≥12, amber 6-11.9, red <6", () => {
    const longRunway: FinancialInput = { ...seed, cashBalance: 1_000_000_000, monthlyBurn: 10_000_000, uaSpend: 0, monthlyRevenue: 0, targetPaybackMonths: 18 }
    expect(deriveFinancialHealth(longRunway).burnTolerance.color).toBe("#16A34A")

    const mediumRunway: FinancialInput = { ...seed, cashBalance: 100_000_000, monthlyBurn: 20_000_000, uaSpend: 0, monthlyRevenue: 0, targetPaybackMonths: 8 }
    expect(deriveFinancialHealth(mediumRunway).burnTolerance.color).toBe("#D97706")

    const shortRunway: FinancialInput = { ...seed, cashBalance: 50_000_000, monthlyBurn: 30_000_000, uaSpend: 0, monthlyRevenue: 0, targetPaybackMonths: 3 }
    expect(deriveFinancialHealth(shortRunway).burnTolerance.color).toBe("#DC2626")
  })

  it("paybackDay equals targetPaybackMonths * 30", () => {
    expect(deriveFinancialHealth({ ...seed, targetPaybackMonths: 1 }).paybackDay).toBe(30)
    expect(deriveFinancialHealth({ ...seed, targetPaybackMonths: 60 }).paybackDay).toBe(1800)
  })

  it("handles 1 trillion KRW without overflow", () => {
    const huge: FinancialInput = { ...seed, monthlyRevenue: 1e12, cashBalance: 1e12 }
    const out = deriveFinancialHealth(huge)
    expect(Number.isFinite(out.kpis.capEfficiency)).toBe(true)
    expect(Number.isFinite(out.netRunway.value)).toBe(true)
  })
})
