const EVIDENCE = [
  { label: "CPI", value: "+12%", color: "var(--signal-caution)" },
  { label: "D7 retention", value: "−0.8pp", color: "var(--signal-risk)" },
  { label: "ARPDAU", value: "+3%", color: "var(--signal-positive)" },
  { label: "UA spend scaled", value: "+20%", color: "var(--signal-caution)" },
  { label: "Gross margin", value: "Stable", color: "var(--fg-2)" },
]

export function PaybackShowcase() {
  // Semicircle arc via SVG viewBox 0 0 200 110
  // Arc from 180° to 0° (left to right), radius 80, cx=100 cy=100
  const cx = 100
  const cy = 100
  const r = 80

  // Full arc path: from (20,100) to (180,100) going through (100,20)
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`

  // Filled portion: 82% of the semicircle (≈ 82% of 180°)
  const fillAngleDeg = 0.82 * 180 // 147.6°
  const fillAngleRad = ((180 - fillAngleDeg) * Math.PI) / 180
  const fillX = cx + r * Math.cos(fillAngleRad)
  const fillY = cy - r * Math.sin(fillAngleRad)
  const fillPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${fillX.toFixed(2)} ${fillY.toFixed(2)}`

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--bg-1)] border border-[var(--border-default)] rounded-[var(--radius-card)] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-0">
        {/* Left: gauge */}
        <div className="flex flex-col items-center justify-center px-8 py-12 border-b md:border-b-0 md:border-r border-[var(--border-subtle)]">
          <div className="relative w-full max-w-[220px]">
            <svg viewBox="0 0 200 110" className="w-full overflow-visible">
              {/* Background arc */}
              <path
                d={arcPath}
                fill="none"
                stroke="var(--bg-3)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Filled arc */}
              <path
                d={fillPath}
                fill="none"
                stroke="var(--signal-positive)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Center label */}
              <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                dominantBaseline="auto"
                className="font-mono font-bold"
                style={{ fontSize: 28, fill: "var(--fg-0)", fontFamily: "monospace" }}
              >
                D47
              </text>
              <text
                x={cx}
                y={cy + 12}
                textAnchor="middle"
                dominantBaseline="auto"
                style={{ fontSize: 10, fill: "var(--fg-3)", fontFamily: "monospace", letterSpacing: "0.06em" }}
              >
                PAYBACK
              </text>
            </svg>
          </div>
          <p className="text-sm text-[var(--fg-2)] font-mono mt-2 tracking-wide uppercase text-center">
            Payback window
          </p>
        </div>

        {/* Right: evidence bullets */}
        <div className="flex flex-col justify-center px-8 py-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--fg-3)] mb-5">
            Signal evidence
          </p>
          <div className="space-y-3">
            {EVIDENCE.map((e) => (
              <div
                key={e.label}
                className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0"
              >
                <span className="text-sm text-[var(--fg-1)]">{e.label}</span>
                <span
                  className="text-sm font-mono font-semibold"
                  style={{ color: e.color }}
                >
                  {e.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
