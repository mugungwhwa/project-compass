# Compass MVP Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully navigable 5-module investment decision dashboard with rich layered charts, Korean/English toggle, and dummy data for 예비창업패키지 demo.

**Architecture:** Next.js 15 App Router with route groups — `(auth)` for login shell, `(dashboard)` for 5 modules sharing a sidebar layout. All data is static mock from `lib/mock-data.ts`. Charts use Recharts with dual confidence bands. i18n via simple dictionary + React Context.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts, Lucide React

---

## File Map

### Create

| File | Responsibility |
|------|---------------|
| `src/app/layout.tsx` | Root layout — Inter font, html lang, body class |
| `src/app/page.tsx` | Root redirect → `/dashboard` |
| `src/app/(auth)/layout.tsx` | Auth layout — centered card |
| `src/app/(auth)/login/page.tsx` | Dummy login page |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout — SidebarProvider + sidebar + main content |
| `src/app/(dashboard)/page.tsx` | Module 1: Executive Overview |
| `src/app/(dashboard)/market-gap/page.tsx` | Module 2: Market Gap |
| `src/app/(dashboard)/actions/page.tsx` | Module 3: Action Impact |
| `src/app/(dashboard)/experiments/page.tsx` | Module 4: Experiment Board |
| `src/app/(dashboard)/capital/page.tsx` | Module 5: Capital Console |
| `src/components/layout/app-sidebar.tsx` | Left sidebar with nav, game selector, language toggle |
| `src/components/layout/page-header.tsx` | Page title + subtitle + filter dropdowns |
| `src/components/layout/kpi-cards.tsx` | Reusable KPI card row |
| `src/components/layout/signal-card.tsx` | Investment signal card (invest/hold/reduce) |
| `src/components/charts/retention-curve.tsx` | Rich layered retention chart |
| `src/components/charts/revenue-forecast.tsx` | Revenue fan chart |
| `src/components/charts/action-timeline.tsx` | Action timeline composed chart |
| `src/components/charts/experiment-bar.tsx` | Experiment ROI horizontal bar |
| `src/components/charts/scenario-simulator.tsx` | Slider + real-time chart |
| `src/components/charts/budget-donut.tsx` | Budget allocation pie chart |
| `src/components/charts/cohort-heatmap.tsx` | CSS grid heatmap |
| `src/components/charts/market-benchmark.tsx` | My game vs genre band overlay |
| `src/components/charts/saturation-bar.tsx` | Market saturation bar chart |
| `src/lib/mock-data.ts` | All dummy data |
| `src/lib/i18n.ts` | Korean/English dictionary |
| `src/lib/i18n-context.tsx` | LocaleProvider + useLocale hook |
| `src/lib/utils.ts` | cn() utility |
| `src/styles/globals.css` | Tailwind base + custom chart vars |
| `tailwind.config.ts` | Tailwind config |
| `next.config.ts` | Next.js config |
| `tsconfig.json` | TypeScript config |
| `postcss.config.mjs` | PostCSS for Tailwind v4 |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `src/styles/globals.css`, `src/lib/utils.ts`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/mike/Downloads/Compass
npx create-next-app@latest compass --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

When prompted, accept defaults. This creates the `compass/` subdirectory with full Next.js 15 setup.

- [ ] **Step 2: Move into project and install dependencies**

```bash
cd /Users/mike/Downloads/Compass/compass
npm install recharts lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-tooltip @radix-ui/react-separator
```

- [ ] **Step 3: Create `src/lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

export function formatPercent(value: number): string {
  return `${value}%`
}
```

- [ ] **Step 4: Update `src/styles/globals.css` for Tailwind v4**

```css
@import "tailwindcss";

:root {
  --background: #F8FAFC;
  --card: #FFFFFF;
  --border: #E2E8F0;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --text-muted: #94A3B8;
  --brand: #2563EB;
  --brand-light: #EFF6FF;
  --signal-green: #16A34A;
  --signal-green-bg: #F0FDF4;
  --signal-green-border: #BBF7D0;
  --signal-amber: #D97706;
  --signal-amber-bg: #FFFBEB;
  --signal-amber-border: #FDE68A;
  --signal-red: #DC2626;
  --signal-red-bg: #FEF2F2;
  --signal-red-border: #FECACA;
  --chart-primary: #2563EB;
  --chart-benchmark: #F59E0B;
  --chart-asymptotic: #22C55E;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--background);
  color: var(--text-primary);
}
```

- [ ] **Step 5: Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Compass — Investment Decision OS",
  description: "Capital Allocation Intelligence for Mobile Gaming",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 6: Update `src/app/page.tsx` to redirect**

```tsx
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/dashboard")
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
cd /Users/mike/Downloads/Compass/compass
npm run dev
```

Expected: Server starts on http://localhost:3000, redirects to /dashboard (will 404 — that's correct for now).

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 15 project with Tailwind, Recharts, shadcn/ui deps"
```

---

## Task 2: shadcn/ui Setup

**Files:**
- Create: `components.json`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/select.tsx`, `src/components/ui/separator.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/slider.tsx`, `src/components/ui/sidebar.tsx`, `src/components/ui/tooltip.tsx`, `src/components/ui/table.tsx`, `src/components/ui/sheet.tsx`

- [ ] **Step 1: Initialize shadcn/ui**

```bash
cd /Users/mike/Downloads/Compass/compass
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

- [ ] **Step 2: Add required components**

```bash
npx shadcn@latest add button card select separator badge slider sidebar tooltip table sheet
```

This generates all needed UI components into `src/components/ui/`.

- [ ] **Step 3: Verify components are generated**

```bash
ls src/components/ui/
```

Expected: `button.tsx`, `card.tsx`, `select.tsx`, `separator.tsx`, `badge.tsx`, `slider.tsx`, `sidebar.tsx`, `tooltip.tsx`, `table.tsx`, `sheet.tsx` (plus any dependencies like `input.tsx`).

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: add shadcn/ui components (button, card, select, sidebar, table, etc.)"
```

---

## Task 3: i18n Infrastructure

**Files:**
- Create: `src/lib/i18n.ts`, `src/lib/i18n-context.tsx`

- [ ] **Step 1: Create `src/lib/i18n.ts`**

