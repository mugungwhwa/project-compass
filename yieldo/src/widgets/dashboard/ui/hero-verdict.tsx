"use client"

/*
  HeroVerdict — Module 1 top-of-fold decision card.
  ---------------------------------------------------
  Refactored 2026-04-07: now implemented on top of <DecisionSurface>.
  The public API is preserved so callsites don't have to change, but
  visually and structurally this is now aligned with the new design
  language (Situation → Confidence → Recommendation → Evidence).

  Mapping from old props to DecisionSurface contract:
    status      → DecisionSurface.status                 (1:1, same union)
    payback     → DecisionSurface.confidence              (the real credible interval)
    confidence  → Impact badge (scalar posterior certainty)
    nextAction  → DecisionSurface.recommendation          (the verb statement)
    reason      → DecisionSurface.situation               (new optional prop)
    factors     → DecisionSurface.evidence                (collapsed list)

  Source of truth: docs/Project_yieldo_Design_Migration_Log.md §4.1
*/

import { useLocale } from "@/shared/i18n"
import type { SignalStatus } from "@/shared/api/mock-data"
import { DecisionSurface } from "@/shared/ui/decision-surface"
import { Check, AlertTriangle, TrendingDown } from "lucide-react"

type SignalFactor = {
  status: "ok" | "warn" | "fail"
  text: { ko: string; en: string }
}

type BilingualText = { ko: string; en: string }

type HeroVerdictProps = {
  status: SignalStatus
  confidence: number
  factors: SignalFactor[]
  payback: { p10: number; p50: number; p90: number }
  nextAction?: BilingualText
  /** Optional one-line situation summary. Falls back to a generic sentence if omitted. */
  reason?: BilingualText
  /** Monetary impact badge — e.g. +$120K ARR. Moves confidence% into the ConfidenceBar label. */
  impact?: { value: BilingualText; direction: "positive" | "negative" | "neutral" }
  /** Forward to DecisionSurface. Set very high (e.g. Number.MAX_SAFE_INTEGER) in landing page use to disable scroll-triggered compact mode. */
  compactScrollThreshold?: number
}

const factorIcon = {
  ok: <Check className="h-4 w-4 text-[var(--signal-positive)]" aria-hidden />,
  warn: <AlertTriangle className="h-4 w-4 text-[var(--signal-caution)]" aria-hidden />,
  fail: <TrendingDown className="h-4 w-4 text-[var(--signal-risk)]" aria-hidden />,
}

export function HeroVerdict({
  status,
  confidence,
  factors,
  payback,
  nextAction,
  reason,
  impact,
  compactScrollThreshold,
}: HeroVerdictProps) {
  const { locale } = useLocale()

  // Situation: prefer explicit reason, else synthesize a neutral one-liner.
  const situationText =
    reason?.[locale] ??
    (locale === "en"
      ? `${confidence}% confidence based on D7–D30 cohort data.`
      : `D7-D30 코호트 데이터 기반 신뢰도 ${confidence}%.`)

  // Recommendation (Display/Serif). Must start with a verb — mockSignal already does.
  const recommendationText =
    nextAction?.[locale] ??
    (locale === "en" ? "Review posture and confirm next action." : "현재 포지션을 검토하고 다음 액션을 확정하세요.")

  // Impact: prefer monetary delta (ΔARR/ΔLTV). Fallback to scalar confidence
  // for backward compatibility when no impact is supplied by the caller.
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

  // When monetary impact is shown on the badge, put certainty% into the
  // ConfidenceBar label so the posterior signal is never hidden.
  const confidenceNote = impact
    ? `${locale === "en" ? "Certainty" : "신뢰도"} ${confidence}%`
    : undefined

  const evidence = (
    <div className="flex flex-col gap-3">
      <h4 className="text-h3 text-[var(--fg-2)]">
        {locale === "en" ? "Decision factors" : "판단 요인"}
      </h4>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {factors.map((f, i) => (
          <li
            key={i}
            className="flex items-center gap-2.5 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-2"
          >
            {factorIcon[f.status]}
            <span className="text-body text-[var(--fg-1)]">{f.text[locale]}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="sticky top-0 z-10 mb-8">
      <DecisionSurface
        status={status}
        situation={situationText}
        confidence={{
          p10: payback.p10,
          p50: payback.p50,
          p90: payback.p90,
          unit: locale === "ko" ? "일" : "d",
          label: locale === "en" ? "Payback window (days)" : "페이백 구간 (일)",
          note: confidenceNote,
        }}
        recommendation={recommendationText}
        impact={resolvedImpact}
        evidence={evidence}
        evidenceLabel={locale === "en" ? "Show factors" : "요인 보기"}
        compactScrollThreshold={compactScrollThreshold}
      />
    </div>
  )
}
