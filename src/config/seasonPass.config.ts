/**
 * Season Pass Configuration for 28-Day "Bull Market Season Pass"
 * 3-Tier Architecture: Free, Trader Pass ($9.99), Whale Executive Pass ($24.99)
 */

export interface SeasonRewardItem {
  id: string
  name: string
  icon: string
  type: 'hashrate' | 'gems' | 'silverKeys' | 'quantumKeys' | 'shards' | 'coin' | 'fragments' | 'skin' | 'perk'
  amount: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical'
}

export interface SeasonTier {
  tier: number
  xpRequired: number
  freeReward: SeasonRewardItem
  traderReward: SeasonRewardItem
  whaleReward: SeasonRewardItem
}

export const SEASON_NAME = 'BULL MARKET MANIA'
export const SEASON_DURATION_DAYS = 28
export const XP_PER_TIER = 100
export const MAX_SEASON_TIER = 30

/** Calculate tier (1..30) from total accumulated Season Pass XP */
export function calculateSeasonTier(xp: number): number {
  return Math.min(MAX_SEASON_TIER, Math.max(1, Math.floor(xp / XP_PER_TIER) + 1))
}

export const SEASON_TIERS: SeasonTier[] = Array.from({ length: 30 }, (_, i) => {
  const tier = i + 1
  const xpRequired = (tier - 1) * XP_PER_TIER

  // Free Track
  let freeReward: SeasonRewardItem
  if (tier % 10 === 0) {
    freeReward = { id: `free_${tier}`, name: `${tier * 50} 💎 Gems + 2x 🗝️`, icon: '💎', type: 'gems', amount: tier * 50 }
  } else if (tier % 5 === 0) {
    freeReward = { id: `free_${tier}`, name: '2x Silver Vault Keys', icon: '🗝️', type: 'silverKeys', amount: 2 }
  } else if (tier % 2 === 0) {
    freeReward = { id: `free_${tier}`, name: `${tier * 150} ⚡ Hashrate`, icon: '⚡', type: 'hashrate', amount: tier * 150 }
  } else {
    freeReward = { id: `free_${tier}`, name: `${25 + tier * 2} 💎 Gems`, icon: '💎', type: 'gems', amount: 25 + tier * 2 }
  }

  // Trader Track ($9.99)
  let traderReward: SeasonRewardItem
  if (tier === 30) {
    traderReward = { id: `trader_${tier}`, name: '1x Epic Coin + 1,000 💎', icon: '🪙', type: 'coin', amount: 1, rarity: 'epic' }
  } else if (tier % 10 === 0) {
    traderReward = { id: `trader_${tier}`, name: '3x Quantum Vault Keys', icon: '🔮', type: 'quantumKeys', amount: 3 }
  } else if (tier % 5 === 0) {
    traderReward = { id: `trader_${tier}`, name: '200 💎 Gems + 10x 🧩 Frags', icon: '💎', type: 'gems', amount: 200 }
  } else if (tier % 2 === 0) {
    traderReward = { id: `trader_${tier}`, name: '100 💎 Satoshi Gems', icon: '💎', type: 'gems', amount: 100 }
  } else {
    traderReward = { id: `trader_${tier}`, name: '1x Quantum Key', icon: '🔮', type: 'quantumKeys', amount: 1 }
  }

  // Whale Executive Track ($24.99)
  let whaleReward: SeasonRewardItem
  if (tier === 1) {
    whaleReward = { id: `whale_${tier}`, name: 'Sovereign Gold FX & Max Energy 45', icon: '👑', type: 'skin', amount: 1 }
  } else if (tier === 30) {
    whaleReward = { id: `whale_${tier}`, name: 'Mythical Coin Shards + 2,500 💎', icon: '🌟', type: 'gems', amount: 2500, rarity: 'mythical' }
  } else if (tier % 10 === 0) {
    whaleReward = { id: `whale_${tier}`, name: '500 💎 Gems + 5x 🔮 Quantum Keys', icon: '💎', type: 'gems', amount: 500 }
  } else if (tier % 5 === 0) {
    whaleReward = { id: `whale_${tier}`, name: '25x Hero Fragments + 300 💎', icon: '🧩', type: 'fragments', amount: 25 }
  } else if (tier % 2 === 0) {
    whaleReward = { id: `whale_${tier}`, name: '200 💎 Gems + 5,000 ⚡ Hashrate', icon: '💎', type: 'gems', amount: 200 }
  } else {
    whaleReward = { id: `whale_${tier}`, name: '2x Quantum Keys', icon: '🔮', type: 'quantumKeys', amount: 2 }
  }

  return {
    tier,
    xpRequired,
    freeReward,
    traderReward,
    whaleReward,
  }
})
