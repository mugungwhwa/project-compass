import { fetchPullReport } from "./fetcher"
import { decryptToken } from "./crypto"
import { aggregate } from "./aggregation"
import {
  getApp, getAccount, getState, putState,
  appendInstalls, appendEvents, putCohortSummary,
  readAllInstalls, readAllEvents,
} from "./blob-store"
import { acquireLock, releaseLock, incrementCalls, resetIfDue } from "./rate-limiter"
import {
  CredentialInvalidError, AppMissingError, ThrottledError, BackfillInProgressError,
} from "./errors"
import { toExtendedInstall, toEventRow, type AppState } from "./types"
import { randomUUID } from "node:crypto"

export type SyncWindow = { fromIso: string; toIso: string }

export async function validateCredentials(devToken: string, appId: string): Promise<void> {
  // Lightest 1-call probe = installs_report 1-day window
  const today = new Date().toISOString().slice(0, 10)
  try {
    await fetchPullReport(devToken, { appId, from: today, to: today }, "installs_report")
  } catch (err: any) {
    if (err.httpStatus === 401 || err.httpStatus === 403) {
      throw new CredentialInvalidError(err.httpStatus, "AppsFlyer credentials invalid")
    }
    if (err.httpStatus === 404) throw new AppMissingError(appId)
    if (err.httpStatus === 429) throw new ThrottledError(60)
    throw err
  }
}

type FailureClassification = {
  status: AppState["status"] | null
  failureType: AppState["failureHistory"][number]["type"]
}

function classifyError(err: any): FailureClassification {
  if (err instanceof CredentialInvalidError) return { status: "credential_invalid", failureType: "auth_invalid" }
  if (err instanceof AppMissingError) return { status: "app_missing", failureType: "not_found" }
  if (err instanceof ThrottledError) return { status: null, failureType: "throttled" }
  if (err?.httpStatus === 401 || err?.httpStatus === 403) return { status: "credential_invalid", failureType: "auth_invalid" }
  if (err?.httpStatus === 404) return { status: "app_missing", failureType: "not_found" }
  if (err?.httpStatus === 429) return { status: null, failureType: "throttled" }
  return { status: null, failureType: "partial" }
}

function shardKey(iso: string): string {
  // YYYY-MM from "YYYY-MM-DD HH:MM:SS" or ISO-T
  return iso.slice(0, 7)
}

type FetchStep = { label: string; report: string; isEvent: boolean }

// Read-fresh-then-merge to avoid clobbering syncLock / callsUsedToday /
// callsResetAt — those are mutated by acquireLock() / incrementCalls() /
// resetIfDue() outside this file's local state copy. Bundling unrelated fields
// into a single putState({ ...staleState, ... }) silently reverts them.
async function mutateState(
  appId: string,
  overrides: (fresh: AppState) => Partial<AppState>,
): Promise<AppState> {
  const fresh = await getState(appId)
  if (!fresh) throw new Error(`state for ${appId} not initialized`)
  const next: AppState = { ...fresh, ...overrides(fresh) }
  await putState(next)
  return next
}

const FETCH_STEPS: FetchStep[] = [
  { label: "non-organic installs", report: "installs_report", isEvent: false },
  { label: "organic installs", report: "organic_installs_report", isEvent: false },
  { label: "in-app events", report: "in_app_events_report", isEvent: true },
  { label: "organic in-app events", report: "organic_in_app_events_report", isEvent: true },
]

