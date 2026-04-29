import {
  ENGINE_VERSION,
  buildRows,
  type CohortSummaryShape,
  type CredibleInterval,
  type GenrePriorRecord,
  type Validity,
} from "@/shared/lib/bayesian-stats"
import genrePriorsRaw from "@/shared/data/genre-priors.json"
import type { CohortSummary } from "@/shared/api/appsflyer/types"
import type { PosteriorSnapshot } from "./snapshot-v2"

// genre-priors.json stores per-genre prior shapes (retention + monthlyRevenueUsd)
// but essRetention is hoisted to the file root because it's a global engine
// constant, not genre-specific. We splice it into each record at lookup time.
type RawGenrePrior = Omit<GenrePriorRecord, "essRetention">
const GENRES = genrePriorsRaw.genres as Record<string, RawGenrePrior>
const PRIOR_VERSION = genrePriorsRaw.version
const ESS_RETENTION = genrePriorsRaw.essRetention

function pickGenrePrior(genre: string | undefined): { record: GenrePriorRecord; genreUsed: string } {
  const requested = genre && GENRES[genre] ? genre : "portfolio"
  const base = GENRES[requested]
  const record: GenrePriorRecord = { ...base, essRetention: ESS_RETENTION }
  return { record, genreUsed: requested }
}

/**
 * Compute the posterior layer of a v2 snapshot from an existing v1 cohort summary.
 *
 * Flow:
 *   1. Resolve genre-specific prior (fallback: portfolio)
 *   2. Run buildRows() — registry iteration with validity gate
 *   3. Wrap into PosteriorSnapshot envelope (cohortSummary + posterior + metadata)
 */
export function computePosterior(
  cohortSummary: CohortSummary,
  genre: string | undefined,
): PosteriorSnapshot {
  const { record: priorRecord, genreUsed } = pickGenrePrior(genre)

  const rows = buildRows(cohortSummary as unknown as CohortSummaryShape, priorRecord)

  const posterior: Record<string, CredibleInterval> = {}
  const validity: Record<string, Validity> = {}

  for (const row of rows) {
    if ("invalid" in row.result && row.result.invalid) {
      validity[row.metricId] = row.result.validity
      // Even when invalid, persist a zero-CI placeholder so the schema stays uniform.
      posterior[row.metricId] = { mean: 0, ci_low: 0, ci_high: 0, sampleSize: 0 }
    } else {
      const ci = row.result as CredibleInterval
      posterior[row.metricId] = ci
      validity[row.metricId] = { valid: true }
    }
  }

  return {
    cohortSummary,
    posterior,
    metadata: {
      engineVersion: ENGINE_VERSION,
      priorVersion: PRIOR_VERSION,
      genreUsed,
      validity,
    },
  }
}
