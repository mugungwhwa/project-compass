import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "../route"
import * as af from "@/shared/api/appsflyer"

describe("GET /api/appsflyer/state/[appId]", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.APPSFLYER_MASTER_KEY = "0".repeat(64)
  })

  it("404 when app not found", async () => {
    vi.spyOn(af, "getState").mockResolvedValue(null)
    const res = await GET(new Request("http://t"), { params: Promise.resolve({ appId: "ghost" }) })
    expect(res.status).toBe(404)
  })

  it("200 + state JSON when found, no-store cache", async () => {
    vi.spyOn(af, "getState").mockResolvedValue({
      appId: "com.x", status: "active", progress: { step: 5, total: 5, rowsFetched: 0 },
      callsUsedToday: 4, callsResetAt: "2026-04-24T00:00:00.000Z", syncLock: null, failureHistory: [],
    } as any)
    const res = await GET(new Request("http://t"), { params: Promise.resolve({ appId: "com.x" }) })
    expect(res.status).toBe(200)
    expect(res.headers.get("Cache-Control")).toContain("no-store")
    const body = await res.json()
    expect(body.appId).toBe("com.x")
    expect(body.status).toBe("active")
  })
})
