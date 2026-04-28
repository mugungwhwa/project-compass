import { describe, it, expect } from "vitest"
import {
  CredentialInvalidError, AppMissingError,
  ThrottledError, BackfillInProgressError,
} from "../errors"

describe("post-registration errors", () => {
  it("CredentialInvalidError preserves http status and message", () => {
    const e = new CredentialInvalidError(401, "token expired")
    expect(e.name).toBe("CredentialInvalidError")
    expect(e.httpStatus).toBe(401)
    expect(e.message).toBe("token expired")
  })

  it("AppMissingError captures appId", () => {
    const e = new AppMissingError("com.x")
    expect(e.appId).toBe("com.x")
  })

  it("ThrottledError carries retryAfterSec", () => {
    const e = new ThrottledError(60)
    expect(e.retryAfterSec).toBe(60)
  })

  it("BackfillInProgressError indicates concurrent sync", () => {
    const e = new BackfillInProgressError("acc_a1b2c3d4", "exec_xyz")
    expect(e.heldBy).toBe("exec_xyz")
  })
})
