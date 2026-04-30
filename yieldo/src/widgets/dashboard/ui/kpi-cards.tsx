"use client"

import { useLocale, type TranslationKey, translate } from "@/shared/i18n"
import { cn } from "@/shared/lib"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { AnimatedNumber } from "@/shared/ui/animated-number"
import { InfoHint } from "@/shared/ui/info-hint"

export type KPIValueTone = "yield" | "do" | "risk" | "info"

export type KPIItem = {
  labelKey: TranslationKey
  value: string | number
  unit?: string
  trend: number
  trendLabel: string
  /** Phosphor tone for the headline value. Default `yield` (yellow). */
  valueTone?: KPIValueTone
  /** Override auto-mapped infoKey. By default we try `info.{labelKey}`. */
  infoKey?: TranslationKey
}

const TONE_COLOR: Record<KPIValueTone, string> = {
  yield: "var(--phosphor-yellow)",
  do:    "var(--phosphor-green)",
  risk:  "var(--phosphor-red)",
  info:  "var(--phosphor-cyan)",
}

const TONE_SHADOW: Record<KPIValueTone, string> = {
  yield: "0 0 16px rgba(255, 228, 94, 0.35)",
  do:    "0 0 16px rgba(77, 255, 163, 0.35)",
  risk:  "0 0 16px rgba(255, 107, 122, 0.35)",
  info:  "0 0 16px rgba(93, 231, 255, 0.35)",
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
      <div className={cn("grid gap-3", gridClass)}>
        {items.map((item) => {
          const isPositive = item.trend > 0
          const isNegative = item.trend < 0
          const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
          // Phosphor (terminal-bright) for direction signals; muted gray for flat.
          const trendColor = isPositive
            ? "yieldo-phosphor-do"
            : isNegative
              ? "yieldo-phosphor-danger"
              : "text-[var(--fg-3)]"
          const displayTrendColor =
            item.trendLabel === "faster" ? "yieldo-phosphor-do" : trendColor
          const infoKey = resolveInfoKey(item.labelKey, item.infoKey)

          return (
            <div
              key={item.labelKey}
              className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] px-3 py-2.5 transition-colors hover:border-[var(--phosphor-yellow)]"
            >
              <div className="flex items-center gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)]">
                  {t(item.labelKey)}
                </p>
                {infoKey && <InfoHint content={t(infoKey)} size={12} />}
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span
                  className="text-3xl font-mono-num leading-none tracking-tight"
                  style={{
                    color: TONE_COLOR[item.valueTone ?? "yield"],
                    textShadow: TONE_SHADOW[item.valueTone ?? "yield"],
                  }}
                >
                  {typeof item.value === 'number'
                    ? <AnimatedNumber value={item.value} />
                    : item.value}
                </span>
                {item.unit && (
                  <span className="text-sm text-[var(--fg-2)] font-mono">{item.unit}</span>
                )}
              </div>
              <div className={cn("flex items-center gap-1 mt-1.5 text-xs font-semibold font-mono", displayTrendColor)}>
                <TrendIcon className="h-3 w-3" />
                <span>
                  {Math.abs(item.trend)}{item.unit === "%" ? "pp" : ""} {item.trendLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      {basisKey && (
        <p className="mt-3 text-[11px] text-[var(--fg-2)] text-right">
          {t(basisKey)}
        </p>
      )}
    </div>
  )
}
