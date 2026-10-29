import type {
  BossHazard, BossHazardId, EnemyConfig, NodeType, StageConfig, StageNodeConfig, UnlockFeature,
} from '../types/game.types'
import { STARTER_COIN_ID } from './coins.config'

// ───────────────────────── Boss Hazards ─────────────────────────
export const BOSS_HAZARDS: Record<BossHazardId, BossHazard> = {
  whaleDump: {
    id: 'whaleDump', name: 'Whale Dump', interval: 8,
    description: 'The Whale market-sells: all coins lose 10% of their cash.',
    effects: [{ kind: 'modifyDownMultiplier', value: -0.1, isFraction: true, target: 'allAllies' }],
  },
  secFreeze: {
    id: 'secFreeze', name: 'SEC Freeze', interval: 10,
    description: 'A random wallet is frozen and cannot tick for 3 seconds.',
    effects: [{ kind: 'tickSpeed', value: 2, durationTicks: 2, target: 'self' }],
  },
  rugPull: {
    id: 'rugPull', name: 'Rug Pull', interval: 12,
    description: 'The highest-cash wallet loses 25% instantly.',
    effects: [{ kind: 'modifyDownMultiplier', value: -0.25, isFraction: true, target: 'self' }],
  },
  flashCrash: {
    id: 'flashCrash', name: 'Flash Crash', interval: 9,
    description: 'For 3 ticks, all Up chances are reduced by 20 points.',
    effects: [{ kind: 'modifyUpChance', value: -20, durationTicks: 3, target: 'allAllies' }],
  },
  gasWar: {
    id: 'gasWar', name: 'Gas War', interval: 15,
    description: 'Rebalance Gas Fee is tripled for 5 seconds.',
    effects: [{ kind: 'refundGas', value: -2, isFraction: true, durationTicks: 5, target: 'player' }],
  },
  fudStorm: {
    id: 'fudStorm', name: 'FUD Storm', interval: 7,
    description: 'Green gains reduced by 30% for 4 ticks.',
    effects: [{ kind: 'modifyUpMultiplier', value: -0.3, isFraction: true, durationTicks: 4, target: 'allAllies' }],
  },
  bearTrap: {
    id: 'bearTrap', name: 'Bear Trap', interval: 11,
    description: 'All coins tick 30% slower for 4 ticks.',
    effects: [{ kind: 'tickSpeed', value: 0.3, durationTicks: 4, target: 'allAllies' }],
  },
  liquidationCascade: {
    id: 'liquidationCascade', name: 'Liquidation Cascade', interval: 10,
    description: 'Deals Margin damage equal to 5% of total losses so far.',
    effects: [{ kind: 'healMargin', value: -0.05, isFraction: true, target: 'player' }],
  },
  stablecoinDepeg: {
    id: 'stablecoinDepeg', name: 'Stablecoin Depeg', interval: 9,
    description: 'Flat rolls become Red rolls (-10%) for 4 ticks.',
    effects: [{ kind: 'modifyDownMultiplier', value: 0.1, isFraction: true, durationTicks: 4, target: 'allAllies' }],
  },
  exchangeHalt: {
    id: 'exchangeHalt', name: 'Exchange Halt', interval: 14,
    description: 'Rebalancing is disabled for 6 seconds and the boss heals 5%.',
    effects: [{ kind: 'healMargin', value: 0.05, isFraction: true, target: 'enemy' }],
  },
}

// ───────────────────────── Boss Roster ─────────────────────────
const BOSSES: Array<{ name: string; hazard: BossHazardId; portrait: string }> = [
  { name: 'The Bear Whale', hazard: 'whaleDump', portrait: 'Fish' },
  { name: 'SEC Enforcer', hazard: 'secFreeze', portrait: 'Gavel' },
  { name: 'Rug Pull Overlord', hazard: 'rugPull', portrait: 'Drama' },
  { name: 'Bear Market Bruin', hazard: 'bearTrap', portrait: 'PawPrint' },
  { name: 'FUD Kingpin', hazard: 'fudStorm', portrait: 'Megaphone' },
  { name: 'The Gas Baron', hazard: 'gasWar', portrait: 'Fuel' },
  { name: 'Flash Crash Phantom', hazard: 'flashCrash', portrait: 'TrendingDown' },
  { name: 'Depeg Demon', hazard: 'stablecoinDepeg', portrait: 'Unlink' },
  { name: 'Margin Reaper', hazard: 'liquidationCascade', portrait: 'Skull' },
  { name: 'Exchange CEO (Fled)', hazard: 'exchangeHalt', portrait: 'Plane' },
]

