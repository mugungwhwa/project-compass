"use client"

/*
  RetentionCurve — Compass's signature chart.
  --------------------------------------------
  Refactored 2026-04-07 to the new design language:
  - No gradient wrapper, no glow
  - Hard-coded hex values now match the design tokens in globals.css
    (recharts SVG attrs don't reliably resolve CSS var() at runtime)
  - Higher data-ink ratio: fewer decorative borders, neutral grid
  - P50 dots now solid (observed) — more honest than hollow dots

  Token mapping (keep in sync with src/styles/globals.css):
    --chart-p50            → #1A7FE8
    --chart-band-inner     → rgba(26, 127, 232, 0.18)
    --chart-band-outer     → rgba(26, 127, 232, 0.10)
    --chart-benchmark      → #9CA3AF
    --fg-2                 → #6B7280
    --border-subtle        → #ECECE8
    --signal-positive      → #00875A
*/

import { useState } from "react"
import { useLocale } from "@/shared/i18n"
import type { RetentionDataPoint } from "@/shared/api/mock-data"
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
} from "recharts"

type RetentionCurveProps = {
  data: RetentionDataPoint[]
  asymptoticDay: number
}

// Token-mirrored colors (must match globals.css :root values)
const C = {
  p50: "#1A7FE8",
  bandOuter: "rgba(26, 127, 232, 0.10)",
  bandInner: "rgba(26, 127, 232, 0.18)",
  benchmark: "#9CA3AF",
  grid: "#ECECE8",
  axis: "#6B7280",
  border: "#E2E2DD",
  asymptotic: "#00875A",
  bg: "#FFFFFF",
} as const

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
        fontSize={10}
        fontWeight={500}
        fill={C.asymptotic}
      >
        {text}
      </text>

      {/* Tooltip card on hover */}
      {hovered && (
        <foreignObject x={x - 120} y={y - 68} width={240} height={56}>
          <div
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 11,
              lineHeight: 1.45,
              color: "#4B5563",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <strong style={{ color: C.asymptotic }}>{text}</strong>
            <br />
            {description}
          </div>
        </foreignObject>
      )}
    </g>
  )
}

export function RetentionCurve({ data, asymptoticDay }: RetentionCurveProps) {
  const { t } = useLocale()
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
    <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6">
      <div className="mb-4">
        <h3 className="text-h2 text-[var(--fg-0)]">
          {t("chart.retention")} — D1 to D60
        </h3>
        <p className="text-caption text-[var(--fg-2)]">
          Puzzle Quest · Cohort 2026-03 · P10 / P50 / P90
        </p>
        <p className="mt-1 text-caption text-[var(--fg-2)] leading-relaxed">
          {t("info.retention")}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={384}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: C.axis }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
            domain={[0, 50]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 4,
              border: `1px solid ${C.border}`,
              fontSize: 12,
              backgroundColor: C.bg,
              boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
            }}
            formatter={(value) => [value != null ? `${value}%` : ""]}
          />

          {/* Outer band: P10–P90 (widest, palest) */}
          <Area
            type="monotone"
            dataKey="p90"
            stroke="none"
            fill={C.bandOuter}
            animationBegin={200}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Area type="monotone" dataKey="p10" stroke="none" fill="none" />

          {/* Inner band: P25–P75 (tighter, darker) */}
          <Area
            type="monotone"
            dataKey="p75"
            stroke="none"
            fill={C.bandInner}
            animationBegin={200}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Area type="monotone" dataKey="p25" stroke="none" fill="none" />

          {/* Genre benchmark: subordinate neutral dashed line */}
          <Line
            type="monotone"
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
            type="monotone"
            dataKey="p50"
            stroke={C.p50}
            strokeWidth={2}
            dot={{ r: 3, fill: C.p50, stroke: C.p50, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: C.p50 }}
            name={t("chart.p50")}
            animationBegin={400}
            animationDuration={1000}
            animationEasing="ease-out"
          />

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
            wrapperStyle={{ fontSize: 11, color: C.axis }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
