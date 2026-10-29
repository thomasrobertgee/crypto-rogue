import React, { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'

interface ModalMarginHpBarProps {
  currentHp: number
  maxHp: number
  className?: string
}

/**
 * High-visibility Margin HP Status Bar for Black Market and Shady Event Modals.
 * Displays heart icon, exact numerical health and percentage (e.g. "90 / 145 HP (62%)"),
 * colored health state progress bar (Emerald >50%, Amber 25-50%, pulsing Crimson <25%),
 * and smoothly animates reactive floating +HP / -HP indicators upon purchase or event choices.
 */
export const ModalMarginHpBar: React.FC<ModalMarginHpBarProps> = ({
  currentHp,
  maxHp,
  className = '',
}) => {
  const safeMax = Math.max(1, maxHp)
  const safeHp = Math.max(0, Math.min(safeMax, currentHp))
  const pct = Math.round((safeHp / safeMax) * 100)

  // Floating change indicator tracking (+HP or -HP)
  const prevHpRef = useRef<number>(currentHp)
  const [floatingDelta, setFloatingDelta] = useState<{
    text: string
    isPositive: boolean
    id: number
  } | null>(null)

  useEffect(() => {
    const prev = prevHpRef.current
    if (Math.round(currentHp) !== Math.round(prev)) {
      const diff = Math.round(currentHp) - Math.round(prev)
      prevHpRef.current = currentHp
      if (diff !== 0) {
        setFloatingDelta({
          text: diff > 0 ? `+${diff} HP` : `${diff} HP`,
          isPositive: diff > 0,
          id: Date.now(),
        })
        const timer = setTimeout(() => {
          setFloatingDelta((cur) => (cur?.id === floatingDelta?.id ? null : cur))
        }, 2200)
        return () => clearTimeout(timer)
      }
    }
  }, [currentHp, floatingDelta?.id])

  // Determine health state color & effects
  let barGradient = 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-300'
  let badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300'

  if (pct < 25) {
    barGradient = 'bg-gradient-to-r from-rose-600 via-red-500 to-pink-500 animate-pulse'
    badgeStyle = 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
  } else if (pct <= 50) {
    barGradient = 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300'
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300'
  }

  return (
    <div
      className={`relative flex flex-col gap-1 rounded-2xl border-2 border-[#78350f]/30 bg-gradient-to-b from-[#FFFDF9] to-[#FFF6E6] p-2.5 shadow-sm ${className}`}
    >
      {/* Top Header Row: Icon, Label, Numerical HP, and Animated Floating Delta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Heart className="h-4 w-4 fill-rose-500 text-rose-600 animate-pulse" />
          <span className="font-display text-[10.5px] font-black uppercase tracking-wider text-[#422006]">
            MARGIN HP
          </span>
        </div>

        <div className="relative flex items-center gap-1.5">
          {/* Floating reactive HP change badge */}
          {floatingDelta && (
            <span
              key={floatingDelta.id}
              className={`animate-bounce rounded-full border px-2 py-0.2 font-display text-[10px] font-black shadow-sm ${
                floatingDelta.isPositive
                  ? 'border-[#15803d] bg-[#4ade80] text-[#14532d]'
                  : 'border-[#9f1239] bg-[#fb7185] text-white'
              }`}
            >
              {floatingDelta.text}
            </span>
          )}

          <span
            className={`rounded-full border px-2 py-0.2 font-display text-[9.5px] font-black ${badgeStyle}`}
          >
            {Math.round(safeHp)} / {safeMax} HP ({pct}%)
          </span>
        </div>
      </div>

      {/* Visual Health Progress Bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full border-2 border-[#422006] bg-[#fee2e2] shadow-inner">
        <div
          className={`h-full transition-all duration-500 ease-out ${barGradient}`}
          style={{ width: `${pct}%` }}
        />
        {/* Specular Gloss Line */}
        <span className="pointer-events-none absolute top-0.5 left-2 right-2 h-1 rounded-full bg-white/45" />
      </div>
    </div>
  )
}
