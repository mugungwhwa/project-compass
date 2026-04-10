"use client"

import { useLocale } from "@/shared/i18n"
import type { ExperimentVariant } from "@/shared/api/mock-data"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

type RolloutHistoryTimelineProps = {
  variant: ExperimentVariant
}

export function RolloutHistoryTimeline({ variant }: RolloutHistoryTimelineProps) {
  const { t } = useLocale()

  if (!variant.rollout_history || variant.rollout_history.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50/50 p-6 card-premium">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-2">{t("exp.rolloutHistory")}</h3>
        <p className="text-sm text-[var(--text-muted)]">No rollout history yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50/50 p-6 card-premium">
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{t("exp.rolloutHistory")}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">{variant.name} · {t("info.rolloutHistory")}</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={variant.rollout_history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            yAxisId="pct"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <YAxis
            yAxisId="ltv"
            orientation="right"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar yAxisId="pct" dataKey="percentage" fill="#5B9AFF" fillOpacity={0.5} radius={[4, 4, 0, 0]} barSize={20} name="% Rollout" animationBegin={200} animationDuration={800} animationEasing="ease-out" />
          <Line yAxisId="ltv" type="monotone" dataKey="cumulative_ltv" stroke="#3EDDB5" strokeWidth={2.5} dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#3EDDB5", strokeWidth: 2 }} name="Cumulative LTV ($)" animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
