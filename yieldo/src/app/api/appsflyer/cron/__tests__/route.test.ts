import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "../route"
import * as af from "@/shared/api/appsflyer"

describe("GET /api/appsflyer/cron", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("returns 401 without correct CRON_SECRET", async () => {
    process.env.CRON_SECRET = "secret"
    const res = await GET(new Request("http://t"))
    expect(res.status).toBe(401)
  })

  it("returns 401 with wrong CRON_SECRET", async () => {
    process.env.CRON_SECRET = "secret"
    const res = await GET(new Request("http://t", {
      headers: { Authorization: "Bearer wrong" },
    }))
    expect(res.status).toBe(401)
  })

  it("syncs all listed apps and returns per-app results", async () => {
    process.env.CRON_SECRET = "secret"
    vi.spyOn(af, "listApps").mockResolvedValue([
      { appId: "com.a", accountId: "acc_1", gameKey: "sample-match-3", label: "x", createdAt: "2026-04-23T00:00:00.000Z" },
      { appId: "com.b", accountId: "acc_2", gameKey: "sample-puzzle", label: "y", createdAt: "2026-04-23T00:00:00.000Z" },
    ] as any)
    vi.spyOn(af, "runAppsFlyerSync").mockResolvedValue({ status: "active" } as any)
    const res = await GET(new Request("http://t", {
      headers: { Authorization: "Bearer secret" },
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results).toHaveLength(2)
    expect(body.results[0].appId).toBe("com.a")
    expect(body.results[0].state.status).toBe("active")
    expect(body.results[1].state.status).toBe("active")
  })

  it("isolates per-app failure (one app's error doesn't abort the loop)", async () => {
    process.env.CRON_SECRET = "secret"
    vi.spyOn(af, "listApps").mockResolvedValue([
      { appId: "com.a", accountId: "acc_1", gameKey: "sample-match-3", label: "x", createdAt: "2026-04-23T00:00:00.000Z" },
      { appId: "com.b", accountId: "acc_2", gameKey: "sample-puzzle", label: "y", createdAt: "2026-04-23T00:00:00.000Z" },
    ] as any)
    vi.spyOn(af, "runAppsFlyerSync")
      .mockRejectedValueOnce(new Error("a failed"))
      .mockResolvedValueOnce({ status: "active" } as any)
    const res = await GET(new Request("http://t", {
      headers: { Authorization: "Bearer secret" },
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results[0].error).toBeDefined()
    expect(body.results[0].error).toContain("a failed")
    expect(body.results[1].state.status).toBe("active")
  })
})
