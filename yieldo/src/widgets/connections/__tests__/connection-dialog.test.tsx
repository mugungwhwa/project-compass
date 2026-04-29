import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ConnectionDialog } from "@/widgets/connections/ui/connection-dialog"
import type { Connection } from "@/shared/api/mock-connections"

const appsflyer: Connection = {
  id: "appsflyer",
  brand: "AppsFlyer",
  category: "mmp",
  description: "AF",
  status: "disconnected",
}

const statsig: Connection = {
  id: "statsig",
  brand: "Statsig",
  category: "experimentation",
  description: "Statsig",
  status: "disconnected",
}

describe("ConnectionDialog branching", () => {
  it("renders RegisterForm for AppsFlyer disconnected", () => {
    render(<ConnectionDialog connection={appsflyer} onClose={() => {}} />)
    // RegisterForm 고유 라벨 — App ID 입력 필드
    expect(screen.getByText("App ID")).toBeInTheDocument()
  })

  it("renders PlaceholderWizardDialog for non-AppsFlyer connector", () => {
    render(<ConnectionDialog connection={statsig} onClose={() => {}} />)
    // wizard 고유 텍스트
    expect(screen.getByText(/시연용 placeholder/i)).toBeInTheDocument()
    expect(screen.queryByText("App ID")).not.toBeInTheDocument()
  })
})
