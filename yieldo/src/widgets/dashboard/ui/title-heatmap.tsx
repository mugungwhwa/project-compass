"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { TitleHealthRow } from "@/shared/api/mock-data"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"

type TitleHeatmapProps = {
  titles: TitleHealthRow[]
  expanded?: boolean
  onToggle?: () => void
}

const SIGNAL_BG: Record<TitleHealthRow["signal"], string> = {
  invest: "bg-[var(--signal-positive)]/10 text-[var(--signal-positive)]",
  hold:   "bg-[var(--signal-caution)]/10 text-[var(--signal-caution)]",
  reduce: "bg-[var(--signal-risk)]/10 text-[var(--signal-risk)]",
}

const SIGNAL_KEY: Record<TitleHealthRow["signal"], "signal.invest" | "signal.hold" | "signal.reduce"> = {
  invest: "signal.invest",
  hold:   "signal.hold",
  reduce: "signal.reduce",
}

const TREND_KEY: Record<TitleHealthRow["retentionTrend"], "portfolio.improving" | "portfolio.stableTrend" | "portfolio.declining"> = {
  improving: "portfolio.improving",
  stable:    "portfolio.stableTrend",
  declining: "portfolio.declining",
}

const TREND_ICON: Record<TitleHealthRow["retentionTrend"], typeof TrendingUp> = {
  improving: TrendingUp,
  stable:    Minus,
  declining: TrendingDown,
}

const TREND_COLOR: Record<TitleHealthRow["retentionTrend"], string> = {
  improving: "text-[var(--signal-positive)]",
  stable:    "text-[var(--text-muted)]",
  declining: "text-[var(--signal-risk)]",
}

export function TitleHeatmap({ titles, expanded: externalExpanded, onToggle: externalToggle }: TitleHeatmapProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 300, expanded: externalExpanded, onToggle: externalToggle })

  return (
    <motion.div
      layout
      className={`rounded-xl border border-[var(--border)] p-6 card-glow card-premium h-full flex flex-col ${gridClassName}`}
      style={{ boxShadow: "none" }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("portfolio.titles")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />

      <div className="flex-1" style={{ minHeight: chartHeight }}>
      {/* Header row */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-6 px-1 mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          {t("common.game")}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)] text-right">
          {t("portfolio.signal")}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)] text-right">
          {t("signal.confidence")}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)] text-right">
          {t("portfolio.paybackCol")}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)] text-right">
          {t("portfolio.roasCol")}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)] text-right">
          {t("portfolio.trend")}
        </span>
      </div>

      {/* Body rows */}
      <div className="flex flex-col">
        {titles.map((row) => {
          const TrendIcon = TREND_ICON[row.retentionTrend]
          return (
            <div
              key={row.gameId}
              className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-6 items-center border-t border-[var(--border-subtle)] px-1 py-3"
            >
              {/* Title + genre */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-body text-[var(--text-primary)] truncate">
                  {row.label}
                </span>
                <span className="text-caption text-[var(--text-muted)]">
                  {row.genre}
                </span>
              </div>

              {/* Signal badge */}
              <span
                className={`inline-flex items-center rounded-[var(--radius-inline)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${SIGNAL_BG[row.signal]}`}
              >
                {t(SIGNAL_KEY[row.signal])}
              </span>

              {/* Confidence */}
              <span className="font-mono-num text-body text-[var(--text-primary)] text-right tabular-nums">
                {row.confidence}%
              </span>

              {/* Payback */}
              <span className="font-mono-num text-body text-[var(--text-primary)] text-right tabular-nums">
                D{row.paybackD}
              </span>

              {/* ROAS */}
              <span className="font-mono-num text-body text-[var(--text-primary)] text-right tabular-nums">
                {row.roas}%
              </span>

              {/* Trend */}
              <div className={`flex items-center justify-end gap-1 ${TREND_COLOR[row.retentionTrend]}`}>
                <TrendIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-caption font-medium whitespace-nowrap">
                  {t(TREND_KEY[row.retentionTrend])}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </motion.div>
  )
}
