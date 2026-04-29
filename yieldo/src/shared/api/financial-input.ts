import { z } from "zod"

export const FinancialInputSchema = z.object({
  monthlyRevenue: z.number().min(0).max(1e15),
  uaSpend: z.number().min(0).max(1e15),
  cashBalance: z.number().min(0).max(1e15),
  monthlyBurn: z.number().min(0).max(1e15),
  targetPaybackMonths: z.number().int().min(1).max(60),
  savedAt: z.string().datetime(),
})

export type FinancialInput = z.infer<typeof FinancialInputSchema>

export const FINANCIAL_INPUT_KEY = "yieldo:financial-input:v1"

export function loadFinancialInput(): FinancialInput | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(FINANCIAL_INPUT_KEY)
  if (!raw) return null
  try {
    const parsed = FinancialInputSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveFinancialInput(
  value: Omit<FinancialInput, "savedAt">,
): FinancialInput {
  const enriched: FinancialInput = {
    ...value,
    savedAt: new Date().toISOString(),
  }
  FinancialInputSchema.parse(enriched)
  if (typeof window !== "undefined") {
    window.localStorage.setItem(FINANCIAL_INPUT_KEY, JSON.stringify(enriched))
  }
  return enriched
}

export function clearFinancialInput(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(FINANCIAL_INPUT_KEY)
}
