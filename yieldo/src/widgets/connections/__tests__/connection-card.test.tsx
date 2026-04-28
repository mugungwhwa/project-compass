import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ConnectionCard } from "@/widgets/connections"
import type { Connection, ConnectionStatus } from "@/shared/api/mock-connections"

const baseConnection: Omit<Connection, "status"> = {
  id: "test-af",
  brand: "AppsFlyer",
  category: "mmp",
  description: "어트리뷰션 데이터",
}

describe("ConnectionCard", () => {
  const cases: Array<[ConnectionStatus, string]> = [
    ["connected", "연결됨"],
    ["warn", "검토 필요"],
    ["error", "에러"],
    ["disconnected", "미연결"],
  ]

  it.each(cases)("renders %s status with label %s", (status, label) => {
    render(<ConnectionCard connection={{ ...baseConnection, status }} />)
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByText("AppsFlyer")).toBeInTheDocument()
  })

  it("does not render brand icon block (icons removed per spec)", () => {
    const { container } = render(
      <ConnectionCard
        connection={{
          ...baseConnection,
          status: "connected",
          brandColor: "#00b2e5",
          initials: "AF",
        }}
      />,
    )
    expect(
      container.querySelector('[aria-hidden="true"][style*="background"]'),
    ).toBeNull()
  })
})
