"use client"

/*
  <DecisionSurface> — Compass's unit component.
  ----------------------------------------------
  Every decision point in Compass MUST use this pattern.
  4-part structure: Situation → Confidence → Recommendation → Evidence.

  Source of truth: docs/Project_Compass_Design_Migration_Log.md §4.1

  Rules:
  - Confidence is NOT optional. Point estimates without intervals are forbidden.
  - Recommendation must start with a verb ("Scale", "Pause", "Ship", "Hold").
  - Evidence is collapsed by default — the decision comes first, the proof is a click away.
  - Numbers use Geist Mono tabular-nums; decision statements use Instrument Serif.
*/

import { useState, type ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

export type DecisionStatus = "invest" | "hold" | "reduce"

export type Confidence = {
  p10: number
  p50: number
  p90: number
  unit?: string        // e.g. "%", "$", "days"
  label?: string       // e.g. "Payback window", "D30 retention"
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
  impact?: Impact
  evidence?: ReactNode                       // collapsed by default
  evidenceLabel?: string                     // default "Why?"
  onPrimaryAction?: () => void
  primaryActionLabel?: string                // default derives from status
  className?: string
}

const STATUS_META: Record<
  DecisionStatus,
  { label: string; borderColor: string; badgeBg: string; badgeText: string; defaultCta: string }
> = {
  invest: {
    label: "Invest More",
    borderColor: "border-t-[var(--signal-positive)]",
    badgeBg: "bg-[var(--signal-positive-bg)]",
    badgeText: "text-[var(--signal-positive)]",
    defaultCta: "Approve & scale",
  },
  hold: {
    label: "Hold",
    borderColor: "border-t-[var(--signal-caution)]",
    badgeBg: "bg-[var(--signal-caution-bg)]",
    badgeText: "text-[var(--signal-caution)]",
    defaultCta: "Review in 7 days",
  },
  reduce: {
    label: "Pull Back",
    borderColor: "border-t-[var(--signal-risk)]",
    badgeBg: "bg-[var(--signal-risk-bg)]",
    badgeText: "text-[var(--signal-risk)]",
    defaultCta: "Reduce exposure",
  },
}

function formatCI(c: Confidence): string {
  const unit = c.unit ?? ""
  return `${c.p50}${unit} [P10: ${c.p10}${unit} – P90: ${c.p90}${unit}]`
}

/**
 * ConfidenceBar renders a horizontal band where width encodes the P10–P90
 * spread relative to P50. Tighter bar = higher conviction.
 * Deliberately visual-first — the number is secondary, the width is the signal.
 */
function ConfidenceBar({ confidence }: { confidence: Confidence }) {
  const span = Math.max(confidence.p90 - confidence.p10, 0.0001)
  const center = confidence.p50
  // Normalize: show P10-P90 range as proportion of a fixed reference (2× the span around center)
  // so that narrower posteriors visibly shrink.
  const total = span * 2
  const leftPct = ((center - confidence.p10) / total) * 100
  const rightPct = ((confidence.p90 - center) / total) * 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-caption text-[var(--fg-2)]">
        <span>{confidence.label ?? "Credible interval"}</span>
        <span className="font-mono text-[var(--fg-1)]">{formatCI(confidence)}</span>
      </div>
      <div className="relative h-2 rounded-[var(--radius-inline)] bg-[var(--bg-3)]">
        <div
          className="absolute top-0 h-full rounded-[var(--radius-inline)] bg-[var(--chart-band-outer)]"
          style={{
            left: `${50 - leftPct}%`,
            width: `${leftPct + rightPct}%`,
          }}
        />
        <div
          className="absolute top-[-2px] h-[12px] w-[2px] bg-[var(--brand)]"
          style={{ left: "calc(50% - 1px)" }}
          aria-label="P50 median"
        />
      </div>
    </div>
  )
}

export function DecisionSurface({
  status,
  situation,
  confidence,
  recommendation,
  impact,
  evidence,
  evidenceLabel = "Why?",
  onPrimaryAction,
  primaryActionLabel,
  className,
}: DecisionSurfaceProps) {
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const meta = STATUS_META[status]
  const ctaLabel = primaryActionLabel ?? meta.defaultCta

  return (
    <section
      className={cn(
        "relative flex flex-col gap-6 border-t-2 bg-[var(--bg-1)] p-6",
        "border-x border-b border-[var(--border-default)] rounded-[var(--radius-card)]",
        "transition-shadow duration-[var(--duration-component)] ease-[var(--ease-out-quart)]",
        meta.borderColor,
        className,
      )}
    >
      {/* 1. Status badge */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-[var(--radius-inline)] px-2 py-1 text-h3",
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
        {impact && (
          <span
            className={cn(
              "font-mono text-h2",
              impact.direction === "positive" && "text-[var(--signal-positive)]",
              impact.direction === "negative" && "text-[var(--signal-risk)]",
              impact.direction === "neutral" && "text-[var(--fg-1)]",
            )}
          >
            {impact.value}
          </span>
        )}
      </div>

      {/* 2. Situation */}
      <p className="text-body text-[var(--fg-1)]">{situation}</p>

      {/* 3. Confidence — REQUIRED. Lint rule elsewhere enforces this. */}
      <ConfidenceBar confidence={confidence} />

      {/* 4. Recommendation (Display/Serif) */}
      <p className="text-display text-[var(--fg-0)]">{recommendation}</p>

      {/* 5. Actions */}
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
            <span>{evidenceOpen ? "Hide evidence" : evidenceLabel}</span>
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

      {/* 6. Evidence (collapsed by default) */}
      {evidence && evidenceOpen && (
        <div className="border-t border-[var(--border-subtle)] pt-6">{evidence}</div>
      )}
    </section>
  )
}
