export type BaseLocationId =
  | 'outskirts_tent'
  | 'suburban_garage'
  | 'cyber_loft'
  | 'miami_penthouse'
  | 'lunar_citadel'

export type FurnitureId =
  | 'trading_desk'
  | 'campfire_bar'
  | 'cooling_rack'
  | 'backup_generator'
  | 'security_firewall'
  | 'satellite_dish'

export type DailyMissionId =
  | 'whale_liquidity_heist'
  | 'asic_overclock_trial'
  | 'corporate_espionage'

export interface BaseLocationConfig {
  id: BaseLocationId
  tier: 1 | 2 | 3 | 4 | 5
  name: string
  subtitle: string
  description: string
  unlockStage: number
  unlockGemsCost: number
  auraLabel: string
  /** Multiplier added to Global Coin Yield (e.g. 0.05 = +5% Global Yield). */
  globalYieldBonus: number
  /** Bonus starting Margin HP in runs. */
  startingHpBonus: number
  emoji: string
}

export interface FurnitureConfig {
  id: FurnitureId
  name: string
  tierNames: [string, string, string] // Lv 1-3, Lv 4-7, Lv 8-10
  description: string
  buffLabel: string
  unit: '%' | '$' | ' HP'
  baseValuePerLevel: number
  baseHashrateCost: number
  costMultiplier: number
  emoji: string
  maxLevel: number
}

export interface DailyMissionConfig {
  id: DailyMissionId
  name: string
  subtitle: string
  description: string
  emoji: string
  bossName: string
  bossPortrait: string
  themeGradient: string
  borderClass: string
  baseEnemyHp: number
  bossMechanic: string
  dropRates: Array<{ label: string; rate: string }>
  baseRewards: {
    gems?: number
    silverKeys?: number
    hashrate?: number
    randomShards?: number
    blueprints?: number
    heroFragments?: number
    heroBonusXp?: number
  }
}

export const BASE_LOCATIONS: BaseLocationConfig[] = [
  {
    id: 'outskirts_tent',
    tier: 1,
    name: 'Outskirts Tent Camp',
    subtitle: 'Stage 1 Starter Hideout',
    description:
      'A patched canvas tent pitched on a grassy ridge outside the distant city skyline, lit by a crackling fiat campfire.',
    unlockStage: 1,
    unlockGemsCost: 0,
    auraLabel: '+5% Global Yield • +10 Margin HP',
    globalYieldBonus: 0.05,
    startingHpBonus: 10,
    emoji: '⛺',
  },
  {
    id: 'suburban_garage',
    tier: 2,
    name: 'Suburban Garage',
    subtitle: 'Unlocks at Stage 4',
    description:
      'Oil-stained concrete floor packed with folding tables, humming box fans, stacked GPU rigs, and warm pizza boxes.',
    unlockStage: 4,
    unlockGemsCost: 150,
    auraLabel: '+15% Global Yield • +30 Margin HP',
    globalYieldBonus: 0.15,
    startingHpBonus: 30,
    emoji: '🏠',
  },
  {
    id: 'cyber_loft',
    tier: 3,
    name: 'Downtown Cyber-Loft',
    subtitle: 'Unlocks at Stage 8',
    description:
      'Exposed brick industrial loft overlooking the financial district with neon tickers and a multi-monitor command wall.',
    unlockStage: 8,
    unlockGemsCost: 350,
    auraLabel: '+30% Global Yield • +65 Margin HP',
    globalYieldBonus: 0.3,
    startingHpBonus: 65,
    emoji: '🏙️',
  },
  {
    id: 'miami_penthouse',
    tier: 4,
    name: 'Miami Bull Penthouse',
    subtitle: 'Unlocks at Stage 14',
    description:
      'Swaying palm trees, rooftop infinity pool, golden sunset skyline, and a neon-wrapped supercar parked on the helipad.',
    unlockStage: 14,
    unlockGemsCost: 750,
    auraLabel: '+55% Global Yield • +120 Margin HP',
    globalYieldBonus: 0.55,
    startingHpBonus: 120,
    emoji: '🌴',
  },
  {
    id: 'lunar_citadel',
    tier: 5,
    name: 'Lunar Citadel',
    subtitle: 'Unlocks at Stage 20',
    description:
      'High-tech pressurized glass biodome on the Moon overlooking Earth, powered by zero-kelvin quantum orbital relays.',
    unlockStage: 20,
    unlockGemsCost: 1500,
    auraLabel: '+100% Global Yield • +250 Margin HP',
    globalYieldBonus: 1.0,
    startingHpBonus: 250,
    emoji: '🌕',
  },
]

