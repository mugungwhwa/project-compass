import { describe, it, expect } from "vitest"
import {
  AVAILABLE_CONNECTORS,
  CATEGORY_ORDER,
} from "@/shared/api/mock-connections"

describe("AVAILABLE_CONNECTORS catalog", () => {
  it("has at least one connector per category", () => {
    for (const cat of CATEGORY_ORDER) {
      const items = AVAILABLE_CONNECTORS.filter((c) => c.category === cat)
      expect(items.length, `category=${cat}`).toBeGreaterThanOrEqual(1)
    }
  })

  it("includes the 5 PR-A demo-pack connectors", () => {
    const ids = AVAILABLE_CONNECTORS.map((c) => c.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        "appsflyer",
        "adjust",
        "statsig",
        "manual-financial",
        "gameanalytics",
      ]),
    )
  })

  it("every connector has non-empty brand and description", () => {
    for (const c of AVAILABLE_CONNECTORS) {
      expect(c.brand.length).toBeGreaterThan(0)
      expect(c.description.length).toBeGreaterThan(0)
    }
  })
})
