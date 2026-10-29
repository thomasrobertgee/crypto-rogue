import { COINS } from './coins.config'
import { HEROES } from './heroes.config'
import { RELICS } from './relics.config'
import { EVOLUTIONS } from './evolutions.config'
import { MYTHIC_SKILL_EVOLUTIONS } from './runSkills.config'
import { RIG_CORPORATE_SETS, CATALOG_RIG_ITEMS } from './equipment.config'
import type { Rarity } from '../types/game.types'

export type CodexCategory =
  | 'enemies'
  | 'bosses'
  | 'coins'
  | 'rigs'
  | 'mythics'
  | 'heroes'
  | 'relics'

export interface CodexEntry {
  id: string
  category: CodexCategory
  name: string
  subtitle: string
  rarity: Rarity
  icon: string
  description: string
  lore: string
  howToDiscover: string
}

export const CODEX_ENEMIES: Array<{
  id: string
  name: string
  subtitle: string
  rarity: Rarity
  icon: string
  description: string
  lore: string
  howToDiscover: string
}> = [
  {
    id: 'enemy_paper_hands',
    name: 'Paper Hands',
    subtitle: 'Panic Seller Mob',
    rarity: 'common',
    icon: 'TrendingDown',
    description: 'Dumps their entire life savings the millisecond a 1-minute candle turns slightly pink.',
    lore: 'He bought the absolute top after watching a 15-second TikTok and panic-sold the bottom for a 94% loss. Now he haunts the orderbook trying to convince you that cash under a mattress is the real alpha.',
    howToDiscover: 'Encounter in Normal Market Nodes (Stages 1+).',
  },
  {
    id: 'enemy_bagholder',
    name: 'Bagholder',
    subtitle: '2021 Top Buyer',
    rarity: 'common',
    icon: 'Briefcase',
    description: 'Still waiting for his defunct algorithmic dog token to return to its all-time high.',
    lore: 'He insists he is "in it for the technology" while eating instant ramen by the glow of a -99.8% portfolio chart. His bags are so heavy they generate their own gravitational field on the highway.',
    howToDiscover: 'Encounter in Normal Market Nodes (Stages 1+).',
  },
  {
    id: 'enemy_exit_liquidity',
    name: 'Exit Liquidity',
    subtitle: 'Retail Cannon Fodder',
    rarity: 'common',
    icon: 'Users',
    description: 'Appears right when insiders need someone to buy their unlocked VC tokens.',
    lore: 'Every time an influencer tweets a rocket emoji, three thousand of these guys materialize with maxed-out credit cards. They consider a 40% slippage fee a small price to pay for community vibes.',
    howToDiscover: 'Encounter in Normal Market Nodes (Stages 1+).',
  },
  {
    id: 'enemy_pump_bot',
    name: 'Pump Bot',
    subtitle: 'Automated Wash Trader',
    rarity: 'uncommon',
    icon: 'Bot',
    description: 'Trades the same token back and forth between two wallets 900 times a minute.',
    lore: 'Written in 40 lines of spaghetti Python by a teenager in a cybercafe, this bot creates 80% of all fake exchange volume. If you unplug its Raspberry Pi, nine decentralized exchanges immediately flatline.',
    howToDiscover: 'Encounter in Floor 1–2 Combat Nodes.',
  },
  {
    id: 'enemy_shill_account',
    name: 'Shill Account',
    subtitle: 'Verified Reply Guy',
    rarity: 'uncommon',
    icon: 'Megaphone',
    description: 'Floods every comment section with laser-eye selfies and fake giveaway links.',
    lore: 'Paid $4 in worthless governance tokens per week, this relentless reply-guy has typed "WAGMI" forty thousand times without blinking. His bio says "Financial Freedom Coach," yet he borrows Wi-Fi from the neighbor.',
    howToDiscover: 'Encounter in Floor 1–2 Combat Nodes.',
  },
  {
    id: 'enemy_copy_trader',
    name: 'Copy Trader',
    subtitle: 'Delayed Signal Follower',
    rarity: 'rare',
    icon: 'Copy',
    description: 'Mirrors whale trades 12 seconds too late, turning every winning setup into a loss.',
    lore: 'He subscribed to five VIP Telegram signal channels and somehow managed to long and short the exact same candle into double liquidation. Even when he copies a winning wallet, the exchange lags just for him.',
    howToDiscover: 'Encounter in Elite Market Nodes (Floor 2+).',
  },
  {
    id: 'enemy_mev_sandwich_bot',
    name: 'MEV Sandwich Bot',
    subtitle: 'Mempool Predator',
    rarity: 'epic',
    icon: 'Zap',
    description: 'Front-runs your buy order and back-runs your slippage in the same block.',
    lore: 'Lurking in the dark forest of the Ethereum mempool, it smells your 5% slippage tolerance from three blocks away. It eats your lunch, tips the validator with your own gas fee, and leaves you with dust.',
    howToDiscover: 'Encounter in Elite Volatility Nodes (Floor 2–3).',
  },
  {
    id: 'enemy_short_seller',
    name: 'Short Seller',
    subtitle: 'Perpetual Funding Vampire',
    rarity: 'epic',
    icon: 'ArrowDownRight',
    description: 'Borrows assets he does not own to slam red candles into the support line.',
    lore: 'He cheers whenever a bridge gets hacked and sends celebratory champagne to regulatory subpoena writers. Nothing terrifies him more than a sudden green God-candle funded by stimulus checks.',
    howToDiscover: 'Encounter in Hardcore Volatility Nodes (Floor 3).',
  },
]

