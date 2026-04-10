"use client"

const cohortData = [
  { cohort: "Jan", d1: 41, d3: 28, d7: 17, d14: 12, d30: 7 },
  { cohort: "Feb", d1: 42, d3: 29, d7: 18, d14: 13, d30: 8 },
  { cohort: "Mar", d1: 42, d3: 28, d7: 19, d14: 13, d30: 9 },
]

function heatColor(value: number): string {
  // Uses deck palette: #5B9AFF (accent-blue) at varying opacity levels
  if (value >= 35) return "text-white" + " " + "bg-[#5B9AFF]"
  if (value >= 25) return "text-white" + " " + "bg-[#7AAEFF]"
  if (value >= 15) return "text-white" + " " + "bg-[#A8C8FF]"
  if (value >= 10) return "text-[#1E3A6E]" + " " + "bg-[#D4E7FF]"
  return "text-[#2D5FA0]" + " " + "bg-[#EBF3FF]"
}

export function CohortHeatmap() {
  const days = ["D1", "D3", "D7", "D14", "D30"]
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Cohort Retention Heatmap</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">Cohort</th>
              {days.map((d) => (<th key={d} className="px-3 py-2 text-center text-xs font-medium text-[var(--text-muted)]">{d}</th>))}
            </tr>
          </thead>
          <tbody>
            {cohortData.map((row) => (
              <tr key={row.cohort}>
                <td className="px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">{row.cohort} 2026</td>
                {[row.d1, row.d3, row.d7, row.d14, row.d30].map((val, i) => (
                  <td key={i} className="px-1 py-1">
                    <div className={`rounded-md px-3 py-2 text-center text-xs font-semibold ${heatColor(val)}`}>{val}%</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
