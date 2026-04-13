"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { RevenueVsInvestPoint } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { REVENUE_VS_INVEST_COLORS } from "@/shared/config/chart-colors"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts"

type RevenueVsInvestProps = {
  data: RevenueVsInvestPoint[]
}

const C = REVENUE_VS_INVEST_COLORS

export function RevenueVsInvest({ data }: RevenueVsInvestProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 384 })

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("chart.rovsInvest")}
        subtitle="Puzzle Quest · 2025 Jul — 2026 Apr · $K"
        context={t("info.revenueVsInvest")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: C.axis }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
          />
          <YAxis
            yAxisId="money"
            tick={{ fontSize: 12, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}K`}
          />
          <YAxis
            yAxisId="roas"
            orientation="right"
            tick={{ fontSize: 12, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 200]}
          />
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
                        <TooltipDot color={p.color ?? C.revenue} />
                        <span style={{ color: "#6B7280" }}>{p.name}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>
                          {String(p.name) === "ROAS" ? `${p.value}%` : `$${p.value}K`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            }
          />

          {/* Revenue bars */}
          <Bar
            yAxisId="money"
            dataKey="revenue"
            fill={C.revenue}
            fillOpacity={0.8}
            radius={[4, 4, 0, 0]}
            barSize={24}
            name={t("chart.monthlyRev")}
            animationBegin={200}
            animationDuration={800}
            animationEasing="ease-out"
          />
          {/* UA Spend bars */}
          <Bar
            yAxisId="money"
            dataKey="uaSpend"
            fill={C.uaSpend}
            fillOpacity={0.6}
            radius={[4, 4, 0, 0]}
            barSize={24}
            name={t("chart.monthlySpend")}
            animationBegin={200}
            animationDuration={800}
            animationEasing="ease-out"
          />

          {/* ROAS line */}
          <Line
            yAxisId="roas"
            type="monotone"
            dataKey="roas"
            stroke={C.roas}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#FFFFFF", stroke: C.roas, strokeWidth: 2 }}
            name={t("chart.roasLine")}
            animationBegin={400}
            animationDuration={1000}
            animationEasing="ease-out"
          />

          {/* Break-even line at ROAS 100% */}
          <ReferenceLine
            yAxisId="roas"
            y={100}
            stroke={C.breakeven}
            strokeDasharray="6 3"
            strokeOpacity={0.5}
            label={{ value: t("chart.breakeven"), position: "right", fontSize: 10, fill: C.breakeven }}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={12}
            wrapperStyle={{ fontSize: 11, color: C.legend }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
