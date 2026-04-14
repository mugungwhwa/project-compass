"use client"

/**
 * action-crop.tsx
 * Landing page preview: Next-action recommendation card.
 * Minimal self-contained card styled with dashboard design tokens —
 * no dedicated dashboard widget exists for a standalone action card.
 */

import { PreviewFrame } from "./_frame"
import { previewAction } from "./preview-fixtures"
import { TrendingUp } from "lucide-react"

type ActionCropProps = {
  /** CSS zoom applied to the child tree. Default: 0.7 */
  scale?: number
  /** Natural pixel width of the child tree (before zoom). Default: 657 */
  naturalWidth?: number
}

export function ActionCrop({ scale = 0.7, naturalWidth = 657 }: ActionCropProps) {
  return (
    <PreviewFrame scale={scale} naturalWidth={naturalWidth}>
      {/* Self-contained card — matches dashboard token vocabulary */}
      <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-inline)] bg-[var(--signal-positive-bg,#F0FDF4)] px-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--signal-positive,#16A34A)]">
            {previewAction.tag}
          </span>
          <span className="text-[11px] text-[var(--fg-3)]">{previewAction.confidence}% confidence</span>
        </div>

        {/* Recommendation */}
        <p className="text-[var(--fg-0)] text-[18px] font-semibold leading-snug mb-3">
          {previewAction.recommendation}
        </p>

        {/* Impact row */}
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--signal-positive,#16A34A)]" aria-hidden />
          <span className="text-[13px] font-medium text-[var(--signal-positive,#16A34A)]">
            {previewAction.impact}
          </span>
        </div>
      </div>
    </PreviewFrame>
  )
}
