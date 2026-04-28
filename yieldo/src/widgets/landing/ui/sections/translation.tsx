"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"
import { PipelineShowcase } from "../showcase"

const EASE = [0.16, 1, 0.3, 1] as const
const VIEWPORT = { once: true, margin: "-80px" } as const

const headingVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

const showcaseVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: 0.15 },
  },
}

const statsVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: EASE, delay: 0.35 },
  },
}

// Static display values — Phase 2 placeholder
const stats = [
  { value: "ΔLTV",    labelEn: "investment value per shipped experiment",    labelKo: "출시된 실험당 투자 가치" },
  { value: "Payback Δ", labelEn: "days recovered per winning test",          labelKo: "성공 테스트당 회수된 일수" },
  { value: "1 Signal",  labelEn: "one decision per experiment cycle",         labelKo: "실험 사이클당 하나의 판단" },
] as const

export function ExperimentTranslationSection() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-0)] py-32 lg:py-40"
      aria-label="Experiment ROI — Experiments move capital"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading block */}
        <motion.div
          variants={headingVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-4">
            Experiment ROI
          </p>
          <h2
            className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] text-[var(--fg-0)] mb-6"
            style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {t("landing.v2.experiment.headline")}
          </h2>
          <p
            className={`text-lg md:text-xl leading-relaxed text-[var(--fg-1)] max-w-2xl mx-auto ${locale === "ko" ? "font-medium" : "font-normal"}`}
            style={{ wordBreak: "keep-all" }}
          >
            {t("landing.v2.experiment.subhead")}
          </p>
        </motion.div>

        {/* Full-width PipelineShowcase */}
        <motion.div
          variants={showcaseVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-16"
        >
          <PipelineShowcase />
        </motion.div>

        {/* 3-stat row */}
        <motion.div
          variants={statsVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid grid-cols-3 gap-6 mt-16"
        >
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <p className="text-4xl font-bold font-mono tabular-nums text-[var(--fg-0)]">
                {s.value}
              </p>
              <p
                className={`text-sm text-[var(--fg-2)] mt-2 ${locale === "ko" ? "font-medium" : "font-normal"}`}
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
