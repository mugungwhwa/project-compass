"use client"

import { useState } from "react"
import { useLocale } from "@/shared/i18n"
import { computeScenario } from "@/shared/api/mock-data"
import { formatNumber } from "@/shared/lib"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { SCENARIO_SIMULATOR_COLORS } from "@/shared/config/chart-colors"
import { CHART_TYPO } from "@/shared/config/chart-typography"

const C = SCENARIO_SIMULATOR_COLORS

export function ScenarioSimulator() {
  const { t } = useLocale()
  const [uaBudget, setUaBudget] = useState(100000)
  const [targetRoas, setTargetRoas] = useState(142)

  const scenarioData = [50000, 75000, 100000, 125000, 150000, 175000, 200000].map((budget) => {
    const result = computeScenario(budget, targetRoas)
    return { budget: formatNumber(budget), payback: result.paybackDays, bep: result.bepProbability, revenue: result.monthlyRevenue }
  })

  const current = computeScenario(uaBudget, targetRoas)

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-5">
      <h3 className="text-h3 text-[var(--fg-0)] mb-1">{t("chart.scenario")}</h3>
      <p className="text-caption text-[var(--fg-2)] mt-1 mb-4 leading-relaxed">{t("info.scenario")}</p>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-caption text-[var(--fg-2)] mb-1.5 block">
            {t("scenario.uaBudget")}: <span className="font-semibold text-[var(--fg-0)]">{formatNumber(uaBudget)}</span>
          </label>
          <input type="range" min={50000} max={200000} step={10000} value={uaBudget} onChange={(e) => setUaBudget(Number(e.target.value))} className="w-full accent-[var(--brand)]" />
          <div className="flex justify-between text-[10px] text-[var(--fg-3)]"><span>$50K</span><span>$200K</span></div>
        </div>
        <div>
          <label className="text-caption text-[var(--fg-2)] mb-1.5 block">
            {t("scenario.targetRoas")}: <span className="font-semibold text-[var(--fg-0)]">{targetRoas}%</span>
          </label>
          <input type="range" min={80} max={300} step={5} value={targetRoas} onChange={(e) => setTargetRoas(Number(e.target.value))} className="w-full accent-[var(--brand)]" />
          <div className="flex justify-between text-[10px] text-[var(--fg-3)]"><span>80%</span><span>300%</span></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-[var(--radius-card)] bg-[var(--bg-2)] p-3 text-center">
          <p className="text-caption text-[var(--fg-2)]">{t("scenario.paybackChange")}</p>
          <p className="text-h2 font-mono text-[var(--fg-0)]">{current.paybackDays}d</p>
        </div>
        <div className="rounded-[var(--radius-card)] bg-[var(--bg-2)] p-3 text-center">
          <p className="text-caption text-[var(--fg-2)]">{t("scenario.bepChange")}</p>
          <p className="text-h2 font-mono text-[var(--fg-0)]">{current.bepProbability}%</p>
        </div>
        <div className="rounded-[var(--radius-card)] bg-[var(--bg-2)] p-3 text-center">
          <p className="text-caption text-[var(--fg-2)]">{t("chart.revenue")}</p>
          <p className="text-h2 font-mono text-[var(--fg-0)]">{formatNumber(current.monthlyRevenue)}/mo</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={scenarioData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="budget" tick={{ ...CHART_TYPO.axisTick, fill: "var(--fg-3)" }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />
          <YAxis yAxisId="left" tick={{ ...CHART_TYPO.axisTick, fill: "var(--fg-3)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}d`} />
          <YAxis yAxisId="right" orientation="right" tick={{ ...CHART_TYPO.axisTick, fill: "var(--fg-3)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
          <Tooltip contentStyle={{ borderRadius: "var(--radius-card)", border: "1px solid var(--border-default)", fontSize: CHART_TYPO.tooltipLabel.fontSize, background: "var(--bg-1)", color: "var(--fg-0)" }} />
          <Line yAxisId="left" type="monotone" dataKey="payback" stroke={C.payback} strokeWidth={2} name="Payback" dot={{ r: 2 }} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          <Line yAxisId="right" type="monotone" dataKey="bep" stroke={C.bep} strokeWidth={2} name="BEP %" dot={{ r: 2 }} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
