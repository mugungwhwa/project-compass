"use client"

import { PageHeader } from "@/widgets/sidebar"
import { HeroVerdict, KPICards } from "@/widgets/dashboard"
import { RevenueVsInvest, ExperimentRevenue, RevenueForecast } from "@/widgets/charts"
import { useLocale } from "@/shared/i18n"
import {
  mockSignal,
  mockKPIs,
  mockRevenueForecast,
  mockRevenueVsInvest,
  mockRevenueDecomp,
  mockDecompStats,
} from "@/shared/api"
import { PageTransition, FadeInUp } from "@/shared/ui/page-transition"

/*
  Module 1 — Executive Overview
  ------------------------------
  2026-04-08 refactor: Financial Health and the inline AI Recommendation
  box have been promoted to app-shell components (RunwayStatusBar +
  CopilotPanel) and removed from this page. See:
    docs/Project_Compass_Design_Migration_Log.md §5
    .omc/specs/2026-04-08-dashboard-shell-refactor.md
*/

export default function ExecutiveOverviewPage() {
  const { t: _t } = useLocale()

  return (
    <PageTransition>
      {/* 1. Hero Verdict — sticky top of fold (DecisionSurface-based) */}
      <FadeInUp>
        <HeroVerdict
          status={mockSignal.status}
          confidence={mockSignal.confidence}
          factors={mockSignal.factors}
          payback={mockSignal.payback}
          nextAction={mockSignal.nextAction}
          reason={mockSignal.reason}
        />
      </FadeInUp>

      <FadeInUp>
        <PageHeader titleKey="exec.title" subtitleKey="exec.subtitle" />
      </FadeInUp>

      {/* 2. KPI Cards */}
      <FadeInUp className="mb-8">
        <KPICards
          items={[
            { labelKey: "kpi.roas", value: `${mockKPIs.roas.value}%`, trend: mockKPIs.roas.trend, trendLabel: mockKPIs.roas.trendLabel },
            { labelKey: "kpi.payback", value: mockKPIs.payback.value, unit: _t("common.days"), trend: mockKPIs.payback.trend, trendLabel: mockKPIs.payback.trendLabel },
            { labelKey: "kpi.bep", value: `${mockKPIs.bep.value}%`, trend: mockKPIs.bep.trend, trendLabel: mockKPIs.bep.trendLabel },
            { labelKey: "kpi.burn", value: mockKPIs.burn.value, unit: _t("common.months"), trend: mockKPIs.burn.trend, trendLabel: mockKPIs.burn.trendLabel },
          ]}
          basisKey="kpi.basis"
        />
      </FadeInUp>

      {/* 3. Revenue vs Investment + Retention curve */}
      <FadeInUp className="grid grid-cols-2 gap-6 mb-8">
        <RevenueVsInvest data={mockRevenueVsInvest} />
        <ExperimentRevenue data={mockRevenueDecomp} stats={mockDecompStats} />
      </FadeInUp>

      {/* 4. Revenue forecast — full width since FinancialHealth + AI box moved to app shell */}
      <FadeInUp>
        <RevenueForecast data={mockRevenueForecast} />
      </FadeInUp>
    </PageTransition>
  )
}
