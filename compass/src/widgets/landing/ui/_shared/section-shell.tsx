"use client"

import type { ReactNode } from "react"

type BgBand = "bg-0" | "bg-1" | "bg-2"

type SectionShellProps = {
  id?: string
  band?: BgBand
  maxWidth?: "max-w-6xl" | "max-w-7xl"
  className?: string
  children: ReactNode
  borderY?: boolean
}

export function SectionShell({
  id,
  band = "bg-0",
  maxWidth = "max-w-6xl",
  className = "",
  children,
  borderY = false,
}: SectionShellProps) {
  const bg =
    band === "bg-0"
      ? "bg-[var(--bg-0)]"
      : band === "bg-1"
      ? "bg-[var(--bg-1)]"
      : "bg-[var(--bg-2)]"

  const border = borderY ? "border-y border-[var(--border-subtle)]" : ""

  return (
    <section
      id={id}
      className={`py-12 md:py-16 lg:py-24 ${bg} ${border} ${className}`}
    >
      <div className={`${maxWidth} mx-auto px-6`}>{children}</div>
    </section>
  )
}
