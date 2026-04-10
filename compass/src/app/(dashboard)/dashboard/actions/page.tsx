"use client"

import { PageHeader } from "@/widgets/sidebar"
import { KPICards } from "@/widgets/dashboard"
import { ActionTimeline } from "@/widgets/charts"
import { useLocale } from "@/shared/i18n"
import { mockActionKPIs, mockActions, mockRetentionTrend } from "@/shared/api"
import { PageTransition, FadeInUp } from "@/shared/ui/page-transition"

export default function ActionsPage() {
  const { t } = useLocale()

  return (
    <PageTransition>
      <FadeInUp>
        <PageHeader titleKey="actions.title" subtitleKey="actions.subtitle" />
      </FadeInUp>

      <FadeInUp className="mb-6">
        <KPICards items={[
          { labelKey: "kpi.totalActions", value: mockActionKPIs.totalActions.value, trend: mockActionKPIs.totalActions.trend, trendLabel: mockActionKPIs.totalActions.trendLabel },
          { labelKey: "kpi.avgImpact", value: mockActionKPIs.avgImpact.value, unit: "ΔLTV", trend: mockActionKPIs.avgImpact.trend, trendLabel: mockActionKPIs.avgImpact.trendLabel },
          { labelKey: "kpi.bestAction", value: mockActionKPIs.bestAction.value, unit: "ΔLTV", trend: mockActionKPIs.bestAction.trend, trendLabel: mockActionKPIs.bestAction.trendLabel },
        ]} />
      </FadeInUp>

      <FadeInUp className="mb-6">
        <ActionTimeline retentionTrend={mockRetentionTrend} actions={mockActions} />
      </FadeInUp>

      <FadeInUp>
        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Action Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">{t("table.date")}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">{t("table.type")}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">{t("table.description")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.deltaLtv")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.confidence")}</th>
                </tr>
              </thead>
              <tbody>
                {mockActions.map((action, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-3 py-2.5 text-xs text-[var(--text-secondary)]">{action.date}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        action.type === "ua" ? "bg-blue-50 text-blue-700" :
                        action.type === "liveops" ? "bg-purple-50 text-purple-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>{t(`action.${action.type}` as const)}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-primary)]">{action.description}</td>
                    <td className={`px-3 py-2.5 text-xs text-right font-medium ${action.deltaLtv >= 0 ? "text-[var(--signal-green)]" : "text-[var(--signal-red)]"}`}>
                      {action.deltaLtv >= 0 ? "+" : ""}{action.deltaLtv}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)]">{action.confidence}%</td>
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
