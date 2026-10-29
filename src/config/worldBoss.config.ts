export interface WorldBossAffix {
  id: string
  name: string
  description: string
}

export interface WorldBossConfig {
  id: string
  name: string
  title: string
  serverTotalHp: number
  timerSeconds: number // 60s battle gauntlet
  emoji: string
  portrait: string
  affixes: WorldBossAffix[]
  description: string
}

export const CENTRAL_BANK_LEVIATHAN: WorldBossConfig = {
  id: 'central_bank_leviathan',
  name: 'Central Bank Leviathan',
  title: 'Apex Sovereign Liquidity Predator',
  serverTotalHp: 100_000_000_000, // $100 Billion Shared Server HP
  timerSeconds: 60,
  emoji: '🏦',
  portrait: 'boss_whale_leviathan',
  affixes: [
    {
      id: 'quantitative_tightening',
      name: 'Quantitative Tightening',
      description: 'Drains -2% player capacity every 5 seconds.',
    },
    {
      id: 'interest_rate_hike',
      name: 'Interest Rate Spike',
      description: 'Increases red candle down rolls by +25%.',
    },
  ],
  description: 'A monolithic financial construct hoarding global fiat liquidity. Assemble the entire server to deplete its reserves in 60-second burst gauntlets!',
}

export interface WorldBossPercentileTier {
  percentile: string
  title: string
  minRankPct: number
  quantumKeys: number
  skinFragments: number
  gems: number
}

export const WORLD_BOSS_REWARDS: WorldBossPercentileTier[] = [
  { percentile: 'Top 1%', title: 'Leviathan Slayer', minRankPct: 1, quantumKeys: 5, skinFragments: 25, gems: 1500 },
  { percentile: 'Top 10%', title: 'Central Bank Dissolver', minRankPct: 10, quantumKeys: 3, skinFragments: 15, gems: 800 },
  { percentile: 'Top 50%', title: 'Sovereign Contributor', minRankPct: 50, quantumKeys: 1, skinFragments: 8, gems: 400 },
  { percentile: 'Participant', title: 'Raid Participant', minRankPct: 100, quantumKeys: 0, skinFragments: 3, gems: 150 },
]
