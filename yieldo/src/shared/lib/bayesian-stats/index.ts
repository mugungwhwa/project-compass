// src/shared/lib/bayesian-stats/index.ts
export { ENGINE_VERSION } from "./version"
export * from "./types"
export { betaBinomialModel } from "./beta-binomial"
export { betaQuantile } from "./beta-quantile"
export { lognormalModel } from "./lognormal"
export {
  ESS_RETENTION_CAP,
  ESS_REVENUE,
  PRIOR_ESS_FLOOR,
  MIN_COHORT_INSTALLS,
  MIN_REVENUE_MONTHS,
} from "./effective-sample-size"
export {
  validateRetentionPosterior,
  validateRevenuePosterior,
  validatePrior,
} from "./validity"
export { METRIC_REGISTRY } from "./metric-registry"
export { buildRows } from "./build-rows"
export type { PosteriorRow } from "./build-rows"
