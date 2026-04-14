"use client"

import * as Tooltip from "@radix-ui/react-tooltip"
import { Info } from "lucide-react"

export type InfoHintProps = {
  /** Body text shown on hover/focus */
  content: string
  /** Optional aria-label override; defaults to the content itself */
  ariaLabel?: string
  /** Icon size in px (default 14) */
  size?: number
  /** Side of the trigger to display the tooltip */
  side?: "top" | "right" | "bottom" | "left"
}

/**
 * InfoHint — a lightweight info-icon tooltip used in chart headers and labels.
 *
 * Renders a subtle ⓘ glyph that reveals explanatory content on hover / focus.
 * Keeps static methodology text out of the main reading flow so only dynamic
 * insight copy stays inline.
 */
export function InfoHint({ content, ariaLabel, size = 14, side = "top" }: InfoHintProps) {
  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-label={ariaLabel ?? content}
            className="inline-flex items-center justify-center text-[var(--fg-3)] hover:text-[var(--fg-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-3)] rounded-full transition-colors"
            style={{ width: size + 4, height: size + 4 }}
          >
            <Info size={size} strokeWidth={1.75} aria-hidden />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            sideOffset={6}
            collisionPadding={12}
            className="z-50 max-w-xs rounded-md border border-[var(--border)] bg-[var(--bg-0)] px-3 py-2 text-[12px] leading-relaxed text-[var(--fg-1)] shadow-lg"
            style={{ animationDuration: "160ms" }}
          >
            {content}
            <Tooltip.Arrow className="fill-[var(--bg-0)]" width={10} height={5} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
