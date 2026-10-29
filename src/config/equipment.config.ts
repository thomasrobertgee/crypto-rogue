/**
 * Mining Rig Hardware Equipment System Configuration
 *
 * Defines the 6 rig equipment slots, rarity tiers, corporate set bonuses,
 * secondary affix generation, salvage rewards, and upgrade costs.
 */

/** Hard ceiling on passive Damage Reduction from Rig equipment and Multi-Skill masteries. */
export const MAX_PASSIVE_DAMAGE_REDUCTION_PCT = 55

export type RigSlot =
  | 'gpu'
  | 'cooling_fan'
  | 'power_supply'
  | 'motherboard'
  | 'ssd'
  | 'asic_processor'

export type RigRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'ancient'

export type RigSetId =
  | 'nvidia_protocol'
  | 'antminer_asic'
  | 'silicon_valley_custom'

export type RigAffixType =
  | 'flatAtk'
  | 'greenDamagePct'
  | 'tickSpeedPct'
  | 'flatHp'
  | 'marginHpPct'
  | 'overdriveCap'
  | 'startingCash'
  | 'rerollDiscountPct'
  | 'critChance'
  | 'critMultiplier'
  | 'bossDamagePct'
  | 'counterPumpWindowPct'

export interface RigAffix {
  id: string
  type: RigAffixType
  value: number
  label: string
}

export interface RigItem {
  id: string
  name: string
  slot: RigSlot
  rarity: RigRarity
  level: number
  stars: number
  setId?: RigSetId
  primaryStat: {
    type: RigAffixType
    value: number
    label: string
  }
  secondaryAffixes: RigAffix[]
  icon: string
  flavor: string
}

export interface RigSlotMeta {
  id: RigSlot
  name: string
  shortName: string
  icon: string
  primaryStatName: string
  description: string
  baseColor: string
}

export const RIG_SLOT_CONFIG: Record<RigSlot, RigSlotMeta> = {
  gpu: {
    id: 'gpu',
    name: 'Graphics Processing Unit (GPU)',
    shortName: 'GPU',
    icon: '🖥️',
    primaryStatName: 'Base Flat ATK & Green DMG',
    description: 'Powers raw cryptographic hashing to scale Flat Attack and Green Candle burst damage.',
    baseColor: '#10b981',
  },
  cooling_fan: {
    id: 'cooling_fan',
    name: 'Cryo Cooling Fan Assembly',
    shortName: 'Cooling',
    icon: '❄️',
    primaryStatName: 'Global Tick Speed (+% Rate)',
    description: 'Dissipates extreme thermal throttling, accelerating wallet coin roll tick frequency.',
    baseColor: '#06b6d4',
  },
  power_supply: {
    id: 'power_supply',
    name: 'Titanium Modular PSU',
    shortName: 'PSU',
    icon: '⚡',
    primaryStatName: 'Base Margin HP (+Flat & +%)',
    description: 'Stabilizes voltage rails against liquidation spikes, vastly expanding Margin HP.',
    baseColor: '#eab308',
  },
  motherboard: {
    id: 'motherboard',
    name: 'Multi-PCIe Server Board',
    shortName: 'Motherboard',
    icon: '🖲️',
    primaryStatName: 'Overdrive Cap (+Capacity)',
    description: 'High-bandwidth PCIe bus lines expanding Overdrive and maximum Coin capacity ceiling.',
    baseColor: '#a855f7',
  },
  ssd: {
    id: 'ssd',
    name: 'High-IOPS NVMe SSD',
    shortName: 'SSD',
    icon: '💾',
    primaryStatName: 'Starting Cash & Shop Reroll Discount',
    description: 'Zero-latency orderbook ledger cache providing starting run liquidity and cheap rerolls.',
    baseColor: '#f97316',
  },
  asic_processor: {
    id: 'asic_processor',
    name: 'Sub-3nm Custom ASIC Core',
    shortName: 'ASIC',
    icon: '💎',
    primaryStatName: 'Crit Chance & Crit Multiplier',
    description: 'Specialized silicon chips executing instant mathematical calculations for devastating crits.',
    baseColor: '#ec4899',
  },
}

