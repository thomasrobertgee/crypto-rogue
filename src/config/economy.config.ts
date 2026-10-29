import type { DailyQuest, GachaBannerConfig, GrowthEventConfig, Rarity, ShopBundle } from '../types/game.types'

// ───────────────────────── Battle economy ─────────────────────────
export const GAS_FEE_RATE = 0.05
export const IDLE_RIG_CAP_HOURS = 12
export const IDLE_RIG_HASHRATE_PER_HOUR = 120
export const FUSION_REQUIRED_COPIES = 3
export const DAILY_QUEST_TRACK_MAX = 100

export const BASE_SEED_CAPITAL = 1000
export const GAS_SKIMMER_RELIC_ID = 'gas_fee_skimmer'
export const GAS_SKIMMER_BONUS_CASH = 150
export const VIP_EXTRA_RIG_CAP_HOURS = 4
/** 1 random Common coin shard per this many hours of idle mining. */
export const IDLE_SHARD_HOURS = 1
export const SHARDS_PER_COIN = 10
/** Direct damage multiplier gained per coin level above 1 (+10%). */
export const LEVEL_DAMAGE_BONUS = 0.1
export const MAX_EQUIPPED_RELICS = 5
/** Hashrate refunded for a duplicate relic from the Hardware Crate. */
export const DUPLICATE_RELIC_HASHRATE = 250
/** Piggy Bank gems per cleared node, and bonus on stage victory. */
export const PIGGY_GEMS_PER_NODE = 2
export const PIGGY_GEMS_STAGE_WIN = 10
/** Fraction of full clear Hashrate awarded on defeat, scaled by nodes cleared. */
export const DEFEAT_HASHRATE_FRACTION = 0.5

/** Hashrate cost to level a coin from `level` → `level+1`. */
export const levelUpCost = (level: number, rarity: Rarity): number => {
  const mult: Record<Rarity, number> = { common: 1, uncommon: 1.3, rare: 1.7, epic: 2.2, legendary: 3, mythical: 4 }
  const baseCost = 80 * level * mult[rarity]
  const escalatingMult = level > 15 ? Math.pow(1.35, level / 5) : 1.0
  return Math.round(baseCost * escalatingMult)
}

// ───────────────────────── Gacha ─────────────────────────
export const GACHA_BANNERS: GachaBannerConfig[] = [
  {
    id: 'faucet_box', name: 'Faucet Box', rewardType: 'coin', unlockFeature: 'gachaShop',
    description: 'Free drip of low-tier coins. One free pull every 4 hours.',
    cost: { currency: 'silverKey', single: 1, multi10: 9 },
    freePullCooldownHours: 4,
    pool: [
      { rarity: 'common', weight: 70 },
      { rarity: 'uncommon', weight: 25 },
      { rarity: 'rare', weight: 5 },
    ],
    pity: [{ rarity: 'rare', pulls: 20 }],
  },
  {
    id: 'vc_vault', name: 'Venture Capital Vault', rewardType: 'coin', unlockFeature: 'gachaShop',
    description: 'Premium coins. Guaranteed Epic+ every 10 pulls, Mythical every 50.',
    cost: { currency: 'gems', single: 300, multi10: 2700 },
    pool: [
      { rarity: 'uncommon', weight: 45 },
      { rarity: 'rare', weight: 35 },
      { rarity: 'epic', weight: 15 },
      { rarity: 'legendary', weight: 4 },
      { rarity: 'mythical', weight: 1 },
    ],
    pity: [
      { rarity: 'epic', pulls: 10 },
      { rarity: 'mythical', pulls: 50 },
    ],
  },
  {
    id: 'algo_hardware_crate', name: 'Algo Hardware Crate', rewardType: 'relic', unlockFeature: 'gachaShop',
    description: 'Permanent-collection Algo Relics that can appear in runs.',
    cost: { currency: 'gems', single: 150, multi10: 1350 },
    pool: [
      { rarity: 'common', weight: 40 },
      { rarity: 'uncommon', weight: 30 },
      { rarity: 'rare', weight: 18 },
      { rarity: 'epic', weight: 8 },
      { rarity: 'legendary', weight: 3 },
      { rarity: 'mythical', weight: 1 },
    ],
    pity: [{ rarity: 'epic', pulls: 15 }],
  },
]

