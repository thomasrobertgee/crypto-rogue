import { create } from 'zustand'
import type { EffectSpec, StageNodeConfig } from '../types/game.types'
import { STAGES, NODES_PER_STAGE, getStageConfig } from '../config/stages.config'
import { GAS_FEE_RATE, GAS_SKIMMER_BONUS_CASH, GAS_SKIMMER_RELIC_ID } from '../config/economy.config'
import {
  RUN_SKILL_MAP,
  MAX_SKILL_STARS,
  getSkillTierEffect,
  MYTHIC_SKILL_EVOLUTION_MAP,
  DARK_POOL_CURSE_MAP,
} from '../config/runSkills.config'
import { BASE_LOCATION_MAP, FURNITURE_MAP, getFurnitureBonus } from '../config/base.config'
import { rollFloorWeathers, type MarketWeatherId } from '../config/weather.config'
import { useMetaStore, type RunPayoutResult } from './useMetaStore'

export type CombatSpeed = 1 | 2 | 4
export type AllocationMode = 'inject' | 'pull'
export type AllocationAmount = 0.1 | 0.25 | 0.5 | 'max'
export type NodeAdvanceResult = 'next' | 'stageComplete' | 'noRun'
export type RunPhase = 'BATTLE_ACTIVE' | 'BATTLE_VICTORY' | 'TRAVERSING' | 'ENCOUNTER_READY'

export const MAX_RUN_LEVEL = 999
export const DEFAULT_SLOT_BASE_CAPACITY: [number, number, number, number] = [40, 30, 20, 10]

export interface AggregatedRunSkillModifiers {
  greenMagnitudeBonus: number
  upChanceBonus: number
  tickSpeedHaste: number
  lossReduction: number
  battleStartShield: number
  bossSlowFraction: number
  interruptWindowBonus: number
  bossAttackReduction: number
  synergyBonusDamage: number
  shortCounterFraction: number
  greenCapacityGainBonus: number
  slot4StackMultiplier: number
  slot4MegaPumpCrit: number
  overLeverageCritBonus: number
  overLeverageCritRate: number
  overLeverageHealFraction: number
  dipAccumulatorGain: number
  permanentAllSlotFloorBonus: number
  permanentTop2SlotFloorBonus: number
  // Mythic Skill Evolution & Dark-Pool Curse runtime flags
  hasInfiniteShortSqueeze?: boolean
  hasFortKnoxVault?: boolean
  hasQuantumFrontRunner?: boolean
  hasHyperCompoundingSingularity?: boolean
  hasBloodBathEngine?: boolean
  hasZeroDayOverride?: boolean
  darkPoolFlatAtkBonusPct?: number
  darkPoolRedDrawdownPenaltyPct?: number
}

const round2 = (n: number) => Math.round(n * 100) / 100
const xpForLevel = (lvl: number) => 100 + (lvl - 1) * 30

interface RunData {
  isActive: boolean
  /** True during the 3-second Live Market Loading transition at the start of a run. */
  isEnteringMarket: boolean
  currentStageId: number
  /** 1..30 */
  currentNodeIndex: number
  marginHp: number
  maxMarginHp: number
  /** Base Seed Capital ($USD) used to scale capacity % into damage/cash. */
  baseSeedCapital: number
  /** Starting Base Capacity % for each of the 4 slots ([40, 30, 20, 10] + permanent floor buffs). */
  baseRunSlotCapacity: number[]
  /** Live In-Battle Capacity % for each of the 4 slots (uncapped, resets to baseRunSlotCapacity after each fight). */
  battleCoinCapacity: number[]
  unallocatedCash: number
  /** $USD inside each wallet slot (index = slot). */
  slotAllocations: number[]
  runRelics: string[]
  combatSpeed: CombatSpeed
  /** Whether the [ AUTO ] Hero Active Skill toggle is enabled (unlocked at Stage 5). */
  autoHeroSkill: boolean
  allocationMode: AllocationMode
  totalGasPaid: number
  bailoutUsed: boolean
  nextBattleEffects: EffectSpec[]

  /** In-Run XP & 3-Card Roguelite Skill Draft System (Lv.1 -> Lv.10). */
  runXp: number
  runXpToNext: number
  runLevel: number
  pendingSkillDrafts: number
  /** skillId -> star tier (1..6) */
  activeRunSkills: Record<string, number>
  /** Fused Mythic Skill Evolutions unlocked during this run */
  activeMythicEvolutions: string[]
  /** Active Dark-Pool OTC Curses accepted during traversal events */
  activeDarkPoolCurses: string[]

