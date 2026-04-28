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

type BilingualText = { ko: string; en: string }

type PortfolioVerdictProps = {
  status: SignalStatus
  confidence: number
  reason: BilingualText
  recommendation: BilingualText
  /** Short rationale shown below the recommendation. */
  rationale?: BilingualText
  payback: { p10: number; p50: number; p90: number }
  titles: TitleSignal[]
  /** Monetary impact badge — e.g. +$1.2M ARR. Shown on the right of the status row. */
  impact?: { value: BilingualText; direction: "positive" | "negative" | "neutral" }
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
  rationale,
  payback,
  titles,
  impact,
}: PortfolioVerdictProps) {
  const { locale } = useLocale()

  // Impact badge: prefer monetary delta (ΔARR/ΔLTV) over scalar confidence.
  // Fallback keeps backward-compat rendering when no monetary impact is supplied.
  const resolvedImpact = impact
    ? { value: impact.value[locale], direction: impact.direction }
    : {
        value: `${confidence}% ${locale === "en" ? "confidence" : "신뢰도"}`,
        direction: (status === "invest"
          ? "positive"
          : status === "reduce"
          ? "negative"
          : "neutral") as "positive" | "negative" | "neutral",
      }

  // When monetary impact is shown on the badge, push confidence% into the
  // ConfidenceBar label so the certainty signal is never lost.
  const confidenceNote = impact
    ? `${locale === "en" ? "Certainty" : "신뢰도"} ${confidence}%`
    : undefined

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
          note: confidenceNote,
          target: 60,
          contextLine:
            locale === "en"
              ? `${Math.max(60 - payback.p50, 0)}d faster than target · within runway`
              : `목표보다 ${Math.max(60 - payback.p50, 0)}일 빠름 · 런웨이 내`,
        }}
        recommendation={recommendation[locale]}
        rationale={rationale?.[locale]}
        impact={resolvedImpact}
        evidence={evidence}
        evidenceLabel={locale === "en" ? "Show titles" : "타이틀 보기"}
      />
    </div>
  )
}
