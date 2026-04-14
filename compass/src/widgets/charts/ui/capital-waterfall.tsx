"use client"

import { useMemo } from "react"
import { useLocale } from "@/shared/i18n"
import type { CapitalWaterfallStep } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts"

type CapitalWaterfallProps = {
  data: CapitalWaterfallStep[]
}

const PALETTE = {
  inflow:     "#00875A",
  outflow:    "#C9372C",
  netPos:     "#1A7FE8",
  netNeg:     "#C9372C",
  grid:       "#ECECE8",
  axis:       "#6B7280",
  border:     "#E2E2DD",
}

type WaterfallRow = {
  label: string
  base: number
  visible: number
  value: number
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
      type: step.type,
    }
  })
}

function getBarColor(row: WaterfallRow): string {
  if (row.type === "inflow")  return PALETTE.inflow
  if (row.type === "outflow") return PALETTE.outflow
  return row.value >= 0 ? PALETTE.netPos : PALETTE.netNeg
}

export function CapitalWaterfall({ data }: CapitalWaterfallProps) {
  const { t, locale } = useLocale()

  const rows = useMemo(
    () => buildWaterfallRows(data, locale as "ko" | "en"),
    [data, locale],
  )

  return (
    <div
      className="rounded-xl border border-[var(--border)] p-6 card-glow card-premium"
      style={{ boxShadow: "0 4px 24px rgba(91,154,255,0.08)" }}
    >
      <ChartHeader
        title={t("chart.capitalWaterfall")}
        insight={t("info.capitalWaterfall")}
      />
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={rows} margin={{ top: 16, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: PALETTE.axis }}
            axisLine={{ stroke: PALETTE.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: PALETTE.axis }}
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
                  return (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0A", marginBottom: 6 }}>
                        {label}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                        <TooltipDot color={color} />
                        <span style={{ color: "#6B7280" }}>
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
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          {sign}${(Math.abs(row.value) / 1000).toFixed(1)}K
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
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
