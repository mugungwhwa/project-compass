import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import "@/styles/globals.css"
import { TooltipProvider } from "@/shared/ui/tooltip"
import { LocaleProvider } from "@/shared/i18n"

/*
  Font stack — yieldo Design Migration (2026-04-07, KR 2026-04-09, refined 2026-04-13)
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

// NOTE: Noto Serif KR is loaded via Google Fonts CSS link in <head> below
// (not next/font/google) because Next.js' type defs for Noto_Serif_KR
// omit the "korean" subset, which is required for 한글 glyphs to actually
// load. Without Korean glyphs, the browser falls back to system sans-serif
// (Apple SD Gothic Neo), which is why Korean decision text looked "고딕".
// Direct CDN load with subset=korean in the URL includes the 한글 glyphs.

export const metadata: Metadata = {
  title: "yieldo — Operating Intelligence Terminal",
  description:
    "From signal to yield, executed. Translate A/B tests, live ops, and market signals into daily capital allocation decisions for mobile gaming operators.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap&subset=korean"
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
