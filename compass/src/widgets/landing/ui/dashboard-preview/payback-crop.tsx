"use client"

/**
 * payback-crop.tsx
 * Landing page preview: Payback gauge + headline number.
 * Wraps <SignalCard> (which contains the payback gauge bar) in a
 * layout-aware, interaction-disabled container.
 * Source widget: @/widgets/dashboard/ui/signal-card
 */

import { SignalCard } from "@/widgets/dashboard/ui/signal-card"
import { PreviewFrame } from "./_frame"
import { previewSignal } from "./preview-fixtures"

type PaybackCropProps = {
  /** CSS zoom applied to the child tree. Default: 0.7 */
  scale?: number
  /** Natural pixel width of the child tree (before zoom). Default: 686 */
  naturalWidth?: number
}

export function PaybackCrop({ scale = 0.7, naturalWidth = 686 }: PaybackCropProps) {
  return (
    <PreviewFrame scale={scale} naturalWidth={naturalWidth}>
      <SignalCard
        status={previewSignal.status}
        confidence={previewSignal.confidence}
        factors={previewSignal.factors}
        payback={previewSignal.payback}
      />
    </PreviewFrame>
  )
}
