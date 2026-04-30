// yieldo/scripts/build-seed-snapshot.ts
//
// Generates src/shared/data/seed-posterior.json from a hardcoded "Match League"
// demo cohort. Run automatically by `npm run prebuild` (and verified by CI via
// `npm run verify-seed`). Re-runs are idempotent: same inputs + ENGINE_VERSION
// produce byte-identical output.
//
// Why hardcoded: mockPriorPosterior in shared/api/mock-data.ts is row-shaped
// (per-metric values), not CohortSummary-shaped. Bridging would require fragile
// parsing. A small inline fixture is clearer and gives stable demo output.

import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { computePosterior } from "../src/shared/api/posterior"
import type { CohortSummary } from "../src/shared/api/appsflyer/types"

const DEMO_COHORT_DATE = "2026-02-28" // 60 days before 2026-04-29
const DEMO_GENRE = "match-3"           // Match League is match-3-style

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

const snapshot = computePosterior(demoCohortSummary, DEMO_GENRE)

const outPath = resolve(__dirname, "..", "src", "shared", "data", "seed-posterior.json")
writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + "\n")

console.log(`✅ seed-posterior.json generated: ${outPath}`)
console.log(`   engineVersion=${snapshot.metadata.engineVersion}`)
console.log(`   priorVersion=${snapshot.metadata.priorVersion}`)
console.log(`   genreUsed=${snapshot.metadata.genreUsed}`)
console.log(`   metrics=${Object.keys(snapshot.posterior).join(", ")}`)
