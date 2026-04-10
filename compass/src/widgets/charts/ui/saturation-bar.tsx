"use client"

import { useLocale } from "@/shared/i18n"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

type SaturationBarProps = { data: { metric: string; myGame: number; genreAvg: number }[] }

export function SaturationBar({ data }: SaturationBarProps) {
  const { t } = useLocale()
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 h-full">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{t("chart.saturation")}</h3>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-3 leading-relaxed">{t("info.saturation")}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="myGame" fill="#5B9AFF" radius={[4, 4, 0, 0]} barSize={16} name="Puzzle Quest" animationBegin={200} animationDuration={800} animationEasing="ease-out" />
          <Bar dataKey="genreAvg" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={16} name={t("chart.genreAvg")} animationBegin={200} animationDuration={800} animationEasing="ease-out" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
