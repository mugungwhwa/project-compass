"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"
import { SectionShell } from "../_shared/section-shell"
import { Eyebrow } from "../_shared/eyebrow"
import { PaybackCrop } from "../dashboard-preview/payback-crop"

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

const BULLETS = {
  en: [
    "Investment status signal",
    "Confidence level (%)",
    "Payback range (P10–P90)",
    "Top reasons behind the signal",
    "Next action recommendation",
  ],
  ko: [
    "투자 상태 시그널",
    "신뢰도 (%)",
    "페이백 범위 (P10–P90)",
    "시그널 뒤의 주요 근거",
    "다음 액션 권고",
  ],
}

export function ProductProofSection() {
  const { t, locale } = useLocale()

  const bullets = locale === "ko" ? BULLETS.ko : BULLETS.en

  return (
    <SectionShell band="bg-1" maxWidth="max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 items-center">
        {/* Left col */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: EASE_OUT_QUART }}
        >
          <Eyebrow label="Proof" />
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)] [word-break:keep-all] [overflow-wrap:break-word]">
            {t("landing.v2.proof.headline")}
          </h2>
          <p className={`mt-4 text-base md:text-lg leading-relaxed text-[var(--fg-1)] [word-break:keep-all] ${locale === "ko" ? "font-medium" : "font-normal"}`}>
            {t("landing.v2.proof.description")}
          </p>

          {/* Bullets */}
          <ul className="mt-8 space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] mt-1.5 flex-shrink-0"
                />
                <span className={`text-sm text-[var(--fg-1)] [word-break:keep-all] ${locale === "ko" ? "font-medium" : "font-normal"}`}>
                  {bullet}
                </span>
              </li>
            ))}
          </ul>

          <a
            href="#demo"
            className="inline-flex items-center mt-8 text-sm font-medium text-[var(--brand)] hover:opacity-80 transition-opacity"
          >
            {locale === "ko" ? "라이브 데모 탐색 →" : "Explore live demo →"}
          </a>
        </motion.div>

        {/* Right col — preview */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUART, delay: 0.15 }}
        >
          <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] overflow-hidden shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]">
            <div className="overflow-x-auto">
              <PaybackCrop />
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  )
}
