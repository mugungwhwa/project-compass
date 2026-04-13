"use client"

import { motion } from "framer-motion"

export type ExpandButtonProps = {
  expanded: boolean
  onToggle: () => void
}

/**
 * Expand/collapse toggle button for chart cards.
 * Renders a minimal expand-arrows icon that rotates 45deg on expand.
 */
export function ExpandButton({ expanded, onToggle }: ExpandButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={expanded ? "Collapse chart" : "Expand chart"}
      aria-expanded={expanded}
      className="rounded-[var(--radius-inline)] p-1.5 text-[var(--fg-2)] hover:text-[var(--fg-0)] hover:bg-[var(--bg-3)] transition-colors"
      style={{ transitionDuration: "var(--duration-micro)" }}
    >
      <motion.svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        animate={{ rotate: expanded ? 45 : 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <path
          d="M10 2h4v4M6 14H2v-4M14 2L9.5 6.5M2 14l4.5-4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </button>
  )
}
