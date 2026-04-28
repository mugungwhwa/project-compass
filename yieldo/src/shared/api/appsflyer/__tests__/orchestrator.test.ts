import { describe, it, expect, vi, beforeEach } from "vitest"
import { runAppsFlyerSync, validateCredentials } from "../orchestrator"
import * as fetcher from "../fetcher"
import * as blobStore from "../blob-store"
import * as rateLimiter from "../rate-limiter"
import * as crypto from "../crypto"

const baseAppCtx = {
  app: {
    appId: "com.x", accountId: "acc_a1b2c3d4", gameKey: "sample-match-3" as const,
    label: "x", createdAt: "2026-04-23T00:00:00.000Z",
  },
  account: {
    id: "acc_a1b2c3d4", tokenHash: "x".repeat(64), encryptedToken: "i:c:t",
    currency: "KRW" as const, label: "x", createdAt: "2026-04-23T00:00:00.000Z",
  },
}

const baseState = (overrides: any = {}) => ({
  appId: "com.x",
  status: "active" as const,
  progress: { step: 5, total: 5 as const, rowsFetched: 0 },
  callsUsedToday: 0,
  callsResetAt: "2026-04-24T00:00:00.000Z",
  syncLock: null,
  failureHistory: [],
  ...overrides,
})

describe("orchestrator", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(crypto, "decryptToken").mockReturnValue("plain_token")
  })

  it("validateCredentials calls installs_report 1-day window", async () => {
    const spy = vi.spyOn(fetcher, "fetchPullReport").mockResolvedValue([])
    await validateCredentials("tok", "com.x")
    expect(spy).toHaveBeenCalledWith(
      "tok",
      expect.objectContaining({ appId: "com.x", from: expect.any(String), to: expect.any(String) }),
      "installs_report",
    )
  })

  it("validateCredentials throws CredentialInvalidError on 401", async () => {
    vi.spyOn(fetcher, "fetchPullReport").mockRejectedValue(
      Object.assign(new Error("401"), { httpStatus: 401 }),
    )
    await expect(validateCredentials("tok", "com.x")).rejects.toThrow(/credential|401|invalid/i)
  })

  it("runAppsFlyerSync happy path returns active and increments calls 4x", async () => {
    vi.spyOn(blobStore, "getApp").mockResolvedValue(baseAppCtx.app as any)
    vi.spyOn(blobStore, "getAccount").mockResolvedValue(baseAppCtx.account as any)
    vi.spyOn(blobStore, "getState").mockResolvedValue(baseState() as any)
    vi.spyOn(fetcher, "fetchPullReport").mockResolvedValue([])
    vi.spyOn(rateLimiter, "acquireLock").mockResolvedValue(true)
    vi.spyOn(rateLimiter, "releaseLock").mockResolvedValue()
    vi.spyOn(rateLimiter, "incrementCalls").mockResolvedValue()
    vi.spyOn(rateLimiter, "resetIfDue").mockResolvedValue()
    vi.spyOn(blobStore, "appendInstalls").mockResolvedValue()
    vi.spyOn(blobStore, "appendEvents").mockResolvedValue()
    vi.spyOn(blobStore, "putCohortSummary").mockResolvedValue()
    vi.spyOn(blobStore, "putState").mockResolvedValue()
    vi.spyOn(blobStore, "readAllInstalls").mockResolvedValue([])
    vi.spyOn(blobStore, "readAllEvents").mockResolvedValue([])

    const out = await runAppsFlyerSync("com.x", { fromIso: "2026-04-09", toIso: "2026-04-23" })
    expect(out.status).toBe("active")
    expect(rateLimiter.incrementCalls).toHaveBeenCalledTimes(4)  // 4 endpoints
  })

  it("runAppsFlyerSync transitions to credential_invalid on 401 mid-fetch", async () => {
    vi.spyOn(blobStore, "getApp").mockResolvedValue(baseAppCtx.app as any)
    vi.spyOn(blobStore, "getAccount").mockResolvedValue(baseAppCtx.account as any)
    vi.spyOn(blobStore, "getState").mockResolvedValue(baseState() as any)
    vi.spyOn(rateLimiter, "acquireLock").mockResolvedValue(true)
    vi.spyOn(rateLimiter, "releaseLock").mockResolvedValue()
    vi.spyOn(rateLimiter, "incrementCalls").mockResolvedValue()
    vi.spyOn(rateLimiter, "resetIfDue").mockResolvedValue()
    vi.spyOn(fetcher, "fetchPullReport").mockRejectedValue(
      Object.assign(new Error("401"), { httpStatus: 401 }),
    )
    const putState = vi.spyOn(blobStore, "putState").mockResolvedValue()

    const out = await runAppsFlyerSync("com.x", { fromIso: "2026-04-09", toIso: "2026-04-23" })
    expect(out.status).toBe("credential_invalid")
    expect(putState).toHaveBeenCalledWith(expect.objectContaining({ status: "credential_invalid" }))
  })

  it("runAppsFlyerSync throws BackfillInProgressError when lock cannot be acquired", async () => {
    vi.spyOn(blobStore, "getApp").mockResolvedValue(baseAppCtx.app as any)
    vi.spyOn(blobStore, "getAccount").mockResolvedValue(baseAppCtx.account as any)
    vi.spyOn(blobStore, "getState").mockResolvedValue(baseState() as any)
    vi.spyOn(rateLimiter, "resetIfDue").mockResolvedValue()
    vi.spyOn(rateLimiter, "acquireLock").mockResolvedValue(false)
    await expect(runAppsFlyerSync("com.x", { fromIso: "2026-04-09", toIso: "2026-04-23" }))
      .rejects.toThrow(/backfill|in progress|lock/i)
  })
})
