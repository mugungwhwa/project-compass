"use client"

import { useLocale } from "@/shared/i18n"
import type { RevenueForecastPoint } from "@/shared/api/mock-data"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type RevenueForecastProps = { data: RevenueForecastPoint[]; title?: string }

export function RevenueForecast({ data, title }: RevenueForecastProps) {
  const { t } = useLocale()
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50/50 p-6 h-full card-premium" style={{ boxShadow: "0 4px 24px rgba(15,23,42,0.04)" }}>
      <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-1">{title || t("chart.revenue")}</h3>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-3 leading-relaxed">{t("info.revenueForecast")}</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B9AFF" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#5B9AFF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}K`} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v) => [v != null ? `$${v}K` : ""]} />
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#revenueBand)" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="none" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Line type="monotone" dataKey="p50" stroke="#5B9AFF" strokeWidth={2} dot={false} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <Line type="monotone" dataKey="p90" stroke="#5B9AFF" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.3} dot={false} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <Line type="monotone" dataKey="p10" stroke="#5B9AFF" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.3} dot={false} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
