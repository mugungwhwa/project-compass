"use client"

import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import type { Connection } from "@/shared/api/mock-connections"

type Props = {
  connection: Connection
  onClose: () => void
}

const GUIDE_BY_ID: Record<string, string> = {
  // MMP
  adjust:
    "Adjust Dashboard → Settings → Report Service API에서 token 발급 후 입력합니다.",
  singular:
    "Singular → Account → API Keys에서 Reporting API key를 발급합니다.",
  // Experimentation
  statsig:
    "Statsig Console → Project Settings → API Keys에서 Server Secret Key를 발급해 입력합니다.",
  firebase:
    "Firebase Console → Project Settings → Service Accounts에서 BigQuery export key 발급합니다.",
  optimizely:
    "Optimizely Dashboard → Settings → API Tokens에서 Personal Access Token을 발급합니다.",
  // Financial
  "manual-financial":
    "월 매출, UA 지출, 현금 잔고, 월 burn, 목표 payback 5개 지표를 직접 입력합니다.",
  quickbooks:
    "QuickBooks → Apps → Developer Portal에서 OAuth client credentials 발급 후 인증합니다.",
  xero:
    "Xero → My Xero → Connected Apps → Add a custom integration에서 OAuth 인증을 진행합니다.",
  // Market
  gameanalytics:
    "GameAnalytics Studio → Settings → API Keys에서 Game Key + Secret Key를 발급합니다.",
  sensortower:
    "Sensor Tower → Settings → API에서 Bearer Token을 발급합니다 (Enterprise plan 필요).",
  appmagic:
    "AppMagic → Settings → API에서 token을 발급합니다 (Pro/Business plan 필요).",
}

const STEP_LABELS = ["인증 정보", "검증", "연결 완료"]

export function PlaceholderWizardDialog({ connection, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    if (step !== 2) return
    const t = setTimeout(() => setStep(3), 1500)
    return () => clearTimeout(t)
  }, [step])

  const guide = GUIDE_BY_ID[connection.id] ?? "추후 연동 가이드가 제공됩니다."

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-lg font-bold">{connection.brand}</h2>
        <p className="text-sm text-muted-foreground">{connection.description}</p>
      </header>

      <div
        role="list"
        aria-label="연동 진행 단계"
        className="flex items-center gap-2"
      >
        {STEP_LABELS.map((label, idx) => {
          const n = (idx + 1) as 1 | 2 | 3
          const active = n === step
          const done = n < step
          return (
            <div
              key={label}
              role="listitem"
              className={`flex flex-1 items-center gap-2 rounded-lg border px-2 py-1.5 text-xs ${
                active
                  ? "border-ring bg-ring/10 font-bold"
                  : done
                    ? "border-border text-muted-foreground"
                    : "border-dashed border-border text-muted-foreground"
              }`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current">
                {n}
              </span>
              <span>{label}</span>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm">{guide}</p>
            <input
              type="text"
              readOnly
              value="••••••••••••••••"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-muted-foreground"
              aria-label="자격 증명 placeholder"
            />
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              다음
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">검증 중...</p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold">연결되었습니다 (시연용)</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-1.5 text-sm hover:bg-muted"
            >
              닫기
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        시연용 placeholder — 실제 등록 흐름은 추후 릴리즈에서 활성화됩니다.
      </p>
    </div>
  )
}
