import type { HeroId } from './heroes.config'

export type HeroSkinTier = 'default' | 'rare' | 'epic' | 'mythical'

export interface HeroSkinConfig {
  id: string
  heroId: HeroId
  name: string
  tier: HeroSkinTier
  title: string
  description: string
  /** Permanent passive bonus granted to account/hero once unlocked */
  passiveBonusText: string
  passiveBonus: {
    stat: 'damage_pct' | 'starting_seed_pct' | 'crit_chance_pct' | 'green_odds_pct' | 'speed_pct' | 'boss_bounty_pct'
    baseValue: number // e.g. 10 for +10%
  }
  /** Skill Mutation: Alters or enhances Active Skill when this skin is equipped */
  skillMutationName: string
  skillMutationDesc: string
  /** Visual customization styles for SVG and UI borders */
  visual: {
    accentColor: string
    auraGlow: string
    capeOrHoodColor: string
    trimColor: string
    hatOrCrown?: 'none' | 'cap' | 'gold_crown' | 'empress_crown' | 'visor' | 'cyber_horns' | 'halo'
    specialEffect?: string
  }
  unlockMethod: string
}

export const HERO_SKINS: HeroSkinConfig[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ROOKIE SATOSHI (4 Skins)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'rookie_satoshi_default',
    heroId: 'rookie_satoshi',
    name: 'Garage Genesis',
    tier: 'default',
    title: 'The Outskirts Origin',
    description: 'Satoshi in his classic warm orange crypto hoodie, ready to trade back to the penthouse.',
    passiveBonusText: '+5% All Coin Base Damage',
    passiveBonus: { stat: 'damage_pct', baseValue: 5 },
    skillMutationName: 'Genesis Pump',
    skillMutationDesc: 'Forces all active coins to roll GREEN on their next tick + 1.5x Profit Surge.',
    visual: {
      accentColor: '#f97316',
      auraGlow: 'rgba(249, 115, 22, 0.45)',
      capeOrHoodColor: '#ea580c',
      trimColor: '#fde047',
      hatOrCrown: 'none',
    },
    unlockMethod: 'Unlocked by Default',
  },
  {
    id: 'rookie_satoshi_cyberpunk',
    heroId: 'rookie_satoshi',
    name: 'Neon Cyberpunk',
    tier: 'rare',
    title: 'Night Market Hacker',
    description: 'Upgraded with high-frequency optic shades and glowing cyan fiber weaves.',
    passiveBonusText: '+10% All Coin Base Damage',
    passiveBonus: { stat: 'damage_pct', baseValue: 10 },
    skillMutationName: 'Overclocked Genesis',
    skillMutationDesc: 'Genesis Pump grants +15% Coin Tick Speed for 8 seconds after trigger.',
    visual: {
      accentColor: '#06b6d4',
      auraGlow: 'rgba(6, 182, 212, 0.55)',
      capeOrHoodColor: '#0f172a',
      trimColor: '#22d3ee',
      hatOrCrown: 'visor',
    },
    unlockMethod: 'Fortuna Wheel or 10 Skin Copies',
  },
  {
    id: 'rookie_satoshi_golden_bull',
    heroId: 'rookie_satoshi',
    name: 'Golden Bull Rider',
    tier: 'epic',
    title: 'Bull Market Champion',
    description: 'Woven from solid gold thread with horns forged in the fires of the halving.',
    passiveBonusText: '+15% Starting Seed Capital',
    passiveBonus: { stat: 'starting_seed_pct', baseValue: 15 },
    skillMutationName: 'Golden Bull Pump',
    skillMutationDesc: 'Genesis Pump instantly injects +$350 Seed Cash into your active trading wallet.',
    visual: {
      accentColor: '#eab308',
      auraGlow: 'rgba(234, 179, 8, 0.65)',
      capeOrHoodColor: '#ca8a04',
      trimColor: '#fef08a',
      hatOrCrown: 'cyber_horns',
    },
    unlockMethod: 'S1 Gala Pass (Tier 15) or 20 Skin Copies',
  },
  {
    id: 'rookie_satoshi_matrix',
    heroId: 'rookie_satoshi',
    name: 'Matrix Glitch Satoshi',
    tier: 'mythical',
    title: 'The Digital Anomaly',
    description: 'Transcends market volatility by bending the bytecode of the blockchain itself.',
    passiveBonusText: '+10% Global Crit Chance',
    passiveBonus: { stat: 'crit_chance_pct', baseValue: 10 },
    skillMutationName: 'Glitch Halving Blast',
    skillMutationDesc: 'Genesis Pump triggers 2 consecutive forced GREEN ticks across all active coins.',
    visual: {
      accentColor: '#10b981',
      auraGlow: 'rgba(16, 185, 129, 0.75)',
      capeOrHoodColor: '#064e3b',
      trimColor: '#6ee7b7',
      hatOrCrown: 'halo',
    },
    unlockMethod: 'Wheel Jackpot or 30 Skin Copies',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DEGEN APE ROXY (4 Skins)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'degen_ape_roxy_default',
    heroId: 'degen_ape_roxy',
    name: 'Meme Commander',
    tier: 'default',
    title: 'Moonshot General',
    description: 'Streetwear varsity jacket with pink visor shades and gold street cap.',
    passiveBonusText: '+5% Meme Coin Damage',
    passiveBonus: { stat: 'damage_pct', baseValue: 5 },
    skillMutationName: 'YOLO Leverage',
    skillMutationDesc: 'Supercharges all wallets with +45% Up Odds & 2x Crit Damage for 5 ticks.',
    visual: {
      accentColor: '#2563eb',
      auraGlow: 'rgba(37, 99, 235, 0.45)',
      capeOrHoodColor: '#1d4ed8',
      trimColor: '#facc15',
      hatOrCrown: 'cap',
    },
    unlockMethod: 'Unlocked with Degen Ape Roxy',
  },
  {
    id: 'degen_ape_roxy_diamond',
    heroId: 'degen_ape_roxy',
    name: 'Diamond Hands Boxer',
    tier: 'rare',
    title: 'Undisputed HODL Champ',
    description: 'Gleaming diamond championship gloves that never sell regardless of the dip.',
    passiveBonusText: '+8% All Coin Base Damage',
    passiveBonus: { stat: 'damage_pct', baseValue: 8 },
    skillMutationName: 'Diamond Knockout',
    skillMutationDesc: 'YOLO Leverage grants +25 Margin Shield when activated.',
    visual: {
      accentColor: '#38bdf8',
      auraGlow: 'rgba(56, 189, 248, 0.55)',
      capeOrHoodColor: '#0284c7',
      trimColor: '#bae6fd',
      hatOrCrown: 'none',
    },
    unlockMethod: 'Fortuna Wheel or 10 Skin Copies',
  },
  {
    id: 'degen_ape_roxy_laser_eye',
    heroId: 'degen_ape_roxy',
    name: 'Laser-Eye Maximalist',
    tier: 'epic',
    title: '100k or Zero',
    description: 'Equipped with twin orbital red laser optics that vaporize short sellers.',
    passiveBonusText: '+15% Crit Damage Multiplier',
    passiveBonus: { stat: 'crit_chance_pct', baseValue: 8 },
    skillMutationName: 'Laser Beam Leverage',
    skillMutationDesc: 'YOLO Leverage lasts 8 ticks (up from 5) and deals 20% bonus crit damage.',
    visual: {
      accentColor: '#ef4444',
      auraGlow: 'rgba(239, 68, 68, 0.65)',
      capeOrHoodColor: '#b91c1c',
      trimColor: '#fca5a5',
      hatOrCrown: 'visor',
    },
    unlockMethod: 'S1 Gala Pass or 20 Skin Copies',
  },
  {
    id: 'degen_ape_roxy_galactic',
    heroId: 'degen_ape_roxy',
    name: 'Galactic Moon Explorer',
    tier: 'mythical',
    title: 'Interstellar Ape Alpha',
    description: 'Full pressurized gold-plated spacesuit built for voyages to the moon and beyond.',
    passiveBonusText: '+20% Starting Seed Capital',
    passiveBonus: { stat: 'starting_seed_pct', baseValue: 20 },
    skillMutationName: 'Zero-G Moonshot',
    skillMutationDesc: 'YOLO Leverage triggers an immediate 2.5x Profit Surge on all active Meme Coins.',
    visual: {
      accentColor: '#a855f7',
      auraGlow: 'rgba(168, 85, 247, 0.75)',
      capeOrHoodColor: '#6b21a8',
      trimColor: '#f0abfc',
      hatOrCrown: 'halo',
    },
    unlockMethod: 'Wheel Jackpot or 30 Skin Copies',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. JORDAN THE WOLF (4 Skins)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'jordan_the_wolf_default',
    heroId: 'jordan_the_wolf',
    name: 'Wall Street Raider',
    tier: 'default',
    title: 'The Wolf of Crypto',
    description: 'Sharp navy pinstripe suit, power red tie, and gold aviator sunglasses.',
    passiveBonusText: '-100% Gas Fees & +$200 on Rebalance',
    passiveBonus: { stat: 'boss_bounty_pct', baseValue: 10 },
    skillMutationName: 'Hostile Takeover',
    skillMutationDesc: 'Injects +25% bonus liquidity into every active wallet & restores +30 Margin HP.',
    visual: {
      accentColor: '#334155',
      auraGlow: 'rgba(51, 65, 85, 0.45)',
      capeOrHoodColor: '#1e293b',
      trimColor: '#ef4444',
      hatOrCrown: 'visor',
    },
    unlockMethod: 'Unlocked with Jordan the Wolf',
  },
  {
    id: 'jordan_the_wolf_savile_row',
    heroId: 'jordan_the_wolf',
    name: 'Savile Row Bespoke',
    tier: 'rare',
    title: 'High-Society Arbitrageur',
    description: 'Double-breasted Italian wool suit with gold cufflinks and silk pocket square.',
    passiveBonusText: '+15% Boss Bounty Cash',
    passiveBonus: { stat: 'boss_bounty_pct', baseValue: 15 },
    skillMutationName: 'Golden Handshake',
    skillMutationDesc: 'Hostile Takeover restores +50 Margin HP and generates +$250 cash.',
    visual: {
      accentColor: '#475569',
      auraGlow: 'rgba(71, 85, 105, 0.55)',
      capeOrHoodColor: '#0f172a',
      trimColor: '#e2e8f0',
      hatOrCrown: 'none',
    },
    unlockMethod: 'Fortuna Wheel or 10 Skin Copies',
  },
  {
    id: 'jordan_the_wolf_yacht',
    heroId: 'jordan_the_wolf',
    name: 'Billionaire Yacht Wolf',
    tier: 'epic',
    title: 'Offshore Mogul',
    description: 'Crisp nautical white blazer, linen trousers, and solid platinum sunglasses.',
    passiveBonusText: '+15% Starting Seed Capital',
    passiveBonus: { stat: 'starting_seed_pct', baseValue: 15 },
    skillMutationName: 'Offshore Arbitrage Sweep',
    skillMutationDesc: 'Hostile Takeover injects +35% liquidity and steals 10% Boss cash immediately.',
    visual: {
      accentColor: '#38bdf8',
      auraGlow: 'rgba(56, 189, 248, 0.65)',
      capeOrHoodColor: '#f8fafc',
      trimColor: '#0284c7',
      hatOrCrown: 'cap',
    },
    unlockMethod: 'S1 Gala Pass or 20 Skin Copies',
  },
  {
    id: 'jordan_the_wolf_apex',
    heroId: 'jordan_the_wolf',
    name: 'Apex Sovereign Wolf',
    tier: 'mythical',
    title: 'Apex Predator of the Floor',
    description: 'Jet black cyber-trenchcoat laced with golden runic charts and an imposing gold crown.',
    passiveBonusText: '+18% Global Coin Damage',
    passiveBonus: { stat: 'damage_pct', baseValue: 18 },
    skillMutationName: 'Hostile Monopoly',
    skillMutationDesc: 'Hostile Takeover grants 4 seconds of damage immunity and doubles next 3 coin ticks.',
    visual: {
      accentColor: '#f59e0b',
      auraGlow: 'rgba(245, 158, 11, 0.75)',
      capeOrHoodColor: '#78350f',
      trimColor: '#fde047',
      hatOrCrown: 'gold_crown',
    },
    unlockMethod: 'Wheel Jackpot or 30 Skin Copies',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. LADY FORTUNA (4 Skins - FLAGSHIP S1 HERO)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'lady_fortuna_default',
    heroId: 'lady_fortuna',
    name: 'High-Roller Whale',
    tier: 'default',
    title: 'Queen of the Spread',
    description: 'Royal crimson velvet gown with gleaming gold trim and delicate whale crown.',
    passiveBonusText: '+8% All Green Roll Odds',
    passiveBonus: { stat: 'green_odds_pct', baseValue: 8 },
    skillMutationName: 'Royal All-In',
    skillMutationDesc: 'Triggers an instant 2.2x Golden Candle across all wallets & +35 Margin Shield.',
    visual: {
      accentColor: '#e11d48',
      auraGlow: 'rgba(225, 29, 72, 0.50)',
      capeOrHoodColor: '#be123c',
      trimColor: '#fde047',
      hatOrCrown: 'gold_crown',
    },
    unlockMethod: 'Unlocked with Lady Fortuna',
  },
  {
    id: 'lady_fortuna_velvet',
    heroId: 'lady_fortuna',
    name: 'Velvet Casino Queen',
    tier: 'rare',
    title: 'Lady of the Roulette',
    description: 'Midnight sapphire gown accented with emerald roulette numbers and crystal tiara.',
    passiveBonusText: '+12% Starting Seed Capital',
    passiveBonus: { stat: 'starting_seed_pct', baseValue: 12 },
    skillMutationName: 'Roulette Spin All-In',
    skillMutationDesc: 'Royal All-In rolls a roulette bonus: 50% chance to grant +$500 instant Cash.',
    visual: {
      accentColor: '#4338ca',
      auraGlow: 'rgba(67, 56, 202, 0.55)',
      capeOrHoodColor: '#312e81',
      trimColor: '#a5b4fc',
      hatOrCrown: 'gold_crown',
    },
    unlockMethod: 'Fortuna Wheel or 10 Skin Copies',
  },
  {
    id: 'lady_fortuna_monte_carlo',
    heroId: 'lady_fortuna',
    name: 'Monte Carlo VIP',
    tier: 'epic',
    title: 'Riviera High-Society',
    description: 'Dazzling platinum dress adorned with cascading diamond chains and emerald sunglasses.',
    passiveBonusText: '+10% Global Coin Damage',
    passiveBonus: { stat: 'damage_pct', baseValue: 10 },
    skillMutationName: 'Monte Carlo Dividend',
    skillMutationDesc: 'Royal All-In adds an immediate $800 Cash Dividend Injection + +45 Margin Shield.',
    visual: {
      accentColor: '#059669',
      auraGlow: 'rgba(5, 150, 105, 0.65)',
      capeOrHoodColor: '#065f46',
      trimColor: '#6ee7b7',
      hatOrCrown: 'visor',
    },
    unlockMethod: 'Wheel 80-Pull Milestone or S1 Gala Pass',
  },
  {
    id: 'lady_fortuna_empress',
    heroId: 'lady_fortuna',
    name: 'Sovereign Empress',
    tier: 'mythical',
    title: 'Goddess of Bull Markets',
    description: 'Regal golden imperial robe with flowing starlight cape, floating cards, and sovereign crown.',
    passiveBonusText: '+15% Global Crit Chance & +10% Green Odds',
    passiveBonus: { stat: 'crit_chance_pct', baseValue: 15 },
    skillMutationName: 'Sovereign Super-Candle',
    skillMutationDesc: 'Boosts Royal All-In from 2.2x to 3.0x Golden Candle + +55 Margin Shield and clears boss debuffs!',
    visual: {
      accentColor: '#f59e0b',
      auraGlow: 'rgba(245, 158, 11, 0.85)',
      capeOrHoodColor: '#991b1b',
      trimColor: '#fde047',
      hatOrCrown: 'empress_crown',
    },
    unlockMethod: 'Whale Pass, Wheel Jackpot or 30 Skin Copies',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. QUANTUM AI ORACLE (4 Skins)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'quantum_ai_oracle_default',
    heroId: 'quantum_ai_oracle',
    name: 'Singularity Core',
    tier: 'default',
    title: 'Arbitrage AI Matrix',
    description: 'Deep purple cyber-hood with glowing blue and gold algorithmic optics.',
    passiveBonusText: '+10% Coin Tick Speed',
    passiveBonus: { stat: 'speed_pct', baseValue: 10 },
    skillMutationName: 'Flash Crash Short',
    skillMutationDesc: 'Unleashes an Orbital Liquidation Beam dealing 35% Boss HP + +40 Margin Shield.',
    visual: {
      accentColor: '#6b21a8',
      auraGlow: 'rgba(107, 33, 168, 0.50)',
      capeOrHoodColor: '#581c87',
      trimColor: '#38bdf8',
      hatOrCrown: 'none',
    },
    unlockMethod: 'Unlocked with Quantum AI Oracle',
  },
  {
    id: 'quantum_ai_oracle_holo',
    heroId: 'quantum_ai_oracle',
    name: 'Holo-Circuit Mage',
    tier: 'rare',
    title: 'High-Frequency Spellcaster',
    description: 'Luminous cyan holographic cloak humming with quantum entanglement threads.',
    passiveBonusText: '+12% Coin Tick Speed',
    passiveBonus: { stat: 'speed_pct', baseValue: 12 },
    skillMutationName: 'Holo-Beam Liquidation',
    skillMutationDesc: 'Flash Crash Short deals 40% Boss HP and speeds up coins by 20% for 6 seconds.',
    visual: {
      accentColor: '#0284c7',
      auraGlow: 'rgba(2, 132, 199, 0.60)',
      capeOrHoodColor: '#0369a1',
      trimColor: '#7dd3fc',
      hatOrCrown: 'visor',
    },
    unlockMethod: 'Fortuna Wheel or 10 Skin Copies',
  },
  {
    id: 'quantum_ai_oracle_deep_space',
    heroId: 'quantum_ai_oracle',
    name: 'Deep-Space Quantum',
    tier: 'epic',
    title: 'Void Arbitrageur',
    description: 'Cosmic nebula cloak shifting between deep violet and solar flare orange.',
    passiveBonusText: '+14% All Coin Base Damage',
    passiveBonus: { stat: 'damage_pct', baseValue: 14 },
    skillMutationName: 'Supernova Liquidation',
    skillMutationDesc: 'Flash Crash Short deals 45% Boss HP and grants +50 Margin Shield.',
    visual: {
      accentColor: '#4f46e5',
      auraGlow: 'rgba(79, 70, 229, 0.70)',
      capeOrHoodColor: '#3730a3',
      trimColor: '#c7d2fe',
      hatOrCrown: 'halo',
    },
    unlockMethod: 'S1 Gala Pass or 20 Skin Copies',
  },
  {
    id: 'quantum_ai_oracle_omniscience',
    heroId: 'quantum_ai_oracle',
    name: 'Cosmic Omniscience',
    tier: 'mythical',
    title: 'God of Algorithmic Order',
    description: 'Pure radiant energy avatar surrounded by rotating golden quantum rings.',
    passiveBonusText: '+16% All Green Roll Odds',
    passiveBonus: { stat: 'green_odds_pct', baseValue: 16 },
    skillMutationName: 'Singularity Collapse',
    skillMutationDesc: 'Flash Crash Short deals 50% Boss HP and permanently slows Boss tick speed by 25%.',
    visual: {
      accentColor: '#38bdf8',
      auraGlow: 'rgba(56, 189, 248, 0.85)',
      capeOrHoodColor: '#0c4a6e',
      trimColor: '#fde047',
      hatOrCrown: 'halo',
    },
    unlockMethod: 'Wheel Jackpot or 30 Skin Copies',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SATOSHI NAKAMOTO (4 Skins)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'satoshi_nakamoto_default',
    heroId: 'satoshi_nakamoto',
    name: 'Genesis Architect',
    tier: 'default',
    title: 'The Creator',
    description: 'Majestic golden sovereign cloak with cyber-architect halo and glowing consensus crest.',
    passiveBonusText: '+15% All Coin Base Damage',
    passiveBonus: { stat: 'damage_pct', baseValue: 15 },
    skillMutationName: 'Halving Supernova',
    skillMutationDesc: 'Doubles all active wallet cash & blasts the Boss for 45% Max HP.',
    visual: {
      accentColor: '#facc15',
      auraGlow: 'rgba(250, 204, 21, 0.55)',
      capeOrHoodColor: '#78350f',
      trimColor: '#fef08a',
      hatOrCrown: 'halo',
    },
    unlockMethod: 'Unlocked with Satoshi Nakamoto',
  },
  {
    id: 'satoshi_nakamoto_cypherpunk',
    heroId: 'satoshi_nakamoto',
    name: 'Cypherpunk Shadow',
    tier: 'rare',
    title: 'Cryptographic Ghost',
    description: 'Black carbon-fiber hoodie masked in encrypted terminal streams and emerald code glyphs.',
    passiveBonusText: '+12% All Coin Base Damage',
    passiveBonus: { stat: 'damage_pct', baseValue: 12 },
    skillMutationName: 'Encrypted Halving',
    skillMutationDesc: 'Halving Supernova prevents red rolls on Slots #1 and #2 for 8 seconds.',
    visual: {
      accentColor: '#10b981',
      auraGlow: 'rgba(16, 185, 129, 0.60)',
      capeOrHoodColor: '#064e3b',
      trimColor: '#34d399',
      hatOrCrown: 'visor',
    },
    unlockMethod: 'Fortuna Wheel or 10 Skin Copies',
  },
  {
    id: 'satoshi_nakamoto_golden_halving',
    heroId: 'satoshi_nakamoto',
    name: 'Golden Sovereign Halving',
    tier: 'epic',
    title: '21 Million Absolute',
    description: 'Woven entirely from gilded Genesis Block data blocks with a solid gold bull aura.',
    passiveBonusText: '+20% Starting Seed Capital',
    passiveBonus: { stat: 'starting_seed_pct', baseValue: 20 },
    skillMutationName: 'Genesis Halving Supernova',
    skillMutationDesc: 'Halving Supernova deals 55% Boss HP and triples wallet cash instantly.',
    visual: {
      accentColor: '#eab308',
      auraGlow: 'rgba(234, 179, 8, 0.70)',
      capeOrHoodColor: '#854d0e',
      trimColor: '#fde047',
      hatOrCrown: 'gold_crown',
    },
    unlockMethod: 'S1 Gala Pass or 20 Skin Copies',
  },
  {
    id: 'satoshi_nakamoto_god_blockchain',
    heroId: 'satoshi_nakamoto',
    name: 'God of the Blockchain',
    tier: 'mythical',
    title: 'Eternal Sovereign of Sound Money',
    description: 'Ascended celestial being flanked by orbiting crystalline genesis nodes and radiant golden rings.',
    passiveBonusText: '+25% Global Coin Damage & +15% Green Odds',
    passiveBonus: { stat: 'damage_pct', baseValue: 25 },
    skillMutationName: 'Omnipotent Halving Burst',
    skillMutationDesc: 'Halving Supernova blasts the Boss for 65% Max HP, triples wallet cash, and grants 5s Invulnerability!',
    visual: {
      accentColor: '#f59e0b',
      auraGlow: 'rgba(245, 158, 11, 0.90)',
      capeOrHoodColor: '#451a03',
      trimColor: '#fde68a',
      hatOrCrown: 'empress_crown',
    },
    unlockMethod: 'Wheel Jackpot or 30 Skin Copies',
  },
]

