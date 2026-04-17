"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { type CyclicUpdateData, type CyclicUpdateStep } from "@/shared/api/mock-data"
import { MARKET_GAP_PROOF_COLORS as C } from "@/shared/config/chart-colors"
import { computeMarketSignal } from "@/shared/lib"
import { useLocale } from "@/shared/i18n"

// ─── Y-axis normalization ─────────────────────────────────────────────────────
// All frames share the same Y scale derived from D0 (widest prior band).
function makeToY(globalMin: number, globalMax: number, height: number) {
  return (value: number) => {
    const pct = (value - globalMin) / (globalMax - globalMin)
    // Invert: high value → low pixel (top of container)
    return height - pct * height
  }
}

// ─── StepFrame ────────────────────────────────────────────────────────────────
type StepFrameProps = {
  step: CyclicUpdateStep
  toY: (v: number) => number
  bandHeight: number
  isFirst: boolean
  locale: "ko" | "en"
}

function StepFrame({ step, toY, bandHeight, isFirst, locale }: StepFrameProps) {
  const [hovered, setHovered] = useState(false)

  const priorTop = toY(step.prior.p90)
  const priorBottom = toY(step.prior.p10)
  const priorMid = toY(step.prior.p50)
  const priorHeight = priorBottom - priorTop

  const postTop = step.posterior ? toY(step.posterior.p90) : 0
  const postBottom = step.posterior ? toY(step.posterior.p10) : 0
  const postMid = step.posterior ? toY(step.posterior.p50) : 0
  const postHeight = step.posterior ? postBottom - postTop : 0

  const observedY = step.observed !== null ? toY(step.observed) : null

  const signal = step.posterior
    ? computeMarketSignal(step.prior.p50, step.posterior.p50)
    : null

  const gapSign = signal && signal.deltaPct >= 0 ? "+" : ""
  const gapColor = C.gapAccent

  return (
    <motion.div
      className="flex flex-col items-center gap-1 cursor-default"
      style={{ width: 120 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top label */}
      <span
        className="text-[11px] font-mono font-semibold"
        style={{ color: "var(--fg-1)" }}
      >
        {step.label}
      </span>

      {/* Band visualization area */}
      <div
        className="relative w-full rounded-sm border transition-colors"
        style={{
          height: bandHeight,
          borderColor: hovered ? "var(--brand)" : "var(--border-default)",
          borderWidth: hovered ? 2 : 1,
          boxShadow: hovered ? "0 0 0 3px rgba(26,127,232,0.15)" : undefined,
          backgroundColor: "var(--bg-2)",
          overflow: "hidden",
        }}
      >
        {/* Prior band (genre expectation) — dashed border, red fill */}
        <div
          className="absolute left-1 right-1"
          style={{
            top: priorTop,
            height: Math.max(priorHeight, 2),
            backgroundColor: C.genreFill,
            border: `1px dashed ${C.genreLine}`,
            borderRadius: 2,
          }}
        />
        {/* Prior P50 line */}
        <div
          className="absolute left-1 right-1"
          style={{
            top: priorMid,
            height: 1,
            backgroundColor: C.genreLine,
          }}
        />

        {/* Posterior band (our performance) — solid border, green fill */}
        {step.posterior && (
          <>
            <div
              className="absolute left-2 right-2"
              style={{
                top: postTop,
                height: Math.max(postHeight, 2),
                backgroundColor: C.ourFill,
                border: `1px solid ${C.our}`,
                borderRadius: 2,
              }}
            />
            {/* Posterior P50 line */}
            <div
              className="absolute left-2 right-2"
              style={{
                top: postMid,
                height: 1.5,
                backgroundColor: C.our,
              }}
            />
          </>
        )}

        {/* Observed × marker */}
        {observedY !== null && (
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
            style={{ top: observedY - 6 }}
          >
            <span
              className="text-[10px] font-bold leading-none select-none"
              style={{ color: C.our }}
            >
              ×
            </span>
            {hovered && step.observed !== null && (
              <span
                className="text-[9px] font-mono font-bold leading-none mt-0.5"
                style={{ color: C.our }}
              >
                {step.observed.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom numbers */}
      <div className="flex flex-col items-center gap-0.5 w-full px-1">
        {isFirst ? (
          <span
            className="text-[10px] text-center leading-snug"
            style={{ color: "var(--fg-3)" }}
          >
            {locale === "ko" ? "장르 기대치만\n(데이터 없음)" : "Genre only\n(no data)"}
          </span>
        ) : (
          <>
            {/* Prior P50 */}
            <span
              className="text-[10px] font-mono"
              style={{ color: C.genre }}
            >
              {step.prior.p50.toFixed(1)}
            </span>
            {/* Posterior P50 */}
            {step.posterior && (
              <span
                className="text-[11px] font-mono font-bold"
                style={{ color: C.our }}
              >
                →{step.posterior.p50.toFixed(1)}
              </span>
            )}
            {/* Gap */}
            {signal && (
              <span
                className="text-[10px] font-mono font-semibold"
                style={{ color: gapColor }}
              >
                {gapSign}{signal.deltaPct.toFixed(1)}%
              </span>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

// ─── AbsorptionArrow ──────────────────────────────────────────────────────────
function AbsorptionArrow({ locale }: { locale: "ko" | "en" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5" style={{ marginTop: 16 }}>
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <line
          x1="2" y1="10" x2="22" y2="10"
          stroke="var(--fg-3)"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.5"
        />
        <polygon
          points="22,5 28,10 22,15"
          fill="var(--fg-3)"
          opacity="0.5"
        />
      </svg>
      <span
        className="text-[9px]"
        style={{ color: "var(--fg-3)" }}
      >
        {locale === "ko" ? "흡수" : "absorbed"}
      </span>
    </div>
  )
}

// ─── CyclicUpdateTimeline ─────────────────────────────────────────────────────
type CyclicUpdateTimelineProps = {
  data: CyclicUpdateData
}

export function CyclicUpdateTimeline({ data }: CyclicUpdateTimelineProps) {
  const { locale, t } = useLocale()
  const bandHeight = 120

  // Compute global Y scale from D0 prior (widest band)
  const d0 = data.steps[0]
  const allValues = data.steps.flatMap((s) => {
    const vals = [s.prior.p10, s.prior.p50, s.prior.p90]
    if (s.posterior) vals.push(s.posterior.p10, s.posterior.p50, s.posterior.p90)
    if (s.observed !== null) vals.push(s.observed)
    return vals
  })
  const globalMin = Math.min(...allValues) - 1
  const globalMax = Math.max(...allValues) + 1
  const toY = makeToY(globalMin, globalMax, bandHeight)

  return (
    <div className="flex flex-col gap-4">
      {/* Play button (disabled — Task 6 will enable) */}
      <div className="flex items-center gap-2">
        <button
          disabled
          className="flex items-center gap-1.5 rounded-[var(--radius-inline)] border border-[var(--border-default)] px-3 py-1.5 text-[12px] text-[var(--fg-3)] cursor-not-allowed opacity-50"
        >
          <Play className="h-3 w-3" />
          <span>{t("methodology.play")}</span>
        </button>
        <span className="text-[11px] text-[var(--fg-3)]">
          {locale === "ko" ? "D0 → D90 순차 애니메이션 (준비 중)" : "D0 → D90 sequential animation (coming soon)"}
        </span>
      </div>

      {/* 6-frame horizontal step grid */}
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {data.steps.map((step, i) => (
          <div key={step.label} className="flex items-start">
            <StepFrame
              step={step}
              toY={toY}
              bandHeight={bandHeight}
              isFirst={i === 0}
              locale={locale}
            />
            {i < data.steps.length - 1 && (
              <AbsorptionArrow locale={locale} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
