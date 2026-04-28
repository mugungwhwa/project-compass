"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { ExperimentData } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { EXPERIMENT_BAR_COLORS } from "@/shared/config/chart-colors"
import { CHART_TYPO } from "@/shared/config/chart-typography"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts"

type ExperimentBarProps = { data: ExperimentData[] }

const C = EXPERIMENT_BAR_COLORS

export function ExperimentBar({ data }: ExperimentBarProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 280 })

  const sorted = [...data].sort((a, b) => Math.abs(b.deltaLtv) - Math.abs(a.deltaLtv))

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("chart.experimentRoi")}
        info={t("info.experimentRoi")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} horizontal={false} />
          <XAxis type="number" tick={{ ...CHART_TYPO.axisTick, fill: C.axis }} axisLine={{ stroke: C.border }} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
          <YAxis type="category" dataKey="name" tick={{ ...CHART_TYPO.axisTick, fill: C.label }} axisLine={false} tickLine={false} width={95} />
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
                        <TooltipDot color={p.color ?? C.positive} />
                        <span style={{ color: "#6B7280" }}>ΔLTV</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: "#0A0A0A", fontVariantNumeric: CHART_TYPO.tooltipValue.fontVariantNumeric, fontFamily: CHART_TYPO.tooltipValue.fontFamily }}>
                          {p.value != null ? `$${p.value}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            }
          />
          <Bar dataKey="deltaLtv" radius={[0, 4, 4, 0]} barSize={20} animationBegin={200} animationDuration={800} animationEasing="ease-out">
            {sorted.map((entry) => (
              <Cell key={entry.id} fill={entry.deltaLtv >= 0 ? C.positive : C.negative} fillOpacity={entry.status === "running" ? 0.5 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
