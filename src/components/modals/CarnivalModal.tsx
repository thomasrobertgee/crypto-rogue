import { useState } from 'react'
import { X, PartyPopper, CheckCircle2, Sparkles } from 'lucide-react'
import { COIN_MAP } from '../../config/coins.config'
import { AudioSynth } from '../../engine/AudioSynth'
import { useMetaStore } from '../../state/useMetaStore'
import { DynamicIcon } from '../DynamicIcon'
import { CoinMascotSvg } from '../GameArtwork'

interface CarnivalModalProps {
  onClose: () => void
}

interface CarnivalDaySpec {
  day: number
  title: string
  mission: string
  rewardLabel: string
  rewardSub: string
  isCompleted: (s: ReturnType<typeof useMetaStore.getState>) => boolean
}

const CARNIVAL_SCHEDULE: CarnivalDaySpec[] = [
  {
    day: 1,
    title: 'Day 1: Genesis Onboarding',
    mission: 'Log in & enter the Crypto Rogue Exchange',
    rewardLabel: '+150 Satoshi Gems',
    rewardSub: 'Instant seed grant for new traders',
    isCompleted: () => true,
  },
  {
    day: 2,
    title: 'Day 2: First Market Liquidity',
    mission: 'Clear Stage 1 or Claim the Idle Mining Rig',
    rewardLabel: '+3 Silver Vault Keys',
    rewardSub: 'Open 3 Faucet Treasure Chests',
    isCompleted: (s) => s.highestStageCleared >= 1 || (s.dailyMetrics.rigClaims ?? 0) >= 1,
  },
  {
    day: 3,
    title: 'Day 3: Hype Train Trio',
    mission: 'Open at least 1 Gacha Vault Chest',
    rewardLabel: '3x ShibaMoon (Uncommon)',
    rewardSub: 'Ready for an immediate 3-to-1 Hard Fork!',
    isCompleted: (s) => (s.dailyMetrics.gachaPulls ?? 0) >= 1 || s.ownedCoins.length >= 2,
  },
  {
    day: 4,
    title: 'Day 4: ASIC Overclock',
    mission: 'Level up any Coin in your Portfolio',
    rewardLabel: '+2,000 Hashrate',
    rewardSub: 'Supercharge your Account Mastery yield',
    isCompleted: (s) => s.ownedCoins.some((c) => c.level > 1),
  },
  {
    day: 5,
    title: 'Day 5: High-Frequency Trader',
    mission: 'Reach Stage 2 or own 3+ Crypto Coins',
    rewardLabel: '1x SolanaBolt (Rare)',
    rewardSub: '0.8s ultra-fast attack tick speed',
    isCompleted: (s) => s.currentStage >= 2 || s.ownedCoins.length >= 3,
  },
  {
    day: 6,
    title: 'Day 6: Dark Pool Access',
    mission: 'Perform a Hard Fork Fusion or Reach Stage 3',
    rewardLabel: '1x MoneroGhost (Epic) + 2 Q-Keys',
    rewardSub: 'Deals 50% of Red losses as Short Damage',
    isCompleted: (s) => (s.dailyMetrics.fusions ?? 0) >= 1 || s.currentStage >= 3,
  },
  {
    day: 7,
    title: 'Day 7: Block Zero Finale',
    mission: 'Claim any 3 Carnival Days (or Clear Stage 3) to unlock Block Zero',
    rewardLabel: 'MYTHICAL SatoshiGenesis + 300 Gems',
    rewardSub: 'S-Grade Mythical: Cannot roll Down · Halving Cycle doubles Up mult every 4 ticks!',
    isCompleted: (s) => s.claimedCarnivalDays.length >= 3 || s.highestStageCleared >= 3,
  },
]

