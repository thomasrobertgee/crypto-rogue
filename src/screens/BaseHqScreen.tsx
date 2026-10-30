import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Lock,
  Check,
  X,
  Shield,
  Sparkles,
  Flame,
  Zap,
  Home,
  Armchair,
  ChevronRight,
  Palette,
} from 'lucide-react'
import type { OwnedCoin, RelicConfig } from '../types/game.types'
import { ExpeditionsModal } from '../components/modals/ExpeditionsModal'
import { CodexModal } from '../components/modals/CodexModal'
import { CandlestickCanvas } from '../components/battle/CandlestickCanvas'
import { CHART_SKINS, type ChartSkinId } from '../config/chartSkins.config'
import { COINS, COIN_MAP } from '../config/coins.config'
import { RELICS, RELIC_MAP } from '../config/relics.config'
import {
  HEROES,
  HERO_FRAGMENTS_REQUIRED,
  MAX_HERO_STARS,
  heroLevelUpCost,
  heroSkillUpgradeCost,
  type HeroId,
} from '../config/heroes.config'
import {
  COIN_SLOT_UNLOCK_LABELS,
  RELIC_SLOT_UNLOCK_LABELS,
} from '../config/stages.config'
import {
  BASE_LOCATIONS,
  BASE_LOCATION_MAP,
  FURNITURE_AMENITIES,
  getFurnitureUpgradeCost,
  getFurnitureBonus,
  getFurnitureTierName,
  type BaseLocationId,
  type FurnitureId,
} from '../config/base.config'
import { FUSION_REQUIRED_COPIES, MAX_EQUIPPED_RELICS } from '../config/economy.config'
import { nextRarity, rarityIndex } from '../engine/economy'
import { PETS, petLevelUpCost } from '../config/pets.config'
import { PetSprite } from '../components/PetSprite'
import { HERO_BONDS } from '../config/heroBonds.config'
import {
  SILICON_DUST_SALVAGE_VALUE,
  SILICON_OVERCLOCK_REROLL_COST,
} from '../config/algoOverclock.config'
import { AudioSynth } from '../engine/AudioSynth'
import { fmtNum } from '../engine/format'
import { useMetaStore } from '../state/useMetaStore'
import { useNotificationBadges } from '../state/useNotificationBadges'
import { getUiUnlockState } from '../config/unlocks.config'
import { DynamicIcon } from '../components/DynamicIcon'
import {
  TopCurrencyBar,
  CoinMascotSvg,
  CoinGridCard,
  HashrateIcon,
  SatoshiGemIcon,
  RARITY_CARD_THEMES,
} from '../components/GameArtwork'
import { HeroChibiSvg, StageLandscapeSvg, RedAlertBadge } from '../components/WorldDioramaArt'
import { HeroAvatar } from '../components/HeroAvatar'
import { CoinDetailModal } from '../components/modals/CoinDetailModal'
import { HeroSkinsModal } from '../components/modals/HeroSkinsModal'
import { HeroSkillsModal } from '../components/modals/HeroSkillsModal'
import { HERO_SKINS_BY_HERO } from '../config/heroSkins.config'
import { HERO_SKILLS_BY_HERO } from '../config/heroSkills.config'
import { MiningRigPanel } from '../components/base/MiningRigPanel'

export type BaseSubTabId = 'heroes' | 'coins' | 'algos' | 'rig' | 'base'

