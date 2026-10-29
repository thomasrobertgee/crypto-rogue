import type { HeroId } from './heroes.config'

export interface ExpeditionContract {
  id: string
  title: string
  destination: string
  city: string
  flag: string
  durationHours: number
  durationMs: number
  requiredSlots: 1 | 2
  description: string
  rewards: {
    blueprints: number
    heroFragments: number
    gems: number
    hashrate: number
  }
}

export interface ActiveExpedition {
  id: string
  assignedHeroIds: HeroId[]
  startTime: number
  durationMs: number
  status: 'in_progress' | 'completed' | 'claimed'
  greatSuccessChance: number
}

export const EXPEDITION_CONTRACTS: ExpeditionContract[] = [
  {
    id: 'exp_tokyo',
    title: 'Tokyo Orderbook Scalp',
    destination: 'Kabutocho Financial District',
    city: 'Tokyo',
    flag: '🇯🇵',
    durationHours: 4,
    durationMs: 4 * 60 * 60 * 1000, // 4 hours
    requiredSlots: 1,
    description: 'Exploit sub-millisecond latency arbitrage between Tokyo and Singapore orderbooks.',
    rewards: {
      blueprints: 2,
      heroFragments: 15,
      gems: 30,
      hashrate: 450,
    },
  },
  {
    id: 'exp_london',
    title: 'London Flash-Loan Arbitrage',
    destination: 'Canary Wharf Dark-Pool',
    city: 'London',
    flag: '🇬🇧',
    durationHours: 8,
    durationMs: 8 * 60 * 60 * 1000, // 8 hours
    requiredSlots: 2,
    description: 'Borrow uncollateralized dark-pool flash loans to rebalance mispriced European DEX pools.',
    rewards: {
      blueprints: 4,
      heroFragments: 25,
      gems: 60,
      hashrate: 900,
    },
  },
  {
    id: 'exp_ny',
    title: 'Wall Street Dark-Pool Sweep',
    destination: 'Manhattan High-Frequency Hub',
    city: 'New York',
    flag: '🇺🇸',
    durationHours: 12,
    durationMs: 12 * 60 * 60 * 1000, // 12 hours
    requiredSlots: 2,
    description: 'Deploy quantitative MEV bot clusters to front-run institutional block orders.',
    rewards: {
      blueprints: 8,
      heroFragments: 40,
      gems: 120,
      hashrate: 1800,
    },
  },
]

/**
 * Calculates the Great Success Chance (1.5x loot) based on the assigned heroes' star levels.
 * Base 20%, +15% per star above 1★, up to 95%.
 */
export function calculateGreatSuccessChance(
  heroIds: HeroId[],
  heroStars: Record<string, number>,
): number {
  if (heroIds.length === 0) return 20
  const totalStars = heroIds.reduce((sum, hid) => sum + (heroStars[hid] ?? 1), 0)
  const extraStars = totalStars - heroIds.length
  return Math.min(95, Math.round(20 + extraStars * 15))
}
