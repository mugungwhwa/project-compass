"use client"

import { useEffect, useState } from "react"
import { Sparkles, ArrowRight, Zap, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocale } from "@/shared/i18n"

const STORAGE_KEY = "yieldo.copilot-strip.collapsed"

/**
 * YieldoCopilotStrip — AI Copilot insight strip with fold/unfold (v0.2).
 * --------------------------------------------------------------------------
 * Sits at the top of the dashboard executive overview as an "what should we
 * do next" prompt.  Locale-aware sample content (mockup, no LLM).
 *
 * v0.2 (2026-04-28): collapse/expand toggle persisted to localStorage so
 * operator preference sticks across reloads.  Collapsed state shows a thin
 * 36px bar with the LIVE indicator + headline so the briefing is still
 * scannable; expand button restores the full strip.
 *
 * v0 deviated from spec §5.3 (right-side 320px panel) → top horizontal
 * strip; v0.2 reintroduces the spec's "collapsible" affordance.
 *
 * Reference: yieldo Design Guidelines v1.0 §4.4 (AI Copilot panel).
 */
export function YieldoCopilotStrip() {
  const { locale } = useLocale()
  const isKo = locale === "ko"

  // Hydrate from localStorage (default = expanded).  SSR-safe: useEffect runs
  // only client-side; until then we render expanded which matches SSR HTML.
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === "1") setCollapsed(true)
    } catch {
      /* localStorage unavailable — fall back to default expanded */
    }
  }, [])

  function toggle() {
    setCollapsed((c) => {
      const next = !c
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
      } catch {
        /* swallow */
      }
      return next
    })
  }

  const headline = isKo
    ? "Match-3 Saga 페이백이 +5d 늦춰졌습니다 — Facebook US CPI가 12% 상승한 것이 주요 원인입니다."
    : "Match-3 Saga payback drifted +5d — Facebook US CPI is up 12%, the dominant driver."

  return (
    <div className="relative mb-6 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] overflow-hidden">
      {/* Yellow accent rail on the left edge — terminal "active panel" marker */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--accent-yield)]" />

      {/* Collapsed bar — thin always-visible row with LIVE + truncated headline */}
      {collapsed && (
        <button
          type="button"
          onClick={toggle}
          className="flex w-full items-center gap-3 pl-5 pr-3 py-2 text-left transition-colors hover:bg-[var(--bg-2)]"
          aria-expanded={false}
          aria-label={isKo ? "Copilot 인사이트 펼치기" : "Expand Copilot insight"}
        >
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-[var(--accent-yield)]" aria-hidden />
          <span className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-do)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--phosphor-green)]">
            <span className="yieldo-pulse-dot" style={{ width: 6, height: 6 }} />
            {isKo ? "실시간" : "LIVE"}
          </span>
          <span className="flex-1 truncate text-xs text-[var(--fg-1)] font-medium">
            {headline}
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-[var(--fg-2)]" aria-hidden />
        </button>
      )}

      {/* Expanded full strip */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-4 px-5 py-4 pl-6">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-[var(--brand-tint)]">
                <Sparkles className="h-4 w-4 text-[var(--accent-yield)]" aria-hidden />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="yieldo-eyebrow">
                    {isKo ? "YIELDO COPILOT · 오늘의 신호" : "YIELDO COPILOT · TODAY"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-do)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--phosphor-green)]">
                    <span className="yieldo-pulse-dot" style={{ width: 6, height: 6 }} />
                    {isKo ? "실시간" : "LIVE"}
                  </span>
                </div>

                <p className="text-[15px] font-semibold text-[var(--fg-0)] leading-snug">
                  {headline}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-inline)] bg-[var(--bg-2)] px-2 py-1 text-xs font-mono text-[var(--fg-1)]">
                    CPI ↑ <span className="yieldo-phosphor-danger">+12%</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-inline)] bg-[var(--bg-2)] px-2 py-1 text-xs font-mono text-[var(--fg-1)]">
                    D7 ret ↓ <span className="yieldo-phosphor-danger">-0.8pp</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-inline)] bg-[var(--bg-2)] px-2 py-1 text-xs font-mono text-[var(--fg-1)]">
                    ARPDAU ↑ <span className="yieldo-phosphor-do">+3%</span>
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-card)] bg-[var(--accent-yield)] px-3 py-1.5 text-xs font-semibold text-[var(--bg-0)] hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    <Zap className="h-3 w-3" aria-hidden />
                    {isKo ? "FB → TikTok 30% 이전 시뮬레이션" : "Simulate shift FB→TikTok 30%"}
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)] transition-colors"
                  >
                    {isKo ? "상세 분해" : "View breakdown"}
                  </button>
                </div>
              </div>

              {/* Collapse button — top-right */}
              <button
                type="button"
                onClick={toggle}
                aria-expanded={true}
                aria-label={isKo ? "Copilot 인사이트 접기" : "Collapse Copilot insight"}
                className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-inline)] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]"
              >
                <ChevronUp className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
