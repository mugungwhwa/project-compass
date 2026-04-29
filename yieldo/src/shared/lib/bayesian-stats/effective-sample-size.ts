// src/shared/lib/bayesian-stats/effective-sample-size.ts
//
// ESS caps prevent prior pseudo-counts from overwhelming observed data.
// See spec §3.5.

/** Beta(α,β) sum cap for retention priors. Roughly 5-10× typical cohort install count. */
export const ESS_RETENTION_CAP = 10_000

/** Pseudo-month count for monthly revenue prior (LogNormal MoM weighting). */
export const ESS_REVENUE = 6

/** Threshold below which a prior is considered too weak to anchor inference (validity reason). */
export const PRIOR_ESS_FLOOR = 5_000

/** Minimum installs in a cohort before retention posterior is reportable. */
export const MIN_COHORT_INSTALLS = 1_000

/** Minimum months of revenue data before LogNormal posterior is reportable. */
export const MIN_REVENUE_MONTHS = 3
