export interface TowerBoss {
  floor: number
  name: string
  title: string
  portrait: string
  maxHp: number
  atk: number
  atkIntervalSec: number
  affixName: string
  affixDesc: string
  quote: string
  isMilestone: boolean
  isInfiniteDescent?: boolean
}

export interface TowerMilestoneReward {
  silverKeys: number
  quantumKeys: number
  heroFragments: number
  gems: number
  solderWire?: number
  blueprints?: number
}

export interface TowerFloorRewards {
  hashrate: number
  gems: number
  solderWire?: number
  blueprints?: number
  milestoneReward?: TowerMilestoneReward
}

export interface TowerFloorConfig {
  floor: number
  boss: TowerBoss
  rewards: TowerFloorRewards
  isInfiniteDescent?: boolean
}

export const TOTAL_TOWER_FLOORS = 300

const TOWER_BOSS_NAMES = [
  { name: 'Penny Stock Pumper', title: 'Telegram Group Admin', portrait: 'Fish', quote: 'Buy the dip! 100x incoming!', affix: 'Rapid Pump (Ticks 20% faster)' },
  { name: 'Telegram Signal Scammer', title: 'Fake VIP Influencer', portrait: 'Megaphone', quote: 'Guaranteed 500% monthly yield!', affix: 'FUD Echo (-10% Up Odds)' },
  { name: 'Liquidity Vampire', title: 'DEX Pool Drainer', portrait: 'Skull', quote: 'Your liquidity is mine now.', affix: 'Cash Drain (Steals 5% on tick)' },
  { name: 'Wash Trading Bot', title: 'Volume Fabricator', portrait: 'Cpu', quote: 'Synthetic volume detected.', affix: 'Noise Glitch (Randomizes ticks)' },
  { name: 'MicroStrategy Shifter', title: 'Corporate Treasury Titan', portrait: 'Building2', quote: 'We are buying the top forever.', affix: 'Diamond Wall (+30% Armor)' },
  { name: 'Cross-Chain Bridge Hacker', title: 'Multichain Exploit Vector', portrait: 'TrendingDown', quote: 'Smart contract vulnerability confirmed.', affix: 'Exploit Flash (Piercing damage)' },
  { name: 'MEV Sandwich Shark', title: 'Mempool Front-Runner', portrait: 'Fish', quote: 'Thanks for paying the slippage.', affix: 'Slippage Tax (+15% Loss on Red)' },
  { name: 'Overleveraged Fund Manager', title: 'Margin Defaulter', portrait: 'Drama', quote: 'The market can remain irrational longer than...', affix: 'Cascade Panic (Extra ATK at low HP)' },
  { name: 'SEC Enforcement Unit', title: 'Regulatory Gavel', portrait: 'Gavel', quote: 'Unregistered security identified.', affix: 'Subpoena Freeze (Stuns a coin)' },
  { name: 'Alameda Liquidator', title: 'Margin Hunter AI', portrait: 'Skull', quote: 'Margin Call executed. Zero collateral remaining.', affix: 'Liquidation Cascade (Heavy burst)' },
  { name: 'Bitfinex Tether Spigot', title: 'Printer of Last Resort', portrait: 'Fuel', quote: 'Brrrr. Billions printed out of thin air.', affix: 'Inflation Surge (Regenerates HP)' },
  { name: 'Sovereign Bear Whale', title: 'Apex Market Leviathan', portrait: 'Fish', quote: 'I am the market maker. You are the exit.', affix: 'Mega Red Candle (Screen wipe)' },
  { name: 'Quantum Citadel AI', title: 'High-Frequency Sovereign', portrait: 'Cpu', quote: 'Sub-nanosecond execution complete.', affix: 'Quantum Overdrive (2x Attack Speed)' },
  { name: 'Genesis Hash Master', title: 'Proof-of-Work Architect', portrait: 'Cpu', quote: 'Difficulty adjusts automatically. You cannot keep up.', affix: 'Hash Difficulty Spike (+25% Armor)' },
  { name: 'ZK-Rollup Overlord', title: 'Zero-Knowledge Cryptographer', portrait: 'Zap', quote: 'Your transactions vanish into the prover proof.', affix: 'Prover Latency (-15% Tick Speed)' },
  { name: 'Dark Pool Siren', title: 'Shadow Liquidity Sovereign', portrait: 'Fish', quote: 'Unlisted orderbooks swallow all retail flow.', affix: 'Hidden Orderbook (Absorbs 3 Green Candles)' },
  { name: 'Consensus Fracture Prime', title: 'Hard Fork Anomaly', portrait: 'Unlink', quote: 'Chain split initiated. Your margin is orphaned.', affix: 'Reorg Shockwave (Random 15% Dump)' },
  { name: 'Infinite Liquidation Warden', title: 'Apex Singularity Engine', portrait: 'Skull', quote: 'Zero collateral. Infinite descent.', affix: 'Apex Stagger Immune (Unbreakable Armor)' },
]