const FLOOR1_BOSSES: Array<{ name: string; hazard: BossHazardId; portrait: string }> = [
  { name: 'Floor 1 Mid-Boss: Pump Whale', hazard: 'whaleDump', portrait: 'Fish' },
  { name: 'Floor 1 Mid-Boss: Compliance Bot', hazard: 'secFreeze', portrait: 'Gavel' },
  { name: 'Floor 1 Mid-Boss: Shill General', hazard: 'fudStorm', portrait: 'Megaphone' },
]

const FLOOR2_BOSSES: Array<{ name: string; hazard: BossHazardId; portrait: string }> = [
  { name: 'Floor 2 Elite Boss: Leverage Titan', hazard: 'flashCrash', portrait: 'TrendingDown' },
  { name: 'Floor 2 Elite Boss: Gas Warlord', hazard: 'gasWar', portrait: 'Fuel' },
  { name: 'Floor 2 Elite Boss: Liquidation Warden', hazard: 'liquidationCascade', portrait: 'Skull' },
]

const MINIONS = [
  'Paper Hands',
  'Bagholder',
  'Exit Liquidity',
  'Pump Bot',
  'Shill Account',
  'Copy Trader',
  'Bot Farm',
  'Ape Degen',
  'MEV Sandwich Bot',
  'Short Seller',
]

const STAGE_NAMES = [
  'Genesis Block', 'Faucet Fields', 'Altcoin Alley', 'Meme Mines', 'DeFi Docks',
  'Yield Canyon', 'Bridge Ruins', 'NFT Graveyard', 'Leverage Tower', 'Stablecoin Sea',
  'Mempool Maze', 'Validator Vault', 'Layer 2 Labyrinth', 'Rug City', 'Bear Den',
  'The Merge', 'Liquidation Pit', 'Darknet Exchange', 'Halving Horizon', 'Satoshi\'s Throne',
]

/**
 * 30-Node Adventure Layout (1-indexed 1..30):
 * - Nodes 1–9: Normal Market Battles, Shady Event (Node 4), Black Market Shop (Node 7)
 * - Node 10: Floor 1 Mid-Boss
 * - Nodes 11–19: Elite Battles, Shady Events (Node 13, 17), Black Market (Node 15)
 * - Node 20: Floor 2 Elite Boss
 * - Nodes 21–29: Hardcore Volatility Nodes, Final Shady Event (Node 24), Final Shop (Node 28)
 * - Node 30: The Stage Final Boss ("The Bear Whale", "SEC Enforcer", etc.)
 */
function get30NodeType(nodeNum1Indexed: number): NodeType {
  if (nodeNum1Indexed === 10 || nodeNum1Indexed === 20 || nodeNum1Indexed === 30) {
    return 'boss'
  }
  if (
    nodeNum1Indexed === 4 ||
    nodeNum1Indexed === 13 ||
    nodeNum1Indexed === 17 ||
    nodeNum1Indexed === 24
  ) {
    return 'event'
  }
  if (nodeNum1Indexed === 7 || nodeNum1Indexed === 15 || nodeNum1Indexed === 28) {
    return 'shop'
  }
  if (nodeNum1Indexed >= 11) {
    return 'elite'
  }
  return 'battle'
}

const EVENT_POOL = [
  'influencer_dm', 'hard_fork', 'phishing_airdrop', 'margin_call_bailout',
  'exchange_hack', 'dark_web_tip', 'regulatory_audit', 'asic_overheat',
]

// ───────────────────────── Scaling ─────────────────────────
export const TOTAL_CAMPAIGN_STAGES = 500
export const STAGES_PER_CYCLE = 20

export const BASE_ENEMY_HP_COEFF = 750
export const ENEMY_HP_GROWTH = 0.116 // BaseHP(Stage) = 750 * (1 + 0.116)^(Stage - 1)
export const BASE_ENEMY_ATK_COEFF = 13.5
export const ENEMY_ATK_GROWTH = 0.114 // BaseATK(Stage) = 13.5 * (1 + 0.114)^(Stage - 1)

