import {
  Play,
  Pause,
  Scale,
  ArrowUpCircle,
  ArrowDownCircle,
  Zap,
  Lock,
  Flame,
  Wallet,
} from 'lucide-react'
import type { AllocationAmount, AllocationMode, CombatSpeed } from '../../state/useRunStore'
import { GAS_SKIMMER_RELIC_ID } from '../../config/economy.config'
import { fmtUsd } from '../../engine/format'

interface ThumbDeckProps {
  phase: 'allocate' | 'combat' | 'paused'
  allocationMode: AllocationMode
  selectedAmount: AllocationAmount
  unallocatedCash: number
  allocatedCash: number
  combatSpeed: CombatSpeed
  isVipAdFree: boolean
  runRelics: string[]
  liveDps: number
  sessionProfit: number
  rebalanceLocked: boolean
  onSetMode: (mode: AllocationMode) => void
  onSetAmount: (amount: AllocationAmount) => void
  onEqualSplit: (isMidBattle: boolean) => void
  onOpenMarket: () => void
  onTogglePause: () => void
  onSetSpeed: (speed: CombatSpeed) => void
}

const AMOUNTS: Array<{ value: AllocationAmount; label: string }> = [
  { value: 0.1, label: '10%' },
  { value: 0.25, label: '25%' },
  { value: 0.5, label: '50%' },
  { value: 'max', label: 'MAX' },
]

