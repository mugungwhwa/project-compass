// yieldo/scripts/verify-seed-snapshot.ts
//
// Re-runs build-seed-snapshot in-process and compares output against the
// committed src/shared/data/seed-posterior.json. Exits non-zero (and writes
// the diff summary to stderr) if they differ — used as a CI gate so engine
// changes that would silently invalidate the seed are caught at PR time.

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { computePosterior } from "../src/shared/api/posterior"
import type { CohortSummary } from "../src/shared/api/appsflyer/types"

const DEMO_COHORT_DATE = "2026-02-28"
const DEMO_GENRE = "match-3"

const demoCohortSummary: CohortSummary = {
  updatedAt: "2026-04-29T00:00:00.000Z",
  cohorts: [
    {
      cohortDate: DEMO_COHORT_DATE,
      installs: 8000,
      retainedByDay: { d1: 1840, d7: 392, d30: 80 },
      uaSpendUsd: 24_000,
    },
  ],
  revenue: {
    daily: [
      { date: "2026-02-15", sumUsd: 50_000, purchasers: 280 },
      { date: "2026-03-15", sumUsd: 60_000, purchasers: 320 },
      { date: "2026-04-15", sumUsd: 70_000, purchasers: 360 },
    ],
    total: { sumUsd: 180_000, purchasers: 960 },
  },
  spend: { totalUsd: 24_000, homeCurrency: "USD" },
}

const expected = computePosterior(demoCohortSummary, DEMO_GENRE)
const expectedJson = JSON.stringify(expected, null, 2) + "\n"

const seedPath = resolve(__dirname, "..", "src", "shared", "data", "seed-posterior.json")
const actualJson = readFileSync(seedPath, "utf8")

if (expectedJson !== actualJson) {
  console.error("❌ seed-posterior.json is OUT OF DATE")
  console.error("   Committed seed differs from current engine output.")
  console.error("   Likely cause: ENGINE_VERSION bump, prior change, or fixture drift.")
  console.error("   Fix: run `npm run prebuild:seed` to regenerate, then commit.")
  process.exit(1)
}

console.log("✅ seed-posterior.json is up to date")
