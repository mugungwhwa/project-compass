"use client"

/*
  <DecisionSurface> — yieldo's unit component.
  ----------------------------------------------
  Every decision point in yieldo MUST use this pattern.
  4-part structure: Situation → Confidence → Recommendation → Evidence.

  Source of truth: docs/Project_yieldo_Design_Migration_Log.md §4.1

  Rules:
  - Confidence is NOT optional. Point estimates without intervals are forbidden.
  - Recommendation must start with a verb ("Scale", "Pause", "Ship", "Hold").
  - Evidence is collapsed by default — the decision comes first, the proof is a click away.
  - Numbers use Geist Mono tabular-nums; decision statements use Instrument Serif.
*/

import { useState, useEffect, useRef, type ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/shared/lib/utils"
import { useLocale } from "@/shared/i18n"

export type DecisionStatus = "invest" | "hold" | "reduce"

export type Confidence = {
  p10: number
  p50: number
  p90: number
  unit?: string        // e.g. "%", "$", "days"
  label?: string       // e.g. "Payback window", "D30 retention"
  /** Trailing note — typically posterior certainty %, e.g. "신뢰도 78%". */
  note?: string
  /** Target value for reference line (e.g., target payback D60). */
  target?: number
  /** Display max for x-axis (default: auto-compute from max * 1.25). */
  max?: number
  /** Short context message below gauge (e.g., "16d faster than target"). */
  contextLine?: string
}

export type Impact = {
  value: string                              // e.g. "+$1.2M ARR", "-18 days"
  direction: "positive" | "negative" | "neutral"
}

export type DecisionSurfaceProps = {
  status: DecisionStatus
  situation: string                          // one sentence + a core number
  confidence: Confidence                     // REQUIRED — no point estimates
  recommendation: string                     // must start with a verb
  /** Short rationale shown below recommendation, smaller + highlighted. */
  rationale?: string
  impact?: Impact
  evidence?: ReactNode                       // collapsed by default
  evidenceLabel?: string                     // default "Why?"
  onPrimaryAction?: () => void
  primaryActionLabel?: string                // default derives from status
  className?: string
  /**
   * When the page scrolls past this many pixels, the card collapses to a
   * single-row compact layout (status + situation + impact). The full card
   * reappears when scrolled back to the top. Set to 0 to disable.
   * Default: 160 — roughly the point where the KPI strip is the dominant fold.
   */
  compactScrollThreshold?: number
}

type StatusMeta = {
  label: string
  borderColor: string
  badgeBg: string
  badgeText: string
  defaultCta: string
}

// Visual tokens (colors, borders) are locale-agnostic; only strings differ.
const STATUS_VISUAL = {
  invest: {
    borderColor: "border-t-[var(--signal-positive)]",
    badgeBg: "bg-[var(--signal-positive-bg)]",
    badgeText: "text-[var(--signal-positive)]",
  },
  hold: {
    borderColor: "border-t-[var(--signal-caution)]",
    badgeBg: "bg-[var(--signal-caution-bg)]",
    badgeText: "text-[var(--signal-caution)]",
  },
  reduce: {
    borderColor: "border-t-[var(--signal-risk)]",
    badgeBg: "bg-[var(--signal-risk-bg)]",
    badgeText: "text-[var(--signal-risk)]",
  },
} as const

const STATUS_STRINGS: Record<"en" | "ko", Record<DecisionStatus, { label: string; defaultCta: string }>> = {
  en: {
    invest: { label: "Invest More",  defaultCta: "Approve & scale"   },
    hold:   { label: "Hold",         defaultCta: "Review in 7 days"  },
    reduce: { label: "Pull Back",    defaultCta: "Reduce exposure"   },
  },
  ko: {
    invest: { label: "투자 확대",     defaultCta: "승인 후 집행"       },
    hold:   { label: "유지",         defaultCta: "7일 후 재평가"      },
    reduce: { label: "축소",         defaultCta: "노출 축소"          },
  },
}

function getStatusMeta(status: DecisionStatus, locale: "en" | "ko"): StatusMeta {
  return { ...STATUS_VISUAL[status], ...STATUS_STRINGS[locale][status] }
}

function formatCI(c: Confidence): string {
  const unit = c.unit ?? ""
  return `${c.p50}${unit} [P10: ${c.p10}${unit} – P90: ${c.p90}${unit}]`
}

/**
 * ConfidenceBar (aka PaybackGauge) renders the P10/P50/P90 credible interval
 * on an absolute axis with optional target reference and context line. The
 * gauge animates in on mount: bands draw from 0 to their final width, then
 * the P50 marker pill fades in.
 *
 * Design: rather than a normalized ±span visualization, the gauge now plots
 * the interval on an absolute axis (e.g. D0 → D100), so the reader can see
 * "where on the schedule is P50?" instead of just "how wide is the band?".
 */
function ConfidenceBar({ confidence }: { confidence: Confidence }) {
  const { p10, p50, p90, unit = "", label, note, target, max: maxProp, contextLine } = confidence

  // x-axis scale: accommodate P90 and target with headroom.
  const rawMax = Math.max(p90, target ?? 0)
  const max = maxProp ?? (rawMax * 1.25 || 1)

  const pct = (v: number) => (v / max) * 100

  // Tick marks — 5 evenly spaced, rounded to a readable step.
  const rawStep = max / 5
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(rawStep, 1))))
  const tickStep = Math.max(Math.ceil(rawStep / magnitude) * magnitude, 1)
  const ticks = Array.from({ length: 6 }, (_, i) => i * tickStep).filter((t) => t <= max)

  const easing: [number, number, number, number] = [0.16, 1, 0.3, 1]
  const unitPrefix = unit === "d" || unit === "일" ? "D" : ""
  const tickFormat = (t: number) => (unitPrefix ? `${unitPrefix}${t}` : `${t}${unit}`)

  return (
    <div className="flex flex-col gap-2">
      {/* Header row: label + CI summary */}
      <div className="flex items-center justify-between text-caption text-[var(--fg-2)]">
        <span>
          {label ?? "Credible interval"}
          {note && <span className="ml-2 text-[var(--fg-2)] opacity-80">· {note}</span>}
        </span>
        <span className="font-mono text-[var(--fg-1)]">{formatCI(confidence)}</span>
      </div>

      {/* Gauge body */}
      <div className="relative h-6 mt-5">
        {/* Track background */}
        <div className="absolute inset-x-0 top-0 h-full rounded-[var(--radius-inline)] bg-[var(--bg-3)]" />

        {/* P10–P50 band (darker) — phosphor cyan, terminal credibility tone */}
        <motion.div
          className="absolute top-0 h-full rounded-l-[var(--radius-inline)] bg-[var(--phosphor-cyan)] opacity-65"
          style={{ left: `${pct(p10)}%`, boxShadow: "0 0 8px rgba(93,231,255,0.35)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct(p50) - pct(p10)}%` }}
          transition={{ duration: 0.6, ease: easing }}
        />

        {/* P50–P90 band (lighter) */}
        <motion.div
          className="absolute top-0 h-full rounded-r-[var(--radius-inline)] bg-[var(--phosphor-cyan)] opacity-30"
          style={{ left: `${pct(p50)}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct(p90) - pct(p50)}%` }}
          transition={{ duration: 0.6, ease: easing, delay: 0.15 }}
        />

        {/* Target reference line */}
        {target !== undefined && (
          <div
            className="absolute top-0 h-full border-l-2 border-dashed border-[var(--fg-2)]"
            style={{ left: `${pct(target)}%` }}
          >
            <span className="absolute -top-4 left-1 text-[10px] text-[var(--fg-2)] whitespace-nowrap">
              target
            </span>
          </div>
        )}

        {/* P50 marker — notched pill above bar */}
        <motion.div
          className="absolute -top-5 flex flex-col items-center -translate-x-1/2"
          style={{ left: `${pct(p50)}%` }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: easing }}
        >
          <span
            className="rounded-[var(--radius-inline)] bg-[var(--phosphor-yellow)] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[var(--bg-0)] leading-none"
            style={{ boxShadow: "0 0 10px rgba(255,228,94,0.5)" }}
          >
            {p50}
            {unit}
          </span>
          <span className="text-[var(--phosphor-yellow)] leading-none text-[10px]" aria-hidden>
            ▼
          </span>
        </motion.div>
      </div>

      {/* Axis ticks */}
      <div className="relative h-4">
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute text-[10px] text-[var(--fg-3)] font-mono -translate-x-1/2"
            style={{ left: `${pct(t)}%` }}
          >
            {tickFormat(t)}
          </div>
        ))}
      </div>

      {/* Context line */}
      {contextLine && (
        <p className="text-caption text-[var(--signal-positive)] flex items-center gap-1">
          <span aria-hidden>✓</span>
          <span>{contextLine}</span>
        </p>
      )}
    </div>
  )
}