```typescript
export type Locale = "ko" | "en"

const dictionary = {
  // Sidebar navigation
  "nav.decision":        { ko: "의사결정",         en: "Decision" },
  "nav.executive":       { ko: "투자 판정 요약",    en: "Executive Overview" },
  "nav.marketGap":       { ko: "시장 격차 분석",    en: "Market Gap" },
  "nav.actions":         { ko: "액션 임팩트",       en: "Action Impact" },
  "nav.experiments":     { ko: "실험 투자 보드",    en: "Experiment Board" },
  "nav.capital":         { ko: "자본 배분 콘솔",    en: "Capital Console" },
  "nav.settings":        { ko: "설정",             en: "Settings" },
  "nav.integrations":    { ko: "연동 관리",         en: "Integrations" },
  "nav.account":         { ko: "계정",             en: "Account" },

  // Module titles (decision-first questions)
  "exec.title":          { ko: "추가 투자가 가능한가?",       en: "Can We Invest More?" },
  "exec.subtitle":       { ko: "투자 판정 요약",              en: "Executive Overview" },
  "market.title":        { ko: "우리는 어디에 있는가?",       en: "Where Do We Stand?" },
  "market.subtitle":     { ko: "시장 격차 분석",              en: "Market Gap Analysis" },
  "actions.title":       { ko: "실제로 효과가 있는 것은?",     en: "What's Actually Working?" },
  "actions.subtitle":    { ko: "액션 임팩트 보드",             en: "Action Impact Board" },
  "experiments.title":   { ko: "R&D가 성과를 내고 있는가?",   en: "Is R&D Paying Off?" },
  "experiments.subtitle":{ ko: "실험 투자 보드",               en: "Experiment Investment Board" },
  "capital.title":       { ko: "다음에 무엇을 해야 하는가?",   en: "What Should We Do Next?" },
  "capital.subtitle":    { ko: "자본 배분 콘솔",               en: "Capital Allocation Console" },

  // Signal
  "signal.invest":       { ko: "투자",     en: "INVEST" },
  "signal.hold":         { ko: "유지",     en: "HOLD" },
  "signal.reduce":       { ko: "축소",     en: "REDUCE" },
  "signal.confidence":   { ko: "신뢰도",   en: "Confidence" },

  // KPI labels
  "kpi.payback":         { ko: "회수 기간",        en: "Payback Period" },
  "kpi.roas":            { ko: "ROAS D30",        en: "ROAS D30" },
  "kpi.bep":             { ko: "BEP 확률",        en: "BEP Probability" },
  "kpi.burn":            { ko: "잔여 운영 기간",    en: "Burn Tolerance" },
  "kpi.capitalEff":      { ko: "자본 효율성",      en: "Capital Efficiency" },
  "kpi.irr":             { ko: "내부수익률",        en: "IRR" },
  "kpi.npv":             { ko: "순현재가치",        en: "NPV" },
  "kpi.genreRank":       { ko: "장르 내 순위",      en: "Genre Rank" },
  "kpi.d7vsAvg":         { ko: "D7 vs 장르 평균",  en: "D7 vs Genre Avg" },
  "kpi.revenueGap":      { ko: "매출 격차",        en: "Revenue Gap" },
  "kpi.totalActions":    { ko: "총 액션 수",        en: "Total Actions" },
  "kpi.avgImpact":       { ko: "평균 임팩트",       en: "Avg Impact" },
  "kpi.bestAction":      { ko: "최고 효과 액션",    en: "Best Action" },
  "kpi.velocity":        { ko: "실험 속도",         en: "Velocity" },
  "kpi.shipRate":        { ko: "출시율",            en: "Ship Rate" },
  "kpi.winRate":         { ko: "성공률",            en: "Win Rate" },
  "kpi.cumDeltaLtv":     { ko: "누적 ΔLTV",        en: "Cum. ΔLTV" },

  // Chart labels
  "chart.retention":     { ko: "리텐션 커브",           en: "Retention Curve" },
  "chart.p50":           { ko: "P50 (중앙값)",          en: "P50 (Median)" },
  "chart.bandOuter":     { ko: "P10-P90 신뢰구간",      en: "P10-P90 Band" },
  "chart.bandInner":     { ko: "P25-P75 신뢰구���",      en: "P25-P75 Band" },
  "chart.genreAvg":      { ko: "장르 평균",              en: "Genre Average" },
  "chart.asymptotic":    { ko: "안정화 도달점",           en: "Asymptotic Arrival" },
  "chart.revenue":       { ko: "매출 예측",              en: "Revenue Forecast" },
  "chart.scenario":      { ko: "시나리오 시뮬레이터",      en: "Scenario Simulator" },
  "chart.budgetAlloc":   { ko: "예산 배분",              en: "Budget Allocation" },
  "chart.benchmark":     { ko: "벤치마크 비교",           en: "Benchmark Comparison" },
  "chart.saturation":    { ko: "시장 포화도",             en: "Market Saturation" },
  "chart.actionTimeline":{ ko: "액션 타임라인",           en: "Action Timeline" },
  "chart.experimentRoi": { ko: "실험 ROI",               en: "Experiment ROI" },
  "chart.revenueProj":   { ko: "3개년 매출 전망",         en: "3-Year Revenue Projection" },

  // Table headers
  "table.day":           { ko: "일차",     en: "Day" },
  "table.retention":     { ko: "리텐션",    en: "Retention" },
  "table.vsGenre":       { ko: "vs 장르",   en: "vs Genre" },
  "table.rank":          { ko: "순위",      en: "Rank" },
  "table.name":          { ko: "이름",      en: "Name" },
  "table.date":          { ko: "날짜",      en: "Date" },
  "table.type":          { ko: "유형",      en: "Type" },
  "table.description":   { ko: "설명",      en: "Description" },
  "table.deltaLtv":      { ko: "ΔLTV",     en: "ΔLTV" },
  "table.confidence":    { ko: "신뢰도",    en: "Confidence" },
  "table.ate":           { ko: "ATE",      en: "ATE" },
  "table.annualRevenue": { ko: "연간 매출",  en: "Annual Revenue" },
  "table.roi":           { ko: "ROI",      en: "ROI" },
  "table.status":        { ko: "상태",      en: "Status" },
  "table.decision":      { ko: "판정",      en: "Decision" },
  "table.d1":            { ko: "D1",       en: "D1" },
  "table.d7":            { ko: "D7",       en: "D7" },
  "table.d30":           { ko: "D30",      en: "D30" },
  "table.revenue":       { ko: "매출",      en: "Revenue" },

  // Experiment status
  "exp.shipped":         { ko: "출시됨",    en: "Shipped" },
  "exp.running":         { ko: "진행중",    en: "Running" },
  "exp.reverted":        { ko: "롤백됨",    en: "Reverted" },
  "exp.win":             { ko: "성공",      en: "Win" },
  "exp.lose":            { ko: "실패",      en: "Lose" },
  "exp.pending":         { ko: "대기중",    en: "Pending" },

  // Action types
  "action.ua":           { ko: "UA 캠페인",    en: "UA Campaign" },
  "action.liveops":      { ko: "라이브 운영",   en: "Live Ops" },
  "action.release":      { ko: "릴리즈",        en: "Release" },

  // Scenario simulator
  "scenario.uaBudget":   { ko: "UA 예산",           en: "UA Budget" },
  "scenario.targetRoas": { ko: "목표 ROAS",         en: "Target ROAS" },
  "scenario.paybackChange": { ko: "회수 기간 변화",  en: "Payback Change" },
  "scenario.bepChange":  { ko: "BEP 확률 변화",      en: "BEP Probability Change" },

  // AI Recommendation
  "ai.recommendation":   { ko: "AI 권고",    en: "AI Recommendation" },
  "ai.investMsg":        { ko: "현재 데이터 기준, 추가 투자를 권장합니다. D7 리텐션이 장르 상위 25%에 위치하며, 페이백 기간이 안정적으로 단축되고 있습니다.",
                           en: "Based on current data, we recommend additional investment. D7 retention ranks in the top 25% of genre, and payback period is steadily decreasing." },

  // Common
  "common.days":         { ko: "일",       en: "days" },
  "common.months":       { ko: "개월",     en: "months" },
  "common.export":       { ko: "내보내기",  en: "Export" },
  "common.lastUpdated":  { ko: "최종 업데이트", en: "Last updated" },
  "common.game":         { ko: "게임",      en: "Game" },
  "common.period":       { ko: "기간",      en: "Period" },
  "common.minAgo":       { ko: "분 전",     en: "min ago" },
  "common.language":     { ko: "English",   en: "한국어" },
} as const

export type TranslationKey = keyof typeof dictionary

export function translate(key: TranslationKey, locale: Locale): string {
  return dictionary[key][locale]
}
```

- [ ] **Step 2: Create `src/lib/i18n-context.tsx`**

```tsx
"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { type Locale, type TranslationKey, translate } from "./i18n"

type I18nContextType = {
  locale: Locale
  toggleLocale: () => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("compass-locale") as Locale) || "ko"
    }
    return "ko"
  })

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "ko" ? "en" : "ko"
      localStorage.setItem("compass-locale", next)
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
```

- [ ] **Step 3: Verify files compile**

```bash
cd /Users/mike/Downloads/Compass/compass
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/i18n.ts src/lib/i18n-context.tsx
git commit -m "feat: add Korean/English i18n dictionary and React context"
```

---

## Task 4: Mock Data

**Files:**
- Create: `src/lib/mock-data.ts`

- [ ] **Step 1: Create `src/lib/mock-data.ts`**

