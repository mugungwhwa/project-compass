import type { FinancialInput } from "./financial-input"

export type FinancialHealthShape = {
  burnTolerance: { value: number; max: number; color: string }
  netRunway: { value: number; max: number; color: string }
  kpis: { capEfficiency: number; revPerSpend: number; netBurn: number }
  paybackDay: number
  runwayEndDay: number
}

const KRW_PER_USD = 1300
const MAX_RUNWAY_MONTHS = 18
const MIN_BURN_FOR_RUNWAY = 0.1

const round1 = (x: number) => Math.round(x * 10) / 10
const round2 = (x: number) => Math.round(x * 100) / 100

const colorFor = (months: number): string => {
  if (months >= 12) return "#16A34A"
  if (months >= 6) return "#D97706"
  return "#DC2626"
}

export function deriveFinancialHealth(input: FinancialInput): FinancialHealthShape {
  const monthlyRevenueK = input.monthlyRevenue / KRW_PER_USD / 1000
  const uaSpendK = input.uaSpend / KRW_PER_USD / 1000
  const cashK = input.cashBalance / KRW_PER_USD / 1000
  const monthlyBurnK = input.monthlyBurn / KRW_PER_USD / 1000

  const netBurn = Math.round(monthlyRevenueK - monthlyBurnK - uaSpendK) || 0
  const absBurn = Math.max(MIN_BURN_FOR_RUNWAY, Math.abs(Math.min(0, netBurn)))
  const runwayMonthsRaw = cashK / absBurn
  const runwayMonths = round1(Math.min(MAX_RUNWAY_MONTHS, runwayMonthsRaw))
  const burnToleranceMonths = round1(Math.min(MAX_RUNWAY_MONTHS, input.targetPaybackMonths))

  const denom = uaSpendK + Math.max(0, monthlyBurnK - monthlyRevenueK)
  const capEfficiency = denom > 0 ? round2(monthlyRevenueK / denom) : 0
  const revPerSpend = uaSpendK > 0 ? round1(monthlyRevenueK / uaSpendK) : 0

  return {
    burnTolerance: {
      value: burnToleranceMonths,
      max: MAX_RUNWAY_MONTHS,
      color: colorFor(burnToleranceMonths),
    },
    netRunway: {
      value: runwayMonths,
      max: MAX_RUNWAY_MONTHS,
      color: colorFor(runwayMonths),
    },
    kpis: {
      capEfficiency,
      revPerSpend,
      netBurn,
    },
    paybackDay: input.targetPaybackMonths * 30,
    runwayEndDay: Math.round(runwayMonths * 30),
  }
}
