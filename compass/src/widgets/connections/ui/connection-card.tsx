"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type {
  Connection,
  ConnectionStatus,
} from "@/shared/api/mock-connections"
import { cn } from "@/shared/lib/utils"

type ConnectionCardProps = {
  connection: Connection
  /** When provided, the card renders as a Next.js link instead of a button. */
  href?: string
  onClick?: () => void
}

const STATUS_STYLE: Record<
  ConnectionStatus,
  { label: string; dot: string; pill: string }
> = {
  connected: {
    label: "연결됨",
    dot: "bg-success",
    pill: "bg-success/15 text-success",
  },
  warn: {
    label: "검토 필요",
    dot: "bg-warning",
    pill: "bg-warning/20 text-warning",
  },
  error: {
    label: "에러",
    dot: "bg-destructive",
    pill: "bg-destructive/15 text-destructive",
  },
  disconnected: {
    label: "미연결",
    dot: "bg-muted-foreground/60",
    pill: "bg-muted text-muted-foreground",
  },
}

const PRIMARY_CTA: Record<ConnectionStatus, string> = {
  connected: "관리",
  warn: "재인증",
  error: "확인",
  disconnected: "연결하기",
}

export function ConnectionCard({ connection, href, onClick }: ConnectionCardProps) {
  const style = STATUS_STYLE[connection.status]
  const cta = PRIMARY_CTA[connection.status]
  const isActive = connection.status !== "disconnected"

  // Phosphor accent line on active cards (Bloomberg terminal aesthetic)
  const cardClass = cn(
    "group relative block w-full text-left rounded-2xl border border-border bg-card p-5",
    "transition-all hover:border-primary hover:shadow-sm",
    isActive &&
      "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[var(--phosphor)]",
  )

  const Body = (
    <>
      {/* 1행 — 브랜드 + 상태 (브랜드 아이콘 블록 제거됨) */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-foreground text-base leading-tight truncate">
            {connection.brand}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold flex-shrink-0",
            style.pill,
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
          {style.label}
        </span>
      </div>

      {/* 2행 — 설명 */}
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed break-keep line-clamp-2">
        {connection.description}
      </p>

      {/* 3행 — 메트릭 + 마지막 동기화 (phosphor-text 적용) */}
      {(connection.metrics || connection.lastSync) && (
        <div className="flex items-center gap-4 mt-4 text-[11px]">
          {connection.metrics?.map((m) => (
            <div key={m.label} className="flex items-baseline gap-1">
              <span
                className={cn(
                  "font-bold text-foreground",
                  isActive && "phosphor-text",
                )}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {m.value}
              </span>
              <span className="text-muted-foreground">{m.label}</span>
            </div>
          ))}
          {connection.lastSync && (
            <span className="text-muted-foreground ml-auto">
              · {connection.lastSync}
            </span>
          )}
        </div>
      )}

      {/* 4행 — CTA */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          {isActive ? "설정 · 관리" : "연동 시작"}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-1.5 transition-all">
          {cta}
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {Body}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={cardClass}>
      {Body}
    </button>
  )
}
