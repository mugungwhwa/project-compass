// Pure barrel: re-export the public API for the AppsFlyer post-registration workflow.

export { runAppsFlyerSync, runBackfill, validateCredentials } from "./orchestrator"
export type { SyncWindow } from "./orchestrator"

export { deriveCardData } from "./snapshot-derive"
export type { AppsFlyerCardData } from "./snapshot-derive"

export { encryptToken, decryptToken, hashToken, maskToken } from "./crypto"

export { incrementCalls, isResetDue, resetIfDue, acquireLock, releaseLock } from "./rate-limiter"

export { aggregate } from "./aggregation"

export {
  putAccount, getAccount,
  putApp, getApp, listApps,
  putState, getState,
  putCohortSummary, getCohortSummary,
  appendInstalls, appendEvents,
  readAllInstalls, readAllEvents,
  listInstallShards,
} from "./blob-store"

export {
  AppsFlyerError, AuthError, RateLimitError, TimeoutError, ValidationError, NetworkError,
  CredentialInvalidError, AppMissingError, ThrottledError, BackfillInProgressError,
} from "./errors"

export type {
  Account, App, AppState,
  CohortObservation, CohortSummary,
  RegisterRequest, GameKey,
  ExtendedInstall, EventRow,
  CsvRow, InstallsParams, CompactInstall,
} from "./types"

export {
  RegisterRequestSchema, AccountSchema, AppSchema, StateSchema,
  toExtendedInstall, toEventRow,
} from "./types"
