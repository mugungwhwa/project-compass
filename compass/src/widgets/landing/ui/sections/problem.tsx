"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"
import { SectionShell } from "../_shared/section-shell"
import { Eyebrow } from "../_shared/eyebrow"

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

type SiloCard = {
  labelKey: "landing.v2.whyFail.card1Title" | "landing.v2.whyFail.card2Title" | "landing.v2.whyFail.card3Title" | "landing.v2.whyFail.card4Title"
  doesKey: "landing.v2.whyFail.card1Desc" | "landing.v2.whyFail.card2Desc" | "landing.v2.whyFail.card3Desc" | "landing.v2.whyFail.card4Desc"
  misses: { en: string; ko: string }
  missing: { en: string; ko: string }
}

const SILO_CARDS: SiloCard[] = [
  {
    labelKey: "landing.v2.whyFail.card1Title",
    doesKey: "landing.v2.whyFail.card1Desc",
    misses: { en: "Not whether the market justifies investment", ko: "투자가 정당화되는지는 모릅니다" },
    missing: { en: "Does this market justify our current investment level?", ko: "이 시장이 우리의 현재 투자 수준을 정당화하는가?" },
  },
  {
    labelKey: "landing.v2.whyFail.card2Title",
    doesKey: "landing.v2.whyFail.card2Desc",
    misses: { en: "Not long-term investment value", ko: "장기 투자 가치는 모릅니다" },
    missing: { en: "Is this acquisition cost justified by long-term returns?", ko: "이 획득 비용이 장기 수익으로 정당화되는가?" },
  },
  {
    labelKey: "landing.v2.whyFail.card3Title",
    doesKey: "landing.v2.whyFail.card3Desc",
    misses: { en: "Not the capital allocation value of that win", ko: "그 승리의 자본 배분 가치는 모릅니다" },
    missing: { en: "How much investment value did this experiment create?", ko: "이 실험이 얼마나 많은 투자 가치를 만들었는가?" },
  },
  {
    labelKey: "landing.v2.whyFail.card4Title",
    doesKey: "landing.v2.whyFail.card4Desc",
    misses: { en: "Not whether experiments are working", ko: "실험이 효과가 있는지는 모릅니다" },
    missing: { en: "Given market conditions, should we invest more?", ko: "시장 상황을 감안하면 더 투자해야 하는가?" },
  },
]

export function WhyFailSection() {
  const { t, locale } = useLocale()

  return (
    <SectionShell band="bg-1" borderY>
      {/* Heading block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45, ease: EASE_OUT_QUART }}
        className="text-center"
      >
        <Eyebrow label="The Problem" />
        <h2
          className="font-display text-2xl md:text-3xl lg:text-4xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)] [word-break:keep-all] [overflow-wrap:break-word]"
        >
          {t("landing.v2.whyFail.headline")}
        </h2>
        <p className={`mt-4 text-base md:text-lg leading-relaxed text-[var(--fg-1)] max-w-3xl mx-auto [word-break:keep-all] ${locale === "ko" ? "font-medium" : "font-normal"}`}>
          {locale === "ko"
            ? "시장, UA, 프로덕트, 재무 — 각자 좁은 질문에만 답합니다. 진짜 중요한 질문엔 아무도 답하지 않습니다."
            : "Market, UA, product, and finance each answer a narrow question. None answers the one that matters."}
        </p>
      </motion.div>

      {/* 4-card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
        {SILO_CARDS.map((card, i) => (
          <motion.div
            key={card.labelKey}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.38, ease: EASE_OUT_QUART, delay: i * 0.09 }}
            className="p-6 bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[var(--radius-card)]"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">
              {t(card.labelKey)}
            </span>
            <p className={`text-sm font-medium text-[var(--fg-1)] mt-3 [word-break:keep-all] ${locale === "ko" ? "font-medium" : ""}`}>
              {t(card.doesKey)}
            </p>
            <p className="text-sm text-[var(--signal-caution)] mt-1 [word-break:keep-all]">
              {locale === "ko" ? card.misses.ko : card.misses.en}
            </p>
            <div className="border-t border-[var(--border-subtle)] mt-4 pt-4">
              <p className={`text-xs text-[var(--fg-3)] italic [word-break:keep-all] ${locale === "ko" ? "font-medium" : ""}`}>
                {locale === "ko" ? card.missing.ko : card.missing.en}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Conclusion line */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45, ease: EASE_OUT_QUART, delay: 0.36 }}
        className={`mt-10 text-center text-base font-medium text-[var(--fg-0)] [word-break:keep-all]`}
      >
        {t("landing.v2.whyFail.conclusion")}
      </motion.p>
    </SectionShell>
  )
}
