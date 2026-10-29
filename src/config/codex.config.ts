import { COINS } from './coins.config'
import { HEROES } from './heroes.config'
import { RELICS } from './relics.config'
import { EVOLUTIONS } from './evolutions.config'
import type { Rarity } from '../types/game.types'

export type CodexCategory = 'coins' | 'heroes' | 'relics' | 'bosses'

export interface CodexEntry {
  id: string
  category: CodexCategory
  name: string
  subtitle: string
  rarity: Rarity
  icon: string
  description: string
  howToDiscover: string
}

export const CODEX_BOSSES: Array<{
  id: string
  name: string
  subtitle: string
  rarity: Rarity
  icon: string
  description: string
  howToDiscover: string
}> = [
  {
    id: 'boss_street_scammer',
    name: 'Street Scammer',
    subtitle: 'Outskirts Ambush Mob',
    rarity: 'common',
    icon: 'Skull',
    description: 'Peddles sketchy seed phrases and counterfeit hardware wallets on the roadside.',
    howToDiscover: 'Defeat in Tutorial or Stage 1.',
  },
  {
    id: 'boss_penny_pumper',
    name: 'Penny Stock Pumper',
    subtitle: 'Micro-Cap Manipulator',
    rarity: 'uncommon',
    icon: 'TrendingUp',
    description: 'Hypes worthless illiquid tokens before dumping millions of bags on retail traders.',
    howToDiscover: 'Encounter in Stage 1 or Tower Floor 1.',
  },
  {
    id: 'boss_bear_whale',
    name: 'The Sovereign Bear Whale',
    subtitle: 'Apex Market Maker',
    rarity: 'legendary',
    icon: 'Fish',
    description: 'A colossal market maker who single-handedly liquidates entire leveraged exchanges with massive red candles.',
    howToDiscover: 'Defeat at Stage 1 / Node 30 or Tower Floor 15.',
  },
  {
    id: 'boss_sec_enforcer',
    name: 'SEC Enforcer',
    subtitle: 'Regulatory Gavel',
    rarity: 'rare',
    icon: 'Gavel',
    description: 'Freezes account liquidity and issues subpoenas right at the market open.',
    howToDiscover: 'Defeat at Stage 2 / Node 30.',
  },
  {
    id: 'boss_rug_pull_overlord',
    name: 'Rug Pull Overlord',
    subtitle: 'Smart Contract Drainer',
    rarity: 'epic',
    icon: 'Drama',
    description: 'Removes all DEX liquidity pools in a single transaction block and disables trading.',
    howToDiscover: 'Defeat at Stage 3 / Node 30.',
  },
  {
    id: 'boss_flash_crash_phantom',
    name: 'Flash Crash Phantom',
    subtitle: 'Cascade Specialist',
    rarity: 'epic',
    icon: 'TrendingDown',
    description: 'Wipes orderbooks in 15 milliseconds, triggering cascading stop-loss liquidations.',
    howToDiscover: 'Defeat at Stage 4 / Node 30.',
  },
  {
    id: 'boss_gas_baron',
    name: 'The Gas Baron',
    subtitle: 'Mempool Extortionist',
    rarity: 'rare',
    icon: 'Fuel',
    description: 'Spams network transactions to drive gas fees to astronomical levels.',
    howToDiscover: 'Defeat at Stage 5 / Node 30.',
  },
  {
    id: 'boss_alameda_liquidator',
    name: 'Alameda Liquidator',
    subtitle: 'Margin Hunter AI',
    rarity: 'mythical',
    icon: 'Skull',
    description: 'Hunts overleveraged margin traders and forces automatic collateral liquidations.',
    howToDiscover: 'Defeat in Tower Floor 10 or Syndicate Raid.',
  },
  {
    id: 'boss_microstrategy_shifter',
    name: 'MicroStrategy Shifter',
    subtitle: 'Corporate Treasury Titan',
    rarity: 'legendary',
    icon: 'Building2',
    description: 'Accumulates tens of thousands of coins on leverage to distort price action.',
    howToDiscover: 'Defeat in Tower Floor 5.',
  },
  {
    id: 'boss_quantum_citadel_ai',
    name: 'Quantum Citadel AI',
    subtitle: 'Algorithmic Sovereign',
    rarity: 'mythical',
    icon: 'Cpu',
    description: 'Supercomputing high-frequency arbitrage cluster calculating every market movement.',
    howToDiscover: 'Defeat in Tower Floor 20.',
  },
]

export const CODEX_CLAIM_GEMS_REWARD = 20

/**
 * Builds the complete list of Codex entries across Coins, Heroes, Relics, and Bosses.
 */
export function getFullCodexEntries(): CodexEntry[] {
  const list: CodexEntry[] = []

  // 1. Coins
  for (const c of COINS) {
    list.push({
      id: `coin_${c.id}`,
      category: 'coins',
      name: c.name,
      subtitle: `${c.ticker} • Grade ${c.grade}`,
      rarity: c.rarity,
      icon: c.icon,
      description: `${c.flavor} Base tick speed: ${c.baseTickSpeed}s.`,
      howToDiscover: 'Acquire via Angel/VC Vault or Shop.',
    })
  }

  // Evolved Coins
  for (const evo of EVOLUTIONS) {
    list.push({
      id: `evo_${evo.id}`,
      category: 'coins',
      name: evo.name,
      subtitle: `${evo.ticker} • Hard-Fork Evolution`,
      rarity: 'mythical',
      icon: evo.icon,
      description: evo.description,
      howToDiscover: `Evolve in-run by combining ${evo.baseCoinId} + 3★ Skill + Relic.`,
    })
  }

  // 2. Heroes
  for (const h of HEROES) {
    list.push({
      id: `hero_${h.id}`,
      category: 'heroes',
      name: h.name,
      subtitle: h.title,
      rarity: h.rarity,
      icon: 'Shield',
      description: `Passive: ${h.passiveName} (${h.passiveDesc}). Active: ${h.activeSkillName}.`,
      howToDiscover: 'Unlock in Base HQ with 50 Fragments or Gems.',
    })
  }

  // 3. Relics
  for (const r of RELICS) {
    list.push({
      id: `relic_${r.id}`,
      category: 'relics',
      name: r.name,
      subtitle: `Algo Relic • Cost $${r.shopPrice}`,
      rarity: r.rarity,
      icon: r.icon,
      description: r.description,
      howToDiscover: 'Purchase in Black Market or draft during runs.',
    })
  }

  // 4. Bosses
  for (const b of CODEX_BOSSES) {
    list.push({
      id: b.id,
      category: 'bosses',
      name: b.name,
      subtitle: b.subtitle,
      rarity: b.rarity,
      icon: b.icon,
      description: b.description,
      howToDiscover: b.howToDiscover,
    })
  }

  return list
}
