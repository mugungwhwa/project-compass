"use client"

import { useLocale } from "@/shared/i18n"
import type { BudgetSlice } from "@/shared/api/mock-data"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

type BudgetDonutProps = { data: BudgetSlice[] }

export function BudgetDonut({ data }: BudgetDonutProps) {
  const { t } = useLocale()
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 h-full">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{t("chart.budgetAlloc")}</h3>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-3 leading-relaxed">{t("info.budgetDonut")}</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0} animationBegin={200} animationDuration={1000}>
            {data.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            iconSize={10}
            wrapperStyle={{ fontSize: 12, color: "#64748B" }}
            formatter={(value: string, entry: { payload?: { value?: number } }) =>
              `${value} (${entry.payload?.value ?? 0}%)`
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