```typescript
// ============================================================
// Compass MVP — Mock Data
// All dummy data for 5 dashboard modules
// ============================================================

// --- Types ---

export type SignalStatus = "invest" | "hold" | "reduce"

export type RetentionDataPoint = {
  day: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  genre: number
}

export type KPIData = {
  value: number
  unit: string
  trend: number
  trendLabel: string
}

export type ExperimentData = {
  id: number
  name: string
  ate: number
  deltaLtv: number
  annualRevenue: number
  roi: number
  status: "shipped" | "running" | "reverted"
  decision: "win" | "lose" | "pending"
}

export type ActionData = {
  date: string
  type: "ua" | "liveops" | "release"
  description: string
  deltaLtv: number
  confidence: number
}

export type CompetitorData = {
  rank: number
  name: string
  d1: number
  d7: number
  d30: number
  revenue: string
}

export type BudgetSlice = {
  name: string
  value: number
  color: string
}

export type RevenueForecastPoint = {
  month: string
  p10: number
  p50: number
  p90: number
}

export type ScenarioResult = {
  uaBudget: number
  paybackDays: number
  bepProbability: number
  monthlyRevenue: number
}

// --- Module 1: Executive Overview ---

export const mockRetention: {
  gameId: string
  gameName: string
  cohort: string
  genre: string
  data: RetentionDataPoint[]
  asymptoticDay: number
} = {
  gameId: "puzzle-quest",
  gameName: "Puzzle Quest",
  cohort: "2026-03",
  genre: "Puzzle",
  data: [
    { day: 1,  p10: 38, p25: 40, p50: 42.3, p75: 45, p90: 47, genre: 34.1 },
    { day: 2,  p10: 28, p25: 30, p50: 33.1, p75: 36, p90: 38, genre: 26.5 },
    { day: 3,  p10: 22, p25: 25, p50: 27.8, p75: 30, p90: 33, genre: 22.0 },
    { day: 5,  p10: 17, p25: 19, p50: 22.4, p75: 25, p90: 28, genre: 17.8 },
    { day: 7,  p10: 14, p25: 16, p50: 18.7, p75: 21, p90: 23, genre: 14.2 },
    { day: 14, p10: 9,  p25: 11, p50: 13.2, p75: 15, p90: 17, genre: 9.8  },
    { day: 21, p10: 7,  p25: 9,  p50: 10.8, p75: 13, p90: 15, genre: 8.0  },
    { day: 30, p10: 5,  p25: 7,  p50: 8.5,  p75: 10, p90: 12, genre: 6.4  },
    { day: 45, p10: 4,  p25: 5.5,p50: 7.2,  p75: 9,  p90: 10.5,genre: 5.1 },
    { day: 60, p10: 3,  p25: 5,  p50: 6.1,  p75: 8,  p90: 9,  genre: 4.2  },
  ],
  asymptoticDay: 30,
}

export const mockSignal = {
  status: "invest" as SignalStatus,
  confidence: 87,
  reason: {
    ko: "D7 리텐션 장르 상위 25%, 페이백 안정적 단축 중",
    en: "D7 retention in genre top 25%, stable payback reduction",
  },
}

export const mockKPIs = {
  payback:  { value: 47,   unit: "days",   trend: -12,  trendLabel: "faster" },
  roas:     { value: 142,  unit: "%",      trend: 8.3,  trendLabel: "up" },
  bep:      { value: 87,   unit: "%",      trend: 3.1,  trendLabel: "up" },
  burn:     { value: 8.2,  unit: "months", trend: 0.5,  trendLabel: "up" },
}

export const mockRevenueForecast: RevenueForecastPoint[] = [
  { month: "Jan", p10: 95,  p50: 105, p90: 115 },
  { month: "Feb", p10: 90,  p50: 110, p90: 130 },
  { month: "Mar", p10: 88,  p50: 118, p90: 148 },
  { month: "Apr", p10: 82,  p50: 120, p90: 165 },
  { month: "May", p10: 75,  p50: 135, p90: 200 },
  { month: "Jun", p10: 65,  p50: 148, p90: 240 },
  { month: "Jul", p10: 58,  p50: 155, p90: 270 },
  { month: "Aug", p10: 50,  p50: 162, p90: 300 },
  { month: "Sep", p10: 45,  p50: 168, p90: 325 },
  { month: "Oct", p10: 40,  p50: 175, p90: 350 },
  { month: "Nov", p10: 35,  p50: 180, p90: 370 },
  { month: "Dec", p10: 32,  p50: 185, p90: 390 },
]

// --- Module 2: Market Gap ---

export const mockMarketKPIs = {
  genreRank:  { value: 3,    unit: "#",  trend: 1,    trendLabel: "up" },
  d7vsAvg:    { value: 4.5,  unit: "pp", trend: 0.8,  trendLabel: "up" },
  revenueGap: { value: -26,  unit: "M",  trend: 5,    trendLabel: "narrowing" },
}

export const mockCompetitors: CompetitorData[] = [
  { rank: 1,  name: "Candy Crush Saga",    d1: 45.2, d7: 22.1, d30: 12.3, revenue: "$45M" },
  { rank: 2,  name: "Royal Match",         d1: 43.8, d7: 20.5, d30: 11.1, revenue: "$38M" },
  { rank: 3,  name: "Puzzle Quest",        d1: 42.3, d7: 18.7, d30: 8.5,  revenue: "$12M" },
  { rank: 4,  name: "Homescapes",          d1: 40.1, d7: 17.3, d30: 7.8,  revenue: "$28M" },
  { rank: 5,  name: "Gardenscapes",        d1: 39.5, d7: 16.8, d30: 7.2,  revenue: "$25M" },
  { rank: 6,  name: "Toon Blast",          d1: 38.2, d7: 15.9, d30: 6.5,  revenue: "$20M" },
  { rank: 7,  name: "Lily's Garden",       d1: 36.8, d7: 14.5, d30: 5.8,  revenue: "$15M" },
  { rank: 8,  name: "Township",            d1: 35.1, d7: 13.8, d30: 5.2,  revenue: "$18M" },
  { rank: 9,  name: "Fishdom",             d1: 33.5, d7: 12.6, d30: 4.5,  revenue: "$10M" },
  { rank: 10, name: "Merge Mansion",       d1: 32.0, d7: 11.9, d30: 4.1,  revenue: "$22M" },
]

export const mockSaturation = [
  { metric: "Downloads",  myGame: 72, genreAvg: 58 },
  { metric: "Revenue",    myGame: 45, genreAvg: 62 },
  { metric: "D7 Ret.",    myGame: 82, genreAvg: 65 },
  { metric: "D30 Ret.",   myGame: 68, genreAvg: 55 },
  { metric: "ARPDAU",     myGame: 55, genreAvg: 48 },
]

// --- Module 3: Action Impact ---

export const mockActionKPIs = {
  totalActions: { value: 12,   unit: "",     trend: 3,    trendLabel: "up" },
  avgImpact:    { value: 1.88, unit: "ΔLTV", trend: 0.32, trendLabel: "up" },
  bestAction:   { value: 3.4,  unit: "ΔLTV", trend: 0,    trendLabel: "v2.3 Release" },
}

export const mockActions: ActionData[] = [
  { date: "2026-01-10", type: "ua",       description: "Facebook Lookalike v2",       deltaLtv: 0.9,  confidence: 72 },
  { date: "2026-01-25", type: "liveops",   description: "Lunar New Year event",        deltaLtv: 1.8,  confidence: 80 },
  { date: "2026-02-05", type: "release",   description: "v2.1 — UI refresh",           deltaLtv: 1.2,  confidence: 68 },
  { date: "2026-02-14", type: "ua",       description: "Valentine's push campaign",   deltaLtv: 0.5,  confidence: 55 },
  { date: "2026-02-28", type: "liveops",   description: "Weekend bonus event",         deltaLtv: 1.5,  confidence: 82 },
  { date: "2026-03-01", type: "ua",       description: "TikTok campaign launch",      deltaLtv: 1.2,  confidence: 78 },
  { date: "2026-03-08", type: "liveops",   description: "Spring event start",          deltaLtv: 2.1,  confidence: 85 },
  { date: "2026-03-15", type: "release",   description: "v2.3 — new dungeon system",   deltaLtv: 3.4,  confidence: 72 },
  { date: "2026-03-22", type: "ua",       description: "Meta Advantage+ scaling",     deltaLtv: 0.8,  confidence: 65 },
  { date: "2026-03-28", type: "liveops",   description: "Cherry blossom mini-event",   deltaLtv: 1.6,  confidence: 77 },
  { date: "2026-04-01", type: "release",   description: "v2.4 — guild system",         deltaLtv: 2.8,  confidence: 60 },
  { date: "2026-04-05", type: "ua",       description: "Google UAC re-optimization",  deltaLtv: 1.1,  confidence: 70 },
]

// Retention trend data for action timeline chart
export const mockRetentionTrend = [
  { date: "2026-01-01", retention: 16.2 },
  { date: "2026-01-10", retention: 16.5 },
  { date: "2026-01-25", retention: 17.8 },
  { date: "2026-02-05", retention: 18.2 },
  { date: "2026-02-14", retention: 18.0 },
  { date: "2026-02-28", retention: 18.5 },
  { date: "2026-03-01", retention: 18.7 },
  { date: "2026-03-08", retention: 19.2 },
  { date: "2026-03-15", retention: 20.5 },
  { date: "2026-03-22", retention: 20.8 },
  { date: "2026-03-28", retention: 21.2 },
  { date: "2026-04-01", retention: 22.0 },
  { date: "2026-04-05", retention: 22.3 },
]

// --- Module 4: Experiments ---

export const mockExperimentKPIs = {
  velocity:    { value: 4.2, unit: "/mo",  trend: 0.8,  trendLabel: "up" },
  shipRate:    { value: 68,  unit: "%",    trend: 5,    trendLabel: "up" },
  winRate:     { value: 42,  unit: "%",    trend: -3,   trendLabel: "down" },
  cumDeltaLtv: { value: 4.2, unit: "$",    trend: 1.9,  trendLabel: "up" },
}

export const mockExperiments: ExperimentData[] = [
  { id: 1, name: "Tutorial Redesign",      ate: 3.7,  deltaLtv: 2.4,  annualRevenue: 180000,  roi: 450, status: "shipped",  decision: "win" },
  { id: 2, name: "IAP Price Test A",       ate: -1.2, deltaLtv: -0.8, annualRevenue: -60000,  roi: -150, status: "reverted", decision: "lose" },
  { id: 3, name: "Push Notification v2",   ate: 1.1,  deltaLtv: 0.7,  annualRevenue: 52000,   roi: 260, status: "shipped",  decision: "win" },
  { id: 4, name: "Reward Calendar",        ate: 2.8,  deltaLtv: 1.9,  annualRevenue: 142000,  roi: 710, status: "running",  decision: "pending" },
  { id: 5, name: "Social Share Bonus",     ate: 0.3,  deltaLtv: 0.2,  annualRevenue: 15000,   roi: 75,  status: "shipped",  decision: "win" },
  { id: 6, name: "Energy System Rework",   ate: -0.5, deltaLtv: -0.3, annualRevenue: -22000,  roi: -55, status: "reverted", decision: "lose" },
  { id: 7, name: "Daily Quest Chain",      ate: 1.8,  deltaLtv: 1.2,  annualRevenue: 90000,   roi: 360, status: "running",  decision: "pending" },
  { id: 8, name: "Onboarding Flow B",      ate: 0.9,  deltaLtv: 0.6,  annualRevenue: 45000,   roi: 225, status: "shipped",  decision: "win" },
]

// --- Module 5: Capital Console ---

export const mockCapitalKPIs = {
  capitalEff: { value: 1.42, unit: "x",   trend: 0.12, trendLabel: "up" },
  burnMonths: { value: 8.2,  unit: "mo",  trend: 0.5,  trendLabel: "up" },
  irr:        { value: 34,   unit: "%",   trend: 5,    trendLabel: "up" },
  npv:        { value: 2.8,  unit: "M",   trend: 0.4,  trendLabel: "up" },
}

export const mockBudgetAllocation: BudgetSlice[] = [
  { name: "UA",       value: 55, color: "#2563EB" },
  { name: "Live Ops", value: 25, color: "#8B5CF6" },
  { name: "R&D",      value: 20, color: "#06B6D4" },
]

export const mockRevenueProjection: RevenueForecastPoint[] = [
  { month: "2026",  p10: 800,  p50: 1200, p90: 1600 },
  { month: "2027",  p10: 1200, p50: 2200, p90: 3400 },
  { month: "2028",  p10: 1800, p50: 3800, p90: 6200 },
]

// Scenario simulator: given UA budget, compute projected outcomes
export function computeScenario(uaBudget: number, targetRoas: number): ScenarioResult {
  const basePayback = 47
  const baseBep = 87
  const budgetRatio = uaBudget / 100000
  const roasRatio = targetRoas / 142

  return {
    uaBudget,
    paybackDays: Math.round(basePayback * (0.7 + 0.3 * budgetRatio) / roasRatio),
    bepProbability: Math.min(99, Math.round(baseBep * (1.1 - 0.1 * budgetRatio) * (roasRatio * 0.3 + 0.7))),
    monthlyRevenue: Math.round(120000 * budgetRatio * roasRatio * 0.8),
  }
}
```

