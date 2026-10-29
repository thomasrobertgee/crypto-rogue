import React, { useState, useEffect, useRef } from 'react'
import { Rocket, Trophy, Flame, TrendingUp, Sparkles } from 'lucide-react'
import { AudioSynth } from '../../engine/AudioSynth'
import { useRunStore } from '../../state/useRunStore'

interface TugOfWarMiniGameProps {
  onComplete: () => void
}

export const TugOfWarMiniGame: React.FC<TugOfWarMiniGameProps> = ({ onComplete }) => {
  const boostBaseSlotCapacities = useRunStore((s) => s.boostBaseSlotCapacities)
  const addRunXp = useRunStore((s) => s.addRunXp)

  // 10.0s timer
  const [timeLeft, setTimeLeft] = useState(10.0)
  // Gauge %: starts at 100%, can rise to 500%+
  const [gaugePct, setGaugePct] = useState(120)
  const [tapsCount, setTapsCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [isPumping, setIsPumping] = useState(false)
  const [sparks, setSparks] = useState<Array<{ id: number; x: number; y: number }>>([])

  const gaugeRef = useRef(120)
  const isFinishedRef = useRef(false)
  const sparkIdRef = useRef(1)

  // 10s Countdown and Bear Selling Pressure ticker
  useEffect(() => {
    const startTime = performance.now()
    const durationMs = 10000

    const interval = window.setInterval(() => {
      if (isFinishedRef.current) return
      const elapsed = performance.now() - startTime
      const rem = Math.max(0, (durationMs - elapsed) / 1000)
      setTimeLeft(Math.round(rem * 10) / 10)

      // Bear Boss pushdown decay (around -18% to -24% per second)
      setGaugePct((prev) => {
        const next = Math.max(80, prev - 1.9)
        gaugeRef.current = next
        return next
      })

      if (rem <= 0) {
        window.clearInterval(interval)
        isFinishedRef.current = true
        setIsFinished(true)
        AudioSynth.playChestOpen()
      }
    }, 100)

    return () => window.clearInterval(interval)
  }, [])

  // Handle Rapid Tap
  const handlePumpTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isFinishedRef.current) return
    AudioSynth.unlock()
    AudioSynth.playCoinInject()

    setTapsCount((c) => c + 1)
    setIsPumping(true)
    window.setTimeout(() => setIsPumping(false), 80)

    // Each tap pushes gauge up by +14%
    setGaugePct((prev) => {
      const next = Math.min(600, prev + 14)
      gaugeRef.current = next
      return next
    })

    // Spawn floating sparks around button
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const sid = sparkIdRef.current++
    setSparks((prev) => [...prev.slice(-6), { id: sid, x, y }])
    window.setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== sid))
    }, 400)
  }

  // Calculate Tier and Rewards
  const finalScore = Math.round(gaugePct)
  const tier =
    finalScore >= 350
      ? {
          level: 3,
          title: 'TIER 3: GOD CANDLE PUMP! 🚀',
          xp: 800,
          floorCapBonus: 40,
          color: 'from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]',
          badge: 'bg-[#8b5cf6] text-white',
        }
      : finalScore >= 200
        ? {
            level: 2,
            title: 'TIER 2: MASSIVE WHALE BREAKOUT! 🐋',
            xp: 500,
            floorCapBonus: 25,
            color: 'from-[#10b981] via-[#06b6d4] to-[#3b82f6]',
            badge: 'bg-[#0284c7] text-white',
          }
        : {
            level: 1,
            title: 'TIER 1: RETAIL RALLY! 📈',
            xp: 300,
            floorCapBonus: 15,
            color: 'from-[#22c55e] to-[#15803d]',
            badge: 'bg-[#15803d] text-white',
          }

  const handleClaim = () => {
    AudioSynth.playRelicTrigger()
    boostBaseSlotCapacities(tier.floorCapBonus)
    addRunXp(tier.xp)
    onComplete()
  }

  // Candlestick fill percent scaled 0..500% -> 0..100% height
  const candleHeightPct = Math.min(100, Math.max(12, (gaugePct / 500) * 100))

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-between bg-[#0F172A]/90 backdrop-blur-md p-4 text-[#FFFDF9] select-none">
      {/* Header Banner */}
      <div className="flex flex-col items-center text-center mt-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-1 font-display text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-sm animate-pulse">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>NODE 15 BONUS MINI-GAME</span>
        </div>
        <h2 className="mt-1 font-display text-lg font-black text-amber-100 tracking-wide">
          LIQUIDITY TUG-OF-WAR
        </h2>
        <p className="text-[11px] font-semibold text-slate-300">
          Bear Whale is dumping! Rapid-tap to PUMP THE CANDLE!
        </p>
      </div>

      {/* Main Arena: Bear Boss (top) vs. Candlestick vs. Bull Whale (bottom) */}
      <div className="relative flex flex-1 w-full max-w-[320px] items-center justify-between my-2 px-2">
        {/* Left Side: Candlestick Tube Gauge */}
        <div className="relative flex h-full max-h-[260px] w-14 flex-col items-center justify-between rounded-full border-2 border-slate-600 bg-slate-900/80 p-1 shadow-inner">
          {/* Top: Bear Boss Icon */}
          <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-rose-500 bg-rose-950 text-xs shadow-md">
            🐻
          </div>

          {/* Vertical Rising Candlestick Body */}
          <div className="relative flex-1 w-full flex items-end justify-center py-1 overflow-hidden">
            <div
              className={`w-6 rounded-full transition-all duration-75 relative shadow-[0_0_16px_rgba(34,197,94,0.6)] ${
                gaugePct >= 350
                  ? 'bg-gradient-to-t from-[#22c55e] via-[#f59e0b] to-[#ec4899] animate-pulse'
                  : 'bg-gradient-to-t from-[#15803d] to-[#22c55e]'
              }`}
              style={{ height: `${candleHeightPct}%` }}
            >
              {/* Upper Wick */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-emerald-400" />
            </div>
          </div>

          {/* Bottom: Bull Whale Icon */}
          <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400 bg-emerald-950 text-xs shadow-md">
            🐋
          </div>
        </div>

        {/* Right Side: Big Gauge Stats & Countdown */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 pl-4 text-center">
          {/* 10s Timer */}
          <div className="flex flex-col items-center rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2 w-full shadow">
            <span className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-400">
              TIME REMAINING
            </span>
            <span
              className={`font-display text-2xl font-black ${
                timeLeft <= 3 ? 'text-rose-400 animate-ping' : 'text-amber-400'
              }`}
            >
              {timeLeft.toFixed(1)}s
            </span>
          </div>

          {/* Live Pump Gauge % */}
          <div className="flex flex-col items-center rounded-2xl border-2 border-emerald-500/50 bg-emerald-950/40 px-4 py-3 w-full shadow-lg">
            <span className="text-[10px] font-display font-bold uppercase tracking-wider text-emerald-300">
              ORDERBOOK PUMP
            </span>
            <div className="flex items-center gap-1">
              <Flame className="h-5 w-5 text-emerald-400 animate-bounce" />
              <span className="font-display text-3xl font-black text-emerald-300">
                {Math.round(gaugePct)}%
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-300 mt-0.5">
              Taps: {tapsCount}
            </span>
          </div>

          {/* Target Milestones Badge */}
          <div className="text-[10px] font-semibold text-slate-400 space-y-0.5">
            <div>Tier 1: 100%–199% (+15% Cap)</div>
            <div>Tier 2: 200%–349% (+25% Cap)</div>
            <div className="text-amber-300 font-bold">Tier 3: 350%+ (+40% Cap) 🚀</div>
          </div>
        </div>
      </div>

      {/* Bottom Pump Action Button */}
      {!isFinished ? (
        <div className="w-full max-w-[320px] mb-2 relative">
          <button
            type="button"
            onClick={handlePumpTap}
            className={`w-full py-4 rounded-2xl font-display text-lg font-black uppercase tracking-wider shadow-2xl transition-all border-2 border-emerald-400 border-b-[6px] border-b-emerald-950 bg-gradient-to-r from-emerald-500 to-green-600 text-white active:translate-y-1 active:border-b-2 active:brightness-110 flex items-center justify-center gap-2 ${
              isPumping ? 'scale-98 brightness-125' : 'hover:scale-[1.02]'
            }`}
          >
            <Rocket className="h-6 w-6 animate-bounce" />
            <span>🚀 PUMP IT! ({tapsCount})</span>
          </button>

          {/* Render Sparks */}
          {sparks.map((s) => (
            <div
              key={s.id}
              style={{ left: s.x, top: s.y }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-display text-xs font-black text-amber-300 animate-ping"
            >
              +14%!
            </div>
          ))}
        </div>
      ) : (
        /* Payout Modal / Dialog */
        <div className="w-full max-w-[340px] rounded-3xl border-[3px] border-[#fbbf24] border-b-[6px] border-b-[#b45309] bg-gradient-to-b from-[#FFFDF9] to-[#FEF3C7] p-5 text-center text-[#2C1810] shadow-2xl animate-fade-in">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#78350f] bg-gradient-to-b from-[#fde047] to-[#f59e0b] shadow-md">
            <Trophy className="h-6 w-6 text-[#78350f]" />
          </div>

          <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 ${tier.badge}`}>
            {tier.title}
          </span>

          <h3 className="font-display text-xl font-extrabold text-[#2C1810]">
            PEAK PUMP: {finalScore}%
          </h3>

          <div className="my-3 space-y-1.5 rounded-2xl border-2 border-[#78350f]/20 bg-[#FFFDF9] p-3 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-[#2C1810]">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Algo Run XP:
              </span>
              <span className="font-black text-[#15803d]">+{tier.xp} XP</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#2C1810]">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> Permanent Floor 2 & 3 Capacity:
              </span>
              <span className="font-black text-[#15803d]">+{tier.floorCapBonus}% Base</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClaim}
            className="w-full py-3 rounded-xl font-display text-xs font-black uppercase tracking-wider text-white border-2 border-[#78350f] border-b-4 bg-gradient-to-r from-[#16a34a] to-[#15803d] shadow-lg active:translate-y-0.5"
          >
            CLAIM LOOT & ADVANCE (NODE 16)
          </button>
        </div>
      )}
    </div>
  )
}
