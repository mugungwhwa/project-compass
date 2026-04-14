// Retention fan chart — P10 / P50 / P90 bands, asymptotic floor, genre benchmark
// viewBox 0 0 900 380, chart area x:80→860 y:40→320

const W = 860
const L = 80
const T = 40
const B = 320
const H = B - T // 280

// x: day 0..60, y: 0..30% retention
const xDays = [0, 7, 14, 30, 60]
function xPos(day: number): number {
  return L + (day / 60) * (W - L)
}
function yPos(pct: number): number {
  // pct 0..30, top=30, bottom=0
  return B - (pct / 30) * H
}

// P50 median curve
const p50: [number, number][] = [[0, 26], [7, 9.8], [14, 6.8], [30, 5.4], [60, 4.2]]
// P90 (lower band — worse performers)
const p90: [number, number][] = [[0, 18], [7, 6.2], [14, 4.1], [30, 3.0], [60, 2.4]]
// P10 (upper band — better performers)
const p10: [number, number][] = [[0, 32], [7, 14.0], [14, 10.2], [30, 8.1], [60, 6.8]]
// Observed (our game) — bold line, slightly above P50
const observed: [number, number][] = [[0, 28], [7, 11.2], [14, 8.1], [30, 6.4], [60, 5.8]]
// Genre benchmark dashed
const benchmark: [number, number][] = [[0, 22], [7, 8.0], [14, 5.6], [30, 4.4], [60, 3.6]]

// Asymptotic floor ~4%
const FLOOR_PCT = 4

function pts(arr: [number, number][]): string {
  return arr.map(([d, p]) => `${xPos(d).toFixed(1)},${yPos(p).toFixed(1)}`).join(" ")
}

function bandPath(upper: [number, number][], lower: [number, number][]): string {
  const top = upper.map(([d, p]) => `${xPos(d).toFixed(1)},${yPos(p).toFixed(1)}`).join(" L ")
  const bot = [...lower].reverse().map(([d, p]) => `${xPos(d).toFixed(1)},${yPos(p).toFixed(1)}`).join(" L ")
  return `M ${top} L ${bot} Z`
}

const yTicks = [0, 5, 10, 15, 20, 25, 30]

export function RetentionShowcase() {
  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--bg-1)] border border-[var(--border-default)] rounded-[var(--radius-card)] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-0)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fg-3)]">
          Retention Forecast
        </span>
        <div className="ml-auto flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--fg-2)]">
            <span className="w-3 h-1 rounded-full bg-[var(--chart-band-inner)] inline-block border border-[var(--brand)]" /> P10–P90
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--fg-2)]">
            <span className="w-3 h-0.5 bg-[var(--brand)] inline-block" /> P50
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--fg-2)]">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-[var(--chart-benchmark)] inline-block" /> Genre avg
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2">
        <svg viewBox="0 0 900 360" className="w-full" role="img" aria-label="Retention fan chart with P10 P50 P90 bands">
          <defs>
            <linearGradient id="band-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {yTicks.map((pct) => (
            <line
              key={pct}
              x1={L}
              y1={yPos(pct)}
              x2={W}
              y2={yPos(pct)}
              stroke="var(--chart-grid)"
              strokeWidth="1"
            />
          ))}

          {/* Y labels */}
          {[0, 10, 20, 30].map((pct) => (
            <text
              key={pct}
              x={L - 8}
              y={yPos(pct)}
              textAnchor="end"
              dominantBaseline="middle"
              style={{ fontSize: 10, fill: "var(--fg-3)", fontFamily: "monospace" }}
            >
              {pct}%
            </text>
          ))}

          {/* X labels */}
          {xDays.map((day) => (
            <text
              key={day}
              x={xPos(day)}
              y={B + 18}
              textAnchor="middle"
              style={{ fontSize: 10, fill: "var(--fg-3)", fontFamily: "monospace" }}
            >
              {`D${day}`}
            </text>
          ))}

          {/* Band fill */}
          <path d={bandPath(p10, p90)} fill="url(#band-grad)" />

          {/* P10 & P90 outlines */}
          <polyline points={pts(p10)} fill="none" stroke="var(--brand)" strokeWidth="1" strokeOpacity="0.3" strokeLinejoin="round" />
          <polyline points={pts(p90)} fill="none" stroke="var(--brand)" strokeWidth="1" strokeOpacity="0.3" strokeLinejoin="round" />

          {/* Genre benchmark dashed */}
          <polyline
            points={pts(benchmark)}
            fill="none"
            stroke="var(--chart-benchmark)"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            strokeLinejoin="round"
          />

          {/* Asymptotic floor */}
          <line
            x1={L}
            y1={yPos(FLOOR_PCT)}
            x2={W}
            y2={yPos(FLOOR_PCT)}
            stroke="var(--signal-positive)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <text
            x={W + 4}
            y={yPos(FLOOR_PCT)}
            dominantBaseline="middle"
            style={{ fontSize: 9, fill: "var(--signal-positive)", fontFamily: "monospace" }}
          >
            floor
          </text>

          {/* P50 bold line */}
          <polyline points={pts(p50)} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" />

          {/* Observed (our game) */}
          <polyline points={pts(observed)} fill="none" stroke="var(--fg-0)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* Observed dots */}
          {observed.map(([d, p]) => (
            <circle key={d} cx={xPos(d)} cy={yPos(p)} r="3.5" fill="var(--fg-0)" />
          ))}

          {/* D60 annotation */}
          <text
            x={xPos(60) - 6}
            y={yPos(observed[observed.length - 1][1]) - 10}
            textAnchor="end"
            style={{ fontSize: 9, fill: "var(--fg-0)", fontFamily: "monospace", fontWeight: 700 }}
          >
            5.8%
          </text>
        </svg>
      </div>

      {/* Caption */}
      <p className="text-[11px] font-mono text-[var(--fg-3)] text-center pb-4 tracking-wide">
        D7 5.8% · Genre P50 4.2% · Top 25%
      </p>
    </div>
  )
}
