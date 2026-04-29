"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import type { Connection } from "@/shared/api/mock-connections"
import { FinancialInputForm } from "./financial-input-form"
import { PlaceholderWizardDialog } from "./placeholder-wizard-dialog"
import { RegisterForm } from "./register-form"

type ConnectionDialogProps = {
  connection: Connection | null
  onClose: () => void
  onRegistered?: (appId: string) => void
}

export function ConnectionDialog({
  connection,
  onClose,
  onRegistered,
}: ConnectionDialogProps) {
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

            <div className="mt-4">
              {connection.id === "manual-financial" ? (
                <FinancialInputForm
                  onSaved={() => onRegistered?.("manual-financial")}
                  onClose={onClose}
                />
              ) : connection.id !== "appsflyer" ? (
                <PlaceholderWizardDialog
                  connection={connection}
                  onClose={onClose}
                />
              ) : connection.status === "disconnected" ? (
                <RegisterForm
                  onSuccess={(appId) => {
                    onRegistered?.(appId)
                    onClose()
                  }}
                />
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                    상태:{" "}
                    <span className="font-bold">{connection.status}</span>
                    {connection.lastSync && (
                      <span className="ml-2 text-muted-foreground">
                        · {connection.lastSync}
                      </span>
                    )}
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
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
