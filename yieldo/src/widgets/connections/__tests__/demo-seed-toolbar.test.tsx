import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DemoSeedToolbar } from "@/widgets/connections/ui/demo-seed-toolbar"
import { loadFinancialInput } from "@/shared/api/financial-input"

describe("DemoSeedToolbar", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("renders both buttons", () => {
    render(<DemoSeedToolbar hasInput={false} onChange={() => {}} />)
    expect(screen.getByRole("button", { name: /적용/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /초기화/ })).toBeInTheDocument()
  })

  it("disables 적용 when hasInput=true and 초기화 when hasInput=false", () => {
    const { rerender } = render(
      <DemoSeedToolbar hasInput={false} onChange={() => {}} />,
    )
    expect(screen.getByRole("button", { name: /적용/ })).toBeEnabled()
    expect(screen.getByRole("button", { name: /초기화/ })).toBeDisabled()

    rerender(<DemoSeedToolbar hasInput={true} onChange={() => {}} />)
    expect(screen.getByRole("button", { name: /적용/ })).toBeDisabled()
    expect(screen.getByRole("button", { name: /초기화/ })).toBeEnabled()
  })

  it("적용 클릭 → onChange + DEMO_SEED 저장", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DemoSeedToolbar hasInput={false} onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: /적용/ }))
    expect(onChange).toHaveBeenCalledTimes(1)
    const loaded = loadFinancialInput()
    expect(loaded?.monthlyRevenue).toBe(50_000_000)
  })

  it("초기화 → confirm 확인 시 onChange + localStorage 비움", async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
    const onChange = vi.fn()

    window.localStorage.setItem(
      "yieldo:financial-input:v1",
      JSON.stringify({
        monthlyRevenue: 1,
        uaSpend: 0,
        cashBalance: 0,
        monthlyBurn: 0,
        targetPaybackMonths: 1,
        savedAt: new Date().toISOString(),
      }),
    )

    render(<DemoSeedToolbar hasInput={true} onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: /초기화/ }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(loadFinancialInput()).toBeNull()
    confirmSpy.mockRestore()
  })

  it("초기화 → confirm 취소 시 onChange 호출 안 됨, localStorage 유지", async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)
    const onChange = vi.fn()

    window.localStorage.setItem(
      "yieldo:financial-input:v1",
      JSON.stringify({
        monthlyRevenue: 1,
        uaSpend: 0,
        cashBalance: 0,
        monthlyBurn: 0,
        targetPaybackMonths: 1,
        savedAt: new Date().toISOString(),
      }),
    )

    render(<DemoSeedToolbar hasInput={true} onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: /초기화/ }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(loadFinancialInput()).not.toBeNull()
    confirmSpy.mockRestore()
  })
})