/**
 * Procedural Base Enemy HP:
 * BaseHP(Stage) = 750 * (1 + 0.116)^(Stage - 1) * (1 + 0.015 * Math.max(0, Stage - 100))
 * Smooth exponential scaling across all 500 stages with late-game high-stage scaling.
 */
export const hpScale = (stage: number): number => {
  const lateGameTerm = 1 + 0.015 * Math.max(0, stage - 100)
  return Math.round(BASE_ENEMY_HP_COEFF * Math.pow(1 + ENEMY_HP_GROWTH, Math.max(0, stage - 1)) * lateGameTerm)
}

/**
 * Procedural Base Enemy Flat ATK:
 * BaseATK(Stage) = 13.5 * (1 + 0.114)^(Stage - 1) * (1 + 0.015 * Math.max(0, Stage - 100))
 * Scales smoothly from early game up to Stage 500.
 */
export const atkScale = (stage: number): number => {
  const lateGameTerm = 1 + 0.015 * Math.max(0, stage - 100)
  return Math.max(5, Math.round(BASE_ENEMY_ATK_COEFF * Math.pow(1 + ENEMY_ATK_GROWTH, Math.max(0, stage - 1)) * lateGameTerm))
}

export function toRoman(num: number): string {
  const lookup: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let roman = ''
  let n = num
  for (const [val, letter] of lookup) {
    while (n >= val) {
      roman += letter
      n -= val
    }
  }
  return roman || 'I'
}

export interface MarketCycleConfig {
  cycle: number
  roman: string
  name: string
  fullName: string
  affixId?: 'flash_crash' | 'orderbook_shield' | 'latency_jitter' | 'multi_affix'
  affixName?: string
  affixDescription?: string
}

export const MARKET_CYCLES: Record<number, MarketCycleConfig> = {
  1: {
    cycle: 1,
    roman: 'I',
    name: 'The Retail Genesis',
    fullName: 'Cycle I: The Retail Genesis',
  },
  2: {
    cycle: 2,
    roman: 'II',
    name: 'Institutional Bull',
    fullName: 'Cycle II: Institutional Bull',
    affixId: 'flash_crash',
    affixName: 'Flash Crash',
    affixDescription: 'Enemies deal +15% damage when HP < 30%',
  },
  3: {
    cycle: 3,
    roman: 'III',
    name: 'Derivative Storm',
    fullName: 'Cycle III: Derivative Storm',
    affixId: 'orderbook_shield',
    affixName: 'Orderbook Shield',
    affixDescription: 'Enemies absorb the first 2 Green Candles of combat',
  },
  4: {
    cycle: 4,
    roman: 'IV',
    name: 'Sovereign Singularity',
    fullName: 'Cycle IV: Sovereign Singularity',
    affixId: 'latency_jitter',
    affixName: 'Latency Jitter',
    affixDescription: 'Hides heavy attack cast bar until 50% charged',
  },
  5: {
    cycle: 5,
    roman: 'V',
    name: 'Quantum Arbitrage',
    fullName: 'Cycle V: Quantum Arbitrage',
    affixId: 'multi_affix',
    affixName: 'Dual Affix: Flash Crash + Orderbook Shield',
    affixDescription: 'Absorbs first 2 Green Candles & deals +15% damage under 30% HP',
  },
}

