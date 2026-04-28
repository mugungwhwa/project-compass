"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { CapitalWaterfallStep } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { CHART_TYPO } from "@/shared/config/chart-typography"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts"

type CapitalWaterfallProps = {
  data: CapitalWaterfallStep[]
  expanded?: boolean
  onToggle?: () => void
}

const PALETTE = {
  inflow:     "#00875A",
  outflow:    "#C9372C",
  netPos:     "#1A7FE8",
  netNeg:     "#8B2A1F",
  running:    "#6B7280",
  grid:       "#ECECE8",
  axis:       "#6B7280",
  border:     "#E2E2DD",
}

type WaterfallRow = {
  label: string
  base: number
  visible: number
  value: number
  runningTotal: number
  type: "inflow" | "outflow" | "net"
}

function buildWaterfallRows(data: CapitalWaterfallStep[], locale: "ko" | "en"): WaterfallRow[] {
  let running = 0
  return data.map((step) => {
    let base: number
    let visible: number

    if (step.type === "inflow") {
      base = running
      visible = step.value
      running += step.value
    } else if (step.type === "outflow") {
      // value is negative; bar hangs down from running total
      running += step.value // running decreases
      base = running        // base is the lower end
      visible = Math.abs(step.value)
    } else {
      // net: start from 0
      base = step.value < 0 ? step.value : 0
      visible = Math.abs(step.value)
      running = step.value
    }

    return {
      label: step.label[locale],
      base,
      visible,
      value: step.value,
      runningTotal: running,
      type: step.type,
    }
  })
}

function getBarColor(row: WaterfallRow): string {
  if (row.type === "inflow")  return PALETTE.inflow
  if (row.type === "outflow") return PALETTE.outflow
  return row.value >= 0 ? PALETTE.netPos : PALETTE.netNeg
}

type LegendChipProps = { color: string; label: string; shape?: "square" | "line" }

function LegendChip({ color, label, shape = "square" }: LegendChipProps) {
  return (
    <div className="flex items-center gap-1.5">
      {shape === "square" ? (
        <span
          aria-hidden
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            background: color,
            display: "inline-block",
          }}
        />
      ) : (
        <span
          aria-hidden
          style={{
            width: 14,
            height: 0,
            borderTop: `1.5px dashed ${color}`,
            display: "inline-block",
          }}
        />
      )}
      <span className="text-[11px] text-[var(--fg-2)]">{label}</span>
    </div>
  )
}

export function CapitalWaterfall({ data, expanded: externalExpanded, onToggle: externalToggle }: CapitalWaterfallProps) {
  const { t, locale } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 320, expanded: externalExpanded, onToggle: externalToggle })

  const rows = useMemo(
    () => buildWaterfallRows(data, locale as "ko" | "en"),
    [data, locale],
  )

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border)] p-6 card-glow card-premium h-full flex flex-col ${gridClassName}`}
      style={{ boxShadow: "none" }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("chart.capitalWaterfall")}
        info={t("info.capitalWaterfall")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <LegendChip color={PALETTE.inflow}  label={t("chart.legend.inflow")} />
        <LegendChip color={PALETTE.outflow} label={t("chart.legend.outflow")} />
        <LegendChip color={PALETTE.netPos}  label={t("chart.legend.netPos")} />
        <LegendChip color={PALETTE.netNeg}  label={t("chart.legend.netNeg")} />
        <LegendChip color={PALETTE.running} label={t("chart.legend.running")} shape="line" />
      </div>
      <div className="flex-1" style={{ minHeight: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 24, right: 20, left: 8, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ ...CHART_TYPO.axisTick, fill: PALETTE.axis }}
            axisLine={{ stroke: PALETTE.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ ...CHART_TYPO.axisTick, fill: PALETTE.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            width={52}
          />
          <Tooltip
            content={
              <ChartTooltip
                render={({ payload, label }) => {
                  const row = payload[0]?.payload as WaterfallRow | undefined
                  if (!row) return null
                  const color = getBarColor(row)
                  const sign = row.value > 0 ? "+" : ""
                  const runningSign = row.runningTotal > 0 ? "+" : ""
                  return (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#FFE45E", marginBottom: 6 }}>
                        {label}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <TooltipDot color={color} />
                        <span style={{ color: "#ECF1F7" }}>
                          {row.type === "inflow"
                            ? (locale === "ko" ? "유입" : "Inflow")
                            : row.type === "outflow"
                            ? (locale === "ko" ? "지출" : "Outflow")
                            : (locale === "ko" ? "순 포지션" : "Net Position")}
                        </span>
                        <span style={{
                          marginLeft: "auto",
                          paddingLeft: 12,
                          fontWeight: 600,
                          color,
                          fontVariantNumeric: CHART_TYPO.tooltipValue.fontVariantNumeric,
                          fontFamily: CHART_TYPO.tooltipValue.fontFamily,
                        }}>
                          {sign}${(Math.abs(row.value) / 1000).toFixed(1)}K
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, lineHeight: 1.6, marginTop: 2 }}>
                        <TooltipDot color={PALETTE.running} />
                        <span style={{ color: "#ECF1F7" }}>
                          {locale === "ko" ? "누적" : "Cumulative"}
                        </span>
                        <span style={{
                          marginLeft: "auto",
                          paddingLeft: 12,
                          fontWeight: 500,
                          color: "#374151",
                          fontVariantNumeric: CHART_TYPO.tooltipValue.fontVariantNumeric,
                          fontFamily: CHART_TYPO.tooltipValue.fontFamily,
                        }}>
                          {runningSign}${(Math.abs(row.runningTotal) / 1000).toFixed(1)}K
                        </span>
                      </div>
                    </div>
                  )
                }}
              />
            }
          />
          {/* Invisible base — lifts visible bar to correct position */}
          <Bar dataKey="base" stackId="stack" fill="transparent" isAnimationActive={false} />
          {/* Visible colored bar */}
          <Bar dataKey="visible" stackId="stack" radius={[3, 3, 0, 0]} animationBegin={200} animationDuration={800}>
            {rows.map((row, i) => (
              <Cell key={i} fill={getBarColor(row)} />
            ))}
          </Bar>
          {/* Cumulative running-total line overlay */}
          <Line
            type="linear"
            dataKey="runningTotal"
            stroke={PALETTE.running}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ r: 2.5, fill: PALETTE.running, stroke: PALETTE.running }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
