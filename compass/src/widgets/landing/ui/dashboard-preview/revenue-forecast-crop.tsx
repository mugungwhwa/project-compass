"use client"

/**
 * revenue-forecast-crop.tsx
 * Landing page preview: Revenue forecast with downside/base/upside bands.
 * Wraps <RevenueForecast> in a scale-shrunk, interaction-disabled container.
 * Source widget: @/widgets/charts/ui/revenue-forecast
 */

import { RevenueForecast } from "@/widgets/charts/ui/revenue-forecast"
import { previewRevenueForecast, previewRevenueForecastMeta } from "./preview-fixtures"

type RevenueForecastCropProps = {
  /** CSS transform scale applied to the inner widget. Default: 0.65 */
  scale?: number
  /** Rendered width of the container in px. Default: 560 */
  width?: number
  /** Rendered height of the container in px. Default: 300 */
  height?: number
}

export function RevenueForecastCrop({
  scale = 0.65,
  width = 560,
  height = 300,
}: RevenueForecastCropProps) {
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
        <RevenueForecast
          data={previewRevenueForecast}
          meta={previewRevenueForecastMeta}
        />
      </div>
    </div>
  )
}
