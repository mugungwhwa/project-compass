"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useLocale } from "@/shared/i18n/context"

const copy = {
  ko: { heading: "지금 바로 시작하세요", sub: "데모 계정으로 Compass를 체험해보세요", cta: "무료로 시작하기" },
  en: { heading: "Get Started Now", sub: "Try Compass with a demo account", cta: "Start for Free" },
}

export function CtaSection() {
  const { locale } = useLocale()
  const t = copy[locale]

  return (
    <section className="w-full bg-[var(--bg-2)] px-6 py-24">
      <motion.div
        className="mx-auto flex max-w-2xl flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      >
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-[var(--fg-0)] md:text-4xl">
          {t.heading}
        </h2>

        <p className="mb-8 text-base text-[var(--fg-2)] md:text-lg">
          {t.sub}
        </p>

        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-card)] bg-[var(--brand)] px-8 text-sm font-semibold text-white transition-colors duration-[var(--duration-micro)] hover:bg-[var(--brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
        >
          {t.cta}
        </Link>
      </motion.div>
    </section>
  )
}
