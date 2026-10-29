import { useState, useEffect } from 'react'
import {
  Skull,
  Trophy,
  Tv,
  Sparkles,
  Cpu,
  Gem,
  Key,
  PiggyBank,
  RotateCcw,
  ArrowRight,
  Unlock,
  Home,
  Clock,
} from 'lucide-react'
import type { RunPayoutResult } from '../../state/useMetaStore'
import { fmtNum } from '../../engine/format'

interface MarginCallModalProps {
  canBailout: boolean
  isVipAdFree: boolean
  adLoading: boolean
  onWatchBailoutAd: () => void
  onAcceptLiquidation: () => void
}

export function MarginCallModal({
  canBailout,
  isVipAdFree,
  adLoading,
  onWatchBailoutAd,
  onAcceptLiquidation,
}: MarginCallModalProps) {
  const [timeLeft, setTimeLeft] = useState(10)

  // 10-Second Countdown Timer Bar
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onAcceptLiquidation()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [onAcceptLiquidation])

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in select-none">
      <div className="flex w-full max-w-sm flex-col items-center gap-3.5 rounded-3xl border-[3.5px] border-[#3E2723] border-b-[7px] bg-[#FFFDF9] p-5 text-center text-[#2C1810] shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#be123c] bg-[#ffe4e6] text-[#be123c] shadow-sm animate-pulse">
          <Skull className="h-8 w-8" />
        </div>

        <div>
          <span className="font-display text-[10px] font-black uppercase tracking-widest text-[#be123c]">
            POSITION LIQUIDATED • STEP 1/2
          </span>
          <h2 className="font-display text-xl font-extrabold text-[#2C1810]">MARGIN CALL!</h2>
          <p className="mt-1 text-xs font-semibold text-[#6E5A4F]">
            Your Margin HP hit zero. Emergency bailout desk is standing by.
          </p>
        </div>

        {/* 10-Second Active Countdown Bar */}
        <div className="w-full rounded-2xl border border-[#E2D5C1] bg-[#FDF6E9] p-2.5">
          <div className="flex items-center justify-between text-[11px] font-black mb-1">
            <span className="flex items-center gap-1.5 text-[#e11d48]">
              <Clock className="h-3.5 w-3.5 animate-spin text-[#e11d48]" />
              Auto-forfeiting in {timeLeft}s...
            </span>
            <span className="font-display text-xs font-black text-[#991b1b]">{timeLeft}s</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 border border-[#3E2723]/30">
            <div
              className="h-full bg-gradient-to-r from-[#e11d48] via-[#f59e0b] to-[#10b981] transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* 1) 50% BAILOUT BUTTON (Once per run) */}
        {canBailout && (
          <button
            type="button"
            disabled={adLoading}
            onClick={onWatchBailoutAd}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-xs font-black tracking-wider text-[#2C1810] btn-3d-amber active:translate-y-0.5 shadow-md"
          >
            <Tv className="h-4 w-4" />
            {adLoading
              ? 'BROADCASTING BAILOUT...'
              : isVipAdFree
              ? '⚡ VIP FREE BAILOUT (REVIVE 50% HP)'
              : '📺 50% BAILOUT (Watch Ad / VIP Free)'}
          </button>
        )}

        {/* 2) END RUN & CLAIM LOOT (Forfeit without waiting) */}
        <button
          type="button"
          disabled={adLoading}
          onClick={onAcceptLiquidation}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#F3E9D8] py-2.5 font-display text-xs font-extrabold text-[#2C1810] hover:bg-[#fde68a] active:translate-y-0.5 shadow-sm"
        >
          <span>🏁 END RUN &amp; CLAIM LOOT</span>
        </button>
      </div>
    </div>
  )
}

interface RunSummaryModalProps {
  wonStage: boolean
  stageNumber: number
  nodesCleared: number
  payout: RunPayoutResult
  onPlayAgain: () => void
  onReturnHome: () => void
  onNextStage?: () => void
}

