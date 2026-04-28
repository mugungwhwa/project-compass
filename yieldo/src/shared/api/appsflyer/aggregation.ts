import type {
  ExtendedInstall,
  EventRow,
  CohortObservation,
  CohortSummary,
  HomeCurrency,
} from "./types"
import { convertToUsd, isCurrencySupported } from "@/shared/lib/currency"

const DAY_MS = 24 * 60 * 60 * 1000
const SESSION_EVENTS = new Set(["af_session", "af_app_opened"])

function parseEpoch(iso: string): number {
  // AppsFlyer Pull API CSV: "YYYY-MM-DD HH:MM:SS" implicit UTC.
  // Defensive: trim whitespace (CSV fields may carry trailing spaces),
  // replace space with T, ensure trailing Z (idempotent).
  const normalized = iso.trim().replace(" ", "T").replace(/Z?$/, "Z")
  return new Date(normalized).getTime()
}

function toUtcDate(iso: string): string {
  return new Date(parseEpoch(iso)).toISOString().slice(0, 10)
}

function aggregateCohorts(
  installs: ExtendedInstall[],
  events: EventRow[],
  homeCurrency: HomeCurrency,
): CohortObservation[] {
  const now = Date.now()
  const valid = installs.filter((i) => i.appsflyerId !== null && i.installTime !== null)
  const fxSupported = isCurrencySupported(homeCurrency)

  // Each user belongs to exactly one cohort = their earliest install date.
  // Repeated install rows for the same appsflyerId (re-installs, multi-device,
  // duplicated CSV rows) collapse into a single membership. Cost is taken
  // from the row that wins the earliest-epoch tie because AppsFlyer attributes
  // UA spend to the original paid install — subsequent re-attribution rows
  // are organic-to-AF and would double-count.
  const firstInstall = new Map<
    string,
    { epoch: number; date: string; costUsd: number | null }
  >()
  for (const i of valid) {
    const epoch = parseEpoch(i.installTime!)
    const prior = firstInstall.get(i.appsflyerId!)
    if (!prior || epoch < prior.epoch) {
      firstInstall.set(i.appsflyerId!, {
        epoch,
        date: toUtcDate(i.installTime!),
        costUsd: convertToUsd(i.costValue, homeCurrency),
      })
    }
  }

  const userEpoch = new Map<string, number>()
  const cohortMembers = new Map<string, Set<string>>()
  for (const [userId, { epoch, date }] of firstInstall) {
    userEpoch.set(userId, epoch)
    const members = cohortMembers.get(date) ?? new Set<string>()
    members.add(userId)
    cohortMembers.set(date, members)
  }

  // Bucket session event timestamps by user (filter non-session up front)
  const sessionsByUser = new Map<string, number[]>()
  for (const e of events) {
    if (!e.appsflyerId || !e.eventTime || !e.eventName) continue
    if (!SESSION_EVENTS.has(e.eventName)) continue
    const list = sessionsByUser.get(e.appsflyerId) ?? []
    list.push(parseEpoch(e.eventTime))
    sessionsByUser.set(e.appsflyerId, list)
  }

  const out: CohortObservation[] = []
  for (const [cohortDate, members] of cohortMembers.entries()) {
    // Use min user-epoch in cohort to determine "window measurable" cutoff.
    // (Conservative: if even the earliest installer hasn't had N days, return null.)
    let earliestEpoch = Infinity
    for (const u of members) {
      const ep = userEpoch.get(u)!
      if (ep < earliestEpoch) earliestEpoch = ep
    }
    const elapsedDays = (now - earliestEpoch) / DAY_MS

    const countRetained = (n: number): number | null => {
      if (elapsedDays < n) return null
      let retained = 0
      for (const userId of members) {
        const epoch = userEpoch.get(userId)!
        const windowEnd = epoch + n * DAY_MS
        const sessions = sessionsByUser.get(userId) ?? []
        if (sessions.some((t) => t > epoch && t <= windowEnd)) retained++
      }
      return retained
    }

    // Spend semantics:
    // - FX supported (USD/KRW): start at 0 and accumulate per-user costUsd.
    //   An organic-only cohort therefore reports 0, which is meaningfully
    //   different from "couldn't measure".
    // - FX unsupported (JPY/EUR/...): we can't convert any costValue, so
    //   leave the field null to signal "spend not measurable for this app".
    let cohortSpendUsd: number | null = fxSupported ? 0 : null
    if (fxSupported) {
      for (const userId of members) {
        const cost = firstInstall.get(userId)!.costUsd
        if (cost !== null) cohortSpendUsd = (cohortSpendUsd ?? 0) + cost
      }
    }

    out.push({
      cohortDate,
      installs: members.size,
      retainedByDay: {
        d1: countRetained(1),
        d7: countRetained(7),
        d30: countRetained(30),
      },
      uaSpendUsd: cohortSpendUsd,
    })
  }

  return out.sort((a, b) => a.cohortDate.localeCompare(b.cohortDate))
}

function aggregateRevenue(events: EventRow[]): CohortSummary["revenue"] {
  const byDay = new Map<string, { sumUsd: number; users: Set<string> }>()
  for (const e of events) {
    if (e.eventRevenueUsd === null || !e.eventTime || !e.appsflyerId) continue
    const date = toUtcDate(e.eventTime)
    const entry = byDay.get(date) ?? { sumUsd: 0, users: new Set<string>() }
    entry.sumUsd += e.eventRevenueUsd
    entry.users.add(e.appsflyerId)
    byDay.set(date, entry)
  }
  const daily = Array.from(byDay.entries())
    .map(([date, { sumUsd, users }]) => ({ date, sumUsd, purchasers: users.size }))
    .sort((a, b) => a.date.localeCompare(b.date))
  let totalSum = 0
  const allUsers = new Set<string>()
  for (const { sumUsd, users } of byDay.values()) {
    totalSum += sumUsd
    for (const u of users) allUsers.add(u)
  }
  return {
    daily,
    total: { sumUsd: totalSum, purchasers: allUsers.size },
  }
}

export function aggregate(
  installs: ExtendedInstall[],
  events: EventRow[],
  homeCurrency: HomeCurrency = "USD",
): CohortSummary {
  const cohorts = aggregateCohorts(installs, events, homeCurrency)
  const fxSupported = isCurrencySupported(homeCurrency)
  const totalUsd = fxSupported
    ? cohorts.reduce((acc, c) => acc + (c.uaSpendUsd ?? 0), 0)
    : null
  return {
    updatedAt: new Date().toISOString(),
    cohorts,
    revenue: aggregateRevenue(events),
    spend: { totalUsd, homeCurrency },
  }
}
