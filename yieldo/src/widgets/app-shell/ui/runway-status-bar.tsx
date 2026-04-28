"use client"

/*
  RunwayStatusBar — App-shell top bar with persistent capital health metrics.
  ----------------------------------------------------------------------------
  Visible on every dashboard page. ~48px tall. Reads existing mock financial
  data and renders 4 key metrics in Geist Mono tabular.

  Locale aware (2026-04-08): metric labels translate via useLocale().
  The brand mark <YieldoLogo> is NOT translated — "yieldo" is a brand name
  and stays the same in every locale (same rule as "Vercel").

  Design language: Bloomberg Terminal status bar × Linear top nav.
  No gradients, no borders besides bottom rule, monochrome.

  Source of truth: docs/Project_Yieldo_Design_Migration_Log.md §1.2 + §5
*/

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect, useCallback, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gamepad2, ChevronDown, Calendar, Check } from "lucide-react"
import { DayPicker, type DateRange } from "react-day-picker"
import { ko as koLocale, enUS } from "react-day-picker/locale"
import "react-day-picker/style.css"
import { mockCashRunway, mockFinancialHealth, mockCapitalKPIs, getGameData } from "@/shared/api"
import { useSelectedGame } from "@/shared/store/selected-game"
import { YieldoLogo } from "@/shared/ui/yieldo-logo"
import { useLocale } from "@/shared/i18n"
import type { TranslationKey } from "@/shared/i18n/dictionary"
import { cn } from "@/shared/lib"

const GAMES = [
  { id: "portfolio",      label: "Portfolio",      genre: "All Titles"     },
  { id: "match-league",   label: "Match League",   genre: "Puzzle"         },
  { id: "weaving-fairy",  label: "Weaving Fairy",  genre: "Casual"         },
  { id: "dig-infinity",   label: "Dig Infinity",   genre: "Arcade / Idle"  },
]

const COHORT_MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04"]

const MONTH_LABELS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTH_LABELS_KO = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

/** Available months (set — fast lookup for which cells are selectable) */
const AVAILABLE_SET = new Set(COHORT_MONTHS)

function formatCohort(ym: string, locale: string): string {
  const [year, month] = ym.split("-")
  const mi = parseInt(month, 10) - 1
  return locale === "ko"
    ? `${year}년 ${MONTH_LABELS_KO[mi]}`
    : `${MONTH_LABELS_EN[mi]} ${year}`
}

function cohortYear(ym: string): string { return ym.split("-")[0] }
function cohortMonthIdx(ym: string): number { return parseInt(ym.split("-")[1], 10) - 1 }

type Direction = "up" | "down" | "flat"

type Metric = {
  labelKey: TranslationKey
  value: string
  href?: string
  /** Health-coded color for the value. */
  tone?: "neutral" | "positive" | "caution" | "risk"
  /** Formatted delta vs prior period (e.g. "+$280K", "-5d"). */
  delta?: string
  /** Direction the value moved. */
  direction?: Direction
  /** Which direction is good for this metric.  Used to color the delta:
      delta is green if direction === goodWhen, red if opposite, gray if flat. */
  goodWhen?: "up" | "down"
}

