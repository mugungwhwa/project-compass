"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"
import {
  RevenueVsInvestmentCrop,
  RetentionFanCrop,
  RevenueForecastCrop,
} from "../dashboard-preview"

const EASE = [0.16, 1, 0.3, 1] as const

const textVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

const previewVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay },
  }),
}

const VIEWPORT = { once: true, margin: "-80px" } as const

// ─── Shared framing wrapper ────────────────────────────────────────────────
function CropFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] shadow-[0_2px_12px_0_rgba(0,0,0,0.06)] inline-block">
        {children}
      </div>
    </div>
  )
}

// ─── Chart Story A — Revenue vs Investment (text left, preview right) ──────
function ChartStoryA() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-2)] py-12 md:py-16 lg:py-24"
      aria-label="Evidence — Revenue vs Investment"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text col */}
          <motion.div
            variants={textVariant}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-3">
              Evidence
            </p>
            <h2
              className="font-display text-4xl md:text-3xl text-2xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)] mb-4"
              style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
            >
              {t("landing.v2.chart1.headline")}
            </h2>
            <p
              className={`text-lg leading-relaxed text-[var(--fg-1)] mb-6 ${locale === "ko" ? "font-medium" : "font-normal"}`}
              style={{ wordBreak: "keep-all" }}
            >
              {t("landing.v2.chart1.description")}
            </p>
            <p className="text-sm font-mono text-[var(--fg-1)]">
              {t("landing.v2.chart1.callout")}
            </p>
          </motion.div>

          {/* Preview col */}
          <motion.div
            custom={0.12}
            variants={previewVariant}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <CropFrame>
              <RevenueVsInvestmentCrop />
            </CropFrame>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Chart Story B — Retention Forecast (preview left, text right) ─────────
function ChartStoryB() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-0)] py-12 md:py-16 lg:py-24"
      aria-label="Evidence — Retention Forecast"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Preview col (left on lg) */}
          <motion.div
            custom={0.12}
            variants={previewVariant}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="order-2 lg:order-1"
          >
            <CropFrame>
              <RetentionFanCrop />
            </CropFrame>
          </motion.div>

          {/* Text col (right on lg) */}
          <motion.div
            variants={textVariant}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="order-1 lg:order-2"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-3">
              Evidence
            </p>
            <h2
              className="font-display text-4xl md:text-3xl text-2xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)] mb-4"
              style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
            >
              {t("landing.v2.chart2.headline")}
            </h2>
            <p
              className={`text-lg leading-relaxed text-[var(--fg-1)] mb-6 ${locale === "ko" ? "font-medium" : "font-normal"}`}
              style={{ wordBreak: "keep-all" }}
            >
              {t("landing.v2.chart2.description")}
            </p>
            <p className="text-sm font-mono text-[var(--signal-positive)]">
              {t("landing.v2.chart2.callout")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Chart Story C — Revenue Forecast (text left, preview right) ──────────
function ChartStoryC() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-1)] py-12 md:py-16 lg:py-24"
      aria-label="Evidence — Revenue Forecast"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text col */}
          <motion.div
            variants={textVariant}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-3">
              Evidence
            </p>
            <h2
              className="font-display text-4xl md:text-3xl text-2xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)] mb-4"
              style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
            >
              {t("landing.v2.chart3.headline")}
            </h2>
            <p
              className={`text-lg leading-relaxed text-[var(--fg-1)] mb-6 ${locale === "ko" ? "font-medium" : "font-normal"}`}
              style={{ wordBreak: "keep-all" }}
            >
              {t("landing.v2.chart3.description")}
            </p>
            <p className="text-sm font-mono text-[var(--fg-1)]">
              {t("landing.v2.chart3.callout")}
            </p>
          </motion.div>

          {/* Preview col */}
          <motion.div
            custom={0.12}
            variants={previewVariant}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <CropFrame>
              <RevenueForecastCrop />
            </CropFrame>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Public export: all three stories as one unit ─────────────────────────
export function ChartStoriesSection() {
  return (
    <>
      <ChartStoryA />
      <ChartStoryB />
      <ChartStoryC />
    </>
  )
}