export interface RigRarityMeta {
  id: RigRarity
  name: string
  color: string
  bgGradient: string
  borderColor: string
  textColor: string
  badgeBg: string
  salvageSolderWire: number
  maxLevel: number
  maxAffixes: number
  statMultiplier: number
}

export const RIG_RARITY_CONFIG: Record<RigRarity, RigRarityMeta> = {
  common: {
    id: 'common',
    name: 'Common',
    color: '#94a3b8',
    bgGradient: 'from-[#f8fafc] to-[#e2e8f0]',
    borderColor: '#64748b',
    textColor: '#334155',
    badgeBg: 'bg-slate-200 text-slate-700 border-slate-400',
    salvageSolderWire: 5,
    maxLevel: 5,
    maxAffixes: 1,
    statMultiplier: 1.0,
  },
  uncommon: {
    id: 'uncommon',
    name: 'Uncommon',
    color: '#22c55e',
    bgGradient: 'from-[#f0fdf4] to-[#dcfce7]',
    borderColor: '#16a34a',
    textColor: '#15803d',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-400',
    salvageSolderWire: 12,
    maxLevel: 8,
    maxAffixes: 2,
    statMultiplier: 1.35,
  },
  rare: {
    id: 'rare',
    name: 'Rare',
    color: '#3b82f6',
    bgGradient: 'from-[#eff6ff] to-[#dbeafe]',
    borderColor: '#2563eb',
    textColor: '#1d4ed8',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-400',
    salvageSolderWire: 25,
    maxLevel: 12,
    maxAffixes: 2,
    statMultiplier: 1.8,
  },
  epic: {
    id: 'epic',
    name: 'Epic',
    color: '#a855f7',
    bgGradient: 'from-[#faf5ff] to-[#f3e8ff]',
    borderColor: '#9333ea',
    textColor: '#7e22ce',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-400',
    salvageSolderWire: 50,
    maxLevel: 15,
    maxAffixes: 3,
    statMultiplier: 2.4,
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary',
    color: '#f59e0b',
    bgGradient: 'from-[#fffbeb] to-[#fef3c7]',
    borderColor: '#d97706',
    textColor: '#b45309',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-500',
    salvageSolderWire: 120,
    maxLevel: 20,
    maxAffixes: 4,
    statMultiplier: 3.2,
  },
  ancient: {
    id: 'ancient',
    name: 'Ancient',
    color: '#06b6d4',
    bgGradient: 'from-[#ecfeff] via-[#f0fdfa] to-[#fdf4ff]',
    borderColor: '#0891b2',
    textColor: '#0e7490',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-500',
    salvageSolderWire: 300,
    maxLevel: 25,
    maxAffixes: 4,
    statMultiplier: 4.5,
  },
}

export interface RigCorporateSet {
  id: RigSetId
  name: string
  brand: string
  tagline: string
  icon: string
  accentColor: string
  twoPieceBonus: {
    label: string
    description: string
  }
  fourPieceBonus?: {
    label: string
    description: string
  }
}

