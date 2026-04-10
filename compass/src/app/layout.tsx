import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif, Noto_Sans_KR } from "next/font/google"
import "@/styles/globals.css"
import { TooltipProvider } from "@/shared/ui/tooltip"
import { LocaleProvider } from "@/shared/i18n"

/*
  Font stack — Compass Design Migration (2026-04-07, KR added 2026-04-09)
  ------------------------------------------------------------------------
  Geist Sans        → UI / Body / Headings (Latin)
  Geist Mono        → All numbers, code, API values (Latin)
  Instrument Serif  → Display / Hero insights (decision statements only)
  Noto Sans KR      → Korean fallback glyphs (chained via CSS font-family)

  CSS font-family chains Latin fonts first, then Noto Sans KR — the browser
  automatically falls back to Noto Sans KR for Korean characters while
  Latin characters still render in Geist. This produces a consistent
  mixed-script appearance across the UI.

  See: docs/Project_Compass_Design_Migration_Log.md §1.2
*/

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-kr",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: "project compass — Experiment-to-Investment Decision OS",
  description:
    "Translate A/B tests, live ops, and market signals into capital allocation decisions. Built for mobile gaming operators.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${notoSansKR.variable}`}
    >
      <body>
        <LocaleProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