- [ ] **Step 2: Verify types compile**

```bash
cd /Users/mike/Downloads/Compass/compass
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mock-data.ts
git commit -m "feat: add complete mock data for all 5 dashboard modules"
```

---

## Task 5: Dashboard Layout (Sidebar + Header)

**Files:**
- Create: `src/components/layout/app-sidebar.tsx`, `src/components/layout/page-header.tsx`, `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/layout.tsx` (wrap with LocaleProvider)

- [ ] **Step 1: Wrap root layout with LocaleProvider**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { LocaleProvider } from "@/lib/i18n-context"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Compass — Investment Decision OS",
  description: "Capital Allocation Intelligence for Mobile Gaming",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/app-sidebar.tsx`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  TrendingUp,
  Zap,
  FlaskConical,
  Wallet,
  Settings,
  User,
  Globe,
  Gamepad2,
  ChevronDown,
  Compass,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

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
    <aside className="flex h-screen w-[220px] flex-col border-r border-[var(--border)] bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)] text-white">
          <Compass className="h-4.5 w-4.5" />
        </div>
        <span className="text-[15px] font-semibold text-[var(--text-primary)]">
          Compass
        </span>
      </div>

      {/* Decision nav */}
      <nav className="flex-1 px-3">
        <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
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
                "mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[var(--brand-light)] text-[var(--brand)]"
                  : "text-[var(--text-secondary)] hover:bg-slate-50 hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          )
        })}

        <Separator className="my-3" />

        <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
          {t("nav.settings")}
        </p>
        {settingsItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-slate-50 hover:text-[var(--text-primary)] transition-colors"
          >
            <item.icon className="h-4 w-4" />
            {t(item.key)}
          </Link>
        ))}
      </nav>

      {/* Footer: Language toggle + Game selector */}
      <div className="border-t border-[var(--border)] px-3 py-3">
        <button
          onClick={toggleLocale}
          className="mb-2 flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] hover:bg-slate-50 transition-colors"
        >
          <Globe className="h-3.5 w-3.5" />
          {t("common.language")}
        </button>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
          <Gamepad2 className="h-4 w-4 text-[var(--text-secondary)]" />
          <span className="flex-1 text-[13px] font-medium text-[var(--text-primary)]">
            Puzzle Quest
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Create `src/components/layout/page-header.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"
import type { TranslationKey } from "@/lib/i18n"

type PageHeaderProps = {
  titleKey: TranslationKey
  subtitleKey: TranslationKey
}

