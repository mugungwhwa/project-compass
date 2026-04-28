"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend,
} from "recharts"
import { PALETTE } from "@/shared/config/chart-colors"
import { CHART_TYPO } from "@/shared/config/chart-typography"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"

type Series = { date: string; observed: number; counterfactual: number; cfLow: number; cfHigh: number }

type Props = {
  actionLabel: string
  actionDate: string
  metric: string
  series: Series[]
  ate: number
  ateLow: number
  ateHigh: number
  probability: number
}

export function CausalImpactPanel({
  actionLabel, actionDate, metric, series, ate, ateLow, ateHigh, probability,
}: Props) {
  const { t } = useLocale()

  const bandData = series.map((s) => ({
    date: s.date,
    observed: s.observed,
    counterfactual: s.counterfactual,
    band: [s.cfLow, s.cfHigh],
  }))

  return (
    <motion.div
      layout
      className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6"
    >
      <ChartHeader
        title={t("chart.causalImpact")}
        subtitle={t("info.causalImpact")}
        context={`${actionLabel} · ${actionDate} · ${metric}`}
      />

      <div className="mb-4 grid grid-cols-3 gap-3 text-xs">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-2)] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-[var(--fg-2)]">{t("chart.causalImpact.ate")}</div>
          <div className="mt-1 text-lg font-semibold text-[var(--fg-0)]">+{ate.toFixed(1)}pp</div>
          <div className="text-[10px] text-[var(--fg-2)]">90% CI: [{ateLow.toFixed(1)}, {ateHigh.toFixed(1)}]</div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-2)] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-[var(--fg-2)]">{t("chart.causalImpact.probability")}</div>
          <div className="mt-1 text-lg font-semibold" style={{ color: PALETTE.positive }}>
            {(probability * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-[var(--fg-2)]">{t("chart.causalImpact.probSubtitle")}</div>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-2)] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-[var(--fg-2)]">{t("chart.causalImpact.verdict")}</div>
          <div className="mt-1 text-sm font-semibold" style={{ color: PALETTE.positive }}>
            {t("chart.causalImpact.verdict.real")}
          </div>
          <div className="text-[10px] text-[var(--fg-2)]">{t("chart.causalImpact.verdict.subtitle")}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={bandData} margin={{ top: 12, right: 20, left: 4, bottom: 12 }}>
          <defs>
            <linearGradient id="cfBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.benchmark} stopOpacity={0.28} />
              <stop offset="100%" stopColor={PALETTE.benchmark} stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ ...CHART_TYPO.axisTick, fill: PALETTE.axis }}
            axisLine={{ stroke: PALETTE.border }}
            tickLine={false}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ ...CHART_TYPO.axisTick, fill: PALETTE.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ ...CHART_TYPO.legend, color: PALETTE.fg2 }} />
          <Area
            type="linear"
            dataKey="band"
            name={t("chart.causalImpact.cfBand")}
            stroke="none"
            fill="url(#cfBand)"
            animationDuration={800}
          />
          <Line
            type="linear"
            dataKey="counterfactual"
            name={t("chart.causalImpact.counterfactual")}
            stroke={PALETTE.benchmark}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
            animationDuration={800}
          />
          <Line
            type="linear"
            dataKey="observed"
            name={t("chart.causalImpact.observed")}
            stroke={PALETTE.observed}
            strokeWidth={2}
            dot={{ r: 2.5, fill: PALETTE.observed }}
            animationDuration={1000}
          />
          <ReferenceLine x={actionDate} stroke={PALETTE.p50} strokeDasharray="3 3" label={{ value: t("chart.causalImpact.executionPoint"), position: "top", ...CHART_TYPO.annotationText, fill: PALETTE.p50 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