export function BaseHqScreen() {
  const meta = useMetaStore()
  const badges = useNotificationBadges()

  const [subTab, setSubTab] = useState<BaseSubTabId>('heroes')
  const [baseToggle, setBaseToggle] = useState<'locations' | 'furniture' | 'chart_skins'>('locations')
  const [previewSkinId, setPreviewSkinId] = useState<ChartSkinId>(meta.equippedChartSkin ?? 'default')
  const [toast, setToast] = useState<string | null>(null)
  const [showExpeditionsModal, setShowExpeditionsModal] = useState(false)
  const [showCodexModal, setShowCodexModal] = useState(false)
  const [showSkinsModal, setShowSkinsModal] = useState(false)
  const [showHeroSkillsModal, setShowHeroSkillsModal] = useState(false)

  // Hero sub-tab state
  const ownedHeroes = meta.ownedHeroes ?? { rookie_satoshi: 1 }
  const equippedHeroId = meta.equippedHeroId ?? 'rookie_satoshi'
  const [selectedHeroId, setSelectedHeroId] = useState<HeroId>(equippedHeroId)

  // Coin & Relic sub-tab state
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null)
  const [selectedStackId, setSelectedStackId] = useState<string | null>(null)
  const [selectedRelic, setSelectedRelic] = useState<RelicConfig | null>(null)

  // ───────── HEROES LOGIC ─────────
  const heroFragments = meta.heroFragments ?? {}
  const heroStars = meta.heroStars ?? { rookie_satoshi: 1 }
  const heroSkillLevels = meta.heroSkillLevels ?? {}

  const selectedHero = HEROES.find((h) => h.id === selectedHeroId) ?? HEROES[0]
  const ownedHeroLevel = ownedHeroes[selectedHero.id] ?? 0
  const isHeroOwned = ownedHeroLevel > 0
  const isHeroEquipped = equippedHeroId === selectedHero.id

  const selectedHeroFragments = heroFragments[selectedHero.id] ?? 0
  const selectedHeroStars = heroStars[selectedHero.id] ?? 1
  const selectedHeroSkills = heroSkillLevels[selectedHero.id] ?? { passiveLv: 1, activeLv: 1 }
  const passiveSkillCost = heroSkillUpgradeCost(selectedHeroSkills.passiveLv)
  const canUpgradePassiveSkill =
    isHeroOwned &&
    meta.hashrate >= passiveSkillCost.hashrate &&
    (meta.furnitureBlueprints ?? 0) >= passiveSkillCost.blueprints

  const canUnlockWithFragments =
    !isHeroOwned && selectedHeroFragments >= HERO_FRAGMENTS_REQUIRED
  const canAscendStar =
    isHeroOwned &&
    selectedHeroStars < MAX_HERO_STARS &&
    selectedHeroFragments >= HERO_FRAGMENTS_REQUIRED

  const upgradeHeroHashrateCost = heroLevelUpCost(Math.max(1, ownedHeroLevel), selectedHero.rarity)
  const canUpgradeHeroHashrate = isHeroOwned && meta.hashrate >= upgradeHeroHashrateCost
  const canUnlockHeroGems = !isHeroOwned && meta.gems >= selectedHero.unlockGemsCost

  const unlockedSkinsCount = (HERO_SKINS_BY_HERO[selectedHero.id] ?? []).filter(
    (sk) => meta.ownedSkins?.[sk.id]?.unlocked,
  ).length

  // ───────── COINS LOGIC ─────────
  const globalYield = meta.getGlobalYield()
  const masteryBonusPct = ((globalYield - 1) * 100).toFixed(1)

  const forgeableStacks = meta.ownedCoins.filter(
    (c) => c.count >= FUSION_REQUIRED_COPIES && nextRarity(c.rarity) !== null,
  )

  const stacksForCoin = selectedCoinId
    ? meta.ownedCoins
        .filter((c) => c.coinId === selectedCoinId)
        .sort((a, b) => rarityIndex(b.rarity) - rarityIndex(a.rarity))
    : []

  const activeStack: OwnedCoin | null =
    stacksForCoin.find((s) => s.id === selectedStackId) ?? stacksForCoin[0] ?? null
  const activeCfg = selectedCoinId ? COIN_MAP[selectedCoinId] : null

  const handleOpenCoin = (coinId: string) => {
    const owned = meta.ownedCoins
      .filter((c) => c.coinId === coinId)
      .sort((a, b) => rarityIndex(b.rarity) - rarityIndex(a.rarity))
    if (owned.length === 0) return
    setSelectedCoinId(coinId)
    setSelectedStackId(owned[0].id)
  }

  const handleOneTapForge = (stack: OwnedCoin) => {
    const targetRarity = nextRarity(stack.rarity)
    if (!targetRarity) return
    AudioSynth.unlock()
    if (meta.fuseCoins(stack.coinId, stack.rarity)) {
      AudioSynth.playChestOpen()
    }
  }

  const handleAutoForgeAll = () => {
    AudioSynth.unlock()
    const count = meta.fuseAllAvailable()
    if (count > 0) {
      AudioSynth.playChestOpen()
    }
  }

  const handleEquipOrUnequipCoin = (stack: OwnedCoin) => {
    AudioSynth.unlock()
    AudioSynth.playCoinInject()
    const existingSlot = meta.equippedCoinIds.indexOf(stack.id)
    if (existingSlot >= 0) {
      meta.unequipCoin(existingSlot)
      return
    }
    let targetSlot = -1
    for (let i = 0; i < meta.unlockedSlots; i++) {
      if (!meta.equippedCoinIds[i]) {
        targetSlot = i
        break
      }
    }
    if (targetSlot === -1) targetSlot = meta.unlockedSlots - 1
    meta.equipCoin(targetSlot, stack.id)
  }

  const handleLevelUpCoin = (stack: OwnedCoin) => {
    AudioSynth.unlock()
    const isTutorialBitcrumb = meta.tutorialStep === 'upgrade_coin' && stack.coinId === 'bitcrumb'
    if (meta.levelUpCoin(stack.id)) {
      AudioSynth.playGreenCandle()
      if (isTutorialBitcrumb) {
        // Automatically dismiss the modal before Step 3 (Return to Camp) activates
        setSelectedCoinId(null)
      }
    }
  }

  // Safety dismiss: Ensure no dangling modal backdrop persists on Step 3
  useEffect(() => {
    if (meta.tutorialStep === 'ready_stage_1' && selectedCoinId !== null) {
      setSelectedCoinId(null)
    }
  }, [meta.tutorialStep, selectedCoinId])

  // ───────── BASE REAL ESTATE & FURNITURE LOGIC ─────────
  const currentLocationId = meta.currentLocationId ?? 'outskirts_tent'
  const unlockedLocations = meta.unlockedLocationIds ?? ['outskirts_tent']
  const furnitureLevels = meta.furnitureLevels ?? {
    trading_desk: 1,
    campfire_bar: 1,
    cooling_rack: 1,
    backup_generator: 1,
    security_firewall: 1,
    satellite_dish: 1,
  }
  const activeLocCfg = BASE_LOCATION_MAP[currentLocationId] ?? BASE_LOCATIONS[0]

  const handleUnlockOrSelectLocation = (locId: BaseLocationId) => {
    AudioSynth.unlock()
    if (unlockedLocations.includes(locId)) {
      AudioSynth.playCoinInject()
      meta.selectLocation(locId)
    } else {
      if (meta.unlockLocation(locId)) {
        AudioSynth.playChestOpen()
      }
    }
  }

  const handleUpgradeFurniture = (fId: FurnitureId, _name: string) => {
    AudioSynth.unlock()
    if (meta.upgradeFurniture(fId)) {
      AudioSynth.playGreenCandle()
    }
  }

  const unlocks = getUiUnlockState(meta)

  const ownedHeroesCount = Object.values(ownedHeroes).filter((lvl) => lvl > 0).length
  const hasSecondHero = ownedHeroesCount >= 2

  const visibleSubTabs: Array<{
    id: BaseSubTabId
    emoji: string
    label: string
    badge?: boolean | number
    dataTutorial?: string
    isLocked: boolean
    unlockStage?: number
  }> = [
    {
      id: 'heroes',
      emoji: '🦸',
      label: 'Heroes',
      badge: badges.heroesSubTab,
      dataTutorial: 'subtab-heroes',
      isLocked: false,
    },
    {
      id: 'coins',
      emoji: '🪙',
      label: 'Coins',
      badge: badges.coinsSubTab,
      dataTutorial: 'subtab-coins',
      isLocked: false,
    },
    {
      id: 'algos',
      emoji: '⚡',
      label: 'Algos',
      badge: unlocks.algosSubTabUnlocked && badges.algosSubTab,
      dataTutorial: 'subtab-algos',
      isLocked: !unlocks.algosSubTabUnlocked,
      unlockStage: 2,
    },
    {
      id: 'rig',
      emoji: '⛏️',
      label: 'Rig',
      badge: badges.rigPetsSubTab,
      dataTutorial: 'subtab-rig',
      isLocked: false,
    },
    {
      id: 'base',
      emoji: '🛋️',
      label: 'Furniture',
      badge: unlocks.baseSubTabUnlocked && badges.baseSubTab,
      dataTutorial: 'subtab-furniture',
      isLocked: !unlocks.baseSubTabUnlocked,
      unlockStage: 4,
    },
  ]

  // If active subTab got locked, fallback to 'heroes'
  const effectiveSubTab = visibleSubTabs.some((t) => t.id === subTab && !t.isLocked) ? subTab : 'heroes'

  return (
    <div className="relative flex h-full w-full flex-col gap-2.5 overflow-hidden arcade-screen-bg p-3">
      {/* Top Fixed / Locked Section (Currency Bar + Title/Codex + Sub-Tab Switcher) */}
      <div className="relative z-10 shrink-0 flex flex-col gap-2.5">
        {/* Top 3D Bubble Resource Bar */}
        <TopCurrencyBar
          hashrate={meta.hashrate}
          gems={meta.gems}
          silverKeys={meta.silverKeys}
          quantumKeys={meta.quantumKeys}
          isVipAdFree={meta.isVipAdFree}
        />

        {/* Header Utilities: HQ Title & [ 📖 Codex ] Museum Button */}
        <div className="flex items-center justify-between px-1">
          <span className="font-display text-xs font-black text-[#2C1810]">
            BASE HQ OPERATIONS
          </span>
          {!unlocks.isTutorialLockdown && (
            <button
              type="button"
              onClick={() => {
                AudioSynth.unlock()
                AudioSynth.playCoinInject()
                setShowCodexModal(true)
              }}
              className="btn-3d-gold relative flex items-center gap-1.5 rounded-xl px-3 py-1 font-display text-xs font-black text-white game-text-outline-sm shadow"
            >
              {badges.codexReady && <RedAlertBadge className="-top-1 -right-1" />}
              <span>📖</span>
              <span>Codex</span>
              {badges.codexUnclaimedCount > 0 && (
                <span className="rounded-full bg-[#e11d48] px-1.5 py-0.2 text-[9px] font-black text-white">
                  +{badges.codexUnclaimedCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* NESTED SUB-NAVIGATION BAR WITH RED [!] BADGES */}
        <div className="grid grid-cols-5 gap-1 rounded-3xl border-[3px] border-[#78350f] border-b-[5px] border-b-[#451a03] bg-[#fff6e6] p-1 shadow-md">
          {visibleSubTabs.map((t) => {
            const active = effectiveSubTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                data-tutorial={t.dataTutorial}
                onClick={() => {
                  AudioSynth.unlock()
                  if (t.isLocked) {
                    AudioSynth.playRedDump()
                    setToast(`🔒 ${t.label} Unlocks at Stage ${t.unlockStage}!`)
                    window.setTimeout(() => setToast(null), 3000)
                    return
                  }
                  AudioSynth.playCoinInject()
                  setSubTab(t.id)
                }}
                className={`relative flex items-center justify-center rounded-2xl py-1.5 transition-all ${
                  t.isLocked
                    ? 'border-2 border-[#8D7B68] border-b-4 border-b-[#5C4D3C] bg-gradient-to-b from-[#E2D5C1] to-[#C9B9A3] opacity-85 cursor-pointer active:translate-y-0.5'
                    : active
                    ? 'btn-3d-gold text-white game-text-outline-sm -translate-y-0.5 shadow'
                    : 'border-2 border-[#b45309]/40 bg-[#ffedd5] text-[#422006] hover:bg-[#fed7aa]'
                }`}
              >
                {t.isLocked ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1">
                      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#5C4D3C] bg-[#FFFDF9]/90 text-[#3E2723] shadow-xs">
                        <Lock className="h-2 w-2 stroke-[2.5]" />
                      </div>
                      <span className="font-display text-[9px] font-black text-[#5C4D3C]">
                        {t.label}
                      </span>
                    </div>
                    <span className="font-display text-[7.5px] font-black uppercase tracking-tight text-[#3E2723]">
                      STAGE {t.unlockStage}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <span>{t.emoji}</span>
                    <span className="font-display text-xs font-black">{t.label}</span>
                    {t.badge && <RedAlertBadge className="-top-1.5 -right-1" />}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {toast && (
          <div className="mx-auto rounded-full border-2 border-[#14532d] border-b-4 bg-[#4ade80] px-4 py-1 text-center font-display text-xs font-black text-white game-text-outline-sm shadow-lg animate-bounce">
            {toast}
          </div>
        )}
      </div>

      {/* Scrollable Sub-Tab Content Area */}
      <div className="relative z-0 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-0.5">

      {/* ═══════════════════════════════════════════════════════════════════════════
          SUB-TAB 1: [ 🦸 HEROES ] — 6-Hero Roster, 50-Shard Star Ascension & Skill Upgrades
         ═══════════════════════════════════════════════════════════════════════════ */}
      {effectiveSubTab === 'heroes' && (
        <div className="flex flex-col gap-2.5">
          {/* OFFSHORE ARBITRAGE EXPEDITIONS PANEL */}
          {!unlocks.isTutorialLockdown && meta.highestStageCleared >= 2 && hasSecondHero && (
            <div className="flex items-center justify-between gap-2 rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3.5 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-2xl shadow">
                  🗺️
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-xs font-black text-[#2C1810]">
                      OFFSHORE ARBITRAGE EXPEDITIONS
                    </span>
                    {badges.expeditionsReady && (
                      <span className="rounded-full bg-[#16a34a] px-2 py-0.2 font-display text-[9px] font-black text-white animate-pulse">
                        LOOT READY!
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-[#6E5A4F] truncate">
                    Send unequipped bench Heroes on 4H, 8H &amp; 12H arbitrage routes!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  AudioSynth.unlock()
                  AudioSynth.playCoinInject()
                  setShowExpeditionsModal(true)
                }}
                className="btn-3d-gold relative flex shrink-0 items-center gap-1 rounded-2xl px-3 py-2 font-display text-xs font-black uppercase text-white game-text-outline-sm shadow"
              >
                {badges.expeditionsReady && <RedAlertBadge className="-top-1 -right-1" />}
                <span>Dispatch</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Hero Stage Diorama Showcase Card */}
          <div className="relative overflow-hidden rounded-3xl border-[3px] border-[#78350f] border-b-[6px] border-b-[#451a03] bg-[#fff6e6] shadow-lg">
            <div className="relative flex h-44 w-full flex-col items-center justify-between overflow-hidden border-b-[3px] border-[#78350f] p-2.5">
              <div className="absolute inset-0 z-0">
                <StageLandscapeSvg stage={meta.currentStage} mode="battle" />
              </div>

              <div className="relative z-10 flex w-full items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full border-2 border-[#78350f] bg-[#fde047] px-2.5 py-0.5 font-display text-[10px] font-black uppercase text-[#422006] shadow">
                    {selectedHero.rarity}
                  </span>
                  <span className="rounded-full border-2 border-[#78350f] bg-[#2C1810] px-2 py-0.5 font-display text-[10px] font-black text-[#fde047] shadow">
                    {'★'.repeat(selectedHeroStars)}
                    {'☆'.repeat(Math.max(0, MAX_HERO_STARS - selectedHeroStars))}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isHeroOwned && (
                    <span className="rounded-full border-2 border-[#78350f] bg-[#fff6e6] px-2.5 py-0.5 font-display text-xs font-black text-[#422006] shadow">
                      Lv.{ownedHeroLevel}
                    </span>
                  )}
                  {isHeroEquipped ? (
                    <span className="flex items-center gap-1 rounded-full border-2 border-[#14532d] bg-[#4ade80] px-2.5 py-0.5 font-display text-[10px] font-black text-white game-text-outline-sm shadow">
                      <Check className="h-3 w-3 stroke-[3]" /> LEAD TRADER
                    </span>
                  ) : isHeroOwned ? (
                    <span className="rounded-full border-2 border-[#78350f] bg-[#fde68a] px-2.5 py-0.5 font-display text-[10px] font-black text-[#422006] shadow">
                      🏕️ CAMP MENTOR
                    </span>
                  ) : selectedHero.featuredBundleName ? (
                    <span className="rounded-full border-2 border-[#78350f] bg-[#fb7185] px-2.5 py-0.5 font-display text-[9px] font-black uppercase text-white shadow">
                      🎁 {selectedHero.featuredBundleName}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="relative z-10 -my-2">
                <HeroAvatar heroId={selectedHero.id} skinId={meta.equippedSkins?.[selectedHero.id]} size={118} showAura={true} />
              </div>

              <div className="relative z-10 rounded-full border-2 border-[#78350f] bg-[#fff6e6]/95 px-4 py-0.5 shadow">
                <span className="font-display text-sm font-black text-[#422006]">
                  {selectedHero.name}
                </span>
                <span className="ml-1.5 font-display text-[10px] font-bold text-[#9a3412]">
                  • {selectedHero.title}
                </span>
              </div>
            </div>

            {/* 50-Fragment Progress & Star Ascension Bar */}
            <div className="border-b border-[#E2D5C1] bg-[#FFFDF9] px-3 py-2">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-[#2C1810]">
                <span>
                  🧩 Hero Shards:{' '}
                  <span className="font-display text-[#b45309]">
                    {selectedHeroFragments}/{HERO_FRAGMENTS_REQUIRED}
                  </span>{' '}
                  {isHeroOwned
                    ? selectedHeroStars >= MAX_HERO_STARS
                      ? '(MAX 5★ ASCENDED)'
                      : `→ Ascend to ${selectedHeroStars + 1}★ (+${selectedHeroStars * 35}% Aura)`
                    : 'to Unlock Hero'}
                </span>
                <span className="font-display text-[10px] font-black text-[#6E5A4F]">
                  📐 {meta.furnitureBlueprints ?? 0} Blueprints
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-[#3E2723] bg-[#E2D5C1]">
                  <div
                    className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fde047] transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((selectedHeroFragments / HERO_FRAGMENTS_REQUIRED) * 100))}%`,
                    }}
                  />
                </div>
                {isHeroOwned && selectedHeroStars < MAX_HERO_STARS && (
                  <button
                    type="button"
                    disabled={!canAscendStar}
                    onClick={() => {
                      AudioSynth.unlock()
                      if (meta.ascendHeroStar(selectedHero.id)) {
                        AudioSynth.playChestOpen()
                      }
                    }}
                    className={`rounded-xl px-2.5 py-1 font-display text-[10px] font-black uppercase ${
                      canAscendStar
                        ? 'btn-3d-gold text-white game-text-outline-sm animate-pulse'
                        : 'border border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F] cursor-not-allowed'
                    }`}
                  >
                    Ascend {selectedHeroStars + 1}★ (50🧩)
                  </button>
                )}
              </div>
            </div>

            {/* Primary Hero Actions: Set Lead / Level Up / Gem Upgrade (Prominently Placed Above Skills) */}
            <div className="border-b border-[#E2D5C1] bg-[#FFFDF9] px-3 pb-3 pt-2">
              {isHeroOwned ? (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isHeroEquipped}
                    onClick={() => {
                      AudioSynth.unlock()
                      AudioSynth.playCoinInject()
                      meta.equipHero(selectedHero.id)
                    }}
                    className={`rounded-2xl py-2.5 font-display text-xs font-black uppercase ${
                      isHeroEquipped
                        ? 'border-2 border-[#78350f]/40 bg-[#fed7aa] text-[#78350f] cursor-default'
                        : 'btn-3d-indigo game-text-outline-sm active:translate-y-0.5'
                    }`}
                  >
                    {isHeroEquipped ? '✓ Lead Hero' : 'Set Lead'}
                  </button>

                  <button
                    type="button"
                    data-tutorial="hero-level-up-btn"
                    disabled={!canUpgradeHeroHashrate}
                    onClick={() => {
                      AudioSynth.unlock()
                      AudioSynth.playCoinInject()
                      meta.levelUpHero(selectedHero.id)
                    }}
                    className={`flex flex-col items-center justify-center rounded-2xl py-1.5 font-display text-[11px] font-black ${
                      canUpgradeHeroHashrate
                        ? 'btn-3d-green game-text-outline-sm active:translate-y-0.5'
                        : 'border-2 border-[#78350f]/30 bg-[#e7e5e4] text-[#78716c] opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <span>LEVEL UP</span>
                    <span className="inline-flex items-center gap-1 text-[10px]">
                      <HashrateIcon size={11} /> {fmtNum(upgradeHeroHashrateCost)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      AudioSynth.unlock()
                      AudioSynth.playCoinInject()
                      setShowSkinsModal(true)
                    }}
                    className="relative flex flex-col items-center justify-center rounded-2xl py-1.5 font-display text-[11px] font-black btn-3d-indigo game-text-outline-sm active:translate-y-0.5"
                  >
                    {badges.heroSkinsReady?.[selectedHero.id] && <RedAlertBadge className="-top-1 -right-1" />}
                    <span className="inline-flex items-center gap-1">
                      👗 SKINS ({unlockedSkinsCount}/4)
                    </span>
                    <span className="text-[9px] text-[#fde047]">
                      Wardrobe &amp; Stars
                    </span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {/* Unlock via 50 Hero Fragments */}
                  <button
                    type="button"
                    disabled={!canUnlockWithFragments}
                    onClick={() => {
                      AudioSynth.unlock()
                      if (meta.unlockHeroWithFragments(selectedHero.id)) {
                        AudioSynth.playChestOpen()
                      }
                    }}
                    className={`rounded-2xl py-2.5 font-display text-xs font-black uppercase ${
                      canUnlockWithFragments
                        ? 'btn-3d-gold game-text-outline-sm animate-pulse'
                        : 'border-2 border-[#78350f]/30 bg-[#e7e5e4] text-[#78716c] opacity-70 cursor-not-allowed'
                    }`}
                  >
                    Unlock Hero (50🧩)
                  </button>

                  {/* Instant Recruit with Gems */}
                  <button
                    type="button"
                    disabled={!canUnlockHeroGems}
                    onClick={() => {
                      AudioSynth.unlock()
                      AudioSynth.playChestOpen()
                      meta.unlockHero(selectedHero.id)
                    }}
                    className={`flex flex-col items-center justify-center rounded-2xl py-1.5 font-display text-xs font-black uppercase ${
                      canUnlockHeroGems
                        ? 'btn-3d-gold text-white game-text-outline-sm active:translate-y-0.5'
                        : 'border-2 border-[#E2D5C1] bg-[#F3E9D8] text-[#6E5A4F] cursor-not-allowed'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> RECRUIT
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px]">
                      <SatoshiGemIcon size={11} /> {selectedHero.unlockGemsCost} Gems
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Skill Inspection & Upgrade Panel */}
            <div className="flex flex-col gap-2 p-3">
              <div className="grid grid-cols-1 gap-2">
                {/* Passive Aura Skill Card + Upgrade Button */}
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] p-2.5">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#3E2723] bg-[#fde047] text-[#2C1810] shadow-xs">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-display text-[10px] font-black uppercase text-[#2C1810]">
                          Passive Lv.{selectedHeroSkills.passiveLv} • {selectedHero.passiveName}
                        </span>
                        <span className="rounded-full bg-[#22c55e]/20 px-1.5 py-0.2 font-display text-[9px] font-black text-[#15803d]">
                          +{(selectedHeroStars - 1) * 35 + (selectedHeroSkills.passiveLv - 1) * 10}% Aura
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-[#6E5A4F] leading-snug">
                        {selectedHero.passiveDesc}
                      </p>
                    </div>
                  </div>
                  {isHeroOwned && (
                    <button
                      type="button"
                      disabled={!canUpgradePassiveSkill}
                      onClick={() => {
                        AudioSynth.unlock()
                        if (meta.upgradeHeroSkill(selectedHero.id, 'passive')) {
                          AudioSynth.playGreenCandle()
                        }
                      }}
                      className={`shrink-0 flex flex-col items-center rounded-xl px-2.5 py-1.5 font-display text-[9px] font-black uppercase ${
                        canUpgradePassiveSkill
                          ? 'btn-3d-amber text-[#2C1810] active:translate-y-0.5'
                          : 'border border-[#E2D5C1] bg-[#FFFDF9] text-[#6E5A4F] opacity-75 cursor-not-allowed'
                      }`}
                    >
                      <span>UPGRADE</span>
                      <span className="text-[8px]">
                        ⚡{fmtNum(passiveSkillCost.hashrate)} • 📘{passiveSkillCost.blueprints}
                      </span>
                    </button>
                  )}
                </div>

                {/* Active Skill Arsenal Card + Customization Trigger */}
                <div
                  onClick={() => {
                    AudioSynth.unlock()
                    AudioSynth.playCoinInject()
                    setShowHeroSkillsModal(true)
                  }}
                  className="group flex flex-col gap-2 rounded-2xl border-2 border-[#3E2723] bg-gradient-to-r from-[#F3E9D8] via-[#FFFDF9] to-[#F3E9D8] p-3 shadow-xs transition-all hover:border-[#0284c7] cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#3E2723] text-white shadow-xs"
                        style={{
                          backgroundColor:
                            meta.getHeroEquippedSkill?.(selectedHero.id)?.accentColor || '#38bdf8',
                        }}
                      >
                        <Zap className="h-5 w-5 fill-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-display text-[10px] font-black uppercase text-[#0369a1]">
                            Active Lv.{meta.getHeroSkillMastery?.(meta.getHeroEquippedSkill?.(selectedHero.id)?.id || '')?.level ?? selectedHeroSkills.activeLv} • {meta.getHeroEquippedSkill?.(selectedHero.id)?.name || selectedHero.activeSkillName}
                          </span>
                          <span className="font-display text-[9px] font-black text-[#0284c7]">
                            Every {Math.max(2, (meta.getHeroEquippedSkill?.(selectedHero.id)?.skillChargeTicks || selectedHero.skillChargeTicks) - Math.floor((meta.getHeroSkillMastery?.(meta.getHeroEquippedSkill?.(selectedHero.id)?.id || '')?.level ?? selectedHeroSkills.activeLv) / 2))} Ticks
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#6E5A4F] leading-snug line-clamp-1">
                          {meta.getHeroEquippedSkill?.(selectedHero.id)?.description || selectedHero.activeSkillDesc}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        AudioSynth.unlock()
                        AudioSynth.playCoinInject()
                        setShowHeroSkillsModal(true)
                      }}
                      className="shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-display text-[10px] font-black uppercase btn-3d-amber text-[#2C1810] active:translate-y-0.5 shadow-xs"
                    >
                      <Zap className="h-3.5 w-3.5 fill-current text-amber-900" />
                      <span>ARSENAL ({(HERO_SKILLS_BY_HERO[selectedHero.id] ?? []).length})</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E2D5C1]/70 pt-1.5 text-[9px] font-extrabold text-[#6E5A4F]">
                    <span className="text-[#166534] flex items-center gap-1">
                      <Sparkles className="h-3 w-3 fill-current text-[#16a34a]" />
                      Tap to customize Active Skills & Stacked Passive Masteries
                    </span>
                    <span className="text-[#0284c7] group-hover:translate-x-0.5 transition-transform">
                      Open Arsenal →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Collectible 6-Hero Roster Grid (Warm Rarity-Tinted Surfaces, Fragment Progress & Stars) */}
          <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3 shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-xs font-extrabold uppercase tracking-wider text-[#2C1810]">
                🦸 Camp Hero Squad ({Object.keys(ownedHeroes).length}/{HEROES.length})
              </span>
              <span className="rounded-full border border-[#E2D5C1] bg-[#F3E9D8] px-2 py-0.5 font-display text-[10px] font-black text-[#6E5A4F]">
                50 Shards = Unlock / +1★
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {HEROES.map((h) => {
                const lvl = ownedHeroes[h.id] ?? 0
                const owned = lvl > 0
                const stars = heroStars[h.id] ?? 1
                const frags = heroFragments[h.id] ?? 0
                const readyForShardAction =
                  (!owned && frags >= HERO_FRAGMENTS_REQUIRED) ||
                  (owned && stars < MAX_HERO_STARS && frags >= HERO_FRAGMENTS_REQUIRED)
                const active = selectedHeroId === h.id
                const eq = equippedHeroId === h.id
                const warmSurfaceByRarity: Record<string, string> = {
                  common: 'bg-gradient-to-b from-[#FFFDF9] to-[#F3E9D8]',
                  uncommon: 'bg-gradient-to-b from-[#ECFDF5] to-[#D1FAE5]',
                  rare: 'bg-gradient-to-b from-[#EFF6FF] to-[#DBEAFE]',
                  epic: 'bg-gradient-to-b from-[#FAF5FF] to-[#F3E8FF]',
                  legendary: 'bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7]',
                  mythical: 'bg-gradient-to-b from-[#FFF1F2] to-[#FFE4E6]',
                }
                const badgeBgByRarity: Record<string, string> = {
                  common: 'from-[#fde047] to-[#f59e0b]',
                  uncommon: 'from-[#4ade80] to-[#16a34a]',
                  rare: 'from-[#38bdf8] to-[#0284c7]',
                  epic: 'from-[#c084fc] to-[#7e22ce]',
                  legendary: 'from-[#fbbf24] to-[#d97706]',
                  mythical: 'from-[#fb7185] to-[#e11d48]',
                }
                const warmSurface =
                  warmSurfaceByRarity[h.rarity] ?? 'bg-gradient-to-b from-[#FFFDF9] to-[#F3E9D8]'
                const badgeGrad = badgeBgByRarity[h.rarity] ?? 'from-[#fde047] to-[#f59e0b]'

                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHeroId(h.id)}
                    className={`relative flex flex-col items-center rounded-2xl p-2.5 text-center transition-all active:scale-95 ${warmSurface} border-2 border-[#3E2723] border-b-4 ${
                      active ? 'ring-3 ring-[#f59e0b] -translate-y-0.5 shadow-lg' : 'shadow-sm'
                    }`}
                  >
                    {readyForShardAction && <RedAlertBadge className="-top-1.5 -right-1.5" />}

                    <div className="flex w-full items-center justify-between">
                      <span className="rounded-lg border border-[#E2D5C1] bg-[#FFFDF9] px-1.5 py-0.5 font-display text-[10px] font-extrabold text-[#2C1810]">
                        {owned ? `Lv.${lvl} • ${stars}★` : 'LOCKED'}
                      </span>
                      {eq ? (
                        <span className="rounded-full border border-[#14532d] bg-[#22c55e] px-2 py-0.2 font-display text-[9px] font-black text-white">
                          LEAD
                        </span>
                      ) : owned ? (
                        <span className="rounded-full border border-[#E2D5C1] bg-[#F3E9D8] px-1.5 py-0.2 font-display text-[8px] font-black text-[#6E5A4F]">
                          MENTOR
                        </span>
                      ) : h.featuredBundleName ? (
                        <span className="rounded-full border border-[#9f1239] bg-[#ffe4e6] px-1.5 py-0.2 font-display text-[8px] font-black text-[#be123c]">
                          BUNDLE
                        </span>
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-[#6E5A4F]" />
                      )}
                    </div>

                    {/* Clean Circular Shield Framing Badge for Hero Portrait */}
                    <div
                      className={`my-1.5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#3E2723] bg-gradient-to-b ${badgeGrad} shadow-inner overflow-hidden ${
                        owned ? '' : 'grayscale opacity-75'
                      }`}
                    >
                      <HeroChibiSvg heroId={h.id} size={64} />
                    </div>

                    <div className="font-display text-xs font-extrabold text-[#2C1810] truncate w-full">
                      {h.name}
                    </div>
                    <div className="text-[10px] font-semibold text-[#6E5A4F] truncate w-full">
                      {h.passiveName}
                    </div>

                    {/* Fragment Progress Bar inside each Hero Card */}
                    <div className="mt-1.5 w-full rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] px-2 py-1">
                      <div className="flex items-center justify-between font-display text-[9px] font-extrabold text-[#2C1810]">
                        <span>🧩 Shards</span>
                        <span>
                          {frags}/{HERO_FRAGMENTS_REQUIRED}
                        </span>
                      </div>
                      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E2D5C1]">
                        <div
                          className="h-full bg-gradient-to-r from-[#f59e0b] to-[#16a34a]"
                          style={{
                            width: `${Math.min(100, Math.round((frags / HERO_FRAGMENTS_REQUIRED) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Collectible Trading Bot Pets Companion Station */}
          <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3 shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="font-display text-xs font-black uppercase tracking-wider text-[#2C1810] flex items-center gap-1.5">
                  <span>🤖</span> TRADING BOT PET COMPANIONS
                </span>
                <p className="text-[10px] font-semibold text-[#6E5A4F]">
                  Equip 1 autonomous Pet to float beside your Lead Hero in battle!
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-[#78350f] bg-[#fef3c7] px-2 py-0.5 font-display text-[10px] font-black text-[#78350f]">
                <span>🦴 {meta.petTreats ?? 0} Treats</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {PETS.map((pet) => {
                const petData = meta.ownedPets[pet.id]
                const isUnlocked = petData?.unlocked ?? false
                const lvl = petData?.level ?? 1
                const isEquipped = meta.equippedPetId === pet.id
                const cost = petLevelUpCost(lvl)
                const canLvlUp = isUnlocked && lvl < pet.maxLevel && meta.hashrate >= cost.hashrate && (meta.petTreats ?? 0) >= cost.treats

                return (
                  <div
                    key={pet.id}
                    className={`relative flex flex-col justify-between rounded-2xl border-2 p-2.5 transition-all ${
                      isEquipped
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/30'
                        : isUnlocked
                          ? 'border-[#3E2723] bg-[#FFFDF9]'
                          : 'border-stone-300 bg-stone-100 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-md border border-[#3E2723]/30 bg-white px-1.5 py-0.2 font-display text-[9px] font-black text-[#2C1810]">
                          {isUnlocked ? `Lv.${lvl}` : 'LOCKED'}
                        </span>
                        {isEquipped ? (
                          <span className="rounded-full bg-emerald-600 px-2 py-0.2 font-display text-[8px] font-black text-white">
                            EQUIPPED
                          </span>
                        ) : isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => {
                              AudioSynth.unlock()
                              AudioSynth.playCoinInject()
                              meta.equipPet(pet.id)
                            }}
                            className="rounded-full border border-[#3E2723] bg-[#F3E9D8] px-2 py-0.2 font-display text-[8px] font-black text-[#2C1810] hover:bg-emerald-500 hover:text-white"
                          >
                            EQUIP
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              AudioSynth.unlock()
                              AudioSynth.playChestOpen()
                              meta.unlockPet(pet.id)
                            }}
                            className="rounded-full border border-amber-600 bg-amber-400 px-2 py-0.2 font-display text-[8px] font-black text-amber-950"
                          >
                            ACTIVATE
                          </button>
                        )}
                      </div>

                      <div className="my-1.5 flex items-center gap-2">
                        <PetSprite petId={pet.id} size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="font-display text-xs font-black text-[#2C1810] truncate">
                            {pet.name}
                          </div>
                          <div className="text-[9px] font-bold text-[#6E5A4F] leading-tight">
                            {pet.baseBonusDesc}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isUnlocked && (
                      <div className="mt-1 pt-1.5 border-t border-[#E2D5C1]">
                        <button
                          type="button"
                          disabled={!canLvlUp}
                          onClick={() => {
                            AudioSynth.unlock()
                            if (meta.levelUpPet(pet.id)) {
                              AudioSynth.playGreenCandle()
                            }
                          }}
                          className={`w-full rounded-xl py-1 font-display text-[9px] font-black flex items-center justify-center gap-1 ${
                            canLvlUp
                              ? 'btn-3d-green text-white active:translate-y-0.5'
                              : 'border border-[#E2D5C1] bg-[#e7e5e4] text-[#78716c] cursor-not-allowed'
                          }`}
                        >
                          <span>UPGRADE</span>
                          <span>⚡{fmtNum(cost.hashrate)} • 🦴{cost.treats}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Hero Roster Bonds Passive Ledger */}
          <div className="rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3.5 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <div>
                  <h3 className="font-display text-xs font-black uppercase text-[#2C1810]">
                    HERO ROSTER BONDS
                  </h3>
                  <p className="text-[10px] font-semibold text-[#6E5A4F]">
                    Permanent account-wide passives unlocked by ascending hero star tiers!
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-100 border border-amber-600 px-2 py-0.5 font-display text-[9px] font-black text-amber-900">
                {meta.getActiveHeroBonds().length}/{HERO_BONDS.length} ACTIVE
              </span>
            </div>

            <div className="space-y-2">
              {HERO_BONDS.map((bond) => {
                const isActive = meta.hasHeroBondActive(bond.id)

                return (
                  <div
                    key={bond.id}
                    className={`rounded-2xl border-2 p-3 transition-all ${
                      isActive
                        ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm ring-2 ring-amber-400/30'
                        : 'border-[#E2D5C1] bg-[#FBF8F2] opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{bond.emoji}</span>
                        <div>
                          <div className="flex items-center gap-1.5 font-display text-xs font-black text-[#2C1810]">
                            <span>{bond.name}</span>
                            <span className={`rounded px-1.5 py-0.2 text-[8px] font-black ${
                              isActive ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-600'
                            }`}>
                              {isActive ? 'ACTIVE' : 'LOCKED'}
                            </span>
                          </div>
                          <div className="text-[9.5px] font-bold text-amber-800">
                            {bond.buffDescription}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Requirements Tags */}
                    <div className="mt-2 flex flex-wrap gap-1.5 pt-1 border-t border-[#E2D5C1]/60">
                      {bond.requirements.map((req) => {
                        const curStars = meta.heroStars?.[req.heroId] ?? 0
                        const isOwned = (meta.ownedHeroes?.[req.heroId] ?? 0) > 0
                        const reqMet = isOwned && curStars >= req.minStars
                        const heroCfg = HEROES.find((h) => h.id === req.heroId)

                        return (
                          <span
                            key={req.heroId}
                            className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold flex items-center gap-1 ${
                              reqMet
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                                : 'bg-stone-200 text-stone-600 border border-stone-300'
                            }`}
                          >
                            <span>{reqMet ? '✓' : '🔒'}</span>
                            <span>{heroCfg?.name ?? req.heroId}: {req.minStars}★</span>
                            <span className="text-[8px] opacity-75">({curStars}★)</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SUB-TAB 2: [ 🪙 COINS ] — 4 Wallet Slots, Level Up & 1-Tap 3/3 Forge
         ═══════════════════════════════════════════════════════════════════════════ */}
      {effectiveSubTab === 'coins' && (
        <div className="flex flex-col gap-2.5">
          {/* Global Mastery Yield & 1-Tap Auto-Forge All Header */}
          <div className="flex items-center justify-between gap-2 rounded-3xl arcade-card px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#78350f] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-[#422006] shadow">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-[11px] font-black uppercase tracking-wider text-[#9a3412]">
                  Portfolio Mastery
                </div>
                <div className="text-xs font-bold text-[#422006]">
                  <span className="font-display text-sm font-black text-[#16a34a]">
                    +{masteryBonusPct}%
                  </span>{' '}
                  Seed Capital
                </div>
              </div>
            </div>

            {forgeableStacks.length > 0 && unlocks.coinForgeUnlocked ? (
              <button
                type="button"
                onClick={handleAutoForgeAll}
                className="flex items-center gap-1 rounded-2xl px-3 py-2 font-display text-xs font-black btn-3d-gold game-text-outline-sm animate-pulse active:translate-y-0.5"
              >
                <Flame className="h-4 w-4 fill-current" />
                <span>FORGE ALL ({forgeableStacks.length})</span>
              </button>
            ) : (
              <div className="rounded-2xl border-2 border-[#b45309] bg-[#ffedd5] px-3 py-1 text-right">
                <div className="text-[9px] font-black uppercase text-[#9a3412]">Total Lv</div>
                <div className="font-display text-sm font-black text-[#422006]">
                  {meta.ownedCoins.reduce((sum, c) => sum + c.level, 0)}
                </div>
              </div>
            )}
          </div>

          {/* 4 Active Wallet Slots */}
          <div className="flex flex-col gap-2 rounded-3xl arcade-card p-3">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#422006]">
              <span>
                💼 Active Wallet Loadout (
                {Math.max(meta.unlockedSlots, unlocks.unlockedCoinSlots)}/4)
              </span>
              <span className="text-[10px] font-bold text-[#9a3412]">Tap slot to unequip</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((slot) => {
                const unlocked = slot < Math.max(meta.unlockedSlots, unlocks.unlockedCoinSlots)
                const stackId = unlocked ? meta.equippedCoinIds[slot] : null
                const stack = stackId ? meta.ownedCoins.find((c) => c.id === stackId) : null
                const cfg = stack ? COIN_MAP[stack.coinId] : null

                if (!unlocked) {
                  return (
                    <div
                      key={slot}
                      className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#E2D5C1] bg-[#F3E9D8] px-1 text-center text-[#6E5A4F]"
                    >
                      <Lock className="h-4 w-4" />
                      <span className="font-display text-[9px] font-extrabold leading-tight">
                        {COIN_SLOT_UNLOCK_LABELS[slot]}
                      </span>
                    </div>
                  )
                }

                if (!stack || !cfg) {
                  return (
                    <div
                      key={slot}
                      className="flex h-20 flex-col items-center justify-center rounded-xl border border-dashed border-[#E2D5C1] bg-[#F3E9D8] font-display text-[10px] font-extrabold text-[#6E5A4F]"
                    >
                      EMPTY
                    </div>
                  )
                }

                const theme = RARITY_CARD_THEMES[stack.rarity]

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => meta.unequipCoin(slot)}
                    className={`relative flex h-20 flex-col items-center justify-between rounded-2xl p-1.5 transition active:translate-y-0.5 ${theme.cardBg} border-2 border-[#422006] border-b-4`}
                  >
                    <span className="self-start rounded-md bg-black/55 px-1.5 py-0.2 font-display text-[9px] font-black text-white game-text-outline-sm">
                      Lv.{stack.level}
                    </span>
                    <CoinMascotSvg coin={cfg} size={34} />
                    <span className="w-full truncate font-display text-[10px] font-black text-white game-text-outline-sm">
                      {cfg.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Coin Roster Grid */}
          <div className="flex flex-col gap-2 rounded-3xl arcade-card p-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-black uppercase tracking-wider text-[#422006]">
                🪙 Coin Roster ({new Set(meta.ownedCoins.map((c) => c.coinId)).size}/15)
              </span>
              {unlocks.coinForgeUnlocked ? (
                <span className="rounded-full border border-[#b45309] bg-[#fde047] px-2 py-0.5 font-display text-[10px] font-black text-[#422006]">
                  1-Tap ⚡ Forge on 3/3
                </span>
              ) : (
                <span className="rounded-full border border-[#E2D5C1] bg-[#F3E9D8] px-2 py-0.5 font-display text-[9.5px] font-bold text-[#6E5A4F]">
                  🔒 Forge: Stage 3
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {COINS.map((cfg) => {
                const stacks = meta.ownedCoins
                  .filter((c) => c.coinId === cfg.id)
                  .sort((a, b) => rarityIndex(b.rarity) - rarityIndex(a.rarity))
                const forgeable = stacks.find(
                  (s) => s.count >= FUSION_REQUIRED_COPIES && nextRarity(s.rarity) !== null,
                )
                const displayStack = forgeable ?? stacks[0] ?? null
                const isEquipped = stacks.some((s) => meta.equippedCoinIds.includes(s.id))

                return (
                  <CoinGridCard
                    key={cfg.id}
                    coin={cfg}
                    stack={displayStack}
                    totalCopies={displayStack?.count ?? 0}
                    isEquipped={isEquipped}
                    onClick={() => handleOpenCoin(cfg.id)}
                    onForge={forgeable ? () => handleOneTapForge(forgeable) : undefined}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SUB-TAB 3: [ ⚡ ALGOS ] — Equip Up to 5 Algo Relics & Inspect Passives
         ═══════════════════════════════════════════════════════════════════════════ */}
      {effectiveSubTab === 'algos' && (
        <div className="flex flex-col gap-2.5">
          {/* Silicon Dust Overclock Header */}
          <div className="flex items-center justify-between rounded-2xl border-2 border-[#78350f] bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-3.5 py-2.5 shadow-md">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/30 text-base shadow-inner">
                🧪
              </div>
              <div>
                <div className="font-display text-[11px] font-black uppercase tracking-wider text-purple-200">
                  Silicon Overclocking
                </div>
                <div className="text-[9px] font-semibold text-purple-300">
                  Salvage duplicates & socket 3 custom sub-stats
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-950/70 px-3 py-1 shadow">
              <span className="font-display text-xs font-black text-amber-300">
                {meta.siliconDust ?? 0}
              </span>
              <span className="text-[10px] font-black text-purple-200">🧪 DUST</span>
            </div>
          </div>

          {/* 5 Staggered Equipped Relic Slots Rack */}
          {(() => {
            const unlockedRelicSlots = Math.max(
              meta.unlockedRelicSlots ?? 1,
              unlocks.unlockedAlgoSlots,
            )
            return (
              <div className="flex flex-col gap-2 rounded-3xl arcade-card p-3">
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#2C1810]">
                  <span>
                    ⚡ Active Hardware Rack ({meta.equippedRelicIds.length}/{unlockedRelicSlots} Unlocked)
                  </span>
                  <span className="text-[10px] font-semibold text-[#6E5A4F]">
                    Tap slot to unequip
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: MAX_EQUIPPED_RELICS }).map((_, idx) => {
                    const isSlotUnlocked = idx < unlockedRelicSlots
                    const relicId = isSlotUnlocked ? meta.equippedRelicIds[idx] : undefined
                    const relic = relicId ? RELIC_MAP[relicId] : null

                    if (!isSlotUnlocked) {
                      return (
                        <div
                          key={idx}
                          className="flex h-16 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-[#E2D5C1] bg-[#F3E9D8] px-1 text-center text-[#6E5A4F]"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <span className="font-display text-[8px] font-extrabold leading-tight">
                            {RELIC_SLOT_UNLOCK_LABELS[idx]}
                          </span>
                        </div>
                      )
                    }

                    if (!relic) {
                      return (
                        <div
                          key={idx}
                          className="flex h-16 flex-col items-center justify-center rounded-xl border border-dashed border-[#E2D5C1] bg-[#F3E9D8] font-display text-xs font-extrabold text-[#6E5A4F]"
                        >
                          <span>+</span>
                          <span className="text-[8px]">EMPTY</span>
                        </div>
                      )
                    }
                    const theme = RARITY_CARD_THEMES[relic.rarity]
                    return (
                      <button
                        key={relic.id}
                        type="button"
                        onClick={() => meta.unequipRelic(relic.id)}
                        className={`flex h-16 flex-col items-center justify-center gap-0.5 rounded-2xl p-1 transition active:translate-y-0.5 ${theme.cardBg} border-2 border-[#3E2723] border-b-4`}
                        title={relic.name}
                      >
                        <DynamicIcon name={relic.icon} className="h-5 w-5 text-white drop-shadow" />
                        <span className="w-full truncate text-center font-display text-[8px] font-black text-white game-text-outline-sm">
                          {relic.name.split(' ')[0]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* All 12 Algo Relics Collection Grid */}
          <div className="flex flex-col gap-2 rounded-3xl arcade-card p-3 pb-3.5">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-black uppercase tracking-wider text-[#422006]">
                🔮 Algo Relic Vault ({meta.ownedRelics.length}/{RELICS.length})
              </span>
              <span className="text-[10px] font-bold text-[#9a3412]">Tap relic to inspect/equip</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {RELICS.map((relic) => {
                const owned = meta.ownedRelics.includes(relic.id)
                const equipped = meta.equippedRelicIds.includes(relic.id)
                const theme = RARITY_CARD_THEMES[relic.rarity]

                if (!owned) {
                  return (
                    <div
                      key={relic.id}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-[#b45309]/40 border-b-4 border-b-[#78350f]/50 bg-[#ffedd5]/80 p-2.5 opacity-75"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#78350f]/15 text-[#78350f]">
                        <DynamicIcon name={relic.icon} className="h-5 w-5" />
                      </div>
                      <span className="w-full truncate text-center font-display text-[10px] font-bold text-[#78350f]">
                        {relic.name}
                      </span>
                    </div>
                  )
                }

                return (
                  <button
                    key={relic.id}
                    type="button"
                    onClick={() => setSelectedRelic(relic)}
                    className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2.5 transition active:translate-y-0.5 ${theme.cardBg} border-2 border-[#422006] border-b-4`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-black/35 text-white shadow">
                      <DynamicIcon name={relic.icon} className="h-5 w-5" />
                    </div>
                    <span className="w-full truncate text-center font-display text-[10px] font-black text-white game-text-outline-sm">
                      {relic.name}
                    </span>
                    {equipped && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#14532d] bg-[#4ade80] text-[#052e16] shadow">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SUB-TAB 4: [ ⛏️ RIG ] — 6-Slot Cybernetic Hardware & Corporate Sets
         ═══════════════════════════════════════════════════════════════════════════ */}
      {effectiveSubTab === 'rig' && <MiningRigPanel />}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SUB-TAB 5: [ 🏗️ BASE ] — 🌍 Real Estate Locations & 🛋️ Furniture Amenities
         ═══════════════════════════════════════════════════════════════════════════ */}
      {effectiveSubTab === 'base' && (
        <div className="flex flex-col gap-2.5">
          {/* Active Real Estate Aura Summary Header */}
          <div className="flex items-center justify-between gap-2 rounded-3xl arcade-card px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#78350f] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-2xl shadow">
                {activeLocCfg.emoji}
              </div>
              <div>
                <div className="font-display text-xs font-black text-[#422006]">
                  {activeLocCfg.name}
                </div>
                <div className="text-[11px] font-bold text-[#16a34a]">
                  +{Math.round(activeLocCfg.globalYieldBonus * 100)}% Global Yield • +
                  {activeLocCfg.startingHpBonus} Margin HP
                </div>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-[#b45309] bg-[#ffedd5] px-2.5 py-1 text-right">
              <div className="text-[9px] font-black uppercase text-[#9a3412]">Blueprints</div>
              <div className="font-display text-xs font-black text-[#7e22ce]">
                📐 {meta.furnitureBlueprints ?? 0}
              </div>
            </div>
          </div>

          {/* Inner Toggle: [ 🌍 Locations ] vs [ 🛋️ Furniture ] vs [ 📊 Chart FX ] */}
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl border-2 border-[#78350f] bg-[#ffedd5] p-1">
            <button
              type="button"
              onClick={() => setBaseToggle('locations')}
              className={`flex items-center justify-center gap-1 rounded-xl py-1.5 font-display text-[10px] font-black transition-all ${
                baseToggle === 'locations'
                  ? 'btn-3d-cyan text-white game-text-outline-sm shadow'
                  : 'text-[#422006]'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span>🌍 Locations</span>
            </button>
            <button
              type="button"
              onClick={() => setBaseToggle('furniture')}
              className={`flex items-center justify-center gap-1 rounded-xl py-1.5 font-display text-[10px] font-black transition-all ${
                baseToggle === 'furniture'
                  ? 'btn-3d-green text-white game-text-outline-sm shadow'
                  : 'text-[#422006]'
              }`}
            >
              <Armchair className="h-3.5 w-3.5" />
              <span>🛋️ Furniture</span>
            </button>
            <button
              type="button"
              onClick={() => setBaseToggle('chart_skins')}
              className={`flex items-center justify-center gap-1 rounded-xl py-1.5 font-display text-[10px] font-black transition-all ${
                baseToggle === 'chart_skins'
                  ? 'btn-3d-purple text-white game-text-outline-sm shadow'
                  : 'text-[#422006]'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>📊 Chart FX</span>
            </button>
          </div>

          {/* ─────── TOGGLE 1: 🌍 REAL ESTATE LOCATIONS (5 TIERS) ─────── */}
          {baseToggle === 'locations' && (
            <div className="flex flex-col gap-2.5">
              {BASE_LOCATIONS.map((loc, idx) => {
                const isUnlocked = unlockedLocations.includes(loc.id)
                const isSelected = currentLocationId === loc.id
                const stageMet = meta.currentStage >= loc.unlockStage
                const canAffordGems = meta.gems >= loc.unlockGemsCost
                const canUnlock = !isUnlocked && stageMet && canAffordGems

                return (
                  <div
                    key={loc.id}
                    className={`flex flex-col gap-2 rounded-3xl border-[3px] border-[#78350f] border-b-[5px] border-b-[#451a03] p-3 shadow-md ${
                      isSelected ? 'bg-[#fef9c3] ring-2 ring-[#f59e0b]' : 'bg-[#fff6e6]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#78350f] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-2xl shadow">
                          {loc.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full border border-[#78350f] bg-[#ffedd5] px-2 py-0.2 font-display text-[9px] font-black uppercase text-[#9a3412]">
                              Tier {idx + 1} Real Estate
                            </span>
                            {isSelected && (
                              <span className="rounded-full bg-[#22c55e] px-2 py-0.2 font-display text-[9px] font-black text-white game-text-outline-sm">
                                ACTIVE HQ
                              </span>
                            )}
                          </div>
                          <h4 className="font-display text-sm font-black text-[#422006]">
                            {loc.name}
                          </h4>
                          <p className="text-[11px] font-bold text-[#92400e] leading-tight">
                            {loc.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="rounded-xl border border-[#b45309]/40 bg-[#ffedd5] px-2.5 py-1.5 text-[11px] font-bold text-[#422006]">
                      {loc.description}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-display font-black">
                        <span className="rounded-lg border border-[#15803d] bg-[#dcfce7] px-2 py-0.5 text-[#15803d]">
                          +{Math.round(loc.globalYieldBonus * 100)}% Global Seed Yield
                        </span>
                        <span className="rounded-lg border border-[#0369a1] bg-[#e0f2fe] px-2 py-0.5 text-[#0369a1]">
                          +{loc.startingHpBonus} Margin Max HP
                        </span>
                      </div>

                      {isUnlocked ? (
                        <button
                          type="button"
                          disabled={isSelected}
                          onClick={() => handleUnlockOrSelectLocation(loc.id)}
                          className={`shrink-0 rounded-xl px-3.5 py-2 font-display text-xs font-black ${
                            isSelected
                              ? 'border-2 border-[#78350f]/30 bg-[#fed7aa] text-[#78350f]'
                              : 'btn-3d-green game-text-outline-sm active:translate-y-0.5'
                          }`}
                        >
                          {isSelected ? '✓ Active' : 'Move In'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!canUnlock}
                          onClick={() => handleUnlockOrSelectLocation(loc.id)}
                          className={`shrink-0 rounded-xl px-3 py-2 font-display text-xs font-black ${
                            canUnlock
                              ? 'btn-3d-gold game-text-outline-sm active:translate-y-0.5'
                              : 'border-2 border-[#78350f]/30 bg-[#e7e5e4] text-[#78716c] cursor-not-allowed'
                          }`}
                        >
                          {!stageMet
                            ? `🔒 Stage ${loc.unlockStage}`
                            : `Unlock (${loc.unlockGemsCost}💎)`}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ─────── TOGGLE 2: 🛋️ FURNITURE AMENITIES (6 SLOTS, LV 1–10) ─────── */}
          {baseToggle === 'furniture' && (
            <div className="grid grid-cols-2 gap-2.5">
              {FURNITURE_AMENITIES.map((f) => {
                const lvl = furnitureLevels[f.id] ?? 1
                const isMax = lvl >= f.maxLevel
                const cost = getFurnitureUpgradeCost(f.id, lvl)
                const canAfford = !isMax && meta.hashrate >= cost
                const tierName = getFurnitureTierName(f, lvl)
                const bonusVal = getFurnitureBonus(f, lvl)

                return (
                  <div
                    key={f.id}
                    className="relative flex flex-col justify-between rounded-3xl border-2 border-[#3E2723] border-b-4 bg-[#FFFDF9] p-3 shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#3E2723] bg-gradient-to-b from-[#fde047] to-[#f59e0b] text-xl shadow-xs">
                          {f.emoji}
                        </div>
                        <span className="rounded-full border border-[#E2D5C1] bg-[#F3E9D8] px-2 py-0.5 font-display text-[10px] font-extrabold text-[#2C1810]">
                          Lv.{lvl}/{f.maxLevel}
                        </span>
                      </div>

                      <div className="mt-2 font-display text-xs font-extrabold text-[#2C1810]">
                        {f.name}
                      </div>
                      <div className="font-display text-[10px] font-black text-[#b45309] truncate">
                        ★ {tierName}
                      </div>

                      <div className="mt-1.5 rounded-xl border border-[#E2D5C1] bg-[#F3E9D8] p-1.5 text-[10px] font-semibold text-[#2C1810]">
                        <div className="text-[#6E5A4F]">{f.buffLabel}</div>
                        <div className="font-display text-xs font-black text-[#16a34a]">
                          +{bonusVal}
                          {f.unit}
                          {!isMax && (
                            <span className="ml-1 text-[10px] text-[#0284c7]">
                              (→ +{getFurnitureBonus(f, lvl + 1)}
                              {f.unit})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleUpgradeFurniture(f.id, f.name)}
                      className={`mt-2 flex w-full items-center justify-center gap-1 rounded-2xl py-2 font-display text-[11px] font-black ${
                        isMax
                          ? 'border-2 border-[#78350f]/30 bg-[#fed7aa] text-[#78350f]'
                          : canAfford
                          ? 'btn-3d-green game-text-outline-sm active:translate-y-0.5'
                          : 'border-2 border-[#78350f]/30 bg-[#e7e5e4] text-[#78716c] cursor-not-allowed'
                      }`}
                    >
                      {isMax ? (
                        <span>MAX TIER</span>
                      ) : (
                        <>
                          <span>UPGRADE</span>
                          <span className="inline-flex items-center gap-0.5">
                            <HashrateIcon size={11} /> {fmtNum(cost)}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* ─────── TOGGLE 3: 📊 COSMETIC CANDLESTICK & CHART FX SKINS ─────── */}
          {baseToggle === 'chart_skins' && (
            <div className="flex flex-col gap-3">
              {/* Interactive Candlestick Canvas Live Preview Box */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#78350f] bg-[#0F172A] p-2 shadow-inner">
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">📈</span>
                    <span className="font-display text-[11px] font-black text-white/90">
                      LIVE CHART FX PREVIEW: {CHART_SKINS.find((s) => s.id === previewSkinId)?.name}
                    </span>
                  </div>
                  {meta.equippedChartSkin === previewSkinId ? (
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 font-display text-[9px] font-black text-white shadow">
                      ✓ EQUIPPED
                    </span>
                  ) : (meta.unlockedChartSkins ?? ['default']).includes(previewSkinId) ? (
                    <button
                      type="button"
                      onClick={() => {
                        AudioSynth.unlock()
                        AudioSynth.playCoinInject()
                        meta.setChartSkin(previewSkinId)
                      }}
                      className="rounded-full bg-cyan-500 px-2.5 py-0.5 font-display text-[9px] font-black text-white shadow active:scale-95 animate-pulse"
                    >
                      EQUIP THIS
                    </button>
                  ) : (
                    <span className="rounded-full bg-slate-600 px-2 py-0.5 font-display text-[9px] font-black text-white">
                      LOCKED
                    </span>
                  )}
                </div>

                <div className="h-28 w-full overflow-hidden rounded-xl border border-white/10">
                  <CandlestickCanvas
                    candles={[
                      { o: 1000, h: 1040, l: 980, c: 1020 },
                      { o: 1020, h: 1070, l: 1010, c: 1060 },
                      { o: 1060, h: 1065, l: 1020, c: 1030 },
                      { o: 1030, h: 1110, l: 1025, c: 1090 },
                      { o: 1090, h: 1140, l: 1080, c: 1130 },
                      { o: 1130, h: 1180, l: 1120, c: 1165 },
                    ]}
                    skinId={previewSkinId}
                    megaCandleActive={previewSkinId === 'sovereign_gold'}
                  />
                </div>
              </div>

              {/* Skins Grid */}
              <div className="flex flex-col gap-2">
                {CHART_SKINS.map((skin) => {
                  const isUnlocked = (meta.unlockedChartSkins ?? ['default']).includes(skin.id)
                  const isEquipped = meta.equippedChartSkin === skin.id
                  const isPreviewing = previewSkinId === skin.id

                  return (
                    <div
                      key={skin.id}
                      className={`flex flex-col gap-1.5 rounded-2xl border-2 p-3 shadow-sm transition-all ${
                        isEquipped
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-400'
                          : isPreviewing
                          ? 'border-cyan-500 bg-cyan-50/70'
                          : isUnlocked
                          ? 'border-[#78350f]/30 bg-white'
                          : 'border-slate-300 bg-slate-100 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#78350f]/40 bg-slate-900 text-xl shadow">
                            {skin.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-display text-xs font-black text-[#422006]">
                                {skin.name}
                              </span>
                              <span className="rounded bg-black/10 px-1.5 py-0.2 text-[8px] font-black uppercase text-[#78350f]">
                                {skin.tag}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-[#b45309]">
                              {skin.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewSkinId(skin.id)}
                            className={`rounded-lg px-2 py-1 font-display text-[9px] font-black shadow-xs transition-transform active:scale-95 ${
                              isPreviewing
                                ? 'bg-cyan-600 text-white'
                                : 'border border-cyan-700 bg-cyan-100 text-cyan-900'
                            }`}
                          >
                            {isPreviewing ? 'Previewing' : 'Preview'}
                          </button>

                          {isEquipped ? (
                            <div className="flex items-center gap-0.5 rounded-lg bg-emerald-600 px-2.5 py-1 font-display text-[9px] font-black text-white shadow-xs">
                              <Check className="h-3 w-3" /> EQUIPPED
                            </div>
                          ) : isUnlocked ? (
                            <button
                              type="button"
                              onClick={() => {
                                AudioSynth.unlock()
                                AudioSynth.playCoinInject()
                                meta.setChartSkin(skin.id)
                                setPreviewSkinId(skin.id)
                              }}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 font-display text-[9px] font-black text-white shadow-xs active:scale-95"
                            >
                              EQUIP
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 font-display text-[8.5px] font-bold text-slate-600">
                              <Lock className="h-2.5 w-2.5" /> LOCKED
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-[9.5px] text-[#5c3d2e] leading-tight">
                        {skin.description}
                      </p>

                      {!isUnlocked && (
                        <div className="rounded-lg bg-amber-100/80 px-2 py-0.5 text-[8.5px] font-bold text-amber-900">
                          Unlock: {skin.howToUnlock}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────── COIN DETAIL & FORGE DRAWER MODAL ───────── */}
      {activeCfg && activeStack && (
        <CoinDetailModal
          coinCfg={activeCfg}
          activeStack={activeStack}
          stacksForCoin={stacksForCoin}
          isEquipped={meta.equippedCoinIds.includes(activeStack.id)}
          hashrate={meta.hashrate}
          coinForgeUnlocked={unlocks.coinForgeUnlocked}
          onSelectStack={setSelectedStackId}
          onEquipOrUnequip={handleEquipOrUnequipCoin}
          onLevelUp={handleLevelUpCoin}
          onOneTapForge={handleOneTapForge}
          onClose={() => setSelectedCoinId(null)}
        />
      )}
      </div>

      {/* ───────── RELIC DETAIL DRAWER MODAL ───────── */}
      {selectedRelic && (
        <div
          className="absolute inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedRelic(null)}
        >
          <div
            className="flex w-full max-w-[430px] flex-col gap-3 rounded-t-3xl border-t-[4px] border-[#78350f] bg-[#fff6e6] p-4 text-[#422006] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#422006] bg-gradient-to-b from-[#a855f7] to-[#6b21a8] text-white shadow">
                  <DynamicIcon name={selectedRelic.icon} className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-black text-[#422006]">
                    {selectedRelic.name}
                  </h3>
                  <span className="font-display text-xs font-black uppercase text-[#7e22ce]">
                    {selectedRelic.rarity} Relic
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRelic(null)}
                className="rounded-xl border-2 border-[#78350f] bg-[#ffedd5] p-1.5 text-[#422006]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="rounded-2xl border-2 border-[#b45309] bg-[#ffedd5] p-3 text-xs font-bold text-[#422006]">
              {selectedRelic.description}
            </p>

            {/* Overclock Sockets (Silicon Overclocking) */}
            <div className="rounded-2xl border-2 border-purple-500/40 bg-purple-950/20 p-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-purple-400/20">
                <span className="font-display text-[10px] font-black uppercase text-purple-900">
                  🧪 Overclock Sockets (3 Slots)
                </span>
                <span className="text-[9px] font-bold text-purple-700">
                  Dust: {meta.siliconDust ?? 0}
                </span>
              </div>

              {(() => {
                const sockets = meta.algoOverclocks?.[selectedRelic.id]
                if (!sockets || sockets.length === 0) {
                  return (
                    <div className="py-2 text-center text-[10px] font-semibold text-[#78350f]">
                      No sub-stats installed. Overclock to roll 3 randomized bonuses!
                    </div>
                  )
                }
                return (
                  <div className="mt-1.5 flex flex-col gap-1">
                    {sockets.map((sock, i) => {
                      const tierStyles =
                        sock.tier === 'prismatic'
                          ? 'border-purple-500 bg-purple-900/10 text-purple-700'
                          : sock.tier === 'gold'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-700'
                            : 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
                      const tierLabel =
                        sock.tier === 'prismatic' ? '💎 PRISMATIC' : sock.tier === 'gold' ? '⭐ GOLD' : '🟢 MINOR'

                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded-xl border px-2 py-1 text-[10px] font-black ${tierStyles}`}
                        >
                          <span>{sock.label}</span>
                          <span className="text-[8px] uppercase tracking-wider">{tierLabel}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={(meta.siliconDust ?? 0) < SILICON_OVERCLOCK_REROLL_COST}
                  onClick={() => {
                    AudioSynth.unlock()
                    if (meta.rerollAlgoOverclock(selectedRelic.id)) {
                      AudioSynth.playChestOpen()
                    }
                  }}
                  className={`flex items-center justify-center gap-1 rounded-xl py-2 font-display text-[10px] font-black ${
                    (meta.siliconDust ?? 0) >= SILICON_OVERCLOCK_REROLL_COST
                      ? 'btn-3d-purple text-white'
                      : 'border-2 border-stone-300 bg-stone-200 text-stone-500 opacity-60'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>OVERCLOCK ({SILICON_OVERCLOCK_REROLL_COST} 🧪)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    AudioSynth.unlock()
                    AudioSynth.playCoinInject()
                    meta.salvageAlgoRelic(selectedRelic.id)
                    setSelectedRelic(null)
                  }}
                  className="flex items-center justify-center gap-1 rounded-xl border-2 border-stone-400 bg-stone-100 py-2 font-display text-[10px] font-black text-stone-700 hover:bg-stone-200"
                >
                  <Flame className="h-3 w-3 text-red-500" />
                  <span>SALVAGE (+{SILICON_DUST_SALVAGE_VALUE} 🧪)</span>
                </button>
              </div>
            </div>

            {(() => {
              const equipped = meta.equippedRelicIds.includes(selectedRelic.id)
              return (
                <button
                  type="button"
                  onClick={() => {
                    if (equipped) meta.unequipRelic(selectedRelic.id)
                    else meta.equipRelic(selectedRelic.id)
                    setSelectedRelic(null)
                  }}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-xs font-black game-text-outline-sm ${
                    equipped ? 'btn-3d-red' : 'btn-3d-purple'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  {equipped ? 'UNEQUIP RELIC' : 'EQUIP RELIC'}
                </button>
              )
            })()}
          </div>
        </div>
      )}

      {/* Phase 2: Offshore Arbitrage Expeditions Modal */}
      {showExpeditionsModal && (
        <ExpeditionsModal onClose={() => setShowExpeditionsModal(false)} />
      )}

      {/* Phase 2: Codex Museum Modal */}
      {showCodexModal && (
        <CodexModal onClose={() => setShowCodexModal(false)} />
      )}

      {/* Hero Skin Wardrobe & Duplicate Star Ascension Modal */}
      {showSkinsModal && (
        <HeroSkinsModal
          heroId={selectedHero.id}
          onClose={() => setShowSkinsModal(false)}
        />
      )}

      {/* Hero Multi-Skill Arsenal & Passive Mastery Modal */}
      {showHeroSkillsModal && (
        <HeroSkillsModal
          heroId={selectedHero.id}
          onClose={() => setShowHeroSkillsModal(false)}
        />
      )}
    </div>
  )
}
