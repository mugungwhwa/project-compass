"use client"

import { PageHeader } from "@/widgets/sidebar"
import { PortfolioVerdict, KPICards, TitleHeatmap, MarketContextCard, DataFreshnessStrip } from "@/widgets/dashboard"
import { RevenueVsInvest, CapitalWaterfall, RevenueForecast } from "@/widgets/charts"
import { useLocale } from "@/shared/i18n"
import {
  mockPortfolioSignal,
  mockPortfolioKPIs,
  mockTitleHealth,
  mockMarketContext,
  mockCapitalWaterfall,
  mockRevenueVsInvest,
  mockRevenueForecast,
  mockDataFreshness,
} from "@/shared/api"
import { PageTransition, FadeInUp } from "@/shared/ui/page-transition"

/*
  Module 1 — Executive Overview 2.0
  -----------------------------------
  2026-04-13 redesign: Portfolio-level view with 4 agent perspectives:
    1. Portfolio Verdict (VC/Financial)
    2. Title Heatmap + Market Context (Market Intelligence)
    3. Capital Waterfall + Revenue vs Investment (Financial)
    4. Revenue Forecast + Data Freshness (Supervisory)

  Predecessor: single-game HeroVerdict + 4 KPIs + 2 charts + forecast.
  See ultraplan session_01BK44doLpw4i9WUEQmBYesc for architecture.
*/

export default function ExecutiveOverviewPage() {
  const { t: _t } = useLocale()

  return (
    <PageTransition>
      {/* 1. Portfolio Verdict — sticky top of fold (DecisionSurface-based) */}
      <FadeInUp>
        <PortfolioVerdict
          status={mockPortfolioSignal.status}
          confidence={mockPortfolioSignal.confidence}
          reason={mockPortfolioSignal.reason}
          recommendation={mockPortfolioSignal.recommendation}
          payback={mockPortfolioSignal.payback}
          titles={mockTitleHealth.map((t) => ({ label: t.label, signal: t.signal }))}
        />
      </FadeInUp>

      <FadeInUp>
        <PageHeader titleKey="exec.title" subtitleKey="exec.subtitle" />
      </FadeInUp>

      {/* 2. Portfolio KPI Strip (6 cards) */}
      <FadeInUp className="mb-8">
        <KPICards
          items={[
            { labelKey: "kpi.blendedRoas", value: `${mockPortfolioKPIs.blendedRoas.value}%`, trend: mockPortfolioKPIs.blendedRoas.trend, trendLabel: mockPortfolioKPIs.blendedRoas.trendLabel },
            { labelKey: "kpi.deployPace", value: mockPortfolioKPIs.deployPace.value, unit: mockPortfolioKPIs.deployPace.unit, trend: mockPortfolioKPIs.deployPace.trend, trendLabel: mockPortfolioKPIs.deployPace.trendLabel },
            { labelKey: "kpi.portfolioMoic", value: mockPortfolioKPIs.portfolioMoic.value, unit: mockPortfolioKPIs.portfolioMoic.unit, trend: mockPortfolioKPIs.portfolioMoic.trend, trendLabel: mockPortfolioKPIs.portfolioMoic.trendLabel },
            { labelKey: "kpi.fundDpi", value: mockPortfolioKPIs.fundDpi.value, unit: mockPortfolioKPIs.fundDpi.unit, trend: mockPortfolioKPIs.fundDpi.trend, trendLabel: mockPortfolioKPIs.fundDpi.trendLabel },
            { labelKey: "kpi.expVelocity", value: mockPortfolioKPIs.expVelocity.value, unit: mockPortfolioKPIs.expVelocity.unit, trend: mockPortfolioKPIs.expVelocity.trend, trendLabel: mockPortfolioKPIs.expVelocity.trendLabel },
            { labelKey: "kpi.marketTiming", value: mockPortfolioKPIs.marketTiming.value, unit: mockPortfolioKPIs.marketTiming.unit, trend: mockPortfolioKPIs.marketTiming.trend, trendLabel: mockPortfolioKPIs.marketTiming.trendLabel },
          ]}
          basisKey="kpi.basisPortfolio"
        />
      </FadeInUp>

      {/* 3. Title Heatmap + Market Context (3:2 split) */}
      <FadeInUp className="grid grid-cols-5 gap-6 mb-8">
        <div className="col-span-3">
          <TitleHeatmap titles={mockTitleHealth} />
        </div>
        <div className="col-span-2">
          <MarketContextCard data={mockMarketContext} />
        </div>
      </FadeInUp>

      {/* 4. Capital Waterfall + Revenue vs Investment (2-col) */}
      <FadeInUp className="grid grid-cols-2 gap-6 mb-8">
        <CapitalWaterfall data={mockCapitalWaterfall} />
        <RevenueVsInvest data={mockRevenueVsInvest} />
      </FadeInUp>

      {/* 5. Revenue Forecast + Data Freshness (3:1 split) */}
      <FadeInUp className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <RevenueForecast data={mockRevenueForecast} />
        </div>
        <div className="col-span-1">
          <DataFreshnessStrip data={mockDataFreshness} />
        </div>
      </FadeInUp>
    </PageTransition>
  )
}
