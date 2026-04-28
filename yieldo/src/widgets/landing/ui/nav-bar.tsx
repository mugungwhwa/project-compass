"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { YieldoLogo } from "@/shared/ui/yieldo-logo"
import { useLocale } from "@/shared/i18n/context"
import { cn } from "@/shared/lib/utils"

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const { locale, toggleLocale } = useLocale()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between",
        "px-6 h-14 transition-all duration-[220ms]",
        scrolled
          ? "bg-[var(--bg-0)]/80 backdrop-blur-sm border-b border-[var(--border-subtle)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <Link href="/" aria-label="yieldo 홈">
        <YieldoLogo size="md" variant="full" />
      </Link>

      <nav className="flex items-center gap-5">
        <button
          onClick={toggleLocale}
          className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-[var(--radius-inline)]",
            "border border-[var(--border-default)] text-[var(--fg-2)]",
            "hover:text-[var(--fg-0)] hover:border-[var(--border-strong)]",
            "transition-colors duration-[120ms]"
          )}
        >
          {locale === "ko" ? "EN" : "한국어"}
        </button>
        <Link
          href="/login"
          className={cn(
            "text-sm font-medium text-[var(--fg-1)] hover:text-[var(--fg-0)]",
            "transition-colors duration-[120ms]"
          )}
        >
          {locale === "ko" ? "로그인" : "Login"}
        </Link>
      </nav>
    </motion.header>
  )
}
