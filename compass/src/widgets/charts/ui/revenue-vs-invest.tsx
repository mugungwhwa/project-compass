"use client"

import { useLocale } from "@/shared/i18n"
import type { RevenueVsInvestPoint } from "@/shared/api/mock-data"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts"

type RevenueVsInvestProps = {
  data: RevenueVsInvestPoint[]
}

export function RevenueVsInvest({ data }: RevenueVsInvestProps) {
  const { t } = useLocale()

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50/50 p-6 card-premium" style={{ boxShadow: "0 4px 24px rgba(15,23,42,0.04)" }}>
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
          {t("chart.rovsInvest")}
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          Puzzle Quest · 2025 Jul — 2026 Apr · $K
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{t("info.revenueVsInvest")}</p>
      </div>
      <ResponsiveContainer width="100%" height={384}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B9AFF" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#5B9AFF" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="money"
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}K`}
          />
          <YAxis
            yAxisId="roas"
            orientation="right"
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 200]}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
            formatter={(value, name) => {
              if (String(name) === "ROAS") return [`${value}%`, String(name)]
              return [`$${value}K`, String(name)]
            }}
          />

          {/* Revenue bars */}
          <Bar
            yAxisId="money"
            dataKey="revenue"
            fill="#5B9AFF"
            fillOpacity={0.8}
            radius={[4, 4, 0, 0]}
            barSize={24}
            name={t("chart.monthlyRev")}
            animationBegin={200}
            animationDuration={800}
            animationEasing="ease-out"
          />
          {/* UA Spend bars */}
          <Bar
            yAxisId="money"
            dataKey="uaSpend"
            fill="#FFA94D"
            fillOpacity={0.6}
            radius={[4, 4, 0, 0]}
            barSize={24}
            name={t("chart.monthlySpend")}
            animationBegin={200}
            animationDuration={800}
            animationEasing="ease-out"
          />

          {/* ROAS line */}
          <Line
            yAxisId="roas"
            type="monotone"
            dataKey="roas"
            stroke="#3EDDB5"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#3EDDB5", strokeWidth: 2 }}
            name={t("chart.roasLine")}
            animationBegin={400}
            animationDuration={1000}
            animationEasing="ease-out"
          />

          {/* Break-even line at ROAS 100% */}
          <ReferenceLine
            yAxisId="roas"
            y={100}
            stroke="#FF6B8A"
            strokeDasharray="6 3"
            strokeOpacity={0.5}
            label={{ value: t("chart.breakeven"), position: "right", fontSize: 10, fill: "#FF6B8A" }}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={12}
            wrapperStyle={{ fontSize: 11, color: "#64748B" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
