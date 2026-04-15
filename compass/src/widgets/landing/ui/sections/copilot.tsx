"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"

const EASE = [0.16, 1, 0.3, 1] as const
const VIEWPORT = { once: true, margin: "-80px" } as const

const textVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay: 0.2 } },
}

/**
 * Section 7 — Experiment Impact (replaces the former Copilot explainer).
 *
 * Shows a single experiment result translated into investment language:
 * Payback delta, retention delta, ΔLTV/user, capital unlocked, and the
 * recommended next capital decision. Narrative complement to §8
 * (Experiment-to-Investment pipeline) — §7 = one-scene case, §8 = schema.
 */
export function CopilotSection() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-2)] py-32 lg:py-40"
      aria-label="Experiment Impact"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Headline block */}
        <motion.div
          variants={textVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="max-w-3xl mx-auto mb-14 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-4">
            Experiment Impact
          </p>
          <h2
            className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] text-[var(--fg-0)] mb-6"
            style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {t("landing.v2.expImpact.headline")}
          </h2>
          <p
            className={`text-lg md:text-xl leading-relaxed text-[var(--fg-1)] ${locale === "ko" ? "font-medium" : "font-normal"}`}
            style={{ wordBreak: "keep-all" }}
          >
            {t("landing.v2.expImpact.description")}
          </p>
        </motion.div>

        {/* Experiment impact card */}
        <motion.div
          variants={cardVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mx-auto w-full max-w-[960px]"
        >
          <div
            className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] overflow-hidden"
            style={{ boxShadow: "0 12px 40px -12px rgba(0,0,0,0.15)" }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-2)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-inline)] text-[11px] font-mono font-semibold bg-[var(--signal-positive-bg)] text-[var(--signal-positive)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal-positive)]" aria-hidden />
                  EXPERIMENT
                </span>
                <span className={`text-base font-semibold text-[var(--fg-0)] ${locale === "ko" ? "" : "font-display"}`}>
                  {t("landing.v2.expImpact.experimentName")}
                </span>
              </div>
              <span className="text-xs font-mono text-[var(--fg-2)]">
                {t("landing.v2.expImpact.experimentMeta")}
              </span>
            </div>

            {/* Before / After metric grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border-subtle)]">
              <MetricTile
                label={t("landing.v2.expImpact.paybackLabel")}
                before="D47"
                after="D41"
                delta="−6d"
                tone="positive"
              />
              <MetricTile
                label={t("landing.v2.expImpact.retentionLabel")}
                before="5.0%"
                after="5.8%"
                delta="+0.8pp"
                tone="positive"
              />
              <MetricTile
                label={t("landing.v2.expImpact.ltvLabel")}
                before={null}
                after="+$1.42"
                delta={null}
                tone="positive"
              />
              <MetricTile
                label={t("landing.v2.expImpact.capitalLabel")}
                before={null}
                after="+$420K"
                delta={null}
                tone="positive"
              />
            </div>

            {/* Recommendation footer */}
            <div className="flex items-center justify-between px-8 py-5 border-t border-[var(--border-subtle)] bg-[var(--bg-2)]">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)]">
                Recommendation
              </span>
              <span className={`text-base font-semibold text-[var(--fg-0)] ${locale === "ko" ? "" : "font-display"}`}>
                {t("landing.v2.expImpact.recommendation")}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

type MetricTileProps = {
  label: string
  before: string | null
  after: string
  delta: string | null
  tone: "positive" | "negative" | "neutral"
}

function MetricTile({ label, before, after, delta, tone }: MetricTileProps) {
  const toneColor =
    tone === "positive"
      ? "var(--signal-positive)"
      : tone === "negative"
      ? "var(--signal-risk)"
      : "var(--fg-1)"

  return (
    <div className="flex flex-col gap-2 px-6 py-6">
      <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--fg-2)]">
        {label}
      </span>
      {before ? (
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-mono text-[var(--fg-2)] line-through decoration-[var(--fg-3,var(--fg-2))]">
            {before}
          </span>
          <span className="text-xs text-[var(--fg-2)]">→</span>
          <span className="text-xl font-mono font-semibold text-[var(--fg-0)]">
            {after}
          </span>
        </div>
      ) : (
        <span className="text-2xl font-mono font-semibold text-[var(--fg-0)]">
          {after}
        </span>
      )}
      {delta && (
        <span
          className="text-xs font-mono font-semibold"
          style={{ color: toneColor }}
        >
          {delta}
        </span>
      )}
    </div>
  )
}
