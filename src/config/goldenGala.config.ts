/**
 * Season 1: "The Golden Bull Gala" Configuration
 * Featuring Legendary Hero Lady Fortuna, the 100-Pull Guaranteed Milestone Wheel,
 * Hero Trial Missions, and Candle Plinko.
 */

export interface GalaWheelSlice {
  id: string
  name: string
  label: string
  icon: string
  probPct: number
  type: 'hero_unlock' | 'skin_unlock' | 'shards' | 'tickets' | 'keys' | 'gems' | 'hashrate' | 'skin_copy'
  amount: number
  skinId?: string
  color: string
}

export const GALA_WHEEL_SLICES: GalaWheelSlice[] = [
  {
    id: 'slice_jackpot',
    name: 'Lady Fortuna (50 Shards)',
    label: 'LADY FORTUNA',
    icon: '👑',
    probPct: 0.5,
    type: 'hero_unlock',
    amount: 50,
    color: '#e11d48',
  },
  {
    id: 'slice_shards',
    name: '+5 Lady Fortuna Shards',
    label: '+5 SHARDS',
    icon: '🧩',
    probPct: 4.5,
    type: 'shards',
    amount: 5,
    color: '#d97706',
  },
  {
    id: 'slice_tickets_2',
    name: '+2 Gala Spin Tickets',
    label: '+2 TICKETS',
    icon: '🎟️',
    probPct: 15.0,
    type: 'tickets',
    amount: 2,
    color: '#9333ea',
  },
  {
    id: 'slice_quantum_key',
    name: '1x Quantum Key',
    label: 'QUANTUM KEY',
    icon: '🔮',
    probPct: 12.0,
    type: 'keys',
    amount: 1,
    color: '#0284c7',
  },
  {
    id: 'slice_silver_key',
    name: '2x Silver Vault Keys',
    label: '2x SILVER KEYS',
    icon: '🗝️',
    probPct: 13.0,
    type: 'keys',
    amount: 2,
    color: '#64748b',
  },
  {
    id: 'slice_gems_300',
    name: '+300 Satoshi Gems',
    label: '+300 GEMS',
    icon: '💎',
    probPct: 20.0,
    type: 'gems',
    amount: 300,
    color: '#16a34a',
  },
  {
    id: 'slice_hashrate_10k',
    name: '+10,000 Hashrate',
    label: '10K HASHRATE',
    icon: '⚡',
    probPct: 20.0,
    type: 'hashrate',
    amount: 10000,
    color: '#ca8a04',
  },
  {
    id: 'slice_skin_monte_carlo',
    name: 'Monte Carlo Skin Copy',
    label: 'SKIN COPY',
    icon: '👗',
    probPct: 15.0,
    type: 'skin_copy',
    amount: 1,
    skinId: 'lady_fortuna_monte_carlo',
    color: '#be185d',
  },
]

export interface WheelMilestoneReward {
  pulls: number
  title: string
  description: string
  icon: string
  type: 'shards' | 'gems' | 'keys' | 'blueprints' | 'skin'
  amount: number
  skinId?: string
  shardsCount?: number
}

export const GALA_100_PULL_MILESTONES: WheelMilestoneReward[] = [
  {
    pulls: 10,
    title: '+10 Lady Fortuna Shards',
    description: '10/50 shards towards unlocking Lady Fortuna!',
    icon: '🧩',
    type: 'shards',
    amount: 10,
    shardsCount: 10,
  },
  {
    pulls: 20,
    title: '+3 Silver Keys & +200 Gems',
    description: 'Vault keys and reserve capital!',
    icon: '🗝️',
    type: 'gems',
    amount: 200,
  },
  {
    pulls: 30,
    title: '+10 Lady Fortuna Shards',
    description: '20/50 shards towards Lady Fortuna!',
    icon: '🧩',
    type: 'shards',
    amount: 10,
    shardsCount: 10,
  },
  {
    pulls: 40,
    title: '+5 Furniture Blueprints',
    description: 'Camp real estate upgrade blueprints!',
    icon: '📐',
    type: 'blueprints',
    amount: 5,
  },
  {
    pulls: 50,
    title: '+10 Lady Fortuna Shards',
    description: '30/50 shards milestone reached!',
    icon: '🧩',
    type: 'shards',
    amount: 10,
    shardsCount: 10,
  },
  {
    pulls: 60,
    title: '+2 Quantum Keys',
    description: 'Instant Epic/Legendary Algo Vault access!',
    icon: '🔮',
    type: 'keys',
    amount: 2,
  },
  {
    pulls: 70,
    title: '+10 Lady Fortuna Shards',
    description: '40/50 shards — Almost guaranteed!',
    icon: '🧩',
    type: 'shards',
    amount: 10,
    shardsCount: 10,
  },
  {
    pulls: 80,
    title: '👗 Epic Skin: "Monte Carlo VIP"',
    description: 'Exclusive Riviera attire with Cash Dividend mutation!',
    icon: '👗',
    type: 'skin',
    amount: 1,
    skinId: 'lady_fortuna_monte_carlo',
  },
  {
    pulls: 90,
    title: '+5 Quantum Keys & +500 Gems',
    description: 'Major vault unlock cache!',
    icon: '🔮',
    type: 'gems',
    amount: 500,
  },
  {
    pulls: 100,
    title: '+10 Lady Fortuna Shards (100% PITY)',
    description: 'Guaranteed 50/50 full unlock for Lady Fortuna!',
    icon: '👑',
    type: 'shards',
    amount: 10,
    shardsCount: 10,
  },
]

