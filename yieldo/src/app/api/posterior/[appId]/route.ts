import { NextResponse } from "next/server"
import { getPosteriorSnapshot } from "@/shared/api/appsflyer/blob-store"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ appId: string }> },
): Promise<Response> {
  const { appId } = await ctx.params
  const snapshot = await getPosteriorSnapshot(appId)
  if (!snapshot) {
    return NextResponse.json({ error: "not_found", appId }, { status: 404 })
  }
  return NextResponse.json(snapshot, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  })
}
