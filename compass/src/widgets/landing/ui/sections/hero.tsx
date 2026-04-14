"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"
import { Eyebrow } from "../_shared/eyebrow"
import { SignalCrop } from "../dashboard-preview/signal-crop"

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

export function HeroV2() {
  const { t, locale } = useLocale()

  return (
    <section className="bg-[var(--bg-0)] min-h-[92vh] flex flex-col items-center justify-center pt-20 pb-16 px-6">
      <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto">
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
          className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-[-0.03em] text-[var(--fg-0)] [word-break:keep-all] [overflow-wrap:break-word]"
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
          className={`text-base md:text-lg leading-relaxed text-[var(--fg-1)] max-w-2xl mt-4 [word-break:keep-all] ${
            locale === "ko" ? "font-medium" : "font-normal"
          }`}
        >
          {t("landing.v2.hero.subheading")}
          {locale === "ko" && (
            <>
              <br className="hidden md:block" />
            </>
          )}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.32 }}
          className="mt-8"
        >
          <a
            href="#demo"
            className="inline-flex items-center h-11 px-7 bg-[var(--brand)] text-white text-sm font-semibold rounded-[var(--radius-card)] hover:opacity-90 transition-opacity"
          >
            {t("landing.v2.cta.primaryButton")}
          </a>
        </motion.div>

        {/* Aux pills */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.42 }}
          className="flex flex-wrap justify-center gap-3 mt-4"
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

        {/* SignalCrop preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: EASE_OUT_QUART,
            delay: 0.5,
          }}
          className="mt-16 w-full"
        >
          <div className="mx-auto max-w-4xl md:max-w-3xl">
            <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] overflow-hidden shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]">
              <div className="overflow-x-auto">
                <SignalCrop />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
