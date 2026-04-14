"use client"

/**
 * revenue-vs-investment-crop.tsx
 * Landing page preview: Revenue vs UA Spend chart with BEP line.
 * Wraps <RevenueVsInvest> in a layout-aware, interaction-disabled container.
 * Source widget: @/widgets/charts/ui/revenue-vs-invest
 */

import { RevenueVsInvest } from "@/widgets/charts/ui/revenue-vs-invest"
import { PreviewFrame } from "./_frame"
import { previewRevenueVsInvest } from "./preview-fixtures"

type RevenueVsInvestmentCropProps = {
  /** CSS zoom applied to the child tree. Default: 0.65 */
  scale?: number
  /** Natural pixel width of the child tree (before zoom). Default: 860 */
  naturalWidth?: number
}

export function RevenueVsInvestmentCrop({
  scale = 0.65,
  naturalWidth = 860,
}: RevenueVsInvestmentCropProps) {
  return (
    <PreviewFrame scale={scale} naturalWidth={naturalWidth}>
      <RevenueVsInvest data={previewRevenueVsInvest} />
    </PreviewFrame>
  )
}
