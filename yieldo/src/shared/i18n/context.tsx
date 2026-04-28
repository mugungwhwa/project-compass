"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { type Locale, type TranslationKey, translate } from "./dictionary"

type I18nContextType = {
  locale: Locale
  toggleLocale: () => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("yieldo-locale") as Locale) || "en"
    }
    return "en"
  })

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "ko" ? "en" : "ko"
      localStorage.setItem("yieldo-locale", next)
      return next
    })
  }, [])

  const t = useCallback(
    (key: TranslationKey) => translate(key, locale),
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useLocale must be used within LocaleProvider")
  return context
}
