"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { PALETTE } from "@/shared/config/chart-colors"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"

type Row = { date: string; actual: number; baseline: number }

type Props = { data: Row[] }

export function CumulativeImpactCurve({ data }: Props) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 240 })

  const last = data[data.length - 1]
  const gap = last ? (last.actual - last.baseline).toFixed(1) : "0"

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
    >
      <ChartHeader
        title={t("chart.cumulativeImpact")}
        subtitle={t("info.cumulativeImpact")}
        insight={t("insight.cumulativeImpact").replace("{{gap}}", gap)}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cumActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.p50} stopOpacity={0.35} />
              <stop offset="100%" stopColor={PALETTE.p50} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="cumBaseline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.benchmark} stopOpacity={0.18} />
              <stop offset="100%" stopColor={PALETTE.benchmark} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: PALETTE.axis }}
            axisLine={{ stroke: PALETTE.border }}
            tickLine={false}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: PALETTE.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}`}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: PALETTE.fg2 }} />
          <Area
            type="monotone"
            dataKey="baseline"
            name={t("chart.cumulativeImpact.baseline")}
            stroke={PALETTE.benchmark}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            fill="url(#cumBaseline)"
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="actual"
            name={t("chart.cumulativeImpact.actual")}
            stroke={PALETTE.p50}
            strokeWidth={2}
            fill="url(#cumActual)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
