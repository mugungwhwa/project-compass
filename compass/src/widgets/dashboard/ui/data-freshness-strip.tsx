"use client"

import { useLocale } from "@/shared/i18n"
import type { DataFreshness } from "@/shared/api/mock-data"
import { InfoHint } from "@/shared/ui/info-hint"

type DataFreshnessStripProps = {
  data: DataFreshness
}

function getLastSyncColor(minutesAgo: number): string {
  if (minutesAgo < 60) return "var(--signal-positive)"
  if (minutesAgo <= 360) return "var(--signal-caution)"
  return "var(--signal-risk)"
}

function getSourceCoverageColor(connected: number): string {
  if (connected >= 4) return "var(--signal-positive)"
  if (connected === 3) return "var(--signal-caution)"
  return "var(--signal-risk)"
}

function getSignalQualityColor(quality: DataFreshness["signalQuality"]): string {
  if (quality === "high") return "var(--signal-positive)"
  if (quality === "medium") return "var(--signal-caution)"
  return "var(--signal-risk)"
}

function getConvergenceColor(value: number): string {
  if (value > 75) return "var(--signal-positive)"
  if (value >= 50) return "var(--signal-caution)"
  return "var(--signal-risk)"
}

function getAnomalyColor(severity: "info" | "warn" | "critical"): string {
  if (severity === "critical") return "var(--signal-risk)"
  if (severity === "warn") return "var(--signal-caution)"
  return "var(--fg-2)"
}

type RowProps = {
  color: string
  label: string
  value: string
  info?: string
}

function Row({ color, label, value, info }: RowProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span
        className="text-[11px] font-medium uppercase tracking-wide flex-1 flex items-center gap-1"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
        {info && <InfoHint content={info} size={11} />}
      </span>
      <span
        className="text-sm font-mono-num"
        style={{ color: "var(--fg-1)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </span>
    </div>
  )
}

export function DataFreshnessStrip({ data }: DataFreshnessStripProps) {
  const { t, locale } = useLocale()

  const syncColor = getLastSyncColor(data.lastSync.minutesAgo)
  const sourceColor = getSourceCoverageColor(data.sourceCoverage.connected)
  const qualityColor = getSignalQualityColor(data.signalQuality)
  const convergenceColor = getConvergenceColor(data.modelConvergence)

  const qualityLabel =
    data.signalQuality === "high"
      ? t("data.high")
      : data.signalQuality === "medium"
        ? t("data.medium")
        : t("data.low")

  return (
    <div
      className="rounded-xl border border-[var(--border)] p-5 card-glow card-premium h-full"
      style={{ boxShadow: "0 4px 24px rgba(91,154,255,0.08)" }}
    >
      <h3 className="text-h2 mb-4">{t("data.freshness")}</h3>

      <div className="flex flex-col gap-4">
        {/* Last Sync */}
        <Row
          color={syncColor}
          label={t("data.lastSync")}
          value={`${data.lastSync.minutesAgo}${t("common.minAgo")}`}
        />

        {/* Source Coverage */}
        <Row
          color={sourceColor}
          label={t("data.sources")}
          value={`${data.sourceCoverage.connected}/${data.sourceCoverage.total}`}
        />

        {/* Signal Quality */}
        <Row
          color={qualityColor}
          label={t("data.quality")}
          value={qualityLabel}
          info={t("info.data.quality")}
        />

        {/* Model Convergence */}
        <Row
          color={convergenceColor}
          label={t("data.convergence")}
          value={`${data.modelConvergence}%`}
          info={t("info.data.convergence")}
        />

        {/* Anomalies */}
        {data.anomalies.length > 0 && (
          <div className="flex flex-col gap-2 pt-1 border-t border-[var(--border)]">
            {data.anomalies.map((anomaly, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-xs shrink-0">
                  {anomaly.severity === "critical" ? "🔴" : "⚠"}
                </span>
                <span
                  className="text-xs"
                  style={{ color: getAnomalyColor(anomaly.severity) }}
                >
                  {anomaly.message[locale]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
