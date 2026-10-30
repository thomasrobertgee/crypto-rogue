import { Trophy, Flame } from 'lucide-react'
import { HashrateIcon, SatoshiGemIcon } from '../GameArtwork'

export interface TutorialVictoryModalProps {
  hashrateReward?: number
  gemReward?: number
  onContinue: () => void
}

export function TutorialVictoryModal({
  hashrateReward = 500,
  gemReward = 100,
  onContinue,
}: TutorialVictoryModalProps) {
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/65 p-5 backdrop-blur-[2px] select-none">
      <div
        className="w-full max-w-[340px] rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-5 text-center text-[#2C1810] shadow-2xl"
        style={{ animation: 'stampIn 0.5s cubic-bezier(0.3, 1.4, 0.6, 1) forwards' }}
      >
        {/* Trophy Plaque */}
        <div className="mx-auto -mt-12 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] shadow-lg animate-bounce">
          <Trophy className="h-8 w-8 text-[#2C1810]" />
        </div>
        <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-wide text-[#15803d]">
          TUTORIAL CLEAR!
        </h2>
        <p className="mt-0.5 font-display text-xs font-extrabold text-[#6E5A4F]">
          Street Scammer liquidated. First blood to Satoshi!
        </p>

        {/* Polished Reward Cards with subtle background gradients */}
        <div className="mt-3.5 flex items-stretch justify-center gap-2.5">
          {/* Hashrate Card */}
          <div className="flex flex-1 flex-col items-center rounded-2xl border-2 border-sky-400/40 bg-gradient-to-b from-sky-500/10 to-blue-600/20 px-2.5 py-2.5 shadow-sm">
            <HashrateIcon size={28} />
            <span className="mt-1 font-display text-lg font-black text-[#0369a1]">+{hashrateReward}</span>
            <span className="font-display text-[10px] font-black uppercase text-[#0284c7]">Hashrate</span>
          </div>

          {/* Gems Card */}
          <div className="flex flex-1 flex-col items-center rounded-2xl border-2 border-amber-400/40 bg-gradient-to-b from-amber-500/10 to-yellow-600/20 px-2.5 py-2.5 shadow-sm">
            <SatoshiGemIcon size={28} />
            <span className="mt-1 font-display text-lg font-black text-[#b45309]">+{gemReward}</span>
            <span className="font-display text-[10px] font-black uppercase text-[#d97706]">Gems</span>
          </div>
        </div>

        {/* Bumped Subtitle */}
        <p className="mt-3 flex items-center justify-center gap-1.5 font-display text-sm font-semibold text-amber-800">
          <Flame className="h-4 w-4 text-[#e11d48] animate-pulse" />
          <span>Enough to upgrade your Hero &amp; BitCrumb!</span>
        </p>

        {/* Enlarge the CONTINUE button to h-[52px] with bold glossy green press effect */}
        <button
          type="button"
          onClick={onContinue}
          className="btn-3d-green mt-4 flex h-[52px] w-full items-center justify-center rounded-2xl font-display text-base font-black uppercase tracking-wider shadow-lg active:scale-95 transition-transform hover:brightness-105"
        >
          CONTINUE
        </button>
      </div>
    </div>
  )
}

export default TutorialVictoryModal
