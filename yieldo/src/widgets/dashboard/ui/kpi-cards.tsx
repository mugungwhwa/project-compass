"use client"

import { useLocale, type TranslationKey, translate } from "@/shared/i18n"
import { cn } from "@/shared/lib"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { AnimatedNumber } from "@/shared/ui/animated-number"
import { InfoHint } from "@/shared/ui/info-hint"

export type KPIItem = {
  labelKey: TranslationKey
  value: string | number
  unit?: string
  trend: number
  trendLabel: string
  /** Override auto-mapped infoKey. By default we try `info.{labelKey}`. */
  infoKey?: TranslationKey
}

type KPICardsProps = {
  items: KPIItem[]
  basisKey?: TranslationKey
}

/**
 * Given a KPI labelKey like "kpi.moic", returns "info.kpi.moic" if that key
 * exists in the dictionary, otherwise undefined. Lets each KPI auto-opt-in to
 * the ⓘ hint without changing every call site.
 */
function resolveInfoKey(labelKey: TranslationKey, override?: TranslationKey): TranslationKey | undefined {
  if (override) return override
  const candidate = `info.${labelKey}` as TranslationKey
  // translate() returns undefined for missing keys when accessed via dictionary;
  // we guard by probing with the Korean locale (string result means key exists).
  try {
    const probe = translate(candidate, "ko")
    return typeof probe === "string" && probe.length > 0 ? candidate : undefined
  } catch {
    return undefined
  }
}

export function KPICards({ items, basisKey }: KPICardsProps) {
  const { t } = useLocale()

  // Responsive grid rules (static strings so Tailwind JIT picks them up):
  //   ≤4 items  → one row at md+ (single-game view: unchanged)
  //   5–6 items → 2 cols on sm, 3 cols on md, 6 cols only at xl (portfolio view)
  // Prevents digit crunch in the "hero number" on mid-width screens where a
  // 6-way split collapses to <160px per card.
  const n = items.length
  const gridClass =
    n <= 2 ? "grid-cols-2" :
    n === 3 ? "grid-cols-2 md:grid-cols-3" :
    n === 4 ? "grid-cols-2 md:grid-cols-4" :
    n === 5 ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-5" :
              "grid-cols-2 md:grid-cols-3 xl:grid-cols-6" // 6+

  return (
    <div>
      <div className={cn("grid gap-5", gridClass)}>
        {items.map((item) => {
          const isPositive = item.trend > 0
          const isNegative = item.trend < 0
          const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
          const trendColor = isPositive ? "text-[var(--signal-green)]" : isNegative ? "text-[var(--signal-red)]" : "text-[var(--text-muted)]"
          const displayTrendColor = item.trendLabel === "faster" ? "text-[var(--signal-green)]" : trendColor
          const infoKey = resolveInfoKey(item.labelKey, item.infoKey)

          return (
            <div
              key={item.labelKey}
              className="rounded-xl border border-[var(--border)] p-6 card-glow card-premium"
              style={{ boxShadow: "0 4px 24px rgba(91,154,255,0.08)" }}
            >
              <div className="flex items-center gap-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  {t(item.labelKey)}
                </p>
                {infoKey && <InfoHint content={t(infoKey)} size={12} />}
              </div>
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
      {basisKey && (
        <p className="mt-3 text-[11px] text-[var(--text-muted)] text-right">
          {t(basisKey)}
        </p>
      )}
    </div>
  )
}