export function PageHeader({ titleKey, subtitleKey }: PageHeaderProps) {
  const { t } = useLocale()

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          {t(titleKey)}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {t(subtitleKey)} · {t("common.lastUpdated")} 5 {t("common.minAgo")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <select className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-[var(--text-secondary)]">
          <option>Puzzle Quest</option>
        </select>
        <select className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-[var(--text-secondary)]">
          <option>30 {t("common.days")}</option>
          <option>7 {t("common.days")}</option>
          <option>90 {t("common.days")}</option>
        </select>
        <button className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-slate-50 transition-colors">
          {t("common.export")}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/app/(dashboard)/layout.tsx`**

```tsx
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Create placeholder dashboard page for testing**

Create `src/app/(dashboard)/page.tsx`:

```tsx
import { PageHeader } from "@/components/layout/page-header"

export default function ExecutiveOverviewPage() {
  return (
    <div>
      <PageHeader titleKey="exec.title" subtitleKey="exec.subtitle" />
      <p className="text-[var(--text-muted)]">Module 1 content coming next...</p>
    </div>
  )
}
```

- [ ] **Step 6: Verify layout renders**

```bash
cd /Users/mike/Downloads/Compass/compass
npm run dev
```

Open http://localhost:3000. Expected: Left sidebar (220px) with navigation items, right side shows "추가 투자가 가능한가?" header. Click language toggle — labels switch to English.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx src/app/(dashboard)/
git commit -m "feat: add dashboard layout with sidebar, page header, and i18n toggle"
```

---

## Task 6: Shared Components (KPI Cards + Signal Card)

**Files:**
- Create: `src/components/layout/kpi-cards.tsx`, `src/components/layout/signal-card.tsx`

- [ ] **Step 1: Create `src/components/layout/signal-card.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"
import type { SignalStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type SignalCardProps = {
  status: SignalStatus
  confidence: number
  reason: { ko: string; en: string }
}

const signalStyles = {
  invest: {
    bg: "bg-[var(--signal-green-bg)]",
    border: "border-[var(--signal-green-border)]",
    text: "text-[var(--signal-green)]",
    label: "signal.invest" as const,
  },
  hold: {
    bg: "bg-[var(--signal-amber-bg)]",
    border: "border-[var(--signal-amber-border)]",
    text: "text-[var(--signal-amber)]",
    label: "signal.hold" as const,
  },
  reduce: {
    bg: "bg-[var(--signal-red-bg)]",
    border: "border-[var(--signal-red-border)]",
    text: "text-[var(--signal-red)]",
    label: "signal.reduce" as const,
  },
}

export function SignalCard({ status, confidence, reason }: SignalCardProps) {
  const { t, locale } = useLocale()
  const style = signalStyles[status]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border p-4",
        style.bg,
        style.border
      )}
    >
      <p className={cn("text-xs font-semibold uppercase tracking-wide", style.text)}>
        {t(style.label)}
      </p>
      <p className={cn("text-3xl font-bold mt-0.5", style.text)}>
        {confidence}%
      </p>
      <p className="text-[11px] text-[var(--text-secondary)] mt-1 text-center leading-tight">
        {reason[locale]}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/kpi-cards.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"
import type { TranslationKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export type KPIItem = {
  labelKey: TranslationKey
  value: string | number
  unit?: string
  trend: number
  trendLabel: string
}

type KPICardsProps = {
  items: KPIItem[]
}

export function KPICards({ items }: KPICardsProps) {
  const { t } = useLocale()

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((item) => {
        const isPositive = item.trend > 0
        const isNegative = item.trend < 0
        const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
        const trendColor = isPositive ? "text-[var(--signal-green)]" : isNegative ? "text-[var(--signal-red)]" : "text-[var(--text-muted)]"

        // For payback, negative trend is good (faster)
        const displayTrendColor = item.trendLabel === "faster"
          ? "text-[var(--signal-green)]"
          : trendColor

        return (
          <div
            key={item.labelKey}
            className="rounded-xl border border-[var(--border)] bg-white p-4"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {t(item.labelKey)}
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                {item.value}
              </span>
              {item.unit && (
                <span className="text-sm text-[var(--text-muted)]">{item.unit}</span>
              )}
            </div>
            <div className={cn("flex items-center gap-1 mt-1.5 text-[13px]", displayTrendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>
                {Math.abs(item.trend)}{item.unit === "%" ? "pp" : ""} {item.trendLabel}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Verify compile**

```bash
cd /Users/mike/Downloads/Compass/compass
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/signal-card.tsx src/components/layout/kpi-cards.tsx
git commit -m "feat: add signal card and KPI cards components"
```

---

## Task 7: Chart Components

**Files:**
- Create: `src/components/charts/retention-curve.tsx`, `src/components/charts/revenue-forecast.tsx`, `src/components/charts/action-timeline.tsx`, `src/components/charts/experiment-bar.tsx`, `src/components/charts/scenario-simulator.tsx`, `src/components/charts/budget-donut.tsx`, `src/components/charts/cohort-heatmap.tsx`, `src/components/charts/market-benchmark.tsx`, `src/components/charts/saturation-bar.tsx`

- [ ] **Step 1: Create `src/components/charts/retention-curve.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"
import type { RetentionDataPoint } from "@/lib/mock-data"
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts"

type RetentionCurveProps = {
  data: RetentionDataPoint[]
  asymptoticDay: number
}

export function RetentionCurve({ data, asymptoticDay }: RetentionCurveProps) {
  const { t } = useLocale()

  // Transform data for stacked area bands
  const chartData = data.map((d) => ({
    day: `D${d.day}`,
    p90: d.p90,
    p75: d.p75,
    p50: d.p50,
    p25: d.p25,
    p10: d.p10,
    genre: d.genre,
    // Band ranges for area fill
    outerBand: [d.p10, d.p90],
    innerBand: [d.p25, d.p75],
  }))

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {t("chart.retention")} — D1 to D60
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          Puzzle Quest · Cohort 2026-03 · P10/P50/P90
        </p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="outerBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="innerBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 50]} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
            formatter={(value: number) => [`${value}%`]}
          />

          {/* P10-P90 outer band */}
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#outerBand)" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="#FFFFFF" fillOpacity={0} />

          {/* P25-P75 inner band */}
          <Area type="monotone" dataKey="p75" stroke="none" fill="url(#innerBand)" />
          <Area type="monotone" dataKey="p25" stroke="none" fill="#FFFFFF" fillOpacity={0} />

          {/* Genre benchmark */}
          <Line type="monotone" dataKey="genre" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name={t("chart.genreAvg")} />

          {/* P50 main line */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#2563EB", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#2563EB" }}
            name={t("chart.p50")}
          />

          {/* Asymptotic arrival marker */}
          <ReferenceLine
            x={`D${asymptoticDay}`}
            stroke="#22C55E"
            strokeDasharray="3 3"
            strokeOpacity={0.6}
            label={{ value: t("chart.asymptotic"), position: "top", fontSize: 10, fill: "#22C55E" }}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={12}
            wrapperStyle={{ fontSize: 11, color: "#64748B" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/charts/revenue-forecast.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"
import type { RevenueForecastPoint } from "@/lib/mock-data"
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type RevenueForecastProps = {
  data: RevenueForecastPoint[]
  title?: string
}

export function RevenueForecast({ data, title }: RevenueForecastProps) {
  const { t } = useLocale()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 h-full">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        {title || t("chart.revenue")}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}K`} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v: number) => [`$${v}K`]} />
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#revenueBand)" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="none" />
          <Line type="monotone" dataKey="p50" stroke="#2563EB" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="p90" stroke="#2563EB" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.3} dot={false} />
          <Line type="monotone" dataKey="p10" stroke="#2563EB" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.3} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/charts/action-timeline.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"
import type { ActionData } from "@/lib/mock-data"
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"

type ActionTimelineProps = {
  retentionTrend: { date: string; retention: number }[]
  actions: ActionData[]
}

const actionColors = { ua: "#2563EB", liveops: "#8B5CF6", release: "#F59E0B" }

export function ActionTimeline({ retentionTrend, actions }: ActionTimelineProps) {
  const { t } = useLocale()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        {t("chart.actionTimeline")}
      </h3>
      <div className="flex gap-4 mb-3">
        {(["ua", "liveops", "release"] as const).map((type) => (
          <div key={type} className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: actionColors[type] }} />
            {t(`action.${type}` as const)}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={retentionTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} tickFormatter={(v) => v.slice(5)} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={["dataMin - 1", "dataMax + 1"]} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
          <Line type="monotone" dataKey="retention" stroke="#2563EB" strokeWidth={2} dot={{ r: 2.5, fill: "#2563EB" }} name="D7 Retention" />
          {actions.map((action) => (
            <ReferenceLine
              key={action.date}
              x={action.date}
              stroke={actionColors[action.type]}
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/charts/experiment-bar.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"
import type { ExperimentData } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts"

type ExperimentBarProps = {
  data: ExperimentData[]
}

export function ExperimentBar({ data }: ExperimentBarProps) {
  const { t } = useLocale()
  const sorted = [...data].sort((a, b) => Math.abs(b.deltaLtv) - Math.abs(a.deltaLtv))

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        {t("chart.experimentRoi")}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} width={95} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v: number) => [`$${v}`, "ΔLTV"]} />
          <Bar dataKey="deltaLtv" radius={[0, 4, 4, 0]} barSize={20}>
            {sorted.map((entry) => (
              <Cell
                key={entry.id}
                fill={entry.deltaLtv >= 0 ? "#16A34A" : "#DC2626"}
                fillOpacity={entry.status === "running" ? 0.5 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/charts/scenario-simulator.tsx`**

```tsx
"use client"

import { useState } from "react"
import { useLocale } from "@/lib/i18n-context"
import { computeScenario } from "@/lib/mock-data"
import { formatNumber } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function ScenarioSimulator() {
  const { t } = useLocale()
  const [uaBudget, setUaBudget] = useState(100000)
  const [targetRoas, setTargetRoas] = useState(142)

  // Generate scenario curve for multiple budget levels
  const scenarioData = [50000, 75000, 100000, 125000, 150000, 175000, 200000].map((budget) => {
    const result = computeScenario(budget, targetRoas)
    return {
      budget: formatNumber(budget),
      payback: result.paybackDays,
      bep: result.bepProbability,
      revenue: result.monthlyRevenue,
    }
  })

  const current = computeScenario(uaBudget, targetRoas)

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        {t("chart.scenario")}
      </h3>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1.5 block">
            {t("scenario.uaBudget")}: <span className="font-semibold text-[var(--text-primary)]">{formatNumber(uaBudget)}</span>
          </label>
          <input
            type="range"
            min={50000}
            max={200000}
            step={10000}
            value={uaBudget}
            onChange={(e) => setUaBudget(Number(e.target.value))}
            className="w-full accent-[var(--brand)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>$50K</span><span>$200K</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1.5 block">
            {t("scenario.targetRoas")}: <span className="font-semibold text-[var(--text-primary)]">{targetRoas}%</span>
          </label>
          <input
            type="range"
            min={80}
            max={300}
            step={5}
            value={targetRoas}
            onChange={(e) => setTargetRoas(Number(e.target.value))}
            className="w-full accent-[var(--brand)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>80%</span><span>300%</span>
          </div>
        </div>
      </div>

      {/* Result KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-[10px] text-[var(--text-muted)]">{t("scenario.paybackChange")}</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{current.paybackDays}d</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-[10px] text-[var(--text-muted)]">{t("scenario.bepChange")}</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{current.bepProbability}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-[10px] text-[var(--text-muted)]">{t("chart.revenue")}</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{formatNumber(current.monthlyRevenue)}/mo</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={scenarioData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="budget" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}d`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 11 }} />
          <Line yAxisId="left" type="monotone" dataKey="payback" stroke="#2563EB" strokeWidth={2} name="Payback" dot={{ r: 2 }} />
          <Line yAxisId="right" type="monotone" dataKey="bep" stroke="#22C55E" strokeWidth={2} name="BEP %" dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 6: Create `src/components/charts/budget-donut.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"
import type { BudgetSlice } from "@/lib/mock-data"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

type BudgetDonutProps = {
  data: BudgetSlice[]
}

export function BudgetDonut({ data }: BudgetDonutProps) {
  const { t } = useLocale()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 h-full">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        {t("chart.budgetAlloc")}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            dataKey="value"
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            iconSize={10}
            wrapperStyle={{ fontSize: 12, color: "#64748B" }}
            formatter={(value, entry: any) => `${value} (${entry.payload.value}%)`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 7: Create `src/components/charts/market-benchmark.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"
import type { RetentionDataPoint } from "@/lib/mock-data"
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

type MarketBenchmarkProps = {
  data: RetentionDataPoint[]
}

export function MarketBenchmark({ data }: MarketBenchmarkProps) {
  const { t } = useLocale()
  const chartData = data.map((d) => ({ day: `D${d.day}`, p50: d.p50, p10: d.p10, p90: d.p90, genre: d.genre }))

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        {t("chart.benchmark")}
      </h3>
      <p className="text-xs text-[var(--text-muted)] mb-4">Puzzle Quest vs Puzzle Genre</p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="genreBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 50]} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v: number) => [`${v}%`]} />
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#genreBand)" name={t("chart.bandOuter")} />
          <Area type="monotone" dataKey="p10" stroke="none" fill="none" />
          <Line type="monotone" dataKey="genre" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name={t("chart.genreAvg")} />
          <Line type="monotone" dataKey="p50" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: "#FFF", stroke: "#2563EB", strokeWidth: 2 }} name="Puzzle Quest" />
          <Legend verticalAlign="bottom" height={36} iconSize={12} wrapperStyle={{ fontSize: 11 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 8: Create `src/components/charts/saturation-bar.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

type SaturationBarProps = {
  data: { metric: string; myGame: number; genreAvg: number }[]
}

export function SaturationBar({ data }: SaturationBarProps) {
  const { t } = useLocale()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 h-full">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        {t("chart.saturation")}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="myGame" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={16} name="Puzzle Quest" />
          <Bar dataKey="genreAvg" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={16} name={t("chart.genreAvg")} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 9: Create `src/components/charts/cohort-heatmap.tsx`**

```tsx
"use client"

import { useLocale } from "@/lib/i18n-context"

const cohortData = [
  { cohort: "Jan", d1: 41, d3: 28, d7: 17, d14: 12, d30: 7 },
  { cohort: "Feb", d1: 42, d3: 29, d7: 18, d14: 13, d30: 8 },
  { cohort: "Mar", d1: 42, d3: 28, d7: 19, d14: 13, d30: 9 },
]

function heatColor(value: number): string {
  if (value >= 35) return "bg-blue-600 text-white"
  if (value >= 25) return "bg-blue-500 text-white"
  if (value >= 15) return "bg-blue-400 text-white"
  if (value >= 10) return "bg-blue-200 text-blue-900"
  return "bg-blue-100 text-blue-800"
}

export function CohortHeatmap() {
  const { t } = useLocale()
  const days = ["D1", "D3", "D7", "D14", "D30"]

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        Cohort Retention Heatmap
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">Cohort</th>
              {days.map((d) => (
                <th key={d} className="px-3 py-2 text-center text-xs font-medium text-[var(--text-muted)]">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohortData.map((row) => (
              <tr key={row.cohort}>
                <td className="px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">{row.cohort} 2026</td>
                {[row.d1, row.d3, row.d7, row.d14, row.d30].map((val, i) => (
                  <td key={i} className="px-1 py-1">
                    <div className={`rounded-md px-3 py-2 text-center text-xs font-semibold ${heatColor(val)}`}>
                      {val}%
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 10: Verify all chart components compile**

```bash
cd /Users/mike/Downloads/Compass/compass
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 11: Commit**

```bash
git add src/components/charts/
git commit -m "feat: add all chart components (retention, revenue, timeline, experiment, scenario, donut, heatmap, benchmark, saturation)"
```

---

## Task 8: Module 1 — Executive Overview

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Implement Executive Overview page**

Replace `src/app/(dashboard)/page.tsx`:

```tsx
"use client"

import { PageHeader } from "@/components/layout/page-header"
import { SignalCard } from "@/components/layout/signal-card"
import { KPICards } from "@/components/layout/kpi-cards"
import { RetentionCurve } from "@/components/charts/retention-curve"
import { RevenueForecast } from "@/components/charts/revenue-forecast"
import { useLocale } from "@/lib/i18n-context"
import { mockSignal, mockKPIs, mockRetention, mockRevenueForecast } from "@/lib/mock-data"

export default function ExecutiveOverviewPage() {
  const { t } = useLocale()

  return (
    <div>
      <PageHeader titleKey="exec.title" subtitleKey="exec.subtitle" />

      {/* Signal + KPIs row */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <SignalCard
          status={mockSignal.status}
          confidence={mockSignal.confidence}
          reason={mockSignal.reason}
        />
        <KPICards
          items={[
            { labelKey: "kpi.payback", value: mockKPIs.payback.value, unit: t("common.days"), trend: mockKPIs.payback.trend, trendLabel: mockKPIs.payback.trendLabel },
            { labelKey: "kpi.roas", value: `${mockKPIs.roas.value}%`, trend: mockKPIs.roas.trend, trendLabel: mockKPIs.roas.trendLabel },
            { labelKey: "kpi.bep", value: `${mockKPIs.bep.value}%`, trend: mockKPIs.bep.trend, trendLabel: mockKPIs.bep.trendLabel },
            { labelKey: "kpi.burn", value: mockKPIs.burn.value, unit: t("common.months"), trend: mockKPIs.burn.trend, trendLabel: mockKPIs.burn.trendLabel },
          ]}
        />
      </div>

      {/* Retention Curve */}
      <div className="mb-6">
        <RetentionCurve data={mockRetention.data} asymptoticDay={mockRetention.asymptoticDay} />
      </div>

      {/* Bottom row: Revenue + AI Recommendation */}
      <div className="grid grid-cols-2 gap-4">
        <RevenueForecast data={mockRevenueForecast} />
        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            {t("ai.recommendation")}
          </h3>
          <div className="rounded-lg bg-[var(--signal-green-bg)] border border-[var(--signal-green-border)] p-4">
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {t("ai.investMsg")}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>{t("signal.confidence")}: {mockSignal.confidence}%</span>
            <span>·</span>
            <span>Based on D7-D30 cohort data</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify page renders**

```bash
npm run dev
```

Open http://localhost:3000/dashboard. Expected: Signal card + 4 KPIs + retention curve with bands + revenue forecast + AI recommendation.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/page.tsx
git commit -m "feat: implement Module 1 — Executive Overview with signal, KPIs, retention curve, revenue forecast"
```

---

## Task 9: Module 2 — Market Gap

**Files:**
- Create: `src/app/(dashboard)/market-gap/page.tsx`

- [ ] **Step 1: Implement Market Gap page**

```tsx
"use client"

import { PageHeader } from "@/components/layout/page-header"
import { KPICards } from "@/components/layout/kpi-cards"
import { MarketBenchmark } from "@/components/charts/market-benchmark"
import { SaturationBar } from "@/components/charts/saturation-bar"
import { useLocale } from "@/lib/i18n-context"
import { mockMarketKPIs, mockRetention, mockCompetitors, mockSaturation } from "@/lib/mock-data"

export default function MarketGapPage() {
  const { t } = useLocale()

  return (
    <div>
      <PageHeader titleKey="market.title" subtitleKey="market.subtitle" />

      <div className="mb-6">
        <KPICards
          items={[
            { labelKey: "kpi.genreRank", value: `#${mockMarketKPIs.genreRank.value}`, trend: mockMarketKPIs.genreRank.trend, trendLabel: mockMarketKPIs.genreRank.trendLabel },
            { labelKey: "kpi.d7vsAvg", value: `+${mockMarketKPIs.d7vsAvg.value}`, unit: "pp", trend: mockMarketKPIs.d7vsAvg.trend, trendLabel: mockMarketKPIs.d7vsAvg.trendLabel },
            { labelKey: "kpi.revenueGap", value: `${mockMarketKPIs.revenueGap.value}`, unit: "M", trend: mockMarketKPIs.revenueGap.trend, trendLabel: mockMarketKPIs.revenueGap.trendLabel },
          ]}
        />
      </div>

      <div className="mb-6">
        <MarketBenchmark data={mockRetention.data} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Competitor Table */}
        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Top 10 Competitors
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">{t("table.rank")}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">{t("table.name")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.d1")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.d7")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.d30")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.revenue")}</th>
                </tr>
              </thead>
              <tbody>
                {mockCompetitors.map((c) => (
                  <tr key={c.rank} className={`border-b border-slate-50 ${c.name === "Puzzle Quest" ? "bg-[var(--brand-light)]" : ""}`}>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-secondary)]">{c.rank}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-[var(--text-primary)]">{c.name}</td>
                    <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)]">{c.d1}%</td>
                    <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)]">{c.d7}%</td>
                    <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)]">{c.d30}%</td>
                    <td className="px-3 py-2.5 text-xs text-right font-medium text-[var(--text-primary)]">{c.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SaturationBar data={mockSaturation} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify and commit**

```bash
npm run dev
# Navigate to /dashboard/market-gap
git add src/app/\(dashboard\)/market-gap/
git commit -m "feat: implement Module 2 — Market Gap with benchmark overlay, competitor table, saturation bar"
```

---

## Task 10: Module 3 — Action Impact

**Files:**
- Create: `src/app/(dashboard)/actions/page.tsx`

- [ ] **Step 1: Implement Action Impact page**

```tsx
"use client"

import { PageHeader } from "@/components/layout/page-header"
import { KPICards } from "@/components/layout/kpi-cards"
import { ActionTimeline } from "@/components/charts/action-timeline"
import { useLocale } from "@/lib/i18n-context"
import { mockActionKPIs, mockActions, mockRetentionTrend } from "@/lib/mock-data"

export default function ActionsPage() {
  const { t } = useLocale()

  return (
    <div>
      <PageHeader titleKey="actions.title" subtitleKey="actions.subtitle" />

      <div className="mb-6">
        <KPICards
          items={[
            { labelKey: "kpi.totalActions", value: mockActionKPIs.totalActions.value, trend: mockActionKPIs.totalActions.trend, trendLabel: mockActionKPIs.totalActions.trendLabel },
            { labelKey: "kpi.avgImpact", value: mockActionKPIs.avgImpact.value, unit: "ΔLTV", trend: mockActionKPIs.avgImpact.trend, trendLabel: mockActionKPIs.avgImpact.trendLabel },
            { labelKey: "kpi.bestAction", value: mockActionKPIs.bestAction.value, unit: "ΔLTV", trend: mockActionKPIs.bestAction.trend, trendLabel: mockActionKPIs.bestAction.trendLabel },
          ]}
        />
      </div>

      <div className="mb-6">
        <ActionTimeline retentionTrend={mockRetentionTrend} actions={mockActions} />
      </div>

      {/* Action Log Table */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Action Log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">{t("table.date")}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">{t("table.type")}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">{t("table.description")}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.deltaLtv")}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.confidence")}</th>
              </tr>
            </thead>
            <tbody>
              {mockActions.map((action, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="px-3 py-2.5 text-xs text-[var(--text-secondary)]">{action.date}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      action.type === "ua" ? "bg-blue-50 text-blue-700" :
                      action.type === "liveops" ? "bg-purple-50 text-purple-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {t(`action.${action.type}` as const)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[var(--text-primary)]">{action.description}</td>
                  <td className={`px-3 py-2.5 text-xs text-right font-medium ${action.deltaLtv >= 0 ? "text-[var(--signal-green)]" : "text-[var(--signal-red)]"}`}>
                    {action.deltaLtv >= 0 ? "+" : ""}{action.deltaLtv}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)]">{action.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify and commit**

```bash
npm run dev
# Navigate to /dashboard/actions
git add src/app/\(dashboard\)/actions/
git commit -m "feat: implement Module 3 — Action Impact with timeline chart and action log table"
```

---

## Task 11: Module 4 — Experiments

**Files:**
- Create: `src/app/(dashboard)/experiments/page.tsx`

- [ ] **Step 1: Implement Experiment Board page**

```tsx
"use client"

import { PageHeader } from "@/components/layout/page-header"
import { KPICards } from "@/components/layout/kpi-cards"
import { ExperimentBar } from "@/components/charts/experiment-bar"
import { useLocale } from "@/lib/i18n-context"
import { mockExperimentKPIs, mockExperiments } from "@/lib/mock-data"
import { formatNumber } from "@/lib/utils"

export default function ExperimentsPage() {
  const { t } = useLocale()

  return (
    <div>
      <PageHeader titleKey="experiments.title" subtitleKey="experiments.subtitle" />

      <div className="mb-6">
        <KPICards
          items={[
            { labelKey: "kpi.velocity", value: mockExperimentKPIs.velocity.value, unit: "/mo", trend: mockExperimentKPIs.velocity.trend, trendLabel: mockExperimentKPIs.velocity.trendLabel },
            { labelKey: "kpi.shipRate", value: `${mockExperimentKPIs.shipRate.value}%`, trend: mockExperimentKPIs.shipRate.trend, trendLabel: mockExperimentKPIs.shipRate.trendLabel },
            { labelKey: "kpi.winRate", value: `${mockExperimentKPIs.winRate.value}%`, trend: mockExperimentKPIs.winRate.trend, trendLabel: mockExperimentKPIs.winRate.trendLabel },
            { labelKey: "kpi.cumDeltaLtv", value: `$${mockExperimentKPIs.cumDeltaLtv.value}`, trend: mockExperimentKPIs.cumDeltaLtv.trend, trendLabel: mockExperimentKPIs.cumDeltaLtv.trendLabel },
          ]}
        />
      </div>

      <div className="mb-6">
        <ExperimentBar data={mockExperiments} />
      </div>

      {/* Experiment Detail Table */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Experiment Detail
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)]">{t("table.name")}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.ate")}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.deltaLtv")}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.annualRevenue")}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-[var(--text-muted)]">{t("table.roi")}</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-[var(--text-muted)]">{t("table.status")}</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-[var(--text-muted)]">{t("table.decision")}</th>
              </tr>
            </thead>
            <tbody>
              {mockExperiments.map((exp) => (
                <tr key={exp.id} className="border-b border-slate-50">
                  <td className="px-3 py-2.5 text-xs font-medium text-[var(--text-primary)]">{exp.name}</td>
                  <td className={`px-3 py-2.5 text-xs text-right ${exp.ate >= 0 ? "text-[var(--signal-green)]" : "text-[var(--signal-red)]"}`}>
                    {exp.ate >= 0 ? "+" : ""}{exp.ate}pp
                  </td>
                  <td className={`px-3 py-2.5 text-xs text-right font-medium ${exp.deltaLtv >= 0 ? "text-[var(--signal-green)]" : "text-[var(--signal-red)]"}`}>
                    {exp.deltaLtv >= 0 ? "+" : ""}${exp.deltaLtv}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)]">{formatNumber(exp.annualRevenue)}</td>
                  <td className="px-3 py-2.5 text-xs text-right text-[var(--text-secondary)]">{exp.roi}%</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      exp.status === "shipped" ? "bg-green-50 text-green-700" :
                      exp.status === "running" ? "bg-blue-50 text-blue-700" :
                      "bg-red-50 text-red-700"
                    }`}>
                      {t(`exp.${exp.status}` as const)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      exp.decision === "win" ? "bg-green-50 text-green-700" :
                      exp.decision === "lose" ? "bg-red-50 text-red-700" :
                      "bg-slate-50 text-slate-600"
                    }`}>
                      {t(`exp.${exp.decision}` as const)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify and commit**

```bash
npm run dev
# Navigate to /dashboard/experiments
git add src/app/\(dashboard\)/experiments/
git commit -m "feat: implement Module 4 — Experiment Board with ROI bar chart and detail table"
```

---

## Task 12: Module 5 — Capital Console

**Files:**
- Create: `src/app/(dashboard)/capital/page.tsx`

- [ ] **Step 1: Implement Capital Console page**

```tsx
"use client"

import { PageHeader } from "@/components/layout/page-header"
import { KPICards } from "@/components/layout/kpi-cards"
import { ScenarioSimulator } from "@/components/charts/scenario-simulator"
import { BudgetDonut } from "@/components/charts/budget-donut"
import { RevenueForecast } from "@/components/charts/revenue-forecast"
import { useLocale } from "@/lib/i18n-context"
import { mockCapitalKPIs, mockBudgetAllocation, mockRevenueProjection } from "@/lib/mock-data"

export default function CapitalConsolePage() {
  const { t } = useLocale()

  return (
    <div>
      <PageHeader titleKey="capital.title" subtitleKey="capital.subtitle" />

      <div className="mb-6">
        <KPICards
          items={[
            { labelKey: "kpi.capitalEff", value: `${mockCapitalKPIs.capitalEff.value}x`, trend: mockCapitalKPIs.capitalEff.trend, trendLabel: mockCapitalKPIs.capitalEff.trendLabel },
            { labelKey: "kpi.burn", value: mockCapitalKPIs.burnMonths.value, unit: t("common.months"), trend: mockCapitalKPIs.burnMonths.trend, trendLabel: mockCapitalKPIs.burnMonths.trendLabel },
            { labelKey: "kpi.irr", value: `${mockCapitalKPIs.irr.value}%`, trend: mockCapitalKPIs.irr.trend, trendLabel: mockCapitalKPIs.irr.trendLabel },
            { labelKey: "kpi.npv", value: `$${mockCapitalKPIs.npv.value}M`, trend: mockCapitalKPIs.npv.trend, trendLabel: mockCapitalKPIs.npv.trendLabel },
          ]}
        />
      </div>

      <div className="mb-6">
        <ScenarioSimulator />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <BudgetDonut data={mockBudgetAllocation} />
        <RevenueForecast data={mockRevenueProjection} title={t("chart.revenueProj")} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify and commit**

```bash
npm run dev
# Navigate to /dashboard/capital
git add src/app/\(dashboard\)/capital/
git commit -m "feat: implement Module 5 — Capital Console with scenario simulator, budget donut, revenue projection"
```

---

## Task 13: Auth Shell (Login Page)

**Files:**
- Create: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create auth layout**

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create login page**

```tsx
"use client"

import { useRouter } from "next/navigation"
import { Compass } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)] text-white">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Compass</h1>
        <p className="text-sm text-[var(--text-muted)]">Investment Decision OS</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Email</label>
            <input
              type="email"
              defaultValue="demo@compass.io"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Password</label>
            <input
              type="password"
              defaultValue="••••••••"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            />
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
# Navigate to /login — click sign in → redirects to /dashboard
git add src/app/\(auth\)/
git commit -m "feat: add dummy login page with redirect to dashboard"
```

---

## Task 14: Final Verification & Polish

**Files:**
- All existing files (visual verification)

- [ ] **Step 1: Run production build**

```bash
cd /Users/mike/Downloads/Compass/compass
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Visual verification checklist**

Run `npm run dev` and check each:

1. `/login` → login page renders, "Sign in" redirects to dashboard
2. `/dashboard` → Signal card (green, 87%) + 4 KPI cards + retention curve with dual bands + genre benchmark dashed line + asymptotic marker + revenue forecast + AI recommendation
3. `/dashboard/market-gap` → 3 KPIs + benchmark overlay chart + competitor table (Puzzle Quest highlighted) + saturation bar chart
4. `/dashboard/actions` → 3 KPIs + action timeline with markers + action log table with colored badges
5. `/dashboard/experiments` → 4 KPIs + horizontal bar chart (green/red) + experiment detail table with status badges
6. `/dashboard/capital` → 4 KPIs + scenario simulator (sliders update chart) + budget donut + revenue projection
7. Sidebar → all 5 modules navigable, active state highlights correctly
8. Language toggle → click globe icon → all labels switch ko ↔ en instantly

- [ ] **Step 3: Commit final state**

```bash
git add .
git commit -m "chore: final verification — all 5 modules complete with i18n"
```

---

## Summary

| Task | What It Builds | Est. |
|------|---------------|------|
| 1 | Project scaffolding (Next.js + deps) | 5 min |
| 2 | shadcn/ui component setup | 3 min |
| 3 | i18n dictionary + context | 5 min |
| 4 | Mock data (all 5 modules) | 5 min |
| 5 | Dashboard layout (sidebar + header) | 10 min |
| 6 | Shared components (signal + KPI cards) | 5 min |
| 7 | All chart components (9 charts) | 15 min |
| 8 | Module 1: Executive Overview | 5 min |
| 9 | Module 2: Market Gap | 5 min |
| 10 | Module 3: Action Impact | 5 min |
| 11 | Module 4: Experiments | 5 min |
| 12 | Module 5: Capital Console | 5 min |
| 13 | Auth shell (login) | 3 min |
| 14 | Final verification & polish | 5 min |
