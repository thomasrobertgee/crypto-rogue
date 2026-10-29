import { useEffect, useState } from 'react'
import {
  Swords,
  Zap,
  ChevronLeft,
  ChevronRight,
  Crown,
  Tv,
  Sparkles,
  Ticket,
  ShieldAlert,
  CheckCircle2,
  Info,
  Flag,
} from 'lucide-react'
import {
  DAILY_FARMING_MISSIONS,
  DAILY_FREE_MISSION_TICKETS,
  EXTRA_TICKET_GEMS_COST,
  MAX_MISSION_TIER,
  missionTierHp,
  missionTierRewards,
  type DailyMissionConfig,
  type DailyMissionId,
} from '../config/base.config'
import { COIN_MAP } from '../config/coins.config'
import { HERO_MAP } from '../config/heroes.config'
import { getTowerFloorBoss } from '../config/tower.config'
import { TowerBattleModal } from '../components/modals/TowerBattleModal'
import { PvpArenaScreen } from './PvpArenaScreen'
import { CrisisDungeonsScreen } from './CrisisDungeonsScreen'
import { GhostRaceScreen } from './GhostRaceScreen'
import { AudioSynth } from '../engine/AudioSynth'
import { fmtNum, fmtUsd } from '../engine/format'
import { showRewardedAd } from '../services/ads'
import { useMetaStore } from '../state/useMetaStore'
import {
  TopCurrencyBar,
  BossAvatarSvg,
  SatoshiGemIcon,
  HashrateIcon,
  VaultKeyIcon,
} from '../components/GameArtwork'
import { HeroChibiSvg, RedAlertBadge } from '../components/WorldDioramaArt'

interface LootExplosionData {
  missionName: string
  tier: number
  swept: boolean
  gems: number
  hashrate: number
  silverKeys: number
  shards: number
  shardCoinId?: string
  heroFragments?: number
  heroShardHeroId?: string
  blueprints: number
}

