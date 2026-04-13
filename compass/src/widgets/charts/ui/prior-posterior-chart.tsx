"use client"

import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { PriorPosterior } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { PRIOR_POSTERIOR_COLORS } from "@/shared/config/chart-colors"

const C = PRIOR_POSTERIOR_COLORS

type PriorPosteriorChartProps = {
  data: PriorPosterior[]
}

export function PriorPosteriorChart({ data }: PriorPosteriorChartProps) {
  const { t } = useLocale()
  const { expanded, toggle, gridClassName } = useChartExpand()

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={`${t("market.priorPosterior")} · ${t("market.bayesian")}`}
        subtitle={t("info.priorPosterior")}
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />

      <div className="space-y-6">
        {data.map((item, i) => {
          // Normalize ranges to 0-100% for visualization
          const allValues = [item.prior.ci_low, item.prior.ci_high, item.posterior.ci_low, item.posterior.ci_high]
          const min = Math.min(...allValues) * 0.8
          const max = Math.max(...allValues) * 1.2
          const range = max - min

          const priorLeft = ((item.prior.ci_low - min) / range) * 100
          const priorWidth = ((item.prior.ci_high - item.prior.ci_low) / range) * 100
          const priorMean = ((item.prior.mean - min) / range) * 100

          const postLeft = ((item.posterior.ci_low - min) / range) * 100
          const postWidth = ((item.posterior.ci_high - item.posterior.ci_low) / range) * 100
          const postMean = ((item.posterior.mean - min) / range) * 100

          return (
            <div key={i}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-bold text-[var(--fg-0)]">{item.metric}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[var(--fg-2)] font-mono-num">
                    Prior: {item.prior.mean.toFixed(2)}
                  </span>
                  <span className="font-bold font-mono-num" style={{ color: C.posterior }}>
                    → Posterior: {item.posterior.mean.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Distribution bar visualization */}
              <div className="relative h-12">
                {/* Prior band (gray, wide) */}
                <div
                  className="absolute top-1 h-4 rounded-full"
                  style={{
                    left: `${priorLeft}%`,
                    width: `${priorWidth}%`,
                    background: `linear-gradient(90deg, transparent 0%, ${C.priorFill} 50%, transparent 100%)`,
                    border: `1px solid ${C.priorBorder}`,
                  }}
                />
                <div
                  className="absolute top-0 w-0.5 h-6"
                  style={{ left: `${priorMean}%`, background: C.prior }}
                />
                <span
                  className="absolute top-7 text-[10px] text-[var(--fg-2)] font-mono-num"
                  style={{ left: `${priorMean}%`, transform: "translateX(-50%)" }}
                >
                  Prior
                </span>

                {/* Posterior band (blue, narrow) */}
                <div
                  className="absolute top-1 h-4 rounded-full"
                  style={{
                    left: `${postLeft}%`,
                    width: `${postWidth}%`,
                    background: `linear-gradient(90deg, transparent 0%, ${C.postFill} 50%, transparent 100%)`,
                    border: `1px solid ${C.postBorder}`,
                  }}
                />
                <div
                  className="absolute top-0 w-0.5 h-6"
                  style={{ left: `${postMean}%`, background: C.posterior }}
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
          <div className="w-4 h-2 rounded" style={{ background: C.priorFill, border: `1px solid ${C.prior}` }} />
          <span className="text-[var(--fg-2)]">{t("market.priorLabel")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded" style={{ background: C.postFill, border: `1px solid ${C.postBorder}` }} />
          <span className="text-[var(--fg-2)]">{t("market.posteriorLabel")}</span>
        </div>
      </div>
    </motion.div>
  )
}
