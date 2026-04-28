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
  invest: { label: "signal.invest" as const, badgeBg: "bg-[var(--signal-green-bg)]", badgeText: "text-[var(--signal-green)]", badgeBorder: "border-[var(--signal-green-border)]", gaugePos: 78, cardBg: "signal-bg-invest" },
  hold:   { label: "signal.hold" as const, badgeBg: "bg-[var(--signal-amber-bg)]", badgeText: "text-[var(--signal-amber)]", badgeBorder: "border-[var(--signal-amber-border)]", gaugePos: 50, cardBg: "signal-bg-hold" },
  reduce: { label: "signal.reduce" as const, badgeBg: "bg-[var(--signal-red-bg)]", badgeText: "text-[var(--signal-red)]", badgeBorder: "border-[var(--signal-red-border)]", gaugePos: 22, cardBg: "signal-bg-reduce" },
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
    <div className={cn("relative rounded-xl border border-[var(--border)] p-6 mb-8 sticky top-0 z-10", config.cardBg)} style={{ boxShadow: "0 8px 40px rgba(91,154,255,0.12)" }}>
      {/* Top: badge + confidence */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn("inline-flex items-center gap-2 rounded-full px-5 py-2 text-lg font-extrabold border", config.badgeBg, config.badgeText, config.badgeBorder)}>
          {status === "invest" && <Check className="h-5 w-5" />}
          {status === "hold" && <AlertTriangle className="h-5 w-5" />}
          {status === "reduce" && <TrendingDown className="h-5 w-5" />}
          {t(config.label)}
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          {t("signal.confidence")}: <span className="text-2xl font-bold text-[var(--text-primary)] font-mono-num" style={{ fontVariantNumeric: "tabular-nums" }}><AnimatedNumber value={confidence} suffix="%" /></span>
        </div>
      </div>

      {/* Gauge bar: Reduce — Hold — Invest */}
      <div className="relative mb-1">
        <div className="h-3 rounded-full bg-gradient-to-r from-[var(--signal-red)] via-[var(--signal-amber)] to-[var(--signal-green)] opacity-25" />
        <motion.div
          className="absolute top-[-4px] w-[3px] h-[20px] bg-[var(--text-primary)] rounded-sm"
          initial={{ left: "0%" }}
          animate={{ left: `${config.gaugePos}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-4">
        <span>Reduce</span>
        <span>Hold</span>
        <span>Invest</span>
      </div>

      {/* Key signal factors */}
      <div className="flex flex-col gap-1.5 mb-4">
        {factors.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            {factorIcons[f.status]}
            <span>{f.text[locale]}</span>
          </div>
        ))}
      </div>

      {/* Payback progress bar */}
      <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
        <div className="text-xs text-[var(--text-secondary)] whitespace-nowrap font-medium">Payback</div>
        <div className="flex-1">
          <div className="relative h-1.5 bg-blue-50 rounded-full">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-200 to-[var(--accent-blue)]"
              initial={{ width: "0%" }}
              animate={{ width: `${p50Pos}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[var(--text-muted)]" style={{ fontVariantNumeric: "tabular-nums" }}>D{payback.p10}</span>
            <span className="text-[10px] font-bold text-[var(--brand)]" style={{ fontVariantNumeric: "tabular-nums" }}>D{payback.p50}</span>
            <span className="text-[10px] text-[var(--text-muted)]" style={{ fontVariantNumeric: "tabular-nums" }}>D{payback.p90}</span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">P10 / P50 / P90</div>
      </div>
    </div>
  )
}
