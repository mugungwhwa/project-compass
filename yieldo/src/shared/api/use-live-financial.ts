"use client"

import { useEffect, useState } from "react"
import { loadFinancialInput } from "./financial-input"
import {
  deriveFinancialHealth,
  type FinancialHealthShape,
} from "./financial-derived"

export function useLiveFinancial(): FinancialHealthShape | null {
  const [data, setData] = useState<FinancialHealthShape | null>(null)

  useEffect(() => {
    const refresh = () => {
      const input = loadFinancialInput()
      setData(input ? deriveFinancialHealth(input) : null)
    }
    refresh()
    window.addEventListener("storage", refresh)
    return () => window.removeEventListener("storage", refresh)
  }, [])

  return data
}
