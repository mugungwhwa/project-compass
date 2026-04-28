# Overview Chart Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the retention curve on the Executive Overview with an interactive Revenue Decomposition chart (base + experiment stacked bar, legend-click isolation, velocity/elasticity header stats).

**Architecture:** Single new widget `ExperimentRevenue` with inline sub-components (VelocityElasticityBar, InteractiveLegend). Uses Recharts `ComposedChart` with two stacked `Bar` series + custom dot markers. State managed via `useState` for isolation mode. No external dependencies added.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Recharts, Framer Motion, existing shared UI (ChartHeader, ChartTooltip, ExpandButton).

**Spec:** `docs/superpowers/specs/2026-04-13-overview-chart-redesign.md`

**Verification:** This project has no test infrastructure. Verify via `npx tsc --noEmit` + `npx next build` + browser check.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Modify | `src/shared/api/mock-data.ts` | Add `RevenueDecompPoint`, `DecompStats` types + mock data |
| Modify | `src/shared/config/chart-colors.ts` | Add `REVENUE_DECOMP_COLORS` config |
| Modify | `src/shared/i18n/dictionary.ts` | Add i18n keys for decomp chart |
| Create | `src/widgets/charts/ui/experiment-revenue.tsx` | Main chart widget |
| Modify | `src/widgets/charts/index.ts` | Export `ExperimentRevenue` |
| Modify | `src/app/(dashboard)/dashboard/page.tsx` | Swap RetentionCurve → ExperimentRevenue |

---

### Task 1: Data Model + Mock Data

**Files:**
- Modify: `yieldo/src/shared/api/mock-data.ts`

- [ ] **Step 1: Add types after existing `RevenueVsInvestPoint`**

Find the line `export const mockRevenueVsInvest` and add the new types BEFORE it:

```typescript
export type RevenueDecompPoint = {
  month: string
  organic: number      // baseline revenue without experiments ($K)
  experiment: number   // revenue uplift from shipped experiments ($K)
  total: number        // organic + experiment
  expShipped: number   // experiments deployed this month
}

export type DecompStats = {
  totalExp: number
  shipRate: number
  avgDays: number
  cumDeltaLtv: number
  winRate: number
  expRoi: number
  organicQoQ: number
}
```

- [ ] **Step 2: Add mock data after `mockRevenueVsInvest` array**

```typescript
export const mockRevenueDecomp: RevenueDecompPoint[] = [
  { month: "Jul",  organic: 28, experiment: 0,  total: 28,  expShipped: 0 },
  { month: "Aug",  organic: 30, experiment: 15, total: 45,  expShipped: 1 },
  { month: "Sep",  organic: 34, experiment: 28, total: 62,  expShipped: 1 },
  { month: "Oct",  organic: 38, experiment: 40, total: 78,  expShipped: 2 },
  { month: "Nov",  organic: 42, experiment: 50, total: 92,  expShipped: 2 },
  { month: "Dec",  organic: 46, experiment: 59, total: 105, expShipped: 3 },
  { month: "Jan",  organic: 48, experiment: 64, total: 112, expShipped: 2 },
  { month: "Feb",  organic: 50, experiment: 68, total: 118, expShipped: 3 },
  { month: "Mar",  organic: 52, experiment: 73, total: 125, expShipped: 2 },
  { month: "Apr",  organic: 54, experiment: 78, total: 132, expShipped: 3 },
]

export const mockDecompStats: DecompStats = {
  totalExp: 12,
  shipRate: 68,
  avgDays: 9,
  cumDeltaLtv: 1.2,
  winRate: 41,
  expRoi: 3.8,
  organicQoQ: 8,
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/api/mock-data.ts
git commit -m "feat: add RevenueDecomp types and mock data"
```

---

### Task 2: Colors + i18n

**Files:**
- Modify: `yieldo/src/shared/config/chart-colors.ts`
- Modify: `yieldo/src/shared/i18n/dictionary.ts`

- [ ] **Step 1: Add color config after `REVENUE_VS_INVEST_COLORS`**

```typescript
export const REVENUE_DECOMP_COLORS = {
  organic:    PALETTE.benchmark,    // #9CA3AF — neutral gray
  experiment: PALETTE.p50,          // #1A7FE8 — brand blue
  deploy:     PALETTE.positive,     // #00875A — signal green
  grid:       PALETTE.grid,
  axis:       PALETTE.axis,
  border:     PALETTE.border,
  legend:     PALETTE.legendGray,
  fg0:        PALETTE.fg0,
  fg2:        PALETTE.fg2,
} as const
```

- [ ] **Step 2: Add i18n keys after `"chart.breakeven"` entries**

