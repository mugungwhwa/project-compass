"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import {
  AVAILABLE_CONNECTORS,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  type Connection,
} from "@/shared/api/mock-connections"
import { loadFinancialInput } from "@/shared/api/financial-input"
import { ConnectionCard } from "./connection-card"
import { ConnectionDialog } from "./connection-dialog"
import { DemoSeedToolbar } from "./demo-seed-toolbar"

export function ConnectionsClient() {
  const [active, setActive] = useState<Connection | null>(null)
  const [registered, setRegistered] = useState<string[]>([])
  const [hasFinancialInput, setHasFinancialInput] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshApps = useCallback(async () => {
    try {
      const res = await fetch("/api/appsflyer/apps")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setRegistered(Array.isArray(json.appIds) ? json.appIds : [])
    } catch {
      setRegistered([])
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshFinancial = useCallback(() => {
    setHasFinancialInput(loadFinancialInput() !== null)
  }, [])

  useEffect(() => {
    refreshApps()
  }, [refreshApps])

  useEffect(() => {
    refreshFinancial()
  }, [refreshFinancial])

  const allConnectors: Connection[] = AVAILABLE_CONNECTORS.map(
    (c): Connection => ({
      ...c,
      status:
        registered.includes(c.id) ||
        (c.id === "manual-financial" && hasFinancialInput)
          ? "connected"
          : "disconnected",
    }),
  )

  const byCategory = CATEGORY_ORDER.map((cat) => {
    const items = allConnectors.filter((c: Connection) => c.category === cat)
    const connectedCount = items.filter((c) => c.status === "connected").length
    return {
      id: cat,
      label: CATEGORY_LABEL[cat],
      items,
      connectedCount,
      totalCount: items.length,
    }
  })

  const totalCount = allConnectors.length
  const connectedCount = allConnectors.filter((c) => c.status === "connected").length
  const progressPct = totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Demo seed toolbar (PR-D) */}
      <DemoSeedToolbar
        hasInput={hasFinancialInput}
        onChange={refreshFinancial}
      />

      {/* Stats header — 전체 진행률 + silo별 카운트 칩 (PR-E) */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
              {connectedCount}
              <span className="text-base text-muted-foreground"> / {totalCount}</span>
            </span>
            <span className="text-sm text-muted-foreground">연동 완료</span>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <span className="text-xs text-muted-foreground">불러오는 중...</span>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              disabled
              title="개별 connector 카드의 '연동하기' 버튼을 사용하세요"
            >
              <Plus className="h-4 w-4" />
              연동 추가
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
            aria-hidden="true"
          />
        </div>

        {/* Per-silo chips */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {byCategory.map((g) => (
            <div
              key={g.id}
              className="rounded-lg border border-border bg-background px-3 py-2"
            >
              <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground truncate">
                {g.label}
              </div>
              <div className="mt-1 text-sm font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                {g.connectedCount}<span className="text-muted-foreground">/{g.totalCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {byCategory.map((g) => (
        <section key={g.id}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {g.label}
            </h2>
            <span
              className="text-[11px] font-bold tabular-nums text-muted-foreground"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {g.connectedCount}/{g.totalCount} 연결됨
            </span>
          </div>
          {g.items.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {g.items.map((c: Connection) => (
                <ConnectionCard
                  key={c.id}
                  connection={c}
                  onClick={() => setActive(c)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              곧 추가됩니다
            </div>
          )}
        </section>
      ))}

      <ConnectionDialog
        connection={active}
        onClose={() => setActive(null)}
        onRegistered={(id) => {
          if (id === "manual-financial") {
            refreshFinancial()
          } else {
            refreshApps()
          }
        }}
      />
    </div>
  )
}
