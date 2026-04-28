"use client"

import { useState, useMemo, useRef, useEffect, useId, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"
import { useLocale } from "@/shared/i18n"
import type { RevenueForecastPoint, RevenueForecastMeta, ExperimentForkScenario } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { REVENUE_FORECAST_COLORS } from "@/shared/config/chart-colors"
import { CHART_TYPO } from "@/shared/config/chart-typography"
import { cn } from "@/shared/lib"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

// Dropdown animation — mirrors runway-status-bar patterns for app-wide consistency
const dropdownVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1,    y: 0  },
}
const dropdownTransition = { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const }

type RevenueForecastProps = {
  data: RevenueForecastPoint[]
  meta: RevenueForecastMeta
  title?: string
  expanded?: boolean
  onToggle?: () => void
}

const C = REVENUE_FORECAST_COLORS

// Simple {placeholder} interpolator — the i18n dictionary ships raw strings.
function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
}

// --- Control strip subcomponent ---
// Small color anchor for chip triggers. Three variants echo the chart layers:
//   solid        — posterior (always on)
//   dashed       — prior/experiment OFF state (outline only, dim)
//   dashed-filled — prior/experiment ON state (fill + dashed border)

function Swatch({ color, variant, dim }: { color: string; variant: "solid" | "dashed" | "dashed-filled"; dim?: boolean }) {
  const isDashed = variant !== "solid"
  const fill = variant === "solid" ? color : variant === "dashed-filled" ? `${color}26` /* ~15% */ : "transparent"
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-3 self-center rounded-[2px]"
      style={{
        background: fill,
        border: isDashed ? `1px dashed ${color}` : `1px solid ${color}`,
        opacity: dim ? 0.5 : 1,
      }}
    />
  )
}

// --- Tooltip subcomponents ---
// Each distribution (Posterior / Prior / Experiment) renders as a separate
// TooltipGroup with a left color bar so readers can distinguish at a glance.