export const RIG_CORPORATE_SETS: Record<RigSetId, RigCorporateSet> = {
  nvidia_protocol: {
    id: 'nvidia_protocol',
    name: 'N-Vidia Protocol',
    brand: 'N-VIDIATECH CORP',
    tagline: 'The Way Liquidity Is Meant to Be Played',
    icon: '🟢',
    accentColor: '#22c55e',
    twoPieceBonus: {
      label: '+15% Green Crit DMG',
      description: 'Increases Green Candle Critical Hit Multiplier by +15%.',
    },
    fourPieceBonus: {
      label: '100% Capacity Auto-Burst',
      description: 'Reaching 100% Coin capacity triggers an instant Green Candle auto-burst without draining margin.',
    },
  },
  antminer_asic: {
    id: 'antminer_asic',
    name: 'AntMiner ASIC Industrial',
    brand: 'BITMAIN MINING SYSTEMS',
    tagline: 'Industrial Proof-of-Work Supremacy',
    icon: '🟠',
    accentColor: '#f97316',
    twoPieceBonus: {
      label: '+20% Boss Flat ATK',
      description: 'Deals +20% Flat ATK against Floor Elites and Stage Final Bosses.',
    },
    fourPieceBonus: {
      label: 'Zero-Red Shield Absorption',
      description: 'The first Red Candle in every battle node deals exactly 0 Margin liquidation damage.',
    },
  },
  silicon_valley_custom: {
    id: 'silicon_valley_custom',
    name: 'Silicon Valley Custom',
    brand: 'SAND HILL LABS',
    tagline: 'Overclocked Liquid-Nitrogen Architecture',
    icon: '🟣',
    accentColor: '#a855f7',
    twoPieceBonus: {
      label: '+10% Global Tick Speed',
      description: 'Accelerates coin roll cycles by +10% across all wallet slots permanently.',
    },
  },
}

export interface AggregatedRigStats {
  flatAtk: number
  greenDamagePct: number
  tickSpeedPct: number
  flatHp: number
  marginHpPct: number
  overdriveCap: number
  startingCash: number
  rerollDiscountPct: number
  critChance: number
  critMultiplier: number
  bossDamagePct: number
  counterPumpWindowPct: number
  totalPowerScore: number
}

export interface ActiveSetBonus {
  setId: RigSetId
  name: string
  pieces: number
  twoPieceActive: boolean
  fourPieceActive: boolean
  twoPieceLabel: string
  fourPieceLabel?: string
}

// ────────────────────────────────────────
// PRE-CONFIGURED STARTER & CATALOG EQUIPMENT
// ────────────────────────────────────────