export function getMarketCycle(stageNumber: number): MarketCycleConfig {
  const cycle = Math.min(25, Math.max(1, Math.ceil(stageNumber / STAGES_PER_CYCLE)))
  if (MARKET_CYCLES[cycle]) return MARKET_CYCLES[cycle]

  const roman = toRoman(cycle)
  const cycleThemes = [
    'Liquidity Abyss',
    'Hyperbitcoinization',
    'Algorithmic Hegemony',
    'Dark Pool Horizon',
    'Interstellar Ledger',
    'Black Swan Nexus',
    'Entropy Engine',
    'Zero-Knowledge Citadel',
    'Proof-of-Ascension',
    'Titan Syndicate',
    'Cosmic Exchange',
    'Omega Consensus',
  ]
  const name = cycleThemes[(cycle - 6) % cycleThemes.length]
  const affixSequence: Array<'flash_crash' | 'orderbook_shield' | 'latency_jitter' | 'multi_affix'> = [
    'flash_crash',
    'orderbook_shield',
    'latency_jitter',
    'multi_affix',
  ]
  const affixId = affixSequence[(cycle - 1) % affixSequence.length]
  const tier = Math.floor((cycle - 1) / 4) + 1
  const affixName =
    affixId === 'flash_crash'
      ? `Flash Crash T${tier}`
      : affixId === 'orderbook_shield'
      ? `Orderbook Shield T${tier}`
      : affixId === 'latency_jitter'
      ? `Latency Jitter T${tier}`
      : `Empowered Tri-Affix T${tier}`
  const affixDescription =
    affixId === 'flash_crash'
      ? `Enemies deal +${15 + (tier - 1) * 5}% damage when HP < 30%`
      : affixId === 'orderbook_shield'
      ? `Enemies absorb the first ${Math.min(4, 2 + Math.floor((tier - 1) / 2))} Green Candles of combat`
      : affixId === 'latency_jitter'
      ? `Hides heavy attack cast bar until ${Math.min(75, 50 + (tier - 1) * 5)}% charged`
      : 'Combines Flash Crash, Orderbook Shield & Latency Jitter'

  return {
    cycle,
    roman,
    name,
    fullName: `Cycle ${roman}: ${name}`,
    affixId,
    affixName,
    affixDescription,
  }
}

function slotsForStage(stage: number): 1 | 2 | 3 | 4 {
  if (stage <= 1) return 1
  if (stage <= 3) return 2
  if (stage <= 6) return 3
  return 4
}

/**
 * Creates enemy with procedural exponential scaling, intra-run floor scaling (Nodes 1 to 30),
 * telegraphed heavy attacks, red-candle counter damage, and boss Black Swan Ultimates.
 */
