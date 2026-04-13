"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { RevenueForecastPoint } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { REVENUE_FORECAST_COLORS } from "@/shared/config/chart-colors"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type RevenueForecastProps = { data: RevenueForecastPoint[]; title?: string; expanded?: boolean; onToggle?: () => void }

const C = REVENUE_FORECAST_COLORS

export function RevenueForecast({ data, title, expanded: externalExpanded, onToggle: externalToggle }: RevenueForecastProps) {
  const { t, locale } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 200, expanded: externalExpanded, onToggle: externalToggle })

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 h-full ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={title || t("chart.revenue")}
        context={t("info.revenueForecast")}
        insight={locale === "ko" ? "상승 여지는 있으나, D60 이후 불확실성이 확대됩니다." : "Upside remains positive, but uncertainty widens after D60."}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.line} stopOpacity={0.1} />
              <stop offset="100%" stopColor={C.line} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.axis }} axisLine={{ stroke: C.border }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}K`} />
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
                        <TooltipDot color={p.color ?? C.line} />
                        <span style={{ color: "#6B7280" }}>{p.name}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>
                          {p.value != null ? `$${p.value}K` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            }
          />
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#revenueBand)" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="none" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Line type="monotone" dataKey="p50" stroke={C.line} strokeWidth={2} dot={false} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <Line type="monotone" dataKey="p90" stroke={C.line} strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.3} dot={false} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <Line type="monotone" dataKey="p10" stroke={C.line} strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.3} dot={false} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
