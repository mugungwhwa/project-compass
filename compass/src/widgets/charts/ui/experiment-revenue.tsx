"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { RevenueDecompPoint, DecompStats } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { REVENUE_DECOMP_COLORS } from "@/shared/config/chart-colors"
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const C = REVENUE_DECOMP_COLORS

type IsolateMode = "all" | "organic" | "experiment"

type ExperimentRevenueProps = {
  data: RevenueDecompPoint[]
  stats: DecompStats
}

/* ── Velocity / Elasticity stats bar ── */
function StatsBar({
  mode,
  stats,
  locale,
}: {
  mode: IsolateMode
  stats: DecompStats
  locale: string
}) {
  if (mode === "organic") {
    return (
      <div className="mb-3 flex items-center gap-6 rounded-md bg-[var(--bg-2)] px-4 py-2.5">
        <div className="text-[11px] text-[var(--fg-2)]">
          <span className="font-medium text-[var(--fg-0)]">
            +{stats.organicQoQ}% QoQ
          </span>
          {" "}
          {locale === "ko" ? "기저 매출 추이" : "baseline trend"}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-3 flex items-center justify-between rounded-md bg-[var(--bg-2)] px-4 py-2.5">
      <div className="text-[11px] text-[var(--fg-2)]">
        <span className="mr-1 font-semibold text-[var(--fg-0)]">
          {locale === "ko" ? "속도" : "Velocity"}
        </span>
        {stats.totalExp} exp · {stats.shipRate}% ship · {stats.avgDays}d avg
      </div>
      <div className="text-[11px] text-[var(--fg-2)]">
        <span className="mr-1 font-semibold text-[var(--fg-0)]">
          {locale === "ko" ? "탄력성" : "Elasticity"}
        </span>
        +${stats.cumDeltaLtv} ΔLTV · {stats.winRate}% win · {stats.expRoi}× ROI
      </div>
    </div>
  )
}

/* ── Interactive legend with click-to-isolate ── */
function DecompLegend({
  mode,
  onToggle,
  labels,
}: {
  mode: IsolateMode
  onToggle: (layer: IsolateMode) => void
  labels: { organic: string; experiment: string; showAll: string }
}) {
  const items: { key: IsolateMode; color: string; label: string }[] = [
    { key: "organic", color: C.organic, label: labels.organic },
    { key: "experiment", color: C.experiment, label: labels.experiment },
  ]

  return (
    <div className="mt-2 flex items-center justify-center gap-5">
      {items.map((item) => {
        const isActive = mode === "all" || mode === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(item.key)}
            className="flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-80"
            style={{ opacity: isActive ? 1 : 0.35 }}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </button>
        )
      })}
      {mode !== "all" && (
        <button
          type="button"
          onClick={() => onToggle("all")}
          className="ml-2 rounded border border-[var(--border-default)] px-2 py-0.5 text-[10px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)]"
        >
          {labels.showAll}
        </button>
      )}
    </div>
  )
}

/* ── Deploy marker rendered as custom bar label ── */
function DeployMarker({ x, y, width, value }: { x: number; y: number; width: number; value: number }) {
  if (value === 0) return null
  const cx = x + width / 2
  return (
    <g>
      <polygon
        points={`${cx},${y - 14} ${cx - 4},${y - 6} ${cx + 4},${y - 6}`}
        fill={C.deploy}
      />
      <text x={cx} y={y - 17} textAnchor="middle" fontSize={9} fontWeight={600} fill={C.deploy}>
        {value}
      </text>
    </g>
  )
}

