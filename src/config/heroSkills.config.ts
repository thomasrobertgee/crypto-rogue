import type { HeroId } from './heroes.config'

export interface PassiveMasteryStats {
  marginHpPct?: number // e.g. 6 = +6% Margin HP
  coinDamagePct?: number // e.g. 5 = +5% All Coin Base Damage
  greenRollOddsPct?: number // e.g. 8 = +8% Green Roll Odds
  greenRollDamagePct?: number // e.g. 10 = +10% Green Roll Damage
  tickSpeedPct?: number // e.g. 5 = +5% Tick Speed
  critDamagePct?: number // e.g. 10 = +10% Crit Multiplier
  damageReductionPct?: number // e.g. 5 = +5% Damage Reduction
  bountyCashPct?: number // e.g. 10 = +10% Boss Bounty Cash
  shieldCapacityPct?: number // e.g. 15 = +15% Margin Shield Capacity
  interruptWindowBonus?: number // e.g. 0.15 = +15% Counter-Pump Interrupt Window
}

export type SkillActionEffect =
  | 'genesis_pump'
  | 'yolo_leverage'
  | 'fomo_rush'
  | 'hostile_takeover'
  | 'boiler_room'
  | 'pump_and_dump'
  | 'royal_all_in'
  | 'jackpot_squeeze'
  | 'vault_dividend'
  | 'whale_intervention'
  | 'flash_crash'
  | 'latency_jam'
  | 'arbitrage_singularity'
  | 'quantum_reversal'
  | 'halving_supernova'
  | 'proof_of_work'
  | 'genesis_block'
  | 'difficulty_retarget'

export interface HeroSkillConfig {
  id: string
  heroId: HeroId
  slotIndex: number // 0..3
  name: string
  iconName: string
  tagline: string
  description: string
  skillChargeTicks: number
  actionEffect: SkillActionEffect
  actionSummary: string
  basePassiveMastery: PassiveMasteryStats
  /** Hero star level required to unlock this skill (1★ for Slot 0, 2★ for Slot 1, 3★ for Slot 2, 4★ for Slot 3). */
  unlockMinHeroStars: number
  accentColor: string
}

