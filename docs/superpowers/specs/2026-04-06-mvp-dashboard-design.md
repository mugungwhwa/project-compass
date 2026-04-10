# Compass MVP Dashboard Design Spec

**Date**: 2026-04-06
**Purpose**: 예비창업패키지 심사위원 데모용 MVP 대시보드
**Status**: Approved

---

## 1. Design Decisions

| Item | Decision | Rationale |
|------|----------|-----------|
| Scope | 5 modules, all shells with dummy data | 심사위원에게 전체 제품 비전 전달 |
| Theme | Light Clean (Stripe/Linear) | 비기술 심사위원 친화적, 현대 SaaS 표준 |
| Layout | Left sidebar 220px (Linear style) | 모듈명 항상 노출, 표준 SaaS 패턴 |
| Chart style | Rich Layered (double band + benchmark + asymptotic) | 베이지안 불확실성의 시각적 전달 |
| Chart lib | Recharts (main) + custom CSS (heatmap) | React 생태계 표준, P10/P50/P90 밴드 지원 |
| Tech stack | Next.js 15 App Router + shadcn/ui + Tailwind + Recharts | CLAUDE.md 확정 스택, MVP→프로덕션 코드 재사용 100% |
| Data | JSON mock data in single file | 한곳 관리, 나중에 API 교체 용이 |
| Architecture | Simplified flat components (not full FSD) | MVP 속도, 프로덕션 전환 시 FSD 리프팅 |
| i18n | Korean / English toggle | 심사위원(한글) + 글로벌 데모(영어) 겸용 |

---

## 2. Color System

```
Background:     #FFFFFF (cards), #F8FAFC (page bg)
Border:         #E2E8F0
Text Primary:   #0F172A
Text Secondary: #64748B
Text Muted:     #94A3B8

Brand/Accent:   #2563EB (blue-600)
Brand Light:    #EFF6FF (blue-50)

Signal Green:   #16A34A (invest)
Signal Amber:   #D97706 (caution/hold)
Signal Red:     #DC2626 (reduce)

Chart Primary:  #2563EB (P50 line)
Chart Band:     #2563EB @ 6-15% opacity (P10-P90, P25-P75)
Chart Benchmark:#F59E0B (genre avg, dashed)
Chart Asymptotic:#22C55E (convergence marker)
```

---

## 3. Project Structure

