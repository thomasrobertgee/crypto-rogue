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

  // Dynamically track highest and lowest price across candles with 28% visual headroom
  let highestPrice = -Infinity
  let lowestPrice = Infinity
  for (const c of all) {
    const o = (c as any).open ?? c.o ?? 1000
    const cl = (c as any).close ?? c.c ?? o
    const h = (c as any).high ?? c.h ?? Math.max(o, cl)
    const l = (c as any).low ?? c.l ?? Math.min(o, cl)
    const maxVal = Math.max(o, cl, h)
    const minVal = Math.min(o, cl, l)
    if (maxVal > highestPrice) highestPrice = maxVal
    if (minVal < lowestPrice) lowestPrice = minVal
  }
  if (!Number.isFinite(highestPrice) || highestPrice <= 0) highestPrice = 1040
  if (!Number.isFinite(lowestPrice) || lowestPrice <= 0) lowestPrice = 960

  // Set chart viewport Y-ceiling to highestPrice * 1.28 (28% visual headroom margin)
  const yMax = highestPrice * 1.28
  const yMin = Math.max(0, lowestPrice * 0.85)
  const totalYRange = Math.max(10, yMax - yMin)

  // SVG ViewBox dimensions
  const svgW = 400
  const svgH = 160
  const padX = 24
  const chartW = svgW - padX * 2
  const maxSlots = Math.max(1, all.length)
  const slotW = chartW / maxSlots
  const candleBodyW = Math.max(10, slotW * 0.58)

  // Add 20% visual top padding so green candle spikes never collide with top orderbook controls
  const padTop = Math.round(svgH * 0.20)
  const padBottom = 12
  const chartH = svgH - padTop - padBottom

  const toY = (val: number) => {
    const frac = Math.max(0, Math.min(1, (val - yMin) / totalYRange))
    return padTop + (1 - frac) * chartH
  }

  const isGreenSpotlight = spotlightMode === 'green'
  const isRedSpotlight = spotlightMode === 'red'
  const isSpotlightActive = isGreenSpotlight || isRedSpotlight

  const renderCandle = (c: Candle, idx: number, isHighlighted: boolean, isDimmed: boolean) => {
    const openVal = (c as any).open ?? c.o
    const closeVal = (c as any).close ?? c.c ?? openVal
    const highVal = (c as any).high ?? c.h ?? Math.max(openVal, closeVal)
    const lowVal = (c as any).low ?? c.l ?? Math.min(openVal, closeVal)

    const isGreen = closeVal >= openVal
    const cx = padX + idx * slotW + slotW * 0.5
    const oY = toY(openVal)
    const cY = toY(closeVal)
    const highY = toY(highVal)
    const lowY = toY(lowVal)

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
          transition: 'opacity 0.3s ease, filter 0.3s ease',
        }}
      >
        {/* Wick with smooth dynamic auto-zoom scale transition */}
        <line
          x1={cx}
          y1={highY}
          x2={cx}
          y2={lowY}
          stroke={strokeCol}
          strokeWidth={isHighlighted ? 2.8 : 1.5}
          strokeLinecap="round"
          style={{
            transition: 'y1 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), y2 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        />

        {/* Candle Body with smooth dynamic auto-zoom scale transition */}
        <rect
          x={cx - candleBodyW / 2}
          y={topY}
          width={candleBodyW}
          height={bodyH}
          rx="2"
          fill={fillCol}
          stroke={strokeCol}
          strokeWidth={isHighlighted ? 2.2 : 1}
          style={{
            transition: 'y 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
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
            <stop offset="0%" stopColor="#050811" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#0F172A" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#090D16" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="obFarHills" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="obHoloStage" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#090D16" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.28" />
          </radialGradient>
        </defs>

        {/* Atmospheric Dark Gradient Background */}
        <rect width={svgW} height={svgH} fill="url(#chartBgGrad)" />

        {/* Distant Transmission Towers & Layered Hill Silhouettes */}
        <g opacity="0.55">
          {/* Left & Right Transmission Towers */}
          <path d="M54 96 L60 52 L66 96 M56 64 H64 M54 76 H66" stroke="#334155" strokeWidth="1" fill="none" />
          <circle cx="60" cy="51" r="1.5" fill="#EF4444" />
          <path d="M334 94 L340 48 L346 94 M336 60 H344 M334 72 H346" stroke="#334155" strokeWidth="1" fill="none" />
          <circle cx="340" cy="47" r="1.5" fill="#EF4444" />
          <path d="M66 64 Q200 84 334 60" stroke="#1E293B" strokeWidth="0.8" fill="none" />
          {/* Layered Distant Hills */}
          <path d="M0 95 Q105 74 215 92 T400 86 L400 160 L0 160 Z" fill="url(#obFarHills)" />
        </g>

        {/* Sleek Holographic Circuit Stage */}
        <g transform={`translate(${svgW * 0.5}, ${svgH * 0.76})`}>
          <ellipse
            cx="0"
            cy="0"
            rx="158"
            ry="24"
            fill="url(#obHoloStage)"
            stroke="#22D3EE"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="122"
            ry="17"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="0.8"
            strokeDasharray="6 4"
            opacity="0.4"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="78"
            ry="10"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="0.7"
            opacity="0.3"
          />
          {/* Faint Glowing Candlestick Tick Marks Engraved into Arena Surface */}
          <g opacity="0.28">
            <line x1="-45" y1="-5" x2="-45" y2="5" stroke="#22C55E" strokeWidth="1.2" />
            <rect x="-47" y="-2.5" width="4" height="5" fill="#22C55E" />
            <line x1="-15" y1="-6" x2="-15" y2="4" stroke="#22C55E" strokeWidth="1.2" />
            <rect x="-17" y="-3" width="4" height="5" fill="#22C55E" />
            <line x1="15" y1="-4" x2="15" y2="6" stroke="#EF4444" strokeWidth="1.2" />
            <rect x="13" y="-1.5" width="4" height="5" fill="#EF4444" />
            <line x1="45" y1="-6" x2="45" y2="5" stroke="#22C55E" strokeWidth="1.2" />
            <rect x="43" y="-3" width="4" height="6" fill="#22C55E" />
          </g>
        </g>

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