// ───────────────────────── IAP ─────────────────────────
export const SHOP_BUNDLES: ShopBundle[] = [
  {
    id: 'first_ico_starter', name: 'First-ICO Starter Pack', priceUsd: 0.99,
    productId: 'com.cryptorogue.starter_099', oneTime: true, badge: 'BEST VALUE',
    description: 'Unlocks Legendary Hero Lady Fortuna + Epic ShibaMoon + 5 Silver Keys + 300 Gems + 2,000 Hashrate.',
    bonusCoin: { coinId: 'shibamoon', rarity: 'epic', count: 1 },
    bonusHeroId: 'lady_fortuna',
    bonusHeroFragments: 50,
    contents: [
      { currency: 'gems', amount: 300 },
      { currency: 'silverKey', amount: 5 },
      { currency: 'hashrate', amount: 2000 },
    ],
  },
  {
    id: 'vip_pass', name: 'VIP Ad-Free + 4x Speed Pass', priceUsd: 9.99,
    productId: 'com.cryptorogue.vip_999', oneTime: true, badge: 'VIP',
    description: 'Remove all ads forever, unlock 4x battle speed, Unlimited Auto-Sweep, and Daily VIP Stipend (+100 Gems & +1 Key/day).',
    perks: ['adFree', 'speed4x', 'extraRigCap'],
    bonusHeroFragments: 30,
    contents: [{ currency: 'gems', amount: 500 }],
  },
  {
    id: 'stage_growth_fund', name: 'Stage Growth Fund', priceUsd: 19.99,
    productId: 'com.cryptorogue.growthfund_1999', oneTime: true, badge: '10x VALUE',
    description: 'Claim escalating Satoshi Gems & Quantum Keys as you clear stages.',
    contents: [{ currency: 'gems', amount: 200 }],
    stageMilestones: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((stage) => ({
      stage,
      reward: [
        { currency: 'gems' as const, amount: 100 + stage * 25 },
        ...(stage % 4 === 0 ? [{ currency: 'quantumKey' as const, amount: 1 }] : []),
      ],
    })),
  },
  {
    id: 'whale_bailout_bundle', name: 'Whale Bailout Bundle', priceUsd: 4.99,
    productId: 'com.cryptorogue.whalebailout_499', oneTime: false, badge: '1200% VALUE!',
    description: 'Unlocks Mythical Hero Satoshi Nakamoto + 1,500 Gems, 10,000 Hashrate, 3 Quantum Keys, and 1 Epic MoneroGhost!',
    bonusCoin: { coinId: 'moneroghost', rarity: 'epic', count: 1 },
    bonusHeroId: 'satoshi_nakamoto',
    bonusHeroFragments: 50,
    contents: [
      { currency: 'gems', amount: 1500 },
      { currency: 'hashrate', amount: 10000 },
      { currency: 'quantumKey', amount: 3 },
      { currency: 'silverKey', amount: 5 },
    ],
  },
]

// ───────────────────────── Daily Quests (100-pt track, 5 tasks × 20 pts) ─────────────────────────
export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'dq_runs2',
    description: 'Complete 2 Runs',
    metric: 'runsCompleted',
    target: 2,
    points: 20,
    reward: [{ currency: 'hashrate', amount: 350 }],
  },
  {
    id: 'dq_chest1',
    description: 'Open 1 Chest',
    metric: 'gachaPulls',
    target: 1,
    points: 20,
    reward: [{ currency: 'silverKey', amount: 1 }],
  },
  {
    id: 'dq_level1',
    description: 'Level Up a Coin',
    metric: 'coinsLeveled',
    target: 1,
    points: 20,
    reward: [{ currency: 'gems', amount: 25 }],
  },
  {
    id: 'dq_rig1',
    description: 'Claim Idle Rig',
    metric: 'rigClaims',
    target: 1,
    points: 20,
    reward: [{ currency: 'hashrate', amount: 300 }],
  },
  {
    id: 'dq_fuse_rebal',
    description: 'Fuse or Rebalance in Battle',
    metric: 'fuseOrRebalance',
    target: 1,
    points: 20,
    reward: [{ currency: 'gems', amount: 25 }],
  },
]

