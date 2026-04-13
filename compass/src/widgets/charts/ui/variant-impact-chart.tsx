"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { ExperimentVariant } from "@/shared/api/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ErrorBar, ResponsiveContainer } from "recharts"
import { VARIANT_IMPACT_COLORS } from "@/shared/config/chart-colors"
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
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
    >
      <ChartHeader
        title={t("exp.variantImpact")}
        subtitle={t("info.variantImpact")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 10 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: C.axis }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: C.label }}
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
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0A", marginBottom: 4 }}>{label}</div>
                    )}
                    {payload.map((item, i) => {
                      if (String(item.dataKey ?? item.name) === "ltv") {
                        return (
                          <div key={i} style={{ fontSize: 12, color: "#6B7280" }}>
                            ΔLTV: <span style={{ fontWeight: 500, color: "#0A0A0A" }}>${Number(item.value).toFixed(2)}</span>
                          </div>
                        )
                      }
                      return (
                        <div key={i} style={{ fontSize: 12, color: "#6B7280" }}>
                          {String(item.name)}: <span style={{ fontWeight: 500, color: "#0A0A0A" }}>{String(item.value)}</span>
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
    </motion.div>
  )
}
