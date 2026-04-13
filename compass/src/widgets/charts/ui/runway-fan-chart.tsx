"use client"

/*
  RunwayFanChart — Module 5 signature chart, built with @visx.
  ------------------------------------------------------------
  Capital runway Monte Carlo projection.
  Shows P10/P50/P90 fan widening over 12 months.
  Red "cash-out zone" highlights below-threshold territory.

  This is the first Compass chart built on Visx instead of Recharts —
  chosen because Recharts can't express:
    - a hard rectangular "cash-out zone" underlay
    - a fan that widens asymmetrically around P50
    - annotation lines that reference specific data geometry

  Source of truth: docs/Project_Compass_Design_Migration_Log.md §4.1
  Data: mockCashRunway (src/shared/api/mock-data.ts)
*/

import { motion } from "framer-motion"
import { ParentSize } from "@visx/responsive"
import { Group } from "@visx/group"
import { scaleLinear } from "@visx/scale"
import { AreaClosed, LinePath, Line } from "@visx/shape"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { curveMonotoneX } from "@visx/curve"
import type { RunwayFanData, RunwayPoint } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { RUNWAY_FAN_COLORS as C } from "@/shared/config/chart-colors"

const MARGIN = { top: 24, right: 32, bottom: 40, left: 56 }

type Props = {
  data: RunwayFanData
  title?: string
  locale?: "en" | "ko"
  height?: number
}

