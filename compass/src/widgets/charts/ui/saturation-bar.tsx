"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { SATURATION_BAR_COLORS } from "@/shared/config/chart-colors"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"

const C = SATURATION_BAR_COLORS

type SaturationBarProps = { data: { metric: string; myGame: number; genreAvg: number }[] }

export function SaturationBar({ data }: SaturationBarProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 220 })

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 h-full ${gridClassName}`}
    >
      <ChartHeader
        title={t("chart.saturation")}
        subtitle={t("info.saturation")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis dataKey="metric" tick={{ fontSize: 11, fill: C.axis }} axisLine={{ stroke: C.border }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="myGame" fill={C.myGame} radius={[4, 4, 0, 0]} barSize={16} name="Puzzle Quest" animationBegin={200} animationDuration={800} animationEasing="ease-out" />
          <Bar dataKey="genreAvg" fill={C.genreAvg} radius={[4, 4, 0, 0]} barSize={16} name={t("chart.genreAvg")} animationBegin={200} animationDuration={800} animationEasing="ease-out" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