export const SKIN_MAP: Record<string, HeroSkinConfig> = Object.fromEntries(
  HERO_SKINS.map((s) => [s.id, s]),
)

export const HERO_SKINS_BY_HERO: Record<HeroId, HeroSkinConfig[]> = HERO_SKINS.reduce(
  (acc, skin) => {
    acc[skin.heroId] = acc[skin.heroId] || []
    acc[skin.heroId].push(skin)
    return acc
  },
  {} as Record<HeroId, HeroSkinConfig[]>,
)

export const MAX_SKIN_STARS = 5

/** Duplicate copies needed to ascend from currentStar to currentStar + 1 */
export function getSkinAscensionCost(currentStar: number): number {
  switch (currentStar) {
    case 1:
      return 1 // 1★ -> 2★
    case 2:
      return 2 // 2★ -> 3★
    case 3:
      return 3 // 3★ -> 4★
    case 4:
      return 4 // 4★ -> 5★
    default:
      return 999
  }
}

/** Star multiplier: 1★ = 100%, 2★ = 125%, 3★ = 150%, 4★ = 175%, 5★ = 200% (+25% per Star) */
export function getSkinStarMultiplier(stars: number): number {
  return 1 + (Math.max(1, Math.min(MAX_SKIN_STARS, stars)) - 1) * 0.25
}

export const SKIN_TIER_THEMES: Record<
  HeroSkinTier,
  { label: string; badgeBg: string; textCol: string; borderCol: string; ringCol: string }
> = {
  default: {
    label: 'DEFAULT',
    badgeBg: 'bg-[#78350f]',
    textCol: 'text-amber-200',
    borderCol: 'border-[#78350f]',
    ringCol: 'ring-amber-700/50',
  },
  rare: {
    label: 'RARE',
    badgeBg: 'bg-cyan-600',
    textCol: 'text-cyan-100',
    borderCol: 'border-cyan-600',
    ringCol: 'ring-cyan-400',
  },
  epic: {
    label: 'EPIC',
    badgeBg: 'bg-purple-600',
    textCol: 'text-purple-100',
    borderCol: 'border-purple-600',
    ringCol: 'ring-purple-400',
  },
  mythical: {
    label: 'MYTHICAL',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-rose-500',
    textCol: 'text-yellow-100',
    borderCol: 'border-amber-500',
    ringCol: 'ring-amber-300 animate-pulse',
  },
}
