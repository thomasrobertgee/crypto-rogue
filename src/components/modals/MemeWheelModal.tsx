import { useState, useRef } from 'react'
import { X, Gift, Check, Clock, PlusCircle } from 'lucide-react'
import { useMetaStore } from '../../state/useMetaStore'
import {
  MEME_WHEEL_SLICES,
  WHEEL_MILESTONES,
  WHEEL_TOP_UPS,
  type WheelSlice,
} from '../../config/memeWheel.config'
import { AudioSynth } from '../../engine/AudioSynth'
import { UniversalPrizePopup } from './UniversalPrizePopup'

interface MemeWheelModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MemeWheelModal({ isOpen, onClose }: MemeWheelModalProps) {
  const meta = useMetaStore()
  const [spinning, setSpinning] = useState(false)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [rewardToast, setRewardToast] = useState<string | null>(null)
  const [prizePopup, setPrizePopup] = useState<WheelSlice | null>(null)
  const [showTopUpModal, setShowTopUpModal] = useState(false)

  const currentRotationRef = useRef(0)

  if (!isOpen) return null

  const today = new Date().toISOString().slice(0, 10)
  const hasFreeDailySpin = meta.lastWheelFreeSpinDate !== today
  const spinTokens = meta.spinTokens ?? 0
  const canSpin = !spinning && (hasFreeDailySpin || spinTokens > 0)
  const totalSpins = meta.totalMemeSpins ?? 0

  const handleSpin = () => {
    if (!canSpin) return
    AudioSynth.unlock()
    setSpinning(true)
    setPrizePopup(null)

    // Call store spin to determine winner deterministically
    const result = meta.spinMemeWheel()
    if (!result) {
      setSpinning(false)
      return
    }

    const { slice } = result

    // Calculate rotation angle
    // 8 slices => 45 degrees per slice (360 / 8)
    const sliceIndex = MEME_WHEEL_SLICES.findIndex((s) => s.id === slice.id)
    const sliceAngle = 360 / MEME_WHEEL_SLICES.length
    // Target angle brings the slice center to 0 deg (top pointer)
    const targetSliceCenter = sliceIndex * sliceAngle + sliceAngle / 2
    // Minimum 5 full rotations (1800 deg) + offset
    const extraSpins = 360 * 5
    const nextRotation = currentRotationRef.current + extraSpins + (360 - (currentRotationRef.current % 360)) - targetSliceCenter

    currentRotationRef.current = nextRotation
    setWheelRotation(nextRotation)

    // Spin sound effect
    AudioSynth.playCoinInject()

    // Wait for 3.5s deceleration animation to finish, then display 1-second Universal Prize Popup!
    window.setTimeout(() => {
      setSpinning(false)
      if (slice.isJackpot) {
        AudioSynth.playGreenCandle()
      } else {
        AudioSynth.playCoinInject()
      }
      // Show Universal 1-Second Auto-Dismiss Prize Popup
      setPrizePopup(slice)
    }, 3600)
  }

  const handleClaimMilestone = (spinsRequired: number) => {
    AudioSynth.unlock()
    const success = meta.claimWheelMilestone(spinsRequired)
    if (success) {
      AudioSynth.playGreenCandle()
      setRewardToast(`Milestone (${spinsRequired} Spins) Claimed!`)
      window.setTimeout(() => setRewardToast(null), 2500)
    }
  }

