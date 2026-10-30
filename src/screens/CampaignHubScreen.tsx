import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  CheckCircle2,
  Skull,
  Flame,
  Clock,
  Tv,
  Sparkles,
  Crown,
  Check,
  ShieldAlert,
} from 'lucide-react'
import {
  getStageConfig,
  getMarketCycle,
  TOTAL_CAMPAIGN_STAGES,
} from '../config/stages.config'
import { COMBAT } from '../config/combat.config'
import { HEROES, HERO_MAP, type HeroId } from '../config/heroes.config'
import { BASE_LOCATION_MAP, HERO_CAMP_QUIPS } from '../config/base.config'
import {
  IDLE_RIG_CAP_HOURS,
  IDLE_RIG_HASHRATE_PER_HOUR,
  VIP_EXTRA_RIG_CAP_HOURS,
} from '../config/economy.config'
import { computeIdleReward } from '../engine/economy'
import { AudioSynth } from '../engine/AudioSynth'
import { fmtNum, fmtUsd } from '../engine/format'
import { showRewardedAd } from '../services/ads'
import { getUiUnlockState } from '../config/unlocks.config'
import {
  useMetaStore,
  MAX_ENERGY,
  RUN_ENERGY_COST,
  HERO_CAMP_COOLDOWN_MS,
  type IdleClaimResult,
} from '../state/useMetaStore'
import { useRunStore } from '../state/useRunStore'
import { useNotificationBadges } from '../state/useNotificationBadges'
import {
  SatoshiGemIcon,
  HashrateIcon,
  VaultKeyIcon,
  BossAvatarSvg,
} from '../components/GameArtwork'
import {
  HeroChibiSvg,
  RedAlertBadge,
  getStageBiomeInfo,
} from '../components/WorldDioramaArt'
import { BaseCampDioramaSvg } from '../components/BaseCampDioramaSvg'
import { DailyQuestsModal } from '../components/modals/DailyQuestsModal'
import { CarnivalModal } from '../components/modals/CarnivalModal'
import { MarginCallOfferModal } from '../components/modals/MarginCallOfferModal'
import { HeroLoadoutModal } from '../components/modals/HeroLoadoutModal'
import { EnergyRechargeModal } from '../components/modals/EnergyRechargeModal'
import { ExpeditionsModal } from '../components/modals/ExpeditionsModal'
import { SeasonPassModal } from '../components/modals/SeasonPassModal'
import { MemeWheelModal } from '../components/modals/MemeWheelModal'
import { SeasonEventHubModal } from '../components/modals/SeasonEventHubModal'
import { DailyPuzzleModal } from '../components/modals/DailyPuzzleModal'
import { WorldBossModal } from '../components/modals/WorldBossModal'
import { CompoundVaultModal } from '../components/modals/CompoundVaultModal'
import { WallBreakerOfferModal } from '../components/modals/WallBreakerOfferModal'
import { GhostRaceScreen } from './GhostRaceScreen'
import { COMPOUND_VAULT_TIERS } from '../config/monetizationLiveOps.config'
import type { HubTabId } from '../components/BottomTabBar'

interface CampaignHubScreenProps {
  onStartBattleRun: () => void
  onNavigateTab?: (tab: HubTabId) => void
}

