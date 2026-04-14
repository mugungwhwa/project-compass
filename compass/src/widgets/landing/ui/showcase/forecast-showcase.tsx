// Revenue forecast cone — 3-band expanding from today to +12 months
// viewBox 0 0 900 380, chart area x:80→860 y:40→320

const W = 860
const L = 80
const T = 40
const B = 320
const H = B - T // 280

// x: month 0..12 (today at month 4 of 12 visible range: 0..12)
const TODAY_MONTH = 4
const xMonths = [0, 2, 4, 6, 8, 10, 12]

function xPos(month: number): number {
  return L + (month / 12) * (W - L)
}
function yPos(val: number): number {
  // val in $M, 0..4
  return B - (val / 4) * H
}

// Cone: before today is flat (historical), after today expands
// Base $2.1M, Upside $2.8M, Downside $1.5M at month 12
// Historical actuals: $0 → $1.4M by today (month 4)
type Point = [number, number]

const historical: Point[] = [[0, 0.2], [1, 0.5], [2, 0.8], [3, 1.1], [4, 1.4]]

const baseForward: Point[] = [[4, 1.4], [6, 1.65], [8, 1.85], [10, 2.0], [12, 2.1]]
const upForward: Point[] = [[4, 1.4], [6, 1.75], [8, 2.15], [10, 2.5], [12, 2.8]]
const downForward: Point[] = [[4, 1.4], [6, 1.5], [8, 1.52], [10, 1.5], [12, 1.5]]

function pts(arr: Point[]): string {
  return arr.map(([m, v]) => `${xPos(m).toFixed(1)},${yPos(v).toFixed(1)}`).join(" ")
}

function coneArea(upper: Point[], lower: Point[]): string {
  const top = upper.map(([m, v]) => `${xPos(m).toFixed(1)},${yPos(v).toFixed(1)}`).join(" L ")
  const bot = [...lower].reverse().map(([m, v]) => `${xPos(m).toFixed(1)},${yPos(v).toFixed(1)}`).join(" L ")
  return `M ${top} L ${bot} Z`
}

const yTicks: [number, string][] = [[0, "$0"], [1, "$1M"], [2, "$2M"], [3, "$3M"], [4, "$4M"]]

export function ForecastShowcase() {
  const todayX = xPos(TODAY_MONTH)

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--bg-1)] border border-[var(--border-default)] rounded-[var(--radius-card)] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-0)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fg-3)]">
          Revenue Forecast
        </span>
        <div className="ml-auto flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--fg-2)]">
            <span className="w-3 h-1 rounded-full bg-[var(--brand)] opacity-20 inline-block" /> Forecast cone
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--fg-2)]">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-[var(--brand)] inline-block" /> Base
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2">
        <svg viewBox="0 0 900 360" className="w-full" role="img" aria-label="Revenue forecast cone chart">
          <defs>
            <linearGradient id="cone-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {yTicks.map(([val]) => (
            <line
              key={val}
              x1={L}
              y1={yPos(val)}
              x2={W}
              y2={yPos(val)}
              stroke="var(--chart-grid)"
              strokeWidth="1"
            />
          ))}

          {/* Y labels */}
          {yTicks.map(([val, label]) => (
            <text
              key={label}
              x={L - 8}
              y={yPos(val)}
              textAnchor="end"
              dominantBaseline="middle"
              style={{ fontSize: 10, fill: "var(--fg-3)", fontFamily: "monospace" }}
            >
              {label}
            </text>
          ))}

          {/* X labels */}
          {xMonths.filter((m) => m % 2 === 0).map((m) => (
            <text
              key={m}
              x={xPos(m)}
              y={B + 18}
              textAnchor="middle"
              style={{ fontSize: 10, fill: "var(--fg-3)", fontFamily: "monospace" }}
            >
              {m === TODAY_MONTH ? "Today" : `M+${m - TODAY_MONTH}`}
            </text>
          ))}

          {/* Cone area */}
          <path d={coneArea(upForward, downForward)} fill="url(#cone-grad)" />

          {/* Cone edges */}
          <polyline points={pts(upForward)} fill="none" stroke="var(--brand)" strokeWidth="1" strokeOpacity="0.4" strokeLinejoin="round" />
          <polyline points={pts(downForward)} fill="none" stroke="var(--brand)" strokeWidth="1" strokeOpacity="0.4" strokeLinejoin="round" />

          {/* Base dashed */}
          <polyline
            points={pts(baseForward)}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinejoin="round"
          />

          {/* Historical solid line */}
          <polyline
            points={pts(historical)}
            fill="none"
            stroke="var(--fg-0)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Today vertical */}
          <line
            x1={todayX}
            y1={T}
            x2={todayX}
            y2={B}
            stroke="var(--fg-2)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Endpoint labels */}
          <text x={xPos(12) + 6} y={yPos(2.8)} dominantBaseline="middle"
            style={{ fontSize: 10, fill: "var(--brand)", fontFamily: "monospace", fontWeight: 700 }}>
            $2.8M
          </text>
          <text x={xPos(12) + 6} y={yPos(2.1)} dominantBaseline="middle"
            style={{ fontSize: 10, fill: "var(--fg-1)", fontFamily: "monospace" }}>
            $2.1M
          </text>
          <text x={xPos(12) + 6} y={yPos(1.5)} dominantBaseline="middle"
            style={{ fontSize: 10, fill: "var(--fg-3)", fontFamily: "monospace" }}>
            $1.5M
          </text>
        </svg>
      </div>

      {/* Caption */}
      <p className="text-[11px] font-mono text-[var(--fg-3)] text-center pb-4 tracking-wide">
        Base $2.1M · Upside $2.8M · Downside $1.5M
      </p>
    </div>
  )
}