  /** Duo-Coin Merger Ultimate Evolutions (baseCoinId -> evolutionId) */
  evolvedCoins: Record<string, string>
  /** Dynamic Market Weather per floor (Floor 1: 1..10, Floor 2: 11..20, Floor 3: 21..30) */
  floorWeathers: Record<number, MarketWeatherId>
  /** Pre-Boss Fear & Greed 2x Leverage Contract selection by boss node index (10, 20, 30) */
  leverageContracts: Record<number, 'standard' | 'degen'>
  /** Phase 2: Active Borrowed Syndicate Guild Mercenary */
  activeMercenary: {
    id: string
    name: string
    type: 'hero' | 'coin'
    starLevel: number
    buffDescription: string
    ownerName: string
  } | null
  /** Major Systems Expansion */
  isBearMarket: boolean
  icoContract: {
    acquired: boolean
    nodeIndex: number
    costType: 'hp' | 'cash'
    status: 'pending' | 'listed' | 'rugged'
  } | null
  hasCursedTornadoMixer: boolean
  hasCursedDegenMargin: boolean
  runStartTime?: number
  totalDamageDealt?: number
  /** Live state machine phase of the current run */
  runPhase: RunPhase
  /** Upcoming encounter node config during traversal */
  upcomingNode: StageNodeConfig | null
}

interface RunActions {
  startRun: (stageId: number) => boolean
  finishMarketLoading: () => void
  resetBattleCapacityToFloor: () => void
  setBattleCoinCapacity: (capacities: number[]) => void
  toggleAutoHeroSkill: () => boolean
  setAllocationMode: (mode: AllocationMode) => void
  /** Applies the current mode (inject/pull) to a slot. */
  allocate: (slot: number, amount: AllocationAmount) => void
  injectCash: (slot: number, amount: AllocationAmount) => void
  pullCash: (slot: number, amount: AllocationAmount) => void
  rebalanceEqual: (isMidBattle: boolean) => void
  setCombatSpeed: (speed: CombatSpeed) => boolean
  setSlotCash: (slot: number, value: number) => void
  setAllSlotAllocations: (allocs: number[], unallocated?: number) => void
  addCash: (amount: number) => void
  damageMargin: (amount: number) => void
  healMargin: (amount: number) => void
  addRunRelic: (relicId: string) => void
  removeRunRelic: (relicId: string) => void
  addNextBattleEffect: (effect: EffectSpec) => void
  consumeNextBattleEffects: () => EffectSpec[]
  markBailoutUsed: () => void
  advanceNode: () => NodeAdvanceResult
  setRunPhase: (phase: RunPhase) => void
  startTraversal: (nextNode?: StageNodeConfig | null) => void
  completeTraversal: () => void
  endRun: (wonStage: boolean) => RunPayoutResult | null
  getActiveSlots: () => number[]
  getTotalPortfolio: () => number

  addRunXp: (amount: number) => boolean
  selectRunSkill: (skillId: string) => void
  selectMythicEvolution: (mythicId: string) => void
  acceptDarkPoolCurse: (curseId: string) => void
  getAggregatedSkillModifiers: () => AggregatedRunSkillModifiers
  evolveCoin: (evolutionId: string, baseCoinId: string) => void
  setLeverageContract: (nodeIndex: number, contract: 'standard' | 'degen') => void
  boostBaseSlotCapacities: (bonusPct: number) => void
  acquireIcoContract: (costType: 'hp' | 'cash') => boolean
  resolveIcoListing: (success: boolean) => void
  equipCursedRelic: (relicId: 'tornado_mixer' | '100x_degen_margin') => void
}

export type RunState = RunData & RunActions

const initialRun = (): RunData => ({
  isActive: false,
  isEnteringMarket: false,
  currentStageId: 1,
  currentNodeIndex: 1,
  marginHp: 100,
  maxMarginHp: 100,
  baseSeedCapital: 1000,
  baseRunSlotCapacity: [...DEFAULT_SLOT_BASE_CAPACITY],
  battleCoinCapacity: [...DEFAULT_SLOT_BASE_CAPACITY],
  unallocatedCash: 0,
  slotAllocations: [400, 300, 200, 100],
  runRelics: [],
  combatSpeed: 1,
  autoHeroSkill: false,
  allocationMode: 'inject',
  totalGasPaid: 0,
  bailoutUsed: false,
  nextBattleEffects: [],
  runXp: 0,
  runXpToNext: xpForLevel(1),
  runLevel: 1,
  pendingSkillDrafts: 0,
  activeRunSkills: {},
  activeMythicEvolutions: [],
  activeDarkPoolCurses: [],
  evolvedCoins: {},
  floorWeathers: { 1: 'retail_fomo', 2: 'volatility_storm', 3: 'dark_pool_fog' },
  leverageContracts: {},
  activeMercenary: null,
  isBearMarket: false,
  icoContract: null,
  hasCursedTornadoMixer: false,
  hasCursedDegenMargin: false,
  runStartTime: Date.now(),
  totalDamageDealt: 0,
  runPhase: 'ENCOUNTER_READY',
  upcomingNode: null,
})

