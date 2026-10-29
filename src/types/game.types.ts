/**
 * Core game type definitions. Pure types only — no runtime code.
 * See docs/ARCHITECTURE.md.
 */

// ───────────────────────── Primitives ─────────────────────────
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical'

export type CurrencyId = 'usd' | 'hashrate' | 'gems' | 'silverKey' | 'quantumKey'
export type UnlockFeature = 'gachaShop' | 'foundry' | 'growthEvents' | 'idleRig' | 'dailyQuests'

/** Combat event hooks used by coin passives and relics. */
export type TriggerType =
  | 'onGreen'      // a coin rolled Up
  | 'onRed'        // a coin rolled Down
  | 'onFlat'       // a coin rolled Flat
  | 'onRebalance'  // player paused & rebalanced
  | 'onLowHP'      // Margin HP dropped below threshold
  | 'onTick'       // every attack tick of the owner coin
  | 'onBattleStart'
  | 'onBattleEnd'
  | 'onAllyGreen'  // a DIFFERENT coin rolled Up

export type RollOutcome = 'up' | 'down' | 'flat'

/** One weighted entry in a coin's RNG table. `multiplier` is applied to allocated cash (+0.15 = +15%). */
export interface RngEntry {
  outcome: RollOutcome
  /** Weight in percent; all entries of a table should sum to 100. */
  chance: number
  multiplier: number
}

/** Data-driven effect descriptor interpreted by src/engine. */
export type EffectKind =
  | 'modifyUpChance'       // value: +percentage points
  | 'modifyUpMultiplier'   // value: additive multiplier
  | 'modifyDownMultiplier' // value: additive (negative reduces loss)
  | 'reduceLoss'           // value: fraction of loss prevented (0..1)
  | 'shortDamage'          // value: fraction of loss dealt to enemy
  | 'transferCashAdjacent' // value: fraction of own cash moved to neighbours
  | 'multiplyUpEveryN'     // value: factor, `everyN` ticks
  | 'healMargin'           // value: flat HP or fraction (see `isFraction`)
  | 'bonusDamage'          // value: fraction of profit as extra damage
  | 'tickSpeed'            // value: fraction (-0.2 = 20% faster)
  | 'refundGas'            // value: fraction of gas fee refunded
  | 'gainCash'             // value: flat $USD
  | 'preventDown'          // forbids Down outcome
  | 'retriggerRoll'        // re-roll and apply again
  | 'shieldMargin'         // value: flat shield HP

export interface EffectSpec {
  kind: EffectKind
  value: number
  isFraction?: boolean
  everyN?: number
  /** Optional duration in ticks; omitted = instant/permanent for battle. */
  durationTicks?: number
  target?: 'self' | 'allAllies' | 'adjacent' | 'enemy' | 'player'
}

export interface PassiveHook {
  id: string
  name: string
  description: string
  trigger: TriggerType
  /** Probability 0..1 that the hook fires when triggered (default 1). */
  procChance?: number
  effects: EffectSpec[]
}

// ───────────────────────── Coins ─────────────────────────
export interface CoinConfig {
  id: string
  name: string
  ticker: string
  rarity: Rarity
  /** S-Grade marker for top-tier coins. */
  grade: 'C' | 'B' | 'A' | 'S'
  flavor: string
  /** Seconds between attack ticks at 1x speed. */
  baseTickSpeed: number
  rngTable: RngEntry[]
  passives: PassiveHook[]
  /** Account Mastery: global yield granted per level, even when unequipped (0.02 = +2%). */
  globalMasteryBonusPerLevel: number
  maxLevel: number
  /** Theme color (hex) for UI gauges. */
  color: string
  icon: string // lucide-react icon name
}

/** A stack of identical coins (same coinId + rarity tier). Duplicates are tracked via `count` for Hard Fork Fusion. */
export interface OwnedCoin {
  /** Unique stack id (used by loadout `equippedCoinIds`). */
  id: string
  coinId: string
  /** Fusion tier; may exceed the coin's base rarity via Hard Fork Fusion. */
  rarity: Rarity
  level: number
  /** Number of copies in this stack (>= 1). */
  count: number
  acquiredAt: number
}

// ───────────────────────── Relics ─────────────────────────
export interface RelicConfig {
  id: string
  name: string
  rarity: Rarity
  description: string
  trigger: TriggerType
  procChance?: number
  /** For onLowHP: HP fraction threshold (0..1). */
  threshold?: number
  /** Max triggers per battle (undefined = unlimited). */
  maxTriggersPerBattle?: number
  effects: EffectSpec[]
  icon: string
  shopPrice: number
}

// ───────────────────────── Stages ─────────────────────────
export type NodeType = 'battle' | 'elite' | 'event' | 'shop' | 'boss'

export type BossHazardId =
  | 'whaleDump' | 'secFreeze' | 'rugPull' | 'flashCrash' | 'gasWar'
  | 'fudStorm' | 'bearTrap' | 'liquidationCascade' | 'stablecoinDepeg' | 'exchangeHalt'

export interface BossHazard {
  id: BossHazardId
  name: string
  description: string
  /** Seconds between activations. */
  interval: number
  effects: EffectSpec[]
}

export interface EnemyAffix {
  id: 'flash_crash' | 'orderbook_shield' | 'latency_jitter' | 'multi_affix' | string
  name: string
  description: string
}

