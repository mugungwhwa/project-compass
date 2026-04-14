"use client"

import type { ReactNode } from "react"

type PreviewFrameProps = {
  /** CSS zoom applied to the child tree. Default: 0.65 */
  scale?: number
  /** Natural pixel width of the child tree (before zoom). Default: 900 */
  naturalWidth?: number
  children: ReactNode
}

/**
 * Layout-aware preview wrapper for landing-page dashboard crops.
 * Uses CSS `zoom` (not `transform: scale`) so the parent layout correctly
 * reserves `naturalWidth * scale` width and `naturalHeight * scale` height.
 * No overflow clipping — the child renders at its natural size and zoom
 * scales the visual while shrinking the layout box.
 */
export function PreviewFrame({
  scale = 0.65,
  naturalWidth = 900,
  children,
}: PreviewFrameProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none rounded-[var(--radius-card)]"
      style={{ zoom: scale, width: naturalWidth }}
    >
      {children}
    </div>
  )
}
