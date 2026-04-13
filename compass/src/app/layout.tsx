import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif, Noto_Serif_KR } from "next/font/google"
import "@/styles/globals.css"
import { TooltipProvider } from "@/shared/ui/tooltip"
import { LocaleProvider } from "@/shared/i18n"

/*
  Font stack — Compass Design Migration (2026-04-07, KR 2026-04-09, refined 2026-04-13)
  --------------------------------------------------------------------------------------
  Geist Sans        → UI / Body / Headings (Latin)
  Pretendard        → UI / Body (Korean) — loaded via CDN, Geist-metric-compatible
  Geist Mono        → All numbers, code, API values (Latin)
  Instrument Serif  → Display / Decision statements (Latin)
  Noto Serif KR     → Display / Decision statements (Korean) — Bloomberg/FT authority

  Body: Geist Sans → Pretendard (Korean fallback) → system sans
  Decision text: Instrument Serif → Noto Serif KR (Korean fallback) → Georgia
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

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif-kr",
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
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${notoSerifKR.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <LocaleProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
