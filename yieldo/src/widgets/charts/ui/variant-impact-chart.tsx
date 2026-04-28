"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { ExperimentVariant } from "@/shared/api/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ErrorBar, ResponsiveContainer } from "recharts"
import { VARIANT_IMPACT_COLORS } from "@/shared/config/chart-colors"
import { CHART_TYPO } from "@/shared/config/chart-typography"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"

const C = VARIANT_IMPACT_COLORS

type VariantImpactChartProps = {
  variants: ExperimentVariant[]
  expanded?: boolean
  onToggle?: () => void
}

function colorForStatus(status: string): string {
  if (status === "shipped" || status === "winner") return C.shipped
  if (status === "reverted" || status === "loser") return C.reverted
  if (status === "control") return C.control
  return C.running
}

export function VariantImpactChart({ variants, expanded: externalExpanded, onToggle: externalToggle }: VariantImpactChartProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 320, expanded: externalExpanded, onToggle: externalToggle })

  const data = variants.map(v => ({
    name: v.name,
    ltv: v.ltv_delta,
    error: [v.ltv_delta - v.ltv_ci_low, v.ltv_ci_high - v.ltv_delta],
    status: v.status,
    sampleSize: v.sample_size,
  }))

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 h-full flex flex-col ${gridClassName}`}
    >
      <ChartHeader
        title={t("exp.variantImpact")}
        subtitle="ΔLTV per variant · 95% CI"
        info={t("info.variantImpact")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <div className="flex-1" style={{ minHeight: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 10 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ ...CHART_TYPO.axisTick, fill: C.axis }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ ...CHART_TYPO.axisTick, fill: C.label }}
            axisLine={false}
            tickLine={false}
            width={115}
          />
          <Tooltip
            content={
              <ChartTooltip
                render={({ payload, label }) => (
                  <>
                    {label != null && (
                      <div style={{ ...CHART_TYPO.tooltipTitle, color: "#FFE45E", marginBottom: 4 }}>{label}</div>
                    )}
                    {payload.map((item, i) => {
                      if (String(item.dataKey ?? item.name) === "ltv") {
                        return (
                          <div key={i} style={{ ...CHART_TYPO.tooltipLabel, color: "#ECF1F7" }}>
                            ΔLTV: <span style={{ ...CHART_TYPO.tooltipValue, color: "#FFE45E" }}>${Number(item.value).toFixed(2)}</span>
                          </div>
                        )
                      }
                      return (
                        <div key={i} style={{ ...CHART_TYPO.tooltipLabel, color: "#ECF1F7" }}>
                          {String(item.name)}: <span style={{ ...CHART_TYPO.tooltipValue, color: "#FFE45E" }}>{String(item.value)}</span>
                        </div>
                      )
                    })}
                  </>
                )}
              />
            }
          />
          <Bar dataKey="ltv" radius={[0, 6, 6, 0]} barSize={22} animationBegin={200} animationDuration={1000} animationEasing="ease-out">
            {data.map((entry, i) => (
              <Cell key={i} fill={colorForStatus(entry.status)} />
            ))}
            <ErrorBar dataKey="error" width={8} strokeWidth={2} stroke={C.errorBar} direction="x" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
