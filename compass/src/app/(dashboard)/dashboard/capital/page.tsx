"use client"

import { PageHeader } from "@/widgets/sidebar"
import { KPICards } from "@/widgets/dashboard"
import { ScenarioSimulator, BudgetDonut, RevenueForecast, RunwayFanChart } from "@/widgets/charts"
import { useLocale } from "@/shared/i18n"
import { mockCapitalKPIs, mockBudgetAllocation, mockRevenueProjection, mockCashRunway } from "@/shared/api"
import { PageTransition, FadeInUp } from "@/shared/ui/page-transition"

export default function CapitalConsolePage() {
  const { t, locale } = useLocale()

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
        <BudgetDonut data={mockBudgetAllocation} />
        <RevenueForecast data={mockRevenueProjection} title={t("chart.revenueProj")} />
      </FadeInUp>
    </PageTransition>
  )
}