```
compass/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (Inter font, theme)
│   │   ├── page.tsx                  # / → /dashboard redirect
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Login (MVP: dummy)
│   │   │   └── layout.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx            # Sidebar + content layout
│   │       ├── page.tsx              # Module 1: Executive Overview
│   │       ├── market-gap/page.tsx   # Module 2: Market vs Internal
│   │       ├── actions/page.tsx      # Module 3: Action Impact
│   │       ├── experiments/page.tsx  # Module 4: Experiment Board
│   │       └── capital/page.tsx      # Module 5: Capital Console
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx       # Left sidebar (220px, collapsible)
│   │   │   ├── page-header.tsx       # Page title + filters
│   │   │   └── kpi-cards.tsx         # KPI card row (reusable)
│   │   └── charts/
│   │       ├── retention-curve.tsx   # Rich layered retention chart
│   │       ├── revenue-forecast.tsx  # Revenue fan chart
│   │       ├── action-timeline.tsx   # Action timeline composed chart
│   │       ├── experiment-bar.tsx    # Experiment ROI horizontal bar
│   │       ├── scenario-simulator.tsx# Slider + real-time chart
│   │       ├── budget-donut.tsx      # Budget allocation pie
│   │       └── cohort-heatmap.tsx    # CSS grid heatmap
│   ├── lib/
│   │   ├── mock-data.ts             # All dummy data
│   │   ├── i18n.ts                  # Korean/English dictionary + types
│   │   ├── i18n-context.tsx         # LocaleProvider + useLocale hook
│   │   └── utils.ts                 # cn() utility
│   └── styles/
│       └── globals.css              # Tailwind base + custom vars
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 4. Routing

| Route | Module | Page Title |
|-------|--------|------------|
| `/` | — | Redirect → `/dashboard` |
| `/login` | Auth | Login (dummy for MVP) |
| `/dashboard` | 1. Executive Overview | "Can We Invest More?" |
| `/dashboard/market-gap` | 2. Market Gap | "Where Do We Stand?" |
| `/dashboard/actions` | 3. Action Impact | "What's Actually Working?" |
| `/dashboard/experiments` | 4. Experiment Board | "Is R&D Paying Off?" |
| `/dashboard/capital` | 5. Capital Console | "What Should We Do Next?" |

---

## 5. Sidebar

```
┌─────────────────────┐
│ 🧭 Compass          │  Logo + brand
│                     │
│ DECISION            │  Section label
│ ▶ Executive Overview│  Active: bg-blue-50, text-blue-600
│   Market Gap        │  Inactive: text-gray-500
│   Action Impact     │
│   Experiments       │
│   Capital Console   │
│                     │
│ ─────────────────── │
│ SETTINGS            │
│   Integrations      │
│   Account           │
│                     │
│ ─────────────────── │
│ 🎮 Puzzle Quest  ▾  │  Game selector (bottom-fixed)
└─────────────────────┘
```

- Built with shadcn/ui `Sidebar` component
- 220px fixed width, collapsible to icon-only (64px)
- Game selector at bottom affects all modules
- Keyboard shortcut: Cmd+\ to toggle

---

## 6. Common Page Header

```
[Module Title]                    [Game ▾] [30 days ▾] [Export]
[Subtitle / last updated]
```

- Module title: text-xl font-semibold
- Filters: shadcn `Select` dropdowns
- Export: shadcn `Button` variant="outline"

---

## 7. Module Layouts

### 7.1 Module 1: Executive Overview (`/dashboard`)

```
┌──────────────────────────────────────────────────┐
│ [Signal Card]  [Payback]  [ROAS D30]  [BEP]  [Burn] │
├──────────────────────────────────────────────────┤
│                                                  │
│  Retention Curve — Rich Layered                  │
│  • P50 solid blue line (2.5px)                   │
│  • P25-P75 inner band (opacity 0.15)             │
│  • P10-P90 outer band (opacity 0.06)             │
│  • Genre benchmark dashed amber line             │
│  • Asymptotic arrival vertical green dashed      │
│  • Data points: hollow circles on P50            │
│  • Legend: bottom-right                          │
│                                                  │
├────────────────────┬─────────────────────────────┤
│ Revenue Forecast   │ AI Recommendation           │
│ Fan chart          │ Natural language summary     │
│ (widens into       │ with confidence score        │
│  future)           │ and key signals              │
└────────────────────┴─────────────────────────────┘
```

**Signal Card spec:**
- Background: green-50/amber-50/red-50 based on signal
- Top: signal label ("INVEST" / "HOLD" / "REDUCE")
- Center: confidence percentage (large, bold)
- Bottom: 1-line reason

**KPI Card spec:**
- Label: text-xs uppercase tracking-wide text-gray-400
- Value: text-2xl font-bold text-gray-900
- Trend: text-sm with arrow + color (green up, red down)

### 7.2 Module 2: Market Gap (`/dashboard/market-gap`)

```
┌──────────────────────────────────────────────────┐
│ [Genre Rank]     [D7 vs Genre Avg]  [Revenue Gap]│
├──────────────────────────────────────────────────┤
│                                                  │
│  Retention Benchmark Overlay                     │
│  • My game: solid blue line                      │
│  • Genre P10-P90 band: light gray fill           │
│  • Genre P50: dashed gray line                   │
│                                                  │
├────────────────────┬─────────────────────────────┤
│ Competitor Table   │ Market Saturation            │
│ Top 10 titles      │ Bar chart by metric          │
│ Sortable columns   │ (Downloads, Revenue,         │
│                    │  Retention)                  │
└────────────────────┴─────────────────────────────┘
```

### 7.3 Module 3: Action Impact (`/dashboard/actions`)

```
┌──────────────────────────────────────────────────┐
│ [Total Actions]   [Avg Impact]    [Best Action]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Action Timeline                                 │
│  • Line: retention trend over time               │
│  • Markers: vertical lines at action dates       │
│  • Marker labels: action type icons              │
│  • Tooltip: action detail + estimated impact     │
│                                                  │
├──────────────────────────────────────────────────┤
│ Action Log Table                                 │
│ Date | Type | Description | ΔLTV | Confidence    │
│ Sortable, filterable via shadcn DataTable        │
└──────────────────────────────────────────────────┘
```

### 7.4 Module 4: Experiments (`/dashboard/experiments`)

```
┌──────────────────────────────────────────────────┐
│ [Velocity]  [Ship Rate]  [Win Rate]  [Cum. ΔLTV] │
├──────────────────────────────────────────────────┤
│                                                  │
│  Experiment ROI Horizontal Bar Chart             │
│  • Each bar = one experiment                     │
│  • Green bars = winners (positive ΔLTV)          │
│  • Red bars = losers (negative ΔLTV)             │
│  • Sorted by absolute impact                     │
│                                                  │
├──────────────────────────────────────────────────┤
│ Experiment Detail Table                          │
│ Name | ATE | ΔLTV | Annual Revenue | ROI | Status│
│ Status badges: Shipped / Running / Failed        │
└──────────────────────────────────────────────────┘
```

### 7.5 Module 5: Capital Console (`/dashboard/capital`)

```
┌──────────────────────────────────────────────────┐
│ [Capital Eff.]  [Burn Months]  [IRR]    [NPV]   │
├──────────────────────────────────────────────────┤
│                                                  │
│  Scenario Simulator                              │
│  UA Budget    [━━━━━━●━━━━━━━] $50K - $200K     │
│  Target ROAS  [━━━●━━━━━━━━━━] 100% - 300%      │
│  → Real-time payback period + BEP probability    │
│    chart updates as sliders move                 │
│                                                  │
├────────────────────┬─────────────────────────────┤
│ Budget Allocation  │ 3-Year Revenue Projection   │
│ Donut chart        │ Fan chart (P10/P50/P90)     │
│ (UA/LiveOps/R&D)   │ Widens further out          │
└────────────────────┴─────────────────────────────┘
```

---

## 8. Chart Components Detail

| Component | Recharts Type | Key Props |
|-----------|--------------|-----------|
| `retention-curve.tsx` | `AreaChart` | 3x `<Area>` (P10-P90, P25-P75 fills), 1x `<Line>` (P50), `<ReferenceLine>` (asymptotic, genre) |
| `revenue-forecast.tsx` | `AreaChart` | Fan band widens with time, `<Area>` fillOpacity gradient |
| `action-timeline.tsx` | `ComposedChart` | `<Line>` (retention) + `<ReferenceDot>` (event markers) |
| `experiment-bar.tsx` | `BarChart` layout="vertical" | `<Bar>` with conditional fill (green/red), `<Cell>` per entry |
| `scenario-simulator.tsx` | `LineChart` + shadcn `Slider` | Slider onChange → React state → chart re-render |
| `budget-donut.tsx` | `PieChart` | `<Pie>` innerRadius={60} outerRadius={80} |
| `cohort-heatmap.tsx` | Custom CSS grid | Tailwind bg-opacity classes, no Recharts |

### Retention Curve — Implementation Notes

```
<AreaChart>
  {/* P10-P90 outer band */}
  <Area dataKey="p90" stroke="none" fill="#2563EB" fillOpacity={0.06} />
  <Area dataKey="p10" stroke="none" fill="#FFFFFF" fillOpacity={1} />
  
  {/* P25-P75 inner band */}  
  <Area dataKey="p75" stroke="none" fill="#2563EB" fillOpacity={0.15} />
  <Area dataKey="p25" stroke="none" fill="#FFFFFF" fillOpacity={1} />
  
  {/* P50 main line */}
  <Line dataKey="p50" stroke="#2563EB" strokeWidth={2.5} dot={{ r:3.5, fill:'#FFF', stroke:'#2563EB' }} />
  
  {/* Genre benchmark */}
  <Line dataKey="genreP50" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
  
  {/* Asymptotic arrival */}
  <ReferenceLine x="D30" stroke="#22C55E" strokeDasharray="3 3" label="Asymptotic" />
