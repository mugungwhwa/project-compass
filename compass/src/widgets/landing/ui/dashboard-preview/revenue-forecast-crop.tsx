"use client"

/**
 * revenue-forecast-crop.tsx
 * Landing page preview: Revenue forecast with downside/base/upside bands.
 * Wraps <RevenueForecast> in a layout-aware, interaction-disabled container.
 * Source widget: @/widgets/charts/ui/revenue-forecast
 */

import { RevenueForecast } from "@/widgets/charts/ui/revenue-forecast"
import { PreviewFrame } from "./_frame"
import { previewRevenueForecast, previewRevenueForecastMeta } from "./preview-fixtures"

type RevenueForecastCropProps = {
  /** CSS zoom applied to the child tree. Default: 0.65 */
  scale?: number
  /** Natural pixel width of the child tree (before zoom). Default: 860 */
  naturalWidth?: number
}

export function RevenueForecastCrop({
  scale = 0.65,
  naturalWidth = 860,
}: RevenueForecastCropProps) {
  return (
    <PreviewFrame scale={scale} naturalWidth={naturalWidth}>
      <RevenueForecast
        data={previewRevenueForecast}
        meta={previewRevenueForecastMeta}
      />
    </PreviewFrame>
  )
}