export function getTowerFloorBoss(floor: number): TowerBoss {
  const isMilestone = floor % 5 === 0
  const isInfiniteDescent = floor > TOTAL_TOWER_FLOORS
  const index = Math.min(floor - 1, TOWER_BOSS_NAMES.length - 1)
  const template = TOWER_BOSS_NAMES[index % TOWER_BOSS_NAMES.length]

  // Procedural scaling:
  // Floor 1..150: base exponential -> linear extension
  const hpAt30 = 2500 * Math.pow(1.28, 30)
  const hpAt150 = hpAt30 * (1 + 120 * 0.15)
  const atkAt150 = 30 + Math.pow(150, 1.25) * 9

  // Floor 151..200: Base HP and ATK scale steadily (+7%/floor)
  const hpAt200 = hpAt150 * Math.pow(1.07, 50)
  const atkAt200 = atkAt150 * Math.pow(1.07, 50)

  // Floor 201..300: High-friction endgame gauntlet (+9.5%/floor)
  const hpAt300 = hpAt200 * Math.pow(1.095, 100)
  const atkAt300 = atkAt200 * Math.pow(1.095, 100)

  let maxHp: number
  let atk: number

  if (floor <= 150) {
    maxHp = Math.round(2500 * Math.pow(1.28, Math.min(floor - 1, 30)) * (1 + (floor > 30 ? (floor - 30) * 0.15 : 0)))
    atk = Math.round(30 + Math.pow(floor, 1.25) * 9)
  } else if (floor <= 200) {
    maxHp = Math.round(hpAt150 * Math.pow(1.07, floor - 150))
    atk = Math.round(atkAt150 * Math.pow(1.07, floor - 150))
  } else if (floor <= 300) {
    maxHp = Math.round(hpAt200 * Math.pow(1.095, floor - 200))
    atk = Math.round(atkAt200 * Math.pow(1.095, floor - 200))
  } else {
    // Floor 301+: Infinite Liquidation Descent (+12%/floor)
    maxHp = Math.round(hpAt300 * Math.pow(1.12, floor - 300))
    atk = Math.round(atkAt300 * Math.pow(1.12, floor - 300))
  }

  const atkIntervalSec = Math.max(1.5, Math.round((3.2 - Math.min(1.5, floor * 0.035)) * 10) / 10)

  const prefix = isInfiniteDescent ? '⚡ [Descent] ' : isMilestone ? '★ ' : ''
  const name = `${prefix}${template.name} (Fl.${floor})`

  return {
    floor,
    name,
    title: isInfiniteDescent ? `Infinite Descent Tier ${floor - 300}` : template.title,
    portrait: template.portrait,
    maxHp,
    atk,
    atkIntervalSec,
    affixName: template.affix,
    affixDesc: isInfiniteDescent
      ? `Infinite Liquidation Descent Floor ${floor}. Relentless damage scaling.`
      : `Endless gauntlet tier ${floor} boss modifier.`,
    quote: template.quote,
    isMilestone,
    isInfiniteDescent,
  }
}

export function getTowerFloorRewards(floor: number): TowerFloorRewards {
  const hashrate = Math.round(150 * Math.pow(floor, 0.85))
  const gems = 15 + floor * 3

  let solderWire: number | undefined
  let blueprints: number | undefined

  if (floor > 150 && floor <= 200) {
    // Floors 151–200: Base HP and ATK scale steadily (+7%/floor), dropping Epic/Legendary Solder Wire & Blueprints
    solderWire = Math.round(25 + (floor - 150) * 2.0)
    blueprints = Math.round(5 + (floor - 150) * 0.5)
  } else if (floor > 200 && floor <= 300) {
    // Floors 201–300: High-friction endgame gauntlet
    solderWire = Math.round(125 + (floor - 200) * 3.5)
    blueprints = Math.round(30 + (floor - 200) * 1.0)
  } else if (floor > 300) {
    // Infinite Descent 301+
    solderWire = Math.round(480 + (floor - 300) * 5.0)
    blueprints = Math.round(130 + (floor - 300) * 2.0)
  }

  let milestoneReward: TowerMilestoneReward | undefined
  if (floor % 5 === 0) {
    const isMajor = floor % 10 === 0
    milestoneReward = {
      silverKeys: isMajor ? 0 : 1,
      quantumKeys: isMajor ? (floor >= 200 ? 2 : 1) : 0,
      heroFragments: 20 + Math.floor(floor / 5) * 5,
      gems: 100 + floor * 5,
      solderWire: floor > 150 ? (solderWire ? solderWire * 2 : 50) : undefined,
      blueprints: floor > 150 ? (blueprints ? blueprints * 2 : 10) : undefined,
    }
  }

  return { hashrate, gems, solderWire, blueprints, milestoneReward }
}

export function getTowerFloorConfig(floorNumber: number): TowerFloorConfig {
  const boss = getTowerFloorBoss(floorNumber)
  const rewards = getTowerFloorRewards(floorNumber)
  return {
    floor: floorNumber,
    boss,
    rewards,
    isInfiniteDescent: floorNumber > TOTAL_TOWER_FLOORS,
  }
}