```typescript
  "chart.revenueDecomp":  { ko: "매출 원천 분해",       en: "Revenue Decomposition" },
  "chart.organic":        { ko: "베이스 매출",          en: "Baseline Revenue" },
  "chart.expLift":        { ko: "실험 매출",            en: "Experiment Revenue" },
  "chart.expRatio":       { ko: "실험 기여율",          en: "Experiment Share" },
  "chart.showAll":        { ko: "전체 보기",            en: "Show All" },
  "chart.deployCount":    { ko: "배포",                en: "Deployments" },
  "exp.velocity":         { ko: "속도",                en: "Velocity" },
  "exp.elasticity":       { ko: "탄력성",               en: "Elasticity" },
  "info.revenueDecomp":   { ko: "회색 영역은 실험 없이도 나왔을 매출, 파란 영역은 실험이 만든 추가 매출입니다. 레전드를 클릭하면 개별로 볼 수 있습니다.",
                            en: "Gray = baseline revenue without experiments. Blue = revenue created by experiments. Click legend items to isolate." },
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/config/chart-colors.ts src/shared/i18n/dictionary.ts
git commit -m "feat: add revenue decomposition colors and i18n keys"
```

---

### Task 3: ExperimentRevenue Chart Widget

**Files:**
- Create: `yieldo/src/widgets/charts/ui/experiment-revenue.tsx`

This is the main task. The component has three inline sub-sections: VelocityElasticityBar, InteractiveLegend, and the chart body.

- [ ] **Step 1: Create the component file**

