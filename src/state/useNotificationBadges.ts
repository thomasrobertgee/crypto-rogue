import { useMetaStore } from './useMetaStore'
import {
  DAILY_QUESTS,
  DAILY_TRACK_MILESTONES,
  GACHA_BANNERS,
  IDLE_RIG_CAP_HOURS,
  VIP_EXTRA_RIG_CAP_HOURS,
} from '../config/economy.config'
import { HEROES, HERO_FRAGMENTS_REQUIRED, MAX_HERO_STARS } from '../config/heroes.config'
import { getUnlockedRelicSlotsForClearedStage } from '../config/stages.config'
import { computeIdleReward } from '../engine/economy'
import { calculateSeasonTier } from '../config/seasonPass.config'
import { HERO_SKINS_BY_HERO, getSkinAscensionCost, MAX_SKIN_STARS } from '../config/heroSkins.config'
import { GALA_100_PULL_MILESTONES } from '../config/goldenGala.config'
import { SEASON_MISSIONS, SEASON_MISSION_MILESTONES } from '../config/seasonMissions.config'
import { FURNITURE_AMENITIES, getFurnitureUpgradeCost } from '../config/base.config'
import type { RigSlot } from '../config/equipment.config'

export interface NotificationBadgeState {
  // Bottom Nav Tabs
  exchangeTab: boolean
  portfolioTab: boolean
  baseHqTab: boolean
  foundryTab: boolean
  heroesTab: boolean
  missionsTab: boolean
  eventsTab: boolean

  // Base HQ 4 Sub-Tabs
  heroesSubTab: boolean
  coinsSubTab: boolean
  algosSubTab: boolean
  baseSubTab: boolean
  rigPetsSubTab: boolean

  // Home Screen Peripheral & Bottom Icons
  vipStipendReady: boolean
  starterIcon: boolean
  vipIcon: boolean
  questsIcon: boolean
  carnivalIcon: boolean
  idlePatrolIcon: boolean
  patrolChest: boolean
  stageChestIcon: boolean
  stageChest: boolean
  heroSquadIcon: boolean
  piggyBankIcon: boolean

  // Phase 2 Meta Expansion Badges
  expeditionsReady: boolean
  codexUnclaimedCount: number
  codexReady: boolean
  mercenaryReady: boolean
  towerReady: boolean

  // Phase 3 Commercial & LiveOps Badges
  seasonPassReady: boolean
  memeWheelReady: boolean
  relayChainReady: boolean
  goldenGalaReady: boolean
  seasonMissionsReady: boolean
  heroSkinsReady: Record<string, boolean>
}

/**
 * Reactive hook that computes red `[!]` notification badges strictly for
 * actionable free claims (free chests, free raid tickets, unclaimed stage/quest rewards,
 * VIP daily stipend) or ready 3/3 coin fusions (`count >= 3`) / 50/50 Hero Fragment unlocks/ascensions.
 */
