import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FinancialInputForm } from "@/widgets/connections/ui/financial-input-form"
import {
  FINANCIAL_INPUT_KEY,
  loadFinancialInput,
} from "@/shared/api/financial-input"

describe("FinancialInputForm", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("renders 5 input fields with KRW labels", () => {
    render(<FinancialInputForm onSaved={() => {}} onClose={() => {}} />)
    expect(screen.getByLabelText(/월 매출/)).toBeInTheDocument()
    expect(screen.getByLabelText(/UA 지출/)).toBeInTheDocument()
    expect(screen.getByLabelText(/현금 잔고/)).toBeInTheDocument()
    expect(screen.getByLabelText(/월 burn/)).toBeInTheDocument()
    expect(screen.getByLabelText(/목표 payback/)).toBeInTheDocument()
  })

  it("shows demo disclaimer", () => {
    render(<FinancialInputForm onSaved={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/localStorage 저장/i)).toBeInTheDocument()
  })

  it("blocks submit when fields empty", async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<FinancialInputForm onSaved={onSaved} onClose={() => {}} />)

    await user.click(screen.getByRole("button", { name: /저장/ }))
    expect(onSaved).not.toHaveBeenCalled()
    expect(loadFinancialInput()).toBeNull()
  })

  it("blocks submit on negative input", async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<FinancialInputForm onSaved={onSaved} onClose={() => {}} />)

    await user.type(screen.getByLabelText(/월 매출/), "-1")
    await user.type(screen.getByLabelText(/UA 지출/), "0")
    await user.type(screen.getByLabelText(/현금 잔고/), "0")
    await user.type(screen.getByLabelText(/월 burn/), "0")
    await user.type(screen.getByLabelText(/목표 payback/), "12")
    await user.click(screen.getByRole("button", { name: /저장/ }))

    expect(onSaved).not.toHaveBeenCalled()
  })

  it("saves valid input + calls onSaved + persists to localStorage", async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<FinancialInputForm onSaved={onSaved} onClose={() => {}} />)

    await user.type(screen.getByLabelText(/월 매출/), "50000000")
    await user.type(screen.getByLabelText(/UA 지출/), "20000000")
    await user.type(screen.getByLabelText(/현금 잔고/), "500000000")
    await user.type(screen.getByLabelText(/월 burn/), "30000000")
    await user.type(screen.getByLabelText(/목표 payback/), "12")
    await user.click(screen.getByRole("button", { name: /저장/ }))

    expect(onSaved).toHaveBeenCalledTimes(1)
    const saved = loadFinancialInput()
    expect(saved).not.toBeNull()
    expect(saved?.monthlyRevenue).toBe(50_000_000)
    expect(saved?.targetPaybackMonths).toBe(12)
  })

  it("pre-fills from localStorage when value already exists", () => {
    window.localStorage.setItem(
      FINANCIAL_INPUT_KEY,
      JSON.stringify({
        monthlyRevenue: 12345,
        uaSpend: 0,
        cashBalance: 0,
        monthlyBurn: 0,
        targetPaybackMonths: 6,
        savedAt: new Date().toISOString(),
      }),
    )

    render(<FinancialInputForm onSaved={() => {}} onClose={() => {}} />)
    expect(screen.getByLabelText(/월 매출/)).toHaveValue("12,345")
    expect(screen.getByLabelText(/목표 payback/)).toHaveValue("6")
  })
})
