"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  mockConnections,
  type Connection,
} from "@/shared/api/mock-connections"
import { ConnectionCard } from "./connection-card"
import { ConnectionDialog } from "./connection-dialog"

export function ConnectionsClient() {
  const [active, setActive] = useState<Connection | null>(null)

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    id: cat,
    label: CATEGORY_LABEL[cat],
    items: mockConnections.filter((c) => c.category === cat),
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => alert("연동 추가는 PR 4에서 활성화됩니다.")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Plus className="h-4 w-4" />
          연동 추가
        </button>
      </div>

      {byCategory.map((g) => (
        <section key={g.id}>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {g.label}
          </h2>
          {g.items.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {g.items.map((c) => (
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
      />
    </div>
  )
}