function makeEnemy(stage: number, nodeIdx: number, type: NodeType): EnemyConfig {
  const baseHp = hpScale(stage)
  const baseAtk = atkScale(stage)
  const nodeNum = nodeIdx + 1 // 1..30
  const cycleInfo = getMarketCycle(stage)

  // Cycle affix configuration
  const affix = cycleInfo.affixId
    ? {
        id: cycleInfo.affixId,
        name: cycleInfo.affixName || '',
        description: cycleInfo.affixDescription || '',
      }
    : undefined
  const orderbookShieldHits =
    cycleInfo.affixId === 'orderbook_shield' || cycleInfo.affixId === 'multi_affix'
      ? Math.min(4, 2 + Math.floor((cycleInfo.cycle - 1) / 8))
      : undefined

  const earlyWarmup = stage <= 10 ? 0.35 + (stage - 1) * 0.072 : 1.0

  // ── BOSS NODES (Node 10, Node 20, Node 30) ──
  if (type === 'boss') {
    if (stage === 1 && nodeNum === 5) {
      // Stage 1 Mini-Boss (Node 5: Pump Whale - Intro Boss)
      const b = FLOOR1_BOSSES[0]
      const atk = Math.round(baseAtk * 1.1 * 1.35 * 0.35)
      return {
        id: `s1_n5_miniboss`,
        name: `Mini-Boss: ${b.name}`,
        portrait: b.portrait,
        hp: Math.round(baseHp * 1.15 * 0.35),
        attack: atk,
        counterAttackDmg: Math.max(1, Math.round(atk * 0.35)),
        attackCooldown: 3.2,
        ultimateDmg: Math.round(atk * 1.3),
        ultimateCooldown: 8.0,
        isBoss: true,
        hazard: BOSS_HAZARDS[b.hazard],
        affix,
        orderbookShieldHits,
      }
    }
    if (stage === 1 && nodeNum === 10) {
      // Stage 1 Final Boss (Node 10: "The Bear Whale")
      const b = BOSSES[0]
      const atk = Math.round(baseAtk * 1.5 * 1.35 * 0.35)
      return {
        id: `s1_n10_boss`,
        name: b.name,
        portrait: b.portrait,
        hp: Math.round(baseHp * 1.7 * 0.35),
        attack: atk,
        counterAttackDmg: Math.max(1, Math.round(atk * 0.70)),
        attackCooldown: 3.0,
        ultimateDmg: Math.round(atk * 1.4),
        ultimateCooldown: 7.5,
        isBoss: true,
        hazard: BOSS_HAZARDS[b.hazard],
        affix,
        orderbookShieldHits,
      }
    }
    if (nodeNum === 10) {
      // Floor 1 Mid-Boss (1.8x Base ATK + 35% heavy buff)
      const b = FLOOR1_BOSSES[(stage - 1) % FLOOR1_BOSSES.length]
      const atk = Math.round(baseAtk * 1.8 * 1.35 * earlyWarmup)
      const hasIronWill = stage >= 41
      return {
        id: `s${stage}_n10_midboss`,
        name: b.name,
        portrait: b.portrait,
        hp: Math.round(baseHp * (stage >= 41 ? 4.2 : 2.6) * earlyWarmup),
        attack: atk,
        counterAttackDmg: Math.max(1, Math.round(atk * 0.75)),
        attackCooldown: stage <= 5 ? 2.8 : 2.4,
        ultimateDmg: Math.round(atk * 1.5),
        ultimateCooldown: stage <= 5 ? 7.0 : 5.6,
        isBoss: true,
        hasIronWill,
        ironWillArmor: hasIronWill ? 2 : undefined,
        hazard: BOSS_HAZARDS[b.hazard],
        affix,
        orderbookShieldHits,
      }
    }
    if (nodeNum === 20) {
      // Floor 2 Elite Boss (2.6x Base ATK + 35% heavy buff)
      const b = FLOOR2_BOSSES[(stage - 1) % FLOOR2_BOSSES.length]
      const atk = Math.round(baseAtk * 2.6 * 1.35 * earlyWarmup)
      const hasIronWill = stage >= 41
      return {
        id: `s${stage}_n20_eliteboss`,
        name: b.name,
        portrait: b.portrait,
        hp: Math.round(baseHp * (stage >= 41 ? 5.2 : 3.2) * earlyWarmup),
        attack: atk,
        counterAttackDmg: Math.max(1, Math.round(atk * 0.75)),
        attackCooldown: stage <= 5 ? 2.8 : 2.6,
        ultimateDmg: Math.round(atk * 1.5),
        ultimateCooldown: stage <= 5 ? 6.5 : 5.8,
        isBoss: true,
        hasIronWill,
        ironWillArmor: hasIronWill ? 2 : undefined,
        hazard: BOSS_HAZARDS[b.hazard],
        affix,
        orderbookShieldHits,
      }
    }
    // Node 30: Stage Final Boss (5.2x Base ATK for Milestone Titans; 3.6x standard + 35% heavy buff)
    const isMilestone = stage % 10 === 0
    const b = BOSSES[(stage - 1) % BOSSES.length]
    const bossHpMult = isMilestone ? (stage === 10 ? 5.2 : 8.5) : (stage >= 41 ? 6.5 : 3.8)
    const bossAtkMult = isMilestone ? (stage === 10 ? 4.2 : 5.2) : 3.6
    const atk = Math.round(baseAtk * bossAtkMult * 1.35 * earlyWarmup)
    const hasIronWill = stage >= 41
    return {
      id: `s${stage}_boss`,
      name: isMilestone ? `Milestone Titan: ${b.name}` : b.name,
      portrait: b.portrait,
      hp: Math.round(baseHp * bossHpMult * earlyWarmup),
      attack: atk,
      counterAttackDmg: Math.max(1, Math.round(atk * 0.75)),
      attackCooldown: stage <= 5 ? 2.6 : 2.2,
      ultimateDmg: Math.round(atk * (isMilestone ? 1.75 : 1.5)),
      ultimateCooldown: stage <= 5 ? 6.2 : 5.2,
      isBoss: true,
      hasIronWill,
      ironWillArmor: hasIronWill ? 2 : undefined,
      hazard: BOSS_HAZARDS[b.hazard],
      affix,
      orderbookShieldHits: isMilestone ? 4 : orderbookShieldHits,
    }
  }

  // ── REGULAR & ELITE INTRA-RUN NODES ──
  // Floor 1 (Nodes 1–9): 1.0x Base ATK (Warm-up)
  // Floor 2 (Nodes 11–19): 2.2x Base ATK (Graduated on early stages 1–10)
  // Floor 3 (Nodes 21–29): 3.5x Base ATK (Graduated on early stages 1–10)
  const isFloor3 = nodeNum >= 21
  const isFloor2 = nodeNum >= 11 && nodeNum <= 19

  const atkMult = isFloor3
    ? (stage <= 10 ? 1.5 + (stage / 10) * 2.0 : 3.5)
    : isFloor2
    ? (stage <= 10 ? 1.2 + (stage / 10) * 1.0 : 2.2)
    : 1.0

  const flatAtk = Math.max(2, Math.round(baseAtk * atkMult * 1.35 * earlyWarmup))
  const counterDmg = Math.max(1, Math.round(flatAtk * 0.75))

  const hpFloorMult = isFloor3
    ? (stage <= 10 ? 1.4 + (stage / 10) * 1.0 : 2.4)
    : isFloor2
    ? (stage <= 10 ? 1.2 + (stage / 10) * 0.4 : 1.6)
    : 1.0

  const nodeOffset = isFloor3 ? nodeIdx - 20 : isFloor2 ? nodeIdx - 10 : nodeIdx
  const progressFactor = 1 + nodeOffset * 0.04
  const prefix = isFloor3 ? 'Hardcore ' : isFloor2 ? 'Elite ' : ''

  return {
    id: `s${stage}_n${nodeIdx}`,
    name: `${prefix}${MINIONS[(stage + nodeIdx) % MINIONS.length]}`,
    portrait: isFloor3 ? 'Flame' : isFloor2 ? 'Swords' : 'User',
    hp: Math.round(baseHp * earlyWarmup * hpFloorMult * progressFactor),
    attack: flatAtk,
    counterAttackDmg: counterDmg,
    attackCooldown: 3.2,
    isBoss: false,
    affix,
    orderbookShieldHits,
  }
}

