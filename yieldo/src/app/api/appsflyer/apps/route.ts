import { NextResponse } from "next/server"
import { listApps } from "@/shared/api/appsflyer"

export const dynamic = "force-dynamic"

export async function GET(): Promise<Response> {
  const apps = await listApps()
  return NextResponse.json(apps, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  })
}
