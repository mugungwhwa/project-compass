"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n/context"
import { SectionShell } from "../_shared/section-shell"
import { Eyebrow } from "../_shared/eyebrow"

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

type ModuleCard = {
  num: string
  nameKey: "landing.v2.modules.m1Name" | "landing.v2.modules.m2Name" | "landing.v2.modules.m3Name" | "landing.v2.modules.m4Name"
  descKey: "landing.v2.modules.m1Desc" | "landing.v2.modules.m2Desc" | "landing.v2.modules.m3Desc" | "landing.v2.modules.m4Desc"
  question: { en: string; ko: string }
}

const MODULES: ModuleCard[] = [
  {
    num: "01",
    nameKey: "landing.v2.modules.m1Name",
    descKey: "landing.v2.modules.m1Desc",
    question: { en: "Can we invest more?", ko: "투자를 늘릴 수 있는가?" },
  },
  {
    num: "02",
    nameKey: "landing.v2.modules.m2Name",
    descKey: "landing.v2.modules.m2Desc",
    question: { en: "Where do we stand?", ko: "우리는 어디에 있는가?" },
  },
  {
    num: "03",
    nameKey: "landing.v2.modules.m3Name",
    descKey: "landing.v2.modules.m3Desc",
    question: { en: "Which tests moved LTV?", ko: "어떤 테스트가 LTV를 움직였는가?" },
  },
  {
    num: "04",
    nameKey: "landing.v2.modules.m4Name",
    descKey: "landing.v2.modules.m4Desc",
    question: { en: "Why did the metric move?", ko: "메트릭이 왜 이동했는가?" },
  },
]

export function ModulesSection() {
  const { t, locale } = useLocale()

  return (
    <SectionShell band="bg-0">
      {/* Heading block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45, ease: EASE_OUT_QUART }}
        className="text-center"
      >
        <Eyebrow label="Platform" />
        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl leading-[1.1] tracking-[-0.02em] text-[var(--fg-0)] [word-break:keep-all] [overflow-wrap:break-word]">
          {t("landing.v2.modules.headline")}
        </h2>
        <p className={`mt-4 text-base md:text-lg leading-relaxed text-[var(--fg-1)] max-w-3xl mx-auto [word-break:keep-all] ${locale === "ko" ? "font-medium" : "font-normal"}`}>
          {t("landing.v2.modules.description")}
        </p>
      </motion.div>

      {/* 4-module card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
        {MODULES.map((mod, i) => (
          <motion.div
            key={mod.num}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.38, ease: EASE_OUT_QUART, delay: i * 0.08 }}
            className="p-6 bg-[var(--bg-1)] border border-[var(--border-subtle)] rounded-[var(--radius-card)]"
          >
            <span className="text-xs font-mono text-[var(--fg-3)]">{mod.num}</span>
            <h3 className={`text-base font-semibold text-[var(--fg-0)] mt-2 tracking-[-0.01em] [word-break:keep-all]`}>
              {t(mod.nameKey)}
            </h3>
            <p className="text-sm text-[var(--brand)] mt-1 font-medium [word-break:keep-all]">
              {locale === "ko" ? mod.question.ko : mod.question.en}
            </p>
            <p className={`text-sm text-[var(--fg-2)] mt-3 leading-relaxed [word-break:keep-all] ${locale === "ko" ? "font-medium" : "font-normal"}`}>
              {t(mod.descKey)}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}
