"use client"

import { Sparkles, RotateCcw } from "lucide-react"
import { applyDemoSeed, resetDemoSeed } from "@/shared/api/financial-input-seed"

type Props = {
  hasInput: boolean
  onChange: () => void
}

export function DemoSeedToolbar({ hasInput, onChange }: Props) {
  const handleApply = () => {
    applyDemoSeed()
    onChange()
  }

  const handleReset = () => {
    if (window.confirm("재무 입력값을 모두 지웁니다. 계속할까요?")) {
      resetDemoSeed()
      onChange()
    }
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-2">
      <div className="text-xs">
        <div className="font-bold">데모 시드</div>
        <div className="text-muted-foreground">1-clk으로 5개 재무 지표 채우기</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleApply}
          disabled={hasInput}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4" />
          적용
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasInput}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-4 w-4" />
          초기화
        </button>
      </div>
    </div>
  )
}
