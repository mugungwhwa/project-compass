"use client"

/**
 * retention-fan-crop.tsx
 * Landing page preview: Retention forecast fan chart (P10/P50/P90 bands).
 * Wraps <RetentionCurve> in a layout-aware, interaction-disabled container.
 * Source widget: @/widgets/charts/ui/retention-curve
 */

import { RetentionCurve } from "@/widgets/charts/ui/retention-curve"
import { PreviewFrame } from "./_frame"
import { previewRetention, previewAsymptoticDay } from "./preview-fixtures"

type RetentionFanCropProps = {
  /** CSS zoom applied to the child tree. Default: 0.65 */
  scale?: number
  /** Natural pixel width of the child tree (before zoom). Default: 860 */
  naturalWidth?: number
}

export function RetentionFanCrop({
  scale = 0.65,
  naturalWidth = 860,
}: RetentionFanCropProps) {
  return (
    <PreviewFrame scale={scale} naturalWidth={naturalWidth}>
      <RetentionCurve
        data={previewRetention}
        asymptoticDay={previewAsymptoticDay}
      />
    </PreviewFrame>
  )
}