/** Slot indices that are unlocked AND have a coin equipped. */
const activeSlots = (): number[] => {
  const m = useMetaStore.getState()
  return m.equippedCoinIds
    .map((id, i) => (i < m.unlockedSlots && id ? i : -1))
    .filter((i) => i >= 0)
}

export const useRunStore = create<RunState>()((set, get) => ({
  ...initialRun(),

  getActiveSlots: activeSlots,

  getTotalPortfolio: () => {
    const s = get()
    return round2(s.unallocatedCash + s.slotAllocations.reduce((a, b) => a + b, 0))
  },

  startRun: (stageId) => {
    const meta = useMetaStore.getState()
    const stage = getStageConfig(stageId)
    if (!stage || stageId > meta.currentStage) return false
    const loc = BASE_LOCATION_MAP[meta.currentLocationId ?? 'outskirts_tent'] ?? BASE_LOCATION_MAP.outskirts_tent
    const firewallLv = (meta.furnitureLevels ?? {})['security_firewall'] ?? 1
    const dishLv = (meta.furnitureLevels ?? {})['satellite_dish'] ?? 1
    const bonusHp = loc.startingHpBonus + getFurnitureBonus(FURNITURE_MAP.security_firewall, firewallLv)
    const bonusSeed = getFurnitureBonus(FURNITURE_MAP.satellite_dish, dishLv)
    const passiveMastery = meta.getHeroAggregatedPassiveMastery(meta.equippedHeroId)
    const rigStats = meta.getEquippedRigStats?.() ?? {
      flatAtk: 0,
      greenDamagePct: 0,
      tickSpeedPct: 0,
      flatHp: 0,
      marginHpPct: 0,
      overdriveCap: 0,
      startingCash: 0,
      shopRerollDiscountPct: 0,
      critChance: 0,
      critMultiplier: 1.5,
    }
    const hpMasteryMultiplier = 1 + ((passiveMastery.marginHpPct ?? 0) + (rigStats.marginHpPct ?? 0)) / 100
    const totalMaxHp = Math.round((stage.marginHp + bonusHp + (rigStats.flatHp ?? 0)) * hpMasteryMultiplier)
    const borrowed = meta.borrowedMercenary
    const mercenarySeedBonus = borrowed ? 1.25 : 1.0
    const seedCap = round2((meta.baseSeedCapital + bonusSeed + (rigStats.startingCash ?? 0)) * meta.getGlobalYield() * mercenarySeedBonus)
    const baseCaps = DEFAULT_SLOT_BASE_CAPACITY.map((cap) => cap + (rigStats.overdriveCap ?? 0))
    const initialAllocs = baseCaps.map((pct) => round2(seedCap * (pct / 100)))

    // Consume borrowed mercenary for this run
    if (borrowed) {
      meta.consumeBorrowedMercenary()
    }

    set({
      ...initialRun(),
      isActive: true,
      isEnteringMarket: true,
      currentStageId: stageId,
      marginHp: totalMaxHp,
      maxMarginHp: totalMaxHp,
      baseSeedCapital: seedCap,
      baseRunSlotCapacity: [...baseCaps],
      battleCoinCapacity: [...baseCaps],
      unallocatedCash: 0,
      slotAllocations: initialAllocs,
      runRelics: [...meta.equippedRelicIds],
      // Level 1 Starting 3-Card Upgrade Draft before Node 1 combat begins!
      pendingSkillDrafts: 1,
      autoHeroSkill:
        Boolean(
          meta.highestStageCleared >= 1 ||
          meta.currentStage >= 2 ||
          meta.isVipAdFree ||
          meta.seasonPassType === 'whale' ||
          meta.devUnlockAllUi,
        ) && get().autoHeroSkill,
      floorWeathers: rollFloorWeathers(),
      evolvedCoins: {},
      leverageContracts: {},
      activeMercenary: borrowed ? { ...borrowed } : null,
      isBearMarket: Boolean(meta.isBearMarketMode && meta.highestStageCleared >= 5),
      icoContract: null,
      hasCursedTornadoMixer: false,
      hasCursedDegenMargin: false,
      runStartTime: Date.now(),
      totalDamageDealt: 0,
      runPhase: 'ENCOUNTER_READY',
      upcomingNode: null,
    })
    return true
  },

  acquireIcoContract: (costType) => {
    const s = get()
    if (s.icoContract?.acquired) return false
    if (costType === 'hp') {
      const hpDeduct = Math.round(s.maxMarginHp * 0.2)
      if (s.marginHp <= hpDeduct) return false
      set({
        marginHp: Math.max(1, s.marginHp - hpDeduct),
        icoContract: {
          acquired: true,
          nodeIndex: s.currentNodeIndex,
          costType: 'hp',
          status: 'pending',
        },
      })
      return true
    } else {
      const totalCash = s.unallocatedCash + s.slotAllocations.reduce((a, b) => a + b, 0)
      if (totalCash < 300) return false
      // Deduct $300 cash proportionally
      let remaining = 300
      let nextUnallocated = s.unallocatedCash
      if (nextUnallocated >= remaining) {
        nextUnallocated -= remaining
        remaining = 0
      } else {
        remaining -= nextUnallocated
        nextUnallocated = 0
      }
      const nextAllocs = [...s.slotAllocations]
      for (let i = 0; i < nextAllocs.length && remaining > 0; i++) {
        const take = Math.min(nextAllocs[i], remaining)
        nextAllocs[i] -= take
        remaining -= take
      }
      set({
        unallocatedCash: nextUnallocated,
        slotAllocations: nextAllocs,
        icoContract: {
          acquired: true,
          nodeIndex: s.currentNodeIndex,
          costType: 'cash',
          status: 'pending',
        },
      })
      return true
    }
  },

  resolveIcoListing: (success) => {
    set((s) => {
      if (!s.icoContract) return s
      return {
        icoContract: {
          ...s.icoContract,
          status: success ? 'listed' : 'rugged',
        },
      }
    })
  },

  equipCursedRelic: (relicId) => {
    set((s) => {
      if (relicId === 'tornado_mixer') {
        return {
          hasCursedTornadoMixer: true,
          runRelics: Array.from(new Set([...s.runRelics, 'tornado_mixer'])),
        }
      } else if (relicId === '100x_degen_margin') {
        return {
          hasCursedDegenMargin: true,
          maxMarginHp: 1,
          marginHp: 1,
          runRelics: Array.from(new Set([...s.runRelics, '100x_degen_margin'])),
        }
      }
      return s
    })
  },

  finishMarketLoading: () => set({ isEnteringMarket: false }),

  resetBattleCapacityToFloor: () =>
    set((s) => {
      const floorCaps = [...s.baseRunSlotCapacity]
      const allocs = floorCaps.map((pct) => round2(s.baseSeedCapital * (pct / 100)))
      return {
        battleCoinCapacity: floorCaps,
        slotAllocations: allocs,
      }
    }),

  setBattleCoinCapacity: (capacities) =>
    set((s) => {
      const clamped = capacities.map((c) => Math.max(1, Math.round(c * 10) / 10))
      const allocs = clamped.map((pct) => round2(s.baseSeedCapital * (pct / 100)))
      return {
        battleCoinCapacity: clamped,
        slotAllocations: allocs,
      }
    }),

  toggleAutoHeroSkill: () => {
    const meta = useMetaStore.getState()
    const isUnlocked = Boolean(
      meta.devUnlockAllUi ||
      meta.highestStageCleared >= 1 ||
      meta.currentStage >= 2 ||
      meta.isVipAdFree ||
      meta.seasonPassType === 'whale',
    )
    if (!isUnlocked) return false
    set((s) => ({ autoHeroSkill: !s.autoHeroSkill }))
    return true
  },

  setAllocationMode: (mode) => set({ allocationMode: mode }),

  allocate: (slot, amount) => (get().allocationMode === 'inject' ? get().injectCash(slot, amount) : get().pullCash(slot, amount)),

  injectCash: (slot, amount) => {
    if (!activeSlots().includes(slot)) return
    const s = get()
    const delta = round2(amount === 'max' ? s.unallocatedCash : s.unallocatedCash * amount)
    if (delta <= 0) return
    const alloc = [...s.slotAllocations]
    alloc[slot] = round2(alloc[slot] + delta)
    set({ slotAllocations: alloc, unallocatedCash: round2(s.unallocatedCash - delta) })
  },

  pullCash: (slot, amount) => {
    const s = get()
    const current = s.slotAllocations[slot] ?? 0
    const delta = round2(amount === 'max' ? current : current * amount)
    if (delta <= 0) return
    const alloc = [...s.slotAllocations]
    alloc[slot] = round2(current - delta)
    set({ slotAllocations: alloc, unallocatedCash: round2(s.unallocatedCash + delta) })
  },

  rebalanceEqual: (isMidBattle) => {
    const slots = activeSlots()
    if (!slots.length) return
    const s = get()
    let pool = s.unallocatedCash + s.slotAllocations.reduce((a, b) => a + b, 0)
    let gas = 0
    if (isMidBattle) {
      if (s.runRelics.includes(GAS_SKIMMER_RELIC_ID)) pool += GAS_SKIMMER_BONUS_CASH
      else {
        gas = round2(pool * GAS_FEE_RATE)
        pool -= gas
      }
    }
    const share = Math.floor((pool / slots.length) * 100) / 100
    const alloc = [0, 0, 0, 0]
    slots.forEach((i) => (alloc[i] = share))
    set({
      slotAllocations: alloc,
      unallocatedCash: round2(pool - share * slots.length),
      totalGasPaid: round2(s.totalGasPaid + gas),
    })
    if (isMidBattle) {
      useMetaStore.getState().incrementDailyMetric('fuseOrRebalance', 1)
    }
  },

  setCombatSpeed: (speed) => {
    if (speed === 4 && !useMetaStore.getState().isVipAdFree) return false
    set({ combatSpeed: speed })
    return true
  },

  setSlotCash: (slot, value) =>
    set((s) => {
      const alloc = [...s.slotAllocations]
      alloc[slot] = round2(Math.max(0, value))
      return { slotAllocations: alloc }
    }),

  setAllSlotAllocations: (allocs, unallocated) =>
    set((s) => ({
      slotAllocations: allocs.map((v) => round2(Math.max(0, v))),
      unallocatedCash: unallocated !== undefined ? round2(Math.max(0, unallocated)) : s.unallocatedCash,
    })),

  addCash: (amount) =>
    set((s) => {
      const nextSeed = round2(Math.max(100, s.baseSeedCapital + amount))
      const allocs = s.battleCoinCapacity.map((pct) => round2(nextSeed * (pct / 100)))
      return {
        baseSeedCapital: nextSeed,
        slotAllocations: allocs,
        unallocatedCash: round2(Math.max(0, s.unallocatedCash + amount)),
      }
    }),

  damageMargin: (amount) => set((s) => ({ marginHp: Math.max(0, Math.round(s.marginHp - amount)) })),

  healMargin: (amount) => set((s) => ({ marginHp: Math.min(s.maxMarginHp, Math.round(s.marginHp + amount)) })),

  addRunRelic: (relicId) => set((s) => (s.runRelics.includes(relicId) ? s : { runRelics: [...s.runRelics, relicId] })),

  removeRunRelic: (relicId) => set((s) => ({ runRelics: s.runRelics.filter((r) => r !== relicId) })),

  addNextBattleEffect: (effect) => set((s) => ({ nextBattleEffects: [...s.nextBattleEffects, effect] })),

  consumeNextBattleEffects: () => {
    const effects = get().nextBattleEffects
    set({ nextBattleEffects: [] })
    return effects
  },

  markBailoutUsed: () => set({ bailoutUsed: true }),

  addRunXp: (amount) => {
    const s = get()
    let nextXp = s.runXp + amount
    let nextLevel = s.runLevel
    let nextDrafts = s.pendingSkillDrafts
    let req = s.runXpToNext
    let leveledUp = false

    while (nextXp >= req) {
      nextXp -= req
      nextLevel += 1
      nextDrafts += 1
      req = xpForLevel(nextLevel)
      leveledUp = true
    }

    set({
      runXp: nextXp,
      runLevel: nextLevel,
      runXpToNext: req,
      pendingSkillDrafts: nextDrafts,
    })
    return leveledUp
  },

  selectRunSkill: (skillId) => {
    const s = get()
    const cfg = RUN_SKILL_MAP[skillId]
    if (!cfg) return
    const curStars = s.activeRunSkills[skillId] ?? 0
    if (curStars >= MAX_SKILL_STARS) return
    const nextStars = curStars + 1
    const tierEffect = getSkillTierEffect(cfg, nextStars)

    let nextMaxHp = s.maxMarginHp
    let nextHp = s.marginHp
    if (tierEffect.instantMaxHpBonus) {
      // Grant incremental Max HP
      const prevMaxBonus = curStars > 0 ? getSkillTierEffect(cfg, curStars).instantMaxHpBonus ?? 0 : 0
      const deltaMax = Math.max(0, tierEffect.instantMaxHpBonus - prevMaxBonus)
      nextMaxHp += deltaMax
      nextHp += deltaMax
    }
    if (tierEffect.instantHealFraction) {
      nextHp = Math.min(nextMaxHp, Math.round(nextHp + nextMaxHp * tierEffect.instantHealFraction))
    }

    const nextActiveSkills = {
      ...s.activeRunSkills,
      [skillId]: nextStars,
    }

    // Recompute permanent in-run base slot capacities ([40, 30, 20, 10] + floor buffs)
    let allSlotBonus = 0
    let top2SlotBonus = 0
    for (const [skId, stars] of Object.entries(nextActiveSkills)) {
      const skCfg = RUN_SKILL_MAP[skId]
      if (!skCfg || stars < 1) continue
      const t = getSkillTierEffect(skCfg, stars)
      if (t.permanentAllSlotFloorBonus) allSlotBonus += t.permanentAllSlotFloorBonus
      if (t.permanentTop2SlotFloorBonus) top2SlotBonus += t.permanentTop2SlotFloorBonus
    }
    const nextBaseCaps = DEFAULT_SLOT_BASE_CAPACITY.map(
      (base, i) => base + allSlotBonus + (i < 2 ? top2SlotBonus : 0),
    )
    const nextBattleCaps = s.battleCoinCapacity.map((cur, i) => {
      const floorDelta = Math.max(0, nextBaseCaps[i] - (s.baseRunSlotCapacity[i] ?? DEFAULT_SLOT_BASE_CAPACITY[i]))
      return Math.max(nextBaseCaps[i], cur + floorDelta)
    })
    const nextAllocs = nextBattleCaps.map((pct) => round2(s.baseSeedCapital * (pct / 100)))

    set({
      activeRunSkills: nextActiveSkills,
      pendingSkillDrafts: Math.max(0, s.pendingSkillDrafts - 1),
      maxMarginHp: nextMaxHp,
      marginHp: nextHp,
      baseRunSlotCapacity: nextBaseCaps,
      battleCoinCapacity: nextBattleCaps,
      slotAllocations: nextAllocs,
    })
  },

  selectMythicEvolution: (mythicId) => {
    const s = get()
    const cfg = MYTHIC_SKILL_EVOLUTION_MAP[mythicId]
    if (!cfg || s.activeMythicEvolutions.includes(mythicId)) return
    const nextMythics = [...s.activeMythicEvolutions, mythicId]
    // Discover in Degen Codex
    useMetaStore.getState().discoverCodexEntry?.(mythicId)
    set({
      activeMythicEvolutions: nextMythics,
      pendingSkillDrafts: Math.max(0, s.pendingSkillDrafts - 1),
    })
  },

  acceptDarkPoolCurse: (curseId) => {
    const s = get()
    const curse = DARK_POOL_CURSE_MAP[curseId]
    if (!curse || s.activeDarkPoolCurses.includes(curseId)) return
    let nextMaxHp = s.maxMarginHp
    let nextHp = s.marginHp
    let nextSeed = s.baseSeedCapital
    let nextAllocs = [...s.slotAllocations]

    if (curse.marginHpCapRatio) {
      nextMaxHp = Math.max(10, Math.round(nextMaxHp * curse.marginHpCapRatio))
      nextHp = Math.min(nextHp, nextMaxHp)
    }
    if (curse.seedCapitalMultiplier && curse.seedCapitalMultiplier > 1) {
      nextSeed = round2(nextSeed * curse.seedCapitalMultiplier)
      nextAllocs = s.battleCoinCapacity.map((pct) => round2(nextSeed * (pct / 100)))
    }

    set({
      activeDarkPoolCurses: [...s.activeDarkPoolCurses, curseId],
      maxMarginHp: nextMaxHp,
      marginHp: nextHp,
      baseSeedCapital: nextSeed,
      slotAllocations: nextAllocs,
    })
  },

  getAggregatedSkillModifiers: () => {
    const s = get()
    const mods: AggregatedRunSkillModifiers = {
      greenMagnitudeBonus: 0,
      upChanceBonus: 0,
      tickSpeedHaste: 0,
      lossReduction: 0,
      battleStartShield: 0,
      bossSlowFraction: 0,
      interruptWindowBonus: 0,
      bossAttackReduction: 0,
      synergyBonusDamage: 0,
      shortCounterFraction: 0,
      greenCapacityGainBonus: 0,
      slot4StackMultiplier: 1,
      slot4MegaPumpCrit: 0,
      overLeverageCritBonus: 0,
      overLeverageCritRate: 0,
      overLeverageHealFraction: 0,
      dipAccumulatorGain: 0,
      permanentAllSlotFloorBonus: 0,
      permanentTop2SlotFloorBonus: 0,
      hasInfiniteShortSqueeze: false,
      hasFortKnoxVault: false,
      hasQuantumFrontRunner: false,
      hasHyperCompoundingSingularity: false,
      hasBloodBathEngine: false,
      hasZeroDayOverride: false,
      darkPoolFlatAtkBonusPct: 0,
      darkPoolRedDrawdownPenaltyPct: 0,
    }
    for (const [skillId, stars] of Object.entries(s.activeRunSkills)) {
      const cfg = RUN_SKILL_MAP[skillId]
      if (!cfg || stars < 1) continue
      const tier = getSkillTierEffect(cfg, stars)
      if (tier.greenMagnitudeBonus) mods.greenMagnitudeBonus += tier.greenMagnitudeBonus
      if (tier.upChanceBonus) mods.upChanceBonus += tier.upChanceBonus
      if (tier.tickSpeedHaste) mods.tickSpeedHaste += tier.tickSpeedHaste
      if (tier.lossReduction) mods.lossReduction = Math.min(0.8, mods.lossReduction + tier.lossReduction)
      if (tier.battleStartShield) mods.battleStartShield += tier.battleStartShield
      if (tier.bossSlowFraction) mods.bossSlowFraction = Math.min(0.65, mods.bossSlowFraction + tier.bossSlowFraction)
      if (tier.interruptWindowBonus) mods.interruptWindowBonus = Math.min(0.35, mods.interruptWindowBonus + tier.interruptWindowBonus)
      if (tier.bossAttackReduction) mods.bossAttackReduction = Math.min(0.65, mods.bossAttackReduction + tier.bossAttackReduction)
      if (tier.synergyBonusDamage) mods.synergyBonusDamage += tier.synergyBonusDamage
      if (tier.shortCounterFraction) mods.shortCounterFraction += tier.shortCounterFraction
      if (tier.greenCapacityGainBonus) mods.greenCapacityGainBonus += tier.greenCapacityGainBonus
      if (tier.slot4StackMultiplier) mods.slot4StackMultiplier = Math.max(mods.slot4StackMultiplier, tier.slot4StackMultiplier)
      if (tier.slot4MegaPumpCrit) mods.slot4MegaPumpCrit = Math.max(mods.slot4MegaPumpCrit, tier.slot4MegaPumpCrit)
      if (tier.overLeverageCritBonus) mods.overLeverageCritBonus += tier.overLeverageCritBonus
      if (tier.overLeverageCritRate) mods.overLeverageCritRate += tier.overLeverageCritRate
      if (tier.overLeverageHealFraction) mods.overLeverageHealFraction += tier.overLeverageHealFraction
      if (tier.dipAccumulatorGain) mods.dipAccumulatorGain += tier.dipAccumulatorGain
      if (tier.permanentAllSlotFloorBonus) mods.permanentAllSlotFloorBonus += tier.permanentAllSlotFloorBonus
      if (tier.permanentTop2SlotFloorBonus) mods.permanentTop2SlotFloorBonus += tier.permanentTop2SlotFloorBonus
    }

    // Apply Mythic Skill Evolutions
    for (const mythicId of s.activeMythicEvolutions ?? []) {
      if (mythicId === 'mythic_infinite_short_squeeze') {
        mods.hasInfiniteShortSqueeze = true
        mods.greenMagnitudeBonus += 0.25
      } else if (mythicId === 'mythic_fort_knox_sovereign_vault') {
        mods.hasFortKnoxVault = true
        mods.battleStartShield += 45
      } else if (mythicId === 'mythic_quantum_front_runner') {
        mods.hasQuantumFrontRunner = true
        mods.tickSpeedHaste += 0.25
      } else if (mythicId === 'mythic_hyper_compounding_singularity') {
        mods.hasHyperCompoundingSingularity = true
        mods.greenCapacityGainBonus += 20
        mods.overLeverageCritBonus += 1.0
      } else if (mythicId === 'mythic_blood_bath_liquidation_engine') {
        mods.hasBloodBathEngine = true
        mods.dipAccumulatorGain += 30
        mods.shortCounterFraction += 2.5
      } else if (mythicId === 'mythic_zero_day_consensus_override') {
        mods.hasZeroDayOverride = true
        mods.bossSlowFraction = Math.min(0.75, mods.bossSlowFraction + 0.45)
        mods.bossAttackReduction = Math.min(0.75, mods.bossAttackReduction + 0.40)
        mods.interruptWindowBonus = Math.min(0.60, mods.interruptWindowBonus + 0.35)
      }
    }

    // Apply Dark-Pool OTC Curses
    for (const curseId of s.activeDarkPoolCurses ?? []) {
      const curse = DARK_POOL_CURSE_MAP[curseId]
      if (!curse) continue
      if (curse.flatAtkBonusPct) {
        mods.darkPoolFlatAtkBonusPct = (mods.darkPoolFlatAtkBonusPct ?? 0) + curse.flatAtkBonusPct
        mods.greenMagnitudeBonus += curse.flatAtkBonusPct
      }
      if (curse.tickSpeedBonusPct) {
        mods.tickSpeedHaste += curse.tickSpeedBonusPct
      }
      if (curse.redDrawdownPenaltyPct) {
        mods.darkPoolRedDrawdownPenaltyPct = (mods.darkPoolRedDrawdownPenaltyPct ?? 0) + curse.redDrawdownPenaltyPct
      }
    }

    return mods
  },

  advanceNode: () => {
    const s = get()
    if (!s.isActive) return 'noRun'
    const stage = STAGES[s.currentStageId - 1]
    const maxNodes = stage ? stage.nodes.length : NODES_PER_STAGE
    if (s.currentNodeIndex >= maxNodes) return 'stageComplete'
    set({ currentNodeIndex: s.currentNodeIndex + 1, runPhase: 'ENCOUNTER_READY', upcomingNode: null })
    return 'next'
  },

  setRunPhase: (phase) => set({ runPhase: phase }),

  startTraversal: (nextNode) => {
    const s = get()
    const stage = STAGES[s.currentStageId - 1]
    const node = nextNode !== undefined ? nextNode : (stage ? stage.nodes[s.currentNodeIndex] : null)
    set({
      runPhase: 'TRAVERSING',
      upcomingNode: node ?? null,
    })
  },

  completeTraversal: () => {
    const s = get()
    const stage = STAGES[s.currentStageId - 1]
    const maxNodes = stage ? stage.nodes.length : NODES_PER_STAGE
    const nextIdx = s.currentNodeIndex + 1
    if (nextIdx > maxNodes) {
      set({
        runPhase: 'ENCOUNTER_READY',
        upcomingNode: null,
      })
    } else {
      set({
        runPhase: 'ENCOUNTER_READY',
        currentNodeIndex: nextIdx,
        upcomingNode: null,
      })
    }
  },

  evolveCoin: (evolutionId, baseCoinId) =>
    set((s) => ({
      evolvedCoins: { ...s.evolvedCoins, [baseCoinId]: evolutionId },
      pendingSkillDrafts: Math.max(0, s.pendingSkillDrafts - 1),
    })),

  setLeverageContract: (nodeIndex, contract) =>
    set((s) => ({
      leverageContracts: { ...s.leverageContracts, [nodeIndex]: contract },
    })),

  boostBaseSlotCapacities: (bonusPct) =>
    set((s) => {
      const nextBase = s.baseRunSlotCapacity.map((c) => c + bonusPct)
      const nextBattle = s.battleCoinCapacity.map((c) => c + bonusPct)
      const nextAllocs = nextBattle.map((pct) => round2(s.baseSeedCapital * (pct / 100)))
      return {
        baseRunSlotCapacity: nextBase,
        battleCoinCapacity: nextBattle,
        slotAllocations: nextAllocs,
      }
    }),

  endRun: (wonStage) => {
    const s = get()
    if (!s.isActive) return null
    const stage = STAGES[s.currentStageId - 1]
    const maxNodes = stage ? stage.nodes.length : NODES_PER_STAGE
    const nodesCleared = wonStage ? maxNodes : s.currentNodeIndex - 1
    const meta = useMetaStore.getState()
    const payout = meta.completeRunPayout(s.currentStageId, nodesCleared, wonStage)

    if (wonStage) {
      const clearDuration = Math.max(
        12,
        Math.round((Date.now() - (s.runStartTime ?? Date.now() - 30000)) / 1000),
      )
      meta.recordRunTelemetry({
        stageId: s.currentStageId,
        heroId: meta.equippedHeroId,
        heroStars: meta.heroStars?.[meta.equippedHeroId] ?? 1,
        coins: (meta.equippedCoinIds.filter(Boolean) as string[]),
        nodesCleared,
        clearTimeSeconds: clearDuration,
        totalDamage: Math.round(s.totalDamageDealt ?? 45000),
        date: Date.now(),
        playerName: meta.playerName,
      })
    }

    set(initialRun())
    return payout
  },
}))
