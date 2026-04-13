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
  Cell,
} from "recharts"

type RevenueVsInvestProps = {
  data: RevenueVsInvestPoint[]
}

const C = REVENUE_VS_INVEST_COLORS

type DerivedPoint = RevenueVsInvestPoint & {
  monthlyNet: number
  cumulativeNet: number
}

export function RevenueVsInvest({ data }: RevenueVsInvestProps) {
  const { t, locale } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 384 })

  const chartData = useMemo<DerivedPoint[]>(
    () =>
      data.map((d) => ({
        ...d,
        monthlyNet: d.revenue - d.uaSpend,
        cumulativeNet: d.cumRevenue - d.cumUaSpend,
      })),
    [data],
  )

  // Find break-even crossing index (first month cumulative turns positive)
  const bepIndex = chartData.findIndex((d) => d.cumulativeNet >= 0)

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
        insight={locale === "ko" ? "매출이 3개월 연속 UA 투자를 앞서고 있습니다." : "Revenue is outpacing UA spend for 3 straight months."}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={chartData} margin={{ top: 16, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: C.axis }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
          />
          <YAxis
            yAxisId="net"
            tick={{ fontSize: 12, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v === 0 ? "0" : `${v > 0 ? "+" : ""}${v}`
            }
            width={48}
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
                  const d = payload[0]?.payload as DerivedPoint | undefined
                  if (!d) return null
                  return (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0A", marginBottom: 6 }}>
                        {label}
                      </div>
                      {/* Revenue & UA Spend detail */}
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
                      {/* Monthly Net */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <TooltipDot color={d.monthlyNet >= 0 ? C.profit : C.loss} />
                        <span style={{ color: "#6B7280" }}>{t("chart.monthlyNet")}</span>
                        <span style={{
                          marginLeft: "auto",
                          paddingLeft: 12,
                          fontWeight: 600,
                          color: d.monthlyNet >= 0 ? C.profit : C.loss,
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          {d.monthlyNet >= 0 ? "+" : ""}{d.monthlyNet}K
                        </span>
                      </div>
                      {/* Cumulative Net */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <TooltipDot color={C.cumLine} />
                        <span style={{ color: "#6B7280" }}>{t("chart.cumNet")}</span>
                        <span style={{
                          marginLeft: "auto",
                          paddingLeft: 12,
                          fontWeight: 500,
                          color: d.cumulativeNet >= 0 ? C.profit : C.loss,
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          {d.cumulativeNet >= 0 ? "+" : ""}{d.cumulativeNet}K
                        </span>
                      </div>
                      {/* ROAS */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <TooltipDot color={C.roas} />
                        <span style={{ color: "#6B7280" }}>ROAS</span>
                        <span style={{
                          marginLeft: "auto",
                          paddingLeft: 12,
                          fontWeight: 500,
                          color: "#0A0A0A",
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          {d.roas}%
                        </span>
                      </div>
                    </div>
                  )
                }}
              />
            }
          />

          {/* ── Monthly Net bars: green/red conditional ── */}
          <Bar
            yAxisId="net"
            dataKey="monthlyNet"
            radius={[4, 4, 0, 0]}
            barSize={28}
            name={t("chart.monthlyNet")}
            animationBegin={200}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((d, i) => (
              <Cell
                key={i}
                fill={d.monthlyNet >= 0 ? C.profit : C.loss}
                fillOpacity={0.75}
              />
            ))}
          </Bar>

          {/* ── Cumulative Net trajectory line ── */}
          <Line
            yAxisId="net"
            type="monotone"
            dataKey="cumulativeNet"
            stroke={C.cumLine}
            strokeWidth={2.5}
            dot={(props: Record<string, unknown>) => {
              const { cx, cy, index } = props as { cx: number; cy: number; index: number }
              const isBep = index === bepIndex
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={isBep ? 6 : 3.5}
                  fill={isBep ? C.profit : "#FFFFFF"}
                  stroke={isBep ? C.profit : C.cumLine}
                  strokeWidth={isBep ? 3 : 2}
                />
              )
            }}
            name={t("chart.cumNet")}
            animationBegin={400}
            animationDuration={1000}
            animationEasing="ease-out"
          />

          {/* ── Break-even: zero line ── */}
          <ReferenceLine
            yAxisId="net"
            y={0}
            stroke={C.axis}
            strokeWidth={1.5}
            strokeDasharray="6 3"
            label={{
              value: `── ${t("chart.breakeven")}`,
              position: "insideTopRight",
              fontSize: 11,
              fontWeight: 600,
              fill: C.axis,
              offset: 8,
            }}
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