export const HERO_SKILLS: HeroSkillConfig[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. ROOKIE SATOSHI (Common - 1 Skill)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'rookie_genesis_pump',
    heroId: 'rookie_satoshi',
    slotIndex: 0,
    name: 'Genesis Pump',
    iconName: 'Zap',
    tagline: 'Network Boot Hashrate Surge',
    description: 'Forces all active coins to roll GREEN on their next tick + instant 1.5x Profit Surge + expands active wallet capacities by +15%!',
    skillChargeTicks: 8,
    actionEffect: 'genesis_pump',
    actionSummary: 'All coins roll Green + 1.5x Profit Surge + +15% Capacity',
    basePassiveMastery: {
      marginHpPct: 6,
      coinDamagePct: 5,
    },
    unlockMinHeroStars: 1,
    accentColor: '#f59e0b',
  },

  // ─────────────────────────────────────────────────────────────
  // 2. DEGEN APE ROXY (Rare - 2 Skills)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'roxy_yolo_leverage',
    heroId: 'degen_ape_roxy',
    slotIndex: 0,
    name: 'YOLO Leverage',
    iconName: 'TrendingUp',
    tagline: 'Over-Leveraged Moonshot',
    description: 'Supercharges all wallets with +45% Up Odds & 2x Crit Damage for 5 ticks, dealing 45% portfolio damage!',
    skillChargeTicks: 9,
    actionEffect: 'yolo_leverage',
    actionSummary: '45% Portfolio Dmg + +45% Up Odds + 2x Crit Damage',
    basePassiveMastery: {
      critDamagePct: 8,
      marginHpPct: 4,
    },
    unlockMinHeroStars: 1,
    accentColor: '#ec4899',
  },
  {
    id: 'roxy_fomo_rush',
    heroId: 'degen_ape_roxy',
    slotIndex: 1,
    name: 'FOMO Rush',
    iconName: 'Flame',
    tagline: 'Frenzied Ape Liquidity Torrent',
    description: 'Frenzied meme trading barrage dealing 35% portfolio damage and overclocks tick speed of all coins by +25% for 6 ticks!',
    skillChargeTicks: 7,
    actionEffect: 'fomo_rush',
    actionSummary: '35% Portfolio Dmg + +25% Tick Speed for 6 ticks',
    basePassiveMastery: {
      tickSpeedPct: 5,
      greenRollDamagePct: 6,
    },
    unlockMinHeroStars: 2,
    accentColor: '#f43f5e',
  },

  // ─────────────────────────────────────────────────────────────
  // 3. JORDAN THE WOLF (Epic - 3 Skills)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'jordan_hostile_takeover',
    heroId: 'jordan_the_wolf',
    slotIndex: 0,
    name: 'Hostile Takeover',
    iconName: 'Briefcase',
    tagline: 'Corporate Liquidation Buyout',
    description: 'Injects +25% bonus liquidity into every active wallet, deals 16% Boss Max HP damage, and grants +25 Margin Shield!',
    skillChargeTicks: 10,
    actionEffect: 'hostile_takeover',
    actionSummary: '16% Boss Max HP Dmg + +25% Liquidity + +25 Shield',
    basePassiveMastery: {
      marginHpPct: 8,
      bountyCashPct: 5,
    },
    unlockMinHeroStars: 1,
    accentColor: '#eab308',
  },
  {
    id: 'jordan_boiler_room',
    heroId: 'jordan_the_wolf',
    slotIndex: 1,
    name: 'Boiler Room Blitz',
    iconName: 'DollarSign',
    tagline: 'Cold Call Margin Blitz',
    description: 'Aggressive margin calls deal 38% portfolio damage and generate +$350 instant cash directly to unallocated liquidity!',
    skillChargeTicks: 8,
    actionEffect: 'boiler_room',
    actionSummary: '38% Portfolio Dmg + +$350 Instant Cash',
    basePassiveMastery: {
      bountyCashPct: 8,
      shieldCapacityPct: 5,
    },
    unlockMinHeroStars: 2,
    accentColor: '#ca8a04',
  },
  {
    id: 'jordan_pump_and_dump',
    heroId: 'jordan_the_wolf',
    slotIndex: 2,
    name: 'Pump & Dump Syndicate',
    iconName: 'BarChart3',
    tagline: 'Market Syndicate Collusion',
    description: 'Orchestrated market pump hitting the enemy for 22% Boss Max HP and wiping the enemy next heavy attack cast bar!',
    skillChargeTicks: 11,
    actionEffect: 'pump_and_dump',
    actionSummary: '22% Boss Max HP Dmg + Wipes Enemy Heavy Attack',
    basePassiveMastery: {
      coinDamagePct: 7,
      damageReductionPct: 4,
    },
    unlockMinHeroStars: 3,
    accentColor: '#d97706',
  },

  // ─────────────────────────────────────────────────────────────
  // 4. LADY FORTUNA (Legendary - 4 Skills)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'fortuna_royal_all_in',
    heroId: 'lady_fortuna',
    slotIndex: 0,
    name: 'Royal All-In',
    iconName: 'Crown',
    tagline: 'High-Roller Golden Bet',
    description: 'Triggers an instant 2.6x Golden Candle across all wallets, hits enemy for 48% portfolio damage, and +60 Margin Shield!',
    skillChargeTicks: 9,
    actionEffect: 'royal_all_in',
    actionSummary: '48% Portfolio Dmg + 2.6x Golden Candle + +60 Shield',
    basePassiveMastery: {
      greenRollOddsPct: 10,
      marginHpPct: 8,
    },
    unlockMinHeroStars: 1,
    accentColor: '#f43f5e',
  },
  {
    id: 'fortuna_jackpot_squeeze',
    heroId: 'lady_fortuna',
    slotIndex: 1,
    name: 'Jackpot Squeeze',
    iconName: 'Coins',
    tagline: 'Cascading Margin Call Squeeze',
    description: 'Squeezes short-sellers dealing 52% portfolio damage and forces the next 3 rolls on all coins to be Green Candles!',
    skillChargeTicks: 8,
    actionEffect: 'jackpot_squeeze',
    actionSummary: '52% Portfolio Dmg + Next 3 Rolls Guaranteed Green',
    basePassiveMastery: {
      coinDamagePct: 8,
      critDamagePct: 12,
    },
    unlockMinHeroStars: 2,
    accentColor: '#fb7185',
  },
  {
    id: 'fortuna_vault_dividend',
    heroId: 'lady_fortuna',
    slotIndex: 2,
    name: 'Vault Dividend',
    iconName: 'Gem',
    tagline: 'Private Treasury Liquidity Drop',
    description: 'Opens the private treasury vault, generating +$600 Cash, +40 Margin HP heal, and +50 Margin Shield!',
    skillChargeTicks: 10,
    actionEffect: 'vault_dividend',
    actionSummary: '+$600 Cash + +40 HP Heal + +50 Margin Shield',
    basePassiveMastery: {
      bountyCashPct: 10,
      marginHpPct: 8,
    },
    unlockMinHeroStars: 3,
    accentColor: '#e11d48',
  },
  {
    id: 'fortuna_whale_intervention',
    heroId: 'lady_fortuna',
    slotIndex: 3,
    name: 'Whale Intervention',
    iconName: 'Sparkles',
    tagline: 'Institutional Market Wall Buy',
    description: 'Summons high-roller whale buy orders blasting the boss for 30% Max HP, stuns the boss for 3 seconds, and +80 Shield!',
    skillChargeTicks: 12,
    actionEffect: 'whale_intervention',
    actionSummary: '30% Boss Max HP Dmg + 3s Stun + +80 Margin Shield',
    basePassiveMastery: {
      greenRollDamagePct: 12,
      tickSpeedPct: 5,
    },
    unlockMinHeroStars: 4,
    accentColor: '#be123c',
  },

  // ─────────────────────────────────────────────────────────────
  // 5. QUANTUM AI ORACLE (Mythical - 4 Skills)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'oracle_flash_crash',
    heroId: 'quantum_ai_oracle',
    slotIndex: 0,
    name: 'Flash Crash Short',
    iconName: 'Cpu',
    tagline: 'Orbital Algorithmic Strike',
    description: 'Unleashes an orbital liquidation beam dealing 40% of Boss Max HP, stuns the boss, and grants +75 Margin Shield!',
    skillChargeTicks: 10,
    actionEffect: 'flash_crash',
    actionSummary: '40% Boss Max HP Dmg + Stun + +75 Margin Shield',
    basePassiveMastery: {
      tickSpeedPct: 12,
      marginHpPct: 10,
    },
    unlockMinHeroStars: 1,
    accentColor: '#38bdf8',
  },
  {
    id: 'oracle_latency_jam',
    heroId: 'quantum_ai_oracle',
    slotIndex: 1,
    name: 'Latency Jitter Jam',
    iconName: 'WifiOff',
    tagline: 'Sub-Millisecond Orderbook Disruption',
    description: 'Corrupts enemy orderbook, resetting all enemy cast bars to 0, cancels next counter attack, and deals 42% portfolio damage!',
    skillChargeTicks: 8,
    actionEffect: 'latency_jam',
    actionSummary: '42% Portfolio Dmg + Wipes Enemy Cast Bars + Counter Stun',
    basePassiveMastery: {
      interruptWindowBonus: 0.15,
      damageReductionPct: 6,
    },
    unlockMinHeroStars: 2,
    accentColor: '#0ea5e9',
  },
  {
    id: 'oracle_arbitrage_singularity',
    heroId: 'quantum_ai_oracle',
    slotIndex: 2,
    name: 'Arbitrage Singularity',
    iconName: 'Binary',
    tagline: 'High-Frequency Triangular Loop',
    description: 'Executes sub-millisecond triangular arbitrage trades dealing 65% portfolio damage and boosts tick speed by +35% for 8 ticks!',
    skillChargeTicks: 11,
    actionEffect: 'arbitrage_singularity',
    actionSummary: '65% Portfolio Dmg + +35% Tick Speed for 8 ticks',
    basePassiveMastery: {
      coinDamagePct: 10,
      greenRollOddsPct: 8,
    },
    unlockMinHeroStars: 3,
    accentColor: '#0284c7',
  },
  {
    id: 'oracle_quantum_reversal',
    heroId: 'quantum_ai_oracle',
    slotIndex: 3,
    name: 'Quantum Time-Reversal',
    iconName: 'RotateCcw',
    tagline: 'Immutable Ledger State Rollback',
    description: 'Reverses local ledger state, restoring 35% of lost Margin HP, cleansing active combat debuffs/hazards, and +100 Shield!',
    skillChargeTicks: 13,
    actionEffect: 'quantum_reversal',
    actionSummary: '+35% Lost HP Restored + Cleanses Debuffs + +100 Shield',
    basePassiveMastery: {
      marginHpPct: 12,
      damageReductionPct: 8,
    },
    unlockMinHeroStars: 4,
    accentColor: '#0369a1',
  },

  // ─────────────────────────────────────────────────────────────
  // 6. SATOSHI NAKAMOTO (Mythical - 4 Skills)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'satoshi_halving_supernova',
    heroId: 'satoshi_nakamoto',
    slotIndex: 0,
    name: 'Halving Supernova',
    iconName: 'Sun',
    tagline: '21 Million Cap Shockwave',
    description: 'Doubles all active wallet cash, blasts the Boss for 55% Max HP, wipes the enemy heavy attack cast bar, and +100 Shield!',
    skillChargeTicks: 9,
    actionEffect: 'halving_supernova',
    actionSummary: '55% Boss Max HP Dmg + 2x Wallet Cash + +100 Shield',
    basePassiveMastery: {
      coinDamagePct: 15,
      marginHpPct: 12,
    },
    unlockMinHeroStars: 1,
    accentColor: '#facc15',
  },
  {
    id: 'satoshi_proof_of_work',
    heroId: 'satoshi_nakamoto',
    slotIndex: 1,
    name: 'Proof of Work Bastion',
    iconName: 'ShieldCheck',
    tagline: 'Consensus Proof Fortress',
    description: 'Hardens cryptographic consensus, absorbing all incoming damage for 5 seconds and converting damage into Margin HP!',
    skillChargeTicks: 10,
    actionEffect: 'proof_of_work',
    actionSummary: '5s Damage Absorption + Absorbed Damage Becomes HP',
    basePassiveMastery: {
      damageReductionPct: 10,
      shieldCapacityPct: 15,
    },
    unlockMinHeroStars: 2,
    accentColor: '#eab308',
  },
  {
    id: 'satoshi_genesis_block',
    heroId: 'satoshi_nakamoto',
    slotIndex: 2,
    name: 'Genesis Block Stun',
    iconName: 'Lock',
    tagline: 'Timestamp 00000000 Consensus Freeze',
    description: 'Transmits Block 0 across the network, freezing the enemy for 4 seconds and dealing 50% portfolio damage!',
    skillChargeTicks: 8,
    actionEffect: 'genesis_block',
    actionSummary: '50% Portfolio Dmg + 4s Full Boss Freeze',
    basePassiveMastery: {
      greenRollOddsPct: 10,
      marginHpPct: 10,
    },
    unlockMinHeroStars: 3,
    accentColor: '#ca8a04',
  },
  {
    id: 'satoshi_difficulty_retarget',
    heroId: 'satoshi_nakamoto',
    slotIndex: 3,
    name: 'Difficulty Retargeting',
    iconName: 'Sliders',
    tagline: '2016-Block Difficulty Inversion',
    description: 'Reduces mining difficulty for allies while increasing enemy attack cooldown by +50% for 10 seconds, and deals 60% Max HP!',
    skillChargeTicks: 12,
    actionEffect: 'difficulty_retarget',
    actionSummary: '60% Boss Max HP Dmg + Enemy Cooldowns Slowed 50%',
    basePassiveMastery: {
      tickSpeedPct: 15,
      coinDamagePct: 15,
    },
    unlockMinHeroStars: 4,
    accentColor: '#a16207',
  },
]

