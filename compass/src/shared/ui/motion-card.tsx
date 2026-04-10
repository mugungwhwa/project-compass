"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

type MotionCardProps = {
  children: ReactNode
  index?: number
  className?: string
}

export function MotionCard({ children, index = 0, className = "" }: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
