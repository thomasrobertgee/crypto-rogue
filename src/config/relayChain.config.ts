/**
 * 5-Step "Trojan Horse" Chain Relay Offer ("FLASH LIQUIDITY CHAIN")
 * Sequential unlock path where claiming Step N unlocks Step N+1.
 */

export interface RelayStepConfig {
  step: number
  title: string
  subtitle: string
  tag: string
  priceLabel: string
  costType: 'free' | 'ad' | 'iap_099' | 'iap_499'
  priceUsd?: number
  icon: string
  rewards: {
    gems?: number
    silverKeys?: number
    quantumKeys?: number
    heroFragments?: number
    epicCoin?: boolean
  }
  rewardSummary: string
  badgeColor: string
}

export const RELAY_CHAIN_STEPS: RelayStepConfig[] = [
  {
    step: 1,
    title: 'FREE LIQUIDITY DROP',
    subtitle: 'Free Starter Grant',
    tag: 'FREE!',
    priceLabel: 'FREE CLAIM',
    costType: 'free',
    icon: '💎',
    rewards: { gems: 50 },
    rewardSummary: '+50 Satoshi Gems',
    badgeColor: '#10b981',
  },
  {
    step: 2,
    title: 'COMMUNITY VAULT SPONSOR',
    subtitle: 'Watch Ad / VIP Instant',
    tag: 'FREE BONUS',
    priceLabel: 'WATCH AD / VIP',
    costType: 'ad',
    icon: '🗝️',
    rewards: { silverKeys: 1 },
    rewardSummary: '+1 Silver Vault Key',
    badgeColor: '#3b82f6',
  },
  {
    step: 3,
    title: 'DEGEN BRIDGE PACK',
    subtitle: 'Special Micro-Bridge',
    tag: '10x VALUE!',
    priceLabel: '$0.99',
    priceUsd: 0.99,
    costType: 'iap_099',
    icon: '🔮',
    rewards: { gems: 500, quantumKeys: 3 },
    rewardSummary: '+500 Gems + 3 Quantum Keys',
    badgeColor: '#f59e0b',
  },
  {
    step: 4,
    title: 'WHALE AIRDROP SURPRISE',
    subtitle: 'Free With Step 3 Purchase',
    tag: 'FREE BONUS!',
    priceLabel: 'FREE BONUS',
    costType: 'free',
    icon: '🪙',
    rewards: { epicCoin: true },
    rewardSummary: '1x Guaranteed Epic Coin Card',
    badgeColor: '#8b5cf6',
  },
  {
    step: 5,
    title: 'GRAND FINALE TREASURY',
    subtitle: 'Legendary Syndicate Stash',
    tag: 'FINALE (-80%)',
    priceLabel: '$4.99',
    priceUsd: 4.99,
    costType: 'iap_499',
    icon: '👑',
    rewards: { heroFragments: 25, gems: 1500 },
    rewardSummary: '+25 Hero Frags + 1,500 Gems',
    badgeColor: '#ec4899',
  },
]
