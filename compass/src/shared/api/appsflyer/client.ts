import {
  AuthError,
  NetworkError,
  RateLimitError,
  TimeoutError,
} from "./errors"

export type AfHttpOptions = {
  url: string
  method: "GET" | "POST"
  token: string
  body?: unknown
  query?: Record<string, string>
  timeoutMs?: number
  maxRetries?: number
  accept?: "application/json" | "text/csv"
}

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_MAX_RETRIES = 3

export async function afHttp(opts: AfHttpOptions): Promise<unknown> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES

  const url = new URL(opts.url)
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) url.searchParams.set(k, v)
  }

  const accept = opts.accept ?? "application/json"

  const doRequest = async (): Promise<unknown> => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        method: opts.method,
        headers: {
          Authorization: `Bearer ${opts.token}`,
          Accept: accept,
          ...(opts.method === "POST" ? { "Content-Type": "application/json" } : {}),
        },
        body: opts.method === "POST" && opts.body !== undefined
          ? JSON.stringify(opts.body)
          : undefined,
        signal: ctrl.signal,
      })

      if (res.status === 401 || res.status === 403) {
        throw new AuthError(`HTTP ${res.status}`)
      }
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after") ?? "1")
        throw new RateLimitError(Number.isFinite(retryAfter) ? retryAfter : 1)
      }
      if (!res.ok) {
        throw new NetworkError(`HTTP ${res.status}`)
      }
      if (accept === "text/csv") return (await res.text()) as unknown
      return (await res.json()) as unknown
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new TimeoutError()
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }

  let lastErr: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await doRequest()
    } catch (err) {
      lastErr = err
      if (err instanceof AuthError) throw err
      if (attempt === maxRetries) break
      const backoffMs =
        err instanceof RateLimitError
          ? err.retryAfterSec * 1000
          : Math.min(4000, 1000 * 2 ** attempt)
      await new Promise((r) => setTimeout(r, backoffMs))
    }
  }
  throw lastErr
}
