import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"
import * as af from "@/shared/api/appsflyer"

describe("POST /api/appsflyer/register", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.APPSFLYER_MASTER_KEY = "0".repeat(64)
  })

  it("returns 400 on invalid input", async () => {
    const res = await POST(new Request("http://t", {
      method: "POST",
      body: JSON.stringify({ dev_token: "x", app_id: "x" }),  // missing fields, dev_token too short
      headers: { "Content-Type": "application/json" },
    }))
    expect(res.status).toBe(400)
  })

  it("returns 401 when validation ping fails with credential invalid", async () => {
    vi.spyOn(af, "validateCredentials").mockRejectedValue(
      new af.CredentialInvalidError(401, "invalid"),
    )
    const res = await POST(new Request("http://t", {
      method: "POST",
      body: JSON.stringify({
        dev_token: "x".repeat(20), app_id: "com.x",
        app_label: "test", game_key: "sample-match-3", home_currency: "KRW",
      }),
      headers: { "Content-Type": "application/json" },
    }))
    expect(res.status).toBe(401)
  })

  it("returns 404 when validation ping fails with app missing", async () => {
    vi.spyOn(af, "validateCredentials").mockRejectedValue(
      new af.AppMissingError("com.x"),
    )
    const res = await POST(new Request("http://t", {
      method: "POST",
      body: JSON.stringify({
        dev_token: "x".repeat(20), app_id: "com.x",
        app_label: "test", game_key: "sample-match-3", home_currency: "KRW",
      }),
      headers: { "Content-Type": "application/json" },
    }))
    expect(res.status).toBe(404)
  })

  it("returns 409 when app already registered", async () => {
    vi.spyOn(af, "getApp").mockResolvedValue({ appId: "com.x" } as any)
    const res = await POST(new Request("http://t", {
      method: "POST",
      body: JSON.stringify({
        dev_token: "x".repeat(20), app_id: "com.x",
        app_label: "test", game_key: "sample-match-3", home_currency: "KRW",
      }),
      headers: { "Content-Type": "application/json" },
    }))
    expect(res.status).toBe(409)
  })

  it("returns 202 + appId/status when registration succeeds", async () => {
    vi.spyOn(af, "getApp").mockResolvedValue(null)
    vi.spyOn(af, "validateCredentials").mockResolvedValue()
    vi.spyOn(af, "putAccount").mockResolvedValue()
    vi.spyOn(af, "putApp").mockResolvedValue()
    vi.spyOn(af, "putState").mockResolvedValue()
    vi.spyOn(af, "runBackfill").mockResolvedValue({} as any)

    const res = await POST(new Request("http://t", {
      method: "POST",
      body: JSON.stringify({
        dev_token: "x".repeat(20), app_id: "com.x",
        app_label: "test", game_key: "sample-match-3", home_currency: "KRW",
      }),
      headers: { "Content-Type": "application/json" },
    }))
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body.appId).toBe("com.x")
    expect(body.status).toBe("backfilling")
    expect(body.accountId).toMatch(/^acc_[a-f0-9]{8}$/)
  })
})
