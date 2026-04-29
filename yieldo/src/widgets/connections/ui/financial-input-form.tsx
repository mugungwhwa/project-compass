"use client"

import { useEffect, useId, useState } from "react"
import {
  loadFinancialInput,
  saveFinancialInput,
  type FinancialInput,
} from "@/shared/api/financial-input"

type Props = {
  onSaved: () => void
  onClose: () => void
}

type FormState = {
  monthlyRevenue: string
  uaSpend: string
  cashBalance: string
  monthlyBurn: string
  targetPaybackMonths: string
}

const EMPTY: FormState = {
  monthlyRevenue: "",
  uaSpend: "",
  cashBalance: "",
  monthlyBurn: "",
  targetPaybackMonths: "",
}

const FIELDS: Array<{
  key: keyof FormState
  label: string
  unit: "KRW" | "개월"
  placeholder: string
  isInteger?: boolean
}> = [
  { key: "monthlyRevenue", label: "월 매출", unit: "KRW", placeholder: "예: 50,000,000" },
  { key: "uaSpend", label: "UA 지출", unit: "KRW", placeholder: "예: 20,000,000" },
  { key: "cashBalance", label: "현금 잔고", unit: "KRW", placeholder: "예: 500,000,000" },
  { key: "monthlyBurn", label: "월 burn", unit: "KRW", placeholder: "예: 30,000,000" },
  { key: "targetPaybackMonths", label: "목표 payback", unit: "개월", placeholder: "예: 12", isInteger: true },
]

const formatNumber = (raw: string): string => {
  const digits = raw.replace(/[^\d-]/g, "")
  if (!digits) return ""
  const n = Number(digits)
  if (!Number.isFinite(n)) return ""
  return n.toLocaleString("ko-KR")
}

const parseNumber = (raw: string): number | null => {
  const digits = raw.replace(/[^\d-]/g, "")
  if (!digits) return null
  const n = Number(digits)
  return Number.isFinite(n) ? n : null
}

const initialFromStored = (stored: FinancialInput | null): FormState => {
  if (!stored) return EMPTY
  return {
    monthlyRevenue: stored.monthlyRevenue.toLocaleString("ko-KR"),
    uaSpend: stored.uaSpend.toLocaleString("ko-KR"),
    cashBalance: stored.cashBalance.toLocaleString("ko-KR"),
    monthlyBurn: stored.monthlyBurn.toLocaleString("ko-KR"),
    targetPaybackMonths: stored.targetPaybackMonths.toString(),
  }
}

export function FinancialInputForm({ onSaved, onClose }: Props) {
  const idPrefix = useId()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    const stored = loadFinancialInput()
    if (stored) setForm(initialFromStored(stored))
  }, [])

  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const next = key === "targetPaybackMonths" ? raw.replace(/[^\d]/g, "") : formatNumber(raw)
    setForm((prev) => ({ ...prev, [key]: next }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = {
      monthlyRevenue: parseNumber(form.monthlyRevenue),
      uaSpend: parseNumber(form.uaSpend),
      cashBalance: parseNumber(form.cashBalance),
      monthlyBurn: parseNumber(form.monthlyBurn),
      targetPaybackMonths: parseNumber(form.targetPaybackMonths),
    }

    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    for (const f of FIELDS) {
      const v = parsed[f.key]
      if (v === null) {
        nextErrors[f.key] = "값을 입력하세요"
      } else if (v < 0) {
        nextErrors[f.key] = "음수는 입력할 수 없습니다"
      } else if (f.key === "targetPaybackMonths") {
        if (!Number.isInteger(v) || v < 1 || v > 60) {
          nextErrors[f.key] = "1~60 사이 정수를 입력하세요"
        }
      } else if (v > 1e15) {
        nextErrors[f.key] = "값이 너무 큽니다"
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      saveFinancialInput({
        monthlyRevenue: parsed.monthlyRevenue!,
        uaSpend: parsed.uaSpend!,
        cashBalance: parsed.cashBalance!,
        monthlyBurn: parsed.monthlyBurn!,
        targetPaybackMonths: parsed.targetPaybackMonths!,
      })
      setSavedFlash(true)
      onSaved()
      setTimeout(() => {
        setSavedFlash(false)
        onClose()
      }, 1000)
    } catch {
      setErrors({ monthlyRevenue: "저장 실패 — 다시 시도하세요" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <header>
        <h2 className="text-lg font-bold">재무 직접 입력</h2>
        <p className="text-sm text-muted-foreground">
          Visible.vc 모델 · KRW · 5개 지표
        </p>
      </header>

      <div className="space-y-3">
        {FIELDS.map((f) => {
          const id = `${idPrefix}-${f.key}`
          const err = errors[f.key]
          return (
            <div key={f.key}>
              <label htmlFor={id} className="block text-xs font-bold mb-1">
                {f.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={id}
                  type="text"
                  inputMode="numeric"
                  value={form[f.key]}
                  onChange={handleChange(f.key)}
                  placeholder={f.placeholder}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                  aria-invalid={!!err}
                  aria-describedby={err ? `${id}-error` : undefined}
                />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {f.unit}
                </span>
              </div>
              {err && (
                <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
                  {err}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          {savedFlash ? "저장됨" : "저장"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          취소
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        localStorage 저장 — 멀티 디바이스 동기화는 Tier 2(Supabase)부터 지원됩니다.
      </p>
    </form>
  )
}
