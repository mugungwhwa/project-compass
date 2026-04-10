"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

type AnimatedNumberProps = {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
  className?: string
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1.2,
  decimals = 0,
  className = "",
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

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
      {prefix}{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}{suffix}
    </span>
  )
}
