"use client"

/*
  CopilotCommandBar — bottom-fixed command bar + floating answer card.
  ----------------------------------------------------------------------
  Replaces the earlier right slide-in panel (2026-04-08 deep interview).
  Pattern: Cursor / Perplexity / Vercel v0 — a persistent bottom input
  bar that, when queried, reveals a floating answer card above it.

  v0 scope (2026-04-08):
    - Bottom bar is always visible at the viewport bottom
    - Input is DISABLED with "coming soon" placeholder
    - ⌘K or clicking the bar toggles a floating answer card
    - The answer card shows ONE hardcoded user question + AI response
    - No backend, no streaming, no LLM
    - Locale aware: ko/en via useLocale() + dictionary keys

  Future (Level 2+): useChat() from ai-sdk will drive a messages[]
  state, the card will stream tokens, and the input will actually send.
  See: docs/Project_yieldo_Design_Migration_Log.md §5

  Source of truth: .omc/specs/2026-04-08-dashboard-shell-refactor.md
*/

import { useEffect } from "react"
import { X, Sparkles, Command, ArrowUp, Zap } from "lucide-react"
import { useCopilot } from "./copilot-store"
import { useLocale } from "@/shared/i18n"
import { cn } from "@/shared/lib"

const CARD_MAX_WIDTH = 640 // px

function FloatingAnswerCard() {
  const { isOpen, close, toggle } = useCopilot()
  const { t, locale } = useLocale()

  // Esc to close
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, close])

  const bullets = [t("copilot.mock.b1"), t("copilot.mock.b2"), t("copilot.mock.b3")]

  return (
    <>
      {/* Backdrop — almost invisible click-to-dismiss */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "fixed inset-0 z-40 bg-[var(--fg-0)]/0 transition-opacity duration-[var(--duration-component)]",
          isOpen ? "pointer-events-auto opacity-[0.03]" : "pointer-events-none opacity-0",
        )}
      />

      {/* Floating card — appears above the command bar */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="yieldo Copilot answer"
        aria-hidden={!isOpen}
        style={{ maxWidth: CARD_MAX_WIDTH }}
        className={cn(
          "fixed bottom-[88px] left-1/2 z-50 w-[calc(100%-3rem)] -translate-x-1/2",
          "rounded-[var(--radius-modal)] border border-[var(--border-default)] bg-[var(--bg-1)]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.06)]",
          "transition-all duration-[var(--duration-component)] ease-[var(--ease-out-quart)]",
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        {/* Header: context + close */}
        <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" aria-hidden />
            <span className="text-caption uppercase tracking-wider text-[var(--fg-2)]">
              {t("copilot.module1Ctx")}
            </span>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-[var(--radius-inline)] p-1 text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* User query */}
        <div className="border-b border-[var(--border-subtle)] px-5 py-4">
          <p className="text-body font-medium text-[var(--fg-0)]">
            {t("copilot.mock.user")}
          </p>
        </div>

        {/* AI response */}
        <div className="flex flex-col gap-3 px-5 py-4">
          <p className="text-body text-[var(--fg-1)]">{t("copilot.mock.intro")}</p>
          <ul className="flex flex-col gap-1.5">
            {bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-body text-[var(--fg-1)]"
              >
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--fg-2)]" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 border-l-2 border-[var(--brand)] pl-3 text-body text-[var(--fg-1)]">
            {t("copilot.mock.followup")}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { en: "Run scenario", ko: "시나리오 실행" },
              { en: "Compare channels", ko: "채널 비교" },
              { en: "Simulate lower CPI", ko: "CPI 하락 시뮬레이션" },
            ].map((btn) => (
              <button
                key={btn.en}
                type="button"
                onClick={toggle}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-inline)] border border-[var(--border-default)] bg-[var(--bg-2)] px-3 py-1.5 text-caption font-medium text-[var(--fg-1)] transition-colors hover:bg-[var(--bg-3)] hover:border-[var(--border-strong)] hover:text-[var(--fg-0)]"
              >
                <Zap className="h-3 w-3 text-[var(--brand)]" aria-hidden />
                {locale === "ko" ? btn.ko : btn.en}
              </button>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-2)] px-5 py-2">
          <p className="text-caption text-[var(--fg-3)]">{t("copilot.footer")}</p>
        </div>
      </div>
    </>
  )
}

export function CopilotCommandBar() {
  const { isOpen, toggle } = useCopilot()
  const { t } = useLocale()

  return (
    <>
      <FloatingAnswerCard />

      {/* Bottom fixed command bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-[var(--border-default)] bg-[var(--bg-1)] px-6 py-3",
        )}
      >
        <div
          style={{ maxWidth: CARD_MAX_WIDTH }}
          className="flex w-full items-center gap-2"
        >
          {/* Trigger icon — clicking opens the floating card */}
          <button
            type="button"
            onClick={toggle}
            aria-label={t("copilot.askYieldo")}
            aria-pressed={isOpen}
            className={cn(
              "inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-card)] border transition-colors",
              isOpen
                ? "border-[var(--brand)] bg-[var(--brand-tint)] text-[var(--brand)]"
                : "border-[var(--border-default)] bg-[var(--bg-1)] text-[var(--fg-2)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]",
            )}
          >
            <Zap className="h-4 w-4" aria-hidden />
          </button>

          {/* Disabled input — enabled in Level 2 */}
          <div
            onClick={toggle}
            className={cn(
              "flex h-9 flex-1 cursor-pointer items-center gap-2 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-2)] px-3",
              "transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-3)]",
            )}
          >
            <input
              type="text"
              disabled
              placeholder={t("copilot.placeholder")}
              className="pointer-events-none flex-1 bg-transparent text-body text-[var(--fg-2)] placeholder:text-[var(--fg-3)] focus:outline-none"
            />
            <span className="inline-flex items-center gap-0.5 rounded-[var(--radius-inline)] border border-[var(--border-default)] bg-[var(--bg-1)] px-1.5 py-0.5 text-caption text-[var(--fg-3)]">
              <Command className="h-3 w-3" aria-hidden />K
            </span>
          </div>

          {/* Send affordance — disabled in v0 */}
          <button
            type="button"
            disabled
            aria-label="Send message"
            className={cn(
              "inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-card)] border",
              "border-[var(--border-default)] bg-[var(--bg-2)] text-[var(--fg-3)]",
              "cursor-not-allowed",
            )}
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </>
  )
}
