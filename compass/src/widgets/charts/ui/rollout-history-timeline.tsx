"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { ExperimentVariant } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { ROLLOUT_HISTORY_COLORS } from "@/shared/config/chart-colors"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const C = ROLLOUT_HISTORY_COLORS

type RolloutHistoryTimelineProps = {
  variant: ExperimentVariant
  expanded?: boolean
  onToggle?: () => void
}

export function RolloutHistoryTimeline({ variant, expanded: externalExpanded, onToggle: externalToggle }: RolloutHistoryTimelineProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 280, expanded: externalExpanded, onToggle: externalToggle })

  if (!variant.rollout_history || variant.rollout_history.length === 0) {
    return (
      <motion.div
        layout
        className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <ChartHeader
          title={t("exp.rolloutHistory")}
          actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
        />
        <p className="text-caption text-[var(--fg-2)]">No rollout history yet</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("exp.rolloutHistory")}
        subtitle={`${variant.name} · ${t("info.rolloutHistory")}`}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={variant.rollout_history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: C.axis }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            yAxisId="pct"
            tick={{ fontSize: 11, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <YAxis
            yAxisId="ltv"
            orientation="right"
            tick={{ fontSize: 11, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar yAxisId="pct" dataKey="percentage" fill={C.bar} fillOpacity={0.5} radius={[4, 4, 0, 0]} barSize={20} name="% Rollout" animationBegin={200} animationDuration={800} animationEasing="ease-out" />
          <Line yAxisId="ltv" type="monotone" dataKey="cumulative_ltv" stroke={C.line} strokeWidth={2.5} dot={{ r: 3.5, fill: "#FFFFFF", stroke: C.line, strokeWidth: 2 }} name="Cumulative LTV ($)" animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
