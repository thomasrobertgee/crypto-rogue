import type { HeroId } from './heroes.config'

export interface HeroBondRequirement {
  heroId: HeroId
  minStars: number
}

export interface HeroBondConfig {
  id: string
  name: string
  title: string
  emoji: string
  color: string
  bgGradient: string
  requirements: HeroBondRequirement[]
  buffDescription: string
  effectType: 'bossBounty' | 'coinTickSpeed' | 'greenCandleMagnitude' | 'marginHpShield' | 'patrolYield'
  effectValue: number // e.g. 0.15 for +15%
}

export const HERO_BONDS: HeroBondConfig[] = [
  {
    id: 'high_rollers_club',
    name: 'High-Rollers Club',
    title: 'Offshore Whale Syndicate',
    emoji: '🥂',
    color: '#f59e0b',
    bgGradient: 'from-[#fef3c7] via-[#fde047] to-[#d97706]',
    requirements: [
      { heroId: 'jordan_the_wolf', minStars: 2 },
      { heroId: 'lady_fortuna', minStars: 2 },
    ],
    buffDescription: '+15% Global Boss Bounty Cash Payout',
    effectType: 'bossBounty',
    effectValue: 0.15,
  },
  {
    id: 'genesis_protocol',
    name: 'Genesis Protocol',
    title: 'Block Zero Consensus',
    emoji: '⚡',
    color: '#06b6d4',
    bgGradient: 'from-[#cffafe] via-[#38bdf8] to-[#0284c7]',
    requirements: [
      { heroId: 'rookie_satoshi', minStars: 3 },
      { heroId: 'quantum_ai_oracle', minStars: 3 },
    ],
    buffDescription: '+8% Global Coin Tick Speed',
    effectType: 'coinTickSpeed',
    effectValue: 0.08,
  },
  {
    id: 'degen_apex_predators',
    name: 'Degen Apex Predators',
    title: 'Maximum Leverage Guild',
    emoji: '🦍',
    color: '#ec4899',
    bgGradient: 'from-[#fce7f3] via-[#f472b6] to-[#db2777]',
    requirements: [
      { heroId: 'degen_ape_roxy', minStars: 2 },
      { heroId: 'jordan_the_wolf', minStars: 2 },
    ],
    buffDescription: '+12% Green Candle Roll Damage',
    effectType: 'greenCandleMagnitude',
    effectValue: 0.12,
  },
  {
    id: 'sovereign_guardians',
    name: 'Sovereign Guardians',
    title: 'Cold Storage Citadel',
    emoji: '🛡️',
    color: '#10b981',
    bgGradient: 'from-[#d1fae5] via-[#34d399] to-[#059669]',
    requirements: [
      { heroId: 'rookie_satoshi', minStars: 2 },
      { heroId: 'satoshi_nakamoto', minStars: 1 },
    ],
    buffDescription: '+50 Margin Shield Barrier at Start of Each Node',
    effectType: 'marginHpShield',
    effectValue: 50,
  },
]

export const HERO_BOND_MAP: Record<string, HeroBondConfig> = Object.fromEntries(
  HERO_BONDS.map((b) => [b.id, b]),
)
