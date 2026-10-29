import React, { useEffect, useState } from 'react'
import { X, Zap, PlayCircle, Sparkles, Clock } from 'lucide-react'
import {
  useMetaStore,
  MAX_ENERGY,
  ENERGY_RECHARGE_MS,
  RUN_ENERGY_COST,
} from '../../state/useMetaStore'
import { GemIllustration } from '../GameArtwork'

interface EnergyRechargeModalProps {
  onClose: () => void
  insufficientPrompt?: boolean
}

export const EnergyRechargeModal: React.FC<EnergyRechargeModalProps> = ({
  onClose,
  insufficientPrompt = false,
}) => {
  const energy = useMetaStore((s) => s.energy ?? MAX_ENERGY)
  const lastTs = useMetaStore((s) => s.lastEnergyRechargeTimestamp)
  const lastAdDate = useMetaStore((s) => s.lastEnergyAdDate)
  const gems = useMetaStore((s) => s.gems)
  const isVip = useMetaStore((s) => s.isVipAdFree)
  const syncEnergy = useMetaStore((s) => s.syncEnergy)
  const rechargeWithAd = useMetaStore((s) => s.rechargeEnergyWithAd)
  const rechargeWithGems = useMetaStore((s) => s.rechargeEnergyWithGems)

  const [now, setNow] = useState(() => Date.now())
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    syncEnergy()
    const id = window.setInterval(() => {
      syncEnergy()
      setNow(Date.now())
    }, 1000)
    return () => window.clearInterval(id)
  }, [syncEnergy])

  const today = new Date().toISOString().slice(0, 10)
  const adUsedToday = lastAdDate === today

  const isFull = energy >= MAX_ENERGY
  const elapsedInCycle = isFull ? 0 : Math.max(0, (now - (lastTs || now)) % ENERGY_RECHARGE_MS)
  const msToNext = isFull ? 0 : Math.max(0, ENERGY_RECHARGE_MS - elapsedInCycle)
  const secToNext = Math.ceil(msToNext / 1000)
  const mm = String(Math.floor(secToNext / 60)).padStart(2, '0')
  const ss = String(secToNext % 60).padStart(2, '0')

  const handleWatchAd = () => {
    const ok = rechargeWithAd()
    if (ok) {
      setFeedback('+10 ⚡ Energy Recharged!')
      setTimeout(() => setFeedback(null), 2200)
    }
  }

  const handleSpendGems = () => {
    const ok = rechargeWithGems()
    if (ok) {
      setFeedback('+30 ⚡ Energy Recharged!')
      setTimeout(() => setFeedback(null), 2200)
    } else {
      setFeedback('Not enough Satoshi Gems (Need 50)!')
      setTimeout(() => setFeedback(null), 2200)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border-[3px] border-[#422006] border-b-[6px] bg-gradient-to-b from-[#fffbeb] via-[#fef3c7] to-[#fde68a] p-4 shadow-2xl text-[#422006]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-[#422006] flex items-center justify-center shadow">
              <Zap className="w-6 h-6 text-[#422006] fill-yellow-200" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-[#422006] leading-tight">
                {insufficientPrompt ? 'OUT OF STAMINA!' : 'TRADER ENERGY'}
              </h2>
              <p className="text-[11px] font-bold text-[#92400e]">
                Each Stage Run costs {RUN_ENERGY_COST} ⚡ Energy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#fef3c7] border-2 border-[#422006] flex items-center justify-center text-[#422006] hover:bg-amber-200 active:translate-y-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Energy Meter & Live Countdown */}
        <div className="rounded-2xl bg-[#fffdf5] border-[2.5px] border-[#78350f] p-3.5 mb-3 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#92400e]">
              Current Stamina
            </span>
            <span className="font-display font-black text-2xl text-[#422006] flex items-center gap-1">
              ⚡ {energy}
              <span className="text-sm text-[#92400e]">/{MAX_ENERGY}</span>
            </span>
          </div>

          <div className="h-4 w-full rounded-full bg-[#451a03] border-2 border-[#422006] p-0.5 overflow-hidden mb-2.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-lime-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (energy / MAX_ENERGY) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold bg-[#fef3c7] rounded-xl px-3 py-2 border border-[#d97706]/40">
            <span className="flex items-center gap-1.5 text-[#78350f]">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              {isFull ? 'Stamina Full!' : 'Next +1 ⚡ Energy in:'}
            </span>
            <span className="font-display font-black text-sm text-[#b45309]">
              {isFull ? 'MAX (30/30)' : `${mm}:${ss}`}
            </span>
          </div>
          <p className="text-[10px] font-bold text-center text-[#92400e] mt-1.5">
            Automatically recharges +1 ⚡ every 12 minutes (even offline)
          </p>
        </div>

        {feedback && (
          <div className="mb-3 rounded-xl bg-emerald-100 border-2 border-emerald-700 px-3 py-1.5 text-center text-xs font-black text-emerald-900 animate-bounce">
            {feedback}
          </div>
        )}

        {/* Recharge Options */}
        <div className="space-y-2.5">
          {/* Option 1: Watch Ad (+10 Energy) 1/day */}
          <button
            onClick={handleWatchAd}
            disabled={adUsedToday || isFull}
            className={`w-full rounded-2xl p-3 flex items-center justify-between transition-all ${
              adUsedToday || isFull
                ? 'bg-stone-200 border-2 border-stone-400 text-stone-500 opacity-70 cursor-not-allowed'
                : 'btn-3d-emerald text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-yellow-200" />
              </div>
              <div>
                <div className="font-display font-black text-sm text-outline-dark">
                  Watch Ad (+10 ⚡ Energy)
                </div>
                <div className="text-[10px] font-bold opacity-90">
                  {adUsedToday
                    ? 'Claimed Today (1/1)'
                    : isVip
                    ? 'VIP Instant Claim • (1/day)'
                    : 'Free Daily Stamina Boost • (1/day)'}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-black/25 font-display font-black text-xs">
              {adUsedToday ? 'DONE' : 'FREE'}
            </span>
          </button>

          {/* Option 2: Spend 50 Gems (+30 Energy) */}
          <button
            onClick={handleSpendGems}
            disabled={gems < 50}
            className={`w-full rounded-2xl p-3 flex items-center justify-between transition-all ${
              gems < 50
                ? 'bg-stone-200 border-2 border-stone-400 text-stone-500 opacity-70 cursor-not-allowed'
                : 'btn-3d-amber text-[#422006]'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-950/15 border border-amber-900/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <div className="font-display font-black text-sm">
                  Full Refill (+30 ⚡ Energy)
                </div>
                <div className="text-[10px] font-bold text-[#78350f]">
                  Instant Stamina Surge (Can overflow cap!)
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-[#422006] text-amber-200 font-display font-black text-xs flex items-center gap-1">
              <GemIllustration className="w-3.5 h-3.5" />
              50
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
