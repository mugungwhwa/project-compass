import { NextResponse } from "next/server"
import { runAppsFlyerSync, BackfillInProgressError } from "@/shared/api/appsflyer"

export const dynamic = "force-dynamic"
export const maxDuration = 300  // up to 5 minutes for full sync

function utcDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ appId: string }> },
): Promise<Response> {
  const { appId } = await ctx.params
  const body = await req.json().catch(() => ({}))
  // Clamp days to [1, 14] (Pull API max window)
  const requestedDays = typeof body?.days === "number" ? body.days : 14
  const days = Math.max(1, Math.min(14, requestedDays))

  const today = new Date()
  const from = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)

  try {
    const state = await runAppsFlyerSync(appId, {
      fromIso: utcDate(from),
      toIso: utcDate(today),
    })
    return NextResponse.json({ appId, state }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof BackfillInProgressError) {
      return NextResponse.json(
        { error: "in_progress", message: err.message },
        { status: 409 },
      )
    }
    const e = err instanceof Error ? err : null
    return NextResponse.json(
      {
        error: e?.name ?? "sync_failed",
        message: e?.message ?? "unknown error",
      },
      { status: 500 },
    )
  }
}
