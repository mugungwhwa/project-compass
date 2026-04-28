"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useLocale } from "@/shared/i18n/context"
import { HeroVerdict } from "@/widgets/dashboard/ui/hero-verdict"
import { FIXTURE_SIGNAL } from "../_shared/widget-fixtures"

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

/**
 * yieldo Landing Hero — v3 (post-rebrand)
 * ---------------------------------------
 * - Big monospace wordmark anchors the brand
 * - Eyebrow "OPERATING INTELLIGENCE TERMINAL" defines the category
 * - Yellow primary CTA per yieldo Design Guidelines v1.0 §4.6
 */
export function HeroV2() {
  const { t, locale } = useLocale()

  return (
    <section className="relative bg-[var(--bg-0)] min-h-[92vh] flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
      {/* Subtle radial glow — not decorative, just gives the hero depth on dark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(244,200,66,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center text-center w-full max-w-5xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0 }}
          className="yieldo-eyebrow mb-8"
        >
          OPERATING INTELLIGENCE TERMINAL
        </motion.div>

        {/* Wordmark — oversized, mono, lowercase */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.06 }}
          className="yieldo-wordmark text-[88px] md:text-[128px] lg:text-[160px] leading-[0.95] text-[var(--fg-0)] mb-8"
        >
          yieldo
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.14 }}
          className="text-3xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.02em] text-[var(--fg-0)] font-semibold [word-break:keep-all] [overflow-wrap:break-word]"
        >
          {t("landing.v2.hero.headlineLine1")}
          <br />
          {t("landing.v2.hero.headlineLine2")}
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.22 }}
          className={`text-base md:text-lg leading-relaxed text-[var(--fg-1)] max-w-2xl mt-6 [word-break:keep-all] ${
            locale === "ko" ? "font-normal" : "font-normal"
          }`}
        >
          {t("landing.v2.hero.subheading")}
        </motion.p>

        {/* Tagline — yieldo brand voice */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.28 }}
          className="yieldo-eyebrow mt-6 text-[var(--accent-yield)]"
        >
          {locale === "ko" ? "시그널을 수익으로, 즉시 실행" : "From signal to yield, executed."}
        </motion.p>

        {/* CTA pair */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.34 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3"
        >
          <a
            href="/login"
            className="inline-flex items-center gap-2 h-12 px-8 bg-[var(--accent-yield)] text-[var(--bg-0)] text-sm font-semibold rounded-[var(--radius-card)] hover:bg-[var(--brand-hover)] transition-colors"
          >
            {t("landing.v2.cta.primaryButton")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <a
            href="#product-proof"
            className="inline-flex items-center gap-2 h-12 px-6 bg-transparent text-[var(--fg-1)] text-sm font-medium rounded-[var(--radius-card)] border border-[var(--border-strong)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)] transition-colors"
          >
            {locale === "ko" ? "라이브 데모 보기" : "Watch live demo"}
          </a>
        </motion.div>

        {/* Aux pills — keep informational */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.42 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-1)] text-xs text-[var(--fg-2)]"
            >
              <span className="h-1 w-1 rounded-full bg-[var(--accent-yield)]" aria-hidden />
              {label}
            </span>
          ))}
        </motion.div>

        {/* HeroVerdict — real dashboard widget anchor */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_OUT_QUART, delay: 0.52 }}
          className="mt-20 w-full max-w-[1100px] mx-auto"
          aria-hidden="true"
        >
          <div
            className="landing-static-widget overflow-x-auto rounded-[var(--radius-modal)] border border-[var(--border-default)] bg-[var(--bg-1)] p-1"
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
                compactScrollThreshold={Number.MAX_SAFE_INTEGER}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
