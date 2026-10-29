export type PetId = 'mecha_shiba' | 'laser_bull' | 'quantum_owl' | 'diamond_crab'

export interface PetConfig {
  id: PetId
  name: string
  title: string
  emoji: string
  color: string
  bgGradient: string
  description: string
  baseBonusDesc: string
  statScaleDesc: string
  maxLevel: number
}

export const PETS: PetConfig[] = [
  {
    id: 'mecha_shiba',
    name: 'MechaShiba',
    title: 'Cyber Security Hound',
    emoji: '🐕',
    color: '#eab308',
    bgGradient: 'from-[#fef08a] via-[#eab308] to-[#ca8a04]',
    description: 'Deploys an autonomous electromagnetic firewall that absorbs lethal enemy counter-strikes.',
    baseBonusDesc: 'Blocks 1 Red Candle counter-strike every 16s',
    statScaleDesc: '-0.4s block cooldown per Pet Level (down to 8s)',
    maxLevel: 20,
  },
  {
    id: 'laser_bull',
    name: 'LaserBull',
    title: 'Momentum Apex Predator',
    emoji: '🐂',
    color: '#22c55e',
    bgGradient: 'from-[#bbf7d0] via-[#22c55e] to-[#15803d]',
    description: 'Channels supercharged green candle resonance directly into critical hit multipliers.',
    baseBonusDesc: '+15% Green roll critical damage',
    statScaleDesc: '+2% additional Green crit damage per Pet Level',
    maxLevel: 20,
  },
  {
    id: 'quantum_owl',
    name: 'QuantumOwl',
    title: 'Temporal Flux Familiar',
    emoji: '🦉',
    color: '#a855f7',
    bgGradient: 'from-[#e9d5ff] via-[#a855f7] to-[#7e22ce]',
    description: 'Bends block-confirmation latency to overclock your Lead Hero skill charge cadence.',
    baseBonusDesc: 'Charges Hero Active Skill +10% faster',
    statScaleDesc: '+1.5% Hero Skill charge speed per Pet Level',
    maxLevel: 20,
  },
  {
    id: 'diamond_crab',
    name: 'DiamondCrab',
    title: 'Hard-Fork Vault Guardian',
    emoji: '🦀',
    color: '#06b6d4',
    bgGradient: 'from-[#cffafe] via-[#06b6d4] to-[#0e7490]',
    description: 'Pinches emergency margin collateral out of thin air to constantly repair your liquidation bar.',
    baseBonusDesc: 'Regenerates 5% Margin HP every 10s',
    statScaleDesc: '+0.5% Margin HP healed per Pet Level',
    maxLevel: 20,
  },
]

export const PET_MAP: Record<PetId, PetConfig> = Object.fromEntries(
  PETS.map((p) => [p.id, p]),
) as Record<PetId, PetConfig>

export function petLevelUpCost(currentLevel: number): { hashrate: number; treats: number } {
  return {
    hashrate: Math.round(150 * Math.pow(1.22, currentLevel - 1)),
    treats: Math.max(1, Math.floor(currentLevel / 3) + 1),
  }
}
