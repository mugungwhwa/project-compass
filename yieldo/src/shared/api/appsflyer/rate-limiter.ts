import { getState, putState } from "./blob-store"
import { AppMissingError, ThrottledError } from "./errors"

const QUOTA = 20
const LOCK_TTL_MS = 300_000  // 5분

export async function incrementCalls(appId: string, delta: number): Promise<void> {
  const state = await getState(appId)
  if (!state) throw new AppMissingError(appId)
  const newCount = state.callsUsedToday + delta
  if (newCount > QUOTA) {
    const retryAfter = Math.max(1, Math.ceil((new Date(state.callsResetAt).getTime() - Date.now()) / 1000))
    throw new ThrottledError(retryAfter)
  }
  await putState({ ...state, callsUsedToday: newCount })
}

export async function isResetDue(appId: string): Promise<boolean> {
  const state = await getState(appId)
  if (!state) return false
  return Date.now() >= new Date(state.callsResetAt).getTime()
}

export async function resetIfDue(appId: string): Promise<void> {
  const state = await getState(appId)
  if (!state) return
  if (Date.now() < new Date(state.callsResetAt).getTime()) return
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  tomorrow.setUTCHours(0, 0, 0, 0)
  await putState({
    ...state,
    callsUsedToday: 0,
    callsResetAt: tomorrow.toISOString(),
  })
}

// Vercel Blob does not expose conditional / compare-and-set writes, so this
// uses a claim-then-verify pattern: write our lease, jitter, re-read, and
// only succeed if our execId is still the persisted holder. With daily cron
// (~1 invocation/app/day) the residual race window is bounded by Blob's
// read-after-write consistency (~tens of ms), well below the 300s TTL.
const VERIFY_DELAY_MIN_MS = 80
const VERIFY_DELAY_JITTER_MS = 80

export async function acquireLock(appId: string, execId: string): Promise<boolean> {
  const state = await getState(appId)
  if (!state) return false
  if (state.syncLock !== null) {
    const heldEpoch = new Date(state.syncLock.heldAt).getTime()
    if (Date.now() - heldEpoch < LOCK_TTL_MS) return false  // still valid
    // else: expired, fall through and overwrite
  }
  await putState({
    ...state,
    syncLock: {
      heldBy: execId,
      heldAt: new Date().toISOString(),
      ttlMs: LOCK_TTL_MS as 300000,
    },
  })
  await new Promise((resolve) =>
    setTimeout(resolve, VERIFY_DELAY_MIN_MS + Math.random() * VERIFY_DELAY_JITTER_MS),
  )
  const verified = await getState(appId)
  return verified?.syncLock?.heldBy === execId
}

export async function releaseLock(appId: string, execId: string): Promise<void> {
  const state = await getState(appId)
  if (!state || !state.syncLock || state.syncLock.heldBy !== execId) return
  await putState({ ...state, syncLock: null })
}
