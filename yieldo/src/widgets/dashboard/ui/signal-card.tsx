"use client"

import { useLocale } from "@/shared/i18n"
import type { SignalStatus } from "@/shared/api/mock-data"
import { cn } from "@/shared/lib"
import { Check, AlertTriangle, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import { AnimatedNumber } from "@/shared/ui/animated-number"

type SignalFactor = {
  status: "ok" | "warn" | "fail"
  text: { ko: string; en: string }
}

type SignalCardProps = {
  status: SignalStatus
  confidence: number
  factors: SignalFactor[]
  payback: { p10: number; p50: number; p90: number }
}

const signalConfig = {
  invest: {
    label: "signal.invest" as const,
    badgeBg: "bg-[var(--signal-green-bg)]",
    badgeText: "text-[var(--phosphor-green)]",
    badgeBorder: "border-[var(--phosphor-green)]",
    gaugePos: 78,
    cardBg: "signal-bg-invest",
    cardBorder: "border-2 border-[var(--phosphor-green)]",
    cardGlow: "0 0 24px rgba(77, 255, 163, 0.20), 0 0 0 1px rgba(77, 255, 163, 0.25)",
  },
  hold: {
    label: "signal.hold" as const,
    badgeBg: "bg-[var(--signal-amber-bg)]",
    badgeText: "text-[var(--phosphor-yellow)]",
    badgeBorder: "border-[var(--phosphor-yellow)]",
    gaugePos: 50,
    cardBg: "signal-bg-hold",
    cardBorder: "border-2 border-[var(--phosphor-yellow)]",
    cardGlow: "0 0 24px rgba(255, 228, 94, 0.20), 0 0 0 1px rgba(255, 228, 94, 0.25)",
  },
  reduce: {
    label: "signal.reduce" as const,
    badgeBg: "bg-[var(--signal-red-bg)]",
    badgeText: "text-[var(--phosphor-red)]",
    badgeBorder: "border-[var(--phosphor-red)]",
    gaugePos: 22,
    cardBg: "signal-bg-reduce",
    cardBorder: "border-2 border-[var(--phosphor-red)]",
    cardGlow: "0 0 24px rgba(255, 107, 122, 0.20), 0 0 0 1px rgba(255, 107, 122, 0.25)",
  },
}

const factorIcons = {
  ok:   <Check className="h-3.5 w-3.5 text-[var(--signal-green)]" />,
  warn: <AlertTriangle className="h-3.5 w-3.5 text-[var(--signal-amber)]" />,
  fail: <TrendingDown className="h-3.5 w-3.5 text-[var(--signal-red)]" />,
}

export function SignalCard({ status, confidence, factors, payback }: SignalCardProps) {
  const { t, locale } = useLocale()
  const config = signalConfig[status]
  const maxDay = 90
  const p50Pos = Math.min((payback.p50 / maxDay) * 100, 100)

  return (
    <div
      className={cn(
        "relative rounded-[var(--radius-modal)] p-6 mb-8 sticky top-0 z-10",
        config.cardBorder,
        config.cardBg,
      )}
      style={{ boxShadow: config.cardGlow }}
    >
      {/* Top: badge + confidence */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn("inline-flex items-center gap-2 rounded-full px-5 py-2 text-lg font-extrabold border", config.badgeBg, config.badgeText, config.badgeBorder)}>
          {status === "invest" && <Check className="h-5 w-5" />}
          {status === "hold" && <AlertTriangle className="h-5 w-5" />}
          {status === "reduce" && <TrendingDown className="h-5 w-5" />}
          {t(config.label)}
        </div>
        <div className="text-sm text-[var(--fg-1)]">
          {t("signal.confidence")}: <span className="text-2xl font-bold text-[var(--phosphor-yellow)] font-mono-num" style={{ fontVariantNumeric: "tabular-nums", textShadow: "0 0 14px rgba(255, 228, 94, 0.35)" }}><AnimatedNumber value={confidence} suffix="%" /></span>
        </div>
      </div>

      {/* Gauge bar: Reduce — Hold — Invest */}
      <div className="relative mb-1">
        <div className="h-3 rounded-full bg-gradient-to-r from-[var(--signal-red)] via-[var(--signal-amber)] to-[var(--signal-green)] opacity-25" />
        <motion.div
          className="absolute top-[-4px] w-[3px] h-[20px] bg-[var(--fg-0)] rounded-sm"
          initial={{ left: "0%" }}
          animate={{ left: `${config.gaugePos}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[var(--fg-2)] mb-4">
        <span>Reduce</span>
        <span>Hold</span>
        <span>Invest</span>
      </div>

      {/* Key signal factors */}
      <div className="flex flex-col gap-1.5 mb-4">
        {factors.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-[var(--fg-1)]">
            {factorIcons[f.status]}
            <span>{f.text[locale]}</span>
          </div>
        ))}
      </div>

      {/* Payback progress bar */}
      <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-default)]">
        <div className="text-xs text-[var(--fg-1)] whitespace-nowrap font-medium">Payback</div>
        <div className="flex-1">
          <div className="relative h-1.5 bg-[var(--bg-2)] rounded-[var(--radius-inline)] overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-[var(--radius-inline)] bg-[var(--phosphor-yellow)]"
              style={{ boxShadow: "0 0 8px rgba(255,228,94,0.5)" }}
              initial={{ width: "0%" }}
              animate={{ width: `${p50Pos}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1 font-mono">
            <span className="text-[10px] text-[var(--fg-3)]" style={{ fontVariantNumeric: "tabular-nums" }}>D{payback.p10}</span>
            <span className="text-[10px] font-bold text-[var(--phosphor-yellow)]" style={{ fontVariantNumeric: "tabular-nums" }}>D{payback.p50}</span>
            <span className="text-[10px] text-[var(--fg-3)]" style={{ fontVariantNumeric: "tabular-nums" }}>D{payback.p90}</span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--fg-2)] whitespace-nowrap">P10 / P50 / P90</div>
      </div>
    </div>
  )
}
