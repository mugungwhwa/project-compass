"use client"

type EyebrowProps = {
  label: string
}

export function Eyebrow({ label }: EyebrowProps) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-2)] mb-3">
      {label}
    </p>
  )
}
