"use client"

/*
  CopilotProvider — app-shell state for the AI Copilot slide-in panel.
  ----------------------------------------------------------------------
  v0 (2026-04-08): Static UI shell. No backend, no streaming, no LLM.
  Just an open/close state machine + ⌘K keyboard handler.

  Future (Level 2+): This provider will own message history,
  streaming state, tool-use queue, and context serialization.
  See: docs/Project_yieldo_Design_Migration_Log.md §5

  Source of truth: .omc/specs/2026-04-08-dashboard-shell-refactor.md
*/

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

type CopilotContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const CopilotContext = createContext<CopilotContextValue | null>(null)

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  // ⌘K / Ctrl+K to toggle. Esc to close when open.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"
      if (isModK) {
        e.preventDefault()
        toggle()
        return
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [toggle, close, isOpen])

  return (
    <CopilotContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </CopilotContext.Provider>
  )
}

export function useCopilot(): CopilotContextValue {
  const ctx = useContext(CopilotContext)
  if (!ctx) {
    throw new Error("useCopilot() must be used inside <CopilotProvider>")
  }
  return ctx
}
