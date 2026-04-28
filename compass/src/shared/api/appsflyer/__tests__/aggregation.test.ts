import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { aggregate } from "../aggregation"
import type { ExtendedInstall, EventRow } from "../types"

const install = (id: string, t: string, costValue: number | null = null): ExtendedInstall => ({
  installTime: t, partner: null, mediaSource: null, costValue,
  eventRevenueUsd: null, eventName: "install",
  countryCode: null, platform: null,
  appsflyerId: id, eventTime: t,
})
const event = (id: string, t: string, name: string, rev: number | null = null): EventRow => ({
  appsflyerId: id, eventTime: t, eventName: name, eventRevenueUsd: rev,
})

describe("aggregate", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-15T00:00:00Z"))
  })
  afterEach(() => vi.useRealTimers())

  it("groups installs by UTC date and dedups by appsflyerId", () => {
    const installs = [
      install("u1", "2026-04-01 23:30:00"),
      install("u2", "2026-04-01 23:45:00"),
      install("u3", "2026-04-02 00:15:00"),
    ]
    const r = aggregate(installs, [])
    expect(r.cohorts.find((c) => c.cohortDate === "2026-04-01")?.installs).toBe(2)
    expect(r.cohorts.find((c) => c.cohortDate === "2026-04-02")?.installs).toBe(1)
  })

  it("D1 retention uses per-user install epoch (not cohort-latest)", () => {
    // u1 installs early, u2 installs late same day
    // u1 has session 35h after install (NOT D1 for u1) but within 24h of u2's anchor
    const installs = [
      install("u1", "2026-04-01 12:00:00"),
      install("u2", "2026-04-01 23:30:00"),
    ]
    const events = [
      event("u1", "2026-04-02 23:00:00", "af_session"),  // 35h after u1
    ]
    const r = aggregate(installs, events)
    expect(r.cohorts[0].retainedByDay.d1).toBe(0)  // critical: 0 not 1
  })

  it("D1 distinct user dedup", () => {
    const installs = [install("u1", "2026-04-01 00:00:00")]
    const events = [
      event("u1", "2026-04-01 12:00:00", "af_session"),
      event("u1", "2026-04-01 18:00:00", "af_app_opened"),
    ]
    const r = aggregate(installs, events)
    expect(r.cohorts[0].retainedByDay.d1).toBe(1)
  })

  it("returns null retention for windows not yet elapsed", () => {
    const installs = [install("u1", "2026-05-10 00:00:00")]
    const r = aggregate(installs, [])
    const c = r.cohorts.find((x) => x.cohortDate === "2026-05-10")!
    expect(c.retainedByDay.d1).toBe(0)
    expect(c.retainedByDay.d7).toBeNull()
    expect(c.retainedByDay.d30).toBeNull()
  })

  it("ignores non-session events for retention", () => {
    const installs = [install("u1", "2026-04-01 00:00:00")]
    const events = [event("u1", "2026-04-01 12:00:00", "af_purchase", 9.99)]
    const r = aggregate(installs, events)
    expect(r.cohorts[0].retainedByDay.d1).toBe(0)
  })

  it("ignores rows with null appsflyerId", () => {
    const i: ExtendedInstall = { ...install("u1", "2026-04-01 00:00:00"), appsflyerId: null }
    expect(aggregate([i], []).cohorts).toEqual([])
  })

  it("revenue.daily aggregates eventRevenueUsd by UTC date with distinct purchasers", () => {
    const installs = [install("u1", "2026-04-01 00:00:00")]
    const events = [
      event("u1", "2026-04-15 10:00:00", "af_purchase", 9.99),
      event("u1", "2026-04-15 11:00:00", "af_purchase", 4.99),
      event("u2", "2026-04-15 12:00:00", "af_purchase", 19.99),
    ]
    const r = aggregate(installs, events)
    const day = r.revenue.daily.find((d) => d.date === "2026-04-15")!
    expect(day.sumUsd).toBeCloseTo(34.97)
    expect(day.purchasers).toBe(2)
  })

  it("revenue.total = sum across all daily + distinct lifetime purchasers", () => {
    const installs = [install("u1", "2026-04-01 00:00:00")]
    const events = [
      event("u1", "2026-04-15 10:00:00", "af_purchase", 10),
      event("u1", "2026-05-02 11:00:00", "af_purchase", 20),
    ]
    const r = aggregate(installs, events)
    expect(r.revenue.total.sumUsd).toBeCloseTo(30)
    expect(r.revenue.total.purchasers).toBe(1)  // u1 distinct across all days
  })

  it("repeated install rows for same user collapse into earliest cohort only", () => {
    // Same appsflyerId installed on two different dates (re-install / multi-row CSV).
    // User must appear in exactly one cohort = earliest install date.
    const installs = [
      install("u1", "2026-04-10 12:00:00"),
      install("u1", "2026-04-15 12:00:00"),  // later duplicate
      install("u2", "2026-04-15 12:00:00"),
    ]
    const r = aggregate(installs, [])
    const apr10 = r.cohorts.find((c) => c.cohortDate === "2026-04-10")
    const apr15 = r.cohorts.find((c) => c.cohortDate === "2026-04-15")
    expect(apr10?.installs).toBe(1)         // u1 only here
    expect(apr15?.installs).toBe(1)         // u2 only — NOT u1
    expect(r.cohorts.reduce((n, c) => n + c.installs, 0)).toBe(2)  // distinct user count
  })

  it("USD costValue sums into cohort.uaSpendUsd and summary.spend.totalUsd", () => {
    // 3 paid installs in same cohort: $1 + $2 + $3 = $6
    const installs = [
      install("u1", "2026-04-01 10:00:00", 1),
      install("u2", "2026-04-01 11:00:00", 2),
      install("u3", "2026-04-01 12:00:00", 3),
    ]
    const r = aggregate(installs, [], "USD")
    const apr1 = r.cohorts.find((c) => c.cohortDate === "2026-04-01")
    expect(apr1?.uaSpendUsd).toBeCloseTo(6)
    expect(r.spend.totalUsd).toBeCloseTo(6)
    expect(r.spend.homeCurrency).toBe("USD")
  })

  it("KRW costValue is converted to USD via static rate (1300 KRW = 1 USD)", () => {
    const installs = [
      install("u1", "2026-04-01 10:00:00", 1_300),
      install("u2", "2026-04-01 11:00:00", 2_600),
    ]
    const r = aggregate(installs, [], "KRW")
    const apr1 = r.cohorts.find((c) => c.cohortDate === "2026-04-01")
    expect(apr1?.uaSpendUsd).toBeCloseTo(3)
    expect(r.spend.totalUsd).toBeCloseTo(3)
    expect(r.spend.homeCurrency).toBe("KRW")
  })

  it("organic install (costValue null) contributes 0 in supported FX cohort", () => {
    // 1 paid + 1 organic in same cohort. uaSpendUsd should reflect paid only,
    // not be null — distinguishing organic-only from "FX unsupported".
    const installs = [
      install("u1", "2026-04-01 10:00:00", 5),
      install("u2", "2026-04-01 11:00:00", null),
    ]
    const r = aggregate(installs, [], "USD")
    const apr1 = r.cohorts.find((c) => c.cohortDate === "2026-04-01")
    expect(apr1?.uaSpendUsd).toBeCloseTo(5)
    expect(apr1?.installs).toBe(2)
  })

  it("100% organic cohort under supported FX still reports 0, not null", () => {
    const installs = [
      install("u1", "2026-04-01 10:00:00", null),
      install("u2", "2026-04-01 11:00:00", null),
    ]
    const r = aggregate(installs, [], "USD")
    const apr1 = r.cohorts.find((c) => c.cohortDate === "2026-04-01")
    expect(apr1?.uaSpendUsd).toBe(0)
    expect(r.spend.totalUsd).toBe(0)
  })

  it("unsupported home_currency (JPY) yields null spend across cohort + summary", () => {
    // Even with non-null costValue, JPY can't be FX-converted → null everywhere.
    const installs = [
      install("u1", "2026-04-01 10:00:00", 100),
      install("u2", "2026-04-01 11:00:00", 200),
    ]
    const r = aggregate(installs, [], "JPY")
    const apr1 = r.cohorts.find((c) => c.cohortDate === "2026-04-01")
    expect(apr1?.uaSpendUsd).toBeNull()
    expect(r.spend.totalUsd).toBeNull()
    expect(r.spend.homeCurrency).toBe("JPY")
  })

  it("default homeCurrency arg is USD (back-compat for callers not passing it)", () => {
    const installs = [install("u1", "2026-04-01 10:00:00", 5)]
    const r = aggregate(installs, [])
    expect(r.spend.homeCurrency).toBe("USD")
    expect(r.spend.totalUsd).toBeCloseTo(5)
  })
})
