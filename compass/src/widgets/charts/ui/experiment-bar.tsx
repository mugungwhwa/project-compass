"use client"

import { useLocale } from "@/shared/i18n"
import type { ExperimentData } from "@/shared/api/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts"

type ExperimentBarProps = { data: ExperimentData[] }

export function ExperimentBar({ data }: ExperimentBarProps) {
  const { t } = useLocale()
  const sorted = [...data].sort((a, b) => Math.abs(b.deltaLtv) - Math.abs(a.deltaLtv))
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{t("chart.experimentRoi")}</h3>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-3 leading-relaxed">{t("info.experimentRoi")}</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} width={95} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v) => [v != null ? `$${v}` : "", "ΔLTV"]} />
          <Bar dataKey="deltaLtv" radius={[0, 4, 4, 0]} barSize={20} animationBegin={200} animationDuration={800} animationEasing="ease-out">
            {sorted.map((entry) => (
              <Cell key={entry.id} fill={entry.deltaLtv >= 0 ? "#3EDDB5" : "#FF6B8A"} fillOpacity={entry.status === "running" ? 0.5 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
