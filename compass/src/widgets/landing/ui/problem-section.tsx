'use client'

import { motion } from 'framer-motion'
import { useLocale } from '@/shared/i18n/context'

const copy = {
  ko: {
    heading: '모두가 데이터를 보지만, 아무도 연결하지 않습니다',
    sub: '모바일 게임 산업은 ROAS 기반으로 투자하고, 회계는 별도로 관리하며, 실험 결과는 스프레드시트에 남습니다. 이 세 영역 사이의 회색 지대에서 수백만 달러의 의사결정이 감으로 이루어집니다.',
    conclusion: 'Compass는 이 세 팀의 데이터를 하나의 투자 판단으로 번역합니다.',
    gaps: [
      { label: 'UA 팀', does: 'ROAS 기준으로 투자 결정', misses: '장기 LTV와의 연결 없음' },
      { label: '재무 팀', does: '월간 손익·회수 기간 별도 관리', misses: '실험 결과가 재무에 미치는 영향 불명' },
      { label: '프로덕트 팀', does: 'A/B 테스트로 기능 의사결정', misses: '"이겼다"는 알지만 투자 가치는 모름' },
    ],
  },
  en: {
    heading: 'Everyone looks at data, but nobody connects it',
    sub: 'The mobile gaming industry invests based on ROAS, manages accounting separately, and leaves experiment results in spreadsheets. In the gray area between these three domains, multi-million dollar decisions are made on gut feeling.',
    conclusion: 'Compass translates data from all three teams into a single investment decision.',
    gaps: [
      { label: 'UA Team', does: 'Investment decisions based on ROAS', misses: 'No connection to long-term LTV' },
      { label: 'Finance Team', does: 'P&L and payback tracked separately', misses: 'Impact of experiments on financials unknown' },
      { label: 'Product Team', does: 'A/B tests drive feature decisions', misses: 'Knows "it won" but not the investment value' },
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
