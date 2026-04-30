import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"
import * as af from "@/shared/api/appsflyer"

describe("POST /api/appsflyer/sync/[appId]", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("returns 200 with state on success", async () => {
    vi.spyOn(af, "runAppsFlyerSync").mockResolvedValue({
      appId: "com.x", status: "active", progress: { step: 5, total: 5, rowsFetched: 100 },
      callsUsedToday: 4, callsResetAt: "2026-04-24T00:00:00.000Z", syncLock: null, failureHistory: [],
    } as any)
    const res = await POST(
      new Request("http://t", { method: "POST", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } }),
      { params: Promise.resolve({ appId: "com.x" }) },
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.appId).toBe("com.x")
    expect(body.state.status).toBe("active")
  })

  it("returns 409 when BackfillInProgressError thrown", async () => {
    vi.spyOn(af, "runAppsFlyerSync").mockRejectedValue(
      new af.BackfillInProgressError("acc_x", "exec_y"),
    )
    const res = await POST(
      new Request("http://t", { method: "POST", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } }),
      { params: Promise.resolve({ appId: "com.x" }) },
    )
    expect(res.status).toBe(409)
  })

  it("returns 500 on generic error", async () => {
    vi.spyOn(af, "runAppsFlyerSync").mockRejectedValue(new Error("network down"))
    const res = await POST(
      new Request("http://t", { method: "POST", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } }),
      { params: Promise.resolve({ appId: "com.x" }) },
    )
    expect(res.status).toBe(500)
  })

  it("clamps days to [1, 14] window", async () => {
    const spy = vi.spyOn(af, "runAppsFlyerSync").mockResolvedValue({} as any)
    await POST(
      new Request("http://t", { method: "POST", body: JSON.stringify({ days: 100 }), headers: { "Content-Type": "application/json" } }),
      { params: Promise.resolve({ appId: "com.x" }) },
    )
    // The window passed should reflect 14-day max (default), not 100
    const call = spy.mock.calls[0]
    expect(call[0]).toBe("com.x")
    const fromDate = new Date(call[1].fromIso)
    const toDate = new Date(call[1].toIso)
    const diffDays = (toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000)
    expect(diffDays).toBeLessThanOrEqual(14)
    expect(diffDays).toBeGreaterThan(13)
  })
})
