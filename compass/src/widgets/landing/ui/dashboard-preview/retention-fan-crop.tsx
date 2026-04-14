"use client"

/**
 * retention-fan-crop.tsx
 * Landing page preview: Retention forecast fan chart (P10/P50/P90 bands).
 * Wraps <RetentionCurve> in a scale-shrunk, interaction-disabled container.
 * Source widget: @/widgets/charts/ui/retention-curve
 */

import { RetentionCurve } from "@/widgets/charts/ui/retention-curve"
import { previewRetention, previewAsymptoticDay } from "./preview-fixtures"

type RetentionFanCropProps = {
  /** CSS transform scale applied to the inner widget. Default: 0.65 */
  scale?: number
  /** Rendered width of the container in px. Default: 560 */
  width?: number
  /** Rendered height of the container in px. Default: 340 */
  height?: number
}

export function RetentionFanCrop({
  scale = 0.65,
  width = 560,
  height = 340,
}: RetentionFanCropProps) {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-[var(--radius-card)]"
      style={{ width, height }}
    >
      <div
        className="pointer-events-none select-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${Math.round(width / scale)}px`,
          height: `${Math.round(height / scale)}px`,
        }}
      >
        <RetentionCurve
          data={previewRetention}
          asymptoticDay={previewAsymptoticDay}
        />
      </div>
    </div>
  )
}