export function CarnivalModal({ onClose }: CarnivalModalProps) {
  const meta = useMetaStore()
  const [selectedDay, setSelectedDay] = useState<number>(1)

  const currentSpec =
    CARNIVAL_SCHEDULE.find((d) => d.day === selectedDay) ?? CARNIVAL_SCHEDULE[0]
  const isClaimed = meta.claimedCarnivalDays.includes(currentSpec.day)
  const missionDone = currentSpec.isCompleted(meta)
  const satoshiCfg = COIN_MAP['satoshigenesis']

  const handleClaim = (day: number) => {
    AudioSynth.unlock()
    if (meta.claimCarnivalDay(day)) {
      if (day === 7) AudioSynth.playMythicalDrop()
      else AudioSynth.playChestOpen()
    }
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92%] w-full max-w-sm flex-col gap-3 overflow-y-auto rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-[#2C1810] shadow">
              <PartyPopper className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-[10px] font-black uppercase tracking-wider text-[#b45309]">
                NEW TRADER ONBOARDING EVENT
              </span>
              <h3 className="font-display text-base font-extrabold text-[#2C1810]">
                7-DAY CARNIVAL
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] text-[#2C1810] hover:bg-[#fde68a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Grand Prize Banner: Free Mythical SatoshiGenesis on Day 7 */}
        <div className="relative flex items-center justify-between gap-2.5 overflow-hidden rounded-2xl border-2 border-[#3E2723] border-b-4 bg-gradient-to-br from-[#991b1b] via-[#581c87] to-[#854d0e] p-3 shadow-lg">
          <div className="flex items-center gap-3">
            {satoshiCfg && <CoinMascotSvg coin={satoshiCfg} size={52} />}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-[#fde047] px-2 py-0.5 font-display text-[9px] font-extrabold text-[#291802]">
                  DAY 7 GRAND PRIZE
                </span>
                <span className="font-display text-[10px] font-extrabold text-[#fde047]">
                  MYTHICAL
                </span>
              </div>
              <div className="mt-0.5 font-display text-sm font-extrabold text-white drop-shadow">
                Free {satoshiCfg?.name ?? 'SatoshiGenesis'}
              </div>
              <p className="text-[10px] font-semibold text-white/90">
                Cannot roll Down · Halving Cycle doubles Up multiplier every 4 ticks!
              </p>
            </div>
          </div>
        </div>

        {/* Day 1 through Day 7 Tabs */}
        <div className="grid grid-cols-7 gap-1">
          {CARNIVAL_SCHEDULE.map((d) => {
            const claimed = meta.claimedCarnivalDays.includes(d.day)
            const active = selectedDay === d.day
            const isDay7 = d.day === 7

            return (
              <button
                key={d.day}
                type="button"
                onClick={() => setSelectedDay(d.day)}
                className={`relative flex flex-col items-center justify-center rounded-xl py-2 font-display text-xs font-extrabold transition ${
                  active
                    ? 'btn-3d-gold text-[#2C1810] active:border-b-0 active:translate-y-0.5'
                    : claimed
                      ? 'border border-[#86efac] bg-[#dcfce7] text-[#166534]'
                      : 'border border-[#E2D5C1] bg-[#F3E9D8] text-[#2C1810]'
                }`}
              >
                <span>D{d.day}</span>
                {claimed ? (
                  <CheckCircle2 className="mt-0.5 h-3 w-3 text-[#16a34a]" />
                ) : (
                  <Sparkles
                    className={`mt-0.5 h-3 w-3 ${
                      isDay7 ? 'text-[#e11d48]' : 'text-[#d97706]'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Selected Day Milestone Detail Card */}
        <div className="flex flex-col gap-2.5 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3.5">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-extrabold text-[#2C1810]">
              {currentSpec.title}
            </h4>
            <span
              className={`rounded-full px-2 py-0.5 font-display text-[9px] font-extrabold uppercase ${
                isClaimed
                  ? 'border border-[#86efac] bg-[#dcfce7] text-[#166534]'
                  : missionDone
                    ? 'border border-[#f59e0b] bg-[#fef3c7] text-[#92400e]'
                    : 'border border-[#E2D5C1] bg-[#FFFDF9] text-[#6E5A4F]'
              }`}
            >
              {isClaimed ? 'CLAIMED' : missionDone ? 'READY TO CLAIM' : 'IN PROGRESS'}
            </span>
          </div>

          <div className="rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2.5">
            <div className="text-[10px] font-extrabold uppercase text-[#6E5A4F]">
              Milestone Challenge
            </div>
            <div className="mt-0.5 text-xs font-extrabold text-[#2C1810]">
              {currentSpec.mission}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#f59e0b] bg-[#FEF3C7] p-2.5">
            <div className="flex items-center gap-2.5">
              <DynamicIcon
                name={currentSpec.day === 7 ? 'Crown' : 'Gift'}
                className="h-5 w-5 text-[#d97706]"
              />
              <div>
                <div className="font-display text-xs font-extrabold text-[#92400e]">
                  {currentSpec.rewardLabel}
                </div>
                <div className="text-[10px] font-semibold text-[#6E5A4F]">{currentSpec.rewardSub}</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isClaimed}
            onClick={() => handleClaim(currentSpec.day)}
            className={`w-full rounded-2xl py-3 font-display text-xs font-black tracking-wider ${
              isClaimed
                ? 'cursor-not-allowed border border-[#86efac] bg-[#dcfce7] text-[#166534]'
                : currentSpec.day === 7
                  ? 'btn-3d-gold text-[#2C1810] active:border-b-0 active:translate-y-1'
                  : 'btn-3d-green text-white game-text-outline-sm active:border-b-0 active:translate-y-1'
            }`}
          >
            {isClaimed
              ? 'REWARD CLAIMED'
              : currentSpec.day === 7
                ? 'CLAIM MYTHICAL SATOSHIGENESIS!'
                : `CLAIM DAY ${currentSpec.day} REWARD`}
          </button>
        </div>
      </div>
    </div>
  )
}
