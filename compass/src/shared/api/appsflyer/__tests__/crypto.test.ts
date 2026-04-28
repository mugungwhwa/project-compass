import { describe, it, expect, beforeEach } from "vitest"
import { encryptToken, decryptToken, maskToken } from "../crypto"

const VALID_KEY = "a".repeat(64)  // 32 bytes hex

describe("crypto", () => {
  beforeEach(() => {
    process.env.APPSFLYER_MASTER_KEY = VALID_KEY
  })

  it("encrypts then decrypts back to original", () => {
    const plain = "my-dev-token-abc123"
    const cipher = encryptToken(plain)
    expect(cipher).not.toContain(plain)
    expect(cipher.split(":").length).toBe(3)  // iv:ciphertext:tag
    expect(decryptToken(cipher)).toBe(plain)
  })

  it("produces different cipher each time (random iv)", () => {
    const plain = "same-token"
    const c1 = encryptToken(plain)
    const c2 = encryptToken(plain)
    expect(c1).not.toBe(c2)
    expect(decryptToken(c1)).toBe(plain)
    expect(decryptToken(c2)).toBe(plain)
  })

  it("rejects tampered ciphertext", () => {
    const cipher = encryptToken("hello")
    const [iv, ct, tag] = cipher.split(":")
    const tampered = `${iv}:${ct.slice(0, -2)}ff:${tag}`
    expect(() => decryptToken(tampered)).toThrow()
  })

  it("rejects malformed cipher format", () => {
    expect(() => decryptToken("not-a-cipher")).toThrow(/format/)
    expect(() => decryptToken("only:two")).toThrow(/format/)
  })

  it("throws when key is missing", () => {
    delete process.env.APPSFLYER_MASTER_KEY
    expect(() => encryptToken("x")).toThrow(/APPSFLYER_MASTER_KEY/)
  })

  it("throws when key is wrong length", () => {
    process.env.APPSFLYER_MASTER_KEY = "short"
    expect(() => encryptToken("x")).toThrow(/32 bytes/)
  })
})

describe("maskToken", () => {
  it("shows first 4 and last 4 of a long token", () => {
    expect(maskToken("abcd1234efgh5678")).toBe("abcd...5678")
  })

  it("fully masks short tokens", () => {
    expect(maskToken("abc")).toBe("***")
  })
})