/* ── Main component ── */
export function ExperimentRevenue({ data, stats }: ExperimentRevenueProps) {
  const { t, locale } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 384 })
  const [mode, setMode] = useState<IsolateMode>("all")

  const handleToggle = (layer: IsolateMode) => {
    setMode((prev) => (prev === layer ? "all" : layer))
  }

  // Compute Y-axis domain based on isolation mode
  const yDomain = useMemo(() => {
    if (mode === "all") {
      const max = Math.max(...data.map((d) => d.total))
      return [0, Math.ceil(max / 20) * 20]
    }
    const values = data.map((d) => d[mode])
    const max = Math.max(...values)
    return [0, Math.ceil(max / 20) * 20]
  }, [data, mode])

  // Last month experiment share for insight
  const lastPoint = data[data.length - 1]
  const expShare = lastPoint ? Math.round((lastPoint.experiment / lastPoint.total) * 100) : 0

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("chart.revenueDecomp")}
        subtitle="Puzzle Quest · 2025 Jul — 2026 Apr · $K"
        context={t("info.revenueDecomp")}
        insight={
          locale === "ko"
            ? `실험이 매출의 ${expShare}%를 만들고 있습니다.`
            : `Experiments drive ${expShare}% of revenue.`
        }
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />

      <StatsBar mode={mode} stats={stats} locale={locale} />

      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={data} margin={{ top: 20, right: 16, left: 8, bottom: 0 }}>
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
            width={48}
            domain={yDomain}
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
                  const d = payload[0]?.payload as RevenueDecompPoint | undefined
                  if (!d) return null
                  const ratio = d.total > 0 ? Math.round((d.experiment / d.total) * 100) : 0
                  return (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.fg0, marginBottom: 6 }}>
                        {label}
                      </div>
                      {(mode === "all" || mode === "organic") && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                          <TooltipDot color={C.organic} />
                          <span style={{ color: C.fg2 }}>{t("chart.organic")}</span>
                          <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: C.fg0, fontVariantNumeric: "tabular-nums" }}>
                            ${d.organic}K
                          </span>
                        </div>
                      )}
                      {(mode === "all" || mode === "experiment") && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                          <TooltipDot color={C.experiment} />
                          <span style={{ color: C.fg2 }}>{t("chart.expLift")}</span>
                          <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: C.fg0, fontVariantNumeric: "tabular-nums" }}>
                            ${d.experiment}K
                          </span>
                        </div>
                      )}
                      {mode === "all" && (
                        <>
                          <div style={{ borderTop: "1px solid #E2E2DD", margin: "4px 0" }} />
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                            <span style={{ color: C.fg2 }}>{locale === "ko" ? "총 매출" : "Total"}</span>
                            <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 700, color: C.fg0, fontVariantNumeric: "tabular-nums" }}>
                              ${d.total}K
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, lineHeight: 1.6, opacity: 0.7 }}>
                            <span style={{ color: C.fg2, marginLeft: 0 }}>
                              {t("chart.expRatio")} {ratio}%
                            </span>
                          </div>
                        </>
                      )}
                      {d.expShipped > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, lineHeight: 1.6, marginTop: 2 }}>
                          <TooltipDot color={C.deploy} />
                          <span style={{ color: C.fg2 }}>
                            {t("chart.deployCount")} {d.expShipped}{locale === "ko" ? "건" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                }}
              />
            }
          />

          {/* ── Organic bar (bottom of stack) ── */}
          {(mode === "all" || mode === "organic") && (
            <Bar
              dataKey="organic"
              stackId="revenue"
              fill={C.organic}
              fillOpacity={mode === "organic" ? 0.85 : 0.55}
              radius={mode === "organic" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              barSize={32}
              name={t("chart.organic")}
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
              isAnimationActive={false}
            />
          )}

          {/* ── Experiment bar (top of stack) ── */}
          {(mode === "all" || mode === "experiment") && (
            <Bar
              dataKey="experiment"
              stackId={mode === "all" ? "revenue" : "exp-solo"}
              fill={C.experiment}
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
              barSize={32}
              name={t("chart.expLift")}
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
              isAnimationActive={false}
              label={(props) => {
                const { x, y, width, index } = props as unknown as { x: number; y: number; width: number; index: number }
                const point = data[index]
                if (!point || point.expShipped === 0) return <g key={index} />
                return <DeployMarker key={index} x={x} y={y} width={width} value={point.expShipped} />
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <DecompLegend
        mode={mode}
        onToggle={handleToggle}
        labels={{
          organic: t("chart.organic"),
          experiment: t("chart.expLift"),
          showAll: t("chart.showAll"),
        }}
      />
    </motion.div>
  )
}
