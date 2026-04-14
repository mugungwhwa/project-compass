import type { ReactNode } from "react"

type SignalShowcaseProps = {
  size?: "hero" | "proof"
}

export function SignalShowcase({ size = "hero" }: SignalShowcaseProps) {
  const compact = size === "proof"

  return (
    <div
      className={`w-full bg-[var(--bg-1)] border border-[var(--border-default)] rounded-[var(--radius-card)] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] overflow-hidden ${compact ? "max-w-3xl" : "max-w-5xl"} mx-auto`}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-0)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-3)]">
          Investment Signal
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--signal-positive)] animate-pulse" />
          <span className="font-mono text-[10px] text-[var(--signal-positive)] uppercase tracking-wide">Live</span>
        </span>
      </div>

      {/* Main content */}
      <div className={`px-8 ${compact ? "py-8" : "py-12"}`}>
        {/* Verdict */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
          <div>
            <p className={`font-display font-bold leading-none tracking-[-0.04em] text-[var(--signal-positive)] ${compact ? "text-[56px]" : "text-[80px] md:text-[96px]"}`}>
              Invest More
            </p>
            <p className={`font-mono text-[var(--fg-1)] mt-2 ${compact ? "text-2xl" : "text-3xl"}`}>
              D47 Payback
            </p>
          </div>

          {/* Confidence */}
          <div className="sm:ml-auto flex-shrink-0 min-w-[200px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs text-[var(--fg-3)] uppercase tracking-wide">Confidence</span>
              <span className="font-mono text-sm font-bold text-[var(--fg-0)]">82%</span>
            </div>
            <div className="h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--signal-positive)] rounded-full"
                style={{ width: "82%" }}
              />
            </div>
          </div>
        </div>

        {/* Metric chips */}
        <div className={`flex flex-wrap gap-3 ${compact ? "mt-6" : "mt-8"}`}>
          {[
            { label: "ROAS", value: "1.14×" },
            { label: "D7 Retention", value: "5.8%" },
            { label: "LTV", value: "$12.40" },
          ].map((chip) => (
            <div
              key={chip.label}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[var(--radius-card)]"
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--fg-3)]">
                {chip.label}
              </span>
              <span className="text-sm font-mono font-semibold text-[var(--fg-0)]">
                {chip.value}
              </span>
            </div>
          ))}
        </div>

        {/* Next action strip */}
        <div className={`${compact ? "mt-6" : "mt-8"} inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-tint)] border border-[var(--border-subtle)] rounded-full`}>
          <span className="text-xs font-mono text-[var(--fg-2)] uppercase tracking-wide">Next action</span>
          <span className="text-xs font-mono font-semibold text-[var(--brand)]">
            Scale Reward Calendar experiment to 50%
          </span>
        </div>
      </div>
    </div>
  )
}
