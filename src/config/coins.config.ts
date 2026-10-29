import type { CoinConfig, Rarity } from '../types/game.types'

export const RARITY_ORDER: readonly Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical']

/** Rarity base damage multipliers (ensures wide separation across progression cohorts). */
export const RARITY_DAMAGE_MULTIPLIER: Record<Rarity, number> = {
  common: 1.0,
  uncommon: 1.35,
  rare: 1.8,
  epic: 2.6,
  legendary: 4.5,
  mythical: 8.5,
}

/** Mastery bonus per coin level by rarity (PRD: +2% baseline). */
const MASTERY: Record<Rarity, number> = {
  common: 0.02, uncommon: 0.02, rare: 0.025, epic: 0.03, legendary: 0.035, mythical: 0.04,
}
const MAX_LEVEL: Record<Rarity, number> = {
  common: 20, uncommon: 25, rare: 30, epic: 40, legendary: 50, mythical: 60,
}

export const COINS: CoinConfig[] = [
  // ─────────────── COMMON ───────────────
  {
    id: 'bitcrumb', name: 'BitCrumb', ticker: 'BCRM', rarity: 'common', grade: 'C',
    flavor: 'A crumb of the original chain. Boring. Reliable. Yours.',
    baseTickSpeed: 1.5,
    rngTable: [
      { outcome: 'up', chance: 60, multiplier: 0.15 },
      { outcome: 'down', chance: 40, multiplier: -0.05 },
    ],
    passives: [{
      id: 'steady_ledger', name: 'Steady Ledger',
      description: 'Losses on Red rolls are reduced by 20%.',
      trigger: 'onRed', effects: [{ kind: 'reduceLoss', value: 0.2, isFraction: true, target: 'self' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.common, maxLevel: MAX_LEVEL.common, color: '#f7931a', icon: 'Bitcoin',
  },
  {
    id: 'litescrap', name: 'LiteScrap', ticker: 'LSCR', rarity: 'common', grade: 'C',
    flavor: 'Silver to someone\'s gold. Ticks a little faster.',
    baseTickSpeed: 1.2,
    rngTable: [
      { outcome: 'up', chance: 55, multiplier: 0.12 },
      { outcome: 'down', chance: 45, multiplier: -0.08 },
    ],
    passives: [{
      id: 'quick_blocks', name: 'Quick Blocks',
      description: 'Every 5th tick, gain 10% tick speed for 3 ticks.',
      trigger: 'onTick', effects: [{ kind: 'tickSpeed', value: -0.1, everyN: 5, durationTicks: 3, target: 'self' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.common, maxLevel: MAX_LEVEL.common, color: '#bfbbbb', icon: 'Coins',
  },
  {
    id: 'dogepenny', name: 'DogePenny', ticker: 'DPNY', rarity: 'common', grade: 'C',
    flavor: 'Much penny. Very wow. Occasionally moons.',
    baseTickSpeed: 1.4,
    rngTable: [
      { outcome: 'up', chance: 45, multiplier: 0.25 },
      { outcome: 'down', chance: 55, multiplier: -0.1 },
    ],
    passives: [{
      id: 'meme_magic', name: 'Meme Magic',
      description: '10% chance on Green to double the gain.',
      trigger: 'onGreen', procChance: 0.1,
      effects: [{ kind: 'modifyUpMultiplier', value: 1, isFraction: true, target: 'self' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.common, maxLevel: MAX_LEVEL.common, color: '#c2a633', icon: 'Dog',
  },
  {
    id: 'tronbit', name: 'TronBit', ticker: 'TRBT', rarity: 'common', grade: 'C',
    flavor: 'Cheap gas, cheaper promises.',
    baseTickSpeed: 1.6,
    rngTable: [
      { outcome: 'up', chance: 50, multiplier: 0.1 },
      { outcome: 'flat', chance: 30, multiplier: 0 },
      { outcome: 'down', chance: 20, multiplier: -0.08 },
    ],
    passives: [{
      id: 'low_fee', name: 'Low Fee Rail',
      description: 'Refunds 25% of Gas Fees on Rebalance.',
      trigger: 'onRebalance', effects: [{ kind: 'refundGas', value: 0.25, isFraction: true, target: 'player' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.common, maxLevel: MAX_LEVEL.common, color: '#ff0013', icon: 'Zap',
  },

  // ─────────────── UNCOMMON ───────────────
  {
    id: 'shibamoon', name: 'ShibaMoon', ticker: 'SHMN', rarity: 'uncommon', grade: 'B',
    flavor: 'Glass Cannon. One green candle away from Lambo — or zero.',
    baseTickSpeed: 1.5,
    rngTable: [
      { outcome: 'up', chance: 20, multiplier: 3.0 },
      { outcome: 'down', chance: 80, multiplier: -0.25 },
    ],
    passives: [{
      id: 'hype_train', name: 'Hype Train',
      description: '+5% Up chance (stacking, this battle) whenever any ally rolls Green.',
      trigger: 'onAllyGreen', effects: [{ kind: 'modifyUpChance', value: 5, target: 'self' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.uncommon, maxLevel: MAX_LEVEL.uncommon, color: '#ffa409', icon: 'Rocket',
  },
  {
    id: 'pepepump', name: 'PepePump', ticker: 'PEPP', rarity: 'uncommon', grade: 'B',
    flavor: 'Feels good, man. Until it doesn\'t.',
    baseTickSpeed: 1.3,
    rngTable: [
      { outcome: 'up', chance: 40, multiplier: 0.6 },
      { outcome: 'down', chance: 60, multiplier: -0.15 },
    ],
    passives: [{
      id: 'pump_streak', name: 'Pump Streak',
      description: 'Each consecutive Green adds +20% Up multiplier (resets on Red).',
      trigger: 'onGreen', effects: [{ kind: 'modifyUpMultiplier', value: 0.2, target: 'self' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.uncommon, maxLevel: MAX_LEVEL.uncommon, color: '#3cb043', icon: 'Frown',
  },
  {
    id: 'cardanonode', name: 'CardanoNode', ticker: 'CNOD', rarity: 'uncommon', grade: 'B',
    flavor: 'Peer-reviewed. Slow. Extremely hard to kill.',
    baseTickSpeed: 2.0,
    rngTable: [
      { outcome: 'up', chance: 50, multiplier: 0.2 },
      { outcome: 'flat', chance: 35, multiplier: 0 },
      { outcome: 'down', chance: 15, multiplier: -0.05 },
    ],
    passives: [{
      id: 'staking_shield', name: 'Staking Shield',
      description: 'On Flat, grant the player a 5 HP Margin shield.',
      trigger: 'onFlat', effects: [{ kind: 'shieldMargin', value: 5, target: 'player' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.uncommon, maxLevel: MAX_LEVEL.uncommon, color: '#0033ad', icon: 'Shield',
  },

  // ─────────────── RARE ───────────────
  {
    id: 'aetherstake', name: 'AetherStake', ticker: 'AETH', rarity: 'rare', grade: 'A',
    flavor: 'Never moves. Feeds everyone around it.',
    baseTickSpeed: 1.5,
    rngTable: [{ outcome: 'flat', chance: 100, multiplier: 0 }],
    passives: [{
      id: 'yield_farming', name: 'Yield Farming',
      description: 'Every tick, injects 5% of its cash into adjacent coins.',
      trigger: 'onTick',
      effects: [{ kind: 'transferCashAdjacent', value: 0.05, isFraction: true, target: 'adjacent' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.rare, maxLevel: MAX_LEVEL.rare, color: '#627eea', icon: 'Sprout',
  },
  {
    id: 'solanabolt', name: 'SolanaBolt', ticker: 'SBLT', rarity: 'rare', grade: 'A',
    flavor: 'Ultra-fast. Occasionally the whole network goes down.',
    baseTickSpeed: 0.8,
    rngTable: [
      { outcome: 'up', chance: 55, multiplier: 0.12 },
      { outcome: 'down', chance: 45, multiplier: -0.08 },
    ],
    passives: [{
      id: 'high_tps', name: 'High TPS',
      description: 'Ultra-fast 0.8s ticks. 3% chance per tick to stall (skip next tick).',
      trigger: 'onTick', procChance: 0.03,
      effects: [{ kind: 'tickSpeed', value: 1, durationTicks: 1, target: 'self' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.rare, maxLevel: MAX_LEVEL.rare, color: '#14f195', icon: 'Zap',
  },
  {
    id: 'chainoracle', name: 'ChainOracle', ticker: 'ORCL', rarity: 'rare', grade: 'A',
    flavor: 'Sees the price before the market does.',
    baseTickSpeed: 1.6,
    rngTable: [
      { outcome: 'up', chance: 60, multiplier: 0.3 },
      { outcome: 'down', chance: 40, multiplier: -0.15 },
    ],
    passives: [{
      id: 'price_feed', name: 'Price Feed',
      description: 'On Red, 30% chance to re-roll the result.',
      trigger: 'onRed', procChance: 0.3, effects: [{ kind: 'retriggerRoll', value: 1, target: 'self' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.rare, maxLevel: MAX_LEVEL.rare, color: '#375bd2', icon: 'Eye',
  },

  // ─────────────── EPIC ───────────────
  {
    id: 'moneroghost', name: 'MoneroGhost', ticker: 'GHST', rarity: 'epic', grade: 'A',
    flavor: 'Untraceable. Even its losses hurt the enemy.',
    baseTickSpeed: 1.4,
    rngTable: [
      { outcome: 'up', chance: 50, multiplier: 0.35 },
      { outcome: 'down', chance: 50, multiplier: -0.2 },
    ],
    passives: [{
      id: 'dark_pool', name: 'Dark Pool',
      description: 'Red candles still deal 50% of the loss as Short Damage to the enemy.',
      trigger: 'onRed', effects: [{ kind: 'shortDamage', value: 0.5, isFraction: true, target: 'enemy' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.epic, maxLevel: MAX_LEVEL.epic, color: '#ff6600', icon: 'Ghost',
  },
  {
    id: 'avalanchesub', name: 'AvalancheSub', ticker: 'AVSB', rarity: 'epic', grade: 'A',
    flavor: 'Subnets all the way down. Snowballs on momentum.',
    baseTickSpeed: 1.2,
    rngTable: [
      { outcome: 'up', chance: 55, multiplier: 0.25 },
      { outcome: 'down', chance: 45, multiplier: -0.15 },
    ],
    passives: [{
      id: 'snowball', name: 'Snowball',
      description: 'Every Green grants ALL allies +3% Up multiplier for 3 ticks.',
      trigger: 'onGreen',
      effects: [{ kind: 'modifyUpMultiplier', value: 0.03, durationTicks: 3, target: 'allAllies' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.epic, maxLevel: MAX_LEVEL.epic, color: '#e84142', icon: 'Snowflake',
  },
  {
    id: 'polkarelay', name: 'PolkaRelay', ticker: 'PRLY', rarity: 'epic', grade: 'A',
    flavor: 'The relay chain. Amplifies whoever sits next to it.',
    baseTickSpeed: 1.5,
    rngTable: [
      { outcome: 'up', chance: 50, multiplier: 0.2 },
      { outcome: 'flat', chance: 20, multiplier: 0 },
      { outcome: 'down', chance: 30, multiplier: -0.1 },
    ],
    passives: [{
      id: 'parachain', name: 'Parachain Bond',
      description: 'Adjacent coins tick 15% faster.',
      trigger: 'onBattleStart', effects: [{ kind: 'tickSpeed', value: -0.15, target: 'adjacent' }],
    }],
    globalMasteryBonusPerLevel: MASTERY.epic, maxLevel: MAX_LEVEL.epic, color: '#e6007a', icon: 'Network',
  },

  // ─────────────── MYTHICAL (S-Grade) ───────────────
  {
    id: 'satoshigenesis', name: 'SatoshiGenesis', ticker: 'GNSS', rarity: 'mythical', grade: 'S',
    flavor: 'Block zero. It does not go down.',
    baseTickSpeed: 1.3,
    rngTable: [
      { outcome: 'up', chance: 50, multiplier: 0.9 },
      { outcome: 'flat', chance: 50, multiplier: 0 },
    ],
    passives: [
      {
        id: 'immutable', name: 'Immutable',
        description: 'Cannot roll Down.',
        trigger: 'onBattleStart', effects: [{ kind: 'preventDown', value: 1, target: 'self' }],
      },
      {
        id: 'halving_cycle', name: 'Halving Cycle',
        description: 'Doubles its upward multiplier every 4 ticks.',
        trigger: 'onTick', effects: [{ kind: 'multiplyUpEveryN', value: 2, everyN: 4, target: 'self' }],
      },
    ],
    globalMasteryBonusPerLevel: MASTERY.mythical, maxLevel: MAX_LEVEL.mythical, color: '#ffd700', icon: 'Crown',
  },
  {
    id: 'quantumtether', name: 'QuantumTether', ticker: 'QTTH', rarity: 'mythical', grade: 'S',
    flavor: 'Pegged to every timeline at once.',
    baseTickSpeed: 1.0,
    rngTable: [
      { outcome: 'up', chance: 50, multiplier: 0.7 },
      { outcome: 'down', chance: 50, multiplier: -0.4 },
    ],
    passives: [{
      id: 'superposition', name: 'Superposition',
      description: 'On Red, the loss is fully negated and 150% of it hits the enemy as Short Damage.',
      trigger: 'onRed',
      effects: [
        { kind: 'reduceLoss', value: 1, isFraction: true, target: 'self' },
        { kind: 'shortDamage', value: 1.5, isFraction: true, target: 'enemy' },
      ],
    }],
    globalMasteryBonusPerLevel: MASTERY.mythical, maxLevel: MAX_LEVEL.mythical, color: '#00f0ff', icon: 'Atom',
  },
]

export const COIN_MAP: Record<string, CoinConfig> = Object.fromEntries(COINS.map((c) => [c.id, c]))
export const STARTER_COIN_ID = 'bitcrumb'
