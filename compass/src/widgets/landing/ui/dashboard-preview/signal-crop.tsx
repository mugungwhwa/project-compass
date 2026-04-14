"use client"

/**
 * signal-crop.tsx
 * Landing page preview: Investment Signal verdict badge.
 * Wraps <HeroVerdict> in a layout-aware, interaction-disabled container.
 * Source widget: @/widgets/dashboard/ui/hero-verdict
 */

import { HeroVerdict } from "@/widgets/dashboard/ui/hero-verdict"
import { PreviewFrame } from "./_frame"
import { previewSignal } from "./preview-fixtures"

type SignalCropProps = {
  /** CSS zoom applied to the child tree. Default: 0.65 */
  scale?: number
  /** Natural pixel width of the child tree (before zoom). Default: 800 */
  naturalWidth?: number
}

export function SignalCrop({ scale = 0.65, naturalWidth = 800 }: SignalCropProps) {
  return (
    <PreviewFrame scale={scale} naturalWidth={naturalWidth}>
      <HeroVerdict
        status={previewSignal.status}
        confidence={previewSignal.confidence}
        factors={previewSignal.factors}
        payback={previewSignal.payback}
        nextAction={previewSignal.nextAction}
        reason={previewSignal.reason}
        impact={previewSignal.impact}
      />
    </PreviewFrame>
  )
}
