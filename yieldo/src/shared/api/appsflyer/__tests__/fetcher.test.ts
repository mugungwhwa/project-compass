import { describe, test, expect } from "vitest"
import { parseCsv } from "../fetcher"
import { toCompactInstall } from "../types"

const csvSample = [
  "﻿Install Time,Partner,Media Source,Cost Value,Event Revenue USD,Country Code,Platform,Event Name",
  "2026-02-14 13:53:39,Facebook Ads,Facebook Ads,1.25,0,KR,android,install",
  `2026-02-13 15:24:07,"google",google,0.90,,US,android,install`,
  "2026-02-12 08:00:00,,organic,,5.00,JP,ios,af_purchase",
].join("\n")

describe("fetcher", () => {
  test("parseCsv: parses rows with BOM + quoted fields", () => {
    const rows = parseCsv(csvSample)
    expect(rows.length).toBe(3)
    expect(rows[0]!["Install Time"]).toBe("2026-02-14 13:53:39")
    expect(rows[0]!["Cost Value"]).toBe(1.25)
    expect(rows[1]!["Partner"]).toBe("google")
    expect(rows[2]!["Partner"]).toBeNull()
  })

  test("parseCsv: empty input returns empty array", () => {
    expect(parseCsv("")).toEqual([])
    expect(parseCsv("﻿")).toEqual([])
  })

  test("toCompactInstall: projects raw row to compact shape", () => {
    const rows = parseCsv(csvSample)
    const c = toCompactInstall(rows[0]!)
    expect(c.installTime).toBe("2026-02-14 13:53:39")
    expect(c.partner).toBe("Facebook Ads")
    expect(c.costValue).toBe(1.25)
    expect(c.countryCode).toBe("KR")
  })

  test("toCompactInstall: handles empty / missing columns", () => {
    const rows = parseCsv(csvSample)
    const c = toCompactInstall(rows[2]!)
    expect(c.partner).toBeNull()
    expect(c.costValue).toBeNull()
    expect(c.eventRevenueUsd).toBe(5)
    expect(c.eventName).toBe("af_purchase")
  })

  test("fetchInAppEvents: function exists and is callable", async () => {
    const { fetchInAppEvents } = await import("../fetcher")
    expect(typeof fetchInAppEvents).toBe("function")
  })

  test("fetchOrganicInAppEvents: function exists and is callable", async () => {
    const { fetchOrganicInAppEvents } = await import("../fetcher")
    expect(typeof fetchOrganicInAppEvents).toBe("function")
  })
})
