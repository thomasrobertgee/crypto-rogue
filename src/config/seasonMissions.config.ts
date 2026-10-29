export interface SeasonMissionReward {
  galaTickets?: number
  gems?: number
  fortunaShards?: number
  quantumKeys?: number
  hashrate?: number
  title?: string
  rewardLabel?: string
}

export interface SeasonMissionTier {
  tierNumber: number
  target: number
  targetLabel: string
  reward: SeasonMissionReward
}

export type SeasonMissionId =
  | 'energySpent'
  | 'gemsSpent'
  | 'enemiesDefeated'
  | 'bossesDefeated'
  | 'coinsForged'
  | 'heroesUpgraded'
  | 'seasonHeroUnlocked'
  | 'seasonHeroStar'
  | 'damageDealt'
  | 'patrolClaimed'
  | 'adsWatched'

export type MissionNavTarget =
  | 'battle'
  | 'shop'
  | 'baseHq'
  | 'heroes'
  | 'rig'
  | 'galaWheel'

export interface SeasonMissionConfig {
  id: SeasonMissionId
  title: string
  subtitle: string
  icon: string
  accentColor: string
  bgGradient: string
  navTarget: MissionNavTarget
  navLabel: string
  unit: string
  tiers: SeasonMissionTier[]
}

export interface SeasonMissionMilestone {
  completedTiers: number
  reward: SeasonMissionReward
  rewardLabel: string
  icon: string
}

export const SEASON_MISSION_MILESTONES: SeasonMissionMilestone[] = [
  {
    completedTiers: 5,
    reward: { gems: 200, galaTickets: 1, rewardLabel: '+200 💎 & +1 🎟️' },
    rewardLabel: '+200 💎 & +1 🎟️',
    icon: '💎',
  },
  {
    completedTiers: 15,
    reward: { quantumKeys: 2, galaTickets: 2, rewardLabel: '+2 🗝️ & +2 🎟️' },
    rewardLabel: '+2 🗝️ & +2 🎟️',
    icon: '🗝️',
  },
  {
    completedTiers: 25,
    reward: { fortunaShards: 10, galaTickets: 3, rewardLabel: '+10 Fortuna Shards & +3 🎟️' },
    rewardLabel: '+10 Fortuna Shards',
    icon: '🦸',
  },
  {
    completedTiers: 35,
    reward: {
      fortunaShards: 15,
      galaTickets: 5,
      title: 'Gala Grandmaster',
      rewardLabel: '+15 Fortuna Shards, +5 🎟️ & Grandmaster Title',
    },
    rewardLabel: '+15 Shards & Title',
    icon: '👑',
  },
]

