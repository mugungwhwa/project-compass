import { describe, it, expect, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useLiveFinancial } from "@/shared/api/use-live-financial"
import {
  FINANCIAL_INPUT_KEY,
  saveFinancialInput,
} from "@/shared/api/financial-input"

describe("useLiveFinancial", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("returns null when localStorage empty", () => {
    const { result } = renderHook(() => useLiveFinancial())
    expect(result.current).toBeNull()
  })

  it("returns derived shape when input is saved", () => {
    saveFinancialInput({
      monthlyRevenue: 50_000_000,
      uaSpend: 20_000_000,
      cashBalance: 500_000_000,
      monthlyBurn: 30_000_000,
      targetPaybackMonths: 12,
    })

    const { result } = renderHook(() => useLiveFinancial())
    expect(result.current).not.toBeNull()
    expect(result.current?.paybackDay).toBe(360)
    expect(result.current?.netRunway.max).toBe(18)
  })

  it("re-reads on storage event (cross-tab sync)", () => {
    const { result } = renderHook(() => useLiveFinancial())
    expect(result.current).toBeNull()

    act(() => {
      saveFinancialInput({
        monthlyRevenue: 1_000_000,
        uaSpend: 0,
        cashBalance: 10_000_000,
        monthlyBurn: 1_000_000,
        targetPaybackMonths: 6,
      })
      window.dispatchEvent(new StorageEvent("storage", { key: FINANCIAL_INPUT_KEY }))
    })

    expect(result.current).not.toBeNull()
    expect(result.current?.paybackDay).toBe(180)
  })
})
