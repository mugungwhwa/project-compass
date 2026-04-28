import { z } from "zod"

/* ─────────── 호출 파라미터 (Pull API v5) ─────────── */

export const InstallsParamsSchema = z.object({
  appId: z.string().min(1),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  additionalFields: z.array(z.string()).optional(),
})
export type InstallsParams = z.infer<typeof InstallsParamsSchema>

/* ─────────── 응답 Row ─────────── */

/** CSV 파싱 직후 로우: 헤더 그대로 키로 사용 (81개 컬럼 원본 보존). */
export type CsvRow = Record<string, string | number | null>

/** 스냅샷에 저장하는 경량 row — 필요한 컬럼만 추출. */
export const CompactInstallSchema = z.object({
  installTime: z.string().nullable(),       // "Install Time"
  partner: z.string().nullable(),           // "Partner"
  mediaSource: z.string().nullable(),       // "Media Source"
  costValue: z.number().nullable(),         // "Cost Value" (광고비, home currency)
  eventRevenueUsd: z.number().nullable(),   // "Event Revenue USD"
  eventName: z.string().nullable(),         // "Event Name"
  countryCode: z.string().nullable(),       // "Country Code"
  platform: z.string().nullable(),          // "Platform"
})
export type CompactInstall = z.infer<typeof CompactInstallSchema>

/**
 * CSV 81컬럼 raw row → 스냅샷 저장용 경량 row 로 투영.
 * 미지정 컬럼은 무시하여 snapshot 용량을 최소화.
 */
export function toCompactInstall(row: CsvRow): CompactInstall {
  const str = (v: unknown): string | null =>
    typeof v === "string" && v !== "" ? v : null
  const num = (v: unknown): number | null =>
    typeof v === "number" ? v : null
  return {
    installTime: str(row["Install Time"]),
    partner: str(row["Partner"]),
    mediaSource: str(row["Media Source"]),
    costValue: num(row["Cost Value"]),
    eventRevenueUsd: num(row["Event Revenue USD"]),
    eventName: str(row["Event Name"]),
    countryCode: str(row["Country Code"]),
    platform: str(row["Platform"]),
  }
}

/* ─────────── 스냅샷 ─────────── */

export const SnapshotSchema = z.object({
  version: z.literal(2),
  fetchedAt: z.string().datetime(),
  request: z.object({
    appId: z.string(),
    from: z.string(),
    to: z.string(),
  }).nullable(),
  installs: z.object({
    nonOrganic: z.array(CompactInstallSchema),
    organic: z.array(CompactInstallSchema),
  }).nullable(),
  meta: z.object({
    warnings: z.array(z.string()),
    source: z.literal("pull-api-v5"),
  }),
})
export type AppsFlyerSnapshot = z.infer<typeof SnapshotSchema>

/* ─────────── API Route 요청 body ─────────── */

export const SyncRequestSchema = z.object({
  dev_token: z.string().min(1),
  home_currency: z.enum(["KRW", "USD", "JPY", "EUR"]),
  app_ids: z.string().min(1),
  sync_frequency: z.string(),
  dry_run: z.boolean().optional(),
})
export type SyncRequest = z.infer<typeof SyncRequestSchema>

export type HomeCurrency = z.infer<typeof SyncRequestSchema>["home_currency"]

/* ─────────── runAppsFlyerSync 인자/반환 ─────────── */

export type RunSyncOptions = {
  devToken: string
  appIds: string[]
  homeCurrency: HomeCurrency
  installs: InstallsParams | null
  fetchOrganic?: boolean
}

export type RunSyncResult = {
  snapshot: AppsFlyerSnapshot
  warnings: string[]
  summary: {
    nonOrganicCount: number
    organicCount: number
    durationMs: number
  }
}

/* ─────────── UI 카드 파생 ─────────── */

export type ConnectionStatusLive =
  | "connected" | "warn" | "error" | "disconnected"

export type AppsFlyerCardData = {
  status: ConnectionStatusLive
  lastSync: string
  metrics: Array<{ label: string; value: string }>
  retentionDepth: string | null
}

export const EMPTY_CARD: AppsFlyerCardData = {
  status: "disconnected",
  lastSync: "아직 sync 없음",
  metrics: [],
  retentionDepth: null,
}

// === v3 schemas: Account / App / State / CohortSummary / Register ===

export const AccountSchema = z.object({
  id: z.string().regex(/^acc_[a-f0-9]{8}$/),
  tokenHash: z.string().length(64),
  encryptedToken: z.string().min(1),
  currency: z.enum(["KRW", "USD", "JPY", "EUR"]),
  label: z.string().max(80),
  createdAt: z.string().datetime(),
})
export type Account = z.infer<typeof AccountSchema>

const GameKeySchema = z.enum([
  "portfolio",
  "sample-match-3",
  "sample-puzzle",
  "sample-idle",
])
export type GameKey = z.infer<typeof GameKeySchema>

export const AppSchema = z.object({
  appId: z.string().regex(/^[a-zA-Z0-9._-]{3,64}$/),
  accountId: z.string().regex(/^acc_[a-f0-9]{8}$/),
  gameKey: GameKeySchema,
  label: z.string().max(80),
  createdAt: z.string().datetime(),
  // LSTM Phase 2: 장르/지역 prior lookup용. 미설정 게임은 sufficiency check에서 skip
  genre: z.string().min(1).max(40).optional(),
  region: z.string().min(2).max(8).optional(),
})
export type App = z.infer<typeof AppSchema>