</AreaChart>
```

Note: Actual implementation will use a stacked area approach where bands are computed as (p90 - p10) ranges. The pseudo-code above illustrates the visual intent.

---

## 9. Mock Data Shape

```typescript
// lib/mock-data.ts

export const mockRetention = {
  gameId: "puzzle-quest",
  gameName: "Puzzle Quest",
  cohort: "2026-03",
  genre: "Puzzle",
  data: [
    { day: 1,  p10: 38, p25: 40, p50: 42.3, p75: 45, p90: 47, genre: 34.1 },
    { day: 2,  p10: 28, p25: 30, p50: 33.1, p75: 36, p90: 38, genre: 26.5 },
    { day: 3,  p10: 22, p25: 25, p50: 27.8, p75: 30, p90: 33, genre: 22.0 },
    { day: 7,  p10: 14, p25: 16, p50: 18.7, p75: 21, p90: 23, genre: 14.2 },
    { day: 14, p10: 9,  p25: 11, p50: 13.2, p75: 15, p90: 17, genre: 9.8  },
    { day: 30, p10: 5,  p25: 7,  p50: 8.5,  p75: 10, p90: 12, genre: 6.4  },
    { day: 60, p10: 3,  p25: 5,  p50: 6.1,  p75: 8,  p90: 9,  genre: 4.2  },
  ],
  asymptoticDay: 30,
}

