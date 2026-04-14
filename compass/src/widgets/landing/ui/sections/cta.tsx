"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useLocale } from "@/shared/i18n/context"

const EASE = [0.16, 1, 0.3, 1] as const
const VIEWPORT = { once: true, margin: "-80px" } as const

const groupVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

export function CtaBottomSection() {
  const { t, locale } = useLocale()

  return (
    <section
      className="bg-[var(--bg-0)] border-t border-[var(--border-subtle)] py-28 px-6"
      aria-label="Get Started — See the decision"
    >
      <motion.div
        variants={groupVariant}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="max-w-2xl mx-auto flex flex-col items-center text-center"
      >
        <h2
          className="font-display text-4xl md:text-3xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)]"
          style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
        >
          {t("landing.v2.cta.heading")}
        </h2>

        <p
          className={`text-base text-[var(--fg-2)] mt-4 max-w-sm ${locale === "ko" ? "font-medium" : "font-normal"}`}
          style={{ wordBreak: "keep-all" }}
        >
          {t("landing.v2.cta.description")}
        </p>

        <Link
          href="/contact"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-card)] bg-[var(--brand)] px-8 text-sm font-semibold text-white mt-8 transition-colors duration-[var(--duration-micro)] hover:bg-[var(--brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
        >
          {t("landing.v2.cta.primaryButton")}
        </Link>

        <Link
          href="/dashboard"
          className="text-sm text-[var(--fg-2)] underline underline-offset-2 mt-4 hover:text-[var(--fg-1)] transition-colors duration-[var(--duration-micro)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
        >
          {t("landing.v2.cta.secondary")}
        </Link>
      </motion.div>
    </section>
  )
}
