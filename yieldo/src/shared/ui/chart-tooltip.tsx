"use client"

import type { ReactNode } from "react"

export type TooltipPayloadItem = {
  name?: string
  value?: string | number
  color?: string
  dataKey?: string
  payload?: Record<string, unknown>
}

export type ChartTooltipProps = {
  /** Recharts passes this automatically */
  active?: boolean
  /** Recharts passes this automatically */
  payload?: TooltipPayloadItem[]
  /** Recharts passes this automatically */
  label?: string | number
  /**
   * Render prop for custom tooltip content.
   * When using Recharts `content` prop, the `formatter` prop on `<Tooltip>` is IGNORED.
   * All formatting must be done inside the render function.
   */
  render?: (props: { active: boolean; payload: TooltipPayloadItem[]; label?: string | number }) => ReactNode
  className?: string
}

/** Colored dot indicator for tooltip rows — matches legend/graph colors */
export function TooltipDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color,
        marginRight: 6,
        flexShrink: 0,
      }}
    />
  )
}

/**
 * ChartTooltip — unified visual shell for all Recharts chart tooltips.
 *
 * Usage with render prop (recommended for custom formatting):
 *   <Tooltip content={<ChartTooltip render={({ payload }) => <div>...</div>} />} />
 *
 * Usage with default rendering (displays name: value with color dots):
 *   <Tooltip content={<ChartTooltip />} />
 *
 * IMPORTANT: When using `content={<ChartTooltip>}`, the Recharts `formatter`
 * prop is IGNORED. Move all formatting logic into the render prop.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  render,
  className = "",
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  if (render) {
    return (
      <div className={`yieldo-tooltip ${className}`}>
        {render({ active: !!active, payload, label })}
      </div>
    )
  }

  // Default rendering: label + rows with color dots
  return (
    <div className={`yieldo-tooltip ${className}`}>
      {label != null && <div className="yieldo-tooltip-label">{label}</div>}
      {payload.map((item, i) => (
        <div key={i} className="yieldo-tooltip-row">
          {item.color && <TooltipDot color={item.color} />}
          <span className="yieldo-tooltip-name">{item.name}</span>
          <span className="yieldo-tooltip-value">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
