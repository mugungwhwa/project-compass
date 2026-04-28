import { NextResponse } from "next/server"
import { getCohortSummary } from "@/shared/api/appsflyer"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ appId: string }> },
): Promise<Response> {
  const { appId } = await ctx.params
  const summary = await getCohortSummary(appId)
  if (!summary)
    return NextResponse.json({ error: "not_found", appId }, { status: 404 })
  return NextResponse.json(summary, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  })
}
