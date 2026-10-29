import { useEffect, useState } from 'react'
import { Shield, Heart, Lock } from 'lucide-react'
import { RELIC_MAP } from '../../config/relics.config'
import {
  RELIC_SLOT_UNLOCK_LABELS,
  getUnlockedRelicSlotsForClearedStage,
} from '../../config/stages.config'
import { fmtUsd } from '../../engine/format'
import { useMetaStore } from '../../state/useMetaStore'
import { DynamicIcon } from '../DynamicIcon'
import type { Rarity } from '../../types/game.types'

interface TopHudProps {
  marginHp: number
  maxMarginHp: number
  shield: number
  totalPortfolio: number
  startPortfolio: number
  runRelics: string[]
  relicPulses: Record<string, number> // relicId -> timestamp of last trigger
}

const RARITY_BORDER: Record<Rarity, string> = {
  common: 'border-slate-500',
  uncommon: 'border-emerald-600',
  rare: 'border-sky-600',
  epic: 'border-purple-600',
  legendary: 'border-amber-600',
  mythical: 'border-rose-600',
}

export function TopHud({
  marginHp,
  maxMarginHp,
  shield,
  totalPortfolio,
  runRelics,
  relicPulses,
}: TopHudProps) {
  const [trailingHp, setTrailingHp] = useState(marginHp)

  useEffect(() => {
    if (marginHp < trailingHp) {
      const timer = setTimeout(() => {
        setTrailingHp(marginHp)
      }, 400)
      return () => clearTimeout(timer)
    } else {
      setTrailingHp(marginHp)
    }
  }, [marginHp, trailingHp])

  const hpPct = Math.max(0, Math.min(100, (marginHp / Math.max(1, maxMarginHp)) * 100))
  const trailingPct = Math.max(0, Math.min(100, (trailingHp / Math.max(1, maxMarginHp)) * 100))
  const now = Date.now()
  const unlockedRelicSlots = useMetaStore(
    (s) => s.unlockedRelicSlots ?? getUnlockedRelicSlotsForClearedStage(s.highestStageCleared),
  )

  return (
    <div className="flex w-full items-center justify-between gap-2 border-b-2 border-[#3E2723] bg-[#FFFDF9] px-2.5 py-1 text-[#2C1810]">
      {/* Compact Margin HP Bar with inline value & Trailing Damage Bar */}
      <div className="flex flex-1 items-center gap-1.5 min-w-[110px]">
        <Heart className="h-3.5 w-3.5 shrink-0 fill-[#f43f5e] text-[#f43f5e]" />
        <div className="relative h-3.5 flex-1 overflow-hidden rounded-full border border-[#3E2723] bg-[#F3E9D8]">
          {/* Delayed bright white/gold trailing damage bar */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#fef08a] transition-all duration-500 ease-out"
            style={{ width: `${trailingPct}%` }}
          />
          {/* Main active HP bar */}
          <div
            className={`relative h-full transition-all duration-150 ${
              hpPct <= 30
                ? 'bg-gradient-to-r from-[#f43f5e] to-[#f97316] animate-pulse'
                : 'bg-gradient-to-r from-[#4ade80] to-[#16a34a]'
            }`}
            style={{ width: `${hpPct}%` }}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[9px] font-black text-[#2C1810] drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]">
            {Math.ceil(marginHp)}/{maxMarginHp}
            {shield > 0 && (
              <span className="ml-1 inline-flex items-center text-[#0284c7]">
                <Shield className="mr-0.5 h-2.5 w-2.5" />+{Math.ceil(shield)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Compact TVL Pill */}
      <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#3E2723] bg-[#fde047] px-2 py-0.5 font-display text-[10px] font-black text-[#2C1810] shadow-2xs">
        <span className="text-[#78350f]">TVL</span>
        <span>{fmtUsd(totalPortfolio)}</span>
      </div>

      {/* Compact Algo Relic Rack (5 Staggered Slots) */}
      <div className="flex shrink-0 items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const isSlotUnlocked = i < unlockedRelicSlots
          const relicId = isSlotUnlocked ? runRelics[i] : undefined
          const relic = relicId ? RELIC_MAP[relicId] : null
          const lastTrig = relicId ? relicPulses[relicId] ?? 0 : 0
          const isFiring = now - lastTrig < 650

          if (!isSlotUnlocked) {
            return (
              <div
                key={i}
                title={RELIC_SLOT_UNLOCK_LABELS[i]}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]"
              >
                <Lock className="h-2.5 w-2.5" />
              </div>
            )
          }

          if (!relic) {
            return (
              <div
                key={i}
                title="Empty Algo Relic Slot"
                className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-[#E2D5C1] bg-[#F3E9D8]/60"
              />
            )
          }

          return (
            <div
              key={relic.id}
              title={`${relic.name}: ${relic.description}`}
              className={`relative flex h-6 w-6 items-center justify-center rounded-md border-2 bg-[#FFFDF9] transition-transform duration-150 ${
                RARITY_BORDER[relic.rarity]
              } ${
                isFiring
                  ? 'scale-125 border-[#16a34a] bg-[#bbf7d0] shadow-md -translate-y-0.5'
                  : ''
              }`}
            >
              <DynamicIcon
                name={relic.icon}
                className="h-3 w-3 text-[#2C1810]"
              />
              {isFiring && (
                <span className="-top-2 -right-1 pointer-events-none absolute rounded bg-[#22c55e] px-0.5 font-display text-[7px] font-black text-white shadow">
                  ⚡
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
