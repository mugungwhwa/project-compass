"use client"

import { useLocale } from "@/shared/i18n"
import type { PriorPosterior } from "@/shared/api/mock-data"

type PriorPosteriorChartProps = {
  data: PriorPosterior[]
}

export function PriorPosteriorChart({ data }: PriorPosteriorChartProps) {
  const { t } = useLocale()

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-slate-50/50 p-6 card-premium">
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
          {t("market.priorPosterior")} · {t("market.bayesian")}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{t("info.priorPosterior")}</p>
      </div>

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
                <span className="text-sm font-bold text-[var(--text-primary)]">{item.metric}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[var(--text-muted)] font-mono-num">
                    Prior: {item.prior.mean.toFixed(2)}
                  </span>
                  <span className="font-bold text-[#5B9AFF] font-mono-num">
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
                    background: "linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.3) 50%, transparent 100%)",
                    border: "1px solid rgba(148,163,184,0.4)",
                  }}
                />
                <div
                  className="absolute top-0 w-0.5 h-6"
                  style={{ left: `${priorMean}%`, background: "#94A3B8" }}
                />
                <span
                  className="absolute top-7 text-[10px] text-[var(--text-muted)] font-mono-num"
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
                    background: "linear-gradient(90deg, transparent 0%, rgba(91,154,255,0.6) 50%, transparent 100%)",
                    border: "1px solid #5B9AFF",
                  }}
                />
                <div
                  className="absolute top-0 w-0.5 h-6"
                  style={{ left: `${postMean}%`, background: "#5B9AFF" }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono-num mt-1">
                <span>{min.toFixed(1)}</span>
                <span>{max.toFixed(1)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded" style={{ background: "rgba(148,163,184,0.4)", border: "1px solid #94A3B8" }} />
          <span className="text-[var(--text-secondary)]">{t("market.priorLabel")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded" style={{ background: "rgba(91,154,255,0.6)", border: "1px solid #5B9AFF" }} />
          <span className="text-[var(--text-secondary)]">{t("market.posteriorLabel")}</span>
        </div>
      </div>
    </div>
  )
}