function formatDuration(sec: number): string {
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rem = s % 60
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(rem).padStart(2, '0')}s`
}

export function CampaignHubScreen({ onStartBattleRun, onNavigateTab }: CampaignHubScreenProps) {
  const meta = useMetaStore()
  const run = useRunStore()
  const unlocks = getUiUnlockState(meta)

  const [selectedStage, setSelectedStage] = useState<number>(meta.currentStage)
  const [now, setNow] = useState(() => Date.now())
  const [adClaimLoading, setAdClaimLoading] = useState(false)
  const [claimToast, setClaimToast] = useState<IdleClaimResult | null>(null)
  const [activeTipHeroId, setActiveTipHeroId] = useState<string | null>(() =>
    Date.now() - (meta.lastHeroCampClaimTimestamp ?? 0) >= HERO_CAMP_COOLDOWN_MS
      ? 'rookie_satoshi'
      : null,
  )
  const [activeQuip, setActiveQuip] = useState<{
    heroId: string
    text: string
    rewardText: string
  } | null>(null)
  const [activeModal, setActiveModal] = useState<
    | 'quests'
    | 'carnival'
    | 'piggy'
    | 'bailout'
    | 'patrol'
    | 'heroes'
    | 'stageChest'
    | 'bossPreview'
    | 'energy'
    | 'energyInsufficient'
    | 'profile'
    | 'starterPack'
    | 'vipPass'
    | 'expeditions'
    | 'seasonPass'
    | 'memeWheel'
    | 'goldenGala'
    | 'dailyOracle'
    | 'worldBoss'
    | 'compoundVault'
    | 'stageJump'
    | 'ghostRace'
    | null
  >(null)
  const [profileNameInput, setProfileNameInput] = useState<string>(meta.playerName || 'SatoshiJr')
  const [saveSeedInput, setSaveSeedInput] = useState<string>('')
  const [saveSeedStatus, setSaveSeedStatus] = useState<string | null>(null)
  const [hubToast, setHubToast] = useState<string | null>(null)
  const [sweepResult, setSweepResult] = useState<{
    stageId: number
    hashrate: number
    shards: number
    gems: number
  } | null>(null)

  const showHubToast = (msg: string) => {
    setHubToast(msg)
    window.setTimeout(() => setHubToast(null), 2600)
  }

  useEffect(() => {
    setSelectedStage(meta.currentStage)
  }, [meta.currentStage])

  useEffect(() => {
    meta.syncEnergy()
    meta.syncDailyMissions()
    const id = window.setInterval(() => {
      meta.syncEnergy()
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Periodically spawn a clickable Camp Tip bubble above one of the owned heroes when the 1-hour cooldown is ready
  useEffect(() => {
    const unlockedIds = Object.keys(meta.ownedHeroes ?? { rookie_satoshi: 1 }).filter(
      (k) => (meta.ownedHeroes?.[k] ?? 0) > 0,
    )
    const timer = window.setInterval(() => {
      if (unlockedIds.length === 0) return
      const lastClaim = useMetaStore.getState().lastHeroCampClaimTimestamp ?? 0
      if (Date.now() - lastClaim < HERO_CAMP_COOLDOWN_MS) {
        setActiveTipHeroId(null)
        return
      }
      const pick = unlockedIds[Math.floor(Math.random() * unlockedIds.length)]
      setActiveTipHeroId(pick)
    }, 8000)
    return () => clearInterval(timer)
  }, [meta.ownedHeroes])

  const badges = useNotificationBadges(now)

  const maxSelectableStage = meta.devUnlockAllUi
    ? TOTAL_CAMPAIGN_STAGES
    : Math.min(TOTAL_CAMPAIGN_STAGES, Math.max(1, (meta.highestStageCleared ?? 0) + 1))
  const stageCfg = getStageConfig(selectedStage)
  const cycleInfo = getMarketCycle(selectedStage)
  const bossNode = stageCfg.nodes[stageCfg.nodes.length - 1]
  const boss = bossNode.enemy!
  const isStageLocked = selectedStage > maxSelectableStage
  const isStageCleared = selectedStage <= (meta.highestStageCleared ?? 0)
  const globalYield = meta.getGlobalYield()
  const biome = getStageBiomeInfo(selectedStage)

  const handleQuickSweep = () => {
    if (meta.energy < 5) {
      AudioSynth.unlock()
      setActiveModal('energyInsufficient')
      return
    }
    AudioSynth.unlock()
    const res = meta.quickSweepStage(selectedStage)
    if (res) {
      AudioSynth.playChestOpen()
      setSweepResult({
        stageId: selectedStage,
        hashrate: res.hashrate,
        shards: res.shards,
        gems: res.gems,
      })
      window.setTimeout(() => setSweepResult(null), 3200)
    }
  }

  const equippedHeroId = meta.equippedHeroId ?? 'rookie_satoshi'
  const equippedHero = HERO_MAP[equippedHeroId] ?? HERO_MAP.rookie_satoshi
  const currentLocation =
    BASE_LOCATION_MAP[meta.currentLocationId ?? 'outskirts_tent'] ??
    BASE_LOCATION_MAP.outskirts_tent
  const totalFurnitureLevels = Object.values(meta.furnitureLevels ?? {}).reduce(
    (sum, lv) => sum + lv,
    0,
  )
  const totalPowerScore = meta.getTotalPowerScore()
  const accountLevel = Math.max(
    1,
    meta.highestStageCleared + meta.ownedCoins.reduce((sum, c) => sum + c.level, 0),
  )

  // Idle Patrol live calculation
  const capHours = IDLE_RIG_CAP_HOURS + (meta.isVipAdFree ? VIP_EXTRA_RIG_CAP_HOURS : 0)
  const idlePreview = computeIdleReward(meta.lastIdleClaimTimestamp, now, capHours, globalYield)
  const ratePerHour = Math.round(IDLE_RIG_HASHRATE_PER_HOUR * globalYield)
  const capPct = Math.min(100, (idlePreview.seconds / (capHours * 3600)) * 100)

  const handleTapCampHero = (heroId: string) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    const quips = HERO_CAMP_QUIPS[heroId as keyof typeof HERO_CAMP_QUIPS] ?? HERO_CAMP_QUIPS.rookie_satoshi
    const fallbackQuip = quips[Math.floor(Math.random() * quips.length)]
    const tip = meta.claimCampHeroTip(heroId)
    if (tip.claimed) {
      setActiveTipHeroId(null)
      setActiveQuip({
        heroId,
        text: tip.quip || fallbackQuip,
        rewardText: `🎁 CAMP GIFT: +${tip.gems} Gems & +${tip.hashrate}⚡ Hashrate!`,
      })
    } else {
      setActiveQuip({
        heroId,
        text: tip.quip || fallbackQuip,
        rewardText: `⏳ Next Camp Gift in ${tip.remainingMinutes}m`,
      })
    }
    window.setTimeout(() => {
      setActiveQuip((prev) => (prev?.heroId === heroId ? null : prev))
    }, 3200)
  }

  const handleClaimRig = async (doubleWithAd: boolean) => {
    AudioSynth.unlock()
    if (doubleWithAd) {
      setAdClaimLoading(true)
      await showRewardedAd(meta.isVipAdFree)
      setAdClaimLoading(false)
    }
    AudioSynth.playChestOpen()
    const res = meta.claimIdleMining(doubleWithAd)
    setClaimToast(res)
    window.setTimeout(() => setClaimToast(null), 3500)
  }

  const handleStartRun = () => {
    if (isStageLocked) return
    AudioSynth.unlock()
    const ok = meta.spendEnergy(RUN_ENERGY_COST)
    if (!ok) {
      setActiveModal('energyInsufficient')
      return
    }
    AudioSynth.playCoinInject()
    meta.addCompoundVaultRebate(RUN_ENERGY_COST)
    meta.incrementDailyMetric('runsStarted', 1)
    if (meta.tutorialStep === 'ready_stage_1') {
      meta.setTutorialStep('completed')
    }
    run.startRun(selectedStage)
    onStartBattleRun()
  }

  return (
    <div className="relative flex h-full max-h-screen w-full flex-col justify-between overflow-hidden select-none">
      {/* 1. FULL-BLEED LIVING UPGRADABLE BASE CAMP DIORAMA WITH ALL OWNED HEROES */}
      <div className="absolute inset-0 z-0">
        <BaseCampDioramaSvg
          locationId={meta.currentLocationId ?? 'outskirts_tent'}
          furnitureLevels={meta.furnitureLevels}
          ownedHeroes={meta.ownedHeroes ?? { rookie_satoshi: 1 }}
          equippedHeroId={equippedHeroId}
          activeTipHeroId={activeTipHeroId}
          activeQuip={activeQuip}
          onTapHero={handleTapCampHero}
        />
        {/* Golden Bull Camp Statue (Whale Executive Pass Unlocked) */}
        {meta.hasGoldenBullStatue && (
          <div className="pointer-events-none absolute bottom-[30%] right-[12%] z-10 flex flex-col items-center animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#b45309] bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] text-3xl shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse">
              🐂
            </div>
            <div className="mt-0.5 rounded-full border border-[#78350f] bg-[#451a03]/90 px-2 py-0.2 font-display text-[7.5px] font-black text-[#fde047] shadow-sm">
              GOLDEN BULL
            </div>
          </div>
        )}
      </div>

      {/* 2. TOP SECTION: Header + Flash Offer + Stage Plaque Banner + Bear Mode / World Boss */}
      <div
        className="relative z-10 w-full shrink-0 flex flex-col gap-1 px-2.5 pt-2 safe-area-top-header"
        style={{ paddingTop: 'max(var(--safe-top, env(safe-area-inset-top)), 8px)' }}
      >
        {/* Top Header: Left Cream Hero Badge + Right 3D Bubble Resource Pills */}
        <div className="flex items-center justify-between gap-1.5 pr-11">
          {/* Top-Left Player & Hero Profile Cream Plaque */}
          <button
            type="button"
            onClick={() => {
              AudioSynth.unlock()
              AudioSynth.playCoinInject()
              setProfileNameInput(meta.playerName || 'SatoshiJr')
              setActiveModal('profile')
            }}
            className="group relative flex items-center gap-1.5 rounded-full border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-[#fff6e6] pl-1 pr-2.5 py-0.5 text-[#422006] shadow-md active:translate-y-0.5 transition-all"
          >
            {badges.vipStipendReady && <RedAlertBadge className="-top-1 -right-1" />}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#78350f] bg-gradient-to-b from-[#fde047] to-[#f59e0b] shadow-inner overflow-hidden">
              {meta.playerAvatarId?.startsWith('boss_') ? (
                <BossAvatarSvg
                  name="Boss"
                  portrait={meta.playerAvatarId.replace('boss_', '')}
                  size={36}
                />
              ) : (
                <HeroChibiSvg
                  heroId={(meta.playerAvatarId as HeroId) || equippedHeroId}
                  size={40}
                />
              )}
            </div>

            <div className="text-left leading-tight">
              <div className="flex items-center gap-1">
                <span className="max-w-[78px] truncate font-display text-[11px] font-black text-[#422006]">
                  {meta.playerName || equippedHero.name.split(' ')[0]}
                </span>
                <span className="rounded-full bg-[#fde047] border border-[#78350f] px-1.5 font-display text-[8px] font-black text-[#422006]">
                  Lv.{accountLevel}
                </span>
              </div>
              {/* Power Score Pill */}
              <div className="inline-flex items-center gap-0.5 font-display text-[10px] font-black text-[#d97706]">
                <span>⚔️</span>
                <span>{totalPowerScore.toLocaleString()}</span>
              </div>
            </div>
          </button>

          {/* Top-Right 3D Bubble Resource Counters */}
          <div className="flex items-center gap-1">
            {/* Energy Pill */}
            <button
              type="button"
              onClick={() => setActiveModal('energy')}
              className="flex items-center gap-1 rounded-full border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-[#fff6e6] pl-2 pr-1 py-0.5 text-[#422006] shadow-md active:scale-95"
              title="Trader Energy (Tap for Recharge Timer)"
            >
              <span className="font-display text-[11px] font-black text-[#422006]">
                ⚡ {meta.energy ?? MAX_ENERGY}/{MAX_ENERGY}
              </span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#14532d] bg-[#22c55e] font-display text-[11px] font-black text-white shadow-xs">
                +
              </span>
            </button>

            {/* Hashrate Pill */}
            <button
              type="button"
              onClick={() => onNavigateTab?.('base')}
              className="flex items-center gap-1 rounded-full border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-[#fff6e6] px-2 py-0.5 text-[#422006] shadow-md active:scale-95"
              title="Hashrate (Spend in Base HQ)"
            >
              <HashrateIcon size={14} />
              <span className="font-display text-[11px] font-black text-[#422006]">
                {fmtNum(meta.hashrate)}
              </span>
            </button>

            {/* Gems 3D Bubble */}
            {unlocks.shopTabUnlocked && (
              <button
                type="button"
                onClick={() => onNavigateTab?.('exchange')}
                className="flex items-center gap-1 rounded-full border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-[#fff6e6] pl-2 pr-1 py-0.5 text-[#422006] shadow-md active:scale-95"
                title="Satoshi Gems"
              >
                <SatoshiGemIcon size={14} />
                <span className="font-display text-[11px] font-black text-[#422006]">
                  {fmtNum(meta.gems)}
                </span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#14532d] bg-[#22c55e] font-display text-[11px] font-black text-white shadow-xs">
                  +
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Optional Flash Offer Banner if Margin Call Offer is Active */}
        {meta.marginCallOfferExpiresAt && meta.marginCallOfferExpiresAt > now && (
          <div className="relative z-20 mx-1 mt-0.5">
            <button
              type="button"
              onClick={() => setActiveModal('bailout')}
              className="flex w-full items-center justify-between rounded-2xl border-2 border-[#78350f] border-b-4 border-b-[#451a03] bg-gradient-to-r from-[#fde047] via-[#fb923c] to-[#f43f5e] px-3 py-1.5 text-left shadow-md active:translate-y-0.5"
            >
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-white animate-pulse" />
                <span className="font-display text-[11px] font-black text-white game-text-outline-sm">
                  WHALE BAILOUT 1200%
                </span>
              </div>
              <span className="flex items-center gap-1 font-display text-[10px] font-black text-white game-text-outline-sm">
                <Clock className="h-3 w-3" />
                {formatDuration((meta.marginCallOfferExpiresAt - now) / 1000)}
              </span>
            </button>
          </div>
        )}

        {/* Upper-Middle Sky: Cream & Gold Thick-Outline Stage Banner */}
        <div className="mx-auto flex w-full max-w-[335px] items-center justify-between gap-1.5">
          <button
            type="button"
            disabled={selectedStage <= 1}
            onClick={() => setSelectedStage((s) => Math.max(1, s - 1))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#3E2723] border-b-4 bg-white text-slate-900 shadow-md active:translate-y-0.5 disabled:opacity-30 hover:bg-amber-50 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6 stroke-[3.5]" />
          </button>

          {/* Thick-Outline Cream Stage Plaque with Market Cycle subtitle & Stage Jump Button */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setActiveModal('bossPreview')}
              className="relative flex w-full flex-col items-center rounded-3xl border-2 border-[#3E2723] border-b-4 bg-white px-2.5 py-1 text-slate-900 shadow-lg active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-1">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: biome.badgeColor }}
                />
                <span className="font-display text-[9.5px] font-black uppercase tracking-wider text-slate-900">
                  STAGE {stageCfg.stage}/{TOTAL_CAMPAIGN_STAGES} • {currentLocation.name} Lv.{totalFurnitureLevels}
                </span>
                {isStageCleared && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" />
                )}
                {isStageLocked && <Lock className="h-3.5 w-3.5 text-[#e11d48]" />}
              </div>

              <h2 className="font-display text-sm font-black tracking-wide text-slate-950">
                {stageCfg.stage}. {stageCfg.name}
              </h2>

              {/* Market Cycle Subtitle with Affix Mutator */}
              <div className="flex items-center gap-1 font-display text-[9px] font-black uppercase tracking-wide text-amber-950">
                <span>{cycleInfo.roman} • {cycleInfo.name}</span>
                {cycleInfo.affixId && (
                  <span className="rounded-md bg-red-100 border border-red-300 px-1 py-0.1 text-[8px] text-red-700 font-extrabold">
                    ⚡ {cycleInfo.affixName}
                  </span>
                )}
              </div>

              <div className="mt-0.5 flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[9px] font-display font-black text-slate-900">
                <span className="text-rose-700 flex items-center gap-1 font-black">
                  <Skull className="h-3 w-3" /> {boss.name}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-amber-800 font-black">
                  +{stageCfg.clearRewards.gems}💎 +{fmtNum(stageCfg.clearRewards.hashrate)}⚡
                </span>
              </div>
            </button>

            {/* Quick Stage Jump Pill Button */}
            {maxSelectableStage > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  AudioSynth.unlock()
                  AudioSynth.playCoinInject()
                  setActiveModal('stageJump')
                }}
                className="absolute -bottom-2 right-2 z-10 flex items-center gap-0.5 rounded-full border border-[#78350f] bg-gradient-to-r from-[#fef3c7] to-[#fde047] px-2 py-0.2 font-display text-[8px] font-black text-[#78350f] shadow-xs active:scale-95"
              >
                <span>⏩ JUMP</span>
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={selectedStage >= maxSelectableStage}
            onClick={() => setSelectedStage((s) => Math.min(maxSelectableStage, s + 1))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#3E2723] border-b-4 bg-white text-slate-900 shadow-md active:translate-y-0.5 disabled:opacity-30 hover:bg-amber-50 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6 stroke-[3.5]" />
          </button>
        </div>

        {/* Bear Market Mode Inverted Toggle (Unlocked at highestStageCleared >= 5) */}
        {(meta.highestStageCleared >= 5 || meta.devUnlockAllUi) && (
          <div className="mx-auto mt-0.5 flex max-w-[280px] items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                AudioSynth.unlock()
                AudioSynth.playCoinInject()
                meta.toggleBearMarketMode()
              }}
              className={`flex items-center gap-1 rounded-full border-2 border-[#3E2723] border-b-2 px-2.5 py-0.5 font-display text-[9.5px] font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 ${
                meta.isBearMarketMode
                  ? 'bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#7f1d1d] text-white ring-2 ring-red-500/50'
                  : 'bg-[#FFFDF9] text-[#6E5A4F] hover:bg-[#F3E9D8]'
              }`}
            >
              <span>{meta.isBearMarketMode ? '🩸' : '📈'}</span>
              <span>
                {meta.isBearMarketMode ? 'BEAR' : 'BULL'}
              </span>
              <span className={`rounded-full px-1 py-0.2 text-[8px] font-black ${
                meta.isBearMarketMode ? 'bg-black/40 text-amber-300' : 'bg-stone-200 text-stone-600'
              }`}>
                2x ⚡
              </span>
            </button>

            {/* Server World Boss (Central Bank Leviathan) Banner Button */}
            <button
              type="button"
              onClick={() => {
                AudioSynth.unlock()
                AudioSynth.playBossAlarm()
                setActiveModal('worldBoss')
              }}
              className="flex items-center gap-1 rounded-full border-2 border-[#831843] border-b-2 bg-gradient-to-r from-[#9d174d] to-[#be123c] px-2.5 py-0.5 font-display text-[9.5px] font-black text-white shadow-sm active:scale-95"
            >
              <span>🏦</span>
              <span>LEVIATHAN</span>
              <span className="rounded-full bg-black/40 px-1 py-0.2 text-[8px] text-amber-300">
                {meta.worldBossAttemptsLeft ?? 2}/2
              </span>
            </button>

            {/* Ghost Speedrun Race Banner Button */}
            <button
              type="button"
              onClick={() => {
                AudioSynth.unlock()
                AudioSynth.playCoinInject()
                setActiveModal('ghostRace')
              }}
              className="flex items-center gap-1 rounded-full border-2 border-[#1e1b4b] border-b-2 bg-gradient-to-r from-[#4338ca] to-[#6366f1] px-2.5 py-0.5 font-display text-[9.5px] font-black text-white shadow-sm active:scale-95"
            >
              <span>🏎️</span>
              <span>GHOST RACE</span>
              <span className="rounded-full bg-black/40 px-1 py-0.2 text-[8px] text-amber-300">
                {meta.raceTickets ?? 3}🎟️
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 3. INDEPENDENT FLOATING SIDE RAILS FOR EVENT BUBBLES (HIDDEN during tutorial lockdown) */}
      {!unlocks.isTutorialLockdown && (
        <>
          {/* LEFT SIDE RAIL: Starter, VIP, S1 Gala */}
          <div
            className={`absolute left-2 ${(meta.highestStageCleared >= 5 || meta.devUnlockAllUi) ? 'top-[172px]' : 'top-[148px]'} bottom-[150px] w-14 z-20 pointer-events-auto flex flex-col items-center gap-1.5 overflow-y-auto touch-pan-y no-scrollbar py-1`}
          >
            {unlocks.starterPackUnlocked &&
              !meta.hasBoughtStarterPack &&
              !meta.purchasedBundleIds.includes('first_ico_starter') && (
                <PeripheralBubbleButton
                  emoji="🎁"
                  label="Starter"
                  gradient="from-[#fb7185] to-[#e11d48]"
                  badge={badges.starterIcon}
                  onClick={() => {
                    AudioSynth.unlock()
                    AudioSynth.playCoinInject()
                    setActiveModal('starterPack')
                  }}
                />
              )}
            {unlocks.vipPassUnlocked && !meta.isVipAdFree && (
              <PeripheralBubbleButton
                emoji="👑"
                label="VIP"
                gradient="from-[#fde047] to-[#f59e0b]"
                badge={badges.vipIcon}
                onClick={() => {
                  AudioSynth.unlock()
                  AudioSynth.playCoinInject()
                  setActiveModal('vipPass')
                }}
              />
            )}
            {/* Season 1 "Golden Bull Gala" Flagship LiveOps Event Hub (unlocked after Stage 1) */}
            {(meta.highestStageCleared >= 1 || meta.devUnlockAllUi) && (
              <GoldenGalaFlagshipButton
                badge={badges.goldenGalaReady || badges.seasonPassReady}
                onClick={() => {
                  AudioSynth.unlock()
                  AudioSynth.playCoinInject()
                  setActiveModal('goldenGala')
                }}
              />
            )}
          </div>

          {/* RIGHT SIDE RAIL: Tasks, 7-Day, Oracle, Wheel, Compound Vault Piggy */}
          <div
            className={`absolute right-2 ${(meta.highestStageCleared >= 5 || meta.devUnlockAllUi) ? 'top-[172px]' : 'top-[148px]'} bottom-[150px] w-14 z-20 pointer-events-auto flex flex-col items-center gap-1.5 overflow-y-auto touch-pan-y no-scrollbar py-1`}
          >
            {unlocks.tasksUnlocked && (
              <PeripheralBubbleButton
                emoji="📋"
                label="Tasks"
                gradient="from-[#38bdf8] to-[#0284c7]"
                badge={badges.questsIcon}
                onClick={() => setActiveModal('quests')}
              />
            )}
            {unlocks.carnivalUnlocked && (
              <PeripheralBubbleButton
                emoji="🎉"
                label="7-Day"
                gradient="from-[#c084fc] to-[#7e22ce]"
                badge={badges.carnivalIcon}
                onClick={() => setActiveModal('carnival')}
              />
            )}
            {/* Daily Market Oracle Terminal Prop Button */}
            <PeripheralBubbleButton
              emoji="🔮"
              label="Oracle"
              gradient="from-[#a855f7] via-[#9333ea] to-[#6b21a8]"
              badge={meta.lastOraclePuzzleDate !== new Date().toISOString().slice(0, 10)}
              onClick={() => {
                AudioSynth.unlock()
                AudioSynth.playCoinInject()
                setActiveModal('dailyOracle')
              }}
            />

            {/* Weekend Meme-Coin Frenzy Spin Wheel */}
            <PeripheralBubbleButton
              emoji="🎡"
              label="Wheel"
              gradient="from-[#f472b6] via-[#ec4899] to-[#d946ef]"
              badge={badges.memeWheelReady}
              onClick={() => {
                AudioSynth.unlock()
                AudioSynth.playCoinInject()
                setActiveModal('memeWheel')
              }}
            />

            {/* Evolving Compound Vault Piggy Bank */}
            {(() => {
              const tierIdx = Math.min(2, Math.max(0, (meta.compoundVaultTier ?? 1) - 1))
              const vaultCfg = COMPOUND_VAULT_TIERS[tierIdx]
              const isFull = (meta.compoundVaultGems ?? 0) >= vaultCfg.capacityGems
              return (
                <button
                  type="button"
                  onClick={() => {
                    AudioSynth.unlock()
                    AudioSynth.playCoinInject()
                    setActiveModal('compoundVault' as any)
                  }}
                  className="group relative flex flex-col items-center shrink-0 active:scale-90 transition-transform"
                >
                  <div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#3E2723] border-b-[4px] bg-gradient-to-b from-[#fef08a] via-[#fde047] to-[#eab308] text-xl shadow-[0_4px_10px_rgba(66,32,6,0.38)] ${
                      isFull ? 'animate-bounce ring-2 ring-amber-400' : ''
                    }`}
                  >
                    <span className="pointer-events-none absolute top-0.5 left-2 right-2 h-1.5 rounded-full bg-white/50" />
                    {isFull && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow animate-pulse">
                        !
                      </span>
                    )}
                    <span className="relative z-10 drop-shadow">{vaultCfg.icon}</span>
                  </div>
                  <span className="-mt-1.5 rounded-full border border-[#78350f] bg-[#fff6e6] px-1.5 py-0.2 font-display text-[10px] leading-tight font-black tracking-tight text-amber-950 shadow-xs">
                    {isFull ? 'FULL!' : `${meta.compoundVaultGems ?? 0}`}
                  </span>
                </button>
              )
            })()}
          </div>
        </>
      )}

      {/* 4. MIDDLE ZONE: Living Camp Hero/Furniture Tap Area */}
      <div className="relative flex-1 w-full pointer-events-none" />

      {/* 5. FIXED BOTTOM ACTION & PATROL DECK */}
      <div className="relative z-20 w-full shrink-0 flex flex-col items-center justify-end px-3 pb-2 pt-1 pointer-events-auto">
        {/* Toast banner when Idle Patrol is claimed */}
        {claimToast && (
          <div className="mx-auto mb-1 rounded-full border-2 border-[#14532d] border-b-4 bg-[#4ade80] px-4 py-1 text-center font-display text-xs font-black text-white game-text-outline-sm shadow-lg animate-bounce shrink-0">
            +{fmtNum(claimToast.hashrate)} Hashrate &amp;{' '}
            {Object.values(claimToast.shards).reduce((a, b) => a + b, 0)} Shards Claimed!
          </div>
        )}

        {/* Toast banner when Quick Sweep is claimed */}
        {sweepResult && (
          <div className="mx-auto mb-1 rounded-full border-2 border-[#0284c7] border-b-4 bg-[#38bdf8] px-4 py-1 text-center font-display text-xs font-black text-white game-text-outline-sm shadow-lg animate-bounce shrink-0">
            ⚡ Stage {sweepResult.stageId} Swept! +{fmtNum(sweepResult.hashrate)} Hashrate, +{sweepResult.shards} Shards, +{sweepResult.gems}💎
          </div>
        )}

        {/* Upper sub-row: The 3 square cards (Bounty/Chests, Idle Mining Patrol Rig, and World Map/Turf) */}
        {!unlocks.isTutorialLockdown && (
          <div className="mx-auto mb-1.5 flex items-center justify-center gap-4 shrink-0">
            {/* Bounty (Stage Chest) */}
            {unlocks.bountyUnlocked && (
              <button
                type="button"
                onClick={() => setActiveModal('stageChest')}
                className="group relative flex flex-col items-center shrink-0 active:scale-95 transition-transform"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#3E2723] border-b-4 bg-gradient-to-b from-[#FFFDF9] to-[#F3E9D8] shadow-[0_4px_10px_rgba(44,24,16,0.25)]">
                  {badges.stageChest && <RedAlertBadge className="-top-1.5 -right-1.5" />}
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-xl shadow-inner">
                    📦
                  </div>
                </div>
                <span className="-mt-1 font-display text-[11px] font-black tracking-wide text-white game-text-outline-sm">
                  Bounty
                </span>
              </button>
            )}

            {/* Patrol (Idle Server Rig) */}
            {unlocks.patrolUnlocked && (
              <button
                type="button"
                onClick={() => setActiveModal('patrol')}
                className="group relative flex flex-col items-center shrink-0 active:scale-95 transition-transform"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#3E2723] border-b-4 bg-gradient-to-b from-[#FFFDF9] to-[#F3E9D8] shadow-[0_4px_10px_rgba(44,24,16,0.25)]">
                  {badges.patrolChest && <RedAlertBadge className="-top-1.5 -right-1.5" />}
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#3E2723] bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-xl shadow-inner">
                    ⛏️
                  </div>
                </div>
                <span className="-mt-1 font-display text-[11px] font-black tracking-wide text-white game-text-outline-sm">
                  Patrol
                </span>
              </button>
            )}

            {/* Dispatch (Offshore Arbitrage Expeditions) */}
            {Object.values(meta.ownedHeroes ?? { rookie_satoshi: 1 }).filter((lvl) => lvl > 0).length >= 2 && (
              <button
                type="button"
                onClick={() => setActiveModal('expeditions')}
                className="group relative flex flex-col items-center shrink-0 active:scale-95 transition-transform"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#3E2723] border-b-4 bg-gradient-to-b from-[#FFFDF9] to-[#F3E9D8] shadow-[0_4px_10px_rgba(44,24,16,0.25)]">
                  {badges.expeditionsReady && <RedAlertBadge className="-top-1.5 -right-1.5" />}
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#3E2723] bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-xl shadow-inner">
                    🗺️
                  </div>
                </div>
                <span className="-mt-1 font-display text-[11px] font-black tracking-wide text-white game-text-outline-sm">
                  Dispatch
                </span>
              </button>
            )}
          </div>
        )}

        {/* Lower sub-row: The primary action buttons elevated cleanly above bottom dock */}
        <div className="mx-auto w-full max-w-[335px] shrink-0 mb-3.5 backdrop-blur-md bg-black/40 border border-amber-500/30 rounded-2xl p-2 shadow-2xl">
          {isStageCleared ? (
            <div className="flex items-center gap-2 w-full">
              {/* Quick Sweep Button */}
              <button
                type="button"
                onClick={handleQuickSweep}
                className="flex-1 flex flex-col items-center justify-center rounded-2xl py-2 border-2 border-[#0369a1] border-b-4 border-b-[#075985] bg-gradient-to-b from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] text-white shadow-[0_4px_12px_rgba(2,132,199,0.35)] active:border-b-2 active:translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-1">
                  <span className="font-display text-[14px] font-black uppercase tracking-wide text-white game-text-outline-sm whitespace-nowrap">
                    ⚡ QUICK SWEEP
                  </span>
                  <span className="rounded-full border border-cyan-800 bg-cyan-100 px-1.5 py-0.2 font-display text-[9px] font-black text-cyan-950">
                    5⚡
                  </span>
                </div>
                <div className="mt-0.5 text-[9px] font-black text-cyan-100 flex items-center gap-1">
                  <span>+{fmtNum(Math.round(stageCfg.clearRewards.hashrate * globalYield))}⚡</span>
                  <span>•</span>
                  <span>Instant Loot</span>
                </div>
              </button>

              {/* Replay Run Button */}
              <button
                type="button"
                onClick={handleStartRun}
                className="flex-1 flex flex-col items-center justify-center rounded-2xl py-2 btn-3d-gold active:border-b-0 active:translate-y-1 shadow-[0_4px_12px_rgba(120,53,15,0.35)] transition-all"
              >
                <div className="flex items-center gap-1">
                  <span className="font-display text-[14px] font-black uppercase tracking-wide text-white game-text-outline whitespace-nowrap">
                    ⚔️ REPLAY
                  </span>
                  <span className="rounded-full border-2 border-[#422006] bg-[#fef08a] px-1.5 py-0.2 font-display text-[9px] font-black text-[#422006]">
                    ⚡ {RUN_ENERGY_COST}
                  </span>
                </div>
                <div className="mt-0.5 text-[9px] font-black text-amber-950 flex items-center gap-1">
                  <span>Stage {stageCfg.stage}</span>
                  <span>•</span>
                  <span>{stageCfg.nodes.length} Nodes</span>
                </div>
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-tutorial="start-run-btn"
              disabled={isStageLocked}
              onClick={handleStartRun}
              className={`group relative flex w-full flex-col items-center justify-center rounded-3xl py-2 transition-all ${
                isStageLocked
                  ? 'cursor-not-allowed border-2 border-[#78350f]/50 border-b-4 bg-[#e7e5e4] text-[#78716c]'
                  : 'btn-3d-gold active:border-b-0 active:translate-y-1 shadow-[0_6px_16px_rgba(120,53,15,0.4)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-display text-[17px] sm:text-lg font-black uppercase tracking-wide text-white game-text-outline whitespace-nowrap">
                  {isStageLocked ? `LOCKED (STAGE ${selectedStage - 1})` : `⚔️ START RUN: STAGE ${stageCfg.stage}`}
                </span>
                {!isStageLocked && (
                  <span className="rounded-full border-2 border-[#422006] bg-[#fef08a] px-2 py-0.5 font-display text-xs font-black text-[#422006] shadow-xs">
                    ⚡ {RUN_ENERGY_COST}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 rounded-full border border-[#78350f] bg-[#fff6e6] px-3 py-0.5 text-[10px] font-display font-black text-[#422006]">
                <span>💰 Seed: {fmtUsd(meta.baseSeedCapital * globalYield)}</span>
                <span>•</span>
                <span className="text-[#16a34a]">Mastery +{((globalYield - 1) * 100).toFixed(0)}%</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ────────────────── MODALS (CREAM & WOOD THICK-OUTLINE) ────────────────── */}

      {/* Energy Recharge / Countdown Modal */}
      {(activeModal === 'energy' || activeModal === 'energyInsufficient') && (
        <EnergyRechargeModal
          insufficientPrompt={activeModal === 'energyInsufficient'}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Collectible Trader Hero Loadout & Upgrade Modal */}
      <HeroLoadoutModal
        open={activeModal === 'heroes'}
        onClose={() => setActiveModal(null)}
      />

      {/* Idle Patrol / Server Rack Claim & 2x Ad Popup Modal */}
      {activeModal === 'patrol' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="flex w-full max-w-[360px] flex-col gap-3 rounded-3xl border-[3px] border-[#78350f] border-b-[6px] border-b-[#451a03] bg-[#fff6e6] p-5 text-[#422006] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#0284c7]">
                  24/7 Automated Mining Camp
                </div>
                <h3 className="font-display text-xl font-extrabold text-[#2C1810]">
                  IDLE PATROL REWARDS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="h-8 w-8 rounded-full border-2 border-[#78350f] bg-[#ffedd5] font-black text-sm text-[#422006]"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border-2 border-[#b45309] bg-[#ffedd5] p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-[#9a3412]">
                  Elapsed Time ({capHours}h Cap)
                </div>
                <div className="font-display text-base font-black text-[#422006]">
                  {formatDuration(idlePreview.seconds)}
                </div>
                <div className="text-[11px] font-black text-[#16a34a] mt-0.5">
                  Speed: +{fmtNum(ratePerHour)} Energy/hr
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-[#0284c7]">Accrued</div>
                <div className="font-display text-xl font-black text-white game-text-outline-sm">
                  +{fmtNum(Math.max(10, idlePreview.hashrate))}
                </div>
                <div className="text-[10px] font-black text-[#b45309]">Energy + Shards</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3.5 w-full overflow-hidden rounded-full border-2 border-[#78350f] bg-[#ffedd5]">
              <div
                className="h-full bg-gradient-to-r from-[#4ade80] to-[#16a34a]"
                style={{ width: `${Math.max(8, capPct)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleClaimRig(false)
                  setActiveModal(null)
                }}
                className="rounded-2xl py-3 font-display text-xs font-black btn-3d-cyan game-text-outline-sm"
              >
                CLAIM +{fmtNum(Math.max(10, idlePreview.hashrate))}
              </button>

              <button
                type="button"
                disabled={adClaimLoading}
                onClick={async () => {
                  await handleClaimRig(true)
                  setActiveModal(null)
                }}
                className="flex items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-xs font-black btn-3d-gold game-text-outline-sm"
              >
                <Tv className="h-4 w-4" />
                {adClaimLoading
                  ? 'MINING 2X...'
                  : `2x CLAIM (${meta.isVipAdFree ? 'VIP' : 'AD'})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Stage Enemy & Boss Scouting + Bounty Chests Popup Modal (Triggered by Top Stage Banner or Bounty Icon) */}
      {(activeModal === 'stageChest' || activeModal === 'bossPreview') && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="flex w-full max-w-[375px] max-h-[88vh] flex-col gap-3 rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#b45309]">
                  Stage {stageCfg.stage} Scouting &amp; Bounty Dossier
                </div>
                <h3 className="font-display text-lg font-extrabold text-[#2C1810]">
                  {stageCfg.name.toUpperCase()}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="h-8 w-8 rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] font-black text-sm text-[#2C1810]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
              {/* Stage Final Boss & Enemy Scouting Card */}
              <div className="rounded-2xl border-2 border-[#3E2723] bg-[#F3E9D8] p-3">
                <div className="flex items-center gap-3">
                  <BossAvatarSvg name={boss.name} portrait={boss.portrait} size={56} />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center justify-between gap-1">
                      <span className="rounded-full border border-[#9f1239] bg-[#ffe4e6] px-2 py-0.2 font-display text-[9px] font-black uppercase text-[#be123c]">
                        ⚠️ NODE {stageCfg.nodes.length} FINAL BOSS
                      </span>
                      <span className="font-display text-[10px] font-black text-[#16a34a]">
                        +{stageCfg.clearRewards.gems}💎 +{fmtNum(stageCfg.clearRewards.hashrate)}⚡
                      </span>
                    </div>
                    <div className="truncate font-display text-sm font-extrabold text-[#2C1810] mt-0.5">
                      {boss.name}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold">
                      <span className="rounded-md bg-[#fee2e2] border border-[#ef4444]/40 px-1.5 py-0.2 text-[#991b1b]">
                        HP: ${fmtNum(Math.round(boss.hp * COMBAT.enemyHpScale))}
                      </span>
                      <span className="rounded-md bg-[#fef3c7] border border-[#d97706]/40 px-1.5 py-0.2 text-[#92400e]">
                        ATK: -{boss.attack} HP / {boss.attackCooldown}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Market Cycle Affix Warning */}
                {stageCfg.affix && (
                  <div className="mt-2 rounded-xl border border-red-300 bg-red-50 px-2.5 py-1.5 text-left text-[10px] font-bold text-red-900">
                    <span className="font-black uppercase text-red-700">⚡ AFFIX ({stageCfg.affix.name}):</span>{' '}
                    {stageCfg.affix.description}
                  </div>
                )}

                {/* Cycle Breakthrough Crate Announcement */}
                {stageCfg.isCycleBreakthrough && (
                  <div className="mt-2 rounded-xl border-2 border-amber-500 bg-gradient-to-r from-amber-100 to-yellow-100 px-2.5 py-1.5 text-left text-[10px] font-bold text-amber-950">
                    <span className="font-black uppercase text-amber-800">🏆 CYCLE BREAKTHROUGH REWARDS:</span>{' '}
                    Awards 10 Hero Fragments, 5 Quantum Keys, and +1,000 Satoshi Gems on First Clear!
                  </div>
                )}

                {boss.hazard && (
                  <div className="mt-2 rounded-xl border border-[#9333ea]/40 bg-[#f3e8ff] px-2.5 py-1.5 text-left text-[10px] font-bold text-[#6b21a8]">
                    <span className="font-black uppercase">{boss.hazard.name} ({boss.hazard.interval}s):</span>{' '}
                    {boss.hazard.description}
                  </div>
                )}

                {/* Tactical Scouting Tip */}
                <div className="mt-2 flex items-start gap-1.5 rounded-xl border border-[#d97706]/40 bg-[#FFFDF9] px-2.5 py-1.5 text-left text-[10px] font-bold text-[#2C1810]">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#d97706] mt-0.5" />
                  <span>
                    <strong>Tactical Tip:</strong> Place your highest-DPS coin in{' '}
                    <span className="text-[#15803d] font-black">Slot #1 (40% Starting Cap)</span> and
                    draft Compound Interest or Moonbag Catalyst to break {boss.name}&apos;s orderbook!
                  </span>
                </div>
              </div>

              {/* Slot-Position Starting Hierarchy Overview */}
              <div className="rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8]/70 px-3 py-2">
                <div className="font-display text-[10px] font-extrabold uppercase tracking-wider text-[#6E5A4F] mb-1">
                  Hands-Off Slot Starting Capacity Hierarchy
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {[
                    { slot: 1, cap: '40%', tag: 'Lead' },
                    { slot: 2, cap: '30%', tag: 'Core' },
                    { slot: 3, cap: '20%', tag: 'Flex' },
                    { slot: 4, cap: '10%', tag: 'Moonbag' },
                  ].map((s) => (
                    <div
                      key={s.slot}
                      className="rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] py-1 px-1"
                    >
                      <div className="font-display text-[9px] font-extrabold text-[#6E5A4F]">
                        Slot #{s.slot}
                      </div>
                      <div className="font-display text-xs font-black text-[#16a34a]">
                        {s.cap}
                      </div>
                      <div className="text-[8px] font-bold text-[#b45309]">{s.tag}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Clear Bounty Chests */}
              <div>
                <div className="font-display text-[10px] font-extrabold uppercase tracking-wider text-[#6E5A4F] mb-1.5 px-1">
                  Stage Clear Bounty Chests
                </div>
                <div className="space-y-1.5">
                  {[1, 2, 3, 4, 5, 6].map((st) => {
                    const cleared = meta.highestStageCleared >= st
                    const claimed = (meta.claimedStageChestMilestones ?? []).includes(st)
                    return (
                      <div
                        key={st}
                        className="flex items-center justify-between rounded-2xl border-2 border-[#E2D5C1] bg-[#F3E9D8] p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{claimed ? '📭' : '📦'}</span>
                          <div>
                            <div className="font-display text-xs font-black text-[#2C1810]">
                              Stage {st} Clear Chest
                            </div>
                            <div className="text-[10px] font-bold text-[#6E5A4F]">
                              +{120 * st} Gems • +2 Keys • +{600 * st}⚡
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!cleared || claimed}
                          onClick={() => {
                            AudioSynth.playChestOpen()
                            meta.claimStageChestMilestone(st)
                          }}
                          className={`rounded-xl px-3 py-1.5 font-display text-xs font-black ${
                            claimed
                              ? 'bg-[#e7e5e4] text-[#78716c]'
                              : cleared
                                ? 'btn-3d-gold game-text-outline-sm'
                                : 'border border-[#E2D5C1] bg-[#FFFDF9] text-[#6E5A4F]'
                          }`}
                        >
                          {claimed ? 'Claimed' : cleared ? 'CLAIM!' : 'Locked'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full shrink-0 rounded-2xl py-2.5 font-display text-xs font-black btn-3d-green game-text-outline-sm"
            >
              CLOSE SCOUTING DOSSIER
            </button>
          </div>
        </div>
      )}

      {/* Daily Quests & 100-Point Milestone Track Modal */}
      {activeModal === 'quests' && <DailyQuestsModal onClose={() => setActiveModal(null)} />}

      {/* 7-Day New Trader Carnival Modal */}
      {activeModal === 'carnival' && <CarnivalModal onClose={() => setActiveModal(null)} />}

      {/* Whale Bailout 2-Hour Flash Offer Modal */}
      {activeModal === 'bailout' && meta.marginCallOfferExpiresAt && (
        <MarginCallOfferModal
          expiresAt={meta.marginCallOfferExpiresAt}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Hub Action Toast */}
      {hubToast && (
        <div className="pointer-events-none fixed top-16 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-[#14532d] border-b-4 bg-[#4ade80] px-4 py-1 text-center font-display text-xs font-black text-white game-text-outline-sm shadow-2xl animate-bounce">
          {hubToast}
        </div>
      )}

      {/* ───────── DEDICATED STARTER PACK POPUP MODAL ───────── */}
      {activeModal === 'starterPack' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="flex w-full max-w-[365px] flex-col gap-3 rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-5 text-[#2C1810] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-[#9f1239] bg-[#ffe4e6] px-2.5 py-0.5 font-display text-[10px] font-extrabold uppercase text-[#be123c]">
                🔥 800% VALUE • ONE-TIME OFFER
              </span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] font-black text-xs text-[#2C1810]"
              >
                ✕
              </button>
            </div>

            {/* Featured Bundle Hero Showcase: Lady Fortuna */}
            <div className="flex items-center gap-3 rounded-2xl border-2 border-[#3E2723] bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] p-3 shadow-inner">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#3E2723] bg-gradient-to-b from-[#fbbf24] to-[#d97706] shadow">
                <HeroChibiSvg heroId="lady_fortuna" size={76} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="rounded-full bg-[#2C1810] px-2 py-0.5 font-display text-[9px] font-black uppercase text-[#fde047]">
                  INSTANT LEGENDARY HERO
                </span>
                <h3 className="mt-0.5 font-display text-base font-black text-[#2C1810]">
                  Lady Fortuna
                </h3>
                <p className="text-[11px] font-bold text-[#6E5A4F] leading-snug">
                  High-Roller Whale • +18% Green Roll Chance &amp; Royal Jackpot Dividend!
                </p>
              </div>
            </div>

            {/* Bundle Loot Grid */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-2.5 text-xs font-extrabold text-[#2C1810]">
              <div className="flex items-center gap-1.5 rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
                <span>🦸</span>
                <span>Lady Fortuna + 50🧩</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
                <span>⚡</span>
                <span>Epic SolanaSpeed</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
                <SatoshiGemIcon size={15} />
                <span>+1,200 Gems</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
                <VaultKeyIcon size={15} />
                <span>+5 Silver Keys</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                AudioSynth.unlock()
                if (meta.purchaseBundle('first_ico_starter')) {
                  AudioSynth.playMythicalDrop()
                  showHubToast('🎁 Starter Pack Unlocked! Lady Fortuna Joined Camp!')
                  setActiveModal(null)
                }
              }}
              className="w-full rounded-2xl py-3.5 font-display text-sm font-black uppercase tracking-wider text-white btn-3d-green game-text-outline shadow-lg active:translate-y-0.5"
            >
              CLAIM STARTER PACK • $0.99
            </button>
          </div>
        </div>
      )}

      {/* ───────── DEDICATED VIP PASS POPUP MODAL ───────── */}
      {activeModal === 'vipPass' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="flex w-full max-w-[365px] flex-col gap-3 rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-5 text-[#2C1810] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#F59E0B] bg-[#FEF3C7] px-2.5 py-0.5 font-display text-[10px] font-extrabold uppercase text-[#92400E]">
                <Crown className="h-3.5 w-3.5 text-[#d97706]" /> PERMANENT EXECUTIVE PASS
              </span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] font-black text-xs text-[#2C1810]"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border-2 border-[#3E2723] bg-gradient-to-br from-[#fde047] via-[#f59e0b] to-[#d97706] p-3.5 text-[#2C1810] shadow">
              <h3 className="font-display text-lg font-black text-white game-text-outline">
                👑 VIP AD-FREE &amp; 4X SPEED PASS
              </h3>
              <p className="mt-0.5 text-xs font-extrabold text-[#2C1810]">
                Permanent executive privileges across all Runs, Daily Raids &amp; Idle Patrols!
              </p>
            </div>

            <div className="space-y-1.5 rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3 text-xs font-bold text-[#2C1810]">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#16a34a] stroke-[3]" />
                <span>⚡ Unlock <strong>4x Hyper-Speed</strong> in Live Trading Battles</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#16a34a] stroke-[3]" />
                <span>🎯 <strong>Unlimited Instant Auto-Sweep</strong> on Cleared Daily Raids</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#16a34a] stroke-[3]" />
                <span>📺 Skip All Rewarded Ads (Instant 2x Patrol &amp; Bailout Revives)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#16a34a] stroke-[3]" />
                <span>💎 <strong>Daily VIP Stipend</strong> (+100 Gems &amp; +1 Silver Key / Day)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#16a34a] stroke-[3]" />
                <span>🎁 Instant Bonus: <strong>+500 Gems &amp; +30 Lady Fortuna Shards</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                AudioSynth.unlock()
                if (meta.purchaseBundle('vip_pass')) {
                  AudioSynth.playMythicalDrop()
                  showHubToast('👑 VIP Executive Pass Activated! Daily Stipend Ready!')
                  setActiveModal(null)
                }
              }}
              className="w-full rounded-2xl py-3.5 font-display text-sm font-black uppercase tracking-wider text-white btn-3d-gold game-text-outline shadow-lg active:translate-y-0.5"
            >
              UNLOCK VIP PASS • $9.99
            </button>
          </div>
        </div>
      )}

      {/* ───────── DEDICATED PLAYER PROFILE & VIP EXECUTIVE LOUNGE MODAL ───────── */}
      {activeModal === 'profile' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="flex max-h-[86vh] w-full max-w-[375px] flex-col gap-3 overflow-hidden rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-2.5">
              <div>
                <span className="rounded-full border border-[#E2D5C1] bg-[#F3E9D8] px-2 py-0.2 font-display text-[9px] font-extrabold uppercase text-[#b45309]">
                  COMMANDER LICENSE
                </span>
                <h3 className="font-display text-base font-extrabold text-[#2C1810]">
                  TRADER PROFILE &amp; VIP LOUNGE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] font-black text-xs text-[#2C1810]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
              {/* 1) TRADER IDENTITY: Editable Name + Selectable Avatar Portrait */}
              <div className="rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] shadow">
                    {meta.playerAvatarId?.startsWith('boss_') ? (
                      <BossAvatarSvg
                        name="Boss"
                        portrait={meta.playerAvatarId.replace('boss_', '')}
                        size={50}
                      />
                    ) : (
                      <HeroChibiSvg
                        heroId={(meta.playerAvatarId as HeroId) || equippedHeroId}
                        size={54}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-[#2C1810] px-2 py-0.2 font-display text-[9px] font-black text-[#fde047]">
                        Lv.{accountLevel}
                      </span>
                      <span className="font-display text-xs font-black text-[#d97706]">
                        ⚔️ {totalPowerScore.toLocaleString()} Power
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <input
                        type="text"
                        maxLength={16}
                        value={profileNameInput}
                        onChange={(e) => setProfileNameInput(e.target.value)}
                        placeholder="Trader Name"
                        className="w-full rounded-xl border border-[#3E2723] bg-[#FFFDF9] px-2.5 py-1 font-display text-xs font-extrabold text-[#2C1810] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          AudioSynth.unlock()
                          AudioSynth.playCoinInject()
                          meta.setPlayerProfile(
                            profileNameInput,
                            meta.playerAvatarId || equippedHeroId,
                          )
                          showHubToast('✅ Trader Handle Saved!')
                        }}
                        className="shrink-0 rounded-xl px-2.5 py-1 font-display text-[10px] font-black uppercase btn-3d-amber text-[#2C1810]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selectable Avatar Portrait Row (Unlocked Heroes + Boss Trophy Avatars) */}
                <div className="mt-2.5">
                  <div className="mb-1 font-display text-[9px] font-black uppercase tracking-wider text-[#6E5A4F]">
                    Select Avatar Portrait (Unlocked Heroes &amp; Bosses)
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {HEROES.filter((h) => (meta.ownedHeroes?.[h.id] ?? 0) > 0).map((h) => {
                      const selected = (meta.playerAvatarId || equippedHeroId) === h.id
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            AudioSynth.playCoinInject()
                            meta.setPlayerProfile(profileNameInput, h.id)
                          }}
                          className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-[#FFFDF9] transition-transform ${
                            selected
                              ? 'border-[#16a34a] ring-2 ring-[#22c55e] scale-105'
                              : 'border-[#3E2723]'
                          }`}
                        >
                          <HeroChibiSvg heroId={h.id} size={42} />
                        </button>
                      )
                    })}
                    {['whale', 'hacker', 'bear'].map((bossPortrait, i) => {
                      if (meta.highestStageCleared <= i) return null
                      const avId = `boss_${bossPortrait}`
                      const selected = meta.playerAvatarId === avId
                      return (
                        <button
                          key={avId}
                          type="button"
                          onClick={() => {
                            AudioSynth.playCoinInject()
                            meta.setPlayerProfile(profileNameInput, avId)
                          }}
                          className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-[#FFFDF9] transition-transform ${
                            selected
                              ? 'border-[#16a34a] ring-2 ring-[#22c55e] scale-105'
                              : 'border-[#3E2723]'
                          }`}
                        >
                          <BossAvatarSvg name="Boss" portrait={bossPortrait} size={40} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 2) LIFETIME CAREER STATS */}
              <div className="rounded-2xl border border-[#E2D5C1] bg-[#F3E9D8] p-3">
                <div className="mb-1.5 font-display text-[10px] font-black uppercase tracking-wider text-[#2C1810]">
                  📊 Lifetime Career Stats
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
                    <div className="text-[10px] font-semibold text-[#6E5A4F]">
                      Highest Stage Cleared
                    </div>
                    <div className="font-display text-sm font-black text-[#2C1810]">
                      Stage {meta.highestStageCleared}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
                    <div className="text-[10px] font-semibold text-[#6E5A4F]">
                      Total Runs Played
                    </div>
                    <div className="font-display text-sm font-black text-[#2C1810]">
                      {meta.careerStats?.totalRunsPlayed ?? 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
                    <div className="text-[10px] font-semibold text-[#6E5A4F]">
                      Biggest Green Candle
                    </div>
                    <div className="font-display text-sm font-black text-[#16a34a]">
                      {fmtUsd(meta.careerStats?.biggestGreenCandle ?? 0)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
                    <div className="text-[10px] font-semibold text-[#6E5A4F]">
                      Total Coins Forged
                    </div>
                    <div className="font-display text-sm font-black text-[#b45309]">
                      {meta.careerStats?.totalCoinsForged ?? 0}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-between rounded-xl border border-[#E2D5C1] bg-[#FFFDF9] p-2">
                    <div>
                      <div className="text-[10px] font-semibold text-[#6E5A4F]">
                        Highest Margin Tower Floor
                      </div>
                      <div className="font-display text-sm font-black text-[#7e22ce]">
                        🗼 Floor {meta.highestTowerFloorCleared ?? 0}
                      </div>
                    </div>
                    <span className="rounded-full bg-[#f3e8ff] px-2 py-0.5 font-display text-[9px] font-black text-[#7e22ce]">
                      ENDLESS GAUNTLET
                    </span>
                  </div>
                </div>
              </div>

              {/* 3) VIP EXECUTIVE LOUNGE & DAILY STIPEND */}
              <div className="rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-[#d97706]" />
                    <span className="font-display text-xs font-extrabold uppercase text-[#2C1810]">
                      VIP Executive Lounge
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 font-display text-[9px] font-black uppercase ${
                      meta.isVipAdFree
                        ? 'bg-[#22c55e] text-white'
                        : 'border border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F]'
                    }`}
                  >
                    {meta.isVipAdFree ? '👑 VIP ACTIVE' : 'STANDARD TRADER'}
                  </span>
                </div>

                <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px] font-bold text-[#6E5A4F]">
                  <span className="rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] px-2 py-0.5 text-[#2C1810]">
                    ⚡ 4x Battle Speed
                  </span>
                  <span className="rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] px-2 py-0.5 text-[#2C1810]">
                    🎯 Unlimited Raid Sweep
                  </span>
                  <span className="rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] px-2 py-0.5 text-[#2C1810]">
                    📺 100% Ad-Free
                  </span>
                </div>

                {meta.isVipAdFree ? (
                  <button
                    type="button"
                    disabled={!badges.vipStipendReady}
                    onClick={() => {
                      AudioSynth.unlock()
                      if (meta.claimDailyVipStipend()) {
                        AudioSynth.playChestOpen()
                        showHubToast('👑 Claimed Daily VIP Stipend: +100💎 & +1 Key!')
                      }
                    }}
                    className={`mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 font-display text-xs font-black uppercase ${
                      badges.vipStipendReady
                        ? 'btn-3d-gold text-white game-text-outline-sm animate-pulse'
                        : 'border border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F] cursor-default'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>
                      {badges.vipStipendReady
                        ? 'CLAIM DAILY VIP STIPEND (+100💎 & +1 KEY)'
                        : '✓ DAILY VIP STIPEND CLAIMED TODAY'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveModal('vipPass')}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 font-display text-xs font-black uppercase text-white btn-3d-gold game-text-outline-sm"
                  >
                    <Crown className="h-4 w-4" />
                    <span>UNLOCK VIP EXECUTIVE PASS ($9.99)</span>
                  </button>
                )}
              </div>

              {/* 4) CROSS-DEVICE "WALLET SEED" SAVE TRANSFER (CR-SAVE-v2:) */}
              <div className="rounded-2xl border-2 border-[#3E2723] bg-[#F3E9D8] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-[10px] font-black uppercase tracking-wider text-[#2C1810]">
                    🔐 Cross-Device Wallet Seed Backup
                  </span>
                  <span className="rounded-full border border-[#3E2723] bg-[#FFFDF9] px-2 py-0.2 font-mono text-[8.5px] font-bold text-[#7e22ce]">
                    CR-SAVE-v2:
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-[#6E5A4F] mb-2">
                  Export your encrypted Base64 Wallet Seed to clipboard or paste a seed below to restore your account across devices.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const seed = meta.exportSaveSeed()
                      setSaveSeedInput(seed)
                      navigator.clipboard?.writeText(seed).catch(() => {})
                      AudioSynth.playCoinInject()
                      setSaveSeedStatus('✅ Copied CR-SAVE-v2 Seed to Clipboard!')
                      showHubToast('📤 Copied CR-SAVE-v2 Wallet Seed to Clipboard!')
                    }}
                    className="rounded-xl border-2 border-[#3E2723] border-b-4 bg-[#22c55e] px-2.5 py-2 font-display text-[10px] font-black text-white shadow-xs active:translate-y-0.5"
                  >
                    📤 Export Save Seed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = meta.importSaveSeed(saveSeedInput)
                      if (res.ok) {
                        AudioSynth.playChestOpen()
                        setSaveSeedStatus(`✅ ${res.message}`)
                        showHubToast(res.message)
                      } else {
                        AudioSynth.playBossAlarm()
                        setSaveSeedStatus(`❌ ${res.message}`)
                      }
                    }}
                    className="rounded-xl border-2 border-[#3E2723] border-b-4 bg-[#0284c7] px-2.5 py-2 font-display text-[10px] font-black text-white shadow-xs active:translate-y-0.5"
                  >
                    📥 Import Save Seed
                  </button>
                </div>

                <input
                  type="text"
                  value={saveSeedInput}
                  onChange={(e) => setSaveSeedInput(e.target.value)}
                  placeholder="Paste CR-SAVE-v2:... seed string here"
                  className="w-full rounded-xl border-2 border-[#3E2723] bg-[#FFFDF9] px-2.5 py-1.5 font-mono text-[10px] font-bold text-[#2C1810] outline-none focus:border-[#7e22ce]"
                />
                {saveSeedStatus && (
                  <div className="mt-1.5 font-display text-[9.5px] font-black text-[#166534]">
                    {saveSeedStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offshore Piggy Bank Modal */}
      {activeModal === 'piggy' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl arcade-card p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl animate-bounce">🐷</div>
            <h3 className="font-display text-lg font-extrabold text-[#2C1810]">
              OFFSHORE PIGGY BANK
            </h3>
            <p className="text-xs font-bold text-[#422006]">
              Every node cleared stashes bonus Satoshi Gems inside your reserve, even on defeat!
            </p>
            <div className="rounded-xl border-2 border-[#b45309] bg-[#ffedd5] px-5 py-2.5 font-display text-lg font-black text-[#db2777]">
              {meta.piggyBankGems} Satoshi Gems Stored
            </div>
            <button
              type="button"
              disabled={meta.piggyBankGems <= 0}
              onClick={() => {
                AudioSynth.playChestOpen()
                meta.crackPiggyBank()
                setActiveModal(null)
              }}
              className="w-full rounded-2xl py-3 font-display text-sm font-black btn-3d-red game-text-outline-sm disabled:opacity-40"
            >
              CRACK PIGGY BANK &amp; COLLECT
            </button>
          </div>
        </div>
      )}

      {/* Offshore Arbitrage Expeditions Modal */}
      {activeModal === 'expeditions' && (
        <ExpeditionsModal onClose={() => setActiveModal(null)} />
      )}

      {/* S1: Golden Bull Gala Multi-Activity Event Hub Modal */}
      <SeasonEventHubModal
        isOpen={activeModal === 'goldenGala'}
        onClose={() => setActiveModal(null)}
        onNavigateTab={onNavigateTab}
        onStartBattleRun={handleStartRun}
      />

      {/* 28-Day Bull Market Season Pass Modal */}
      <SeasonPassModal
        isOpen={activeModal === 'seasonPass'}
        onClose={() => setActiveModal(null)}
      />

      {/* Weekend Meme-Coin Frenzy Spin Wheel Modal */}
      <MemeWheelModal
        isOpen={activeModal === 'memeWheel'}
        onClose={() => setActiveModal(null)}
      />

      {/* Daily Market Oracle Candlestick Prediction Terminal Modal */}
      {activeModal === 'dailyOracle' && (
        <DailyPuzzleModal onClose={() => setActiveModal(null)} />
      )}

      {/* Server World Boss (Central Bank Leviathan) Modal */}
      {activeModal === 'worldBoss' && (
        <WorldBossModal onClose={() => setActiveModal(null)} />
      )}

      {/* Evolving Compound Vault Modal */}
      {activeModal === ('compoundVault' as any) && (
        <CompoundVaultModal onClose={() => setActiveModal(null)} />
      )}

      {/* Rapid Stage Jump Slider Modal */}
      {activeModal === 'stageJump' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="flex w-full max-w-[360px] flex-col gap-3 rounded-3xl border-[3px] border-[#3E2723] border-b-[6px] bg-[#FFFDF9] p-4 text-[#2C1810] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-2">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#b45309]">
                  Rapid Campaign Navigation
                </div>
                <h3 className="font-display text-lg font-extrabold text-[#2C1810]">
                  SELECT STAGE (1–{maxSelectableStage})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="h-8 w-8 rounded-full border-2 border-[#3E2723] bg-[#F3E9D8] font-black text-sm text-[#2C1810]"
              >
                ✕
              </button>
            </div>

            {/* Stage Preview Card */}
            {(() => {
              const previewCfg = getStageConfig(selectedStage)
              const previewCycle = getMarketCycle(selectedStage)
              const isCleared = selectedStage <= (meta.highestStageCleared ?? 0)
              return (
                <div className="flex flex-col items-center rounded-2xl border-2 border-[#3E2723] bg-[#F3E9D8] p-3 text-center">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#78350f]">
                    {previewCycle.roman} • {previewCycle.name}
                  </div>
                  <div className="font-display text-2xl font-black text-[#2C1810] my-0.5 flex items-center gap-1.5">
                    <span>STAGE {previewCfg.stage}</span>
                    {isCleared && <CheckCircle2 className="h-5 w-5 text-green-600 inline" />}
                  </div>
                  <div className="font-display text-sm font-bold text-[#854d0e]">
                    &quot;{previewCfg.name}&quot;
                  </div>
                  {previewCycle.affixName && (
                    <div className="mt-1.5 rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-[9px] font-extrabold text-red-700">
                      ⚡ Affix: {previewCycle.affixName}
                    </div>
                  )}
                  {previewCfg.isCycleBreakthrough && (
                    <div className="mt-1 rounded-full border border-amber-400 bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold text-amber-800">
                      🏆 Cycle Breakthrough Stage (+1,000💎 +10 Frags +5 Keys)
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Slider Control */}
            <div className="flex flex-col gap-1 px-1">
              <div className="flex justify-between text-[11px] font-black text-[#6E5A4F]">
                <span>Stage 1</span>
                <span className="text-amber-800">Stage {selectedStage}</span>
                <span>Stage {maxSelectableStage}</span>
              </div>
              <input
                type="range"
                min={1}
                max={maxSelectableStage}
                value={selectedStage}
                onChange={(e) => setSelectedStage(Number(e.target.value))}
                className="w-full h-3 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-[#b45309]"
              />
            </div>

            {/* Quick Step Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedStage((s) => Math.max(1, s - 10))}
                className="rounded-xl border border-[#78350f] bg-[#fff6e6] py-1 font-display text-[10px] font-black text-[#78350f] active:scale-95"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => setSelectedStage((s) => Math.max(1, s - 1))}
                className="rounded-xl border border-[#78350f] bg-[#fff6e6] py-1 font-display text-[10px] font-black text-[#78350f] active:scale-95"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => setSelectedStage((s) => Math.min(maxSelectableStage, s + 1))}
                className="rounded-xl border border-[#78350f] bg-[#fff6e6] py-1 font-display text-[10px] font-black text-[#78350f] active:scale-95"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => setSelectedStage((s) => Math.min(maxSelectableStage, s + 10))}
                className="rounded-xl border border-[#78350f] bg-[#fff6e6] py-1 font-display text-[10px] font-black text-[#78350f] active:scale-95"
              >
                +10
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full rounded-2xl btn-3d-gold py-2 font-display text-sm font-black uppercase tracking-wide text-white shadow-md active:translate-y-0.5"
            >
              ✓ CONFIRM STAGE {selectedStage}
            </button>
          </div>
        </div>
      )}

      {/* Ghost Speedrun Race Modal Overlay */}
      {activeModal === 'ghostRace' && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0f1d]">
          <GhostRaceScreen onBack={() => setActiveModal(null)} />
        </div>
      )}

      {/* Wall-Breaker AI Flash Offer Modal */}
      {meta.wallBreakerOfferType && meta.wallBreakerOfferExpiresAt && (
        <WallBreakerOfferModal
          type={meta.wallBreakerOfferType}
          targetHeroId={meta.wallBreakerHeroId ?? undefined}
          onClose={() => meta.dismissWallBreakerOffer()}
        />
      )}
    </div>
  )
}

/**
 * Flagship LiveOps Event Hub button for "S1: Golden Bull Gala" featuring animated glow,
 * lady fortuna roulette motif, countdown timer pill, and red [!] alert badge.
 */
function GoldenGalaFlagshipButton({
  badge,
  onClick,
}: {
  badge?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center shrink-0 active:scale-90 transition-transform"
      aria-label="Season 1: Golden Bull Gala Event Hub"
    >
      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#78350f] border-[2.5px] border-[#ffe484] border-b-[4px] border-b-[#451a03] text-xl shadow-[0_4px_12px_rgba(245,158,11,0.5),inset_0_2px_0_rgba(255,255,255,0.7)] animate-pulse">
        {/* Specular top gloss highlight */}
        <span className="pointer-events-none absolute top-0.5 left-2 right-2 h-1.5 rounded-full bg-white/60" />
        {badge && <RedAlertBadge className="-top-1 -right-1" />}
        <span className="relative z-10 drop-shadow">🎡</span>
      </div>
      <span className="-mt-1.5 flex flex-col items-center rounded-full border border-[#78350f] bg-gradient-to-b from-[#450a0a] to-[#200505] px-1.5 py-0.2 shadow-md">
        <span className="font-display text-[9px] font-black tracking-tight text-[#fde047] leading-tight">
          S1 GALA
        </span>
        <span className="text-[7px] font-black text-[#fbcfe8] leading-none">
          24d 18h
        </span>
      </span>
    </button>
  )
}

/**
 * Glossy, circular bubble button hugging the left and right screen borders with persistent red [!] badge.
 */
function PeripheralBubbleButton({
  emoji,
  label,
  gradient,
  badge,
  onClick,
}: {
  emoji: string
  label: string
  gradient: string
  badge?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center shrink-0 active:scale-90 transition-transform"
    >
      <div
        className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b ${gradient} border-[2.5px] border-[#422006] border-b-[4px] border-b-[#291303] text-xl shadow-[0_4px_10px_rgba(66,32,6,0.38),inset_0_2px_0_rgba(255,255,255,0.65)]`}
      >
        {/* Specular top gloss bubble highlight */}
        <span className="pointer-events-none absolute top-0.5 left-2 right-2 h-1.5 rounded-full bg-white/45" />
        {badge && <RedAlertBadge className="-top-1 -right-1" />}
        <span className="relative z-10 drop-shadow">{emoji}</span>
      </div>
      <span className="-mt-1.5 rounded-full border border-[#78350f] bg-[#fff6e6] px-1.5 py-0.2 font-display text-[10px] leading-tight font-black tracking-tight text-[#422006] shadow-xs">
        {label}
      </span>
    </button>
  )
}
