"use client"

import { PageHeader } from "@/widgets/sidebar"
import { MarketHeroVerdict } from "@/widgets/dashboard"
import { MarketBenchmark, PriorPosteriorChart, RankingTrend, SaturationTrendChart } from "@/widgets/charts"
import { useLocale } from "@/shared/i18n"
import {
  mockRetention,
  mockCompetitors,
  mockMarketHero,
  mockPriorPosterior,
  mockRankingHistory,
  mockSaturationTrend,
} from "@/shared/api"
import { PageTransition, FadeInUp } from "@/shared/ui/page-transition"
import { useGridLayout } from "@/shared/hooks"
import { motion } from "framer-motion"

const GRID_TRANSITION = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

export default function MarketGapPage() {
  const { t } = useLocale()
  const benchGrid = useGridLayout(2)
  const satGrid = useGridLayout(2)

  return (
    <PageTransition>
      {/* 1. Hero Verdict */}
      <FadeInUp>
        <MarketHeroVerdict
          rank={mockMarketHero.rank}
          rankChange={mockMarketHero.rankChange}
          confidence={mockMarketHero.confidence}
          reason={mockMarketHero.reason}
          factors={mockMarketHero.factors}
        />
      </FadeInUp>

      <FadeInUp>
        <PageHeader titleKey="market.title" subtitleKey="market.subtitle" />
      </FadeInUp>

      {/* 2. Prior vs Posterior — Bayesian differentiator */}
      <FadeInUp className="mb-8">
        <PriorPosteriorChart data={mockPriorPosterior} />
      </FadeInUp>

      {/* 3. Retention benchmark + Ranking trend */}
      <FadeInUp className="grid grid-cols-2 gap-6 mb-8">
        <motion.div layout className={`${benchGrid.getClassName("chart-0", 0)} h-full`} transition={GRID_TRANSITION}>
          <MarketBenchmark data={mockRetention.data} expanded={benchGrid.expandedId === "chart-0"} onToggle={() => benchGrid.toggle("chart-0")} />
        </motion.div>
        <motion.div layout className={`${benchGrid.getClassName("chart-1", 1)} h-full`} transition={GRID_TRANSITION}>
          <RankingTrend data={mockRankingHistory} expanded={benchGrid.expandedId === "chart-1"} onToggle={() => benchGrid.toggle("chart-1")} />
        </motion.div>
      </FadeInUp>

      {/* 4. Saturation trend + Competitor table */}
      <FadeInUp className="grid grid-cols-2 gap-6">
        <motion.div layout className={`${satGrid.getClassName("chart-0", 0)} h-full`} transition={GRID_TRANSITION}>
          <SaturationTrendChart data={mockSaturationTrend} expanded={satGrid.expandedId === "chart-0"} onToggle={() => satGrid.toggle("chart-0")} />
        </motion.div>
        <motion.div layout className={`${satGrid.getClassName("chart-1", 1)} h-full`} transition={GRID_TRANSITION}>
        <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50/50 p-6 card-premium h-full">
          <div className="mb-4">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Top 10 Competitors</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Puzzle genre · Revenue ranked</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 italic">Match League highlighted in blue</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 text-left text-xs font-bold text-[var(--text-muted)]">{t("table.rank")}</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-[var(--text-muted)]">{t("table.name")}</th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-[var(--text-muted)]">{t("table.d7")}</th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-[var(--text-muted)]">{t("table.d30")}</th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-[var(--text-muted)]">{t("table.revenue")}</th>
                </tr>
              </thead>
              <tbody>
                {mockCompetitors.map((c) => (
                  <tr key={c.rank} className={`border-b border-slate-50 ${c.name === "Match League" ? "bg-[var(--brand-light)]" : ""}`}>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-secondary)] font-mono-num">#{c.rank}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-[var(--text-primary)]">{c.name}</td>
                    <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)] font-mono-num">{c.d7}%</td>
                    <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)] font-mono-num">{c.d30}%</td>
                    <td className="px-3 py-2.5 text-xs text-right font-bold text-[var(--text-primary)] font-mono-num">{c.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </motion.div>
      </FadeInUp>
    </PageTransition>
  )
}