export const CATALOG_RIG_ITEMS: RigItem[] = [
  // ── GPUs ──
  {
    id: 'rig_gpu_nvidia_rtx4090',
    name: 'RTX 4090 Hash Monster',
    slot: 'gpu',
    rarity: 'legendary',
    level: 1,
    stars: 3,
    setId: 'nvidia_protocol',
    icon: '🖥️',
    flavor: '24GB of high-speed GDDR6X VRAM crunching gigahashes in cold silence.',
    primaryStat: {
      type: 'flatAtk',
      value: 65,
      label: '+65 Flat ATK & +18% Green DMG',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'critMultiplier', value: 0.35, label: '+0.35x Crit Multiplier' },
      { id: 'affix_2', type: 'greenDamagePct', value: 12, label: '+12% Green Candle DMG' },
      { id: 'affix_3', type: 'tickSpeedPct', value: 4, label: '+4% Tick Speed' },
    ],
  },
  {
    id: 'rig_gpu_antminer_hydro',
    name: 'AntMiner S19 Hydro Blade',
    slot: 'gpu',
    rarity: 'epic',
    level: 1,
    stars: 2,
    setId: 'antminer_asic',
    icon: '🖥️',
    flavor: 'Direct liquid cooling plate maintaining sustained hashrate under brutal bear dumps.',
    primaryStat: {
      type: 'flatAtk',
      value: 45,
      label: '+45 Flat ATK & +12% Green DMG',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'bossDamagePct', value: 10, label: '+10% Boss ATK DMG' },
      { id: 'affix_2', type: 'flatAtk', value: 15, label: '+15 Bonus Flat ATK' },
    ],
  },
  {
    id: 'rig_gpu_gtx1660_starter',
    name: 'GTX 1660 Super Miner',
    slot: 'gpu',
    rarity: 'uncommon',
    level: 1,
    stars: 1,
    icon: '🖥️',
    flavor: 'A trusty budget workhorse rescued from a basement mining farm.',
    primaryStat: {
      type: 'flatAtk',
      value: 20,
      label: '+20 Flat ATK & +5% Green DMG',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'greenDamagePct', value: 6, label: '+6% Green Candle DMG' },
    ],
  },

  // ── Cooling Fans ──
  {
    id: 'rig_fan_noctua_industrial',
    name: 'Cryo Vortex 3000RPM',
    slot: 'cooling_fan',
    rarity: 'rare',
    level: 1,
    stars: 2,
    setId: 'silicon_valley_custom',
    icon: '❄️',
    flavor: 'Triple-phase motor spinning high-pitch blades to shed VRM thermals instantly.',
    primaryStat: {
      type: 'tickSpeedPct',
      value: 8,
      label: '+8% Global Tick Speed',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'tickSpeedPct', value: 3.5, label: '+3.5% Tick Speed' },
      { id: 'affix_2', type: 'counterPumpWindowPct', value: 5, label: '+5% Interrupt Window' },
    ],
  },
  {
    id: 'rig_fan_nvidia_cryojet',
    name: 'N-Vidia Cryo-Flow Dual',
    slot: 'cooling_fan',
    rarity: 'legendary',
    level: 1,
    stars: 3,
    setId: 'nvidia_protocol',
    icon: '❄️',
    flavor: 'Aerospace-grade reverse vapor chambers cycling liquid nitrogen over the dies.',
    primaryStat: {
      type: 'tickSpeedPct',
      value: 12,
      label: '+12% Global Tick Speed',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'critChance', value: 6, label: '+6% Crit Chance' },
      { id: 'affix_2', type: 'tickSpeedPct', value: 4.5, label: '+4.5% Tick Speed' },
      { id: 'affix_3', type: 'greenDamagePct', value: 10, label: '+10% Green DMG' },
    ],
  },

  // ── Power Supplies ──
  {
    id: 'rig_psu_corsair_ax1600i',
    name: 'Corsair AX1600i Titanium',
    slot: 'power_supply',
    rarity: 'epic',
    level: 1,
    stars: 2,
    setId: 'silicon_valley_custom',
    icon: '⚡',
    flavor: 'Gallium Nitride transistors offering 96% efficiency with zero electrical ripple.',
    primaryStat: {
      type: 'flatHp',
      value: 280,
      label: '+280 Base HP & +12% Margin HP',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'marginHpPct', value: 8, label: '+8% Margin HP' },
      { id: 'affix_2', type: 'flatHp', value: 75, label: '+75 Flat HP' },
    ],
  },
  {
    id: 'rig_psu_antminer_p21d',
    name: 'AntMiner P21D Server Power',
    slot: 'power_supply',
    rarity: 'legendary',
    level: 1,
    stars: 3,
    setId: 'antminer_asic',
    icon: '⚡',
    flavor: 'Heavy copper busbars built to survive power grid brownouts during Flash Crashes.',
    primaryStat: {
      type: 'flatHp',
      value: 420,
      label: '+420 Base HP & +18% Margin HP',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'flatHp', value: 120, label: '+120 Flat HP' },
      { id: 'affix_2', type: 'bossDamagePct', value: 12, label: '+12% Boss ATK DMG' },
      { id: 'affix_3', type: 'marginHpPct', value: 9, label: '+9% Margin HP' },
    ],
  },

  // ── Motherboards ──
  {
    id: 'rig_mobo_btcd37_8gpu',
    name: 'BTC-D37 Octa-Riser Board',
    slot: 'motherboard',
    rarity: 'rare',
    level: 1,
    stars: 2,
    setId: 'antminer_asic',
    icon: '🖲️',
    flavor: 'Eight integrated PCIe slots spaced for maximum airflow without riser cables.',
    primaryStat: {
      type: 'overdriveCap',
      value: 30,
      label: '+30 Overdrive Max Capacity',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'flatHp', value: 65, label: '+65 Flat HP' },
      { id: 'affix_2', type: 'overdriveCap', value: 12, label: '+12 Overdrive Cap' },
    ],
  },
  {
    id: 'rig_mobo_nvidia_quantum_pcb',
    name: 'N-Vidia Quantum PCB-99',
    slot: 'motherboard',
    rarity: 'legendary',
    level: 1,
    stars: 3,
    setId: 'nvidia_protocol',
    icon: '🖲️',
    flavor: 'Optical data interconnects eliminating bus latency between coin wallet slots.',
    primaryStat: {
      type: 'overdriveCap',
      value: 50,
      label: '+50 Overdrive Max Capacity',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'critMultiplier', value: 0.25, label: '+0.25x Crit Multiplier' },
      { id: 'affix_2', type: 'tickSpeedPct', value: 4, label: '+4% Tick Speed' },
      { id: 'affix_3', type: 'overdriveCap', value: 20, label: '+20 Overdrive Cap' },
    ],
  },

  // ── SSDs ──
  {
    id: 'rig_ssd_samsung990_pro',
    name: 'Samsung 990 Pro 4TB NVMe',
    slot: 'ssd',
    rarity: 'epic',
    level: 1,
    stars: 2,
    setId: 'silicon_valley_custom',
    icon: '💾',
    flavor: '7,450 MB/s sequential read cache buffering whole blockchain mempools.',
    primaryStat: {
      type: 'startingCash',
      value: 350,
      label: '+$350 Starting Cash & -25% Shop Reroll',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'rerollDiscountPct', value: 15, label: '-15% Reroll Cost' },
      { id: 'affix_2', type: 'startingCash', value: 120, label: '+$120 Run Cash' },
    ],
  },
  {
    id: 'rig_ssd_antminer_rom',
    name: 'AntMiner Ultra-Fast Sync ROM',
    slot: 'ssd',
    rarity: 'rare',
    level: 1,
    stars: 2,
    setId: 'antminer_asic',
    icon: '💾',
    flavor: 'Pre-synced Genesis block ledger ensuring instant connection to Node 1.',
    primaryStat: {
      type: 'startingCash',
      value: 220,
      label: '+$220 Starting Cash & -15% Shop Reroll',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'bossDamagePct', value: 8, label: '+8% Boss ATK DMG' },
      { id: 'affix_2', type: 'startingCash', value: 80, label: '+$80 Run Cash' },
    ],
  },

  // ── ASIC Processors ──
  {
    id: 'rig_asic_bm1397_7nm',
    name: 'Bitmain BM1397 7nm ASIC',
    slot: 'asic_processor',
    rarity: 'epic',
    level: 1,
    stars: 2,
    setId: 'antminer_asic',
    icon: '💎',
    flavor: 'FinFET semiconductor lithography delivering unprecedented SHA-256 crit surges.',
    primaryStat: {
      type: 'critChance',
      value: 12,
      label: '+12% Crit Chance & +0.45x Crit Mult',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'critMultiplier', value: 0.3, label: '+0.30x Crit Mult' },
      { id: 'affix_2', type: 'flatAtk', value: 20, label: '+20 Flat ATK' },
    ],
  },
  {
    id: 'rig_asic_nvidia_tensor_die',
    name: 'N-Vidia H100 Tensor Die',
    slot: 'asic_processor',
    rarity: 'legendary',
    level: 1,
    stars: 3,
    setId: 'nvidia_protocol',
    icon: '💎',
    flavor: '4th-Gen Tensor cores executing real-time candlestick predictive regressions.',
    primaryStat: {
      type: 'critChance',
      value: 18,
      label: '+18% Crit Chance & +0.75x Crit Mult',
    },
    secondaryAffixes: [
      { id: 'affix_1', type: 'critMultiplier', value: 0.45, label: '+0.45x Crit Mult' },
      { id: 'affix_2', type: 'greenDamagePct', value: 14, label: '+14% Green DMG' },
      { id: 'affix_3', type: 'critChance', value: 5, label: '+5% Crit Chance' },
    ],
  },
]