function RaidBannerSvg({ missionId }: { missionId: DailyMissionId }) {
  if (missionId === 'whale_liquidity_heist') {
    return (
      <svg viewBox="0 0 360 72" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="wlhSky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="55%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>
          <linearGradient id="wlhGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <rect width="360" height="72" fill="url(#wlhSky)" />
        {/* Sunburst & Ocean Waves */}
        <circle cx="290" cy="22" r="24" fill="#fde047" opacity="0.3" />
        <circle cx="290" cy="22" r="14" fill="#fef08a" opacity="0.65" />
        <path
          d="M0 52 Q45 42 90 52 T180 52 T270 52 T360 52 L360 72 L0 72 Z"
          fill="#0ea5e9"
          opacity="0.55"
        />
        <path
          d="M0 60 Q45 50 90 60 T180 60 T270 60 T360 60 L360 72 L0 72 Z"
          fill="#38bdf8"
          opacity="0.7"
        />
        {/* Golden Mega-Yacht with Diamond Chests */}
        <g transform="translate(175, 16)">
          <path
            d="M10 34 L125 34 L110 48 L22 48 Z"
            fill="url(#wlhGold)"
            stroke="#3E2723"
            strokeWidth="2.5"
          />
          <path
            d="M28 20 L96 20 L104 34 L20 34 Z"
            fill="#FFFDF9"
            stroke="#3E2723"
            strokeWidth="2"
          />
          <rect x="38" y="24" width="14" height="6" rx="2" fill="#38bdf8" />
          <rect x="58" y="24" width="14" height="6" rx="2" fill="#38bdf8" />
          <rect x="78" y="24" width="12" height="6" rx="2" fill="#38bdf8" />
          {/* Diamond Chest on Deck */}
          <rect
            x="102"
            y="22"
            width="16"
            height="12"
            rx="2"
            fill="#f59e0b"
            stroke="#3E2723"
            strokeWidth="2"
          />
          <polygon points="64,4 74,14 64,20 54,14" fill="#67e8f9" stroke="#0369a1" strokeWidth="1.5" />
        </g>
      </svg>
    )
  }

  if (missionId === 'asic_overclock_trial') {
    return (
      <svg viewBox="0 0 360 72" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="aotBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c2d12" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
        </defs>
        <rect width="360" height="72" fill="url(#aotBg)" />
        {/* Molten Gold Server Core & Lightning Coils */}
        <g opacity="0.3" stroke="#fde047" strokeWidth="1.5">
          <line x1="0" y1="18" x2="360" y2="18" />
          <line x1="0" y1="36" x2="360" y2="36" />
          <line x1="0" y1="54" x2="360" y2="54" />
        </g>
        {/* Server Racks & Molten Core */}
        <g transform="translate(185, 8)">
          <rect
            x="10"
            y="6"
            width="34"
            height="46"
            rx="4"
            fill="#2C1810"
            stroke="#fde047"
            strokeWidth="2"
          />
          <circle cx="27" cy="20" r="4" fill="#22c55e" />
          <circle cx="27" cy="34" r="4" fill="#f59e0b" />
          {/* Central Molten Core */}
          <circle
            cx="76"
            cy="28"
            r="22"
            fill="#fde047"
            stroke="#3E2723"
            strokeWidth="2.5"
          />
          <circle cx="76" cy="28" r="14" fill="#f97316" />
          <path
            d="M74 14 L66 28 L76 28 L70 42 L86 25 L76 25 Z"
            fill="#FFFDF9"
          />
          {/* Lightning Arcs */}
          <path
            d="M104 16 L122 24 L114 32 L134 42"
            fill="none"
            stroke="#fef08a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 360 72" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="ceBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b0764" />
          <stop offset="55%" stopColor="#581c87" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
      <rect width="360" height="72" fill="url(#ceBg)" />
      {/* Wall Street Penthouse Skyline & Security Laser Beams */}
      <g fill="#1e1b4b" opacity="0.65">
        <rect x="140" y="18" width="26" height="54" />
        <rect x="172" y="10" width="32" height="62" />
        <rect x="295" y="14" width="34" height="58" />
      </g>
      {/* Laser Security Grid */}
      <g stroke="#fb7185" strokeWidth="1.8" opacity="0.8">
        <line x1="130" y1="8" x2="350" y2="64" />
        <line x1="160" y1="66" x2="345" y2="12" />
        <line x1="210" y1="4" x2="290" y2="68" />
      </g>
      {/* Penthouse Vault Door */}
      <g transform="translate(220, 10)">
        <circle
          cx="32"
          cy="26"
          r="22"
          fill="#c084fc"
          stroke="#3E2723"
          strokeWidth="2.5"
        />
        <circle
          cx="32"
          cy="26"
          r="14"
          fill="#fde047"
          stroke="#3E2723"
          strokeWidth="2"
        />
        <circle cx="32" cy="26" r="4" fill="#3E2723" />
      </g>
    </svg>
  )
}

export function MissionsScreen() {
  const meta = useMetaStore()

  useEffect(() => {
    meta.syncDailyMissions()
    meta.syncTowerDailyReset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Phase 2: Margin Call Tower state
  const [showTowerBattle, setShowTowerBattle] = useState(false)
  const nextTowerFloor = (meta.highestTowerFloorCleared ?? 0) + 1
  const towerBoss = getTowerFloorBoss(nextTowerFloor)

  // Selected difficulty tier per mission (defaults to highest unlocked tier)
  const [selectedTiers, setSelectedTiers] = useState<Record<DailyMissionId, number>>(() => ({
    whale_liquidity_heist: meta.missionHighestTier?.whale_liquidity_heist ?? 1,
    asic_overclock_trial: meta.missionHighestTier?.asic_overclock_trial ?? 1,
    corporate_espionage: meta.missionHighestTier?.corporate_espionage ?? 1,
  }))

  // Active 1-Wave Raid Battle state
  const [activeRaid, setActiveRaid] = useState<{
    mission: DailyMissionConfig
    tier: number
    bossHp: number
    bossMaxHp: number
    timeLeft: number
    combatLog: string[]
    burstReady: boolean
  } | null>(null)

  // Non-VIP Auto-Sweep Prompt Modal
  const [sweepPrompt, setSweepPrompt] = useState<{
    mission: DailyMissionConfig
    tier: number
  } | null>(null)
  const [adSweepLoading, setAdSweepLoading] = useState(false)

  // Extra Ticket Modal (+1 Ticket via Rewarded Ad or 30 Gems)
  const [ticketModalMission, setTicketModalMission] = useState<DailyMissionConfig | null>(null)
  const [missionsSubTab, setMissionsSubTab] = useState<'raids' | 'crisis' | 'races' | 'arena'>('raids')
  const [adTicketLoading, setAdTicketLoading] = useState(false)

  // Raid Intel (i) Info Popup Modal
  const [intelMission, setIntelMission] = useState<DailyMissionConfig | null>(null)

  // Juicy Loot Chest Explosion Modal
  const [lootPopup, setLootPopup] = useState<LootExplosionData | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2400)
  }

  // Live 1-Wave Raid combat loop when activeRaid is running
  useEffect(() => {
    if (!activeRaid) return
    const timer = window.setInterval(() => {
      setActiveRaid((prev) => {
        if (!prev) return null
        if (prev.bossHp <= 0) return prev
        const power = Math.max(120, meta.getTotalPowerScore())
        const tickDmg = Math.round((prev.bossMaxHp / 14) * (1 + power / 6000) * (0.85 + Math.random() * 0.35))
        const nextHp = Math.max(0, prev.bossHp - tickDmg)
        const nextTime = Math.max(0, +(prev.timeLeft - 0.35).toFixed(1))
        AudioSynth.playGreenCandle()
        return {
          ...prev,
          bossHp: nextHp,
          timeLeft: nextTime,
          burstReady: true,
          combatLog: [
            `📈 Portfolio Green Candle hit ${prev.mission.bossName} for -${fmtUsd(tickDmg)}!`,
            ...prev.combatLog.slice(0, 3),
          ],
        }
      })
    }, 350)
    return () => clearInterval(timer)
  }, [activeRaid, meta])

  // Check if Raid Boss was defeated
  useEffect(() => {
    if (!activeRaid) return
    if (activeRaid.bossHp <= 0) {
      const { mission, tier } = activeRaid
      setActiveRaid(null)
      AudioSynth.playChestOpen()
      const res = meta.completeMissionRaid(mission.id, tier)
      if (res) {
        setSelectedTiers((s) => ({
          ...s,
          [mission.id]: Math.min(MAX_MISSION_TIER, Math.max(s[mission.id], tier + 1)),
        }))
        setLootPopup({
          missionName: mission.name,
          tier,
          swept: false,
          ...res,
        })
      }
    }
  }, [activeRaid, meta])

  const handleStartRaid = (mission: DailyMissionConfig, tier: number) => {
    AudioSynth.unlock()
    const tickets = meta.missionTickets?.[mission.id] ?? 0
    if (tickets <= 0) {
      setTicketModalMission(mission)
      return
    }
    const maxHp = missionTierHp(mission, tier)
    AudioSynth.playCoinInject()
    setActiveRaid({
      mission,
      tier,
      bossHp: maxHp,
      bossMaxHp: maxHp,
      timeLeft: 25,
      combatLog: [`⚔️ Entered ${mission.name} (Tier ${tier})! Destroy ${mission.bossName}!`],
      burstReady: true,
    })
  }

  const handleRaidOverclockBurst = () => {
    if (!activeRaid) return
    AudioSynth.unlock()
    AudioSynth.playGreenCandle()
    setActiveRaid((prev) => {
      if (!prev) return null
      const burst = Math.round(prev.bossMaxHp * 0.28)
      return {
        ...prev,
        bossHp: Math.max(0, prev.bossHp - burst),
        combatLog: [
          `⚡ HERO OVERCLOCK CRIT! -${fmtUsd(burst)} MEGA CANDLE!`,
          ...prev.combatLog.slice(0, 3),
        ],
      }
    })
  }

  const executeInstantSweep = (mission: DailyMissionConfig, tier: number) => {
    AudioSynth.unlock()
    AudioSynth.playChestOpen()
    const res = meta.completeMissionRaid(mission.id, tier)
    if (res) {
      setLootPopup({
        missionName: mission.name,
        tier,
        swept: true,
        ...res,
      })
    }
  }

  const handleTapAutoSweep = (mission: DailyMissionConfig, tier: number) => {
    AudioSynth.unlock()
    const tickets = meta.missionTickets?.[mission.id] ?? 0
    if (tickets <= 0) {
      setTicketModalMission(mission)
      return
    }
    if (meta.isVipAdFree) {
      executeInstantSweep(mission, tier)
    } else {
      setSweepPrompt({ mission, tier })
    }
  }

  const handleAdSweep = async () => {
    if (!sweepPrompt) return
    const { mission, tier } = sweepPrompt
    setAdSweepLoading(true)
    await showRewardedAd(false)
    setAdSweepLoading(false)
    setSweepPrompt(null)
    executeInstantSweep(mission, tier)
  }

  const handleBuyExtraTicket = async (useGems: boolean) => {
    if (!ticketModalMission) return
    AudioSynth.unlock()
    if (!useGems) {
      setAdTicketLoading(true)
      await showRewardedAd(meta.isVipAdFree)
      setAdTicketLoading(false)
    }
    if (meta.buyMissionTicket(ticketModalMission.id, useGems)) {
      AudioSynth.playCoinInject()
      showToast(`🎟️ +1 Raid Ticket added for ${ticketModalMission.name}!`)
      setTicketModalMission(null)
    }
  }

  const equippedHeroId = meta.equippedHeroId ?? 'rookie_satoshi'
  const equippedHero = HERO_MAP[equippedHeroId] ?? HERO_MAP.rookie_satoshi

  return (
    <div className="relative flex h-full w-full flex-col gap-2.5 overflow-y-auto arcade-screen-bg p-3">
      {/* Top 3D Bubble Resource Bar */}
      <TopCurrencyBar
        hashrate={meta.hashrate}
        gems={meta.gems}
        silverKeys={meta.silverKeys}
        quantumKeys={meta.quantumKeys}
        isVipAdFree={meta.isVipAdFree}
      />

      {toast && (
        <div className="mx-auto rounded-full border-2 border-[#14532d] border-b-4 bg-[#4ade80] px-4 py-1 text-center font-display text-xs font-black text-white game-text-outline-sm shadow-lg animate-bounce">
          {toast}
        </div>
      )}

      {/* 4-Sub-Tab Switcher: [ ⚔️ RAIDS & TOWER ] vs [ ⚡ CRISIS DUNGEONS ] vs [ 🏎️ GHOST RACES ] vs [ 🏆 PVP ARENA ] */}
      <div className="grid grid-cols-4 gap-1 rounded-2xl border-2 border-[#3E2723] bg-[#FFFDF9] p-1 shadow-xs">
        <button
          type="button"
          onClick={() => {
            AudioSynth.unlock()
            AudioSynth.playCoinInject()
            setMissionsSubTab('raids')
          }}
          className={`flex items-center justify-center gap-1 rounded-xl py-2 font-display text-[9px] font-black transition-all ${
            missionsSubTab === 'raids'
              ? 'btn-3d-gold text-white game-text-outline-sm'
              : 'text-[#6E5A4F] hover:bg-[#F3E9D8]'
          }`}
        >
          <Swords className="h-3 w-3" />
          <span>RAIDS</span>
        </button>

        <button
          type="button"
          onClick={() => {
            AudioSynth.unlock()
            AudioSynth.playCoinInject()
            setMissionsSubTab('crisis')
          }}
          className={`relative flex items-center justify-center gap-0.5 rounded-xl py-2 font-display text-[9px] font-black transition-all ${
            missionsSubTab === 'crisis'
              ? 'btn-3d-orange text-white game-text-outline-sm'
              : 'text-[#6E5A4F] hover:bg-[#F3E9D8]'
          }`}
        >
          <Zap className="h-3 w-3 text-amber-300" />
          <span>CRISIS</span>
          {Object.values(meta.crisisDungeonAttempts ?? {}).filter((v) => v > 0).length < 3 && (
            <span className="rounded-full bg-orange-500 px-1 py-0.2 text-[7px] font-black text-white">
              {3 - Object.values(meta.crisisDungeonAttempts ?? {}).filter((v) => v > 0).length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            AudioSynth.unlock()
            AudioSynth.playCoinInject()
            setMissionsSubTab('races')
          }}
          className={`relative flex items-center justify-center gap-0.5 rounded-xl py-2 font-display text-[9px] font-black transition-all ${
            missionsSubTab === 'races'
              ? 'bg-gradient-to-b from-[#6366f1] to-[#4338ca] text-white border-2 border-[#1e1b4b] border-b-4 font-black shadow-sm'
              : 'text-[#6E5A4F] hover:bg-[#F3E9D8]'
          }`}
        >
          <Flag className="h-3 w-3 text-cyan-300" />
          <span>RACES</span>
          <span className="rounded-full bg-indigo-900/80 px-1 py-0.2 text-[7px] font-black text-cyan-300">
            {meta.raceTickets ?? 3}🎟️
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            AudioSynth.unlock()
            AudioSynth.playCoinInject()
            setMissionsSubTab('arena')
          }}
          className={`relative flex items-center justify-center gap-0.5 rounded-xl py-2 font-display text-[9px] font-black transition-all ${
            missionsSubTab === 'arena'
              ? 'btn-3d-indigo text-white game-text-outline-sm'
              : 'text-[#6E5A4F] hover:bg-[#F3E9D8]'
          }`}
        >
          <Crown className="h-3 w-3 text-amber-300" />
          <span>ARENA</span>
          <span className="rounded-full bg-amber-400 px-1 py-0.2 text-[7px] font-black text-slate-900">
            {meta.pvpTickets ?? 5}🎟️
          </span>
        </button>
      </div>

      {missionsSubTab === 'arena' ? (
        <PvpArenaScreen />
      ) : missionsSubTab === 'races' ? (
        <GhostRaceScreen />
      ) : missionsSubTab === 'crisis' ? (
        <CrisisDungeonsScreen />
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════════════════
              FEATURED: 🗼 THE MARGIN CALL TOWER (Endless Boss Gauntlet • 0 Energy Push)
             ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-gradient-to-b from-[#2e1065] via-[#3b0764] to-[#1e1b4b] p-3.5 text-white shadow-xl">
        {/* Specular Glow Background */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#fde047]/15 blur-2xl" />

        {/* Top Header Row */}
        <div className="relative z-10 flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-white/30 bg-gradient-to-b from-[#fde047] to-[#d97706] text-3xl shadow-inner">
              🗼
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm font-black tracking-wide text-white drop-shadow">
                  THE MARGIN CALL TOWER
                </span>
                <span className="rounded-full bg-[#4ade80] px-2 py-0.2 font-display text-[9px] font-black text-[#14532d]">
                  0 ENERGY
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#e9d5ff]">
                Endless Boss Gauntlet • Attempts ONLY lost on defeat!
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="rounded-full border border-white/25 bg-black/40 px-2.5 py-0.5 font-display text-[10px] font-black text-[#fde047]">
              Floor {meta.highestTowerFloorCleared ?? 0} Cleared
            </span>
            <span className="mt-0.5 text-[9px] font-bold text-[#fbcfe8]">
              {meta.towerAttemptsLeft}/3 Attempts Left
            </span>
          </div>
        </div>

        {/* Next Floor Boss Preview Card */}
        <div className="relative z-10 mb-3 flex items-center justify-between rounded-2xl border border-white/20 bg-black/40 p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <BossAvatarSvg name={towerBoss.name} portrait={towerBoss.portrait} size={44} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-display text-xs font-black text-white">
                <span className="truncate">Next: Floor {nextTowerFloor}</span>
                <span className={`rounded px-1.5 py-0.2 text-[8px] font-extrabold uppercase ${
                  towerBoss.isInfiniteDescent
                    ? 'bg-[#f43f5e] text-white'
                    : 'bg-[#e11d48] text-white'
                }`}>
                  {towerBoss.isInfiniteDescent ? 'INFINITE DESCENT' : towerBoss.isMilestone ? 'MILESTONE' : 'BOSS'}
                </span>
              </div>
              <div className="text-[10px] font-semibold text-[#f472b6] truncate">
                {towerBoss.name} • ${fmtNum(towerBoss.maxHp)} HP
              </div>
              <div className="text-[9px] font-bold text-[#fde047]">
                ⚡ Affix: {towerBoss.affixName}
              </div>
            </div>
          </div>

          {towerBoss.isMilestone && (
            <div className="flex flex-col items-end shrink-0 text-right">
              <span className="rounded-full bg-[#fde047] px-2 py-0.5 font-display text-[8px] font-black uppercase text-[#451a03] animate-bounce">
                ⭐ Milestone Chest!
              </span>
              <span className="text-[8px] font-bold text-[#fef08a] mt-0.5">
                Keys + 20 Frags
              </span>
            </div>
          )}
        </div>

        {/* Climb Button & Test Reset */}
        <div className="relative z-10 flex items-center gap-2">
          <button
            type="button"
            disabled={meta.towerAttemptsLeft <= 0}
            onClick={() => {
              AudioSynth.unlock()
              AudioSynth.playChestOpen()
              setShowTowerBattle(true)
            }}
            className={`flex-1 py-2.5 rounded-2xl font-display text-xs font-black uppercase tracking-wider transition-all ${
              meta.towerAttemptsLeft > 0
                ? 'btn-3d-gold text-white game-text-outline-sm shadow-lg active:scale-98'
                : 'border border-white/20 bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            {meta.towerAttemptsLeft > 0
              ? `⚔️ CLIMB FLOOR ${nextTowerFloor} (0 ENERGY)`
              : '0/3 ATTEMPTS LEFT TODAY'}
          </button>

          {meta.towerAttemptsLeft <= 0 && (
            <button
              type="button"
              onClick={() => {
                AudioSynth.unlock()
                AudioSynth.playCoinInject()
                meta.resetTowerAttemptsCheat()
              }}
              className="rounded-xl border border-white/30 bg-white/15 px-2.5 py-2 text-[10px] font-black text-white"
              title="Reset 3 attempts for testing"
            >
              Reset (QA)
            </button>
          )}
        </div>
      </div>

      {/* Daily Ticketed Farming Header Banner */}
      <div className="flex items-center justify-between gap-2 rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] px-3.5 py-2.5 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#fb7185] to-[#e11d48] text-2xl shadow">
            🎯
          </div>
          <div>
            <div className="font-display text-sm font-extrabold text-[#2C1810]">
              DAILY VAULT RAIDS
            </div>
            <div className="text-[11px] font-semibold text-[#6E5A4F]">
              2 Free Tickets/Day • +35% Loot Per Tier
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span
            className={`inline-flex items-center gap-1 rounded-full border border-[#E2D5C1] px-2.5 py-0.5 font-display text-[10px] font-black ${
              meta.isVipAdFree
                ? 'bg-gradient-to-r from-[#fde047] to-[#f59e0b] text-[#2C1810]'
                : 'bg-[#F3E9D8] text-[#6E5A4F]'
            }`}
          >
            <Crown className="h-3 w-3" />
            {meta.isVipAdFree ? 'VIP INSTANT SWEEP ON' : 'VIP SWEEP AVAILABLE'}
          </span>
          <span className="mt-0.5 font-display text-[10px] font-black text-[#7e22ce]">
            📐 Blueprints: {meta.furnitureBlueprints ?? 0}
          </span>
        </div>
      </div>

      {/* 3 DAILY RESOURCE FARMING DUNGEONS */}
      <div className="flex flex-col gap-3 pb-2">
        {DAILY_FARMING_MISSIONS.map((mission) => {
          const tickets = meta.missionTickets?.[mission.id] ?? DAILY_FREE_MISSION_TICKETS
          const highestTier = meta.missionHighestTier?.[mission.id] ?? 1
          const currentTier = selectedTiers[mission.id] ?? highestTier
          const maxSelectableTier = Math.min(MAX_MISSION_TIER, highestTier + 1)
          const isTierCleared = currentTier <= highestTier
          const rewards = missionTierRewards(mission, currentTier)

          return (
            <div
              key={mission.id}
              className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] shadow-md"
            >
              {/* Illustrated SVG Header Banner + Title Overlay + Top-Right [i] Info & Ticket Pills */}
              <div className="relative h-20 w-full overflow-hidden border-b-2 border-[#3E2723]">
                <RaidBannerSvg missionId={mission.id} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-between px-3.5 py-2">
                  {/* Left: Raid Title & Clean Subtitle */}
                  <div className="min-w-0 pr-2">
                    <span className="inline-block rounded-full border border-white/30 bg-black/45 px-2 py-0.2 font-display text-[9px] font-extrabold uppercase tracking-wider text-[#fde047]">
                      {mission.bossName}
                    </span>
                    <h3 className="mt-0.5 truncate font-display text-base font-black text-white game-text-outline">
                      {mission.name}
                    </h3>
                  </div>

                  {/* Top-Right Controls: Ticket Pill + Circular [ i ] Info Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setTicketModalMission(mission)}
                      className="relative flex items-center gap-1 rounded-full border-2 border-[#3E2723] bg-[#FFFDF9] pl-2.5 pr-1.5 py-0.5 text-[#2C1810] shadow active:scale-95"
                    >
                      {tickets > 0 && <RedAlertBadge className="-top-1.5 -left-1.5" />}
                      <Ticket className="h-3.5 w-3.5 text-[#d97706]" />
                      <span className="font-display text-xs font-black">
                        {tickets}/{DAILY_FREE_MISSION_TICKETS}
                      </span>
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#14532d] bg-[#22c55e] font-display text-[11px] font-black text-white">
                        +
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        AudioSynth.unlock()
                        AudioSynth.playCoinInject()
                        setIntelMission(mission)
                      }}
                      title="Raid Boss Intel & Drop Table"
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F5E6C8] text-[#2C1810] shadow hover:bg-[#fde68a] active:scale-90"
                    >
                      <Info className="h-4 w-4 stroke-[2.6]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Body: Clean Tier Selector + Loot Badges + Action Buttons */}
              <div className="flex flex-col gap-2.5 p-3">
                {/* Tier Selector (Tier 1 to Tier 10) + Reward Multipliers — Soft Warm-Tan Inner Surface Pill */}
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] px-2.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentTier <= 1}
                      onClick={() =>
                        setSelectedTiers((s) => ({
                          ...s,
                          [mission.id]: Math.max(1, currentTier - 1),
                        }))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] text-[#2C1810] disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4 stroke-[3]" />
                    </button>

                    <div className="min-w-[92px] text-center">
                      <div className="flex items-center justify-center gap-1 font-display text-xs font-black text-[#2C1810]">
                        <span>TIER {currentTier}/10</span>
                        {isTierCleared && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" />
                        )}
                      </div>
                      <div className="text-[9px] font-black uppercase text-[#b45309]">
                        +{Math.round((Math.pow(1.35, currentTier - 1) - 1) * 100)}% Bonus Loot
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={currentTier >= maxSelectableTier}
                      onClick={() =>
                        setSelectedTiers((s) => ({
                          ...s,
                          [mission.id]: Math.min(maxSelectableTier, currentTier + 1),
                        }))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] text-[#2C1810] disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>

                  {/* Tier Loot Preview Badges */}
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    {rewards.gems > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] px-1.5 py-0.5 font-display text-[10px] font-black text-[#2C1810]">
                        <SatoshiGemIcon size={11} /> +{rewards.gems}
                      </span>
                    )}
                    {rewards.silverKeys > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] px-1.5 py-0.5 font-display text-[10px] font-black text-[#2C1810]">
                        <VaultKeyIcon size={11} /> +{rewards.silverKeys}
                      </span>
                    )}
                    {rewards.hashrate > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] px-1.5 py-0.5 font-display text-[10px] font-black text-[#2C1810]">
                        <HashrateIcon size={11} /> +{fmtNum(rewards.hashrate)}
                      </span>
                    )}
                    {rewards.heroFragments > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] px-1.5 py-0.5 font-display text-[10px] font-black text-[#b45309]">
                        🧩 +{rewards.heroFragments} Hero
                      </span>
                    )}
                    {rewards.blueprints > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] px-1.5 py-0.5 font-display text-[10px] font-black text-[#7e22ce]">
                        +{rewards.blueprints} BP
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Row: Single Clean Icon + Clean Text */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleStartRaid(mission, currentTier)}
                    className="flex items-center justify-center gap-1.5 rounded-2xl py-2.5 font-display text-xs font-black btn-3d-red text-white game-text-outline-sm active:translate-y-0.5"
                  >
                    <Swords className="h-4 w-4" />
                    <span>RAID (1 Ticket)</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isTierCleared}
                    onClick={() => handleTapAutoSweep(mission, currentTier)}
                    className={`flex items-center justify-center gap-1.5 rounded-2xl py-2.5 font-display text-xs font-black transition-all ${
                      !isTierCleared
                        ? 'border-2 border-[#3E2723]/30 bg-[#e7e5e4] text-[#78716c] cursor-not-allowed'
                        : 'btn-3d-gold text-white game-text-outline-sm active:translate-y-0.5'
                    }`}
                  >
                    <Zap className="h-4 w-4 fill-current" />
                    <span>
                      {!isTierCleared
                        ? 'Clear to Sweep'
                        : meta.isVipAdFree
                        ? 'VIP SWEEP'
                        : 'AUTO-SWEEP'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ───────── MODAL 1: LIVE 1-WAVE BOSS RAID BATTLE OVERLAY ───────── */}
      {activeRaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-[370px] flex-col gap-3 rounded-3xl border-[3px] border-[#78350f] border-b-[6px] border-b-[#451a03] bg-[#fff6e6] p-4 text-[#422006] shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="rounded-full border border-[#78350f] bg-[#fde047] px-2.5 py-0.5 font-display text-[10px] font-black uppercase text-[#422006]">
                  {activeRaid.mission.name} • Tier {activeRaid.tier}
                </span>
                <h3 className="mt-0.5 font-display text-lg font-black text-[#be123c]">
                  {activeRaid.mission.bossName}
                </h3>
              </div>
              <div className="rounded-2xl border-2 border-[#78350f] bg-[#ffedd5] px-3 py-1 font-display text-xs font-black text-[#422006]">
                ⏱️ {activeRaid.timeLeft.toFixed(1)}s
              </div>
            </div>

            {/* Raid Arena Display: Boss vs Hero */}
            <div className="relative flex flex-col items-center justify-between gap-2 rounded-2xl border-2 border-[#78350f] bg-gradient-to-b from-[#bae6fd] via-[#fef3c7] to-[#bbf7d0] p-3">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex flex-col items-center">
                  <HeroChibiSvg heroId={equippedHeroId} size={74} />
                  <span className="rounded-full border border-[#78350f] bg-[#fff6e6] px-2 py-0.2 font-display text-[9px] font-black">
                    {equippedHero.name.split(' ')[0]}
                  </span>
                </div>

                <div className="font-display text-xl font-black text-[#e11d48] animate-pulse">
                  ⚡ VS ⚡
                </div>

                <div className="flex flex-col items-center">
                  <BossAvatarSvg
                    name={activeRaid.mission.bossName}
                    portrait={activeRaid.mission.bossPortrait}
                    size={68}
                  />
                  <span className="mt-1 rounded-full border border-[#78350f] bg-[#ffe4e6] px-2 py-0.2 font-display text-[9px] font-black text-[#be123c]">
                    TIER {activeRaid.tier} BOSS
                  </span>
                </div>
              </div>

              {/* Boss HP Bar */}
              <div className="w-full">
                <div className="mb-1 flex justify-between font-display text-[11px] font-black text-[#422006]">
                  <span>RAID VAULT HP</span>
                  <span>
                    {fmtUsd(activeRaid.bossHp)} / {fmtUsd(activeRaid.bossMaxHp)}
                  </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full border-2 border-[#422006] bg-[#fff6e6]">
                  <div
                    className="h-full bg-gradient-to-r from-[#f43f5e] to-[#e11d48] transition-all duration-200"
                    style={{
                      width: `${Math.max(0, (activeRaid.bossHp / activeRaid.bossMaxHp) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Live Ticker Log */}
            <div className="space-y-1 rounded-2xl border-2 border-[#b45309] bg-[#ffedd5] p-2.5 text-[11px] font-bold text-[#422006]">
              {activeRaid.combatLog.map((line, i) => (
                <div key={i} className="truncate">
                  {line}
                </div>
              ))}
            </div>

            {/* Interactive Overclock Burst Button */}
            <button
              type="button"
              onClick={handleRaidOverclockBurst}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-display text-sm font-black btn-3d-gold text-white game-text-outline animate-pulse active:translate-y-0.5"
            >
              <Zap className="h-5 w-5 fill-current" />
              <span>TAP TO OVERCLOCK STRIKE (-28% HP!)</span>
            </button>
          </div>
        </div>
      )}

      {/* ───────── MODAL 2: NON-VIP AUTO-SWEEP PROMPT (WATCH 5S AD OR UNLOCK VIP PASS) ───────── */}
      {sweepPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSweepPrompt(null)}
        >
          <div
            className="flex w-full max-w-[360px] flex-col gap-3 rounded-3xl border-[3px] border-[#78350f] border-b-[6px] border-b-[#451a03] bg-[#fff6e6] p-5 text-[#422006] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-[#f59e0b]" />
                <h3 className="font-display text-lg font-black text-[#422006]">
                  INSTANT AUTO-SWEEP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSweepPrompt(null)}
                className="h-8 w-8 rounded-full border-2 border-[#78350f] bg-[#ffedd5] font-black text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-bold text-[#422006]">
              Skip the battle and instantly claim 100% of{' '}
              <span className="font-black text-[#b45309]">
                {sweepPrompt.mission.name} (Tier {sweepPrompt.tier})
              </span>{' '}
              rewards! Watch a quick 5s Ad or unlock the{' '}
              <span className="font-black text-[#16a34a]">$9.99 VIP Pass</span> for unlimited
              instant sweeps forever.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={adSweepLoading}
                onClick={handleAdSweep}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-display text-xs font-black btn-3d-cyan text-white game-text-outline-sm"
              >
                <Tv className="h-4 w-4" />
                <span>
                  {adSweepLoading ? 'SWEEPING VAULT (5s)...' : 'WATCH 5s AD TO SWEEP NOW'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  AudioSynth.unlock()
                  AudioSynth.playChestOpen()
                  meta.purchaseBundle('vip_pass')
                  const target = sweepPrompt
                  setSweepPrompt(null)
                  executeInstantSweep(target.mission, target.tier)
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-display text-xs font-black btn-3d-gold text-white game-text-outline-sm"
              >
                <Crown className="h-4 w-4" />
                <span>UNLOCK $9.99 VIP PASS (+500💎 &amp; INSTANT SWEEP)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── MODAL 3: REFILL +1 RAID TICKET (REWARDED AD OR 30 GEMS) ───────── */}
      {ticketModalMission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setTicketModalMission(null)}
        >
          <div
            className="flex w-full max-w-[350px] flex-col gap-3 rounded-3xl border-[3px] border-[#78350f] border-b-[6px] border-b-[#451a03] bg-[#fff6e6] p-5 text-[#422006] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-[#d97706]" />
                <h3 className="font-display text-base font-black text-[#422006]">
                  GET +1 RAID TICKET
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTicketModalMission(null)}
                className="h-8 w-8 rounded-full border-2 border-[#78350f] bg-[#ffedd5] font-black text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-bold text-[#422006]">
              Need another run at{' '}
              <span className="font-black text-[#b45309]">{ticketModalMission.name}</span>? Grab
              +1 bonus Raid Ticket via Rewarded Ad or 30 Satoshi Gems!
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                disabled={adTicketLoading}
                onClick={() => handleBuyExtraTicket(false)}
                className="flex items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-xs font-black btn-3d-cyan text-white game-text-outline-sm"
              >
                <Tv className="h-4 w-4" />
                <span>{adTicketLoading ? 'LOADING...' : '+1 TICKET (AD)'}</span>
              </button>

              <button
                type="button"
                disabled={meta.gems < EXTRA_TICKET_GEMS_COST}
                onClick={() => handleBuyExtraTicket(true)}
                className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-xs font-black ${
                  meta.gems >= EXTRA_TICKET_GEMS_COST
                    ? 'btn-3d-gold text-white game-text-outline-sm'
                    : 'border-2 border-[#78350f]/30 bg-[#e7e5e4] text-[#78716c] cursor-not-allowed'
                }`}
              >
                <SatoshiGemIcon size={13} />
                <span>+1 ({EXTRA_TICKET_GEMS_COST} GEMS)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── MODAL 4: JUICY LOOT CHEST EXPLOSION REWARD MODAL ───────── */}
      {lootPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setLootPopup(null)}
        >
          <div
            className="flex w-full max-w-[360px] flex-col items-center gap-3 rounded-3xl border-[3px] border-[#78350f] border-b-[6px] border-b-[#451a03] bg-[#fff6e6] p-5 text-center text-[#422006] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl animate-bounce">🎁✨</div>
            <div className="rounded-full border border-[#78350f] bg-[#fde047] px-3 py-0.5 font-display text-[10px] font-black uppercase text-[#422006]">
              {lootPopup.swept ? '⚡ INSTANT VIP SWEEP COMPLETE!' : '⚔️ RAID BOSS LIQUIDATED!'}
            </div>
            <h3 className="font-display text-xl font-black text-white game-text-outline">
              {lootPopup.missionName} (T{lootPopup.tier})
            </h3>

            <div className="grid w-full grid-cols-2 gap-2 rounded-2xl border-2 border-[#b45309] bg-[#ffedd5] p-3">
              {lootPopup.gems > 0 && (
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[#78350f] bg-[#fff6e6] p-2 font-display text-xs font-black text-[#422006]">
                  <SatoshiGemIcon size={16} />
                  <span>+{lootPopup.gems} Gems</span>
                </div>
              )}
              {lootPopup.silverKeys > 0 && (
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[#78350f] bg-[#fff6e6] p-2 font-display text-xs font-black text-[#422006]">
                  <VaultKeyIcon size={16} />
                  <span>+{lootPopup.silverKeys} Keys</span>
                </div>
              )}
              {lootPopup.hashrate > 0 && (
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[#78350f] bg-[#fff6e6] p-2 font-display text-xs font-black text-[#422006]">
                  <HashrateIcon size={16} />
                  <span>+{fmtNum(lootPopup.hashrate)}⚡</span>
                </div>
              )}
              {lootPopup.shards > 0 && (
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[#78350f] bg-[#fff6e6] p-2 font-display text-xs font-black text-[#d97706]">
                  <span>🧩</span>
                  <span>
                    +{lootPopup.shards}{' '}
                    {lootPopup.shardCoinId
                      ? COIN_MAP[lootPopup.shardCoinId]?.ticker ?? 'Coin'
                      : 'Coin'}{' '}
                    Shards
                  </span>
                </div>
              )}
              {(lootPopup.heroFragments ?? 0) > 0 && (
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[#78350f] bg-[#fff6e6] p-2 font-display text-xs font-black text-[#b45309]">
                  <span>🦸</span>
                  <span>
                    +{lootPopup.heroFragments}{' '}
                    {lootPopup.heroShardHeroId
                      ? HERO_MAP[lootPopup.heroShardHeroId as keyof typeof HERO_MAP]?.name.split(' ')[0] ?? 'Hero'
                      : 'Hero'}{' '}
                    Shards
                  </span>
                </div>
              )}
              {lootPopup.blueprints > 0 && (
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[#78350f] bg-[#fff6e6] p-2 font-display text-xs font-black text-[#7e22ce]">
                  <span>📐</span>
                  <span>+{lootPopup.blueprints} Blueprints</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setLootPopup(null)}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-sm font-black btn-3d-green text-white game-text-outline"
            >
              <Sparkles className="h-4 w-4" />
              <span>COLLECT BOUNTY!</span>
            </button>
          </div>
        </div>
      )}

      {/* ───────── MODAL 5: RAID INTEL (i) INFO POPUP MODAL ───────── */}
      {intelMission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setIntelMission(null)}
        >
          <div
            className="flex max-h-[84vh] w-full max-w-[375px] flex-col gap-3 overflow-hidden rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-2.5">
              <div className="flex items-center gap-2.5">
                <BossAvatarSvg
                  name={intelMission.bossName}
                  portrait={intelMission.bossPortrait}
                  size={44}
                />
                <div>
                  <span className="rounded-full border border-[#E2D5C1] bg-[#F3E9D8] px-2 py-0.2 font-display text-[9px] font-extrabold uppercase text-[#b45309]">
                    RAID INTEL DOSSIER
                  </span>
                  <h3 className="font-display text-base font-extrabold text-[#2C1810]">
                    {intelMission.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIntelMission(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] font-black text-xs text-[#2C1810]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
              {/* Boss Mechanics Section */}
              <div className="rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3">
                <div className="font-display text-[10px] font-black uppercase tracking-wider text-[#b45309]">
                  ⚠️ Target Boss &amp; Mechanics
                </div>
                <div className="mt-0.5 font-display text-xs font-extrabold text-[#2C1810]">
                  {intelMission.bossName}
                </div>
                <p className="mt-1 text-xs font-semibold leading-snug text-[#6E5A4F]">
                  {intelMission.bossMechanic}
                </p>
              </div>

              {/* Exact Drop Rates (Including Hero Fragments) */}
              <div className="rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3">
                <div className="mb-1.5 font-display text-[10px] font-black uppercase tracking-wider text-[#2C1810]">
                  🎲 Guaranteed &amp; Bonus Drop Rates
                </div>
                <div className="space-y-1">
                  {intelMission.dropRates.map((dr, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] px-2.5 py-1.5 text-xs"
                    >
                      <span className="font-bold text-[#2C1810]">{dr.label}</span>
                      <span className="font-display font-black text-[#15803d]">{dr.rate}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Tier Scaling Table (Tiers 1–10) */}
              <div className="rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3">
                <div className="mb-1.5 font-display text-[10px] font-black uppercase tracking-wider text-[#2C1810]">
                  📈 Tiers 1–10 Scaling Table (+35% Loot / Tier)
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-[#E2D5C1] bg-[#FFFDF9]">
                  <table className="w-full text-left text-[10px]">
                    <thead className="border-b border-[#E2D5C1] bg-[#F3E9D8] font-display font-black text-[#2C1810]">
                      <tr>
                        <th className="px-2 py-1">Tier</th>
                        <th className="px-2 py-1">Boss HP</th>
                        <th className="px-2 py-1">Loot Mult</th>
                        <th className="px-2 py-1">Hero🧩</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2D5C1] font-semibold text-[#6E5A4F]">
                      {Array.from({ length: MAX_MISSION_TIER }).map((_, idx) => {
                        const t = idx + 1
                        const tHp = missionTierHp(intelMission, t)
                        const tRew = missionTierRewards(intelMission, t)
                        const multPct = Math.round((Math.pow(1.35, t - 1) - 1) * 100)
                        return (
                          <tr key={t} className="hover:bg-[#F3E9D8]/50">
                            <td className="px-2 py-1 font-display font-black text-[#2C1810]">
                              T{t}
                            </td>
                            <td className="px-2 py-1">{fmtUsd(tHp)}</td>
                            <td className="px-2 py-1 font-bold text-[#15803d]">+{multPct}%</td>
                            <td className="px-2 py-1 font-display font-black text-[#b45309]">
                              +{tRew.heroFragments}🧩
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIntelMission(null)}
              className="w-full rounded-2xl py-2.5 font-display text-xs font-black uppercase btn-3d-amber text-[#2C1810]"
            >
              CLOSE DOSSIER
            </button>
          </div>
        </div>
      )}

      {/* Endless Margin Call Tower Battle Arena Modal */}
      {showTowerBattle && (
        <TowerBattleModal
          initialFloor={nextTowerFloor}
          onClose={() => setShowTowerBattle(false)}
        />
      )}
        </>
      )}
    </div>
  )
}
