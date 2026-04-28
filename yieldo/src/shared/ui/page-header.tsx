"use client"

import type { ReactNode } from "react"
import { useLocale } from "@/shared/i18n"
import type { TranslationKey } from "@/shared/i18n"

type PageHeaderProps = {
  titleKey: TranslationKey
  subtitleKey: TranslationKey
  /** Optional icon rendered before the title. */
  icon?: ReactNode
  /** Optional ReactNode body rendered after the i18n subtitle row. */
  description?: ReactNode
}

export function PageHeader({ titleKey, subtitleKey, icon, description }: PageHeaderProps) {
  const { t, locale } = useLocale()

  return (
    <div className="mb-6">
      <h1
        className="text-foreground font-bold flex items-center gap-3"
        style={{ fontSize: "var(--tds-t2-size)", lineHeight: "var(--tds-t2-line)" }}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {t(titleKey)}
      </h1>
      <p
        className="mt-1 text-muted-foreground flex items-center gap-2"
        style={{ fontSize: "var(--tds-t6-size)", lineHeight: "var(--tds-t6-line)" }}
      >
        {t(subtitleKey)}
        <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-foreground/60">
          {locale === "en" ? "Sample data" : "샘플 데이터"}
        </span>
      </p>
      {description && (
        <div className="mt-3 text-sm md:text-base text-muted-foreground">
          {description}
        </div>
      )}
    </div>
  )
}
