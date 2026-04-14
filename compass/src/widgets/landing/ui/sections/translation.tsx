"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"

const EASE = [0.16, 1, 0.3, 1] as const
const VIEWPORT = { once: true, margin: "-80px" } as const

const headingVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

const nodeVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE, delay: i * 0.15 },
  }),
}

const statsVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: EASE, delay: 0.6 },
  },
}

const pipelineNodes = [
  {
    labelKey: "landing.v2.experiment.pipelineStep1" as const,
    value: "D7 retention +3.7pp",
  },
  {
    labelKey: "landing.v2.experiment.pipelineStep2" as const,
    value: "ΔLTV +$0.31",
  },
  {
    labelKey: "landing.v2.experiment.pipelineStep3" as const,
    value: "Payback −5 days",
  },
  {
    labelKey: "landing.v2.experiment.pipelineStep4" as const,
    value: "Scale to 100%",
  },
]

// Static display values — Phase 2 placeholder, replace with dynamic data when customer data available
const stats = [
  { value: "ΔLTV",    labelEn: "investment value per shipped experiment",    labelKo: "출시된 실험당 투자 가치" },
  { value: "Payback Δ", labelEn: "days recovered per winning test",          labelKo: "성공 테스트당 회수된 일수" },
  { value: "1 Signal",  labelEn: "one decision per experiment cycle",         labelKo: "실험 사이클당 하나의 판단" },
] as const

export function ExperimentTranslationSection() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-0)] py-12 md:py-16 lg:py-24"
      aria-label="Experiment ROI — Experiments move capital"
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Heading block */}
        <motion.div
          variants={headingVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-3">
            Experiment ROI
          </p>
          <h2
            className="font-display text-4xl md:text-3xl text-2xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)] mb-4"
            style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {t("landing.v2.experiment.headline")}
          </h2>
          <p
            className={`text-lg leading-relaxed text-[var(--fg-1)] max-w-2xl mx-auto ${locale === "ko" ? "font-medium" : "font-normal"}`}
            style={{ wordBreak: "keep-all" }}
          >
            {t("landing.v2.experiment.subhead")}
          </p>
        </motion.div>

        {/* Pipeline diagram */}
        <div
          className="mt-14 flex flex-col md:flex-row items-center justify-center gap-0 flex-wrap"
          role="list"
          aria-label="Experiment to investment pipeline"
        >
          {pipelineNodes.map((node, i) => (
            <div key={node.labelKey} className="flex flex-col md:flex-row items-center" role="listitem">
              <motion.div
                custom={i}
                variants={nodeVariant}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                className="px-5 py-3 bg-[var(--bg-1)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] text-center min-w-[130px]"
              >
                <p className="text-xs text-[var(--fg-2)] uppercase tracking-wide">
                  {t(node.labelKey)}
                </p>
                <p className="text-sm font-semibold text-[var(--fg-0)] mt-1 font-mono">
                  {node.value}
                </p>
              </motion.div>

              {/* Arrow — hidden on mobile, shown on md+ */}
              {i < pipelineNodes.length - 1 && (
                <span className="hidden md:block text-xl text-[var(--fg-3)] mx-3 select-none" aria-hidden="true">
                  →
                </span>
              )}

              {/* Mobile vertical connector */}
              {i < pipelineNodes.length - 1 && (
                <span className="block md:hidden w-0.5 h-6 bg-[var(--border-subtle)] my-1" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        {/* 3-stat row */}
        <motion.div
          variants={statsVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid grid-cols-3 gap-6 mt-12"
        >
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <p className="text-4xl font-bold font-mono tabular-nums text-[var(--fg-0)]">
                {s.value}
              </p>
              <p
                className={`text-sm text-[var(--fg-2)] mt-1 ${locale === "ko" ? "font-medium" : "font-normal"}`}
                style={{ wordBreak: "keep-all" }}
              >
                {locale === "ko" ? s.labelKo : s.labelEn}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
