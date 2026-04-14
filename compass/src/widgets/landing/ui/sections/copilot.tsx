"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"
import { ActionCrop } from "../dashboard-preview"

const EASE = [0.16, 1, 0.3, 1] as const
const VIEWPORT = { once: true, margin: "-80px" } as const

const textVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

const rowVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE, delay: i * 0.07 },
  }),
}

const previewVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: 0.1 },
  },
}

const breakdown = [
  { metric: "CPI change",         metricKo: "CPI 변화",          value: "+12%",    color: "var(--signal-caution)" },
  { metric: "D7 retention shift", metricKo: "D7 리텐션 변화",    value: "−0.8pp",  color: "var(--signal-risk)" },
  { metric: "ARPDAU change",      metricKo: "ARPDAU 변화",       value: "+3%",     color: "var(--signal-positive)" },
] as const

export function CopilotSection() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-2)] py-12 md:py-16 lg:py-24"
      aria-label="Explainability — Know what changed"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-center">

          {/* Left: text block */}
          <motion.div
            variants={textVariant}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-3">
              Explainability
            </p>
            <h2
              className="font-display text-4xl md:text-3xl text-2xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)] mb-4"
              style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
            >
              {t("landing.v2.explain.headline")}
            </h2>
            <p
              className={`text-lg leading-relaxed text-[var(--fg-1)] mb-8 ${locale === "ko" ? "font-medium" : "font-normal"}`}
              style={{ wordBreak: "keep-all" }}
            >
              {t("landing.v2.explain.description")}
            </p>

            {/* Blockquote question */}
            <blockquote className="px-4 py-3 border-l-2 border-[var(--brand)] bg-[var(--brand-tint,oklch(0.97_0.015_250))] rounded-r-[var(--radius-inline)] mb-6">
              <p className="text-sm italic text-[var(--fg-1)]">
                &ldquo;{t("landing.v2.explain.blockquote")}&rdquo;
              </p>
            </blockquote>

            {/* Attribution breakdown */}
            <div role="list">
              {breakdown.map((row, i) => (
                <motion.div
                  key={row.metric}
                  role="listitem"
                  custom={i}
                  variants={rowVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT}
                  className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]"
                >
                  <span
                    className={`text-sm text-[var(--fg-1)] ${locale === "ko" ? "font-medium" : "font-normal"}`}
                  >
                    {locale === "ko" ? row.metricKo : row.metric}
                  </span>
                  <span
                    className="text-sm font-mono font-medium"
                    style={{ color: `var(${row.color.slice(4, -1)})` }}
                  >
                    {row.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: ActionCrop preview */}
          <motion.div
            variants={previewVariant}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <div className="overflow-x-auto">
              <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] overflow-hidden shadow-[0_2px_12px_0_rgba(0,0,0,0.06)] inline-block">
                <ActionCrop />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
