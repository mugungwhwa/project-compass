"use client"

import { useState, useReducer, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type CyclicUpdateData, type CyclicUpdateStep } from "@/shared/api/mock-data"
import { MARKET_GAP_PROOF_COLORS as C } from "@/shared/config/chart-colors"
import { computeMarketSignal, cn } from "@/shared/lib"
import { useLocale } from "@/shared/i18n"
import { type TranslationKey } from "@/shared/i18n/dictionary"

// ─── Play state machine ───────────────────────────────────────────────────────
type PlayStatus = "idle" | "playing" | "paused" | "done"
type PlayState = { status: PlayStatus; activeStep: number }
type PlayAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "next" }
  | { type: "done" }

function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "play":   return { status: "playing", activeStep: 0 }
    case "pause":  return { ...state, status: "paused" }
    case "resume": return { ...state, status: "playing" }
    case "next":   return { ...state, activeStep: state.activeStep + 1 }
    case "done":   return { status: "done", activeStep: -1 }
    default:       return state
  }
}

const STEP_TIMINGS = [
  { dwell: 600, arrow: 200 },
  { dwell: 600, arrow: 200 },
  { dwell: 500, arrow: 200 },
  { dwell: 500, arrow: 200 },
  { dwell: 500, arrow: 200 },
  { dwell: 800, arrow: 0 },
]
const BAND_ANIM_MS = 400

