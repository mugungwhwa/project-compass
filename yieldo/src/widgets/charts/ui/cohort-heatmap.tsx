"use client"

import { ChartHeader } from "@/shared/ui/chart-header"
import { COHORT_HEATMAP_COLORS } from "@/shared/config/chart-colors"

const C = COHORT_HEATMAP_COLORS

const cohortData = [
  { cohort: "Jan", d1: 41, d3: 28, d7: 17, d14: 12, d30: 7 },
  { cohort: "Feb", d1: 42, d3: 29, d7: 18, d14: 13, d30: 8 },
  { cohort: "Mar", d1: 42, d3: 28, d7: 19, d14: 13, d30: 9 },
]

function heatStyle(value: number): { bg: string; text: string } {
  if (value >= 35) return { bg: C.level5, text: "#FFFFFF" }
  if (value >= 25) return { bg: C.level4, text: "#FFFFFF" }
  if (value >= 15) return { bg: C.level3, text: "#FFFFFF" }
  if (value >= 10) return { bg: C.level2, text: "#1E3A6E" }
  return { bg: C.level1, text: "#2D5FA0" }
}

export function CohortHeatmap() {
  const days = ["D1", "D3", "D7", "D14", "D30"]
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6">
      <ChartHeader
        title="Cohort Retention Heatmap"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--fg-2)]">Cohort</th>
              {days.map((d) => (<th key={d} className="px-3 py-2 text-center text-xs font-medium text-[var(--fg-2)]">{d}</th>))}
            </tr>
          </thead>
          <tbody>
            {cohortData.map((row) => (
              <tr key={row.cohort}>
                <td className="px-3 py-2 text-xs font-medium text-[var(--fg-2)]">{row.cohort} 2026</td>
                {[row.d1, row.d3, row.d7, row.d14, row.d30].map((val, i) => {
                  const { bg, text } = heatStyle(val)
                  return (
                    <td key={i} className="px-1 py-1">
                      <div
                        className="rounded-md px-3 py-2 text-center text-xs font-semibold font-mono"
                        style={{ backgroundColor: bg, color: text }}
                      >
                        {val}%
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
