import type { ReactNode } from "react"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-0)] text-[var(--fg-0)]">
      {children}
    </div>
  )
}