export function useNotificationBadges(nowMs: number = Date.now()): NotificationBadgeState {
  const silverKeys = useMetaStore((s) => s.silverKeys)
  const quantumKeys = useMetaStore((s) => s.quantumKeys)
  const ownedCoins = useMetaStore((s) => s.ownedCoins)
  const ownedRelics = useMetaStore((s) => s.ownedRelics)
  const equippedRelicIds = useMetaStore((s) => s.equippedRelicIds)
  const lastFreePullTimestamps = useMetaStore((s) => s.lastFreePullTimestamps)
  const lastIdleClaimTimestamp = useMetaStore((s) => s.lastIdleClaimTimestamp)
  const isVipAdFree = useMetaStore((s) => s.isVipAdFree)
  const lastVipStipendDate = useMetaStore((s) => s.lastVipStipendDate)
  const ownedHeroes = useMetaStore((s) => s.ownedHeroes) ?? { rookie_satoshi: 1 }
  const heroFragments = useMetaStore((s) => s.heroFragments) ?? {}
  const heroStars = useMetaStore((s) => s.heroStars) ?? { rookie_satoshi: 1 }
  const highestStageCleared = useMetaStore((s) => s.highestStageCleared)
  const currentStage = useMetaStore((s) => s.currentStage)
  const dailyMetrics = useMetaStore((s) => s.dailyMetrics)
  const claimedDailyQuestIds = useMetaStore((s) => s.claimedDailyQuestIds)
  const claimedDailyMilestones = useMetaStore((s) => s.claimedDailyMilestones)
  const claimedCarnivalDays = useMetaStore((s) => s.claimedCarnivalDays)
  const claimedStageChestMilestones = useMetaStore((s) => s.claimedStageChestMilestones) ?? []
  const piggyBankGems = useMetaStore((s) => s.piggyBankGems)
  const missionTickets = useMetaStore((s) => s.missionTickets)
  const unlockedRelicSlots = useMetaStore(
    (s) => s.unlockedRelicSlots ?? getUnlockedRelicSlotsForClearedStage(s.highestStageCleared),
  )
  const expeditions = useMetaStore((s) => s.expeditions) ?? []
  const codexDiscovered = useMetaStore((s) => s.codexDiscovered) ?? {}
  const codexClaimed = useMetaStore((s) => s.codexClaimed) ?? {}
  const towerAttemptsLeft = useMetaStore((s) => s.towerAttemptsLeft) ?? 3
  const lastMercenaryBorrowDate = useMetaStore((s) => s.lastMercenaryBorrowDate) ?? ''
  const syndicateLentItem = useMetaStore((s) => s.syndicateLentItem)

  const seasonPassXp = useMetaStore((s) => s.seasonPassXp) ?? 0
  const seasonPassType = useMetaStore((s) => s.seasonPassType) ?? 'none'
  const seasonPassClaimedFree = useMetaStore((s) => s.seasonPassClaimedFree) ?? []
  const seasonPassClaimedTrader = useMetaStore((s) => s.seasonPassClaimedTrader) ?? []
  const seasonPassClaimedWhale = useMetaStore((s) => s.seasonPassClaimedWhale) ?? []

  const spinTokens = useMetaStore((s) => s.spinTokens) ?? 0
  const lastWheelFreeSpinDate = useMetaStore((s) => s.lastWheelFreeSpinDate) ?? ''
  const relayChainStep = useMetaStore((s) => s.relayChainStep) ?? 0

  const galaTickets = useMetaStore((s) => s.galaTickets) ?? 0
  const galaChips = useMetaStore((s) => s.galaChips) ?? 0
  const seasonWheelPulls = useMetaStore((s) => s.seasonWheelPulls) ?? 0
  const claimedGalaMilestones = useMetaStore((s) => s.claimedGalaMilestones) ?? []
  const ownedSkins = useMetaStore((s) => s.ownedSkins) ?? {}

  const seasonMissionProgress = useMetaStore((s) => s.seasonMissionProgress) ?? {}
  const claimedSeasonMissionTiers = useMetaStore((s) => s.claimedSeasonMissionTiers) ?? {}
  const claimedSeasonMissionMilestones = useMetaStore((s) => s.claimedSeasonMissionMilestones) ?? []

  const hashrate = useMetaStore((s) => s.hashrate) ?? 0
  const furnitureBlueprints = useMetaStore((s) => s.furnitureBlueprints) ?? 0
  const furnitureLevels = useMetaStore((s) => s.furnitureLevels) ?? {}
  const equippedRig = useMetaStore((s) => s.equippedRig) ?? {}
  const rigInventory = useMetaStore((s) => s.rigInventory) ?? []
  const ownedPets = useMetaStore((s) => s.ownedPets) ?? {}
  const petTreats = useMetaStore((s) => s.petTreats) ?? 0
  const crisisDungeonAttempts = useMetaStore((s) => s.crisisDungeonAttempts) ?? {}
  const syndicateHeistAttemptsLeft = useMetaStore((s) => s.syndicateHeistAttemptsLeft) ?? 0

  const today = new Date(nowMs).toISOString().slice(0, 10)
  const vipStipendReady = isVipAdFree && lastVipStipendDate !== today

  // Phase 3 Badges
  const curSeasonTier = calculateSeasonTier(seasonPassXp)
  let seasonPassReady = false
  for (let t = 1; t <= curSeasonTier; t++) {
    if (!seasonPassClaimedFree.includes(t)) {
      seasonPassReady = true
      break
    }
    if ((seasonPassType === 'trader' || seasonPassType === 'whale') && !seasonPassClaimedTrader.includes(t)) {
      seasonPassReady = true
      break
    }
    if (seasonPassType === 'whale' && !seasonPassClaimedWhale.includes(t)) {
      seasonPassReady = true
      break
    }
  }

  const memeWheelReady = spinTokens > 0 || lastWheelFreeSpinDate !== today
  const relayChainReady = relayChainStep === 0 || relayChainStep === 1 || relayChainStep === 3

  const hasUnclaimedGalaMilestones = GALA_100_PULL_MILESTONES.some(
    (m) => seasonWheelPulls >= m.pulls && !claimedGalaMilestones.includes(m.pulls),
  )

  const hasClaimableMissionTier = SEASON_MISSIONS.some((m) => {
    let prog = seasonMissionProgress[m.id] ?? 0
    if (m.id === 'seasonHeroUnlocked') {
      prog = (ownedHeroes['lady_fortuna'] ?? 0) > 0 ? 1 : (seasonMissionProgress['seasonHeroUnlocked'] ?? 0)
    } else if (m.id === 'seasonHeroStar') {
      prog = heroStars['lady_fortuna'] ?? ((ownedHeroes['lady_fortuna'] ?? 0) > 0 ? 1 : 0)
    }
    const claimedList = claimedSeasonMissionTiers[m.id] ?? []
    return m.tiers.some((t) => prog >= t.target && !claimedList.includes(t.tierNumber))
  })

  const totalClaimedTiers = Object.values(claimedSeasonMissionTiers).reduce(
    (sum, list) => sum + list.length,
    0,
  )
  const hasClaimableMissionMilestone = SEASON_MISSION_MILESTONES.some(
    (ms) => totalClaimedTiers >= ms.completedTiers && !claimedSeasonMissionMilestones.includes(ms.completedTiers),
  )

  const seasonMissionsReady = hasClaimableMissionTier || hasClaimableMissionMilestone
  const goldenGalaReady =
    galaTickets > 0 ||
    galaChips > 0 ||
    seasonPassReady ||
    hasUnclaimedGalaMilestones ||
    seasonMissionsReady

  const heroSkinsReady: Record<string, boolean> = {}
  for (const h of HEROES) {
    const skins = HERO_SKINS_BY_HERO[h.id] ?? []
    heroSkinsReady[h.id] = skins.some((sk) => {
      const owned = ownedSkins[sk.id]
      if (!owned || !owned.unlocked || owned.stars >= MAX_SKIN_STARS) return false
      return owned.copies >= getSkinAscensionCost(owned.stars)
    })
  }

  // 1. Exchange Tab: player has >= 1 Silver/Quantum Key or a Free Daily Pull is ready, or Flash Relay Step is free!
  const angelBanner = GACHA_BANNERS.find((b) => b.id === 'angel_seed')
  const lastFree = lastFreePullTimestamps?.angel_seed ?? 0
  const freeCooldownSec = (angelBanner?.freePullCooldownHours ?? 24) * 3600
  const freePullReady = (nowMs - lastFree) / 1000 >= freeCooldownSec
  const exchangeTab = silverKeys >= 1 || quantumKeys >= 1 || freePullReady || relayChainReady

  // 2. Coins Sub-Tab & Base HQ Tab: strictly when a 3/3 stack is ready to fuse!
  const foundryTab = ownedCoins.some((c) => c.count >= 3 && c.rarity !== 'mythical')
  const coinsSubTab = foundryTab
  const portfolioTab = foundryTab

  // 3. Heroes Sub-Tab: strictly when a hero has >= 50 fragments ready to Unlock or Ascend Star, OR an expedition is finished!
  const heroFragReady = HEROES.some((h) => {
    const frags = heroFragments[h.id] ?? 0
    if (frags < HERO_FRAGMENTS_REQUIRED) return false
    const isOwned = (ownedHeroes[h.id] ?? 0) > 0
    if (!isOwned) return true
    const stars = heroStars[h.id] ?? 1
    return stars < MAX_HERO_STARS
  })

  // Phase 2 Badges
  const expeditionsReady = expeditions.some((e) => nowMs >= e.startTime + e.durationMs)
  const codexUnclaimedCount = Object.keys(codexDiscovered).filter(
    (id) => codexDiscovered[id] && !codexClaimed[id],
  ).length
  const codexReady = codexUnclaimedCount > 0
  const mercenaryReady = lastMercenaryBorrowDate !== today || (syndicateLentItem !== null && (syndicateLentItem.unclaimedHashrate > 0 || (nowMs - syndicateLentItem.postedAt) > 3600000))
  const towerReady = towerAttemptsLeft > 0

  const heroSquadIcon = heroFragReady || expeditionsReady
  const heroesSubTab = heroFragReady || expeditionsReady
  const heroesTab = heroFragReady || expeditionsReady

  // 4. Algos Sub-Tab: has unequipped relics while an unlocked equip slot is open
  const algosSubTab =
    ownedRelics.length > equippedRelicIds.length &&
    equippedRelicIds.length < unlockedRelicSlots

  // 5. Base Sub-Tab: Player has enough Blueprints to upgrade a Base Furniture item
  const baseUpgradeReady = FURNITURE_AMENITIES.some((item) => {
    const curLv = furnitureLevels[item.id] ?? 1
    if (curLv >= item.maxLevel) return false
    const bpCost = getFurnitureUpgradeCost(item.id, curLv)
    return furnitureBlueprints >= bpCost && hashrate >= 0
  })
  const baseSubTab = baseUpgradeReady

  // 5B. Rig/Pets Sub-Tab: Empty equipment slot with matching gear in inventory, OR a Pet can be leveled up
  const ALL_RIG_SLOTS: RigSlot[] = [
    'gpu',
    'cooling_fan',
    'power_supply',
    'motherboard',
    'ssd',
    'asic_processor',
  ]
  const rigSlotReady = ALL_RIG_SLOTS.some(
    (slot) => !equippedRig[slot] && rigInventory.some((item) => item.slot === slot),
  )
  const petUpgradeReady = Object.values(ownedPets).some((pet) => {
    if (!pet || !pet.unlocked || pet.level >= 20) return false
    const treatCost = Math.max(2, pet.level * 3)
    return petTreats >= treatCost
  })
  const rigPetsSubTab = rigSlotReady || petUpgradeReady

  // Bottom Nav Base HQ Tab: actionable upgrade in Base, Hero ascension, Rig/Pets slot/level, 3/3 fusion, expedition, or Codex bounty
  const baseHqTab =
    foundryTab ||
    heroFragReady ||
    baseUpgradeReady ||
    rigPetsSubTab ||
    expeditionsReady ||
    codexReady

  // 6. Missions / Raids Tab: free Daily Mission Tickets, Tower Attempts, Crisis Dungeon attempts, or unclaimed Gala Spin Tickets
  const totalTickets = Object.values(missionTickets ?? {}).reduce((a, b) => a + b, 0)
  const crisisAttemptsAvailable = Object.values(crisisDungeonAttempts).some((a) => (a ?? 0) > 0)
  const missionsTab =
    totalTickets > 0 || towerReady || crisisAttemptsAvailable || galaTickets > 0

  // 7. Quests Icon: any daily quest is completed and unclaimed, or milestone chest ready
  const anyQuestReady = DAILY_QUESTS.some(
    (q) => (dailyMetrics[q.metric] ?? 0) >= q.target && !claimedDailyQuestIds.includes(q.id),
  )
  const totalDailyPoints = DAILY_QUESTS.reduce(
    (sum, q) => (claimedDailyQuestIds.includes(q.id) ? sum + q.points : sum),
    0,
  )
  const anyMilestoneReady = DAILY_TRACK_MILESTONES.some(
    (m) => totalDailyPoints >= m.points && !claimedDailyMilestones.includes(m.points),
  )
  const questsIcon = anyQuestReady || anyMilestoneReady

  // 8. 7-Day Carnival Icon
  const carnivalReady = [1, 2, 3, 4, 5, 6, 7].some((day) => {
    if (claimedCarnivalDays.includes(day)) return false
    if (day === 1) return true
    if (day === 2) return ownedCoins.some((c) => c.level >= 2)
    if (day === 3) return highestStageCleared >= 1
    if (day === 4) return ownedCoins.length >= 3
    if (day === 5) return highestStageCleared >= 2
    if (day === 6)
      return ownedCoins.some(
        (c) => c.rarity === 'rare' || c.rarity === 'epic' || c.rarity === 'mythical',
      )
    if (day === 7) return highestStageCleared >= 3 || ownedCoins.some((c) => c.level >= 5)
    return false
  })
  const carnivalIcon = carnivalReady

  // 9. Social / Events Tab: free Crisis Dungeon / Syndicate Heist attempts or unclaimed Gala Spin Tickets
  const eventsTab = crisisAttemptsAvailable || syndicateHeistAttemptsLeft > 0 || galaTickets > 0

  // 10. Idle Patrol Icon: only when significant idle reward accrued (>= 1 hour)
  const capHours = IDLE_RIG_CAP_HOURS + (isVipAdFree ? VIP_EXTRA_RIG_CAP_HOURS : 0)
  const idleReward = computeIdleReward(
    lastIdleClaimTimestamp,
    nowMs,
    capHours,
    Math.max(1, currentStage),
  )
  const idlePatrolIcon = idleReward.seconds >= 3600

  // 11. Stage Chest Icon: only when a cleared stage chest is unclaimed
  const stageChestIcon =
    highestStageCleared >= 1 &&
    Array.from({ length: highestStageCleared }, (_, i) => i + 1).some(
      (st) => !claimedStageChestMilestones.includes(st),
    )

  // 12. Piggy Bank Icon
  const piggyBankIcon = piggyBankGems >= 200

  return {
    exchangeTab,
    portfolioTab,
    baseHqTab,
    foundryTab,
    heroesTab,
    missionsTab,
    eventsTab,
    heroesSubTab,
    coinsSubTab,
    algosSubTab,
    baseSubTab,
    rigPetsSubTab,
    vipStipendReady,
    starterIcon: false,
    vipIcon: false,
    questsIcon,
    carnivalIcon,
    idlePatrolIcon,
    patrolChest: idlePatrolIcon,
    stageChestIcon,
    stageChest: stageChestIcon,
    heroSquadIcon,
    piggyBankIcon,
    expeditionsReady,
    codexUnclaimedCount,
    codexReady,
    mercenaryReady,
    towerReady,
    seasonPassReady,
    memeWheelReady,
    relayChainReady,
    goldenGalaReady,
    seasonMissionsReady,
    heroSkinsReady,
  }
}
