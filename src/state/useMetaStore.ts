import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DailyQuest, OwnedCoin, QuestReward, Rarity, UnlockFeature } from '../types/game.types'
import { COINS } from '../config/coins.config'
import { RELIC_MAP } from '../config/relics.config'
import {
  getUnlockedRelicSlotsForClearedStage,
  getStageConfig,
  TOTAL_CAMPAIGN_STAGES,
} from '../config/stages.config'
import {
  HEROES,
  HERO_MAP,
  HERO_FRAGMENTS_REQUIRED,
  MAX_HERO_STARS,
  heroLevelUpCost,
  heroSkillUpgradeCost,
  type HeroId,
} from '../config/heroes.config'
import {
  HERO_SKILLS,
  HERO_SKILLS_BY_HERO,
  HERO_SKILLS_MAP,
  MAX_HERO_SKILL_LEVEL,
  MAX_HERO_SKILL_STARS,
  getHeroSkillLevelUpCost,
  getHeroSkillAscensionCost,
  scalePassiveMastery,
  type HeroSkillConfig,
  type PassiveMasteryStats,
} from '../config/heroSkills.config'
import {
  type RigSlot,
  type RigItem,
  type AggregatedRigStats,
  type ActiveSetBonus,
  CATALOG_RIG_ITEMS,
  RIG_RARITY_CONFIG,
  calculateAggregatedRigStats,
  calculateActiveSetBonuses,
  upgradeRigItemLevel,
  reforgeAffix,
  getRigItemUpgradeCost,
  REFORGE_COST,
} from '../config/equipment.config'
import {
  BASE_LOCATION_MAP,
  DAILY_FARMING_MISSIONS,
  FURNITURE_MAP,
  HERO_CAMP_QUIPS,
  getFurnitureUpgradeCost,
  type BaseLocationId,
  type DailyMissionId,
  type FurnitureId,
} from '../config/base.config'
import {
  BASE_SEED_CAPITAL, DAILY_QUESTS, DAILY_TRACK_MILESTONES, DEFEAT_HASHRATE_FRACTION,
  DUPLICATE_RELIC_HASHRATE, GACHA_BANNERS, IDLE_RIG_CAP_HOURS, MAX_EQUIPPED_RELICS,
  PIGGY_GEMS_PER_NODE, PIGGY_GEMS_STAGE_WIN, SHARDS_PER_COIN, SHOP_BUNDLES,
  VIP_EXTRA_RIG_CAP_HOURS, getActiveGrowthEvent, levelUpCost,
} from '../config/economy.config'
import {
  EXPEDITION_CONTRACTS,
  calculateGreatSuccessChance,
  type ActiveExpedition,
} from '../config/expeditions.config'
import { CODEX_CLAIM_GEMS_REWARD } from '../config/codex.config'
import { getTowerFloorRewards, type TowerMilestoneReward } from '../config/tower.config'
import {
  calculateSeasonTier,
  MAX_SEASON_TIER,
  SEASON_TIERS,
  XP_PER_TIER,
} from '../config/seasonPass.config'
import {
  MEME_WHEEL_SLICES,
  WHEEL_MILESTONES,
  WHEEL_TOP_UPS,
  type WheelSlice,
  type WheelMilestone,
} from '../config/memeWheel.config'
import { RELAY_CHAIN_STEPS } from '../config/relayChain.config'
import { type ChartSkinId } from '../config/chartSkins.config'
import {
  SKIN_MAP,
  MAX_SKIN_STARS,
  getSkinAscensionCost,
  getSkinStarMultiplier,
} from '../config/heroSkins.config'
import {
  GALA_WHEEL_SLICES,
  GALA_100_PULL_MILESTONES,
  FORTUNA_TRIAL_STAGES,
  PLINKO_BUCKETS,
  type GalaWheelSlice,
  type WheelMilestoneReward,
  type PlinkoBucket,
} from '../config/goldenGala.config'
import {
  SEASON_MISSIONS,
  SEASON_MISSION_MAP,
  SEASON_MISSION_MILESTONES,
  type SeasonMissionId,
  type SeasonMissionReward,
} from '../config/seasonMissions.config'
import { PET_MAP, petLevelUpCost, type PetId } from '../config/pets.config'
import { HERO_BONDS, type HeroBondConfig } from '../config/heroBonds.config'
import {
  rollSiliconOverclockSockets,
  SILICON_DUST_SALVAGE_VALUE,
  SILICON_OVERCLOCK_REROLL_COST,
  type AlgoOverclockSocket,
} from '../config/algoOverclock.config'
import {
  addCoins, computeGlobalYield, computeIdleReward, fuseAll, fuseOnce, pickCoinId, pickRelicId,
  pruneEmpty, rollBannerRarity, type PityState,
} from '../engine/economy'

// ───────────────────────── Types ─────────────────────────
export interface GachaResult {
  type: 'coin' | 'relic'
  id: string
  rarity: Rarity
  isDuplicate?: boolean
  isNew?: boolean
  bonusHeroFragmentId?: HeroId
  bonusHeroFragments?: number
}

export interface IdleClaimResult {
  seconds: number
  hashrate: number
  shards: Record<string, number>
  coinsFromShards: string[]
}

export interface RunPayoutResult {
  hashrate: number
  piggyBankGems: number
  gems: number
  silverKeys: number
  quantumKeys: number
  unlockedSlot?: number
  unlockedRelicSlot?: number
  unlockedFeatures: UnlockFeature[]
  firstClear: boolean
  cycleBreakthroughCrate?: {
    heroFragments: number
    quantumKeys: number
    gems: number
    cycle: number
    cycleName: string
  }
}

export interface MissionRaidReward {
  gems: number
  silverKeys: number
  hashrate: number
  shards: number
  blueprints: number
  heroFragments: number
  heroFragmentHeroId: HeroId
  unlockedNextTier: boolean
}

export type AuthAccountType = 'guest' | 'google' | 'x' | 'facebook' | null

export interface AuthAccount {
  type: AuthAccountType
  handle: string
  uid: string
}

export type ServerRegion = 'Oceania' | 'North America' | 'Europe' | 'Asia'
export type ServerStatus = 'new' | 'busy' | 'full'

export interface ServerConfig {
  id: string
  name: string
  region: ServerRegion
  status: ServerStatus
  loadPct: number
  pingMs?: number
}

export type TutorialStep =
  | 'not_started'
  | 'intro_cutscene'
  | 'scripted_battle'
  | 'upgrade_hero'
  | 'upgrade_coin'
  | 'ready_stage_1'
  | 'completed'

export const MAX_ENERGY = 30
export const ENERGY_RECHARGE_MS = 12 * 60 * 1000 // 12 minutes per +1 energy
export const RUN_ENERGY_COST = 5
export const HERO_CAMP_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour (3,600,000 ms) cooldown on Camp Hero taps

export const getMaxEnergy = (seasonPassType?: string): number => {
  return seasonPassType === 'whale' ? 45 : MAX_ENERGY
}

const DEFAULT_FURNITURE_LEVELS: Record<FurnitureId, number> = {
  trading_desk: 1,
  campfire_bar: 1,
  cooling_rack: 1,
  backup_generator: 1,
  security_firewall: 1,
  satellite_dish: 1,
}

const DEFAULT_MISSION_TICKETS: Record<DailyMissionId, number> = {
  whale_liquidity_heist: 2,
  asic_overclock_trial: 2,
  corporate_espionage: 2,
}

const DEFAULT_MISSION_TIERS: Record<DailyMissionId, number> = {
  whale_liquidity_heist: 1,
  asic_overclock_trial: 1,
  corporate_espionage: 1,
}

// ────────────────────────────────────────
// PHASE 2 EXPANSION: CRISIS DUNGEONS, GUILD HEIST & GHOST RACES
// ────────────────────────────────────────

export type CrisisDungeonId = 'gas_gauntlet' | 'cold_storage' | 'memecoin_casino'

export interface CrisisDungeonReward {
  blueprints?: number
  solderWire?: number
  hashrate?: number
  gems?: number
  quantumKeys?: number
  silverKeys?: number
  rigItem?: RigItem
}

export interface SyndicateHeistMemberContribution {
  id: string
  name: string
  avatar: string
  damage: number
  rank: number
  isPlayer?: boolean
}

export interface GhostRunSnapshot {
  stageId: number
  heroId: HeroId
  heroStars: number
  coins: string[]
  nodesCleared: number
  clearTimeSeconds: number
  totalDamage: number
  date: number
  playerName?: string
}

export interface GhostRacerProfile {
  id: string
  name: string
  avatar: string
  heroId: HeroId
  coins: string[]
  clearTimeSeconds: number
  trophies: number
  hashratePool: number
  difficulty: 'easy' | 'medium' | 'hard' | 'champion'
}

interface MetaData {
  /** Highest stage the player may enter. */
  currentStage: number
  highestStageCleared: number
  unlockedSlots: number
  unlockedRelicSlots: number
  unlockedFeatures: UnlockFeature[]
  baseSeedCapital: number

  hashrate: number
  gems: number
  silverKeys: number
  quantumKeys: number
  isVipAdFree: boolean
  piggyBankGems: number

  /** Hybrid-Casual Energy System (max 30 natural, +1 per 12m). */
  energy: number
  lastEnergyRechargeTimestamp: number
  lastEnergyAdDate: string

  /** Upgradable Real Estate Locations & Furniture Amenities. */
  currentLocationId: BaseLocationId
  unlockedLocationIds: BaseLocationId[]
  furnitureLevels: Record<FurnitureId, number>
  furnitureBlueprints: number
  skillManuals?: number
  dailyExchangePurchases?: {
    blueprints?: number
    manuals?: number
    galaTickets?: number
  }
  lastDailyExchangeDate?: string

  /** Daily Ticketed Farming Missions (2 free tickets/day per dungeon, Tiers 1..10). */
  missionTickets: Record<DailyMissionId, number>
  missionHighestTier: Record<DailyMissionId, number>
  lastMissionResetDate: string

  ownedCoins: OwnedCoin[]
  /** Owned-coin stack ids per wallet slot (length 4, null = empty). */
  equippedCoinIds: (string | null)[]
  ownedRelics: string[]
  equippedRelicIds: string[]
  coinShards: Record<string, number>

  /** Collectible Trader Heroes: heroId -> level (1+). */
  ownedHeroes: Record<string, number>
  equippedHeroId: HeroId
  /** 50-Fragment Unlock & Star Ascension System (1★ to 5★). */
  heroFragments: Record<string, number>
  heroStars: Record<string, number>
  heroSkillLevels: Record<string, { passiveLv: number; activeLv: number }>
  /** Multi-Skill Arsenal: heroId -> equipped skillId */
  equippedHeroSkills: Record<string, string>
  /** Multi-Skill Progression: skillId -> { level: number; stars: number } */
  heroSkillMastery: Record<string, { level: number; stars: number }>
  claimedStageChestMilestones: number[]

  /** 6-Slot Mining Rig Hardware Equipment System */
  equippedRig: Record<RigSlot, RigItem | null>
  rigInventory: RigItem[]
  solderWire: number

  /** Tactical Audio, Haptics & Notification Settings */
  audioEnabled: boolean
  hapticsEnabled: boolean
  notificationsEnabled: boolean
  lastEnergyNotifiedTimestamp: number
  lastPatrolNotifiedTimestamp: number
  lastDailyResetNoticeDate: string

  /** Player Profile, Lifetime Career Stats & VIP Lounge. */
  playerName: string
  playerAvatarId: string
  hasBoughtStarterPack: boolean
  lastVipStipendDate: string
  careerStats: {
    totalRunsPlayed: number
    biggestGreenCandle: number
    totalCoinsForged: number
  }

  /** FTUE & Server Gate State. */
  authAccount: AuthAccount
  selectedServer: ServerConfig
  tutorialStep: TutorialStep
  /** Dev bypass override to unlock all UI tabs, slots, and features immediately. */
  devUnlockAllUi: boolean

  /** Venture Capital Vault pity (mirrors pityCounters.vc_vault). */
  epicPityCounter: number
  mythicalPityCounter: number
  pityCounters: Record<string, PityState>

  lastIdleClaimTimestamp: number
  /** Timestamp of the last free Camp Hero tap reward (1-hour cooldown). */
  lastHeroCampClaimTimestamp: number
  lastFreePullTimestamps: Record<string, number>
  purchasedBundleIds: string[]
  claimedGrowthFundStages: number[]
  dailyMetrics: Partial<Record<DailyQuest['metric'], number>>
  claimedDailyQuestIds: string[]
  claimedDailyMilestones: number[]
  claimedCarnivalDays: number[]
  weeklyGrowth: { eventId: string; points: number }
  growthPointsByWeek: Record<number, number>
  activeGrowthWeek: 1 | 2 | 3
  marginCallOfferExpiresAt: number | null

  /** Phase 2: Hero Expeditions */
  expeditions: ActiveExpedition[]

  /** Phase 2: Codex Museum */
  codexDiscovered: Record<string, boolean>
  codexClaimed: Record<string, boolean>

  /** Phase 2: Syndicate Mercenary Desk */
  syndicateLentItem: {
    type: 'hero' | 'coin'
    id: string
    postedAt: number
    unclaimedHashrate: number
  } | null
  borrowedMercenary: {
    id: string
    name: string
    type: 'hero' | 'coin'
    starLevel: number
    buffDescription: string
    ownerName: string
  } | null
  lastMercenaryBorrowDate: string

  /** Phase 2: Endless Margin Call Tower */
  highestTowerFloorCleared: number
  towerAttemptsLeft: number
  lastTowerResetDate: string

  /** Major Expansion: Bear Market & Dark Web */
  isBearMarketMode: boolean
  darkWebRelicDust: number
  highestBearStageCleared: number

  /** Major Expansion: Collectible Trading Bot Pets */
  equippedPetId: PetId | null
  ownedPets: Record<PetId, { level: number; unlocked: boolean }>
  petTreats: number

  /** Major Expansion: Daily Market Oracle Puzzle */
  oracleStreak: number
  lastOraclePuzzleDate: string | null

  /** Phase 2 Expansion: Asynchronous Hostile Takeover PvP Arena */
  pvpRating: number
  pvpTickets: number
  lastPvpDailyResetDate: string
  pvpDefensiveSnapshot: {
    heroId: string
    skinId: string
    coins: Array<{ coinId: string; rarity: string; level: number; capacityPct: number }>
    relics: string[]
  } | null

  /** Phase 2 Expansion: Silicon Overclocking */
  siliconDust: number
  algoOverclocks: Record<string, AlgoOverclockSocket[]>

  /** Phase 2 Expansion: Server World Boss (Central Bank Leviathan) */
  worldBossAttemptsLeft: number
  lastWorldBossDate: string
  worldBossPersonalDamage: number

  /** Phase 2 Expansion: Syndicate Financial District Turf Wars */
  targetTurfDistrictId: string
  syndicateInfluencePoints: number
  claimedTurfDistricts: string[]

  /** Phase 3 Monetization & LiveOps Expansion */
  wallBreakerOfferType: 'stat_surge' | 'finish_contract' | null
  wallBreakerHeroId: string | null
  wallBreakerOfferExpiresAt: number | null
  consecutiveBossLosses: Record<number, number>
  whaleDividendCrates: Array<{
    id: string
    buyerName: string
    bundleName: string
    gems: number
    hashrate: number
    claimedByPlayer: boolean
    salutesCount: number
    timestamp: number
  }>
  miningRigSubscriptions: {
    silver_rig?: { active: boolean; expiresAt: number; lastDailyClaimDate: string }
    quantum_asic?: { active: boolean; expiresAt: number; lastDailyClaimDate: string }
  }
  compoundVaultTier: 1 | 2 | 3
  compoundVaultGems: number
  hasBossReviveToken: boolean

  /** Phase 3: 28-Day Bull Market Season Pass */
  seasonPassXp: number
  seasonPassType: 'none' | 'trader' | 'whale'
  seasonPassClaimedFree: number[]
  seasonPassClaimedTrader: number[]
  seasonPassClaimedWhale: number[]
  hasGoldenBullStatue: boolean

  /** Phase 3: Weekend Meme-Coin Frenzy Spin Wheel */
  spinTokens: number
  totalMemeSpins: number
  lastWheelFreeSpinDate: string
  claimedWheelMilestones: number[]

  /** Phase 3: 5-Step Flash Liquidity Chain Offer */
  relayChainStep: number

  /** Phase 3: Cosmetic Candlestick & Chart FX Skins */
  unlockedChartSkins: string[]
  equippedChartSkin: ChartSkinId

  /** Hero Skin Wardrobe & Duplicate Star Ascension */
  ownedSkins: Record<string, { unlocked: boolean; stars: number; copies: number }>
  equippedSkins: Record<HeroId, string>

  /** Season 1: The Golden Bull Gala (Lady Fortuna Event Hub) */
  galaTickets: number
  galaChips: number
  seasonWheelPulls: number
  claimedGalaMilestones: number[]
  clearedFortunaTrials: number[]
  plinkoDrops: number

  /** Season 1: Gala Event Missions Engine */
  seasonMissionProgress: Record<string, number>
  claimedSeasonMissionTiers: Record<string, number[]>
  claimedSeasonMissionMilestones: number[]
  unlockedTitles: string[]
  playerTitle: string

  /** Phase 2 Expansion: Daily Crisis Dungeons */
  crisisDungeonAttempts: Record<CrisisDungeonId, number>
  lastCrisisResetDate: string

  /** Phase 2 Expansion: Asynchronous Syndicate Liquidity Pool Heist */
  syndicateHeistBossHp: number
  syndicateHeistMaxHp: number
  syndicateHeistAttemptsLeft: number
  lastSyndicateHeistDate: string
  syndicateHeistPersonalDamage: number
  syndicateHeistLeaderboard: SyndicateHeistMemberContribution[]
  syndicateHeistClaimedMilestones: number[]

  /** Phase 2 Expansion: Asynchronous Ghost Run Auto-Battle Races */
  raceTickets: number
  lastRaceTicketResetDate: string
  raceTrophies: number
  unclaimedHashrateStolen: number
  ghostRunTelemetry: GhostRunSnapshot | null
  topGhostRacers: GhostRacerProfile[]
}

interface MetaActions {
  pullGacha: (bannerId: string, count: 1 | 10, isFreeAd?: boolean) => GachaResult[] | null
  levelUpCoin: (ownedCoinId: string) => boolean
  fuseCoins: (coinId: string, rarity: Rarity) => boolean
  fuseAllAvailable: () => number
  claimIdleMining: (doubleWithAd: boolean) => IdleClaimResult
  completeRunPayout: (stageId: number, nodesCleared: number, wonStage: boolean) => RunPayoutResult
  quickSweepStage: (stageId: number) => { hashrate: number; shards: number; gems: number } | null

  syncEnergy: () => number
  spendEnergy: (amount?: number) => boolean
  rechargeEnergyWithAd: () => boolean
  rechargeEnergyWithGems: () => boolean

  selectLocation: (id: BaseLocationId) => boolean
  unlockLocation: (id: BaseLocationId) => boolean
  upgradeFurniture: (id: FurnitureId) => boolean
  claimCampHeroTip: (heroId: string) => {
    claimed: boolean
    remainingMinutes: number
    gems: number
    hashrate: number
    quip: string
  }

  syncDailyMissions: () => void
  buyMissionTicket: (id: DailyMissionId, withAd: boolean) => boolean
  completeMissionRaid: (id: DailyMissionId, tier: number) => MissionRaidReward | null

  purchaseBundle: (bundleId: string) => boolean
  claimGrowthFundMilestone: (stage: number) => boolean
  crackPiggyBank: () => number
  incrementDailyMetric: (metric: DailyQuest['metric'], amount?: number) => void
  claimDailyQuest: (questId: string) => boolean
  claimDailyMilestone: (points: number) => boolean
  claimCarnivalDay: (day: number) => boolean

  setActiveGrowthWeek: (week: 1 | 2 | 3) => void
  addGrowthEventPoints: (week: 1 | 2 | 3, points: number) => void
  triggerMarginCallOffer: () => void
  dismissMarginCallOffer: () => void

  equipCoin: (slot: number, ownedCoinId: string) => boolean
  unequipCoin: (slot: number) => void
  equipRelic: (relicId: string) => boolean
  unequipRelic: (relicId: string) => void

  equipHero: (heroId: HeroId) => boolean
  unlockHero: (heroId: HeroId) => boolean
  unlockHeroWithFragments: (heroId: HeroId) => boolean
  ascendHeroStar: (heroId: HeroId) => boolean
  upgradeHeroSkill: (heroId: HeroId, skillType: 'passive' | 'active') => boolean
  equipHeroSkill: (heroId: HeroId, skillId: string) => boolean
  upgradeHeroSkillLevel: (skillId: string) => boolean
  ascendHeroSkillStar: (skillId: string) => boolean
  getHeroEquippedSkill: (heroId: HeroId) => HeroSkillConfig
  getHeroSkillMastery: (skillId: string) => { level: number; stars: number }
  isHeroSkillUnlocked: (heroId: HeroId, skillId: string) => boolean
  getHeroAggregatedPassiveMastery: (heroId: HeroId) => PassiveMasteryStats
  levelUpHero: (heroId: HeroId) => boolean
  claimStageChestMilestone: (stage: number) => boolean
  getTotalPowerScore: () => number

  // 6-Slot Mining Rig Hardware Actions:
  equipRigItem: (item: RigItem) => void
  unequipRigItem: (slot: RigSlot) => void
  salvageRigItem: (itemId: string) => number
  reforgeRigItemAffix: (itemId: string, affixIndex: number) => boolean
  upgradeRigItem: (itemId: string) => boolean
  getEquippedRigStats: () => AggregatedRigStats
  getActiveSetBonuses: () => ActiveSetBonus[]

  // Audio, Haptics & Notification Settings:
  setAudioEnabled: (val: boolean) => void
  setHapticsEnabled: (val: boolean) => void
  setNotificationsEnabled: (val: boolean) => void

  setPlayerProfile: (name: string, avatarId: string) => void
  claimDailyVipStipend: () => boolean
  recordBiggestGreenCandle: (amount: number) => void

  setAuthAccount: (account: AuthAccount) => void
  setSelectedServer: (server: ServerConfig) => void
  setTutorialStep: (step: TutorialStep) => void
  toggleDevUnlockAllUi: () => void
  bindGuestAccount: (type: 'google' | 'x' | 'facebook', handle: string) => void

  addGrowthPoints: (points: number) => void
  setVip: (vip: boolean) => void
  getGlobalYield: () => number
  resetProgress: () => void

  // Phase 2 Actions:
  startExpedition: (contractId: string, heroIds: HeroId[]) => boolean
  claimExpedition: (contractId: string) => {
    success: boolean
    greatSuccess: boolean
    rewards: {
      blueprints: number
      heroFragments: number
      heroFragmentHeroId: HeroId
      gems: number
      hashrate: number
    }
  } | null
  speedUpExpedition: (contractId: string) => boolean