export const DAILY_TRACK_MILESTONES = [
  { points: 20, reward: [{ currency: 'gems' as const, amount: 40 }, { currency: 'silverKey' as const, amount: 1 }] },
  { points: 40, reward: [{ currency: 'gems' as const, amount: 60 }, { currency: 'silverKey' as const, amount: 1 }] },
  { points: 60, reward: [{ currency: 'gems' as const, amount: 100 }, { currency: 'silverKey' as const, amount: 2 }] },
  { points: 80, reward: [{ currency: 'gems' as const, amount: 150 }, { currency: 'quantumKey' as const, amount: 1 }] },
  { points: 100, reward: [{ currency: 'gems' as const, amount: 250 }, { currency: 'quantumKey' as const, amount: 2 }] },
]

// ───────────────────────── 3-Week Growth Event Rotation ─────────────────────────
const standardRankRewards = () => [
  { rankFrom: 1, rankTo: 1, reward: [{ currency: 'quantumKey' as const, amount: 10 }, { currency: 'gems' as const, amount: 1500 }] },
  { rankFrom: 2, rankTo: 3, reward: [{ currency: 'quantumKey' as const, amount: 5 }, { currency: 'gems' as const, amount: 800 }] },
  { rankFrom: 4, rankTo: 10, reward: [{ currency: 'quantumKey' as const, amount: 2 }, { currency: 'gems' as const, amount: 400 }] },
  { rankFrom: 11, rankTo: 25, reward: [{ currency: 'silverKey' as const, amount: 3 }, { currency: 'gems' as const, amount: 200 }] },
  { rankFrom: 26, rankTo: 50, reward: [{ currency: 'silverKey' as const, amount: 1 }, { currency: 'gems' as const, amount: 75 }] },
]

export const GROWTH_EVENT_ROTATION: GrowthEventConfig[] = [
  {
    week: 1, id: 'ico_chest_frenzy', name: 'ICO Chest Frenzy', metric: 'gachaPulls',
    description: 'Earn +10 Event Points per Vault Chest opened. Top 3 win the End-of-Week Mythical Key Payout!',
    bracketSize: 50, durationDays: 7,
    rankRewards: standardRankRewards(),
  },
  {
    week: 2, id: 'asic_upgrade_week', name: 'ASIC Upgrade Week', metric: 'coinsLeveled',
    description: 'Earn +25 Event Points per Coin or Relic upgrade. Top 3 win the End-of-Week Mythical Key Payout!',
    bracketSize: 50, durationDays: 7,
    rankRewards: standardRankRewards(),
  },
  {
    week: 3, id: 'hard_fork_merger', name: 'Hard-Fork Merger Week', metric: 'fusions',
    description: 'Earn +50 Event Points per 3-to-1 Hard Fork fusion. Top 3 win the End-of-Week Mythical Key Payout!',
    bracketSize: 50, durationDays: 7,
    rankRewards: standardRankRewards(),
  },
]

/** Returns the active Growth Event for a given timestamp (rotation anchored to the Unix epoch week). */
export const getActiveGrowthEvent = (now: number = Date.now()): GrowthEventConfig => {
  const week = Math.floor(now / (7 * 24 * 3600 * 1000))
  return GROWTH_EVENT_ROTATION[week % GROWTH_EVENT_ROTATION.length]
}