function buildMetrics(gameId: string, cohortMonth: string): Metric[] {
  const data = getGameData(gameId, cohortMonth)
  const cashM = (data.cashRunway.initialCash / 1000).toFixed(1)
  const runwayValue = data.financialHealth.netRunway.value
  const runway = runwayValue.toFixed(1)
  const paybackValue = data.financialHealth.paybackDay
  const capEffValue = data.capitalKPIs.capitalEff.value
  const capEff = capEffValue.toFixed(2)

  // Health-coded tones (B-안: all 4 metrics get health colors, not just runway)
  const runwayTone: Metric["tone"] =
    runwayValue < 6 ? "risk" : runwayValue < 12 ? "caution" : "positive"
  // Cash health derives from runway window (cash + burn = runway), but as
  // a standalone "is the balance healthy?" we tier on runway proxy.
  const cashTone: Metric["tone"] =
    runwayValue < 6 ? "risk" : runwayValue < 12 ? "caution" : "positive"
  // Payback target = D60 (yieldo standard for mobile games).  ≤60 healthy.
  const paybackTone: Metric["tone"] =
    paybackValue <= 60 ? "positive" : paybackValue <= 72 ? "caution" : "risk"
  // CapEff: ≥1.0 means revenue ≥ investment.
  const capEffTone: Metric["tone"] =
    capEffValue >= 1.0 ? "positive" : capEffValue >= 0.8 ? "caution" : "risk"

  // Sample deltas (mockup-grade — real version queries period-over-period
  // snapshots).  Sign embedded so MetricCell can color by direction.
  return [
    {
      labelKey: "status.cash",
      value: `$${cashM}M`,
      href: "/dashboard/capital",
      tone: cashTone,
      delta: "-$280K",
      direction: "down",
      goodWhen: "up",
    },
    {
      labelKey: "status.runway",
      value: `${runway}mo`,
      href: "/dashboard/capital",
      tone: runwayTone,
      delta: "-0.3",
      direction: "down",
      goodWhen: "up",
    },
    {
      labelKey: "status.payback",
      value: `D${paybackValue}`,
      href: "/dashboard",
      tone: paybackTone,
      delta: "+5d",
      direction: "up",
      goodWhen: "down",
    },
    {
      labelKey: "status.capEff",
      value: `${capEff}x`,
      href: "/dashboard/capital",
      tone: capEffTone,
      delta: "+0.04",
      direction: "up",
      goodWhen: "up",
    },
  ]
}

