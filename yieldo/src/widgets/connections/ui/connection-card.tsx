"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type {
  Connection,
  ConnectionStatus,
} from "@/shared/api/mock-connections"
import { useLiveAfData } from "@/shared/api/appsflyer/use-live-af-data"
import type { AppStatus } from "@/shared/api/appsflyer/types"
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

/** 6-state live status sublabel — connected 카드에서만 표시. */
const LIVE_LABEL: Record<AppStatus, string> = {
  backfilling: "백필 중",
  active: "정상",
  stale: "지연",
  failed: "실패",
  credential_invalid: "재등록 필요",
  app_missing: "앱 권한 확인",
}

/** 6-state live status에 따라 CTA 오버라이드. */
const LIVE_CTA_OVERRIDE: Partial<Record<AppStatus, string>> = {
  credential_invalid: "재등록",
  app_missing: "확인",
  failed: "재시도",
  stale: "재시도",
}

export function ConnectionCard({ connection, href, onClick }: ConnectionCardProps) {
  const style = STATUS_STYLE[connection.status]
  const isActive = connection.status !== "disconnected"

  // Live status polling — connected 카드만 활성화
  const live = useLiveAfData(connection.status === "connected" ? connection.id : null)

  const cta = (live.status && LIVE_CTA_OVERRIDE[live.status]) ?? PRIMARY_CTA[connection.status]
  const liveLabel = live.status ? LIVE_LABEL[live.status] : null

  // Status-aware hover border (green/amber/red/primary) + phosphor accent on active cards
  const HOVER_BORDER: Record<ConnectionStatus, string> = {
    connected: "hover:border-success",
    warn: "hover:border-warning",
    error: "hover:border-destructive",
    disconnected: "hover:border-primary",
  }
  const cardClass = cn(
    "group relative block w-full text-left rounded-2xl border border-border bg-card p-5",
    "transition-all hover:shadow-sm",
    HOVER_BORDER[connection.status],
    isActive &&
      "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[var(--phosphor)]",
  )

  const Body = (
    <>
      {/* 1행 — 브랜드 chip + 이름 + 상태 */}
      <div className="flex items-start gap-3">
        {connection.initials && connection.brandColor && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 text-xs font-bold text-white"
            style={{ background: connection.brandColor }}
            data-testid="brand-chip"
            aria-hidden="true"
          >
            {connection.initials}
          </div>
        )}
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
          {liveLabel ?? style.label}
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