export const AppStatusSchema = z.enum([
  "backfilling",
  "active",
  "stale",
  "failed",
  "credential_invalid",
  "app_missing",
])
export type AppStatus = z.infer<typeof AppStatusSchema>

export const FailureTypeSchema = z.enum([
  "retryable",
  "throttled",
  "auth_invalid",
  "not_found",
  "partial",
  "full_failure",
])

export const StateSchema = z.object({
  appId: z.string(),
  status: AppStatusSchema,
  progress: z.object({
    step: z.number().int().min(0).max(5),
    total: z.literal(5),
    currentReport: z.string().optional(),
    rowsFetched: z.number().int().nonnegative(),
  }),
  lastSyncAt: z.string().datetime().optional(),
  lastWindow: z
    .object({ from: z.string(), to: z.string() })
    .optional(),
  callsUsedToday: z.number().int().min(0).max(20),
  callsResetAt: z.string().datetime(),
  syncLock: z
    .object({
      heldBy: z.string(),
      heldAt: z.string().datetime(),
      ttlMs: z.literal(300_000),
    })
    .nullable(),
  failureHistory: z
    .array(
      z.object({
        at: z.string().datetime(),
        type: FailureTypeSchema,
        message: z.string(),
        report: z.string().optional(),
      })
    )
    .max(10),
})
export type AppState = z.infer<typeof StateSchema>

export const CohortObservationSchema = z.object({
  cohortDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  installs: z.number().int().nonnegative(),
  retainedByDay: z.object({
    d1: z.number().int().nonnegative().nullable(),
    d7: z.number().int().nonnegative().nullable(),
    d30: z.number().int().nonnegative().nullable(),
  }),
  // null = home_currency unsupported by FX layer (e.g. JPY/EUR) OR no costed
  // installs in this cohort. Distinguished from 0 (organic-only cohort with
  // a supported currency). Defaulted on parse so older blob entries written
  // before this field existed continue to deserialize.
  uaSpendUsd: z.number().nullable().default(null),
})
export type CohortObservation = z.infer<typeof CohortObservationSchema>

export const CohortSummarySchema = z.object({
  updatedAt: z.string().datetime(),
  cohorts: z.array(CohortObservationSchema),
  revenue: z.object({
    daily: z.array(
      z.object({
        date: z.string(),
        sumUsd: z.number().nonnegative(),
        purchasers: z.number().int().nonnegative(),
      })
    ),
    total: z.object({
      sumUsd: z.number().nonnegative(),
      purchasers: z.number().int().nonnegative(),
    }),
  }),
  // Aggregate UA spend in USD across all cohorts, plus the home_currency the
  // app was registered with. null totalUsd means the home_currency was not
  // FX-supported (currently anything other than USD/KRW).
  spend: z
    .object({
      totalUsd: z.number().nullable(),
      homeCurrency: z.string(),
    })
    .default({ totalUsd: null, homeCurrency: "USD" }),
})
export type CohortSummary = z.infer<typeof CohortSummarySchema>

export const RegisterRequestSchema = z.object({
  dev_token: z.string().min(20),
  app_id: z.string().regex(/^[a-zA-Z0-9._-]{3,64}$/),
  app_label: z.string().max(80),
  game_key: GameKeySchema,
  home_currency: z.enum(["KRW", "USD", "JPY", "EUR"]).default("KRW"),
  // LSTM Phase 2: 장르/지역 prior lookup용. 미입력 시 cron sufficiency check에서 skip
  genre: z.string().min(1).max(40).optional(),
  region: z.string().min(2).max(8).optional(),
})
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

// === Row-level types for sync pipeline (used by blob-store + aggregation) ===

export const ExtendedInstallSchema = z.object({
  installTime: z.string().nullable(),
  partner: z.string().nullable(),
  mediaSource: z.string().nullable(),
  costValue: z.number().nullable(),
  eventRevenueUsd: z.number().nullable(),
  eventName: z.string().nullable(),
  countryCode: z.string().nullable(),
  platform: z.string().nullable(),
  appsflyerId: z.string().nullable(),
  eventTime: z.string().nullable(),
})
export type ExtendedInstall = z.infer<typeof ExtendedInstallSchema>

export const EventRowSchema = z.object({
  appsflyerId: z.string().nullable(),
  eventTime: z.string().nullable(),
  eventName: z.string().nullable(),
  eventRevenueUsd: z.number().nullable(),
})
export type EventRow = z.infer<typeof EventRowSchema>

const str = (v: unknown): string | null =>
  typeof v === "string" && v !== "" ? v : null
const num = (v: unknown): number | null =>
  typeof v === "number" ? v : null

/**
 * Map an 81-column AppsFlyer Pull API CSV row → ExtendedInstall.
 * Caller filters out rows with null `appsflyerId` before joining.
 */
export function toExtendedInstall(row: CsvRow): ExtendedInstall {
  return {
    installTime: str(row["Install Time"]),
    partner: str(row["Partner"]),
    mediaSource: str(row["Media Source"]),
    costValue: num(row["Cost Value"]),
    eventRevenueUsd: num(row["Event Revenue USD"]),
    eventName: str(row["Event Name"]),
    countryCode: str(row["Country Code"]),
    platform: str(row["Platform"]),
    appsflyerId: str(row["AppsFlyer ID"]),
    eventTime: str(row["Event Time"]),
  }
}

export function toEventRow(row: CsvRow): EventRow {
  return {
    appsflyerId: str(row["AppsFlyer ID"]),
    eventTime: str(row["Event Time"]),
    eventName: str(row["Event Name"]),
    eventRevenueUsd: num(row["Event Revenue USD"]),
  }
}
