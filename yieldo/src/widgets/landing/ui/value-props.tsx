'use client'

import { Layers, ArrowRightLeft, BarChart3, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'
import { useLocale } from '@/shared/i18n/context'

type CardData = { icon: LucideIcon; title: string; description: string }

const cards: Record<string, CardData[]> = {
  ko: [
    {
      icon: Layers,
      title: '4개 데이터 사일로를 연결',
      description: '시장 인텔리전스, UA 어트리뷰션, 실험 결과, 재무 데이터를 하나의 투자 시그널로 연결합니다.',
    },
    {
      icon: ArrowRightLeft,
      title: 'ATE를 투자 가치로 번역',
      description: 'A/B 테스트 결과를 ΔLTV, ROI, 회수 기간으로 자동 번역합니다. 실험이 곧 투자 포트폴리오입니다.',
    },
    {
      icon: BarChart3,
      title: '불확실성을 정직하게',
      description: 'P10/P50/P90 신뢰구간으로 의사결정합니다. 점 추정이 아닌, 리스크를 보여주는 투자 판단.',
    },
  ],
  en: [
    {
      icon: Layers,
      title: 'Bridge Four Data Silos',
      description: 'Market intelligence, UA attribution, experiment results, and financials — bridged into one investment signal.',
    },
    {
      icon: ArrowRightLeft,
      title: 'Translate ATE to Investment Value',
      description: 'Automatically translate A/B test results into ΔLTV, ROI, and payback period. Experiments become an investment portfolio.',
    },
    {
      icon: BarChart3,
      title: 'Honest About Uncertainty',
      description: 'Make decisions with P10/P50/P90 credible intervals. Not point estimates — investment judgments that show real risk.',
    },
  ],
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
    },
  },
}

const sectionCopy = {
  ko: { heading: '왜 yieldo인가?', sub: '기존 도구들이 각자의 사일로에서 답하지 못하는 질문 — yieldo가 연결합니다.' },
  en: { heading: 'Why yieldo?', sub: 'The question no single tool can answer from its own silo — yieldo connects them.' },
}

export function ValueProps() {
  const { locale } = useLocale()
  const t = sectionCopy[locale]
  const localeCards = cards[locale]

  return (
    <section className="py-24 bg-[var(--bg-0)]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-[var(--fg-0)] mb-6 tracking-tight md:text-4xl">
          {t.heading}
        </h2>
        <p className="text-center text-base text-[var(--fg-2)] max-w-2xl mx-auto mb-14 leading-relaxed">
          {t.sub}
        </p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {localeCards.map((card) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                variants={cardVariants}
                className={cn(
                  'flex flex-col gap-4 p-6',
                  'bg-[var(--bg-1)] border border-[var(--border-subtle)]',
                  'rounded-[var(--radius-card)]',
                  'transition-[border-color,box-shadow]',
                  'duration-[var(--duration-component)]',
                  'hover:border-[var(--border-default)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
                )}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-inline)] bg-[var(--brand-tint)]">
                  <Icon
                    size={20}
                    className="text-[var(--brand)]"
                    strokeWidth={1.75}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-[var(--fg-0)] leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[var(--fg-2)] leading-relaxed md:text-base">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
