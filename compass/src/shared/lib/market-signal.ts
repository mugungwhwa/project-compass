/**
 * Market Gap 판정 신호 계산 (L1 operator 언어).
 *
 * 장르 기대치(prior) 대비 우리 실적(posterior)의 %격차를 계산해
 * Invest / Hold / Reduce 3단 신호로 매핑한다.
 * HeroVerdict (Module 1)의 Invest/Hold/Reduce 판정과 1:1 대응.
 *
 * Threshold: ±5% (|delta| ≤ 5% → Hold, > +5% → Invest, < −5% → Reduce)
 *
 * @example
 *   computeMarketSignal(14.2, 18.7)  // { signal: "invest", deltaPct: 31.7, direction: "above" }
 *   computeMarketSignal(14.2, 14.8)  // { signal: "hold",   deltaPct:  4.2, direction: "above" }
 *   computeMarketSignal(14.2, 11.5)  // { signal: "reduce", deltaPct: -19.0, direction: "below" }
 */

export type MarketSignal = "invest" | "hold" | "reduce"

export type MarketSignalResult = {
  signal: MarketSignal
  /** % difference (posterior − prior) / prior × 100. 부호 포함 */
  deltaPct: number
  /** 방향 레이블 — L1 UI 표현 "우리 우월 / 우리 부족" 매핑용 */
  direction: "above" | "at" | "below"
}

/** Hold band threshold (절대값 %) */
export const MARKET_SIGNAL_HOLD_THRESHOLD = 5

export function computeMarketSignal(
  prior: number,
  posterior: number,
): MarketSignalResult {
  // Guard: non-finite inputs or non-positive prior cannot yield a meaningful
  // ±% change. Return a safe hold/at fallback rather than silently mislabel.
  // (Retention/KPI priors are domain-constrained to prior > 0.)
  if (!Number.isFinite(prior) || !Number.isFinite(posterior) || prior <= 0) {
    return { signal: "hold", deltaPct: 0, direction: "at" }
  }

  const deltaPct = ((posterior - prior) / prior) * 100
  const rounded = Math.round(deltaPct * 10) / 10

  const absDelta = Math.abs(rounded)
  let signal: MarketSignal
  let direction: MarketSignalResult["direction"]

  if (absDelta <= MARKET_SIGNAL_HOLD_THRESHOLD) {
    signal = "hold"
    direction = rounded > 0 ? "above" : rounded < 0 ? "below" : "at"
  } else if (rounded > 0) {
    signal = "invest"
    direction = "above"
  } else {
    signal = "reduce"
    direction = "below"
  }

  return { signal, deltaPct: rounded, direction }
}
