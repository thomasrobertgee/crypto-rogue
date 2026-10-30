import type { Candle } from '../../engine/combat'
import { ArrowDown } from 'lucide-react'

export interface OrderbookChartProps {
  candles: Candle[]
  currentCandle?: Candle
  spotlightMode?: 'none' | 'green' | 'red'
  className?: string
  width?: number | string
  height?: number | string
  showGrid?: boolean
}

export function OrderbookChart({
  candles,
  currentCandle,
  spotlightMode = 'none',
  className = '',
  width = '100%',
  height = '100%',
  showGrid = true,
}: OrderbookChartProps) {
  const effectiveCurCandle =
    currentCandle ??
    (candles.length > 0 ? candles[candles.length - 1] : { o: 1000, h: 1050, l: 950, c: 1020 })
  const all = [...candles.slice(-14), effectiveCurCandle]

  // Calculate high/low bounding range
  let dataMin = Infinity
  let dataMax = -Infinity
  for (const c of all) {
    const l = c.l ?? Math.min(c.o, c.c)
    const h = c.h ?? Math.max(c.o, c.c)
    if (l < dataMin) dataMin = l
    if (h > dataMax) dataMax = h
  }
  if (!Number.isFinite(dataMin)) dataMin = 960
  if (!Number.isFinite(dataMax)) dataMax = 1040
  const span = Math.max(10, dataMax - dataMin)
  const padSpan = span * 0.22
  const yMin = dataMin - padSpan
  const yMax = dataMax + padSpan
  const totalYRange = yMax - yMin

  // SVG ViewBox dimensions
  const svgW = 400
  const svgH = 160
  const padX = 24
  const chartW = svgW - padX * 2
  const maxSlots = Math.max(1, all.length)
  const slotW = chartW / maxSlots
  const candleBodyW = Math.max(10, slotW * 0.58)

  const toY = (val: number) => {
    const frac = (val - yMin) / totalYRange
    return svgH - frac * svgH
  }

  const isGreenSpotlight = spotlightMode === 'green'
  const isRedSpotlight = spotlightMode === 'red'
  const isSpotlightActive = isGreenSpotlight || isRedSpotlight

  const renderCandle = (c: Candle, idx: number, isHighlighted: boolean, isDimmed: boolean) => {
    const isGreen = (c.c ?? c.o) >= c.o
    const cx = padX + idx * slotW + slotW * 0.5
    const oY = toY(c.o)
    const cY = toY(c.c ?? c.o)
    const highY = toY(c.h ?? Math.max(c.o, c.c ?? c.o))
    const lowY = toY(c.l ?? Math.min(c.o, c.c ?? c.o))

    const topY = Math.min(oY, cY)
    const botY = Math.max(oY, cY)
    const bodyH = Math.max(3, botY - topY)

    const strokeCol = isGreen ? '#22c55e' : '#ef4444'
    const fillCol = isGreen ? '#16a34a' : '#dc2626'
    const midY = topY + bodyH / 2

    return (
      <g
        key={idx}
        opacity={isDimmed ? 0.2 : 1}
        style={{
          filter: isHighlighted
            ? isGreen
              ? 'drop-shadow(0 0 10px #22c55e)'
              : 'drop-shadow(0 0 10px #ef4444)'
            : undefined,
          transformOrigin: `${cx}px ${midY}px`,
          animation: isHighlighted ? 'candlePop 1.25s ease-in-out infinite' : undefined,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Wick */}
        <line
          x1={cx}
          y1={highY}
          x2={cx}
          y2={lowY}
          stroke={strokeCol}
          strokeWidth={isHighlighted ? 2.8 : 1.5}
          strokeLinecap="round"
        />

        {/* Candle Body */}
        <rect
          x={cx - candleBodyW / 2}
          y={topY}
          width={candleBodyW}
          height={bodyH}
          rx="2"
          fill={fillCol}
          stroke={strokeCol}
          strokeWidth={isHighlighted ? 2.2 : 1}
        />
      </g>
    )
  }

  return (
    <div className={`relative h-full w-full select-none ${className}`}>
      <style>{`
        @keyframes candlePop {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.16);
          }
        }
      `}</style>

      {/* SVG Candlestick Chart */}
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="h-full w-full"
        style={{ width, height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartBgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B132B" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1C2541" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width={svgW} height={svgH} fill="url(#chartBgGrad)" />

        {/* Grid lines */}
        {showGrid && (
          <g opacity={isSpotlightActive ? 0.12 : 0.25} stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 3">
            <line x1="0" y1={svgH * 0.25} x2={svgW} y2={svgH * 0.25} />
            <line x1="0" y1={svgH * 0.5} x2={svgW} y2={svgH * 0.5} />
            <line x1="0" y1={svgH * 0.75} x2={svgW} y2={svgH * 0.75} />
            <line x1={svgW * 0.25} y1="0" x2={svgW * 0.25} y2={svgH} />
            <line x1={svgW * 0.5} y1="0" x2={svgW * 0.5} y2={svgH} />
            <line x1={svgW * 0.75} y1="0" x2={svgW * 0.75} y2={svgH} />
          </g>
        )}

        {/* Layer 1: Normal or Dimmed Candles */}
        {all.map((c, idx) => {
          const isGreen = (c.c ?? c.o) >= c.o
          const isHighlighted = (isGreenSpotlight && isGreen) || (isRedSpotlight && !isGreen)
          if (isHighlighted) return null // Rendered on top of mask
          return renderCandle(c, idx, false, isSpotlightActive)
        })}

        {/* Layer 2: Dark semi-transparent canvas mask when spotlight active */}
        {isSpotlightActive && (
          <rect width={svgW} height={svgH} fill="#000000" fillOpacity={0.62} />
        )}

        {/* Layer 3: Highlighted Candles popping on top */}
        {all.map((c, idx) => {
          const isGreen = (c.c ?? c.o) >= c.o
          const isHighlighted = (isGreenSpotlight && isGreen) || (isRedSpotlight && !isGreen)
          if (!isHighlighted) return null
          return renderCandle(c, idx, true, false)
        })}
      </svg>

      {/* ── Step 3: Floating Green Candle Callout Badge (Anchored Above) ── */}
      {isGreenSpotlight && (
        <div
          className="pointer-events-none absolute inset-x-2 z-30 flex flex-col items-center animate-bounce"
          style={{ top: '6px' }}
        >
          <div className="flex items-center gap-1.5 max-w-[94%] text-center rounded-full border-2 border-emerald-400 bg-[#062419]/95 px-3 py-1 font-display text-[10.5px] font-black tracking-wide text-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.7)] drop-shadow-md">
            <span>▲ GREEN CANDLE: Deals profit damage to the enemy!</span>
          </div>
          <ArrowDown className="h-4 w-4 text-emerald-400 stroke-[3] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </div>
      )}

      {/* ── Step 4: Floating Red Candle Callout Badge (Anchored Above) ── */}
      {isRedSpotlight && (
        <div
          className="pointer-events-none absolute inset-x-2 z-30 flex flex-col items-center animate-bounce"
          style={{ top: '6px' }}
        >
          <div className="flex items-center gap-1.5 max-w-[94%] text-center rounded-full border-2 border-rose-500 bg-[#29080c]/95 px-3 py-1 font-display text-[10.5px] font-black tracking-wide text-rose-200 shadow-[0_0_20px_rgba(239,68,68,0.7)] drop-shadow-md">
            <span>▼ RED CANDLE: Enemy strikes back! Protect your Margin HP!</span>
          </div>
          <ArrowDown className="h-4 w-4 text-rose-400 stroke-[3] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </div>
      )}
    </div>
  )
}