export const HERO_SKILLS_MAP: Record<string, HeroSkillConfig> = Object.fromEntries(
  HERO_SKILLS.map((sk) => [sk.id, sk]),
)

export const HERO_SKILLS_BY_HERO: Record<HeroId, HeroSkillConfig[]> = {
  rookie_satoshi: HERO_SKILLS.filter((s) => s.heroId === 'rookie_satoshi'),
  degen_ape_roxy: HERO_SKILLS.filter((s) => s.heroId === 'degen_ape_roxy'),
  jordan_the_wolf: HERO_SKILLS.filter((s) => s.heroId === 'jordan_the_wolf'),
  lady_fortuna: HERO_SKILLS.filter((s) => s.heroId === 'lady_fortuna'),
  quantum_ai_oracle: HERO_SKILLS.filter((s) => s.heroId === 'quantum_ai_oracle'),
  satoshi_nakamoto: HERO_SKILLS.filter((s) => s.heroId === 'satoshi_nakamoto'),
}

export const MAX_HERO_SKILL_LEVEL = 10
export const MAX_HERO_SKILL_STARS = 5

/** Calculates upgrade cost to advance a skill from currentLevel to currentLevel + 1 */
export function getHeroSkillLevelUpCost(currentLevel: number): {
  hashrate: number
  blueprints: number
} {
  return {
    hashrate: Math.round(250 * Math.pow(1.35, Math.max(0, currentLevel - 1))),
    blueprints: Math.max(1, Math.floor(currentLevel / 2) + 1),
  }
}

