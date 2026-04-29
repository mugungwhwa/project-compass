"use client"

import { useLocale } from "@/shared/i18n"
import type { PosteriorSnapshot } from "@/shared/api/posterior"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: PosteriorSnapshot | null
}

export function MethodologyModal({ open, onOpenChange, snapshot }: Props) {
  const { t } = useLocale()
  if (!snapshot) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("market.methodology.title")}</DialogTitle>
        </DialogHeader>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-[var(--text-muted)]">{t("market.methodology.engineVersion")}</dt>
          <dd className="font-mono">{snapshot.metadata.engineVersion}</dd>
          <dt className="text-[var(--text-muted)]">{t("market.methodology.priorVersion")}</dt>
          <dd className="font-mono text-xs">{snapshot.metadata.priorVersion}</dd>
          <dt className="text-[var(--text-muted)]">{t("market.methodology.genreUsed")}</dt>
          <dd className="font-mono">{snapshot.metadata.genreUsed}</dd>
        </dl>
        <div className="mt-4 border-t border-[var(--border)] pt-3 space-y-1 text-xs text-[var(--text-muted)]">
          {Object.entries(snapshot.metadata.validity).map(([metricId, validity]) => (
            <div key={metricId} className="flex justify-between">
              <span className="font-mono">{metricId}</span>
              <span>
                {validity.valid
                  ? `n=${snapshot.posterior[metricId]?.sampleSize ?? "—"}`
                  : `❌ ${validity.reason}${validity.detail ? ` (${validity.detail})` : ""}`}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
