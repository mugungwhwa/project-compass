"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { RankingHistoryPoint } from "@/shared/api/mock-data"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { RANKING_TREND_COLORS } from "@/shared/config/chart-colors"
import { CHART_TYPO } from "@/shared/config/chart-typography"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"

const C = RANKING_TREND_COLORS

type RankingTrendProps = {
  data: RankingHistoryPoint[]
  expanded?: boolean
  onToggle?: () => void
}

export function RankingTrend({ data, expanded: externalExpanded, onToggle: externalToggle }: RankingTrendProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 280, expanded: externalExpanded, onToggle: externalToggle })

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 h-full flex flex-col ${gridClassName}`}
    >
      <ChartHeader
        title={t("market.rankingTrend")}
        subtitle="Match League · 6-month trend"
        info={t("info.rankingTrend")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <div className="flex-1" style={{ minHeight: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ ...CHART_TYPO.axisTick, fill: C.axis }} axisLine={{ stroke: C.border }} tickLine={false} />
          <YAxis
            reversed
            domain={[1, 10]}
            ticks={[1, 3, 5, 8, 10]}
            tick={{ ...CHART_TYPO.axisTick, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `#${v}`}
          />
          <Tooltip
            content={
              <ChartTooltip
                render={({ payload, label }) => (
                  <>
                    {label != null && (
                      <div style={{ ...CHART_TYPO.tooltipTitle, color: "#0A0A0A", marginBottom: 4 }}>{label}</div>
                    )}
                    {payload.map((item, i) => (
                      <div key={i} style={{ ...CHART_TYPO.tooltipLabel, color: "#6B7280" }}>
                        Genre Rank: <span style={{ ...CHART_TYPO.tooltipValue, color: "#0A0A0A" }}>#{item.value}</span>
                      </div>
                    ))}
                  </>
                )}
              />
            }
          />
          <ReferenceLine y={5} stroke={C.top5} strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: "Top 5", position: "right", ...CHART_TYPO.axisLabel, fontFamily: CHART_TYPO.annotation.fontFamily, fill: C.top5 }} />
          <Line type="monotone" dataKey="myRank" stroke={C.line} strokeWidth={3} dot={{ r: 4, fill: "#FFFFFF", stroke: C.line, strokeWidth: 2 }} animationBegin={400} animationDuration={1200} animationEasing="ease-out" />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