  const handleTopUp = (packId: string, tokens: number) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    meta.buySpinTokens(packId)
    setRewardToast(`+${tokens} Spin Tokens Added!`)
    window.setTimeout(() => setRewardToast(null), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative flex max-h-[96vh] w-full max-w-[400px] flex-col overflow-hidden rounded-3xl border-4 border-[#3E2723] bg-[#FDFBF7] shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#9333ea] via-[#ec4899] to-[#f43f5e] px-3.5 py-2.5 text-white shadow-md shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-spin" style={{ animationDuration: '6s' }}>
                🎡
              </span>
              <div>
                <h2 className="font-display text-sm font-black tracking-wide text-[#fde047] game-text-outline-sm leading-tight">
                  MEME-COIN FRENZY WHEEL
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/90">
                  <Clock className="h-3 w-3" />
                  <span>Weekend Event: 38h 12m Left</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={spinning}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tokens status pill */}
          <div className="mt-2 flex items-center justify-between rounded-xl bg-black/25 px-2.5 py-1 text-xs font-display font-black">
            <div className="flex items-center gap-1.5 text-[#fde047]">
              <span>🎟️ TOKENS: {spinTokens}</span>
              {hasFreeDailySpin && (
                <span className="rounded-full bg-emerald-500 px-2 py-0.2 text-[9px] text-white animate-pulse">
                  FREE DAILY SPIN READY!
                </span>
              )}
            </div>
            <span className="text-white/80 text-[10px]">Spins: {totalSpins}</span>
          </div>

          {/* Toast Notice */}
          {rewardToast && (
            <div className="absolute top-2 inset-x-8 z-50 rounded-full border-2 border-[#fde047] bg-[#78350f] px-3 py-1 text-center font-display text-[11px] font-black text-[#fde047] shadow-xl animate-bounce">
              {rewardToast}
            </div>
          )}
        </div>

        {/* Locked Screen Layout (ZERO Vertical Scroll) */}
        <div className="flex flex-1 flex-col justify-between p-2.5 overflow-hidden">
          {/* Wheel Frame Container */}
          <div className="relative mx-auto flex h-[245px] w-[245px] shrink-0 items-center justify-center my-0.5">
            {/* Outer Gilded Wheel Frame */}
            <div className="absolute inset-0 rounded-full border-4 border-[#78350F] bg-gradient-to-b from-[#fde047] to-[#d97706] shadow-xl p-1.5">
              <div className="h-full w-full rounded-full border-2 border-[#78350F] overflow-hidden bg-slate-900 relative">
                {/* Rotating SVG Wheel */}
                <div
                  className="h-full w-full"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: spinning ? 'transform 3.5s cubic-bezier(0.12, 0.8, 0.2, 1)' : 'none',
                  }}
                >
                  <svg viewBox="0 0 200 200" className="h-full w-full">
                    {MEME_WHEEL_SLICES.map((slice, i) => {
                      const angle = 360 / MEME_WHEEL_SLICES.length
                      const startAngle = (i * angle - 90) * (Math.PI / 180)
                      const endAngle = ((i + 1) * angle - 90) * (Math.PI / 180)
                      const x1 = 100 + 100 * Math.cos(startAngle)
                      const y1 = 100 + 100 * Math.sin(startAngle)
                      const x2 = 100 + 100 * Math.cos(endAngle)
                      const y2 = 100 + 100 * Math.sin(endAngle)
                      const path = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`

                      const midAngle = (i * angle + angle / 2 - 90) * (Math.PI / 180)
                      const textX = 100 + 64 * Math.cos(midAngle)
                      const textY = 100 + 64 * Math.sin(midAngle)
                      const textRot = i * angle + angle / 2

                      return (
                        <g key={slice.id}>
                          <path
                            d={path}
                            fill={slice.color}
                            stroke="#3E2723"
                            strokeWidth="1.5"
                            className={slice.isJackpot ? 'animate-pulse' : ''}
                          />
                          <g transform={`rotate(${textRot}, ${textX}, ${textY})`}>
                            <text
                              x={textX}
                              y={textY - 3}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="900"
                              fill="#ffffff"
                              fontFamily="Inter, sans-serif"
                            >
                              {slice.icon}
                            </text>
                            <text
                              x={textX}
                              y={textY + 8}
                              textAnchor="middle"
                              fontSize="6.5"
                              fontWeight="900"
                              fill="#ffffff"
                              fontFamily="Inter, sans-serif"
                            >
                              {slice.label}
                            </text>
                          </g>
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Top Indicator Arrow / Peg */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
              <div className="h-5 w-4.5 bg-gradient-to-b from-[#e11d48] to-[#9f1239] border border-[#3E2723] rounded-t-sm shadow-md [clip-path:polygon(0%_0%,100%_0%,50%_100%)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#fde047] border border-[#3E2723] -mt-1" />
            </div>

            {/* Center Spin Hub Button */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={!canSpin}
              className={`absolute z-20 flex h-14 w-14 flex-col items-center justify-center rounded-full border-4 border-[#3E2723] shadow-2xl transition-transform active:scale-90 ${
                canSpin
                  ? 'bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] text-[#451a03] animate-pulse cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-80'
              }`}
            >
              <span className="font-display text-[11px] font-black tracking-wider leading-none">
                {spinning ? '...' : 'SPIN!'}
              </span>
              <span className="font-display text-[7px] font-black uppercase text-white/90 drop-shadow mt-0.5">
                {hasFreeDailySpin ? 'FREE' : '1 TOKEN'}
              </span>
            </button>
          </div>

          {/* Sub-Wheel Action Strip: [ ➕ Get Tokens ] Floating Pill Button */}
          <div className="flex items-center justify-between px-1 my-1">
            <span className="text-[10px] font-bold text-[#78350F]">
              🎲 100% Guaranteed Slice Payouts
            </span>
            <button
              type="button"
              onClick={() => setShowTopUpModal(true)}
              className="btn-3d-amber flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-[10px] font-black text-[#2C1810] shadow-sm active:translate-y-0.5 hover:brightness-105"
            >
              <PlusCircle className="h-3.5 w-3.5 text-[#b45309]" />
              <span>Get Tokens</span>
            </button>
          </div>

          {/* Cumulative Milestone Bar (Fits cleanly in modal bottom) */}
          <div className="rounded-2xl border-2 border-[#78350f]/30 bg-[#F3E9D8] p-2.5">
            <div className="flex items-center justify-between text-[10.5px] font-display font-black text-[#451a03]">
              <span className="flex items-center gap-1">
                <Gift className="h-3.5 w-3.5 text-[#b45309]" /> TOTAL SPINS MILESTONES
              </span>
              <span>{totalSpins} / 50 Spins</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-300 border border-[#78350f]/30">
              <div
                className="h-full bg-gradient-to-r from-[#eab308] via-[#f97316] to-[#ec4899] transition-all duration-300"
                style={{ width: `${Math.min(100, (totalSpins / 50) * 100)}%` }}
              />
            </div>

            {/* Milestones Compact Grid */}
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {WHEEL_MILESTONES.map((ms) => {
                const reached = totalSpins >= ms.spinsRequired
                const claimed = (meta.claimedWheelMilestones ?? []).includes(ms.spinsRequired)

                return (
                  <div
                    key={ms.spinsRequired}
                    className={`flex flex-col justify-between rounded-xl border p-1.5 text-[9px] font-display font-bold shadow-xs ${
                      ms.isMythical
                        ? 'col-span-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50'
                        : 'border-[#78350f]/20 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#78350F]">{ms.label}</span>
                      {claimed ? (
                        <span className="flex items-center gap-0.5 text-emerald-600 font-black text-[8px]">
                          <Check className="h-2.5 w-2.5" /> Claimed
                        </span>
                      ) : reached ? (
                        <button
                          type="button"
                          onClick={() => handleClaimMilestone(ms.spinsRequired)}
                          className="rounded bg-emerald-600 px-2 py-0.2 font-black text-[8px] text-white animate-pulse"
                        >
                          CLAIM
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[8px]">
                          {ms.spinsRequired - totalSpins} left
                        </span>
                      )}
                    </div>
                    <div className="text-[8px] text-[#2C1810] line-clamp-1 opacity-90">
                      {ms.rewardDescription}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── TOKEN TOP-UP POPUP MODAL (Opens via [ ➕ Get Tokens ]) ── */}
        {showTopUpModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-[340px] rounded-3xl border-4 border-[#3E2723] border-b-[7px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2D5C1]">
                <div className="flex items-center gap-1.5 font-display text-sm font-black text-[#78350F]">
                  <span>🎟️</span>
                  <span>GET SPIN TOKENS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-col gap-2.5">
                {WHEEL_TOP_UPS.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => {
                      handleTopUp(pack.id, pack.tokens)
                      setShowTopUpModal(false)
                    }}
                    className="flex items-center justify-between rounded-2xl border-2 border-[#b45309] border-b-4 bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fde68a] p-3 text-left shadow active:translate-y-0.5 hover:brightness-105"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f59e0b] text-xl shadow-xs">
                        🎟️
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-xs font-black text-[#78350f]">
                            +{pack.tokens} Spin Tokens
                          </span>
                          <span className="rounded bg-amber-600 px-1.5 py-0.2 text-[8px] font-black text-white">
                            {pack.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#6E5A4F] font-bold">Instant Event Delivery</div>
                      </div>
                    </div>
                    <span className="font-display text-xs font-black text-emerald-700 bg-white/80 px-2.5 py-1 rounded-xl border border-emerald-600/30">
                      {pack.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── UNIVERSAL 1-SECOND AUTO-DISMISS PRIZE NOTIFICATION POPUP ── */}
        <UniversalPrizePopup
          isOpen={!!prizePopup}
          icon={prizePopup?.icon}
          title={prizePopup?.isJackpot ? '🌟 JACKPOT PRIZE!' : '🎡 MEME WHEEL PRIZE!'}
          rewardName={prizePopup?.label ?? ''}
          sublabel={prizePopup?.sublabel}
          isJackpot={prizePopup?.isJackpot}
          onClose={() => setPrizePopup(null)}
        />
      </div>
    </div>
  )
}
