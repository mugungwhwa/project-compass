import { describe, it, expect, vi, beforeEach } from "vitest"
import * as blob from "@vercel/blob"
import {
  putAccount, getAccount, listApps, getApp, putApp,
  putState, getState, appendInstalls, listInstallShards,
} from "../blob-store"

vi.mock("@vercel/blob")

describe("blob-store", () => {
  beforeEach(() => vi.clearAllMocks())

  it("putAccount writes to appsflyer/accounts/{id}.json", async () => {
    const putSpy = vi.spyOn(blob, "put").mockResolvedValue({ url: "https://x" } as any)
    await putAccount({
      id: "acc_a1b2c3d4", tokenHash: "x".repeat(64),
      encryptedToken: "i:c:t", currency: "KRW",
      label: "test", createdAt: new Date().toISOString(),
    })
    expect(putSpy).toHaveBeenCalledWith(
      "appsflyer/accounts/acc_a1b2c3d4.json",
      expect.any(String),
      expect.objectContaining({ access: "private", contentType: "application/json" }),
    )
  })

  it("appendInstalls dedups by appsflyerId+installTime", async () => {
    vi.spyOn(blob, "head").mockResolvedValue({ url: "https://x" } as any)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => [
        JSON.stringify({
          installTime: "2026-04-01T00:00:00Z", appsflyerId: "u1",
          partner: null, mediaSource: null, costValue: null, eventRevenueUsd: null,
          eventName: null, countryCode: null, platform: null, eventTime: null,
        }),
      ].join("\n"),
    } as any)
    const putSpy = vi.spyOn(blob, "put").mockResolvedValue({ url: "x" } as any)

    await appendInstalls("com.x", "2026-04", [
      { installTime: "2026-04-01T00:00:00Z", appsflyerId: "u1", partner: null, mediaSource: null, costValue: null, eventRevenueUsd: null, eventName: null, countryCode: null, platform: null, eventTime: null },  // dup
      { installTime: "2026-04-01T01:00:00Z", appsflyerId: "u2", partner: null, mediaSource: null, costValue: null, eventRevenueUsd: null, eventName: null, countryCode: null, platform: null, eventTime: null },  // new
    ])

    const writtenJsonl = putSpy.mock.calls[0][1] as string
    const lines = writtenJsonl.trim().split("\n")
    expect(lines).toHaveLength(2)  // 1 existing + 1 new (dup not added)
  })

  it("getState returns null when not found", async () => {
    vi.spyOn(blob, "head").mockRejectedValue(new Error("not found"))
    expect(await getState("com.unknown")).toBeNull()
  })
})
