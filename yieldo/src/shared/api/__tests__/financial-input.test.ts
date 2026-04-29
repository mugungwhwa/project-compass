import { describe, it, expect, beforeEach } from "vitest"
import {
  FinancialInputSchema,
  FINANCIAL_INPUT_KEY,
  loadFinancialInput,
  saveFinancialInput,
  clearFinancialInput,
} from "@/shared/api/financial-input"

describe("FinancialInputSchema", () => {
  it("accepts valid input", () => {
    const result = FinancialInputSchema.safeParse({
      monthlyRevenue: 50_000_000,
      uaSpend: 20_000_000,
      cashBalance: 500_000_000,
      monthlyBurn: 30_000_000,
      targetPaybackMonths: 12,
      savedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })

  it("rejects negative numbers", () => {
    const result = FinancialInputSchema.safeParse({
      monthlyRevenue: -1,
      uaSpend: 0,
      cashBalance: 0,
      monthlyBurn: 0,
      targetPaybackMonths: 1,
      savedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it("rejects payback > 60 months", () => {
    const result = FinancialInputSchema.safeParse({
      monthlyRevenue: 0,
      uaSpend: 0,
      cashBalance: 0,
      monthlyBurn: 0,
      targetPaybackMonths: 61,
      savedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it("rejects non-integer payback", () => {
    const result = FinancialInputSchema.safeParse({
      monthlyRevenue: 0,
      uaSpend: 0,
      cashBalance: 0,
      monthlyBurn: 0,
      targetPaybackMonths: 12.5,
      savedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })
})

describe("Financial input storage", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("returns null when nothing stored", () => {
    expect(loadFinancialInput()).toBeNull()
  })

  it("save → load round-trip preserves values + adds savedAt", () => {
    const before = Date.now()
    const saved = saveFinancialInput({
      monthlyRevenue: 50_000_000,
      uaSpend: 20_000_000,
      cashBalance: 500_000_000,
      monthlyBurn: 30_000_000,
      targetPaybackMonths: 12,
    })
    const after = Date.now()
    expect(new Date(saved.savedAt).getTime()).toBeGreaterThanOrEqual(before)
    expect(new Date(saved.savedAt).getTime()).toBeLessThanOrEqual(after)
    const loaded = loadFinancialInput()
    expect(loaded).toEqual(saved)
  })

  it("returns null when stored JSON is invalid", () => {
    window.localStorage.setItem(FINANCIAL_INPUT_KEY, "{not-json")
    expect(loadFinancialInput()).toBeNull()
  })

  it("returns null when stored value fails schema", () => {
    window.localStorage.setItem(
      FINANCIAL_INPUT_KEY,
      JSON.stringify({ monthlyRevenue: -1 }),
    )
    expect(loadFinancialInput()).toBeNull()
  })

  it("clearFinancialInput removes the entry", () => {
    saveFinancialInput({
      monthlyRevenue: 0,
      uaSpend: 0,
      cashBalance: 0,
      monthlyBurn: 0,
      targetPaybackMonths: 1,
    })
    expect(loadFinancialInput()).not.toBeNull()
    clearFinancialInput()
    expect(loadFinancialInput()).toBeNull()
  })

  it("uses versioned key", () => {
    expect(FINANCIAL_INPUT_KEY).toBe("yieldo:financial-input:v1")
  })
})
