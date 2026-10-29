import { useState } from 'react'
import {
  Check,
  Flame,
  Lock,
  Play,
  Sparkles,
  X,
} from 'lucide-react'
import {
  FORTUNA_TRIAL_STAGES,
  GALA_100_PULL_MILESTONES,
  GALA_WHEEL_SLICES,
  PLINKO_BUCKETS,
  type FortunaTrialStage,
  type GalaWheelSlice,
} from '../../config/goldenGala.config'
import {
  SEASON_TIERS,
  calculateSeasonTier,
} from '../../config/seasonPass.config'
import { SKIN_MAP } from '../../config/heroSkins.config'
import {
  SEASON_MISSIONS,
  SEASON_MISSION_MILESTONES,
  TOTAL_SEASON_MISSION_TIERS,
  type SeasonMissionId,
} from '../../config/seasonMissions.config'
import { useMetaStore } from '../../state/useMetaStore'
import { useNotificationBadges } from '../../state/useNotificationBadges'
import { HeroAvatar } from '../HeroAvatar'
import { AudioSynth } from '../../engine/AudioSynth'
import { fmtNum } from '../../engine/format'
import { RedAlertBadge } from '../WorldDioramaArt'
import type { HubTabId } from '../BottomTabBar'

interface SeasonEventHubModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigateTab?: (tab: HubTabId) => void
  onStartBattleRun?: () => void
}

type EventSubTab = 'wheel' | 'pass' | 'trials' | 'plinko' | 'missions'

