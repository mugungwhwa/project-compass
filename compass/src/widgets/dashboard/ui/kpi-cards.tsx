"use client"

import { useLocale } from "@/shared/i18n"
import type { TranslationKey } from "@/shared/i18n"
import { cn } from "@/shared/lib"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { AnimatedNumber } from "@/shared/ui/animated-number"

export type KPIItem = {
  labelKey: TranslationKey
  value: string | number
  unit?: string
  trend: number
  trendLabel: string
}

type KPICardsProps = {
  items: KPIItem[]
}

export function KPICards({ items }: KPICardsProps) {
  const { t } = useLocale()

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((item) => {
        const isPositive = item.trend > 0
        const isNegative = item.trend < 0
        const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
        const trendColor = isPositive ? "text-[var(--signal-green)]" : isNegative ? "text-[var(--signal-red)]" : "text-[var(--text-muted)]"
        const displayTrendColor = item.trendLabel === "faster" ? "text-[var(--signal-green)]" : trendColor

        return (
          <div
            key={item.labelKey}
            className="rounded-xl border border-[var(--border)] p-6 card-glow card-premium"
            style={{ boxShadow: "0 4px 24px rgba(91,154,255,0.08)" }}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {t(item.labelKey)}
            </p>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-hero font-mono-num text-[var(--text-primary)] text-glow">
                {typeof item.value === 'number'
                  ? <AnimatedNumber value={item.value} />
                  : item.value}
              </span>
              {item.unit && (
                <span className="text-base text-[var(--text-muted)]">{item.unit}</span>
              )}
            </div>
            <div className={cn("flex items-center gap-1.5 mt-3 text-sm font-medium", displayTrendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span>
                {Math.abs(item.trend)}{item.unit === "%" ? "pp" : ""} {item.trendLabel}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
