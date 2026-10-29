export interface CompoundVaultTier {
  tier: 1 | 2 | 3
  name: string
  priceUsd: number
  priceLabel: string
  capacityGems: number
  bonusKeys?: number
  icon: string
  badge: string
}

export const COMPOUND_VAULT_TIERS: CompoundVaultTier[] = [
  {
    tier: 1,
    name: 'Compound Piggy Bank',
    priceUsd: 0.99,
    priceLabel: '$0.99',
    capacityGems: 1000,
    icon: '🐷',
    badge: 'TIER 1 REBATE',
  },
  {
    tier: 2,
    name: 'Golden Bull Safe',
    priceUsd: 2.99,
    priceLabel: '$2.99',
    capacityGems: 3200,
    icon: '🐂',
    badge: 'TIER 2 VAULT',
  },
  {
    tier: 3,
    name: 'Quantum Apex Vault',
    priceUsd: 4.99,
    priceLabel: '$4.99',
    capacityGems: 6500,
    bonusKeys: 5,
    icon: '💎',
    badge: 'TIER 3 APEX',
  },
]

export interface MiningRigSubscription {
  id: 'silver_rig' | 'quantum_asic'
  name: string
  priceUsd: number
  priceLabel: string
  instantGems: number
  dailyGems: number
  durationDays: number
  totalGems: number
  perkDescription: string
  icon: string
  badge: string
}

export const MINING_SUBSCRIPTIONS: Record<'silver_rig' | 'quantum_asic', MiningRigSubscription> = {
  silver_rig: {
    id: 'silver_rig',
    name: 'Silver Cloud Rig',
    priceUsd: 4.99,
    priceLabel: '$4.99 / Mo',
    instantGems: 500,
    dailyGems: 100,
    durationDays: 30,
    totalGems: 3500,
    perkDescription: '+10 Permanent Max Energy Limit',
    icon: '☁️',
    badge: 'POPULAR RIG',
  },
  quantum_asic: {
    id: 'quantum_asic',
    name: 'Quantum ASIC Rig',
    priceUsd: 9.99,
    priceLabel: '$9.99 / Mo',
    instantGems: 1200,
    dailyGems: 250,
    durationDays: 30,
    totalGems: 8700,
    perkDescription: '+1 Daily Free Raid Ticket',
    icon: '⚡',
    badge: 'WHALE MINER',
  },
}

export interface OtcDealOption {
  id: string
  label: string
  icon: string
  slot: 1 | 2 | 3
  amount: number
  type: 'coin_shards' | 'hero_shards' | 'blueprints' | 'manuals' | 'gems' | 'hashrate'
}

export interface OtcDealTier {
  id: string
  priceUsd: number
  priceLabel: string
  slot1Options: OtcDealOption[]
  slot2Options: OtcDealOption[]
  slot3Options: OtcDealOption[]
}

export const OTC_DEAL_TIERS: OtcDealTier[] = [
  {
    id: 'otc_tier_199',
    priceUsd: 1.99,
    priceLabel: '$1.99 Starter OTC',
    slot1Options: [
      { id: 'c_shiba_15', label: '15x ShibaMoon Shards', icon: '🐶', slot: 1, amount: 15, type: 'coin_shards' },
      { id: 'c_pepe_15', label: '15x PepeSniper Shards', icon: '🐸', slot: 1, amount: 15, type: 'coin_shards' },
      { id: 'h_roxy_10', label: '10x Degen Roxy Fragments', icon: '🦍', slot: 1, amount: 10, type: 'hero_shards' },
    ],
    slot2Options: [
      { id: 'bp_10', label: '10x Furniture Blueprints', icon: '📐', slot: 2, amount: 10, type: 'blueprints' },
      { id: 'man_3', label: '3x Hero Skill Manuals', icon: '📜', slot: 2, amount: 3, type: 'manuals' },
    ],
    slot3Options: [
      { id: 'gems_350', label: '350 Satoshi Gems', icon: '💎', slot: 3, amount: 350, type: 'gems' },
      { id: 'hash_5000', label: '5,000 Hashrate', icon: '⚡', slot: 3, amount: 5000, type: 'hashrate' },
    ],
  },
  {
    id: 'otc_tier_499',
    priceUsd: 4.99,
    priceLabel: '$4.99 Trader OTC',
    slot1Options: [
      { id: 'c_solana_30', label: '30x SolanaRunner Shards', icon: '🚀', slot: 1, amount: 30, type: 'coin_shards' },
      { id: 'c_eth_30', label: '30x AetherStake Shards', icon: '🔷', slot: 1, amount: 30, type: 'coin_shards' },
      { id: 'h_jordan_20', label: '20x Jordan the Wolf Fragments', icon: '🐺', slot: 1, amount: 20, type: 'hero_shards' },
    ],
    slot2Options: [
      { id: 'bp_25', label: '25x Furniture Blueprints', icon: '📐', slot: 2, amount: 25, type: 'blueprints' },
      { id: 'man_8', label: '8x Hero Skill Manuals', icon: '📜', slot: 2, amount: 8, type: 'manuals' },
    ],
    slot3Options: [
      { id: 'gems_1000', label: '1,000 Satoshi Gems', icon: '💎', slot: 3, amount: 1000, type: 'gems' },
      { id: 'hash_15000', label: '15,000 Hashrate', icon: '⚡', slot: 3, amount: 15000, type: 'hashrate' },
    ],
  },
  {
    id: 'otc_tier_1499',
    priceUsd: 14.99,
    priceLabel: '$14.99 Executive OTC',
    slot1Options: [
      { id: 'c_btc_60', label: '60x Genesis Satoshi Shards', icon: '👑', slot: 1, amount: 60, type: 'coin_shards' },
      { id: 'h_satoshi_40', label: '40x Satoshi Nakamoto Fragments', icon: '⚡', slot: 1, amount: 40, type: 'hero_shards' },
      { id: 'h_fortuna_40', label: '40x Lady Fortuna Fragments', icon: '🎲', slot: 1, amount: 40, type: 'hero_shards' },
    ],
    slot2Options: [
      { id: 'bp_80', label: '80x Furniture Blueprints', icon: '📐', slot: 2, amount: 80, type: 'blueprints' },
      { id: 'man_25', label: '25x Hero Skill Manuals', icon: '📜', slot: 2, amount: 25, type: 'manuals' },
    ],
    slot3Options: [
      { id: 'gems_3500', label: '3,500 Satoshi Gems', icon: '💎', slot: 3, amount: 3500, type: 'gems' },
      { id: 'hash_50000', label: '50,000 Hashrate', icon: '⚡', slot: 3, amount: 50000, type: 'hashrate' },
    ],
  },
]
