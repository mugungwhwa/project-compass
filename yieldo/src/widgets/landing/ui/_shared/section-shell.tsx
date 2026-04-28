"use client"

import type { ReactNode } from "react"

type BgBand = "bg-0" | "bg-1" | "bg-2" | "dark"

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
  maxWidth = "max-w-7xl",
  className = "",
  children,
  borderY = false,
}: SectionShellProps) {
  const bg =
    band === "dark"
      ? "bg-[#0A0E14]"
      : band === "bg-0"
      ? "bg-[var(--bg-0)]"
      : band === "bg-1"
      ? "bg-[var(--bg-1)]"
      : "bg-[var(--bg-2)]"

  const border = borderY ? "border-y border-[var(--border-subtle)]" : ""

  return (
    <section
      id={id}
      className={`py-32 lg:py-40 ${bg} ${border} ${className}`}
    >
      <div className={`${maxWidth} mx-auto px-6`}>{children}</div>
    </section>
  )
}