export const mockKPIs = {
  signal: { status: "invest", confidence: 87, reason: "Strong D7 retention with favorable payback trajectory" },
  payback: { value: 47, unit: "days", trend: -12, trendLabel: "faster" },
  roas: { value: 142, unit: "%", trend: 8.3, trendLabel: "up" },
  bep: { value: 87, unit: "%", trend: 3.1, trendLabel: "up" },
  burn: { value: 8.2, unit: "months", trend: 0.5, trendLabel: "up" },
}

export const mockRevenueForecast = [
  { month: "Apr", p10: 82, p50: 120, p90: 165 },
  { month: "May", p10: 75, p50: 135, p90: 200 },
  { month: "Jun", p10: 65, p50: 148, p90: 240 },
  // ... extends to 12 months
]

export const mockExperiments = [
  { id: 1, name: "Tutorial Redesign", ate: 3.7, deltaLtv: 2.4, annualRevenue: 180000, roi: 450, status: "shipped", decision: "win" },
  { id: 2, name: "IAP Price Test",    ate: -1.2, deltaLtv: -0.8, annualRevenue: -60000, roi: -150, status: "reverted", decision: "lose" },
  { id: 3, name: "Push Notification",  ate: 1.1, deltaLtv: 0.7, annualRevenue: 52000, roi: 260, status: "shipped", decision: "win" },
  { id: 4, name: "Reward Calendar",    ate: 2.8, deltaLtv: 1.9, annualRevenue: 142000, roi: 710, status: "running", decision: "pending" },
]

export const mockActions = [
  { date: "2026-03-01", type: "ua",      description: "TikTok campaign launch",     deltaLtv: 1.2, confidence: 78 },
  { date: "2026-03-08", type: "liveops",  description: "Spring event start",         deltaLtv: 2.1, confidence: 85 },
  { date: "2026-03-15", type: "release",  description: "v2.3 — new dungeon system",  deltaLtv: 3.4, confidence: 72 },
  { date: "2026-03-22", type: "ua",      description: "Meta Advantage+ scaling",    deltaLtv: 0.8, confidence: 65 },
]

export const mockCapital = {
  capitalEfficiency: { value: 1.42, trend: 0.12 },
  burnMonths: { value: 8.2, trend: 0.5 },
  irr: { value: 34, unit: "%", trend: 5 },
  npv: { value: 2800000, trend: 400000 },
  budgetAllocation: [
    { name: "UA", value: 55, color: "#2563EB" },
    { name: "Live Ops", value: 25, color: "#8B5CF6" },
    { name: "R&D", value: 20, color: "#06B6D4" },
  ],
}

export const mockCompetitors = [
  { rank: 1, name: "Candy Crush Saga", d1: 45.2, d7: 22.1, d30: 12.3, revenue: "$45M" },
  { rank: 2, name: "Royal Match",      d1: 43.8, d7: 20.5, d30: 11.1, revenue: "$38M" },
  { rank: 3, name: "Puzzle Quest",     d1: 42.3, d7: 18.7, d30: 8.5,  revenue: "$12M" },
  // ... top 10
]
```

---

## 10. Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.15.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.460.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-tooltip": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## 11. i18n — Korean / English

### Implementation
- Simple dictionary object in `lib/i18n.ts` (no heavy i18n library for MVP)
- Language toggle button in sidebar footer or page header
- React Context for current locale, `useLocale()` hook
- Default: Korean (심사위원 데모 기본)

### Structure
```typescript
// lib/i18n.ts
export type Locale = "ko" | "en"