function makeNodes(stage: number): StageNodeConfig[] {
  if (stage === 1) {
    // Stage 1 ("Genesis Block") has exactly 10 Nodes:
    const stage1Types: NodeType[] = [
      'battle', // Node 1: Intro Market Minion
      'battle', // Node 2: Intro Market Minion
      'event',  // Node 3: Intro Shady Event
      'battle', // Node 4: Market Minion
      'boss',   // Node 5: Mini-Boss (Pump Whale)
      'battle', // Node 6: Battle
      'shop',   // Node 7: Black Market Shop
      'elite',  // Node 8: Elite Minion
      'battle', // Node 9: Battle
      'boss',   // Node 10: Stage 1 Final Boss ("The Bear Whale")
    ]
    return stage1Types.map((type, index) => {
      const isBoss = type === 'boss'
      const isElite = type === 'elite'
      return {
        index,
        type,
        enemy:
          type === 'battle' || type === 'elite' || type === 'boss'
            ? makeEnemy(stage, index, type)
            : undefined,
        eventPool: type === 'event' ? EVENT_POOL : undefined,
        cashReward: Math.round(
          (isBoss ? 100 : isElite ? 45 : 25) * (1 + (stage - 1) * 0.15),
        ),
      }
    })
  }

  // Stages 2 to 500: Standard 30 Nodes
  return Array.from({ length: 30 }, (_, index) => {
    const nodeNum = index + 1
    const type = get30NodeType(nodeNum)
    const isBoss = type === 'boss'
    const isElite = type === 'elite'
    return {
      index,
      type,
      enemy:
        type === 'battle' || type === 'elite' || type === 'boss'
          ? makeEnemy(stage, index, type)
          : undefined,
      eventPool: type === 'event' ? EVENT_POOL : undefined,
      cashReward: Math.round(
        (isBoss ? 140 : isElite ? 55 : 32) * (1 + Math.min(20, (stage - 1) * 0.08)),
      ),
    }
  })
}

/**
 * Staggered Coin & Algo Relic Slot Unlocks:
 * - Starting State (Stage 1): 1 Coin Slot unlocked, 1 Algo Relic Slot unlocked.
 * - Clear Stage 1: Unlock Coin Slot 2.
 * - Clear Stage 2: Unlock Algo Relic Slot 2.
 * - Clear Stage 3: Unlock Coin Slot 3.
 * - Clear Stage 4: Unlock Algo Relic Slot 3.
 * - Clear Stage 5: Unlock Algo Relic Slot 4.
 * - Clear Stage 6: Unlock Coin Slot 4 (Max 4 Coin Slots).
 * - Clear Stage 8: Unlock Algo Relic Slot 5 (Max 5 Algo Slots).
 */
