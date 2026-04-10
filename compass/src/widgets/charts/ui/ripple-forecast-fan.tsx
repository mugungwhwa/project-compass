"use client"

import { useLocale } from "@/shared/i18n"
import type { RippleForecast } from "@/shared/api/mock-data"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

type RippleForecastFanProps = {
  forecast: RippleForecast
  variantName: string
}

export function RippleForecastFan({ forecast, variantName }: RippleForecastFanProps) {
  const { t } = useLocale()

  const data = forecast.stages.map(s => ({
    stage: `${s.percentage}%`,
    p50: s.predicted_ltv_lift,
    p10: s.ci_low,
    p90: s.ci_high,
    days: s.days_to_observe,
  }))

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50/50 p-6 card-premium">
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{t("exp.rippleForecast")}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">{variantName} · {t("info.rippleForecast")}</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rippleBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B9AFF" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#5B9AFF" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
            label={{ value: t("exp.stageRollout"), position: "insideBottom", offset: -5, fontSize: 10, fill: "#94A3B8" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
          />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v) => [`$${Number(v).toFixed(0)}`, ""]} />
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#rippleBand)" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="#FFFFFF" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Line type="monotone" dataKey="p50" stroke="#5B9AFF" strokeWidth={2.5} dot={{ r: 4, fill: "#FFFFFF", stroke: "#5B9AFF", strokeWidth: 2 }} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <ReferenceLine y={0} stroke="#94A3B8" strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