  discoverCodexEntry: (id: string) => void
  claimCodexReward: (id: string) => boolean
  claimAllCodexRewards: () => { totalGems: number; count: number }

  postSyndicateMercenary: (type: 'hero' | 'coin', id: string) => boolean
  reclaimSyndicateMercenary: () => boolean
  claimSyndicateLendingHashrate: () => number
  borrowSyndicateMercenary: (mercenary: {
    id: string
    name: string
    type: 'hero' | 'coin'
    starLevel: number
    buffDescription: string
    ownerName: string
  }) => boolean
  consumeBorrowedMercenary: () => void

  syncTowerDailyReset: () => void
  completeTowerFloor: (floor: number) => {
    hashrate: number
    gems: number
    isMilestone: boolean
    milestoneReward?: TowerMilestoneReward
  }
  failTowerFloor: () => void
  resetTowerAttemptsCheat: () => void

  // Phase 3 Actions:
  addSeasonPassXp: (amount: number) => void
  buySeasonPass: (type: 'trader' | 'whale') => boolean
  claimSeasonPassTier: (tier: number, track: 'free' | 'trader' | 'whale') => boolean
  claimAllSeasonPass: () => { claimedCount: number; gems: number; keys: number; hashrate: number }

  spinMemeWheel: () => { slice: WheelSlice; milestoneUnlocked?: WheelMilestone } | null
  buySpinTokens: (packId: string) => boolean
  claimWheelMilestone: (spinsRequired: number) => boolean

  claimRelayStep: (stepNumber: number) => { success: boolean; error?: string }

  setChartSkin: (skinId: ChartSkinId) => boolean
  unlockChartSkin: (skinId: ChartSkinId) => boolean

  // Hero Skins & Star Ascension
  unlockSkin: (skinId: string, copies?: number) => void
  addSkinCopies: (skinId: string, count: number) => void
  equipHeroSkin: (heroId: HeroId, skinId: string) => void
  ascendHeroSkin: (skinId: string) => boolean
  getSkinStatBonus: () => {
    damagePct: number
    startingSeedPct: number
    critChancePct: number
    greenOddsPct: number
    speedPct: number
    bossBountyPct: number
  }

  // Season 1: Golden Bull Gala Actions
  buyDailyExchange: (itemId: 'blueprints' | 'manuals' | 'galaTickets') => boolean
  spinFortunaWheel: (count: 1 | 10) => {
    results: Array<{ slice: GalaWheelSlice; milestoneUnlocked?: WheelMilestoneReward }>
    milestoneClaimsUnlocked: WheelMilestoneReward[]
  } | null
  buyGalaTicketsWithGems: (count: 1 | 10) => boolean
  claimGalaMilestone: (pulls: number) => boolean
  claimAllGalaMilestones: () => { claimedCount: number }
  completeFortunaTrial: (stage: number) => { success: boolean; ticketsWon: number; shardsWon: number } | null
  dropPlinkoChip: (bucketIndex?: number) => { bucket: PlinkoBucket; rewardDesc: string } | null
  addGalaTickets: (amount: number) => void
  addGalaChips: (amount: number) => void

  // Season 1: Gala Event Missions Engine
  incrementSeasonMissionProgress: (missionId: SeasonMissionId, delta?: number) => void
  setSeasonMissionProgress: (missionId: SeasonMissionId, val: number) => void
  claimSeasonMissionTier: (missionId: SeasonMissionId, tierNumber: number) => SeasonMissionReward | null
  claimSeasonMissionMilestone: (completedTiers: number) => SeasonMissionReward | null
  claimAllSeasonMissions: () => { claimedCount: number; ticketsGained: number; gemsGained: number; shardsGained: number }
  getSeasonMissionProgress: (missionId: SeasonMissionId) => number
  spendGems: (amount: number) => boolean

  // Major Expansion Actions
  toggleBearMarketMode: (enable?: boolean) => void
  equipPet: (petId: PetId | null) => boolean
  unlockPet: (petId: PetId) => boolean
  levelUpPet: (petId: PetId) => boolean
  addPetTreats: (amount: number) => void
  addDarkWebRelicDust: (amount: number) => void
  submitDailyOraclePrediction: (won: boolean) => { gems: number; streak: number }
  getOraclePatrolSpeedBonus: () => number

  // Phase 2 Expansion Actions
  savePvpDefensiveSnapshot: () => boolean
  spendPvpTicket: () => boolean
  recordPvpMatchResult: (won: boolean, deltaRating?: number) => { rating: number; gemsWon: number }
  syncPvpDailyTickets: () => void

  salvageAlgoRelic: (relicId: string) => number
  rerollAlgoOverclock: (relicId: string) => AlgoOverclockSocket[] | null

  getActiveHeroBonds: () => HeroBondConfig[]
  hasHeroBondActive: (bondId: string) => boolean

  recordWorldBossDamage: (damage: number) => { rankPct: number; keysWon: number; skinFragmentsWon: number; gemsWon: number }
  syncWorldBossDaily: () => void

  deployTurfInfluence: (districtId: string, points?: number) => boolean
  setTargetTurfDistrict: (districtId: string) => void
  getControlledTurfPassives: () => string[]

  // Phase 3 Monetization & LiveOps Actions
  recordBossLoss: (stageId: number) => { triggeredOffer: boolean; type?: 'stat_surge' | 'finish_contract' }
  triggerWallBreakerOffer: (type: 'stat_surge' | 'finish_contract', heroId?: string) => void
  dismissWallBreakerOffer: () => void
  purchaseWallBreakerOffer: (type: 'stat_surge' | 'finish_contract', heroId?: string) => boolean
  broadcastWhaleDividend: (buyerName: string, bundleName: string) => void
  claimWhaleDividend: (crateId: string) => { gems: number; hashrate: number } | null
  saluteWhaleBuyer: (crateId: string) => void
  buyMiningRigSubscription: (rigId: 'silver_rig' | 'quantum_asic') => boolean
  claimMiningRigDaily: (rigId: 'silver_rig' | 'quantum_asic') => number | null
  isDualMiningRigActive: () => boolean
  addCompoundVaultRebate: (spentEnergy: number) => void
  smashCompoundVault: () => { gems: number; bonusKeys?: number; nextTier: 1 | 2 | 3 } | null
  purchaseOtcDeal: (tierId: string, selections: Array<{ type: string; id: string; amount: number }>) => boolean

  // Phase 2 Expansion: Crisis Dungeons, Guild Heist & Ghost Races
  syncCrisisDailyAttempts: () => void
  recordCrisisAttempt: (dungeonId: CrisisDungeonId) => boolean
  claimCrisisReward: (dungeonId: CrisisDungeonId, reward: CrisisDungeonReward) => void

  syncSyndicateHeistDaily: () => void
  recordSyndicateHeistDamage: (damage: number) => { newBossHp: number; personalTotal: number }
  claimSyndicateHeistMilestone: (milestoneHp: number) => boolean

  syncRaceTicketsDaily: () => void
  spendRaceTicket: () => boolean
  recordRunTelemetry: (snapshot: GhostRunSnapshot) => void
  recordRaceResult: (won: boolean, deltaTrophies: number, hashrateStolen: number, clearTimeSeconds: number) => { newTrophies: number; totalHashrate: number }
}

export type MetaState = MetaData & MetaActions

const STARTER_STACK_ID = 'starter_bitcrumb'

const DEFAULT_OWNED_SKINS: Record<string, { unlocked: boolean; stars: number; copies: number }> = {
  rookie_satoshi_default: { unlocked: true, stars: 1, copies: 0 },
  degen_ape_roxy_default: { unlocked: true, stars: 1, copies: 0 },
  jordan_the_wolf_default: { unlocked: true, stars: 1, copies: 0 },
  lady_fortuna_default: { unlocked: true, stars: 1, copies: 0 },
  quantum_ai_oracle_default: { unlocked: true, stars: 1, copies: 0 },
  satoshi_nakamoto_default: { unlocked: true, stars: 1, copies: 0 },
}

const DEFAULT_EQUIPPED_SKINS: Record<HeroId, string> = {
  rookie_satoshi: 'rookie_satoshi_default',
  degen_ape_roxy: 'degen_ape_roxy_default',
  jordan_the_wolf: 'jordan_the_wolf_default',
  lady_fortuna: 'lady_fortuna_default',
  quantum_ai_oracle: 'quantum_ai_oracle_default',
  satoshi_nakamoto: 'satoshi_nakamoto_default',
}

const createInitialState = (): MetaData => ({
  currentStage: 1,
  highestStageCleared: 0,
  unlockedSlots: 1,
  unlockedRelicSlots: 1,
  unlockedFeatures: [],
  baseSeedCapital: BASE_SEED_CAPITAL,
  hashrate: 300,
  gems: 200,
  silverKeys: 1,
  quantumKeys: 0,
  isVipAdFree: false,
  piggyBankGems: 0,
  energy: MAX_ENERGY,
  lastEnergyRechargeTimestamp: Date.now(),
  lastEnergyAdDate: '',
  currentLocationId: 'outskirts_tent',
  unlockedLocationIds: ['outskirts_tent'],
  furnitureLevels: { ...DEFAULT_FURNITURE_LEVELS },
  furnitureBlueprints: 2,
  skillManuals: 5,
  dailyExchangePurchases: {
    blueprints: 0,
    manuals: 0,
    galaTickets: 0,
  },
  lastDailyExchangeDate: new Date().toISOString().slice(0, 10),
  missionTickets: { ...DEFAULT_MISSION_TICKETS },
  missionHighestTier: { ...DEFAULT_MISSION_TIERS },
  lastMissionResetDate: new Date().toISOString().slice(0, 10),
  ownedCoins: [{ id: STARTER_STACK_ID, coinId: 'bitcrumb', rarity: 'common', level: 1, count: 1, acquiredAt: 0 }],
  equippedCoinIds: [STARTER_STACK_ID, null, null, null],
  ownedRelics: [],
  equippedRelicIds: [],
  coinShards: {},
  ownedHeroes: { rookie_satoshi: 1 },
  equippedHeroId: 'rookie_satoshi',
  heroFragments: {
    rookie_satoshi: 20,
    degen_ape_roxy: 35,
    jordan_the_wolf: 15,
    lady_fortuna: 25,
    quantum_ai_oracle: 10,
    satoshi_nakamoto: 15,
  },
  heroStars: { rookie_satoshi: 1 },
  heroSkillLevels: {
    rookie_satoshi: { passiveLv: 1, activeLv: 1 },
  },
  equippedHeroSkills: {
    rookie_satoshi: 'rookie_genesis_pump',
    degen_ape_roxy: 'roxy_yolo_leverage',
    jordan_the_wolf: 'jordan_hostile_takeover',
    lady_fortuna: 'fortuna_royal_all_in',
    quantum_ai_oracle: 'oracle_flash_crash',
    satoshi_nakamoto: 'satoshi_halving_supernova',
  },
  heroSkillMastery: {
    rookie_genesis_pump: { level: 1, stars: 1 },
    roxy_yolo_leverage: { level: 1, stars: 1 },
    roxy_fomo_rush: { level: 1, stars: 1 },
    jordan_hostile_takeover: { level: 1, stars: 1 },
    jordan_boiler_room: { level: 1, stars: 1 },
    jordan_pump_and_dump: { level: 1, stars: 1 },
    fortuna_royal_all_in: { level: 1, stars: 1 },
    fortuna_jackpot_squeeze: { level: 1, stars: 1 },
    fortuna_vault_dividend: { level: 1, stars: 1 },
    fortuna_whale_intervention: { level: 1, stars: 1 },
    oracle_flash_crash: { level: 1, stars: 1 },
    oracle_latency_jam: { level: 1, stars: 1 },
    oracle_arbitrage_singularity: { level: 1, stars: 1 },
    oracle_quantum_reversal: { level: 1, stars: 1 },
    satoshi_halving_supernova: { level: 1, stars: 1 },
    satoshi_proof_of_work: { level: 1, stars: 1 },
    satoshi_genesis_block: { level: 1, stars: 1 },
    satoshi_difficulty_retarget: { level: 1, stars: 1 },
  },
  claimedStageChestMilestones: [],

  // 6-Slot Mining Rig Initial Loadout
  equippedRig: {
    gpu: CATALOG_RIG_ITEMS.find((i) => i.id === 'rig_gpu_gtx1660_starter') ?? null,
    cooling_fan: CATALOG_RIG_ITEMS.find((i) => i.id === 'rig_fan_noctua_industrial') ?? null,
    power_supply: CATALOG_RIG_ITEMS.find((i) => i.id === 'rig_psu_corsair_ax1600i') ?? null,
    motherboard: CATALOG_RIG_ITEMS.find((i) => i.id === 'rig_mobo_btcd37_8gpu') ?? null,
    ssd: null,
    asic_processor: null,
  },
  rigInventory: CATALOG_RIG_ITEMS.filter(
    (i) =>
      !['rig_gpu_gtx1660_starter', 'rig_fan_noctua_industrial', 'rig_psu_corsair_ax1600i', 'rig_mobo_btcd37_8gpu'].includes(
        i.id,
      ),
  ),
  solderWire: 45,

  // Audio, Haptics & Notification Settings
  audioEnabled: true,
  hapticsEnabled: true,
  notificationsEnabled: false,
  lastEnergyNotifiedTimestamp: 0,
  lastPatrolNotifiedTimestamp: 0,
  lastDailyResetNoticeDate: '',

  playerName: 'Rookie Trader',
  playerAvatarId: 'rookie_satoshi',
  hasBoughtStarterPack: false,
  lastVipStipendDate: '',
  careerStats: {
    totalRunsPlayed: 0,
    biggestGreenCandle: 0,
    totalCoinsForged: 0,
  },
  authAccount: {
    type: null,
    handle: '',
    uid: '',
  },
  selectedServer: {
    id: 'oceania_47',
    name: 'Oceania #47',
    region: 'Oceania',
    status: 'new',
    loadPct: 22,
    pingMs: 24,
  },
  tutorialStep: 'not_started',
  devUnlockAllUi: false,
  epicPityCounter: 0,
  mythicalPityCounter: 0,
  pityCounters: {},
  lastIdleClaimTimestamp: Date.now() - 1800 * 1000,
  lastHeroCampClaimTimestamp: 0,
  lastFreePullTimestamps: {},
  purchasedBundleIds: [],
  claimedGrowthFundStages: [],
  dailyMetrics: {},
  claimedDailyQuestIds: [],
  claimedDailyMilestones: [],
  claimedCarnivalDays: [],
  weeklyGrowth: { eventId: getActiveGrowthEvent().id, points: 0 },
  growthPointsByWeek: { 1: 0, 2: 0, 3: 0 },
  activeGrowthWeek: getActiveGrowthEvent().week,
  marginCallOfferExpiresAt: null,

  expeditions: [],
  codexDiscovered: {
    coin_bitcrumb: true,
    hero_rookie_satoshi: true,
    relic_gas_fee_skimmer: true,
    boss_street_scammer: true,
  },
  codexClaimed: {},
  syndicateLentItem: null,
  borrowedMercenary: null,
  lastMercenaryBorrowDate: '',
  highestTowerFloorCleared: 0,
  towerAttemptsLeft: 3,
  lastTowerResetDate: new Date().toISOString().slice(0, 10),

  isBearMarketMode: false,
  darkWebRelicDust: 0,
  highestBearStageCleared: 0,

  equippedPetId: 'mecha_shiba' as PetId,
  ownedPets: {
    mecha_shiba: { level: 1, unlocked: true },
    laser_bull: { level: 1, unlocked: false },
    quantum_owl: { level: 1, unlocked: false },
    diamond_crab: { level: 1, unlocked: false },
  },
  petTreats: 5,

  oracleStreak: 0,
  lastOraclePuzzleDate: null,

  pvpRating: 1200,
  pvpTickets: 5,
  lastPvpDailyResetDate: new Date().toISOString().slice(0, 10),
  pvpDefensiveSnapshot: null,

  siliconDust: 120,
  algoOverclocks: {},

  worldBossAttemptsLeft: 2,
  lastWorldBossDate: new Date().toISOString().slice(0, 10),
  worldBossPersonalDamage: 0,

  targetTurfDistrictId: 'wall_street',
  syndicateInfluencePoints: 3500,
  claimedTurfDistricts: ['wall_street'],

  wallBreakerOfferType: null,
  wallBreakerHeroId: null,
  wallBreakerOfferExpiresAt: null,
  consecutiveBossLosses: {},
  whaleDividendCrates: [
    {
      id: 'dividend_starter_1',
      buyerName: '0xWhaleGod',
      bundleName: 'VIP Pass ($9.99)',
      gems: 25,
      hashrate: 200,
      claimedByPlayer: false,
      salutesCount: 4,
      timestamp: Date.now() - 3600000,
    },
  ],
  miningRigSubscriptions: {},
  compoundVaultTier: 1,
  compoundVaultGems: 250,
  hasBossReviveToken: false,

  seasonPassXp: 0,
  seasonPassType: 'none',
  seasonPassClaimedFree: [],
  seasonPassClaimedTrader: [],
  seasonPassClaimedWhale: [],
  hasGoldenBullStatue: false,

  spinTokens: 1,
  totalMemeSpins: 0,
  lastWheelFreeSpinDate: '',
  claimedWheelMilestones: [],

  relayChainStep: 0,

  unlockedChartSkins: ['default', 'retro_8bit'],
  equippedChartSkin: 'default',

  ownedSkins: DEFAULT_OWNED_SKINS,
  equippedSkins: DEFAULT_EQUIPPED_SKINS,

  galaTickets: 5,
  galaChips: 10,
  seasonWheelPulls: 0,
  claimedGalaMilestones: [],
  clearedFortunaTrials: [],
  plinkoDrops: 0,

  seasonMissionProgress: {},
  claimedSeasonMissionTiers: {},
  claimedSeasonMissionMilestones: [],
  unlockedTitles: ['Rookie Trader'],
  playerTitle: 'Rookie Trader',

  // Phase 2 Expansion: Daily Crisis Dungeons
  crisisDungeonAttempts: {
    gas_gauntlet: 0,
    cold_storage: 0,
    memecoin_casino: 0,
  },
  lastCrisisResetDate: new Date().toISOString().slice(0, 10),

  // Phase 2 Expansion: Syndicate Liquidity Pool Heist ($500M Boss)
  syndicateHeistBossHp: 442_500_000,
  syndicateHeistMaxHp: 500_000_000,
  syndicateHeistAttemptsLeft: 2,
  lastSyndicateHeistDate: new Date().toISOString().slice(0, 10),
  syndicateHeistPersonalDamage: 0,
  syndicateHeistLeaderboard: [
    { id: 'm1', name: '0xWhaleGod', avatar: 'satoshi_nakamoto', damage: 72400000, rank: 1 },
    { id: 'm2', name: 'DegenApe_99', avatar: 'degen_ape_roxy', damage: 54120000, rank: 2 },
    { id: 'm3', name: 'JordanTheWolf', avatar: 'jordan_the_wolf', damage: 41850000, rank: 3 },
    { id: 'm4', name: 'SatoshiDisciple', avatar: 'rookie_satoshi', damage: 32100000, rank: 4 },
    { id: 'm5', name: 'YieldFarmerX', avatar: 'quantum_ai_oracle', damage: 26500000, rank: 5 },
    { id: 'm6', name: 'BullishBaron', avatar: 'lady_fortuna', damage: 21900000, rank: 6 },
    { id: 'm7', name: 'CryptoNinja_88', avatar: 'rookie_satoshi', damage: 18400000, rank: 7 },
    { id: 'm8', name: 'DiamondHands_ETH', avatar: 'degen_ape_roxy', damage: 15200000, rank: 8 },
    { id: 'm9', name: 'LiquiditySniper', avatar: 'jordan_the_wolf', damage: 12800000, rank: 9 },
    { id: 'm10', name: 'HODL_Commander', avatar: 'lady_fortuna', damage: 9500000, rank: 10 },
  ],
  syndicateHeistClaimedMilestones: [],

  // Phase 2 Expansion: Ghost Run Auto-Battle Races
  raceTickets: 3,
  lastRaceTicketResetDate: new Date().toISOString().slice(0, 10),
  raceTrophies: 1000,
  unclaimedHashrateStolen: 0,
  ghostRunTelemetry: {
    stageId: 1,
    heroId: 'rookie_satoshi',
    heroStars: 1,
    coins: ['coin_bitcrumb'],
    nodesCleared: 10,
    clearTimeSeconds: 24,
    totalDamage: 45000,
    date: Date.now() - 3600000,
    playerName: 'Rookie Trader',
  },
  topGhostRacers: [
    {
      id: 'ghost_novice',
      name: 'Novice Scalper',
      avatar: 'rookie_satoshi',
      heroId: 'rookie_satoshi',
      coins: ['coin_bitcrumb', 'coin_solana_speed'],
      clearTimeSeconds: 27.4,
      trophies: 920,
      hashratePool: 3000,
      difficulty: 'easy',
    },
    {
      id: 'ghost_momentum',
      name: 'Momentum Chaser',
      avatar: 'degen_ape_roxy',
      heroId: 'degen_ape_roxy',
      coins: ['coin_bitcrumb', 'coin_ether_gas', 'coin_cardano_slow'],
      clearTimeSeconds: 21.8,
      trophies: 1150,
      hashratePool: 5500,
      difficulty: 'medium',
    },
    {
      id: 'ghost_whale',
      name: 'Arbitrage Whale',
      avatar: 'jordan_the_wolf',
      heroId: 'jordan_the_wolf',
      coins: ['coin_bitcrumb', 'coin_tether_stasis', 'coin_solana_speed', 'coin_doge_bark'],
      clearTimeSeconds: 16.2,
      trophies: 1420,
      hashratePool: 9000,
      difficulty: 'hard',
    },
    {
      id: 'ghost_apex',
      name: '0xQuantumSpeed',
      avatar: 'quantum_ai_oracle',
      heroId: 'quantum_ai_oracle',
      coins: ['coin_bitcrumb', 'coin_ether_gas', 'coin_solana_speed', 'coin_pepe_moon'],
      clearTimeSeconds: 12.5,
      trophies: 1880,
      hashratePool: 18000,
      difficulty: 'champion',
    },
  ],
})

/** Drops empty stacks and unequips anything that no longer exists. */
const sanitizeLoadout = (coins: OwnedCoin[], equipped: (string | null)[]) => {
  const { coins: pruned } = pruneEmpty(coins)
  const ids = new Set(pruned.map((c) => c.id))
  return { ownedCoins: pruned, equippedCoinIds: equipped.map((id) => (id && ids.has(id) ? id : null)) }
}

