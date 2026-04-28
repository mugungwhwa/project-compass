import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

const ALGO = "aes-256-gcm"
const IV_BYTES = 12

function getKey(): Buffer {
  const hex = process.env.APPSFLYER_MASTER_KEY
  if (!hex) {
    throw new Error("APPSFLYER_MASTER_KEY env var is required")
  }
  const key = Buffer.from(hex, "hex")
  if (key.length !== 32) {
    throw new Error(
      `APPSFLYER_MASTER_KEY must decode to 32 bytes (got ${key.length})`
    )
  }
  return key
}

export function encryptToken(plain: string): string {
  const key = getKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGO, key, iv)
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString("hex")}:${ct.toString("hex")}:${tag.toString("hex")}`
}

export function decryptToken(packed: string): string {
  const parts = packed.split(":")
  if (parts.length !== 3) {
    throw new Error("invalid cipher format (expected iv:ct:tag)")
  }
  const [ivHex, ctHex, tagHex] = parts
  const key = getKey()
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"))
  decipher.setAuthTag(Buffer.from(tagHex, "hex"))
  const plain = Buffer.concat([
    decipher.update(Buffer.from(ctHex, "hex")),
    decipher.final(),
  ])
  return plain.toString("utf8")
}

export function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex")
}

export function maskToken(token: string): string {
  if (token.length <= 8) return "***"
  return `${token.slice(0, 4)}...${token.slice(-4)}`
}
