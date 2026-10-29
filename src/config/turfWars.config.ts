export interface TurfDistrictConfig {
  id: string
  name: string
  subtitle: string
  city: string
  flagEmoji: string
  color: string
  accentGradient: string
  controllingSyndicate: string
  weeklyPassive: string
  weeklyPassiveDesc: string
  totalInfluenceRequired: number
}

export const TURF_DISTRICTS: TurfDistrictConfig[] = [
  {
    id: 'wall_street',
    name: 'Wall Street',
    subtitle: 'Institutional Liquidity Haven',
    city: 'New York, USA',
    flagEmoji: '🇺🇸',
    color: '#3b82f6',
    accentGradient: 'from-[#60a5fa] via-[#3b82f6] to-[#1d4ed8]',
    controllingSyndicate: 'Satoshi Whale Syndicate',
    weeklyPassive: '+15% Global Portfolio Capacity',
    weeklyPassiveDesc: 'All syndicate members gain +15% starting base capacity on all wallet slots.',
    totalInfluenceRequired: 50000,
  },
  {
    id: 'city_of_london',
    name: 'City of London',
    subtitle: 'High-Frequency Forex Clearing',
    city: 'London, UK',
    flagEmoji: '🇬🇧',
    color: '#a855f7',
    accentGradient: 'from-[#c084fc] via-[#a855f7] to-[#7e22ce]',
    controllingSyndicate: 'Zero-Knowledge Quant Desk',
    weeklyPassive: '-20% Rebalance Gas Fees',
    weeklyPassiveDesc: 'Sub-millisecond routing slashes all in-run cash rebalance transaction costs.',
    totalInfluenceRequired: 42000,
  },
  {
    id: 'shibuya',
    name: 'Shibuya Crossing',
    subtitle: 'Viral Meme-Coin Capital',
    city: 'Tokyo, Japan',
    flagEmoji: '🇯🇵',
    color: '#ec4899',
    accentGradient: 'from-[#f472b6] via-[#ec4899] to-[#be185d]',
    controllingSyndicate: 'Degen Ape Liquidity Cartel',
    weeklyPassive: '+10% Meme Coin Crit Rate',
    weeklyPassiveDesc: 'Meme and Doge coins trigger critical mega-pumps 10% more frequently.',
    totalInfluenceRequired: 38000,
  },
  {
    id: 'crypto_valley',
    name: 'Crypto Valley',
    subtitle: 'Alpine Cold-Vault Citadel',
    city: 'Zug, Switzerland',
    flagEmoji: '🇨🇭',
    color: '#10b981',
    accentGradient: 'from-[#34d399] via-[#10b981] to-[#047857]',
    controllingSyndicate: 'Contested (Unclaimed)',
    weeklyPassive: '+50 Margin Shield Barrier',
    weeklyPassiveDesc: 'Impenetrable vault firewalls grant +50 regenerating shield at every stage node.',
    totalInfluenceRequired: 45000,
  },
  {
    id: 'marina_bay',
    name: 'Marina Bay Sands',
    subtitle: 'Whale Offshore Casino Protocol',
    city: 'Singapore',
    flagEmoji: '🇸🇬',
    color: '#f59e0b',
    accentGradient: 'from-[#fbbf24] via-[#f59e0b] to-[#b45309]',
    controllingSyndicate: 'Contested (Unclaimed)',
    weeklyPassive: '+25% Raid & Boss Hashrate Bounty',
    weeklyPassiveDesc: 'Direct sovereign dividend grants +25% bonus Hashrate on all boss defeats.',
    totalInfluenceRequired: 48000,
  },
]

export const TURF_DISTRICT_MAP: Record<string, TurfDistrictConfig> = Object.fromEntries(
  TURF_DISTRICTS.map((d) => [d.id, d]),
)