export interface EnemyConfig {
  id: string
  name: string
  hp: number
  /** Flat damage dealt to Margin HP per enemy heavy dump attack. */
  attack: number
  /** Seconds between enemy heavy dump attacks (telegraphed charge bar, 5.0-6.0s). */
  attackCooldown: number
  hazard?: BossHazard
  portrait: string
  /** Flat damage dealt on red candle counter-attack. */
  counterAttackDmg?: number
  /** Boss-only Black Swan Ultimate flat damage component. */
  ultimateDmg?: number
  /** Seconds between Boss Black Swan Ultimate activations (default 14s). */
  ultimateCooldown?: number
  /** Whether this enemy is a floor or stage Boss. */
  isBoss?: boolean
  /** 20-Stage Market Cycle Affix Mutator. */
  affix?: EnemyAffix
  /** Initial green candle hits absorbed by Orderbook Shield (default 2). */
  orderbookShieldHits?: number
  /** Boss-only Iron Will status (Cycle III / Stage 41+): Shields Black Swan Ultimate with multi-segment armor */
  hasIronWill?: boolean
  /** Armor segment count for Iron Will (default 2) */
  ironWillArmor?: number
}

export interface StageNodeConfig {
  index: number // 0..5
  type: NodeType
  enemy?: EnemyConfig
  eventPool?: string[]
  cashReward: number
}

export interface StageConfig {
  stage: number
  name: string
  startingCash: number
  marginHp: number
  /** Wallet slots available while playing this stage. */
  walletSlots: 1 | 2 | 3 | 4
  nodes: StageNodeConfig[]
  clearRewards: {
    hashrate: number
    gems: number
    silverKeys?: number
    quantumKeys?: number
    unlockSlot?: 2 | 3 | 4
    unlockRelicSlot?: 2 | 3 | 4 | 5
    unlockFeatures?: UnlockFeature[]
    heroFragments?: number
    breakthroughCrate?: {
      heroFragments: number
      quantumKeys: number
      gems: number
    }
  }
  /** Only for stage 1. */
  starterLoadout?: string[]
  /** 20-Stage Market Cycle identifier (1 to 25). */
  cycle?: number
  /** Active Market Cycle formatted label (e.g. "Cycle III: Derivative Storm"). */
  cycleName?: string
  /** Market Cycle affix mutator applied to enemies. */
  affix?: EnemyAffix
  /** Whether clearing this stage grants a 20-stage Cycle Breakthrough Crate. */
  isCycleBreakthrough?: boolean
}

// ───────────────────────── Run Events ─────────────────────────
export type OutcomeEffect =
  | { type: 'cash'; amount: number; isFraction?: boolean }
  | { type: 'marginHp'; amount: number; isFraction?: boolean }
  | { type: 'gainRelic'; relicId?: string; rarity?: Rarity }
  | { type: 'loseRelic' }
  | { type: 'gainCoin'; coinId?: string; rarity?: Rarity }
  | { type: 'loseCoin' }
  | { type: 'upgradeCoin'; tiers: number }
  | { type: 'buffNextBattle'; effect: EffectSpec }
  | { type: 'debuffNextBattle'; effect: EffectSpec }
  | { type: 'gems'; amount: number }
  | { type: 'hashrate'; amount: number }
  | { type: 'nothing' }

export interface RunEventOutcome {
  /** Probability 0..1 among a choice's outcomes. */
  chance: number
  text: string
  effects: OutcomeEffect[]
}

export interface RunEventChoice {
  id: string
  label: string
  /** Optional cost gate. */
  cost?: { cash?: number; marginHp?: number }
  risk: 'safe' | 'risky' | 'degen'
  outcomes: RunEventOutcome[]
}

export interface RunEventConfig {
  id: string
  title: string
  description: string
  icon: string
  minStage: number
  choices: RunEventChoice[]
}

// ───────────────────────── Economy ─────────────────────────
export interface GachaPoolEntry {
  rarity: Rarity
  /** Percent weight. */
  weight: number
}

export interface PityRule {
  rarity: Rarity
  /** Guaranteed at or above this rarity within N pulls. */
  pulls: number
}

export interface GachaBannerConfig {
  id: string
  name: string
  description: string
  rewardType: 'coin' | 'relic'
  cost: { currency: CurrencyId; single: number; multi10: number }
  pool: GachaPoolEntry[]
  pity: PityRule[]
  /** Free pull cooldown in hours (undefined = none). */
  freePullCooldownHours?: number
  unlockFeature: UnlockFeature
}

export interface QuestReward {
  currency: CurrencyId
  amount: number
}

export interface DailyQuest {
  id: string
  description: string
  metric:
    | 'battlesWon' | 'runsStarted' | 'runsCompleted' | 'coinsLeveled' | 'gachaPulls'
    | 'fusions' | 'fuseOrRebalance' | 'rigClaims' | 'adsWatched' | 'bossesDefeated' | 'profitEarned'
  target: number
  /** Points toward the 100-pt daily track. */
  points: number
  reward: QuestReward[]
}

export interface ShopBundle {
  id: string
  name: string
  description: string
  priceUsd: number
  /** Store product id for IAP (iOS/Android). */
  productId: string
  oneTime: boolean
  contents: QuestReward[]
  perks?: Array<'adFree' | 'speed4x' | 'autoBattle' | 'extraRigCap'>
  bonusCoin?: { coinId: string; rarity: Rarity; count?: number }
  bonusHeroId?: string
  bonusHeroFragments?: number
  /** Growth Fund: rewards claimable per stage cleared. */
  stageMilestones?: Array<{ stage: number; reward: QuestReward[] }>
  badge?: string
}

export interface GrowthEventConfig {
  week: 1 | 2 | 3
  id: string
  name: string
  description: string
  metric: DailyQuest['metric']
  bracketSize: number
  durationDays: number
  rankRewards: Array<{ rankFrom: number; rankTo: number; reward: QuestReward[] }>
}
