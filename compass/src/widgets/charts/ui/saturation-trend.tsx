"use client"

import { useLocale } from "@/shared/i18n"
import type { SaturationTrendPoint } from "@/shared/api/mock-data"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

type SaturationTrendChartProps = {
  data: SaturationTrendPoint[]
}

export function SaturationTrendChart({ data }: SaturationTrendChartProps) {
  const { t } = useLocale()

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50/50 p-6 card-premium">
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{t("market.saturationTrend")}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{t("info.saturationTrend")}</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="thresholdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFA94D" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#FFA94D" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="myRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B9AFF" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#5B9AFF" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}K`} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v) => [`$${v}K`, ""]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="topGrossingThreshold" stroke="#FFA94D" strokeWidth={2} fill="url(#thresholdGrad)" name={t("market.entryThreshold")} animationBegin={200} animationDuration={1200} />
          <Area type="monotone" dataKey="myRevenue" stroke="#5B9AFF" strokeWidth={2.5} fill="url(#myRevGrad)" name={t("market.myRevenue")} animationBegin={400} animationDuration={1200} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
