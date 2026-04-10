"use client"

import { useLocale } from "@/shared/i18n"
import type { ActionData } from "@/shared/api/mock-data"
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts"

type ActionTimelineProps = {
  retentionTrend: { date: string; retention: number }[]
  actions: ActionData[]
}

const actionColors: Record<ActionData["type"], string> = { ua: "#5B9AFF", liveops: "#A78BFA", release: "#FFA94D" }

export function ActionTimeline({ retentionTrend, actions }: ActionTimelineProps) {
  const { t } = useLocale()
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{t("chart.actionTimeline")}</h3>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-2 leading-relaxed">{t("info.actionTimeline")}</p>
      <div className="flex gap-4 mb-3">
        {(["ua", "liveops", "release"] as const).map((type) => (
          <div key={type} className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: actionColors[type] }} />
            {t(`action.${type}`)}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={retentionTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={["dataMin - 1", "dataMax + 1"]} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
          <Line type="monotone" dataKey="retention" stroke="#5B9AFF" strokeWidth={2} dot={{ r: 2.5, fill: "#5B9AFF" }} name="D7 Retention" animationBegin={400} animationDuration={1000} animationEasing="ease-out" />
          {actions.map((action) => (
            <ReferenceLine key={action.date} x={action.date} stroke={actionColors[action.type]} strokeDasharray="3 3" strokeOpacity={0.6} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
