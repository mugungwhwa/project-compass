"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useLocale } from "@/shared/i18n/context"

const EASE = "easeOut" as const

const initial = { opacity: 0, y: 24 }

const copy = {
  ko: {
    headlineLine1: "실험을",
    headlineLine2: "투자 판단으로",
    sub1: "시장, UA, 실험, 재무 — 모두 따로 놉니다.",
    sub2: "yieldo가 하나의 투자 판단으로 연결합니다.",
    cta: "라이브 데모 보기",
    auxiliary: "분석 대시보드가 아닙니다. 자본 배분을 위한 의사결정 레이어입니다.",
  },
  en: {
    headlineLine1: "Turn Game Data",
    headlineLine2: "into Investment Decisions",
    sub1: "Market, UA, experiments, and financials — each in its own silo.",
    sub2: "yieldo unifies them into one investment decision.",
    cta: "View Live Demo",
    auxiliary: "Not another analytics dashboard. A decision layer for capital allocation.",
  },
}

export function HeroSection() {
  const { locale } = useLocale()
  const t = copy[locale]

  return (
    <section className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-[var(--bg-0)] px-6 text-center">
      <motion.h1
        className="mb-8 max-w-4xl text-6xl font-bold leading-[1.1] tracking-tight text-[var(--fg-0)] md:text-7xl lg:text-8xl"
        style={{
          fontFamily: 'var(--font-instrument-serif), "Noto Serif KR", Georgia, serif',
          wordBreak: "keep-all",
          overflowWrap: "break-word",
        }}
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0, ease: EASE }}
      >
        {t.headlineLine1}
        <br />
        {t.headlineLine2}
      </motion.h1>

      <motion.p
        className="mb-12 max-w-2xl text-lg leading-relaxed text-[var(--fg-2)] md:text-xl [word-break:keep-all] [overflow-wrap:break-word]"
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
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-card)] bg-[var(--brand)] px-6 text-sm font-semibold text-white transition-colors duration-[var(--duration-micro)] hover:bg-[var(--brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
        >
          {t.cta}
        </Link>
      </motion.div>

      <motion.div
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.45, ease: EASE }}
      >
        <p className="text-sm text-[var(--fg-2)] mt-6">
          {t.auxiliary}
        </p>
      </motion.div>
    </section>
  )
}