export const t = {
  // Sidebar
  "nav.decision":        { ko: "의사결정",         en: "Decision" },
  "nav.executive":       { ko: "투자 판정 요약",    en: "Executive Overview" },
  "nav.marketGap":       { ko: "시장 격차 분��",    en: "Market Gap" },
  "nav.actions":         { ko: "액션 임팩트",       en: "Action Impact" },
  "nav.experiments":     { ko: "실험 투자 보드",    en: "Experiment Board" },
  "nav.capital":         { ko: "자본 배분 콘솔",    en: "Capital Console" },
  "nav.settings":        { ko: "설정",             en: "Settings" },
  "nav.integrations":    { ko: "연동 관리",         en: "Integrations" },
  "nav.account":         { ko: "계정",             en: "Account" },

  // Module titles
  "exec.title":          { ko: "추가 투자가 가능한가?",       en: "Can We Invest More?" },
  "market.title":        { ko: "우리는 어디에 있는가?",       en: "Where Do We Stand?" },
  "actions.title":       { ko: "실제로 효과가 있는 것은?",     en: "What's Actually Working?" },
  "experiments.title":   { ko: "R&D가 성과를 내고 있는가?",   en: "Is R&D Paying Off?" },
  "capital.title":       { ko: "다음에 무엇을 해야 하는가?",   en: "What Should We Do Next?" },

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

  // Chart labels
  "chart.retention":     { ko: "리텐션 커브",           en: "Retention Curve" },
  "chart.p50":           { ko: "P50 (중앙값)",          en: "P50 (Median)" },
  "chart.band":          { ko: "P10/P90 신뢰구간",      en: "P10/P90 Confidence Band" },
  "chart.innerBand":     { ko: "P25/P75 신뢰구간",      en: "P25/P75 Confidence Band" },
  "chart.genreAvg":      { ko: "장르 평균",              en: "Genre Average" },
  "chart.asymptotic":    { ko: "안정화 도달점",           en: "Asymptotic Arrival" },
  "chart.revenue":       { ko: "매출 예측",              en: "Revenue Forecast" },
  "chart.scenario":      { ko: "시나리오 시뮬레이터",      en: "Scenario Simulator" },
  "chart.budgetAlloc":   { ko: "예산 배분",              en: "Budget Allocation" },

  // Experiment
  "exp.velocity":        { ko: "실험 속도",     en: "Velocity" },
  "exp.shipRate":        { ko: "출시율",        en: "Ship Rate" },
  "exp.winRate":         { ko: "성공률",        en: "Win Rate" },
  "exp.cumDeltaLtv":     { ko: "누적 ΔLTV",    en: "Cum. ΔLTV" },
  "exp.shipped":         { ko: "출시됨",        en: "Shipped" },
  "exp.running":         { ko: "진행중",        en: "Running" },
  "exp.reverted":        { ko: "롤백��",        en: "Reverted" },

  // Actions
  "action.ua":           { ko: "UA 캠페인",    en: "UA Campaign" },
  "action.liveops":      { ko: "라이브 운영",   en: "Live Ops" },
  "action.release":      { ko: "릴리즈",        en: "Release" },

  // Common
  "common.days":         { ko: "일",   en: "days" },
  "common.months":       { ko: "개월", en: "months" },
  "common.export":       { ko: "내보내기", en: "Export" },
  "common.lastUpdated":  { ko: "최종 업데이트", en: "Last updated" },
  "common.game":         { ko: "게임",    en: "Game" },
  "common.period":       { ko: "기간",    en: "Period" },
  "common.recommendation": { ko: "AI 권고", en: "AI Recommendation" },
} as const
```

### Language Toggle
- Location: sidebar footer, left of game selector
- Icon: 🌐 globe icon
- Click toggles ko ↔ en
- Preference saved in localStorage

---

## 12. Out of Scope (MVP)

- Authentication (login page exists but no real auth)
- Backend API / Supabase integration
- Real data fetching / TanStack Query
- FSD architecture (simplified flat components)
- Dark mode toggle
- Mobile responsive layout
- Real-time updates
- PDF export

---

## 13. Success Criteria

1. All 5 modules navigable via sidebar
2. Each module displays KPI cards with dummy data
3. Retention curve renders with dual confidence bands + genre benchmark + asymptotic marker
4. Scenario simulator sliders update charts in real-time
5. Signal card displays invest/hold/reduce with confidence
6. Overall visual quality matches Stripe/Linear standard
7. Page loads in < 2 seconds (static dummy data)
8. Korean/English toggle works across all modules — all UI text switches instantly
