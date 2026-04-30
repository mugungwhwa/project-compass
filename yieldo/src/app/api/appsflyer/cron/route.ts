import { NextResponse } from "next/server"
import { listApps, runAppsFlyerSync } from "@/shared/api/appsflyer"

export const dynamic = "force-dynamic"
export const maxDuration = 300

function utcDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function GET(req: Request): Promise<Response> {
  const auth = req.headers.get("Authorization")
  const expected = process.env.CRON_SECRET
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const apps = await listApps()
  const today = new Date()
  const from = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
  const window = { fromIso: utcDate(from), toIso: utcDate(today) }

  const results: Array<{ appId: string; state?: unknown; error?: string }> = []
  for (const app of apps) {
    try {
      const state = await runAppsFlyerSync(app.appId, window)
      results.push({ appId: app.appId, state })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      results.push({ appId: app.appId, error: message })
    }
  }
  return NextResponse.json({ ranAt: new Date().toISOString(), results }, { status: 200 })
}
