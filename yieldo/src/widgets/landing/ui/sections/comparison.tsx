"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"

const EASE = [0.16, 1, 0.3, 1] as const
const VIEWPORT = { once: true, margin: "-80px" } as const

const headingVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: EASE, delay: i * 0.08 },
  }),
}

const competitors = [
  {
    category: "Analytics",
    toolTypeEn: "Dashboard",
    toolTypeKo: "대시보드",
    descKey: "landing.v2.compare.analytics" as const,
  },
  {
    category: "Experimentation",
    toolTypeEn: "Testing",
    toolTypeKo: "테스팅",
    descKey: "landing.v2.compare.experimentation" as const,
  },
  {
    category: "Finance",
    toolTypeEn: "Reporting",
    toolTypeKo: "리포팅",
    descKey: "landing.v2.compare.finance" as const,
  },
] as const

export function ComparisonSection() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-1)] py-32 lg:py-40"
      aria-label="Category — Built for decisions"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading block */}
        <motion.div
          variants={headingVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-4">
            Category
          </p>
          <h2
            className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] text-[var(--fg-0)] mb-6"
            style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {t("landing.v2.compare.headline")}
          </h2>
          <p
            className={`text-lg text-[var(--fg-2)] max-w-2xl mx-auto ${locale === "ko" ? "font-medium" : "font-normal"}`}
            style={{ wordBreak: "keep-all" }}
          >
            {t("landing.v2.compare.subhead")}
          </p>
        </motion.div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Competitor cards */}
          {competitors.map((c, i) => (
            <motion.div
              key={c.category}
              custom={i}
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="p-7 bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[var(--radius-card)]"
            >
              <p className="text-xs uppercase tracking-wide text-[var(--fg-3)]">
                {c.category}
              </p>
              <p className="text-base font-semibold text-[var(--fg-0)] mt-3">
                {locale === "ko" ? c.toolTypeKo : c.toolTypeEn}
              </p>
              <p
                className={`text-sm text-[var(--fg-2)] mt-3 leading-relaxed ${locale === "ko" ? "font-medium" : "font-normal"}`}
                style={{ wordBreak: "keep-all" }}
              >
                {t(c.descKey)}
              </p>
            </motion.div>
          ))}

          {/* yieldo card — visually distinguished */}
          <motion.div
            custom={competitors.length + 0.05}
            variants={cardVariant}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="p-7 bg-[var(--bg-1)] border border-[var(--brand)] rounded-[var(--radius-card)]"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--brand)]">
              yieldo
            </p>
            <p className="text-base font-semibold text-[var(--fg-0)] mt-3">
              Decision Layer
            </p>
            <p
              className="text-sm text-[var(--fg-1)] mt-3 leading-relaxed font-medium"
              style={{ wordBreak: "keep-all" }}
            >
              {t("landing.v2.compare.yieldo")}
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
