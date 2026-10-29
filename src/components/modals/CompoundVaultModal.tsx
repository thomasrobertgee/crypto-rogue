import { useState } from 'react'
import { X, Key, ArrowRight } from 'lucide-react'
import { AudioSynth } from '../../engine/AudioSynth'
import { useMetaStore } from '../../state/useMetaStore'
import { COMPOUND_VAULT_TIERS } from '../../config/monetizationLiveOps.config'

interface CompoundVaultModalProps {
  onClose: () => void
}

export function CompoundVaultModal({ onClose }: CompoundVaultModalProps) {
  const meta = useMetaStore()
  const currentTierIndex = Math.min(2, Math.max(0, (meta.compoundVaultTier ?? 1) - 1))
  const currentTierCfg = COMPOUND_VAULT_TIERS[currentTierIndex]
  const currentGems = meta.compoundVaultGems ?? 0
  const isFull = currentGems >= currentTierCfg.capacityGems
  const [smashed, setSmashed] = useState(false)

  const handleSmash = () => {
    AudioSynth.unlock()
    const result = meta.smashCompoundVault()
    if (result) {
      AudioSynth.playMythicalDrop()
      setSmashed(true)
      window.setTimeout(() => {
        onClose()
      }, 1200)
    }
  }

  const fillPct = Math.min(100, Math.round((currentGems / currentTierCfg.capacityGems) * 100))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border-4 border-amber-500 bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#0c0a09] p-5 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-stone-600 bg-stone-800 text-stone-300 transition hover:bg-stone-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/60 bg-amber-950/80 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300 shadow">
            <span>{currentTierCfg.badge}</span>
          </div>
          <div className="my-2 text-5xl animate-bounce">{currentTierCfg.icon}</div>
          <h3 className="font-display text-xl font-black text-amber-300">
            {currentTierCfg.name}
          </h3>
          <p className="text-[11px] font-semibold text-stone-300">
            Earns 10% rebate Gems automatically from all spent Energy across runs & raids!
          </p>
        </div>

        {/* Progress Bar & Capacity */}
        <div className="my-4 rounded-2xl border border-amber-500/30 bg-stone-900/90 p-3">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-amber-200">Rebate Balance</span>
            <span className="text-amber-300">
              {currentGems} / {currentTierCfg.capacityGems} 💎 ({fillPct}%)
            </span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-stone-700 bg-stone-950">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-500"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          {currentTierCfg.bonusKeys && (
            <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-bold text-purple-300">
              <Key className="h-3.5 w-3.5" />
              <span>Includes +{currentTierCfg.bonusKeys} Quantum Keys Bonus!</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={!isFull || smashed}
          onClick={handleSmash}
          className={`w-full rounded-2xl py-3.5 font-display text-sm font-black uppercase tracking-wider text-white shadow-xl transition-all active:scale-95 ${
            smashed
              ? 'bg-emerald-600'
              : !isFull
                ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 shadow-amber-900/50'
          }`}
        >
          {smashed
            ? 'SMASHED & CLAIMED!'
            : isFull
              ? `SMASH OPEN (${currentTierCfg.priceLabel})`
              : `COLLECTING REBATES (${fillPct}%)`}
        </button>

        {/* Tier Up Preview */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold text-stone-400">
          <span>Tier {currentTierCfg.tier} of 3</span>
          {currentTierCfg.tier < 3 && (
            <>
              <ArrowRight className="h-3 w-3" />
              <span className="text-amber-400">Next: {COMPOUND_VAULT_TIERS[currentTierIndex + 1].name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
