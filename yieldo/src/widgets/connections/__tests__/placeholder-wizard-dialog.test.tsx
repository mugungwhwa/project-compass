import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act, fireEvent } from "@testing-library/react"
import { PlaceholderWizardDialog } from "@/widgets/connections/ui/placeholder-wizard-dialog"
import type { Connection } from "@/shared/api/mock-connections"

const statsig: Connection = {
  id: "statsig",
  brand: "Statsig",
  category: "experimentation",
  description: "A/B 실험 플랫폼",
  status: "disconnected",
}

const adjust: Connection = {
  id: "adjust",
  brand: "Adjust",
  category: "mmp",
  description: "Mobile attribution",
  status: "disconnected",
}

describe("PlaceholderWizardDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders step 1 by default with brand name", () => {
    render(<PlaceholderWizardDialog connection={statsig} onClose={() => {}} />)
    expect(screen.getByText("Statsig")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /다음/ })).toBeInTheDocument()
  })

  it("always renders the demo disclaimer", () => {
    render(<PlaceholderWizardDialog connection={statsig} onClose={() => {}} />)
    expect(screen.getByText(/시연용 placeholder/i)).toBeInTheDocument()
  })

  it("renders connector-specific guide text on step 1", () => {
    const { rerender } = render(
      <PlaceholderWizardDialog connection={statsig} onClose={() => {}} />,
    )
    expect(screen.getByText(/Statsig Console/i)).toBeInTheDocument()

    rerender(
      <PlaceholderWizardDialog connection={adjust} onClose={() => {}} />,
    )
    expect(screen.getByText(/Adjust Dashboard/i)).toBeInTheDocument()
  })

  it("advances to step 2 (verifying) on 다음 click, then auto-advances to step 3", () => {
    render(<PlaceholderWizardDialog connection={statsig} onClose={() => {}} />)

    fireEvent.click(screen.getByRole("button", { name: /다음/ }))
    expect(screen.getByText(/검증 중/)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(screen.getByText(/연결되었습니다/)).toBeInTheDocument()
  })

  it("calls onClose when 닫기 is clicked on step 3", () => {
    const onClose = vi.fn()
    render(<PlaceholderWizardDialog connection={statsig} onClose={onClose} />)

    fireEvent.click(screen.getByRole("button", { name: /다음/ }))
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    fireEvent.click(screen.getByRole("button", { name: /닫기/ }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
