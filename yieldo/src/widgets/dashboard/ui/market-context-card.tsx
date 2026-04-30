"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { MarketContext } from "@/shared/api/mock-data"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"

type MarketContextCardProps = {
  data: MarketContext
  expanded?: boolean
  onToggle?: () => void
}

export function MarketContextCard({ data, expanded: externalExpanded, onToggle: externalToggle }: MarketContextCardProps) {
  const { t, locale } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 280, expanded: externalExpanded, onToggle: externalToggle })

  const trendIcon = {
    up:     <TrendingUp  className="h-3.5 w-3.5" style={{ color: "var(--signal-positive)" }} />,
    down:   <TrendingDown className="h-3.5 w-3.5" style={{ color: "var(--signal-risk)" }} />,
    stable: <Minus       className="h-3.5 w-3.5" style={{ color: "var(--signal-caution)" }} />,
  }

  const intensityColor: Record<MarketContext["competitiveIntensity"]["level"], string> = {
    rising:  "var(--signal-risk)",
    stable:  "var(--fg-2)",
    falling: "var(--signal-positive)",
  }

  const intensityKey: Record<MarketContext["competitiveIntensity"]["level"], "market.rising" | "market.stable" | "market.falling"> = {
    rising:  "market.rising",
    stable:  "market.stable",
    falling: "market.falling",
  }

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 h-full flex flex-col ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <ChartHeader
        title={t("market.context")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />

      <div className="flex-1 flex flex-col" style={{ minHeight: chartHeight }}>
      {/* Rows */}
      <div className="flex flex-col gap-3">

        {/* Genre Growth */}
        <div className="flex items-center justify-between">
          <span className="text-caption" style={{ color: "var(--fg-2)" }}>
            {t("market.genreGrowth")}
          </span>
          <div className="flex items-center gap-1.5">
            {trendIcon[data.genreGrowth.trend]}
            <span className="text-sm font-semibold" style={{ color: "var(--fg-1)", fontVariantNumeric: "tabular-nums" }}>
              {data.genreGrowth.value > 0 ? "+" : ""}{data.genreGrowth.value}{data.genreGrowth.unit}
            </span>
          </div>
        </div>

        {/* Competitive Intensity */}
        <div className="flex items-center justify-between">
          <span className="text-caption" style={{ color: "var(--fg-2)" }}>
            {t("market.competitive")}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-semibold"
              style={{ color: intensityColor[data.competitiveIntensity.level] }}
            >
              {t(intensityKey[data.competitiveIntensity.level])}
            </span>
            <span className="text-xs" style={{ color: "var(--fg-2)" }}>
              ({data.competitiveIntensity.newEntrants} {t("market.newEntrants")})
            </span>
          </div>
        </div>

        {/* CPI Environment */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-caption shrink-0" style={{ color: "var(--fg-2)" }}>
            {t("market.cpiEnv")}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {data.cpiEnvironment.channels.map((ch) => (
              <span
                key={ch.name}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{
                  background: ch.momChange > 0 ? "rgba(255,80,80,0.08)" : "rgba(52,211,153,0.10)",
                  color: ch.momChange > 0 ? "var(--signal-risk)" : "var(--signal-positive)",
                  border: `1px solid ${ch.momChange > 0 ? "rgba(255,80,80,0.20)" : "rgba(52,211,153,0.25)"}`,
                }}
              >
                {ch.name} {ch.momChange > 0 ? "+" : ""}{ch.momChange}%
              </span>
            ))}
          </div>
        </div>

        {/* Seasonality */}
        <div className="flex items-center justify-between">
          <span className="text-caption" style={{ color: "var(--fg-2)" }}>
            {t("market.season")}
          </span>
          <span className="text-sm font-medium text-right" style={{ color: "var(--fg-1)" }}>
            {data.seasonality.description[locale]}
          </span>
        </div>

      </div>

      {/* AI Summary */}
      <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
        <p className="text-xs italic" style={{ color: "var(--fg-2)" }}>
          {data.aiSummary[locale]}
        </p>
      </div>
      </div>
    </motion.div>
  )
}