export async function runAppsFlyerSync(
  appId: string,
  window: SyncWindow,
): Promise<AppState> {
  const execId = `exec_${randomUUID().slice(0, 8)}`

  const app = await getApp(appId)
  if (!app) throw new AppMissingError(appId)

  const account = await getAccount(app.accountId)
  if (!account) throw new Error(`account ${app.accountId} not found`)

  let state = await getState(appId)
  if (!state) throw new Error(`state for ${appId} not initialized`)

  await resetIfDue(appId)

  const locked = await acquireLock(appId, execId)
  if (!locked) throw new BackfillInProgressError(account.id, "another worker")

  // Refresh after resetIfDue + acquireLock wrote callsResetAt / syncLock.
  state = (await getState(appId)) ?? state

  try {
    const devToken = decryptToken(account.encryptedToken)
    const params = { appId, from: window.fromIso, to: window.toIso }

    let stepIdx = 0
    let rowsFetched = 0

    for (const s of FETCH_STEPS) {
      stepIdx++
      try {
        await incrementCalls(appId, 1)
        const rows = await fetchPullReport(devToken, params, s.report)
        rowsFetched += rows.length

        if (s.isEvent) {
          const events = rows.map(toEventRow)
          const byMonth = new Map<string, ReturnType<typeof toEventRow>[]>()
          for (const e of events) {
            if (!e.eventTime) continue
            const key = shardKey(e.eventTime)
            const list = byMonth.get(key) ?? []
            list.push(e)
            byMonth.set(key, list)
          }
          for (const [month, list] of byMonth) {
            await appendEvents(appId, month, list)
          }
        } else {
          const installs = rows.map(toExtendedInstall)
          const byMonth = new Map<string, ReturnType<typeof toExtendedInstall>[]>()
          for (const i of installs) {
            if (!i.installTime) continue
            const key = shardKey(i.installTime)
            const list = byMonth.get(key) ?? []
            list.push(i)
            byMonth.set(key, list)
          }
          for (const [month, list] of byMonth) {
            await appendInstalls(appId, month, list)
          }
        }

        state = await mutateState(appId, () => ({
          progress: { step: stepIdx, total: 5, currentReport: s.report, rowsFetched },
        }))
      } catch (err: any) {
        const cls = classifyError(err)
        const failureEntry = {
          at: new Date().toISOString(),
          type: cls.failureType,
          message: err.message ?? String(err),
          report: s.report,
        } as const

        if (cls.status === "credential_invalid" || cls.status === "app_missing") {
          return await mutateState(appId, (fresh) => ({
            status: cls.status as AppState["status"],
            failureHistory: [...fresh.failureHistory, failureEntry].slice(-10) as AppState["failureHistory"],
          }))
        }

        // Quota exhausted — abort the whole sync to avoid a false "active" state
        // with no new data written.
        if (err instanceof ThrottledError) {
          state = await mutateState(appId, (fresh) => ({
            failureHistory: [...fresh.failureHistory, failureEntry].slice(-10) as AppState["failureHistory"],
          }))
          throw err
        }

        // partial: persist failure entry and continue to next step
        state = await mutateState(appId, (fresh) => ({
          failureHistory: [...fresh.failureHistory, failureEntry].slice(-10) as AppState["failureHistory"],
        }))
      }
    }

    // Step 5/5: aggregate stored data + cohort summary write.
    // Surface this phase in `progress` so the UI doesn't jump 4/5 → 5/5.
    state = await mutateState(appId, () => ({
      progress: { step: 5, total: 5, currentReport: "aggregate", rowsFetched },
    }))
    const allInstalls = await readAllInstalls(appId)
    const allEvents = await readAllEvents(appId)
    const summary = aggregate(allInstalls, allEvents, account.currency)
    await putCohortSummary(appId, summary)

    return await mutateState(appId, () => ({
      status: "active",
      progress: { step: 5, total: 5, rowsFetched },
      lastSyncAt: new Date().toISOString(),
      lastWindow: { from: window.fromIso, to: window.toIso },
    }))
  } finally {
    await releaseLock(appId, execId)
  }
}

export async function runBackfill(appId: string): Promise<AppState> {
  const today = new Date()
  const fourteen = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
  return runAppsFlyerSync(appId, {
    fromIso: fourteen.toISOString().slice(0, 10),
    toIso: today.toISOString().slice(0, 10),
  })
}
