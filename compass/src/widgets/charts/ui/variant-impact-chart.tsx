"use client"

import { useLocale } from "@/shared/i18n"
import type { ExperimentVariant } from "@/shared/api/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ErrorBar, ResponsiveContainer } from "recharts"

type VariantImpactChartProps = {
  variants: ExperimentVariant[]
}

export function VariantImpactChart({ variants }: VariantImpactChartProps) {
  const { t } = useLocale()

  const data = variants.map(v => ({
    name: v.name,
    ltv: v.ltv_delta,
    error: [v.ltv_delta - v.ltv_ci_low, v.ltv_ci_high - v.ltv_delta],
    status: v.status,
    sampleSize: v.sample_size,
  }))

  const colorForStatus = (status: string) => {
    if (status === "shipped" || status === "winner") return "#3EDDB5"
    if (status === "reverted" || status === "loser") return "#FF6B8A"
    if (status === "control") return "#94A3B8"
    return "#5B9AFF"
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50/50 p-6 card-premium">
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{t("exp.variantImpact")}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{t("info.variantImpact")}</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 10 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            width={115}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
            formatter={(value, name) => {
              if (String(name) === "ltv") return [`$${Number(value).toFixed(2)}`, "ΔLTV"]
              return [String(value), String(name)]
            }}
          />
          <Bar dataKey="ltv" radius={[0, 6, 6, 0]} barSize={22} animationBegin={200} animationDuration={1000} animationEasing="ease-out">
            {data.map((entry, i) => (
              <Cell key={i} fill={colorForStatus(entry.status)} />
            ))}
            <ErrorBar dataKey="error" width={8} strokeWidth={2} stroke="#0F172A" direction="x" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
