"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { RippleForecast } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { RIPPLE_FORECAST_COLORS } from "@/shared/config/chart-colors"
import { CHART_TYPO } from "@/shared/config/chart-typography"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

const C = RIPPLE_FORECAST_COLORS

type RippleForecastFanProps = {
  forecast: RippleForecast
  variantName: string
}

export function RippleForecastFan({ forecast, variantName }: RippleForecastFanProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 320 })

  const data = forecast.stages.map(s => ({
    stage: `${s.percentage}%`,
    p50: s.predicted_ltv_lift,
    p10: s.ci_low,
    p90: s.ci_high,
    days: s.days_to_observe,
  }))

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("exp.rippleForecast")}
        subtitle={`${variantName} · ${t("info.rippleForecast")}`}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rippleBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.line} stopOpacity={0.18} />
              <stop offset="100%" stopColor={C.line} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="stage"
            tick={{ ...CHART_TYPO.axisTick, fill: C.axis }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
            label={{ value: t("exp.stageRollout"), position: "insideBottom", offset: -5, ...CHART_TYPO.annotationText, fill: C.axis }}
          />
          <YAxis
            tick={{ ...CHART_TYPO.axisTick, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            content={
              <ChartTooltip
                render={({ payload, label }) => (
                  <div>
                    {label != null && (
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0A", marginBottom: 4 }}>{label}</div>
                    )}
                    {payload.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <span style={{ color: "#6B7280" }}>{p.name}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>
                          {p.value != null ? `$${Number(p.value).toFixed(0)}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            }
          />
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#rippleBand)" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="#FFFFFF" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Line type="monotone" dataKey="p50" stroke={C.line} strokeWidth={2.5} dot={{ r: 4, fill: "#FFFFFF", stroke: C.line, strokeWidth: 2 }} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <ReferenceLine y={0} stroke={C.axis} strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