// ────────────────────────────────────────
// SECONDARY AFFIX POOL & REFORGE HELPERS
// ────────────────────────────────────────

interface AffixTemplate {
  type: RigAffixType
  minVal: number
  maxVal: number
  labelGen: (v: number) => string
}

export const AFFIX_TEMPLATES: AffixTemplate[] = [
  {
    type: 'flatAtk',
    minVal: 10,
    maxVal: 45,
    labelGen: (v) => `+${Math.round(v)} Flat ATK`,
  },
  {
    type: 'greenDamagePct',
    minVal: 5,
    maxVal: 22,
    labelGen: (v) => `+${Math.round(v)}% Green Candle DMG`,
  },
  {
    type: 'tickSpeedPct',
    minVal: 2.5,
    maxVal: 8.5,
    labelGen: (v) => `+${v.toFixed(1)}% Tick Speed`,
  },
  {
    type: 'flatHp',
    minVal: 40,
    maxVal: 180,
    labelGen: (v) => `+${Math.round(v)} Flat HP`,
  },
  {
    type: 'marginHpPct',
    minVal: 4,
    maxVal: 16,
    labelGen: (v) => `+${Math.round(v)}% Margin HP`,
  },
  {
    type: 'overdriveCap',
    minVal: 8,
    maxVal: 35,
    labelGen: (v) => `+${Math.round(v)} Overdrive Cap`,
  },
  {
    type: 'startingCash',
    minVal: 50,
    maxVal: 250,
    labelGen: (v) => `+$${Math.round(v)} Starting Cash`,
  },
  {
    type: 'rerollDiscountPct',
    minVal: 8,
    maxVal: 25,
    labelGen: (v) => `-${Math.round(v)}% Shop Reroll Cost`,
  },
  {
    type: 'critChance',
    minVal: 3,
    maxVal: 10,
    labelGen: (v) => `+${Math.round(v)}% Crit Chance`,
  },
  {
    type: 'critMultiplier',
    minVal: 0.15,
    maxVal: 0.55,
    labelGen: (v) => `+${v.toFixed(2)}x Crit Multiplier`,
  },
  {
    type: 'bossDamagePct',
    minVal: 6,
    maxVal: 20,
    labelGen: (v) => `+${Math.round(v)}% Boss ATK DMG`,
  },
  {
    type: 'counterPumpWindowPct',
    minVal: 4,
    maxVal: 15,
    labelGen: (v) => `+${Math.round(v)}% Counter-Pump Window`,
  },
]

