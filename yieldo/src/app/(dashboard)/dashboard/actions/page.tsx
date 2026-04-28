"use client"

import { PageHeader } from "@/widgets/sidebar"
import { KPICards } from "@/widgets/dashboard"
import {
  ActionTimeline,
  CumulativeImpactCurve,
  ActionRoiQuadrant,
  CausalImpactPanel,
  RetentionShiftHeatmap,
} from "@/widgets/charts"
import { useLocale } from "@/shared/i18n"
import {
  mockActionKPIs,
  mockActions,
  mockRetentionTrend,
  mockCumulativeImpact,
  mockCausalImpact,
} from "@/shared/api"
import { PageTransition, FadeInUp } from "@/shared/ui/page-transition"
import { useGridLayout } from "@/shared/hooks"
import { motion } from "framer-motion"

const GRID_TRANSITION = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

export default function ActionsPage() {
  const { t } = useLocale()
  const impactGrid = useGridLayout(2)

  return (
    <PageTransition>
      <FadeInUp>
        <PageHeader titleKey="actions.title" subtitleKey="actions.subtitle" />
      </FadeInUp>

      <FadeInUp className="mb-6">
        <KPICards items={[
          { labelKey: "kpi.totalActions",    value: mockActionKPIs.totalActions.value,       trend: mockActionKPIs.totalActions.trend,       trendLabel: mockActionKPIs.totalActions.trendLabel },
          { labelKey: "kpi.cumDeltaLtv",     value: mockActionKPIs.cumulativeDeltaLtv.value, unit: "ΔLTV", trend: mockActionKPIs.cumulativeDeltaLtv.trend, trendLabel: mockActionKPIs.cumulativeDeltaLtv.trendLabel },
          { labelKey: "kpi.avgRoi",          value: mockActionKPIs.avgRoi.value,             unit: "x",    trend: mockActionKPIs.avgRoi.trend,             trendLabel: mockActionKPIs.avgRoi.trendLabel },
          { labelKey: "kpi.actionVelocity",  value: mockActionKPIs.velocity.value,           unit: "/mo",  trend: mockActionKPIs.velocity.trend,           trendLabel: mockActionKPIs.velocity.trendLabel },
        ]} />
      </FadeInUp>

      <FadeInUp className="grid grid-cols-2 gap-6 mb-6">
        <motion.div layout className={`${impactGrid.getClassName("chart-0", 0)} h-full`} transition={GRID_TRANSITION}>
          <CumulativeImpactCurve
            data={mockCumulativeImpact}
            expanded={impactGrid.expandedId === "chart-0"}
            onToggle={() => impactGrid.toggle("chart-0")}
          />
        </motion.div>
        <motion.div layout className={`${impactGrid.getClassName("chart-1", 1)} h-full`} transition={GRID_TRANSITION}>
          <ActionRoiQuadrant
            actions={mockActions}
            expanded={impactGrid.expandedId === "chart-1"}
            onToggle={() => impactGrid.toggle("chart-1")}
          />
        </motion.div>
      </FadeInUp>

      <FadeInUp className="mb-6">
        <ActionTimeline retentionTrend={mockRetentionTrend} actions={mockActions} />
      </FadeInUp>

      <FadeInUp className="mb-6">
        <CausalImpactPanel
          actionLabel={mockCausalImpact.actionLabel}
          actionDate={mockCausalImpact.actionDate}
          metric={mockCausalImpact.metric}
          series={mockCausalImpact.series}
          ate={mockCausalImpact.ate}
          ateLow={mockCausalImpact.ateLow}
          ateHigh={mockCausalImpact.ateHigh}
          probability={mockCausalImpact.probability}
        />
      </FadeInUp>

      <FadeInUp className="mb-6">
        <RetentionShiftHeatmap actions={mockActions} />
      </FadeInUp>

      <FadeInUp>
        <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-5">
          <h3 className="text-sm font-semibold text-[var(--fg-0)] mb-4">Action Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--fg-2)]">{t("table.date")}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--fg-2)]">{t("table.type")}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--fg-2)]">{t("table.description")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--fg-2)]">Cost ($K)</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--fg-2)]">{t("table.deltaLtv")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--fg-2)]">ROI</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--fg-2)]">{t("table.confidence")}</th>
                </tr>
              </thead>
              <tbody>
                {mockActions.map((action, i) => {
                  const roi = action.cost ? +(action.deltaLtv / (action.cost / 100)).toFixed(2) : null
                  return (
                    <tr key={i} className="border-b border-[var(--border-subtle)]">
                      <td className="px-3 py-2.5 text-xs text-[var(--fg-2)]">{action.date}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          action.type === "ua" ? "bg-[var(--accent-info)]/10 text-[var(--phosphor-cyan)]" :
                          action.type === "liveops" ? "bg-purple-50 text-purple-700" :
                          "bg-amber-50 text-amber-700"
                        }`}>{t(`action.${action.type}` as const)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[var(--fg-0)]">{action.description}</td>
                      <td className="px-3 py-2.5 text-xs text-right text-[var(--fg-2)]">{action.cost ?? "—"}</td>
                      <td className={`px-3 py-2.5 text-xs text-right font-medium ${action.deltaLtv >= 0 ? "text-[var(--signal-positive)]" : "text-[var(--signal-risk)]"}`}>
                        {action.deltaLtv >= 0 ? "+" : ""}{action.deltaLtv}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right text-[var(--fg-0)]">{roi !== null ? `${roi}x` : "—"}</td>
                      <td className="px-3 py-2.5 text-xs text-right text-[var(--fg-2)]">{action.confidence}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </FadeInUp>
    </PageTransition>
  )
}
