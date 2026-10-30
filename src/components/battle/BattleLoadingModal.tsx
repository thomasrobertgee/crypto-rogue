import React, { useState, useEffect } from 'react'
import { Sparkles, Terminal } from 'lucide-react'

export interface BattleLoadingModalProps {
  stageNumber: number
  stageName: string
  nodeIndex?: number
  totalNodes?: number
  nodeType?: string
  progress: number
}

const TRADING_PRO_TIPS = [
  'Pro Tip: Green candles pay the bills. Red candles build character.',
  "Remember: It's not a loss until you check your portfolio.",
  'Golden Rule: Buy high, panic sell low, blame market manipulation.',
  'Pro Tip: Diversification is for those who lack high-leverage conviction.',
  'Remember: 1 BTC = 1 BTC. The rest is just fiat volatility noise.',
  "Pro Tip: Never catch a falling knife unless you're holding a cold storage shield.",
  'Trading Wisdom: Markets can remain irrational longer than you can remain solvent.',
]

export const BattleLoadingModal: React.FC<BattleLoadingModalProps> = ({
  stageNumber,
  stageName,
  nodeIndex = 1,
  totalNodes = 10,
  nodeType = 'Bagholder',
  progress,
}) => {
  const [tipIndex, setTipIndex] = useState(0)

  // Rotate satirical pro-tips every 2.4s
  useEffect(() => {
    const iv = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TRADING_PRO_TIPS.length)
    }, 2400)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fade-in">
      <div className="relative w-full max-w-[360px] rounded-3xl border border-amber-500/30 bg-[#120c1f]/95 p-6 text-center text-white shadow-[0_0_50px_rgba(0,0,0,0.85)] ring-1 ring-amber-500/20 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-36 w-60 rounded-full bg-gradient-to-b from-amber-500/25 to-transparent blur-2xl" />

        {/* Terminal Header */}
        <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400/80 mb-3 border-b border-amber-500/20 pb-2">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>SATOSHI_TERMINAL_V2</span>
          </div>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.2 text-[8px] text-emerald-400 font-bold">
            LIVE AMBUSH
          </span>
        </div>

        {/* Stage Target Header */}
        <div className="mt-1">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 font-display text-[9px] font-black uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Node {nodeIndex}/{totalNodes} • {nodeType}
          </span>
          <h2 className="mt-2 font-display text-xl font-black uppercase tracking-wide text-white drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">
            STAGE {stageNumber}: {stageName}
          </h2>
        </div>

        {/* High-Contrast Animated Candlestick Loading Bar */}
        <div className="my-5 flex flex-col items-center">
          <div className="relative flex h-14 w-full items-end justify-center gap-2 rounded-2xl border border-amber-500/20 bg-black/50 p-2.5 shadow-inner">
            {[
              { h: 28, wickH: 42, up: true },
              { h: 18, wickH: 30, up: false },
              { h: 34, wickH: 48, up: true },
              { h: 22, wickH: 36, up: true },
              { h: 14, wickH: 26, up: false },
              { h: 38, wickH: 50, up: true },
              { h: 20, wickH: 32, up: false },
              { h: 44, wickH: 52, up: true },
            ].map((c, idx) => {
              const threshold = (idx + 1) * 12
              const visible = progress >= threshold - 8
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-end transition-all duration-200"
                  style={{
                    opacity: visible ? 1 : 0.15,
                    transform: visible ? 'translateY(0px)' : 'translateY(4px)',
                  }}
                >
                  {/* Wick */}
                  <div
                    className={`w-0.5 rounded-full ${
                      c.up ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-400 shadow-[0_0_6px_#f87171]'
                    }`}
                    style={{ height: `${c.wickH}px` }}
                  />
                  {/* Body */}
                  <div
                    className={`-mt-[${Math.round(c.wickH * 0.7)}px] w-3 rounded-xs border ${
                      c.up
                        ? 'border-emerald-300 bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.7)]'
                        : 'border-rose-300 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                    }`}
                    style={{ height: `${c.h}px` }}
                  />
                </div>
              )
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full border border-amber-500/40 bg-slate-900 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-300 transition-all duration-100 shadow-[0_0_12px_rgba(250,204,21,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between w-full text-[10px] font-mono font-bold text-amber-300/80">
            <span>INJECTING LIQUIDITY...</span>
            <span className="text-amber-400 font-black">{progress}%</span>
          </div>
        </div>

        {/* Satirical Trading Pro-Tip Carousel */}
        <div className="mt-2 min-h-[48px] flex items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2">
          <p
            key={tipIndex}
            className="text-xs font-medium text-amber-200/90 leading-relaxed italic animate-fade-in"
          >
            &ldquo;{TRADING_PRO_TIPS[tipIndex]}&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}
