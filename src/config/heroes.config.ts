import type { Rarity } from '../types/game.types'

export type HeroId =
  | 'rookie_satoshi'
  | 'degen_ape_roxy'
  | 'jordan_the_wolf'
  | 'lady_fortuna'
  | 'quantum_ai_oracle'
  | 'satoshi_nakamoto'

export const HERO_FRAGMENTS_REQUIRED = 50
export const MAX_HERO_STARS = 5

export interface HeroConfig {
  id: HeroId
  name: string
  title: string
  rarity: Rarity
  unlockGemsCost: number // 0 for starter
  fragmentsRequired: number
  featuredBundleName?: string
  basePower: number
  passiveName: string
  passiveDesc: string
  activeSkillName: string
  activeSkillDesc: string
  /** Number of coin ticks required to charge active skill to 100%. */
  skillChargeTicks: number
  accentColor: string
}

export const HEROES: HeroConfig[] = [
  {
    id: 'rookie_satoshi',
    name: 'Rookie Satoshi',
    title: 'Garage Genesis Miner',
    rarity: 'common',
    unlockGemsCost: 0,
    fragmentsRequired: 50,
    basePower: 450,
    passiveName: 'Hodl Aura',
    passiveDesc: '+15% All Coin Base Damage (+3% per Hero Lv, +35% per ★).',
    activeSkillName: 'Genesis Pump',
    activeSkillDesc: 'Forces all active coins to roll GREEN on their next tick + instant 1.5x Profit Surge!',
    skillChargeTicks: 8,
    accentColor: '#f59e0b',
  },
  {
    id: 'degen_ape_roxy',
    name: 'Degen Ape Roxy',
    title: 'Moonshot Meme Commander',
    rarity: 'rare',
    unlockGemsCost: 600,
    fragmentsRequired: 50,
    basePower: 950,
    passiveName: 'Meme Mania',
    passiveDesc: '+100% Crit Multiplier on Meme & Volatile coins (+5% per Lv, +35% per ★).',
    activeSkillName: 'YOLO Leverage',
    activeSkillDesc: 'Supercharges all wallets with +45% Up Odds & 2x Crit Damage for 5 ticks!',
    skillChargeTicks: 9,
    accentColor: '#ec4899',
  },
  {
    id: 'jordan_the_wolf',
    name: 'Jordan the Wolf',
    title: 'Wall Street Raider',
    rarity: 'epic',
    unlockGemsCost: 1400,
    fragmentsRequired: 50,
    basePower: 1650,
    passiveName: 'Wall Street Skim',
    passiveDesc: '-100% Gas Fees & generates +$200 Cash on every Rebalance (+35% per ★).',
    activeSkillName: 'Hostile Takeover',
    activeSkillDesc: 'Injects +25% bonus liquidity into every active wallet & restores +30 Margin HP!',
    skillChargeTicks: 10,
    accentColor: '#eab308',
  },
  {
    id: 'lady_fortuna',
    name: 'Lady Fortuna',
    title: 'High-Roller Whale',
    rarity: 'legendary',
    unlockGemsCost: 2200,
    fragmentsRequired: 50,
    featuredBundleName: 'First-ICO Starter Pack',
    basePower: 3400,
    passiveName: 'Golden Jackpot',
    passiveDesc: '+22% All Green Roll Odds & +45% Boss Bounty Cash (+35% per ★).',
    activeSkillName: 'Royal All-In',
    activeSkillDesc: 'Triggers an instant 2.6x Golden Candle across all wallets & +60 Margin Shield!',
    skillChargeTicks: 9,
    accentColor: '#f43f5e',
  },
  {
    id: 'quantum_ai_oracle',
    name: 'Quantum AI Oracle',
    title: 'Singularity Arbitrage Core',
    rarity: 'mythical',
    unlockGemsCost: 2800,
    fragmentsRequired: 50,
    basePower: 4400,
    passiveName: 'High-Frequency Overclock',
    passiveDesc: '+45% Tick Speed to all coins (+5% per Hero Lv, +35% per ★).',
    activeSkillName: 'Flash Crash Short',
    activeSkillDesc: 'Unleashes an Orbital Liquidation Beam dealing 40% of Boss Max HP + +75 Margin Shield!',
    skillChargeTicks: 10,
    accentColor: '#38bdf8',
  },
  {
    id: 'satoshi_nakamoto',
    name: 'Satoshi Nakamoto',
    title: 'Genesis Architect',
    rarity: 'mythical',
    unlockGemsCost: 3600,
    fragmentsRequired: 50,
    featuredBundleName: 'Whale Bailout Bundle',
    basePower: 5600,
    passiveName: 'Genesis Consensus',
    passiveDesc: '+60% All Coin Base Damage & prevents Red Down-Rolls on Slot #1 (+35% per ★).',
    activeSkillName: 'Halving Supernova',
    activeSkillDesc: 'Doubles all active wallet cash & blasts the Boss for 55% Max HP + +100 Margin Shield!',
    skillChargeTicks: 9,
    accentColor: '#facc15',
  },
]

export const HERO_MAP: Record<HeroId, HeroConfig> = Object.fromEntries(
  HEROES.map((h) => [h.id, h]),
) as Record<HeroId, HeroConfig>

export function heroLevelUpCost(currentLevel: number, rarity: Rarity): number {
  const rarityFactor: Record<Rarity, number> = {
    common: 1,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2.0,
    legendary: 2.6,
    mythical: 3.5,
  }
  const baseCost = 250 * currentLevel * rarityFactor[rarity]
  const escalatingMult = currentLevel > 15 ? Math.pow(1.35, currentLevel / 5) : 1.0
  return Math.round(baseCost * escalatingMult)
}

export function heroSkillUpgradeCost(currentSkillLevel: number): {
  hashrate: number
  blueprints: number
} {
  return {
    hashrate: Math.round(200 * Math.pow(1.45, Math.max(0, currentSkillLevel - 1))),
    blueprints: Math.max(1, currentSkillLevel),
  }
}

/**
 * Calculates bonus multiplier applied to all equipped Rig stats from Hero Star ascension:
 * 1★: 1.0 (baseline)
 * 2★–5★: +15% per star above 1★ (e.g. 2★ = 1.15x, 3★ = 1.30x, 4★ = 1.45x, 5★ = 1.60x).
 */
export function getHeroStarRigMultiplier(stars: number = 1): number {
  return 1 + Math.max(0, stars - 1) * 0.15
}
