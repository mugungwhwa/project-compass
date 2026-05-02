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

  it("includes the PR-E catalog of 12 connectors (3 per silo)", () => {
    const ids = AVAILABLE_CONNECTORS.map((c) => c.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        // MMP
        "appsflyer",
        "adjust",
        "singular",
        // Experimentation
        "statsig",
        "firebase",
        "optimizely",
        // Financial
        "manual-financial",
        "quickbooks",
        "xero",
        // Market
        "gameanalytics",
        "sensortower",
        "appmagic",
      ]),
    )
    expect(ids).toHaveLength(12)
  })

  it("has exactly 3 connectors per category", () => {
    for (const cat of CATEGORY_ORDER) {
      const items = AVAILABLE_CONNECTORS.filter((c) => c.category === cat)
      expect(items.length, `category=${cat}`).toBe(3)
    }
  })

  it("every connector has non-empty brand, description, initials, brandColor", () => {
    for (const c of AVAILABLE_CONNECTORS) {
      expect(c.brand.length).toBeGreaterThan(0)
      expect(c.description.length).toBeGreaterThan(0)
      expect(c.initials?.length, `id=${c.id} initials`).toBeGreaterThan(0)
      expect(c.brandColor, `id=${c.id} brandColor`).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })
})
