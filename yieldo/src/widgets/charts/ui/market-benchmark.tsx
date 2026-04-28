"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { RetentionDataPoint } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { MARKET_BENCHMARK_COLORS } from "@/shared/config/chart-colors"
import { CHART_TYPO } from "@/shared/config/chart-typography"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts"

type MarketBenchmarkProps = { data: RetentionDataPoint[]; expanded?: boolean; onToggle?: () => void }

const C = MARKET_BENCHMARK_COLORS

export function MarketBenchmark({ data, expanded: externalExpanded, onToggle: externalToggle }: MarketBenchmarkProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 280, expanded: externalExpanded, onToggle: externalToggle })

  const chartData = data.map((d) => ({ day: `D${d.day}`, p50: d.p50, p10: d.p10, p90: d.p90, genre: d.genre }))

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 h-full flex flex-col ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("chart.benchmark")}
        subtitle="Match League vs Puzzle Genre"
        info={t("info.benchmark")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <div className="flex-1" style={{ minHeight: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 56, left: 4, bottom: 12 }}>
          <defs>
            <linearGradient id="genreBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.genre} stopOpacity={0.08} />
              <stop offset="100%" stopColor={C.genre} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis dataKey="day" tick={{ ...CHART_TYPO.axisTick, fill: C.axis }} axisLine={{ stroke: C.border }} tickLine={false} />
          <YAxis tick={{ ...CHART_TYPO.axisTick, fill: C.axis }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={[0, 50]} />
          <Tooltip
            content={
              <ChartTooltip
                render={({ payload, label }) => (
                  <div>
                    {label != null && (
                      <div style={{ ...CHART_TYPO.tooltipTitle, color: "#FFE45E", marginBottom: 4 }}>
                        {label}
                      </div>
                    )}
                    {payload.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, ...CHART_TYPO.tooltipLabel, lineHeight: 1.6 }}>
                        <TooltipDot color={p.color ?? C.p50} />
                        <span style={{ color: "#ECF1F7" }}>{p.name}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, ...CHART_TYPO.tooltipValue, color: "#FFE45E" }}>
                          {p.value != null ? `${p.value}%` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            }
          />
          <Area type="linear" dataKey="p90" stroke="none" fill="url(#genreBand)" name={t("chart.bandOuter")} animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Area type="linear" dataKey="p10" stroke="none" fill="none" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Line type="linear" dataKey="genre" stroke={C.genre} strokeWidth={1.5} strokeDasharray="6 3" dot={false} name={t("chart.genreAvg")} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <Line type="linear" dataKey="p50" stroke={C.p50} strokeWidth={2.5} dot={{ r: 3, fill: "#FFF", stroke: C.p50, strokeWidth: 2 }} name="Match League" animationBegin={400} animationDuration={1000} animationEasing="ease-out">
            <LabelList
              dataKey="p50"
              position="right"
              offset={8}
              formatter={(v) => (typeof v === "number" ? `${v.toFixed(1)}%` : "")}
              fill={C.p50}
              fontSize={11}
              fontFamily="var(--font-geist-mono)"
              fontWeight={600}
            />
          </Line>
          <Legend verticalAlign="bottom" height={36} iconSize={12} wrapperStyle={{ ...CHART_TYPO.legend }} />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