export const CODEX_BOSSES: Array<{
  id: string
  name: string
  subtitle: string
  rarity: Rarity
  icon: string
  description: string
  lore: string
  howToDiscover: string
}> = [
  {
    id: 'boss_street_scammer',
    name: 'Street Scammer',
    subtitle: 'Outskirts Ambush Mob',
    rarity: 'common',
    icon: 'Skull',
    description: 'Peddles sketchy seed phrases and counterfeit hardware wallets on the roadside.',
    lore: 'He claims to be the Nigerian Prince of Web3 and promises to double your Bitcoin if you send it to his "verification address" first. His hardware wallets come pre-loaded with a helpful backup sticky note.',
    howToDiscover: 'Defeat in Tutorial or Stage 1.',
  },
  {
    id: 'boss_penny_pumper',
    name: 'Penny Stock Pumper',
    subtitle: 'Micro-Cap Manipulator',
    rarity: 'uncommon',
    icon: 'TrendingUp',
    description: 'Hypes worthless illiquid tokens before dumping millions of bags on retail traders.',
    lore: 'Graduated from boiler-room pink sheets straight to decentralized meme tokens without changing his cold-call script. He owns 98% of the circulating supply across forty "community marketing" wallets.',
    howToDiscover: 'Encounter in Stage 1 or Tower Floor 1.',
  },
  {
    id: 'boss_bear_whale',
    name: 'The Sovereign Bear Whale',
    subtitle: 'Apex Market Maker',
    rarity: 'legendary',
    icon: 'Fish',
    description: 'A colossal market maker who single-handedly liquidates entire leveraged exchanges with massive red candles.',
    lore: 'Once every cycle, this ancient leviathan wakes from a yacht in Monaco to place a 30,000 BTC sell wall just for entertainment. Retail traders draw triangles on charts for weeks trying to explain his fat-finger sneeze.',
    howToDiscover: 'Defeat at Stage 1 / Node 30 or Tower Floor 15.',
  },
  {
    id: 'boss_sec_enforcer',
    name: 'SEC Enforcer',
    subtitle: 'Regulatory Gavel',
    rarity: 'rare',
    icon: 'Gavel',
    description: 'Freezes account liquidity and issues subpoenas right at the market open.',
    lore: 'Armed with a 1946 orange-grove court case and an infinite supply of Wells Notices, he considers every digital smiley face an unregistered security. He still faxes his cease-and-desist letters to smart contracts.',
    howToDiscover: 'Defeat at Stage 2 / Node 30.',
  },
  {
    id: 'boss_rug_pull_overlord',
    name: 'Rug Pull Overlord',
    subtitle: 'Smart Contract Drainer',
    rarity: 'epic',
    icon: 'Drama',
    description: 'Removes all DEX liquidity pools in a single transaction block and disables trading.',
    lore: 'He promised a revolutionary AI-powered metaverse game, delivered a stolen JPEG roadmap, and vanished into a mixer at 3:00 AM. His farewell Discord announcement simply read: "Hackers got the keys, stay strong fam."',
    howToDiscover: 'Defeat at Stage 3 / Node 30.',
  },
  {
    id: 'boss_flash_crash_phantom',
    name: 'Flash Crash Phantom',
    subtitle: 'Cascade Specialist',
    rarity: 'epic',
    icon: 'TrendingDown',
    description: 'Wipes orderbooks in 15 milliseconds, triggering cascading stop-loss liquidations.',
    lore: 'Born from a decimal-point typo in an institutional trading terminal, it wicks Bitcoin down to $0.01 on illiquid pairs before bouncing back in the same second. Your stop-loss filled at the bottom; its limit buy filled right beside it.',
    howToDiscover: 'Defeat at Stage 4 / Node 30.',
  },
  {
    id: 'boss_gas_baron',
    name: 'The Gas Baron',
    subtitle: 'Mempool Extortionist',
    rarity: 'rare',
    icon: 'Fuel',
    description: 'Spams network transactions to drive gas fees to astronomical levels.',
    lore: 'Why pay $5 for a token swap when you can pay $640 in gas fees for a failed transaction? The Gas Baron mints 10,000 procedural rock JPEGs every time you try to rebalance your portfolio.',
    howToDiscover: 'Defeat at Stage 5 / Node 30.',
  },
  {
    id: 'boss_alameda_liquidator',
    name: 'Alameda Liquidator',
    subtitle: 'Margin Hunter AI',
    rarity: 'mythical',
    icon: 'Skull',
    description: 'Hunts overleveraged margin traders and forces automatic collateral liquidations.',
    lore: 'Running on a beanbag chair in the Bahamas with a secret negative-balance exemption flag hardcoded into the matching engine. It knows your exact liquidation price because it owns the exchange you are trading on.',
    howToDiscover: 'Defeat in Tower Floor 10 or Syndicate Raid.',
  },
  {
    id: 'boss_microstrategy_shifter',
    name: 'MicroStrategy Shifter',
    subtitle: 'Corporate Treasury Titan',
    rarity: 'legendary',
    icon: 'Building2',
    description: 'Accumulates tens of thousands of coins on leverage to distort price action.',
    lore: 'He issued $2 billion in convertible corporate bonds at 0% interest just to market-buy the local top on a Tuesday morning. According to his keynote slides, there is no second best.',
    howToDiscover: 'Defeat in Tower Floor 5.',
  },
  {
    id: 'boss_quantum_citadel_ai',
    name: 'Quantum Citadel AI',
    subtitle: 'Algorithmic Sovereign',
    rarity: 'mythical',
    icon: 'Cpu',
    description: 'Supercomputing high-frequency arbitrage cluster calculating every market movement.',
    lore: 'Cooled by the tears of retail day-traders, this 5,000-qubit payment-for-order-flow colossus simulates twelve million market timelines per second. In every single timeline, it takes the other side of your trade.',
    howToDiscover: 'Defeat in Tower Floor 20.',
  },
]

