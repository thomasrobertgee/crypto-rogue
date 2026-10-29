export type PvpLeagueTier =
  | 'paper_hands_bronze'
  | 'hodl_silver'
  | 'bull_run_gold'
  | 'degen_master'
  | 'diamond_whale'

export interface PvpTierConfig {
  id: PvpLeagueTier
  name: string
  title: string
  color: string
  gradient: string
  minRating: number
  badge: string
  weeklyGemReward: number
  weeklyTitle: string
}

export const PVP_TIERS: PvpTierConfig[] = [
  {
    id: 'paper_hands_bronze',
    name: 'Paper-Hands Bronze',
    title: 'Panic Seller Division',
    color: '#b45309',
    gradient: 'from-[#d97706] to-[#78350f]',
    minRating: 0,
    badge: '🥉',
    weeklyGemReward: 150,
    weeklyTitle: 'Paper-Hands Survivor',
  },
  {
    id: 'hodl_silver',
    name: 'HODL Silver',
    title: 'Diamond Palms League',
    color: '#94a3b8',
    gradient: 'from-[#cbd5e1] via-[#94a3b8] to-[#475569]',
    minRating: 1200,
    badge: '🥈',
    weeklyGemReward: 300,
    weeklyTitle: 'Steadfast HODLer',
  },
  {
    id: 'bull_run_gold',
    name: 'Bull Run Gold',
    title: 'Market Maker Apex',
    color: '#f59e0b',
    gradient: 'from-[#fef08a] via-[#f59e0b] to-[#b45309]',
    minRating: 1500,
    badge: '🥇',
    weeklyGemReward: 600,
    weeklyTitle: 'Bull Market Warlord',
  },
  {
    id: 'degen_master',
    name: 'Degen Master',
    title: '100x Leverage Syndicate',
    color: '#a855f7',
    gradient: 'from-[#e9d5ff] via-[#a855f7] to-[#6b21a8]',
    minRating: 1800,
    badge: '👑',
    weeklyGemReward: 1200,
    weeklyTitle: 'Apex Liquidator',
  },
  {
    id: 'diamond_whale',
    name: 'Diamond Whale',
    title: 'Sovereign Treasury Council',
    color: '#06b6d4',
    gradient: 'from-[#cffafe] via-[#06b6d4] to-[#0e7490]',
    minRating: 2200,
    badge: '💎',
    weeklyGemReward: 2500,
    weeklyTitle: 'Diamond Whale Sovereign',
  },
]

export const PVP_TIER_MAP: Record<PvpLeagueTier, PvpTierConfig> = Object.fromEntries(
  PVP_TIERS.map((t) => [t.id, t]),
) as Record<PvpLeagueTier, PvpTierConfig>

export function getPvpTier(rating: number): PvpTierConfig {
  if (rating >= 2200) return PVP_TIER_MAP.diamond_whale
  if (rating >= 1800) return PVP_TIER_MAP.degen_master
  if (rating >= 1500) return PVP_TIER_MAP.bull_run_gold
  if (rating >= 1200) return PVP_TIER_MAP.hodl_silver
  return PVP_TIER_MAP.paper_hands_bronze
}

export interface PvpOpponentSnapshot {
  id: string
  name: string
  rating: number
  tier: PvpLeagueTier
  heroId: string
  skinId?: string
  coins: Array<{ coinId: string; rarity: string; level: number; capacityPct: number }>
  powerScore: number
  avatarEmoji: string
}

export const MOCK_PVP_DEFENDERS: PvpOpponentSnapshot[] = [
  {
    id: 'opp_01',
    name: '0xFlashLiquidator',
    rating: 1240,
    tier: 'hodl_silver',
    heroId: 'degen_ape_roxy',
    coins: [
      { coinId: 'doge', rarity: 'rare', level: 14, capacityPct: 40 },
      { coinId: 'sol', rarity: 'uncommon', level: 12, capacityPct: 30 },
      { coinId: 'shiba', rarity: 'common', level: 10, capacityPct: 20 },
      { coinId: 'pepe', rarity: 'rare', level: 15, capacityPct: 10 },
    ],
    powerScore: 1850,
    avatarEmoji: '🦍',
  },
  {
    id: 'opp_02',
    name: 'SovereignGenesis_OG',
    rating: 1520,
    tier: 'bull_run_gold',
    heroId: 'satoshi_nakamoto',
    coins: [
      { coinId: 'btc', rarity: 'epic', level: 20, capacityPct: 45 },
      { coinId: 'eth', rarity: 'rare', level: 18, capacityPct: 30 },
      { coinId: 'sol', rarity: 'rare', level: 16, capacityPct: 15 },
      { coinId: 'monero', rarity: 'epic', level: 18, capacityPct: 10 },
    ],
    powerScore: 2650,
    avatarEmoji: '👑',
  },
  {
    id: 'opp_03',
    name: 'WhaleArbitrageur',
    rating: 1910,
    tier: 'degen_master',
    heroId: 'lady_fortuna',
    coins: [
      { coinId: 'bnb', rarity: 'epic', level: 24, capacityPct: 40 },
      { coinId: 'btc', rarity: 'legendary', level: 25, capacityPct: 35 },
      { coinId: 'sol', rarity: 'epic', level: 22, capacityPct: 15 },
      { coinId: 'pepe', rarity: 'epic', level: 20, capacityPct: 10 },
    ],
    powerScore: 3400,
    avatarEmoji: '💎',
  },
]