const applyRewards = (
  wallet: { gems: number; silverKeys: number; quantumKeys: number; hashrate: number },
  rewards: QuestReward[],
) => {
  for (const r of rewards) {
    if (r.currency === 'gems') wallet.gems += r.amount
    else if (r.currency === 'silverKey') wallet.silverKeys += r.amount
    else if (r.currency === 'quantumKey') wallet.quantumKeys += r.amount
    else if (r.currency === 'hashrate') wallet.hashrate += r.amount
  }
}

const COMMON_COIN_IDS = COINS.filter((c) => c.rarity === 'common').map((c) => c.id)

// ───────────────────────── Store ─────────────────────────
export const useMetaStore = create<MetaState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      getGlobalYield: () => {
        const s = get()
        const baseYield = computeGlobalYield(s.ownedCoins)
        const loc = BASE_LOCATION_MAP[s.currentLocationId ?? 'outskirts_tent']
        const locBonus = loc ? loc.globalYieldBonus : 0
        const deskLvl = s.furnitureLevels?.trading_desk ?? 1
        const deskBonus = deskLvl * 0.04
        const skinBonus = (s.getSkinStatBonus?.()?.damagePct ?? 0) / 100
        return Math.round((baseYield + locBonus + deskBonus + skinBonus) * 100) / 100
      },

      setActiveGrowthWeek: (week) => set({ activeGrowthWeek: week }),

      addGrowthEventPoints: (week, points) =>
        set((s) => {
          const nextByWeek = {
            ...s.growthPointsByWeek,
            [week]: (s.growthPointsByWeek?.[week] ?? 0) + points,
          }
          return {
            growthPointsByWeek: nextByWeek,
            weeklyGrowth: {
              eventId: s.weeklyGrowth.eventId,
              points: s.weeklyGrowth.points + points,
            },
          }
        }),

      addGrowthPoints: (points) => {
        const s = get()
        get().addGrowthEventPoints(s.activeGrowthWeek ?? 1, points)
      },

      triggerMarginCallOffer: () =>
        set((s) => {
          if (s.marginCallOfferExpiresAt && s.marginCallOfferExpiresAt > Date.now()) {
            return s
          }
          return { marginCallOfferExpiresAt: Date.now() + 2 * 3600 * 1000 }
        }),

      dismissMarginCallOffer: () => set({ marginCallOfferExpiresAt: null }),

      incrementDailyMetric: (metric, amount = 1) =>
        set((s) => ({
          dailyMetrics: { ...s.dailyMetrics, [metric]: (s.dailyMetrics[metric] ?? 0) + amount },
        })),

      pullGacha: (bannerId, count, isFreeAd = false) => {
        const banner = GACHA_BANNERS.find((b) => b.id === bannerId)
        if (!banner) return null
        const s = get()

        const wallet = {
          gems: s.gems,
          silverKey: s.silverKeys,
          quantumKey: s.quantumKeys,
          hashrate: s.hashrate,
          usd: 0,
        }

        if (!isFreeAd) {
          if (bannerId === 'vc_vault' && s.quantumKeys >= count) {
            wallet.quantumKey -= count
          } else {
            const price = count === 10 ? banner.cost.multi10 : banner.cost.single
            if (wallet[banner.cost.currency] < price) return null
            wallet[banner.cost.currency] -= price
          }
        }

        let pity = s.pityCounters[bannerId] ?? {}
        let coins = s.ownedCoins
        let relics = s.ownedRelics
        let hashrate = wallet.hashrate
        const nextHeroFrags = { ...(s.heroFragments ?? {}) }
        const results: GachaResult[] = []

        for (let i = 0; i < count; i++) {
          const roll = rollBannerRarity(banner, pity)
          pity = roll.pity
          // Every Gacha pull also drops 2–5 bonus Hero Fragments!
          const pickedHero = HEROES[Math.floor(Math.random() * HEROES.length)]
          const fragCount = bannerId === 'vc_vault' ? 4 : 2
          nextHeroFrags[pickedHero.id] = (nextHeroFrags[pickedHero.id] ?? 0) + fragCount

          if (banner.rewardType === 'coin') {
            const coinId = pickCoinId(roll.rarity)
            const hadBefore = coins.some((c) => c.coinId === coinId && c.rarity === roll.rarity)
            coins = addCoins(coins, coinId, roll.rarity)
            results.push({
              type: 'coin',
              id: coinId,
              rarity: roll.rarity,
              isNew: !hadBefore,
              isDuplicate: hadBefore,
              bonusHeroFragmentId: pickedHero.id,
              bonusHeroFragments: fragCount,
            })
          } else {
            const relicId = pickRelicId(roll.rarity)
            const dup = relics.includes(relicId)
            if (dup) hashrate += DUPLICATE_RELIC_HASHRATE
            else relics = [...relics, relicId]
            results.push({
              type: 'relic',
              id: relicId,
              rarity: RELIC_MAP[relicId].rarity,
              isDuplicate: dup,
              isNew: !dup,
              bonusHeroFragmentId: pickedHero.id,
              bonusHeroFragments: fragCount,
            })
          }
        }

        const pityCounters = { ...s.pityCounters, [bannerId]: pity }
        const vc = pityCounters['vc_vault'] ?? {}
        set({
          gems: wallet.gems,
          silverKeys: wallet.silverKey,
          quantumKeys: wallet.quantumKey,
          hashrate,
          ownedCoins: coins,
          ownedRelics: relics,
          heroFragments: nextHeroFrags,
          pityCounters,
          epicPityCounter: vc.epic ?? 0,
          mythicalPityCounter: vc.mythical ?? 0,
          lastFreePullTimestamps: isFreeAd
            ? { ...s.lastFreePullTimestamps, [bannerId]: Date.now() }
            : s.lastFreePullTimestamps,
        })
        const gemsSpent = s.gems - wallet.gems
        if (gemsSpent > 0) {
          get().incrementSeasonMissionProgress('gemsSpent', gemsSpent)
        }
        if (isFreeAd) {
          get().incrementSeasonMissionProgress('adsWatched', 1)
        }
        // Week 1: ICO Chest Frenzy (+10 pts per chest opened)
        get().addGrowthEventPoints(1, count * 10)
        get().incrementDailyMetric('gachaPulls', count)
        return results
      },

      levelUpCoin: (ownedCoinId) => {
        const s = get()
        const coin = s.ownedCoins.find((c) => c.id === ownedCoinId)
        if (!coin) return false
        const cfg = COINS.find((c) => c.id === coin.coinId)
        if (!cfg || coin.level >= cfg.maxLevel) return false
        const cost = levelUpCost(coin.level, coin.rarity)
        if (s.hashrate < cost) return false
        set({
          hashrate: s.hashrate - cost,
          ownedCoins: s.ownedCoins.map((c) => (c.id === ownedCoinId ? { ...c, level: c.level + 1 } : c)),
          ...(s.tutorialStep === 'upgrade_coin' && coin.coinId === 'bitcrumb'
            ? { tutorialStep: 'ready_stage_1' }
            : {}),
        })
        get().incrementDailyMetric('coinsLeveled', 1)
        // Week 2: ASIC Upgrade Week (+25 pts per level up)
        get().addGrowthEventPoints(2, 25)
        return true
      },

      fuseCoins: (coinId, rarity) => {
        const s = get()
        const fused = fuseOnce(s.ownedCoins, coinId, rarity)
        if (!fused) return false
        const prevCareer = s.careerStats ?? { totalRunsPlayed: 0, biggestGreenCandle: 0, totalCoinsForged: 0 }
        set({
          ...sanitizeLoadout(fused, s.equippedCoinIds),
          careerStats: {
            ...prevCareer,
            totalCoinsForged: prevCareer.totalCoinsForged + 1,
          },
        })
        get().incrementDailyMetric('fusions', 1)
        get().incrementDailyMetric('fuseOrRebalance', 1)
        get().incrementSeasonMissionProgress('coinsForged', 1)
        // Week 3: Hard-Fork Merger Week (+50 pts per fusion)
        get().addGrowthEventPoints(3, 50)
        return true
      },

      fuseAllAvailable: () => {
        const s = get()
        const { coins, fusions } = fuseAll(s.ownedCoins)
        if (fusions) {
          const prevCareer = s.careerStats ?? { totalRunsPlayed: 0, biggestGreenCandle: 0, totalCoinsForged: 0 }
          set({
            ...sanitizeLoadout(coins, s.equippedCoinIds),
            careerStats: {
              ...prevCareer,
              totalCoinsForged: prevCareer.totalCoinsForged + fusions,
            },
          })
          get().incrementDailyMetric('fusions', fusions)
          get().incrementDailyMetric('fuseOrRebalance', fusions)
          get().incrementSeasonMissionProgress('coinsForged', fusions)
          get().addGrowthEventPoints(3, fusions * 50)
        }
        return fusions
      },

      claimIdleMining: (doubleWithAd) => {
        const s = get()
        const now = Date.now()
        const cap = IDLE_RIG_CAP_HOURS + (s.isVipAdFree ? VIP_EXTRA_RIG_CAP_HOURS : 0)
        const reward = computeIdleReward(s.lastIdleClaimTimestamp, now, cap, computeGlobalYield(s.ownedCoins))
        const mult = doubleWithAd ? 2 : 1
        const hashrate = Math.max(10, reward.hashrate) * mult

        const shardGain: Record<string, number> = {}
        const shards = { ...s.coinShards }
        const totalShardRolls = Math.max(1, reward.shards) * mult
        for (let i = 0; i < totalShardRolls; i++) {
          const id = COMMON_COIN_IDS[Math.floor(Math.random() * COMMON_COIN_IDS.length)]
          shardGain[id] = (shardGain[id] ?? 0) + 1
          shards[id] = (shards[id] ?? 0) + 1
        }
        let coins = s.ownedCoins
        const coinsFromShards: string[] = []
        for (const [id, n] of Object.entries(shards)) {
          const whole = Math.floor(n / SHARDS_PER_COIN)
          if (whole > 0) {
            coins = addCoins(coins, id, 'common', whole)
            shards[id] = n % SHARDS_PER_COIN
            for (let i = 0; i < whole; i++) coinsFromShards.push(id)
          }
        }
        set({ hashrate: s.hashrate + hashrate, coinShards: shards, ownedCoins: coins, lastIdleClaimTimestamp: now })
        get().incrementDailyMetric('rigClaims', 1)
        get().incrementSeasonMissionProgress('patrolClaimed', 1)
        if (doubleWithAd) {
          get().incrementDailyMetric('adsWatched', 1)
          get().incrementSeasonMissionProgress('adsWatched', 1)
        }
        return { seconds: reward.seconds, hashrate, shards: shardGain, coinsFromShards }
      },

      completeRunPayout: (stageId, nodesCleared, wonStage) => {
        const s = get()
        const stage = getStageConfig(stageId)
        const yieldMult = computeGlobalYield(s.ownedCoins)
        const nodes = stage.nodes.length
        const cleared = Math.max(0, Math.min(nodesCleared, nodes))
        const frac = wonStage ? 1 : (cleared / nodes) * DEFEAT_HASHRATE_FRACTION
        const isBear = Boolean(s.isBearMarketMode)
        const bearHashrateMult = isBear ? 2 : 1
        const earnedDust = isBear && wonStage ? 25 + stageId * 5 : 0
        const result: RunPayoutResult = {
          hashrate: Math.round(stage.clearRewards.hashrate * frac * yieldMult * bearHashrateMult),
          piggyBankGems: cleared * PIGGY_GEMS_PER_NODE + (wonStage ? PIGGY_GEMS_STAGE_WIN : 0),
          gems: 0,
          silverKeys: 0,
          quantumKeys: 0,
          unlockedFeatures: [],
          firstClear: wonStage && stageId > (isBear ? s.highestBearStageCleared : s.highestStageCleared),
        }

        const prevCareer = s.careerStats ?? { totalRunsPlayed: 0, biggestGreenCandle: 0, totalCoinsForged: 0 }
        const patch: Partial<MetaData> = {
          hashrate: s.hashrate + result.hashrate,
          piggyBankGems: s.piggyBankGems + result.piggyBankGems,
          darkWebRelicDust: (s.darkWebRelicDust ?? 0) + earnedDust,
          careerStats: {
            ...prevCareer,
            totalRunsPlayed: prevCareer.totalRunsPlayed + 1,
          },
        }

        if (isBear && wonStage && stageId > (s.highestBearStageCleared ?? 0)) {
          patch.highestBearStageCleared = stageId
        }

        if (result.firstClear) {
          const r = stage.clearRewards
          result.gems = r.gems
          result.silverKeys = r.silverKeys ?? 0
          result.quantumKeys = r.quantumKeys ?? 0

          // Milestone Boss Crates: Clearing every 20th stage awards a "Cycle Breakthrough Crate"
          // containing +10 Hero Fragments, +5 Quantum Keys, and +1,000 Gems.
          if (stageId % 20 === 0 || stage.isCycleBreakthrough || r.breakthroughCrate) {
            const cycle = Math.ceil(stageId / 20)
            const cycleName = stage.cycleName || `Cycle ${cycle}`
            const crateFrags = r.breakthroughCrate?.heroFragments ?? 10
            const crateKeys = r.breakthroughCrate?.quantumKeys ?? 5
            const crateGems = r.breakthroughCrate?.gems ?? 1000

            result.gems += crateGems
            result.quantumKeys += crateKeys
            result.cycleBreakthroughCrate = {
              heroFragments: crateFrags,
              quantumKeys: crateKeys,
              gems: crateGems,
              cycle,
              cycleName,
            }

            // Award hero fragments to equipped hero or fallback
            const heroToAward = s.equippedHeroId || 'rookie_satoshi'
            const curFrags = s.heroFragments ?? {}
            patch.heroFragments = {
              ...curFrags,
              [heroToAward]: (curFrags[heroToAward] || 0) + crateFrags,
            }
          }

          patch.gems = s.gems + result.gems
          patch.silverKeys = s.silverKeys + result.silverKeys
          patch.quantumKeys = s.quantumKeys + result.quantumKeys
          patch.highestStageCleared = stageId
          patch.currentStage = Math.min(TOTAL_CAMPAIGN_STAGES, Math.max(s.currentStage, stageId + 1))
          if (r.unlockSlot && r.unlockSlot > s.unlockedSlots) {
            patch.unlockedSlots = r.unlockSlot
            result.unlockedSlot = r.unlockSlot
          }
          const curRelicSlots = s.unlockedRelicSlots ?? getUnlockedRelicSlotsForClearedStage(s.highestStageCleared)
          if (r.unlockRelicSlot && r.unlockRelicSlot > curRelicSlots) {
            patch.unlockedRelicSlots = r.unlockRelicSlot
            result.unlockedRelicSlot = r.unlockRelicSlot
          }
          const newFeatures = (r.unlockFeatures ?? []).filter((f) => !s.unlockedFeatures.includes(f))
          if (newFeatures.length) {
            patch.unlockedFeatures = [...s.unlockedFeatures, ...newFeatures]
            result.unlockedFeatures = newFeatures
          }
        }
        set(patch)
        get().incrementDailyMetric('runsCompleted', 1)
        if (cleared > 0) get().incrementDailyMetric('battlesWon', cleared)
        if (wonStage) get().incrementDailyMetric('bossesDefeated', 1)
        get().addSeasonPassXp(wonStage ? 150 : 50)
        set((prev) => ({
          ...(wonStage || cleared >= 5 ? { spinTokens: (prev.spinTokens ?? 0) + 1 } : {}),
          galaChips: (prev.galaChips ?? 0) + (wonStage ? 2 : 1),
          ...(wonStage ? { galaTickets: (prev.galaTickets ?? 0) + 1 } : {}),
        }))
        return result
      },

      quickSweepStage: (stageId) => {
        const s = get()
        if (stageId > (s.highestStageCleared ?? 0)) return null
        if (!s.spendEnergy(5)) return null

        const stage = getStageConfig(stageId)
        const yieldMult = computeGlobalYield(s.ownedCoins)
        const hashrate = Math.round(stage.clearRewards.hashrate * yieldMult)
        const piggyGems = PIGGY_GEMS_STAGE_WIN

        // Award 2-3 random coin shards from owned coins
        const shardsCount = Math.floor(Math.random() * 2) + 2
        const ownedCoinIds = s.ownedCoins.map((c) => c.coinId)
        const targetCoinId =
          ownedCoinIds.length > 0
            ? ownedCoinIds[Math.floor(Math.random() * ownedCoinIds.length)]
            : 'bitcrumb'
        const newShards = { ...(s.coinShards ?? {}) }
        newShards[targetCoinId] = (newShards[targetCoinId] || 0) + shardsCount

        set({
          hashrate: s.hashrate + hashrate,
          piggyBankGems: s.piggyBankGems + piggyGems,
          coinShards: newShards,
        })

        get().incrementDailyMetric('runsCompleted', 1)
        get().incrementDailyMetric('battlesWon', stage.nodes.length)
        get().incrementDailyMetric('bossesDefeated', 1)
        get().addSeasonPassXp(100)

        return { hashrate, shards: shardsCount, gems: piggyGems }
      },

      purchaseBundle: (bundleId) => {
        const bundle = SHOP_BUNDLES.find((b) => b.id === bundleId)
        if (!bundle) return false
        const s = get()
        if (bundle.oneTime && s.purchasedBundleIds.includes(bundleId)) return false

        const wallet = {
          gems: s.gems,
          silverKeys: s.silverKeys,
          quantumKeys: s.quantumKeys,
          hashrate: s.hashrate,
        }
        applyRewards(wallet, bundle.contents)

        let coins = s.ownedCoins
        if (bundle.bonusCoin) {
          coins = addCoins(coins, bundle.bonusCoin.coinId, bundle.bonusCoin.rarity, bundle.bonusCoin.count ?? 1)
        }

        const nextOwnedHeroes = { ...(s.ownedHeroes ?? { rookie_satoshi: 1 }) }
        const nextHeroStars = { ...(s.heroStars ?? { rookie_satoshi: 1 }) }
        const nextHeroSkills = { ...(s.heroSkillLevels ?? { rookie_satoshi: { passiveLv: 1, activeLv: 1 } }) }
        const nextHeroFrags = { ...(s.heroFragments ?? {}) }

        if (bundle.bonusHeroId) {
          const hId = bundle.bonusHeroId as HeroId
          if (!nextOwnedHeroes[hId]) {
            nextOwnedHeroes[hId] = 1
            nextHeroStars[hId] = 1
            nextHeroSkills[hId] = { passiveLv: 1, activeLv: 1 }
          } else {
            nextHeroFrags[hId] = (nextHeroFrags[hId] ?? 0) + (bundle.bonusHeroFragments ?? 50)
          }
        } else if (bundle.bonusHeroFragments) {
          const pick = HEROES[Math.floor(Math.random() * HEROES.length)]
          nextHeroFrags[pick.id] = (nextHeroFrags[pick.id] ?? 0) + bundle.bonusHeroFragments
        }

        const isVip = s.isVipAdFree || !!bundle.perks?.includes('adFree')
        const boughtStarter = s.hasBoughtStarterPack || bundleId === 'first_ico_starter'

        // If purchase is >= $9.99 (or vip_pass/stage_growth_fund), broadcast whale dividend
        if (bundle.priceUsd >= 9.99 || bundleId === 'vip_pass' || bundleId === 'stage_growth_fund') {
          get().broadcastWhaleDividend(s.playerName, `${bundle.name} ($${bundle.priceUsd.toFixed(2)})`)
        }

        set({
          gems: wallet.gems,
          silverKeys: wallet.silverKeys,
          quantumKeys: wallet.quantumKeys,
          hashrate: wallet.hashrate,
          ownedCoins: coins,
          ownedHeroes: nextOwnedHeroes,
          heroStars: nextHeroStars,
          heroSkillLevels: nextHeroSkills,
          heroFragments: nextHeroFrags,
          isVipAdFree: isVip,
          hasBoughtStarterPack: boughtStarter,
          purchasedBundleIds: s.purchasedBundleIds.includes(bundleId)
            ? s.purchasedBundleIds
            : [...s.purchasedBundleIds, bundleId],
        })
        return true
      },

      claimGrowthFundMilestone: (stage) => {
        const s = get()
        if (!s.purchasedBundleIds.includes('stage_growth_fund')) return false
        if (s.highestStageCleared < stage) return false
        if (s.claimedGrowthFundStages.includes(stage)) return false
        const fund = SHOP_BUNDLES.find((b) => b.id === 'stage_growth_fund')
        const ms = fund?.stageMilestones?.find((m) => m.stage === stage)
        if (!ms) return false

        const wallet = {
          gems: s.gems,
          silverKeys: s.silverKeys,
          quantumKeys: s.quantumKeys,
          hashrate: s.hashrate,
        }
        applyRewards(wallet, ms.reward)
        set({
          ...wallet,
          claimedGrowthFundStages: [...s.claimedGrowthFundStages, stage],
        })
        return true
      },

      crackPiggyBank: () => {
        const s = get()
        if (s.piggyBankGems <= 0) return 0
        const amt = s.piggyBankGems
        set({ gems: s.gems + amt, piggyBankGems: 0 })
        return amt
      },

      claimDailyQuest: (questId) => {
        const s = get()
        if (s.claimedDailyQuestIds.includes(questId)) return false
        const q = DAILY_QUESTS.find((x) => x.id === questId)
        if (!q) return false
        const progress = s.dailyMetrics[q.metric] ?? 0
        if (progress < q.target) return false
        const wallet = {
          gems: s.gems,
          silverKeys: s.silverKeys,
          quantumKeys: s.quantumKeys,
          hashrate: s.hashrate,
        }
        applyRewards(wallet, q.reward)
        set({
          ...wallet,
          claimedDailyQuestIds: [...s.claimedDailyQuestIds, questId],
          seasonPassXp: Math.min(MAX_SEASON_TIER * XP_PER_TIER, (s.seasonPassXp ?? 0) + 50),
        })
        return true
      },

      claimDailyMilestone: (points) => {
        const s = get()
        if (s.claimedDailyMilestones.includes(points)) return false
        const totalPts = DAILY_QUESTS.filter((q) => s.claimedDailyQuestIds.includes(q.id)).reduce(
          (acc, q) => acc + q.points,
          0,
        )
        if (totalPts < points) return false
        const ms = DAILY_TRACK_MILESTONES.find((m) => m.points === points)
        if (!ms) return false
        const wallet = {
          gems: s.gems,
          silverKeys: s.silverKeys,
          quantumKeys: s.quantumKeys,
          hashrate: s.hashrate,
        }
        applyRewards(wallet, ms.reward)
        set({
          ...wallet,
          claimedDailyMilestones: [...s.claimedDailyMilestones, points],
          seasonPassXp: Math.min(MAX_SEASON_TIER * XP_PER_TIER, (s.seasonPassXp ?? 0) + 100),
        })
        return true
      },

      claimCarnivalDay: (day) => {
        const s = get()
        if (s.claimedCarnivalDays.includes(day)) return false
        const wallet = {
          gems: s.gems,
          silverKeys: s.silverKeys,
          quantumKeys: s.quantumKeys,
          hashrate: s.hashrate,
        }
        let coins = s.ownedCoins
        if (day === 1) wallet.gems += 150
        else if (day === 2) wallet.silverKeys += 3
        else if (day === 3) coins = addCoins(coins, 'shibamoon', 'uncommon', 3)
        else if (day === 4) wallet.hashrate += 2000
        else if (day === 5) coins = addCoins(coins, 'solanabolt', 'rare', 1)
        else if (day === 6) {
          wallet.quantumKeys += 2
          coins = addCoins(coins, 'moneroghost', 'epic', 1)
        } else if (day === 7) {
          // Day 7 grand prize: Free Mythical SatoshiGenesis Coin!
          coins = addCoins(coins, 'satoshigenesis', 'mythical', 1)
          wallet.gems += 300
        }

        set({
          ...wallet,
          ownedCoins: coins,
          claimedCarnivalDays: [...s.claimedCarnivalDays, day],
        })
        return true
      },

      equipCoin: (slot, ownedCoinId) => {
        const s = get()
        if (slot < 0 || slot >= s.unlockedSlots) return false
        if (!s.ownedCoins.some((c) => c.id === ownedCoinId)) return false
        const eq = s.equippedCoinIds.map((id) => (id === ownedCoinId ? null : id))
        eq[slot] = ownedCoinId
        set({ equippedCoinIds: eq })
        return true
      },

      unequipCoin: (slot) =>
        set((s) => ({ equippedCoinIds: s.equippedCoinIds.map((id, i) => (i === slot ? null : id)) })),

      equipRelic: (relicId) => {
        const s = get()
        if (!s.ownedRelics.includes(relicId) || s.equippedRelicIds.includes(relicId)) return false
        const maxRelicSlots = Math.min(
          MAX_EQUIPPED_RELICS,
          s.unlockedRelicSlots ?? getUnlockedRelicSlotsForClearedStage(s.highestStageCleared),
        )
        if (s.equippedRelicIds.length >= maxRelicSlots) return false
        set({ equippedRelicIds: [...s.equippedRelicIds, relicId] })
        return true
      },

      unequipRelic: (relicId) => set((s) => ({ equippedRelicIds: s.equippedRelicIds.filter((r) => r !== relicId) })),

      equipHero: (heroId) => {
        const s = get()
        const owned = s.ownedHeroes ?? { rookie_satoshi: 1 }
        if (!owned[heroId]) return false
        set({ equippedHeroId: heroId })
        return true
      },

      unlockHero: (heroId) => {
        const s = get()
        const owned = s.ownedHeroes ?? { rookie_satoshi: 1 }
        if (owned[heroId]) return false
        const cfg = HERO_MAP[heroId]
        if (!cfg || s.gems < cfg.unlockGemsCost) return false
        set({
          gems: s.gems - cfg.unlockGemsCost,
          ownedHeroes: { ...owned, [heroId]: 1 },
          heroStars: { ...(s.heroStars ?? { rookie_satoshi: 1 }), [heroId]: 1 },
          heroSkillLevels: {
            ...(s.heroSkillLevels ?? { rookie_satoshi: { passiveLv: 1, activeLv: 1 } }),
            [heroId]: { passiveLv: 1, activeLv: 1 },
          },
          equippedHeroId: heroId,
        })
        get().incrementSeasonMissionProgress('gemsSpent', cfg.unlockGemsCost)
        if (heroId === 'lady_fortuna') {
          get().setSeasonMissionProgress('seasonHeroUnlocked', 1)
        }
        return true
      },

      unlockHeroWithFragments: (heroId) => {
        const s = get()
        const owned = s.ownedHeroes ?? { rookie_satoshi: 1 }
        if (owned[heroId]) return false
        const frags = s.heroFragments?.[heroId] ?? 0
        if (frags < HERO_FRAGMENTS_REQUIRED) return false
        set({
          ownedHeroes: { ...owned, [heroId]: 1 },
          heroFragments: {
            ...(s.heroFragments ?? {}),
            [heroId]: frags - HERO_FRAGMENTS_REQUIRED,
          },
          heroStars: { ...(s.heroStars ?? { rookie_satoshi: 1 }), [heroId]: 1 },
          heroSkillLevels: {
            ...(s.heroSkillLevels ?? { rookie_satoshi: { passiveLv: 1, activeLv: 1 } }),
            [heroId]: { passiveLv: 1, activeLv: 1 },
          },
          equippedHeroId: heroId,
        })
        if (heroId === 'lady_fortuna') {
          get().setSeasonMissionProgress('seasonHeroUnlocked', 1)
        }
        return true
      },

      ascendHeroStar: (heroId) => {
        const s = get()
        const owned = s.ownedHeroes ?? { rookie_satoshi: 1 }
        if (!owned[heroId]) return false
        const curStars = s.heroStars?.[heroId] ?? 1
        if (curStars >= MAX_HERO_STARS) return false
        const frags = s.heroFragments?.[heroId] ?? 0
        if (frags < HERO_FRAGMENTS_REQUIRED) return false
        set({
          heroFragments: {
            ...(s.heroFragments ?? {}),
            [heroId]: frags - HERO_FRAGMENTS_REQUIRED,
          },
          heroStars: {
            ...(s.heroStars ?? { rookie_satoshi: 1 }),
            [heroId]: curStars + 1,
          },
        })
        if (heroId === 'lady_fortuna') {
          get().setSeasonMissionProgress('seasonHeroStar', curStars + 1)
        }
        return true
      },

      upgradeHeroSkill: (heroId, skillType) => {
        const s = get()
        const owned = s.ownedHeroes ?? { rookie_satoshi: 1 }
        if (!owned[heroId]) return false
        const skills = s.heroSkillLevels?.[heroId] ?? { passiveLv: 1, activeLv: 1 }
        const curSkillLv = skillType === 'passive' ? skills.passiveLv : skills.activeLv
        if (curSkillLv >= 10) return false
        const cost = heroSkillUpgradeCost(curSkillLv)
        const curBlueprints = s.furnitureBlueprints ?? 0
        if (s.hashrate < cost.hashrate || curBlueprints < cost.blueprints) return false
        const nextSkills =
          skillType === 'passive'
            ? { ...skills, passiveLv: curSkillLv + 1 }
            : { ...skills, activeLv: curSkillLv + 1 }
        set({
          hashrate: s.hashrate - cost.hashrate,
          furnitureBlueprints: curBlueprints - cost.blueprints,
          heroSkillLevels: {
            ...(s.heroSkillLevels ?? { rookie_satoshi: { passiveLv: 1, activeLv: 1 } }),
            [heroId]: nextSkills,
          },
        })
        return true
      },

      equipHeroSkill: (heroId, skillId) => {
        const s = get()
        const skill = HERO_SKILLS_MAP[skillId]
        if (!skill || skill.heroId !== heroId) return false
        if (!s.isHeroSkillUnlocked(heroId, skillId)) return false
        set({
          equippedHeroSkills: {
            ...(s.equippedHeroSkills ?? {}),
            [heroId]: skillId,
          },
        })
        return true
      },

      upgradeHeroSkillLevel: (skillId) => {
        const s = get()
        const skill = HERO_SKILLS_MAP[skillId]
        if (!skill) return false
        const heroId = skill.heroId
        if (!s.isHeroSkillUnlocked(heroId, skillId)) return false
        const curMastery = s.getHeroSkillMastery(skillId)
        if (curMastery.level >= MAX_HERO_SKILL_LEVEL) return false
        const cost = getHeroSkillLevelUpCost(curMastery.level)
        const curBlueprints = s.furnitureBlueprints ?? 0
        if (s.hashrate < cost.hashrate || curBlueprints < cost.blueprints) return false

        const nextMastery = {
          ...(s.heroSkillMastery ?? {}),
          [skillId]: { ...curMastery, level: curMastery.level + 1 },
        }
        const equippedSkill = s.getHeroEquippedSkill(heroId)
        const nextHeroSkillLevels = { ...(s.heroSkillLevels ?? {}) }
        if (equippedSkill.id === skillId) {
          const currentHeroSkills = nextHeroSkillLevels[heroId] ?? { passiveLv: 1, activeLv: 1 }
          nextHeroSkillLevels[heroId] = { ...currentHeroSkills, activeLv: curMastery.level + 1 }
        }

        set({
          hashrate: s.hashrate - cost.hashrate,
          furnitureBlueprints: curBlueprints - cost.blueprints,
          heroSkillMastery: nextMastery,
          heroSkillLevels: nextHeroSkillLevels,
        })
        return true
      },

      ascendHeroSkillStar: (skillId) => {
        const s = get()
        const skill = HERO_SKILLS_MAP[skillId]
        if (!skill) return false
        const heroId = skill.heroId
        if (!s.isHeroSkillUnlocked(heroId, skillId)) return false
        const curMastery = s.getHeroSkillMastery(skillId)
        if (curMastery.stars >= MAX_HERO_SKILL_STARS) return false
        const cost = getHeroSkillAscensionCost(curMastery.stars)
        const curFrags = s.heroFragments?.[heroId] ?? 0
        if (s.hashrate < cost.hashrate || curFrags < cost.fragments) return false

        const nextMastery = {
          ...(s.heroSkillMastery ?? {}),
          [skillId]: { ...curMastery, stars: curMastery.stars + 1 },
        }
        set({
          hashrate: s.hashrate - cost.hashrate,
          heroFragments: {
            ...(s.heroFragments ?? {}),
            [heroId]: curFrags - cost.fragments,
          },
          heroSkillMastery: nextMastery,
        })
        return true
      },

      getHeroEquippedSkill: (heroId) => {
        const s = get()
        const equippedId = s.equippedHeroSkills?.[heroId]
        if (equippedId && HERO_SKILLS_MAP[equippedId]) {
          return HERO_SKILLS_MAP[equippedId]
        }
        const skills = HERO_SKILLS_BY_HERO[heroId]
        return (skills && skills[0]) || HERO_SKILLS[0]
      },

      getHeroSkillMastery: (skillId) => {
        const s = get()
        const mastery = s.heroSkillMastery?.[skillId]
        if (mastery) return mastery
        return { level: 1, stars: 1 }
      },

      isHeroSkillUnlocked: (heroId, skillId) => {
        const s = get()
        if (s.devUnlockAllUi) return true
        const skill = HERO_SKILLS_MAP[skillId]
        if (!skill || skill.heroId !== heroId) return false
        const owned = (s.ownedHeroes?.[heroId] ?? 0) > 0
        if (!owned) return false
        const curStars = s.heroStars?.[heroId] ?? 1
        return curStars >= skill.unlockMinHeroStars
      },

      getHeroAggregatedPassiveMastery: (heroId) => {
        const s = get()
        const skills = HERO_SKILLS_BY_HERO[heroId] ?? []
        const total: PassiveMasteryStats = {
          marginHpPct: 0,
          coinDamagePct: 0,
          greenRollOddsPct: 0,
          greenRollDamagePct: 0,
          tickSpeedPct: 0,
          critDamagePct: 0,
          damageReductionPct: 0,
          bountyCashPct: 0,
          shieldCapacityPct: 0,
          interruptWindowBonus: 0,
        }

        for (const sk of skills) {
          if (!s.isHeroSkillUnlocked(heroId, sk.id)) continue
          const mastery = s.getHeroSkillMastery(sk.id)
          const scaled = scalePassiveMastery(sk.basePassiveMastery, mastery.level, mastery.stars)
          if (scaled.marginHpPct) total.marginHpPct = (total.marginHpPct ?? 0) + scaled.marginHpPct
          if (scaled.coinDamagePct) total.coinDamagePct = (total.coinDamagePct ?? 0) + scaled.coinDamagePct
          if (scaled.greenRollOddsPct) total.greenRollOddsPct = (total.greenRollOddsPct ?? 0) + scaled.greenRollOddsPct
          if (scaled.greenRollDamagePct) total.greenRollDamagePct = (total.greenRollDamagePct ?? 0) + scaled.greenRollDamagePct
          if (scaled.tickSpeedPct) total.tickSpeedPct = (total.tickSpeedPct ?? 0) + scaled.tickSpeedPct
          if (scaled.critDamagePct) total.critDamagePct = (total.critDamagePct ?? 0) + scaled.critDamagePct
          if (scaled.damageReductionPct) total.damageReductionPct = (total.damageReductionPct ?? 0) + scaled.damageReductionPct
          if (scaled.bountyCashPct) total.bountyCashPct = (total.bountyCashPct ?? 0) + scaled.bountyCashPct
          if (scaled.shieldCapacityPct) total.shieldCapacityPct = (total.shieldCapacityPct ?? 0) + scaled.shieldCapacityPct
          if (scaled.interruptWindowBonus) total.interruptWindowBonus = (total.interruptWindowBonus ?? 0) + scaled.interruptWindowBonus
        }

        if (total.damageReductionPct) {
          total.damageReductionPct = Math.min(55, total.damageReductionPct)
        }

        return total
      },

      levelUpHero: (heroId) => {
        const s = get()
        const owned = s.ownedHeroes ?? { rookie_satoshi: 1 }
        const curLevel = owned[heroId]
        if (!curLevel) return false
        const cfg = HERO_MAP[heroId]
        if (!cfg) return false
        const cost = heroLevelUpCost(curLevel, cfg.rarity)
        if (s.hashrate < cost) return false
        set({
          hashrate: s.hashrate - cost,
          ownedHeroes: { ...owned, [heroId]: curLevel + 1 },
          ...(s.tutorialStep === 'upgrade_hero' && heroId === 'rookie_satoshi'
            ? { tutorialStep: 'upgrade_coin' }
            : {}),
        })
        get().incrementDailyMetric('coinsLeveled', 1)
        get().incrementSeasonMissionProgress('heroesUpgraded', 1)
        if ((s.activeGrowthWeek ?? 1) === 2) {
          get().addGrowthEventPoints(2, 15)
        }
        return true
      },

      claimStageChestMilestone: (stage) => {
        const s = get()
        const claimed = s.claimedStageChestMilestones ?? []
        if (claimed.includes(stage) || s.highestStageCleared < stage) return false
        set({
          gems: s.gems + 120 * stage,
          silverKeys: s.silverKeys + 2,
          hashrate: s.hashrate + 600 * stage,
          claimedStageChestMilestones: [...claimed, stage],
        })
        return true
      },

      getTotalPowerScore: () => {
        const s = get()
        const rarityPower: Record<Rarity, number> = {
          common: 180,
          uncommon: 320,
          rare: 550,
          epic: 950,
          legendary: 1350,
          mythical: 1800,
        }
        let score = 850
        for (const c of s.ownedCoins) {
          score += (rarityPower[c.rarity] ?? 180) + c.level * 95
        }
        score += s.ownedRelics.length * 420
        const heroes = s.ownedHeroes ?? { rookie_satoshi: 1 }
        const stars = s.heroStars ?? { rookie_satoshi: 1 }
        const skillLvs = s.heroSkillLevels ?? {}
        for (const [hId, lvl] of Object.entries(heroes)) {
          const hCfg = HERO_MAP[hId as HeroId]
          const base = hCfg ? rarityPower[hCfg.rarity] * 1.5 : 300
          const st = stars[hId] ?? 1
          const sk = skillLvs[hId] ?? { passiveLv: 1, activeLv: 1 }
          const heroSkills = HERO_SKILLS_BY_HERO[hId as HeroId] ?? []
          let masteryPower = 0
          for (const skill of heroSkills) {
            if (s.isHeroSkillUnlocked(hId as HeroId, skill.id)) {
              const m = s.getHeroSkillMastery(skill.id)
              masteryPower += (m.level - 1) * 65 + (m.stars - 1) * 110
            }
          }
          score += Math.round(
            (base + lvl * 160 + (sk.passiveLv + sk.activeLv - 2) * 120 + masteryPower) * (1 + (st - 1) * 0.35),
          )
        }
        // Add Real Estate & Furniture Amenity power
        const unlockedLocs = s.unlockedLocationIds ?? ['outskirts_tent']
        score += (unlockedLocs.length - 1) * 550
        const furn = s.furnitureLevels ?? DEFAULT_FURNITURE_LEVELS
        for (const lvl of Object.values(furn)) {
          score += (lvl - 1) * 140
        }
        // Add 6-Slot Mining Rig Hardware Power
        score += s.getEquippedRigStats().totalPowerScore
        return score
      },

      equipRigItem: (item) => {
        const s = get()
        const currentEquipped = s.equippedRig?.[item.slot]
        const updatedInventory = (s.rigInventory ?? []).filter((i) => i.id !== item.id)
        if (currentEquipped) {
          updatedInventory.push(currentEquipped)
        }
        set({
          equippedRig: {
            ...(s.equippedRig ?? {}),
            [item.slot]: item,
          },
          rigInventory: updatedInventory,
        })
      },

      unequipRigItem: (slot) => {
        const s = get()
        const currentEquipped = s.equippedRig?.[slot]
        if (!currentEquipped) return
        set({
          equippedRig: {
            ...(s.equippedRig ?? {}),
            [slot]: null,
          },
          rigInventory: [...(s.rigInventory ?? []), currentEquipped],
        })
      },

      salvageRigItem: (itemId) => {
        const s = get()
        const invIndex = (s.rigInventory ?? []).findIndex((i) => i.id === itemId)
        let targetItem: RigItem | null = null
        const newInventory = [...(s.rigInventory ?? [])]
        const newEquipped = { ...(s.equippedRig ?? {}) }

        if (invIndex >= 0) {
          targetItem = newInventory[invIndex]
          newInventory.splice(invIndex, 1)
        } else {
          for (const [slot, item] of Object.entries(newEquipped)) {
            if (item?.id === itemId) {
              targetItem = item
              newEquipped[slot as RigSlot] = null
              break
            }
          }
        }

        if (!targetItem) return 0
        const rarityCfg = RIG_RARITY_CONFIG[targetItem.rarity]
        const wireGain = (rarityCfg?.salvageSolderWire ?? 10) + (targetItem.level - 1) * 2
        set({
          rigInventory: newInventory,
          equippedRig: newEquipped,
          solderWire: (s.solderWire ?? 0) + wireGain,
        })
        return wireGain
      },

      reforgeRigItemAffix: (itemId, affixIndex) => {
        const s = get()
        if (
          (s.solderWire ?? 0) < REFORGE_COST.solderWire ||
          s.hashrate < REFORGE_COST.hashrate
        ) {
          return false
        }

        let isEquipped = false
        let targetSlot: RigSlot | null = null
        let targetItem: RigItem | null = null

        for (const [slot, item] of Object.entries(s.equippedRig ?? {})) {
          if (item?.id === itemId) {
            isEquipped = true
            targetSlot = slot as RigSlot
            targetItem = item
            break
          }
        }

        if (!targetItem) {
          targetItem = (s.rigInventory ?? []).find((i) => i.id === itemId) ?? null
        }

        if (!targetItem || affixIndex >= targetItem.secondaryAffixes.length) {
          return false
        }

        const reforged = reforgeAffix(targetItem, affixIndex)

        if (isEquipped && targetSlot) {
          set({
            solderWire: s.solderWire - REFORGE_COST.solderWire,
            hashrate: s.hashrate - REFORGE_COST.hashrate,
            equippedRig: {
              ...(s.equippedRig ?? {}),
              [targetSlot]: reforged,
            },
          })
        } else {
          set({
            solderWire: s.solderWire - REFORGE_COST.solderWire,
            hashrate: s.hashrate - REFORGE_COST.hashrate,
            rigInventory: (s.rigInventory ?? []).map((i) =>
              i.id === itemId ? reforged : i,
            ),
          })
        }
        return true
      },

      upgradeRigItem: (itemId) => {
        const s = get()
        let isEquipped = false
        let targetSlot: RigSlot | null = null
        let targetItem: RigItem | null = null

        for (const [slot, item] of Object.entries(s.equippedRig ?? {})) {
          if (item?.id === itemId) {
            isEquipped = true
            targetSlot = slot as RigSlot
            targetItem = item
            break
          }
        }

        if (!targetItem) {
          targetItem = (s.rigInventory ?? []).find((i) => i.id === itemId) ?? null
        }

        if (!targetItem) return false
        const cost = getRigItemUpgradeCost(targetItem)
        if (s.hashrate < cost.hashrate || (s.solderWire ?? 0) < cost.solderWire) return false

        const upgraded = upgradeRigItemLevel(targetItem)

        if (isEquipped && targetSlot) {
          set({
            hashrate: s.hashrate - cost.hashrate,
            solderWire: (s.solderWire ?? 0) - cost.solderWire,
            equippedRig: {
              ...(s.equippedRig ?? {}),
              [targetSlot]: upgraded,
            },
          })
        } else {
          set({
            hashrate: s.hashrate - cost.hashrate,
            solderWire: (s.solderWire ?? 0) - cost.solderWire,
            rigInventory: (s.rigInventory ?? []).map((i) =>
              i.id === itemId ? upgraded : i,
            ),
          })
        }
        return true
      },

      getEquippedRigStats: () => {
        const equippedHeroId = get().equippedHeroId
        const heroStars = get().heroStars?.[equippedHeroId] ?? 1
        return calculateAggregatedRigStats(get().equippedRig ?? {}, heroStars)
      },

      getActiveSetBonuses: () => {
        return calculateActiveSetBonuses(get().equippedRig ?? {})
      },

      setAudioEnabled: (val) => set({ audioEnabled: val }),
      setHapticsEnabled: (val) => set({ hapticsEnabled: val }),
      setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),

      selectLocation: (id) => {
        const s = get()
        const unlocked = s.unlockedLocationIds ?? ['outskirts_tent']
        if (!unlocked.includes(id)) return false
        set({ currentLocationId: id })
        return true
      },

      unlockLocation: (id) => {
        const s = get()
        const unlocked = s.unlockedLocationIds ?? ['outskirts_tent']
        if (unlocked.includes(id)) {
          set({ currentLocationId: id })
          return true
        }
        const cfg = BASE_LOCATION_MAP[id]
        if (!cfg) return false
        if (s.currentStage < cfg.unlockStage || s.gems < cfg.unlockGemsCost) return false
        set({
          gems: s.gems - cfg.unlockGemsCost,
          unlockedLocationIds: [...unlocked, id],
          currentLocationId: id,
        })
        get().incrementSeasonMissionProgress('gemsSpent', cfg.unlockGemsCost)
        return true
      },

      upgradeFurniture: (id) => {
        const s = get()
        const furn = s.furnitureLevels ?? DEFAULT_FURNITURE_LEVELS
        const curLvl = furn[id] ?? 1
        const cfg = FURNITURE_MAP[id]
        if (!cfg || curLvl >= cfg.maxLevel) return false
        const cost = getFurnitureUpgradeCost(id, curLvl)
        if (s.hashrate < cost) return false
        const nextLvl = curLvl + 1
        const nextSeed =
          id === 'satellite_dish' ? s.baseSeedCapital + cfg.baseValuePerLevel : s.baseSeedCapital
        set({
          hashrate: s.hashrate - cost,
          baseSeedCapital: nextSeed,
          furnitureLevels: {
            ...furn,
            [id]: nextLvl,
          },
        })
        get().incrementDailyMetric('coinsLeveled', 1)
        if ((s.activeGrowthWeek ?? 1) === 2) {
          get().addGrowthEventPoints(2, 15)
        }
        return true
      },

      claimCampHeroTip: (heroId) => {
        const s = get()
        const now = Date.now()
        const lastTs = s.lastHeroCampClaimTimestamp ?? 0
        const quips = HERO_CAMP_QUIPS[heroId] ?? HERO_CAMP_QUIPS.rookie_satoshi
        const quip = quips[Math.floor(Math.random() * quips.length)]
        const elapsed = now - lastTs
        if (lastTs > 0 && elapsed < HERO_CAMP_COOLDOWN_MS) {
          const remainingMinutes = Math.max(
            1,
            Math.ceil((HERO_CAMP_COOLDOWN_MS - elapsed) / 60000),
          )
          return { claimed: false, remainingMinutes, gems: 0, hashrate: 0, quip }
        }
        const gems = 10 + Math.floor(Math.random() * 11) // 10..20 Gems
        const hashrate = 80 + Math.floor(Math.random() * 71) // 80..150 Hashrate
        set((state) => ({
          gems: state.gems + gems,
          hashrate: state.hashrate + hashrate,
          lastHeroCampClaimTimestamp: now,
        }))
        return { claimed: true, remainingMinutes: 60, gems, hashrate, quip }
      },

      syncDailyMissions: () => {
        const s = get()
        const today = new Date().toISOString().slice(0, 10)
        if (s.lastMissionResetDate !== today) {
          set({
            missionTickets: { ...DEFAULT_MISSION_TICKETS },
            lastMissionResetDate: today,
          })
        }
      },

      buyMissionTicket: (id, withAd) => {
        get().syncDailyMissions()
        const s = get()
        if (!withAd && s.gems < 30) return false
        const cur = s.missionTickets?.[id] ?? 0
        set({
          gems: withAd ? s.gems : s.gems - 30,
          missionTickets: {
            ...(s.missionTickets ?? DEFAULT_MISSION_TICKETS),
            [id]: cur + 1,
          },
        })
        if (withAd) {
          get().incrementSeasonMissionProgress('adsWatched', 1)
        } else {
          get().incrementSeasonMissionProgress('gemsSpent', 30)
        }
        return true
      },

      completeMissionRaid: (id, tier) => {
        get().syncDailyMissions()
        const s = get()
        const tickets = s.missionTickets?.[id] ?? 0
        if (tickets <= 0) return null
        const cfg = DAILY_FARMING_MISSIONS.find((m) => m.id === id)
        if (!cfg) return null

        // Progressive payout scaling (+35% per tier above Tier 1)
        const mult = Math.pow(1.35, Math.max(0, tier - 1))
        const gems = cfg.baseRewards.gems ? Math.round(cfg.baseRewards.gems * mult) : 0
        const silverKeys = cfg.baseRewards.silverKeys
          ? Math.max(1, Math.round(cfg.baseRewards.silverKeys * (1 + (tier - 1) * 0.25)))
          : 0
        const hashrate = cfg.baseRewards.hashrate ? Math.round(cfg.baseRewards.hashrate * mult) : 0
        const shards = cfg.baseRewards.randomShards ? Math.round(cfg.baseRewards.randomShards * mult) : 0
        const blueprints = cfg.baseRewards.blueprints ? Math.round(cfg.baseRewards.blueprints * mult) : 0
        const heroFragments = cfg.baseRewards.heroFragments
          ? Math.max(2, Math.round(cfg.baseRewards.heroFragments * (1 + (tier - 1) * 0.25)))
          : 3
        const randomHero = HEROES[Math.floor(Math.random() * HEROES.length)] ?? HEROES[0]
        const nextHeroFrags = {
          ...(s.heroFragments ?? {}),
          [randomHero.id]: ((s.heroFragments ?? {})[randomHero.id] ?? 0) + heroFragments,
        }

        const nextShards = { ...s.coinShards }
        if (shards > 0) {
          const randomCoin = COMMON_COIN_IDS[Math.floor(Math.random() * COMMON_COIN_IDS.length)] ?? 'bitcrumb'
          nextShards[randomCoin] = (nextShards[randomCoin] ?? 0) + shards
        }

        const curHighest = s.missionHighestTier?.[id] ?? 1
        const unlockedNextTier = tier >= curHighest && curHighest < 10
        const nextHighest = unlockedNextTier ? Math.min(10, curHighest + 1) : curHighest

        set({
          gems: s.gems + gems,
          silverKeys: s.silverKeys + silverKeys,
          hashrate: s.hashrate + hashrate,
          coinShards: nextShards,
          heroFragments: nextHeroFrags,
          furnitureBlueprints: (s.furnitureBlueprints ?? 0) + blueprints,
          missionTickets: {
            ...(s.missionTickets ?? DEFAULT_MISSION_TICKETS),
            [id]: tickets - 1,
          },
          missionHighestTier: {
            ...(s.missionHighestTier ?? DEFAULT_MISSION_TIERS),
            [id]: nextHighest,
          },
        })
        get().incrementDailyMetric('runsStarted', 1)
        get().incrementSeasonMissionProgress('bossesDefeated', 1)
        get().incrementSeasonMissionProgress('enemiesDefeated', 1)
        return {
          gems,
          silverKeys,
          hashrate,
          shards,
          blueprints,
          heroFragments,
          heroFragmentHeroId: randomHero.id,
          unlockedNextTier,
        }
      },

      syncEnergy: () => {
        const s = get()
        const maxCap = getMaxEnergy(s.seasonPassType)
        const curEnergy = s.energy ?? maxCap
        const now = Date.now()
        if (curEnergy >= maxCap) {
          if (s.lastEnergyRechargeTimestamp !== now) {
            set({ lastEnergyRechargeTimestamp: now })
          }
          return curEnergy
        }
        const lastTs = s.lastEnergyRechargeTimestamp || now
        const elapsed = Math.max(0, now - lastTs)
        const gained = Math.floor(elapsed / ENERGY_RECHARGE_MS)
        if (gained <= 0) return curEnergy
        const nextEnergy = Math.min(maxCap, curEnergy + gained)
        const nextTs = nextEnergy >= maxCap ? now : lastTs + gained * ENERGY_RECHARGE_MS
        set({
          energy: nextEnergy,
          lastEnergyRechargeTimestamp: nextTs,
        })
        return nextEnergy
      },

      spendEnergy: (amount = RUN_ENERGY_COST) => {
        const synced = get().syncEnergy()
        if (synced < amount) return false
        const now = Date.now()
        const maxCap = getMaxEnergy(get().seasonPassType)
        const wasAtCap = synced >= maxCap
        const nextEnergy = synced - amount
        set((s) => ({
          energy: nextEnergy,
          lastEnergyRechargeTimestamp:
            wasAtCap && nextEnergy < maxCap ? now : s.lastEnergyRechargeTimestamp || now,
          spinTokens: (s.spinTokens ?? 0) + (amount >= 10 ? Math.floor(amount / 10) : 0),
        }))
        get().incrementSeasonMissionProgress('energySpent', amount)
        return true
      },

      rechargeEnergyWithAd: () => {
        get().syncEnergy()
        const s = get()
        const maxCap = getMaxEnergy(s.seasonPassType)
        const today = new Date().toISOString().slice(0, 10)
        if (s.lastEnergyAdDate === today) return false
        const nextEnergy = Math.min(maxCap, (s.energy ?? 0) + 10)
        set({
          energy: nextEnergy,
          lastEnergyAdDate: today,
          lastEnergyRechargeTimestamp: nextEnergy >= maxCap ? Date.now() : s.lastEnergyRechargeTimestamp,
        })
        get().incrementSeasonMissionProgress('adsWatched', 1)
        return true
      },

      rechargeEnergyWithGems: () => {
        get().syncEnergy()
        const s = get()
        if (s.gems < 50) return false
        const maxCap = getMaxEnergy(s.seasonPassType)
        const nextEnergy = Math.min(maxCap, (s.energy ?? 0) + 30)
        set({
          gems: s.gems - 50,
          energy: nextEnergy,
          lastEnergyRechargeTimestamp: nextEnergy >= maxCap ? Date.now() : s.lastEnergyRechargeTimestamp,
        })
        get().incrementSeasonMissionProgress('gemsSpent', 50)
        return true
      },

      setPlayerProfile: (name, avatarId) =>
        set({
          playerName: name.trim().slice(0, 18) || 'Rookie Trader',
          playerAvatarId: avatarId,
        }),

      claimDailyVipStipend: () => {
        const s = get()
        if (!s.isVipAdFree) return false
        const today = new Date().toISOString().slice(0, 10)
        if (s.lastVipStipendDate === today) return false
        set({
          gems: s.gems + 100,
          silverKeys: s.silverKeys + 1,
          lastVipStipendDate: today,
        })
        return true
      },

      recordBiggestGreenCandle: (amount) =>
        set((s) => {
          const prev = s.careerStats ?? {
            totalRunsPlayed: 0,
            biggestGreenCandle: 0,
            totalCoinsForged: 0,
          }
          if (amount <= prev.biggestGreenCandle) return s
          return {
            careerStats: {
              ...prev,
              biggestGreenCandle: Math.round(amount),
            },
          }
        }),

      setAuthAccount: (account) => set({ authAccount: account }),
      setSelectedServer: (server) => set({ selectedServer: server }),
      setTutorialStep: (step) => set({ tutorialStep: step }),
      toggleDevUnlockAllUi: () => set((s) => ({ devUnlockAllUi: !s.devUnlockAllUi })),
      bindGuestAccount: (type, handle) =>
        set((s) => ({
          authAccount: {
            type,
            handle,
            uid: s.authAccount.uid || `usr_${Date.now().toString(36)}`,
          },
        })),

      setVip: (vip) => set({ isVipAdFree: vip }),

      resetProgress: () => set(createInitialState()),

      // Phase 2: Hero Expeditions
      startExpedition: (contractId, heroIds) => {
        const s = get()
        const contract = EXPEDITION_CONTRACTS.find((c) => c.id === contractId)
        if (!contract) return false
        // Already running?
        if (s.expeditions.some((e) => e.id === contractId)) return false
        // Verify heroes are owned, unequipped, and not assigned elsewhere
        const owned = s.ownedHeroes ?? {}
        const currentlyBusy = new Set(s.expeditions.flatMap((e) => e.assignedHeroIds))
        for (const hid of heroIds) {
          if (!owned[hid] || hid === s.equippedHeroId || currentlyBusy.has(hid)) {
            return false
          }
        }
        const greatSuccessChance = calculateGreatSuccessChance(heroIds, s.heroStars ?? {})
        const newExp: ActiveExpedition = {
          id: contractId,
          assignedHeroIds: [...heroIds],
          startTime: Date.now(),
          durationMs: contract.durationMs,
          status: 'in_progress',
          greatSuccessChance,
        }
        set({ expeditions: [...s.expeditions, newExp] })
        return true
      },

      claimExpedition: (contractId) => {
        const s = get()
        const exp = s.expeditions.find((e) => e.id === contractId)
        if (!exp) return null
        const now = Date.now()
        if (now < exp.startTime + exp.durationMs) return null
        const contract = EXPEDITION_CONTRACTS.find((c) => c.id === contractId)
        if (!contract) return null

        const greatSuccess = Math.random() * 100 < exp.greatSuccessChance
        const mult = greatSuccess ? 1.5 : 1.0

        const blueprintsGained = Math.round(contract.rewards.blueprints * mult)
        const fragmentsGained = Math.round(contract.rewards.heroFragments * mult)
        const fragHeroId = exp.assignedHeroIds[0] || 'rookie_satoshi'
        const gemsGained = Math.round(contract.rewards.gems * mult)
        const hashrateGained = Math.round(contract.rewards.hashrate * mult)

        const prevFrags = s.heroFragments ?? {}
        const nextFrags = {
          ...prevFrags,
          [fragHeroId]: (prevFrags[fragHeroId] ?? 0) + fragmentsGained,
        }

        set({
          furnitureBlueprints: (s.furnitureBlueprints ?? 0) + blueprintsGained,
          heroFragments: nextFrags,
          gems: s.gems + gemsGained,
          hashrate: s.hashrate + hashrateGained,
          expeditions: s.expeditions.filter((e) => e.id !== contractId),
        })

        return {
          success: true,
          greatSuccess,
          rewards: {
            blueprints: blueprintsGained,
            heroFragments: fragmentsGained,
            heroFragmentHeroId: fragHeroId,
            gems: gemsGained,
            hashrate: hashrateGained,
          },
        }
      },

      speedUpExpedition: (contractId) => {
        const s = get()
        const exp = s.expeditions.find((e) => e.id === contractId)
        if (!exp) return false
        set({
          expeditions: s.expeditions.map((e) =>
            e.id === contractId
              ? { ...e, startTime: Date.now() - e.durationMs - 2000, status: 'completed' }
              : e,
          ),
        })
        return true
      },

      // Phase 2: Codex Museum
      discoverCodexEntry: (id) =>
        set((s) => {
          if (s.codexDiscovered?.[id]) return s
          return {
            codexDiscovered: { ...(s.codexDiscovered ?? {}), [id]: true },
          }
        }),

      claimCodexReward: (id) => {
        const s = get()
        if (!s.codexDiscovered?.[id] || s.codexClaimed?.[id]) return false
        set({
          gems: s.gems + CODEX_CLAIM_GEMS_REWARD,
          codexClaimed: { ...(s.codexClaimed ?? {}), [id]: true },
        })
        return true
      },

      claimAllCodexRewards: () => {
        const s = get()
        const disc = s.codexDiscovered ?? {}
        const clm = s.codexClaimed ?? {}
        const unclaimed = Object.keys(disc).filter((id) => disc[id] && !clm[id])
        if (unclaimed.length === 0) return { totalGems: 0, count: 0 }

        const totalGems = unclaimed.length * CODEX_CLAIM_GEMS_REWARD
        const nextClaimed = { ...clm }
        for (const id of unclaimed) {
          nextClaimed[id] = true
        }
        set({
          gems: s.gems + totalGems,
          codexClaimed: nextClaimed,
        })
        return { totalGems, count: unclaimed.length }
      },

      // Phase 2: Syndicate Mercenary Desk
      postSyndicateMercenary: (type, id) => {
        const s = get()
        if (s.syndicateLentItem) return false
        set({
          syndicateLentItem: {
            type,
            id,
            postedAt: Date.now(),
            unclaimedHashrate: 500,
          },
        })
        return true
      },

      reclaimSyndicateMercenary: () => {
        const s = get()
        if (!s.syndicateLentItem) return false
        const accrued = s.syndicateLentItem.unclaimedHashrate || 0
        set({
          hashrate: s.hashrate + accrued,
          syndicateLentItem: null,
        })
        return true
      },

      claimSyndicateLendingHashrate: () => {
        const s = get()
        if (!s.syndicateLentItem) return 0
        // Calculate accrued hashrate: baseline unclaimed + 25 per hour since posted
        const hoursPassed = Math.max(0, (Date.now() - s.syndicateLentItem.postedAt) / (1000 * 3600))
        const timeAccrued = Math.round(hoursPassed * 25)
        const total = (s.syndicateLentItem.unclaimedHashrate || 0) + timeAccrued
        if (total <= 0) return 0
        set({
          hashrate: s.hashrate + total,
          syndicateLentItem: {
            ...s.syndicateLentItem,
            postedAt: Date.now(),
            unclaimedHashrate: 0,
          },
        })
        return total
      },

      borrowSyndicateMercenary: (mercenary) => {
        const s = get()
        const today = new Date().toISOString().slice(0, 10)
        if (s.lastMercenaryBorrowDate === today && s.borrowedMercenary) return false
        set({
          borrowedMercenary: mercenary,
          lastMercenaryBorrowDate: today,
        })
        return true
      },

      consumeBorrowedMercenary: () => set({ borrowedMercenary: null }),

      // Phase 2: Endless Margin Call Tower
      syncTowerDailyReset: () => {
        const s = get()
        const today = new Date().toISOString().slice(0, 10)
        const updates: Partial<MetaData> = {}
        if (s.lastTowerResetDate !== today) {
          updates.towerAttemptsLeft = 3
          updates.lastTowerResetDate = today
        }
        if (s.lastMercenaryBorrowDate !== today && !s.borrowedMercenary) {
          updates.lastMercenaryBorrowDate = ''
        }
        if (Object.keys(updates).length > 0) {
          set(updates)
        }
      },

      completeTowerFloor: (floor) => {
        const s = get()
        const rewards = getTowerFloorRewards(floor)
        const isMilestone = floor % 5 === 0

        let extraSilver = 0
        let extraQuantum = 0
        let extraFragments = 0
        let extraGems = 0

        if (rewards.milestoneReward) {
          extraSilver = rewards.milestoneReward.silverKeys
          extraQuantum = rewards.milestoneReward.quantumKeys
          extraFragments = rewards.milestoneReward.heroFragments
          extraGems = rewards.milestoneReward.gems
        }

        const nextHighest = Math.max(s.highestTowerFloorCleared ?? 0, floor)
        const nextFrags = { ...(s.heroFragments ?? {}) }
        if (extraFragments > 0) {
          const heroKey = s.equippedHeroId || 'rookie_satoshi'
          nextFrags[heroKey] = (nextFrags[heroKey] ?? 0) + extraFragments
        }

        const totalSolder = (rewards.solderWire ?? 0) + (rewards.milestoneReward?.solderWire ?? 0)
        const totalBlueprints = (rewards.blueprints ?? 0) + (rewards.milestoneReward?.blueprints ?? 0)

        set({
          highestTowerFloorCleared: nextHighest,
          hashrate: s.hashrate + rewards.hashrate,
          gems: s.gems + rewards.gems + extraGems,
          silverKeys: s.silverKeys + extraSilver,
          quantumKeys: s.quantumKeys + extraQuantum,
          heroFragments: nextFrags,
          solderWire: (s.solderWire ?? 0) + totalSolder,
          furnitureBlueprints: (s.furnitureBlueprints ?? 0) + totalBlueprints,
        })
        get().incrementSeasonMissionProgress('enemiesDefeated', 1)
        if (isMilestone) {
          get().incrementSeasonMissionProgress('bossesDefeated', 1)
        }

        return {
          hashrate: rewards.hashrate,
          gems: rewards.gems + extraGems,
          solderWire: totalSolder > 0 ? totalSolder : undefined,
          blueprints: totalBlueprints > 0 ? totalBlueprints : undefined,
          isMilestone,
          milestoneReward: rewards.milestoneReward,
        }
      },

      failTowerFloor: () =>
        set((s) => ({
          towerAttemptsLeft: Math.max(0, (s.towerAttemptsLeft ?? 3) - 1),
        })),

      resetTowerAttemptsCheat: () => set({ towerAttemptsLeft: 3 }),

      // Phase 3: 28-Day Bull Market Season Pass
      addSeasonPassXp: (amount) =>
        set((s) => ({
          seasonPassXp: Math.min(MAX_SEASON_TIER * XP_PER_TIER, (s.seasonPassXp ?? 0) + Math.max(0, amount)),
        })),

      buySeasonPass: (type) => {
        const s = get()
        if (type === 'whale') {
          const newSkins = Array.from(new Set([...(s.unlockedChartSkins ?? ['default']), 'sovereign_gold']))
          set({
            seasonPassType: 'whale',
            hasGoldenBullStatue: true,
            unlockedChartSkins: newSkins,
            equippedChartSkin: 'sovereign_gold',
            seasonPassXp: Math.min(MAX_SEASON_TIER * XP_PER_TIER, (s.seasonPassXp ?? 0) + 1000), // +10 tiers!
            energy: 45,
          })
          return true
        }
        if (type === 'trader') {
          set({
            seasonPassType: s.seasonPassType === 'whale' ? 'whale' : 'trader',
          })
          return true
        }
        return false
      },

      claimSeasonPassTier: (tier, track) => {
        const s = get()
        const curTier = calculateSeasonTier(s.seasonPassXp ?? 0)
        if (tier > curTier) return false

        const tierCfg = SEASON_TIERS[tier - 1]
        if (!tierCfg) return false

        if (track === 'free') {
          if ((s.seasonPassClaimedFree ?? []).includes(tier)) return false
          const reward = tierCfg.freeReward
          const wallet = { gems: s.gems, silverKeys: s.silverKeys, quantumKeys: s.quantumKeys, hashrate: s.hashrate }
          if (reward.type === 'gems') wallet.gems += reward.amount
          else if (reward.type === 'silverKeys') wallet.silverKeys += reward.amount
          else if (reward.type === 'quantumKeys') wallet.quantumKeys += reward.amount
          else if (reward.type === 'hashrate') wallet.hashrate += reward.amount
          set({
            ...wallet,
            seasonPassClaimedFree: [...(s.seasonPassClaimedFree ?? []), tier],
          })
          return true
        }

        if (track === 'trader') {
          if (s.seasonPassType !== 'trader' && s.seasonPassType !== 'whale') return false
          if ((s.seasonPassClaimedTrader ?? []).includes(tier)) return false
          const reward = tierCfg.traderReward
          const wallet = { gems: s.gems, silverKeys: s.silverKeys, quantumKeys: s.quantumKeys, hashrate: s.hashrate }
          if (reward.type === 'gems') wallet.gems += reward.amount
          else if (reward.type === 'silverKeys') wallet.silverKeys += reward.amount
          else if (reward.type === 'quantumKeys') wallet.quantumKeys += reward.amount
          else if (reward.type === 'hashrate') wallet.hashrate += reward.amount
          else if (reward.type === 'coin') wallet.gems += 500
          set({
            ...wallet,
            seasonPassClaimedTrader: [...(s.seasonPassClaimedTrader ?? []), tier],
          })
          return true
        }

        if (track === 'whale') {
          if (s.seasonPassType !== 'whale') return false
          if ((s.seasonPassClaimedWhale ?? []).includes(tier)) return false
          const reward = tierCfg.whaleReward
          const wallet = { gems: s.gems, silverKeys: s.silverKeys, quantumKeys: s.quantumKeys, hashrate: s.hashrate }
          const nextFrags = { ...(s.heroFragments ?? {}) }
          if (reward.type === 'gems') wallet.gems += reward.amount
          else if (reward.type === 'silverKeys') wallet.silverKeys += reward.amount
          else if (reward.type === 'quantumKeys') wallet.quantumKeys += reward.amount
          else if (reward.type === 'hashrate') wallet.hashrate += reward.amount
          else if (reward.type === 'fragments') {
            const hKey = s.equippedHeroId || 'rookie_satoshi'
            nextFrags[hKey] = (nextFrags[hKey] ?? 0) + reward.amount
          }
          set({
            ...wallet,
            heroFragments: nextFrags,
            seasonPassClaimedWhale: [...(s.seasonPassClaimedWhale ?? []), tier],
          })
          return true
        }

        return false
      },

      claimAllSeasonPass: () => {
        const s = get()
        const curTier = calculateSeasonTier(s.seasonPassXp ?? 0)
        let claimedCount = 0
        let extraGems = 0
        let extraSilver = 0
        let extraQuantum = 0
        let extraHashrate = 0
        let extraFrags = 0
        const newClaimedFree = [...(s.seasonPassClaimedFree ?? [])]
        const newClaimedTrader = [...(s.seasonPassClaimedTrader ?? [])]
        const newClaimedWhale = [...(s.seasonPassClaimedWhale ?? [])]

        for (let t = 1; t <= curTier; t++) {
          const tierCfg = SEASON_TIERS[t - 1]
          if (!tierCfg) continue

          if (!newClaimedFree.includes(t)) {
            newClaimedFree.push(t)
            claimedCount++
            const r = tierCfg.freeReward
            if (r.type === 'gems') extraGems += r.amount
            else if (r.type === 'silverKeys') extraSilver += r.amount
            else if (r.type === 'quantumKeys') extraQuantum += r.amount
            else if (r.type === 'hashrate') extraHashrate += r.amount
          }

          if ((s.seasonPassType === 'trader' || s.seasonPassType === 'whale') && !newClaimedTrader.includes(t)) {
            newClaimedTrader.push(t)
            claimedCount++
            const r = tierCfg.traderReward
            if (r.type === 'gems') extraGems += r.amount
            else if (r.type === 'silverKeys') extraSilver += r.amount
            else if (r.type === 'quantumKeys') extraQuantum += r.amount
            else if (r.type === 'hashrate') extraHashrate += r.amount
            else if (r.type === 'coin') extraGems += 500
          }

          if (s.seasonPassType === 'whale' && !newClaimedWhale.includes(t)) {
            newClaimedWhale.push(t)
            claimedCount++
            const r = tierCfg.whaleReward
            if (r.type === 'gems') extraGems += r.amount
            else if (r.type === 'silverKeys') extraSilver += r.amount
            else if (r.type === 'quantumKeys') extraQuantum += r.amount
            else if (r.type === 'hashrate') extraHashrate += r.amount
            else if (r.type === 'fragments') extraFrags += r.amount
          }
        }

        const nextFrags = { ...(s.heroFragments ?? {}) }
        if (extraFrags > 0) {
          const hKey = s.equippedHeroId || 'rookie_satoshi'
          nextFrags[hKey] = (nextFrags[hKey] ?? 0) + extraFrags
        }

        set({
          gems: s.gems + extraGems,
          silverKeys: s.silverKeys + extraSilver,
          quantumKeys: s.quantumKeys + extraQuantum,
          hashrate: s.hashrate + extraHashrate,
          heroFragments: nextFrags,
          seasonPassClaimedFree: newClaimedFree,
          seasonPassClaimedTrader: newClaimedTrader,
          seasonPassClaimedWhale: newClaimedWhale,
        })

        return {
          claimedCount,
          gems: extraGems,
          keys: extraSilver + extraQuantum,
          hashrate: extraHashrate,
        }
      },

      // Phase 3: Weekend Meme-Coin Frenzy Spin Wheel
      spinMemeWheel: () => {
        const s = get()
        const today = new Date().toISOString().slice(0, 10)
        const hasFreeSpin = s.lastWheelFreeSpinDate !== today
        const hasTokens = (s.spinTokens ?? 0) >= 1

        if (!hasFreeSpin && !hasTokens) return null

        const totalWeight = MEME_WHEEL_SLICES.reduce((acc, slice) => acc + slice.weight, 0)
        let roll = Math.random() * totalWeight
        let pickedSlice = MEME_WHEEL_SLICES[0]
        for (const slice of MEME_WHEEL_SLICES) {
          if (roll < slice.weight) {
            pickedSlice = slice
            break
          }
          roll -= slice.weight
        }

        const nextTokens = hasFreeSpin ? (s.spinTokens ?? 0) : Math.max(0, (s.spinTokens ?? 0) - 1)
        const nextFreeDate = hasFreeSpin ? today : s.lastWheelFreeSpinDate
        const nextTotalSpins = (s.totalMemeSpins ?? 0) + 1

        const wallet = { gems: s.gems, silverKeys: s.silverKeys, quantumKeys: s.quantumKeys, hashrate: s.hashrate }
        const nextFrags = { ...(s.heroFragments ?? {}) }

        if (pickedSlice.type === 'gems') wallet.gems += pickedSlice.amount
        else if (pickedSlice.type === 'silverKey') wallet.silverKeys += pickedSlice.amount
        else if (pickedSlice.type === 'quantumKey') wallet.quantumKeys += pickedSlice.amount
        else if (pickedSlice.type === 'hashrate') wallet.hashrate += pickedSlice.amount
        else if (pickedSlice.type === 'fragments') {
          const hKey = s.equippedHeroId || 'rookie_satoshi'
          nextFrags[hKey] = (nextFrags[hKey] ?? 0) + pickedSlice.amount
        }

        const milestoneUnlocked = WHEEL_MILESTONES.find(
          (m) => m.spinsRequired === nextTotalSpins && !(s.claimedWheelMilestones ?? []).includes(m.spinsRequired)
        )

        set({
          ...wallet,
          heroFragments: nextFrags,
          spinTokens: nextTokens,
          lastWheelFreeSpinDate: nextFreeDate,
          totalMemeSpins: nextTotalSpins,
        })

        return { slice: pickedSlice, milestoneUnlocked }
      },

      buySpinTokens: (packId) => {
        const pack = WHEEL_TOP_UPS.find((p) => p.id === packId)
        if (!pack) return false
        set((s) => ({
          spinTokens: (s.spinTokens ?? 0) + pack.tokens,
        }))
        return true
      },

      claimWheelMilestone: (spinsRequired) => {
        const s = get()
        if ((s.totalMemeSpins ?? 0) < spinsRequired) return false
        if ((s.claimedWheelMilestones ?? []).includes(spinsRequired)) return false
        const ms = WHEEL_MILESTONES.find((m) => m.spinsRequired === spinsRequired)
        if (!ms) return false

        const nextFrags = { ...(s.heroFragments ?? {}) }
        if (ms.heroFragments > 0) {
          const hKey = s.equippedHeroId || 'rookie_satoshi'
          nextFrags[hKey] = (nextFrags[hKey] ?? 0) + ms.heroFragments
        }

        set({
          gems: s.gems + ms.gems,
          silverKeys: s.silverKeys + ms.silverKeys,
          quantumKeys: s.quantumKeys + ms.quantumKeys,
          heroFragments: nextFrags,
          claimedWheelMilestones: [...(s.claimedWheelMilestones ?? []), spinsRequired],
        })
        return true
      },

      // Phase 3: 5-Step Flash Liquidity Chain Offer
      claimRelayStep: (stepNumber) => {
        const s = get()
        const currentClaimed = s.relayChainStep ?? 0
        if (stepNumber !== currentClaimed + 1) {
          return { success: false, error: 'Step is locked' }
        }
        const cfg = RELAY_CHAIN_STEPS.find((st) => st.step === stepNumber)
        if (!cfg) return { success: false, error: 'Invalid step' }

        const wallet = { gems: s.gems, silverKeys: s.silverKeys, quantumKeys: s.quantumKeys, hashrate: s.hashrate }
        const nextFrags = { ...(s.heroFragments ?? {}) }
        let nextOwnedCoins = [...s.ownedCoins]

        if (cfg.rewards.gems) wallet.gems += cfg.rewards.gems
        if (cfg.rewards.silverKeys) wallet.silverKeys += cfg.rewards.silverKeys
        if (cfg.rewards.quantumKeys) wallet.quantumKeys += cfg.rewards.quantumKeys
        if (cfg.rewards.heroFragments) {
          const hKey = s.equippedHeroId || 'rookie_satoshi'
          nextFrags[hKey] = (nextFrags[hKey] ?? 0) + cfg.rewards.heroFragments
        }
        if (cfg.rewards.epicCoin) {
          const epicTargetId = 'aetherstake'
          const existing = nextOwnedCoins.find((c) => c.coinId === epicTargetId && c.rarity === 'epic')
          if (existing) {
            nextOwnedCoins = nextOwnedCoins.map((c) => (c.id === existing.id ? { ...c, count: c.count + 1 } : c))
          } else {
            nextOwnedCoins.push({
              id: `relay_epic_${Date.now()}`,
              coinId: epicTargetId,
              rarity: 'epic',
              level: 1,
              count: 1,
              acquiredAt: Date.now(),
            })
          }
        }

        set({
          ...wallet,
          heroFragments: nextFrags,
          ownedCoins: nextOwnedCoins,
          relayChainStep: stepNumber,
        })
        return { success: true }
      },

      // Phase 3: Cosmetic Candlestick & Chart FX Skins
      setChartSkin: (skinId) => {
        const s = get()
        if (!(s.unlockedChartSkins ?? ['default']).includes(skinId)) return false
        set({ equippedChartSkin: skinId })
        return true
      },

      unlockChartSkin: (skinId) => {
        set((s) => ({
          unlockedChartSkins: Array.from(new Set([...(s.unlockedChartSkins ?? ['default']), skinId])),
        }))
        return true
      },

      // Hero Skin Wardrobe & Duplicate Star Ascension
      unlockSkin: (skinId, copies = 0) => {
        set((s) => {
          const current = s.ownedSkins?.[skinId]
          return {
            ownedSkins: {
              ...(s.ownedSkins ?? DEFAULT_OWNED_SKINS),
              [skinId]: {
                unlocked: true,
                stars: current?.stars ?? 1,
                copies: (current?.copies ?? 0) + copies,
              },
            },
          }
        })
      },

      addSkinCopies: (skinId, count) => {
        set((s) => {
          const current = s.ownedSkins?.[skinId] ?? { unlocked: false, stars: 1, copies: 0 }
          return {
            ownedSkins: {
              ...(s.ownedSkins ?? DEFAULT_OWNED_SKINS),
              [skinId]: {
                ...current,
                copies: current.copies + count,
              },
            },
          }
        })
      },

      equipHeroSkin: (heroId, skinId) => {
        set((s) => ({
          equippedSkins: {
            ...(s.equippedSkins ?? DEFAULT_EQUIPPED_SKINS),
            [heroId]: skinId,
          },
        }))
      },

      ascendHeroSkin: (skinId) => {
        const s = get()
        const current = s.ownedSkins?.[skinId]
        if (!current || !current.unlocked || current.stars >= MAX_SKIN_STARS) return false
        const cost = getSkinAscensionCost(current.stars)
        if (current.copies < cost) return false

        set({
          ownedSkins: {
            ...(s.ownedSkins ?? DEFAULT_OWNED_SKINS),
            [skinId]: {
              ...current,
              stars: current.stars + 1,
              copies: current.copies - cost,
            },
          },
        })
        return true
      },

      getSkinStatBonus: () => {
        const s = get()
        const owned = s.ownedSkins ?? DEFAULT_OWNED_SKINS
        let damagePct = 0
        let startingSeedPct = 0
        let critChancePct = 0
        let greenOddsPct = 0
        let speedPct = 0
        let bossBountyPct = 0

        for (const [skinId, info] of Object.entries(owned)) {
          if (!info.unlocked) continue
          const cfg = SKIN_MAP[skinId]
          if (!cfg) continue
          const mult = getSkinStarMultiplier(info.stars)
          const val = cfg.passiveBonus.baseValue * mult

          switch (cfg.passiveBonus.stat) {
            case 'damage_pct':
              damagePct += val
              break
            case 'starting_seed_pct':
              startingSeedPct += val
              break
            case 'crit_chance_pct':
              critChancePct += val
              break
            case 'green_odds_pct':
              greenOddsPct += val
              break
            case 'speed_pct':
              speedPct += val
              break
            case 'boss_bounty_pct':
              bossBountyPct += val
              break
          }
        }

        return { damagePct, startingSeedPct, critChancePct, greenOddsPct, speedPct, bossBountyPct }
      },

      // Season 1: Daily Resource Exchange
      buyDailyExchange: (itemId) => {
        const s = get()
        const today = new Date().toISOString().slice(0, 10)
        let purchases = { ...(s.dailyExchangePurchases ?? {}) }
        if (s.lastDailyExchangeDate !== today) {
          purchases = { blueprints: 0, manuals: 0, galaTickets: 0 }
        }

        const limits = { blueprints: 2, manuals: 3, galaTickets: 1 }
        const costs = { blueprints: 250, manuals: 200, galaTickets: 800 }

        const currentCount = purchases[itemId] ?? 0
        if (currentCount >= limits[itemId]) return false
        if (s.gems < costs[itemId]) return false

        const cost = costs[itemId]
        const nextPurchases = { ...purchases, [itemId]: currentCount + 1 }
        const updates: Partial<MetaData> = {
          gems: s.gems - cost,
          dailyExchangePurchases: nextPurchases,
          lastDailyExchangeDate: today,
        }

        if (itemId === 'blueprints') {
          updates.furnitureBlueprints = (s.furnitureBlueprints ?? 0) + 10
        } else if (itemId === 'manuals') {
          updates.skillManuals = (s.skillManuals ?? 0) + 5
          updates.furnitureBlueprints = (s.furnitureBlueprints ?? 0) + 5
        } else if (itemId === 'galaTickets') {
          updates.galaTickets = (s.galaTickets ?? 0) + 5
        }

        set(updates)
        get().incrementSeasonMissionProgress('gemsSpent', cost)
        return true
      },

      // Season 1: Golden Bull Gala Actions
      spinFortunaWheel: (count) => {
        const s = get()
        if ((s.galaTickets ?? 0) < count) return null

        const results: Array<{ slice: GalaWheelSlice; milestoneUnlocked?: WheelMilestoneReward }> = []
        let extraGems = 0
        let extraSilver = 0
        let extraQuantum = 0
        let extraHashrate = 0
        let extraTickets = 0
        const nextFrags = { ...(s.heroFragments ?? {}) }
        const nextOwnedSkins = { ...(s.ownedSkins ?? DEFAULT_OWNED_SKINS) }
        const nextOwnedHeroes = { ...(s.ownedHeroes ?? { rookie_satoshi: 1 }) }

        for (let i = 0; i < count; i++) {
          const totalWeight = GALA_WHEEL_SLICES.reduce((acc, sl) => acc + sl.probPct, 0)
          let rand = Math.random() * totalWeight
          let chosen = GALA_WHEEL_SLICES[0]
          for (const slice of GALA_WHEEL_SLICES) {
            rand -= slice.probPct
            if (rand <= 0) {
              chosen = slice
              break
            }
          }

          if (chosen.type === 'hero_unlock') {
            nextFrags.lady_fortuna = (nextFrags.lady_fortuna ?? 0) + chosen.amount
            if ((nextOwnedHeroes.lady_fortuna ?? 0) === 0) {
              nextOwnedHeroes.lady_fortuna = 1
            }
            nextOwnedSkins['lady_fortuna_empress'] = {
              unlocked: true,
              stars: nextOwnedSkins['lady_fortuna_empress']?.stars ?? 1,
              copies: (nextOwnedSkins['lady_fortuna_empress']?.copies ?? 0) + 1,
            }
          } else if (chosen.type === 'shards') {
            nextFrags.lady_fortuna = (nextFrags.lady_fortuna ?? 0) + chosen.amount
            if ((nextFrags.lady_fortuna ?? 0) >= 50 && (nextOwnedHeroes.lady_fortuna ?? 0) === 0) {
              nextOwnedHeroes.lady_fortuna = 1
            }
          } else if (chosen.type === 'tickets') {
            extraTickets += chosen.amount
          } else if (chosen.type === 'gems') {
            extraGems += chosen.amount
          } else if (chosen.type === 'hashrate') {
            extraHashrate += chosen.amount
          } else if (chosen.type === 'keys') {
            if (chosen.id === 'slice_quantum_key') extraQuantum += chosen.amount
            else extraSilver += chosen.amount
          } else if (chosen.type === 'skin_copy' && chosen.skinId) {
            const sk = chosen.skinId
            nextOwnedSkins[sk] = {
              unlocked: true,
              stars: nextOwnedSkins[sk]?.stars ?? 1,
              copies: (nextOwnedSkins[sk]?.copies ?? 0) + chosen.amount,
            }
          }

          results.push({ slice: chosen })
        }

        const nextPulls = (s.seasonWheelPulls ?? 0) + count
        const milestoneClaimsUnlocked = GALA_100_PULL_MILESTONES.filter(
          (m) => nextPulls >= m.pulls && !(s.claimedGalaMilestones ?? []).includes(m.pulls),
        )

        set({
          galaTickets: s.galaTickets - count + extraTickets,
          seasonWheelPulls: nextPulls,
          gems: s.gems + extraGems,
          silverKeys: s.silverKeys + extraSilver,
          quantumKeys: s.quantumKeys + extraQuantum,
          hashrate: s.hashrate + extraHashrate,
          heroFragments: nextFrags,
          ownedHeroes: nextOwnedHeroes,
          ownedSkins: nextOwnedSkins,
        })

        return { results, milestoneClaimsUnlocked }
      },

      buyGalaTicketsWithGems: (count) => {
        const s = get()
        const cost = count === 10 ? 1800 : 200 * count
        if (s.gems < cost) return false
        set({
          gems: s.gems - cost,
          galaTickets: (s.galaTickets ?? 0) + count,
        })
        get().incrementSeasonMissionProgress('gemsSpent', cost)
        return true
      },

      claimGalaMilestone: (pulls) => {
        const s = get()
        if ((s.seasonWheelPulls ?? 0) < pulls) return false
        if ((s.claimedGalaMilestones ?? []).includes(pulls)) return false
        const ms = GALA_100_PULL_MILESTONES.find((m) => m.pulls === pulls)
        if (!ms) return false

        let extraGems = 0
        let extraSilver = 0
        let extraQuantum = 0
        let extraBlueprints = 0
        const nextFrags = { ...(s.heroFragments ?? {}) }
        const nextOwnedHeroes = { ...(s.ownedHeroes ?? { rookie_satoshi: 1 }) }
        const nextOwnedSkins = { ...(s.ownedSkins ?? DEFAULT_OWNED_SKINS) }

        if (ms.type === 'shards' && ms.shardsCount) {
          nextFrags.lady_fortuna = (nextFrags.lady_fortuna ?? 0) + ms.shardsCount
          if (nextFrags.lady_fortuna >= 50 && (nextOwnedHeroes.lady_fortuna ?? 0) === 0) {
            nextOwnedHeroes.lady_fortuna = 1
          }
        } else if (ms.type === 'gems') {
          extraGems += ms.amount
          if (pulls === 20) extraSilver += 3
          if (pulls === 90) extraQuantum += 5
        } else if (ms.type === 'keys') {
          extraQuantum += ms.amount
        } else if (ms.type === 'blueprints') {
          extraBlueprints += ms.amount
        } else if (ms.type === 'skin' && ms.skinId) {
          const sk = ms.skinId
          nextOwnedSkins[sk] = {
            unlocked: true,
            stars: nextOwnedSkins[sk]?.stars ?? 1,
            copies: (nextOwnedSkins[sk]?.copies ?? 0) + 1,
          }
        }

        set({
          gems: s.gems + extraGems,
          silverKeys: s.silverKeys + extraSilver,
          quantumKeys: s.quantumKeys + extraQuantum,
          furnitureBlueprints: (s.furnitureBlueprints ?? 0) + extraBlueprints,
          heroFragments: nextFrags,
          ownedHeroes: nextOwnedHeroes,
          ownedSkins: nextOwnedSkins,
          claimedGalaMilestones: [...(s.claimedGalaMilestones ?? []), pulls],
        })
        return true
      },

      claimAllGalaMilestones: () => {
        const s = get()
        const eligible = GALA_100_PULL_MILESTONES.filter(
          (m) => (s.seasonWheelPulls ?? 0) >= m.pulls && !(s.claimedGalaMilestones ?? []).includes(m.pulls),
        )
        if (eligible.length === 0) return { claimedCount: 0 }

        let claimedCount = 0
        for (const m of eligible) {
          get().claimGalaMilestone(m.pulls)
          claimedCount++
        }
        return { claimedCount }
      },

      completeFortunaTrial: (stage) => {
        const s = get()
        const stageCfg = FORTUNA_TRIAL_STAGES.find((st) => st.stage === stage)
        if (!stageCfg) return null
        if ((s.clearedFortunaTrials ?? []).includes(stage)) return null

        // Check ownership conditions
        if (!stageCfg.isTrialHeroLent) {
          const lfLevel = s.ownedHeroes?.lady_fortuna ?? 0
          if (lfLevel === 0) return null
          const lfStars = s.heroStars?.lady_fortuna ?? 1
          if (stageCfg.minHeroStarsRequired && lfStars < stageCfg.minHeroStarsRequired) {
            return null
          }
        }

        const rw = stageCfg.rewards
        const nextFrags = { ...(s.heroFragments ?? {}) }
        const nextOwnedHeroes = { ...(s.ownedHeroes ?? { rookie_satoshi: 1 }) }
        const nextOwnedSkins = { ...(s.ownedSkins ?? DEFAULT_OWNED_SKINS) }

        nextFrags.lady_fortuna = (nextFrags.lady_fortuna ?? 0) + rw.shards
        if (nextFrags.lady_fortuna >= 50 && (nextOwnedHeroes.lady_fortuna ?? 0) === 0) {
          nextOwnedHeroes.lady_fortuna = 1
        }

        if (rw.skinCopies) {
          const sk = rw.skinCopies.skinId
          nextOwnedSkins[sk] = {
            unlocked: true,
            stars: nextOwnedSkins[sk]?.stars ?? 1,
            copies: (nextOwnedSkins[sk]?.copies ?? 0) + rw.skinCopies.count,
          }
        }

        set({
          galaTickets: (s.galaTickets ?? 0) + rw.tickets,
          gems: s.gems + rw.gems,
          heroFragments: nextFrags,
          ownedHeroes: nextOwnedHeroes,
          ownedSkins: nextOwnedSkins,
          clearedFortunaTrials: [...(s.clearedFortunaTrials ?? []), stage],
        })
        get().incrementSeasonMissionProgress('bossesDefeated', 1)
        get().incrementSeasonMissionProgress('enemiesDefeated', 1)

        return { success: true, ticketsWon: rw.tickets, shardsWon: rw.shards }
      },

      dropPlinkoChip: (bucketIndex) => {
        const s = get()
        if ((s.galaChips ?? 0) < 1) return null

        const weights = [15, 25, 20, 25, 15]
        let bIdx = bucketIndex
        if (bIdx === undefined) {
          const sum = weights.reduce((a, b) => a + b, 0)
          let r = Math.random() * sum
          bIdx = 0
          for (let i = 0; i < weights.length; i++) {
            r -= weights[i]
            if (r <= 0) {
              bIdx = i
              break
            }
          }
        }

        const bucket = PLINKO_BUCKETS[bIdx] || PLINKO_BUCKETS[2]
        let rewardDesc = ''
        let extraGems = 0
        let extraHashrate = 0
        let extraTickets = 0
        const nextFrags = { ...(s.heroFragments ?? {}) }
        const nextOwnedHeroes = { ...(s.ownedHeroes ?? { rookie_satoshi: 1 }) }

        if (bucket.multiplier === 1) {
          extraGems = 100
          extraHashrate = 1000
          rewardDesc = '+100 💎 Gems & +1,000 ⚡ Hashrate'
        } else if (bucket.multiplier === 2) {
          extraTickets = 2
          extraGems = 150
          rewardDesc = '+2 🎟️ Gala Tickets & +150 💎 Gems'
        } else {
          extraTickets = 5
          extraGems = 500
          nextFrags.lady_fortuna = (nextFrags.lady_fortuna ?? 0) + 5
          if (nextFrags.lady_fortuna >= 50 && (nextOwnedHeroes.lady_fortuna ?? 0) === 0) {
            nextOwnedHeroes.lady_fortuna = 1
          }
          rewardDesc = '🔥 JACKPOT! +5 🎟️ Gala Tickets, +5 🧩 Lady Fortuna Shards, +500 💎 Gems!'
        }

        set({
          galaChips: s.galaChips - 1,
          plinkoDrops: (s.plinkoDrops ?? 0) + 1,
          gems: s.gems + extraGems,
          hashrate: s.hashrate + extraHashrate,
          galaTickets: (s.galaTickets ?? 0) + extraTickets,
          heroFragments: nextFrags,
          ownedHeroes: nextOwnedHeroes,
        })

        return { bucket, rewardDesc }
      },

      addGalaTickets: (amount) => set((s) => ({ galaTickets: (s.galaTickets ?? 0) + amount })),
      addGalaChips: (amount) => set((s) => ({ galaChips: (s.galaChips ?? 0) + amount })),

      // Season 1: Gala Event Missions Engine
      incrementSeasonMissionProgress: (missionId, delta = 1) => {
        set((s) => ({
          seasonMissionProgress: {
            ...(s.seasonMissionProgress ?? {}),
            [missionId]: ((s.seasonMissionProgress ?? {})[missionId] ?? 0) + delta,
          },
        }))
      },

      setSeasonMissionProgress: (missionId, val) => {
        set((s) => ({
          seasonMissionProgress: {
            ...(s.seasonMissionProgress ?? {}),
            [missionId]: val,
          },
        }))
      },

      getSeasonMissionProgress: (missionId) => {
        const s = get()
        if (missionId === 'seasonHeroUnlocked') {
          return (s.ownedHeroes?.lady_fortuna ?? 0) > 0
            ? 1
            : (s.seasonMissionProgress?.seasonHeroUnlocked ?? 0)
        }
        if (missionId === 'seasonHeroStar') {
          return s.heroStars?.lady_fortuna ?? ((s.ownedHeroes?.lady_fortuna ?? 0) > 0 ? 1 : 0)
        }
        return s.seasonMissionProgress?.[missionId] ?? 0
      },

      spendGems: (amount) => {
        const s = get()
        if (s.gems < amount) return false
        set({ gems: s.gems - amount })
        get().incrementSeasonMissionProgress('gemsSpent', amount)
        return true
      },

      claimSeasonMissionTier: (missionId, tierNumber) => {
        const s = get()
        const mission = SEASON_MISSION_MAP[missionId]
        if (!mission) return null
        const tier = mission.tiers.find((t) => t.tierNumber === tierNumber)
        if (!tier) return null

        const claimed = s.claimedSeasonMissionTiers?.[missionId] ?? []
        if (claimed.includes(tierNumber)) return null

        const currentProg = get().getSeasonMissionProgress(missionId)
        if (currentProg < tier.target) return null

        const rw = tier.reward
        const nextFrags = { ...(s.heroFragments ?? {}) }
        const nextOwnedHeroes = { ...(s.ownedHeroes ?? { rookie_satoshi: 1 }) }
        let nextTitles = [...(s.unlockedTitles ?? ['Rookie Trader'])]
        let nextPlayerTitle = s.playerTitle ?? 'Rookie Trader'

        if (rw.fortunaShards) {
          nextFrags.lady_fortuna = (nextFrags.lady_fortuna ?? 0) + rw.fortunaShards
          if (nextFrags.lady_fortuna >= 50 && (nextOwnedHeroes.lady_fortuna ?? 0) === 0) {
            nextOwnedHeroes.lady_fortuna = 1
          }
        }
        if (rw.title) {
          nextTitles = Array.from(new Set([...nextTitles, rw.title]))
          nextPlayerTitle = rw.title
        }

        set({
          galaTickets: (s.galaTickets ?? 0) + (rw.galaTickets ?? 0),
          gems: s.gems + (rw.gems ?? 0),
          hashrate: s.hashrate + (rw.hashrate ?? 0),
          quantumKeys: s.quantumKeys + (rw.quantumKeys ?? 0),
          heroFragments: nextFrags,
          ownedHeroes: nextOwnedHeroes,
          unlockedTitles: nextTitles,
          playerTitle: nextPlayerTitle,
          claimedSeasonMissionTiers: {
            ...(s.claimedSeasonMissionTiers ?? {}),
            [missionId]: [...claimed, tierNumber],
          },
        })

        return rw
      },

      claimSeasonMissionMilestone: (completedTiers) => {
        const s = get()
        const ms = SEASON_MISSION_MILESTONES.find((m) => m.completedTiers === completedTiers)
        if (!ms) return null

        const claimed = s.claimedSeasonMissionMilestones ?? []
        if (claimed.includes(completedTiers)) return null

        const totalClaimed = Object.values(s.claimedSeasonMissionTiers ?? {}).reduce(
          (sum, list) => sum + list.length,
          0,
        )
        if (totalClaimed < completedTiers) return null

        const rw = ms.reward
        const nextFrags = { ...(s.heroFragments ?? {}) }
        const nextOwnedHeroes = { ...(s.ownedHeroes ?? { rookie_satoshi: 1 }) }
        let nextTitles = [...(s.unlockedTitles ?? ['Rookie Trader'])]
        let nextPlayerTitle = s.playerTitle ?? 'Rookie Trader'

        if (rw.fortunaShards) {
          nextFrags.lady_fortuna = (nextFrags.lady_fortuna ?? 0) + rw.fortunaShards
          if (nextFrags.lady_fortuna >= 50 && (nextOwnedHeroes.lady_fortuna ?? 0) === 0) {
            nextOwnedHeroes.lady_fortuna = 1
          }
        }
        if (rw.title) {
          nextTitles = Array.from(new Set([...nextTitles, rw.title]))
          nextPlayerTitle = rw.title
        }

        set({
          galaTickets: (s.galaTickets ?? 0) + (rw.galaTickets ?? 0),
          gems: s.gems + (rw.gems ?? 0),
          hashrate: s.hashrate + (rw.hashrate ?? 0),
          quantumKeys: s.quantumKeys + (rw.quantumKeys ?? 0),
          heroFragments: nextFrags,
          ownedHeroes: nextOwnedHeroes,
          unlockedTitles: nextTitles,
          playerTitle: nextPlayerTitle,
          claimedSeasonMissionMilestones: [...claimed, completedTiers],
        })

        return rw
      },

      claimAllSeasonMissions: () => {
        const s = get()
        let claimedCount = 0
        let ticketsGained = 0
        let gemsGained = 0
        let shardsGained = 0
        let keysGained = 0
        let hashrateGained = 0

        const nextClaimedTiers: Record<string, number[]> = { ...(s.claimedSeasonMissionTiers ?? {}) }
        const nextClaimedMilestones: number[] = [...(s.claimedSeasonMissionMilestones ?? [])]
        const nextFrags = { ...(s.heroFragments ?? {}) }
        const nextOwnedHeroes = { ...(s.ownedHeroes ?? { rookie_satoshi: 1 }) }
        let nextTitles = [...(s.unlockedTitles ?? ['Rookie Trader'])]
        let nextPlayerTitle = s.playerTitle ?? 'Rookie Trader'

        for (const mission of SEASON_MISSIONS) {
          const curProg = get().getSeasonMissionProgress(mission.id)
          const claimedList = [...(nextClaimedTiers[mission.id] ?? [])]
          for (const tier of mission.tiers) {
            if (curProg >= tier.target && !claimedList.includes(tier.tierNumber)) {
              claimedList.push(tier.tierNumber)
              claimedCount++
              ticketsGained += tier.reward.galaTickets ?? 0
              gemsGained += tier.reward.gems ?? 0
              shardsGained += tier.reward.fortunaShards ?? 0
              keysGained += tier.reward.quantumKeys ?? 0
              hashrateGained += tier.reward.hashrate ?? 0
              if (tier.reward.title) {
                nextTitles.push(tier.reward.title)
                nextPlayerTitle = tier.reward.title
              }
            }
          }
          nextClaimedTiers[mission.id] = claimedList
        }

        // Count total claimed tiers after claiming eligible mission tiers
        const totalClaimed = Object.values(nextClaimedTiers).reduce(
          (sum, list) => sum + list.length,
          0,
        )

        for (const ms of SEASON_MISSION_MILESTONES) {
          if (totalClaimed >= ms.completedTiers && !nextClaimedMilestones.includes(ms.completedTiers)) {
            nextClaimedMilestones.push(ms.completedTiers)
            claimedCount++
            ticketsGained += ms.reward.galaTickets ?? 0
            gemsGained += ms.reward.gems ?? 0
            shardsGained += ms.reward.fortunaShards ?? 0
            keysGained += ms.reward.quantumKeys ?? 0
            hashrateGained += ms.reward.hashrate ?? 0
            if (ms.reward.title) {
              nextTitles.push(ms.reward.title)
              nextPlayerTitle = ms.reward.title
            }
          }
        }

        if (claimedCount > 0) {
          if (shardsGained > 0) {
            nextFrags.lady_fortuna = (nextFrags.lady_fortuna ?? 0) + shardsGained
            if (nextFrags.lady_fortuna >= 50 && (nextOwnedHeroes.lady_fortuna ?? 0) === 0) {
              nextOwnedHeroes.lady_fortuna = 1
            }
          }

          set({
            galaTickets: (s.galaTickets ?? 0) + ticketsGained,
            gems: s.gems + gemsGained,
            hashrate: s.hashrate + hashrateGained,
            quantumKeys: s.quantumKeys + keysGained,
            heroFragments: nextFrags,
            ownedHeroes: nextOwnedHeroes,
            unlockedTitles: Array.from(new Set(nextTitles)),
            playerTitle: nextPlayerTitle,
            claimedSeasonMissionTiers: nextClaimedTiers,
            claimedSeasonMissionMilestones: nextClaimedMilestones,
          })
        }

        return { claimedCount, ticketsGained, gemsGained, shardsGained }
      },

      toggleBearMarketMode: (enable) =>
        set((s) => ({
          isBearMarketMode: enable !== undefined ? enable : !s.isBearMarketMode,
        })),

      equipPet: (petId) => {
        const s = get()
        if (petId === null) {
          set({ equippedPetId: null })
          return true
        }
        if (!s.ownedPets[petId]?.unlocked) return false
        set({ equippedPetId: petId })
        return true
      },

      unlockPet: (petId) => {
        const s = get()
        if (s.ownedPets[petId]?.unlocked) return true
        set((state) => ({
          ownedPets: {
            ...state.ownedPets,
            [petId]: {
              level: state.ownedPets[petId]?.level ?? 1,
              unlocked: true,
            },
          },
          equippedPetId: state.equippedPetId ?? petId,
        }))
        return true
      },

      levelUpPet: (petId) => {
        const s = get()
        const petData = s.ownedPets[petId]
        if (!petData?.unlocked) return false
        const curLevel = petData.level
        if (curLevel >= PET_MAP[petId].maxLevel) return false

        const cost = petLevelUpCost(curLevel)
        if (s.hashrate < cost.hashrate || s.petTreats < cost.treats) return false

        set((state) => ({
          hashrate: state.hashrate - cost.hashrate,
          petTreats: state.petTreats - cost.treats,
          ownedPets: {
            ...state.ownedPets,
            [petId]: {
              ...petData,
              level: curLevel + 1,
            },
          },
        }))
        return true
      },

      addPetTreats: (amount) =>
        set((s) => ({ petTreats: (s.petTreats ?? 0) + amount })),

      addDarkWebRelicDust: (amount) =>
        set((s) => ({ darkWebRelicDust: (s.darkWebRelicDust ?? 0) + amount })),

      submitDailyOraclePrediction: (won) => {
        const s = get()
        const todayStr = new Date().toISOString().slice(0, 10)
        const nextStreak = won ? (s.oracleStreak ?? 0) + 1 : 0
        const gemsAwarded = won ? 50 : 10

        set((state) => ({
          oracleStreak: nextStreak,
          lastOraclePuzzleDate: todayStr,
          gems: state.gems + gemsAwarded,
        }))
        return { gems: gemsAwarded, streak: nextStreak }
      },

      getOraclePatrolSpeedBonus: () => {
        const streak = get().oracleStreak ?? 0
        // +5% Idle Patrol speed per streak day, max +35% (7 day streak)
        return Math.min(35, streak * 5)
      },

      // Phase 2 Expansion: Asynchronous Hostile Takeover PvP Arena
      savePvpDefensiveSnapshot: () => {
        const s = get()
        const activeCoins = selectActiveLoadout(s).filter((c): c is OwnedCoin => c !== null)
        const snapshot = {
          heroId: s.equippedHeroId ?? 'rookie_satoshi',
          skinId: s.equippedSkins?.[s.equippedHeroId ?? 'rookie_satoshi'] ?? `${s.equippedHeroId}_default`,
          coins: activeCoins.map((c, i) => ({
            coinId: c.coinId,
            rarity: c.rarity,
            level: c.level,
            capacityPct: [40, 30, 20, 10][i] ?? 25,
          })),
          relics: [...s.equippedRelicIds],
        }
        set({ pvpDefensiveSnapshot: snapshot })
        return true
      },

      spendPvpTicket: () => {
        const s = get()
        if ((s.pvpTickets ?? 0) <= 0) return false
        set({ pvpTickets: s.pvpTickets - 1 })
        return true
      },

      recordPvpMatchResult: (won, deltaRating = 25) => {
        const s = get()
        const curRating = s.pvpRating ?? 1200
        const nextRating = Math.max(0, won ? curRating + deltaRating : curRating - Math.round(deltaRating * 0.6))
        const gemsWon = won ? 40 : 10
        set((state) => ({
          pvpRating: nextRating,
          gems: state.gems + gemsWon,
        }))
        return { rating: nextRating, gemsWon }
      },

      syncPvpDailyTickets: () => {
        const today = new Date().toISOString().slice(0, 10)
        const s = get()
        if (s.lastPvpDailyResetDate !== today) {
          set({
            pvpTickets: 5,
            lastPvpDailyResetDate: today,
          })
        }
      },

      // Phase 2 Expansion: Silicon Overclocking
      salvageAlgoRelic: (relicId) => {
        const s = get()
        // Unequip if equipped
        const nextEquipped = s.equippedRelicIds.filter((id) => id !== relicId)
        const dustGained = SILICON_DUST_SALVAGE_VALUE
        set((state) => ({
          equippedRelicIds: nextEquipped,
          siliconDust: (state.siliconDust ?? 0) + dustGained,
        }))
        return dustGained
      },

      rerollAlgoOverclock: (relicId) => {
        const s = get()
        if ((s.siliconDust ?? 0) < SILICON_OVERCLOCK_REROLL_COST) return null
        const rolled = rollSiliconOverclockSockets()
        set((state) => ({
          siliconDust: (state.siliconDust ?? 0) - SILICON_OVERCLOCK_REROLL_COST,
          algoOverclocks: {
            ...state.algoOverclocks,
            [relicId]: rolled,
          },
        }))
        return rolled
      },

      // Phase 2 Expansion: Hero Roster Bonds
      getActiveHeroBonds: () => {
        const s = get()
        const active: HeroBondConfig[] = []
        for (const bond of HERO_BONDS) {
          const satisfiesAll = bond.requirements.every((req) => {
            const stars = s.heroStars?.[req.heroId] ?? 0
            const owned = (s.ownedHeroes?.[req.heroId] ?? 0) > 0
            return owned && stars >= req.minStars
          })
          if (satisfiesAll) {
            active.push(bond)
          }
        }
        return active
      },

      hasHeroBondActive: (bondId) => {
        return get().getActiveHeroBonds().some((b) => b.id === bondId)
      },

      // Phase 2 Expansion: Server World Boss
      recordWorldBossDamage: (dmg) => {
        const s = get()
        const newTotal = (s.worldBossPersonalDamage ?? 0) + dmg
        // Percentile rank simulation based on DPS score
        const rankPct = newTotal > 5_000_000 ? 1 : newTotal > 2_000_000 ? 10 : newTotal > 500_000 ? 50 : 100
        const tierReward = rankPct === 1
          ? { keys: 5, frags: 25, gems: 1500 }
          : rankPct === 10
          ? { keys: 3, frags: 15, gems: 800 }
          : rankPct === 50
          ? { keys: 1, frags: 8, gems: 400 }
          : { keys: 0, frags: 3, gems: 150 }

        set((state) => ({
          worldBossPersonalDamage: newTotal,
          worldBossAttemptsLeft: Math.max(0, (state.worldBossAttemptsLeft ?? 2) - 1),
          quantumKeys: state.quantumKeys + tierReward.keys,
          gems: state.gems + tierReward.gems,
        }))

        return {
          rankPct,
          keysWon: tierReward.keys,
          skinFragmentsWon: tierReward.frags,
          gemsWon: tierReward.gems,
        }
      },

      syncWorldBossDaily: () => {
        const today = new Date().toISOString().slice(0, 10)
        const s = get()
        if (s.lastWorldBossDate !== today) {
          set({
            worldBossAttemptsLeft: 2,
            lastWorldBossDate: today,
          })
        }
      },

      // Phase 2 Expansion: Syndicate Turf Wars
      deployTurfInfluence: (districtId, points = 250) => {
        const s = get()
        if ((s.syndicateInfluencePoints ?? 0) < points) return false
        set((state) => ({
          syndicateInfluencePoints: (state.syndicateInfluencePoints ?? 0) - points,
          claimedTurfDistricts: Array.from(new Set([...(state.claimedTurfDistricts ?? []), districtId])),
        }))
        return true
      },

      setTargetTurfDistrict: (districtId) => {
        set({ targetTurfDistrictId: districtId })
      },

      getControlledTurfPassives: () => {
        const s = get()
        return s.claimedTurfDistricts ?? ['wall_street']
      },

      // Phase 3 Monetization & LiveOps Implementation
      recordBossLoss: (stageId: number) => {
        const s = get()
        const currentLosses = (s.consecutiveBossLosses?.[stageId] ?? 0) + 1
        const nextLosses = { ...(s.consecutiveBossLosses ?? {}), [stageId]: currentLosses }

        // Check if player has a hero with 40..49 shards
        let targetHeroId: string | undefined
        for (const [hId, count] of Object.entries(s.heroFragments ?? {})) {
          if (count >= 40 && count < 50) {
            targetHeroId = hId
            break
          }
        }

        if (targetHeroId) {
          set({
            consecutiveBossLosses: nextLosses,
            wallBreakerOfferType: 'finish_contract',
            wallBreakerHeroId: targetHeroId,
            wallBreakerOfferExpiresAt: Date.now() + 60 * 60 * 1000,
          })
          return { triggeredOffer: true, type: 'finish_contract' }
        }

        if (currentLosses >= 2) {
          set({
            consecutiveBossLosses: nextLosses,
            wallBreakerOfferType: 'stat_surge',
            wallBreakerHeroId: null,
            wallBreakerOfferExpiresAt: Date.now() + 60 * 60 * 1000,
          })
          return { triggeredOffer: true, type: 'stat_surge' }
        }

        set({ consecutiveBossLosses: nextLosses })
        return { triggeredOffer: false }
      },

      triggerWallBreakerOffer: (type, heroId) => {
        set({
          wallBreakerOfferType: type,
          wallBreakerHeroId: heroId ?? null,
          wallBreakerOfferExpiresAt: Date.now() + 60 * 60 * 1000,
        })
      },

      dismissWallBreakerOffer: () => {
        set({
          wallBreakerOfferType: null,
          wallBreakerHeroId: null,
          wallBreakerOfferExpiresAt: null,
        })
      },

      purchaseWallBreakerOffer: (type, heroId) => {
        const s = get()
        if (type === 'stat_surge') {
          // Find lowest Margin HP furniture
          const furn = { ...s.furnitureLevels }
          const furnitureKeys: FurnitureId[] = [
            'trading_desk',
            'campfire_bar',
            'cooling_rack',
            'backup_generator',
            'security_firewall',
            'satellite_dish',
          ]
          const lowestKey = furnitureKeys.reduce((prev, curr) =>
            (furn[curr] ?? 1) < (furn[prev] ?? 1) ? curr : prev,
          )
          furn[lowestKey] = (furn[lowestKey] ?? 1) + 1

          set((state) => ({
            furnitureLevels: furn,
            furnitureBlueprints: (state.furnitureBlueprints ?? 0) + 15,
            hashrate: state.hashrate + 5000,
            gems: state.gems + 300,
            hasBossReviveToken: true,
            wallBreakerOfferType: null,
            wallBreakerHeroId: null,
            wallBreakerOfferExpiresAt: null,
          }))
          return true
        } else {
          // Finish the Contract: give 10 hero fragments and 500 gems
          const hId = (heroId ?? 'rookie_satoshi') as HeroId
          const curFrags = s.heroFragments[hId] ?? 0
          set((state) => ({
            heroFragments: { ...state.heroFragments, [hId]: curFrags + 10 },
            gems: state.gems + 500,
            wallBreakerOfferType: null,
            wallBreakerHeroId: null,
            wallBreakerOfferExpiresAt: null,
          }))
          return true
        }
      },

      broadcastWhaleDividend: (buyerName, bundleName) => {
        const crate = {
          id: `div_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          buyerName,
          bundleName,
          gems: 25,
          hashrate: 200,
          claimedByPlayer: false,
          salutesCount: 0,
          timestamp: Date.now(),
        }
        set((state) => ({
          whaleDividendCrates: [crate, ...(state.whaleDividendCrates ?? [])].slice(0, 10),
        }))
      },

      claimWhaleDividend: (crateId) => {
        const s = get()
        const crates = s.whaleDividendCrates ?? []
        const target = crates.find((c) => c.id === crateId)
        if (!target || target.claimedByPlayer) return null

        const updated = crates.map((c) => (c.id === crateId ? { ...c, claimedByPlayer: true } : c))
        set((state) => ({
          whaleDividendCrates: updated,
          gems: state.gems + target.gems,
          hashrate: state.hashrate + target.hashrate,
        }))
        return { gems: target.gems, hashrate: target.hashrate }
      },

      saluteWhaleBuyer: (crateId) => {
        const s = get()
        const crates = s.whaleDividendCrates ?? []
        const updated = crates.map((c) =>
          c.id === crateId ? { ...c, salutesCount: c.salutesCount + 1 } : c,
        )
        set({ whaleDividendCrates: updated })
      },

      buyMiningRigSubscription: (rigId) => {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000
        const now = Date.now()
        const today = new Date().toISOString().slice(0, 10)

        if (rigId === 'silver_rig') {
          set((state) => ({
            gems: state.gems + 500,
            miningRigSubscriptions: {
              ...(state.miningRigSubscriptions ?? {}),
              silver_rig: {
                active: true,
                expiresAt: now + thirtyDays,
                lastDailyClaimDate: today,
              },
            },
          }))
          get().broadcastWhaleDividend(get().playerName, 'Silver Cloud Rig ($4.99)')
          return true
        } else {
          set((state) => ({
            gems: state.gems + 1200,
            missionTickets: {
              ...state.missionTickets,
              whale_liquidity_heist: (state.missionTickets.whale_liquidity_heist ?? 3) + 1,
            },
            miningRigSubscriptions: {
              ...(state.miningRigSubscriptions ?? {}),
              quantum_asic: {
                active: true,
                expiresAt: now + thirtyDays,
                lastDailyClaimDate: today,
              },
            },
          }))
          get().broadcastWhaleDividend(get().playerName, 'Quantum ASIC Rig ($9.99)')
          return true
        }
      },

      claimMiningRigDaily: (rigId) => {
        const s = get()
        const sub = s.miningRigSubscriptions?.[rigId]
        if (!sub || !sub.active || Date.now() > sub.expiresAt) return null
        const today = new Date().toISOString().slice(0, 10)
        if (sub.lastDailyClaimDate === today) return null

        const dailyGems = rigId === 'silver_rig' ? 100 : 250
        set((state) => ({
          gems: state.gems + dailyGems,
          miningRigSubscriptions: {
            ...(state.miningRigSubscriptions ?? {}),
            [rigId]: {
              ...sub,
              lastDailyClaimDate: today,
            },
          },
        }))
        return dailyGems
      },

      isDualMiningRigActive: () => {
        const s = get()
        const now = Date.now()
        const silver = s.miningRigSubscriptions?.silver_rig
        const quantum = s.miningRigSubscriptions?.quantum_asic
        return Boolean(silver?.active && silver.expiresAt > now && quantum?.active && quantum.expiresAt > now)
      },

      addCompoundVaultRebate: (spentEnergy) => {
        // 10% rebate from all spent energy
        const rebateGems = Math.max(1, Math.round(spentEnergy * 0.1 * 10))
        set((state) => ({
          compoundVaultGems: (state.compoundVaultGems ?? 0) + rebateGems,
        }))
      },

      smashCompoundVault: () => {
        const s = get()
        const currentTier = s.compoundVaultTier ?? 1
        const cap = currentTier === 1 ? 1000 : currentTier === 2 ? 3200 : 6500
        const curGems = s.compoundVaultGems ?? 0
        if (curGems < cap) return null

        const bonusKeys = currentTier === 3 ? 5 : 0
        const nextTier: 1 | 2 | 3 = currentTier === 1 ? 2 : currentTier === 2 ? 3 : 3

        set((state) => ({
          gems: state.gems + cap,
          quantumKeys: state.quantumKeys + bonusKeys,
          compoundVaultGems: Math.max(0, curGems - cap),
          compoundVaultTier: nextTier,
        }))

        get().broadcastWhaleDividend(
          get().playerName,
          currentTier === 1 ? 'Piggy Bank ($0.99)' : currentTier === 2 ? 'Golden Bull Safe ($2.99)' : 'Quantum Vault ($4.99)',
        )

        return { gems: cap, bonusKeys, nextTier }
      },

      purchaseOtcDeal: (tierId, selections) => {
        for (const item of selections) {
          if (item.type === 'coin_shards') {
            const curShards = get().coinShards[item.id] ?? 0
            set((state) => ({
              coinShards: { ...state.coinShards, [item.id]: curShards + item.amount },
            }))
          } else if (item.type === 'hero_shards') {
            const hId = item.id as HeroId
            const cur = get().heroFragments[hId] ?? 0
            set((state) => ({
              heroFragments: { ...state.heroFragments, [hId]: cur + item.amount },
            }))
          } else if (item.type === 'blueprints') {
            set((state) => ({
              furnitureBlueprints: (state.furnitureBlueprints ?? 0) + item.amount,
            }))
          } else if (item.type === 'manuals') {
            set((state) => ({
              skillManuals: (state.skillManuals ?? 0) + item.amount,
            }))
          } else if (item.type === 'gems') {
            set((state) => ({ gems: state.gems + item.amount }))
          } else if (item.type === 'hashrate') {
            set((state) => ({ hashrate: state.hashrate + item.amount }))
          }
        }

        const tierName =
          tierId === 'otc_tier_199'
            ? 'Starter OTC ($1.99)'
            : tierId === 'otc_tier_499'
              ? 'Trader OTC ($4.99)'
              : 'Executive OTC ($14.99)'

        get().broadcastWhaleDividend(get().playerName, `Custom OTC Deal: ${tierName}`)
        return true
      },

      // Phase 2 Expansion: Crisis Dungeons, Guild Heist & Ghost Races
      syncCrisisDailyAttempts: () => {
        const today = new Date().toISOString().slice(0, 10)
        if (get().lastCrisisResetDate !== today) {
          set({
            crisisDungeonAttempts: { gas_gauntlet: 0, cold_storage: 0, memecoin_casino: 0 },
            lastCrisisResetDate: today,
          })
        }
      },

      recordCrisisAttempt: (dungeonId) => {
        get().syncCrisisDailyAttempts()
        const s = get()
        const attempts = s.crisisDungeonAttempts[dungeonId] ?? 0
        set({
          crisisDungeonAttempts: {
            ...s.crisisDungeonAttempts,
            [dungeonId]: attempts + 1,
          },
        })
        return true
      },

      claimCrisisReward: (_dungeonId, reward) => {
        set((s) => ({
          furnitureBlueprints: (s.furnitureBlueprints ?? 0) + (reward.blueprints ?? 0),
          solderWire: (s.solderWire ?? 0) + (reward.solderWire ?? 0),
          hashrate: s.hashrate + (reward.hashrate ?? 0),
          gems: s.gems + (reward.gems ?? 0),
          quantumKeys: s.quantumKeys + (reward.quantumKeys ?? 0),
          silverKeys: s.silverKeys + (reward.silverKeys ?? 0),
          rigInventory: reward.rigItem ? [...s.rigInventory, reward.rigItem] : s.rigInventory,
        }))
      },

      syncSyndicateHeistDaily: () => {
        const today = new Date().toISOString().slice(0, 10)
        if (get().lastSyndicateHeistDate !== today) {
          set({
            syndicateHeistAttemptsLeft: 2,
            lastSyndicateHeistDate: today,
          })
        }
      },

      recordSyndicateHeistDamage: (damage) => {
        get().syncSyndicateHeistDaily()
        const s = get()
        const newBossHp = Math.max(0, s.syndicateHeistBossHp - damage)
        const personalTotal = s.syndicateHeistPersonalDamage + damage
        const playerName = s.playerName || 'Player (You)'

        const list = [...s.syndicateHeistLeaderboard]
        const playerIdx = list.findIndex((m) => m.isPlayer || m.id === 'player_you')
        if (playerIdx >= 0) {
          list[playerIdx].damage = personalTotal
        } else {
          list.push({
            id: 'player_you',
            name: `${playerName} (You)`,
            avatar: s.equippedHeroId,
            damage: personalTotal,
            rank: 99,
            isPlayer: true,
          })
        }
        list.sort((a, b) => b.damage - a.damage)
        list.forEach((item, idx) => {
          item.rank = idx + 1
        })

        set({
          syndicateHeistBossHp: newBossHp,
          syndicateHeistPersonalDamage: personalTotal,
          syndicateHeistLeaderboard: list,
          syndicateHeistAttemptsLeft: Math.max(0, s.syndicateHeistAttemptsLeft - 1),
        })

        return { newBossHp, personalTotal }
      },

      claimSyndicateHeistMilestone: (milestoneHp) => {
        const s = get()
        if (s.syndicateHeistClaimedMilestones.includes(milestoneHp)) return false
        if (s.syndicateHeistBossHp > milestoneHp) return false

        let bonusGems = 200
        let bonusSolder = 50
        if (milestoneHp <= 200000000) {
          bonusGems = 500
          bonusSolder = 100
        }
        if (milestoneHp === 0) {
          bonusGems = 1000
          bonusSolder = 250
        }

        set({
          gems: s.gems + bonusGems,
          solderWire: (s.solderWire ?? 0) + bonusSolder,
          syndicateHeistClaimedMilestones: [...s.syndicateHeistClaimedMilestones, milestoneHp],
        })
        return true
      },

      syncRaceTicketsDaily: () => {
        const today = new Date().toISOString().slice(0, 10)
        if (get().lastRaceTicketResetDate !== today) {
          set({
            raceTickets: 3,
            lastRaceTicketResetDate: today,
          })
        }
      },

      spendRaceTicket: () => {
        get().syncRaceTicketsDaily()
        const s = get()
        if (s.raceTickets <= 0) return false
        set({ raceTickets: s.raceTickets - 1 })
        return true
      },

      recordRunTelemetry: (snapshot) => {
        const s = get()
        if (!s.ghostRunTelemetry || snapshot.clearTimeSeconds < s.ghostRunTelemetry.clearTimeSeconds) {
          set({ ghostRunTelemetry: snapshot })
        }
      },

      recordRaceResult: (won, deltaTrophies, hashrateStolen, clearTimeSeconds) => {
        const s = get()
        const newTrophies = won ? s.raceTrophies + deltaTrophies : Math.max(500, s.raceTrophies - 10)
        const totalHashrate = s.hashrate + (won ? hashrateStolen : 0)

        if (won && s.ghostRunTelemetry && clearTimeSeconds < s.ghostRunTelemetry.clearTimeSeconds) {
          set({
            ghostRunTelemetry: {
              ...s.ghostRunTelemetry,
              clearTimeSeconds,
              date: Date.now(),
            },
          })
        }

        set({
          raceTrophies: newTrophies,
          hashrate: totalHashrate,
          unclaimedHashrateStolen: s.unclaimedHashrateStolen + (won ? hashrateStolen : 0),
        })

        return { newTrophies, totalHashrate }
      },
    }),
    {
      name: 'crypto_rogue_meta_v1',
      version: 11,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown) => {
        const prev = (persistedState as Partial<MetaData>) ?? {}
        const highestCleared = prev.highestStageCleared ?? 0
        const init = createInitialState()
        return {
          ...init,
          ...prev,
          unlockedRelicSlots:
            prev.unlockedRelicSlots ?? getUnlockedRelicSlotsForClearedStage(highestCleared),
          energy: prev.energy ?? MAX_ENERGY,
          lastEnergyRechargeTimestamp: prev.lastEnergyRechargeTimestamp ?? Date.now(),
          lastEnergyAdDate: prev.lastEnergyAdDate ?? '',
          currentLocationId: prev.currentLocationId ?? 'outskirts_tent',
          unlockedLocationIds: prev.unlockedLocationIds ?? ['outskirts_tent'],
          furnitureLevels: { ...DEFAULT_FURNITURE_LEVELS, ...(prev.furnitureLevels ?? {}) },
          furnitureBlueprints: prev.furnitureBlueprints ?? 2,
          missionTickets: { ...DEFAULT_MISSION_TICKETS, ...(prev.missionTickets ?? {}) },
          missionHighestTier: { ...DEFAULT_MISSION_TIERS, ...(prev.missionHighestTier ?? {}) },
          lastMissionResetDate: prev.lastMissionResetDate ?? new Date().toISOString().slice(0, 10),
          ownedHeroes: prev.ownedHeroes ?? { rookie_satoshi: 1 },
          equippedHeroId: prev.equippedHeroId ?? 'rookie_satoshi',
          heroFragments: { ...init.heroFragments, ...(prev.heroFragments ?? {}) },
          heroStars: { rookie_satoshi: 1, ...(prev.heroStars ?? {}) },
          heroSkillLevels: {
            rookie_satoshi: { passiveLv: 1, activeLv: 1 },
            ...(prev.heroSkillLevels ?? {}),
          },
          equippedHeroSkills: {
            ...init.equippedHeroSkills,
            ...(prev.equippedHeroSkills ?? {}),
          },
          heroSkillMastery: {
            ...init.heroSkillMastery,
            ...(prev.heroSkillMastery ?? {}),
          },
          claimedStageChestMilestones: prev.claimedStageChestMilestones ?? [],
          playerName: prev.playerName ?? 'Rookie Trader',
          playerAvatarId: prev.playerAvatarId ?? 'rookie_satoshi',
          hasBoughtStarterPack:
            prev.hasBoughtStarterPack ??
            (prev.purchasedBundleIds ?? []).includes('first_ico_starter'),
          lastVipStipendDate: prev.lastVipStipendDate ?? '',
          lastHeroCampClaimTimestamp: prev.lastHeroCampClaimTimestamp ?? 0,
          careerStats: {
            totalRunsPlayed: prev.careerStats?.totalRunsPlayed ?? 0,
            biggestGreenCandle: prev.careerStats?.biggestGreenCandle ?? 0,
            totalCoinsForged: prev.careerStats?.totalCoinsForged ?? 0,
          },
          authAccount: prev.authAccount ?? init.authAccount,
          selectedServer: prev.selectedServer ?? init.selectedServer,
          // Veteran saves (from before the FTUE existed) skip the tutorial entirely.
          tutorialStep:
            prev.tutorialStep ??
            (highestCleared > 0 || (prev.careerStats?.totalRunsPlayed ?? 0) > 0
              ? 'completed'
              : init.tutorialStep),
          devUnlockAllUi: prev.devUnlockAllUi ?? false,

          expeditions: prev.expeditions ?? [],
          codexDiscovered: { ...init.codexDiscovered, ...(prev.codexDiscovered ?? {}) },
          codexClaimed: prev.codexClaimed ?? {},
          syndicateLentItem: prev.syndicateLentItem ?? null,
          borrowedMercenary: prev.borrowedMercenary ?? null,
          lastMercenaryBorrowDate: prev.lastMercenaryBorrowDate ?? '',
          highestTowerFloorCleared: prev.highestTowerFloorCleared ?? 0,
          towerAttemptsLeft: prev.towerAttemptsLeft ?? 3,
          lastTowerResetDate: prev.lastTowerResetDate ?? new Date().toISOString().slice(0, 10),

          seasonPassXp: prev.seasonPassXp ?? 0,
          seasonPassType: prev.seasonPassType ?? 'none',
          seasonPassClaimedFree: prev.seasonPassClaimedFree ?? [],
          seasonPassClaimedTrader: prev.seasonPassClaimedTrader ?? [],
          seasonPassClaimedWhale: prev.seasonPassClaimedWhale ?? [],
          hasGoldenBullStatue: prev.hasGoldenBullStatue ?? false,

          dailyExchangePurchases: prev.dailyExchangePurchases ?? { blueprints: 0, manuals: 0, galaTickets: 0 },
          lastDailyExchangeDate: prev.lastDailyExchangeDate ?? '',
          skillManuals: prev.skillManuals ?? 5,
          spinTokens: prev.spinTokens ?? 1,
          totalMemeSpins: prev.totalMemeSpins ?? 0,
          lastWheelFreeSpinDate: prev.lastWheelFreeSpinDate ?? '',
          claimedWheelMilestones: prev.claimedWheelMilestones ?? [],

          relayChainStep: prev.relayChainStep ?? 0,

          unlockedChartSkins: prev.unlockedChartSkins ?? ['default', 'retro_8bit'],
          equippedChartSkin: prev.equippedChartSkin ?? 'default',

          ownedSkins: prev.ownedSkins ?? DEFAULT_OWNED_SKINS,
          equippedSkins: prev.equippedSkins ?? DEFAULT_EQUIPPED_SKINS,
          galaTickets: prev.galaTickets ?? 5,
          galaChips: prev.galaChips ?? 10,
          seasonWheelPulls: prev.seasonWheelPulls ?? 0,
          claimedGalaMilestones: prev.claimedGalaMilestones ?? [],
          clearedFortunaTrials: prev.clearedFortunaTrials ?? [],
          plinkoDrops: prev.plinkoDrops ?? 0,
          seasonMissionProgress: prev.seasonMissionProgress ?? {},
          claimedSeasonMissionTiers: prev.claimedSeasonMissionTiers ?? {},
          claimedSeasonMissionMilestones: prev.claimedSeasonMissionMilestones ?? [],
          unlockedTitles: prev.unlockedTitles ?? ['Rookie Trader'],
          playerTitle: prev.playerTitle ?? 'Rookie Trader',

          equippedRig: {
            ...init.equippedRig,
            ...(prev.equippedRig ?? {}),
          },
          rigInventory: prev.rigInventory ?? init.rigInventory,
          solderWire: prev.solderWire ?? init.solderWire,
          audioEnabled: prev.audioEnabled ?? true,
          hapticsEnabled: prev.hapticsEnabled ?? true,
          notificationsEnabled: prev.notificationsEnabled ?? false,
          lastEnergyNotifiedTimestamp: prev.lastEnergyNotifiedTimestamp ?? 0,
          lastPatrolNotifiedTimestamp: prev.lastPatrolNotifiedTimestamp ?? 0,
          lastDailyResetNoticeDate: prev.lastDailyResetNoticeDate ?? '',
          crisisDungeonAttempts: prev.crisisDungeonAttempts ?? init.crisisDungeonAttempts,
          lastCrisisResetDate: prev.lastCrisisResetDate ?? init.lastCrisisResetDate,
          syndicateHeistBossHp: prev.syndicateHeistBossHp ?? init.syndicateHeistBossHp,
          syndicateHeistMaxHp: prev.syndicateHeistMaxHp ?? init.syndicateHeistMaxHp,
          syndicateHeistAttemptsLeft: prev.syndicateHeistAttemptsLeft ?? init.syndicateHeistAttemptsLeft,
          lastSyndicateHeistDate: prev.lastSyndicateHeistDate ?? init.lastSyndicateHeistDate,
          syndicateHeistPersonalDamage: prev.syndicateHeistPersonalDamage ?? 0,
          syndicateHeistLeaderboard: prev.syndicateHeistLeaderboard ?? init.syndicateHeistLeaderboard,
          syndicateHeistClaimedMilestones: prev.syndicateHeistClaimedMilestones ?? [],
          raceTickets: prev.raceTickets ?? init.raceTickets,
          lastRaceTicketResetDate: prev.lastRaceTicketResetDate ?? init.lastRaceTicketResetDate,
          raceTrophies: prev.raceTrophies ?? init.raceTrophies,
          unclaimedHashrateStolen: prev.unclaimedHashrateStolen ?? 0,
          ghostRunTelemetry: prev.ghostRunTelemetry ?? init.ghostRunTelemetry,
          topGhostRacers: prev.topGhostRacers ?? init.topGhostRacers,
        }
      },
      partialize: (s): MetaData => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
          pullGacha, levelUpCoin, fuseCoins, fuseAllAvailable, claimIdleMining, completeRunPayout,
          syncEnergy, spendEnergy, rechargeEnergyWithAd, rechargeEnergyWithGems,
          selectLocation, unlockLocation, upgradeFurniture, claimCampHeroTip,
          syncDailyMissions, buyMissionTicket, completeMissionRaid,
          purchaseBundle, claimGrowthFundMilestone, crackPiggyBank, incrementDailyMetric,
          claimDailyQuest, claimDailyMilestone, claimCarnivalDay,
          setActiveGrowthWeek, addGrowthEventPoints, triggerMarginCallOffer, dismissMarginCallOffer,
          equipCoin, unequipCoin, equipRelic, unequipRelic,
          equipHero, unlockHero, unlockHeroWithFragments, ascendHeroStar, upgradeHeroSkill,
          levelUpHero, claimStageChestMilestone, getTotalPowerScore,
          equipRigItem, unequipRigItem, salvageRigItem, reforgeRigItemAffix, upgradeRigItem,
          getEquippedRigStats, getActiveSetBonuses, setAudioEnabled, setHapticsEnabled, setNotificationsEnabled,
          setPlayerProfile, claimDailyVipStipend, recordBiggestGreenCandle,
          setAuthAccount, setSelectedServer, setTutorialStep, toggleDevUnlockAllUi, bindGuestAccount,
          addGrowthPoints, setVip, getGlobalYield,
          resetProgress,
          startExpedition, claimExpedition, speedUpExpedition,
          discoverCodexEntry, claimCodexReward, claimAllCodexRewards,
          postSyndicateMercenary, reclaimSyndicateMercenary, claimSyndicateLendingHashrate,
          borrowSyndicateMercenary, consumeBorrowedMercenary,
          syncTowerDailyReset, completeTowerFloor, failTowerFloor, resetTowerAttemptsCheat,
          addSeasonPassXp, buySeasonPass, claimSeasonPassTier, claimAllSeasonPass,
          spinMemeWheel, buySpinTokens, claimWheelMilestone,
          claimRelayStep,
          setChartSkin, unlockChartSkin,
          unlockSkin, addSkinCopies, equipHeroSkin, ascendHeroSkin, getSkinStatBonus,
          spinFortunaWheel, buyGalaTicketsWithGems, claimGalaMilestone, claimAllGalaMilestones,
          completeFortunaTrial, dropPlinkoChip, addGalaTickets, addGalaChips,
          incrementSeasonMissionProgress, setSeasonMissionProgress,
          claimSeasonMissionTier, claimSeasonMissionMilestone, claimAllSeasonMissions,
          getSeasonMissionProgress, spendGems,
          ...data
        } = s
        return data
      },
    },
  ),
)

/** Owned coin stacks currently in active (unlocked) wallet slots, by slot index. */
export const selectActiveLoadout = (s: MetaState): (OwnedCoin | null)[] => {
  const slots = s.devUnlockAllUi
    ? 4
    : Math.max(s.unlockedSlots, s.highestStageCleared >= 6 ? 4 : s.highestStageCleared >= 3 ? 3 : s.highestStageCleared >= 1 ? 2 : 1)
  return s.equippedCoinIds.slice(0, slots).map((id) => s.ownedCoins.find((c) => c.id === id) ?? null)
}
