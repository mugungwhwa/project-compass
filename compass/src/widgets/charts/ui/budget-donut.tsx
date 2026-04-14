"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { BudgetSlice } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { BUDGET_DONUT_COLORS } from "@/shared/config/chart-colors"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const C = BUDGET_DONUT_COLORS

type BudgetDonutProps = { data: BudgetSlice[]; expanded?: boolean; onToggle?: () => void }

export function BudgetDonut({ data, expanded: externalExpanded, onToggle: externalToggle }: BudgetDonutProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 200, expanded: externalExpanded, onToggle: externalToggle })

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 h-full flex flex-col ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("chart.budgetAlloc")}
        subtitle={t("info.budgetDonut")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />
      <div className="flex-1" style={{ minHeight: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0} animationBegin={200} animationDuration={1000}>
            {data.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            iconSize={10}
            wrapperStyle={{ fontSize: 12, color: C.legend }}
            formatter={(value: string, entry: { payload?: { value?: number } }) =>
              `${value} (${entry.payload?.value ?? 0}%)`
            }
          />
        </PieChart>
      </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
