"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { RevenueVsInvestPoint } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { REVENUE_VS_INVEST_COLORS } from "@/shared/config/chart-colors"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

type RevenueVsInvestProps = {
  data: RevenueVsInvestPoint[]
}

const C = REVENUE_VS_INVEST_COLORS

export function RevenueVsInvest({ data }: RevenueVsInvestProps) {
  const { t, locale } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 384 })

  // Find BEP crossing: first index where cumRevenue >= cumUaSpend
  const bepIndex = useMemo(
    () => data.findIndex((d) => d.cumRevenue >= d.cumUaSpend),
    [data],
  )

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
        insight={
          locale === "ko"
            ? "누적 매출이 1월에 UA 투자를 추월 — 손익분기 도달."
            : "Cumulative revenue overtook UA spend in Jan — break-even reached."
        }
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data} margin={{ top: 16, right: 20, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.revenue} stopOpacity={0.2} />
              <stop offset="100%" stopColor={C.revenue} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradUaSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.uaSpend} stopOpacity={0.15} />
              <stop offset="100%" stopColor={C.uaSpend} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: C.axis }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v}`}
            width={52}
            label={{
              value: "$K",
              position: "top",
              offset: 4,
              style: { fontSize: 10, fill: C.axis, textAnchor: "middle" },
            }}
          />

          <Tooltip
            content={
              <ChartTooltip
                render={({ payload, label }) => {
                  const d = payload[0]?.payload as RevenueVsInvestPoint | undefined
                  if (!d) return null
                  const gap = d.cumRevenue - d.cumUaSpend
                  const isPositive = gap >= 0
                  return (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0A", marginBottom: 6 }}>
                        {label}
                      </div>
                      {/* Monthly breakdown */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <TooltipDot color={C.revenue} />
                        <span style={{ color: "#6B7280" }}>{t("chart.monthlyRev")}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>
                          ${d.revenue}K
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <TooltipDot color={C.uaSpend} />
                        <span style={{ color: "#6B7280" }}>{t("chart.monthlySpend")}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>
                          ${d.uaSpend}K
                        </span>
                      </div>
                      {/* Divider */}
                      <div style={{ borderTop: "1px solid #E2E2DD", margin: "4px 0" }} />
                      {/* Cumulative */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <TooltipDot color={C.revenue} />
                        <span style={{ color: "#6B7280" }}>{t("chart.cumRevenue")}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 600, color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>
                          ${d.cumRevenue}K
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <TooltipDot color={C.uaSpend} />
                        <span style={{ color: "#6B7280" }}>{t("chart.cumUaSpend")}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 600, color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>
                          ${d.cumUaSpend}K
                        </span>
                      </div>
                      {/* Gap */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6, marginTop: 2 }}>
                        <TooltipDot color={isPositive ? C.profit : C.loss} />
                        <span style={{ color: "#6B7280" }}>
                          {isPositive
                            ? (locale === "ko" ? "회수 초과" : "Surplus")
                            : (locale === "ko" ? "미회수" : "Deficit")}
                        </span>
                        <span style={{
                          marginLeft: "auto",
                          paddingLeft: 12,
                          fontWeight: 700,
                          color: isPositive ? C.profit : C.loss,
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          {isPositive ? "+" : ""}{gap}K
                        </span>
                      </div>
                      {/* ROAS */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, lineHeight: 1.6, marginTop: 2, opacity: 0.7 }}>
                        <span style={{ color: "#6B7280", marginLeft: 14 }}>ROAS {d.roas}%</span>
                      </div>
                    </div>
                  )
                }}
              />
            }
          />

          {/* ── Cumulative UA Spend area (orange, behind) ── */}
          <Area
            type="monotone"
            dataKey="cumUaSpend"
            stroke={C.uaSpend}
            strokeWidth={2.5}
            fill="url(#gradUaSpend)"
            dot={{ r: 3, fill: "#FFFFFF", stroke: C.uaSpend, strokeWidth: 2 }}
            name={t("chart.cumUaSpend")}
            animationBegin={200}
            animationDuration={800}
            animationEasing="ease-out"
          />

          {/* ── Cumulative Revenue area (blue, front) ── */}
          <Area
            type="monotone"
            dataKey="cumRevenue"
            stroke={C.revenue}
            strokeWidth={2.5}
            fill="url(#gradRevenue)"
            dot={(props: Record<string, unknown>) => {
              const { cx, cy, index } = props as { cx: number; cy: number; index: number }
              const isBep = index === bepIndex
              if (isBep) {
                return (
                  <g key={index}>
                    {/* Pulsing ring */}
                    <circle cx={cx} cy={cy} r={10} fill={C.profit} fillOpacity={0.12} />
                    {/* Solid dot */}
                    <circle cx={cx} cy={cy} r={5} fill={C.profit} stroke="#FFFFFF" strokeWidth={2} />
                    {/* BEP label */}
                    <text
                      x={cx}
                      y={cy - 16}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={700}
                      fill={C.profit}
                    >
                      BEP
                    </text>
                  </g>
                )
              }
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill="#FFFFFF"
                  stroke={C.revenue}
                  strokeWidth={2}
                />
              )
            }}
            name={t("chart.cumRevenue")}
            animationBegin={200}
            animationDuration={800}
            animationEasing="ease-out"
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={12}
            wrapperStyle={{ fontSize: 11, color: C.legend }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
