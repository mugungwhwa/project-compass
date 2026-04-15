"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"
import { RevenueVsInvest } from "@/widgets/charts/ui/revenue-vs-invest"
import { RetentionCurve } from "@/widgets/charts/ui/retention-curve"
import { RevenueForecast } from "@/widgets/charts/ui/revenue-forecast"
import {
  FIXTURE_REVENUE_VS_INVEST,
  FIXTURE_RETENTION_DATA,
  FIXTURE_ASYMPTOTIC_DAY,
  FIXTURE_REVENUE_FORECAST,
  FIXTURE_REVENUE_FORECAST_META,
} from "../_shared/widget-fixtures"

const EASE = [0.16, 1, 0.3, 1] as const

const textVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

const widgetVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay },
  }),
}

const VIEWPORT = { once: true, margin: "-80px" } as const

// ─── Chart Story A — Revenue vs Investment (light bg-2) ─────────────────────
function ChartStoryA() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-2)] py-32 lg:py-40"
      aria-label="Evidence — Revenue vs Investment"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Text above widget */}
        <motion.div
          variants={textVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="max-w-3xl mb-14 mx-auto"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-4">
            Evidence
          </p>
          <h2
            className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] text-[var(--fg-0)] mb-6"
            style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {t("landing.v2.chart1.headline")}
          </h2>
          <p
            className={`text-lg md:text-xl leading-relaxed text-[var(--fg-1)] mb-4 ${locale === "ko" ? "font-medium" : "font-normal"}`}
            style={{ wordBreak: "keep-all" }}
          >
            {t("landing.v2.chart1.description")}
          </p>
          <p className="text-sm font-mono text-[var(--fg-1)]">
            {t("landing.v2.chart1.callout")}
          </p>
        </motion.div>

        {/* RevenueVsInvest — real dashboard widget at natural size */}
        <motion.div
          custom={0.1}
          variants={widgetVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="w-full max-w-[1100px] mx-auto"
          aria-hidden="true"
          style={{ pointerEvents: "none" }}
        >
          <div className="overflow-x-auto">
            <div className="min-w-[600px]" style={{ height: 420 }}>
              <RevenueVsInvest data={FIXTURE_REVENUE_VS_INVEST} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Chart Story B — Retention Forecast (dark band) ─────────────────────────
function ChartStoryB() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[#0A0E14] py-32 lg:py-40"
      aria-label="Evidence — Retention Forecast"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Text above widget */}
        <motion.div
          variants={textVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="max-w-3xl mb-14 mx-auto"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500 mb-4">
            Evidence
          </p>
          <h2
            className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] text-white mb-6"
            style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {t("landing.v2.chart2.headline")}
          </h2>
          <p
            className={`text-lg md:text-xl leading-relaxed text-zinc-300 mb-4 ${locale === "ko" ? "font-medium" : "font-normal"}`}
            style={{ wordBreak: "keep-all" }}
          >
            {t("landing.v2.chart2.description")}
          </p>
          <p className="text-sm font-mono text-[var(--signal-positive)]">
            {t("landing.v2.chart2.callout")}
          </p>
        </motion.div>

        {/* RetentionCurve — real dashboard widget at natural size */}
        <motion.div
          custom={0.1}
          variants={widgetVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="w-full max-w-[1100px] mx-auto"
          aria-hidden="true"
          style={{ pointerEvents: "none" }}
        >
          <div className="overflow-x-auto">
            <div className="min-w-[600px]" style={{ height: 440 }}>
              <RetentionCurve
                data={FIXTURE_RETENTION_DATA}
                asymptoticDay={FIXTURE_ASYMPTOTIC_DAY}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Chart Story C — Revenue Forecast (light bg-1) ──────────────────────────
function ChartStoryC() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-1)] py-32 lg:py-40"
      aria-label="Evidence — Revenue Forecast"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Text above widget */}
        <motion.div
          variants={textVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="max-w-3xl mb-14 mx-auto"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-4">
            Evidence
          </p>
          <h2
            className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] text-[var(--fg-0)] mb-6"
            style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {t("landing.v2.chart3.headline")}
          </h2>
          <p
            className={`text-lg md:text-xl leading-relaxed text-[var(--fg-1)] mb-4 ${locale === "ko" ? "font-medium" : "font-normal"}`}
            style={{ wordBreak: "keep-all" }}
          >
            {t("landing.v2.chart3.description")}
          </p>
          <p className="text-sm font-mono text-[var(--fg-1)]">
            {t("landing.v2.chart3.callout")}
          </p>
        </motion.div>

        {/* RevenueForecast — real dashboard widget at natural size */}
        <motion.div
          custom={0.1}
          variants={widgetVariant}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="w-full max-w-[1100px] mx-auto"
          aria-hidden="true"
          style={{ pointerEvents: "none" }}
        >
          <div className="overflow-x-auto">
            <div className="min-w-[600px]" style={{ height: 420 }}>
              <RevenueForecast
                data={FIXTURE_REVENUE_FORECAST}
                meta={FIXTURE_REVENUE_FORECAST_META}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Public export: all three stories as one unit ────────────────────────────
export function ChartStoriesSection() {
  return (
    <>
      <ChartStoryA />
      <ChartStoryB />
      <ChartStoryC />
    </>
  )
}
