// Revenue vs UA Spend area chart — pure SVG, no external dependencies
// viewBox: 0 0 900 420, chart area: x:80→860, y:40→340 (300px tall, 780px wide)

const W = 860
const L = 80
const T = 40
const B = 340
const H = B - T // 300

const xDays = [0, 15, 30, 45, 60]
const yLabels = ["$0", "$500K", "$1M", "$1.5M"]

// Normalize helpers
function xPos(day: number): number {
  return L + (day / 60) * (W - L)
}
function yPos(val: number): number {
  // val 0..1.5M, chart top=T (1.5M) bottom=B (0)
  return B - (val / 1_500_000) * H
}

// Revenue line: accelerating curve
const revenuePoints: [number, number][] = [
  [0, 0],
  [15, 120_000],
  [30, 420_000],
  [45, 900_000],
  [60, 1_380_000],
]

// UA spend line: flatter
const uaPoints: [number, number][] = [
  [0, 0],
  [15, 180_000],
  [30, 340_000],
  [45, 480_000],
  [60, 580_000],
]

function polyline(pts: [number, number][]): string {
  return pts.map(([d, v]) => `${xPos(d).toFixed(1)},${yPos(v).toFixed(1)}`).join(" ")
}

function areaPath(pts: [number, number][]): string {
  const line = pts.map(([d, v]) => `${xPos(d).toFixed(1)},${yPos(v).toFixed(1)}`).join(" L ")
  const lastX = xPos(pts[pts.length - 1][0])
  const firstX = xPos(pts[0][0])
  return `M ${line} L ${lastX.toFixed(1)},${B} L ${firstX.toFixed(1)},${B} Z`
}

// BEP: revenue crosses UA spend between day 30 and 45
// interpolate: at day 47 (approx)
const BEP_DAY = 47
const BEP_X = xPos(BEP_DAY)

export function RevenueShowcase() {
  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--bg-1)] border border-[var(--border-default)] rounded-[var(--radius-card)] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-0)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fg-3)]">
          Revenue vs UA Spend
        </span>
        <div className="ml-auto flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--fg-2)]">
            <span className="w-3 h-0.5 bg-[var(--brand)] inline-block" /> Revenue
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--fg-2)]">
            <span className="w-3 h-0.5 bg-[var(--signal-caution)] inline-block" /> UA Spend
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2">
        <svg viewBox="0 0 900 380" className="w-full" role="img" aria-label="Revenue vs UA spend chart">
          <defs>
            <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="ua-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--signal-caution)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="var(--signal-caution)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yLabels.map((_, i) => {
            const val = i * 500_000
            const y = yPos(val)
            return (
              <line
                key={i}
                x1={L}
                y1={y}
                x2={W}
                y2={y}
                stroke="var(--chart-grid)"
                strokeWidth="1"
              />
            )
          })}

          {/* Y-axis labels */}
          {yLabels.map((label, i) => {
            const val = i * 500_000
            const y = yPos(val)
            return (
              <text
                key={label}
                x={L - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                style={{ fontSize: 10, fill: "var(--fg-3)", fontFamily: "monospace" }}
              >
                {label}
              </text>
            )
          })}

          {/* X-axis labels */}
          {xDays.map((day) => (
            <text
              key={day}
              x={xPos(day)}
              y={B + 18}
              textAnchor="middle"
              style={{ fontSize: 10, fill: "var(--fg-3)", fontFamily: "monospace" }}
            >
              {`Day ${day}`}
            </text>
          ))}

          {/* Area fills */}
          <path d={areaPath(revenuePoints)} fill="url(#rev-grad)" />
          <path d={areaPath(uaPoints)} fill="url(#ua-grad)" />

          {/* Lines */}
          <polyline
            points={polyline(revenuePoints)}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polyline
            points={polyline(uaPoints)}
            fill="none"
            stroke="var(--signal-caution)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="none"
          />

          {/* BEP vertical line */}
          <line
            x1={BEP_X}
            y1={T}
            x2={BEP_X}
            y2={B}
            stroke="var(--signal-positive)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* BEP label */}
          <rect
            x={BEP_X - 22}
            y={T - 20}
            width={44}
            height={16}
            rx="2"
            fill="var(--signal-positive-bg)"
          />
          <text
            x={BEP_X}
            y={T - 9}
            textAnchor="middle"
            style={{ fontSize: 9, fill: "var(--signal-positive)", fontFamily: "monospace", fontWeight: 600 }}
          >
            BEP D47
          </text>
        </svg>
      </div>

      {/* Caption */}
      <p className="text-[11px] font-mono text-[var(--fg-3)] text-center pb-4 tracking-wide">
        Revenue CAGR +34% · ROAS(D30) 1.14×
      </p>
    </div>
  )
}
