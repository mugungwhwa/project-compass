"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import type { Connection } from "@/shared/api/mock-connections"

type ConnectionDialogProps = {
  connection: Connection | null
  onClose: () => void
}

export function ConnectionDialog({ connection, onClose }: ConnectionDialogProps) {
  const open = connection !== null

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        {connection && (
          <>
            <DialogHeader>
              <DialogTitle>{connection.brand}</DialogTitle>
              <DialogDescription>{connection.description}</DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                연동 등록 폼은 PR 4에서 활성화됩니다.
              </div>

              {connection.metrics && connection.metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {connection.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-lg border border-border p-3"
                    >
                      <div
                        className="phosphor-text text-lg font-bold"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {m.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
