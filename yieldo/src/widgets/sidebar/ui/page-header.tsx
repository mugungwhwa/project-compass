"use client"

/*
  PageHeader — module page title bar.
  ------------------------------------
  Simplified 2026-04-10: removed non-functional game selector, period selector,
  and export button. These were mock UI that looked clickable but did nothing —
  violating the "if it looks clickable, it must work" principle.

  - Game selector now lives ONCE in sidebar top (global context switcher)
  - Period selector removed entirely — yieldo is a "current state" decision tool,
    not an analytics tool. Per-chart time filters will be added where needed.
  - Export removed — will return as per-chart icons when real PDF/CSV is built.
  - "5분 전" timestamp → "Sample data" badge (honest about demo state)

  See: docs/Project_yieldo_Design_Migration_Log.md §7
*/

import { useLocale } from "@/shared/i18n"
import type { TranslationKey } from "@/shared/i18n"

type PageHeaderProps = {
  titleKey: TranslationKey
  subtitleKey: TranslationKey
}

export function PageHeader({ titleKey, subtitleKey }: PageHeaderProps) {
  const { t, locale } = useLocale()

  return (
    <div className="mb-6">
      <h1 className="text-h1 text-[var(--fg-0)]">
        {t(titleKey)}
      </h1>
      <p className="mt-1 text-body text-[var(--fg-2)]">
        {t(subtitleKey)}
        <span className="ml-2 inline-flex items-center rounded-[var(--radius-inline)] bg-[var(--bg-3)] px-1.5 py-0.5 text-caption text-[var(--fg-3)]">
          {locale === "en" ? "Sample data" : "샘플 데이터"}
        </span>
      </p>
    </div>
  )
}