export const CODEX_CLAIM_GEMS_REWARD = 50

const COIN_SATIRICAL_LORE: Record<string, string> = {
  pepe_classic: 'Minted from pure internet nostalgia and frog memes, it somehow outperformed every Ivy League hedge fund this quarter. Fundamentals are zero, vibes are immaculate.',
  shiba_turbo: 'Created as a joke about another joke coin, it now commands a market cap larger than several European nations. Its whitepaper is just a picture of a dog wearing sunglasses.',
  doge_prime: 'Powered by 2013 Comic Sans typography and erratic billionaire tweets at 4:00 AM. 1 DOGE continues to equal 1 DOGE regardless of macroeconomic policy.',
  solana_speed: 'Blazingly fast 65,000 transactions per second until someone mints a popular sneaker NFT and the validators need a quick reboot. Turn it off and back on again for maximum throughput.',
  ethereum_gas: 'The world computer where deploying a "Hello World" smart contract costs more than a used Honda Civic. Every upgrade promises lower fees right after the next hard fork.',
  bitcoin_core: 'Forged in 2009 by a pseudonymous cypherpunk who vanished before anyone could ask him for customer support. Digital gold that maxis guard from citadel bunkers.',
}

/**
 * Builds the complete list of Degen Codex entries across Enemies, Boss Titans, Coins, Rig Hardware Sets, Mythic Skill Evolutions, Heroes, and Relics.
 */
