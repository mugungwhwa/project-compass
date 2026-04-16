"use client"

import { useState, useCallback } from "react"
import { PageHeader } from "@/widgets/sidebar"
import { useLocale } from "@/shared/i18n"
import type { TranslationKey } from "@/shared/i18n"
import { Badge } from "@/shared/ui/badge"
import { PageTransition, FadeInUp } from "@/shared/ui/page-transition"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Loader2, Circle, Lock, Upload, FileSpreadsheet } from "lucide-react"

/* ── Types ── */

type ConnectionStatus = "connected" | "verifying" | "error" | "disconnected"

type Platform = {
  id: string
  name: string
  description: { ko: string; en: string }
  category: "mmp" | "ab" | "manual"
  initial: string
  color: string
  status: ConnectionStatus
  lastSync?: { ko: string; en: string }
  icon?: typeof Upload
}

/* ── Mock Data ── */

const platforms: Platform[] = [
  {
    id: "appsflyer",
    name: "AppsFlyer",
    description: { ko: "어트리뷰션 · 코호트 리텐션", en: "Attribution · Cohort Retention" },
    category: "mmp",
    initial: "A",
    color: "#4DC9A0",
    status: "connected",
    lastSync: { ko: "3분 전", en: "3m ago" },
  },
  {
    id: "adjust",
    name: "Adjust",
    description: { ko: "어트리뷰션 · 장기 코호트", en: "Attribution · Long-term Cohorts" },
    category: "mmp",
    initial: "A",
    color: "#3C8BD9",
    status: "disconnected",
  },
  {
    id: "singular",
    name: "Singular",
    description: { ko: "어트리뷰션 · UA 최적화", en: "Attribution · UA Optimization" },
    category: "mmp",
    initial: "S",
    color: "#FF6B35",
    status: "disconnected",
  },
  {
    id: "ab180",
    name: "AB180 (Airbridge)",
    description: { ko: "어트리뷰션 · 국내 특화", en: "Attribution · Korea-focused" },
    category: "mmp",
    initial: "A",
    color: "#6C5CE7",
    status: "disconnected",
  },
  {
    id: "statsig",
    name: "Statsig",
    description: { ko: "실험 결과 · ATE 연동", en: "Experiment Results · ATE Integration" },
    category: "ab",
    initial: "S",
    color: "#1B2559",
    status: "error",
    lastSync: { ko: "12시간 전 오류", en: "Error 12h ago" },
  },
  {
    id: "csv-upload",
    name: "CSV / 직접 입력",
    description: { ko: "MMP·실험 플랫폼 없이 수동으로 데이터 입력", en: "Manual data entry without MMP or experiment platform" },
    category: "manual",
    initial: "",
    color: "var(--bg-3)",
    status: "disconnected",
    icon: FileSpreadsheet,
  },
]

const statusConfig: Record<ConnectionStatus, {
  variant: "default" | "secondary" | "destructive" | "outline"
  dotColor: string
  icon: typeof Check
  actionKey: TranslationKey
}> = {
  connected:    { variant: "default",     dotColor: "text-[var(--signal-positive)]", icon: Check,   actionKey: "settings.action.manage" },
  verifying:    { variant: "secondary",   dotColor: "text-[var(--signal-caution)]",  icon: Loader2, actionKey: "settings.action.manage" },
  error:        { variant: "destructive", dotColor: "text-[var(--signal-risk)]",     icon: X,       actionKey: "settings.action.reconnect" },
  disconnected: { variant: "outline",     dotColor: "text-[var(--fg-3)]",            icon: Circle,  actionKey: "settings.action.connect" },
}

/* ── Financial fields (Tier 1 — 5 fields from CLAUDE.md §8.5 Silo 4) ── */

const financialFields: { key: TranslationKey; id: string }[] = [
  { key: "settings.financial.monthlyRevenue", id: "monthlyRevenue" },
  { key: "settings.financial.uaSpend",        id: "uaSpend" },
  { key: "settings.financial.cashBalance",    id: "cashBalance" },
  { key: "settings.financial.monthlyBurn",    id: "monthlyBurn" },
  { key: "settings.financial.targetPayback",  id: "targetPayback" },
]

/* ── Page ── */

