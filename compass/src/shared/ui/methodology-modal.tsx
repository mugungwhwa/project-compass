"use client"

import { type ReactNode } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/shared/lib/utils"

type MethodologyModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  footer?: ReactNode
  children: ReactNode
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

const transition = { duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

export function MethodologyModal({ open, onOpenChange, title, subtitle, footer, children }: MethodologyModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal>
            <Dialog.Backdrop
              render={
                <motion.div
                  className="fixed inset-0 z-50 bg-black/50"
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={transition}
                />
              }
            />
            <Dialog.Popup
              render={
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={transition}
                >
                  <motion.div
                    className={cn(
                      "relative w-full max-w-4xl",
                      "rounded-[var(--radius-card)] border border-[var(--border-default)]",
                      "bg-[var(--bg-1)] shadow-[0_16px_64px_rgba(0,0,0,0.12)]",
                    )}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={transition}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] px-6 py-4">
                      <div>
                        <Dialog.Title className="text-h2 text-[var(--fg-0)]">
                          {title}
                        </Dialog.Title>
                        {subtitle && (
                          <Dialog.Description className="text-caption text-[var(--fg-2)] mt-1">
                            {subtitle}
                          </Dialog.Description>
                        )}
                      </div>
                      <Dialog.Close
                        className={cn(
                          "rounded-[var(--radius-inline)] p-1.5 text-[var(--fg-3)]",
                          "hover:bg-[var(--bg-3)] hover:text-[var(--fg-1)] transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]",
                        )}
                      >
                        <X className="h-4 w-4" />
                      </Dialog.Close>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">
                      {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                      <div className="border-t border-[var(--border-default)] px-6 py-4">
                        {footer}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              }
            />
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