export const REFORGE_COST = {
  solderWire: 20,
  hashrate: 650,
}

export function getRigItemUpgradeCost(item: RigItem): { hashrate: number; solderWire: number } {
  const currentLvl = item.level ?? 1
  const rarityMultiplier = RIG_RARITY_CONFIG[item.rarity]?.statMultiplier ?? 1
  return {
    hashrate: Math.round(250 * Math.pow(1.22, currentLvl - 1) * rarityMultiplier),
    solderWire: Math.max(1, Math.floor(currentLvl / 3)),
  }
}

export function upgradeRigItemLevel(item: RigItem): RigItem {
  const rarityMeta = RIG_RARITY_CONFIG[item.rarity]
  if (item.level >= rarityMeta.maxLevel) return item

  const newLevel = item.level + 1
  const scale = 1.08 // +8% per level
  const newPrimaryVal = Math.round(item.primaryStat.value * scale * 10) / 10

  return {
    ...item,
    level: newLevel,
    primaryStat: {
      ...item.primaryStat,
      value: newPrimaryVal,
      label: item.primaryStat.label.replace(
        String(Math.round(item.primaryStat.value)),
        String(Math.round(newPrimaryVal)),
      ),
    },
  }
}

export function reforgeAffix(item: RigItem, affixIndex: number): RigItem {
  if (affixIndex < 0 || affixIndex >= item.secondaryAffixes.length) return item

  const currentType = item.secondaryAffixes[affixIndex]?.type
  const possibleTemplates = AFFIX_TEMPLATES.filter((t) => t.type !== currentType)
  const template = possibleTemplates[Math.floor(Math.random() * possibleTemplates.length)] ?? AFFIX_TEMPLATES[0]

  const rarityMeta = RIG_RARITY_CONFIG[item.rarity]
  const rnd = Math.random()
  const rawVal = template.minVal + rnd * (template.maxVal - template.minVal)
  const scaledVal = rawVal * (rarityMeta.statMultiplier * 0.75)
  const finalVal = template.type === 'critMultiplier' ? Math.round(scaledVal * 100) / 100 : Math.round(scaledVal * 10) / 10

  const newAffix: RigAffix = {
    id: `affix_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type: template.type,
    value: finalVal,
    label: template.labelGen(finalVal),
  }

  const updatedAffixes = [...item.secondaryAffixes]
  updatedAffixes[affixIndex] = newAffix

  return {
    ...item,
    secondaryAffixes: updatedAffixes,
  }
}

export function calculateAggregatedRigStats(
  equippedRig: Record<RigSlot, RigItem | null>,
  heroStars: number = 1,
): AggregatedRigStats {
  const stats: AggregatedRigStats = {
    flatAtk: 0,
    greenDamagePct: 0,
    tickSpeedPct: 0,
    flatHp: 0,
    marginHpPct: 0,
    overdriveCap: 0,
    startingCash: 0,
    rerollDiscountPct: 0,
    critChance: 0,
    critMultiplier: 0,
    bossDamagePct: 0,
    counterPumpWindowPct: 0,
    totalPowerScore: 0,
  }

  const items = Object.values(equippedRig).filter((i): i is RigItem => i !== null)

  items.forEach((item) => {
    // Add Primary Stat
    const pType = item.primaryStat.type
    const pVal = item.primaryStat.value

    if (pType === 'flatAtk') stats.flatAtk += pVal
    else if (pType === 'greenDamagePct') stats.greenDamagePct += pVal
    else if (pType === 'tickSpeedPct') stats.tickSpeedPct += pVal
    else if (pType === 'flatHp') stats.flatHp += pVal
    else if (pType === 'marginHpPct') stats.marginHpPct += pVal
    else if (pType === 'overdriveCap') stats.overdriveCap += pVal
    else if (pType === 'startingCash') stats.startingCash += pVal
    else if (pType === 'rerollDiscountPct') stats.rerollDiscountPct += pVal
    else if (pType === 'critChance') stats.critChance += pVal
    else if (pType === 'critMultiplier') stats.critMultiplier += pVal
    else if (pType === 'bossDamagePct') stats.bossDamagePct += pVal
    else if (pType === 'counterPumpWindowPct') stats.counterPumpWindowPct += pVal

    // Add Secondary Affixes
    item.secondaryAffixes.forEach((affix) => {
      const aType = affix.type
      const aVal = affix.value
      if (aType === 'flatAtk') stats.flatAtk += aVal
      else if (aType === 'greenDamagePct') stats.greenDamagePct += aVal
      else if (aType === 'tickSpeedPct') stats.tickSpeedPct += aVal
      else if (aType === 'flatHp') stats.flatHp += aVal
      else if (aType === 'marginHpPct') stats.marginHpPct += aVal
      else if (aType === 'overdriveCap') stats.overdriveCap += aVal
      else if (aType === 'startingCash') stats.startingCash += aVal
      else if (aType === 'rerollDiscountPct') stats.rerollDiscountPct += aVal
      else if (aType === 'critChance') stats.critChance += aVal
      else if (aType === 'critMultiplier') stats.critMultiplier += aVal
      else if (aType === 'bossDamagePct') stats.bossDamagePct += aVal
      else if (aType === 'counterPumpWindowPct') stats.counterPumpWindowPct += aVal
    })
  })

  // Add Corporate Set Bonuses
  const sets = calculateActiveSetBonuses(equippedRig)
  sets.forEach((set) => {
    if (set.setId === 'nvidia_protocol' && set.twoPieceActive) {
      stats.critMultiplier += 0.15 // +15% Green Crit DMG
    }
    if (set.setId === 'antminer_asic' && set.twoPieceActive) {
      stats.bossDamagePct += 20 // +20% Flat ATK against Bosses
    }
    if (set.setId === 'silicon_valley_custom' && set.twoPieceActive) {
      stats.tickSpeedPct += 10 // +10% Tick Speed across all slots
    }
  })

  // Apply Hero Star Multiplier (+15% to all Rig stats per star above 1★)
  const heroStarRigMultiplier = 1 + Math.max(0, heroStars - 1) * 0.15
  if (heroStarRigMultiplier !== 1) {
    stats.flatAtk *= heroStarRigMultiplier
    stats.flatHp *= heroStarRigMultiplier
    stats.greenDamagePct *= heroStarRigMultiplier
    stats.tickSpeedPct *= heroStarRigMultiplier
    stats.marginHpPct *= heroStarRigMultiplier
    stats.overdriveCap *= heroStarRigMultiplier
    stats.startingCash *= heroStarRigMultiplier
    stats.critChance *= heroStarRigMultiplier
    stats.critMultiplier *= heroStarRigMultiplier
    stats.bossDamagePct *= heroStarRigMultiplier
    stats.counterPumpWindowPct *= heroStarRigMultiplier
  }

  // Round stats neatly
  stats.flatAtk = Math.round(stats.flatAtk)
  stats.greenDamagePct = Math.round(stats.greenDamagePct)
  stats.tickSpeedPct = Math.round(stats.tickSpeedPct * 10) / 10
  stats.flatHp = Math.round(stats.flatHp)
  stats.marginHpPct = Math.round(stats.marginHpPct)
  stats.overdriveCap = Math.round(stats.overdriveCap)
  stats.startingCash = Math.round(stats.startingCash)
  stats.rerollDiscountPct = Math.min(75, Math.round(stats.rerollDiscountPct))
  stats.critChance = Math.min(80, Math.round(stats.critChance))
  stats.critMultiplier = Math.round(stats.critMultiplier * 100) / 100
  stats.bossDamagePct = Math.round(stats.bossDamagePct)
  stats.counterPumpWindowPct = Math.round(stats.counterPumpWindowPct)

  // Composite Rig Power Score
  stats.totalPowerScore = Math.round(
    stats.flatAtk * 12 +
      stats.flatHp * 1.5 +
      stats.tickSpeedPct * 45 +
      stats.greenDamagePct * 20 +
      stats.critChance * 35 +
      stats.critMultiplier * 200 +
      stats.overdriveCap * 15,
  )

  return stats
}

export function calculateActiveSetBonuses(
  equippedRig: Record<RigSlot, RigItem | null>,
): ActiveSetBonus[] {
  const counts: Partial<Record<RigSetId, number>> = {}

  Object.values(equippedRig).forEach((item) => {
    if (item?.setId) {
      counts[item.setId] = (counts[item.setId] ?? 0) + 1
    }
  })

  const results: ActiveSetBonus[] = []

  ;(Object.keys(counts) as RigSetId[]).forEach((setId) => {
    const pieces = counts[setId] ?? 0
    const setCfg = RIG_CORPORATE_SETS[setId]
    if (!setCfg || pieces < 2) return

    results.push({
      setId,
      name: setCfg.name,
      pieces,
      twoPieceActive: pieces >= 2,
      fourPieceActive: pieces >= 4 && Boolean(setCfg.fourPieceBonus),
      twoPieceLabel: setCfg.twoPieceBonus.label,
      fourPieceLabel: setCfg.fourPieceBonus?.label,
    })
  })

  return results
}
