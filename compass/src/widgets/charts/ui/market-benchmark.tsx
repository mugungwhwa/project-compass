"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { RetentionDataPoint } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { MARKET_BENCHMARK_COLORS } from "@/shared/config/chart-colors"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

type MarketBenchmarkProps = { data: RetentionDataPoint[]; expanded?: boolean; onToggle?: () => void }

const C = MARKET_BENCHMARK_COLORS

export function MarketBenchmark({ data, expanded: externalExpanded, onToggle: externalToggle }: MarketBenchmarkProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 280, expanded: externalExpanded, onToggle: externalToggle })

  const chartData = data.map((d) => ({ day: `D${d.day}`, p50: d.p50, p10: d.p10, p90: d.p90, genre: d.genre }))

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("chart.benchmark")}
        subtitle="Puzzle Quest vs Puzzle Genre"
        context={t("info.benchmark")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="genreBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.genre} stopOpacity={0.08} />
              <stop offset="100%" stopColor={C.genre} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: C.axis }} axisLine={{ stroke: C.border }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: C.axis }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={[0, 50]} />
          <Tooltip
            content={
              <ChartTooltip
                render={({ payload, label }) => (
                  <div>
                    {label != null && (
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0A", marginBottom: 4 }}>
                        {label}
                      </div>
                    )}
                    {payload.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <TooltipDot color={p.color ?? C.p50} />
                        <span style={{ color: "#6B7280" }}>{p.name}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>
                          {p.value != null ? `${p.value}%` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            }
          />
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#genreBand)" name={t("chart.bandOuter")} animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="none" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Line type="monotone" dataKey="genre" stroke={C.genre} strokeWidth={1.5} strokeDasharray="6 3" dot={false} name={t("chart.genreAvg")} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <Line type="monotone" dataKey="p50" stroke={C.p50} strokeWidth={2.5} dot={{ r: 3, fill: "#FFF", stroke: C.p50, strokeWidth: 2 }} name="Puzzle Quest" animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <Legend verticalAlign="bottom" height={36} iconSize={12} wrapperStyle={{ fontSize: 11 }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