export const SEASON_MISSIONS: SeasonMissionConfig[] = [
  // 1. Energy Spent
  {
    id: 'energySpent',
    title: 'High-Roller Stamina',
    subtitle: 'Spend Energy to power through campaign and boss runs',
    icon: '⚡',
    accentColor: '#eab308',
    bgGradient: 'from-[#422006] to-[#1e0a02]',
    navTarget: 'battle',
    navLabel: 'GO BATTLE',
    unit: '⚡',
    tiers: [
      { tierNumber: 1, target: 50, targetLabel: '50 ⚡', reward: { galaTickets: 1 } },
      { tierNumber: 2, target: 150, targetLabel: '150 ⚡', reward: { galaTickets: 2 } },
      { tierNumber: 3, target: 300, targetLabel: '300 ⚡', reward: { galaTickets: 3 } },
      { tierNumber: 4, target: 600, targetLabel: '600 ⚡', reward: { galaTickets: 5 } },
      { tierNumber: 5, target: 1200, targetLabel: '1,200 ⚡', reward: { galaTickets: 8 } },
    ],
  },

  // 2. Gems Spent
  {
    id: 'gemsSpent',
    title: 'Gala Liquidity Provider',
    subtitle: 'Spend Satoshi Gems on gacha, tickets, energy or bundles',
    icon: '💎',
    accentColor: '#38bdf8',
    bgGradient: 'from-[#082f49] to-[#03131d]',
    navTarget: 'shop',
    navLabel: 'GO TO SHOP',
    unit: '💎',
    tiers: [
      { tierNumber: 1, target: 200, targetLabel: '200 💎', reward: { galaTickets: 1 } },
      { tierNumber: 2, target: 500, targetLabel: '500 💎', reward: { galaTickets: 2 } },
      { tierNumber: 3, target: 1500, targetLabel: '1,500 💎', reward: { galaTickets: 4 } },
      { tierNumber: 4, target: 4000, targetLabel: '4,000 💎', reward: { galaTickets: 6 } },
      { tierNumber: 5, target: 10000, targetLabel: '10,000 💎', reward: { galaTickets: 10 } },
    ],
  },

  // 3. Enemies Defeated
  {
    id: 'enemiesDefeated',
    title: 'Market Cleanse',
    subtitle: 'Liquidate enemy trading bots, minions and paper hands',
    icon: '⚔️',
    accentColor: '#f43f5e',
    bgGradient: 'from-[#4c0519] to-[#20020a]',
    navTarget: 'battle',
    navLabel: 'GO BATTLE',
    unit: 'Enemies',
    tiers: [
      { tierNumber: 1, target: 50, targetLabel: '50 Enemies', reward: { galaTickets: 1 } },
      { tierNumber: 2, target: 150, targetLabel: '150 Enemies', reward: { galaTickets: 2 } },
      { tierNumber: 3, target: 400, targetLabel: '400 Enemies', reward: { galaTickets: 3 } },
      { tierNumber: 4, target: 1000, targetLabel: '1,000 Enemies', reward: { galaTickets: 6 } },
    ],
  },

  // 4. Bosses Defeated
  {
    id: 'bossesDefeated',
    title: 'Apex Whale Slayer',
    subtitle: 'Defeat Floor Mid-Bosses, Elite Bosses, and Stage Final Bosses',
    icon: '👑',
    accentColor: '#ec4899',
    bgGradient: 'from-[#500724] to-[#23020e]',
    navTarget: 'battle',
    navLabel: 'HUNT BOSSES',
    unit: 'Bosses',
    tiers: [
      { tierNumber: 1, target: 5, targetLabel: '5 Bosses', reward: { galaTickets: 2 } },
      { tierNumber: 2, target: 15, targetLabel: '15 Bosses', reward: { galaTickets: 4 } },
      {
        tierNumber: 3,
        target: 30,
        targetLabel: '30 Bosses',
        reward: { galaTickets: 8, fortunaShards: 5, rewardLabel: '+8 🎟️ & +5 Fortuna Shards' },
      },
    ],
  },

  // 5. Coins Forged (3-to-1 Merges)
  {
    id: 'coinsForged',
    title: 'Master Alchemist',
    subtitle: 'Perform 3-to-1 Coin Fusions in Base HQ Foundry',
    icon: '🪙',
    accentColor: '#f59e0b',
    bgGradient: 'from-[#451a03] to-[#1c0800]',
    navTarget: 'baseHq',
    navLabel: 'GO FORGE',
    unit: 'Merges',
    tiers: [
      { tierNumber: 1, target: 3, targetLabel: '3 Merges', reward: { galaTickets: 1 } },
      { tierNumber: 2, target: 8, targetLabel: '8 Merges', reward: { galaTickets: 2 } },
      { tierNumber: 3, target: 20, targetLabel: '20 Merges', reward: { galaTickets: 4 } },
      { tierNumber: 4, target: 50, targetLabel: '50 Merges', reward: { galaTickets: 8 } },
    ],
  },

  // 6. Heroes Upgraded
  {
    id: 'heroesUpgraded',
    title: 'Executive Syndicate',
    subtitle: 'Level up Hero ranks with Hashrate in Base HQ',
    icon: '🦸',
    accentColor: '#a855f7',
    bgGradient: 'from-[#3b0764] to-[#18022b]',
    navTarget: 'heroes',
    navLabel: 'HERO SQUAD',
    unit: 'Level-Ups',
    tiers: [
      { tierNumber: 1, target: 5, targetLabel: '5 Hero Levels', reward: { galaTickets: 1 } },
      { tierNumber: 2, target: 15, targetLabel: '15 Hero Levels', reward: { galaTickets: 3 } },
      { tierNumber: 3, target: 30, targetLabel: '30 Hero Levels', reward: { galaTickets: 6 } },
    ],
  },

  // 7. Season Hero Unlocked
  {
    id: 'seasonHeroUnlocked',
    title: 'The Empress Arrives',
    subtitle: 'Unlock Lady Fortuna via Gala Wheel, Milestones, or Store',
    icon: '🌟',
    accentColor: '#f43f5e',
    bgGradient: 'from-[#4c0519] to-[#20020a]',
    navTarget: 'galaWheel',
    navLabel: 'GALA WHEEL',
    unit: 'Unlocked',
    tiers: [
      {
        tierNumber: 1,
        target: 1,
        targetLabel: 'Unlock Lady Fortuna',
        reward: {
          galaTickets: 10,
          title: 'Gala Investor',
          rewardLabel: '+10 🎟️ & "Gala Investor" Title',
        },
      },
    ],
  },

  // 8. Season Hero Star Ascension
  {
    id: 'seasonHeroStar',
    title: 'Fortuna Ascendant',
    subtitle: 'Ascend Lady Fortuna to 2-Star and 3-Star using duplicate fragments',
    icon: '⭐',
    accentColor: '#fbbf24',
    bgGradient: 'from-[#451a03] to-[#1c0800]',
    navTarget: 'heroes',
    navLabel: 'ASCEND',
    unit: 'Stars',
    tiers: [
      {
        tierNumber: 1,
        target: 2,
        targetLabel: 'Lady Fortuna 2★',
        reward: { galaTickets: 5, rewardLabel: '+5 🎟️ Gala Tickets' },
      },
      {
        tierNumber: 2,
        target: 3,
        targetLabel: 'Lady Fortuna 3★',
        reward: { galaTickets: 10, rewardLabel: '+10 🎟️ Gala Tickets' },
      },
    ],
  },

  // 9. Green Damage Dealt
  {
    id: 'damageDealt',
    title: 'Bull Run Shockwave',
    subtitle: 'Inflict cumulative Green Candle Damage against combat foes',
    icon: '💥',
    accentColor: '#22c55e',
    bgGradient: 'from-[#052e16] to-[#011408]',
    navTarget: 'battle',
    navLabel: 'GO PUMP',
    unit: '$ DMG',
    tiers: [
      { tierNumber: 1, target: 50000, targetLabel: '$50,000 DMG', reward: { galaTickets: 1 } },
      { tierNumber: 2, target: 250000, targetLabel: '$250,000 DMG', reward: { galaTickets: 2 } },
      { tierNumber: 3, target: 1000000, targetLabel: '$1,000,000 DMG', reward: { galaTickets: 4 } },
      { tierNumber: 4, target: 5000000, targetLabel: '$5,000,000 DMG', reward: { galaTickets: 8 } },
    ],
  },

  // 10. Patrol Claimed (Idle Rig)
  {
    id: 'patrolClaimed',
    title: 'Autonomous Hashrate',
    subtitle: 'Collect idle Hashrate payouts from the Camp Mining Rig',
    icon: '⛏️',
    accentColor: '#14b8a6',
    bgGradient: 'from-[#042f2e] to-[#011413]',
    navTarget: 'rig',
    navLabel: 'CLAIM RIG',
    unit: 'Claims',
    tiers: [
      { tierNumber: 1, target: 5, targetLabel: '5 Rig Claims', reward: { galaTickets: 1 } },
      { tierNumber: 2, target: 15, targetLabel: '15 Rig Claims', reward: { galaTickets: 2 } },
      { tierNumber: 3, target: 30, targetLabel: '30 Rig Claims', reward: { galaTickets: 3 } },
      { tierNumber: 4, target: 60, targetLabel: '60 Rig Claims', reward: { galaTickets: 6 } },
    ],
  },

  // 11. Rewarded Ads Watched / VIP Auto-Skips
  {
    id: 'adsWatched',
    title: 'Sponsorship Network',
    subtitle: 'Support the network by watching Rewarded Ads or VIP instant skips',
    icon: '📺',
    accentColor: '#8b5cf6',
    bgGradient: 'from-[#2e1065] to-[#12032e]',
    navTarget: 'shop',
    navLabel: 'WATCH ADS',
    unit: 'Ads',
    tiers: [
      { tierNumber: 1, target: 5, targetLabel: '5 Ads / VIP Skips', reward: { galaTickets: 1 } },
      { tierNumber: 2, target: 15, targetLabel: '15 Ads / VIP Skips', reward: { galaTickets: 2 } },
      { tierNumber: 3, target: 30, targetLabel: '30 Ads / VIP Skips', reward: { galaTickets: 4 } },
    ],
  },
]

export const SEASON_MISSION_MAP: Record<SeasonMissionId, SeasonMissionConfig> = Object.fromEntries(
  SEASON_MISSIONS.map((m) => [m.id, m]),
) as Record<SeasonMissionId, SeasonMissionConfig>

/** Total possible tiers across all seasonal missions */
export const TOTAL_SEASON_MISSION_TIERS = SEASON_MISSIONS.reduce(
  (sum, m) => sum + m.tiers.length,
  0,
)