// ─── Y-axis normalization ─────────────────────────────────────────────────────
function makeToY(globalMin: number, globalMax: number, height: number) {
  return (value: number) => {
    const pct = (value - globalMin) / (globalMax - globalMin)
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
  isHovered: boolean
  isDimmed: boolean
  isActive: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function StepFrame({
  step,
  toY,
  bandHeight,
  isFirst,
  locale,
  isHovered,
  isDimmed,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: StepFrameProps) {
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

  // Active frame: brand border + glow; hovered: brand ring; dimmed: opacity
  const borderColor = isActive ? "var(--brand)" : isHovered ? "var(--brand)" : "var(--border-default)"
  const borderWidth = isActive || isHovered ? 2 : 1
  const ringClass = isHovered && !isActive ? "ring-2 ring-[var(--brand)]/20" : ""

  return (
    <motion.div
      className="flex flex-col items-center gap-1 cursor-default relative"
      style={{ width: 120 }}
      animate={{
        opacity: isDimmed ? 0.35 : 1,
        filter: isDimmed ? "blur(0.5px)" : "blur(0px)",
        scale: isActive ? 1.02 : isHovered ? 1.04 : 1,
        zIndex: isActive || isHovered ? 10 : 1,
        boxShadow: isActive ? "0 0 16px rgba(26,127,232,0.25)" : "none",
      }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && step.posterior && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] px-2.5 py-1.5 shadow-lg text-[10px]"
          >
            <span className="text-[var(--fg-2)]">{step.label}: </span>
            <span style={{ color: C.genre }}>{step.prior.p50.toFixed(1)}</span>
            <span className="text-[var(--fg-3)]"> → </span>
            <span className="font-bold" style={{ color: C.our }}>{step.posterior.p50.toFixed(1)}</span>
            {signal && (
              <span className="ml-1.5 font-bold" style={{ color: C.gapAccent }}>
                {signal.deltaPct > 0 ? "+" : ""}
                {signal.deltaPct.toFixed(1)}%
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top label */}
      <span
        className="text-[11px] font-mono font-semibold"
        style={{ color: isActive ? "var(--brand)" : "var(--fg-1)" }}
      >
        {step.label}
      </span>

      {/* Band visualization area */}
      <div
        className={cn(
          "relative w-full rounded-sm border transition-colors",
          ringClass
        )}
        style={{
          height: bandHeight,
          borderColor,
          borderWidth,
          backgroundColor: "var(--bg-2)",
          overflow: "visible",
        }}
      >
        {/* Prior band (genre expectation) */}
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

        {/* Posterior band (our performance) — animated when active */}
        {step.posterior && (
          <motion.div
            style={{ position: "absolute", left: 8, right: 8 }}
            animate={isActive
              ? { opacity: 1, scaleY: 1 }
              : { opacity: 1, scaleY: 1 }
            }
            initial={isActive ? { opacity: 0, scaleY: 0.6 } : false}
            transition={{ duration: BAND_ANIM_MS / 1000, ease: "easeOut" }}
          >
            <div
              style={{
                position: "absolute",
                top: postTop,
                left: 0,
                right: 0,
                height: Math.max(postHeight, 2),
                backgroundColor: C.ourFill,
                border: `1px solid ${C.our}`,
                borderRadius: 2,
              }}
            />
            {/* Posterior P50 line */}
            <div
              style={{
                position: "absolute",
                top: postMid,
                left: 0,
                right: 0,
                height: 1.5,
                backgroundColor: C.our,
              }}
            />
          </motion.div>
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
            {isHovered && step.observed !== null && (
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
            <span className="text-[10px] font-mono" style={{ color: C.genre }}>
              {step.prior.p50.toFixed(1)}
            </span>
            {step.posterior && (
              <span className="text-[11px] font-mono font-bold" style={{ color: C.our }}>
                →{step.posterior.p50.toFixed(1)}
              </span>
            )}
            {signal && (
              <span className="text-[10px] font-mono font-semibold" style={{ color: gapColor }}>
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
type AbsorptionArrowProps = {
  locale: "ko" | "en"
  isAdjacentHovered: boolean
  isTransitioning: boolean
  t: (key: TranslationKey) => string
}

function AbsorptionArrow({ locale, isAdjacentHovered, isTransitioning, t }: AbsorptionArrowProps) {
  const active = isAdjacentHovered || isTransitioning
  return (
    <div className="flex flex-col items-center justify-center gap-0.5" style={{ marginTop: 16 }}>
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <line
          x1="2" y1="10" x2="22" y2="10"
          stroke={active ? "var(--brand)" : "var(--fg-3)"}
          strokeWidth={active ? 2 : 1}
          strokeDasharray={isTransitioning ? "3 3" : active ? undefined : "3 3"}
          strokeDashoffset={0}
          opacity={active ? 1 : 0.5}
          style={{
            transition: "stroke 0.2s, opacity 0.2s, stroke-width 0.2s",
            animation: isTransitioning ? "dashflow 0.4s linear" : "none",
          }}
        />
        <polygon
          points="22,5 28,10 22,15"
          fill={active ? "var(--brand)" : "var(--fg-3)"}
          opacity={active ? 1 : 0.5}
          style={{ transition: "fill 0.2s, opacity 0.2s" }}
        />
      </svg>
      <span
        className="text-[9px] text-center leading-tight"
        style={{
          color: active ? "var(--brand)" : "var(--fg-3)",
          transition: "color 0.2s",
          maxWidth: active ? 80 : undefined,
        }}
      >
        {isAdjacentHovered
          ? t("methodology.absorptionFull")
          : t("methodology.absorption")}
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [play, dispatch] = useReducer(playReducer, { status: "idle", activeStep: -1 })

  const allValues = data.steps.flatMap((s) => {
    const vals = [s.prior.p10, s.prior.p50, s.prior.p90]
    if (s.posterior) vals.push(s.posterior.p10, s.posterior.p50, s.posterior.p90)
    if (s.observed !== null) vals.push(s.observed)
    return vals
  })
  const globalMin = Math.min(...allValues) - 1
  const globalMax = Math.max(...allValues) + 1
  const toY = makeToY(globalMin, globalMax, bandHeight)

  // ── Timing engine ──
  useEffect(() => {
    if (play.status !== "playing") return
    if (play.activeStep >= data.steps.length) {
      dispatch({ type: "done" })
      return
    }
    const timing = STEP_TIMINGS[play.activeStep] ?? { dwell: 600, arrow: 0 }
    const totalMs = BAND_ANIM_MS + timing.dwell + timing.arrow
    const timer = setTimeout(() => dispatch({ type: "next" }), totalMs)
    return () => clearTimeout(timer)
  }, [play.status, play.activeStep, data.steps.length])

  // ── Hover during play → auto pause ──
  useEffect(() => {
    if (hoveredIdx !== null && play.status === "playing") {
      dispatch({ type: "pause" })
    }
  }, [hoveredIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGridMouseLeave = () => {
    setHoveredIdx(null)
    if (play.status === "paused" && play.activeStep >= 0) {
      dispatch({ type: "resume" })
    }
  }

  const handlePlayClick = () => {
    if (play.status === "idle" || play.status === "done") {
      dispatch({ type: "play" })
    } else if (play.status === "playing") {
      dispatch({ type: "pause" })
    } else if (play.status === "paused") {
      dispatch({ type: "resume" })
    }
  }

  const buttonLabel = () => {
    if (play.status === "playing") return `⏸ ${t("methodology.pause")}`
    if (play.status === "done") return `⏵ ${t("methodology.replay")}`
    return `⏵ ${t("methodology.play")}`
  }

  return (
    <>
      {/* Keyframe for arrow dash animation */}
      <style>{`@keyframes dashflow { to { stroke-dashoffset: -12; } }`}</style>

      <div className="flex flex-col gap-4">
        {/* Play button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePlayClick}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-inline)] border border-[var(--border-default)] px-3 py-1.5 text-[12px] font-medium text-[var(--fg-2)] hover:bg-[var(--bg-3)] transition-colors"
          >
            {buttonLabel()}
          </button>
          {(play.status === "idle" || play.status === "done") && (
            <span className="text-[11px] text-[var(--fg-3)]">
              {locale === "ko" ? "D0 → D90 순차 애니메이션" : "D0 → D90 sequential animation"}
            </span>
          )}
          {play.status === "paused" && (
            <span className="text-[11px] text-[var(--fg-3)]">
              {locale === "ko" ? "일시정지됨" : "Paused"}
            </span>
          )}
        </div>

        {/* 6-frame horizontal step grid */}
        <div
          className="flex items-start gap-0 overflow-x-auto pb-2"
          onMouseLeave={handleGridMouseLeave}
        >
          {data.steps.map((step, i) => {
            const isHovered = hoveredIdx === i
            // Dimmed: hover-based OR play-based
            const playIsActive = play.status === "playing" && play.activeStep !== -1
            const isDimmed =
              (hoveredIdx !== null && !isHovered) ||
              (playIsActive && play.activeStep !== i)
            const isActive = play.status === "playing" && play.activeStep === i
            // Arrow pulse: transitioning arrow between i and i+1 when play just moved to i+1
            const isTransitioning = play.status === "playing" && play.activeStep === i + 1
            // Arrow between frames i and i+1 is adjacent-hovered if frame i or i+1 is hovered
            const arrowAdjacentHovered = hoveredIdx === i || hoveredIdx === i + 1

            return (
              <div key={step.label} className="flex items-start">
                <StepFrame
                  step={step}
                  toY={toY}
                  bandHeight={bandHeight}
                  isFirst={i === 0}
                  locale={locale}
                  isHovered={isHovered}
                  isDimmed={isDimmed}
                  isActive={isActive}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => {}}
                />
                {i < data.steps.length - 1 && (
                  <AbsorptionArrow
                    locale={locale}
                    isAdjacentHovered={arrowAdjacentHovered}
                    isTransitioning={isTransitioning}
                    t={t}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
