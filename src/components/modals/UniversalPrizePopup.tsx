import React, { useEffect } from 'react'
import { Sparkles } from 'lucide-react'

export interface UniversalPrizePopupProps {
  isOpen: boolean
  icon?: React.ReactNode | string
  title?: string
  rewardName: string
  rewardQuantity?: string | number
  sublabel?: string
  isJackpot?: boolean
  onClose: () => void
}

export const UniversalPrizePopup: React.FC<UniversalPrizePopupProps> = ({
  isOpen,
  icon,
  title = 'PRIZE WON!',
  rewardName,
  rewardQuantity,
  sublabel,
  isJackpot = false,
  onClose,
}) => {
  // Automatically dismiss after exactly 1.0 second (1000ms)
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      onClose()
    }, 1000)
    return () => clearTimeout(timer)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex w-full max-w-[320px] flex-col items-center justify-center rounded-3xl border-4 p-5 text-center shadow-[0_0_50px_rgba(245,158,11,0.6)] animate-in zoom-in-75 duration-200 ${
          isJackpot
            ? 'border-[#fde047] border-b-[8px] bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] text-[#451a03]'
            : 'border-[#fbbf24] border-b-[7px] bg-gradient-to-b from-[#FFFDF9] via-[#FEF3C7] to-[#FDE68A] text-[#2C1810]'
        }`}
      >
        {/* Glowing Aura Ring */}
        <div className="absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 opacity-75 blur-md animate-pulse" />

        {/* Title Tag */}
        <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#78350f] bg-[#78350f] px-3 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-[#fef08a] shadow-sm">
          <Sparkles className="h-3 w-3 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
          <span>{title}</span>
          <Sparkles className="h-3 w-3 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        {/* Reward Big Icon */}
        <div className="my-2.5 flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-[#78350f] bg-white/95 text-4xl shadow-md">
          {typeof icon === 'string' ? (
            <span className="scale-125 animate-bounce">{icon}</span>
          ) : (
            icon ?? <span className="scale-125">🎁</span>
          )}
        </div>

        {/* Reward Value & Name */}
        <div className="flex flex-col items-center">
          {rewardQuantity && (
            <div className="font-display text-2xl font-black text-[#b45309] drop-shadow-sm">
              {typeof rewardQuantity === 'number' && rewardQuantity > 0 ? `+${rewardQuantity}` : rewardQuantity}
            </div>
          )}
          <div className="font-display text-base font-black leading-tight text-[#2C1810]">
            {rewardName}
          </div>
          {sublabel && (
            <div className="mt-1 text-[11px] font-bold text-[#6E5A4F]">
              {sublabel}
            </div>
          )}
        </div>

        {/* 1s Auto-dismiss pill indicator */}
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 text-[9px] font-bold text-[#78350f]">
          <span>Tap or auto-closing...</span>
        </div>
      </div>
    </div>
  )
}