export function ThumbDeck({
  phase,
  allocationMode,
  selectedAmount,
  unallocatedCash,
  allocatedCash,
  combatSpeed,
  isVipAdFree,
  runRelics,
  liveDps,
  sessionProfit,
  rebalanceLocked,
  onSetMode,
  onSetAmount,
  onEqualSplit,
  onOpenMarket,
  onTogglePause,
  onSetSpeed,
}: ThumbDeckProps) {
  const hasSkimmer = runRelics.includes(GAS_SKIMMER_RELIC_ID)
  const isPreBattle = phase === 'allocate'

  if (isPreBattle) {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-2 bg-[#fff6e6] px-3 py-2 text-[#422006]">
        {/* Top Row: Unallocated Cash + Tactile 3D Equal Split */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 rounded-2xl border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-[#ffedd5] px-3 py-1.5">
            <Wallet className="h-4 w-4 text-[#0284c7]" />
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider text-[#9a3412]">
                Dry Powder (Idle Cash)
              </div>
              <div className="font-display text-xs font-black text-[#422006]">
                {fmtUsd(unallocatedCash)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEqualSplit(false)}
            className="flex items-center gap-1.5 rounded-2xl px-3.5 py-2 font-display text-xs font-black btn-3d-purple game-text-outline-sm active:border-b-0 active:translate-y-1"
          >
            <Scale className="h-3.5 w-3.5" />
            EQUAL SPLIT
          </button>
        </div>

        {/* Middle Row: +INJECT / -PULL toggle + [10%][25%][50%][MAX] 3D pills */}
        <div className="flex items-center justify-between gap-2">
          <div className="grid grid-cols-2 gap-1 rounded-2xl border-2 border-[#78350f] bg-[#ffedd5] p-1">
            <button
              type="button"
              onClick={() => onSetMode('inject')}
              className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 font-display text-[10px] font-black ${
                allocationMode === 'inject'
                  ? 'btn-3d-green game-text-outline-sm'
                  : 'text-[#9a3412] hover:text-[#422006]'
              }`}
            >
              <ArrowUpCircle className="h-3 w-3" /> +INJECT
            </button>
            <button
              type="button"
              onClick={() => onSetMode('pull')}
              className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 font-display text-[10px] font-black ${
                allocationMode === 'pull'
                  ? 'btn-3d-red game-text-outline-sm'
                  : 'text-[#9a3412] hover:text-[#422006]'
              }`}
            >
              <ArrowDownCircle className="h-3 w-3" /> -PULL
            </button>
          </div>

          <div className="grid flex-1 grid-cols-4 gap-1.5">
            {AMOUNTS.map((a) => {
              const active = selectedAmount === a.value
              return (
                <button
                  key={String(a.value)}
                  type="button"
                  onClick={() => onSetAmount(a.value)}
                  className={`rounded-xl py-1.5 font-display text-xs font-black ${
                    active
                      ? 'btn-3d-gold game-text-outline-sm'
                      : 'btn-3d-slate text-[#422006]'
                  }`}
                >
                  {a.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom Giant Tactile 3D OPEN MARKET Button */}
        <button
          type="button"
          onClick={onOpenMarket}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-display text-sm font-black tracking-wider btn-3d-green game-text-outline active:border-b-0 active:translate-y-1"
        >
          <Play className="h-4 w-4 fill-current" />
          OPEN MARKET
          {allocatedCash <= 0 && (
            <span className="rounded-full bg-black/25 px-2 py-0.5 font-display text-[9px] font-black text-white">
              AUTO-SPLIT
            </span>
          )}
        </button>
      </div>
    )
  }

  // Combat / Paused Mode
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2 bg-[#fff6e6] px-3 py-2 text-[#422006]">
      {/* Top Row: Live DPS & Profit Ticker + 3D Speed Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-[#ffedd5] px-3 py-1.5">
          <div>
            <div className="text-[8px] font-black uppercase tracking-wider text-[#9a3412]">
              LIVE DPS
            </div>
            <div className="flex items-center gap-1 font-display text-xs font-black text-[#d97706]">
              <Flame className="h-3.5 w-3.5 text-[#f43f5e]" />
              {fmtUsd(liveDps)}/s
            </div>
          </div>
          <div className="h-6 w-px bg-[#b45309]/30" />
          <div>
            <div className="text-[8px] font-black uppercase tracking-wider text-[#9a3412]">
              NET P&amp;L
            </div>
            <div
              className={`font-display text-xs font-black ${
                sessionProfit >= 0 ? 'text-[#16a34a]' : 'text-[#e11d48]'
              }`}
            >
              {fmtUsd(sessionProfit, true)}
            </div>
          </div>
        </div>

        {/* Speed Buttons: 1x / 2x / VIP 4x */}
        <div className="flex items-center gap-1 rounded-2xl border-2 border-[#78350f] bg-[#ffedd5] p-1">
          {([1, 2, 4] as CombatSpeed[]).map((spd) => {
            const locked = spd === 4 && !isVipAdFree
            const active = combatSpeed === spd
            return (
              <button
                key={spd}
                type="button"
                onClick={() => onSetSpeed(spd)}
                className={`flex items-center gap-0.5 rounded-xl px-2.5 py-1 font-display text-xs font-black ${
                  active
                    ? 'btn-3d-cyan game-text-outline-sm'
                    : locked
                      ? 'text-[#9a3412]/50'
                      : 'text-[#422006]'
                }`}
              >
                {locked && <Lock className="h-2.5 w-2.5 text-[#d97706]" />}
                {spd}x
              </button>
            )
          })}
        </div>
      </div>

      {/* Middle Row: +INJECT / -PULL toggle + [10%][25%][50%][MAX] */}
      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-2 gap-1 rounded-2xl border-2 border-[#78350f] bg-[#ffedd5] p-1">
          <button
            type="button"
            onClick={() => onSetMode('inject')}
            className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 font-display text-[10px] font-black ${
              allocationMode === 'inject'
                ? 'btn-3d-green game-text-outline-sm'
                : 'text-[#9a3412]'
            }`}
          >
            <ArrowUpCircle className="h-3 w-3" /> +INJECT
          </button>
          <button
            type="button"
            onClick={() => onSetMode('pull')}
            className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 font-display text-[10px] font-black ${
              allocationMode === 'pull'
                ? 'btn-3d-red game-text-outline-sm'
                : 'text-[#9a3412]'
            }`}
          >
            <ArrowDownCircle className="h-3 w-3" /> -PULL
          </button>
        </div>

        <div className="grid flex-1 grid-cols-4 gap-1.5">
          {AMOUNTS.map((a) => {
            const active = selectedAmount === a.value
            return (
              <button
                key={String(a.value)}
                type="button"
                onClick={() => onSetAmount(a.value)}
                className={`rounded-xl py-1.5 font-display text-xs font-black ${
                  active
                    ? 'btn-3d-gold game-text-outline-sm'
                    : 'btn-3d-slate text-[#422006]'
                }`}
              >
                {a.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom Row: Pause/Resume + Emergency Rebalance */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onTogglePause}
          className="flex items-center justify-center gap-1.5 rounded-2xl py-2.5 font-display text-xs font-black btn-3d-slate"
        >
          {phase === 'paused' ? (
            <>
              <Play className="h-3.5 w-3.5 fill-current" /> RESUME
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5" /> PAUSE
            </>
          )}
        </button>

        <button
          type="button"
          disabled={rebalanceLocked}
          onClick={() => onEqualSplit(true)}
          className={`col-span-2 flex items-center justify-center gap-1.5 rounded-2xl py-2.5 font-display text-xs font-black ${
            rebalanceLocked
              ? 'cursor-not-allowed border-2 border-[#78350f]/30 bg-[#e7e5e4] text-[#78716c]'
              : 'btn-3d-gold game-text-outline-sm active:border-b-0 active:translate-y-1'
          }`}
        >
          <Zap className="h-3.5 w-3.5 fill-current" />
          {rebalanceLocked
            ? 'REBALANCE LOCKED'
            : hasSkimmer
              ? 'REBALANCE (0% FEE +10% BOOST!)'
              : 'REBALANCE EQUAL (2% FEE)'}
        </button>
      </div>
    </div>
  )
}
