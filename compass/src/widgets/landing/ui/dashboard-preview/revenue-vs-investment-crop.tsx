"use client"

/**
 * revenue-vs-investment-crop.tsx
 * Landing page preview: Revenue vs UA Spend chart with BEP line.
 * Wraps <RevenueVsInvest> in a scale-shrunk, interaction-disabled container.
 * Source widget: @/widgets/charts/ui/revenue-vs-invest
 */

import { RevenueVsInvest } from "@/widgets/charts/ui/revenue-vs-invest"
import { previewRevenueVsInvest } from "./preview-fixtures"

type RevenueVsInvestmentCropProps = {
  /** CSS transform scale applied to the inner widget. Default: 0.65 */
  scale?: number
  /** Rendered width of the container in px. Default: 560 */
  width?: number
  /** Rendered height of the container in px. Default: 320 */
  height?: number
}

export function RevenueVsInvestmentCrop({
  scale = 0.65,
  width = 560,
  height = 320,
}: RevenueVsInvestmentCropProps) {
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
          // Give the inner chart a fixed height so ResponsiveContainer resolves
          height: `${Math.round(height / scale)}px`,
        }}
      >
        <RevenueVsInvest data={previewRevenueVsInvest} />
      </div>
    </div>
  )
}
