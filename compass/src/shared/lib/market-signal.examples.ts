/**
 * market-signal.ts 기대 동작 예시 + runtime assertion.
 *
 * 테스트 러너 도입 전까지 이 파일로 수동 검증한다.
 * 실행: cd compass && npx tsx src/shared/lib/market-signal.examples.ts
 */

import { computeMarketSignal, MARKET_SIGNAL_HOLD_THRESHOLD } from "./market-signal"

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    process.exit(1)
  }
  console.log(`✅ ${message}`)
}

// Match League (INVEST): prior 14.2, posterior 18.7 → +31.7% → invest
{
  const r = computeMarketSignal(14.2, 18.7)
  assert(r.signal === "invest", `Match League D7 → invest (got ${r.signal})`)
  assert(Math.abs(r.deltaPct - 31.7) < 0.1, `deltaPct ≈ 31.7 (got ${r.deltaPct})`)
  assert(r.direction === "above", `direction above (got ${r.direction})`)
}

// Weaving Fairy (HOLD): prior 14.2, posterior 14.8 → +4.2% → hold (within ±5%)
{
  const r = computeMarketSignal(14.2, 14.8)
  assert(r.signal === "hold", `Weaving Fairy within hold band (got ${r.signal})`)
  assert(Math.abs(r.deltaPct - 4.2) < 0.1, `deltaPct ≈ 4.2 (got ${r.deltaPct})`)
}

// Dig Infinity (REDUCE): prior 14.2, posterior 11.5 → -19.0% → reduce
{
  const r = computeMarketSignal(14.2, 11.5)
  assert(r.signal === "reduce", `Dig Infinity → reduce (got ${r.signal})`)
  assert(Math.abs(r.deltaPct + 19.0) < 0.1, `deltaPct ≈ -19.0 (got ${r.deltaPct})`)
  assert(r.direction === "below", `direction below (got ${r.direction})`)
}

// Boundary: exactly ±5% → hold
{
  const above = computeMarketSignal(100, 105)
  const below = computeMarketSignal(100, 95)
  assert(above.signal === "hold", `+5.0% at boundary = hold (got ${above.signal})`)
  assert(below.signal === "hold", `-5.0% at boundary = hold (got ${below.signal})`)
}

// Just above threshold: 5.1% → invest, -5.1% → reduce
{
  const above = computeMarketSignal(100, 105.1)
  const below = computeMarketSignal(100, 94.9)
  assert(above.signal === "invest", `+5.1% over threshold = invest (got ${above.signal})`)
  assert(below.signal === "reduce", `-5.1% under threshold = reduce (got ${below.signal})`)
}

// Edge case: prior = 0
{
  const r = computeMarketSignal(0, 100)
  assert(r.signal === "hold", `prior=0 safe fallback to hold (got ${r.signal})`)
  assert(r.deltaPct === 0, `prior=0 deltaPct=0 (got ${r.deltaPct})`)
}

// Edge case: both 0
{
  const r = computeMarketSignal(0, 0)
  assert(r.signal === "hold", `both=0 safe fallback to hold (got ${r.signal})`)
}

console.log(`\nAll ${7} assertion blocks passed. MARKET_SIGNAL_HOLD_THRESHOLD = ±${MARKET_SIGNAL_HOLD_THRESHOLD}%`)
