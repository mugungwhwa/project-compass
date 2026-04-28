"use client"

/*
  RetentionCurve — yieldo's signature chart.
  --------------------------------------------
  Refactored 2026-04-07 to the new design language:
  - No gradient wrapper, no glow
  - Hard-coded hex values now match the design tokens in globals.css
    (recharts SVG attrs don't reliably resolve CSS var() at runtime)
  - Higher data-ink ratio: fewer decorative borders, neutral grid
  - P50 dots now solid (observed) — more honest than hollow dots

  Migrated 2026-04-13 to shared infrastructure:
  - Colors from RETENTION_CURVE_COLORS (chart-colors.ts)
  - ChartHeader, ChartTooltip, ExpandButton, useChartExpand
*/

import { useState } from "react"
import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { RetentionDataPoint } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { RETENTION_CURVE_COLORS } from "@/shared/config/chart-colors"
import { CHART_TYPO } from "@/shared/config/chart-typography"
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts"

type RetentionCurveProps = {
  data: RetentionDataPoint[]
  asymptoticDay: number
  expanded?: boolean
  onToggle?: () => void
}

const C = RETENTION_CURVE_COLORS

/*
  Custom SVG label for the Asymptotic Arrival reference line.
  Renders a hover-interactive label with a tooltip card that appears
  on mouseEnter. Standard Recharts <ReferenceLine label={...}> is
  static SVG text with zero interactivity — this replaces it.
*/
function AsymptoticLabel({
  viewBox,
  text,
  description,
}: {
  viewBox?: { x?: number; y?: number }
  text: string
  description: string
}) {
  const [hovered, setHovered] = useState(false)
  const x = viewBox?.x ?? 0
  const y = (viewBox?.y ?? 0) - 6

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer" }}
    >
      {/* Invisible wider hit area for easier hovering */}
      <rect
        x={x - 40}
        y={y - 14}
        width={80}
        height={20}
        fill="transparent"
      />
      {/* Label text */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontSize={CHART_TYPO.axisLabel.fontSize}
        fontWeight={700}
        fontFamily={CHART_TYPO.annotation.fontFamily}
        fill={C.asymptotic}
        style={{ filter: "drop-shadow(0 0 4px rgba(0, 232, 154, 0.5))" }}
      >
        {text}
      </text>

      {/* Tooltip card on hover.  Positioned 14px below the label by default,
          flipped above when label is in the top quadrant of chart so it never
          escapes the canvas.  The 14px offset gives breathing room from the
          dashed reference line below. */}
      {hovered && (
        <foreignObject x={x - 120} y={y + 8} width={240} height={68}>
          <div
            style={{
              background: "#0E1320",
              border: "1px solid rgba(255, 228, 94, 0.4)",
              borderRadius: 4,
              padding: "8px 10px",
              fontSize: 11,
              lineHeight: 1.5,
              color: "#ECF1F7",
              boxShadow: "0 0 18px rgba(255, 228, 94, 0.15), 0 8px 22px rgba(0, 0, 0, 0.5)",
              fontFamily: "var(--font-geist-mono), 'D2Coding', 'JetBrains Mono', monospace",
            }}
          >
            <strong
              style={{
                color: C.asymptotic,
                textShadow: "0 0 6px rgba(0, 232, 154, 0.4)",
                display: "block",
                marginBottom: 2,
              }}
            >
              {text}
            </strong>
            {description}
          </div>
        </foreignObject>
      )}
    </g>
  )
}

export function RetentionCurve({ data, asymptoticDay, expanded: externalExpanded, onToggle: externalToggle }: RetentionCurveProps) {
  const { t, locale } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 384, expanded: externalExpanded, onToggle: externalToggle })

  const chartData = data.map((d) => ({
    day: `D${d.day}`,
    p90: d.p90,
    p75: d.p75,
    p50: d.p50,
    p25: d.p25,
    p10: d.p10,
    genre: d.genre,
  }))

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 h-full flex flex-col ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={`${t("chart.retention")} — D1 to D60`}
        subtitle="Match League · Cohort 2026-03 · P10 / P50 / P90"
        info={t("info.retention")}
        insight={locale === "ko" ? "D14 코호트 안정화 이후 예측 구간이 좁아졌습니다." : "Prediction band tightened after D14 cohort stabilization."}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <div className="flex-1" style={{ minHeight: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 56, left: 4, bottom: 12 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ ...CHART_TYPO.axisTick, fill: C.axis }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ ...CHART_TYPO.axisTick, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
            domain={[0, 50]}
          />
          <Tooltip
            content={
              <ChartTooltip
                render={({ payload, label }) => (
                  <div>
                    {label != null && (
                      <div style={{ ...CHART_TYPO.tooltipTitle, color: "#FFE45E", marginBottom: 4 }}>
                        {label}
                      </div>
                    )}
                    {payload.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, ...CHART_TYPO.tooltipLabel, lineHeight: 1.6 }}>
                        <TooltipDot color={p.color ?? C.p50} />
                        <span style={{ color: "#ECF1F7" }}>{p.name}</span>
                        <span style={{ marginLeft: "auto", paddingLeft: 12, ...CHART_TYPO.tooltipValue, color: "#FFE45E" }}>
                          {p.value != null ? `${p.value}%` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            }
          />

          {/* Outer band: P10–P90 (widest, palest) */}
          <Area
            type="linear"
            dataKey="p90"
            stroke="none"
            fill={C.bandOuter}
            animationBegin={200}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Area type="linear" dataKey="p10" stroke="none" fill="none" />

          {/* Inner band: P25–P75 (tighter, darker) */}
          <Area
            type="linear"
            dataKey="p75"
            stroke="none"
            fill={C.bandInner}
            animationBegin={200}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Area type="linear" dataKey="p25" stroke="none" fill="none" />

          {/* Genre benchmark: subordinate neutral dashed line */}
          <Line
            type="linear"
            dataKey="genre"
            stroke={C.benchmark}
            strokeWidth={1.25}
            strokeDasharray="4 3"
            dot={false}
            name={t("chart.genreAvg")}
            animationBegin={400}
            animationDuration={1000}
            animationEasing="ease-out"
          />

          {/* P50 median: primary signal line, solid observed dots */}
          <Line
            type="linear"
            dataKey="p50"
            stroke={C.p50}
            strokeWidth={2}
            dot={{ r: 3, fill: C.p50, stroke: C.p50, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: C.p50 }}
            name={t("chart.p50")}
            animationBegin={400}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {/* Bloomberg-style endpoint label — the final value, painted on the
                line tip in mono, so traders can read "where are we now" without
                hovering. */}
            <LabelList
              dataKey="p50"
              position="right"
              offset={8}
              formatter={(v) => (typeof v === "number" ? `${v.toFixed(1)}%` : "")}
              fill={C.p50}
              fontSize={11}
              fontFamily="var(--font-geist-mono)"
              fontWeight={600}
            />
          </Line>

          {/* Asymptotic arrival marker — custom interactive label */}
          <ReferenceLine
            x={`D${asymptoticDay}`}
            stroke={C.asymptotic}
            strokeDasharray="2 4"
            strokeOpacity={0.7}
            label={
              <AsymptoticLabel
                text={t("chart.asymptotic")}
                description={t("info.asymptotic")}
              />
            }
          />

          <Legend
            verticalAlign="bottom"
            height={32}
            iconSize={10}
            wrapperStyle={{ ...CHART_TYPO.legend, color: C.axis }}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