export const BASE_LOCATION_MAP: Record<BaseLocationId, BaseLocationConfig> = Object.fromEntries(
  BASE_LOCATIONS.map((l) => [l.id, l]),
) as Record<BaseLocationId, BaseLocationConfig>

export const FURNITURE_AMENITIES: FurnitureConfig[] = [
  {
    id: 'trading_desk',
    name: 'Trading Desk',
    tierNames: ['Wooden Camp Crate', 'Dual-Monitor Desk', 'Holographic Command Terminal'],
    description: 'Boosts base candle damage across all equipped Coins and Heroes.',
    buffLabel: 'Global Coin Base Damage',
    unit: '%',
    baseValuePerLevel: 4,
    baseHashrateCost: 150,
    costMultiplier: 1.45,
    emoji: '🖥️',
    maxLevel: 10,
  },
  {
    id: 'campfire_bar',
    name: 'Campfire / Espresso Bar',
    tierNames: ['Burning Fiat Campfire', 'Artisan Espresso Cart', 'Nitro Cold-Brew Bar'],
    description: 'Keeps the squad wired! Accelerates Active Skill charge speed for all Heroes.',
    buffLabel: 'All Hero Skill Charge Speed',
    unit: '%',
    baseValuePerLevel: 5,
    baseHashrateCost: 160,
    costMultiplier: 1.45,
    emoji: '🔥',
    maxLevel: 10,
  },
  {
    id: 'cooling_rack',
    name: 'Cooling Fan / Cryo Rack',
    tierNames: ['Plastic Box Fan', 'Liquid-Cooled Server Rack', 'Sub-Zero Cryo Matrix'],
    description: 'Prevents thermal throttling so all Coins roll candlesticks faster.',
    buffLabel: 'Global Coin Tick Speed',
    unit: '%',
    baseValuePerLevel: 3,
    baseHashrateCost: 180,
    costMultiplier: 1.5,
    emoji: '❄️',
    maxLevel: 10,
  },
  {
    id: 'backup_generator',
    name: 'Backup Generator',
    tierNames: ['Diesel Camp Generator', 'Solar Battery Wall', 'Fusion Micro-Reactor'],
    description: 'Supercharges 24/7 Idle Patrol mining rigs for higher hourly Hashrate.',
    buffLabel: 'Idle Patrol Hourly Hashrate',
    unit: '%',
    baseValuePerLevel: 8,
    baseHashrateCost: 140,
    costMultiplier: 1.42,
    emoji: '⚡',
    maxLevel: 10,
  },
  {
    id: 'security_firewall',
    name: 'Security Firewall',
    tierNames: ['Barbed Hardware Lock', 'Air-Gapped Cold Vault', 'Quantum AI Firewall'],
    description: 'Reinforces your account liquidation threshold before entering any Stage Run.',
    buffLabel: 'Starting Margin Max HP',
    unit: ' HP',
    baseValuePerLevel: 15,
    baseHashrateCost: 170,
    costMultiplier: 1.45,
    emoji: '🛡️',
    maxLevel: 10,
  },
  {
    id: 'satellite_dish',
    name: 'Satellite Dish',
    tierNames: ['Tin-Foil Antenna', 'Starlink Roof Array', 'Deep-Space Laser Uplink'],
    description: 'Intercepts institutional orderflow to grant bonus Seed Capital every run.',
    buffLabel: 'Starting Run Seed Capital',
    unit: '$',
    baseValuePerLevel: 35,
    baseHashrateCost: 190,
    costMultiplier: 1.48,
    emoji: '📡',
    maxLevel: 10,
  },
]

