import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { incrementCalls, acquireLock, releaseLock, isResetDue, resetIfDue } from "../rate-limiter"
import * as blobStore from "../blob-store"
import type { AppState } from "../types"

const baseState = (overrides: Partial<AppState> = {}): AppState => ({
  appId: "com.x",
  status: "active",
  progress: { step: 5, total: 5, rowsFetched: 0 },
  callsUsedToday: 0,
  callsResetAt: "2026-04-24T00:00:00.000Z",
  syncLock: null,
  failureHistory: [],
  ...overrides,
})

describe("rate-limiter", () => {
  beforeEach(() => {
    // Only fake Date — leave setTimeout real so acquireLock's verify-jitter resolves.
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-04-23T12:00:00Z"))
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("incrementCalls increases callsUsedToday and writes back", async () => {
    vi.spyOn(blobStore, "getState").mockResolvedValue(baseState({ callsUsedToday: 3 }))
    const put = vi.spyOn(blobStore, "putState").mockResolvedValue()
    await incrementCalls("com.x", 4)
    expect(put).toHaveBeenCalledWith(expect.objectContaining({ callsUsedToday: 7 }))
  })

  it("incrementCalls throws when ceiling exceeded", async () => {
    vi.spyOn(blobStore, "getState").mockResolvedValue(baseState({ callsUsedToday: 18 }))
    await expect(incrementCalls("com.x", 4)).rejects.toThrow(/quota|throttled|rate/i)
  })

  it("isResetDue true when now >= callsResetAt", async () => {
    vi.spyOn(blobStore, "getState").mockResolvedValue(baseState({ callsResetAt: "2026-04-23T00:00:00.000Z" }))
    expect(await isResetDue("com.x")).toBe(true)
  })

  it("acquireLock writes lock and releaseLock clears it", async () => {
    let current = baseState({ syncLock: null })
    vi.spyOn(blobStore, "getState").mockImplementation(async () => current)
    vi.spyOn(blobStore, "putState").mockImplementation(async (s) => { current = s })
    const ok = await acquireLock("com.x", "exec_1")
    expect(ok).toBe(true)
    expect(current.syncLock?.heldBy).toBe("exec_1")
    await releaseLock("com.x", "exec_1")
    expect(current.syncLock).toBeNull()
  })

  it("acquireLock fails when stale lock not yet expired", async () => {
    const heldAt = new Date("2026-04-23T11:58:00Z").toISOString()  // 2분 전
    const state = baseState({ syncLock: { heldBy: "other", heldAt, ttlMs: 300000 } })
    vi.spyOn(blobStore, "getState").mockResolvedValue(state)
    expect(await acquireLock("com.x", "exec_1")).toBe(false)
  })

  it("acquireLock breaks expired lock (>5min old)", async () => {
    const heldAt = new Date("2026-04-23T11:50:00Z").toISOString()  // 10분 전
    let current = baseState({ syncLock: { heldBy: "ghost", heldAt, ttlMs: 300000 } })
    vi.spyOn(blobStore, "getState").mockImplementation(async () => current)
    vi.spyOn(blobStore, "putState").mockImplementation(async (s) => { current = s })
    expect(await acquireLock("com.x", "exec_1")).toBe(true)
    expect(current.syncLock?.heldBy).toBe("exec_1")
  })

  it("releaseLock is a no-op when execId doesn't match holder", async () => {
    const state = baseState({ syncLock: { heldBy: "other", heldAt: new Date().toISOString(), ttlMs: 300000 } })
    let current = state
    vi.spyOn(blobStore, "getState").mockImplementation(async () => current)
    const put = vi.spyOn(blobStore, "putState").mockImplementation(async (s) => { current = s })
    await releaseLock("com.x", "exec_1")
    expect(put).not.toHaveBeenCalled()
  })
})
