"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { ActionData } from "@/shared/api/mock-data"
import { ACTION_TIMELINE_COLORS } from "@/shared/config/chart-colors"
import { ChartHeader } from "@/shared/ui/chart-header"

type Props = { actions: ActionData[] }

const DAYS = ["d1", "d3", "d7", "d14", "d30"] as const

const typeBadge: Record<ActionData["type"], string> = {
  ua: ACTION_TIMELINE_COLORS.ua,
  liveops: ACTION_TIMELINE_COLORS.liveops,
  release: ACTION_TIMELINE_COLORS.release,
}

/** ΔRetention(pp) → HSL 채도로 매핑. 0=백색, 양수=파란계, 음수=붉은계 */
function cellColor(v: number): string {
  const intensity = Math.min(Math.abs(v) / 2.5, 1)
  if (v >= 0) return `rgba(26, 127, 232, ${0.08 + intensity * 0.55})`
  return `rgba(201, 55, 44, ${0.08 + intensity * 0.55})`
}

export function RetentionShiftHeatmap({ actions }: Props) {
  const { t } = useLocale()
  const rows = actions.filter((a) => a.retentionShift)

  return (
    <motion.div
      layout
      className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6"
    >
      <ChartHeader
        title={t("chart.retentionShift")}
        subtitle={t("info.retentionShift")}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--border-default)]">
              <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--fg-2)]">{t("table.date")}</th>
              <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--fg-2)]">{t("table.type")}</th>
              <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--fg-2)]">{t("table.description")}</th>
              {DAYS.map((d) => (
                <th key={d} className="px-3 py-2 text-center text-[11px] font-medium text-[var(--fg-2)]">{d.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => (
              <tr key={i} className="border-b border-[var(--border-subtle)]">
                <td className="px-3 py-2 text-[11px] text-[var(--fg-2)] whitespace-nowrap">{a.date}</td>
                <td className="px-3 py-2">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                    style={{ background: typeBadge[a.type] }}
                  >
                    {t(`action.${a.type}`)}
                  </span>
                </td>
                <td className="px-3 py-2 text-[11px] text-[var(--fg-0)] max-w-[220px] truncate">{a.description}</td>
                {DAYS.map((d) => {
                  const v = a.retentionShift![d]
                  return (
                    <td key={d} className="px-1 py-1">
                      <div
                        className="mx-auto rounded-[var(--radius-card)] py-1.5 text-center text-[11px] font-medium font-mono text-[var(--fg-0)]"
                        style={{ background: cellColor(v), minWidth: 44 }}
                        title={`${d.toUpperCase()}: ${v >= 0 ? "+" : ""}${v.toFixed(1)}pp`}
                      >
                        {v >= 0 ? "+" : ""}{v.toFixed(1)}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[10px] text-[var(--fg-2)]">
        <span>{t("chart.retentionShift.legend")}</span>
        <div className="flex items-center gap-1">
          <div className="h-3 w-6 rounded" style={{ background: cellColor(-2) }} />
          <span>-2pp</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-6 rounded" style={{ background: cellColor(0) }} />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-6 rounded" style={{ background: cellColor(2) }} />
          <span>+2pp</span>
        </div>
      </div>
    </motion.div>
  )
}