export function SeasonEventHubModal({
  isOpen,
  onClose,
  onNavigateTab,
  onStartBattleRun,
}: SeasonEventHubModalProps) {
  const meta = useMetaStore()
  const badges = useNotificationBadges()

  const [activeTab, setActiveTab] = useState<EventSubTab>('wheel')
  const [toast, setToast] = useState<string | null>(null)

  // ───────── WHEEL STATE ─────────
  const [wheelRotation, setWheelRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [wonPrizes, setWonPrizes] = useState<GalaWheelSlice[] | null>(null)

  // ───────── TRIAL STATE ─────────
  const [activeTrialCombat, setActiveTrialCombat] = useState<FortunaTrialStage | null>(null)
  const [trialCombatLog, setTrialCombatLog] = useState<string[]>([])
  const [trialBossCurrentHp, setTrialBossCurrentHp] = useState<number>(10000)
  const [trialWon, setTrialWon] = useState(false)

  // ───────── PLINKO STATE ─────────
  const [plinkoChipPos, setPlinkoChipPos] = useState<{ x: number; y: number } | null>(null)
  const [isPlinkoDropping, setIsPlinkoDropping] = useState(false)
  const [plinkoResultText, setPlinkoResultText] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }

  if (!isOpen) return null

  // ───────── WHEEL SPIN HANDLER ─────────
  const handleSpinWheel = (count: 1 | 10) => {
    if (isSpinning) return
    if ((meta.galaTickets ?? 0) < count) {
      showToast(`Need ${count} 🎟️ Gala Ticket${count > 1 ? 's' : ''}! Buy with 💎 Gems below.`)
      return
    }

    AudioSynth.unlock()
    AudioSynth.playRelicTrigger()
    setIsSpinning(true)
    setWonPrizes(null)

    const result = meta.spinFortunaWheel(count)
    if (!result) {
      setIsSpinning(false)
      return
    }

    const lastSlice = result.results[result.results.length - 1].slice
    const sliceIdx = GALA_WHEEL_SLICES.findIndex((s) => s.id === lastSlice.id)
    const sliceAngle = 360 / GALA_WHEEL_SLICES.length
    // Target angle points to slice at top needle (-90 deg offset)
    const targetAngle = 360 * 4 + (360 - sliceIdx * sliceAngle - sliceAngle / 2)

    setWheelRotation((prev) => prev + targetAngle)

    window.setTimeout(() => {
      setIsSpinning(false)
      AudioSynth.playChestOpen()
      setWonPrizes(result.results.map((r) => r.slice))

      if (result.milestoneClaimsUnlocked.length > 0) {
        showToast('🎁 100-Pull Milestone Ready to Claim!')
      }
    }, 3200)
  }

  const handleBuyTickets = (count: 1 | 10) => {
    const cost = count === 10 ? 1800 : 200 * count
    if (meta.gems < cost) {
      showToast(`Insufficient Gems! Need ${cost} 💎 Gems.`)
      return
    }
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    if (meta.buyGalaTicketsWithGems(count)) {
      showToast(`🎟️ Purchased +${count} Gala Ticket${count > 1 ? 's' : ''}!`)
    }
  }

  const handleClaimMilestone = (pulls: number) => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    if (meta.claimGalaMilestone(pulls)) {
      showToast(`🎁 Claimed ${pulls}-Pull Gala Milestone!`)
    }
  }

  const handleClaimAllMilestones = () => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    const { claimedCount } = meta.claimAllGalaMilestones()
    if (claimedCount > 0) {
      showToast(`🎁 Claimed ${claimedCount} Gala Milestone Rewards!`)
    }
  }

  // ───────── TRIAL HANDLER ─────────
  const startTrialCombat = (stageCfg: FortunaTrialStage) => {
    if (stageCfg.minHeroStarsRequired) {
      const ownedStars = meta.heroStars?.lady_fortuna ?? 1
      const isOwned = (meta.ownedHeroes?.lady_fortuna ?? 0) > 0
      if (!isOwned || ownedStars < stageCfg.minHeroStarsRequired) {
        showToast(`🔒 Requires owning Lady Fortuna at ${stageCfg.minHeroStarsRequired}★+!`)
        return
      }
    }

    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    setActiveTrialCombat(stageCfg)
    setTrialBossCurrentHp(stageCfg.bossHp)
    setTrialCombatLog([`⚔️ Engaging ${stageCfg.bossName} in ${stageCfg.name}!`])
    setTrialWon(false)

    // Simulate animated combat sequence with Lady Fortuna skills
    let hp = stageCfg.bossHp
    const lentSkin = stageCfg.lentSkinId ? SKIN_MAP[stageCfg.lentSkinId] : null
    const skillName = lentSkin?.skillMutationName || 'Royal All-In'

    setTimeout(() => {
      AudioSynth.playCoinInject()
      const dmg = Math.round(stageCfg.bossHp * 0.35)
      hp = Math.max(0, hp - dmg)
      setTrialBossCurrentHp(hp)
      setTrialCombatLog((l) => [
        `🎲 Lady Fortuna casts Golden Jackpot! Coin ticks crit for $${fmtNum(dmg)} damage!`,
        ...l,
      ])
    }, 800)

    setTimeout(() => {
      AudioSynth.playRelicTrigger()
      const dmg = Math.round(stageCfg.bossHp * 0.45)
      hp = Math.max(0, hp - dmg)
      setTrialBossCurrentHp(hp)
      setTrialCombatLog((l) => [
        `✨ Lady Fortuna triggers [ ${skillName} ]! Massive 3.0x Golden Candle deals $${fmtNum(dmg)}!`,
        ...l,
      ])
    }, 1800)

    setTimeout(() => {
      AudioSynth.playChestOpen()
      hp = 0
      setTrialBossCurrentHp(0)
      setTrialWon(true)
      setTrialCombatLog((l) => [
        `🏆 BOSS LIQUIDATED! ${stageCfg.bossName} has been wiped out!`,
        ...l,
      ])
      meta.completeFortunaTrial(stageCfg.stage)
    }, 2800)
  }

  // ───────── PLINKO HANDLER ─────────
  const handleDropPlinko = (count: 1 | 5 = 1) => {
    if (isPlinkoDropping) return
    if ((meta.galaChips ?? 0) < count) {
      showToast(`Need ${count} 🪙 Gala Chip${count > 1 ? 's' : ''}! Earn from stage runs.`)
      return
    }

    AudioSynth.unlock()
    AudioSynth.playRelicTrigger()
    setIsPlinkoDropping(true)
    setPlinkoResultText(null)
    setPlinkoChipPos({ x: 50, y: 5 })

    // Simulate pegboard bouncing drop
    let step = 0
    const dropInterval = setInterval(() => {
      step++
      AudioSynth.playCoinInject()
      const randX = 30 + Math.random() * 40
      const currentY = step * 18
      setPlinkoChipPos({ x: randX, y: currentY })

      if (step >= 5) {
        clearInterval(dropInterval)
        setIsPlinkoDropping(false)
        const outcome = meta.dropPlinkoChip()
        if (outcome) {
          AudioSynth.playChestOpen()
          setPlinkoResultText(`Landed in [ ${outcome.bucket.label} ]! Awarded: ${outcome.rewardDesc}`)
        }
      }
    }, 240)
  }

  // ───────── SEASON MISSIONS STATE & HANDLERS ─────────
  const claimedTiers = meta.claimedSeasonMissionTiers ?? {}
  const totalClaimedTiers = Object.values(claimedTiers).reduce((sum, list) => sum + list.length, 0)
  const claimedMilestones = meta.claimedSeasonMissionMilestones ?? []

  let claimableCount = 0
  for (const m of SEASON_MISSIONS) {
    const curProg = meta.getSeasonMissionProgress(m.id)
    const claimedList = claimedTiers[m.id] ?? []
    for (const t of m.tiers) {
      if (curProg >= t.target && !claimedList.includes(t.tierNumber)) {
        claimableCount++
      }
    }
  }
  for (const ms of SEASON_MISSION_MILESTONES) {
    if (totalClaimedTiers >= ms.completedTiers && !claimedMilestones.includes(ms.completedTiers)) {
      claimableCount++
    }
  }
  const canClaimAny = claimableCount > 0

  const handleClaimTier = (missionId: SeasonMissionId, tierNumber: number) => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    const rw = meta.claimSeasonMissionTier(missionId, tierNumber)
    if (rw) {
      showToast(`🎁 Claimed Mission Tier! ${rw.rewardLabel || '+' + (rw.galaTickets ?? 0) + ' 🎟️'}`)
    }
  }

  const handleClaimMissionMilestone = (completedTiers: number) => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    const rw = meta.claimSeasonMissionMilestone(completedTiers)
    if (rw) {
      showToast(`🏆 Milestone Claimed! ${rw.rewardLabel || '+' + (rw.galaTickets ?? 0) + ' 🎟️'}`)
    }
  }

  const handleClaimAllMissions = () => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    const res = meta.claimAllSeasonMissions()
    if (res.claimedCount > 0) {
      showToast(
        `🎉 Claimed ${res.claimedCount} Rewards! +${res.ticketsGained} 🎟️, +${res.gemsGained} 💎, +${res.shardsGained} 🦸`,
      )
    }
  }

  const handleMissionNav = (navTarget: string) => {
    if (navTarget === 'galaWheel') {
      setActiveTab('wheel')
      return
    }
    onClose()
    if (navTarget === 'battle') {
      if (onStartBattleRun) {
        onStartBattleRun()
      } else {
        onNavigateTab?.('run')
      }
    } else if (navTarget === 'shop') {
      onNavigateTab?.('exchange')
    } else if (navTarget === 'baseHq' || navTarget === 'heroes') {
      onNavigateTab?.('base')
    } else if (navTarget === 'rig') {
      onNavigateTab?.('run')
    }
  }

  // Cumulative pull milestones progress
  const currentPulls = meta.seasonWheelPulls ?? 0
  const maxPulls = 100
  const pullProgressPct = Math.min(100, Math.round((currentPulls / maxPulls) * 100))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative flex max-h-[94vh] w-full max-w-[430px] flex-col overflow-hidden rounded-3xl border-[3px] border-[#b45309] border-b-[6px] border-b-[#78350f] bg-gradient-to-b from-[#2a0808] via-[#1a0505] to-[#120303] text-[#fef08a] shadow-2xl">
        {/* Flagship Luxury Marquee Banner */}
        <div className="relative border-b-2 border-[#f59e0b]/40 bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d] p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🎡</span>
              <div>
                <div className="flex items-center gap-1.5 font-display text-[11px] font-black uppercase tracking-wider text-[#fde047]">
                  <span>S1: THE GOLDEN BULL GALA</span>
                  <span className="rounded-full bg-[#f59e0b] px-1.5 py-0.2 text-[8px] font-black text-[#451a03]">
                    LIVE
                  </span>
                </div>
                <div className="text-[10px] font-extrabold text-[#fecaca]">
                  Lady Fortuna Showcase • 24d 18h Remaining
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#fca5a5]/40 bg-[#450a0a] text-[#fca5a5] hover:bg-[#7f1d1d] active:scale-95"
            >
              <X className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Currency Tickers */}
          <div className="mt-2.5 flex items-center justify-between gap-1.5 rounded-2xl border border-[#f59e0b]/30 bg-[#450a0a]/80 px-2.5 py-1">
            <div className="flex items-center gap-1 font-display text-[10px] font-black text-[#fde047]">
              <span>🎟️</span>
              <span>{meta.galaTickets ?? 0} Tickets</span>
            </div>
            <div className="flex items-center gap-1 font-display text-[10px] font-black text-[#fde047]">
              <span>🪙</span>
              <span>{meta.galaChips ?? 0} Chips</span>
            </div>
            <div className="flex items-center gap-1 font-display text-[10px] font-black text-[#38bdf8]">
              <span>💎</span>
              <span>{fmtNum(meta.gems)} Gems</span>
            </div>
          </div>
        </div>

        {/* 5 Interactive Sub-Tabs */}
        <div className="grid grid-cols-5 border-b border-[#f59e0b]/30 bg-[#1e0707] p-1 text-[10px] font-black">
          <button
            type="button"
            onClick={() => setActiveTab('wheel')}
            className={`relative flex flex-col items-center py-1.5 rounded-xl transition ${
              activeTab === 'wheel'
                ? 'bg-gradient-to-b from-[#f59e0b] to-[#b45309] text-white shadow'
                : 'text-[#fef08a] hover:bg-[#450a0a]'
            }`}
          >
            {(meta.galaTickets ?? 0) > 0 && <RedAlertBadge className="-top-1 -right-1" />}
            <span className="text-sm">🎡</span>
            <span>Wheel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pass')}
            className={`relative flex flex-col items-center py-1.5 rounded-xl transition ${
              activeTab === 'pass'
                ? 'bg-gradient-to-b from-[#f59e0b] to-[#b45309] text-white shadow'
                : 'text-[#fef08a] hover:bg-[#450a0a]'
            }`}
          >
            {badges.seasonPassReady && <RedAlertBadge className="-top-1 -right-1" />}
            <span className="text-sm">🎟️</span>
            <span>Pass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trials')}
            className={`relative flex flex-col items-center py-1.5 rounded-xl transition ${
              activeTab === 'trials'
                ? 'bg-gradient-to-b from-[#f59e0b] to-[#b45309] text-white shadow'
                : 'text-[#fef08a] hover:bg-[#450a0a]'
            }`}
          >
            {(meta.clearedFortunaTrials ?? []).length < 5 && (
              <RedAlertBadge className="-top-1 -right-1" />
            )}
            <span className="text-sm">⚔️</span>
            <span>Trials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plinko')}
            className={`relative flex flex-col items-center py-1.5 rounded-xl transition ${
              activeTab === 'plinko'
                ? 'bg-gradient-to-b from-[#f59e0b] to-[#b45309] text-white shadow'
                : 'text-[#fef08a] hover:bg-[#450a0a]'
            }`}
          >
            {(meta.galaChips ?? 0) > 0 && <RedAlertBadge className="-top-1 -right-1" />}
            <span className="text-sm">🪙</span>
            <span>Plinko</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('missions')}
            className={`relative flex flex-col items-center py-1.5 rounded-xl transition ${
              activeTab === 'missions'
                ? 'bg-gradient-to-b from-[#f59e0b] to-[#b45309] text-white shadow'
                : 'text-[#fef08a] hover:bg-[#450a0a]'
            }`}
          >
            {badges.seasonMissionsReady && <RedAlertBadge className="-top-1 -right-1" />}
            <span className="text-sm">📋</span>
            <span>Missions</span>
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute top-24 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-[#14532d] bg-[#4ade80] px-4 py-1 text-xs font-black text-white shadow-xl animate-bounce">
            {toast}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SUB-TAB 1: FORTUNA WHEEL + 100-PULL MILESTONE GUARANTEE
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'wheel' && (
          <div className="flex flex-col gap-3 overflow-y-auto p-3.5">
            {/* Roulette Wheel Stage */}
            <div className="relative flex flex-col items-center justify-center rounded-3xl border border-[#f59e0b]/40 bg-gradient-to-b from-[#3b0b0b] to-[#1e0505] p-3 shadow-inner">
              {/* Top Needle Indicator */}
              <div className="absolute -top-1 z-30 flex flex-col items-center">
                <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[16px] border-t-[#fde047] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              </div>

              {/* Rotating Wheel SVG */}
              <div
                className="relative my-2 transition-transform duration-[3200ms] ease-out"
                style={{ transform: `rotate(${wheelRotation}deg)` }}
              >
                <svg width="220" height="220" viewBox="0 0 240 240">
                  <defs>
                    <radialGradient id="galaGoldHub" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#78350f" />
                    </radialGradient>
                  </defs>

                  {/* Outer Gilded Rim */}
                  <circle cx="120" cy="120" r="116" fill="#78350f" stroke="#fde047" strokeWidth="4" />
                  <circle cx="120" cy="120" r="110" fill="#290707" stroke="#b45309" strokeWidth="2" />

                  {/* 8 Slices */}
                  {GALA_WHEEL_SLICES.map((slice, i) => {
                    const totalSlices = GALA_WHEEL_SLICES.length
                    const startAngle = (i * 360) / totalSlices
                    const endAngle = ((i + 1) * 360) / totalSlices
                    const startRad = ((startAngle - 90) * Math.PI) / 180
                    const endRad = ((endAngle - 90) * Math.PI) / 180
                    const x1 = 120 + 105 * Math.cos(startRad)
                    const y1 = 120 + 105 * Math.sin(startRad)
                    const x2 = 120 + 105 * Math.cos(endRad)
                    const y2 = 120 + 105 * Math.sin(endRad)
                    const textRad = (((startAngle + endAngle) / 2 - 90) * Math.PI) / 180
                    const tx = 120 + 72 * Math.cos(textRad)
                    const ty = 120 + 72 * Math.sin(textRad)

                    return (
                      <g key={slice.id}>
                        <path
                          d={`M120 120 L${x1} ${y1} A105 105 0 0 1 ${x2} ${y2} Z`}
                          fill={slice.color}
                          stroke="#fde047"
                          strokeWidth="1.5"
                        />
                        <text
                          x={tx}
                          y={ty}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="900"
                          transform={`rotate(${(startAngle + endAngle) / 2}, ${tx}, ${ty})`}
                        >
                          {slice.icon} {slice.label}
                        </text>
                      </g>
                    )
                  })}

                  {/* Center Golden Bull Hub */}
                  <circle cx="120" cy="120" r="26" fill="url(#galaGoldHub)" stroke="#451a03" strokeWidth="3" />
                  <text x="120" y="125" textAnchor="middle" fontSize="16">
                    👑
                  </text>
                </svg>
              </div>

              {/* Action Spin Buttons */}
              <div className="mt-2 grid w-full grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={() => handleSpinWheel(1)}
                  className={`btn-3d-gold flex items-center justify-center gap-1.5 rounded-2xl py-2.5 font-display text-xs font-black uppercase text-white shadow-lg ${
                    isSpinning ? 'opacity-50 cursor-not-allowed' : 'active:translate-y-0.5'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>SPIN 1x (🎟️ 1)</span>
                </button>

                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={() => handleSpinWheel(10)}
                  className={`btn-3d-green flex items-center justify-center gap-1.5 rounded-2xl py-2.5 font-display text-xs font-black uppercase text-white shadow-lg ${
                    isSpinning ? 'opacity-50 cursor-not-allowed' : 'active:translate-y-0.5'
                  }`}
                >
                  <Flame className="h-4 w-4 fill-current" />
                  <span>SPIN 10x (🎟️ 10)</span>
                </button>
              </div>

              {/* Buy Tickets Shortcut */}
              <div className="mt-2 flex w-full items-center justify-between border-t border-[#f59e0b]/30 pt-2 text-[10px] font-extrabold text-[#fecaca]">
                <span>Get Tickets:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleBuyTickets(1)}
                    className="rounded-xl border border-[#f59e0b] bg-[#78350f] px-2 py-0.5 font-display text-[9px] font-black text-white hover:bg-[#b45309]"
                  >
                    1x (200 💎)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuyTickets(10)}
                    className="rounded-xl border border-[#f59e0b] bg-[#b45309] px-2.5 py-0.5 font-display text-[9px] font-black text-[#fde047] hover:bg-[#d97706]"
                  >
                    10x (1,800 💎 -10%)
                  </button>
                </div>
              </div>
            </div>

            {/* Won Prizes Celebration Card */}
            {wonPrizes && (
              <div className="rounded-2xl border-2 border-[#16a34a] bg-[#14532d]/40 p-3 text-center shadow-lg animate-fadeIn">
                <div className="font-display text-xs font-black uppercase text-[#4ade80]">
                  🎉 Won {wonPrizes.length} Gala Reward{wonPrizes.length > 1 ? 's' : ''}!
                </div>
                <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
                  {wonPrizes.map((p, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl border border-[#4ade80]/40 bg-[#052e16] px-2.5 py-1 font-display text-[10px] font-black text-white shadow-xs"
                    >
                      {p.icon} {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 100-PULL CUMULATIVE MILESTONE REWARD TRACK */}
            <div className="rounded-3xl border border-[#f59e0b]/40 bg-[#240606] p-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-xs font-black uppercase text-[#fde047]">
                    100-Pull Guaranteed Pity Track
                  </div>
                  <div className="text-[10px] font-bold text-[#fca5a5]">
                    50 Shards = 100% Guaranteed Lady Fortuna at 100 Pulls!
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClaimAllMilestones}
                  className="rounded-xl bg-[#f59e0b] px-2.5 py-1 font-display text-[9px] font-black text-[#451a03] active:scale-95"
                >
                  Claim All
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[10px] font-black text-[#fde047]">
                  <span>Pulls Progress:</span>
                  <span>
                    {currentPulls} / {maxPulls} Pulls ({pullProgressPct}%)
                  </span>
                </div>
                <div className="mt-1 h-3.5 w-full overflow-hidden rounded-full border border-[#f59e0b]/40 bg-[#450a0a]">
                  <div
                    className="h-full bg-gradient-to-r from-[#dc2626] via-[#f59e0b] to-[#fde047] transition-all"
                    style={{ width: `${pullProgressPct}%` }}
                  />
                </div>
              </div>

              {/* 10 Milestone Chest Cards */}
              <div className="mt-3 flex flex-col gap-1.5">
                {GALA_100_PULL_MILESTONES.map((ms) => {
                  const isReached = currentPulls >= ms.pulls
                  const isClaimed = (meta.claimedGalaMilestones ?? []).includes(ms.pulls)

                  return (
                    <div
                      key={ms.pulls}
                      className={`flex items-center justify-between gap-2 rounded-2xl border p-2 transition ${
                        isClaimed
                          ? 'border-emerald-800 bg-emerald-950/40 opacity-70'
                          : isReached
                          ? 'border-[#fde047] bg-[#78350f]/60 shadow-md animate-pulse'
                          : 'border-[#7f1d1d] bg-[#450a0a]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#f59e0b]/50 bg-[#1e0505] text-base">
                          {ms.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-[10px] font-black text-[#fde047]">
                              {ms.pulls} Pulls:
                            </span>
                            <span className="font-display text-[11px] font-black text-white truncate">
                              {ms.title}
                            </span>
                          </div>
                          <p className="text-[9px] font-semibold text-[#fca5a5] truncate">
                            {ms.description}
                          </p>
                        </div>
                      </div>

                      {isClaimed ? (
                        <span className="flex shrink-0 items-center gap-0.5 rounded-xl bg-emerald-700 px-2 py-1 font-display text-[9px] font-black text-white">
                          <Check className="h-3 w-3 stroke-[3]" /> CLAIMED
                        </span>
                      ) : isReached ? (
                        <button
                          type="button"
                          onClick={() => handleClaimMilestone(ms.pulls)}
                          className="btn-3d-green shrink-0 rounded-xl px-3 py-1 font-display text-[10px] font-black text-white game-text-outline-sm"
                        >
                          CLAIM
                        </button>
                      ) : (
                        <span className="shrink-0 rounded-xl border border-white/20 bg-black/40 px-2 py-1 font-display text-[9px] font-bold text-slate-400">
                          {ms.pulls - currentPulls} Left
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SUB-TAB 2: GALA PASS (30-TIER SEASON PROGRESSION)
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'pass' && (
          <div className="flex flex-col gap-3 overflow-y-auto p-3.5">
            {/* Header info with passes purchase buttons */}
            <div className="rounded-3xl border border-[#f59e0b]/40 bg-gradient-to-b from-[#3b0b0b] to-[#1e0505] p-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-xs font-black uppercase text-[#fde047]">
                    S1 GALA SEASON PASS (30 TIERS)
                  </div>
                  <div className="text-[10px] font-bold text-[#fecaca]">
                    XP Earned from Daily Quests &amp; Stage Runs
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    AudioSynth.unlock()
                    AudioSynth.playChestOpen()
                    const res = meta.claimAllSeasonPass()
                    if (res.claimedCount > 0) {
                      showToast(`Claimed ${res.claimedCount} Pass Tiers!`)
                    } else {
                      showToast('No unclaimed pass tiers available.')
                    }
                  }}
                  className="rounded-xl bg-[#f59e0b] px-3 py-1 font-display text-[10px] font-black text-[#451a03] active:scale-95"
                >
                  Claim All
                </button>
              </div>

              {/* Pass Purchase Options */}
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    AudioSynth.unlock()
                    AudioSynth.playChestOpen()
                    meta.buySeasonPass('trader')
                    showToast('🎉 Premium Gala Pass Unlocked: Lady Fortuna Recruited!')
                  }}
                  className={`flex flex-col items-center rounded-2xl border p-2 text-center transition ${
                    meta.seasonPassType === 'trader' || meta.seasonPassType === 'whale'
                      ? 'border-emerald-600 bg-emerald-950/50'
                      : 'border-[#f59e0b] bg-gradient-to-b from-[#b45309] to-[#78350f] active:scale-95'
                  }`}
                >
                  <span className="font-display text-[10px] font-black uppercase text-white">
                    {meta.seasonPassType === 'trader' || meta.seasonPassType === 'whale'
                      ? '✓ TRADER UNLOCKED'
                      : 'TRADER PASS ($9.99)'}
                  </span>
                  <span className="text-[8.5px] font-bold text-[#fde047]">
                    Instant Lady Fortuna + 65x Gala Tickets
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    AudioSynth.unlock()
                    AudioSynth.playChestOpen()
                    meta.buySeasonPass('whale')
                    showToast('👑 Executive Whale Pass: Sovereign Empress Skin Unlocked!')
                  }}
                  className={`flex flex-col items-center rounded-2xl border p-2 text-center transition ${
                    meta.seasonPassType === 'whale'
                      ? 'border-emerald-600 bg-emerald-950/50'
                      : 'border-[#fde047] bg-gradient-to-b from-[#e11d48] to-[#991b1b] active:scale-95'
                  }`}
                >
                  <span className="font-display text-[10px] font-black uppercase text-white">
                    {meta.seasonPassType === 'whale' ? '✓ WHALE UNLOCKED' : 'EXECUTIVE WHALE ($24.99)'}
                  </span>
                  <span className="text-[8.5px] font-bold text-[#fde047]">
                    Sovereign Empress + +10 Tiers + 45 Max Energy
                  </span>
                </button>
              </div>
            </div>

            {/* 30 Tiers Progression List */}
            <div className="flex flex-col gap-1.5">
              {SEASON_TIERS.map((tierCfg) => {
                const curTier = calculateSeasonTier(meta.seasonPassXp ?? 0)
                const isReached = curTier >= tierCfg.tier
                const freeClaimed = (meta.seasonPassClaimedFree ?? []).includes(tierCfg.tier)
                const traderClaimed = (meta.seasonPassClaimedTrader ?? []).includes(tierCfg.tier)
                const whaleClaimed = (meta.seasonPassClaimedWhale ?? []).includes(tierCfg.tier)
                const isTraderPass = meta.seasonPassType === 'trader' || meta.seasonPassType === 'whale'
                const isWhalePass = meta.seasonPassType === 'whale'

                return (
                  <div
                    key={tierCfg.tier}
                    className={`flex items-center justify-between gap-2 rounded-2xl border p-2.5 ${
                      isReached ? 'border-[#f59e0b]/50 bg-[#3b0b0b]/60' : 'border-[#7f1d1d]/40 bg-[#1e0505]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#f59e0b] bg-[#450a0a] font-display text-xs font-black text-[#fde047]">
                        T{tierCfg.tier}
                      </div>
                      <div>
                        <div className="font-display text-[10px] font-black text-white">
                          Free: {tierCfg.freeReward.name}
                        </div>
                        <div className="text-[9px] font-bold text-[#fde047]">
                          VIP: {tierCfg.traderReward.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold text-gray-400">Free:</span>
                        {isReached && !freeClaimed && (
                          <button
                            type="button"
                            onClick={() => meta.claimSeasonPassTier(tierCfg.tier, 'free')}
                            className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[9px] font-black text-white hover:bg-emerald-500"
                          >
                            Claim
                          </button>
                        )}
                        {freeClaimed && (
                          <span className="text-[9px] font-bold text-emerald-400">✓ Done</span>
                        )}
                      </div>
                      {isTraderPass && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-bold text-amber-300">VIP:</span>
                          {isReached && !traderClaimed && (
                            <button
                              type="button"
                              onClick={() => meta.claimSeasonPassTier(tierCfg.tier, 'trader')}
                              className="rounded-lg bg-amber-600 px-2 py-0.5 text-[9px] font-black text-white hover:bg-amber-500"
                            >
                              Claim
                            </button>
                          )}
                          {traderClaimed && (
                            <span className="text-[9px] font-bold text-amber-400">✓ Done</span>
                          )}
                        </div>
                      )}
                      {isWhalePass && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-bold text-purple-300">Whale:</span>
                          {isReached && !whaleClaimed && (
                            <button
                              type="button"
                              onClick={() => meta.claimSeasonPassTier(tierCfg.tier, 'whale')}
                              className="rounded-lg bg-purple-600 px-2 py-0.5 text-[9px] font-black text-white hover:bg-purple-500"
                            >
                              Claim
                            </button>
                          )}
                          {whaleClaimed && (
                            <span className="text-[9px] font-bold text-purple-400">✓ Done</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SUB-TAB 3: FORTUNA TRIAL SHOWCASE MISSIONS
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'trials' && (
          <div className="flex flex-col gap-3 overflow-y-auto p-3.5">
            {/* Active Combat Modal View */}
            {activeTrialCombat ? (
              <div className="flex flex-col gap-3 rounded-3xl border-2 border-[#f59e0b] bg-[#3b0b0b] p-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#f59e0b]/40 pb-2">
                  <div className="font-display text-xs font-black text-[#fde047]">
                    STAGE {activeTrialCombat.stage}: {activeTrialCombat.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTrialCombat(null)}
                    className="rounded-lg bg-[#450a0a] px-2 py-0.5 text-xs text-white"
                  >
                    Close
                  </button>
                </div>

                {/* Trial Combat Diorama */}
                <div className="relative flex h-36 items-center justify-around rounded-2xl bg-[#1e0505] p-2">
                  {/* Lady Fortuna */}
                  <div className="flex flex-col items-center">
                    <HeroAvatar
                      heroId="lady_fortuna"
                      skinId={activeTrialCombat.lentSkinId}
                      size={80}
                      showAura={true}
                    />
                    <span className="font-display text-[10px] font-black text-[#fde047]">
                      Lady Fortuna (Trial)
                    </span>
                  </div>

                  <span className="font-display text-lg font-black text-[#ef4444] animate-bounce">
                    VS
                  </span>

                  {/* Boss */}
                  <div className="flex flex-col items-center">
                    <div className="text-4xl animate-pulse">🐻</div>
                    <span className="font-display text-[10px] font-black text-white">
                      {activeTrialCombat.bossName}
                    </span>
                    <span className="text-[8px] text-[#fca5a5]">
                      HP: ${fmtNum(trialBossCurrentHp)} / ${fmtNum(activeTrialCombat.bossHp)}
                    </span>
                  </div>
                </div>

                {/* Live Combat Log */}
                <div className="flex h-24 flex-col gap-1 overflow-y-auto rounded-xl border border-[#f59e0b]/30 bg-black/60 p-2 text-[9.5px] font-semibold text-[#fde047]">
                  {trialCombatLog.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>

                {trialWon && (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-950 p-2 border border-emerald-500">
                    <span className="font-display text-xs font-black text-emerald-400">
                      🎉 VICTORY! Cleared Stage {activeTrialCombat.stage}!
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTrialCombat(null)}
                      className="rounded-lg bg-emerald-600 px-3 py-1 font-display text-[10px] font-black text-white"
                    >
                      Collect Loot
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#290707] p-2.5 text-[10px] font-semibold text-[#fecaca]">
                  💡 <span className="font-bold text-[#fde047]">Hero Trial Showcase:</span> Stages 1–3
                  lend Lady Fortuna and her exclusive skins for free so you can test her full kit!
                </div>

                {FORTUNA_TRIAL_STAGES.map((stg) => {
                  const isCleared = (meta.clearedFortunaTrials ?? []).includes(stg.stage)

                  return (
                    <div
                      key={stg.stage}
                      className={`flex flex-col gap-2 rounded-3xl border-2 p-3 transition ${
                        isCleared
                          ? 'border-emerald-700 bg-emerald-950/40 opacity-75'
                          : 'border-[#f59e0b]/50 bg-[#3b0b0b]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f59e0b] font-display text-xs font-black text-[#451a03]">
                            {stg.stage}
                          </span>
                          <div>
                            <div className="font-display text-xs font-black text-white">
                              {stg.name}
                            </div>
                            <div className="text-[9px] font-bold text-[#fde047]">
                              Boss: {stg.bossName} • ${fmtNum(stg.bossHp)} HP
                            </div>
                          </div>
                        </div>

                        {isCleared ? (
                          <span className="flex items-center gap-1 rounded-xl bg-emerald-700 px-2.5 py-1 font-display text-[9px] font-black text-white">
                            <Check className="h-3 w-3 stroke-[3]" /> CLEARED
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startTrialCombat(stg)}
                            className="btn-3d-gold flex items-center gap-1 rounded-xl px-3 py-1.5 font-display text-[10px] font-black text-white game-text-outline-sm shadow"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>BATTLE</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[10px] font-semibold text-[#fca5a5] leading-tight">
                        {stg.description}
                      </p>

                      <div className="flex items-center gap-2 border-t border-[#f59e0b]/20 pt-1.5 text-[9px] font-black text-[#fde047]">
                        <span>Rewards:</span>
                        <span>🎟️ +{stg.rewards.tickets} Tickets</span>
                        <span>🧩 +{stg.rewards.shards} Shards</span>
                        <span>💎 +{stg.rewards.gems} Gems</span>
                        {stg.rewards.skinCopies && <span>👗 1x Skin Copy</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SUB-TAB 4: CANDLE PLINKO MINI-GAME
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'plinko' && (
          <div className="flex flex-col gap-3 overflow-y-auto p-3.5">
            <div className="relative flex flex-col items-center rounded-3xl border border-[#f59e0b]/40 bg-gradient-to-b from-[#290707] to-[#120303] p-3 shadow-inner">
              <div className="flex w-full items-center justify-between border-b border-[#f59e0b]/30 pb-2 text-[11px] font-black text-[#fde047]">
                <span>🪙 CANDLE PLINKO DROPS</span>
                <span>{meta.galaChips ?? 0} Chips Left</span>
              </div>

              {/* Pegboard Canvas Area */}
              <div className="relative my-2 h-56 w-full overflow-hidden rounded-2xl border border-[#f59e0b]/30 bg-[#1e0505]">
                {/* Visual Pegs */}
                <div className="absolute inset-0 flex flex-col justify-around py-4">
                  {[3, 4, 5, 6, 5, 6, 7].map((numPegs, rowIdx) => (
                    <div key={rowIdx} className="flex justify-around px-6">
                      {Array.from({ length: numPegs }).map((_, colIdx) => (
                        <div
                          key={colIdx}
                          className="h-2 w-2 rounded-full border border-[#fde047] bg-[#f59e0b] shadow-xs"
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Animated Falling Chip */}
                {plinkoChipPos && (
                  <div
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#e11d48] text-center text-xs font-black text-white shadow-lg transition-all duration-200"
                    style={{
                      left: `${plinkoChipPos.x}%`,
                      top: `${plinkoChipPos.y}%`,
                      width: 22,
                      height: 22,
                      lineHeight: '18px',
                    }}
                  >
                    🪙
                  </div>
                )}
              </div>

              {/* Bottom Multiplier Buckets */}
              <div className="grid w-full grid-cols-5 gap-1 text-center font-display text-[8.5px] font-black">
                {PLINKO_BUCKETS.map((b) => (
                  <div
                    key={b.index}
                    className={`rounded-xl border border-white/20 p-1.5 shadow-sm bg-gradient-to-b ${b.bgGradient}`}
                    style={{ color: b.textColor }}
                  >
                    <div>{b.label}</div>
                  </div>
                ))}
              </div>

              {/* Plinko Outcome Toast */}
              {plinkoResultText && (
                <div className="mt-2.5 w-full rounded-2xl border border-emerald-500 bg-emerald-950/60 p-2 text-center text-[10px] font-black text-emerald-300 animate-fadeIn">
                  {plinkoResultText}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3 grid w-full grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isPlinkoDropping}
                  onClick={() => handleDropPlinko(1)}
                  className="btn-3d-gold rounded-2xl py-2.5 font-display text-xs font-black uppercase text-white shadow active:translate-y-0.5"
                >
                  DROP 1x (🪙 1)
                </button>

                <button
                  type="button"
                  disabled={isPlinkoDropping}
                  onClick={() => handleDropPlinko(5)}
                  className="btn-3d-green rounded-2xl py-2.5 font-display text-xs font-black uppercase text-white shadow active:translate-y-0.5"
                >
                  DROP 5x (🪙 5)
                </button>
              </div>

              {/* Quick Dev Cheat Refill */}
              <div className="mt-2 flex w-full justify-end">
                <button
                  type="button"
                  onClick={() => {
                    meta.addGalaChips(5)
                    showToast('🪙 +5 Gala Chips Added (Dev Refill)')
                  }}
                  className="text-[9px] font-bold text-[#fca5a5] hover:underline"
                >
                  +5 Chips (Dev Refill)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SUB-TAB 5: CUMULATIVE GALA MISSIONS & MILESTONES ENGINE
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'missions' && (
          <div className="flex flex-col gap-3 overflow-y-auto p-3.5 text-stone-100">
            {/* Top Cumulative Milestone Track Banner */}
            <div className="relative shrink-0 overflow-hidden rounded-3xl border-2 border-[#f59e0b]/50 bg-gradient-to-b from-[#3b0d0d] via-[#240606] to-[#120202] p-3 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 font-display text-xs font-black uppercase text-[#fef08a]">
                    <Sparkles className="h-4 w-4 text-[#fbbf24]" />
                    <span>Gala Milestone Track</span>
                  </div>
                  <div className="font-mono text-[10px] text-stone-300">
                    Cumulative Tiers: <span className="font-black text-[#fde047]">{totalClaimedTiers}</span> / {TOTAL_SEASON_MISSION_TIERS} Completed
                  </div>
                </div>

                {/* Quick Claim All Button */}
                <button
                  type="button"
                  disabled={!canClaimAny}
                  onClick={handleClaimAllMissions}
                  className={`rounded-xl px-2.5 py-1 text-[10px] font-black uppercase transition active:scale-95 ${
                    canClaimAny
                      ? 'btn-3d-green animate-pulse text-white shadow-lg'
                      : 'border border-stone-700 bg-stone-900/60 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  {canClaimAny ? `🎁 CLAIM ALL (${claimableCount})` : 'ALL CLAIMED'}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-2.5">
                <div className="relative h-2 w-full overflow-hidden rounded-full border border-[#f59e0b]/40 bg-[#1c0707]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#4ade80] transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((totalClaimedTiers / TOTAL_SEASON_MISSION_TIERS) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* 4 Cumulative Milestones (5, 15, 25, 35) */}
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {SEASON_MISSION_MILESTONES.map((ms) => {
                  const isClaimed = claimedMilestones.includes(ms.completedTiers)
                  const isReady = !isClaimed && totalClaimedTiers >= ms.completedTiers

                  return (
                    <div
                      key={ms.completedTiers}
                      className={`relative flex flex-col items-center justify-between rounded-xl border p-1.5 text-center transition ${
                        isClaimed
                          ? 'border-emerald-600/40 bg-emerald-950/30'
                          : isReady
                          ? 'border-[#fbbf24] bg-[#451a03]/80 shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse'
                          : 'border-stone-800 bg-stone-900/50 opacity-70'
                      }`}
                    >
                      <div className="text-base">{ms.icon}</div>
                      <div className="mt-0.5 font-display text-[9px] font-black text-[#fef08a]">
                        {ms.completedTiers} Tiers
                      </div>
                      <div className="text-[8px] font-semibold text-stone-300 leading-tight">
                        {ms.rewardLabel}
                      </div>

                      <div className="mt-1 w-full">
                        {isClaimed ? (
                          <div className="flex items-center justify-center gap-0.5 text-[8px] font-black text-emerald-400">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                            <span>DONE</span>
                          </div>
                        ) : isReady ? (
                          <button
                            type="button"
                            onClick={() => handleClaimMissionMilestone(ms.completedTiers)}
                            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-0.5 text-[8px] font-black uppercase text-white shadow"
                          >
                            CLAIM
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-0.5 text-[8px] font-semibold text-stone-400">
                            <Lock className="h-2 w-2" />
                            <span>{totalClaimedTiers}/{ms.completedTiers}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Scrollable Mission Cards */}
            <div className="flex shrink-0 flex-col gap-2">
              <div className="flex items-center justify-between px-0.5 text-[10px] font-black uppercase text-stone-300">
                <span>Active Missions ({SEASON_MISSIONS.length})</span>
                <span className="text-[#fde047]">{totalClaimedTiers} / {TOTAL_SEASON_MISSION_TIERS} Tiers Cleared</span>
              </div>

              {SEASON_MISSIONS.map((m) => {
                const currentProg = meta.getSeasonMissionProgress(m.id)
                const claimedForMission = claimedTiers[m.id] ?? []
                const totalTiers = m.tiers.length
                const activeTier =
                  m.tiers.find((t) => !claimedForMission.includes(t.tierNumber)) ??
                  m.tiers[m.tiers.length - 1]
                const isAllClaimed = m.tiers.every((t) => claimedForMission.includes(t.tierNumber))
                const isTierReady = !isAllClaimed && currentProg >= activeTier.target
                const curTierIndex = isAllClaimed ? totalTiers : activeTier.tierNumber
                const pct = Math.min(100, Math.round((currentProg / activeTier.target) * 100))

                return (
                  <div
                    key={m.id}
                    className={`relative shrink-0 overflow-hidden rounded-2xl border p-2.5 shadow-md transition ${
                      isTierReady
                        ? 'border-[#f59e0b] bg-gradient-to-r from-[#451a03] to-[#250d02] shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : isAllClaimed
                        ? 'border-emerald-700/40 bg-emerald-950/20 opacity-80'
                        : 'border-[#f59e0b]/20 bg-[#230909]/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 text-lg shadow-sm"
                          style={{ backgroundColor: `${m.accentColor}25` }}
                        >
                          {m.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-xs font-black text-white">{m.title}</span>
                            <span className="rounded-md border border-[#f59e0b]/40 bg-[#450a0a] px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#fef08a]">
                              Tier {curTierIndex}/{totalTiers}
                            </span>
                          </div>
                          <p className="line-clamp-1 text-[9px] text-stone-300">{m.subtitle}</p>
                        </div>
                      </div>

                      {/* Right Tier Reward Pill */}
                      <div className="flex shrink-0 flex-col items-end">
                        <div className="rounded-lg border border-[#f59e0b]/40 bg-[#3b0a0a] px-2 py-0.5 text-right font-display text-[9px] font-black text-[#fde047]">
                          {activeTier.reward.rewardLabel
                            ? activeTier.reward.rewardLabel
                            : `+${activeTier.reward.galaTickets} 🎟️ Gala Ticket${(activeTier.reward.galaTickets ?? 0) > 1 ? 's' : ''}${activeTier.reward.gems ? ` & +${activeTier.reward.gems} 💎` : ''}`}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between font-mono text-[9px] text-stone-300">
                          <span>
                            {m.id === 'damageDealt'
                              ? `$${fmtNum(Math.min(currentProg, activeTier.target))}`
                              : Math.min(currentProg, activeTier.target).toLocaleString()}{' '}
                            / {activeTier.targetLabel}
                          </span>
                          <span className="font-bold text-[#fef08a]">{pct}%</span>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full border border-stone-800 bg-stone-900">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isTierReady
                                ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                                : 'bg-gradient-to-r from-[#f59e0b] to-[#d97706]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0">
                        {isTierReady ? (
                          <button
                            type="button"
                            onClick={() => handleClaimTier(m.id, activeTier.tierNumber)}
                            className="btn-3d-green animate-pulse rounded-xl px-3 py-1 font-display text-[10px] font-black uppercase text-white shadow active:translate-y-0.5"
                          >
                            CLAIM
                          </button>
                        ) : isAllClaimed ? (
                          <div className="flex items-center gap-1 rounded-xl border border-emerald-600/50 bg-emerald-950/60 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-400">
                            <Check className="h-3 w-3 stroke-[3]" />
                            <span>MAX</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMissionNav(m.navTarget)}
                            className="rounded-xl border border-[#f59e0b]/50 bg-gradient-to-r from-[#b45309] to-[#78350f] hover:brightness-110 px-2.5 py-1 font-display text-[9px] font-black uppercase text-[#fef08a] shadow active:scale-95 flex items-center gap-1"
                          >
                            <span>{m.navLabel}</span>
                            <span>→</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
