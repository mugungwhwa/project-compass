import { describe, it, expect, beforeEach } from "vitest"
import {
  DEMO_SEED,
  applyDemoSeed,
  resetDemoSeed,
} from "@/shared/api/financial-input-seed"
import { loadFinancialInput } from "@/shared/api/financial-input"

describe("DEMO_SEED constant", () => {
  it("has the 5 spec values", () => {
    expect(DEMO_SEED).toEqual({
      monthlyRevenue: 50_000_000,
      uaSpend: 20_000_000,
      cashBalance: 500_000_000,
      monthlyBurn: 30_000_000,
      targetPaybackMonths: 12,
    })
  })
})

describe("applyDemoSeed / resetDemoSeed", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("applyDemoSeed → loadFinancialInput returns DEMO_SEED + savedAt", () => {
    applyDemoSeed()
    const loaded = loadFinancialInput()
    expect(loaded).not.toBeNull()
    expect(loaded?.monthlyRevenue).toBe(DEMO_SEED.monthlyRevenue)
    expect(loaded?.uaSpend).toBe(DEMO_SEED.uaSpend)
    expect(loaded?.cashBalance).toBe(DEMO_SEED.cashBalance)
    expect(loaded?.monthlyBurn).toBe(DEMO_SEED.monthlyBurn)
    expect(loaded?.targetPaybackMonths).toBe(DEMO_SEED.targetPaybackMonths)
    expect(typeof loaded?.savedAt).toBe("string")
  })

  it("resetDemoSeed clears stored input", () => {
    applyDemoSeed()
    expect(loadFinancialInput()).not.toBeNull()
    resetDemoSeed()
    expect(loadFinancialInput()).toBeNull()
  })
})
