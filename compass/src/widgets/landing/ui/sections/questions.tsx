"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"
import { SectionShell } from "../_shared/section-shell"
import { Eyebrow } from "../_shared/eyebrow"

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

type QuestionCard = {
  questionKey: "landing.v2.answers.q1" | "landing.v2.answers.q2" | "landing.v2.answers.q3" | "landing.v2.answers.q4"
  whoAsks: { en: string; ko: string }
  annotation: string
}

const QUESTIONS: QuestionCard[] = [
  {
    questionKey: "landing.v2.answers.q1",
    whoAsks: { en: "CEO, CFO", ko: "CEO, CFO" },
    annotation: "82% confidence · Invest More",
  },
  {
    questionKey: "landing.v2.answers.q2",
    whoAsks: { en: "UA Lead, Finance", ko: "UA 리드, 재무" },
    annotation: "CPI +12% · D7 retention −0.8pp",
  },
  {
    questionKey: "landing.v2.answers.q3",
    whoAsks: { en: "Product, Strategy", ko: "프로덕트, 전략" },
    annotation: "D7: 4.1% vs genre P50: 6.8%",
  },
  {
    questionKey: "landing.v2.answers.q4",
    whoAsks: { en: "Product, Finance", ko: "프로덕트, 재무" },
    annotation: "ΔLTV +$0.31 · Payback −5 days",
  },
]

export function QuestionsSection() {
  const { t, locale } = useLocale()

  return (
    <SectionShell band="bg-2">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45, ease: EASE_OUT_QUART }}
        className="text-center"
      >
        <Eyebrow label="Four Questions" />
        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)] [word-break:keep-all] [overflow-wrap:break-word]">
          {t("landing.v2.answers.headline")}
        </h2>
      </motion.div>

      {/* 2×2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {QUESTIONS.map((q, i) => (
          <motion.div
            key={q.questionKey}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.38, ease: EASE_OUT_QUART, delay: i * 0.1 }}
            className="p-8 bg-[var(--bg-1)] border border-[var(--border-subtle)] rounded-[var(--radius-card)]"
          >
            <span className="text-sm text-[var(--fg-3)] font-mono leading-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className={`text-xl font-semibold text-[var(--fg-0)] mt-3 leading-snug [word-break:keep-all] [overflow-wrap:break-word] ${locale === "ko" ? "font-semibold" : ""}`}>
              {t(q.questionKey)}
            </h3>
            <p className={`text-sm text-[var(--fg-2)] mt-2 [word-break:keep-all] ${locale === "ko" ? "font-medium" : "font-normal"}`}>
              {locale === "ko" ? q.whoAsks.ko : q.whoAsks.en}
            </p>
            <p className="text-xs font-mono text-[var(--brand)] mt-4 leading-none tracking-[0.04em]">
              {q.annotation}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}
