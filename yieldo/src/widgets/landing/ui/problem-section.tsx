'use client'

import { motion } from 'framer-motion'
import { useLocale } from '@/shared/i18n/context'

const copy = {
  ko: {
    heading: '모두가 데이터를 갖고 있지만, 아무도 연결하지 않습니다',
    sub: '모바일 게임 산업은 ROAS 기반으로 투자하고, 회계는 별도로 관리하며, 실험 결과는 스프레드시트에 남습니다. 이 세 영역 사이의 회색 지대에서 수백만 달러의 의사결정이 감으로 이루어집니다.',
    conclusion: 'yieldo가 셋을 하나의 투자 판단으로 연결합니다.',
    gaps: [
      { label: 'UA', does: '유입 효율은 안다', misses: '투자 가치는 모른다' },
      { label: '재무', does: '소진 속도는 안다', misses: '실험 효과는 모른다' },
      { label: '프로덕트', does: '어떤 변형이 이겼는지 안다', misses: '자본 배분 가치는 모른다' },
    ],
  },
  en: {
    heading: 'Every team has data. Nobody connects it.',
    sub: 'The mobile gaming industry invests based on ROAS, manages accounting separately, and leaves experiment results in spreadsheets. In the gray area between these three domains, multi-million dollar decisions are made on gut feeling.',
    conclusion: 'yieldo connects all three into one investment decision.',
    gaps: [
      { label: 'UA', does: 'Knows acquisition efficiency', misses: 'Not investment value' },
      { label: 'Finance', does: 'Knows burn and runway', misses: 'Not experiment impact' },
      { label: 'Product', does: 'Knows which variant won', misses: 'Not capital allocation value' },
    ],
  },
}

export function ProblemSection() {
  const { locale } = useLocale()
  const t = copy[locale]

  return (
    <section className="w-full bg-[var(--bg-1)] py-24 border-y border-[var(--border-subtle)]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-3xl font-bold text-[var(--fg-0)] tracking-tight mb-4 md:text-4xl">
            {t.heading}
          </h2>
          <p className="text-lg text-[var(--fg-2)] max-w-3xl mx-auto leading-relaxed">
            {t.sub}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {t.gaps.map((gap) => (
            <motion.div
              key={gap.label}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
                },
              }}
              className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-0)] p-6"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
                {gap.label}
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--fg-0)] mb-1">
                  {gap.does}
                </p>
                <p className="text-sm text-[var(--signal-caution)]">
                  → {gap.misses}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-center mt-12 text-base font-medium text-[var(--fg-1)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {t.conclusion}
        </motion.p>
      </div>
    </section>
  )
}
