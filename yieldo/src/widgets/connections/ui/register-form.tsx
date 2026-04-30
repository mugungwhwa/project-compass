"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"

type RegisterFormProps = {
  onSuccess: (appId: string) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [devToken, setDevToken] = useState("")
  const [appId, setAppId] = useState("")
  const [appLabel, setAppLabel] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/appsflyer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dev_token: devToken,
          app_id: appId,
          app_label: appLabel,
          home_currency: "USD",
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? `등록 실패 (HTTP ${res.status})`)
        return
      }
      onSuccess(appId)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          AppsFlyer Dev Token
        </label>
        <Input
          type="password"
          value={devToken}
          onChange={(e) => setDevToken(e.target.value)}
          placeholder="eyJhbGc..."
          required
          autoComplete="off"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          App ID
        </label>
        <Input
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          placeholder="id123456789 또는 com.example.app"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          앱 이름
        </label>
        <Input
          value={appLabel}
          onChange={(e) => setAppLabel(e.target.value)}
          placeholder="예: Match League"
          required
        />
      </div>
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            검증 중...
          </>
        ) : (
          "연동 시작"
        )}
      </Button>
    </form>
  )
}