```typescript
"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useLocale } from "@/shared/i18n"
import type { RevenueDecompPoint, DecompStats } from "@/shared/api/mock-data"
import { ChartHeader } from "@/shared/ui/chart-header"
import { ChartTooltip, TooltipDot } from "@/shared/ui/chart-tooltip"
import { ExpandButton } from "@/shared/ui/expand-button"
import { useChartExpand } from "@/shared/hooks/use-chart-expand"
import { REVENUE_DECOMP_COLORS } from "@/shared/config/chart-colors"
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const C = REVENUE_DECOMP_COLORS

type IsolateMode = "all" | "organic" | "experiment"

type ExperimentRevenueProps = {
  data: RevenueDecompPoint[]
  stats: DecompStats
}

/* ── Velocity / Elasticity stats bar ── */
function StatsBar({
  mode,
  stats,
  locale,
}: {
  mode: IsolateMode
  stats: DecompStats
  locale: string
}) {
  if (mode === "organic") {
    return (
      <div className="mb-3 flex items-center gap-6 rounded-md bg-[var(--bg-2)] px-4 py-2.5">
        <div className="text-[11px] text-[var(--fg-2)]">
          <span className="font-medium text-[var(--fg-0)]">
            +{stats.organicQoQ}% QoQ
          </span>
          {" "}
          {locale === "ko" ? "기저 매출 추이" : "baseline trend"}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-3 flex items-center justify-between rounded-md bg-[var(--bg-2)] px-4 py-2.5">
      <div className="text-[11px] text-[var(--fg-2)]">
        <span className="mr-1 font-semibold text-[var(--fg-0)]">
          {locale === "ko" ? "속도" : "Velocity"}
        </span>
        {stats.totalExp} exp · {stats.shipRate}% ship · {stats.avgDays}d avg
      </div>
      <div className="text-[11px] text-[var(--fg-2)]">
        <span className="mr-1 font-semibold text-[var(--fg-0)]">
          {locale === "ko" ? "탄력성" : "Elasticity"}
        </span>
        +${stats.cumDeltaLtv} ΔLTV · {stats.winRate}% win · {stats.expRoi}× ROI
      </div>
    </div>
  )
}

/* ── Interactive legend with click-to-isolate ── */
function DecompLegend({
  mode,
  onToggle,
  labels,
}: {
  mode: IsolateMode
  onToggle: (layer: IsolateMode) => void
  labels: { organic: string; experiment: string; showAll: string }
}) {
  const items: { key: IsolateMode; color: string; label: string }[] = [
    { key: "organic", color: C.organic, label: labels.organic },
    { key: "experiment", color: C.experiment, label: labels.experiment },
  ]

  return (
    <div className="mt-2 flex items-center justify-center gap-5">
      {items.map((item) => {
        const isActive = mode === "all" || mode === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(item.key)}
            className="flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-80"
            style={{ opacity: isActive ? 1 : 0.35 }}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </button>
        )
      })}
      {mode !== "all" && (
        <button
          type="button"
          onClick={() => onToggle("all")}
          className="ml-2 rounded border border-[var(--border-default)] px-2 py-0.5 text-[10px] text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)]"
        >
          {labels.showAll}
        </button>
      )}
    </div>
  )
}

/* ── Deploy marker rendered as custom bar label ── */
function DeployMarker({ x, y, width, value }: { x: number; y: number; width: number; value: number }) {
  if (value === 0) return null
  const cx = x + width / 2
  return (
    <g>
      <polygon
        points={`${cx},${y - 14} ${cx - 4},${y - 6} ${cx + 4},${y - 6}`}
        fill={C.deploy}
      />
      <text x={cx} y={y - 17} textAnchor="middle" fontSize={9} fontWeight={600} fill={C.deploy}>
        {value}
      </text>
    </g>
  )
}

/* ── Main component ── */
export function ExperimentRevenue({ data, stats }: ExperimentRevenueProps) {
  const { t, locale } = useLocale()
  const { expanded, toggle, gridClassName, chartHeight } = useChartExpand({ baseHeight: 384 })
  const [mode, setMode] = useState<IsolateMode>("all")

  const handleToggle = (layer: IsolateMode) => {
    setMode((prev) => (prev === layer ? "all" : layer))
  }

  // Compute Y-axis domain based on isolation mode
  const yDomain = useMemo(() => {
    if (mode === "all") {
      const max = Math.max(...data.map((d) => d.total))
      return [0, Math.ceil(max / 20) * 20]
    }
    const values = data.map((d) => d[mode])
    const max = Math.max(...values)
    return [0, Math.ceil(max / 20) * 20]
  }, [data, mode])

  // Last month experiment share for insight
  const lastPoint = data[data.length - 1]
  const expShare = lastPoint ? Math.round((lastPoint.experiment / lastPoint.total) * 100) : 0

  return (
    <motion.div
      layout
      className={`rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-1)] p-6 ${gridClassName}`}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChartHeader
        title={t("chart.revenueDecomp")}
        subtitle="Puzzle Quest · 2025 Jul — 2026 Apr · $K"
        context={t("info.revenueDecomp")}
        insight={
          locale === "ko"
            ? `실험이 매출의 ${expShare}%를 만들고 있습니다.`
            : `Experiments drive ${expShare}% of revenue.`
        }
        actions={<ExpandButton expanded={expanded} onToggle={toggle} />}
      />

      <StatsBar mode={mode} stats={stats} locale={locale} />

      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={data} margin={{ top: 20, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: C.axis }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: C.axis }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v}`}
            width={48}
            domain={yDomain}
            label={{
              value: "$K",
              position: "top",
              offset: 4,
              style: { fontSize: 10, fill: C.axis, textAnchor: "middle" },
            }}
          />

          <Tooltip
            content={
              <ChartTooltip
                render={({ payload, label }) => {
                  const d = payload[0]?.payload as RevenueDecompPoint | undefined
                  if (!d) return null
                  const ratio = d.total > 0 ? Math.round((d.experiment / d.total) * 100) : 0
                  return (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.fg0, marginBottom: 6 }}>
                        {label}
                      </div>
                      {(mode === "all" || mode === "organic") && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                          <TooltipDot color={C.organic} />
                          <span style={{ color: C.fg2 }}>{t("chart.organic")}</span>
                          <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: C.fg0, fontVariantNumeric: "tabular-nums" }}>
                            ${d.organic}K
                          </span>
                        </div>
                      )}
                      {(mode === "all" || mode === "experiment") && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                          <TooltipDot color={C.experiment} />
                          <span style={{ color: C.fg2 }}>{t("chart.expLift")}</span>
                          <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 500, color: C.fg0, fontVariantNumeric: "tabular-nums" }}>
                            ${d.experiment}K
                          </span>
                        </div>
                      )}
                      {mode === "all" && (
                        <>
                          <div style={{ borderTop: "1px solid #E2E2DD", margin: "4px 0" }} />
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: 1.6 }}>
                            <span style={{ color: C.fg2 }}>{locale === "ko" ? "총 매출" : "Total"}</span>
                            <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 700, color: C.fg0, fontVariantNumeric: "tabular-nums" }}>
                              ${d.total}K
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, lineHeight: 1.6, opacity: 0.7 }}>
                            <span style={{ color: C.fg2, marginLeft: 0 }}>
                              {t("chart.expRatio")} {ratio}%
                            </span>
                          </div>
                        </>
                      )}
                      {d.expShipped > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, lineHeight: 1.6, marginTop: 2 }}>
                          <TooltipDot color={C.deploy} />
                          <span style={{ color: C.fg2 }}>
                            {t("chart.deployCount")} {d.expShipped}{locale === "ko" ? "건" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                }}
              />
            }
          />

          {/* ── Organic bar (bottom of stack) ── */}
          {(mode === "all" || mode === "organic") && (
            <Bar
              dataKey="organic"
              stackId="revenue"
              fill={C.organic}
              fillOpacity={mode === "organic" ? 0.85 : 0.55}
              radius={mode === "organic" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              barSize={32}
              name={t("chart.organic")}
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
              isAnimationActive={false}
            />
          )}

          {/* ── Experiment bar (top of stack) ── */}
          {(mode === "all" || mode === "experiment") && (
            <Bar
              dataKey="experiment"
              stackId={mode === "all" ? "revenue" : "exp-solo"}
              fill={C.experiment}
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
              barSize={32}
              name={t("chart.expLift")}
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
              isAnimationActive={false}
              label={mode !== "organic" ? (props: Record<string, unknown>) => {
                const { x, y, width, index } = props as { x: number; y: number; width: number; index: number }
                const point = data[index]
                if (!point || point.expShipped === 0) return <g key={index} />
                return <DeployMarker key={index} x={x} y={y} width={width} value={point.expShipped} />
              } : undefined}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <DecompLegend
        mode={mode}
        onToggle={handleToggle}
        labels={{
          organic: t("chart.organic"),
          experiment: t("chart.expLift"),
          showAll: t("chart.showAll"),
        }}
      />
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/widgets/charts/ui/experiment-revenue.tsx
git commit -m "feat: add ExperimentRevenue chart widget with isolation mode"
```

---

### Task 4: Wire Up — Exports + Overview Page

**Files:**
- Modify: `yieldo/src/widgets/charts/index.ts`
- Modify: `yieldo/src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Add export to charts index**

Add this line to `src/widgets/charts/index.ts`:

```typescript
export { ExperimentRevenue } from "./ui/experiment-revenue"
```

- [ ] **Step 2: Update Overview page imports**

In `src/app/(dashboard)/dashboard/page.tsx`, change the charts import:

```typescript
// Before:
import { RevenueVsInvest, RetentionCurve, RevenueForecast } from "@/widgets/charts"

// After:
import { RevenueVsInvest, ExperimentRevenue, RevenueForecast } from "@/widgets/charts"
```

- [ ] **Step 3: Update mock data imports**

```typescript
// Before:
import {
  mockSignal,
  mockKPIs,
  mockRetention,
  mockRevenueForecast,
  mockRevenueVsInvest,
} from "@/shared/api"

// After:
import {
  mockSignal,
  mockKPIs,
  mockRevenueForecast,
  mockRevenueVsInvest,
  mockRevenueDecomp,
  mockDecompStats,
} from "@/shared/api"
```

- [ ] **Step 4: Swap chart in JSX**

Replace the chart grid section:

```tsx
{/* Before: */}
<FadeInUp className="grid grid-cols-2 gap-6 mb-8">
  <RevenueVsInvest data={mockRevenueVsInvest} />
  <RetentionCurve data={mockRetention.data} asymptoticDay={mockRetention.asymptoticDay} />
</FadeInUp>

{/* After: */}
<FadeInUp className="grid grid-cols-2 gap-6 mb-8">
  <RevenueVsInvest data={mockRevenueVsInvest} />
  <ExperimentRevenue data={mockRevenueDecomp} stats={mockDecompStats} />
</FadeInUp>
```

- [ ] **Step 5: Remove unused import**

Remove `mockRetention` from imports (it's no longer used on this page). Keep `RetentionCurve` available in charts/index.ts for Market Gap module.

- [ ] **Step 6: Verify build**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Then: `npx next build 2>&1 | tail -15`
Expected: Both pass with no errors. All 10 pages generated.

- [ ] **Step 7: Browser verify**

Run: `npx next start -p 3077 &` then `open http://localhost:3077/dashboard`

Check:
- [ ] Revenue vs Investment chart renders (left)
- [ ] Revenue Decomposition chart renders (right) with stacked bars
- [ ] Stats bar shows velocity + elasticity
- [ ] Click "베이스 매출" legend → isolates organic bars, Y-axis rescales
- [ ] Click "실험 매출" legend → isolates experiment bars, Y-axis rescales
- [ ] Click again or "전체 보기" → returns to stacked view
- [ ] Tooltip shows correct data per mode
- [ ] Deploy markers (▲) visible on months with shipped experiments
- [ ] i18n toggle (ko/en) works

- [ ] **Step 8: Commit**

```bash
git add src/widgets/charts/index.ts src/app/(dashboard)/dashboard/page.tsx
git commit -m "feat: replace retention curve with experiment revenue on overview"
```

---

### Task 5: Final Verification + Commit All

- [ ] **Step 1: Full build check**

```bash
npx tsc --noEmit && npx next build
```

- [ ] **Step 2: Browser smoke test**

Verify all dashboard pages still render (the retention curve should still work on market-gap if used there):
- `/dashboard` — Overview with new charts
- `/dashboard/market-gap` — Should still render
- `/dashboard/experiments` — Should still render
- `/dashboard/actions` — Should still render
- `/dashboard/capital` — Should still render

- [ ] **Step 3: Summary commit (if any fixups needed)**

```bash
git add -A
git commit -m "chore: overview chart redesign — fixups and cleanup"
```
