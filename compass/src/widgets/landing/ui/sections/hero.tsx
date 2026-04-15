"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"
import { Eyebrow } from "../_shared/eyebrow"
import { HeroVerdict } from "@/widgets/dashboard/ui/hero-verdict"
import {
  FIXTURE_SIGNAL,
} from "../_shared/widget-fixtures"

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

export function HeroV2() {
  const { t, locale } = useLocale()

  return (
    <section className="bg-[var(--bg-0)] min-h-[92vh] flex flex-col items-center justify-center pt-20 pb-16 px-6">
      <div className="flex flex-col items-center text-center w-full max-w-5xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0 }}
        >
          <Eyebrow label="Decision Layer" />
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-[-0.03em] text-[var(--fg-0)] [word-break:keep-all] [overflow-wrap:break-word]"
        >
          {t("landing.v2.hero.headlineLine1")}
          <br />
          {t("landing.v2.hero.headlineLine2")}
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
          className={`text-lg md:text-xl leading-relaxed text-[var(--fg-1)] max-w-2xl mt-6 [word-break:keep-all] ${
            locale === "ko" ? "font-medium" : "font-normal"
          }`}
        >
          {t("landing.v2.hero.subheading")}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.32 }}
          className="mt-10"
        >
          <a
            href="#demo"
            className="inline-flex items-center h-12 px-8 bg-[var(--brand)] text-white text-sm font-semibold rounded-[var(--radius-card)] hover:opacity-90 transition-opacity"
          >
            {t("landing.v2.cta.primaryButton")}
          </a>
        </motion.div>

        {/* Aux pills */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.42 }}
          className="flex flex-wrap justify-center gap-3 mt-5"
        >
          {(
            [
              t("landing.v2.hero.point1"),
              t("landing.v2.hero.point2"),
              t("landing.v2.hero.point3"),
            ] as string[]
          ).map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-1)] text-xs text-[var(--fg-2)]"
            >
              {label}
            </span>
          ))}
        </motion.div>

        {/* HeroVerdict — real dashboard widget at natural size */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.65,
            ease: EASE_OUT_QUART,
            delay: 0.52,
          }}
          className="mt-20 w-full max-w-[1100px] mx-auto"
          aria-hidden="true"
        >
          <div
            className="overflow-x-auto [&_.sticky]:static! [&_.sticky]:z-auto! [&_.sticky]:mb-0!"
            style={{ pointerEvents: "none" }}
          >
            <div className="min-w-[600px]">
              <HeroVerdict
                status={FIXTURE_SIGNAL.status}
                confidence={FIXTURE_SIGNAL.confidence}
                factors={FIXTURE_SIGNAL.factors}
                payback={FIXTURE_SIGNAL.payback}
                nextAction={FIXTURE_SIGNAL.nextAction}
                reason={FIXTURE_SIGNAL.reason}
                impact={FIXTURE_SIGNAL.impact}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
