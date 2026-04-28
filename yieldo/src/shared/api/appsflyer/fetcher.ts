import { afHttp } from "./client"
import { ValidationError } from "./errors"
import type { CsvRow, InstallsParams } from "./types"

const PULL_BASE = "https://hq1.appsflyer.com/api/raw-data/export/app"

/**
 * Minimal CSV 파서 — RFC 4180 준수:
 * - 큰따옴표로 감싼 필드 내 쉼표 / 개행 허용
 * - 이스케이프: `""` → `"`
 * - 맨 앞 BOM 제거
 */
export function parseCsv(text: string): CsvRow[] {
  const stripped = text.replace(/^\uFEFF/, "")
  if (!stripped.trim()) return []

  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i]
    if (inQuotes) {
      if (ch === '"') {
        if (stripped[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ",") {
        row.push(field)
        field = ""
      } else if (ch === "\n" || ch === "\r") {
        row.push(field)
        if (row.some((f) => f !== "")) rows.push(row)
        row = []
        field = ""
        if (ch === "\r" && stripped[i + 1] === "\n") i++
      } else {
        field += ch
      }
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field)
    if (row.some((f) => f !== "")) rows.push(row)
  }

  if (rows.length === 0) return []
  const header = rows[0]
  return rows.slice(1).map((cols) => {
    const obj: CsvRow = {}
    header.forEach((key, idx) => {
      const raw = cols[idx] ?? ""
      if (raw === "") {
        obj[key] = null
      } else if (/^-?\d+(\.\d+)?$/.test(raw)) {
        obj[key] = Number(raw)
      } else {
        obj[key] = raw
      }
    })
    return obj
  })
}

/**
 * Pull API v5 raw data report fetcher.
 *
 * @param reportType installs_report | organic_installs_report | in_app_events_report 등
 */
export async function fetchPullReport(
  devToken: string,
  params: InstallsParams,
  reportType: string,
): Promise<CsvRow[]> {
  const url = `${PULL_BASE}/${encodeURIComponent(params.appId)}/${encodeURIComponent(reportType)}/v5`
  const query: Record<string, string> = {
    from: params.from,
    to: params.to,
    ...(params.additionalFields
      ? { additional_fields: params.additionalFields.join(",") }
      : {}),
  }

  const raw = await afHttp({
    url,
    method: "GET",
    token: devToken,
    query,
    accept: "text/csv",
  })
  if (typeof raw !== "string") {
    throw new ValidationError(
      `pull.${reportType}`,
      "Expected CSV text response from Pull API",
    )
  }
  return parseCsv(raw)
}

export async function fetchNonOrganicInstalls(
  devToken: string,
  params: InstallsParams,
): Promise<CsvRow[]> {
  return fetchPullReport(devToken, params, "installs_report")
}

export async function fetchOrganicInstalls(
  devToken: string,
  params: InstallsParams,
): Promise<CsvRow[]> {
  return fetchPullReport(devToken, params, "organic_installs_report")
}

export async function fetchInAppEvents(
  devToken: string,
  params: InstallsParams,
): Promise<CsvRow[]> {
  return fetchPullReport(devToken, params, "in_app_events_report")
}

export async function fetchOrganicInAppEvents(
  devToken: string,
  params: InstallsParams,
): Promise<CsvRow[]> {
  return fetchPullReport(devToken, params, "organic_in_app_events_report")
}