export default function SettingsPage() {
  const { t, locale } = useLocale()
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((message?: string) => {
    setToast(message ?? t("settings.comingSoon"))
    setTimeout(() => setToast(null), 2000)
  }, [t])

  const mmpPlatforms = platforms.filter((p) => p.category === "mmp")
  const abPlatforms = platforms.filter((p) => p.category === "ab")
  const manualPlatform = platforms.find((p) => p.category === "manual")!

  return (
    <PageTransition>
      <FadeInUp>
        <PageHeader titleKey="settings.title" subtitleKey="settings.subtitle" />
      </FadeInUp>

      {/* MMP Section */}
      <FadeInUp className="mb-8">
        <SectionHeader label={t("settings.category.mmp")} />
        <div className="overflow-hidden rounded-[var(--radius-card)] ring-1 ring-[var(--border-default)]">
          {mmpPlatforms.map((p, i) => (
            <PlatformRow
              key={p.id}
              platform={p}
              locale={locale}
              statusLabel={t(`settings.status.${p.status}` as TranslationKey)}
              actionLabel={t(statusConfig[p.status].actionKey)}
              lastSyncLabel={t("settings.lastSync")}
              securityLabel={t("settings.security.encrypted")}
              isLast={i === mmpPlatforms.length - 1}
              onClick={() => showToast()}
            />
          ))}
        </div>
        <p className="mt-2.5 text-caption text-[var(--fg-3)]">
          {t("settings.hint.mmp")}
        </p>
      </FadeInUp>

      {/* A/B Test Section */}
      <FadeInUp className="mb-8">
        <SectionHeader label={t("settings.category.ab")} />
        <div className="overflow-hidden rounded-[var(--radius-card)] ring-1 ring-[var(--border-default)]">
          {abPlatforms.map((p, i) => (
            <PlatformRow
              key={p.id}
              platform={p}
              locale={locale}
              statusLabel={t(`settings.status.${p.status}` as TranslationKey)}
              actionLabel={t(statusConfig[p.status].actionKey)}
              lastSyncLabel={t("settings.lastSync")}
              securityLabel={t("settings.security.encrypted")}
              isLast={i === abPlatforms.length - 1}
              onClick={() => showToast()}
            />
          ))}
        </div>
        <p className="mt-2.5 text-caption text-[var(--fg-3)]">
          {t("settings.hint.ab")}
        </p>
      </FadeInUp>

      {/* Manual Input Section */}
      <FadeInUp className="mb-8">
        <SectionHeader label={t("settings.category.manual")} />
        <div className="overflow-hidden rounded-[var(--radius-card)] ring-1 ring-[var(--border-default)]">
          <PlatformRow
            platform={manualPlatform}
            locale={locale}
            statusLabel={t(`settings.status.${manualPlatform.status}` as TranslationKey)}
            actionLabel={t(statusConfig[manualPlatform.status].actionKey)}
            lastSyncLabel={t("settings.lastSync")}
            securityLabel={t("settings.security.encrypted")}
            isLast
            onClick={() => showToast()}
          />
        </div>
        <p className="mt-2.5 text-caption text-[var(--fg-3)]">
          {t("settings.hint.manual")}
        </p>
      </FadeInUp>

      {/* Financial Data Section (Silo 4 — Tier 1) */}
      <FadeInUp className="mb-8">
        <SectionHeader label={t("settings.category.financial")} />
        <FinancialForm locale={locale} t={t} onSave={() => showToast(t("settings.financial.saved"))} />
        <p className="mt-2.5 text-caption text-[var(--fg-3)]">
          {t("settings.hint.financial")}
        </p>
      </FadeInUp>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[var(--radius-card)] bg-[var(--bg-0)] px-5 py-3 text-body text-[var(--fg-0)] ring-1 ring-[var(--border-default)] shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

/* ── Section Header ── */

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="mb-3 text-caption font-semibold uppercase tracking-wider text-[var(--fg-2)]">
      {label}
    </p>
  )
}

/* ── Platform Row ── */

