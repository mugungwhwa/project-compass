// src/shared/api/posterior/snapshot-v2.ts
import { z } from "zod"
import { CohortSummarySchema } from "@/shared/api/appsflyer/types"
import { CredibleIntervalSchema, ValiditySchema } from "@/shared/lib/bayesian-stats"

/**
 * v2 PosteriorSnapshot — wraps the existing v1 CohortSummary plus engine output.
 *
 * Persistence: Vercel Blob, key = `posterior/${appId}.json`.
 * Wire-format: zod-parsed JSON. Backward compat: v1 CohortSummary path is unchanged
 * (still written separately by `putCohortSummary`); this is an additional write.
 */
export const PosteriorSnapshotSchema = z.object({
  cohortSummary: CohortSummarySchema,
  posterior: z.record(z.string(), CredibleIntervalSchema),
  metadata: z.object({
    engineVersion: z.string(),
    priorVersion: z.string(),
    genreUsed: z.string(),
    validity: z.record(z.string(), ValiditySchema),
  }),
})
export type PosteriorSnapshot = z.infer<typeof PosteriorSnapshotSchema>
