"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { ActionData } from "@/shared/api/mock-data"
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ZAxis, Cell,
} from "recharts"
import { PALETTE, ACTION_TIMELINE_COLORS } from "@/shared/config/chart-colors"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { CHART_TYPO } from "@/shared/config/chart-typography"

type Props = {
  actions: ActionData[]
  expanded?: boolean
  onToggle?: () => void
}

const typeColor: Record<ActionData["type"], string> = {
  ua: ACTION_TIMELINE_COLORS.ua,
  liveops: ACTION_TIMELINE_COLORS.liveops,
  release: ACTION_TIMELINE_COLORS.release,
}

export function ActionRoiQuadrant({ actions, expanded: extExpanded, onToggle }: Props) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({
    baseHeight: 260,
    expanded: extExpanded,
    onToggle,
  })

  const rows = actions
    .filter((a) => typeof a.cost === "number" && a.cost! > 0)
    .map((a) => ({
      x: a.cost!,
      y: a.deltaLtv,
      roi: +(a.deltaLtv / (a.cost! / 100)).toFixed(2),
      type: a.type,
      label: a.description,
      date: a.date,
    }))

  const medianCost = [...rows].sort((a, b) => a.x - b.x)[Math.floor(rows.length / 2)]?.x ?? 40
  const medianLtv = [...rows].sort((a, b) => a.y - b.y)[Math.floor(rows.length / 2)]?.y ?? 1.5

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
    >
      <ChartHeader
        title={t("chart.roiQuadrant")}
        subtitle={t("info.roiQuadrant")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <div className="flex gap-4 mb-3">
        {(["ua", "liveops", "release"] as const).map((type) => (
          <div key={type} className="flex items-center gap-1.5 text-[11px] text-[var(--fg-2)]">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: typeColor[type] }} />
            {t(`action.${type}`)}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.grid} />
          <XAxis
            type="number"
            dataKey="x"
            name={t("chart.roiQuadrant.cost")}
            unit="K"
            tick={{ ...CHART_TYPO.axisTick, fill: PALETTE.axis }}
            axisLine={{ stroke: PALETTE.border }}
            tickLine={false}
            label={{ value: t("chart.roiQuadrant.cost"), position: "insideBottom", offset: -8, ...CHART_TYPO.annotationText, fill: PALETTE.fg2 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="ΔLTV"
            tick={{ ...CHART_TYPO.axisTick, fill: PALETTE.axis }}
            axisLine={false}
            tickLine={false}
            label={{ value: "ΔLTV", angle: -90, position: "insideLeft", ...CHART_TYPO.axisLabel, fill: PALETTE.fg2 }}
          />
          <ZAxis range={[80, 80]} />
          <ReferenceLine x={medianCost} stroke={PALETTE.benchmark} strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={medianLtv} stroke={PALETTE.benchmark} strokeDasharray="3 3" strokeOpacity={0.5} />
          <Tooltip content={<ChartTooltip />} />
          <Scatter data={rows} animationDuration={800}>
            {rows.map((row, i) => (
              <Cell key={i} fill={typeColor[row.type]} fillOpacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] text-[var(--fg-2)]">
        <div className="rounded bg-[var(--bg-2)] px-2 py-1">◀ {t("chart.roiQuadrant.q.highRoi")}</div>
        <div className="rounded bg-[var(--bg-2)] px-2 py-1">{t("chart.roiQuadrant.q.bigBet")} ▶</div>
        <div className="rounded bg-[var(--bg-2)] px-2 py-1">◀ {t("chart.roiQuadrant.q.lowEffort")}</div>
        <div className="rounded bg-[var(--bg-2)] px-2 py-1">{t("chart.roiQuadrant.q.wasteful")} ▶</div>
      </div>
    </motion.div>
  )
}
