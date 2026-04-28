const STAGES = [
  {
    label: "Experiment Result",
    value: "Reward Calendar A/B",
    sub: "+3.7pp D7",
  },
  {
    label: "ΔLTV",
    value: "+$1.42",
    sub: "per user",
  },
  {
    label: "ΔPAYBACK",
    value: "D47 → D41",
    sub: "−6 days",
  },
  {
    label: "Recommendation",
    value: "Scale to 50%",
    sub: "82% confidence",
  },
] as const

export function PipelineShowcase() {
  return (
    <div className="w-full max-w-5xl mx-auto bg-[var(--bg-1)] border border-[var(--border-default)] rounded-[var(--radius-card)] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-0)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fg-3)]">
          Experiment → Investment Translation
        </span>
      </div>

      {/* Pipeline */}
      <div className="px-6 py-10">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-0">
          {STAGES.map((stage, i) => (
            <div key={stage.label} className="flex flex-col md:flex-row items-center flex-1">
              {/* Stage card */}
              <div
                className={`w-full md:flex-1 px-5 py-5 border rounded-[var(--radius-card)] flex flex-col gap-1 ${
                  i === STAGES.length - 1
                    ? "border-[var(--signal-positive)] bg-[var(--signal-positive-bg)]"
                    : "border-[var(--border-default)] bg-[var(--bg-0)]"
                }`}
              >
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.1em] ${
                    i === STAGES.length - 1 ? "text-[var(--signal-positive)]" : "text-[var(--fg-3)]"
                  }`}
                >
                  {stage.label}
                </span>
                <span
                  className={`font-mono text-lg font-bold leading-tight ${
                    i === STAGES.length - 1 ? "text-[var(--signal-positive)]" : "text-[var(--fg-0)]"
                  }`}
                >
                  {stage.value}
                </span>
                <span className="font-mono text-[11px] text-[var(--fg-3)]">
                  {stage.sub}
                </span>
              </div>

              {/* Arrow between stages */}
              {i < STAGES.length - 1 && (
                <>
                  {/* Desktop arrow */}
                  <div className="hidden md:flex items-center px-1.5 flex-shrink-0" aria-hidden="true">
                    <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                      <path
                        d="M0 8 H18 M14 3 L20 8 L14 13"
                        stroke="var(--brand)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {/* Mobile arrow */}
                  <div className="flex md:hidden justify-center py-1" aria-hidden="true">
                    <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                      <path
                        d="M8 0 V18 M3 14 L8 20 L13 14"
                        stroke="var(--brand)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
