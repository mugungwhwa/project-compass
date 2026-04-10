"use client"

import { useLocale } from "@/shared/i18n"
import type { RankingHistoryPoint } from "@/shared/api/mock-data"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

type RankingTrendProps = {
  data: RankingHistoryPoint[]
}

export function RankingTrend({ data }: RankingTrendProps) {
  const { t } = useLocale()

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50/50 p-6 card-premium">
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{t("market.rankingTrend")}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{t("info.rankingTrend")}</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis
            reversed
            domain={[1, 10]}
            ticks={[1, 3, 5, 8, 10]}
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `#${v}`}
          />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v) => [`#${v}`, "Genre Rank"]} />
          <ReferenceLine y={5} stroke="#FFA94D" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: "Top 5", position: "right", fontSize: 10, fill: "#FFA94D" }} />
          <Line type="monotone" dataKey="myRank" stroke="#5B9AFF" strokeWidth={3} dot={{ r: 4, fill: "#FFFFFF", stroke: "#5B9AFF", strokeWidth: 2 }} animationBegin={400} animationDuration={1200} animationEasing="ease-out" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