const TONE_CLASS: Record<NonNullable<Metric["tone"]>, string> = {
  neutral: "text-[var(--phosphor-yellow)]",
  positive: "text-[var(--phosphor-green)]",
  caution: "text-[var(--phosphor-amber)]",
  risk: "text-[var(--phosphor-red)]",
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
  // Delta direction color: green if delta moves in the good direction,
  // red if opposite, gray if flat.  Bloomberg pattern — sign in the
  // text + color reinforcement (no separate arrow icon).
  const deltaColor = (() => {
    if (!metric.direction || metric.direction === "flat") return "text-[var(--fg-3)]"
    if (!metric.goodWhen) return "text-[var(--fg-3)]"
    return metric.direction === metric.goodWhen
      ? "text-[var(--phosphor-green)]"
      : "text-[var(--phosphor-red)]"
  })()

  const content = (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-caption uppercase tracking-wider text-[var(--fg-2)]">
        {label}
      </span>
      <span className={cn("font-mono text-h2", TONE_CLASS[metric.tone ?? "neutral"])}>
        {metric.value}
      </span>
      {metric.delta && (
        <span className={cn("font-mono text-[11px] font-semibold tabular-nums", deltaColor)}>
          {metric.delta}
        </span>
      )}
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
  const { t, locale } = useLocale()

  const gameListId  = useId()
  const calListId   = useId()

  const gameId      = useSelectedGame((s) => s.gameId)
  const setGameId   = useSelectedGame((s) => s.setGameId)
  const selectedGame = GAMES.find((g) => g.id === gameId) ?? GAMES[0]
  const [dateRange, setDateRange]           = useState<DateRange>({
    from: new Date(2026, 2, 1),   // Mar 1
    to:   new Date(2026, 2, 31),  // Mar 31
  })
  const [gameOpen, setGameOpen]             = useState(false)
  const [calendarOpen, setCalendarOpen]     = useState(false)

  // Derive cohort month from dateRange for metrics lookup
  const selectedCohort = dateRange.from
    ? `${dateRange.from.getFullYear()}-${String(dateRange.from.getMonth() + 1).padStart(2, "0")}`
    : "2026-03"
  const metrics = buildMetrics(selectedGame.id, selectedCohort)

  // Keyboard active-index for game dropdown
  const [gameActiveIdx, setGameActiveIdx] = useState(-1)

  // Refs for trigger buttons and container wrappers
  const gameRef         = useRef<HTMLDivElement>(null)
  const calendarRef     = useRef<HTMLDivElement>(null)
  const gameTriggerRef  = useRef<HTMLButtonElement>(null)
  const calTriggerRef   = useRef<HTMLButtonElement>(null)
  const gameItemsRef    = useRef<(HTMLButtonElement | null)[]>([])

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
        setGameId(GAMES[gameActiveIdx].id)
        setGameOpen(false)
        gameTriggerRef.current?.focus()
      }
    } else if (e.key === "Escape") {
      setGameOpen(false)
      gameTriggerRef.current?.focus()
    }
  }

  // Calendar trigger keyboard handler (simplified — DayPicker handles internal nav)
  function handleCalTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setCalendarOpen((o) => !o)
      setGameOpen(false)
    } else if (e.key === "Escape") {
      setCalendarOpen(false)
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
          aria-label="yieldo home"
        >
          <YieldoLogo size="lg" />
        </button>
        <div className="flex items-center gap-1">
          {metrics.map((m) => (
            <MetricCell key={m.labelKey} metric={m} label={t(m.labelKey)} />
          ))}
        </div>
      </div>

      {/* Right: Game + Period — same visual language as MetricCells (no borders) */}
      <div className="flex items-center gap-1">

        {/* ── Game selector (MetricCell style) ── */}
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
              "inline-flex items-baseline gap-1.5 rounded-[var(--radius-inline)] px-2 py-1",
              "transition-colors hover:bg-[var(--bg-3)]",
              gameOpen && "bg-[var(--bg-3)]",
              focusRing,
            )}
          >
            <span className="text-caption uppercase tracking-wider text-[var(--fg-2)]">
              {locale === "ko" ? "게임" : "TITLE"}
            </span>
            <span className="text-body font-medium text-[var(--fg-0)]">{selectedGame.label}</span>
            <ChevronDown className="h-3 w-3 flex-shrink-0 self-center text-[var(--fg-3)]" aria-hidden />
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
                    onClick={() => { setGameId(game.id); setGameOpen(false); gameTriggerRef.current?.focus() }}
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

        {/* ── Period selector (MetricCell style) ── */}
        <div ref={calendarRef} className="relative">
          <button
            ref={calTriggerRef}
            type="button"
            onClick={() => { setCalendarOpen((o) => !o); setGameOpen(false) }}
            onKeyDown={handleCalTriggerKeyDown}
            aria-haspopup="dialog"
            aria-expanded={calendarOpen}
            aria-controls={calListId}
            className={cn(
              "inline-flex items-baseline gap-1.5 rounded-[var(--radius-inline)] px-2 py-1",
              "transition-colors hover:bg-[var(--bg-3)]",
              calendarOpen && "bg-[var(--bg-3)]",
              focusRing,
            )}
          >
            <span className="text-caption uppercase tracking-wider text-[var(--fg-2)]">
              {locale === "ko" ? "기간" : "PERIOD"}
            </span>
            <span className="font-mono text-body font-medium text-[var(--fg-0)] whitespace-nowrap">
              {dateRange.from && dateRange.to
                ? locale === "ko"
                  ? `${dateRange.from.getMonth() + 1}/${dateRange.from.getDate()}–${dateRange.to.getMonth() + 1}/${dateRange.to.getDate()}`
                  : `${MONTH_LABELS_EN[dateRange.from.getMonth()]} ${dateRange.from.getDate()}–${dateRange.to.getDate()}`
                : formatCohort(selectedCohort, locale)}
            </span>
            <ChevronDown className="h-3 w-3 flex-shrink-0 self-center text-[var(--fg-3)]" aria-hidden />
          </button>

          {/* Date range picker popover */}
          <AnimatePresence>
            {calendarOpen && (
              <motion.div
                id={calListId}
                aria-label="Select date range"
                className={cn(
                  "absolute right-0 top-full z-50 mt-2",
                  "rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)]",
                  "shadow-[0_8px_32px_rgba(0,0,0,0.10)] p-4",
                )}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={dropdownTransition}
              >
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range) setDateRange(range)
                    if (range?.from && range?.to) {
                      setCalendarOpen(false)
                      calTriggerRef.current?.focus()
                    }
                  }}
                  locale={locale === "ko" ? koLocale : enUS}
                  defaultMonth={dateRange.from ?? new Date(2026, 2)}
                  numberOfMonths={1}
                  showOutsideDays
                  style={{ ["--rdp-accent-color" as string]: "var(--brand)", ["--rdp-range_middle-background-color" as string]: "var(--brand-tint)" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