export const FURNITURE_MAP: Record<FurnitureId, FurnitureConfig> = Object.fromEntries(
  FURNITURE_AMENITIES.map((f) => [f.id, f]),
) as Record<FurnitureId, FurnitureConfig>

export function getFurnitureUpgradeCost(id: FurnitureId, currentLevel: number): number {
  const cfg = FURNITURE_MAP[id]
  if (!cfg) return 999999
  return Math.round(cfg.baseHashrateCost * Math.pow(cfg.costMultiplier, Math.max(0, currentLevel - 1)))
}

export function getFurnitureBonus(cfgOrId: FurnitureConfig | FurnitureId, level: number): number {
  const cfg = typeof cfgOrId === 'string' ? FURNITURE_MAP[cfgOrId] : cfgOrId
  if (!cfg) return 0
  return cfg.baseValuePerLevel * Math.max(1, level)
}

export function getFurnitureTierName(cfgOrId: FurnitureConfig | FurnitureId, level: number): string {
  const cfg = typeof cfgOrId === 'string' ? FURNITURE_MAP[cfgOrId] : cfgOrId
  if (!cfg) return ''
  if (level >= 8) return cfg.tierNames[2]
  if (level >= 4) return cfg.tierNames[1]
  return cfg.tierNames[0]
}

export const DAILY_FREE_MISSION_TICKETS = 2
export const EXTRA_TICKET_GEMS_COST = 30
export const MAX_MISSION_TIER = 10

export function missionTierHp(mission: DailyMissionConfig, tier: number): number {
  return Math.round(mission.baseEnemyHp * Math.pow(1.4, Math.max(0, tier - 1)))
}

export function missionTierRewards(mission: DailyMissionConfig, tier: number) {
  const mult = Math.pow(1.35, Math.max(0, tier - 1))
  return {
    gems: mission.baseRewards.gems ? Math.round(mission.baseRewards.gems * mult) : 0,
    silverKeys: mission.baseRewards.silverKeys
      ? Math.max(1, Math.round(mission.baseRewards.silverKeys * (tier >= 5 ? 2 : 1)))
      : 0,
    hashrate: mission.baseRewards.hashrate ? Math.round(mission.baseRewards.hashrate * mult) : 0,
    shards: mission.baseRewards.randomShards
      ? Math.round(mission.baseRewards.randomShards * mult)
      : 0,
    blueprints: mission.baseRewards.blueprints
      ? Math.round(mission.baseRewards.blueprints * mult)
      : 0,
    heroFragments: mission.baseRewards.heroFragments
      ? Math.max(2, Math.round(mission.baseRewards.heroFragments * (1 + (tier - 1) * 0.25)))
      : 0,
  }
}

