"use client"

/**
 * payback-crop.tsx
 * Landing page preview: Payback gauge + headline number.
 * Wraps <SignalCard> (which contains the payback gauge bar) in a
 * scale-shrunk, interaction-disabled container.
 * Source widget: @/widgets/dashboard/ui/signal-card
 */

import { SignalCard } from "@/widgets/dashboard/ui/signal-card"
import { previewSignal } from "./preview-fixtures"

type PaybackCropProps = {
  /** CSS transform scale applied to the inner widget. Default: 0.7 */
  scale?: number
  /** Rendered width of the container in px. Default: 480 */
  width?: number
  /** Rendered height of the container in px. Default: 280 */
  height?: number
}

export function PaybackCrop({ scale = 0.7, width = 480, height = 280 }: PaybackCropProps) {
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
        <SignalCard
          status={previewSignal.status}
          confidence={previewSignal.confidence}
          factors={previewSignal.factors}
          payback={previewSignal.payback}
        />
      </div>
    </div>
  )
}
