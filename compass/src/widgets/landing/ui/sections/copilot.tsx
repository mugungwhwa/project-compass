"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"

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

const breakdown = [
  { metric: "CPI change",         metricKo: "CPI 변화",          value: "+12%",    color: "var(--signal-caution)" },
  { metric: "D7 retention shift", metricKo: "D7 리텐션 변화",    value: "−0.8pp",  color: "var(--signal-risk)" },
  { metric: "ARPDAU change",      metricKo: "ARPDAU 변화",       value: "+3%",     color: "var(--signal-positive)" },
] as const

export function CopilotSection() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-2)] py-32 lg:py-40"
      aria-label="Explainability — Know what changed"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={textVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-4">
            Explainability
          </p>
          <h2
            className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] text-[var(--fg-0)] mb-6"
            style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {t("landing.v2.explain.headline")}
          </h2>
          <p
            className={`text-lg md:text-xl leading-relaxed text-[var(--fg-1)] mb-10 ${locale === "ko" ? "font-medium" : "font-normal"}`}
            style={{ wordBreak: "keep-all" }}
          >
            {t("landing.v2.explain.description")}
          </p>

          {/* Blockquote question */}
          <blockquote className="px-6 py-4 border-l-2 border-[var(--brand)] bg-[var(--brand-tint,oklch(0.97_0.015_250))] rounded-r-[var(--radius-inline)] mb-8">
            <p className="text-base italic text-[var(--fg-1)]">
              &ldquo;{t("landing.v2.explain.blockquote")}&rdquo;
            </p>
          </blockquote>

          {/* Attribution breakdown */}
          <div role="list" className="max-w-sm">
            {breakdown.map((row, i) => (
              <motion.div
                key={row.metric}
                role="listitem"
                custom={i}
                variants={rowVariant}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                className="flex justify-between items-center py-3 border-b border-[var(--border-subtle)]"
              >
                <span
                  className={`text-sm text-[var(--fg-1)] ${locale === "ko" ? "font-medium" : "font-normal"}`}
                >
                  {locale === "ko" ? row.metricKo : row.metric}
                </span>
                <span
                  className="text-sm font-mono font-semibold"
                  style={{ color: `var(${row.color.slice(4, -1)})` }}
                >
                  {row.value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