function TooltipGroup({ color, title, children }: { color: string; title: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
      {/* Left color bar — the visual anchor identifying which distribution this group is */}
      <span
        style={{
          width: 3,
          minHeight: 26,
          borderRadius: 2,
          background: color,
          flexShrink: 0,
          marginTop: 2,
          marginBottom: 2,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0A", marginBottom: 2 }}>
          {title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>{children}</div>
      </div>
    </div>
  )
}

function TooltipRow({ label, value, emphasized, muted, accentColor }: { label: string; value: string; emphasized?: boolean; muted?: boolean; accentColor?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", fontSize: 11, lineHeight: 1.55 }}>
      <span style={{ color: muted ? "#9CA3AF" : "#6B7280" }}>{label}</span>
      <span
        style={{
          marginLeft: "auto",
          paddingLeft: 12,
          fontWeight: emphasized ? 600 : 500,
          color: accentColor ?? (muted ? "#9CA3AF" : "#0A0A0A"),
          fontVariantNumeric: CHART_TYPO.tooltipValue.fontVariantNumeric,
          fontFamily: CHART_TYPO.tooltipValue.fontFamily,
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function RevenueForecast({ data, meta, title, expanded: externalExpanded, onToggle: externalToggle }: RevenueForecastProps) {
  const { t, locale } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 260, expanded: externalExpanded, onToggle: externalToggle })

  const [showPrior, setShowPrior] = useState(false)
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null)
  const [expOpen, setExpOpen] = useState(false)

  const expListId = useId()
  const expMenuRef = useRef<HTMLDivElement>(null)
  const expTriggerRef = useRef<HTMLButtonElement>(null)

  const selectedExp: ExperimentForkScenario | null = useMemo(
    () => meta.experiments.find((e) => e.id === selectedExpId) ?? null,
    [meta.experiments, selectedExpId],
  )

  // Close the experiment dropdown on outside click (mirrors runway-status-bar pattern)
  useEffect(() => {
    if (!expOpen) return
    function handleClick(e: MouseEvent) {
      if (expMenuRef.current && !expMenuRef.current.contains(e.target as Node)) {
        setExpOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [expOpen])

  // Merge fork P50 into chart data aligned by index (month order matches).
  const chartData = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        forkP50: selectedExp ? selectedExp.forkP50[i] : null,
      })),
    [data, selectedExp],
  )

  // Dynamic insight — matrix of (prior on/off) × (experiment selected/none)
  const insight = useMemo(() => {
    const last = data[data.length - 1]
    const p50 = last.p50
    const spread = Math.round((last.p90 - last.p10) / 2)
    const priorPct = meta.priorNarrowingPct

    if (showPrior && selectedExp) {
      return interpolate(t("rfc.insight.forkPrior"), { pct: priorPct, expName: selectedExp.name[locale], lift: selectedExp.annualRevenueLift })
    }
    if (selectedExp) {
      return interpolate(t("rfc.insight.fork"), { expName: selectedExp.name[locale], ship: selectedExp.shipMonth, lift: selectedExp.annualRevenueLift })
    }
    if (showPrior) {
      return interpolate(t("rfc.insight.prior"), { pct: priorPct, asOf: meta.asOfDay })
    }
    return interpolate(t("rfc.insight.base"), { asOf: meta.asOfDay, p50, spread, cohorts: meta.cohortCount })
  }, [showPrior, selectedExp, data, meta, t, locale])

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 h-full flex flex-col ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={title || t("chart.revenue")}
        info={t("info.revenueForecast")}
        insight={insight}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />

      {/* Control strip: compact 13px scale with items-center for stable alignment.
          All chips share: 28px height, 6px gap, same label/value type ramp. */}
      <div className="flex flex-wrap items-center gap-1 mb-4">
        {/* As-of meta (read-only) */}
        <div className="inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-inline)] px-2">
          <span className="text-[11px] uppercase tracking-wider text-[var(--fg-2)]">{t("rfc.asOf")}</span>
          <span className="font-mono text-[13px] font-medium text-[var(--fg-0)] tabular-nums leading-none">D{meta.asOfDay}</span>
          <span className="text-[11px] text-[var(--fg-3)]">· {meta.cohortCount} {t("rfc.cohorts")}</span>
        </div>

        <span className="mx-0.5 h-4 w-px bg-[var(--border-default)]" aria-hidden />

        {/* Posterior legend — always visible, static */}
        <div className="inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-inline)] px-2">
          <Swatch color={C.line} variant="solid" />
          <span className="text-[11px] uppercase tracking-wider text-[var(--fg-2)]">{t("rfc.legendPosterior")}</span>
        </div>

        {/* Prior toggle */}
        <button
          type="button"
          onClick={() => setShowPrior((v) => !v)}
          aria-pressed={showPrior}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-inline)] px-2",
            "transition-colors hover:bg-[var(--bg-3)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-1)]",
            showPrior && "bg-[var(--bg-3)]",
          )}
        >
          <Swatch color={C.prior} variant={showPrior ? "dashed-filled" : "dashed"} dim={!showPrior} />
          <span className="text-[11px] uppercase tracking-wider text-[var(--fg-2)]">{t("rfc.showPrior")}</span>
          <span className={cn(
            "text-[13px] font-medium tabular-nums leading-none",
            showPrior ? "text-[var(--fg-0)]" : "text-[var(--fg-3)]",
          )}>
            {showPrior ? t("rfc.showPriorOn") : t("rfc.showPriorOff")}
          </span>
        </button>

        {/* Experiment selector */}
        <div ref={expMenuRef} className="relative">
          <button
            ref={expTriggerRef}
            type="button"
            onClick={() => setExpOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={expOpen}
            aria-controls={expListId}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-inline)] px-2",
              "transition-colors hover:bg-[var(--bg-3)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-1)]",
              expOpen && "bg-[var(--bg-3)]",
            )}
          >
            <Swatch color={C.experiment} variant={selectedExp ? "dashed-filled" : "dashed"} dim={!selectedExp} />
            <span className="text-[11px] uppercase tracking-wider text-[var(--fg-2)]">{t("rfc.experimentLabel")}</span>
            <span className={cn(
              "text-[13px] font-medium tabular-nums leading-none whitespace-nowrap",
              selectedExp ? "text-[var(--fg-0)]" : "text-[var(--fg-3)]",
            )}>
              {selectedExp ? selectedExp.id : t("rfc.noExperiment")}
            </span>
            <ChevronDown className={cn("h-3 w-3 flex-shrink-0 text-[var(--fg-3)] transition-transform", expOpen && "rotate-180")} aria-hidden />
          </button>

          <AnimatePresence>
            {expOpen && (
              <motion.div
                id={expListId}
                role="listbox"
                aria-label={t("rfc.experimentLabel")}
                className={cn(
                  "absolute left-0 top-full z-50 mt-1 min-w-[280px]",
                  "rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)]",
                  "shadow-[0_8px_32px_rgba(0,0,0,0.08)] py-1",
                )}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={dropdownTransition}
              >
                {/* — None — option (13px to match trigger value scale) */}
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedExpId === null}
                  onClick={() => { setSelectedExpId(null); setExpOpen(false); expTriggerRef.current?.focus() }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-1.5 text-[13px]",
                    "transition-colors hover:bg-[var(--bg-3)]",
                  )}
                >
                  <span className={cn(
                    selectedExpId === null ? "text-[var(--fg-0)] font-medium" : "text-[var(--fg-2)]",
                  )}>{t("rfc.noExperiment")}</span>
                  {selectedExpId === null && <Check className="h-3.5 w-3.5 flex-shrink-0 text-[var(--brand)]" aria-hidden />}
                </button>

                {meta.experiments.length > 0 && <div className="my-1 h-px bg-[var(--border-default)]" aria-hidden />}

                {/* Experiment options — 2-line layout. Scale matches trigger:
                    meta row 11px (caption), name 13px/500 (trigger-value equivalent). */}
                {meta.experiments.map((exp) => {
                  const isSelected = exp.id === selectedExpId
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => { setSelectedExpId(exp.id); setExpOpen(false); expTriggerRef.current?.focus() }}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 px-3 py-2 text-left",
                        "transition-colors hover:bg-[var(--bg-3)]",
                        isSelected && "bg-[var(--bg-3)]",
                      )}
                    >
                      <span className="flex min-w-0 flex-col items-start gap-0.5">
                        <span className="flex items-center gap-2 leading-none">
                          <span className={cn(
                            "font-mono text-[11px] tabular-nums",
                            isSelected ? "text-[var(--brand)]" : "text-[var(--fg-2)]",
                          )}>{exp.id}</span>
                          <span
                            className="font-mono text-[11px] font-medium tabular-nums"
                            style={{ color: C.experiment }}
                          >+${exp.annualRevenueLift}K</span>
                          <span className="text-[11px] text-[var(--fg-3)]">· ship {exp.shipMonth}</span>
                        </span>
                        <span className={cn(
                          "text-[13px] leading-snug",
                          isSelected ? "text-[var(--fg-0)] font-medium" : "text-[var(--fg-1)]",
                        )}>{exp.name[locale]}</span>
                      </span>
                      {isSelected && <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--brand)]" aria-hidden />}
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {/* Posterior (사후 확률) — green gradient band */}
              <linearGradient id="rfcPostBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.line} stopOpacity={0.18} />
                <stop offset="100%" stopColor={C.line} stopOpacity={0.03} />
              </linearGradient>
              {/* Prior (사전 확률) — red hatched pattern */}
              <pattern id="rfcPriorHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <rect width="6" height="6" fill={C.priorFill} />
                <line x1="0" y1="0" x2="0" y2="6" stroke={C.prior} strokeWidth="0.6" strokeOpacity="0.45" />
              </pattern>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ ...CHART_TYPO.axisTick, fill: C.axis }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ ...CHART_TYPO.axisTick, fill: C.axis }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}K`} />
            <Tooltip
              content={
                <ChartTooltip
                  render={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null
                    const row = payload[0].payload as RevenueForecastPoint & { forkP50: number | null }
                    const postSpread = row.p90 - row.p10
                    const priorSpread = row.priorP90 - row.priorP10
                    const forkLift = selectedExp && row.forkP50 != null ? row.forkP50 - row.p50 : null

                    return (
                      <div style={{ minWidth: 240 }}>
                        {label != null && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0A", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #F1F1ED" }}>
                            {label}
                          </div>
                        )}

                        {/* Group 1 — Posterior (사후 확률) */}
                        <TooltipGroup color={C.line} title={t("rfc.legendPosterior")}>
                          <TooltipRow label={t("rfc.tipP50")} value={`$${row.p50}K`} emphasized />
                          <TooltipRow label={t("rfc.tipRange")} value={`$${row.p10}K – $${row.p90}K`} />
                          <TooltipRow label={t("rfc.tipSpread")} value={`±$${Math.round(postSpread / 2)}K`} muted />
                        </TooltipGroup>

                        {/* Group 2 — Prior (사전 확률), conditional */}
                        {showPrior && (
                          <TooltipGroup color={C.prior} title={t("rfc.legendPrior")}>
                            <TooltipRow label={t("rfc.tipP50")} value={`$${row.priorP50}K`} />
                            <TooltipRow label={t("rfc.tipRange")} value={`$${row.priorP10}K – $${row.priorP90}K`} />
                            <TooltipRow label={t("rfc.tipSpread")} value={`±$${Math.round(priorSpread / 2)}K`} muted />
                          </TooltipGroup>
                        )}

                        {/* Group 3 — Experiment fork, conditional */}
                        {selectedExp && row.forkP50 != null && (
                          <TooltipGroup color={C.experiment} title={`${selectedExp.id} · ${selectedExp.name[locale]}`}>
                            <TooltipRow label={t("rfc.tipShipP50")} value={`$${row.forkP50}K`} emphasized />
                            {forkLift !== null && (
                              <TooltipRow
                                label={t("rfc.tipLift")}
                                value={`${forkLift >= 0 ? "+" : ""}$${forkLift}K`}
                                accentColor={forkLift >= 0 ? C.experiment : undefined}
                              />
                            )}
                          </TooltipGroup>
                        )}
                      </div>
                    )
                  }}
                />
              }
            />

            {/* Layer 1: Prior band (conditional, bottom) — wide dashed gray */}
            {showPrior && (
              <>
                <Area
                  type="linear"
                  dataKey="priorP90"
                  name={t("rfc.legendPrior")}
                  stroke="none"
                  fill="url(#rfcPriorHatch)"
                  isAnimationActive={false}
                  legendType="none"
                />
                <Area type="linear" dataKey="priorP10" stroke="none" fill="#0E1320" /* mask = chart panel bg-1 (dark) so lower band cuts cleanly on terminal canvas */ isAnimationActive={false} legendType="none" />
                <Line type="linear" dataKey="priorP50" stroke={C.priorLine} strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} legendType="none" />
              </>
            )}

            {/* Layer 2: Posterior band (always, middle) — solid blue */}
            <Area type="linear" dataKey="p90" name={t("rfc.legendPosterior")} stroke="none" fill="url(#rfcPostBand)" animationBegin={200} animationDuration={1200} animationEasing="ease-out" />
            <Area type="linear" dataKey="p10" stroke="none" fill="#0E1320" /* mask = bg-1; cuts the lower fan band so only p10..p90 region paints */ animationBegin={200} animationDuration={1200} animationEasing="ease-out" />

            {/* Layer 3: Posterior P10/P90 outlines */}
            <Line type="linear" dataKey="p90" stroke={C.line} strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.32} dot={false} animationBegin={400} animationDuration={1000} animationEasing="ease-out" legendType="none" />
            <Line type="linear" dataKey="p10" stroke={C.line} strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.32} dot={false} animationBegin={400} animationDuration={1000} animationEasing="ease-out" legendType="none" />

            {/* Layer 4: Posterior P50 (top, always) — solid blue 2px */}
            <Line type="linear" dataKey="p50" stroke={C.line} strokeWidth={2.25} dot={false} animationBegin={400} animationDuration={1000} animationEasing="ease-out" />

            {/* Layer 5: Experiment fork (conditional, topmost line) — green dashed */}
            {selectedExp && (
              <Line
                type="linear"
                dataKey="forkP50"
                name={t("rfc.legendFork")}
                stroke={C.experiment}
                strokeWidth={2.25}
                strokeDasharray="5 3"
                dot={{ r: 3, fill: C.experiment, strokeWidth: 0 }}
                connectNulls={false}
                animationBegin={600}
                animationDuration={900}
                animationEasing="ease-out"
              />
            )}

            {/* Layer 6: Ship-point vertical marker */}
            {selectedExp && (
              <ReferenceLine
                x={selectedExp.shipMonth}
                stroke={C.forkMark}
                strokeDasharray="2 3"
                strokeWidth={1}
                label={{
                  value: `${selectedExp.id} ${t("rfc.shipMarker")}`,
                  position: "insideTopLeft",
                  ...CHART_TYPO.axisLabel,
                  fill: C.forkMark,
                  offset: 8,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
