/**
 * Static FX conversion to USD for AppsFlyer Cost Value rows.
 *
 * Scope: Only currencies the dashboard ever expects to ingest as `home_currency`.
 * AppsFlyer reporting is typically configured to USD; KRW is supported as a
 * convenience for KR-region apps. Other currencies are rejected (null) so
 * unit-mismatched spend never silently flows into LTV/CPI ratios.
 *
 * Why static rates: the chip's tone bands are ±10% / ±30% — a ~3% FX drift
 * is absorbed inside the "match" bucket and would not change the verdict.
 * A real rate fetcher would be over-engineering for this surface.
 */

export type SupportedCurrency = "USD" | "KRW"

const RATES: Record<SupportedCurrency, number> = {
  USD: 1,
  KRW: 1300,
}

export const EXCHANGE_RATES_AS_OF = "2026-Q2"

export function isCurrencySupported(currency: string): currency is SupportedCurrency {
  return currency === "USD" || currency === "KRW"
}

export function convertToUsd(
  amount: number | null,
  currency: SupportedCurrency | string,
): number | null {
  if (amount === null) return null
  if (!isCurrencySupported(currency)) return null
  return amount / RATES[currency]
}
