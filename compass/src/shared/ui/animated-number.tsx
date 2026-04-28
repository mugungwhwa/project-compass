"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

type AnimatedNumberProps = {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  /** Decimal digits. If omitted, auto-detected: 0 for integers, 2 for floats. */
  decimals?: number
  className?: string
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1.2,
  decimals,
  className = "",
}: AnimatedNumberProps) {
  // Auto-detect decimals from the input so floats like 1.27 don't render as "1".
  const effectiveDecimals = decimals ?? (Number.isInteger(value) ? 0 : 2)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  // Start at the real value so SSR / pre-animation paint is correct.
  // Without this, every animated KPI flashes "0 <unit>" until useInView fires —
  // which leaks "0 days" / "0 months" cards into screenshots and demos.
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (!isInView) return

    const startTime = Date.now()

    const tick = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      // Ease out expo
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setDisplay(value)
      }
    }

    requestAnimationFrame(tick)
  }, [isInView, value, duration])

  return (
    <span ref={ref} className={`font-mono-num ${className}`}>
      {prefix}{effectiveDecimals > 0 ? display.toFixed(effectiveDecimals) : Math.round(display)}{suffix}
    </span>
  )
}
