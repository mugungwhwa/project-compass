"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useLocale } from "@/shared/i18n/context"

const EASE = "easeOut" as const

const initial = { opacity: 0, y: 24 }

const copy = {
  ko: {
    headline: "실험을 투자 결정으로",
    sub1: "ROAS로 투자하고, 회계는 따로 보고, 실험 결과는 스프레드시트에 묻힙니다.",
    sub2: "Compass는 이 회색 영역을 하나의 의사결정 레이어로 연결합니다.",
    cta: "대시보드 체험하기",
  },
  en: {
    headline: "Turn Experiments into Investment Decisions",
    sub1: "You invest based on ROAS, track finances separately, and experiment results get buried in spreadsheets.",
    sub2: "Compass bridges these gray areas into a single decision layer.",
    cta: "Try the Dashboard",
  },
}

export function HeroSection() {
  const { locale } = useLocale()
  const t = copy[locale]

  return (
    <section className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-[var(--bg-0)] px-6 text-center">
      <motion.h1
        className="mb-8 max-w-4xl text-6xl font-bold leading-[1.1] tracking-tight text-[var(--fg-0)] md:text-7xl lg:text-8xl"
        style={{ fontFamily: "var(--font-instrument-serif, Georgia, serif)" }}
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0, ease: EASE }}
      >
        {t.headline}
      </motion.h1>

      <motion.p
        className="mb-12 max-w-2xl text-lg leading-relaxed text-[var(--fg-2)] md:text-xl"
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
      >
        {t.sub1}
        <br className="hidden md:block" />
        {t.sub2}
      </motion.p>

      <motion.div
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
      >
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-card)] bg-[var(--brand)] px-6 text-sm font-semibold text-white transition-colors duration-[var(--duration-micro)] hover:bg-[var(--brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
        >
          {t.cta}
        </Link>
      </motion.div>
    </section>
  )
}
