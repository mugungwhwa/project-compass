import { NextResponse } from "next/server"
import { getState } from "@/shared/api/appsflyer"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ appId: string }> },
): Promise<Response> {
  const { appId } = await ctx.params
  const state = await getState(appId)
  if (!state) return NextResponse.json({ error: "not_found", appId }, { status: 404 })
  return NextResponse.json(state, {
    status: 200,
    headers: { "Cache-Control": "no-store, must-revalidate" },
  })
}