const CLEAR_UNLOCKS: Record<
  number,
  { unlockSlot?: 2 | 3 | 4; unlockRelicSlot?: 2 | 3 | 4 | 5; unlockFeatures?: UnlockFeature[] }
> = {
  1: { unlockSlot: 2, unlockFeatures: ['gachaShop', 'dailyQuests'] },
  2: { unlockRelicSlot: 2, unlockFeatures: ['idleRig'] },
  3: { unlockSlot: 3, unlockFeatures: ['foundry'] },
  4: { unlockRelicSlot: 3 },
  5: { unlockRelicSlot: 4 },
  6: { unlockSlot: 4, unlockFeatures: ['growthEvents'] },
  8: { unlockRelicSlot: 5 },
}

export const COIN_SLOT_UNLOCK_LABELS: Record<number, string> = {
  0: 'Stage 1',
  1: 'Unlocks Stage 2',
  2: 'Unlocks Stage 3',
  3: 'Unlocks Stage 6',
}

export const RELIC_SLOT_UNLOCK_LABELS: Record<number, string> = {
  0: 'Stage 1',
  1: 'Unlocks Stage 2',
  2: 'Unlocks Stage 4',
  3: 'Unlocks Stage 5',
  4: 'Unlocks Stage 8',
}

export function getUnlockedRelicSlotsForClearedStage(highestStageCleared: number): number {
  if (highestStageCleared >= 8) return 5
  if (highestStageCleared >= 5) return 4
  if (highestStageCleared >= 4) return 3
  if (highestStageCleared >= 2) return 2
  return 1
}

/**
 * Dynamic Procedural Stage Generator Function:
 * Generates any stage from 1 to 500 on demand.
 */
export function getStageConfig(stageNumber: number): StageConfig {
  const stage = Math.min(TOTAL_CAMPAIGN_STAGES, Math.max(1, Math.round(stageNumber)))
  const cycleInfo = getMarketCycle(stage)
  const isBreakthrough = stage % STAGES_PER_CYCLE === 0

  // Stage name generation
  let name: string
  if (stage <= STAGE_NAMES.length) {
    name = STAGE_NAMES[stage - 1]
  } else {
    const baseName = STAGE_NAMES[(stage - 1) % STAGE_NAMES.length]
    name = `${baseName} ${cycleInfo.roman}`
  }

  // Clear rewards scaling
  // Milestone Boss Crates: Clearing every 20th stage awards a "Cycle Breakthrough Crate"
  // containing +10 Hero Fragments, +5 Quantum Keys, and +1,000 Gems.
  const baseHashrate = 300 * stage
  const baseGems = isBreakthrough ? 1000 : stage % 5 === 0 ? 120 : 35
  const quantumKeys = isBreakthrough ? 5 : stage % 5 === 0 ? 1 : undefined
  const silverKeys = stage % 2 === 0 ? 1 : undefined

  return {
    stage,
    name,
    startingCash: Math.round(100 + (stage - 1) * 35),
    marginHp: Math.round(120 + (stage - 1) * 15),
    walletSlots: slotsForStage(stage),
    nodes: makeNodes(stage),
    cycle: cycleInfo.cycle,
    cycleName: cycleInfo.fullName,
    affix: cycleInfo.affixId
      ? {
          id: cycleInfo.affixId,
          name: cycleInfo.affixName || '',
          description: cycleInfo.affixDescription || '',
        }
      : undefined,
    isCycleBreakthrough: isBreakthrough,
    clearRewards: {
      hashrate: baseHashrate,
      gems: baseGems,
      silverKeys,
      quantumKeys,
      heroFragments: isBreakthrough ? 10 : undefined,
      breakthroughCrate: isBreakthrough
        ? { heroFragments: 10, quantumKeys: 5, gems: 1000 }
        : undefined,
      ...CLEAR_UNLOCKS[stage],
    },
    starterLoadout: stage === 1 ? [STARTER_COIN_ID] : undefined,
  }
}

export const STAGES: StageConfig[] = Array.from({ length: TOTAL_CAMPAIGN_STAGES }, (_, i) =>
  getStageConfig(i + 1),
)

export const NODES_PER_STAGE = 30
export const MAX_WALLET_SLOTS = 4