export function RunSummaryModal({
  wonStage,
  stageNumber,
  nodesCleared,
  payout,
  onPlayAgain,
  onReturnHome,
  onNextStage,
}: RunSummaryModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-5 text-center text-[#2C1810] shadow-2xl">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${
            wonStage
              ? 'border-[#15803d] bg-[#dcfce7] text-[#16a34a]'
              : 'border-[#d97706] bg-[#fef3c7] text-[#d97706]'
          }`}
        >
          {wonStage ? <Trophy className="h-8 w-8" /> : <Sparkles className="h-7 w-7" />}
        </div>

        <div>
          <span className="font-display text-[10px] font-black uppercase tracking-widest text-[#6E5A4F]">
            STAGE {stageNumber} · {nodesCleared}/{stageNumber === 1 ? 10 : 30} NODES CLEARED
          </span>
          <h2 className="font-display text-xl font-extrabold text-[#2C1810]">
            {wonStage ? 'WHALE LIQUIDATED!' : 'PARTIAL PAYOUT'}
          </h2>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3 text-left">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#0284c7]" />
            <div>
              <div className="text-[9px] font-bold uppercase text-[#6E5A4F]">Hashrate</div>
              <div className="font-display text-xs font-black text-[#0284c7]">
                +{fmtNum(payout.hashrate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-[#db2777]" />
            <div>
              <div className="text-[9px] font-bold uppercase text-[#6E5A4F]">Piggy Bank</div>
              <div className="font-display text-xs font-black text-[#db2777]">
                +{payout.piggyBankGems} Gems
              </div>
            </div>
          </div>

          {payout.gems > 0 && (
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4 text-[#d97706]" />
              <div>
                <div className="text-[9px] font-bold uppercase text-[#6E5A4F]">Satoshi Gems</div>
                <div className="font-display text-xs font-black text-[#b45309]">+{payout.gems}</div>
              </div>
            </div>
          )}

          {(payout.silverKeys > 0 || payout.quantumKeys > 0) && (
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-[#7e22ce]" />
              <div>
                <div className="text-[9px] font-bold uppercase text-[#6E5A4F]">Vault Keys</div>
                <div className="font-display text-xs font-black text-[#7e22ce]">
                  {payout.silverKeys > 0 ? `+${payout.silverKeys} Silver ` : ''}
                  {payout.quantumKeys > 0 ? `+${payout.quantumKeys} Quantum` : ''}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Milestone Cycle Breakthrough Crate */}
        {payout.cycleBreakthroughCrate && (
          <div className="flex flex-col gap-1 rounded-2xl border-2 border-[#b45309] bg-gradient-to-r from-[#fef3c7] via-[#fde047] to-[#f59e0b] p-3 text-center text-xs font-black text-amber-950 shadow-md">
            <div className="flex items-center justify-center gap-1.5 text-sm uppercase font-display text-amber-950">
              <span>🏆</span>
              <span>CYCLE BREAKTHROUGH CRATE!</span>
            </div>
            <div className="text-[10px] text-amber-900 font-extrabold">
              {payout.cycleBreakthroughCrate.cycleName} Cleared!
            </div>
            <div className="flex items-center justify-center gap-2 mt-0.5 font-display text-[11px] text-amber-950">
              <span>+{payout.cycleBreakthroughCrate.heroFragments} 👤 Frags</span>
              <span>•</span>
              <span>+{payout.cycleBreakthroughCrate.quantumKeys} 🗝️ Keys</span>
              <span>•</span>
              <span>+{payout.cycleBreakthroughCrate.gems} 💎 Gems</span>
            </div>
          </div>
        )}

        {/* Unlocks Banner */}
        {(payout.unlockedSlot || payout.unlockedFeatures.length > 0) && (
          <div className="flex flex-col gap-1 rounded-2xl border-2 border-[#d97706] bg-[#fef3c7] p-2.5 text-xs font-extrabold text-[#92400e]">
            <div className="flex items-center justify-center gap-1.5 font-display">
              <Unlock className="h-4 w-4 text-[#d97706]" /> MILESTONE UNLOCKED!
            </div>
            {payout.unlockedSlot && <div>• Wallet Slot {payout.unlockedSlot} Unlocked</div>}
            {payout.unlockedFeatures.map((f) => (
              <div key={f} className="uppercase">
                • Unlocked: {f}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {wonStage ? (
            <>
              {onNextStage && (
                <button
                  type="button"
                  onClick={onNextStage}
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-xs font-black tracking-wider text-white btn-3d-green game-text-outline-sm active:translate-y-0.5"
                >
                  ENTER STAGE {stageNumber + 1} <ArrowRight className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onPlayAgain}
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-[#3E2723] border-b-4 bg-[#F3E9D8] py-2.5 font-display text-xs font-extrabold text-[#2C1810] hover:bg-[#fde68a] active:translate-y-0.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                REPLAY STAGE {stageNumber}
              </button>

              <button
                type="button"
                onClick={onReturnHome}
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-xs font-black tracking-wider text-white btn-3d-cyan game-text-outline-sm active:translate-y-0.5"
              >
                <Home className="h-4 w-4" />
                <span>🏠 RETURN TO HOME</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onReturnHome}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-sm font-black tracking-wider text-white btn-3d-cyan game-text-outline-sm active:translate-y-0.5 shadow-lg"
            >
              <Home className="h-5 w-5" />
              <span>🏠 RETURN TO HOME</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
