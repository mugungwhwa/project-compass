"use client"

/*
  RunwayStatusBar — App-shell top bar with persistent capital health metrics.
  ----------------------------------------------------------------------------
  Visible on every dashboard page. ~48px tall. Reads existing mock financial
  data and renders 4 key metrics in Geist Mono tabular.

  Locale aware (2026-04-08): metric labels translate via useLocale().
  The brand mark <CompassLogo> is NOT translated — "project compass" is a
  brand name and stays the same in every locale (same rule as "Vercel").

  Design language: Bloomberg Terminal status bar × Linear top nav.
  No gradients, no borders besides bottom rule, monochrome.

  Source of truth: docs/Project_Compass_Design_Migration_Log.md §1.2 + §5
*/

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect, useCallback, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gamepad2, ChevronDown, ChevronLeft, ChevronRight, Calendar, Check } from "lucide-react"
import { mockCashRunway, mockFinancialHealth, mockCapitalKPIs, getGameData } from "@/shared/api"
import { CompassLogo } from "@/shared/ui/compass-logo"
import { useLocale } from "@/shared/i18n"
import type { TranslationKey } from "@/shared/i18n/dictionary"
import { cn } from "@/shared/lib"

const GAMES = [
  { id: "puzzle-quest",   label: "Match League",   genre: "Puzzle" },
  { id: "hero-saga",      label: "Hero Saga",      genre: "RPG"    },
  { id: "farm-empire",    label: "Farm Empire",    genre: "Casual" },
]

const COHORT_MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04"]

type Metric = {
  labelKey: TranslationKey
  value: string
  href?: string
  tone?: "neutral" | "positive" | "caution" | "risk"
}

function buildMetrics(gameId: string, cohortMonth: string): Metric[] {
  const data = getGameData(gameId, cohortMonth)
  const cashM = (data.cashRunway.initialCash / 1000).toFixed(1)
  const runway = data.financialHealth.netRunway.value.toFixed(1)
  const runwayTone: Metric["tone"] =
    data.financialHealth.netRunway.value < 6
      ? "risk"
      : data.financialHealth.netRunway.value < 12
        ? "caution"
        : "positive"
  const payback = data.financialHealth.paybackDay
  const capEff = data.capitalKPIs.capitalEff.value.toFixed(2)

  return [
    { labelKey: "status.cash",    value: `$${cashM}M`,  href: "/dashboard/capital", tone: "neutral" },
    { labelKey: "status.runway",  value: `${runway}mo`, href: "/dashboard/capital", tone: runwayTone },
    { labelKey: "status.payback", value: `D${payback}`, href: "/dashboard",         tone: "neutral" },
    { labelKey: "status.capEff",  value: `${capEff}x`,  href: "/dashboard/capital", tone: "neutral" },
  ]
}

const TONE_CLASS: Record<NonNullable<Metric["tone"]>, string> = {
  neutral: "text-[var(--fg-0)]",
  positive: "text-[var(--signal-positive)]",
  caution: "text-[var(--signal-caution)]",
  risk: "text-[var(--signal-risk)]",
}

// Shared animation variants for dropdowns
const dropdownVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1,    y: 0  },
}
const dropdownTransition = { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const }
const chevronTransition  = { duration: 0.12 }

function MetricCell({
  metric,
  label,
}: {
  metric: Metric
  label: string
}) {
  const content = (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-caption uppercase tracking-wider text-[var(--fg-2)]">
        {label}
      </span>
      <span className={cn("font-mono text-h2", TONE_CLASS[metric.tone ?? "neutral"])}>
        {metric.value}
      </span>
    </span>
  )
  if (metric.href) {
    return (
      <Link
        href={metric.href}
        className="rounded-[var(--radius-inline)] px-2 py-1 transition-colors hover:bg-[var(--bg-3)]"
      >
        {content}
      </Link>
    )
  }
  return <span className="px-2 py-1">{content}</span>
}

