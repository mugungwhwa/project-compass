import { put, list, get } from "@vercel/blob"
import {
  AccountSchema, AppSchema, StateSchema, CohortSummarySchema,
  type Account, type App, type AppState as State, type CohortSummary,
  type ExtendedInstall, type EventRow,
} from "./types"
import { PosteriorSnapshotSchema, type PosteriorSnapshot } from "@/shared/api/posterior/snapshot-v2"

const PREFIX = "appsflyer"

// Private store: SDK 의 get() 이 BLOB_READ_WRITE_TOKEN 으로 자동 인증 + stream 반환.
// (fetch(meta.url) 는 private store 에서 401 — 반드시 get() 경유)
async function fetchJson<T>(path: string, schema: { parse: (x: unknown) => T }): Promise<T | null> {
  try {
    const result = await get(path, { access: "private" })
    if (!result || result.statusCode !== 200) return null
    const text = await new Response(result.stream).text()
    return schema.parse(JSON.parse(text))
  } catch {
    return null
  }
}

async function fetchJsonl(path: string): Promise<string[]> {
  try {
    const result = await get(path, { access: "private" })
    if (!result || result.statusCode !== 200) return []
    const text = await new Response(result.stream).text()
    return text.trim() === "" ? [] : text.trim().split("\n")
  } catch {
    return []
  }
}

// Vercel Blob private store 에 저장. Token 은 AES-256-GCM 암호화 + store private = 2중 방어.
const writeOpts = { access: "private" as const, contentType: "application/json", addRandomSuffix: false, allowOverwrite: true }

// ========== accounts ==========
export async function putAccount(acc: Account): Promise<void> {
  const v = AccountSchema.parse(acc)
  await put(`${PREFIX}/accounts/${v.id}.json`, JSON.stringify(v), writeOpts)
}
export async function getAccount(id: string): Promise<Account | null> {
  return fetchJson(`${PREFIX}/accounts/${id}.json`, AccountSchema)
}

// ========== apps ==========
export async function putApp(app: App): Promise<void> {
  const v = AppSchema.parse(app)
  await put(`${PREFIX}/apps/${v.appId}.json`, JSON.stringify(v), writeOpts)
}
export async function getApp(appId: string): Promise<App | null> {
  return fetchJson(`${PREFIX}/apps/${appId}.json`, AppSchema)
}
export async function listApps(): Promise<App[]> {
  const { blobs } = await list({ prefix: `${PREFIX}/apps/` })
  const apps = await Promise.all(
    blobs.map(async (b) => {
      try {
        const result = await get(b.pathname, { access: "private" })
        if (!result || result.statusCode !== 200) return null
        const text = await new Response(result.stream).text()
        return AppSchema.parse(JSON.parse(text))
      } catch { return null }
    }),
  )
  return apps.filter((a): a is App => a !== null)
}

// ========== state ==========
export async function putState(state: State): Promise<void> {
  const v = StateSchema.parse(state)
  await put(`${PREFIX}/state/${v.appId}.json`, JSON.stringify(v), { ...writeOpts, cacheControlMaxAge: 0 })
}
export async function getState(appId: string): Promise<State | null> {
  return fetchJson(`${PREFIX}/state/${appId}.json`, StateSchema)
}

// ========== cohort summary ==========
export async function putCohortSummary(appId: string, summary: CohortSummary): Promise<void> {
  const v = CohortSummarySchema.parse(summary)
  await put(`${PREFIX}/cohort/${appId}/summary.json`, JSON.stringify(v), writeOpts)
}
export async function getCohortSummary(appId: string): Promise<CohortSummary | null> {
  return fetchJson(`${PREFIX}/cohort/${appId}/summary.json`, CohortSummarySchema)
}

// ========== installs JSONL ==========
function installKey(i: ExtendedInstall): string {
  return `${i.appsflyerId}|${i.installTime}`
}

export async function appendInstalls(
  appId: string, yyyymm: string, fresh: ExtendedInstall[],
): Promise<void> {
  const path = `${PREFIX}/installs/${appId}/${yyyymm}.jsonl`
  const existingLines = await fetchJsonl(path)
  const existing: ExtendedInstall[] = existingLines.map((l) => JSON.parse(l))
  // Filter rows lacking the join key — they cannot dedup or join with events.
  // (Plan §1.4: caller filter contract is now enforced at the storage boundary.)
  const usable = fresh.filter((i) => i.appsflyerId !== null && i.installTime !== null)
  const seen = new Set(existing.filter((i) => i.appsflyerId !== null && i.installTime !== null).map(installKey))
  const merged = [...existing]
  for (const i of usable) {
    const k = installKey(i)
    if (!seen.has(k)) { merged.push(i); seen.add(k) }
  }
  await put(path, merged.map((i) => JSON.stringify(i)).join("\n"),
    { ...writeOpts, contentType: "application/x-ndjson" })
}

export async function listInstallShards(appId: string): Promise<string[]> {
  const { blobs } = await list({ prefix: `${PREFIX}/installs/${appId}/` })
  return blobs.map((b) => b.pathname)
}

export async function readAllInstalls(appId: string): Promise<ExtendedInstall[]> {
  const shards = await listInstallShards(appId)
  const all: ExtendedInstall[] = []
  for (const path of shards) {
    const lines = await fetchJsonl(path)
    for (const l of lines) all.push(JSON.parse(l))
  }
  return all
}

// ========== events JSONL ==========
function eventKey(e: EventRow): string {
  return `${e.appsflyerId}|${e.eventName}|${e.eventTime}`
}

export async function appendEvents(
  appId: string, yyyymm: string, fresh: EventRow[],
): Promise<void> {
  const path = `${PREFIX}/events/${appId}/${yyyymm}.jsonl`
  const existingLines = await fetchJsonl(path)
  const existing: EventRow[] = existingLines.map((l) => JSON.parse(l))
  // Filter rows lacking the join key (boundary-enforced caller contract).
  const usable = fresh.filter((e) => e.appsflyerId !== null && e.eventTime !== null && e.eventName !== null)
  const seen = new Set(
    existing.filter((e) => e.appsflyerId !== null && e.eventTime !== null && e.eventName !== null).map(eventKey),
  )
  const merged = [...existing]
  for (const e of usable) {
    const k = eventKey(e)
    if (!seen.has(k)) { merged.push(e); seen.add(k) }
  }
  await put(path, merged.map((e) => JSON.stringify(e)).join("\n"),
    { ...writeOpts, contentType: "application/x-ndjson" })
}

export async function readAllEvents(appId: string): Promise<EventRow[]> {
  const { blobs } = await list({ prefix: `${PREFIX}/events/${appId}/` })
  const all: EventRow[] = []
  for (const b of blobs) {
    const lines = await fetchJsonl(b.pathname)
    for (const l of lines) all.push(JSON.parse(l))
  }
  return all
}

// ========== posterior snapshot (v2) ==========
// Note: PosteriorSnapshot wraps CohortSummary (sensitive cohort data) plus engine output.
// Stored in the private blob store, mirroring the existing putCohortSummary/getCohortSummary
// convention. The spec used `posterior/${appId}.json` as the key (no PREFIX) — preserved here.
export async function putPosteriorSnapshot(
  appId: string,
  snapshot: PosteriorSnapshot,
): Promise<void> {
  const validated = PosteriorSnapshotSchema.parse(snapshot)
  await put(`posterior/${appId}.json`, JSON.stringify(validated), writeOpts)
}

export async function getPosteriorSnapshot(appId: string): Promise<PosteriorSnapshot | null> {
  return fetchJson(`posterior/${appId}.json`, PosteriorSnapshotSchema)
}
