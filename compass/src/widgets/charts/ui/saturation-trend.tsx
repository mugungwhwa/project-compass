"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { SaturationTrendPoint } from "@/shared/api/mock-data"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { SATURATION_TREND_COLORS } from "@/shared/config/chart-colors"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"

const C = SATURATION_TREND_COLORS

type SaturationTrendChartProps = {
  data: SaturationTrendPoint[]
  expanded?: boolean
  onToggle?: () => void
}

export function SaturationTrendChart({ data, expanded: externalExpanded, onToggle: externalToggle }: SaturationTrendChartProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 320, expanded: externalExpanded, onToggle: externalToggle })

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 h-full flex flex-col ${gridClassName}`}
    >
      <ChartHeader
        title={t("market.saturationTrend")}
        subtitle="Match League vs Top-grossing threshold"
        context={t("info.saturationTrend")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <div className="flex-1" style={{ minHeight: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="thresholdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.threshold} stopOpacity={0.3} />
              <stop offset="100%" stopColor={C.threshold} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="myRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.myRevenue} stopOpacity={0.4} />
              <stop offset="100%" stopColor={C.myRevenue} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.axis }} axisLine={{ stroke: C.border }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}K`} />
          <Tooltip
            content={
              <ChartTooltip
                render={({ payload, label }) => (
                  <>
                    {label != null && (
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0A", marginBottom: 4 }}>{label}</div>
                    )}
                    {payload.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", fontSize: 12, lineHeight: 1.6 }}>
                        {item.color && (
                          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color, marginRight: 6, flexShrink: 0 }} />
                        )}
                        <span style={{ color: "#6B7280" }}>{item.name}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>
                          ${item.value}K
                        </span>
                      </div>
                    ))}
                  </>
                )}
              />
            }
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="topGrossingThreshold" stroke={C.threshold} strokeWidth={2} fill="url(#thresholdGrad)" name={t("market.entryThreshold")} animationBegin={200} animationDuration={1200} />
          <Area type="monotone" dataKey="myRevenue" stroke={C.myRevenue} strokeWidth={2.5} fill="url(#myRevGrad)" name={t("market.myRevenue")} animationBegin={400} animationDuration={1200} />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
