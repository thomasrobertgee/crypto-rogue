export interface EvolutionConfig {
  id: string
  name: string
  ticker: string
  baseCoinId: string
  requiredSkillIds: string[]
  requiredSkillLabel: string
  requiredRelicId: string
  requiredRelicName: string
  icon: string
  color: string
  description: string
}

export const EVOLUTIONS: EvolutionConfig[] = [
  {
    id: 'dogezilla',
    name: 'DogeZilla',
    ticker: 'DZLA',
    baseCoinId: 'shibamoon',
    requiredSkillIds: ['compound_interest', 'over_leverage_surge', 'moonbag_catalyst'],
    requiredSkillLabel: '3★ Compounding or Crit Skill',
    requiredRelicId: 'hype_train_bot',
    requiredRelicName: 'Hype Train Bot',
    icon: 'Flame',
    color: '#f59e0b',
    description: 'Golden Hard-Fork: 2x Tick Speed & Screen-Clearing Mega-Candles every 5th tick!',
  },
  {
    id: 'satoshi_supernova',
    name: 'Satoshi Supernova',
    ticker: 'NOVA',
    baseCoinId: 'bitcrumb',
    requiredSkillIds: ['series_a_injection', 'anchor_whale_fund', 'satoshi_consensus_halo'],
    requiredSkillLabel: '3★ Base Floor Skill',
    requiredRelicId: 'overclocked_asic',
    requiredRelicName: 'Overclocked ASIC',
    icon: 'Sun',
    color: '#fbbf24',
    description: 'Golden Hard-Fork: 2x Tick Speed & Screen-Clearing Mega-Candles every 5th tick!',
  },
  {
    id: 'infinite_yield_engine',
    name: 'Infinite Yield Engine',
    ticker: 'IYLD',
    baseCoinId: 'aetherstake',
    requiredSkillIds: ['cold_storage_barrier', 'sec_injunction_ward', 'stop_loss_algos'],
    requiredSkillLabel: '3★ Margin Shield Skill',
    requiredRelicId: 'diamond_hands_script',
    requiredRelicName: 'Diamond Hands Script',
    icon: 'Zap',
    color: '#38bdf8',
    description: 'Golden Hard-Fork: 2x Tick Speed & Screen-Clearing Mega-Candles every 5th tick!',
  },
  {
    id: 'phantom_short_reaper',
    name: 'Phantom Short Reaper',
    ticker: 'REAP',
    baseCoinId: 'moneroghost',
    requiredSkillIds: ['dip_accumulator', 'short_squeeze_reversal'],
    requiredSkillLabel: '3★ Dip Accumulator Skill',
    requiredRelicId: 'dark_pool_short',
    requiredRelicName: 'Dark Pool Short',
    icon: 'Skull',
    color: '#c084fc',
    description: 'Golden Hard-Fork: 2x Tick Speed & Screen-Clearing Mega-Candles every 5th tick!',
  },
]

export const EVOLUTION_MAP: Record<string, EvolutionConfig> = Object.fromEntries(
  EVOLUTIONS.map((e) => [e.id, e]),
)

/**
 * Checks if any secret Golden Hard-Fork Evolution is eligible to be drafted.
 */
export function getEligibleEvolutions(params: {
  equippedCoinIds: Array<string | null>
  ownedCoins?: Array<{ id: string; coinId: string }>
  activeRunSkills: Record<string, number>
  runRelics: string[]
  evolvedCoins: Record<string, string>
}): EvolutionConfig[] {
  const { equippedCoinIds, ownedCoins = [], activeRunSkills, runRelics, evolvedCoins } = params

  // Resolve equipped base coinIds: either matching c.id -> c.coinId, or direct coinId match
  const equippedBaseCoinIds = new Set<string>()
  for (const id of equippedCoinIds) {
    if (!id) continue
    equippedBaseCoinIds.add(id)
    const matching = ownedCoins.find((c) => c.id === id)
    if (matching) equippedBaseCoinIds.add(matching.coinId)
  }

  return EVOLUTIONS.filter((evo) => {
    // 1. Not already evolved
    if (evolvedCoins[evo.baseCoinId] || evolvedCoins[evo.id]) return false
    // 2. Base Coin equipped in active loadout
    if (!equippedBaseCoinIds.has(evo.baseCoinId)) return false
    // 3. Required Relic acquired
    if (!runRelics.includes(evo.requiredRelicId)) return false
    // 4. At least one qualifying skill drafted to 3+ Stars (★★★ or Red Stars)
    const hasSkill = evo.requiredSkillIds.some((skId) => (activeRunSkills[skId] ?? 0) >= 3)
    return hasSkill
  })
}