function PlatformRow({
  platform,
  locale,
  statusLabel,
  actionLabel,
  lastSyncLabel,
  securityLabel,
  isLast,
  onClick,
}: {
  platform: Platform
  locale: "ko" | "en"
  statusLabel: string
  actionLabel: string
  lastSyncLabel: string
  securityLabel: string
  isLast: boolean
  onClick: () => void
}) {
  const cfg = statusConfig[platform.status]
  const StatusIcon = cfg.icon
  const isDisconnected = platform.status === "disconnected"
  const isConnected = platform.status === "connected"
  const AvatarIcon = platform.icon

  return (
    <div
      className={`flex items-center gap-4 bg-[var(--bg-1)] px-4 py-3.5 transition-colors duration-[var(--duration-micro)] hover:bg-[var(--bg-2)] ${isLast ? "" : "border-b border-[var(--border-default)]"}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick() }}
    >
      {/* Avatar */}
      {AvatarIcon ? (
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-3)] ${isDisconnected ? "opacity-40" : ""}`}>
          <AvatarIcon className="h-4 w-4 text-[var(--fg-2)]" />
        </div>
      ) : (
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${isDisconnected ? "opacity-40" : ""}`}
          style={{ backgroundColor: platform.color }}
        >
          {platform.initial}
        </div>
      )}

      {/* Name + Description */}
      <div className={`min-w-0 flex-1 ${isDisconnected ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-2">
          <span className="text-body font-semibold text-[var(--fg-0)]">{platform.name}</span>
          {isConnected && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--fg-3)]">
              <Lock className="h-2.5 w-2.5" />
              {securityLabel}
            </span>
          )}
        </div>
        <p className="text-caption text-[var(--fg-2)]">{platform.description[locale]}</p>
      </div>

      {/* Status badge */}
      <Badge variant={cfg.variant} className="gap-1.5 shrink-0">
        <StatusIcon className={`h-3 w-3 ${cfg.dotColor} ${platform.status === "verifying" ? "animate-spin" : ""}`} />
        {statusLabel}
      </Badge>

      {/* Last sync */}
      <div className="w-28 shrink-0 text-right">
        {platform.lastSync ? (
          <div>
            <p className="text-caption text-[var(--fg-3)]">{lastSyncLabel}</p>
            <p className="text-caption text-[var(--fg-2)]">{platform.lastSync[locale]}</p>
          </div>
        ) : (
          <span className="text-caption text-[var(--fg-3)]">—</span>
        )}
      </div>

      {/* CTA */}
      <button
        className={`shrink-0 rounded-[var(--radius-card)] px-3 py-1.5 text-caption font-medium transition-colors duration-[var(--duration-micro)] ${
          platform.status === "error"
            ? "bg-[var(--signal-risk-bg)] text-[var(--signal-risk)]"
            : platform.status === "disconnected"
              ? "bg-[var(--brand-tint)] text-[var(--brand)]"
              : "bg-[var(--bg-3)] text-[var(--fg-1)]"
        }`}
        onClick={(e) => { e.stopPropagation(); onClick() }}
      >
        {actionLabel}
      </button>
    </div>
  )
}

/* ── Financial Form (Tier 1 — 5 fields, range input allowed) ── */

function FinancialForm({
  locale,
  t,
  onSave,
}: {
  locale: "ko" | "en"
  t: (key: TranslationKey) => string
  onSave: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>({})

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] ring-1 ring-[var(--border-default)] bg-[var(--bg-1)]">
      {/* Security notice */}
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] bg-[var(--bg-2)] px-4 py-2.5">
        <Lock className="h-3.5 w-3.5 text-[var(--fg-3)]" />
        <span className="text-caption text-[var(--fg-2)]">
          {locale === "ko" ? "모든 재무 데이터는 AES-256으로 암호화되며, 귀사 팀만 접근 가능합니다" : "All financial data is AES-256 encrypted and accessible only by your team"}
        </span>
      </div>

      {/* Fields */}
      <div className="px-4 py-4 space-y-3">
        {financialFields.map((field) => {
          const isPayback = field.id === "targetPayback"
          return (
            <div key={field.id} className="flex items-center gap-4">
              <label className="w-32 shrink-0 text-caption font-medium text-[var(--fg-1)]">
                {t(field.key)}
              </label>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={values[field.id] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={isPayback ? "90" : t("settings.financial.placeholder")}
                  className="w-full rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-0)] px-3 py-2 text-body text-[var(--fg-0)] placeholder:text-[var(--fg-3)] focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)] transition-colors duration-[var(--duration-micro)]"
                />
                {isPayback && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-[var(--fg-3)]">
                    {t("settings.financial.targetPaybackUnit")}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Save button */}
      <div className="border-t border-[var(--border-default)] px-4 py-3 flex justify-end">
        <button
          onClick={onSave}
          className="rounded-[var(--radius-card)] bg-[var(--brand)] px-4 py-2 text-caption font-medium text-white transition-colors duration-[var(--duration-micro)] hover:opacity-90"
        >
          {t("settings.financial.save")}
        </button>
      </div>
    </div>
  )
}
