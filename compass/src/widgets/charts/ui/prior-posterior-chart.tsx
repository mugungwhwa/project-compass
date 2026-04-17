"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { PriorPosterior } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { MARKET_GAP_PROOF_COLORS } from "@/shared/config/chart-colors"
import { computeMarketSignal } from "@/shared/lib"
import { MethodologyModal } from "@/shared/ui/methodology-modal"
import { CyclicUpdateTimeline } from "./cyclic-update-timeline"
import { mockCyclicUpdate_matchLeague_d7 } from "@/shared/api/mock-data"

const C = MARKET_GAP_PROOF_COLORS

type PriorPosteriorChartProps = {
  data: PriorPosterior[]
}

/**
 * Market Gap — Layer 1 "장르 기대치 vs 우리 실적" 차트.
 *
 * L0/L1/L2 언어 레이어링 정책(docs/superpowers/specs/2026-04-15-compass-positioning-language-layering-design.md)에 따라
 * L1(operator UI)에는 Prior/Posterior/Bayesian/Alpha 용어 사용 금지. 장르 기대치 / 우리 실적 /
 * Invest·Hold·Reduce 신호 언어로 통일. 색상은 Revenue Forecast와 정합 (빨강=장르, 초록=우리, 파랑=격차 accent).
 */
export function PriorPosteriorChart({ data }: PriorPosteriorChartProps) {
  const { t } = useLocale()
  const [methodologyOpen, setMethodologyOpen] = useState(false)
  const { expanded, toggle, gridClassName } = useChartExpand()

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("market.proof.title")}
        subtitle={t("market.proof.subtitle")}
        info={t("market.proof.info")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />

      <div className="space-y-6">
        {data.map((item) => {
          const { signal, deltaPct, direction } = computeMarketSignal(item.prior.mean, item.posterior.mean)
          const signalColor =
            signal === "invest" ? C.signalInvest : signal === "reduce" ? C.signalReduce : C.signalHold
          const signalLabel = t(
            signal === "invest" ? "market.signal.invest" : signal === "reduce" ? "market.signal.reduce" : "market.signal.hold",
          )
          const gapLabel = t(direction === "above" ? "market.proof.gapAbove" : "market.proof.gapBelow")
          const deltaDisplay = `${deltaPct > 0 ? "+" : ""}${deltaPct.toFixed(1)}%`

          const allValues = [item.prior.ci_low, item.prior.ci_high, item.posterior.ci_low, item.posterior.ci_high]
          const min = Math.min(...allValues) * 0.8
          const max = Math.max(...allValues) * 1.2
          const range = max - min

          const genreLeft = ((item.prior.ci_low - min) / range) * 100
          const genreWidth = ((item.prior.ci_high - item.prior.ci_low) / range) * 100
          const genreMean = ((item.prior.mean - min) / range) * 100

          const ourLeft = ((item.posterior.ci_low - min) / range) * 100
          const ourWidth = ((item.posterior.ci_high - item.posterior.ci_low) / range) * 100
          const ourMean = ((item.posterior.mean - min) / range) * 100

          return (
            <div key={item.metric}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-[var(--fg-0)]">{item.metric}</span>
                <div className="flex items-center gap-3 text-xs font-mono-num">
                  <span className="text-[var(--fg-2)]">
                    {t("market.proof.genreLabel")}: {item.prior.mean.toFixed(2)}
                  </span>
                  <span className="text-[var(--fg-3)]">→</span>
                  <span className="font-bold" style={{ color: C.our }}>
                    {t("market.proof.ourLabel")}: {item.posterior.mean.toFixed(2)}
                  </span>
                  <span className="font-bold" style={{ color: C.gapAccent }}>
                    {gapLabel} {deltaDisplay}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
                    style={{ background: `${signalColor}15`, color: signalColor }}
                  >
                    {signalLabel}
                  </span>
                </div>
              </div>

              <div className="relative h-12">
                <div
                  className="absolute top-1 h-4 rounded-full"
                  style={{
                    left: `${genreLeft}%`,
                    width: `${genreWidth}%`,
                    background: C.genreFill,
                    border: `1px dashed ${C.genreLine}`,
                  }}
                />
                <div
                  className="absolute top-0 w-0.5 h-6"
                  style={{ left: `${genreMean}%`, background: C.genre }}
                />
                <span
                  className="absolute top-7 text-[10px] text-[var(--fg-2)] font-mono-num"
                  style={{ left: `${genreMean}%`, transform: "translateX(-50%)" }}
                >
                  {t("market.proof.genreLabel")}
                </span>

                <div
                  className="absolute top-1 h-4 rounded-full"
                  style={{
                    left: `${ourLeft}%`,
                    width: `${ourWidth}%`,
                    background: C.ourFill,
                    border: `1px solid ${C.our}`,
                  }}
                />
                <div
                  className="absolute top-0 w-0.5 h-6"
                  style={{ left: `${ourMean}%`, background: C.our }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[var(--fg-2)] font-mono-num mt-1">
                <span>{min.toFixed(1)}</span>
                <span>{max.toFixed(1)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border-default)] flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-2 rounded"
            style={{ background: C.genreFill, border: `1px dashed ${C.genre}` }}
          />
          <span className="text-[var(--fg-2)]">{t("market.proof.genreLabel")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded" style={{ background: C.ourFill, border: `1px solid ${C.our}` }} />
          <span className="text-[var(--fg-2)]">{t("market.proof.ourLabel")}</span>
        </div>
      </div>

      {/* L2 Methodology CTA */}
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setMethodologyOpen(true)}
          className="text-caption text-[var(--fg-3)] hover:text-[var(--fg-1)] transition-colors"
        >
          📊 {t("methodology.ctaLabel")}
        </button>
      </div>

      {/* L2 Methodology Modal */}
      <MethodologyModal
        open={methodologyOpen}
        onOpenChange={setMethodologyOpen}
        title={t("methodology.title").replace("{metric}", data[0]?.metric ?? "D7 Retention")}
        subtitle={t("methodology.subtitle")}
        footer={
          <div className="text-caption text-[var(--fg-2)] leading-relaxed">
            <p>{t("methodology.footer")}</p>
            <p className="mt-1 italic text-[var(--fg-3)]">{t("methodology.footerL2")}</p>
          </div>
        }
      >
        <CyclicUpdateTimeline data={mockCyclicUpdate_matchLeague_d7} />
      </MethodologyModal>
    </motion.div>
  )
}
