import { useEffect, useState } from 'react'
import { Flame, Clock, X } from 'lucide-react'
import { AudioSynth } from '../../engine/AudioSynth'
import { useMetaStore } from '../../state/useMetaStore'

export interface WallBreakerOfferModalProps {
  type: 'stat_surge' | 'finish_contract'
  targetHeroId?: string
  onClose: () => void
  onPurchased?: () => void
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function WallBreakerOfferModal({
  type,
  targetHeroId = 'rookie_satoshi',
  onClose,
  onPurchased,
}: WallBreakerOfferModalProps) {
  const meta = useMetaStore()
  const expiresAt = meta.wallBreakerOfferExpiresAt ?? Date.now() + 60 * 60 * 1000
  const [now, setNow] = useState(() => Date.now())
  const [purchased, setPurchased] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remainingMs = Math.max(0, expiresAt - now)

  const handleBuy = () => {
    AudioSynth.unlock()
    const ok = meta.purchaseWallBreakerOffer(type, targetHeroId)
    if (ok) {
      AudioSynth.playMythicalDrop()
      setPurchased(true)
      window.setTimeout(() => {
        meta.dismissWallBreakerOffer()
        onPurchased?.()
        onClose()
      }, 900)
    }
  }

  const isStatSurge = type === 'stat_surge'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border-4 border-[#e11d48] bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#0c0a09] p-5 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Halo */}
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-30 blur-xl animate-pulse" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            AudioSynth.unlock()
            meta.dismissWallBreakerOffer()
            onClose()
          }}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-stone-600 bg-stone-800 text-stone-300 transition hover:bg-stone-700"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Ribbon */}
        <div className="relative text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/60 bg-red-950/80 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-300 shadow">
            <Flame className="h-3 w-3 text-red-400" />
            <span>{isStatSurge ? '800% STAT SURGE WALL-BREAKER' : 'FINISH THE CONTRACT'}</span>
          </div>

          <h3 className="mt-2 font-display text-xl font-black text-rose-300">
            {isStatSurge ? 'BREAK THE BOSS WALL!' : 'COMPLETE 50/50 SHARDS!'}
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold text-stone-300">
            {isStatSurge
              ? 'Wiped twice on the Stage Boss? Surge your stats and claim immediate victory.'
              : `You are only 10 shards away from unlocking ${targetHeroId.toUpperCase()}!`}
          </p>
        </div>

        {/* 60-Minute Countdown Bar */}
        <div className="my-3 flex items-center justify-center gap-1.5 rounded-xl border border-red-800/40 bg-red-950/40 py-1.5 text-xs font-black text-amber-300">
          <Clock className="h-4 w-4 animate-spin text-rose-400" />
          <span>OFFER EXPIRES IN: {formatCountdown(remainingMs)}</span>
        </div>

        {/* Offer Contents Grid */}
        <div className="space-y-2 rounded-2xl border border-stone-700/60 bg-stone-900/80 p-3">
          {isStatSurge ? (
            <>
              <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-950/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📐</span>
                  <div className="text-left">
                    <div className="font-display text-xs font-black text-amber-200">
                      +15 Furniture Blueprints
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Level up lowest Margin HP furniture
                    </div>
                  </div>
                </div>
                <span className="font-display text-xs font-black text-amber-300">+HP</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-950/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <div className="text-left">
                    <div className="font-display text-xs font-black text-cyan-200">
                      +5,000 Hashrate
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Immediate power upgrade surge
                    </div>
                  </div>
                </div>
                <span className="font-display text-xs font-black text-cyan-300">INSTANT</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💎</span>
                  <div className="text-left">
                    <div className="font-display text-xs font-black text-emerald-200">
                      +300 Satoshi Gems + 1 Boss Revive
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Bypass next boss liquidation
                    </div>
                  </div>
                </div>
                <span className="font-display text-xs font-black text-emerald-300">REVIVE</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-950/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧩</span>
                  <div className="text-left">
                    <div className="font-display text-xs font-black text-amber-200">
                      +10 {targetHeroId.toUpperCase()} Shards
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Instantly completes 50/50 requirement!
                    </div>
                  </div>
                </div>
                <span className="font-display text-xs font-black text-amber-300">UNLOCK</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-950/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💎</span>
                  <div className="text-left">
                    <div className="font-display text-xs font-black text-purple-200">
                      +500 Satoshi Gems
                    </div>
                    <div className="text-[10px] text-stone-400">Bonus contractor bonus</div>
                  </div>
                </div>
                <span className="font-display text-xs font-black text-purple-300">+500</span>
              </div>
            </>
          )}
        </div>

        {/* Purchase Button */}
        <div className="mt-4">
          <button
            type="button"
            disabled={purchased || remainingMs <= 0}
            onClick={handleBuy}
            className={`w-full rounded-2xl py-3.5 font-display text-sm font-black uppercase tracking-wider text-white shadow-xl transition-all active:scale-95 ${
              purchased
                ? 'bg-emerald-600'
                : remainingMs <= 0
                  ? 'bg-stone-700 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 shadow-red-900/50'
            }`}
          >
            {purchased
              ? 'PURCHASED & APPLIED!'
              : remainingMs <= 0
                ? 'OFFER EXPIRED'
                : isStatSurge
                  ? 'CLAIM WALL-BREAKER - $1.99'
                  : 'FINISH CONTRACT - $2.99'}
          </button>
        </div>
      </div>
    </div>
  )
}
