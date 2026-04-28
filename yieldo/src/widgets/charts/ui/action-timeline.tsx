"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { ActionData } from "@/shared/api/mock-data"
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts"
import { ACTION_TIMELINE_COLORS } from "@/shared/config/chart-colors"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { CHART_TYPO } from "@/shared/config/chart-typography"

const C = ACTION_TIMELINE_COLORS

type ActionTimelineProps = {
  retentionTrend: { date: string; retention: number }[]
  actions: ActionData[]
}

const actionColors: Record<ActionData["type"], string> = {
  ua: C.ua,
  liveops: C.liveops,
  release: C.release,
}

export function ActionTimeline({ retentionTrend, actions }: ActionTimelineProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 240 })

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
    >
      <ChartHeader
        title={t("chart.actionTimeline")}
        subtitle={t("info.actionTimeline")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <div className="flex gap-4 mb-3">
        {(["ua", "liveops", "release"] as const).map((type) => (
          <div key={type} className="flex items-center gap-1.5 text-[11px] text-[var(--fg-2)]">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: actionColors[type] }} />
            {t(`action.${type}`)}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={retentionTrend} margin={{ top: 12, right: 20, left: 4, bottom: 12 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ ...CHART_TYPO.axisTick, fill: C.axis }} axisLine={{ stroke: C.border }} tickLine={false} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={{ ...CHART_TYPO.axisTick, fill: C.axis }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={["dataMin - 1", "dataMax + 1"]} />
          <Tooltip content={<ChartTooltip />} />
          <Line type="linear" dataKey="retention" stroke={C.retention} strokeWidth={2} dot={{ r: 2.5, fill: C.retention }} name="D7 Retention" animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          {actions.map((action) => (
            <ReferenceLine key={action.date} x={action.date} stroke={actionColors[action.type]} strokeDasharray="3 3" strokeOpacity={0.6} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
