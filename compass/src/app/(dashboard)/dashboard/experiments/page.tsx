"use client"

import { PageHeader } from "@/widgets/sidebar"
import { KPICards } from "@/widgets/dashboard"
import { ExperimentBar, VariantImpactChart, RolloutHistoryTimeline, RippleForecastFan } from "@/widgets/charts"
import { useLocale } from "@/shared/i18n"
import { mockExperimentKPIs, mockExperiments, mockExperimentVariants, mockRippleForecasts } from "@/shared/api"
import { formatNumber } from "@/shared/lib"
import { PageTransition, FadeInUp } from "@/shared/ui/page-transition"
import { useGridLayout } from "@/shared/hooks"
import { motion } from "framer-motion"

const GRID_TRANSITION = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

export default function ExperimentsPage() {
  const { t } = useLocale()
  const expGrid = useGridLayout(2)

  return (
    <PageTransition>
      <FadeInUp>
        <PageHeader titleKey="experiments.title" subtitleKey="experiments.subtitle" />
      </FadeInUp>

      <FadeInUp className="mb-6">
        <KPICards items={[
          { labelKey: "kpi.velocity", value: mockExperimentKPIs.velocity.value, unit: "/mo", trend: mockExperimentKPIs.velocity.trend, trendLabel: mockExperimentKPIs.velocity.trendLabel },
          { labelKey: "kpi.shipRate", value: `${mockExperimentKPIs.shipRate.value}%`, trend: mockExperimentKPIs.shipRate.trend, trendLabel: mockExperimentKPIs.shipRate.trendLabel },
          { labelKey: "kpi.winRate", value: `${mockExperimentKPIs.winRate.value}%`, trend: mockExperimentKPIs.winRate.trend, trendLabel: mockExperimentKPIs.winRate.trendLabel },
          { labelKey: "kpi.cumDeltaLtv", value: `$${mockExperimentKPIs.cumDeltaLtv.value}`, trend: mockExperimentKPIs.cumDeltaLtv.trend, trendLabel: mockExperimentKPIs.cumDeltaLtv.trendLabel },
        ]} />
      </FadeInUp>

      <FadeInUp className="mb-6">
        <ExperimentBar data={mockExperiments} />
      </FadeInUp>

      <FadeInUp className="grid grid-cols-2 gap-6 mb-8">
        <motion.div layout className={expGrid.getClassName("chart-0", 0)} transition={GRID_TRANSITION}>
          <VariantImpactChart variants={mockExperimentVariants} expanded={expGrid.expandedId === "chart-0"} onToggle={() => expGrid.toggle("chart-0")} />
        </motion.div>
        <motion.div layout className={expGrid.getClassName("chart-1", 1)} transition={GRID_TRANSITION}>
          <RolloutHistoryTimeline variant={mockExperimentVariants.find(v => v.experimentId === 1) || mockExperimentVariants[0]} expanded={expGrid.expandedId === "chart-1"} onToggle={() => expGrid.toggle("chart-1")} />
        </motion.div>
      </FadeInUp>

      <FadeInUp className="mb-8">
        <RippleForecastFan
          forecast={mockRippleForecasts[0]}
          variantName={mockExperimentVariants.find(v => v.id === mockRippleForecasts[0].variantId)?.name || "Variant"}
        />
      </FadeInUp>

      <FadeInUp>
        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Experiment Detail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">{t("table.name")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.ate")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.deltaLtv")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.annualRevenue")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.roi")}</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-[var(--text-muted)]">{t("table.status")}</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-[var(--text-muted)]">{t("table.decision")}</th>
                </tr>
              </thead>
              <tbody>
                {mockExperiments.map((exp) => (
                  <tr key={exp.id} className="border-b border-slate-50">
                    <td className="px-3 py-2.5 text-xs font-medium text-[var(--text-primary)]">{exp.name}</td>
                    <td className={`px-3 py-2.5 text-xs text-right ${exp.ate >= 0 ? "text-[var(--signal-green)]" : "text-[var(--signal-red)]"}`}>
                      {exp.ate >= 0 ? "+" : ""}{exp.ate}pp
                    </td>
                    <td className={`px-3 py-2.5 text-xs text-right font-medium ${exp.deltaLtv >= 0 ? "text-[var(--signal-green)]" : "text-[var(--signal-red)]"}`}>
                      {exp.deltaLtv >= 0 ? "+" : ""}${exp.deltaLtv}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)]">{formatNumber(Math.abs(exp.annualRevenue))}</td>
                    <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)]">{exp.roi}%</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        exp.status === "shipped" ? "bg-green-50 text-green-700" :
                        exp.status === "running" ? "bg-blue-50 text-blue-700" :
                        "bg-red-50 text-red-700"
                      }`}>{t(`exp.${exp.status}` as const)}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        exp.decision === "win" ? "bg-green-50 text-green-700" :
                        exp.decision === "lose" ? "bg-red-50 text-red-700" :
                        "bg-slate-50 text-slate-600"
                      }`}>{t(`exp.${exp.decision}` as const)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeInUp>
    </PageTransition>
  )
}
