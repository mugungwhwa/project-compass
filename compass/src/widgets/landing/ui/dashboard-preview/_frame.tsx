"use client"

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

type PreviewFrameProps = {
  /** CSS transform scale applied to the child tree. Default: 0.65 */
  scale?: number
  /** Natural pixel width of the child tree (before scale). Default: 900 */
  naturalWidth?: number
  children: ReactNode
}

/**
 * Layout-aware preview wrapper for landing-page dashboard crops.
 *
 * Approach: the inner tree renders at its natural size (naturalWidth), so
 * Recharts, flex, grid, etc. see sensible dimensions. A `transform: scale`
 * shrinks the visual. A ResizeObserver measures the inner tree's rendered
 * height and reserves exactly `naturalWidth * scale` × `renderedHeight *
 * scale` on the outer box, so the parent layout is correct and nothing is
 * clipped. Unlike CSS `zoom`, transform does not create a compositing layer
 * that conflicts with framer-motion or IntersectionObserver.
 */
export function PreviewFrame({
  scale = 0.65,
  naturalWidth = 900,
  children,
}: PreviewFrameProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [innerHeight, setInnerHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0
      setInnerHeight(h)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const outerWidth = naturalWidth * scale
  const outerHeight = innerHeight != null ? innerHeight * scale : undefined

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none rounded-[var(--radius-card)]"
      style={{
        width: outerWidth,
        height: outerHeight,
        overflow: "hidden",
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: naturalWidth,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  )
}
