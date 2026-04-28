"use client"

/*
  AppSidebar — right-side navigation panel.
  -------------------------------------------
  2026-04-10: Game selector moved from footer to top (below logo).
  Only ONE game selector in the entire app — sidebar owns the global context.
  No duplicate in PageHeader.

  See: docs/Project_yieldo_Design_Migration_Log.md
*/

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "@/shared/i18n"
import { cn } from "@/shared/lib"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  Zap,
  FlaskConical,
  Wallet,
  Settings,
  User,
  Globe,
} from "lucide-react"
import { Separator } from "@/shared/ui/separator"

const navItems = [
  { key: "nav.executive" as const, href: "/dashboard",             icon: BarChart3 },
  { key: "nav.marketGap" as const, href: "/dashboard/market-gap",  icon: TrendingUp },
  { key: "nav.actions" as const,   href: "/dashboard/actions",     icon: Zap },
  { key: "nav.experiments" as const, href: "/dashboard/experiments", icon: FlaskConical },
  { key: "nav.capital" as const,   href: "/dashboard/capital",     icon: Wallet },
]

const settingsItems = [
  { key: "nav.integrations" as const, href: "#", icon: Settings },
  { key: "nav.account" as const,      href: "#", icon: User },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { t, toggleLocale } = useLocale()

  return (
    <aside className="flex h-full w-[192px] flex-col border-l border-[var(--border-default)] bg-[var(--bg-1)] flex-shrink-0 pb-20">
      {/* Decision nav — logo lives in top status bar only */}
      <nav className="flex-1 px-2.5 pt-4">
        <p className="mb-1.5 px-2 text-[13px] font-semibold uppercase tracking-wider text-[var(--fg-2)]">
          {t("nav.decision")}
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative mb-0.5 flex items-center gap-2 rounded-[var(--radius-card)] px-2 py-2 text-body font-medium transition-all duration-[var(--duration-micro)] cursor-pointer",
                isActive
                  ? "text-[var(--brand)]"
                  : "text-[var(--fg-1)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-[var(--radius-card)] bg-[var(--brand-tint)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex min-w-0 items-center gap-2">
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t(item.key)}</span>
              </span>
            </Link>
          )
        })}

        <Separator className="my-2.5" />

        <p className="mb-1.5 px-2 text-[13px] font-semibold uppercase tracking-wider text-[var(--fg-2)]">
          {t("nav.settings")}
        </p>
        {settingsItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="mb-0.5 flex items-center gap-2 rounded-[var(--radius-card)] px-2 py-2 text-body font-medium text-[var(--fg-1)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)] transition-all duration-[var(--duration-micro)] cursor-pointer"
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{t(item.key)}</span>
          </Link>
        ))}
      </nav>

      {/* Footer: Language toggle only (game selector moved to top) */}
      <div className="border-t border-[var(--border-default)] px-3 py-3">
        <button
          onClick={toggleLocale}
          className="flex w-full items-center gap-2 rounded-[var(--radius-card)] px-2.5 py-1.5 text-caption text-[var(--fg-2)] hover:bg-[var(--bg-3)] transition-all duration-[var(--duration-micro)] cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5" />
          {t("common.language")}
        </button>
      </div>
    </aside>
  )
}
