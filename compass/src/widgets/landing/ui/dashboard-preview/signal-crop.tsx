"use client"

/**
 * signal-crop.tsx
 * Landing page preview: Investment Signal verdict badge.
 * Wraps <HeroVerdict> in a scale-shrunk, interaction-disabled container.
 * Source widget: @/widgets/dashboard/ui/hero-verdict
 */

import { HeroVerdict } from "@/widgets/dashboard/ui/hero-verdict"
import { previewSignal } from "./preview-fixtures"

type SignalCropProps = {
  /** CSS transform scale applied to the inner widget. Default: 0.65 */
  scale?: number
  /** Rendered width of the container in px. Default: 520 */
  width?: number
  /** Rendered height of the container in px. Default: 260 */
  height?: number
}

export function SignalCrop({ scale = 0.65, width = 520, height = 260 }: SignalCropProps) {
  // The inner widget renders at its natural size; scale shrinks it visually.
  // overflow-hidden clips any bleed from the transform.
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
        }}
      >
        <HeroVerdict
          status={previewSignal.status}
          confidence={previewSignal.confidence}
          factors={previewSignal.factors}
          payback={previewSignal.payback}
          nextAction={previewSignal.nextAction}
          reason={previewSignal.reason}
          impact={previewSignal.impact}
        />
      </div>
    </div>
  )
}