function InnerChart({
  data,
  width,
  height,
  locale,
}: {
  data: RunwayFanData
  width: number
  height: number
  locale: "en" | "ko"
}) {
  if (width < 50) return null

  const innerWidth = width - MARGIN.left - MARGIN.right
  const innerHeight = height - MARGIN.top - MARGIN.bottom

  // Scales
  const xMax = Math.max(...data.points.map((p) => p.month))
  const yMin = Math.min(...data.points.map((p) => p.p10))
  const yMax = Math.max(...data.points.map((p) => p.p90))
  const yPadding = (yMax - yMin) * 0.05

  const xScale = scaleLinear<number>({
    domain: [0, xMax],
    range: [0, innerWidth],
  })

  const yScale = scaleLinear<number>({
    domain: [yMin - yPadding, yMax + yPadding],
    range: [innerHeight, 0],
    nice: true,
  })

  const thresholdY = yScale(data.cashOutThreshold)
  const cashOutTop = Math.min(thresholdY, innerHeight)

  // Find P50 cash-out crossing point for marker
  const p50CrossX = xScale(data.p50CashOutMonth)
  const showP50Cross = data.p50CashOutMonth >= 0 && data.p50CashOutMonth <= xMax

  return (
    <svg width={width} height={height}>
      <Group left={MARGIN.left} top={MARGIN.top}>
        {/* Cash-out zone background (below threshold) */}
        {cashOutTop < innerHeight && (
          <>
            <rect
              x={0}
              y={cashOutTop}
              width={innerWidth}
              height={innerHeight - cashOutTop}
              fill={C.cashOut}
            />
            <Line
              from={{ x: 0, y: thresholdY }}
              to={{ x: innerWidth, y: thresholdY }}
              stroke={C.cashOutBorder}
              strokeWidth={1}
              strokeDasharray="2 4"
              strokeOpacity={0.6}
            />
          </>
        )}

        {/* Gridlines (horizontal only — compact enterprise style) */}
        {yScale.ticks(5).map((tick) => (
          <Line
            key={`grid-${tick}`}
            from={{ x: 0, y: yScale(tick) }}
            to={{ x: innerWidth, y: yScale(tick) }}
            stroke={C.grid}
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        ))}

        {/* P10–P90 fan band (closed area between p10 and p90) */}
        <AreaClosed<RunwayPoint>
          data={data.points}
          x={(d) => xScale(d.month)}
          y={(d) => yScale(d.p90)}
          y0={(d) => yScale(d.p10)}
          yScale={yScale}
          fill={C.bandOuter}
          curve={curveMonotoneX}
          defined={(d) => d.p10 != null && d.p90 != null}
        />

        {/* P90 upper boundary (subtle stroke) */}
        <LinePath<RunwayPoint>
          data={data.points}
          x={(d) => xScale(d.month)}
          y={(d) => yScale(d.p90)}
          stroke={C.p50}
          strokeWidth={1}
          strokeOpacity={0.25}
          strokeDasharray="3 3"
          curve={curveMonotoneX}
        />

        {/* P10 lower boundary (subtle stroke) */}
        <LinePath<RunwayPoint>
          data={data.points}
          x={(d) => xScale(d.month)}
          y={(d) => yScale(d.p10)}
          stroke={C.p50}
          strokeWidth={1}
          strokeOpacity={0.25}
          strokeDasharray="3 3"
          curve={curveMonotoneX}
        />

        {/* P50 median line (primary signal) */}
        <LinePath<RunwayPoint>
          data={data.points}
          x={(d) => xScale(d.month)}
          y={(d) => yScale(d.p50)}
          stroke={C.p50}
          strokeWidth={2}
          curve={curveMonotoneX}
        />

        {/* P50 data dots */}
        {data.points.map((p) => (
          <circle
            key={`p50-${p.month}`}
            cx={xScale(p.month)}
            cy={yScale(p.p50)}
            r={2.5}
            fill={C.p50}
          />
        ))}

        {/* P50 cash-out crossing marker */}
        {showP50Cross && (
          <g>
            <Line
              from={{ x: p50CrossX, y: 0 }}
              to={{ x: p50CrossX, y: innerHeight }}
              stroke={C.cashOutBorder}
              strokeWidth={1}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <circle
              cx={p50CrossX}
              cy={thresholdY}
              r={4}
              fill={C.cashOutBorder}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          </g>
        )}

        {/* Axes */}
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          numTicks={data.points.length}
          tickFormat={(v) => {
            const point = data.points.find((p) => p.month === Number(v))
            return point?.label ?? ""
          }}
          stroke={C.border}
          tickStroke={C.border}
          tickLabelProps={() => ({
            fill: C.axis,
            fontSize: 10,
            textAnchor: "middle",
            fontFamily: "var(--font-geist-mono)",
          })}
        />
        <AxisLeft
          scale={yScale}
          numTicks={5}
          tickFormat={(v) => `$${Number(v).toFixed(0)}K`}
          stroke="transparent"
          tickStroke="transparent"
          tickLabelProps={() => ({
            fill: C.axis,
            fontSize: 10,
            textAnchor: "end",
            dx: "-0.25em",
            dy: "0.25em",
            fontFamily: "var(--font-geist-mono)",
          })}
        />

        {/* Cash-out probability annotation (top right) */}
        <g transform={`translate(${innerWidth}, 0)`}>
          <text
            x={0}
            y={0}
            textAnchor="end"
            fill={C.cashOutBorder}
            fontSize={11}
            fontFamily="var(--font-geist-mono)"
            fontWeight={600}
          >
            {locale === "en"
              ? `${(data.probCashOut * 100).toFixed(0)}% probability of cash-out by month ${data.points.length - 1}`
              : `${data.points.length - 1}개월 내 자금 소진 확률 ${(data.probCashOut * 100).toFixed(0)}%`}
          </text>
        </g>
      </Group>
    </svg>
  )
}

export function RunwayFanChart({ data, title, locale = "en", height }: Props) {
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 340 })

  const titleText =
    title ?? (locale === "en" ? "Capital Runway — Monte Carlo Projection" : "자본 런웨이 — 몬테카를로 예측")
  const subtitle =
    locale === "en"
      ? `Starting cash $${data.initialCash}K · P10 / P50 / P90 bands · ${data.points.length - 1}-month horizon`
      : `초기 잔고 $${data.initialCash}K · P10 / P50 / P90 밴드 · ${data.points.length - 1}개월 전망`

  // height prop overrides expand when explicitly provided
  const resolvedHeight = height ?? chartHeight

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={titleText}
        subtitle={subtitle}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <div style={{ width: "100%", height: resolvedHeight }}>
        <ParentSize>
          {({ width, height: h }) => (
            <InnerChart data={data} width={width} height={h} locale={locale} />
          )}
        </ParentSize>
      </div>
    </motion.div>
  )
}
