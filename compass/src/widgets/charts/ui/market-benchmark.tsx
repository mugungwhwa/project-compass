"use client"

import { useLocale } from "@/shared/i18n"
import type { RetentionDataPoint } from "@/shared/api/mock-data"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

type MarketBenchmarkProps = { data: RetentionDataPoint[] }

export function MarketBenchmark({ data }: MarketBenchmarkProps) {
  const { t } = useLocale()
  const chartData = data.map((d) => ({ day: `D${d.day}`, p50: d.p50, p10: d.p10, p90: d.p90, genre: d.genre }))
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{t("chart.benchmark")}</h3>
      <p className="text-xs text-[var(--text-muted)] mb-1">Puzzle Quest vs Puzzle Genre</p>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-3 leading-relaxed">{t("info.benchmark")}</p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="genreBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={[0, 50]} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v) => [v != null ? `${v}%` : ""]} />
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#genreBand)" name={t("chart.bandOuter")} animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="none" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
          <Line type="monotone" dataKey="genre" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name={t("chart.genreAvg")} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <Line type="monotone" dataKey="p50" stroke="#5B9AFF" strokeWidth={2.5} dot={{ r: 3, fill: "#FFF", stroke: "#5B9AFF", strokeWidth: 2 }} name="Puzzle Quest" animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <Legend verticalAlign="bottom" height={36} iconSize={12} wrapperStyle={{ fontSize: 11 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