export function getFullCodexEntries(): CodexEntry[] {
  const list: CodexEntry[] = []

  // 1. Enemies
  for (const en of CODEX_ENEMIES) {
    list.push({
      id: en.id,
      category: 'enemies',
      name: en.name,
      subtitle: en.subtitle,
      rarity: en.rarity,
      icon: en.icon,
      description: en.description,
      lore: en.lore,
      howToDiscover: en.howToDiscover,
    })
  }

  // 2. Boss Titans
  for (const b of CODEX_BOSSES) {
    list.push({
      id: b.id,
      category: 'bosses',
      name: b.name,
      subtitle: b.subtitle,
      rarity: b.rarity,
      icon: b.icon,
      description: b.description,
      lore: b.lore,
      howToDiscover: b.howToDiscover,
    })
  }

  // 3. Coins & Hard-Fork Evolutions
  for (const c of COINS) {
    list.push({
      id: `coin_${c.id}`,
      category: 'coins',
      name: c.name,
      subtitle: `${c.ticker} • Grade ${c.grade}`,
      rarity: c.rarity,
      icon: c.icon,
      description: `${c.flavor} Base tick speed: ${c.baseTickSpeed}s.`,
      lore:
        COIN_SATIRICAL_LORE[c.id] ??
        `${c.flavor} Rumored to have been coded during a 72-hour hackathon fueled entirely by sugar-free energy drinks and unhinged leverage.`,
      howToDiscover: 'Acquire via Angel/VC Vault or Shop.',
    })
  }

  for (const evo of EVOLUTIONS) {
    list.push({
      id: `evo_${evo.id}`,
      category: 'coins',
      name: evo.name,
      subtitle: `${evo.ticker} • Hard-Fork Evolution`,
      rarity: 'mythical',
      icon: evo.icon,
      description: evo.description,
      lore: `When ${evo.baseCoinId.toUpperCase()} achieved consensus singularity, the devs lost control of the repository. Now it prints green God-candles that defy the laws of thermodynamics.`,
      howToDiscover: `Evolve in-run by combining ${evo.baseCoinId} + 3★ Skill + Relic.`,
    })
  }

  // 4. Rig Hardware Sets & Flagship Gear
  for (const setCfg of Object.values(RIG_CORPORATE_SETS)) {
    list.push({
      id: `rigset_${setCfg.id}`,
      category: 'rigs',
      name: setCfg.name,
      subtitle: `${setCfg.brand} • Corporate Hardware Set`,
      rarity: 'legendary',
      icon: 'Cpu',
      description: `2-Pc: ${setCfg.twoPieceBonus.description} ${setCfg.fourPieceBonus ? `| 4-Pc: ${setCfg.fourPieceBonus.description}` : ''}`,
      lore: `${setCfg.tagline} Draws enough kilowatts to dim the streetlights in three neighboring zip codes while printing pure hash-power.`,
      howToDiscover: 'Equip hardware pieces from this Corporate Set in the Mining Rig Bay.',
    })
  }

  for (const item of CATALOG_RIG_ITEMS.slice(0, 6)) {
    const mappedRarity: Rarity =
      item.rarity === 'ancient' ? 'mythical' : (item.rarity as Rarity)
    list.push({
      id: `rig_${item.id}`,
      category: 'rigs',
      name: item.name,
      subtitle: `${item.slot.toUpperCase()} • ${item.primaryStat.label}`,
      rarity: mappedRarity,
      icon: 'HardDrive',
      description: `${item.flavor}`,
      lore: `${item.flavor} Scalped from an underground warehouse auction after a mining farm forgot to pay its hydro bill.`,
      howToDiscover: 'Fabricate or loot in the Mining Rig Equipment Bay.',
    })
  }

  // 5. Mythic Skill Evolutions
  for (const mythic of MYTHIC_SKILL_EVOLUTIONS) {
    list.push({
      id: mythic.id,
      category: 'mythics',
      name: mythic.name,
      subtitle: `${mythic.prereqSkillNames[0]} + ${mythic.prereqSkillNames[1]}`,
      rarity: 'mythical',
      icon: mythic.icon,
      description: mythic.description,
      lore: mythic.lore,
      howToDiscover: `Hold both ${mythic.prereqSkillNames[0]} and ${mythic.prereqSkillNames[1]} in a single run to unlock this Mythic Evolution.`,
    })
  }

  // 6. Heroes
  for (const h of HEROES) {
    list.push({
      id: `hero_${h.id}`,
      category: 'heroes',
      name: h.name,
      subtitle: h.title,
      rarity: h.rarity,
      icon: 'Shield',
      description: `Passive: ${h.passiveName} (${h.passiveDesc}). Active: ${h.activeSkillName}.`,
      lore: `${h.name} survived four bear winters and three exchange implosions without ever touching a stop-loss button. Legends say their cold wallet seed phrase is tattooed on a Swiss banker's forehead.`,
      howToDiscover: 'Unlock in Base HQ with 50 Fragments or Gems.',
    })
  }

  // 7. Relics
  for (const r of RELICS) {
    list.push({
      id: `relic_${r.id}`,
      category: 'relics',
      name: r.name,
      subtitle: `Algo Relic • Cost $${r.shopPrice}`,
      rarity: r.rarity,
      icon: r.icon,
      description: r.description,
      lore: `${r.description} Contraband trading hardware banned in 42 jurisdictions for giving retail degens an unfair edge.`,
      howToDiscover: 'Purchase in Black Market or draft during runs.',
    })
  }

  return list
}
