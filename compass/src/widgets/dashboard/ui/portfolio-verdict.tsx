"use client"

/*
  PortfolioVerdict — Overview 2.0 top-of-fold portfolio-level decision card.
  --------------------------------------------------------------------------
  Extends HeroVerdict pattern but operates at portfolio scope rather than
  single-game scope. Shows aggregate status, payback credible interval, and
  a collapsed per-title signal summary.

  Mapping to DecisionSurface contract:
    status         → DecisionSurface.status
    payback        → DecisionSurface.confidence (credible interval)
    confidence     → Impact badge (scalar posterior certainty %)
    recommendation → DecisionSurface.recommendation (verb-first)
    reason         → DecisionSurface.situation
    titles         → DecisionSurface.evidence (collapsed per-title signal list)
*/

import { useLocale } from "@/shared/i18n"
import type { SignalStatus } from "@/shared/api/mock-data"
import { DecisionSurface } from "@/shared/ui/decision-surface"

type TitleSignal = {
  label: string
  signal: SignalStatus
}

type PortfolioVerdictProps = {
  status: SignalStatus
  confidence: number
  reason: { ko: string; en: string }
  recommendation: { ko: string; en: string }
  payback: { p10: number; p50: number; p90: number }
  titles: TitleSignal[]
}

const SIGNAL_DOT_COLOR: Record<SignalStatus, string> = {
  invest: "var(--signal-positive)",
  hold: "var(--signal-caution)",
  reduce: "var(--signal-risk)",
}

const SIGNAL_LABEL: Record<SignalStatus, { ko: string; en: string }> = {
  invest: { ko: "투자", en: "Invest" },
  hold: { ko: "유지", en: "Hold" },
  reduce: { ko: "축소", en: "Reduce" },
}

export function PortfolioVerdict({
  status,
  confidence,
  reason,
  recommendation,
  payback,
  titles,
}: PortfolioVerdictProps) {
  const { locale } = useLocale()

  const impactDirection: "positive" | "negative" | "neutral" =
    status === "invest" ? "positive" : status === "reduce" ? "negative" : "neutral"

  const evidence = (
    <div className="flex flex-col gap-3">
      <h4 className="text-h3 text-[var(--fg-2)]">
        {locale === "en" ? "Portfolio titles" : "포트폴리오 타이틀"}
      </h4>
      <div className="flex flex-wrap gap-2">
        {titles.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-inline)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-2.5 py-1 text-body text-[var(--fg-1)]"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: SIGNAL_DOT_COLOR[t.signal] }}
              aria-hidden
            />
            {t.label}
            <span
              className="text-caption"
              style={{ color: SIGNAL_DOT_COLOR[t.signal] }}
            >
              {SIGNAL_LABEL[t.signal][locale]}
            </span>
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <div className="sticky top-0 z-10 mb-8">
      <DecisionSurface
        status={status}
        situation={reason[locale]}
        confidence={{
          p10: payback.p10,
          p50: payback.p50,
          p90: payback.p90,
          unit: locale === "ko" ? "일" : "d",
          label: locale === "en" ? "Payback window (days)" : "페이백 구간 (일)",
        }}
        recommendation={recommendation[locale]}
        impact={{
          value: `${confidence}% ${locale === "en" ? "confidence" : "신뢰도"}`,
          direction: impactDirection,
        }}
        evidence={evidence}
        evidenceLabel={locale === "en" ? "Show titles" : "타이틀 보기"}
      />
    </div>
  )
}
