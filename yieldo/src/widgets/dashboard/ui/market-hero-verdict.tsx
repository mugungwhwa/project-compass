"use client"

/*
  MarketHeroVerdict — Module 2 top-of-fold decision card.
  ---------------------------------------------------------
  Refactored 2026-04-07: now built on <DecisionSurface>.
  Public API preserved — callsites don't need to change.

  Mapping:
    rising  → invest   (positive momentum → scale up in this category)
    stable  → hold     (maintain position)
    falling → reduce   (pull back, category fading)

  Confidence interval is synthesized from rank + rankChange magnitude,
  so that the ConfidenceBar reflects how stable the current position is:
  a stable top rank → tight band; a volatile rank → wider band.

  Source of truth: docs/Project_yieldo_Design_Migration_Log.md §4.1
*/

import { useLocale } from "@/shared/i18n"
import { DecisionSurface, type DecisionStatus } from "@/shared/ui/decision-surface"
import { Check, AlertTriangle, TrendingDown } from "lucide-react"

type Factor = {
  status: "ok" | "warn" | "fail"
  text: { ko: string; en: string }
}

type BilingualText = { ko: string; en: string }

type MarketHeroVerdictProps = {
  rank: number
  rankChange: number
  confidence: number
  reason: BilingualText
  factors: Factor[]
  /** Optional override. If omitted, a recommendation is derived from status. */
  recommendation?: BilingualText
}

const factorIcon = {
  ok: <Check className="h-4 w-4 text-[var(--signal-positive)]" aria-hidden />,
  warn: <AlertTriangle className="h-4 w-4 text-[var(--signal-caution)]" aria-hidden />,
  fail: <TrendingDown className="h-4 w-4 text-[var(--signal-risk)]" aria-hidden />,
}

function deriveStatus(rankChange: number): DecisionStatus {
  if (rankChange > 0) return "invest"
  if (rankChange < 0) return "reduce"
  return "hold"
}

/**
 * Synthesize a credible interval for current rank position.
 * Stable positions (small |rankChange|) have tight bands; volatile ones widen.
 * The bar visualizes spread, not direction — tighter = more certain.
 */
function synthesizeRankCI(rank: number, rankChange: number) {
  const spread = Math.max(1, Math.round(Math.abs(rankChange) / 3))
  return {
    p10: Math.max(1, rank - spread),
    p50: rank,
    p90: rank + spread,
  }
}

function defaultRecommendation(status: DecisionStatus, locale: "ko" | "en"): string {
  if (locale === "en") {
    if (status === "invest") return "Lean into this category — scale UA and double down on the lead."
    if (status === "reduce") return "Category momentum fading — reduce exposure and redirect capital."
    return "Hold position — monitor for breakout before committing more capital."
  }
  if (status === "invest") return "카테고리 리드를 강화하고 UA를 확대해 격차를 벌리세요."
  if (status === "reduce") return "카테고리 모멘텀 감소 — 노출을 줄이고 자본을 재배치하세요."
  return "포지션 유지 — 추가 자본 투입 전에 돌파 신호를 확인하세요."
}

export function MarketHeroVerdict({
  rank,
  rankChange,
  confidence,
  reason,
  factors,
  recommendation,
}: MarketHeroVerdictProps) {
  const { locale } = useLocale()
  const status = deriveStatus(rankChange)
  const ci = synthesizeRankCI(rank, rankChange)

  const situation =
    reason[locale] +
    (locale === "en"
      ? ` Current rank: #${rank} (${rankChange > 0 ? "+" : ""}${rankChange} over 6mo).`
      : ` 현재 순위: #${rank} (6개월간 ${rankChange > 0 ? "+" : ""}${rankChange}).`)

  const recommendationText = recommendation?.[locale] ?? defaultRecommendation(status, locale)

  const impactDirection: "positive" | "negative" | "neutral" =
    status === "invest" ? "positive" : status === "reduce" ? "negative" : "neutral"

  const impactValue =
    locale === "en"
      ? `${rankChange > 0 ? "+" : ""}${rankChange} rank · ${confidence}% confidence`
      : `${rankChange > 0 ? "+" : ""}${rankChange}단계 · 신뢰도 ${confidence}%`

  const evidence = (
    <div className="flex flex-col gap-3">
      <h4 className="text-h3 text-[var(--fg-2)]">
        {locale === "en" ? "Market signals" : "시장 신호"}
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
    <div className="mb-8">
      <DecisionSurface
        status={status}
        situation={situation}
        confidence={{
          p10: ci.p10,
          p50: ci.p50,
          p90: ci.p90,
          unit: "",
          label: locale === "en" ? "Genre rank (6mo est.)" : "장르 순위 (6개월 추정)",
        }}
        recommendation={recommendationText}
        impact={{
          value: impactValue,
          direction: impactDirection,
        }}
        evidence={evidence}
        evidenceLabel={locale === "en" ? "Show signals" : "신호 보기"}
      />
    </div>
  )
}
