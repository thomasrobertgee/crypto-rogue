export interface AlgoOverclockSocket {
  statId: string
  label: string
  valueText: string
  tier: 'green' | 'gold' | 'prismatic'
}

export interface OverclockStatRoll {
  statId: string
  label: string
  minVal: number
  maxVal: number
  unit: string
  tier: 'green' | 'gold' | 'prismatic'
}

export const POSSIBLE_OVERCLOCK_SOCKETS: OverclockStatRoll[] = [
  // Green Tier (Common / Minor)
  { statId: 'start_cap_5', label: '+5% Starting Capacity', minVal: 4, maxVal: 6, unit: '%', tier: 'green' },
  { statId: 'green_mag_6', label: '+6% Green Magnitude', minVal: 5, maxVal: 7, unit: '%', tier: 'green' },
  { statId: 'hp_shield_20', label: '+20 Node Start Shield', minVal: 15, maxVal: 25, unit: ' HP', tier: 'green' },
  { statId: 'cash_drop_10', label: '+10% Combat Cash Reward', minVal: 8, maxVal: 12, unit: '%', tier: 'green' },

  // Gold Tier (Rare / Strong)
  { statId: 'enemy_cast_slow_8', label: '-8% Enemy Cast Speed', minVal: 6, maxVal: 10, unit: '%', tier: 'gold' },
  { statId: 'counter_crit_15', label: '+15% Counter-Pump Crit DMG', minVal: 12, maxVal: 18, unit: '%', tier: 'gold' },
  { statId: 'up_chance_4', label: '+4% Flat Up-Candle Odds', minVal: 3, maxVal: 5, unit: '%', tier: 'gold' },
  { statId: 'tick_speed_8', label: '+8% Coin Tick Speed', minVal: 6, maxVal: 9, unit: '%', tier: 'gold' },

  // Prismatic Tier (Mythic / Ultra)
  { statId: 'overclock_burst_25', label: '+25% Overdrive Damage Surge', minVal: 20, maxVal: 30, unit: '%', tier: 'prismatic' },
  { statId: 'boss_stun_duration', label: '+1.5s Hero Skill Stun Window', minVal: 1.2, maxVal: 2.0, unit: 's', tier: 'prismatic' },
  { statId: 'margin_regen_5', label: 'Heal 5% Max HP on Boss Defeat', minVal: 4, maxVal: 6, unit: '%', tier: 'prismatic' },
]

export function rollSiliconOverclockSockets(): AlgoOverclockSocket[] {
  const chosen: AlgoOverclockSocket[] = []
  const pool = [...POSSIBLE_OVERCLOCK_SOCKETS]

  for (let i = 0; i < 3; i++) {
    // Weight roll: 55% green, 35% gold, 10% prismatic
    const rand = Math.random()
    const targetTier: 'green' | 'gold' | 'prismatic' = rand < 0.55 ? 'green' : rand < 0.90 ? 'gold' : 'prismatic'
    const tierPool = pool.filter((s) => s.tier === targetTier)
    const pick = tierPool.length > 0
      ? tierPool[Math.floor(Math.random() * tierPool.length)]
      : pool[Math.floor(Math.random() * pool.length)]

    const val = Math.round((pick.minVal + Math.random() * (pick.maxVal - pick.minVal)) * 10) / 10
    chosen.push({
      statId: pick.statId,
      label: `${val > 0 ? '+' : ''}${val}${pick.unit} ${pick.label.replace(/^(\+|-)\d+(\%|\w+)?\s*/, '')}`,
      valueText: `${val > 0 ? '+' : ''}${val}${pick.unit}`,
      tier: pick.tier,
    })
  }
  return chosen
}

export const SILICON_DUST_SALVAGE_VALUE = 40
export const SILICON_OVERCLOCK_REROLL_COST = 60