export function RunwayStatusBar() {
  const router = useRouter()
  const { t } = useLocale()

  const gameListId  = useId()
  const calListId   = useId()

  const [selectedGame, setSelectedGame]     = useState(GAMES[0])
  const [selectedCohort, setSelectedCohort] = useState("2026-03")

  const metrics = buildMetrics(selectedGame.id, selectedCohort)
  const [gameOpen, setGameOpen]             = useState(false)
  const [calendarOpen, setCalendarOpen]     = useState(false)

  // Keyboard active-index for each dropdown
  const [gameActiveIdx, setGameActiveIdx]       = useState(-1)
  const [calendarActiveIdx, setCalendarActiveIdx] = useState(-1)

  const cohortIdx = COHORT_MONTHS.indexOf(selectedCohort)

  const prevCohort = useCallback(() => {
    if (cohortIdx > 0) setSelectedCohort(COHORT_MONTHS[cohortIdx - 1])
  }, [cohortIdx])
  const nextCohort = useCallback(() => {
    if (cohortIdx < COHORT_MONTHS.length - 1) setSelectedCohort(COHORT_MONTHS[cohortIdx + 1])
  }, [cohortIdx])

  // Refs for trigger buttons and container wrappers
  const gameRef         = useRef<HTMLDivElement>(null)
  const calendarRef     = useRef<HTMLDivElement>(null)
  const gameTriggerRef  = useRef<HTMLButtonElement>(null)
  const calTriggerRef   = useRef<HTMLButtonElement>(null)
  const gameItemsRef    = useRef<(HTMLButtonElement | null)[]>([])
  const calItemsRef     = useRef<(HTMLButtonElement | null)[]>([])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (gameRef.current && !gameRef.current.contains(e.target as Node)) {
        setGameOpen(false)
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Auto-focus selected item when game dropdown opens
  useEffect(() => {
    if (gameOpen) {
      const idx = GAMES.findIndex((g) => g.id === selectedGame.id)
      const focusIdx = idx >= 0 ? idx : 0
      setGameActiveIdx(focusIdx)
      // defer to allow AnimatePresence to mount
      requestAnimationFrame(() => {
        gameItemsRef.current[focusIdx]?.focus()
      })
    } else {
      setGameActiveIdx(-1)
    }
  }, [gameOpen, selectedGame.id])

  // Auto-focus selected item when calendar dropdown opens
  useEffect(() => {
    if (calendarOpen) {
      const idx = COHORT_MONTHS.indexOf(selectedCohort)
      const focusIdx = idx >= 0 ? idx : 0
      setCalendarActiveIdx(focusIdx)
      requestAnimationFrame(() => {
        calItemsRef.current[focusIdx]?.focus()
      })
    } else {
      setCalendarActiveIdx(-1)
    }
  }, [calendarOpen, selectedCohort])

  // Game trigger keyboard handler
  function handleGameTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setGameOpen((o) => !o)
      setCalendarOpen(false)
    } else if (e.key === "Escape") {
      setGameOpen(false)
    }
  }

  // Game dropdown keyboard handler
  function handleGameDropdownKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = Math.min(gameActiveIdx + 1, GAMES.length - 1)
      setGameActiveIdx(next)
      gameItemsRef.current[next]?.focus()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const prev = Math.max(gameActiveIdx - 1, 0)
      setGameActiveIdx(prev)
      gameItemsRef.current[prev]?.focus()
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (gameActiveIdx >= 0) {
        setSelectedGame(GAMES[gameActiveIdx])
        setGameOpen(false)
        gameTriggerRef.current?.focus()
      }
    } else if (e.key === "Escape") {
      setGameOpen(false)
      gameTriggerRef.current?.focus()
    }
  }

  // Calendar trigger keyboard handler
  function handleCalTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setCalendarOpen((o) => !o)
      setGameOpen(false)
    } else if (e.key === "Escape") {
      setCalendarOpen(false)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      prevCohort()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      nextCohort()
    }
  }

  // Calendar dropdown keyboard handler
  function handleCalDropdownKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = Math.min(calendarActiveIdx + 1, COHORT_MONTHS.length - 1)
      setCalendarActiveIdx(next)
      calItemsRef.current[next]?.focus()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const prev = Math.max(calendarActiveIdx - 1, 0)
      setCalendarActiveIdx(prev)
      calItemsRef.current[prev]?.focus()
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (calendarActiveIdx >= 0) {
        setSelectedCohort(COHORT_MONTHS[calendarActiveIdx])
        setCalendarOpen(false)
        calTriggerRef.current?.focus()
      }
    } else if (e.key === "Escape") {
      setCalendarOpen(false)
      calTriggerRef.current?.focus()
    }
  }

  const dropdownBase = cn(
    "absolute right-0 top-full z-50 mt-1",
    "rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)]",
    "shadow-[0_8px_32px_rgba(0,0,0,0.08)] py-1",
  )

  const focusRing = cn(
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-1)]",
  )

  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-30 flex h-14 w-full items-center justify-between",
        "border-b border-[var(--border-default)] bg-[var(--bg-1)] px-6",
      )}
    >
      {/* Left: brand sigil (never translated) + metrics */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className={cn("mr-4 transition-opacity hover:opacity-80", focusRing, "rounded-[var(--radius-inline)]")}
          aria-label="project compass home"
        >
          <CompassLogo size="lg" />
        </button>
        <div className="flex items-center gap-1">
          {metrics.map((m) => (
            <MetricCell key={m.labelKey} metric={m} label={t(m.labelKey)} />
          ))}
        </div>
      </div>

      {/* Right: Segmented Pill — game selector | ◀ cohort ▶ */}
      <div className="flex items-center">

        {/* ── Left segment: Game selector ── */}
        <div ref={gameRef} className="relative">
          <button
            ref={gameTriggerRef}
            type="button"
            onClick={() => { setGameOpen((o) => !o); setCalendarOpen(false) }}
            onKeyDown={handleGameTriggerKeyDown}
            aria-haspopup="listbox"
            aria-expanded={gameOpen}
            aria-controls={gameListId}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-l-[var(--radius-card)]",
              "border border-r-0 border-[var(--border-default)]",
              "px-2.5 bg-[var(--bg-1)] text-body text-[var(--fg-1)]",
              "transition-colors duration-[var(--duration-micro)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]",
              gameOpen && "bg-[var(--bg-3)] text-[var(--fg-0)]",
              focusRing,
            )}
          >
            <Gamepad2 className="h-3.5 w-3.5 flex-shrink-0 text-[var(--fg-2)]" aria-hidden />
            <span className="font-medium">{selectedGame.label}</span>
            <motion.span
              animate={{ rotate: gameOpen ? 180 : 0 }}
              transition={chevronTransition}
              className="flex items-center"
            >
              <ChevronDown className="h-3 w-3 flex-shrink-0 text-[var(--fg-3)]" aria-hidden />
            </motion.span>
          </button>

          {/* Game dropdown */}
          <AnimatePresence>
            {gameOpen && (
              <motion.div
                id={gameListId}
                role="listbox"
                aria-label="Select game"
                className={cn(dropdownBase, "min-w-[180px]")}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={dropdownTransition}
                onKeyDown={handleGameDropdownKeyDown}
              >
                {GAMES.map((game, idx) => (
                  <button
                    key={game.id}
                    ref={(el) => { gameItemsRef.current[idx] = el }}
                    role="option"
                    aria-selected={game.id === selectedGame.id}
                    type="button"
                    tabIndex={-1}
                    onClick={() => { setSelectedGame(game); setGameOpen(false); gameTriggerRef.current?.focus() }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-body",
                      "transition-colors duration-[var(--duration-micro)]",
                      "hover:bg-[var(--bg-3)]",
                      game.id === selectedGame.id
                        ? "text-[var(--brand)] font-medium"
                        : "text-[var(--fg-1)]",
                      gameActiveIdx === idx && "bg-[var(--bg-3)]",
                      focusRing,
                    )}
                  >
                    <span className="flex flex-col items-start">
                      <span className="font-medium leading-tight">{game.label}</span>
                      <span className="text-caption text-[var(--fg-3)]">{game.genre}</span>
                    </span>
                    {game.id === selectedGame.id && (
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-[var(--brand)]" aria-hidden />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right segment: ◀ Cohort Month ▶ ── */}
        <div ref={calendarRef} className="relative flex items-center">
          {/* Prev month arrow */}
          <button
            type="button"
            onClick={prevCohort}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") { e.preventDefault(); prevCohort() }
            }}
            disabled={cohortIdx <= 0}
            aria-label="Previous cohort month"
            className={cn(
              "inline-flex h-9 items-center border-y border-l px-1",
              "border-[var(--border-default)] bg-[var(--bg-1)] text-[var(--fg-2)]",
              "transition-colors duration-[var(--duration-micro)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              focusRing,
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          </button>

          {/* Month label — click opens full dropdown */}
          <button
            ref={calTriggerRef}
            type="button"
            onClick={() => { setCalendarOpen((o) => !o); setGameOpen(false) }}
            onKeyDown={handleCalTriggerKeyDown}
            aria-haspopup="listbox"
            aria-expanded={calendarOpen}
            aria-controls={calListId}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 border-y px-2.5",
              "border-[var(--border-default)] bg-[var(--bg-1)] text-body text-[var(--fg-1)]",
              "transition-colors duration-[var(--duration-micro)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]",
              calendarOpen && "bg-[var(--bg-3)] text-[var(--fg-0)]",
              focusRing,
            )}
          >
            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-[var(--fg-2)]" aria-hidden />
            {/* Animated cohort text on change */}
            <AnimatePresence mode="wait">
              <motion.span
                key={selectedCohort}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="font-mono text-caption"
              >
                {selectedCohort}
              </motion.span>
            </AnimatePresence>
            <motion.span
              animate={{ rotate: calendarOpen ? 180 : 0 }}
              transition={chevronTransition}
              className="flex items-center"
            >
              <ChevronDown className="h-3 w-3 flex-shrink-0 text-[var(--fg-3)]" aria-hidden />
            </motion.span>
          </button>

          {/* Next month arrow */}
          <button
            type="button"
            onClick={nextCohort}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") { e.preventDefault(); nextCohort() }
            }}
            disabled={cohortIdx >= COHORT_MONTHS.length - 1}
            aria-label="Next cohort month"
            className={cn(
              "inline-flex h-9 items-center rounded-r-[var(--radius-card)] border px-1",
              "border-[var(--border-default)] bg-[var(--bg-1)] text-[var(--fg-2)]",
              "transition-colors duration-[var(--duration-micro)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              focusRing,
            )}
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>

          {/* Cohort month dropdown */}
          <AnimatePresence>
            {calendarOpen && (
              <motion.div
                id={calListId}
                role="listbox"
                aria-label="Select cohort month"
                className={cn(dropdownBase, "min-w-[140px]")}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={dropdownTransition}
                onKeyDown={handleCalDropdownKeyDown}
              >
                {COHORT_MONTHS.map((month, idx) => (
                  <button
                    key={month}
                    ref={(el) => { calItemsRef.current[idx] = el }}
                    role="option"
                    aria-selected={month === selectedCohort}
                    type="button"
                    tabIndex={-1}
                    onClick={() => { setSelectedCohort(month); setCalendarOpen(false); calTriggerRef.current?.focus() }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-body",
                      "transition-colors duration-[var(--duration-micro)]",
                      "hover:bg-[var(--bg-3)]",
                      month === selectedCohort
                        ? "text-[var(--brand)] font-medium"
                        : "text-[var(--fg-1)]",
                      calendarActiveIdx === idx && "bg-[var(--bg-3)]",
                      focusRing,
                    )}
                  >
                    <span className="font-mono text-caption">{month}</span>
                    {month === selectedCohort && (
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-[var(--brand)]" aria-hidden />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