export const DAILY_FARMING_MISSIONS: DailyMissionConfig[] = [
  {
    id: 'whale_liquidity_heist',
    name: 'Whale Liquidity Heist',
    subtitle: 'Satoshi Gems & Silver Vault Keys',
    description:
      'Raid the offshore yacht reserve! Crack the Golden Whale Safe before the security bots lock the ledger.',
    emoji: '💎',
    bossName: 'Golden Yacht Whale',
    bossPortrait: 'Fish',
    themeGradient: 'from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc]',
    borderClass: 'border-[#0284c7]',
    baseEnemyHp: 320,
    bossMechanic:
      'Offshore Sell Wall: Deploys an armored luxury hull that absorbs small ticks. Use Hero Overclock Bursts to crack the vault before the 25s timer expires!',
    dropRates: [
      { label: 'Satoshi Gems (65–950)', rate: '100% Guaranteed' },
      { label: 'Silver Vault Keys (1–3)', rate: '100% Guaranteed' },
      { label: 'Hero Fragments (3–10 Shards)', rate: '100% Guaranteed' },
      { label: 'Bonus Lady Fortuna Fragments', rate: '25% Chance' },
    ],
    baseRewards: {
      gems: 65,
      silverKeys: 1,
      heroFragments: 3,
    },
  },
  {
    id: 'asic_overclock_trial',
    name: 'ASIC Overclock Trial',
    subtitle: 'Massive Hashrate & Coin Shards',
    description:
      'Survive a high-voltage mining surge against the Rogue Hashrate Golem to harvest raw energy and Coin Shards.',
    emoji: '⚡',
    bossName: 'Overclocked ASIC Golem',
    bossPortrait: 'Flame',
    themeGradient: 'from-[#fef9c3] via-[#fde047] to-[#facc15]',
    borderClass: 'border-[#ca8a04]',
    baseEnemyHp: 360,
    bossMechanic:
      'Thermal Surge Core: Emits high-voltage static every 4 seconds. High-speed Coin ticks overload its cooling coils for bonus critical damage!',
    dropRates: [
      { label: 'Raw Hashrate (550–8,200⚡)', rate: '100% Guaranteed' },
      { label: 'Coin Fusion Shards (12–180)', rate: '100% Guaranteed' },
      { label: 'Hero Fragments (4–12 Shards)', rate: '100% Guaranteed' },
      { label: 'Bonus Roxy / Jordan Fragments', rate: '30% Chance' },
    ],
    baseRewards: {
      hashrate: 550,
      randomShards: 12,
      heroFragments: 4,
    },
  },
  {
    id: 'corporate_espionage',
    name: 'Corporate Espionage',
    subtitle: 'Hero Shards & Furniture Blueprints',
    description:
      'Infiltrate Wall Street Floor 99 to extract classified Base Blueprints and Hero mentorship fragments!',
    emoji: '🛋️',
    bossName: 'Floor 99 Hedge Director',
    bossPortrait: 'Gavel',
    themeGradient: 'from-[#f3e8ff] via-[#e9d5ff] to-[#d8b4fe]',
    borderClass: 'border-[#7e22ce]',
    baseEnemyHp: 400,
    bossMechanic:
      'Laser Vault Security: Protected by encrypted institutional firewalls. Breaching the vault yields maximum Hero Fragments & Furniture Blueprints!',
    dropRates: [
      { label: 'Hero Fragments (6–20 Shards)', rate: '100% Guaranteed' },
      { label: 'Furniture Blueprints (3–45 BP)', rate: '100% Guaranteed' },
      { label: 'Raw Hashrate (380–5,600⚡)', rate: '100% Guaranteed' },
      { label: 'Satoshi Nakamoto / Oracle Shards', rate: '35% Chance' },
    ],
    baseRewards: {
      hashrate: 380,
      blueprints: 3,
      gems: 35,
      heroFragments: 6,
    },
  },
]

export const HERO_CAMP_QUIPS: Record<string, string[]> = {
  rookie_satoshi: [
    'Toasted marshmallow + green 1m candle = pure comfy alpha! 🔥',
    'I hid 15 Satoshi Gems under this log! Keep stacking!',
    'Genesis block never sleeps, even when we camp outside town!',
  ],
  degen_ape_roxy: [
    '500 jumping jacks for 500x meme leverage! LFG!! 🦍💪',
    'Cardio keeps the paper hands away! Catch these Gems!',
    'Look at my chart goggles—everything is pointing UP!',
  ],
  jordan_the_wolf: [
    'Line 1 is Tokyo, Line 2 is Geneva—both are buying our bags! 📞💵',
    'Never pay retail gas fees, kid. Take a cut of my skim!',
    'I just flipped a tent into a penthouse! Here is your dividend!',
  ],
  lady_fortuna: [
    'House always wins—and in this camp, WE are the house! 👑💎',
    'Roll the golden dice, darling! Every candle is a jackpot!',
    'A true whale always tips the camp in pure Satoshi Gems!',
  ],
  quantum_ai_oracle: [
    'I simulated 14,000,605 orderbooks... this camp wins in all of them. ✨',
    'Hovering at 0 Kelvin reduces latency by 99.8%. Catch this shard.',
    'Consensus achieved: free Hashrate manifested from the mempool.',
  ],
  satoshi_nakamoto: [
    'Chancellor on brink of second bailout... good thing we hold the keys. ₿',
    'One CPU, one vote, one giant green candle for the camp!',
    'The Genesis block blesses your portfolio with pure alpha.',
  ],
}
