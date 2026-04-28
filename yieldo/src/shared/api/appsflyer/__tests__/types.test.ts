import { describe, it, expect } from "vitest"
import {
  AccountSchema,
  AppSchema,
  StateSchema,
  CohortSummarySchema,
  RegisterRequestSchema,
} from "../types"

describe("AccountSchema", () => {
  it("accepts valid account", () => {
    const ok = AccountSchema.safeParse({
      id: "acc_ab12cdef",
      tokenHash: "a".repeat(64),
      encryptedToken: "iv:ct:tag",
      currency: "KRW",
      label: "Treenod 본계정",
      createdAt: "2026-04-23T00:00:00.000Z",
    })
    expect(ok.success).toBe(true)
  })

  it("rejects bad id prefix", () => {
    const bad = AccountSchema.safeParse({
      id: "wrong_ab12cdef",
      tokenHash: "a".repeat(64),
      encryptedToken: "x",
      currency: "KRW",
      label: "x",
      createdAt: "2026-04-23T00:00:00.000Z",
    })
    expect(bad.success).toBe(false)
  })
})

describe("StateSchema", () => {
  it("accepts backfilling state with null syncLock", () => {
    const ok = StateSchema.safeParse({
      appId: "com.example.app",
      status: "backfilling",
      progress: { step: 1, total: 5, rowsFetched: 135 },
      callsUsedToday: 2,
      callsResetAt: "2026-04-24T00:00:00.000Z",
      syncLock: null,
      failureHistory: [],
    })
    expect(ok.success).toBe(true)
  })

  it("rejects unknown status", () => {
    const bad = StateSchema.safeParse({
      appId: "com.example.app",
      status: "exploding",
      progress: { step: 0, total: 5, rowsFetched: 0 },
      callsUsedToday: 0,
      callsResetAt: "2026-04-24T00:00:00.000Z",
      syncLock: null,
      failureHistory: [],
    })
    expect(bad.success).toBe(false)
  })
})

describe("CohortSummarySchema", () => {
  it("accepts cohorts array (engine-input shape, post C2 alignment)", () => {
    const ok = CohortSummarySchema.safeParse({
      updatedAt: "2026-04-23T00:00:00.000Z",
      cohorts: [
        {
          cohortDate: "2026-04-10",
          installs: 12,
          retainedByDay: { d1: 5, d7: null, d30: null },
        },
      ],
      revenue: {
        daily: [{ date: "2026-04-10", sumUsd: 123.45, purchasers: 3 }],
        total: { sumUsd: 123.45, purchasers: 3 },
      },
    })
    expect(ok.success).toBe(true)
  })
})

describe("RegisterRequestSchema", () => {
  it("defaults home_currency to KRW", () => {
    const parsed = RegisterRequestSchema.parse({
      dev_token: "a".repeat(32),
      app_id: "com.example.app",
      app_label: "Example",
      game_key: "sample-match-3",
    })
    expect(parsed.home_currency).toBe("KRW")
  })
})

import { toExtendedInstall, toEventRow } from "../types"

describe("toExtendedInstall", () => {
  it("preserves AppsFlyer ID and Event Time, returns null for empty", () => {
    const row = {
      "AppsFlyer ID": "1234-abc",
      "Install Time": "2026-04-01 12:00:00",
      "Event Time": "2026-04-01 12:00:00",
      "Partner": "googleadwords",
    }
    const out = toExtendedInstall(row as any)
    expect(out.appsflyerId).toBe("1234-abc")
    expect(out.installTime).toBe("2026-04-01 12:00:00")
    expect(out.partner).toBe("googleadwords")

    const empty = toExtendedInstall({ "AppsFlyer ID": "" } as any)
    expect(empty.appsflyerId).toBeNull()
  })
})

describe("toEventRow", () => {
  it("extracts join key + event metadata only", () => {
    const out = toEventRow({
      "AppsFlyer ID": "abc",
      "Event Time": "2026-04-02 09:00:00",
      "Event Name": "af_session",
      "Event Revenue USD": null,
      "Install Time": "ignored",
    } as any)
    expect(out.appsflyerId).toBe("abc")
    expect(out.eventName).toBe("af_session")
    expect(out.eventRevenueUsd).toBeNull()
  })
})
