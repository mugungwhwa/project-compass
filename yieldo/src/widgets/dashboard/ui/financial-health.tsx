"use client"

import { useLocale } from "@/shared/i18n"
import { motion } from "framer-motion"
import { InfoHint } from "@/shared/ui/info-hint"

type FinancialHealthProps = {
  burnTolerance: { value: number; max: number; color: string }
  netRunway: { value: number; max: number; color: string }
  kpis: { capEfficiency: number; revPerSpend: number; netBurn: number }
  paybackDay: number
  runwayEndDay: number
}

export function FinancialHealth({ burnTolerance, netRunway, kpis, paybackDay, runwayEndDay }: FinancialHealthProps) {
  const { t } = useLocale()
  const paybackPos = Math.min((paybackDay / runwayEndDay) * 100, 95)
  const isAffordable = paybackDay < runwayEndDay

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💰</span>
        <h3 className="text-sm font-semibold text-[var(--fg-0)]">{t("finance.title")}</h3>
      </div>

      {/* Burn & Runway gauges */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="text-xs text-[var(--fg-1)] w-[140px] flex items-center gap-1">
            {t("finance.burnGross")}
            <InfoHint content={t("info.finance.burnGross")} size={12} />
          </div>
          <div className="flex-1 h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: burnTolerance.color }}
              initial={{ width: "0%" }}
              animate={{ width: `${(burnTolerance.value / burnTolerance.max) * 100}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />
          </div>
          <div className="text-sm font-bold w-[60px] text-right" style={{ color: burnTolerance.color, fontVariantNumeric: "tabular-nums" }}>
            {burnTolerance.value} mo
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-[var(--fg-1)] w-[140px] flex items-center gap-1">
            {t("finance.netRunway")}
            <InfoHint content={t("info.finance.netRunway")} size={12} />
          </div>
          <div className="flex-1 h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: netRunway.color }}
              initial={{ width: "0%" }}
              animate={{ width: `${(netRunway.value / netRunway.max) * 100}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />
          </div>
          <div className="text-sm font-bold w-[60px] text-right" style={{ color: netRunway.color, fontVariantNumeric: "tabular-nums" }}>
            {netRunway.value} mo
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[var(--bg-2)] rounded-[var(--radius-card)] p-3 text-center">
          <div className="text-lg font-bold" style={{ fontVariantNumeric: "tabular-nums", color: kpis.capEfficiency >= 1 ? "var(--signal-green)" : "var(--signal-amber)" }}>
            {kpis.capEfficiency}
          </div>
          <div className="text-[11px] text-[var(--fg-2)] flex items-center justify-center gap-1">
            {t("finance.capEff")}
            <InfoHint content={t("info.finance.capEff")} size={11} />
          </div>
          <div className="text-[10px]" style={{ color: kpis.capEfficiency >= 1 ? "var(--signal-green)" : "var(--signal-amber)" }}>
            {kpis.capEfficiency >= 1 ? t("finance.recovering") : t("finance.deficit")}
          </div>
        </div>
        <div className="bg-[var(--bg-2)] rounded-[var(--radius-card)] p-3 text-center">
          <div className="text-lg font-bold text-[var(--signal-green)]" style={{ fontVariantNumeric: "tabular-nums" }}>
            {kpis.revPerSpend}x
          </div>
          <div className="text-[11px] text-[var(--fg-2)] flex items-center justify-center gap-1">
            {t("finance.revSpend")}
            <InfoHint content={t("info.finance.revSpend")} size={11} />
          </div>
          <div className="text-[10px] text-[var(--signal-green)]">{t("finance.recovering")}</div>
        </div>
        <div className="bg-[var(--bg-2)] rounded-[var(--radius-card)] p-3 text-center">
          <div className="text-lg font-bold" style={{ fontVariantNumeric: "tabular-nums", color: kpis.netBurn < 0 ? "var(--signal-red)" : "var(--signal-green)" }}>
            {kpis.netBurn >= 0 ? "+" : ""}${kpis.netBurn}K
          </div>
          <div className="text-[11px] text-[var(--fg-2)] flex items-center justify-center gap-1">
            {t("finance.netBurn")}
            <InfoHint content={t("info.finance.netBurn")} size={11} />
          </div>
          <div className="text-[10px] text-[var(--fg-2)]">{t("finance.monthly")}</div>
        </div>
      </div>

      {/* Payback Affordability Check */}
      <div className={`rounded-[var(--radius-card)] p-3 ${isAffordable ? "bg-[var(--signal-green-bg)]" : "bg-[var(--signal-amber-bg)]"}`}>
        <div className="text-xs font-bold text-[var(--fg-0)] mb-2 flex items-center gap-1">
          {t("finance.affordTitle")}
          <InfoHint content={t("info.finance.afford")} size={12} />
        </div>
        <div className="relative mb-1">
          <div className="h-1.5 bg-[var(--bg-2)] rounded-full" />
          <motion.div
            className="absolute top-[-4px] w-3 h-[14px] rounded-sm flex items-center justify-center"
            style={{ background: isAffordable ? "var(--signal-green)" : "var(--signal-amber)" }}
            initial={{ left: "0%" }}
            animate={{ left: `${paybackPos}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          >
            <div className="w-1 h-1 bg-white rounded-full" />
          </motion.div>
        </div>
        <div className="flex justify-between text-[10px] text-[var(--fg-1)]" style={{ fontVariantNumeric: "tabular-nums" }}>
          <span>D{paybackDay} {t("finance.paybackAt")}</span>
          <span>D{runwayEndDay} {t("finance.runwayEnd")}</span>
        </div>
        <div className={`text-xs font-semibold mt-1.5 ${isAffordable ? "text-[var(--signal-green)]" : "text-[var(--signal-amber)]"}`}>
          {isAffordable ? t("finance.affordable") : t("finance.tight")}
        </div>
      </div>
    </div>
  )
}
