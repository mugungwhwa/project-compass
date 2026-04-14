"use client"

import { PageHeader } from "@/widgets/sidebar"
import { KPICards } from "@/widgets/dashboard"
import { ScenarioSimulator, BudgetDonut, RevenueForecast, RunwayFanChart } from "@/widgets/charts"
import { useLocale } from "@/shared/i18n"
import { mockCapitalKPIs, mockBudgetAllocation, mockRevenueProjection, mockCashRunway } from "@/shared/api"
import { PageTransition, FadeInUp } from "@/shared/ui/page-transition"
import { useGridLayout } from "@/shared/hooks"
import { motion } from "framer-motion"

const GRID_TRANSITION = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

export default function CapitalConsolePage() {
  const { t, locale } = useLocale()
  const capGrid = useGridLayout(2)

  return (
    <PageTransition>
      <FadeInUp>
        <PageHeader titleKey="capital.title" subtitleKey="capital.subtitle" />
      </FadeInUp>

      <FadeInUp className="mb-6">
        <KPICards items={[
          { labelKey: "kpi.capitalEff", value: `${mockCapitalKPIs.capitalEff.value}x`, trend: mockCapitalKPIs.capitalEff.trend, trendLabel: mockCapitalKPIs.capitalEff.trendLabel },
          { labelKey: "kpi.burn", value: mockCapitalKPIs.burnMonths.value, unit: t("common.months"), trend: mockCapitalKPIs.burnMonths.trend, trendLabel: mockCapitalKPIs.burnMonths.trendLabel },
          { labelKey: "kpi.irr", value: `${mockCapitalKPIs.irr.value}%`, trend: mockCapitalKPIs.irr.trend, trendLabel: mockCapitalKPIs.irr.trendLabel },
          { labelKey: "kpi.npv", value: `$${mockCapitalKPIs.npv.value}M`, trend: mockCapitalKPIs.npv.trend, trendLabel: mockCapitalKPIs.npv.trendLabel },
        ]} />
      </FadeInUp>

      {/* Runway Fan Chart — Compass signature visualization, Visx-powered */}
      <FadeInUp className="mb-6">
        <RunwayFanChart data={mockCashRunway} locale={locale} />
      </FadeInUp>

      <FadeInUp className="mb-6">
        <ScenarioSimulator />
      </FadeInUp>

      <FadeInUp className="grid grid-cols-2 gap-4">
        <motion.div layout className={`${capGrid.getClassName("chart-0", 0)} h-full`} transition={GRID_TRANSITION}>
          <BudgetDonut data={mockBudgetAllocation} expanded={capGrid.expandedId === "chart-0"} onToggle={() => capGrid.toggle("chart-0")} />
        </motion.div>
        <motion.div layout className={`${capGrid.getClassName("chart-1", 1)} h-full`} transition={GRID_TRANSITION}>
          <RevenueForecast data={mockRevenueProjection} title={t("chart.revenueProj")} expanded={capGrid.expandedId === "chart-1"} onToggle={() => capGrid.toggle("chart-1")} />
        </motion.div>
      </FadeInUp>
    </PageTransition>
  )
}
