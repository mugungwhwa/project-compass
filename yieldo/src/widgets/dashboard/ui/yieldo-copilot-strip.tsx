"use client"

import { Sparkles, ArrowRight, Zap } from "lucide-react"
import { useLocale } from "@/shared/i18n"

/**
 * YieldoCopilotStrip — AI Copilot insight strip (mockup, v0).
 * -----------------------------------------------------------
 * Sits at the top of the dashboard executive overview as an always-visible
 * "what should we do next" prompt.  Locale-aware sample content.
 *
 * v0 (2026-04-28): hardcoded sample, no LLM.  Real wiring lives behind
 * the bottom <CopilotCommandBar> / <FloatingAnswerCard>.
 *
 * Reference: yieldo Design Guidelines v1.0 §4.4 (AI Copilot panel).
 */
export function YieldoCopilotStrip() {
  const { locale } = useLocale()

  const isKo = locale === "ko"

  return (
    <div className="relative mb-6 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] overflow-hidden">
      {/* Yellow accent rail on the left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--accent-yield)]" />

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
            {isKo
              ? "Match-3 Saga 페이백이 +5d 늦춰졌습니다 — Facebook US CPI가 12% 상승한 것이 주요 원인입니다."
              : "Match-3 Saga payback drifted +5d — Facebook US CPI is up 12%, the dominant driver."}
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
      </div>
    </div>
  )
}
