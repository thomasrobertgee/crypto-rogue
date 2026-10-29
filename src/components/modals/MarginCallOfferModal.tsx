import { useEffect, useState } from 'react'
import { Flame, Clock, Gem, Key, Cpu, Sparkles, X, Ghost } from 'lucide-react'
import { AudioSynth } from '../../engine/AudioSynth'
import { useMetaStore } from '../../state/useMetaStore'

interface MarginCallOfferModalProps {
  expiresAt: number
  onClose: () => void
  onPurchased?: () => void
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function MarginCallOfferModal({
  expiresAt,
  onClose,
  onPurchased,
}: MarginCallOfferModalProps) {
  const meta = useMetaStore()
  const [now, setNow] = useState(() => Date.now())
  const [purchased, setPurchased] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remainingMs = Math.max(0, expiresAt - now)

  const handleBuyBailoutBundle = () => {
    AudioSynth.unlock()
    if (meta.purchaseBundle('whale_bailout_bundle')) {
      AudioSynth.playMythicalDrop()
      setPurchased(true)
      window.setTimeout(() => {
        meta.dismissMarginCallOffer()
        onPurchased?.()
        onClose()
      }, 900)
    }
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-sm flex-col gap-3 overflow-hidden rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-5 text-center text-[#2C1810] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] text-[#2C1810] hover:bg-[#fde68a]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top 1200% Value & 2-Hour Countdown Pill */}
        <div className="mx-auto flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full border border-[#9f1239] bg-[#e11d48] px-2.5 py-0.5 font-display text-[10px] font-extrabold tracking-wider text-white shadow-xs">
            <Flame className="h-3 w-3" /> 1200% VALUE!
          </span>
          <span className="flex items-center gap-1 rounded-full border border-[#d97706] bg-[#FEF3C7] px-2.5 py-0.5 font-display text-[10px] font-black text-[#92400e]">
            <Clock className="h-3 w-3" /> {formatCountdown(remainingMs)}
          </span>
        </div>

        <div>
          <div className="font-display text-[10px] font-black uppercase tracking-widest text-[#b45309]">
            CONTEXTUAL BOSS LIQUIDATION FLASH OFFER
          </div>
          <h2 className="mt-0.5 font-display text-xl font-extrabold text-[#2C1810]">
            WHALE BAILOUT BUNDLE
          </h2>
          <p className="mt-1 text-xs font-semibold text-[#6E5A4F]">
            Crushed by the Boss? Inject emergency institutional liquidity and crush the next run!
          </p>
        </div>

        {/* Bundle Contents Grid */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3 text-left">
          <div className="col-span-2 flex items-center gap-2.5 rounded-xl border border-[#c084fc] bg-[#FAF5FF] p-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#c084fc] bg-[#F3E8FF] text-[#7e22ce]">
              <Ghost className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-xs font-extrabold text-[#2C1810]">
                1x Epic MoneroGhost
              </div>
              <div className="text-[10px] font-semibold text-[#6E5A4F]">
                Dark Pool: Red candles deal 50% Short DMG to Bosses!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
            <Gem className="h-4 w-4 text-[#d97706]" />
            <div>
              <div className="text-[8px] font-bold uppercase text-[#6E5A4F]">Satoshi Gems</div>
              <div className="font-display text-xs font-black text-[#b45309]">+1,500 Gems</div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
            <Cpu className="h-4 w-4 text-[#0284c7]" />
            <div>
              <div className="text-[8px] font-bold uppercase text-[#6E5A4F]">Instant Upgrade</div>
              <div className="font-display text-xs font-black text-[#0284c7]">+10,000 H/s</div>
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-[#c084fc] bg-[#FAF5FF] py-1.5 font-display text-xs font-extrabold text-[#7e22ce]">
            <Key className="h-3.5 w-3.5" /> +3 Quantum Keys &amp; +5 Silver Keys
          </div>
        </div>

        <button
          type="button"
          disabled={purchased}
          onClick={handleBuyBailoutBundle}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-sm font-black tracking-wider text-[#2C1810] btn-3d-amber active:translate-y-0.5"
        >
          <Sparkles className="h-4 w-4" />
          {purchased ? 'CREDITED TO PORTFOLIO!' : 'INSTANT BAILOUT — $4.99 (SIMULATED)'}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="font-display text-[11px] font-bold text-[#6E5A4F] hover:text-[#2C1810]"
        >
          No thanks, I enjoy getting liquidated
        </button>
      </div>
    </div>
  )
}