/** Calculates star ascension cost (1★ -> 5★) using Hero Fragments & Hashrate */
export function getHeroSkillAscensionCost(currentStars: number): {
  hashrate: number
  fragments: number
} {
  return {
    hashrate: Math.round(1500 * Math.pow(1.5, Math.max(0, currentStars - 1))),
    fragments: Math.min(25, 5 + currentStars * 5),
  }
}

/** Calculates stat multiplier for a skill based on its level & stars */
export function getSkillMasteryMultiplier(level: number, stars: number): number {
  const lvlBonus = 1 + Math.max(0, level - 1) * 0.12
  const starBonus = 1 + Math.max(0, stars - 1) * 0.25
  return lvlBonus * starBonus
}

/** Scales passive stats according to current level & stars */
export function scalePassiveMastery(
  base: PassiveMasteryStats,
  level: number,
  stars: number,
): PassiveMasteryStats {
  const mult = getSkillMasteryMultiplier(level, stars)
  const result: PassiveMasteryStats = {}
  if (base.marginHpPct) result.marginHpPct = Math.round(base.marginHpPct * mult * 10) / 10
  if (base.coinDamagePct) result.coinDamagePct = Math.round(base.coinDamagePct * mult * 10) / 10
  if (base.greenRollOddsPct) result.greenRollOddsPct = Math.round(base.greenRollOddsPct * mult * 10) / 10
  if (base.greenRollDamagePct) result.greenRollDamagePct = Math.round(base.greenRollDamagePct * mult * 10) / 10
  if (base.tickSpeedPct) result.tickSpeedPct = Math.round(base.tickSpeedPct * mult * 10) / 10
  if (base.critDamagePct) result.critDamagePct = Math.round(base.critDamagePct * mult * 10) / 10
  if (base.damageReductionPct) result.damageReductionPct = Math.round(base.damageReductionPct * mult * 10) / 10
  if (base.bountyCashPct) result.bountyCashPct = Math.round(base.bountyCashPct * mult * 10) / 10
  if (base.shieldCapacityPct) result.shieldCapacityPct = Math.round(base.shieldCapacityPct * mult * 10) / 10
  if (base.interruptWindowBonus) result.interruptWindowBonus = Math.round(base.interruptWindowBonus * mult * 100) / 100
  return result
}