export interface FortunaTrialStage {
  stage: number
  name: string
  bossName: string
  bossHp: number
  bossTitle: string
  isTrialHeroLent: boolean
  lentSkinId?: string
  minHeroStarsRequired?: number
  description: string
  rewards: {
    tickets: number
    shards: number
    skinCopies?: { skinId: string; count: number }
    gems: number
  }
}

export const FORTUNA_TRIAL_STAGES: FortunaTrialStage[] = [
  {
    stage: 1,
    name: 'Monte Carlo Rookie Table',
    bossName: 'Street Scammer',
    bossTitle: 'Novice Short Seller',
    bossHp: 8000,
    isTrialHeroLent: true,
    lentSkinId: 'lady_fortuna_default',
    description: 'Lent Trial Hero: Lady Fortuna (Default). Test her Golden Jackpot passive and Royal All-In burst!',
    rewards: {
      tickets: 5,
      shards: 5,
      gems: 150,
    },
  },
  {
    stage: 2,
    name: 'High-Roller VIP Lounge',
    bossName: 'Ponzi Syndicate Boss',
    bossTitle: 'High-Yield Schemer',
    bossHp: 18000,
    isTrialHeroLent: true,
    lentSkinId: 'lady_fortuna_velvet',
    description: 'Lent Trial Hero: Lady Fortuna (Velvet Casino Queen). Cash in on the roulette bonus!',
    rewards: {
      tickets: 8,
      shards: 8,
      gems: 250,
    },
  },
  {
    stage: 3,
    name: 'Whale Liquidation Floor',
    bossName: 'Sovereign Bear Whale',
    bossTitle: 'Market Crash Titan',
    bossHp: 32000,
    isTrialHeroLent: true,
    lentSkinId: 'lady_fortuna_monte_carlo',
    description: 'Lent Trial Hero: Lady Fortuna (Monte Carlo VIP). Unleash the $800 Cash Dividend mutation!',
    rewards: {
      tickets: 10,
      shards: 10,
      skinCopies: { skinId: 'lady_fortuna_monte_carlo', count: 1 },
      gems: 400,
    },
  },
  {
    stage: 4,
    name: 'Sovereign Gauntlet',
    bossName: 'Margin Call Titan',
    bossTitle: 'Master of Forced Liquidations',
    bossHp: 55000,
    isTrialHeroLent: false,
    minHeroStarsRequired: 1,
    description: 'Requires owning Lady Fortuna (1★+). Prove your trading prowess in the high-stakes pit!',
    rewards: {
      tickets: 15,
      shards: 12,
      gems: 600,
    },
  },
  {
    stage: 5,
    name: 'Gala Grand Championship',
    bossName: 'Genesis Bear Sovereign',
    bossTitle: 'Supreme Liquidity Annihilator',
    bossHp: 90000,
    isTrialHeroLent: false,
    minHeroStarsRequired: 2,
    description: 'Requires owning Lady Fortuna at 2★+. The ultimate trial for the championship crown!',
    rewards: {
      tickets: 20,
      shards: 15,
      skinCopies: { skinId: 'lady_fortuna_empress', count: 1 },
      gems: 1000,
    },
  },
]

export interface PlinkoBucket {
  index: number
  label: string
  multiplier: number
  color: string
  textColor: string
  bgGradient: string
}

export const PLINKO_BUCKETS: PlinkoBucket[] = [
  { index: 0, label: '1x GEMS', multiplier: 1, color: '#3b82f6', textColor: '#ffffff', bgGradient: 'from-blue-600 to-indigo-700' },
  { index: 1, label: '2x TICKET', multiplier: 2, color: '#a855f7', textColor: '#ffffff', bgGradient: 'from-purple-600 to-fuchsia-700' },
  { index: 2, label: 'JACKPOT 5x', multiplier: 5, color: '#eab308', textColor: '#000000', bgGradient: 'from-amber-400 via-yellow-300 to-orange-500' },
  { index: 3, label: '2x TICKET', multiplier: 2, color: '#a855f7', textColor: '#ffffff', bgGradient: 'from-purple-600 to-fuchsia-700' },
  { index: 4, label: '1x GEMS', multiplier: 1, color: '#3b82f6', textColor: '#ffffff', bgGradient: 'from-blue-600 to-indigo-700' },
]