export function DecisionSurface({
  status,
  situation,
  confidence,
  recommendation,
  rationale,
  impact,
  evidence,
  evidenceLabel,
  onPrimaryAction,
  primaryActionLabel,
  className,
  compactScrollThreshold = 160,
}: DecisionSurfaceProps) {
  const { locale } = useLocale()
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const meta = getStatusMeta(status, locale)
  const ctaLabel = primaryActionLabel ?? meta.defaultCta
  const defaultEvidenceLabel = locale === "ko" ? "근거 보기" : "Why?"
  const hideEvidenceLabel = locale === "ko" ? "근거 숨기기" : "Hide evidence"
  const resolvedEvidenceLabel = evidenceLabel ?? defaultEvidenceLabel
  const expandLabel = locale === "ko" ? "펼치기" : "Expand"

  // Sticky collapse: when the page scrolls past threshold, switch to a
  // compact single-row layout so the decision stays visible without
  // dominating the fold.
  useEffect(() => {
    if (!compactScrollThreshold) return
    const onScroll = () => {
      setIsCompact(window.scrollY > compactScrollThreshold)
    }
    onScroll() // sync on mount (e.g., page reload mid-scroll)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [compactScrollThreshold])

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative flex flex-col border-t-2 bg-[var(--bg-1)]",
        "border-x border-b border-[var(--border-default)] rounded-[var(--radius-card)]",
        "transition-[padding,gap] duration-[var(--duration-component)] ease-[var(--ease-out-quart)]",
        meta.borderColor,
        isCompact ? "gap-2 p-3" : "gap-6 p-6",
        className,
      )}
    >
      {/* 1. Status badge + (compact-only) inline situation + impact */}
      <div className="flex items-center justify-between gap-3">
        <div className={cn("flex items-center gap-3", isCompact && "min-w-0 flex-1")}>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-inline)] px-2 py-1",
              isCompact ? "text-caption" : "text-h3",
              meta.badgeBg,
              meta.badgeText,
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                status === "invest" && "bg-[var(--signal-positive)]",
                status === "hold" && "bg-[var(--signal-caution)]",
                status === "reduce" && "bg-[var(--signal-risk)]",
              )}
            />
            {meta.label}
          </span>
          {isCompact && (
            <p className="truncate text-body text-[var(--fg-1)]">
              {situation}
            </p>
          )}
        </div>
        {impact && (
          <span
            className={cn(
              "font-mono shrink-0",
              isCompact ? "text-h3" : "text-h2",
              impact.direction === "positive" && "text-[var(--signal-positive)]",
              impact.direction === "negative" && "text-[var(--signal-risk)]",
              impact.direction === "neutral" && "text-[var(--fg-1)]",
            )}
          >
            {impact.value}
          </span>
        )}
      </div>

      {!isCompact && (
        <>
          {/* 2. Situation */}
          <p className="text-body text-[var(--fg-1)] break-keep">{situation}</p>

          {/* 3. Confidence — REQUIRED. Lint rule elsewhere enforces this. */}
          <ConfidenceBar confidence={confidence} />

          {/* 4. Recommendation (Display/Serif) + Rationale (support) —
              break-keep prevents mid-word splits in Korean where word
              boundaries are phrase-level, not token-level. */}
          <div className="flex flex-col gap-2">
            <p className="text-display text-[var(--fg-0)] break-keep">{recommendation}</p>
            {rationale && (
              <p className="text-body text-[var(--signal-positive)] flex items-start gap-2 break-keep">
                <span aria-hidden className="font-mono leading-[1.4]">↳</span>
                <span>{rationale}</span>
              </p>
            )}
          </div>
        </>
      )}

      {/* 5. Actions — hidden in compact to keep the sticky bar unobtrusive */}
      {!isCompact && (
      <div className="flex items-center gap-3">
        {onPrimaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className={cn(
              "inline-flex items-center justify-center rounded-[var(--radius-card)] px-4 py-2",
              "bg-[var(--brand)] text-white text-body font-medium",
              "transition-colors duration-[var(--duration-micro)]",
              "hover:bg-[var(--brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 focus:ring-offset-[var(--bg-1)]",
            )}
          >
            {ctaLabel}
          </button>
        )}
        {evidence && (
          <button
            type="button"
            onClick={() => setEvidenceOpen((v) => !v)}
            aria-expanded={evidenceOpen}
            className={cn(
              "inline-flex items-center gap-1.5 text-body text-[var(--fg-2)]",
              "transition-colors duration-[var(--duration-micro)]",
              "hover:text-[var(--fg-0)] focus:outline-none focus:text-[var(--fg-0)]",
            )}
          >
            <span>{evidenceOpen ? hideEvidenceLabel : resolvedEvidenceLabel}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className={cn(
                "transition-transform duration-[var(--duration-micro)]",
                evidenceOpen && "rotate-180",
              )}
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>
        )}
      </div>
      )}

      {/* Compact-mode expand affordance */}
      {isCompact && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={expandLabel}
          className={cn(
            "absolute inset-0 w-full h-full cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-0",
            "rounded-[var(--radius-card)]",
          )}
        />
      )}

      {/* 6. Evidence (collapsed by default) — hidden in compact mode */}
      {!isCompact && evidence && evidenceOpen && (
        <div className="border-t border-[var(--border-subtle)] pt-6">{evidence}</div>
      )}
    </section>
  )
}
