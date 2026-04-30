import {
  saveFinancialInput,
  clearFinancialInput,
  type FinancialInput,
} from "./financial-input"

export const DEMO_SEED: Omit<FinancialInput, "savedAt"> = {
  monthlyRevenue: 50_000_000,
  uaSpend: 20_000_000,
  cashBalance: 500_000_000,
  monthlyBurn: 30_000_000,
  targetPaybackMonths: 12,
}

export function applyDemoSeed(): void {
  saveFinancialInput(DEMO_SEED)
}

export function resetDemoSeed(): void {
  clearFinancialInput()
}
