import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import {
  RegisterRequestSchema, AccountSchema, AppSchema, StateSchema,
  validateCredentials, encryptToken, hashToken,
  putAccount, putApp, putState, getApp, runBackfill,
  CredentialInvalidError, AppMissingError,
} from "@/shared/api/appsflyer"

export const dynamic = "force-dynamic"
export const maxDuration = 30  // validation ping + Blob writes only — backfill is fire-and-forget

function newAccountId(): string {
  return `acc_${randomUUID().replace(/-/g, "").slice(0, 8)}`
}

function midnightUtcTomorrow(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 1)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null)
  const parsed = RegisterRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    )
  }
  const { dev_token, app_id, app_label, game_key, home_currency, genre, region } = parsed.data

  // Conflict check
  const existing = await getApp(app_id)
  if (existing) {
    return NextResponse.json(
      { error: "app_already_registered", appId: app_id },
      { status: 409 },
    )
  }

  // Validation ping (1 call: installs_report 1-day window)
  try {
    await validateCredentials(dev_token, app_id)
  } catch (err) {
    if (err instanceof CredentialInvalidError) {
      return NextResponse.json(
        { error: "credential_invalid", message: (err as Error).message },
        { status: 401 },
      )
    }
    if (err instanceof AppMissingError) {
      return NextResponse.json(
        { error: "app_missing", appId: app_id },
        { status: 404 },
      )
    }
    return NextResponse.json(
      { error: "validation_failed", message: (err as Error).message },
      { status: 502 },
    )
  }

  // Persist account, app, initial state
  const accountId = newAccountId()
  const now = new Date().toISOString()
  const account = AccountSchema.parse({
    id: accountId,
    tokenHash: hashToken(dev_token),
    encryptedToken: encryptToken(dev_token),
    currency: home_currency,
    label: app_label,
    createdAt: now,
  })
  const app = AppSchema.parse({
    appId: app_id, accountId, gameKey: game_key, label: app_label, createdAt: now,
    genre, region,
  })
  const initialState = StateSchema.parse({
    appId: app_id,
    status: "backfilling",
    progress: { step: 0, total: 5, rowsFetched: 0 },
    callsUsedToday: 1,  // validation ping consumed 1 call
    callsResetAt: midnightUtcTomorrow(),
    syncLock: null,
    failureHistory: [],
  })

  await putAccount(account)
  await putApp(app)
  await putState(initialState)

  // Background backfill — fire and forget. Errors are recorded in state by orchestrator.
  // Note: Vercel's `waitUntil` is preferred when available, but `void runBackfill(...)`
  // works as a fallback (the request handler returns before backfill completes).
  void runBackfill(app_id).catch((err) => {
    console.error(`backfill failed for ${app_id}:`, err)
  })

  return NextResponse.json(
    { appId: app_id, status: "backfilling", accountId },
    { status: 202 },
  )
}
